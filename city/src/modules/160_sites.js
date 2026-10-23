  // src/sites.js — 施設の敷地(地図v4・生成後の決定的な後処理。建物ID・人物IDは変えない)
  // 学校・大学・動物園などを、用途に合った広さの敷地(校舎・付属棟・校庭・体育館・プール・テニスコート・獣舎・外周フェンス・門)として
  // 近くの空き地に置き直す。移した施設は同じ番号のまま座標だけが変わり、元の場所は空き地になる。付属棟は建物一覧の末尾に足す。
  // セーブは建物ごとの属性(名前・歴史など)を番号で持つので、読み込み時に同じ後処理をすれば同じ配置になる。
  var SITES_VER = 4;
  BTYPES.annex = { label: "付属棟", w: 4, h: 4, cat: "school", enter: true, interior: "school", floors: 1, slots: {} };
  KIT.s_gym = { k: "school", f: [2, 2], roof: "saw", wall: "school" };
  KIT.s_wing = { k: "school", f: [3, 3], roof: "flat", wall: "school" };
  KIT.s_brick = { k: "school", f: [3, 5], roof: "flat", wall: "brick" };
  KIT.s_glass = { k: "office", f: [3, 6], roof: "flat", wall: "glass" };
  KIT.s_hall = { k: "civic", f: [2, 2], roof: "flat", wall: "stone" };
  KIT.s_low = { k: "shop", f: [1, 1], roof: "flat", wall: "shop" };
  KIT.s_kinder = { k: "kinder", f: [1, 1], roof: "hip", wall: "pastel" };
  var SITE_FREE = /* @__PURE__ */ new Set();
  // ---- 敷地の設計(門は南。数字は敷地の中のタイル位置。1タイル=2m)
  // main: 本館(施設そのものの建物), annex: 付属棟 [種類,x,y,w,h,階,名前,外観], ground: 地面 [種類,x,y,w,h], solid: 立入不可の設備, props: 遊具など
  function siteLayout(b) {
    const t = b.type, hsh = uh(b.idx, 811);
    if (t === "kinder") return { W: 20, H: 16, main: [2, 2, 12, 6, 1], annex: [], ground: [["yard", 2, 9, 16, 5], ["paved", 14, 2, 4, 7]], solid: [], props: [["slide", 4, 10], ["swing", 8, 10], ["sandbox", 12, 11], ["jungle", 15, 11]], gate: [8, 12] };
    if (t === "elem") return { W: 40, H: 34, main: [3, 3, 30, 6, 3], annex: [["gym", 29, 13, 9, 8, 1, "体育館", "s_gym"]], ground: [["paved", 1, 10, 38, 2], ["yard", 2, 13, 25, 18], ["paved", 28, 22, 11, 2]], solid: [["pool", 29, 25, 9, 6]], props: [["track", 2, 13, 25, 18], ["iron_bar", 3, 29], ["slide", 6, 29], ["swing", 9, 29], ["jungle", 12, 29], ["bike", 33, 10]], gate: [17, 23] };
    if (t === "jh") return { W: 46, H: 38, main: [3, 3, 36, 7, 3], annex: [["gym", 36, 13, 9, 10, 1, "体育館", "s_gym"], ["club", 3, 33, 10, 3, 1, "部室棟", "s_low"]], ground: [["paved", 1, 11, 44, 2], ["yard", 2, 14, 32, 18], ["court", 36, 25, 9, 9]], solid: [], props: [["track", 2, 14, 32, 18], ["backstop", 3, 15], ["goal", 26, 22], ["goalL", 8, 22], ["tennis", 36, 25, 9, 9], ["bike", 40, 11]], gate: [18, 24] };
    if (t === "hs") return { W: 56, H: 44, main: [3, 3, 42, 7, 4], annex: [["wing", 47, 3, 8, 12, 3, "特別教室棟", "s_wing"], ["gym", 46, 17, 9, 10, 1, "体育館", "s_gym"], ["club", 14, 39, 12, 3, 1, "部室棟", "s_low"]], ground: [["paved", 1, 11, 54, 2], ["yard", 2, 14, 42, 24], ["court", 2, 38, 11, 5]], solid: [["pool", 46, 30, 9, 7]], props: [["track", 14, 14, 30, 24], ["backstop", 3, 15], ["diamond", 2, 14, 11, 11], ["goal", 41, 24], ["goalL", 16, 24], ["tennis", 2, 38, 11, 5], ["bike", 49, 39]], gate: [28, 36] };
    // 公共施設(実際の庁舎・図書館・美術館・裁判所の規模に近く。1タイル=2m)
    if (t === "cityhall") return { W: 50, H: 40, main: [5, 4, 32, 14, 5], annex: [], ground: [["paved", 2, 19, 46, 8], ["paved", 22, 27, 6, 13], ["paved", 38, 4, 10, 15], ["paved", 3, 29, 17, 9], ["paved", 30, 29, 17, 9]], solid: [], props: [["fountain", 25, 23], ["lot", 3, 29, 17, 9], ["lot", 30, 29, 17, 9], ["tree", 4, 21], ["tree", 46, 21], ["lamp", 12, 26], ["lamp", 38, 26], ["bench", 18, 25], ["bench", 32, 25], ["bike", 42, 8]], gate: [25, 34] };
    if (t === "court") return { W: 36, H: 30, main: [4, 3, 26, 12, 5], annex: [], ground: [["paved", 2, 16, 32, 6], ["paved", 15, 22, 6, 8]], solid: [], props: [["tree", 4, 18], ["tree", 31, 18], ["tree", 8, 25], ["tree", 28, 25], ["lamp", 12, 21], ["lamp", 24, 21]], gate: [18, 24] };
    if (t === "library") return { W: 34, H: 28, main: [3, 3, 24, 11, 3], annex: [], ground: [["paved", 2, 15, 30, 5], ["paved", 14, 20, 6, 8]], solid: [], props: [["tree", 4, 21], ["tree", 9, 24], ["tree", 25, 21], ["tree", 30, 24], ["bench", 6, 17], ["bench", 26, 17], ["bike", 29, 6], ["lamp", 12, 18]], gate: [17, 22] };
    if (t === "museum") return { W: 44, H: 34, main: [4, 3, 32, 13, 2], annex: [], ground: [["paved", 2, 17, 40, 6], ["paved", 19, 23, 6, 11]], solid: [], props: [["fountain", 22, 20], ["tree", 4, 25], ["tree", 10, 28], ["tree", 33, 25], ["tree", 39, 28], ["bench", 12, 21], ["bench", 30, 21], ["lamp", 16, 19], ["lamp", 28, 19]], gate: [22, 28] };
    // 警察署・消防署・介護施設・福祉施設・研究所(中の作り fac_public.js の広さに合わせた本館)
    if (t === "police") return { W: 30, H: 24, main: [3, 3, 18, 9, 3], annex: [], ground: [["paved", 1, 13, 28, 5], ["paved", 13, 18, 5, 6], ["paved", 22, 3, 7, 10]], solid: [], props: [["lot", 22, 3, 7, 10], ["tree", 3, 19], ["tree", 26, 19], ["lamp", 9, 15], ["lamp", 20, 15]], gate: [15, 20] };
    if (t === "fire") return { W: 32, H: 26, main: [3, 3, 20, 10, 2], annex: [], ground: [["paved", 1, 13, 30, 13], ["paved", 24, 3, 7, 10]], solid: [], props: [["chimney", 27, 6], ["lot", 24, 9, 7, 4], ["lamp", 6, 15], ["lamp", 20, 15]], gate: [13, 21] };
    if (t === "nursing") return { W: 30, H: 24, main: [3, 3, 18, 9, 2], annex: [], ground: [["paved", 1, 13, 28, 4], ["paved", 13, 17, 5, 7], ["field", 22, 3, 7, 10]], solid: [], props: [["tree", 24, 5], ["tree", 27, 9], ["bench", 24, 11], ["bench", 3, 18], ["tree", 6, 21], ["tree", 24, 21]], gate: [15, 20] };
    if (t === "welfare") return { W: 26, H: 22, main: [3, 3, 16, 8, 2], annex: [], ground: [["paved", 1, 12, 24, 4], ["paved", 11, 16, 5, 6], ["field", 20, 3, 5, 9]], solid: [], props: [["tree", 21, 5], ["bench", 21, 10], ["tree", 4, 18]], gate: [13, 18] };
    if (t === "lab") return { W: 34, H: 26, main: [3, 3, 20, 10, 3], annex: [], ground: [["paved", 1, 14, 32, 5], ["paved", 15, 19, 5, 7], ["paved", 25, 3, 8, 11]], solid: [], props: [["lot", 25, 3, 8, 11], ["fountain", 12, 16], ["tree", 3, 21], ["tree", 30, 21], ["lamp", 8, 17], ["lamp", 22, 17]], gate: [17, 22] };
    if (t === "special") return { W: 30, H: 24, main: [2, 2, 18, 6, 2], annex: [["wing", 22, 2, 6, 8, 2, "実習棟", "s_wing"]], ground: [["paved", 1, 9, 28, 2], ["yard", 2, 12, 26, 9]], solid: [], props: [["slide", 4, 14], ["swing", 8, 14], ["bike", 24, 12]], gate: [12, 18] };
    if (t === "univ") {
      const FAC = ["工学部", "文学部", "経済学部", "理学部", "法学部", "教育学部", "医学部", "農学部", "情報学部", "国際学部"];
      const f = [0, 1, 2].map((k) => FAC[(hsh + k * 3) % FAC.length]);
      return { W: 96, H: 70, main: [32, 4, 30, 9, 5], annex: [
        ["fac", 4, 4, 16, 11, 6, f[0] + "棟", (hsh & 1) ? "s_glass" : "s_brick"],
        ["fac", 66, 4, 24, 9, 5, f[1] + "棟", (hsh & 2) ? "s_brick" : "s_glass"],
        ["fac", 66, 18, 14, 12, 4, f[2] + "・研究棟", "s_glass"],
        ["lib", 4, 20, 14, 12, 4, "附属図書館", "s_brick"],
        ["hall", 32, 20, 14, 10, 2, "記念講堂", "s_hall"],
        ["cafe", 48, 20, 14, 8, 2, "学生食堂・売店", "s_low"],
        ["gym", 84, 18, 10, 12, 1, "体育館", "s_gym"]
      ], ground: [["paved", 20, 14, 46, 4], ["paved", 44, 30, 20, 34], ["paved", 1, 16, 2, 50], ["field", 4, 38, 36, 26]], solid: [], props: [["track", 4, 38, 36, 26], ["goal", 37, 50], ["goalL", 6, 50], ["bike", 60, 60], ["bike", 66, 60], ["tree", 22, 32], ["tree", 26, 34], ["tree", 70, 40], ["tree", 80, 46], ["tree", 74, 56], ["bench", 50, 40], ["bench", 56, 46]], gate: [44, 52], mirror: !!(hsh & 4) };
    }
    if (t === "zoo") return { W: 88, H: 58, main: [38, 52, 12, 4, 1], annex: [["food", 50, 41, 14, 6, 1, "フードコート「サバンナ」", "s_low"], ["shop", 24, 51, 12, 4, 1, "おみやげショップ", "s_low"], ["keeper", 72, 2, 12, 6, 2, "飼育員管理棟", "s_wing"]], ground: [["paved", 40, 28, 8, 24], ["paved", 3, 24, 82, 4], ["paved", 3, 3, 3, 47], ["paved", 82, 8, 3, 42], ["paved", 3, 48, 82, 3], ["keeperpath", 70, 8, 2, 16]],
      solid: [["ex", 8, 3, 22, 18, { sp: "elephant" }], ["ex", 32, 3, 18, 18, { sp: "giraffe" }], ["ex", 52, 3, 16, 16, { sp: "lion" }], ["ex", 8, 30, 14, 16, { sp: "monkey" }], ["ex", 24, 30, 12, 12, { sp: "flamingo" }], ["ex", 52, 30, 14, 9, { sp: "kangaroo" }], ["ex", 68, 30, 10, 8, { sp: "redpanda" }], ["ex", 68, 40, 12, 7, { sp: "birds" }]],
      props: [["tree", 26, 45], ["tree", 48, 44], ["tree", 79, 20], ["bench", 36, 26], ["bench", 50, 26], ["bench", 62, 26], ["bench", 16, 49]], gate: [40, 47], open: true };
    return null;
  }
  // 立ち退いて移ってもらえる小さな建物(番号はそのまま・近くの空き地へ移す)
  var SITE_MOVABLE = /* @__PURE__ */ new Set(["house", "apt", "farmhouse", "villa", "shop", "konbini", "cafe", "restaurant", "ramen", "izakaya", "clothes", "bookstore", "greengrocer", "fishshop", "pharmacy", "liquor", "warehouse", "park", "seafood", "directsale"]);
  // 小さな建物(40タイル以下・テナントなし)は移せる。駅・病院・役所・学校など街の要の施設は動かさない
  var SITE_KEEP = /* @__PURE__ */ new Set(["station", "metro", "hospital", "cityhall", "airport", "stadium", "themepark", "tower", "dept", "mall", "police", "fire", "court", "shrine", "temple", "cemetery", "elem", "jh", "hs", "univ", "kinder", "special", "zoo", "aquarium", "annex", "tourtower", "crematorium", "harboroffice", "pier", "marina", "ferry", "nursing", "welfare", "lab", "library", "museum"]);
  var siteMovable = (b) => !!b && !b.tenant && !(b.tenants && b.tenants.length) && b.siteI == null && !SITE_KEEP.has(b.type) && (SITE_MOVABLE.has(b.type) || b.w * b.h <= 40);
  // 土地の区分: 0=使えない(幹線道路・踏切・橋・水・線路・大きな施設など) 1=空き地(草地・畑・林・田・広場・小道・生活道路) 2=移せる小さな建物
  function sitesLandMap(map2, todo = []) {
    const W2 = map2.W, H4 = map2.H, cls = new Uint8Array(W2 * H4);
    const rm = map2.rmeta;
    const small = (k) => {
      if (!rm || !rm.ax[k]) return false;
      if (rm.ax[k] !== 3) return rm.th[k] > 0 && rm.th[k] <= 2;
      const x = k % W2, y = k / W2 | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n2 = x + dx + (y + dy) * W2;
        if (rm.ax[n2] && rm.ax[n2] !== 3 && rm.th[n2] > 2) return false;
      }
      return true;
    };
    for (let k = 0; k < W2 * H4; k++) {
      const gd = map2.ground[k], bi = map2.bid[k];
      if (bi >= 0) {
        const b = map2.buildings[bi];
        cls[k] = b && siteMovable(b) ? 2 : 0;
        continue;
      }
      const land = (gd === T.GRASS || gd === T.FARM || gd === T.FOREST || gd === T.PADDY || gd === T.PLAZA || gd === T.PATH) && (!map2.solid[k] || map2.deco[k]);
      cls[k] = land || gd === T.ROAD && small(k) ? 1 : 0;
    }
    for (const b of map2.buildings) {
      const k = b.doorX + b.doorY * W2;
      if (k >= 0 && k < W2 * H4 && cls[k] === 1 && !siteMovable(b)) cls[k] = 0;
    }
    const block = (x0, y0, w, h) => {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (x >= 0 && y >= 0 && x < W2 && y < H4) cls[x + y * W2] = 0;
    };
    for (const e of map2.estates || []) block(e.x, e.y, e.w || 1, e.h || 1);
    // 整備する施設の今の敷地(v11 の SITE: 校庭・プール・付属の建物)は、その施設自身にとっては使える土地(区分3)
    const own = /* @__PURE__ */ new Set();
    for (const b of todo) {
      const S2 = oldSiteOf(map2, b);
      if (!S2) continue;
      own.add(S2);
      for (const l of S2.lots || []) for (let y = l[1]; y < l[1] + l[3]; y++) for (let x = l[0]; x < l[0] + l[2]; x++) cls[x + y * W2] = 3;
    }
    for (const l of map2.lots || []) if (![...own].some((S2) => (S2.lots || []).some((q) => q[0] === l.x && q[1] === l.y))) block(l.x, l.y, l.w, l.h);
    // ほかの施設の敷地(公園・遊園地・屋敷・寺社・空港・ほかの学校の今の敷地など)は使わない。自分の今の敷地だけは使える(下で区分3)
    for (const S2 of map2.sites || []) if (!own.has(S2)) block(S2.x, S2.y, S2.w, S2.h);
    for (const S2 of own) for (let y = S2.y; y < S2.y + S2.h; y++) for (let x = S2.x; x < S2.x + S2.w; x++) if (x >= 0 && y >= 0 && x < W2 && y < H4) {
      const k = x + y * W2, bi = map2.bid[k];
      const mine = bi < 0 || (S2.parts || []).includes(bi);
      const gd = map2.ground[k];
      if (mine && gd !== T.RAIL && gd !== T.PLATFORM && !(gd === T.ROAD && cls[k] === 0)) cls[k] = 3;
    }
    const integ = (f2) => {
      const S2 = new Int32Array((W2 + 1) * (H4 + 1));
      for (let y = 0; y < H4; y++) {
        let row = 0;
        for (let x = 0; x < W2; x++) {
          row += f2(cls[x + y * W2]);
          S2[(y + 1) * (W2 + 1) + x + 1] = S2[y * (W2 + 1) + x + 1] + row;
        }
      }
      return S2;
    };
    return { cls, hard: integ((c) => c === 0 ? 1 : 0), mov: integ((c) => c === 2 ? 1 : 0), own: integ((c) => c === 3 ? 1 : 0), W: W2, H: H4 };
  }
  var oldSiteOf = (map2, b) => b.site != null && map2.sites && map2.sites[b.site] && map2.sites[b.site].main === b.idx ? map2.sites[b.site] : null;
  // 候補の敷地: 使えない土地を含まず、他の施設の今の敷地にかからない(自分の今の敷地とは重なってよい)
  function siteRectOk(map2, F, b, x, y, w, h) {
    const W2 = map2.W;
    if (rectSum(F.hard, W2, x - 1, y - 1, w + 2, h + 1)) return false;
    const ownN = rectSum(F.own, W2, x - 1, y - 1, w + 2, h + 1);
    if (!ownN) return true;
    const S2 = oldSiteOf(map2, b);
    if (!S2) return false;
    const ix = Math.max(0, Math.min(x + w + 1, S2.x + S2.w) - Math.max(x - 1, S2.x)), iy = Math.max(0, Math.min(y + h, S2.y + S2.h) - Math.max(y - 1, S2.y));
    let lotN = 0;
    for (const l of S2.lots || []) {
      const lx = Math.max(0, Math.min(x + w + 1, l[0] + l[2]) - Math.max(x - 1, l[0])), ly = Math.max(0, Math.min(y + h, l[1] + l[3]) - Math.max(y - 1, l[1]));
      lotN += lx * ly;
    }
    return ownN <= ix * iy + lotN;
  }
  var rectSum = (S2, Wd, x, y, w, h) => S2[(y + h) * (Wd + 1) + x + w] - S2[y * (Wd + 1) + x + w] - S2[(y + h) * (Wd + 1) + x] + S2[y * (Wd + 1) + x];
  // 南側に道路が接しているか(門を開ける位置)。返り値: 門の中心x(敷地内の座標) or -1
  function siteRoadSouth(map2, x, y, w, h) {
    const W2 = map2.W, isRoad = (xx, yy) => yy < map2.H && [T.ROAD, T.CROSSING].includes(map2.ground[xx + yy * W2]);
    let best = -1, run = 0, bestRun = 0;
    for (let i = 2; i < w - 2; i++) {
      const ok = isRoad(x + i, y + h) || isRoad(x + i, y + h + 1) && !map2.solid[x + i + (y + h) * W2] && map2.bid[x + i + (y + h) * W2] < 0;
      run = ok ? run + 1 : 0;
      if (run > bestRun) {
        bestRun = run;
        best = i - (run >> 1);
      }
    }
    return bestRun >= 5 ? best : -1;
  }
  function planSites(map2) {
    if (!map2 || (map2.ver || 1) < 4 || map2.sitesV === SITES_VER) return;
    map2.sitesV = SITES_VER;
    map2.fsites = [];
    const t0 = performance.now();
    const W2 = map2.W, placed = [];
    const ORDER2 = ["zoo", "univ", "hs", "jh", "special", "elem", "kinder", "cityhall", "court", "library", "museum", "police", "fire", "nursing", "welfare", "lab"];
    const todo = map2.buildings.filter((b) => ORDER2.includes(b.type) && !b.tenant).sort((a, b) => ORDER2.indexOf(a.type) - ORDER2.indexOf(b.type) || a.idx - b.idx);
    const report = [], displaced = [];
    // 埋立地の島に移す施設(動物園・大学の本キャンパス・水族館・遊園地・スタジアム・工場)を先に置く(reclaim.js)。
    // 土地の区分はそのあとで調べる(移ったあとの元の敷地は空き地になり、学校の敷地に使える)
    if (map2.island && typeof islandPlan === "function") islandPlan(map2, todo, placed, report, displaced);
    const F = sitesLandMap(map2, todo);
    const tm = { land: Math.round(performance.now() - t0), find: 0, apply: 0 };
    for (const b of todo) {
      if (b.siteI != null) continue;
      const L0 = siteLayout(b);
      if (!L0) continue;
      // 実際の基準に近い広さ(SITE_GROW)から試し、入らなければ標準→85%→72%の順に探す
      let L3 = L0, best = null;
      const t1 = performance.now();
      for (const f2 of [...(SITE_GROW[b.type] || []), 1, 0.85, 0.72]) {
        const r2 = siteFind(map2, b, f2 === 1 ? L0 : scaleLayout(L0, f2), F, placed, W2);
        if (r2) {
          best = r2.best;
          L3 = r2.L3;
          b._siteScaled = f2;
          break;
        }
      }
      tm.find += performance.now() - t1;
      if (!best) {
        report.push({ id: b.id, name: b.name, type: b.type, moved: false, why: "近くに使える土地がない(元の建物のまま)" });
        continue;
      }
      // 立ち退く建物
      const out = /* @__PURE__ */ new Set();
      for (let y = best.y; y < best.y + L3.H; y++) for (let x = best.x; x < best.x + L3.W; x++) {
        const bi = map2.bid[x + y * W2];
        if (bi >= 0 && bi !== b.idx && F.cls[x + y * W2] === 2) out.add(bi);
      }
      for (const bi of out) {
        const q = map2.buildings[bi];
        for (let y = q.y; y < q.y + q.h; y++) for (let x = q.x; x < q.x + q.w; x++) if (map2.bid[x + y * W2] === bi) {
          map2.bid[x + y * W2] = -1;
          map2.solid[x + y * W2] = 0;
        }
        displaced.push(q);
      }
      placed.push({ x: best.x, y: best.y, w: L3.W, h: L3.H });
      applySite(map2, b, L3, best, displaced);
      report.push({ id: b.id, name: b.name, type: b.type, moved: true, from: [b.x0, b.y0], to: [best.x, best.y], dist: best.d, site: [L3.W, L3.H], scale: b._siteScaled, displaced: out.size });
    }
    const t2 = performance.now();
    map2.siteMoved = siteRelocate(map2, displaced, placed);
    tm.reloc = Math.round(performance.now() - t2);
    tm.find = Math.round(tm.find);
    map2.siteReport = report;
    // 道路を取り込んだので、道路の情報(車線・交差点)は作り直す
    cache4.delete(map2);
    // 高架道路は敷地の上を通さない(敷地内の4タイル幅の園路を道路の帯と見なさないように、移設後の敷地で作り直す)
    map2.siteRects = [...(map2.sites || []).map((S2) => [S2.x, S2.y, S2.w, S2.h]), ...map2.fsites.map((S2) => [S2.x, S2.y, S2.w, S2.h])];
    cache5.delete(map2);
    map2.siteMs = { all: Math.round(performance.now() - t0), ...tm };
  }
  // 種類ごとに試す拡大率(大きい順)。地図の空き地の量で決まる(sites 試験で達成率を記録)
  var SITE_CIVIC = /* @__PURE__ */ new Set(["cityhall", "court", "library", "museum", "police", "fire", "nursing", "welfare", "lab"]);
  var SITE_GROW = { zoo: [2.2, 1.8, 1.5, 1.25], univ: [2, 1.6, 1.3], hs: [2, 1.8, 1.6, 1.4, 1.2], jh: [1.8, 1.65, 1.5, 1.3, 1.15], elem: [1.8, 1.65, 1.5, 1.3, 1.15], kinder: [1.4, 1.2], special: [1.3, 1.15] };
  function siteFind(map2, b, L3, F, placed, W2) {
    // 動物園・大学は郊外へ移ってもよい(広い土地を優先して地図の広い範囲を探す)
    const far = b.type === "zoo" || b.type === "univ";
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, RR = far ? 420 : L3.W * L3.H > 4e3 ? 200 : 120, ST = far ? 6 : RR > 120 ? 4 : 3;
    let best = null;
    for (let dy = -RR; dy <= RR; dy += ST) for (let dx = -RR; dx <= RR; dx += ST) {
      const x = Math.round(cx + dx - L3.W / 2), y = Math.round(cy + dy - L3.H / 2);
      if (x < 2 || y < 2 || x + L3.W >= W2 - 2 || y + L3.H >= map2.H - 3) continue;
      if (!siteRectOk(map2, F, b, x, y, L3.W, L3.H)) continue;
      if (placed.some((p) => x < p.x + p.w + 2 && p.x < x + L3.W + 2 && y < p.y + p.h + 2 && p.y < y + L3.H + 2)) continue;
      const mov = rectSum(F.mov, W2, x, y, L3.W, L3.H), score = mov * 0.35 + Math.hypot(dx, dy);
      // 公共施設は、立ち退く小さな建物が少ない場所だけ(学校より控えめ: 8棟まで)
      if (mov > (b.type === "cityhall" ? 40 : b.type === "fire" || b.type === "police" ? 20 : 8) * 12 && SITE_CIVIC.has(b.type)) continue;
      if (best && score >= best.score) continue;
      const gx = siteRoadSouth(map2, x, y, L3.W, L3.H);
      if (gx < 0) continue;
      best = { x, y, gx, d: Math.round(Math.hypot(dx, dy)), score, mov };
    }
    return best ? { best, L3 } : null;
  }
  function scaleLayout(L3, f2) {
    const R5 = (v) => Math.max(1, Math.round(v * f2)), P0 = (v) => Math.round(v * f2);
    const rect = (a) => [P0(a[0]), P0(a[1]), R5(a[2]), R5(a[3])];
    return { ...L3, W: R5(L3.W), H: R5(L3.H), main: [...rect(L3.main), L3.main[4]], annex: L3.annex.map((a) => [a[0], ...rect(a.slice(1, 5)), ...a.slice(5)]), ground: L3.ground.map((a) => [a[0], ...rect(a.slice(1, 5))]), solid: L3.solid.map((a) => [a[0], ...rect(a.slice(1, 5)), a[5]]), props: L3.props.map((a) => a.length > 3 ? [a[0], ...rect(a.slice(1, 5))] : [a[0], P0(a[1]), P0(a[2])]) };
  }
  // 立ち退いた建物を、近くの空き地(南に道路か歩道があり、2タイル以内に道路)へ移す。番号・名前・住人はそのまま
  function siteRelocate(map2, list, placed) {
    const W2 = map2.W, H4 = map2.H, moved = [];
    const TR = T.ROAD, TC = T.CROSSING, isRoad = (k) => {
      const gd = map2.ground[k];
      return gd === TR || gd === TC;
    };
    const land = (x, y) => {
      if (x < 1 || y < 1 || x >= W2 - 1 || y >= H4 - 1) return false;
      const k = x + y * W2, gd = map2.ground[k];
      return map2.bid[k] < 0 && (!map2.solid[k] || map2.deco[k]) && (gd === T.GRASS || gd === T.FARM || gd === T.FOREST || gd === T.PADDY);
    };
    // 敷地(と1タイルの余白)の印。毎回 placed を走査しない
    const siteM = new Uint8Array(W2 * H4);
    for (const p of placed) for (let y = Math.max(0, p.y - 1); y < Math.min(H4, p.y + p.h + 1); y++) siteM.fill(1, y * W2 + Math.max(0, p.x - 1), y * W2 + Math.min(W2, p.x + p.w + 1));
    // ほかの施設の敷地(公園・屋敷・寺社・空港など)にも移さない
    for (const S2 of map2.sites || []) for (let y = Math.max(0, S2.y); y < Math.min(H4, S2.y + S2.h); y++) siteM.fill(1, y * W2 + Math.max(0, S2.x), y * W2 + Math.min(W2, S2.x + S2.w));
    const inSite = (x, y) => siteM[x + y * W2] === 1;
    // 置けない場所の積分画像(はじめの状態)と、ここで置いた建物の矩形(32マスの升目で引く)。矩形の判定を1回の引き算にする
    const S0 = new Int32Array((W2 + 1) * (H4 + 1));
    for (let y = 0; y < H4; y++) {
      let row = 0;
      for (let x = 0; x < W2; x++) {
        row += !land(x, y) || inSite(x, y) ? 1 : 0;
        S0[(y + 1) * (W2 + 1) + x + 1] = S0[y * (W2 + 1) + x + 1] + row;
      }
    }
    const placedG = /* @__PURE__ */ new Map(), GK = (gx, gy) => gx * 4096 + gy;
    const freeRect = (x, y, w, h) => {
      if (x < 1 || y < 1 || x + w > W2 - 1 || y + h > H4 - 1) return false;
      if (rectSum(S0, W2, x, y, w, h)) return false;
      for (let gx = x >> 5; gx <= x + w >> 5; gx++) for (let gy = y >> 5; gy <= y + h >> 5; gy++) for (const r of placedG.get(GK(gx, gy)) || []) if (x < r[0] + r[2] && r[0] < x + w && y < r[1] + r[3] && r[1] < y + h) return false;
      return true;
    };
    const markPlaced = (x, y, w, h) => {
      for (let gx = x >> 5; gx <= x + w >> 5; gx++) for (let gy = y >> 5; gy <= y + h >> 5; gy++) {
        const k = GK(gx, gy);
        (placedG.get(k) || placedG.set(k, []).get(k)).push([x, y, w, h]);
      }
    };
    // 道路の升目の索引(16マス)。置く場所の候補は「入口の1〜2マス下が道路」になる位置だけ(道路は移設で変わらない)
    const CS = 16, GW = Math.ceil(W2 / CS), GH = Math.ceil(H4 / CS), roadG = Array.from({ length: GW * GH }, () => []);
    for (let k = 0; k < W2 * H4; k++) if (isRoad(k)) roadG[(k % W2 / CS | 0) + (k / W2 / CS | 0) * GW].push(k);
    for (const b of list) {
      let done2 = false;
      // 近い順(正方形の輪 r=max(|dx|,|dy|)、同じ輪は dy・dx の小さい順。以前の探し方と同じ順)に、候補だけを調べる。
      // ふつうは近く(200マス以内)で見つかる。見つからなければ地図の広い範囲(700マス)まで探す(建物を地図から消さない)
      const hw = b.w >> 1, tx = b.x + hw, ty = b.y + b.h + 1, cx0 = Math.floor(tx / CS), cy0 = Math.floor(ty / CS);
      const seenP = /* @__PURE__ */ new Set(), bucket = [];
      let dNext = 0;
      for (let R = 0; !done2; R++) {
        for (let gy = cy0 - R; gy <= cy0 + R; gy++) for (let gx = cx0 - R; gx <= cx0 + R; gx += Math.abs(gy - cy0) === R || gx === cx0 + R ? 1 : 2 * R) {
          if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
          for (const k of roadG[gx + gy * GW]) {
            const rx = k % W2, ry = k / W2 | 0;
            for (const off of [1, 2]) {
              const x = rx - hw, y = ry - b.h - off, dx = x - b.x, dy = y - b.y, d = Math.max(Math.abs(dx), Math.abs(dy));
              if (d > 700 || seenP.has(x * 4096 + y)) continue;
              seenP.add(x * 4096 + y);
              (bucket[d] || (bucket[d] = [])).push({ dx, dy, x, y });
            }
          }
        }
        const last = (R - 1) * CS > 720, safe = last ? 700 : (R - 1) * CS - 3;
        // 距離ごとの組(同じ距離は dy・dx の小さい順)
        for (; dNext <= safe && !done2; dNext++) {
          const L4 = bucket[dNext];
          if (!L4) continue;
          L4.sort((a, c) => a.dy - c.dy || a.dx - c.dx);
          for (const c of L4) {
            if (done2) break;
            const { x, y } = c;
            if (x < 1 || y < 1 || x + b.w >= W2 - 1 || y + b.h + 1 >= H4) continue;
            const dxk0 = x + hw;
            if (!(isRoad(dxk0 + (y + b.h + 1) * W2) || y + b.h + 2 < H4 && isRoad(dxk0 + (y + b.h + 2) * W2))) continue;
            if (!freeRect(x - 1, y - 1, b.w + 2, b.h + 2)) continue;
            const k1 = dxk0 + (y + b.h + 1) * W2;
            for (let yy = y; yy < y + b.h; yy++) for (let xx = x; xx < x + b.w; xx++) {
              const k = xx + yy * W2;
              map2.bid[k] = b.idx;
              map2.solid[k] = 1;
              map2.deco[k] = 0;
            }
            markPlaced(x, y, b.w, b.h);
            moved.push({ id: b.id, from: [b.x, b.y], to: [x, y] });
            b.x = x;
            b.y = y;
            b.doorX = x + (b.w >> 1);
            b.doorY = y + b.h;
            const kd = b.doorX + b.doorY * W2;
            map2.deco[kd] = 0;
            map2.solid[kd] = 0;
            if (!isRoad(kd)) map2.ground[kd] = T.PLAZA;
            if (!isRoad(k1) && !isRoad(kd)) map2.ground[k1] = T.PLAZA;
            done2 = true;
          }
        }
        if (last) break;
      }
      if (!done2) moved.push({ id: b.id, failed: true });
    }
    return moved;
  }
  function applySite(map2, b, L3, at, displaced = []) {
    const W2 = map2.W, ox = at.x, oy = at.y, mir = !!L3.mirror;
    const X = (x, w = 1) => mir ? ox + L3.W - x - w : ox + x;
    const Y = (y) => oy + y;
    const set = (x, y, gd, solid2, bi) => {
      if (x < 0 || y < 0 || x >= W2 || y >= map2.H) return;
      const k = x + y * W2;
      if (gd != null) {
        if (map2.ground[k] === T.ROAD && map2.rmeta) {
          map2.rmeta.ax[k] = 0;
          map2.rmeta.th[k] = 0;
        }
        map2.ground[k] = gd;
      }
      map2.solid[k] = solid2 ? 1 : 0;
      map2.bid[k] = bi;
      map2.deco[k] = 0;
    };
    // v11 の敷地(校庭・プール・フェンス・付属の建物)を片付け、付属の建物はこの施設の新しい敷地で使う
    const OS = oldSiteOf(map2, b), parts = [];
    if (OS) {
      for (const pi of OS.parts || []) if (pi !== b.idx && map2.buildings[pi]) parts.push(map2.buildings[pi]);
      for (let y = OS.y; y < OS.y + OS.h; y++) for (let x = OS.x; x < OS.x + OS.w; x++) {
        if (x < 0 || y < 0 || x >= W2 || y >= map2.H) continue;
        const k = x + y * W2, bi = map2.bid[k];
        if (bi >= 0 && bi !== b.idx && !parts.some((q) => q.idx === bi)) continue;
        const gd = map2.ground[k];
        if (gd === T.ROAD || gd === T.RAIL || gd === T.PLATFORM || gd === T.CROSSING) continue;
        set(x, y, T.GRASS, 0, -1);
      }
      if (OS.lots) map2.lots = (map2.lots || []).filter((l) => !OS.lots.some((q) => q[0] === l.x && q[1] === l.y));
    }
    // 元の場所を空き地に
    b.x0 = b.x;
    b.y0 = b.y;
    for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) {
      const k = x + y * W2;
      if (map2.bid[k] === b.idx) set(x, y, T.GRASS, 0, -1);
    }
    // 敷地全体
    for (let y = 0; y < L3.H; y++) for (let x = 0; x < L3.W; x++) set(ox + x, oy + y, T.GRASS, 0, -1);
    const GD = { yard: T.SAND, paved: T.PLAZA, field: T.GRASS, court: T.PLAZA, keeperpath: T.PLAZA };
    for (const [kind, x, y, w, h] of L3.ground) for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) set(X(x + xx), Y(y + yy), GD[kind] ?? T.GRASS, 0, -1);
    // 門から本館までの通路と、門の外の歩道
    const gx = mir ? L3.W - 1 - at.gx : at.gx;
    for (let yy = L3.H - 3; yy < L3.H; yy++) for (let xx = -2; xx <= 2; xx++) set(ox + at.gx + xx, oy + yy, T.PLAZA, 0, -1);
    if (![T.ROAD, T.CROSSING].includes(map2.ground[ox + at.gx + (oy + L3.H) * W2])) for (let xx = -2; xx <= 2; xx++) set(ox + at.gx + xx, oy + L3.H, T.PLAZA, 0, -1);
    void gx;
    // 本館(施設の建物そのもの。番号はそのまま)
    const [mx, my, mw, mh, mf] = L3.main;
    b.x = X(mx, mw);
    b.y = Y(my);
    b.w = mw;
    b.h = mh;
    b.floors = Math.max(b.floors || 1, mf);
    b.nf = mf;
    b.doorX = b.x + (mw >> 1);
    b.doorY = b.y + mh;
    b.siteI = map2.fsites.length;
    for (let y = b.y; y < b.y + mh; y++) for (let x = b.x; x < b.x + mw; x++) set(x, y, null, 1, b.idx);
    set(b.doorX, b.doorY, T.PLAZA, 0, -1);
    const site = { b: b.idx, type: b.type, x: ox, y: oy, w: L3.W, h: L3.H, gate: [ox + at.gx - 2, ox + at.gx + 2], annex: [], solid: [], props: [], ground: L3.ground.map(([k, x, y, w, h]) => [k, X(x, w), Y(y), w, h]), open: !!L3.open, mir };
    map2.fsites.push(site);
    // 同じ名前の大学が近くに複数ある場合(生成時の重複)は、同じキャンパスの学部棟として使う(番号・学生・教員はそのまま)
    const base = b.name.replace(/第\d+$/, "");
    const sib = b.type === "univ" ? map2.buildings.filter((q) => q !== b && q.type === "univ" && q.siteI == null && q.name.replace(/第\d+$/, "") === base && Math.abs(q.x - (b.x0 ?? b.x)) + Math.abs(q.y - (b.y0 ?? b.y)) < 260) : [];
    // 付属棟(建物一覧の末尾へ。学部棟は上の同名の大学の建物を使う)
    for (const [kind, x, y, w, h, nf, label, kit] of L3.annex) {
      // v11 の付属の建物を同じ役割の場所へ(学校の「ジム」は体育館として使う。商業ジムの客は来ない)
      const want = { gym: ["gym"], lib: ["library"], fac: ["lab", "univ"], cafe: ["cafe", "restaurant"], food: ["restaurant", "cafe"], shop: ["shop"] }[kind] || [];
      const pi = parts.findIndex((q) => want.includes(q.type));
      const re = pi >= 0 ? parts.splice(pi, 1)[0] : kind === "fac" || kind === "lib" || kind === "hall" ? sib.shift() : null;
      if (re) {
        for (let yy = re.y; yy < re.y + re.h; yy++) for (let xx = re.x; xx < re.x + re.w; xx++) if (map2.bid[xx + yy * W2] === re.idx) set(xx, yy, T.GRASS, 0, -1);
        Object.assign(re, { x0: re.x, y0: re.y, x: X(x, w), y: Y(y), w, h, floors: nf, nf, kit, kind, siteI: b.siteI, campusOf: b.idx, name: `${base} ${label}` });
        re.doorX = re.x + (w >> 1);
        re.doorY = re.y + h;
        for (let yy = re.y; yy < re.y + h; yy++) for (let xx = re.x; xx < re.x + w; xx++) set(xx, yy, null, 1, re.idx);
        if (map2.ground[re.doorX + re.doorY * W2] === T.GRASS) set(re.doorX, re.doorY, T.PLAZA, 0, -1);
        site.annex.push(re.idx);
        continue;
      }
      const idx = map2.buildings.length;
      const a = { idx, id: "B" + String(idx).padStart(4, "0"), type: "annex", kind, kit, siteI: b.siteI, parentB: b.idx, name: `${base} ${label}`, x: X(x, w), y: Y(y), w, h, floors: nf, nf, zone: b.zone, addr: b.addr };
      a.doorX = a.x + (w >> 1);
      a.doorY = a.y + h;
      map2.buildings.push(a);
      for (let yy = a.y; yy < a.y + h; yy++) for (let xx = a.x; xx < a.x + w; xx++) set(xx, yy, null, 1, idx);
      if (map2.ground[a.doorX + a.doorY * W2] === T.GRASS) set(a.doorX, a.doorY, T.PLAZA, 0, -1);
      site.annex.push(idx);
    }
    // 使わなかった v11 の付属の建物(公園など)は近くへ移す
    for (const q of parts) {
      for (let yy = q.y; yy < q.y + q.h; yy++) for (let xx = q.x; xx < q.x + q.w; xx++) if (map2.bid[xx + yy * W2] === q.idx) set(xx, yy, T.GRASS, 0, -1);
      displaced.push(q);
    }
    if (OS) {
      Object.assign(OS, { x: ox, y: oy, w: L3.W, h: L3.H, parts: [b.idx, ...site.annex] });
      delete OS.pool;
      delete OS.lots;
    }
    // 立入不可の設備(プール・獣舎)
    for (const [kind, x, y, w, h, ex] of L3.solid) {
      const r = { kind, x: X(x, w), y: Y(y), w, h, ...ex || {} };
      site.solid.push(r);
      for (let yy = r.y; yy < r.y + h; yy++) for (let xx = r.x; xx < r.x + w; xx++) set(xx, yy, kind === "lake" ? T.WATER : kind === "pool" || r.big ? T.PLAZA : T.SAND, 1, -1);
    }
    for (const [kind, x, y, w, h] of L3.props) site.props.push({ kind, x: X(x, w || 1), y: Y(y), w: w || 1, h: h || 1 });
    // 外周フェンス(門は開ける)
    site.fence = [];
    for (let x = 0; x < L3.W; x++) for (const y of [0, L3.H - 1]) {
      if (y === L3.H - 1 && ox + x >= site.gate[0] && ox + x <= site.gate[1]) continue;
      const k = ox + x + (oy + y) * W2;
      if (map2.bid[k] >= 0) continue;
      map2.solid[k] = 1;
      site.fence.push([ox + x, oy + y, y === 0 ? "n" : "s"]);
    }
    for (let y = 1; y < L3.H - 1; y++) for (const x of [0, L3.W - 1]) {
      const k = ox + x + (oy + y) * W2;
      if (map2.bid[k] >= 0) continue;
      map2.solid[k] = 1;
      site.fence.push([ox + x, oy + y, x === 0 ? "w" : "e"]);
    }
  }
  // ---- 描画: 地面の上の線(トラック・サッカー/野球・テニス・プール・獣舎の地面)
  function drawSiteGround(c, P2, Z, map2, hero, t) {
    if (!map2.fsites) return;
    const pt = (u, v) => [P2.X(u, v), P2.Y(u, v, 0.01)];
    const quad = (x0, y0, x1, y1, fill, stroke) => {
      const a = [pt(x0, y0), pt(x1, y0), pt(x1, y1), pt(x0, y1)];
      c.beginPath();
      c.moveTo(...a[0]);
      for (const q of a.slice(1)) c.lineTo(...q);
      c.closePath();
      if (fill) {
        c.fillStyle = fill;
        c.fill();
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.stroke();
      }
    };
    c.save();
    c.lineWidth = Math.max(1, Z * 0.35);
    for (const s of map2.fsites) {
      if (s.x > hero.x + 60 || s.x + s.w < hero.x - 60 || s.y > hero.y + 50 || s.y + s.h < hero.y - 50) continue;
      for (const p of s.props) {
        if (p.kind === "track") {
          // 楕円のトラック(白線2本)
          const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
          for (const k of [0.42, 0.36]) {
            c.strokeStyle = "rgba(255,255,255,0.85)";
            c.beginPath();
            for (let i = 0; i <= 40; i++) {
              const a = i / 40 * Math.PI * 2, u = cx + Math.cos(a) * p.w * k, v = cy + Math.sin(a) * p.h * k;
              const q = pt(u, v);
              i ? c.lineTo(...q) : c.moveTo(...q);
            }
            c.stroke();
          }
        } else if (p.kind === "diamond") {
          const a = [pt(p.x + 1, p.y + p.h - 1), pt(p.x + p.w * 0.55, p.y + p.h - 1), pt(p.x + p.w * 0.55, p.y + p.h * 0.45), pt(p.x + 1, p.y + p.h * 0.45)];
          c.fillStyle = "#c9a26a";
          c.beginPath();
          c.moveTo(...a[0]);
          a.slice(1).forEach((q) => c.lineTo(...q));
          c.closePath();
          c.fill();
          c.strokeStyle = "#fff";
          c.stroke();
        } else if ((p.kind === "pitch" || p.kind === "lot" || p.kind === "flower") && typeof bigGround === "function") {
          bigGround(c, P2, Z, p, quad, pt);
        } else if (p.kind === "tennis") {
          quad(p.x + 0.3, p.y + 0.3, p.x + p.w - 0.3, p.y + p.h - 0.3, "#3f7f5a", "#fff");
          quad(p.x + 0.3, p.y + p.h / 2 - 0.05, p.x + p.w - 0.3, p.y + p.h / 2 + 0.05, "#eee");
        }
      }
      for (const r of s.solid) {
        if (r.kind === "pool") {
          quad(r.x, r.y, r.x + r.w, r.y + r.h, "#dfe6ea");
          quad(r.x + 0.5, r.y + 0.5, r.x + r.w - 0.5, r.y + r.h - 0.5, "#3f9fd8");
          c.strokeStyle = "rgba(255,255,255,0.7)";
          for (let k = 1; k < 6; k++) {
            const v = r.y + 0.5 + (r.h - 1) * k / 6, a = pt(r.x + 0.6, v), b2 = pt(r.x + r.w - 0.6, v);
            c.beginPath();
            c.moveTo(...a);
            c.lineTo(...b2);
            c.stroke();
          }
        } else if (r.kind === "ex") {
          const S2 = ZOO_SP[r.sp];
          quad(r.x, r.y, r.x + r.w, r.y + r.h, S2 ? S2.ground : "#c9b48a");
          if (S2 && S2.pond) quad(r.x + r.w * 0.55, r.y + 1, r.x + r.w - 1, r.y + r.h * 0.45, "#5f9fc6");
          if (S2 && S2.rock) quad(r.x + 1, r.y + r.h - 3, r.x + r.w - 1, r.y + r.h - 1, "#5f9fc6");
        }
      }
    }
    c.restore();
  }
  // ---- 描画: 高さのある設備(フェンス・遊具・ゴール・バックネット・獣舎の動物・木)
  function siteOutdoor(R5, hero, push, P2, Z) {
    const map2 = R5.g.world.map;
    if (!map2.fsites) return;
    const t = R5.time || 0;
    for (const s of map2.fsites) {
      if (s.x > hero.x + 50 || s.x + s.w < hero.x - 50 || s.y > hero.y + 40 || s.y + s.h < hero.y - 40) continue;
      for (const [x, y, side] of s.fence) {
        if (Math.abs(x - hero.x) > 40 || Math.abs(y - hero.y) > 34) continue;
        const u = x + 0.5, v = y + 0.5;
        push(x, y, x + 1, y + 1, P2.X(u - 1, v + 1) - 2, P2.X(u + 1, v - 1) + 2, P2.Y(u, v, 2) - 2, P2.Y(u, v, 0) + 4 * Z, (c) => {
          const horiz = side === "n" || side === "s";
          const a0 = horiz ? [x, v] : [u, y], a1 = horiz ? [x + 1, v] : [u, y + 1];
          const h2 = s.type === "zoo" ? 1.6 : 1.4;
          c.fillStyle = "#6b6f78";
          const p0 = [P2.X(...a0), P2.Y(...a0, 0)], q0 = [P2.X(...a0), P2.Y(...a0, h2)];
          c.fillRect(p0[0] - 0.4 * Z, q0[1], 0.8 * Z, p0[1] - q0[1]);
          c.strokeStyle = s.type === "zoo" ? "#5a4636" : "rgba(120,130,140,0.9)";
          c.lineWidth = Math.max(1, 0.4 * Z);
          for (const zz of s.type === "zoo" ? [0.5, 1.4] : [0.3, 1.3]) {
            c.beginPath();
            c.moveTo(P2.X(...a0), P2.Y(...a0, zz));
            c.lineTo(P2.X(...a1), P2.Y(...a1, zz));
            c.stroke();
          }
          if (s.type !== "zoo") {
            c.strokeStyle = "rgba(150,160,170,0.35)";
            for (let k = 1; k < 4; k++) {
              const f2 = k / 4, ax = a0[0] + (a1[0] - a0[0]) * f2, ay = a0[1] + (a1[1] - a0[1]) * f2;
              c.beginPath();
              c.moveTo(P2.X(ax, ay), P2.Y(ax, ay, 0.3));
              c.lineTo(P2.X(ax, ay), P2.Y(ax, ay, 1.3));
              c.stroke();
            }
          }
        });
      }
      for (const p of s.props) {
        if (["track", "diamond", "tennis", "pitch", "lot", "flower"].includes(p.kind)) continue;
        // 大きな設備(照明塔・煙突・屋台・待ち列など: bigsites.js)
        if (typeof BIG_DRAW !== "undefined" && BIG_DRAW[p.kind]) {
          bigPush(R5, push, P2, Z, p, hero, t);
          continue;
        }
        if (Math.abs(p.x - hero.x) > 40 || Math.abs(p.y - hero.y) > 34) continue;
        const u = p.x + 0.5, v = p.y + 0.5;
        push(p.x, p.y, p.x + 1, p.y + 1, P2.X(u, v) - 30 * Z, P2.X(u, v) + 30 * Z, P2.Y(u, v, 5) - 10 * Z, P2.Y(u, v, 0) + 6 * Z, (c) => drawSiteProp(c, P2, Z, p, t));
      }
      for (const r of s.solid) if (r.big && typeof BIG_DRAW !== "undefined") bigPush(R5, push, P2, Z, r, hero, t);
      for (const r of s.solid) if (r.kind === "ex") {
        if (Math.abs(r.x + r.w / 2 - hero.x) > 50 || Math.abs(r.y + r.h / 2 - hero.y) > 40) continue;
        const pt = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
        push(r.x, r.y, r.x + r.w, r.y + r.h, P2.X(r.x, r.y + r.h) - 20 * Z, P2.X(r.x + r.w, r.y) + 20 * Z, P2.Y(r.x, r.y, 8) - 20 * Z, P2.Y(r.x + r.w, r.y + r.h, 0) + 6 * Z, (c) => {
          const S2 = ZOO_SP[r.sp];
          if (!S2) return;
          // 1単位の高さ(px)から大きさを決める(人の背丈との比をそろえる)
          const zp = P2.Y(r.x, r.y, 0) - P2.Y(r.x, r.y, 1), k0 = zp * ZOO_OUT_K;
          // 岩山・木(展示の地形)
          if (S2.rock) {
            // サル山: 大小の岩を積んだ山(奥から手前へ描く)。手前は堀(水)
            const cx = r.x + r.w / 2, cy = r.y + r.h / 2 - 1;
            const rocks = [];
            for (let j = 0; j < 14; j++) {
              const a = j / 14 * 6.283, rr = j < 4 ? 0.6 : j < 9 ? 2 : 3.4;
              rocks.push({ u: cx + Math.cos(a * 1.7 + j) * rr * 1.2, v: cy + Math.sin(a * 1.7 + j) * rr, z: j < 4 ? 2.6 : j < 9 ? 1.4 : 0.4, s: j < 4 ? 1.4 : j < 9 ? 1.7 : 1.9 });
            }
            rocks.sort((p0, p1) => p0.u + p0.v - (p1.u + p1.v));
            for (const q of rocks) {
              const top = pt(q.u, q.v, q.z + q.s * 0.8), l = pt(q.u - q.s * 0.6, q.v + q.s * 0.6, q.z), rt = pt(q.u + q.s * 0.6, q.v - q.s * 0.6, q.z), bt = pt(q.u + q.s * 0.4, q.v + q.s * 0.6, Math.max(0, q.z - 0.6));
              c.fillStyle = "#8d8a7e"; c.beginPath(); c.moveTo(...l); c.lineTo(...top); c.lineTo(...bt); c.closePath(); c.fill();
              c.fillStyle = "#6f6c62"; c.beginPath(); c.moveTo(...top); c.lineTo(...rt); c.lineTo(...bt); c.closePath(); c.fill();
            }
          }
          if (S2.tree || r.sp === "giraffe" || r.sp === "elephant" || r.sp === "birds") for (let j = 0; j < (S2.tree || S2.net ? 4 : 2); j++) {
            const u = r.x + 1.5 + (uh(r.x * 7 + j, 3) % 100) / 100 * (r.w - 3), v = r.y + 1.2 + (uh(r.y * 5 + j, 4) % 100) / 100 * (r.h * 0.4);
            const g0 = pt(u, v, 0), g1 = pt(u, v, 3);
            c.fillStyle = "#6b4a2a"; c.fillRect(g0[0] - 0.12 * zp, g1[1], 0.24 * zp, g0[1] - g1[1]);
            c.fillStyle = r.sp === "giraffe" ? "#6f9a4a" : "#4f8a3e";
            c.beginPath(); c.ellipse(g1[0], g1[1], 1.1 * zp, 0.8 * zp, 0, 0, 7); c.fill();
          }
          // 動物: 種類ごとの定位置のまわりをゆっくり歩く(瞬間移動しない)
          // 広い獣舎ほど群れを大きく(最大2.5倍)
          const n2 = Math.round(S2.n * (r.sp === "birds" || r.sp === "monkey" ? 1.4 : 1) * Math.min(2.5, Math.max(1, Math.sqrt(r.w * r.h / 320))));
          for (let i = 0; i < n2; i++) {
            const ph = i * 1.7 + r.x, sp2 = 0.05 * (1 + i % 3) / (r.sp === "elephant" || r.sp === "giraffe" ? 2 : 1);
            const bx = 0.15 + 0.7 * ((uh(r.x * 13 + i, 11) % 1e3) / 1e3), by = 0.25 + 0.6 * ((uh(r.y * 17 + i, 12) % 1e3) / 1e3);
            const uu = r.x + 1 + (r.w - 2) * Math.min(0.92, Math.max(0.08, bx + Math.sin(t * sp2 + ph) * 0.12));
            const vv = r.y + 1 + (r.h - 2) * Math.min(0.92, Math.max(0.08, by + Math.cos(t * sp2 * 0.8 + ph) * 0.1));
            const q = pt(uu, vv, r.sp === "birds" ? 1.5 + Math.sin(t * 0.3 + i) : S2.rock ? Math.max(0, 3 - Math.hypot(uu - r.x - r.w / 2, vv - r.y - r.h / 2 + 1) * 0.6) : 0), face = Math.cos(t * sp2 + ph) > 0 ? 1 : -1;
            zooAnimal(c, r.sp, q[0], q[1], k0 * ({ elephant: 1.9, giraffe: 1.45, lion: 1.15, kangaroo: 1.1, flamingo: 1.05 }[r.sp] || 1), t + ph, face, i);
          }
          // 手前と右の柵(支柱と2段の横木)
          c.fillStyle = "#5a4636";
          for (let k = 0; k <= r.w; k++) { const a = pt(r.x + k, r.y + r.h, 0), b2 = pt(r.x + k, r.y + r.h, 1.4); c.fillRect(a[0] - 0.08 * zp, b2[1], 0.16 * zp, a[1] - b2[1]); }
          for (let k = 0; k <= r.h; k++) { const a = pt(r.x + r.w, r.y + k, 0), b2 = pt(r.x + r.w, r.y + k, 1.4); c.fillRect(a[0] - 0.08 * zp, b2[1], 0.16 * zp, a[1] - b2[1]); }
          c.strokeStyle = "#6b5440";
          c.lineWidth = Math.max(1, zp * 0.08);
          for (const zz of [0.6, 1.3]) {
            c.beginPath();
            c.moveTo(...pt(r.x, r.y + r.h, zz)); c.lineTo(...pt(r.x + r.w, r.y + r.h, zz)); c.lineTo(...pt(r.x + r.w, r.y, zz));
            c.stroke();
          }
          // 看板
          if (S2.net) {
            c.fillStyle = "rgba(220,225,230,0.18)";
            c.beginPath();
            c.moveTo(...pt(r.x, r.y, 6));
            c.lineTo(...pt(r.x + r.w, r.y, 6));
            c.lineTo(...pt(r.x + r.w, r.y + r.h, 6));
            c.lineTo(...pt(r.x, r.y + r.h, 6));
            c.closePath();
            c.fill();
          }
          const sg = pt(r.x + r.w / 2, r.y + r.h, 1.8);
          c.font = `bold ${Math.max(8, 2.8 * Z)}px ${SIGN_FONT}`;
          const tw = c.measureText(S2.name).width;
          c.fillStyle = "#3d5a2a";
          c.fillRect(sg[0] - tw / 2 - 4, sg[1] - 3 * Z, tw + 8, 5 * Z);
          c.fillStyle = "#fff";
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(S2.name, sg[0], sg[1] - 0.5 * Z);
        });
      }
    }
  }
  // 屋外の動物の大きさ(高さ1単位あたり)。ゾウの肩高が人の背丈の約2倍になる値
  var ZOO_OUT_K = 0.3;
  function drawSiteProp(c, P2, Z, p, t) {
    const u = p.x + 0.5, v = p.y + 0.5, pt = (a, b, z) => [P2.X(a, b), P2.Y(a, b, z)];
    // 高さ1単位の画面上の長さ(木・ベンチ・噴水の大きさはこれに合わせる)
    const zp = P2.Y(u, v, 0) - P2.Y(u, v, 1);
    const line = (a, b, col, w) => {
      c.strokeStyle = col;
      c.lineWidth = Math.max(1, w * Z);
      c.beginPath();
      c.moveTo(...a);
      c.lineTo(...b);
      c.stroke();
    };
    if (p.kind === "goal" || p.kind === "goalL") {
      const dv = 1.2;
      line(pt(u, v - dv, 0), pt(u, v - dv, 1.2), "#fff", 0.4);
      line(pt(u, v + dv, 0), pt(u, v + dv, 1.2), "#fff", 0.4);
      line(pt(u, v - dv, 1.2), pt(u, v + dv, 1.2), "#fff", 0.4);
      c.fillStyle = "rgba(255,255,255,0.18)";
      c.fillRect(Math.min(pt(u, v - dv, 1.2)[0], pt(u, v + dv, 0)[0]), pt(u, v - dv, 1.2)[1], Math.abs(pt(u, v + dv, 0)[0] - pt(u, v - dv, 1.2)[0]) || 4, 1.2 * 12 * Z);
    } else if (p.kind === "backstop") {
      for (let k = 0; k < 6; k++) line(pt(u + k * 0.5, v, 0), pt(u + k * 0.5, v, 3), "#6b6f78", 0.3);
      c.fillStyle = "rgba(140,150,160,0.25)";
      const a = pt(u, v, 3), b2 = pt(u + 2.5, v, 0);
      c.fillRect(a[0], a[1], b2[0] - a[0], b2[1] - a[1]);
    } else if (p.kind === "slide") {
      line(pt(u, v, 0), pt(u, v, 1.4), "#c83a3a", 0.5);
      line(pt(u, v, 1.4), pt(u + 1.6, v, 0.1), "#f2c23a", 0.8);
    } else if (p.kind === "swing") {
      line(pt(u - 0.8, v, 0), pt(u - 0.8, v, 1.8), "#4a6a9a", 0.4);
      line(pt(u + 0.8, v, 0), pt(u + 0.8, v, 1.8), "#4a6a9a", 0.4);
      line(pt(u - 0.8, v, 1.8), pt(u + 0.8, v, 1.8), "#4a6a9a", 0.4);
      const sw = Math.sin(t * 1.6) * 0.3;
      line(pt(u - 0.3, v, 1.8), pt(u - 0.3 + sw, v, 0.5), "#888", 0.2);
      line(pt(u + 0.3, v, 1.8), pt(u + 0.3 + sw, v, 0.5), "#888", 0.2);
    } else if (p.kind === "jungle" || p.kind === "iron_bar") {
      for (let k = 0; k < 3; k++) line(pt(u + k * 0.5, v, 0), pt(u + k * 0.5, v, 1.2), "#3a8a4a", 0.3);
      line(pt(u, v, 1.2), pt(u + 1, v, 1.2), "#3a8a4a", 0.3);
    } else if (p.kind === "sandbox") {
      c.fillStyle = "#e6d5a0";
      const a = pt(u, v, 0.1), b2 = pt(u + 1.5, v + 1, 0.1);
      c.fillRect(Math.min(a[0], b2[0]), a[1], Math.abs(b2[0] - a[0]) + 4, 6 * Z);
    } else if (p.kind === "bike") {
      c.fillStyle = "rgba(90,100,110,0.8)";
      const a = pt(u, v, 2.2);
      c.fillRect(a[0] - 10 * Z, a[1], 20 * Z, 1.5 * Z);
      for (let k = 0; k < 6; k++) {
        const q = pt(u - 0.8 + k * 0.32, v, 0.5);
        c.strokeStyle = ["#c33", "#33a", "#2a2", "#aa3", "#444", "#c6c"][k];
        c.lineWidth = Math.max(1, 0.3 * Z);
        c.beginPath();
        c.arc(q[0], q[1], 1.6 * Z, 0, 7);
        c.stroke();
      }
    } else if (p.kind === "tree") {
      const a = pt(u, v, 0), b2 = pt(u, v, 3);
      c.fillStyle = "#6b4a2a";
      c.fillRect(a[0] - 0.6 * Z, b2[1], 1.2 * Z, a[1] - b2[1]);
      c.fillStyle = "#4f8a3e";
      c.beginPath();
      c.ellipse(b2[0], b2[1], 1.5 * zp, 1.15 * zp, 0, 0, 7);
      c.fill();
      c.fillStyle = "#5f9a4a";
      c.beginPath();
      c.ellipse(b2[0] - 0.4 * zp, b2[1] - 0.45 * zp, 0.9 * zp, 0.7 * zp, 0, 0, 7);
      c.fill();
    } else if (p.kind === "bench") {
      c.fillStyle = "#8d6e4f";
      const a = pt(u, v, 0.45);
      c.fillRect(a[0] - 0.9 * zp, a[1], 1.8 * zp, 0.25 * zp);
      c.fillRect(a[0] - 0.9 * zp, a[1] - 0.35 * zp, 1.8 * zp, 0.18 * zp);
    } else if (p.kind === "fountain") {
      // 噴水: 丸い池と水しぶき
      const a = pt(u, v, 0.3);
      c.fillStyle = "#c9c2b0";
      c.beginPath();
      c.ellipse(a[0], a[1], 3.4 * zp, 1.7 * zp, 0, 0, 7);
      c.fill();
      c.fillStyle = "#6cbfe0";
      c.beginPath();
      c.ellipse(a[0], a[1], 2.9 * zp, 1.45 * zp, 0, 0, 7);
      c.fill();
      for (let i = 0; i < 6; i++) {
        const ph = ((t * 0.8 + i / 6) % 1 + 1) % 1, b2 = pt(u, v, 0.4 + ph * 3.5);
        c.fillStyle = `rgba(255,255,255,${(0.8 * (1 - ph)).toFixed(2)})`;
        c.beginPath();
        c.arc(b2[0] + Math.cos(i) * ph * 0.9 * zp, b2[1], (0.2 + ph * 0.15) * zp, 0, 7);
        c.fill();
      }
    } else if (p.kind === "lamp") {
      const a = pt(u, v, 0), b2 = pt(u, v, 4);
      c.fillStyle = "#4a4f58";
      c.fillRect(a[0] - 0.4 * Z, b2[1], 0.8 * Z, a[1] - b2[1]);
      c.fillStyle = "#fff6d0";
      c.beginPath();
      c.arc(b2[0], b2[1], 1.4 * Z, 0, 7);
      c.fill();
    }
  }
