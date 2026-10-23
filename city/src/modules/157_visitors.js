  // src/visitors.js — 店・施設への来客(住民が目的を持って出かける): 時間帯・曜日ごとの来客数で、近所の住民が
  // 自宅のある辺りから歩いて来て、店で過ごし、帰っていく。人物は空いている(仕事・学校・通勤中でない)住民から決定的に選ぶ。
  // 外では歩行者、建物の中では客として表示し、人物情報に「○○へ食事に向かう途中」などを出す。
  var VISIT = {
    konbini: { p: [[6, 10, 3], [10, 17, 2], [17, 23, 3], [23, 24, 1]], stay: 6, verb: "買い物" },
    super: { p: [[9, 12, 4], [12, 16, 3], [16, 20, 6], [20, 22, 2]], stay: 25, we: 1.5, verb: "買い物" },
    shop: { p: [[10, 19, 2]], stay: 15, we: 1.5, verb: "買い物" },
    clothes: { p: [[10, 20, 2]], stay: 20, we: 2, verb: "買い物" },
    bookstore: { p: [[10, 21, 2]], stay: 20, we: 1.5, verb: "本を見に" },
    greengrocer: { p: [[9, 18, 2]], stay: 8, verb: "買い物" },
    fishshop: { p: [[9, 18, 2]], stay: 8, verb: "買い物" },
    pharmacy: { p: [[9, 20, 2]], stay: 10, verb: "買い物" },
    liquor: { p: [[10, 21, 1]], stay: 8, verb: "買い物" },
    directsale: { p: [[8, 15, 2]], stay: 15, we: 2, verb: "買い物" },
    homecenter: { p: [[9, 19, 3]], stay: 30, we: 2, verb: "買い物" },
    dept: { p: [[10, 20, 8]], stay: 70, we: 2, verb: "買い物" },
    mall: { p: [[10, 21, 8]], stay: 80, we: 2, verb: "買い物" },
    market: { p: [[6, 12, 4]], stay: 30, verb: "買い物" },
    restaurant: { p: [[11, 14, 4], [17, 21, 4]], stay: 40, we: 1.4, verb: "食事" },
    ramen: { p: [[11, 14, 4], [18, 23, 3]], stay: 20, verb: "食事" },
    seafood: { p: [[11, 14, 3], [17, 21, 3]], stay: 45, we: 1.4, verb: "食事" },
    cafe: { p: [[8, 11, 2], [11, 18, 3]], stay: 35, we: 1.4, verb: "お茶" },
    izakaya: { p: [[17, 20, 4], [20, 24, 5]], stay: 90, verb: "飲みに" },
    clinic: { p: [[9, 12, 3], [15, 18, 2]], stay: 40, verb: "受診" },
    hospital: { p: [[8, 12, 8], [13, 16, 4]], stay: 90, verb: "通院" },
    bank: { p: [[9, 15, 2]], stay: 15, verb: "用事" },
    library: { p: [[10, 19, 3]], stay: 60, we: 1.5, verb: "本を借りに" },
    gym: { p: [[7, 10, 2], [18, 22, 4]], stay: 60, verb: "運動" },
    cinema: { p: [[10, 23, 4]], stay: 120, we: 2, verb: "映画" },
    gamecenter: { p: [[13, 23, 3]], stay: 45, we: 1.5, verb: "遊びに" },
    bowling: { p: [[13, 23, 3]], stay: 60, we: 2, verb: "遊びに" },
    sento: { p: [[15, 23, 3]], stay: 40, verb: "風呂" },
    onsenbath: { p: [[10, 22, 4]], stay: 60, we: 2, verb: "温泉" },
    aquarium: { p: [[9, 17, 6]], stay: 120, we: 2.5, verb: "見物" },
    zoo: { p: [[9, 16, 6]], stay: 150, we: 2.5, verb: "見物" },
    themepark: { p: [[9, 20, 10]], stay: 240, we: 3, verb: "遊びに" },
    edovillage: { p: [[9, 17, 5]], stay: 150, we: 2.5, verb: "見物" },
    museum: { p: [[10, 16, 3]], stay: 90, we: 2, verb: "見物" },
    shrine: { p: [[7, 17, 1]], stay: 15, we: 2, verb: "お参り" },
    temple: { p: [[7, 17, 1]], stay: 20, we: 2, verb: "お参り" }
  };
  var visitNow = /* @__PURE__ */ new Map();
  var visitOrigC = /* @__PURE__ */ new Map();
  function visitCount(b, hr, wkend) {
    const v = VISIT[b.type];
    if (!v) return 0;
    let n2 = 0;
    for (const [a, c, k] of v.p) if (hr >= a && hr < c) n2 = k;
    if (wkend && v.we) n2 = Math.round(n2 * v.we);
    const big = b.w * b.h >= 120 ? 2 : b.w * b.h >= 50 ? 1.4 : 1;
    // 1時間あたりの来客数(人口3万人規模の街の商店街として、表の値の約2倍)
    return Math.round(n2 * big * 2.2);
  }
  // 来る人の住まいのあたり(近くの住宅)
  function visitOrigins(w, b) {
    let L2 = visitOrigC.get(b.idx);
    if (L2) return L2;
    L2 = [];
    const R5 = BTYPES[b.type].cat === "sight" || ["dept", "mall", "hospital", "cinema"].includes(b.type) ? 110 : 60;
    for (const q of w.map.buildings) if (BTYPES[q.type].cat === "res" && Math.abs(q.doorX - b.doorX) + Math.abs(q.doorY - b.doorY) < R5) L2.push(q.idx);
    // 商店街: 近くの店からの「はしご」(店から店へ通りを歩く人)。住宅と同じくらいの重みで加える
    const near2 = w.map.buildings.filter((q) => q !== b && VISIT[q.type] && !["hospital", "zoo", "aquarium", "museum", "shrine", "temple"].includes(q.type) && Math.abs(q.doorX - b.doorX) + Math.abs(q.doorY - b.doorY) < 30);
    if (near2.length >= 4 && !["hospital", "clinic", "zoo", "aquarium"].includes(b.type)) {
      const nAdd = Math.max(L2.length, 8);
      for (let k = 0; k < nAdd; k++) L2.push(near2[k % near2.length].idx);
    }
    visitOrigC.set(b.idx, L2);
    return L2;
  }
  // この時刻にこの建物を訪れている(来る途中・中にいる・帰る途中)人
  function visitsOf(C2, b, m, have) {
    const g = C2.g, w = g.world, p = w.pop, dt = g.date(), wkend = dt.dow === 0 || dt.dow === 6;
    const day = Math.floor(g.absMin() / 1440), v = VISIT[b.type], out = [];
    if (!v || b.status === "closed" || b.campusOf != null) return out;
    const org = visitOrigins(w, b);
    if (!org.length) return out;
    const hour = Math.floor(m / 60);
    for (const hh of [hour - 2, hour - 1, hour]) {
      if (hh < 0) continue;
      const n2 = visitCount(b, hh + 0.5, wkend);
      for (let k = 0; k < n2; k++) {
        const h0 = uh(b.idx * 977 + k, day * 24 + hh);
        const arrive = hh * 60 + h0 % 60, from = org[h0 % org.length];
        const wm = Math.max(3, w.dist(from, b.idx) * 1.15 / 4);
        const t0 = arrive - wm, t1 = arrive + v.stay * (0.7 + (h0 >>> 8) % 7 / 10), t2 = t1 + wm;
        if (m < t0 || m >= t2) continue;
        // 空いている住民から決定的に選ぶ(仕事・学校・通勤・バス乗車中の人は来ない)
        let id = -1;
        for (let j = 0; j < 10; j++) {
          const c = (h0 + j * 7919) % p.n;
          if (p.gone[c] || p.home[c] < 0 || c === g.hero.id || have && have.has(c)) continue;
          const age = ageYears(p, c, g.S.M);
          if (age < 7 || (b.type === "izakaya" && age < 20)) continue;
          const a = personActivity(w, c, Math.floor(t0), dt.dow), a2 = personActivity(w, c, Math.floor(m), dt.dow);
          if (a.s !== 0 && a.s !== 3 || a2.s !== 0 && a2.s !== 3) continue;
          if (typeof BUSSIM !== "undefined" && BUSSIM.riders.has(c)) continue;
          id = c;
          break;
        }
        if (id < 0) continue;
        if (have) have.add(id);
        out.push({ id, b: b.idx, from, t0, arrive, leave: t1, t2, wm, verb: v.verb });
      }
    }
    return out;
  }
  // 屋外の歩行者に加える(Crowd.outdoor から)
  function visitorWalkers(C2, out, hx, hy, radius) {
    const g = C2.g, B2 = g.world.map.buildings, m = g.S.min;
    const have = new Set(out.map((o) => o.id));
    visitNow.clear();
    for (const b of B2) {
      if (!VISIT[b.type] || Math.abs(b.doorX - hx) > radius * 1.3 || Math.abs(b.doorY - hy) > radius) continue;
      for (const vz of visitsOf(C2, b, m, have)) {
        visitNow.set(vz.id, vz);
        if (m >= vz.arrive && m < vz.leave) continue;
        const going = m < vz.arrive, r = going ? C2.path(vz.from, b.idx) : C2.path(b.idx, vz.from);
        if (!r) continue;
        const t = going ? (m - vz.t0) / vz.wm : (m - vz.leave) / vz.wm;
        const q = C2.posAlong(r, t);
        if (Math.abs(q.x - hx) > radius || Math.abs(q.y - hy) > radius * 0.8) continue;
        out.push({ id: vz.id, r, t0: t, v: 1 / vz.wm, s: 3, x: q.x, y: q.y, dx: q.dx, dy: q.dy, visit: b.idx });
        if (out.length >= 170) return;
      }
    }
  }
  // 建物の中の来客(Crowd.indoor0 から)。床の空いている場所に、来店中の人を置く
  function visitorsInside(C2, b, I2, floor) {
    if (!VISIT[b.type] || floor !== (I2.lo != null ? Math.max(0, I2.lo) : 0) && floor !== 0) return [];
    // 敷地のある動物園の来園者は屋外の園路にいる(zooOutdoorVisitors)
    if (b.type === "zoo" && b.siteI != null) return [];
    const cap = Math.max(24, Math.min(80, I2.W * I2.H / 40 | 0));
    const m = C2.g.S.min, out = [];
    const sol = interiorSolid(I2), cells = [];
    for (let y = 2; y < I2.H - 2; y++) for (let x = 1; x < I2.W - 1; x++) if (!sol[x + y * I2.W]) cells.push([x, y]);
    if (!cells.length) return out;
    const seats = (I2.seatSpots || []).slice();
    for (const vz of visitsOf(C2, b, m, null)) {
      if (m < vz.arrive || m >= vz.leave) continue;
      visitNow.set(vz.id, vz);
      const s = seats.length && ["食事", "お茶", "飲みに"].includes(vz.verb) ? seats.splice(uh(vz.id, 3) % seats.length, 1)[0] : null;
      const c = s ? [s.x, s.y] : cells[uh(vz.id, 5) % cells.length];
      out.push({ id: vz.id, x: c[0] + 0.5, y: c[1] + 0.5, dir: "u", role: "visitor", seat0: !!s });
      if (out.length > cap) break;
    }
    return out;
  }
  function visitNpcStatus(id) {
    const vz = visitNow.get(id);
    if (!vz || !G3) return null;
    const b = G3.bld(vz.b), m = G3.S.min;
    if (m < vz.arrive) return `🚶 ${b.name}へ${vz.verb}に向かっています(${hhmm(vz.arrive)}ごろ着)`;
    if (m < vz.leave) return `🛍 ${b.name}で${vz.verb}(${hhmm(vz.leave)}ごろまで)`;
    if (m < vz.t2) return `🚶 ${b.name}から帰るところ`;
    return null;
  }
