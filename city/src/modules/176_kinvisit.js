  // src/kinvisit.js — 市外に住む親族の帰省を、実際の移動と対面にする(kinout.js の続き)。
  // 正月(1月1〜3日)とお盆(8月13〜15日)のうち1日(人ごとに決定的)、最寄り駅に着いて歩いて子の家へ行き、
  // 昼から夕方まで家の中にいて、また駅へ歩いて帰る。屋外では歩く姿、家の中では居間にいる。話しかけると帰省の話になる。
  var KV_WIN = [[0, 1, 3, "正月"], [7, 13, 3, "お盆"]];
  var kvCache = { key: -1, list: [] };
  var kvStations = /* @__PURE__ */ new WeakMap();
  function kvNearestStation(map2, hb) {
    let L3 = kvStations.get(map2);
    if (!L3) kvStations.set(map2, L3 = map2.buildings.filter((b) => b.type === "station"));
    let best = null, bd = 1e9;
    for (const s of L3) {
      const d = Math.abs(s.doorX - hb.doorX) + Math.abs(s.doorY - hb.doorY);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best ? { b: best, d: bd } : null;
  }
  // 今日の帰省の一覧(日ごとに1度だけ作る)
  function kinVisitsToday(g) {
    const w = g.world, dt = g.date(), key = dt.y * 400 + dt.m0 * 32 + dt.d;
    if (kvCache.key === key && kvCache.w === w) return kvCache.list;
    const list = [];
    const win = KV_WIN.find(([m0, d0, n2]) => dt.m0 === m0 && dt.d >= d0 && dt.d < d0 + n2);
    if (win && w.outKin && typeof isOutKin === "function") {
      const p = w.pop, B2 = w.map.buildings, [m0, d0, n2, label] = win;
      for (const id of w.outKin) {
        if (!isOutKin(p, id) || d0 + uh(id, dt.y * 13 + m0) % n2 !== dt.d) continue;
        const host = w.childrenOf(id).find((k) => !p.gone[k] && p.home[k] >= 0);
        if (host == null) continue;
        const hb = B2[p.home[host]], st = kvNearestStation(w.map, hb);
        if (!hb || !st) continue;
        // 歩く時間(1マス2m・分速80m)。駅から遠い家は最大60分
        const wm = Math.max(6, Math.min(60, Math.round(st.d * 2 / 80)));
        const arrive = 600 + uh(id, 51) % 150, leave = 960 + uh(id, 52) % 120;
        list.push({ id, host, hb: hb.idx, st: st.b.idx, t0: arrive - wm, arrive, leave, t2: leave + wm, wm, label });
      }
    }
    kvCache = { key, w, list };
    return list;
  }
  var kinVisitOf = (g, id) => kinVisitsToday(g).find((v) => v.id === id) || null;
  // 屋外: 駅と家の間を歩く(Crowd.outdoor から)
  function kinVisitWalkers(C2, out, hx, hy, radius) {
    const g = C2.g, m = g.S.min, B2 = g.world.map.buildings;
    for (const v of kinVisitsToday(g)) {
      if (m < v.t0 || m >= v.t2 || m >= v.arrive && m < v.leave) continue;
      const hb = B2[v.hb], sb = B2[v.st];
      if (Math.min(Math.abs(hb.doorX - hx) + Math.abs(hb.doorY - hy), Math.abs(sb.doorX - hx) + Math.abs(sb.doorY - hy)) > radius * 2.5) continue;
      const going = m < v.arrive, r = going ? C2.path(v.st, v.hb) : C2.path(v.hb, v.st);
      if (!r) continue;
      const t = going ? (m - v.t0) / v.wm : (m - v.leave) / v.wm, q = C2.posAlong(r, t);
      if (Math.abs(q.x - hx) > radius || Math.abs(q.y - hy) > radius * 0.8) continue;
      out.push({ id: v.id, r, t0: t, v: 1 / v.wm, s: 3, x: q.x, y: q.y, dx: q.dx, dy: q.dy, kinVisit: v.hb });
      if (out.length >= 180) return;
    }
  }
  // 家の中: 子の家にいる時間(Crowd の屋内から)
  // hosts: 集合住宅の住戸のときは、その住戸の世帯の人だけ(ほかの住戸への帰省は出さない)
  function kinVisitInside(C2, bIdx, I2, hosts = null) {
    const g = C2.g, m = g.S.min, out = [];
    const here = kinVisitsToday(g).filter((v) => v.hb === bIdx && m >= v.arrive && m < v.leave && (!hosts || hosts.includes(v.host)));
    if (!here.length) return out;
    const sol = interiorSolid(I2), cells = [];
    for (let y = 2; y < I2.H - 2; y++) for (let x = 1; x < I2.W - 1; x++) if (!sol[x + y * I2.W]) cells.push([x, y]);
    if (!cells.length) return out;
    here.forEach((v, i) => {
      const c = cells[(uh(v.id, 53) + i * 3) % cells.length];
      out.push({ id: v.id, x: c[0] + 0.5, y: c[1] + 0.5, dir: "d", role: "family" });
    });
    return out;
  }
  // 人物情報のいまの様子
  function kinVisitStatus(id) {
    if (typeof G3 === "undefined" || !G3) return null;
    const v = kinVisitOf(G3, id);
    if (!v) return null;
    const m = G3.S.min, hn = G3.nameOf(v.host), sn = G3.bld(v.st).name;
    if (m < v.t0) return `🧳 ${v.label}に${hn}さんの家へ来る予定(市外在住)`;
    if (m < v.arrive) return `🚶 ${sn}から${hn}さんの家へ歩いています(${v.label}の帰省)`;
    if (m < v.leave) return `🏠 ${v.label}の帰省で${hn}さんの家にいます(${hhmm(v.leave)}ごろまで)`;
    if (m < v.t2) return `🚶 ${sn}へ帰るところ(${v.label}の帰省)`;
    return `🚃 市外の家へ帰った(${v.label}の帰省)`;
  }
