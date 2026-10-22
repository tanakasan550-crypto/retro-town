  // src/lives.js
  var TRAITS = ["\u307E\u3058\u3081", "\u306E\u3093\u3073\u308A", "\u4E16\u8A71\u597D\u304D", "\u8CA0\u3051\u305A\u5ACC\u3044", "\u304A\u3057\u3083\u3079\u308A", "\u4EBA\u898B\u77E5\u308A", "\u304D\u308C\u3044\u597D\u304D", "\u98DF\u3044\u3057\u3093\u574A", "\u3053\u3064\u3053\u3064\u578B", "\u597D\u5947\u5FC3\u65FA\u76DB", "\u5FC3\u914D\u6027", "\u304A\u304A\u3089\u304B"];
  var HOBBIES = ["\u91E3\u308A", "\u5712\u82B8", "\u8AAD\u66F8", "\u6599\u7406", "\u6563\u6B69", "\u30B2\u30FC\u30E0", "\u624B\u82B8", "\u91CE\u7403\u89B3\u6226", "\u5199\u771F", "\u97F3\u697D", "\u30C9\u30E9\u30A4\u30D6", "\u6E29\u6CC9\u3081\u3050\u308A", "\u5C06\u68CB", "\u6620\u753B"];
  var REL_JA = { spouse: "\u914D\u5076\u8005", parent: "\u89AA", child: "\u5B50", sibling: "\u304D\u3087\u3046\u3060\u3044", coworker: "\u540C\u50DA", classmate: "\u540C\u7D1A\u751F", oldfriend: "\u65E7\u53CB", neighbor: "\u8FD1\u6240\u306E\u4EBA", friend: "\u53CB\u4EBA", late: "\u6545\u4EBA", excoworker: "\u5143\u540C\u50DA" };
  var relName = (k) => REL_JA[k] || k;
  var INV = { spouse: "spouse", parent: "child", child: "parent", sibling: "sibling", coworker: "coworker", classmate: "classmate", oldfriend: "oldfriend", neighbor: "neighbor", friend: "friend" };
  var yearOf = (M) => 1900 + Math.floor(M / 12);
  function newLife(id) {
    return { traits: [], hobby: "", mood: 60, life: [], mem: [], rel: [], chg: 0, nHero: 0 };
  }
  function lifeNote(world, id, M, kind, text) {
    const L2 = world.lives.get(id);
    if (!L2) return;
    L2.life.push({ M, k: kind, text });
    if (L2.life.length > 50) L2.life.splice(2, 1);
    L2.chg++;
  }
  function remember(world, id, M, text, o = {}) {
    const L2 = world.lives.get(id);
    if (!L2) return false;
    const w = o.w ?? 1;
    L2.mem.push({ M, text, w, who: o.who ?? -1 });
    if (L2.mem.length > 24) {
      const cores = L2.mem.filter((m) => m.who === world.heroId && m.w >= 3).sort((x, y) => x.M - y.M);
      const keep = new Set(cores.slice(0, 3).concat(cores.slice(-5)));
      let k = -1, best = 1e18;
      for (let i = 0; i < L2.mem.length - 8; i++) {
        const m = L2.mem[i];
        const sc = (keep.has(m) ? 1e12 : 0) + m.w * 1e3 + m.M;
        if (sc < best) {
          best = sc;
          k = i;
        }
      }
      if (k < 0) k = 0;
      L2.mem.splice(k, 1);
    }
    return true;
  }
  function addRel(world, id, other, kind, aff) {
    const L2 = world.lives.get(id);
    if (!L2 || other === id || other < 0) return;
    const e = L2.rel.find((r) => r.id === other);
    if (e) {
      if (kind === "friend" && e.k !== "spouse" && e.k !== "parent" && e.k !== "child" && e.k !== "sibling") e.k = e.k === "coworker" || e.k === "classmate" ? e.k : "friend";
      e.aff = Math.max(e.aff, aff);
      return;
    }
    L2.rel.push({ id: other, k: kind, aff });
    if (L2.rel.length > 16) {
      let k = -1, lo = 1e9;
      L2.rel.forEach((r, i) => {
        if (["spouse", "parent", "child"].includes(r.k)) return;
        if (r.aff < lo) {
          lo = r.aff;
          k = i;
        }
      });
      if (k >= 0) L2.rel.splice(k, 1);
    }
  }
  function addMutual(world, a, b, kind, aff) {
    addRel(world, a, b, kind, aff);
    if (world.lives.has(b)) addRel(world, b, a, INV[kind] || kind, aff);
  }
  function genLife(world, id, rng) {
    if (world.lives.has(id)) return world.lives.get(id);
    const p = world.pop, M = world.M, B2 = world.map.buildings;
    const L2 = newLife(id);
    world.lives.set(id, L2);
    const age = Math.floor((M - p.born[id]) / 12);
    const h = hash2(id, 8128);
    L2.traits = [TRAITS[h % TRAITS.length], TRAITS[(h >>> 7) % TRAITS.length]];
    if (L2.traits[0] === L2.traits[1]) L2.traits[1] = TRAITS[((h >>> 7) + 3) % TRAITS.length];
    L2.hobby = HOBBIES[(h >>> 13) % HOBBIES.length];
    L2.mood = 50 + h % 30;
    const hb = p.home[id];
    const area = hb >= 0 ? B2[hb].addr : "\u9752\u6D77";
    const push = (m, k, t) => {
      if (m <= M) L2.life.push({ M: m, k, text: t });
    };
    push(p.born[id], "birth", `${area}\u306E\u8FD1\u304F\u3067\u751F\u307E\u308C\u305F`);
    push(p.born[id], "birth", hb >= 0 ? `${B2[hb].name}\u3067\u5BB6\u65CF\u306B\u8FCE\u3048\u3089\u308C\u305F` : "\u5BB6\u65CF\u306B\u8FCE\u3048\u3089\u308C\u305F");
    const near2 = (lv) => {
      const l = world.schools[lv];
      return l && l.length && hb >= 0 ? B2[world.nearestSchool(l, hb)].name : null;
    };
    if (age >= 1) push(p.born[id] + 11 + h % 3, "growth", "\u306F\u3058\u3081\u3066\u7ACB\u3061\u4E0A\u304C\u3063\u305F");
    if (age >= 2) push(p.born[id] + 20 + h % 5, "growth", "\u306F\u3058\u3081\u3066\u306E\u8A00\u8449\u3092\u8A71\u3057\u305F");
    if (age >= 6) {
      const n2 = near2(2);
      if (n2) push(p.born[id] + 6 * 12 + 3, "school", `${n2}\u306B\u5165\u5B66\u3057\u305F`);
    }
    if (age >= 12) {
      const n2 = near2(3);
      if (n2) push(p.born[id] + 12 * 12 + 3, "school", `${n2}\u306B\u5165\u5B66\u3057\u305F`);
    }
    if (age >= 15) {
      const l = world.schools[4];
      if (l.length) push(p.born[id] + 15 * 12 + 3, "school", `${B2[l[(h >>> 3) % l.length]].name}\u306B\u5165\u5B66\u3057\u305F`);
    }
    if (age >= 18 && p.edu[id] >= 5) {
      const l = world.schools[5];
      if (l.length) push(p.born[id] + 18 * 12 + 3, "school", `${B2[l[(h >>> 5) % l.length]].name}\u306B\u9032\u5B66\u3057\u305F`);
    }
    if (age >= 10) push(p.born[id] + (10 + h % 5) * 12, "hobby", `${L2.hobby}\u306B\u306F\u307E\u3063\u305F`);
    const pr = world.profOf(id);
    for (const e of pr.hist) {
      if (e.k === "start" || e.k === "quit" || e.k === "promo" || e.k === "qual") {
        const T4 = e.k === "start" ? `${JOBS[e.job]?.name || "\u4ED5\u4E8B"}\u3068\u3057\u3066\u50CD\u304D\u59CB\u3081\u305F` : e.k === "quit" ? `${JOBS[e.job]?.name || "\u4ED5\u4E8B"}\u306E\u4ED5\u4E8B\u3092\u8F9E\u3081\u305F` : e.k === "promo" ? "\u6607\u9032\u3057\u305F" : "\u8CC7\u683C\u3092\u53D6\u5F97\u3057\u305F";
        push(e.M, "job", T4);
      }
    }
    if (p.spouse[id] >= 0) {
      const s = p.spouse[id];
      const sm = Math.max(p.born[id], p.born[s]) + (22 + h % 6) * 12;
      push(Math.min(sm, M - 1), "marry", `${world.nm(s)}\u3068\u7D50\u5A5A\u3057\u305F`);
    }
    for (const c of world.childrenOf(id)) push(p.born[c], "child", `${world.nm(c)}\u304C\u751F\u307E\u308C\u305F`);
    if (age >= 65) push(p.born[id] + 65 * 12, "retire", "\u5B9A\u5E74\u3092\u8FCE\u3048\u305F");
    L2.life.sort((a, b) => a.M - b.M);
    const fam = (o, k, aff) => {
      if (o >= 0) addMutual(world, id, o, k, aff);
    };
    fam(p.spouse[id], "spouse", 70 + h % 25);
    for (const o of [p.mother[id], p.father[id]]) if (o >= 0 && !p.gone[o]) fam(o, "parent", 55 + hash2(id, o) % 35);
    for (const c of world.childrenOf(id)) if (!p.gone[c]) fam(c, "child", 60 + hash2(id, c) % 35);
    if (p.mother[id] >= 0) {
      for (const s of world.childrenOf(p.mother[id])) if (s !== id) fam(s, "sibling", 45 + hash2(id, s) % 40);
    }
    if (p.work[id] >= 0) {
      let n2 = 0;
      for (let s = 0; s < world.slots.b.length && n2 < 3; s++) {
        if (world.slots.b[s] !== p.work[id]) continue;
        const o = world.slots.who[s];
        if (o >= 0 && o !== id && !p.gone[o]) {
          addMutual(world, id, o, "coworker", 25 + hash2(id, o) % 40);
          n2++;
        }
      }
    }
    if (p.school[id] >= 0) {
      const cm = world.classmates(id, p.school[id]);
      for (let k = 0; k < Math.min(3, cm.length); k++) addMutual(world, id, cm[hash2(id, k) % cm.length], "classmate", 35 + hash2(id, k + 9) % 40);
    }
    if (hb >= 0 && p.n) {
      let n2 = 0;
      for (let t = 0; t < 120 && n2 < 2; t++) {
        const o = rng.int(p.n);
        if (o !== id && !p.gone[o] && p.home[o] === hb && p.spouse[id] !== o && p.mother[o] !== p.mother[id]) {
          addMutual(world, id, o, "neighbor", 20 + hash2(id, o) % 40);
          n2++;
        }
      }
    }
    if (age >= 20) {
      let n2 = 0;
      const born0 = p.born[id];
      for (let t = 0; t < 160 && n2 < 2; t++) {
        const o = rng.int(p.n);
        if (o !== id && !p.gone[o] && Math.abs(p.born[o] - born0) < 36 && p.home[o] >= 0 && hb >= 0 && world.dist(hb, p.home[o]) < 60) {
          addMutual(world, id, o, "oldfriend", 40 + hash2(id, o) % 45);
          n2++;
        }
      }
    }
    for (let t = 0; t < 400 && L2.rel.length < 2 && p.n; t++) {
      const o = rng.int(p.n);
      if (o === id || p.gone[o] || L2.rel.some((r) => r.id === o)) continue;
      if (hb >= 0 && p.home[o] >= 0 && world.dist(hb, p.home[o]) > 120) continue;
      addMutual(world, id, o, p.home[o] === hb ? "neighbor" : age >= 20 ? "friend" : "classmate", 20 + hash2(id, o) % 35);
    }
    const notable = L2.life.filter((e) => ["marry", "child", "school", "job", "hobby"].includes(e.k));
    for (const e of notable.slice(-4)) remember(world, id, e.M, `${yearOf(e.M)}\u5E74\u306E\u3053\u3068: ${e.text}`, { w: e.k === "marry" || e.k === "child" ? 3 : 2 });
    for (const r of L2.rel.slice(0, 2)) remember(world, id, M - 1 - h % 6, `${world.nm(r.id)}(${relName(r.k)})\u3068\u904E\u3054\u3057\u305F\u65E5\u306E\u3053\u3068\u3092\u3088\u304F\u601D\u3044\u51FA\u3059`, { who: r.id, w: 1 });
    L2.chg = 0;
    return L2;
  }
  function lifeFromEvent(world, type, id, ex) {
    const L2 = world.lives.get(id);
    if (!L2) return;
    const M = world.M, p = world.pop, nm = (i) => world.nm(i);
    switch (type) {
      case "newjob": {
        const pr = world.profOf(id);
        const e = [...pr.hist].reverse().find((x) => x.k === "start");
        const jn = p.job[id] < 255 ? JOBS[Object.keys(JOBS)[p.job[id]]].name : "\u4ED5\u4E8B";
        const bn = p.work[id] >= 0 ? world.map.buildings[p.work[id]].name : "";
        lifeNote(world, id, M, "job", `${bn}\u3067${jn}\u3068\u3057\u3066\u50CD\u304D\u59CB\u3081\u305F`);
        remember(world, id, M, `\u65B0\u3057\u3044\u8077\u5834(${bn})\u3067\u306E\u6700\u521D\u306E\u65E5\u306F\u7DCA\u5F35\u3057\u305F`, { w: 2 });
        for (const r of L2.rel) if (r.k === "coworker") r.k = "excoworker";
        let n2 = 0;
        for (let s = 0; s < world.slots.b.length && n2 < 3; s++) {
          if (world.slots.b[s] !== p.work[id]) continue;
          const o = world.slots.who[s];
          if (o >= 0 && o !== id && !p.gone[o]) {
            addMutual(world, id, o, "coworker", 25 + hash2(id, o) % 20);
            n2++;
          }
        }
        break;
      }
      case "retired":
        lifeNote(world, id, M, "retire", "\u4ED5\u4E8B\u3092\u9000\u8077\u3057\u305F");
        remember(world, id, M, "\u9577\u304F\u50CD\u3044\u305F\u8077\u5834\u3092\u53BB\u3063\u305F\u65E5\u306E\u3053\u3068\u306F\u5FD8\u308C\u306A\u3044", { w: 3 });
        L2.mood = Math.max(40, L2.mood - 5);
        break;
      case "married":
        lifeNote(world, id, M, "marry", `${nm(ex.partner)}\u3068\u7D50\u5A5A\u3057\u305F`);
        remember(world, id, M, `${nm(ex.partner)}\u3068\u306E\u7D50\u5A5A\u5F0F`, { who: ex.partner, w: 4 });
        addMutual(world, id, ex.partner, "spouse", 80);
        L2.mood = Math.min(95, L2.mood + 15);
        break;
      case "child":
        lifeNote(world, id, M, "child", `${nm(ex.child)}\u304C\u751F\u307E\u308C\u305F`);
        remember(world, id, M, `${nm(ex.child)}\u304C\u751F\u307E\u308C\u305F\u65E5\u3001\u75C5\u9662\u306E\u5ECA\u4E0B\u3067\u5F85\u3063\u305F`, { who: ex.child, w: 4 });
        addMutual(world, id, ex.child, "child", 85);
        L2.mood = Math.min(95, L2.mood + 12);
        break;
      case "moved": {
        const b = world.map.buildings[ex.b];
        lifeNote(world, id, M, "move", `${b.name}(${b.addr})\u306B\u5F15\u3063\u8D8A\u3057\u305F`);
        remember(world, id, M, `${b.addr}\u3067\u306E\u65B0\u3057\u3044\u66AE\u3089\u3057\u304C\u59CB\u307E\u3063\u305F`, { w: 2 });
        for (const r of L2.rel) if (r.k === "neighbor") r.aff = Math.max(5, r.aff - 15);
        break;
      }
      case "divorced":
        lifeNote(world, id, M, "divorce", `${nm(ex.partner)}\u3068\u96E2\u5A5A\u3057\u305F`);
        remember(world, id, M, "\u9577\u3044\u8A71\u3057\u5408\u3044\u306E\u672B\u306B\u3001\u5225\u3005\u306E\u9053\u3092\u6B69\u3080\u3053\u3068\u306B\u3057\u305F", { w: 4 });
        L2.mood = Math.max(15, L2.mood - 20);
        {
          const r = L2.rel.find((x) => x.id === ex.partner);
          if (r) {
            r.k = "friend";
            r.aff = 30;
          }
        }
        break;
      case "widowed":
        lifeNote(world, id, M, "widow", `${nm(ex.partner)}\u3092\u898B\u9001\u3063\u305F`);
        remember(world, id, M, `${nm(ex.partner)}\u304C\u3044\u306A\u304F\u306A\u3063\u305F\u5BB6\u306F\u3001\u3072\u3069\u304F\u9759\u304B\u3060`, { who: ex.partner, w: 5 });
        L2.mood = Math.max(10, L2.mood - 30);
        break;
      case "promoted":
        lifeNote(world, id, M, "promo", `${ex.rank}\u306B\u6607\u9032\u3057\u305F`);
        remember(world, id, M, `${ex.rank}\u3078\u306E\u6607\u9032\u3092\u3001\u5BB6\u65CF\u304C\u795D\u3063\u3066\u304F\u308C\u305F`, { w: 3 });
        L2.mood = Math.min(95, L2.mood + 8);
        break;
      case "laidoff":
        lifeNote(world, id, M, "job", "\u52E4\u3081\u5148\u304C\u9589\u307E\u308A\u3001\u8077\u3092\u5931\u3063\u305F");
        remember(world, id, M, "\u7A81\u7136\u306E\u9589\u5E97\u3002\u6B21\u306E\u4ED5\u4E8B\u306E\u3053\u3068\u3067\u982D\u304C\u3044\u3063\u3071\u3044\u3060\u3063\u305F", { w: 3 });
        L2.mood = Math.max(15, L2.mood - 15);
        break;
      case "died": {
        lifeNote(world, id, M, "died", "\u4EA1\u304F\u306A\u3063\u305F");
        for (const r of L2.rel.slice()) {
          if (!world.lives.has(r.id)) continue;
          const O2 = world.lives.get(r.id);
          const rr3 = O2.rel.find((x) => x.id === id);
          const kind = rr3 ? rr3.k : r.k;
          remember(world, r.id, M, `${nm(id)}(${relName(kind)})\u304C\u4EA1\u304F\u306A\u3063\u305F`, { who: id, w: kind === "spouse" || kind === "parent" || kind === "child" ? 5 : 3 });
          lifeNote(world, r.id, M, "loss", `${nm(id)}(${relName(kind)})\u3092\u898B\u9001\u3063\u305F`);
          if (rr3) rr3.k = "late";
          O2.mood = Math.max(10, O2.mood - (kind === "spouse" ? 25 : 10));
        }
        break;
      }
    }
  }
  var EPISODE = {
    coworker: (n2) => `${n2}\u3068\u4ED5\u4E8B\u5E30\u308A\u306B\u98DF\u4E8B\u3092\u3057\u305F`,
    classmate: (n2) => `${n2}\u3068\u653E\u8AB2\u5F8C\u306B\u304A\u3057\u3083\u3079\u308A\u3057\u305F`,
    neighbor: (n2) => `${n2}\u306B\u91CE\u83DC\u3092\u304A\u3059\u305D\u5206\u3051\u3057\u305F`,
    friend: (n2) => `${n2}\u3068\u4F1A\u3063\u3066\u8FD1\u6CC1\u3092\u8A71\u3057\u305F`,
    oldfriend: (n2) => `${n2}\u3068\u4E45\u3057\u3076\u308A\u306B\u9023\u7D61\u3092\u53D6\u3063\u305F`,
    spouse: (n2) => `${n2}\u3068\u8FD1\u6240\u3092\u6563\u6B69\u3057\u305F`,
    parent: (n2) => `${n2}\u306E\u5BB6\u3067\u98DF\u4E8B\u3092\u3057\u305F`,
    child: (n2) => `${n2}\u306E\u8A71\u3092\u805E\u3044\u305F`,
    sibling: (n2) => `${n2}\u3068\u96FB\u8A71\u3067\u8A71\u3057\u305F`,
    excoworker: (n2) => `${n2}\u304B\u3089\u8FD1\u6CC1\u306E\u4FBF\u308A\u304C\u5C4A\u3044\u305F`
  };
  function tickLives(world, M, rng) {
    const p = world.pop;
    let promoted = 0;
    for (const id of world.detailIds) {
      const L2 = world.lives.get(id);
      if (!L2) continue;
      if (p.gone[id]) continue;
      const age = Math.floor((M - p.born[id]) / 12);
      L2.mood += (62 - L2.mood) * 0.08 + rng.gauss() * 2.5;
      L2.mood = Math.max(5, Math.min(98, L2.mood));
      for (const r of L2.rel) {
        if (r.k === "late") continue;
        const o = r.id;
        if (p.gone[o]) {
          continue;
        }
        const fam = r.k === "spouse" || r.k === "parent" || r.k === "child" || r.k === "sibling";
        r.aff = Math.max(5, Math.min(100, r.aff + (fam ? 0.05 : r.k === "coworker" || r.k === "neighbor" || r.k === "classmate" ? 0.15 : -0.25) + rng.gauss() * 0.6));
        if (!fam && r.aff >= 62 && r.k !== "friend" && r.k !== "oldfriend") {
          r.k = "friend";
          lifeNote(world, id, M, "friend", `${world.nm(r.id)}\u3068\u89AA\u53CB\u3068\u547C\u3079\u308B\u4EF2\u306B\u306A\u3063\u305F`);
          remember(world, id, M, `${world.nm(r.id)}\u3068\u306F\u4F55\u3067\u3082\u8A71\u305B\u308B`, { who: r.id, w: 3 });
        }
      }
      if (rng.next() < 0.05) {
        const live2 = L2.rel.filter((r) => r.k !== "late" && !p.gone[r.id]);
        if (live2.length) {
          const r = live2[rng.int(live2.length)];
          const f2 = EPISODE[r.k];
          if (f2) {
            remember(world, id, M, f2(world.nm(r.id)), { who: r.id, w: 1 });
            r.aff = Math.min(100, r.aff + 1.5);
            L2.chg++;
          }
        }
      }
      if (age >= 15 && rng.next() < 8e-3) {
        const hb = p.home[id];
        if (hb >= 0) for (let t = 0; t < 40; t++) {
          const o = rng.int(p.n);
          if (o !== id && !p.gone[o] && p.home[o] === hb && !L2.rel.some((r) => r.id === o) && p.mother[o] !== p.mother[id]) {
            addMutual(world, id, o, "neighbor", 22);
            lifeNote(world, id, M, "meet", `${world.nm(o)}\u3068\u8FD1\u6240\u3065\u304D\u3042\u3044\u304C\u59CB\u307E\u3063\u305F`);
            break;
          }
        }
      }
      if (age >= 12 && rng.next() < 4e-3) {
        const old = L2.hobby;
        let nh = HOBBIES[rng.int(HOBBIES.length)];
        if (nh !== old) {
          L2.hobby = nh;
          lifeNote(world, id, M, "hobby", `${old}\u3092\u3084\u3081\u3001${nh}\u3092\u59CB\u3081\u305F`);
        }
      }
      if (age === 65 && (M - p.born[id]) % 12 === 0) remember(world, id, M, "65\u6B73\u3002\u3053\u308C\u304B\u3089\u306E\u66AE\u3089\u3057\u65B9\u3092\u8003\u3048\u59CB\u3081\u305F", { w: 2 });
      if (age >= 70 && rng.next() < 4e-3) {
        lifeNote(world, id, M, "health", "\u4F53\u306E\u8870\u3048\u3092\u611F\u3058\u308B\u3088\u3046\u306B\u306A\u3063\u305F");
        L2.mood -= 3;
      }
      if (L2.life.length > 0 && p.work[id] >= 0 && rng.next() < 0.01) remember(world, id, M, `\u4ED5\u4E8B\u3067\u3046\u308C\u3057\u3044\u3053\u3068\u304C\u3042\u3063\u305F(${JOBS[Object.keys(JOBS)[p.job[id]]].name})`, { w: 1 });
    }
    let live = 0;
    for (const id of world.detailIds) if (!p.gone[id]) live++;
    let need = 1e3 - live, guard = 0;
    while (need > 0 && guard++ < 4e3) {
      const i = rng.int(p.n);
      if (p.gone[i] || p.flags[i] & 1) continue;
      if (Math.floor((M - p.born[i]) / 12) < 3) continue;
      p.flags[i] |= 1;
      world.detailIds.add(i);
      genLife(world, i, rng);
      remember(world, i, M, "\u3053\u306E\u8857\u3067\u306E\u65E5\u3005\u3092\u3001\u3042\u3089\u305F\u3081\u3066\u601D\u3044\u8FD4\u3057\u305F", { w: 1 });
      need--;
    }
  }
  function recallLine(world, id, rng) {
    const L2 = world.lives.get(id);
    if (!L2) return null;
    const cands = L2.mem.filter((m2) => m2.w >= 2).concat(L2.mem.slice(-4)).concat(L2.mem.filter((m2) => m2.who === world.heroId && m2.w >= 3));
    if (!cands.length) return null;
    const m = cands[rng.int(cands.length)];
    return `${yearOf(m.M)}\u5E74${m.M % 12 + 1}\u6708: ${m.text}`;
  }

