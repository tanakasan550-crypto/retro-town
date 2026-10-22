  // src/transit_trip.js — 乗換案内(徒歩・路線バス・鉄道/地下鉄をひとつの交通網として探す)と路線図の画面。
  // 案内した経路はそのまま実行できる: 歩いて停留所へ → 実際のバスを待って乗る → 降りて駅へ → 電車 → 歩いて目的地。
  function tripNodes(g) {
    const map2 = g.world.map, net = busNet(map2), out = [];
    if (net) for (const s of net.stops) out.push({ key: "S" + s.id, kind: "bus", x: s.x, y: s.y, name: s.name, stop: s });
    for (const s of map2.stations) {
      const b = map2.buildings.find((q) => q.stationId === s.id && (q.type === "station" || q.type === "metro"));
      if (!b || !g.tr.lines.some((L2) => L2.stops.some((q) => q.id === s.id))) continue;
      out.push({ key: "R" + s.id, kind: "rail", x: b.doorX, y: b.doorY, name: s.name + "駅", st: s, b: b.idx });
    }
    return out;
  }
  var tripWalkMin = (g, a, b) => (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) * 1.15 / heroSpeed(g);
  function busHeadway(r) {
    return (r.len / Math.max(2.5, r.avgV) + r.cyc.length * 0.8) / Math.max(1, r.buses.length || 1);
  }
  function transitPlan(g, from, to, mask = { bus: true, rail: true }) {
    const nodes = tripNodes(g), D = { key: "D", x: to.x, y: to.y, name: to.name };
    const best = /* @__PURE__ */ new Map(), done = /* @__PURE__ */ new Set();
    const relax = (n2, c, prev, leg) => {
      const o = best.get(n2.key);
      if (!o || c < o.c - 1e-6) best.set(n2.key, { n: n2, c, prev, leg });
    };
    relax(D, tripWalkMin(g, from, D), null, { m: "walk", to: D });
    for (const n2 of nodes) {
      if (Math.abs(n2.x - from.x) + Math.abs(n2.y - from.y) > 260) continue;
      if (n2.kind === "bus" && !mask.bus || n2.kind === "rail" && !mask.rail) continue;
      relax(n2, tripWalkMin(g, from, n2), null, { m: "walk", to: n2 });
    }
    const byKey = new Map(nodes.map((n2) => [n2.key, n2]));
    for (let guard = 0; guard < 400; guard++) {
      let cur2 = null;
      for (const [k, v] of best) if (!done.has(k) && (!cur2 || v.c < cur2.c)) cur2 = v;
      if (!cur2) break;
      done.add(cur2.n.key);
      if (cur2.n.key === "D") break;
      const N = cur2.n, c0 = cur2.c, viaWalk = cur2.leg && cur2.leg.m === "walk";
      // 目的地へ歩く
      if (Math.abs(N.x - D.x) + Math.abs(N.y - D.y) < 260) relax(D, c0 + tripWalkMin(g, N, D), cur2, { m: "walk", from: N, to: D });
      // 乗換の徒歩(歩いた直後にさらに歩く経路は作らない)
      if (!viaWalk) for (const n2 of nodes) {
        if (n2 === N || Math.abs(n2.x - N.x) + Math.abs(n2.y - N.y) > 70) continue;
        if (n2.kind === "bus" && !mask.bus || n2.kind === "rail" && !mask.rail) continue;
        relax(n2, c0 + tripWalkMin(g, N, n2) + 1, cur2, { m: "walk", from: N, to: n2 });
      }
      // バスに乗る
      if (N.kind === "bus" && mask.bus) for (const r of N.stop.routes) {
        if (cur2.leg && cur2.leg.m === "bus" && cur2.leg.r === r) continue;
        const wait = busHeadway(r) / 2 + 1;
        r.cyc.forEach((q, j0) => {
          if (q !== N.stop) return;
          let dist2 = 0;
          for (let k = 1; k < r.cyc.length; k++) {
            const j = (j0 + k) % r.cyc.length, jp = (j0 + k - 1) % r.cyc.length;
            dist2 += ((r.cycAt[j] - r.cycAt[jp]) % r.len + r.len) % r.len || r.len;
            const t = r.cyc[j];
            if (t === N.stop) break;
            const n2 = byKey.get("S" + t.id);
            const ride = (dist2 / Math.max(2.5, r.avgV) + k * 0.8) * BUS_RIDE_CLOCK;
            if (n2) relax(n2, c0 + wait + ride, cur2, { m: "bus", r, from: N, to: n2, ride, wait });
          }
        });
      }
      // 電車に乗る
      if (N.kind === "rail" && mask.rail) for (const L2 of g.tr.lines) {
        if (cur2.leg && cur2.leg.m === "rail" && cur2.leg.L === L2) continue;
        const i = L2.stops.findIndex((q) => q.id === N.st.id);
        if (i < 0) continue;
        L2.stops.forEach((q, j) => {
          if (j === i || q.id === N.st.id) return;
          const n2 = byKey.get("R" + q.id);
          if (!n2) return;
          const ride = Math.abs(L2.arr[j] - L2.arr[i]);
          relax(n2, c0 + L2.headway / 2 + 3 + ride, cur2, { m: "rail", L: L2, from: N, to: n2, ride, wait: L2.headway / 2 + 3 });
        });
      }
    }
    const fin = best.get("D");
    if (!fin) return null;
    const legs = [];
    for (let v = fin; v; v = v.prev) legs.push({ ...v.leg, from: v.leg.from || (v.prev ? v.prev.n : { x: from.x, y: from.y, name: "現在地" }), mins: v.c - (v.prev ? v.prev.c : 0) });
    legs.reverse();
    let fare = 0;
    for (const l of legs) {
      if (l.m === "bus") fare += busFare(g);
      if (l.m === "rail") {
        try {
          const t = planTrip(g, l.from.st.id, l.to.st.id);
          l.fare = t && t.fare || 0;
        } catch (_) {
          l.fare = 0;
        }
        fare += l.fare;
      }
    }
    return { legs, mins: fin.c, fare };
  }
  function tripOptions(g, from, to) {
    const out = [], seen = /* @__PURE__ */ new Set();
    for (const [nm, mask] of [["おすすめ", { bus: true, rail: true }], ["バス中心", { bus: true, rail: false }], ["電車中心", { bus: false, rail: true }], ["徒歩のみ", { bus: false, rail: false }]]) {
      const p = transitPlan(g, from, to, mask);
      if (!p) continue;
      const sig = p.legs.map((l) => l.m + (l.r ? l.r.id : l.L ? l.L.id : "") + (l.to.key || "")).join("|");
      if (seen.has(sig)) continue;
      seen.add(sig);
      const hasB = p.legs.some((l) => l.m === "bus"), hasR = p.legs.some((l) => l.m === "rail");
      out.push({ nm: hasB && hasR ? "バス＋電車" : hasB ? "バス" : hasR ? "電車" : "徒歩のみ", ...p });
    }
    return out.sort((a, b) => a.mins - b.mins);
  }
  function tripLegHtml(l) {
    const m = Math.max(1, Math.round(l.mins));
    if (l.m === "walk") return `<div class="tl"><span class="ti">🚶</span>${esc4(l.to.name || "目的地")}まで歩く <b>${m}分</b></div>`;
    if (l.m === "bus") return `<div class="tl"><span class="ti" style="background:${l.r.color}">${esc4(l.r.no)}</span>${esc4(l.r.name)} ${esc4(l.from.name)} → ${esc4(l.to.name)} <b>${m}分</b><span class="small">(待ち約${Math.round(l.wait)}分を含む・¥${busFare(G3)})</span></div>`;
    return `<div class="tl"><span class="ti" style="background:${l.L.color}">🚃</span>${esc4(l.L.name)} ${esc4(l.from.name)} → ${esc4(l.to.name)} <b>${m}分</b><span class="small">(待ち約${Math.round(l.wait)}分を含む${l.fare ? "・¥" + l.fare : ""})</span></div>`;
  }
  var TRIP_CSS = `.tl{display:flex;align-items:center;gap:6px;margin:3px 0;font-size:13px}.ti{display:inline-block;min-width:26px;text-align:center;border-radius:6px;color:#fff;background:#456;padding:1px 4px;font-size:12px}.tcard{border:1px solid #4a6a9a;border-radius:10px;padding:6px 8px;margin:6px 0;background:#0d1a3366}`;
  function tripFrom(g) {
    const L2 = g.S.loc;
    if (L2.k === "in") {
      const b = g.bld(L2.b);
      return { x: b.doorX, y: b.doorY, name: b.name };
    }
    return { x: L2.x, y: L2.y, name: "現在地" };
  }
  // 乗換案内の画面(行き先: 建物 {b} または地点 {x,y,name})
  function tripModal(dest) {
    const g = G3;
    const to = dest.b != null ? { x: g.bld(dest.b).doorX, y: g.bld(dest.b).doorY, name: g.bld(dest.b).name, b: dest.b } : dest;
    const opts = tripOptions(g, tripFrom(g), to);
    const now = g.S.min;
    showModal(`<style>${TRIP_CSS}</style><h2>🧭 乗換案内</h2><div class="tx small">${esc4(tripFrom(g).name)} → <b>${esc4(to.name)}</b>(徒歩・バス・電車/地下鉄)</div>${opts.length ? opts.map((o, i) => `<div class="tcard"><div><b>${esc4(o.nm)}</b> 約${Math.round(o.mins)}分(${hhmm(now + o.mins)}ごろ着)${o.fare ? "・¥" + o.fare.toLocaleString() : "・運賃なし"}</div>${o.legs.map(tripLegHtml).join("")}<button class="btn item" data-go="${i}">この経路で行く</button></div>`).join("") : '<div class="tx">経路が見つかりません</div>'}<div class="row">${btn("路線図", "sec map")}${btn("閉じる", "sec close")}</div>`, (c) => {
      c.querySelectorAll("[data-go]").forEach((bb) => bb.onclick = () => {
        const o = opts[+bb.dataset.go];
        closeModal();
        tripStart(g, o, to);
      });
      c.querySelector(".map").onclick = () => busMapModal();
      c.querySelector(".close").onclick = () => closeModal();
    });
  }
  // ---- 経路の実行
  function tripStart(g, o, to) {
    const legs = o.legs.map((l) => ({ m: l.m, name: l.to.name, x: l.to.x, y: l.to.y, b: l.to.key === "D" ? to.b : l.to.b, route: l.r ? l.r.id : null, from: l.from && l.from.stop ? l.from.stop.id : l.from && l.from.st ? l.from.st.id : null, fromB: l.from && l.from.b, to: l.to.stop ? l.to.stop.id : l.to.st ? l.to.st.id : null, last: l.to.key === "D" }));
    // 電車の直前の徒歩は電車の案内(駅へ歩いて入る)に含める
    for (let i = 0; i < legs.length - 1; i++) if (legs[i].m === "walk" && legs[i + 1].m === "rail") legs[i].skip = true;
    g.S.ctrip = { legs, i: 0, name: to.name, t0: g.absMin() };
    toast(`乗換案内を開始: ${to.name}まで約${Math.round(o.mins)}分`, 2600);
    tripTick(g);
  }
  function tripStop(g, msg) {
    delete g.S.ctrip;
    if (msg) toast(msg, 2600);
    busHudUpdate(true);
  }
  function tripNext(g) {
    const T4 = g.S.ctrip;
    T4.i++;
    if (T4.i >= T4.legs.length) {
      const mins = Math.round(g.absMin() - T4.t0);
      g.log("trip", `乗換案内で${T4.name}へ(${mins}分)`);
      tripStop(g, `${T4.name}に着きました(${mins}分)`);
    }
    busHudUpdate(true);
  }
  function tripAfterBus(g, s) {
    const T4 = g.S.ctrip;
    if (!T4) return;
    const l = T4.legs[T4.i];
    if (l && l.m === "bus") {
      if (s.id !== l.to) toast("予定と違う停留所で降りました。乗換案内を続けます", 2400);
      tripNext(g);
    }
  }
  function tripTick(g) {
    const T4 = g.S.ctrip;
    if (!T4 || U.modal || g.S.onBus) return;
    const l = T4.legs[T4.i], L2 = g.S.loc;
    if (!l) return tripStop(g);
    if (l.skip) return tripNext(g);
    if (l.m === "walk") {
      if (l.last && l.b != null) {
        if (L2.k === "in" && L2.b === l.b) return tripNext(g);
      } else if (L2.k === "out" && Math.hypot(L2.x - (l.x + 0.5), L2.y - (l.y + 0.5)) < 2) return tripNext(g);
      if (!NAV) {
        if (l.started && !(typeof RD !== "undefined" && RD.on)) return tripStop(g, "乗換案内を中止しました");
        l.started = true;
        navTo(l.last && l.b != null ? { kind: "bld", b: l.b } : { kind: "pt", x: l.x + 0.5, y: l.y + 0.5, out: true }, { label: l.name, run: true });
      }
      return;
    }
    if (l.m === "bus") {
      const net = busNet(g.world.map), s = net.stops.find((q) => q.id === l.from);
      if (!s) return tripStop(g, "停留所が見つかりません");
      const d = L2.k === "out" ? Math.hypot(L2.x - (s.x + 0.5), L2.y - (s.y + 0.5)) : 99;
      if (d < 4) {
        if (NAV) navStop();
        if (!g.S.busWait) g.S.busWait = { stop: s.id, route: l.route, to: l.to };
        return;
      }
      if (!NAV) {
        if (l.walking) return tripStop(g, "乗換案内を中止しました");
        l.walking = true;
        navTo({ kind: "pt", x: s.x + 0.5, y: s.y + 0.5, out: true }, { label: s.name, run: true });
      }
      return;
    }
    if (l.m === "rail") {
      const riding = typeof RD !== "undefined" && RD.on;
      if (riding) l.riding = true;
      else if (l.riding) return tripNext(g);
      else if (!NAV && !l.started) {
        l.started = true;
        navTo({ kind: "bld", b: l.fromB, direct: true, rail: { from: l.from, to: l.to, finalB: null } }, { label: `${l.name}へ(電車)`, run: true });
      } else if (!NAV && l.started && !riding) {
        l.waitT = (l.waitT || 0) + 1;
        if (l.waitT > 20) tripStop(g, "電車に乗れなかったため乗換案内を中止しました");
      }
    }
  }
  function tripHudHtml(g) {
    const T4 = g.S.ctrip;
    if (!T4) return "";
    const l = T4.legs[T4.i];
    if (!l) return "";
    const what = l.m === "walk" ? `🚶 ${l.name}へ歩く` : l.m === "bus" ? `🚏 バス停で[${(busNet(g.world.map).routes.find((r) => r.id === l.route) || {}).no || ""}]に乗る` : `🚃 ${l.name}まで電車`;
    return `<div class="bh-t" style="border-color:#4fc3f7">🧭 ${esc4(T4.name)}まで(${T4.i + 1}/${T4.legs.length})</div><div class="bh-n">${esc4(what)}</div><div class="bh-b"><button data-a="tripstop">案内をやめる</button></div>`;
  }
  // ---- 路線図(スマホで見て、そのまま行き先を選べる)
  function busMapModal(sel) {
    const g = G3, map2 = g.world.map, net = busNet(map2);
    const nodes = tripNodes(g);
    const routes = net ? net.routes : [];
    showModal(`<style>${TRIP_CSS}#bmcv{width:100%;height:min(58vh,520px);background:#f3efe4;border-radius:10px;touch-action:none;display:block}</style><h2>🗺 路線図(バス・鉄道)</h2><div class="small">${routes.map((r) => `<span class="pill" style="border-color:${r.color};color:#fff;background:${r.color}">${esc4(r.no)} ${esc4(r.name)}</span>`).join("")} <span class="small">破線=地下鉄</span></div><canvas id="bmcv"></canvas><div class="row" style="margin:4px 0">${btn("＋", "sec zin")}${btn("－", "sec zout")}${btn("現在地", "sec here")}${btn("全体", "sec all")}</div><div id="bminfo" class="tx small">停留所・駅をタップすると、時刻表と行き方が出ます</div><div class="row">${btn("閉じる", "sec close")}</div>`, (c) => {
      const cv2 = c.querySelector("#bmcv"), info = c.querySelector("#bminfo");
      const dpr = devicePixelRatio || 1;
      let xs = nodes.map((n2) => n2.x), ys = nodes.map((n2) => n2.y);
      const fit = () => {
        const x0 = Math.min(...xs) - 30, x1 = Math.max(...xs) + 30, y0 = Math.min(...ys) - 30, y1 = Math.max(...ys) + 30;
        const k = Math.min(cv2.clientWidth / (x1 - x0), cv2.clientHeight / (y1 - y0));
        return { k, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
      };
      let V3 = fit(), pick = sel || null;
      const L2 = g.S.loc, here = tripFrom(g);
      const S2 = (x, y) => [(x - V3.cx) * V3.k + cv2.clientWidth / 2, (y - V3.cy) * V3.k + cv2.clientHeight / 2];
      const draw = () => {
        cv2.width = cv2.clientWidth * dpr;
        cv2.height = cv2.clientHeight * dpr;
        const x = cv2.getContext("2d");
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.fillStyle = "#f3efe4";
        x.fillRect(0, 0, cv2.clientWidth, cv2.clientHeight);
        // 海・川
        x.lineCap = x.lineJoin = "round";
        for (const L3 of g.tr.lines) {
          x.strokeStyle = L3.color;
          x.lineWidth = 4;
          x.setLineDash(L3.underground ? [7, 5] : []);
          x.beginPath();
          L3.path.pts.forEach((p, i) => {
            const [a, b] = S2(p[0], p[1]);
            i ? x.lineTo(a, b) : x.moveTo(a, b);
          });
          x.stroke();
        }
        x.setLineDash([]);
        routes.forEach((r, ri) => {
          x.strokeStyle = r.color;
          x.lineWidth = 3;
          x.globalAlpha = 0.85;
          x.beginPath();
          for (let i = 0; i < r.pts.length; i += 3) {
            const [a, b] = S2(r.pts[i][0] + 0.5 + ri * 0.6, r.pts[i][1] + 0.5 + ri * 0.6);
            i ? x.lineTo(a, b) : x.moveTo(a, b);
          }
          x.stroke();
          x.globalAlpha = 1;
          // 走っているバス
          for (const b of r.buses) if (b.x != null && busInService(g.S.min)) {
            const [a, bb] = S2(b.x, b.y);
            x.fillStyle = r.color;
            x.fillRect(a - 4, bb - 3, 8, 6);
            x.strokeStyle = "#fff";
            x.lineWidth = 1;
            x.strokeRect(a - 4, bb - 3, 8, 6);
          }
        });
        x.font = "bold 11px sans-serif";
        x.textAlign = "center";
        const placed = [];
        for (const n2 of nodes) {
          const [a, b] = S2(n2.x, n2.y);
          x.fillStyle = "#fff";
          x.strokeStyle = n2.kind === "rail" ? "#333" : (n2.stop.routes[0] || {}).color || "#e53935";
          x.lineWidth = pick && pick.key === n2.key ? 4 : 2;
          x.beginPath();
          if (n2.kind === "rail") x.rect(a - 5, b - 5, 10, 10);
          else x.arc(a, b, 5, 0, 7);
          x.fill();
          x.stroke();
          // 名前は重ならないものだけ(選んだものは必ず)
          const nm = n2.name.replace(/駅前$|前$/, ""), tw = x.measureText(nm).width, rc = [a - tw / 2 - 2, b - 20, tw + 4, 14];
          const sel2 = pick && pick.key === n2.key;
          if (sel2 || !placed.some((q) => rc[0] < q[0] + q[2] && q[0] < rc[0] + rc[2] && rc[1] < q[1] + q[3] && q[1] < rc[1] + rc[3])) {
            placed.push(rc);
            x.fillStyle = "rgba(243,239,228,0.85)";
            x.fillRect(...rc);
            x.fillStyle = sel2 ? "#c00" : "#123";
            x.fillText(nm, a, b - 9);
          }
        }
        const [hx, hy] = S2(here.x, here.y);
        x.fillStyle = "#ff2d2d";
        x.beginPath();
        x.arc(hx, hy, 6, 0, 7);
        x.fill();
        x.fillStyle = "#c00";
        x.fillText("現在地", hx, hy + 18);
      };
      const showInfo = (n2) => {
        pick = n2;
        draw();
        let html = `<div class="tcard"><b>${n2.kind === "bus" ? "🚏" : "🚉"} ${esc4(n2.name)}</b>`;
        if (n2.kind === "bus") for (const r of n2.stop.routes) {
          const e = busEtas(g, r, n2.stop).slice(0, 3);
          html += `<div class="tl"><span class="ti" style="background:${r.color}">${esc4(r.no)}</span>${esc4(r.name)} ${e.length ? e.map((t) => hhmm(g.S.min + t)).join("・") + "発(予想)" : "本日の運行は終了"}</div>`;
        } else for (const L3 of g.tr.lines.filter((q) => q.stops.some((s) => s.id === n2.st.id))) html += `<div class="tl"><span class="ti" style="background:${L3.color}">🚃</span>${esc4(L3.name)}(約${L3.headway}分ごと)</div>`;
        html += `<button class="btn item" data-a="go">ここへ行く(乗換案内)</button>${n2.kind === "bus" ? '<button class="btn item" data-a="walk">このバス停まで歩く</button>' : ""}</div>`;
        info.innerHTML = html;
        info.querySelector("[data-a=go]").onclick = () => tripModal(n2.kind === "rail" ? { b: n2.b } : { x: n2.x, y: n2.y, name: n2.name });
        const w = info.querySelector("[data-a=walk]");
        if (w) w.onclick = () => {
          closeModal();
          navTo({ kind: "pt", x: n2.x + 0.5, y: n2.y + 0.5, out: true }, { label: n2.name, run: true });
        };
      };
      // 操作: ドラッグで移動・タップで選択・ボタンで拡大縮小
      let drag = null;
      cv2.addEventListener("pointerdown", (e) => {
        drag = { x: e.clientX, y: e.clientY, cx: V3.cx, cy: V3.cy, moved: false };
        cv2.setPointerCapture(e.pointerId);
      });
      cv2.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 6) drag.moved = true;
        V3.cx = drag.cx - dx / V3.k;
        V3.cy = drag.cy - dy / V3.k;
        if (drag.moved) draw();
      });
      cv2.addEventListener("pointerup", (e) => {
        const d0 = drag;
        drag = null;
        if (!d0 || d0.moved) return;
        const r = cv2.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        let bn = null, bd = 22;
        for (const n2 of nodes) {
          const [a, b] = S2(n2.x, n2.y), d = Math.hypot(a - px, b - py);
          if (d < bd) {
            bd = d;
            bn = n2;
          }
        }
        if (bn) showInfo(bn);
      });
      c.querySelector(".zin").onclick = () => {
        V3.k *= 1.5;
        draw();
      };
      c.querySelector(".zout").onclick = () => {
        V3.k /= 1.5;
        draw();
      };
      c.querySelector(".here").onclick = () => {
        V3.cx = here.x;
        V3.cy = here.y;
        V3.k = Math.max(V3.k, 1.2);
        draw();
      };
      c.querySelector(".all").onclick = () => {
        V3 = fit();
        draw();
      };
      c.querySelector(".close").onclick = () => closeModal();
      requestAnimationFrame(() => {
        V3 = fit();
        if (pick) showInfo(pick);
        else draw();
      });
    });
  }
