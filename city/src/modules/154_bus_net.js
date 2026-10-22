  // src/bus_net.js — 路線バス網(地図v4): 循環バス「青海めぐりん」と系統1〜4。
  // 停留所は道路に面した歩道に置き(標柱・屋根・待つ人)、バスは道路だけを通る経路を実際に走る(描画は車両として)。
  // 乗車は停留所で行き先を選ぶ → 車内の場面(次の停留所の案内)→ 降りた停留所に立つ。
  var BUS_ROUTES = [
    { id: "C", no: "循環", name: "青海めぐりん", color: "#e53935", loop: true, via: ["st:aoumi_chuo", "cityhall", "hospital", "dept", "stadium", "st:tohtower", "aquarium", "st:showacho"] },
    { id: "1", no: "1", name: "空港リムジン", color: "#1e63c8", via: ["st:tohtower", "st:higashino", "airport"] },
    { id: "2", no: "2", name: "大学線", color: "#43a047", via: ["st:aoumi_chuo", "st:shinaomi", "univ"] },
    { id: "3", no: "3", name: "遊園地・動物園線", color: "#fb8c00", via: ["st:midoricho", "themepark", "zoo"] },
    { id: "4", no: "4", name: "温泉街線", color: "#8e24aa", via: ["st:tsukimi_onsen", "onsenbath", "ryokan"] }
  ];
  var BUS_SPEED = 4.2;
  var busNetC = /* @__PURE__ */ new WeakMap();
  function busNet(map2) {
    if (!map2 || (map2.ver || 1) < 4) return null;
    let net = busNetC.get(map2);
    if (net) return net;
    const W2 = map2.W, H4 = map2.H;
    const isRoad = (x, y) => x >= 0 && y >= 0 && x < W2 && y < H4 && [T.ROAD, T.CROSSING, T.BRIDGE].includes(map2.ground[x + y * W2]);
    const walk = (x, y) => x >= 0 && y >= 0 && x < W2 && y < H4 && !map2.solid[x + y * W2] && !isRoad(x, y) && map2.ground[x + y * W2] !== T.WATER && map2.ground[x + y * W2] !== T.RAIL;
    const anchor = (key) => {
      if (key.startsWith("st:")) {
        const s = map2.stations.find((q) => q.id === key.slice(3));
        return s ? { x: s.door.x, y: s.door.y + 2, name: s.name + (s.name.endsWith("前") ? "駅" : "駅前") } : null;
      }
      let best = null, bd = 1e9;
      for (const b of map2.buildings) {
        if (b.type !== key || b.parent !== void 0) continue;
        const d = Math.hypot(b.doorX - 640, b.doorY - 480);
        if (d < bd) {
          bd = d;
          best = b;
        }
      }
      return best ? { x: best.doorX, y: best.doorY + 1, name: (best.name || BTYPES[key].label).replace(/第\d+$/, "") + "前" } : null;
    };
    // 停留所: 目標の近くで「歩道(歩けるタイル)で、隣が道路」の場所
    const stopAt = (a) => {
      for (let r = 0; r < 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = a.x + dx, y = a.y + dy;
        if (!walk(x, y)) continue;
        for (const [ex, ey] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (isRoad(x + ex, y + ey)) return { x, y, rx: x + ex, ry: y + ey, name: a.name };
      }
      return null;
    };
    // 道路だけの最短経路(幅優先)
    const roadPath = (a, b) => {
      const prev = new Map(), q = [[a.rx, a.ry]], key = (x, y) => x + y * W2;
      prev.set(key(a.rx, a.ry), -1);
      for (let i = 0; i < q.length && i < 4e5; i++) {
        const [x, y] = q[i];
        if (x === b.rx && y === b.ry) break;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, k = key(nx, ny);
          if (!isRoad(nx, ny) || prev.has(k)) continue;
          prev.set(k, key(x, y));
          q.push([nx, ny]);
        }
      }
      if (!prev.has(key(b.rx, b.ry))) return null;
      const out = [];
      for (let k = key(b.rx, b.ry); k >= 0; k = prev.get(k)) out.push([k % W2, k / W2 | 0]);
      return out.reverse();
    };
    net = { routes: [], stops: [] };
    const stopKey = /* @__PURE__ */ new Map();
    for (const R5 of BUS_ROUTES) {
      const stops = [];
      for (const v of R5.via) {
        const a = anchor(v);
        const s = a && stopAt(a);
        if (!s) continue;
        const k = s.x + "," + s.y;
        let st3 = stopKey.get(k);
        if (!st3) {
          st3 = { id: "bs" + net.stops.length, ...s, routes: [] };
          stopKey.set(k, st3);
          net.stops.push(st3);
        }
        if (!stops.includes(st3)) stops.push(st3);
      }
      if (stops.length < 2) continue;
      const seq = R5.loop ? [...stops, stops[0]] : stops;
      const pts = [];
      const at = [0];
      let ok = true;
      for (let i = 0; i < seq.length - 1; i++) {
        const p = roadPath(seq[i], seq[i + 1]);
        if (!p) {
          ok = false;
          break;
        }
        for (const q of i ? p.slice(1) : p) pts.push(q);
        at.push(pts.length - 1);
      }
      if (!ok || pts.length < 4) continue;
      const route = { ...R5, stops, pts, stopAt: at, len: pts.length };
      for (const s of stops) s.routes.push(route);
      net.routes.push(route);
    }
    busNetC.set(map2, net);
    return net;
  }
  // 運行中のバスの位置(実時間で走る・停留所で停車)
  function busesNow(R5, hero) {
    const g = R5.g, net = busNet(g.world.map);
    if (!net) return [];
    const m = g.S.min;
    if (m < 6 * 60 || m > 22 * 60 + 30) return [];
    const out = [];
    const t = R5.time || 0;
    for (const r of net.routes) {
      const dwell = 4, cyc = r.len / BUS_SPEED + dwell * r.stops.length;
      const nBus = Math.max(1, Math.round(cyc / 45));
      for (let k = 0; k < nBus; k++) {
        let tt = (t + k * cyc / nBus) % cyc;
        let pos = 0;
        for (let i = 0; i < r.stopAt.length - 1; i++) {
          if (tt < dwell) {
            pos = r.stopAt[i];
            tt = -1;
            break;
          }
          tt -= dwell;
          const segT = (r.stopAt[i + 1] - r.stopAt[i]) / BUS_SPEED;
          if (tt < segT) {
            pos = r.stopAt[i] + tt * BUS_SPEED;
            tt = -1;
            break;
          }
          tt -= segT;
        }
        if (tt >= 0) pos = r.len - 1;
        const i0 = Math.min(r.len - 2, Math.floor(pos)), f = pos - i0;
        const a = r.pts[i0], b = r.pts[i0 + 1];
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const d = dx > 0 ? 0 : dy > 0 ? 1 : dx < 0 ? 2 : 3;
        // 左側通行: 進行方向の左へ寄せる
        const lx = dy > 0 ? 0.25 : dy < 0 ? -0.25 : 0, ly = dx > 0 ? -0.25 : dx < 0 ? 0.25 : 0;
        const x = a[0] + dx * f + 0.5 + lx, y = a[1] + dy * f + 0.5 + ly;
        if (Math.abs(x - hero.x) > 48 || Math.abs(y - hero.y) > 48) continue;
        out.push({ id: "BUS" + r.id + k, ty: r.id === "1" ? "tourbus" : "bus", x, y, d, v: 1, len: 5.2, color: 0, horiz: d % 2 === 0, route: r });
      }
    }
    return out;
  }
  // ---- 屋外: 停留所の標柱・屋根・待つ人
  function facOutdoor(R5, hero, push, P2, Z) {
    const net = busNet(R5.g.world.map);
    if (!net) return;
    const m = R5.g.S.min, run = m >= 6 * 60 && m <= 22 * 60 + 30;
    for (const s of net.stops) {
      if (Math.abs(s.x - hero.x) > 30 || Math.abs(s.y - hero.y) > 30) continue;
      const u = s.x + 0.5, v = s.y + 0.5;
      push(s.x, s.y, s.x + 1, s.y + 1, P2.X(u, v) - 14 * Z, P2.X(u, v) + 14 * Z, P2.Y(u, v, 3) - 14 * Z, P2.Y(u, v, 0) + 4 * Z, (c) => drawBusStop(c, P2, Z, s, R5, run));
    }
  }
  function drawBusStop(c, P2, Z, s, R5, run) {
    const PX = (a, b, z) => [P2.X(a, b), P2.Y(a, b, z)];
    const u = s.x + 0.5, v = s.y + 0.5;
    // 屋根付き待合
    c.fillStyle = "rgba(170,205,230,0.55)";
    const r0 = PX(u - 0.45, v - 0.35, 2), r1 = PX(u + 0.45, v - 0.35, 2), r2 = PX(u + 0.45, v + 0.35, 2), r3 = PX(u - 0.45, v + 0.35, 2);
    c.beginPath();
    c.moveTo(...r0);
    c.lineTo(...r1);
    c.lineTo(...r2);
    c.lineTo(...r3);
    c.closePath();
    c.fill();
    c.fillStyle = "#6b7280";
    for (const [a, b] of [[u - 0.42, v - 0.32], [u + 0.42, v - 0.32]]) {
      const p0 = PX(a, b, 0), p1 = PX(a, b, 2);
      c.fillRect(p0[0] - 0.4 * Z, p1[1], 0.8 * Z, p0[1] - p1[1]);
    }
    // ベンチと待つ人
    c.fillStyle = "#8d6e4f";
    const bb = PX(u, v - 0.2, 0.5);
    c.fillRect(bb[0] - 4 * Z, bb[1], 8 * Z, 1.4 * Z);
    if (run) {
      const n2 = uh(s.x * 31 + s.y, Math.floor(R5.g.S.min / 15)) % 4;
      const pop = R5.g.world.pop;
      for (let k = 0; k < n2; k++) {
        const id = uh(s.x * 7 + k, s.y * 3 + Math.floor(R5.g.S.min / 30)) % pop.n;
        if (pop.gone[id] || pop.home[id] < 0) continue;
        const pp = PX(u - 0.3 + k * 0.22, v + 0.1, 0);
        try {
          R5.drawChar(c, pp[0], pp[1], pop.look[id], R5.g.ageOf(id), "d", false, { id });
        } catch (_) {
        }
      }
    }
    // 標柱(系統の色)
    const p0 = PX(u + 0.55, v + 0.3, 0), p1 = PX(u + 0.55, v + 0.3, 2.6);
    c.fillStyle = "#e5e7eb";
    c.fillRect(p0[0] - 0.5 * Z, p1[1], Z, p0[1] - p1[1]);
    c.fillStyle = s.routes[0] ? s.routes[0].color : "#e53935";
    c.beginPath();
    c.arc(p1[0], p1[1], 3.2 * Z, 0, 7);
    c.fill();
    c.fillStyle = "#fff";
    c.font = `bold ${Math.max(7, 3 * Z)}px ${SIGN_FONT}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("バス", p1[0], p1[1] + 0.2 * Z);
    if (Z >= 1.6) {
      c.font = `bold ${Math.max(7, 2.4 * Z)}px ${SIGN_FONT}`;
      c.fillStyle = "rgba(10,20,40,0.85)";
      const tw = c.measureText(s.name).width + 4 * Z;
      c.fillRect(p1[0] - tw / 2, p1[1] - 9 * Z, tw, 3.6 * Z);
      c.fillStyle = "#fff";
      c.fillText(s.name, p1[0], p1[1] - 7.2 * Z);
    }
  }
  // ---- 停留所の操作(A/タップで近づいたとき)
  function facOutdoorTargets(g, L2) {
    const net = busNet(g.world.map);
    if (!net) return [];
    const out = [];
    for (const s of net.stops) if (Math.abs(s.x - L2.x) < 2.2 && Math.abs(s.y - L2.y) < 2.2) out.push({ kind: "fx", act: "fx_busstop", x: s.x, y: s.y, stop: s, label: `バス停「${s.name}」` });
    return out;
  }
  FAC_ACTS.fx_busstop = (g, o, b, push) => {
    const s = o.stop, m = g.S.min;
    if (m < 6 * 60 || m > 22 * 60 + 30) return push("none", "本日のバスは終了しました(6:00〜22:30)", { disabled: true });
    for (const r of s.routes) {
      const i = r.stops.indexOf(s);
      const next = r.stops.filter((q, j) => q !== s && (r.loop || j > i));
      for (const d of next.slice(0, 8)) push(`busgo:${r.id}:${s.id}:${d.id}`, `[${r.no}] ${r.name} → ${d.name}まで(¥${busFare(g)})`, { disabled: g.hero.money < busFare(g) });
      if (!r.loop && i > 0) for (const d of r.stops.slice(0, i).reverse().slice(0, 3)) push(`busgo:${r.id}:${s.id}:${d.id}`, `[${r.no}] ${r.name}(反対方向)→ ${d.name}まで(¥${busFare(g)})`, { disabled: g.hero.money < busFare(g) });
    }
    push("busmap", "路線図・時刻表を見る");
  };
  var busFare = (g) => yenf(g, g.age() < 12 ? 120 : 230);
  FAC_RUN.busmap = (g, arg, tg, r) => {
    const net = busNet(g.world.map);
    r.msg = net.routes.map((q) => `[${q.no}] ${q.name}: ${q.stops.map((s) => s.name).join("→")}${q.loop ? "→(循環)" : ""}`).join(" / ") + " 運行 6:00〜22:30・日中12分/夜20分間隔";
  };
  FAC_RUN.busgo = (g, arg, tg, r) => {
    const [rid, fid, tid] = String(arg).split(":");
    const net = busNet(g.world.map);
    const route = net.routes.find((q) => q.id === rid), from = net.stops.find((q) => q.id === fid), to = net.stops.find((q) => q.id === tid);
    if (!route || !from || !to) return r.msg = "その系統はありません";
    const hw = g.S.min >= 19 * 60 ? 20 : 12, wait = (hw - g.S.min % hw) % hw || 2;
    const i0 = route.stops.indexOf(from), i1 = route.stops.indexOf(to);
    const tiles = Math.abs(route.stopAt[Math.max(i0, i1)] - route.stopAt[Math.min(i0, i1)]) || route.len / 2;
    const ride = Math.max(3, Math.round(tiles / 40));
    g.pay(busFare(g), "バス運賃");
    g.advance(wait + ride);
    const order = [];
    if (i1 > i0) for (let k = i0 + 1; k <= i1; k++) order.push(route.stops[k].name);
    else if (route.loop) for (let k = i0 + 1; k <= i1 + route.stops.length; k++) order.push(route.stops[k % route.stops.length].name);
    else for (let k = i0 - 1; k >= i1; k--) order.push(route.stops[k].name);
    const L2 = g.S.loc;
    L2.k = "out";
    delete L2.b;
    delete L2.floor;
    L2.x = to.x + 0.5;
    L2.y = to.y + 0.5;
    L2.f = "d";
    g.S.stats.rides = (g.S.stats.rides || 0) + 1;
    g.log("bus", `[${route.no}] ${route.name}で${from.name}から${to.name}へ`);
    r.msg = `${to.name}で降りました(待ち${wait}分・乗車${ride}分・¥${busFare(g)})`;
    r.ui = "fx_scene";
    r.scene = busScene(g, route, from, order);
  };
  function busScene(g, route, from, order) {
    const night = g.S.min >= 18 * 60 || g.S.min < 5 * 60;
    const lines = [[0, `ご乗車ありがとうございます。${route.name}です`]];
    order.forEach((nm, i) => lines.push([2 + i * 3, i === order.length - 1 ? `次は${nm}、${nm}です。お降りの方はボタンでお知らせください` : `次は${nm}です`]));
    return {
      title: `[${route.no}] ${route.name}`,
      dur: Math.min(16, 4 + order.length * 3),
      lines,
      draw(c, t, W2, H4) {
        // 車窓(流れる街並み)
        const gr = c.createLinearGradient(0, 0, 0, H4);
        gr.addColorStop(0, night ? "#0b1230" : "#8cc8f0");
        gr.addColorStop(1, night ? "#1d2440" : "#dff1fb");
        c.fillStyle = gr;
        c.fillRect(0, 0, W2, H4);
        for (let i = 0; i < 30; i++) {
          const bw = W2 * 0.12, x = ((i * bw * 1.1 - t * W2 * 0.18) % (W2 * 3.3) + W2 * 3.3) % (W2 * 3.3) - bw;
          const bh = H4 * (0.18 + (i * 37 % 9) / 30);
          c.fillStyle = night ? "#232a45" : ["#b9c2cc", "#d7c8b6", "#a8b6c4", "#c9b8a8"][i % 4];
          c.fillRect(x, H4 * 0.62 - bh, bw, bh);
          if (night) {
            c.fillStyle = "#ffe08a";
            for (let k = 0; k < 6; k++) c.fillRect(x + 6 + k % 2 * bw * 0.5, H4 * 0.62 - bh + 8 + (k >> 1) * 14, 6, 6);
          }
        }
        // 車内: 窓枠・座席・つり革・降車ボタン
        c.fillStyle = "#e8e3d8";
        c.fillRect(0, 0, W2, H4 * 0.12);
        c.fillRect(0, H4 * 0.62, W2, H4 * 0.38);
        for (let k = 0; k < 5; k++) c.fillRect(k * W2 / 4 - W2 * 0.01, 0, W2 * 0.02, H4 * 0.62);
        for (let k = 0; k < 4; k++) {
          c.fillStyle = "#2f5aa8";
          c.fillRect(W2 * (0.06 + k * 0.24), H4 * 0.7, W2 * 0.16, H4 * 0.2);
          c.fillStyle = "#24488a";
          c.fillRect(W2 * (0.06 + k * 0.24), H4 * 0.62, W2 * 0.16, H4 * 0.1);
        }
        c.strokeStyle = "#999";
        c.lineWidth = 2;
        for (let k = 0; k < 8; k++) {
          const x = W2 * (0.08 + k * 0.12), sw = Math.sin(t * 2 + k) * 4;
          c.beginPath();
          c.moveTo(x, H4 * 0.12);
          c.lineTo(x + sw, H4 * 0.22);
          c.stroke();
          c.beginPath();
          c.arc(x + sw, H4 * 0.24, H4 * 0.02, 0, 7);
          c.stroke();
        }
        // 次の停留所の表示器
        const cur = lines.filter((q) => t >= q[0]).pop();
        c.fillStyle = "#111";
        c.fillRect(W2 * 0.3, H4 * 0.02, W2 * 0.4, H4 * 0.08);
        c.fillStyle = "#ffb300";
        c.font = `bold ${Math.round(H4 * 0.04)}px ${SIGN_FONT}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(cur ? cur[1].replace(/、.*$/, "").slice(0, 22) : route.name, W2 / 2, H4 * 0.06);
        c.fillStyle = "#e53935";
        c.beginPath();
        c.arc(W2 * 0.94, H4 * 0.5, H4 * 0.03, 0, 7);
        c.fill();
      }
    };
  }
