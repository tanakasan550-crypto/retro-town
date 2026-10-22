  // src/gathering.js
  var KINDS = {
    gokon: { n: "\u5408\u30B3\u30F3", alc: 1, size: [6, 6], age: [22, 36], from: 1975, fee: [4e3, 5500], st: [19, 20], dur: 150, venue: ["izakaya", "restaurant"], by: "age", bal: 1, w: 3 },
    nomikai: { n: "\u98F2\u307F\u4F1A", alc: 1, size: [4, 8], age: [20, 62], fee: [3500, 5e3], st: [18.5, 20], dur: 150, venue: ["izakaya"], by: "work", w: 4 },
    machikon: { n: "\u8857\u30B3\u30F3", alc: 1, size: [12, 12], age: [22, 42], from: 2004, fee: [5e3, 7e3], st: [14, 17], dur: 180, venue: ["restaurant", "izakaya"], by: "age", bal: 1, w: 1.2 },
    konkatsu: { n: "\u5A5A\u6D3B\u30A4\u30D9\u30F3\u30C8", alc: 0, size: [8, 10], age: [28, 46], from: 2e3, fee: [4e3, 6e3], st: [13, 15], dur: 150, venue: ["restaurant", "cafe"], by: "age", bal: 1, w: 1 },
    welcome: { n: "\u6B53\u8FCE\u4F1A", alc: 1, size: [5, 9], age: [20, 62], fee: [4e3, 5e3], st: [18.5, 19.5], dur: 150, venue: ["izakaya", "restaurant"], by: "work", months: [2, 3, 4], w: 6 },
    farewell: { n: "\u9001\u5225\u4F1A", alc: 1, size: [5, 9], age: [20, 62], fee: [4e3, 5500], st: [18.5, 19.5], dur: 150, venue: ["izakaya", "restaurant"], by: "work", months: [1, 2, 8], w: 5 },
    bonenkai: { n: "\u5FD8\u5E74\u4F1A", alc: 1, size: [6, 10], age: [20, 62], fee: [5e3, 6500], st: [18.5, 19.5], dur: 170, venue: ["izakaya", "restaurant"], by: "work", months: [10, 11], w: 9 },
    shinnen: { n: "\u65B0\u5E74\u4F1A", alc: 1, size: [6, 10], age: [20, 62], fee: [4500, 6e3], st: [18.5, 19.5], dur: 160, venue: ["izakaya", "restaurant"], by: "work", months: [0], w: 9 },
    reunion: { n: "\u540C\u7A93\u4F1A", alc: 1, size: [8, 10], age: [28, 78], fee: [5e3, 7e3], st: [17.5, 18.5], dur: 180, venue: ["restaurant", "izakaya"], by: "cohort", months: [0, 7, 11], w: 3 },
    friends: { n: "\u53CB\u4EBA\u306E\u98DF\u4E8B\u4F1A", alc: 0, size: [3, 5], age: [18, 80], fee: [1800, 3e3], st: [11.5, 18], dur: 100, venue: ["restaurant", "cafe", "ramen"], by: "near", w: 4 },
    birthday: { n: "\u8A95\u751F\u65E5\u4F1A", alc: 0, size: [4, 7], age: [18, 80], fee: [2500, 4e3], st: [17.5, 19], dur: 120, venue: ["restaurant", "cafe"], by: "near", w: 3 },
    hobby: { n: "\u8DA3\u5473\u306E\u4EA4\u6D41\u4F1A", alc: 0, size: [5, 9], age: [20, 75], fee: [1500, 2500], st: [14, 16], dur: 120, venue: ["cafe", "restaurant"], by: "near", w: 3 },
    community: { n: "\u5730\u57DF\u306E\u89AA\u7766\u4F1A", alc: 1, size: [6, 10], age: [30, 85], fee: [2500, 3500], st: [17, 18.5], dur: 140, venue: ["restaurant", "izakaya"], by: "near", w: 3 }
  };
  var PERS = ["\u793E\u4EA4\u7684", "\u304A\u3068\u306A\u3057\u3044", "\u967D\u6C17", "\u307E\u3058\u3081", "\u805E\u304D\u4E0A\u624B", "\u304A\u3057\u3083\u3079\u308A", "\u30DE\u30A4\u30DA\u30FC\u30B9", "\u6C17\u3055\u304F"];
  var GOALS = ["\u51FA\u4F1A\u3044", "\u89AA\u7766", "\u98DF\u4E8B", "\u4ED8\u304D\u5408\u3044"];
  var persOf = (id) => PERS[hash2(id, 8801) % PERS.length];
  var goalOf = (id, kind) => KINDS[kind].bal ? hash2(id, 8802) % 5 === 0 ? "\u98DF\u4E8B" : "\u51FA\u4F1A\u3044" : kind === "friends" || kind === "birthday" ? "\u89AA\u7766" : GOALS[hash2(id, 8803) % GOALS.length];
  var jobName = (p, id) => {
    const j = p.job[id];
    return j >= 0 && JOB_IDS2[j] && JOBS[JOB_IDS2[j]] ? JOBS[JOB_IDS2[j]].name.replace(/\(.*$/, "") : "\u7121\u8077";
  };
  var st = (g) => {
    var _a;
    const S2 = (_a = g.S).gath || (_a.gath = { plans: {}, rel: {}, done: {}, joined: {}, seen: {}, news: [] });
    S2.lov || (S2.lov = {});
    return S2;
  };
  var ok0 = (g, p, i) => !p.gone[i] && i !== g.hero.id && p.home[i] >= 0 && p.born[i] !== void 0;
  var key2 = (a, b) => a < b ? `${a}-${b}` : `${b}-${a}`;
  var npcRel = (g, a, b) => st(g).rel[key2(a, b)] || null;
  function setRel(g, a, b, t, ev) {
    const S2 = st(g), k = key2(a, b);
    const o = S2.rel[k];
    const rank = { declined: 0, acq: 1, friend: 2, lover: 3 };
    if (o && rank[o.t] >= rank[t] && !(t === "declined")) return o;
    S2.rel[k] = { t, M: g.S.M, ev };
    if (t === "lover") {
      S2.lov[a] = b;
      S2.lov[b] = a;
    }
    S2.n = (S2.n || 0) + 1;
    if (S2.n > 6500) {
      S2.n = 0;
      const ks = Object.keys(S2.rel);
      if (ks.length > 6e3) for (let i = 0; i < ks.length - 5500; i++) delete S2.rel[ks[i]];
    }
    return S2.rel[k];
  }
  var compat = (g, a, b) => {
    const pa = g.world.pop, d = Math.abs(ageYears(pa, a, g.S.M) - ageYears(pa, b, g.S.M));
    const base = hash2(Math.min(a, b) * 7919 + Math.max(a, b), 8810) % 100 / 100;
    const same = persOf(a) === persOf(b) ? 0.06 : 0;
    return Math.max(0, Math.min(1, base * 0.85 + same + 0.12 - Math.min(0.3, d / 40)));
  };
  function scan2(g, pred, n2, seed, from = 0) {
    const p = g.world.pop, N2 = p.n, out = [];
    let i = (hash2(seed, 8820) % N2 + from) % N2;
    const step2 = 7919 % N2 || 1;
    for (let c = 0; c < N2 && out.length < n2; c++) {
      if (ok0(g, p, i) && pred(i)) out.push(i);
      i = (i + step2) % N2;
    }
    return out;
  }
  var venues = (g, types) => g.world.map.buildings.filter((b) => types.includes(b.type) && b.status !== "closed" && !b.tenants);
  function planMonth(g, M) {
    const S2 = st(g);
    if (S2.plans[M]) return S2.plans[M];
    const W2 = g.world, p = W2.pop, y = 1900 + Math.floor(M / 12), m0 = M % 12;
    const list = [];
    const heroFr = Object.keys(g.hero.rel || {}).map(Number).filter((i) => g.hero.rel[i].aff >= 15 && !p.gone[i]);
    const allowed = Object.entries(KINDS).filter(([k, d]) => y >= (d.from || 0) && (!d.months || d.months.includes(m0)));
    const tot = allowed.reduce((s, [, d]) => s + d.w * (d.months ? 3 : 1), 0);
    const NEV = 16;
    const works = /* @__PURE__ */ new Map();
    for (let j = 0; j < W2.slots.b.length; j++) {
      const i = W2.slots.who[j];
      if (i >= 0 && !p.gone[i] && W2.slots.b[j] >= 0) {
        const b = W2.slots.b[j];
        if (!works.has(b)) works.set(b, []);
        works.get(b).push(i);
      }
    }
    const wk = [...works.entries()].filter(([, v]) => v.length >= 5).sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < NEV; k++) {
      let r = hash2(M * 31 + k, 8830) % 1e4 / 1e4 * tot, kind = allowed[0][0];
      for (const [kk, d] of allowed) {
        r -= d.w * (d.months ? 3 : 1);
        if (r <= 0) {
          kind = kk;
          break;
        }
      }
      const K3 = KINDS[kind];
      const size = K3.size[0] + hash2(M * 31 + k, 8831) % (K3.size[1] - K3.size[0] + 1);
      const seed = M * 977 + k * 131;
      let mem = [];
      const inAge = (i) => {
        const a = ageYears(p, i, M);
        return a >= K3.age[0] && a <= K3.age[1] && (!K3.alc || a >= 20);
      };
      if (K3.by === "work" && wk.length) {
        const [wb, ids] = wk[hash2(seed, 8832) % wk.length];
        mem = ids.filter(inAge).slice(0, size);
      } else if (K3.bal) {
        const half = size / 2;
        const cand = scan2(g, (i) => inAge(i) && p.spouse[i] < 0, size * 12, seed);
        const F = cand.filter((i) => isFemale(p, i)).slice(0, half), Mm = cand.filter((i) => !isFemale(p, i)).slice(0, half);
        mem = [...Mm, ...F];
      } else if (K3.by === "cohort") {
        const a0 = scan2(g, inAge, 1, seed)[0];
        if (a0 != null) {
          const ay = ageYears(p, a0, M);
          mem = [a0, ...scan2(g, (i) => inAge(i) && Math.abs(ageYears(p, i, M) - ay) <= 1, size - 1, seed + 1)];
        }
      } else {
        const a0 = scan2(g, inAge, 1, seed)[0];
        if (a0 != null) {
          const hb = p.home[a0], ay = ageYears(p, a0, M);
          mem = [a0, ...scan2(g, (i) => inAge(i) && W2.dist(p.home[i], hb) < 30 && Math.abs(ageYears(p, i, M) - ay) <= 14, size - 1, seed + 2)];
        }
      }
      if (mem.length < Math.min(3, K3.size[0])) continue;
      if (heroFr.length && hash2(seed, 8833) % 4 === 0 && K3.by !== "age") {
        const f2 = heroFr[hash2(seed, 8834) % heroFr.length];
        if (inAge(f2) && !mem.includes(f2)) {
          if (mem.length >= size) mem.pop();
          mem.push(f2);
        }
      }
      const vs = venues(g, K3.venue);
      if (!vs.length) continue;
      const home = p.home[mem[0]];
      let best = null, bd = 1e9;
      for (let q = 0; q < Math.min(vs.length, 60); q++) {
        const b = vs[(hash2(seed, 8835) + q * 13) % vs.length];
        const d = W2.dist(b.idx, home) + hash2(b.idx + k, 8836) % 8;
        if (d < bd) {
          bd = d;
          best = b;
        }
      }
      const day = 1 + hash2(seed, 8837) % 28, sh3 = K3.st[0] + hash2(seed, 8838) % 100 / 100 * (K3.st[1] - K3.st[0]), stM = Math.round(sh3 * 2) * 30;
      const fee = Math.round((K3.fee[0] + hash2(seed, 8839) % 100 / 100 * (K3.fee[1] - K3.fee[0])) / 100) * 100;
      list.push({ key: `${M}:${k}`, M, k, kind, b: best.idx, day, st: stM, en: stM + K3.dur, host: mem[0], members: mem, fee, res: 1, size: mem.length });
    }
    S2.plans[M] = list;
    for (const kk of Object.keys(S2.plans)) if (+kk < M - 8) delete S2.plans[kk];
    return list;
  }
  var planOf = (g, M = g.S.M) => planMonth(g, M);
  var eventsAt = (g, bIdx, M = g.S.M) => planMonth(g, M).filter((e) => e.b === bIdx);
  function activeAt(g, bIdx) {
    const d = g.date(), m = g.S.min;
    return eventsAt(g, bIdx).find((e) => e.day === d.d && m >= e.st - 8 && m < e.en + 12) || null;
  }
  function resolve(g, ev) {
    const S2 = st(g);
    if (S2.done[ev.key]) return S2.done[ev.key];
    const p = g.world.pop, W2 = g.world, K3 = KINDS[ev.kind];
    const out = { key: ev.key, kind: ev.kind, pairs: [] };
    const M = ev.M, mem = ev.members;
    const single = (i) => p.spouse[i] < 0 && S2.lov[i] === void 0;
    if (K3.bal) {
      const men = mem.filter((i) => !isFemale(p, i)), wom = mem.filter((i) => isFemale(p, i));
      const used = /* @__PURE__ */ new Set();
      const cand = [];
      for (const a of men) for (const b of wom) cand.push([compat(g, a, b) + (goalOf(a, ev.kind) === "\u51FA\u4F1A\u3044" && goalOf(b, ev.kind) === "\u51FA\u4F1A\u3044" ? 0.08 : 0), a, b]);
      cand.sort((x, y) => y[0] - x[0] || x[1] - y[1]);
      for (const [s, a, b] of cand) {
        if (used.has(a) || used.has(b)) continue;
        const ex = npcRel(g, a, b);
        let t = "none";
        if (s > 0.74 && single(a) && single(b)) {
          const wa = hash2(a * 3 + b, 8850 + M) % 100 / 100, wb = hash2(b * 3 + a, 8851 + M) % 100 / 100;
          t = wa < s && wb < s ? "lover" : "declined";
        } else if (s > 0.5) t = "friend";
        else if (s > 0.3) t = "acq";
        if (t === "lover") {
          used.add(a);
          used.add(b);
        }
        if (t !== "none") {
          setRel(g, a, b, t, ev.key);
          out.pairs.push([a, b, t]);
        } else out.pairs.push([a, b, "none"]);
      }
    }
    for (let i = 0; i < mem.length; i++) for (let j = i + 1; j < mem.length; j++) {
      const a = mem[i], b = mem[j];
      if (K3.bal && isFemale(p, a) === isFemale(p, b) && hash2(a + b, 8860) % 3) continue;
      const s = compat(g, a, b);
      const o = npcRel(g, a, b);
      if (!o && s > 0.35) {
        setRel(g, a, b, "acq", ev.key);
        out.pairs.push([a, b, "acq"]);
      } else if (o && o.t === "acq" && s > 0.55 && hash2(a * 7 + b, 8861 + M) % 3 === 0) {
        setRel(g, a, b, "friend", ev.key);
        out.pairs.push([a, b, "friend"]);
      }
    }
    for (const [a, b, t] of out.pairs) {
      if (t === "lover" || t === "friend") {
        try {
          W2.noteLife(a, M, "social", `${K3.n}\u3067${g.nameOf(b)}\u3068${t === "lover" ? "\u4EA4\u969B\u3092\u59CB\u3081\u305F" : "\u53CB\u3060\u3061\u306B\u306A\u3063\u305F"}`);
          W2.noteLife(b, M, "social", `${K3.n}\u3067${g.nameOf(a)}\u3068${t === "lover" ? "\u4EA4\u969B\u3092\u59CB\u3081\u305F" : "\u53CB\u3060\u3061\u306B\u306A\u3063\u305F"}`);
          W2.remember(a, `${K3.n}\u3067${g.nameOf(b)}\u3068\u77E5\u308A\u5408\u3063\u305F`, { w: 2 });
          W2.remember(b, `${K3.n}\u3067${g.nameOf(a)}\u3068\u77E5\u308A\u5408\u3063\u305F`, { w: 2 });
        } catch (_) {
        }
      }
    }
    S2.done[ev.key] = { n: mem.length, pairs: out.pairs.filter((x) => x[2] !== "none").length, lovers: out.pairs.filter((x) => x[2] === "lover").length };
    const known = mem.filter((i) => g.hero.rel[i]);
    if (known.length && !S2.joined[ev.key]) {
      const lv = out.pairs.find((x) => x[2] === "lover" && (g.hero.rel[x[0]] || g.hero.rel[x[1]]));
      const txt2 = lv ? `${g.nameOf(lv[0])}\u3055\u3093\u3068${g.nameOf(lv[1])}\u3055\u3093\u304C${K3.n}\u3092\u304D\u3063\u304B\u3051\u306B\u4ED8\u304D\u5408\u3044\u59CB\u3081\u305F\u305D\u3046\u3060` : `\u77E5\u4EBA\u306E${g.nameOf(known[0])}\u3055\u3093\u304C${K3.n}\u306B\u53C2\u52A0\u3057\u305F\u305D\u3046\u3060`;
      S2.news.push({ M: g.S.M, text: txt2, key: ev.key });
      if (S2.news.length > 30) S2.news.shift();
      g.log("social", txt2);
    }
    return out;
  }
  function monthlyGather(g) {
    const S2 = st(g), M = g.S.M;
    for (const ev of planMonth(g, M - 1)) resolve(g, ev);
    planMonth(g, M);
    for (const k of Object.keys(S2.done)) {
      const mm = +k.split(":")[0];
      if (mm < M - 12) delete S2.done[k];
    }
  }
  var LINES3 = { chat: ["\u3078\u3048\u3001\u305D\u3046\u306A\u3093\u3067\u3059\u304B!", "\u4ECA\u5EA6\u3069\u3053\u304B\u884C\u304D\u305F\u3044\u3067\u3059\u306D", "\u305D\u308C\u3001\u308F\u304B\u308A\u307E\u3059\u301C", "\u6700\u8FD1\u3069\u3046\u3067\u3059\u304B?", "\u304A\u3044\u3057\u3044\u3067\u3059\u306D\u3001\u3053\u308C", "\u3042\u306F\u306F!", "\u4ED5\u4E8B\u306F\u5FD9\u3057\u3044\u3067\u3059\u304B?", "\u4F11\u307F\u306E\u65E5\u306F\u4F55\u3057\u3066\u307E\u3059?"], laugh: ["\u3042\u306F\u306F!", "\u3075\u3075\u3063", "\u308F\u306F\u306F!"], end: ["\u305D\u308D\u305D\u308D\u304A\u958B\u304D\u3067\u3059\u306D", "\u3054\u3061\u305D\u3046\u3055\u307E\u3067\u3057\u305F", "\u307E\u305F\u8A98\u3063\u3066\u304F\u3060\u3055\u3044", "\u697D\u3057\u304B\u3063\u305F\u3067\u3059!"] };
  function phaseAt(ev, m) {
    const t = m - ev.st, dur = ev.en - ev.st;
    if (t < -8) return { k: "none" };
    if (t < 0) return { k: "arrive", u: (t + 8) / 8 };
    if (t < 10) return { k: "order" };
    if (t < 15) return { k: "food" };
    if (t < 17) return { k: "toast" };
    if (t < 17 + ev.size * 3 + 4) return { k: "intro", i: Math.floor((t - 17) / 3) };
    if (t < dur - 12) return { k: t > dur / 2 ? "chat2" : "chat", t };
    if (t < dur) return { k: "wrap" };
    if (t < dur + 12) return { k: "leave", u: (t - dur) / 12 };
    return { k: "none" };
  }
  function partyPeople(g, ev, I2) {
    const m = g.S.min, ph = phaseAt(ev, m);
    if (ph.k === "none") return [];
    const p = g.world.pop, mem = ev.members.filter((i) => !p.gone[i]);
    const seats = I2.seatSpots.length ? I2.seatSpots : [{ x: 3, y: 5 }];
    const sol = interiorSolid(I2);
    const free = [];
    for (let y = 4; y < I2.H - 2; y += 2) for (let x = 2; x < I2.W - 2; x += 2) if (!sol[x + y * I2.W]) free.push({ x, y });
    const spot = [];
    for (let i = 0; i < mem.length; i++) spot.push(i < seats.length ? seats[i] : free[(i - seats.length) % Math.max(1, free.length)] || { x: 3 + i % 5, y: 7 });
    const shuffled = ph.k === "chat2" || ph.k === "wrap" || ph.k === "leave";
    const order = mem.map((_, i) => shuffled && i < seats.length ? (i + 2) % Math.min(mem.length, seats.length) : i);
    const res = [];
    const door = { x: I2.door.x + 0.5, y: I2.door.y - 0.3 };
    const minute = Math.floor(m);
    mem.forEach((id, i) => {
      const sp = spot[order[i] % spot.length];
      let x = sp.x + 0.5, y = sp.y + 0.5, moving = false, say = null, dir = "d";
      if (ph.k === "arrive") {
        const u = Math.min(1, ph.u + i % 3 * 0);
        const d0 = ph.u * (1 - 0.1 * (i % 4));
        const uu = Math.max(0, Math.min(1, d0));
        x = door.x + (sp.x + 0.5 - door.x) * uu;
        y = door.y + (sp.y + 0.5 - door.y) * uu;
        moving = uu < 1;
        void u;
        if (hash2(id, 8870) % 4 === 0 && uu > 0.6) say = "\u3053\u3093\u3070\u3093\u306F\u3001\u3088\u308D\u3057\u304F\u304A\u9858\u3044\u3057\u307E\u3059";
      } else if (ph.k === "order") {
        if (hash2(id + minute, 8871) % 6 === 0) say = hash2(id, 8872) % 2 && KINDS[ev.kind].alc ? "\u3068\u308A\u3042\u3048\u305A\u751F\u3067!" : "\u30A6\u30FC\u30ED\u30F3\u8336\u3067";
      } else if (ph.k === "food") {
        if (hash2(id + minute, 8873) % 5 === 0) say = "\u6599\u7406\u304D\u305F!";
      } else if (ph.k === "toast") {
        say = "\u4E7E\u676F!";
      } else if (ph.k === "intro") {
        if (i === ph.i) say = `${g.nameOf(id).split(" ").pop()}\u3067\u3059\u3002${jobName(p, id)}\u3092\u3057\u3066\u3044\u307E\u3059`;
        else if (hash2(id + minute, 8874) % 9 === 0) say = "\u62CD\u624B";
      } else if (ph.k === "chat" || ph.k === "chat2") {
        const r = hash2(id * 3 + Math.floor(minute / 2), 8875) % 11;
        if (r === 0) say = LINES3.chat[hash2(id + minute, 8876) % LINES3.chat.length];
        else if (r === 1) say = LINES3.laugh[hash2(id, minute) % LINES3.laugh.length];
        if (ph.k === "chat2" && minute === ev.st + Math.floor((ev.en - ev.st) / 2) + 1 && i === 0) say = "\u5E2D\u66FF\u3048\u3057\u307E\u3057\u3087\u3046!";
      } else if (ph.k === "wrap") {
        if (hash2(id + minute, 8877) % 5 === 0) say = LINES3.end[hash2(id, 8878) % LINES3.end.length];
      } else if (ph.k === "leave") {
        const uu = Math.min(1, ph.u * (1 + 0.15 * (i % 4)));
        x = sp.x + 0.5 + (door.x - sp.x - 0.5) * uu;
        y = sp.y + 0.5 + (door.y - sp.y - 0.5) * uu;
        moving = uu < 1;
        if (uu >= 1) return;
        if (hash2(id, 8879) % 3 === 0) say = "\u3054\u3061\u305D\u3046\u3055\u307E\u3067\u3057\u305F";
      }
      res.push({ id, x, y, dir, moving, role: "party", say, party: ev.key, seat: !moving && ph.k !== "arrive" && ph.k !== "leave" && i < seats.length });
    });
    return res;
  }
  function acquaintancesHere(g, ev) {
    return ev.members.filter((i) => g.hero.rel[i] && !g.world.pop.gone[i]);
  }
  function inviteIfAny(g, bIdx) {
    const ev = activeAt(g, bIdx);
    if (!ev) return null;
    const S2 = st(g);
    if (S2.seen[ev.key]) return ev;
    S2.seen[ev.key] = 1;
    const ac = acquaintancesHere(g, ev);
    g.log("social", `${g.bld(bIdx).name}\u3067${KINDS[ev.kind].n}\u3092\u3057\u3066\u3044\u308B\u30B0\u30EB\u30FC\u30D7\u306B\u5C45\u5408\u308F\u305B\u305F${ac.length ? `(\u77E5\u4EBA\u306E${g.nameOf(ac[0])}\u3055\u3093\u3082\u3044\u308B)` : ""}`, { b: bIdx });
    if (ac.length && !S2.joined[ev.key] && g.age() >= (KINDS[ev.kind].alc ? 20 : 12)) {
      for (const i of ac.slice(0, 3)) g.meet(i, 2);
      g.queueEvent("gath_invite", { key: ev.key });
    }
    return ev;
  }
  function heroJoin(g, key) {
    const S2 = st(g), ev = planOf(g, +key.split(":")[0]).find((e) => e.key === key);
    if (!ev) return { ok: false, msg: "" };
    if (S2.joined[key]) return { ok: false, msg: "\u3082\u3046\u53C2\u52A0\u3057\u3066\u3044\u307E\u3059" };
    const K3 = KINDS[ev.kind];
    if (K3.alc && g.age() < 20) return { ok: false, msg: "20\u6B73\u672A\u6E80\u306F\u304A\u9152\u306E\u5E2D\u306B\u53C2\u52A0\u3067\u304D\u307E\u305B\u3093" };
    const fee = g.yen(ev.fee);
    if (g.hero.money < fee) return { ok: false, msg: "\u53C2\u52A0\u8CBB\u304C\u8DB3\u308A\u307E\u305B\u3093" };
    g.pay(fee, `${K3.n}\u306E\u53C2\u52A0\u8CBB`);
    g.advance(Math.max(30, ev.en - g.S.min));
    S2.joined[key] = 1;
    let best = null, bs = 0;
    for (const i of ev.members) {
      g.meet(i, 4 + Math.round(compat(g, g.hero.id, i) * 6));
      const s = compat(g, g.hero.id, i);
      if (s > bs && g.hero.spouse == null) {
        bs = s;
        best = i;
      }
    }
    const ids = ev.members.slice(0, 4).map((i) => g.nameOf(i)).join("\u3001");
    g.log("social", `${g.bld(ev.b).name}\u306E${K3.n}\u306B\u53C2\u52A0\u3057\u305F(${ids}\u307B\u304B)`, { b: ev.b, ids: ev.members });
    let note = "";
    if (K3.bal && best != null && bs > 0.72) {
      g.hero.rel[best].romance = true;
      g.meet(best, 10);
      note = `${g.nameOf(best)}\u3055\u3093\u3068\u306F\u6C17\u304C\u5408\u3044\u3001\u9023\u7D61\u5148\u3092\u4EA4\u63DB\u3057\u307E\u3057\u305F\u3002`;
      g.log("social", `${K3.n}\u3067${g.nameOf(best)}\u3055\u3093\u3068\u610F\u6C17\u6295\u5408\u3057\u305F`);
    }
    return { ok: true, msg: `${K3.n}\u306B\u53C2\u52A0\u3057\u307E\u3057\u305F\u3002${note}`, partner: best };
  }
  function soundLevel(g) {
    const L2 = g.S.loc;
    if (L2.k !== "in") return 0;
    const ev = activeAt(g, L2.b);
    if (!ev) return 0;
    const ph = phaseAt(ev, g.S.min);
    return ph.k === "none" ? 0 : Math.min(1, ev.size / 8) * (ph.k === "toast" ? 1.6 : 1);
  }

