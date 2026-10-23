  // src/bus_net.js — 路線バス(地図v4): 循環「青海めぐりん」と系統1〜4。
  // バスは一台ずつ道路の車線(進行方向の決まった車線・交差点)だけを通る経路を走り、信号で止まり、前の車と間隔をあけ、
  // 乗る人・降りる人がいる停留所に停まる。主人公と住民は同じ車両に乗って移動する(瞬間移動ではない)。
  // 時間: 時間の流れ×1で 1秒=1分。バスの速さはタクシー(18タイル/秒)・電車に近い「街の乗り物の速さ」で、徒歩(約4タイル/分)より速い。
  // 主人公も住民も同じ時計で乗る。乗車中の「早送り」は時計・バス・信号を同じ倍率で進める。
  var BUS_ROUTES = [
    { id: "C", no: "循環", name: "青海めぐりん", dest: "青海中央駅", color: "#e53935", loop: true, headway: 14, via: ["st:aoumi_chuo", "cityhall", "hospital", "dept", "stadium", "st:tohtower", "aquarium", "st:showacho"] },
    { id: "1", no: "1", name: "空港リムジン", dest: "青海空港", color: "#1e63c8", headway: 20, ty: "tourbus", via: ["st:tohtower", "st:higashino", "airport"] },
    { id: "2", no: "2", name: "大学線", dest: "青海第二大学", color: "#2e7d32", headway: 12, via: ["st:aoumi_chuo", "hospital", "st:shinaomi", "univ"] },
    { id: "3", no: "3", name: "遊園地・動物園線", dest: "青海どうぶつ園", color: "#ef6c00", headway: 16, via: ["st:midoricho", "themepark", "zoo"] },
    { id: "4", no: "4", name: "温泉街線", dest: "雫庵", color: "#8e24aa", headway: 18, via: ["st:tsukimi_onsen", "onsenbath", "ryokan"] }
  ];
  var BUS_HOURS = [6 * 60, 23 * 60];
  var BUS_LAST = 22 * 60 + 30;
  var BUS_VMAX = { 1: 8, 2: 12, 3: 14, 4: 16 };
  var BUS_ACC = 5, BUS_DEC = 8;
  var BUS_STOP_OFF = 1.6;
  var BUS_FARE = 230;
  var BUS_RIDE_CLOCK = 1;
  var busNetC = /* @__PURE__ */ new WeakMap();
  var stopKind = (key) => key.startsWith("st:") ? "terminal" : key === "airport" ? "airport" : key === "univ" ? "univ" : key === "hospital" ? "hospital" : ["aquarium", "themepark", "zoo", "onsenbath", "ryokan", "stadium"].includes(key) ? "sight" : "std";
  function busNet(map2) {
    if (!map2 || (map2.ver || 1) < 4) return null;
    let net = busNetC.get(map2);
    if (net) return net;
    const ri = roadInfo(map2), W2 = map2.W, H4 = map2.H, N = W2 * H4;
    const walk = (x, y) => x >= 0 && y >= 0 && x < W2 && y < H4 && !map2.solid[x + y * W2] && !ri.drv[x + y * W2] && map2.ground[x + y * W2] !== T.WATER && map2.ground[x + y * W2] !== T.RAIL;
    const anchor = (key) => {
      if (key.startsWith("b:")) {
        const b = map2.buildings[+key.slice(2)];
        return b ? { x: b.doorX, y: b.doorY + 1, name: ["univ", "zoo", "aquarium"].includes(b.type) ? b.name.split(" ")[0] + "前" : null, b: b.idx } : null;
      }
      if (key.startsWith("st:")) {
        const s = map2.stations.find((q) => q.id === key.slice(3));
        return s ? { x: s.door.x, y: s.door.y + 2, name: s.name + (s.name.endsWith("前") ? "駅" : "駅前"), stationId: s.id } : null;
      }
      let best = null, bd = 1e9;
      for (const b of map2.buildings) {
        if (b.type !== key || b.tenant) continue;
        const d = Math.hypot(b.doorX - 640, b.doorY - 480);
        if (d < bd) {
          bd = d;
          best = b;
        }
      }
      return best ? { x: best.doorX, y: best.doorY + 1, name: (best.name || BTYPES[key].label).replace(/第\d+$/, "") + "前", b: best.idx } : null;
    };
    // 停留所: 目標の近くで「歩道で、隣が車の走れる道(交差点ではない)」の場所
    const stopAt = (a) => {
      for (let r = 0; r < 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = a.x + dx, y = a.y + dy;
        if (!walk(x, y)) continue;
        for (const [ex, ey] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const k = x + ex + (y + ey) * W2;
          if (ri.drv[k] && ri.axis[k] !== AX.J && laneDirs(ri, k)) return { x, y, rx: x + ex, ry: y + ey, name: a.name, stationId: a.stationId, b: a.b };
        }
      }
      return null;
    };
    // 車線に従う最短経路(状態=タイル×向き)。交差点でだけ曲がれる。Uターンなし
    const mark = new Int32Array(N * 4), prev = new Int32Array(N * 4), q = new Int32Array(N * 4);
    let stamp = 0;
    const lanePath = (sk, sdirs, gk, gdir) => {
      stamp++;
      let qh = 0, qt = 0;
      for (const d of sdirs) {
        const s = sk * 4 + d;
        mark[s] = stamp;
        prev[s] = -1;
        q[qt++] = s;
      }
      let hit = -1;
      while (qh < qt) {
        const s = q[qh++], k = s >> 2, d = s & 3;
        if (k === gk && (gdir == null || d === gdir) && qh > sdirs.length) {
          hit = s;
          break;
        }
        const x = k % W2, y = k / W2 | 0;
        const isJ = ri.axis[k] === AX.J;
        const dirs = [d, (d + 1) % 4, (d + 3) % 4];
        {
          // 行き止まり: その場で折り返す
          const fx = x + DX[d], fy = y + DY[d];
          if (fx < 0 || fy < 0 || fx >= W2 || fy >= H4 || !ri.drv[fx + fy * W2]) {
            const ns = k * 4 + (d + 2) % 4;
            if (mark[ns] !== stamp) {
              mark[ns] = stamp;
              prev[ns] = s;
              q[qt++] = ns;
            }
          }
        }
        for (const dd of dirs) {
          const nx = x + DX[dd], ny = y + DY[dd];
          if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
          const nk = nx + ny * W2;
          // 直進・交差点での右左折、それ以外は隣の車線へ移る(向きは変えない)
          const lane = !isJ && dd !== d;
          const nd = lane ? d : dd;
          if (!ri.drv[nk] || ri.axis[nk] !== AX.J && !canEnter(ri, nx, ny, nd)) continue;
          if (lane && ri.axis[nk] !== AX.J && ri.axis[nk] !== ri.axis[k]) continue;
          const ns = nk * 4 + nd;
          if (mark[ns] === stamp) continue;
          mark[ns] = stamp;
          prev[ns] = s;
          q[qt++] = ns;
        }
      }
      if (hit < 0) return null;
      const out = [];
      for (let s = hit; s >= 0; s = prev[s]) out.push(s);
      return out.reverse().map((s) => [(s >> 2) % W2, (s >> 2) / W2 | 0, s & 3]);
    };
    net = { routes: [], stops: [], ri };
    // 途中の停留所の名前: 近くの目印(学校・公園・寺社・図書館・診療所・郵便局・交番・団地)か、住所の「○○丁目」
    const usedNames = /* @__PURE__ */ new Set();
    const stopName = (x, y) => {
      let best = null, bd = 22;
      for (const b of map2.buildings) {
        if (b.tenant || !["school", "elementary", "juniorhigh", "highschool", "kinder", "park", "shrine", "temple", "library", "clinic", "post", "police", "koban", "museum", "pool", "gym", "danchi", "community"].includes(b.type)) continue;
        const d = Math.abs(b.doorX - x) + Math.abs(b.doorY - y);
        if (d < bd) {
          bd = d;
          best = b;
        }
      }
      let nm = best ? (best.name || BTYPES[best.type].label).replace(/第\d+$/, "") + "前" : "";
      if (!nm || usedNames.has(nm)) {
        let nb = null, nd = 1e9;
        for (const b of map2.buildings) {
          if (!b.addr) continue;
          const d = Math.abs(b.doorX - x) + Math.abs(b.doorY - y);
          if (d < nd) {
            nd = d;
            nb = b;
          }
        }
        const mm = nb && /^(.*?)(\d+丁目)/.exec(nb.addr);
        nm = mm ? mm[1].replace(/地区$/, "").split("・").pop() + mm[2] : nm || "停留所";
      }
      usedNames.add(nm);
      return nm;
    };
    const stopKey = /* @__PURE__ */ new Map();
    // 住宅地と駅・都心を結ぶ系統(住宅の多い地区のうち、駅から遠いところを地図から決める)
    const feeders = [];
    {
      const cell = 48, gw = Math.ceil(W2 / cell), gh = Math.ceil(H4 / cell), cnt = new Float32Array(gw * gh), big = new Int32Array(gw * gh).fill(-1);
      for (const b of map2.buildings) {
        const bt = BTYPES[b.type];
        if (!bt || bt.cat !== "res" || b.tenant) continue;
        const k = (b.doorX / cell | 0) + (b.doorY / cell | 0) * gw;
        cnt[k] += bt.cap || 5;
        if (big[k] < 0 || (BTYPES[map2.buildings[big[k]].type].cap || 5) < (bt.cap || 5)) big[k] = b.idx;
      }
      const cells = [];
      for (let k = 0; k < gw * gh; k++) if (cnt[k] >= 250 && big[k] >= 0) cells.push({ k, n: cnt[k], b: map2.buildings[big[k]] });
      cells.sort((a, b) => b.n - a.n);
      const picks = [];
      const near = (b) => map2.stations.reduce((m, s) => Math.min(m, Math.abs(s.x - b.doorX) + Math.abs(s.y - b.doorY)), 1e9);
      for (const c of cells) {
        if (picks.length >= 4) break;
        if (near(c.b) < 70 || picks.some((q) => Math.abs(q.b.doorX - c.b.doorX) + Math.abs(q.b.doorY - c.b.doorY) < 160)) continue;
        picks.push(c);
      }
      const cols = ["#00897b", "#6d4c41", "#c2185b", "#546e7a"];
      picks.forEach((c, i) => {
        let st3 = null, bd = 1e9;
        for (const s of map2.stations) {
          if (s.metro) continue;
          const d = Math.abs(s.x - c.b.doorX) + Math.abs(s.y - c.b.doorY);
          if (d < bd) {
            bd = d;
            st3 = s;
          }
        }
        if (!st3) return;
        const mm = c.b.addr && /^(.*?)(\d+丁目)/.exec(c.b.addr), area = mm ? mm[1].replace(/地区$/, "").split("・").pop() : "住宅地";
        const via = ["b:" + c.b.idx, "st:" + st3.id];
        if (st3.id !== "aoumi_chuo") via.push("st:aoumi_chuo");
        feeders.push({ id: String(5 + i), no: String(5 + i), name: area + "線", dest: st3.name + "駅", color: cols[i], headway: 15, via, res: true });
      });
    }
    // 埋立地(青海新都心)の大学・動物園へ: 新都心線(青海中央駅 → 橋 → 大学 → 動物園)
    if (map2.island) {
      const isl = map2.buildings.filter((b) => (b.type === "univ" || b.type === "zoo" || b.type === "aquarium") && b.siteI != null && map2.fsites && map2.fsites[b.siteI] && map2.fsites[b.siteI].y >= map2.island.y).sort((a, c) => c.doorX - a.doorX);
      if (isl.length) feeders.push({ id: "9", no: "9", name: "新都心線", dest: "青海新都心", color: "#00897b", headway: 12, via: ["st:aoumi_chuo", ...isl.map((b) => "b:" + b.idx)] });
    }
    net.feeders = feeders.length;
    for (const R5 of [...BUS_ROUTES, ...feeders]) {
      const stops = [];
      for (const v of R5.via) {
        const a = anchor(v);
        const s = a && stopAt(a);
        if (!s) continue;
        const k = s.x + "," + s.y;
        let st3 = stopKey.get(k);
        if (!st3) {
          st3 = { id: "bs" + net.stops.length, ...s, name: s.name || stopName(s.x, s.y), kind: v.startsWith("b:") ? "std" : stopKind(v), routes: [], queue: [] };
          stopKey.set(k, st3);
          net.stops.push(st3);
        }
        if (!stops.includes(st3)) stops.push(st3);
      }
      if (stops.length < 2) continue;
      // 運行順(循環はそのまま一周、往復系統は折り返して始点へ戻る)
      const cyc = R5.loop ? stops.slice() : [...stops, ...stops.slice(1, -1).reverse()];
      const pts = [], at = [];
      let ok = true, d0 = null, dir = null;
      for (let i = 0; i < cyc.length; i++) {
        const a = cyc[i], b = cyc[(i + 1) % cyc.length], ak = a.rx + a.ry * W2, bk = b.rx + b.ry * W2;
        const sdirs = dir == null ? [0, 1, 2, 3].filter((d) => laneDirs(ri, ak) >> d & 1) : [dir];
        const last = i === cyc.length - 1;
        const p = lanePath(ak, sdirs, bk, last ? d0 : null);
        if (!p || p.length < 2) {
          ok = false;
          break;
        }
        if (d0 == null) d0 = p[0][2];
        at.push(pts.length);
        for (const s of p.slice(0, -1)) pts.push(s);
        dir = p[p.length - 1][2];
      }
      if (!ok || pts.length < 8) continue;
      pts.push(pts[0]);
      // 途中の停留所: 主な停留所の間が長いところに、約260m(130タイル)ごとに道沿いの停留所を置く
      {
        const nc = [], na = [], len = pts.length - 1;
        for (let i = 0; i < cyc.length; i++) {
          nc.push(cyc[i]);
          na.push(at[i]);
          const a0 = at[i], a1 = i + 1 < cyc.length ? at[i + 1] : len, gap = a1 - a0, n2 = Math.floor(gap / 130);
          for (let k = 1; k < n2; k++) {
            let idx = a0 + Math.round(gap * k / n2);
            let st3 = null;
            for (let tries = 0; tries < 8 && !st3; tries++, idx++) {
              const p = pts[idx];
              if (!p || ri.axis[p[0] + p[1] * W2] === AX.J) continue;
              const d = p[2], lf = [DY[d], -DX[d]];
              // 進行方向の左(歩道側)を優先
              for (const [ex, ey] of [lf, [-lf[0], -lf[1]]]) {
                let x = p[0], y = p[1];
                for (let s2 = 0; s2 < 4; s2++) {
                  x += ex;
                  y += ey;
                  if (walk(x, y)) break;
                  if (!ri.drv[x + y * W2]) {
                    x = -1;
                    break;
                  }
                }
                if (x >= 0 && walk(x, y)) {
                  const k2 = x + "," + y;
                  st3 = stopKey.get(k2);
                  if (!st3) {
                    st3 = { id: "bs" + net.stops.length, x, y, rx: x - ex, ry: y - ey, name: stopName(x, y), kind: "std", routes: [], queue: [] };
                    stopKey.set(k2, st3);
                    net.stops.push(st3);
                  }
                  break;
                }
              }
              if (st3) {
                nc.push(st3);
                na.push(idx);
              }
            }
          }
        }
        cyc.length = 0;
        cyc.push(...nc);
        at.length = 0;
        at.push(...na);
        for (const s2 of cyc) if (!stops.includes(s2)) stops.push(s2);
      }
      const route = { ...R5, stops, cyc, pts, cycAt: at, len: pts.length - 1, avgV: 9, buses: [] };
      // 住宅地の系統は起点の停留所名で呼ぶ(例: 「○○団地線」「○○7丁目線」)
      if (R5.res) route.name = stops[0].name.replace(/前$/, "") + "線";
      for (const s of stops) s.routes.push(route);
      net.routes.push(route);
    }
    busNetC.set(map2, net);
    return net;
  }
  // ---- 位置(距離 s に沿って)
  function busPose(r, S) {
    const L3 = r.len, s = (S % L3 + L3) % L3, i = Math.floor(s), f = s - i;
    const a = r.pts[i], b = r.pts[i + 1];
    const d = a[2];
    let x = a[0] + (b[0] - a[0]) * f + 0.5, y = a[1] + (b[1] - a[1]) * f + 0.5;
    const ri = busNetC.get(G3.world.map).ri, k = a[0] + a[1] * ri.W;
    const off = isNarrowTwoWay(ri, k) ? d === 0 || d === 3 ? -0.22 : 0.22 : 0;
    if (d % 2 === 0) y += off;
    else x += off;
    return { x, y, d, k };
  }
  // ---- 運行シミュレーション
  var BUSSIM = { map: null, lastAbs: null, riders: /* @__PURE__ */ new Map(), alight: [], drivers: null, rng: 12345 };
  var brand = () => (BUSSIM.rng = BUSSIM.rng * 1103515245 + 12345 >>> 0) / 4294967296;
  var busInService = (m) => m >= BUS_HOURS[0] && m < BUS_HOURS[1];
  function busFleet(g) {
    const map2 = g.world.map, net = busNet(map2);
    if (!net) return null;
    if (BUSSIM.map !== map2) {
      BUSSIM.map = map2;
      BUSSIM.lastAbs = null;
      BUSSIM.riders.clear();
      BUSSIM.alight = [];
      BUSSIM.drivers = null;
      for (const r of net.routes) {
        const cycMin = r.len / r.avgV + r.cyc.length * 0.8 + 3;
        const n2 = Math.max(2, Math.min(r.loop ? 12 : 6, Math.round(cycMin / r.headway)));
        r.buses = [];
        for (let k = 0; k < n2; k++) r.buses.push({ id: r.id + "-" + (k + 1), no: k + 1, r, len: r.ty === "tourbus" ? 5.5 : 5.25, S: 0, v: 0, mode: "run", t: 0, j: 0, tgt: 0, pax: [], door: 0, brake: false });
      }
      for (const s of net.stops) s.queue = [];
    }
    return net;
  }
  // 運転士: 仕事のない大人から決定的に選ぶ(早番 6:00-14:30 / 遅番 14:30-23:00)
  function busDrivers(g, net) {
    if (BUSSIM.drivers) return BUSSIM.drivers;
    const pop = g.world.pop, used = /* @__PURE__ */ new Set(), out = /* @__PURE__ */ new Map();
    let h = 9001;
    for (const r of net.routes) for (const b of r.buses) {
      const pair = [];
      for (let tries = 0; tries < 4e3 && pair.length < 2; tries++) {
        const id = uh(h++, 4711) % pop.n;
        if (used.has(id) || pop.gone[id] || pop.home[id] < 0 || pop.work[id] >= 0 || pop.school[id] >= 0) continue;
        const a = g.ageOf(id);
        if (a < 25 || a > 62 || id === g.hero.id) continue;
        used.add(id);
        pair.push(id);
      }
      b.drv = pair;
      for (const [i, id] of pair.entries()) out.set(id, { bus: b, shift: i });
    }
    return BUSSIM.drivers = out;
  }
  var busDriverNow = (b, m) => b.drv ? b.drv[m < 14 * 60 + 30 ? 0 : 1] : -1;
  function busResync(g, net, abs) {
    const m = abs % 1440;
    for (const r of net.routes) {
      const n2 = r.buses.length;
      for (const b of r.buses) {
        for (const p of b.pax) BUSSIM.riders.delete(p.id);
        b.pax = [];
        const since = Math.max(0, m - BUS_HOURS[0]);
        b.S = ((b.no - 1) * r.len / n2 + since * r.avgV * 0.8) % r.len;
        b.v = 0;
        b.mode = "run";
        b.t = 0;
        busNextStop(r, b, true);
        const p = busPose(r, b.S);
        b.x = p.x;
        b.y = p.y;
        b.d = p.d;
      }
    }
    for (const s of net.stops) {
      for (const p of s.queue) BUSSIM.riders.delete(p.id);
      s.queue = [];
    }
    if (g.S.onBus) busHeroAlightNearest(g, net, "運行の区切りで、最寄りの停留所で降りました");
  }
  // 次に向かう停留所(j)と、その停車位置(累積距離 tgt)
  function busNextStop(r, b, fresh) {
    const L3 = r.len;
    if (fresh) {
      const s = (b.S % L3 + L3) % L3;
      let best = 0, bd = 1e9;
      r.cycAt.forEach((a, j) => {
        const d = ((a + BUS_STOP_OFF - s) % L3 + L3) % L3;
        if (d < bd) {
          bd = d;
          best = j;
        }
      });
      b.j = best;
      b.tgt = b.S + bd;
    } else {
      const j2 = (b.j + 1) % r.cyc.length;
      let d = ((r.cycAt[j2] - r.cycAt[b.j]) % L3 + L3) % L3;
      if (!d) d = L3;
      b.j = j2;
      b.tgt += d;
    }
    b.willStop = null;
  }
  function busNeedsStop(g, r, b) {
    const s = r.cyc[b.j];
    if (b.j === 0) return true;
    if (b.pax.some((p) => p.to === s.id)) return true;
    const ob = g.S.onBus;
    if (ob && ob.bus === b.id && (ob.req || ob.to === s.id)) return true;
    if (b.pax.length < 65 && s.queue.some((p) => busServes(r, b.j, p.to))) return true;
    const w = g.S.busWait;
    if (w && w.stop === s.id && w.route === r.id) return true;
    return false;
  }
  // この先(一周以内)に行き先 to があるか
  function busServes(r, j, to) {
    for (let k = 1; k < r.cyc.length; k++) if (r.cyc[(j + k) % r.cyc.length].id === to) return true;
    return false;
  }
  function busUpdate(g, dtSim) {
    const net = busFleet(g);
    if (!net) return;
    const abs = g.absMin() + (U.clockFrac || 0), m = abs % 1440;
    busDrivers(g, net);
    if (BUSSIM.lastAbs == null || Math.abs(abs - BUSSIM.lastAbs) > 30 || !busInService(BUSSIM.lastAbs % 1440) && busInService(m)) busResync(g, net, abs);
    BUSSIM.lastAbs = abs;
    if (!busInService(m) || dtSim <= 0) return;
    busDemand(g, net, dtSim, m);
    const steps = Math.ceil(dtSim / 0.05);
    const h = dtSim / steps;
    for (let i = 0; i < steps; i++) for (const r of net.routes) for (const b of r.buses) busMove(g, net, r, b, h, m);
    for (let i = BUSSIM.alight.length - 1; i >= 0; i--) {
      const a = BUSSIM.alight[i];
      a.t += dtSim;
      a.x += a.dx * dtSim * 1.1;
      a.y += a.dy * dtSim * 1.1;
      if (a.t > 6) {
        BUSSIM.alight.splice(i, 1);
        // 通勤・通学の人は「降りた」ことを覚えておく(このあと職場・学校/家へ歩く)
        if (a.commute) BUSSIM.riders.set(a.id, { st: "arrived" });
        else BUSSIM.riders.delete(a.id);
      }
    }
  }
  function busMove(g, net, r, b, dt, m) {
    const L2 = g.S.loc, hero = L2;
    const pose = busPose(r, b.S);
    b.x = pose.x;
    b.y = pose.y;
    b.d = pose.d;
    if (b.mode === "dwell") {
      b.v = 0;
      b.t -= dt;
      b.door = Math.min(1, b.door + dt * 3);
      if (b.t <= 0) {
        b.mode = "run";
        b.door = 0;
        busNextStop(r, b, false);
        if (g.S.onBus && g.S.onBus.bus === b.id) busAnnounce(g, r, b);
      }
      return;
    }
    const ri = net.ri, W2 = ri.W, half = (r.ty === "tourbus" ? 5.5 : 5.25) / 2;
    const k0 = pose.k;
    let limit = BUS_VMAX[Math.min(4, ri.thick[k0] || 1)] || 3, why = "";
    const consider = (s, w) => {
      const v = s <= 0.1 ? 0 : Math.sqrt(2 * BUS_DEC * (s - 0.1));
      if (v < limit) {
        limit = v;
        why = w;
      }
    };
    // 停留所
    if (b.willStop == null && b.tgt - b.S < 14) b.willStop = busNeedsStop(g, r, b);
    const toStop = b.tgt - b.S;
    if (b.willStop) consider(toStop, "停留所");
    else if (toStop < 0.05) busNextStop(r, b, false);
    // 信号・横断歩道(前方8タイル)
    const near2 = Math.abs(b.x - hero.x) < 60 && Math.abs(b.y - hero.y) < 40;
    const front = b.S + half, clk = R4.time || 0, cl = junctions(g.world.map);
    for (let i = 0; i <= 20; i++) {
      const idx = Math.floor(front) + i, p = r.pts[(idx % r.len + r.len) % r.len], k = p[0] + p[1] * W2, d = p[2];
      const sFar = idx + 0.5 - front;
      if (sFar < 0.02) continue;
      if (cl.stop[k] >> d & 1) {
        const ci = cl.stopCl[k], cc = ci >= 0 ? cl.list[ci] : null;
        if (cc) {
          const st3 = signalAt(cc, clk, d % 2 === 0 ? AX.H : AX.V);
          if (st3 === "R" || st3 === "Y" && sFar > 0.8 + b.v * b.v / (2 * BUS_DEC) * 0.6) {
            consider(sFar, "信号待ち");
            // 公共車両優先(PTPS): バスが赤で待つと、交差方向の青を早めに打ち切る(信号そのものが変わるので車も表示も従う)
            if (sFar < 3 && b.v < 0.3) busPriority(cc, clk, d % 2 === 0 ? AX.H : AX.V);
          }
        }
      }
      if (near2 && cl.cwk[k]) {
        const peds = (R4.walkers || []).filter((w) => w.vis !== false);
        if (!g.S.onBus) peds.push({ x: hero.x, y: hero.y });
        if (peds.some((q2) => q2.x > p[0] - 0.35 && q2.x < p[0] + 1.35 && q2.y > p[1] - 0.35 && q2.y < p[1] + 1.35)) consider(Math.max(0, sFar - 1.1), "歩行者");
      }
    }
    // 前の車・前のバス(同じ向き・同じ車線)
    const horiz = pose.d % 2 === 0, sgn = pose.d === 0 || pose.d === 1 ? 1 : -1;
    const ahead = (o, olen, w) => {
      if (o.d !== pose.d) return;
      const op = horiz ? o.x : o.y, oc = horiz ? o.y : o.x, cc = horiz ? b.y : b.x;
      if (Math.abs(oc - cc) > 0.6) return;
      const a = (op - (horiz ? b.x : b.y)) * sgn;
      if (a <= 0) return;
      const gap = a - (olen + half * 2) / 2 - 0.4;
      if (gap < 20) consider(Math.max(0, gap + 0.1), w);
    };
    if (near2 && R4.traffic) for (const c of R4.traffic.cars) if (!c.dead) ahead(c, c.len, "渋滞");
    for (const r2 of net.routes) for (const o of r2.buses) if (o !== b && o.x != null && Math.abs(o.x - b.x) < 26 && Math.abs(o.y - b.y) < 26) ahead(o, r2.ty === "tourbus" ? 5.5 : 5.25, "前のバス");
    const v0 = b.v;
    b.v = b.v < limit ? Math.min(limit, b.v + BUS_ACC * dt) : Math.max(limit, b.v - BUS_DEC * 1.5 * dt);
    b.why = b.v < 0.3 ? why : "";
    b.brake = b.v < v0 - 1e-3;
    b.S += b.v * dt;
    r.avgV = r.avgV * (1 - dt / 600) + b.v * (dt / 600);
    if (b.willStop && b.tgt - b.S < 0.2 && b.v < 0.15) busArrive(g, net, r, b, m);
  }
  function busArrive(g, net, r, b, m) {
    const s = r.cyc[b.j];
    b.mode = "dwell";
    b.v = 0;
    let n2 = 0;
    // 降りる
    for (let i = b.pax.length - 1; i >= 0; i--) {
      const p = b.pax[i];
      if (p.to !== s.id) continue;
      b.pax.splice(i, 1);
      const ax = s.x + 0.5, ay = s.y + 0.5, ex = s.x - s.rx, ey = s.y - s.ry;
      const along = brand() < 0.5 ? 1 : -1;
      BUSSIM.alight.push({ id: p.id, x: ax, y: ay, dx: ex ? 0 : along, dy: ey ? 0 : along, t: 0, why: p.why, commute: p.commute });
      BUSSIM.riders.set(p.id, { st: "walk", stop: s, why: p.why });
      n2++;
    }
    const ob = g.S.onBus;
    if (ob && ob.bus === b.id && (ob.req || ob.to === s.id)) busHeroAlight(g, s, r);
    // 乗る
    for (let i = 0; i < s.queue.length && b.pax.length < 65; i++) {
      const p = s.queue[i];
      if (!busServes(r, b.j, p.to)) continue;
      s.queue.splice(i--, 1);
      b.pax.push(p);
      BUSSIM.riders.set(p.id, { st: "ride", bus: b, to: p.to, why: p.why });
      n2++;
    }
    const w = g.S.busWait;
    if (w && w.stop === s.id && w.route === r.id) {
      const L2 = g.S.loc;
      if (L2.k === "out" && Math.hypot(L2.x - (s.x + 0.5), L2.y - (s.y + 0.5)) < 4.5) busHeroBoard(g, s, r, b, w.to);
      else delete g.S.busWait;
    }
    b.t = 0.9 + n2 * 0.12 + (b.j === 0 ? 2.5 : 0);
    b.door = 0;
  }
  // ---- 住民の利用(通学・通勤・通院・観光)
  function busDemand(g, net, dt, m) {
    const hr = m / 60;
    busCommuteFeed(g, m);
    // 長く来ないときはあきらめて歩く
    const now = g.absMin();
    for (const s of net.stops) for (let i = s.queue.length - 1; i >= 0; i--) if (now - s.queue[i].since > 90) {
      BUSSIM.riders.delete(s.queue[i].id);
      s.queue.splice(i, 1);
    }
    for (const s of net.stops) {
      if (s.queue.filter((q) => !q.commute).length >= 8) continue;
      if (brand() < 0.5) continue;
      const base = s.kind === "terminal" ? 0.25 : s.kind === "std" ? 0.06 : 0.15;
      const rush = hr >= 7 && hr < 9.5 || hr >= 17 && hr < 19.5 ? 2.2 : hr >= 22 ? 0.3 : 1;
      if (brand() > base * rush * dt) continue;
      const pick = busPickTrip(g, s, hr);
      if (!pick) continue;
      s.queue.push(pick);
      BUSSIM.riders.set(pick.id, { st: "wait", stop: s, to: pick.to, why: pick.why });
    }
  }
  function busPickTrip(g, s, hr) {
    const dests = [];
    for (const r of s.routes) for (const t of r.stops) if (t !== s && !dests.includes(t)) dests.push(t);
    if (!dests.length) return null;
    const of = (k) => dests.filter((t) => t.kind === k);
    let why = "移動", to = null, age = [18, 75];
    const am = hr < 10, pm = hr >= 15;
    // 通勤・通学はそれぞれの住民の一日の予定から乗る(busCommute)。ここでは通院・観光・買い物・用事の利用
    if (am && of("hospital").length && brand() < 0.5) {
      why = "通院";
      to = of("hospital")[0];
      age = [65, 92];
    } else if (s.kind === "hospital" && hr >= 11) {
      why = "通院の帰り";
      to = of("terminal")[0] || dests[0];
      age = [60, 92];
    } else if (hr >= 9 && hr < 15 && of("sight").length && brand() < 0.6) {
      why = "観光";
      const t = of("sight");
      to = t[Math.floor(brand() * t.length)];
      age = [8, 75];
    } else if (s.kind === "sight" && pm) {
      why = "観光の帰り";
      to = of("terminal")[0] || dests[0];
      age = [8, 75];
    } else if (s.kind === "airport") {
      why = "旅行の帰り";
      to = of("terminal")[0] || dests[0];
    } else if (hr >= 10 && hr < 18 && dests.some((t) => /百貨店/.test(t.name)) && brand() < 0.4) {
      why = "買い物";
      to = dests.find((t) => /百貨店/.test(t.name));
      age = [16, 85];
    } else {
      if (brand() < 0.7) return null;
      why = "用事";
      to = dests[Math.floor(brand() * dests.length)];
    }
    if (!to || to === s) return null;
    const pop = g.world.pop, B2 = g.world.map.buildings;
    const near2 = (bi, p, r) => bi >= 0 && B2[bi] && Math.abs(B2[bi].doorX - p.x) + Math.abs(B2[bi].doorY - p.y) < r;
    // 住民を選ぶ: 行き・帰りの向きに合わせて「停留所の近くに住む人」「行き先の近くで働く・学ぶ人」を優先する
    const home = s.kind === "terminal" || s.kind === "std" ? s : to;
    let fallback = -1;
    for (let i = 0; i < 160; i++) {
      const id = Math.floor(brand() * pop.n);
      if (pop.gone[id] || pop.home[id] < 0 || id === g.hero.id || BUSSIM.riders.has(id) || BUSSIM.drivers && BUSSIM.drivers.has(id)) continue;
      const a = g.ageOf(id);
      if (a < age[0] || a > age[1]) continue;
      if ((why === "通学" || why === "下校") && to.kind === "univ" && pop.school[id] !== to.b && pop.school[id] >= 0) continue;
      if (why === "通勤" && pop.work[id] < 0) continue;
      if (fallback < 0) fallback = id;
      const homeOk = near2(pop.home[id], home, 90);
      const placeOk = why === "通学" ? pop.school[id] === to.b : why === "下校" ? pop.school[id] === s.b : why === "通勤" ? near2(pop.work[id], to, 90) : true;
      if (homeOk && placeOk) return { id, to: to.id, why, since: g.absMin(), local: true };
    }
    return fallback >= 0 ? { id: fallback, to: to.id, why, since: g.absMin() } : null;
  }
  // 住民の今の様子(人物情報に表示)
  function busNpcStatus(id) {
    const g = G3;
    if (!g) return null;
    const net = busNet(g.world.map);
    if (!net) return null;
    const stopName = (sid) => (net.stops.find((s) => s.id === sid) || {}).name || "";
    const dv = BUSSIM.drivers && BUSSIM.drivers.get(id);
    if (dv) {
      const m = g.S.min, b = dv.bus, now = busDriverNow(b, m) === id;
      const sh = dv.shift ? "遅番 14:30〜23:00" : "早番 6:00〜14:30";
      if (!busInService(m) || !now) return `🚌 市営バスの運転士(${sh})・いまは勤務時間外`;
      return `🚌 市営バスの運転士(${sh})・[${b.r.no}] ${b.r.name} ${b.no}号車を${b.mode === "dwell" ? b.j === 0 ? "折返し場で休憩中" : `「${b.r.cyc[b.j].name}」で停車中` : "運転中"}`;
    }
    const st3 = BUSSIM.riders.get(id);
    if (!st3) return null;
    if (st3.st === "wait") return `🚏 バス停「${st3.stop.name}」で${stopName(st3.to)}行きのバスを待っています(${st3.why})`;
    if (st3.st === "ride") return `🚌 [${st3.bus.r.no}] ${st3.bus.r.name}に乗って${stopName(st3.to)}へ(${st3.why})`;
    if (st3.st === "walk") return `🚶 バスを降りて「${st3.stop.name}」から歩いています(${st3.why})`;
    if (st3.st === "arrived") return null;
    return null;
  }
  // ---- 到着予想(実際に走っているバスの位置と平均速度から)
  function busEtas(g, r, s) {
    const m = g.S.min;
    if (!busInService(m) || !r.buses.length || r.buses[0].x == null) return [];
    const out = [];
    const js = r.cyc.map((q, j) => q === s ? j : -1).filter((j) => j >= 0);
    for (const b of r.buses) {
      let best = 1e9;
      for (const j of js) {
        const t = r.cycAt[j] + BUS_STOP_OFF;
        let d = ((t - b.S) % r.len + r.len) % r.len;
        if (b.mode === "dwell" && b.j === j) d = 0;
        const stops = r.cycAt.filter((a) => ((a + BUS_STOP_OFF - b.S) % r.len + r.len) % r.len < d).length;
        best = Math.min(best, d / Math.max(1.5, r.avgV) + stops * 0.6 + (b.mode === "dwell" ? b.t : 0));
      }
      // 実時間の秒 → ゲーム内の分(時間の流れの倍率。乗車中の早送りは時計もバスも同じ倍率)
      const k = g.S.onBus && U.scale >= 3 ? 1 : U.scale > 0 ? U.scale : 1;
      if (best < 1e8 && m + best * k <= BUS_LAST + 20) out.push(best * k);
    }
    return out.sort((a, b) => a - b);
  }
  var hhmm = (m) => `${Math.floor(m / 60 % 24)}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
  // ---- 主人公: 待つ・乗る・降りる
  function busHeroBoard(g, s, r, b, to) {
    const fare = busFare(g);
    if (g.hero.money < fare) {
      delete g.S.busWait;
      toast("運賃が足りません");
      return;
    }
    g.pay(fare, "バス運賃");
    delete g.S.busWait;
    g.S.onBus = { bus: b.id, route: r.id, from: s.id, to: to || null, req: false, t0: g.absMin() };
    if (typeof navStop === "function") navStop();
    if (typeof AW !== "undefined" && AW.active) AW.cancel();
    g.S.stats.rides = (g.S.stats.rides || 0) + 1;
    sfx.chime();
    toast(`[${r.no}] ${r.name}に乗りました(¥${fare})。${to ? "降りる停留所の手前で降車ボタンを押します" : "降車ボタンで次の停留所に停まります"}`, 3600);
    busHudUpdate(true);
  }
  function busHeroAlight(g, s, r) {
    const ob = g.S.onBus, L2 = g.S.loc;
    delete g.S.onBus;
    L2.k = "out";
    L2.x = s.x + 0.5;
    L2.y = s.y + 0.5;
    L2.f = "d";
    const mins = Math.round(g.absMin() - (ob ? ob.t0 : g.absMin()));
    const net = busNet(g.world.map), from = net.stops.find((q) => q.id === (ob && ob.from));
    g.log("bus", `[${r.no}] ${r.name}で「${from ? from.name : ""}」から「${s.name}」へ(${mins}分)`);
    U.cwAt = -999;
    toast(`「${s.name}」で降りました(乗車${mins}分)`, 3e3);
    busIn(false);
    busHudUpdate(true);
    if (g.S.ctrip) tripAfterBus(g, s);
  }
  function busHeroAlightNearest(g, net, msg) {
    const L2 = g.S.loc;
    let best = net.stops[0], bd = 1e9;
    for (const s of net.stops) {
      const d = Math.hypot(s.x - L2.x, s.y - L2.y);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    delete g.S.onBus;
    L2.k = "out";
    L2.x = best.x + 0.5;
    L2.y = best.y + 0.5;
    busIn(false);
    toast(msg, 3e3);
  }
  function busAnnounce(g, r, b) {
    const s = r.cyc[b.j], ob = g.S.onBus;
    if (ob.to === s.id && !ob.req) {
      ob.req = true;
      sfx.chime();
    }
    toast(`次は「${s.name}」です。${ob.req ? "とまります" : "お降りの方は降車ボタンでお知らせください"}`, 3200);
    busHudUpdate(true);
  }
  function busOfHero(g) {
    const ob = g.S.onBus;
    if (!ob) return null;
    const net = busNet(g.world.map), r = net && net.routes.find((q) => q.id === ob.route);
    return r ? r.buses.find((b) => b.id === ob.bus) || null : null;
  }
  // 乗車中: 主人公は車両と一緒に動く(ゲームの時計も通常どおり進む)
  function busRideStep(g, dt) {
    const b = busOfHero(g), L2 = g.S.loc;
    if (!b) {
      const net = busNet(g.world.map);
      if (net) busHeroAlightNearest(g, net, "バスを降りました");
      return;
    }
    L2.k = "out";
    L2.x = b.x;
    L2.y = b.y;
    U.clockFrac += dt * U.scale;
    while (U.clockFrac >= 1 && !g.blocked()) {
      U.clockFrac -= 1;
      g.advance(1);
    }
    busHudUpdate();
  }
  var busFare = (g) => yenf(g, g.age() < 12 ? Math.round(BUS_FARE / 2 / 10) * 10 : BUS_FARE);
  // ---- 画面: 待っている間・乗車中の表示(降車ボタン・車内を見る・早送り)
  var busHudLast = "";
  function busHudUpdate(force) {
    const el = $("busHud");
    if (!el || !G3) return;
    const g = G3, net = busNet(g.world.map);
    let html = "";
    if (net && g.S.onBus) {
      const b = busOfHero(g);
      if (b) {
        const r = b.r, s = r.cyc[b.j], ob = g.S.onBus;
        const sname = (id) => (net.stops.find((q) => q.id === id) || {}).name;
        html = `<div class="bh-t" style="border-color:${r.color}"><b style="background:${r.color}">${r.no}</b> ${esc4(r.name)} ${esc4(r.dest)}行</div><div class="bh-n">${b.mode === "dwell" ? "停車中" : "次は"} <b>${esc4(s.name)}</b>${ob.req ? ' <span class="bh-req">とまります</span>' : ""}</div><div class="bh-s">${ob.to ? `降りる停留所: ${esc4(sname(ob.to))}・` : ""}乗客${b.pax.length + 1}人・${b.v > 0.3 ? "走行中" : b.why || "停車中"}</div><div class="bh-b"><button data-a="req" ${ob.req ? "disabled" : ""}>🔔 降車ボタン</button><button data-a="in">${$("busIn").classList.contains("on") ? "🏙 車外" : "🪟 車内"}</button><button data-a="ff">${U.scale >= 3 ? "▶ 通常" : "⏩ 早送り"}</button></div>`;
      }
    } else if (net && g.S.busWait) {
      const w = g.S.busWait, s = net.stops.find((q) => q.id === w.stop), r = net.routes.find((q) => q.id === w.route);
      if (s && r) {
        const e = busEtas(g, r, s);
        const t = (net.stops.find((q) => q.id === w.to) || {}).name || "";
        html = `<div class="bh-t" style="border-color:${r.color}"><b style="background:${r.color}">${r.no}</b> ${esc4(r.name)} を待っています</div><div class="bh-n">${e.length ? `次のバス あと約<b>${Math.max(1, Math.round(e[0]))}分</b>(${hhmm(g.S.min + e[0])}ごろ)` : "本日の運行は終了しました"}</div><div class="bh-s">「${esc4(s.name)}」→「${esc4(t)}」・¥${busFare(g)}・その場を離れると取り消し</div><div class="bh-b"><button data-a="ff">${U.scale >= 3 ? "▶ 通常" : "⏩ 早送り"}</button><button data-a="cancel">やめる</button></div>`;
      }
    }
    if (!html && g.S.ctrip) html = tripHudHtml(g);
    if (html === busHudLast && !force) return;
    busHudLast = html;
    el.innerHTML = html;
    el.style.display = html ? "" : "none";
  }
  function busIn(on2) {
    const el = $("busIn");
    if (!el) return;
    el.classList.toggle("on", !!on2);
  }
  (function wireBus() {
    const st = document.createElement("style");
    st.textContent = `#busHud{position:absolute;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:7;display:none;background:#0d1a33ee;border:1px solid #7fb3ff;border-radius:12px;padding:6px 10px;color:#fff;font-size:13px;min-width:min(330px,92vw);max-width:94vw}
#busHud .bh-t{border-left:5px solid;padding-left:6px;font-weight:bold}#busHud .bh-t b{color:#fff;border-radius:4px;padding:0 5px;margin-right:4px}
#busHud .bh-n{font-size:15px;margin:2px 0}#busHud .bh-n b{color:#ffd54a}#busHud .bh-req{background:#e53935;border-radius:4px;padding:0 6px;font-size:12px}
#busHud .bh-s{font-size:11px;opacity:.85}#busHud .bh-b{display:flex;gap:6px;margin-top:5px}#busHud .bh-b button{flex:1;min-height:40px;border:0;border-radius:10px;background:#28477e;color:#fff;font-size:14px}
#busHud .bh-b button[data-a=req]{background:#c62828}#busHud .bh-b button:disabled{opacity:.5}
#busIn{position:absolute;inset:0;z-index:5;display:none}#busIn.on{display:block}#busIn canvas{width:100%;height:100%}`;
    document.head.appendChild(st);
    const hud = document.createElement("div");
    hud.id = "busHud";
    $("app").appendChild(hud);
    const inn = document.createElement("div");
    inn.id = "busIn";
    inn.innerHTML = '<canvas id="busInCv"></canvas>';
    $("app").appendChild(inn);
    hud.addEventListener("click", (e) => {
      const a = e.target.closest("button")?.dataset.a;
      if (!a || !G3) return;
      e.stopPropagation();
      if (a === "req" && G3.S.onBus) {
        G3.S.onBus.req = true;
        sfx.chime();
        toast("ピンポーン 次、とまります", 1800);
      }
      if (a === "in") busIn(!$("busIn").classList.contains("on"));
      if (a === "ff") {
        U.scale = U.scale >= 3 ? 1 : 3;
        document.querySelectorAll("#tctl button").forEach((b) => b.classList.toggle("on", +b.dataset.s === U.scale));
      }
      if (a === "tripstop") tripStop(G3, "乗換案内をやめました");
      if (a === "cancel") {
        delete G3.S.busWait;
        toast("バスを待つのをやめました", 1600);
      }
      busHudUpdate(true);
    });
    setInterval(() => {
      if (!G3) return;
      const w = G3.S.busWait, L2 = G3.S.loc;
      if (w) {
        const net = busNet(G3.world.map), s = net && net.stops.find((q) => q.id === w.stop);
        if (!s || L2.k !== "out" || Math.hypot(L2.x - (s.x + 0.5), L2.y - (s.y + 0.5)) > 4.5) {
          delete G3.S.busWait;
          toast("バス停を離れたので、バスを待つのをやめました", 2200);
        }
      }
      if (!G3.S.onBus) busIn(false);
      busHudUpdate();
      tripTick(G3);
    }, 300);
    // 車内の眺め: 実際のバスの速さで窓の外が流れ、停車中は止まる
    let off = 0, lastT = performance.now();
    const loop = () => {
      requestAnimationFrame(loop);
      const now = performance.now(), dt = Math.min(0.1, (now - lastT) / 1e3);
      lastT = now;
      if (!inn.classList.contains("on") || !G3) return;
      const b = busOfHero(G3);
      if (!b) return;
      const cv2 = $("busInCv"), W2 = cv2.width = cv2.clientWidth * (devicePixelRatio || 1), H4 = cv2.height = cv2.clientHeight * (devicePixelRatio || 1);
      off += b.v * dt * (U.scale || 0) * W2 * 0.05;
      busInteriorDraw(cv2.getContext("2d"), W2, H4, b, off, G3);
    };
    requestAnimationFrame(loop);
  })();
  function busInteriorDraw(c, W2, H4, b, off, g) {
    const r = b.r, night = g.S.min >= 18 * 60 || g.S.min < 5 * 60;
    const gr = c.createLinearGradient(0, 0, 0, H4);
    gr.addColorStop(0, night ? "#0b1230" : "#8cc8f0");
    gr.addColorStop(1, night ? "#1d2440" : "#dff1fb");
    c.fillStyle = gr;
    c.fillRect(0, 0, W2, H4);
    const span = W2 * 3.6;
    for (let i = 0; i < 32; i++) {
      const bw = W2 * 0.11, x = ((i * bw * 1.12 - off) % span + span) % span - bw;
      const bh = H4 * (0.16 + (i * 37 % 9) / 32);
      c.fillStyle = night ? "#232a45" : ["#b9c2cc", "#d7c8b6", "#a8b6c4", "#c9b8a8"][i % 4];
      c.fillRect(x, H4 * 0.6 - bh, bw, bh);
      c.fillStyle = night ? "#ffe08a" : "rgba(255,255,255,.5)";
      for (let k = 0; k < 6; k++) c.fillRect(x + 6 + k % 2 * bw * 0.5, H4 * 0.6 - bh + 8 + (k >> 1) * 14, 6, 6);
    }
    c.fillStyle = "#e8e3d8";
    c.fillRect(0, 0, W2, H4 * 0.12);
    c.fillRect(0, H4 * 0.6, W2, H4 * 0.4);
    for (let k = 0; k < 5; k++) c.fillRect(k * W2 / 4 - W2 * 0.01, 0, W2 * 0.02, H4 * 0.6);
    // 座席と乗客(実際に乗っている住民)
    const seats = 8;
    for (let k = 0; k < seats; k++) {
      const x = W2 * (0.04 + k * 0.12);
      c.fillStyle = r.id === "1" ? "#3b3f7a" : "#2f5aa8";
      c.fillRect(x, H4 * 0.72, W2 * 0.1, H4 * 0.16);
      c.fillStyle = r.id === "1" ? "#2b2f5e" : "#24488a";
      c.fillRect(x, H4 * 0.6, W2 * 0.1, H4 * 0.13);
      const p = b.pax[k];
      if (p) {
        const look = g.world.pop.look[p.id];
        const cx = x + W2 * 0.05, cy = H4 * 0.74;
        // 本体の人物合成を使う(着替え画面のプレビューと同じ方法: 一時的に描画倍率を上げ、座った姿勢で描く)
        const keep = R4.S;
        try {
          beginFrame(6);
          R4.S = Math.max(3, Math.floor(H4 / 70));
          R4.drawChar(c, cx, cy, look, g.ageOf(p.id), "d", false, { id: p.id, pose: "sit", poseK: 1, seatPx: H4 * 0.05 });
        } catch (_) {
        }
        R4.S = keep;
      }
    }
    // つり革(加減速で揺れる)
    c.strokeStyle = "#999";
    c.lineWidth = Math.max(2, H4 / 200);
    const sw = (b.brake ? 1 : -0.4) * Math.min(1, b.v / 3) * H4 * 0.02;
    for (let k = 0; k < 9; k++) {
      const x = W2 * (0.06 + k * 0.11);
      c.beginPath();
      c.moveTo(x, H4 * 0.12);
      c.lineTo(x + sw, H4 * 0.22);
      c.stroke();
      c.beginPath();
      c.arc(x + sw, H4 * 0.24, H4 * 0.02, 0, 7);
      c.stroke();
    }
    // 車内表示器(次の停留所)・降車ボタンの点灯
    const s = r.cyc[b.j], ob = g.S.onBus;
    c.fillStyle = "#111";
    c.fillRect(W2 * 0.28, H4 * 0.015, W2 * 0.44, H4 * 0.09);
    c.fillStyle = "#ffb300";
    c.font = `bold ${Math.round(H4 * 0.045)}px ${SIGN_FONT}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(`${b.mode === "dwell" ? "" : "つぎは "}${s.name}`, W2 / 2, H4 * 0.06);
    c.fillStyle = ob && ob.req ? "#ff3d3d" : "#5a2020";
    c.fillRect(W2 * 0.75, H4 * 0.03, W2 * 0.12, H4 * 0.06);
    c.fillStyle = "#fff";
    c.font = `bold ${Math.round(H4 * 0.03)}px ${SIGN_FONT}`;
    c.fillText("とまります", W2 * 0.81, H4 * 0.06);
    c.fillStyle = r.color;
    c.fillRect(0, H4 * 0.115, W2, H4 * 0.012);
  }
  // ---- 描画: バス本体(日本の路線バス: 白い車体・系統色の帯・行先表示・前扉と中扉・窓ごしの乗客)
  function drawJBus(c, P2, Z, b) {
    const r = b.r, tour = r.ty === "tourbus", L3 = (tour ? 11 : 10.5) / 4, Wt = 1.25, Hm = tour ? 3.4 : 3.1;
    const d = b.d, fw = [DX[d], DY[d]], lf = [DY[d], -DX[d]];
    const night2 = G3 && (G3.S.min >= 18 * 60 || G3.S.min < 5 * 60);
    const pt = (t, s, z) => {
      const u = b.x + fw[0] * t + lf[0] * s, v = b.y + fw[1] * t + lf[1] * s;
      return [P2.X(u, v), P2.Y(u, v, z)];
    };
    const poly = (ps, fill) => {
      c.beginPath();
      c.moveTo(...ps[0]);
      for (let i = 1; i < ps.length; i++) c.lineTo(...ps[i]);
      c.closePath();
      c.fillStyle = fill;
      c.fill();
    };
    const shade = (hex, k) => {
      const n2 = parseInt(hex.slice(1), 16);
      return `rgb(${(n2 >> 16) * k | 0},${(n2 >> 8 & 255) * k | 0},${(n2 & 255) * k | 0})`;
    };
    const col = r.color, white = "#f3f4ef";
    // 影
    poly([pt(L3, Wt / 2 + 0.1, 0), pt(L3, -Wt / 2 - 0.1, 0), pt(-L3, -Wt / 2 - 0.1, 0), pt(-L3, Wt / 2 + 0.1, 0)], "rgba(0,0,0,0.22)");
    const vis = (n2) => n2[0] + n2[1] > 0;
    // 側面(sgn>0 が左側=歩道側で扉がある)
    const side = (sgn) => {
      const s = sgn * Wt / 2, nv = sgn > 0 ? lf : [-lf[0], -lf[1]], k = nv[0] > 0 ? 0.96 : 0.82;
      const q = (t0, t1, z0, z1, f) => poly([pt(t0, s, z0), pt(t1, s, z0), pt(t1, s, z1), pt(t0, s, z1)], f);
      q(-L3, L3, 0.3, Hm, shade(white, k));
      q(-L3, L3, 0.3, 0.95, shade(col, k));
      q(-L3, L3, 1.22, 1.32, shade(col, k));
      if (!tour) q(-L3 + 0.1, -L3 + 1.1, 0.95, 1.22, shade(col, k * 0.9));
      // 窓の帯と乗客
      q(-L3 + 0.15, L3 - 0.25, 1.4, 2.55, night2 ? "#4a5a6a" : "#203040");
      if (!night2) q(-L3 + 0.15, L3 - 0.25, 2.25, 2.55, "rgba(255,255,255,0.12)");
      const nP = Math.min(14, b.pax.length + (b.hero ? 1 : 0));
      for (let i = 0; i < nP; i++) {
        const t = -L3 + 0.35 + i * 0.36 % (2 * L3 - 0.7);
        const [hx, hy] = pt(t, s, 1.95);
        c.fillStyle = b.hero && i === 0 ? "#ffd54a" : ["#e9c9a8", "#d9b08c", "#f2d2b6"][i % 3];
        c.beginPath();
        c.arc(hx, hy, 1.6 * Z, 0, 7);
        c.fill();
        c.fillStyle = ["#2c3e66", "#7a2a2a", "#3d6b3d", "#666", "#b07b2a"][i % 5];
        c.fillRect(hx - 2 * Z, hy + 1.4 * Z, 4 * Z, 3 * Z);
      }
      for (let t = -L3 + 0.6; t < L3 - 0.3; t += 0.62) q(t, t + 0.06, 1.4, 2.55, shade(white, k * 0.9));
      if (sgn > 0) {
        // 前扉・中扉(停車中は開く)
        for (const [t0, t1] of [[L3 - 0.75, L3 - 0.35], [-0.25, 0.2]]) {
          q(t0, t1, 0.3, 2.5, b.door > 0.2 ? "#2a2f36" : shade("#5b6b7a", k));
          if (b.door <= 0.2) q((t0 + t1) / 2 - 0.02, (t0 + t1) / 2 + 0.02, 0.3, 2.5, "#333");
        }
      }
      // 側面の行先表示
      q(-L3 + 1.2, -L3 + 1.75, 2.6, 2.95, "#141414");
      q(-L3 + 1.25, -L3 + 1.7, 2.72, 2.83, "#ffa000");
      // 車輪
      for (const t of [L3 - 0.6, -L3 + 0.75]) {
        const [wx, wy] = pt(t, s, 0.45);
        c.fillStyle = "#1b1b1b";
        c.beginPath();
        c.ellipse(wx, wy, 4.4 * Z, 5.4 * Z, 0, 0, 7);
        c.fill();
        c.fillStyle = "#9aa0a6";
        c.beginPath();
        c.ellipse(wx, wy, 2 * Z, 2.5 * Z, 0, 0, 7);
        c.fill();
      }
    };
    // 前面・後面
    const end = (front) => {
      const t = front ? L3 : -L3, n2 = front ? fw : [-fw[0], -fw[1]], k = n2[0] > 0 ? 0.96 : 0.84;
      const q = (s0, s1, z0, z1, f) => poly([pt(t, s0, z0), pt(t, s1, z0), pt(t, s1, z1), pt(t, s0, z1)], f);
      q(-Wt / 2, Wt / 2, 0.3, Hm, shade(white, k));
      q(-Wt / 2, Wt / 2, 0.3, 0.75, shade(col, k));
      if (front) {
        q(-Wt / 2 + 0.06, Wt / 2 - 0.06, 1, 2.5, night2 ? "#2d3d4e" : "#1d2b3a");
        q(-Wt / 2 + 0.1, Wt / 2 - 0.1, 2.58, 3, "#111");
        const [lx, ly] = pt(t, 0, 2.79);
        c.fillStyle = "#ffa000";
        c.font = `bold ${Math.max(6, 2.6 * Z)}px ${SIGN_FONT}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(`${r.no} ${r.dest}`.slice(0, 6), lx, ly);
        for (const s of [-Wt / 2 + 0.18, Wt / 2 - 0.18]) {
          const [hx, hy] = pt(t, s, 0.62);
          c.fillStyle = night2 ? "#fff8d0" : "#e8eef2";
          c.beginPath();
          c.arc(hx, hy, 1.5 * Z, 0, 7);
          c.fill();
        }
      } else {
        q(-Wt / 2 + 0.2, Wt / 2 - 0.2, 1.7, 2.5, "#1d2b3a");
        q(-Wt / 2 + 0.25, Wt / 2 - 0.25, 2.6, 2.95, "#111");
        for (const s of [-Wt / 2 + 0.12, Wt / 2 - 0.12]) {
          const [hx, hy] = pt(t, s, 0.9);
          c.fillStyle = b.brake || b.v < 0.05 ? "#ff3030" : "#a02020";
          c.fillRect(hx - 1.2 * Z, hy - 2.4 * Z, 2.4 * Z, 4.8 * Z);
        }
      }
    };
    if (!vis(fw)) end(true);
    if (vis(fw)) end(false);
    for (const sgn of [1, -1]) if (vis(sgn > 0 ? lf : [-lf[0], -lf[1]])) side(sgn);
    if (vis(fw)) end(true);
    else end(false);
    // 屋根と冷房装置
    poly([pt(L3, Wt / 2, Hm), pt(L3, -Wt / 2, Hm), pt(-L3, -Wt / 2, Hm), pt(-L3, Wt / 2, Hm)], "#fbfbf8");
    poly([pt(L3 * 0.3, Wt / 3, Hm + 0.28), pt(L3 * 0.3, -Wt / 3, Hm + 0.28), pt(-L3 * 0.5, -Wt / 3, Hm + 0.28), pt(-L3 * 0.5, Wt / 3, Hm + 0.28)], "#d9dcdf");
    poly([pt(L3 - 0.03, Wt / 2, Hm + 0.01), pt(L3 - 0.03, -Wt / 2, Hm + 0.01), pt(L3 - 0.3, -Wt / 2, Hm + 0.01), pt(L3 - 0.3, Wt / 2, Hm + 0.01)], col);
  }
  // 屋外の描画に加える: バス・停留所・待つ人・降りた人
  function facOutdoor(R5, hero, push, P2, Z) {
    const g = R5.g, net = busFleet(g);
    if (!net) return;
    const m = g.S.min, run = busInService(m);
    const ob = g.S.onBus;
    let heroBus = null;
    if (run) for (const r of net.routes) for (const b of r.buses) {
      if (b.x == null || Math.abs(b.x - hero.x) > 46 || Math.abs(b.y - hero.y) > 46) continue;
      b.hero = !!(ob && ob.bus === b.id);
      const L3 = (r.ty === "tourbus" ? 11 : 10.5) / 4, hl = b.d % 2 === 0 ? L3 : 0.62, hw = b.d % 2 === 0 ? 0.62 : L3;
      const xs = [P2.X(b.x - hl, b.y + hw), P2.X(b.x + hl, b.y - hw)], ys = [P2.Y(b.x - hl, b.y - hw, 3.8), P2.Y(b.x + hl, b.y + hw, 0)];
      const it = push(b.x - hl, b.y - hw, b.x + hl, b.y + hw, Math.min(...xs) - 4 * Z, Math.max(...xs) + 4 * Z, Math.min(...ys) - 4 * Z, Math.max(...ys) + 4 * Z, (c) => drawJBus(c, P2, Z, b), null, { isV: true });
      if (b.hero && it) heroBus = it;
    }
    for (const s of net.stops) {
      if (Math.abs(s.x - hero.x) > 34 || Math.abs(s.y - hero.y) > 34) continue;
      const u = s.x + 0.5, v = s.y + 0.5, wide = s.kind === "terminal" ? 2.2 : s.kind === "univ" || s.kind === "airport" ? 1.6 : 1;
      push(s.x - wide, s.y - 0.5, s.x + 1 + wide, s.y + 1, P2.X(u - wide - 2, v + 2) - 30 * Z, P2.X(u + wide + 2, v - 2) + 30 * Z, P2.Y(u, v, 4.5) - 30 * Z, P2.Y(u, v, 0) + 30 * Z, (c) => drawBusStopJ(c, P2, Z, s, R5, run, wide));
    }
    // 駅前のタクシーのりば: 客待ちのタクシーが歩道側の乗り場に並ぶ(日中多め・深夜少なめ)
    if (R5._pushVeh) for (const s of net.stops) {
      if (s.kind !== "terminal" || Math.abs(s.x - hero.x) > 34 || Math.abs(s.y - hero.y) > 34) continue;
      const map2 = g.world.map, ex = s.rx - s.x, ey = s.ry - s.y, ax = ey ? 1 : 0, ay = ex ? 1 : 0;
      const n2 = m >= 7 * 60 && m < 23 * 60 ? 3 : 1;
      for (let k = 0; k < n2; k++) {
        const t = -5.2 - k * 2.6, cx = s.x + 0.5 + ax * t, cy = s.y + 0.5 + ay * t;
        const tx = Math.floor(cx), ty = Math.floor(cy);
        let ok = true;
        for (const q of [-1, 0, 1]) {
          const kk = tx + ax * q + (ty + ay * q) * map2.W;
          if (map2.solid[kk] || map2.bid[kk] >= 0 || [T.ROAD, T.CROSSING, T.WATER, T.RAIL].includes(map2.ground[kk])) ok = false;
        }
        if (!ok) break;
        R5._pushVeh(cx, cy, ax ? 2 : 3, "taxi", g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : 2, 8, LEN_M.taxi / 2, { parked: true, moving: false });
      }
    }
    for (const a of BUSSIM.alight) {
      if (Math.abs(a.x - hero.x) > 30 || Math.abs(a.y - hero.y) > 30) continue;
      const X = P2.X(a.x, a.y), Y2 = P2.Y(a.x, a.y);
      push(a.x - 0.2, a.y - 0.2, a.x + 0.2, a.y + 0.2, X - 9 * Z, X + 9 * Z, Y2 - 26 * Z, Y2 + 3 * Z, (c) => {
        try {
          R5.drawChar(c, X, Y2, g.world.pop.look[a.id], g.ageOf(a.id), worldDirToFacing(a.dx, a.dy, "d"), true, { id: a.id });
        } catch (_) {
        }
      });
    }
    return heroBus;
  }
  function drawBusStopJ(c, P2, Z, s, R5, run, wide) {
    const g = R5.g, PX = (a, b, z) => [P2.X(a, b), P2.Y(a, b, z)];
    const u = s.x + 0.5, v = s.y + 0.5;
    // 道路と平行な軸 (ax,ay) と、道路から離れる向き(-ex,-ey)
    const ex = s.rx - s.x, ey = s.ry - s.y, ax = ey ? 1 : 0, ay = ex ? 1 : 0;
    const P = (t, n2, z) => PX(u + ax * t - ex * n2, v + ay * t - ey * n2, z);
    const poly = (ps, f) => {
      c.beginPath();
      c.moveTo(...ps[0]);
      ps.slice(1).forEach((p) => c.lineTo(...p));
      c.closePath();
      c.fillStyle = f;
      c.fill();
    };
    // 乗り場の床と点字ブロック
    poly([P(-wide - 0.4, -0.45, 0.02), P(wide + 0.4, -0.45, 0.02), P(wide + 0.4, 0.45, 0.02), P(-wide - 0.4, 0.45, 0.02)], s.kind === "terminal" ? "#c9c3b5" : "#cfcac0");
    poly([P(-wide - 0.4, -0.43, 0.03), P(wide + 0.4, -0.43, 0.03), P(wide + 0.4, -0.33, 0.03), P(-wide - 0.4, -0.33, 0.03)], "#f2c230");
    // 上屋(奥の壁=広告つきガラス、屋根)
    const rh = 2.5, back = 0.42;
    poly([P(-wide, back, 0), P(wide, back, 0), P(wide, back, rh), P(-wide, back, rh)], "rgba(150,190,215,0.45)");
    if (s.kind !== "airport") poly([P(-wide * 0.8, back - 0.01, 0.6), P(-wide * 0.2, back - 0.01, 0.6), P(-wide * 0.2, back - 0.01, 2), P(-wide * 0.8, back - 0.01, 2)], s.kind === "hospital" ? "#e3f2fd" : "#fff3c4");
    for (const t of [-wide, wide]) poly([P(t - 0.05, back, 0), P(t + 0.05, back, 0), P(t + 0.05, back, rh), P(t - 0.05, back, rh)], "#6b7280");
    poly([P(-wide - 0.1, back + 0.08, rh), P(wide + 0.1, back + 0.08, rh), P(wide + 0.1, -0.25, rh + 0.15), P(-wide - 0.1, -0.25, rh + 0.15)], s.kind === "terminal" ? "#8a95a3" : "rgba(120,150,175,0.85)");
    // ベンチ(病院前は手すり付き)
    poly([P(-wide * 0.7, back - 0.05, 0.45), P(wide * 0.7, back - 0.05, 0.45), P(wide * 0.7, back - 0.3, 0.45), P(-wide * 0.7, back - 0.3, 0.45)], "#8d6e4f");
    if (s.kind === "hospital") for (const t of [-wide * 0.72, wide * 0.72]) poly([P(t - 0.04, back - 0.2, 0), P(t + 0.04, back - 0.2, 0), P(t + 0.04, back - 0.2, 0.75), P(t - 0.04, back - 0.2, 0.75)], "#c0c4c8");
    // 待っている住民(本当に乗る人たち)
    if (run) {
      const q = s.queue.slice(0, 7);
      q.forEach((p, k) => {
        const [x, y] = P(-wide * 0.6 + k * (wide * 1.3 / Math.max(1, q.length - 1)), -0.05 - k % 2 * 0.12, 0);
        try {
          R5.drawChar(c, x, y, g.world.pop.look[p.id], g.ageOf(p.id), worldDirToFacing(ex, ey, "d"), false, { id: p.id });
        } catch (_) {
        }
      });
    }
    // 標柱(丸い看板に系統色の輪・時刻表)
    const [px0, py0] = P(wide + 0.55, -0.3, 0), [px1, py1] = P(wide + 0.55, -0.3, 3.4);
    c.fillStyle = "#d8dce0";
    c.fillRect(px0 - 0.6 * Z, py1, 1.2 * Z, py0 - py1);
    c.fillStyle = "#fff";
    c.fillRect(px0 - 2.6 * Z, py0 - 1.6 * 12 * Z, 5.2 * Z, 6 * Z);
    c.fillStyle = "#333";
    for (let i = 0; i < 4; i++) c.fillRect(px0 - 2 * Z, py0 - 1.6 * 12 * Z + (1 + i * 1.3) * Z, 4 * Z, 0.5 * Z);
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(px1, py1, 5 * Z, 0, 7);
    c.fill();
    s.routes.forEach((r, i, a) => {
      c.strokeStyle = r.color;
      c.lineWidth = 1.6 * Z;
      c.beginPath();
      c.arc(px1, py1, 4.2 * Z, i / a.length * 6.283 - 1.57, (i + 1) / a.length * 6.283 - 1.57);
      c.stroke();
    });
    c.fillStyle = "#1b3a6b";
    c.font = `bold ${Math.max(6, 2.7 * Z)}px ${SIGN_FONT}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("バス", px1, py1 + 0.2 * Z);
    // 駅前: タクシーのりばの看板
    if (s.kind === "terminal") {
      const [tx0, ty0] = P(-wide - 1.2, -0.3, 0), [tx1, ty1] = P(-wide - 1.2, -0.3, 3);
      c.fillStyle = "#d8dce0";
      c.fillRect(tx0 - 0.5 * Z, ty1, Z, ty0 - ty1);
      c.fillStyle = "#1d2a5a";
      c.fillRect(tx1 - 7 * Z, ty1 - 3 * Z, 14 * Z, 5 * Z);
      c.fillStyle = "#ffd54a";
      c.font = `bold ${Math.max(6, 2.3 * Z)}px ${SIGN_FONT}`;
      c.fillText("タクシー", tx1, ty1 - 0.5 * Z);
    }
  }
  // 建物に隠れても分かる停留所の名札・バスの行先(最前面)
  function drawBusOverlay(R5, c, P2, hero, g) {
    if (R5.auditFocus != null) return;
    const net = busNet(g.world.map);
    if (!net || !BUSSIM.map) return;
    const Z = P2.Z;
    for (const s of net.stops) {
      const d = Math.hypot(s.x - hero.x, s.y - hero.y);
      if (d > 26) continue;
      const x = P2.X(s.x + 0.5, s.y + 0.5), y = P2.Y(s.x + 0.5, s.y + 0.5, 4.6);
      const label = s.kind === "terminal" ? `🚏 ${s.name} バスターミナル` : s.kind === "airport" ? "🚏 空港バスのりば" : `🚏 ${s.name}`;
      c.save();
      c.font = `bold ${Math.max(11, 4.4 * Z)}px ${SIGN_FONT}`;
      const tw = c.measureText(label).width, h = Math.max(15, 6 * Z);
      c.globalAlpha = Math.max(0.35, Math.min(1, (26 - d) / 8));
      c.fillStyle = "rgba(255,255,255,0.95)";
      c.fillRect(x - tw / 2 - 6, y - h, tw + 12, h);
      let bx = x - tw / 2 - 6;
      const bw = (tw + 12) / s.routes.length;
      for (const r of s.routes) {
        c.fillStyle = r.color;
        c.fillRect(bx, y - 3, bw, 3);
        bx += bw;
      }
      c.fillStyle = "#123";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(label, x, y - h / 2 - 1);
      if (d < 9) {
        const lines = s.routes.map((r) => {
          const e = busEtas(g, r, s);
          return `${r.no} ${r.name} ${e.length ? "あと" + Math.max(1, Math.round(e[0])) + "分" : "運行終了"}`;
        });
        c.font = `${Math.max(10, 3.6 * Z)}px ${SIGN_FONT}`;
        const lw = Math.max(...lines.map((l) => c.measureText(l).width)) + 10, lh = Math.max(13, 5 * Z);
        c.fillStyle = "rgba(13,26,51,0.88)";
        c.fillRect(x - lw / 2, y + 2, lw, lh * lines.length + 4);
        lines.forEach((l, i) => {
          c.fillStyle = s.routes[i].color;
          c.fillRect(x - lw / 2, y + 4 + i * lh, 4, lh - 2);
          c.fillStyle = "#fff";
          c.fillText(l, x, y + 4 + lh / 2 + i * lh);
        });
      }
      c.restore();
    }
    if (busInService(g.S.min)) for (const r of net.routes) for (const b of r.buses) {
      if (b.x == null || Math.abs(b.x - hero.x) > 16 || Math.abs(b.y - hero.y) > 16) continue;
      const x = P2.X(b.x, b.y), y = P2.Y(b.x, b.y, 4.4);
      const label = `${r.no} ${r.dest}行${b.mode === "dwell" ? " 停車中" : ""}`;
      c.save();
      c.font = `bold ${Math.max(10, 3.6 * Z)}px ${SIGN_FONT}`;
      const tw = c.measureText(label).width, hh = Math.max(14, 5 * Z);
      c.fillStyle = r.color;
      c.globalAlpha = 0.92;
      c.fillRect(x - tw / 2 - 5, y - 8 - 2 * Z, tw + 10, hh);
      c.fillStyle = "#fff";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(label, x, y - 8 - 2 * Z + hh / 2);
      c.restore();
    }
  }
  // ---- 停留所の操作
  function facOutdoorTargets(g, L2) {
    const net = busNet(g.world.map);
    if (!net) return [];
    const out = typeof zooOutdoorTargets === "function" ? zooOutdoorTargets(g, L2) : [];
    for (const s of net.stops) if (Math.abs(s.x + 0.5 - L2.x) < 2.6 && Math.abs(s.y + 0.5 - L2.y) < 2.6) {
      out.push({ kind: "fx", act: "fx_busstop", x: s.x, y: s.y, stop: s, label: `バス停「${s.name}」` });
      if (s.kind === "terminal") out.push({ kind: "fx", act: "fx_taxistand", x: s.x, y: s.y, stop: s, label: "タクシーのりば" });
    }
    return out;
  }
  FAC_ACTS.fx_taxistand = (g, o, b, push) => {
    push("taxistand", "タクシーに乗る(行き先を選ぶ)");
  };
  FAC_RUN.taxistand = (g, arg, tg, r) => {
    r.ui = "taxistand";
  };
  FAC_ACTS.fx_busstop = (g, o, b, push) => {
    const s = o.stop, m = g.S.min, fare = busFare(g);
    if (m >= BUS_LAST || m < BUS_HOURS[0]) push("none", "本日のバスは終了しました(始発 6:00ごろ・最終 22:30ごろ)", { disabled: true });
    else for (const r of s.routes) {
      const e = busEtas(g, r, s);
      const i0 = r.cyc.indexOf(s);
      const seen = /* @__PURE__ */ new Set();
      for (let k = 1; k < r.cyc.length; k++) {
        const d = r.cyc[(i0 + k) % r.cyc.length];
        if (d === s || seen.has(d.id)) continue;
        seen.add(d.id);
        push(`busgo:${r.id}:${s.id}:${d.id}`, `[${r.no}] ${r.name} → ${d.name}(¥${fare}・次のバス約${e.length ? Math.max(1, Math.round(e[0])) : "-"}分)`, { disabled: g.hero.money < fare || !e.length });
      }
    }
    push("busmap", "🗺 路線図・時刻表・乗換案内");
  };
  FAC_RUN.busmap = (g, arg, tg, r) => {
    r.ui = "busmap";
  };
  FAC_RUN.busgo = (g, arg, tg, r) => {
    const [rid, fid, tid] = String(arg).split(":");
    const net = busNet(g.world.map);
    const route = net.routes.find((q) => q.id === rid), from = net.stops.find((q) => q.id === fid);
    if (!route || !from) return r.msg = "その系統はありません";
    g.S.busWait = { stop: from.id, route: route.id, to: tid };
    const e = busEtas(g, route, from);
    r.msg = `[${route.no}] ${route.name}を待ちます。次のバスはあと約${e.length ? Math.max(1, Math.round(e[0])) : "-"}分です`;
    busHudUpdate(true);
  };
  function busPriority(cc, t, axis) {
    const p = ((t + cc.off) % SIG.cycle + SIG.cycle) % SIG.cycle;
    const cross = axis === AX.H ? (p + SIG.cycle / 2) % SIG.cycle : p;
    // 交差方向が青の途中なら、いまを「交差方向の黄色の始まり」にずらす(黄→全赤→こちらが青)
    if (cross < SIG.hG - 1) cc.off = ((SIG.hG - (axis === AX.H ? SIG.cycle / 2 : 0) - t) % SIG.cycle + SIG.cycle) % SIG.cycle;
  }
  // 一般の車から見た障害物(バスの前に割り込まない・追突しない)
  function busObstacles(g, hero) {
    const net = busNet(g.world.map);
    if (!net || !BUSSIM.map || !busInService(g.S.min)) return [];
    const out = [];
    for (const r of net.routes) for (const b of r.buses) if (b.x != null && Math.abs(b.x - hero.x) < 70 && Math.abs(b.y - hero.y) < 50) out.push(b);
    return out;
  }
  // 小さな地図(ミニマップ・全体地図)に路線バスの系統色を描く
  function drawBusRoutesMini(g, x, sc, f2) {
    const net = busNet(g.world.map);
    if (!net) return;
    x.save();
    x.lineWidth = Math.max(1, 1.6 * f2);
    x.setLineDash([Math.max(2, 3 * f2), Math.max(2, 2 * f2)]);
    for (const r of net.routes) {
      x.strokeStyle = r.color;
      x.beginPath();
      for (let i = 0; i < r.pts.length; i += 2) {
        const px2 = r.pts[i][0] * sc + sc / 2, py = r.pts[i][1] * sc + sc / 2;
        i ? x.lineTo(px2, py) : x.moveTo(px2, py);
      }
      x.stroke();
    }
    x.setLineDash([]);
    for (const s of net.stops) {
      x.fillStyle = "#fff";
      x.strokeStyle = (s.routes[0] || {}).color || "#e53935";
      x.lineWidth = 1.5;
      x.beginPath();
      x.arc(s.x * sc + sc / 2, s.y * sc + sc / 2, Math.max(2, 2.5 * f2), 0, 7);
      x.fill();
      x.stroke();
    }
    x.restore();
  }
  // ---- 通勤・通学のバス利用(住民それぞれの一日の予定 dayPlan から)
  // 鉄道の通勤経路がない人のうち、家と職場・学校がともに同じ系統の停留所の近くにあり、歩くより早い人がバスで通う。
  // 決まった時刻に家を出て停留所へ歩き、列に並び、実際のバスに乗り、降りて職場・学校へ歩く。夕方は逆向き。
  var BC = { links: /* @__PURE__ */ new Map(), idx: null, last: null };
  var BC_WALK = 4;
  function stopNearB(map2, s) {
    if (s.nb != null) return s.nb;
    let best = -1, bd = 1e9;
    for (const b of map2.buildings) {
      if (b.tenant) continue;
      const d = Math.abs(b.doorX - s.x) + Math.abs(b.doorY - s.y);
      if (d < bd) {
        bd = d;
        best = b.idx;
      }
    }
    return s.nb = best;
  }
  function busRideEst(r, from, to) {
    const ja = r.cyc.indexOf(from);
    let dist2 = 0;
    for (let k = 1; k < r.cyc.length; k++) {
      const j = (ja + k) % r.cyc.length, jp = (ja + k - 1) % r.cyc.length;
      dist2 += ((r.cycAt[j] - r.cycAt[jp]) % r.len + r.len) % r.len || r.len;
      if (r.cyc[j] === to) return Math.ceil(dist2 / 9 + k * 0.8);
      if (r.cyc[j] === from) break;
    }
    return null;
  }
  function busCommuteLink(world, homeB, destB) {
    const key = homeB * 65536 + destB;
    if (BC.links.has(key)) return BC.links.get(key);
    let L2 = null;
    const net = busNet(world.map);
    if (net && net.routes.length && homeB >= 0 && destB >= 0 && homeB !== destB) {
      const B2 = world.map.buildings, h = B2[homeB], d = B2[destB];
      const direct = Math.abs(h.doorX - d.doorX) + Math.abs(h.doorY - d.doorY);
      if (direct > 50) {
        const walkAll = direct * 1.15 / BC_WALK;
        let best = null;
        for (const A of net.stops) {
          const wA = Math.abs(A.x - h.doorX) + Math.abs(A.y - h.doorY);
          if (wA > 90) continue;
          for (const r of A.routes) for (const Bs of r.stops) {
            if (Bs === A) continue;
            const wB = Math.abs(Bs.x - d.doorX) + Math.abs(Bs.y - d.doorY);
            if (wB > 90) continue;
            const ride = busRideEst(r, A, Bs), back = busRideEst(r, Bs, A);
            if (ride == null || back == null) continue;
            const cost = (wA + wB) * 1.15 / BC_WALK + ride + r.headway / 2;
            if (!best || cost < best.cost) best = { A, B: Bs, r, wA: Math.ceil(wA * 1.15 / BC_WALK), wB: Math.ceil(wB * 1.15 / BC_WALK), walkT: wA + wB, ride, rideBack: back, wait: Math.ceil(r.headway / 2), cost };
          }
        }
        // 鉄道の通勤(034_commute: 駅までの徒歩の合計が直線距離の8割未満なら電車)と同じ考え方で、
        // 停留所までの徒歩の合計が直線距離の6割未満で、時間も歩くより大きく遅くならなければバス
        if (best && best.walkT < direct * 0.6 && best.cost < walkAll * 1.2) L2 = best;
      }
    }
    BC.links.set(key, L2);
    return L2;
  }
  function busCommuteTimes(L2, dp) {
    const T4 = Math.round(dp.a * 60 - 2), tOff = T4 - L2.wB, tStop = tOff - L2.ride - L2.wait, t0 = tStop - L2.wA;
    const f0 = Math.round(dp.b * 60), tB = f0 + L2.wB, tOff2 = tB + L2.wait + L2.rideBack, tHome = tOff2 + L2.wA;
    return { T: T4, tOff, tStop, t0, f0, tB, tOff2, tHome };
  }
  // personActivity から呼ばれる: バス通勤・通学の人の、その時刻の様子(鉄道通勤と同じ形の区間で返す)
  function busCommuteState(world, id, dp, m) {
    if (!dp || dp.b > 23.5) return null;
    const p = world.pop, hb = p.home[id], L2 = busCommuteLink(world, hb, dp.dest);
    if (!L2) return null;
    const t = busCommuteTimes(L2, dp), map2 = world.map;
    if (t.t0 < BUS_HOURS[0] - 60 || t.tB > BUS_LAST) return null;
    if (m < t.t0 || m >= t.tHome) return null;
    const nbA = stopNearB(map2, L2.A), nbB = stopNearB(map2, L2.B);
    const walk = (fromB, toB, t0, t1) => ({ s: 1, train: true, bus: true, to: toB, seg: { k: "walk", fromB, toB, t0, t1 }, u: Math.max(0, Math.min(1, (m - t0) / Math.max(1, t1 - t0))) });
    const rs = BUSSIM.riders.get(id), off = rs && (rs.st === "walk" || rs.st === "arrived"), on = rs && (rs.st === "ride" || rs.st === "wait");
    const bus = { s: 1, train: true, bus: true, to: dp.dest, seg: { k: "bus" } };
    if (m < t.tStop) return walk(hb, nbA, t.t0, t.tStop);
    if (m < t.tOff) return off ? walk(nbB, dp.dest, t.tOff - L2.wB, t.T) : bus;
    if (m < t.T) return on ? bus : walk(nbB, dp.dest, t.tOff, t.T);
    if (m < t.f0) return { s: 2, at: dp.dest };
    if (m < t.tB) return walk(dp.dest, nbB, t.f0, t.tB);
    if (m < t.tOff2) return off ? walk(nbA, hb, t.tOff2 - L2.wA, t.tHome) : bus;
    return on ? bus : walk(nbA, hb, t.tOff2, t.tHome);
  }
  // その日の索引: 何時何分にどの停留所の列に誰が並ぶか
  function busCommuteIndex(g) {
    const w = g.world, d = g.date(), day = Math.floor(g.absMin() / 1440);
    if (BC.idx && BC.idx.day === day && BC.idx.map === w.map) return BC.idx;
    const idx = { day, map: w.map, at: /* @__PURE__ */ new Map(), n: 0, who: /* @__PURE__ */ new Set(), byRoute: {} };
    BC.idx = idx;
    for (const [id, v] of BUSSIM.riders) if (v.st === "arrived") BUSSIM.riders.delete(id);
    const p = w.pop;
    const add = (m, e) => {
      let a = idx.at.get(m);
      if (!a) idx.at.set(m, a = []);
      a.push(e);
    };
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i] || i === g.hero.id || BUSSIM.drivers && BUSSIM.drivers.has(i)) continue;
      const dp = w.dayPlan(i, d.dow);
      if (!dp || dp.b > 23.5) continue;
      const L2 = busCommuteLink(w, p.home[i], dp.dest);
      if (!L2 || w.getCommute().link(p.home[i], dp.dest)) continue;
      const t = busCommuteTimes(L2, dp), sch = dp.kind === "school";
      if (t.t0 < BUS_HOURS[0] - 60 || t.tB > BUS_LAST) continue;
      add(Math.max(BUS_HOURS[0], t.tStop), { id: i, stop: L2.A, to: L2.B.id, why: sch ? "通学" : "通勤" });
      add(t.tB, { id: i, stop: L2.B, to: L2.A.id, why: sch ? "下校" : "帰宅" });
      idx.n++;
      idx.who.add(i);
      idx.byRoute[L2.r.id] = (idx.byRoute[L2.r.id] || 0) + 1;
    }
    return idx;
  }
  function busCommuteFeed(g, m) {
    const ix = busCommuteIndex(g), m0 = Math.floor(m);
    if (BC.last == null || m0 < BC.last || m0 - BC.last > 30) BC.last = m0 - 1;
    for (let mm = BC.last + 1; mm <= m0; mm++) for (const e of ix.at.get(mm) || []) {
      const rs = BUSSIM.riders.get(e.id);
      if (rs && rs.st !== "arrived" || g.world.pop.gone[e.id]) continue;
      e.stop.queue.push({ id: e.id, to: e.to, why: e.why, since: g.absMin(), commute: true });
      BUSSIM.riders.set(e.id, { st: "wait", stop: e.stop, to: e.to, why: e.why });
    }
    BC.last = m0;
  }
