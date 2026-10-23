  // src/game.js
  var LIFE_MONTHS = 960;
  var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  var dim = (y, m0) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
  var HOLIDAYS = (d) => {
    const { m0, d: dd } = d;
    const k = m0 * 100 + dd;
    return [101, 102, 103, 211, 429, 503, 504, 505, 1103, 1123].includes(k + 0) || [100 + 1, 100 + 2, 100 + 3].includes(k);
  };
  var SERVICE_JOBS = /* @__PURE__ */ new Set(["clerk", "cook", "waitstaff", "hotelstaff", "doctor", "nurse", "caregiver", "police", "firefighter", "railstaff", "fisher", "stocker", "farmer", "sailor", "zookeeper", "priest"]);
  var EDU_REQ = { doctor: 5, lawyer: 5, judge: 5, professor: 5, scientist: 5, pharmacist: 5, teacher: 5, special_teacher: 5, banker: 4, reporter: 4, announcer: 4, childcare: 4, nurse: 4, police: 4, firefighter: 4, officeworker: 4, official: 4, railstaff: 4, sailor: 4, factory: 3, logistics: 3, carpenter: 3, ...EDU_EXT };
  var MINOR_JOBS = /* @__PURE__ */ new Set(["clerk", "stocker", "waitstaff", "cleaner", "farmer"]);
  var ALLOWANCE = (a) => a < 6 ? 0 : a < 12 ? 800 : a < 15 ? 2500 : a < 18 ? 5e3 : 0;
  var p0 = (g) => g.world.pop;
  function applyHeroName(world, hid, fa, mo, input2) {
    var _a;
    const p = world.pop;
    const nm = (input2 || "").trim();
    if (!nm) {
      if (fa >= 0) p.sur[hid] = world.curSur(fa);
      return nameOf(world.seed, hid, p);
    }
    const parts = nm.split(/[\s\u3000]+/);
    let gn = nm, idx = world.curSur(fa >= 0 ? fa : hid);
    if (parts.length >= 2) {
      idx = world.surIdxOf(parts[0]);
      gn = parts.slice(1).join("");
    }
    p.givenOv[hid] = gn;
    if (fa >= 0) p.sur[hid] = world.curSur(fa);
    if (parts.length >= 2) {
      const fam = /* @__PURE__ */ new Set([hid, fa, mo]);
      for (const q of [fa, mo]) if (q >= 0) for (const c of world.childrenOf(q)) fam.add(c);
      if (fa >= 0) {
        if (p.mother[fa] >= 0) fam.add(p.mother[fa]);
        if (p.father[fa] >= 0) fam.add(p.father[fa]);
      }
      for (const id of fam) {
        if (id < 0) continue;
        if (id === mo && world.curSur(id) !== idx) {
          const e = (_a = world.sn)[id] || (_a[id] = { b: world.curSur(id), h: [] });
          e.h.push([world.M | 0, world.curSur(id), idx, "create"]);
        }
        p.sur[id] = idx;
      }
    }
    return world.surName(world.curSur(hid)) + " " + gn;
  }
  var Game = class _Game {
    constructor(world, S2) {
      this.world = world;
      this.S = S2;
      this.tr = buildTransit(world.map);
      this._rng = null;
      this.listeners = [];
      this.linkProf();
      try {
        syncStaff(this);
      } catch (e) {
      }
    }
    linkProf() {
      const h = this.S.hero;
      const pr = this.world.profOf(h.id);
      pr.sk = h.skills;
      if (!this.world.lives.size) {
        const r = new Rng(this.S.seed, "lives-load");
        for (let i = 0; i < this.world.pop.n; i++) if (this.world.pop.flags[i] & F_DETAIL && !(this.world.pop.flags[i] & F_HERO) && !this.world.pop.gone[i]) {
          this.world.detailIds.add(i);
          genLife(this.world, i, r);
        }
      }
    }
    prof() {
      return this.world.profOf(this.hero.id);
    }
    jobLvNow() {
      const j = this.hero.job;
      return j ? jobLv(this.prof().jxp[j.jobId] || 0) : 0;
    }
    rankNow() {
      return this.hero.job ? this.prof().rank : 0;
    }
    grantQual(q) {
      this.hero.quals[q] = 1;
      return grantQual(this.world, this.hero.id, q, this.S.M);
    }
    get hero() {
      return this.S.hero;
    }
    get M() {
      return this.S.M;
    }
    // ----- 作成/復元
    static create(opts = {}) {
      const seed = opts.seed ?? 20261020, startYear = opts.startYear ?? 1990;
      const world = new World(seed, startYear, opts.ver != null ? { ver: opts.ver } : {});
      const rng = new Rng(seed, "hero-create");
      const M0 = world.M;
      const [mo, fa] = world.pickParents(rng, M0, void 0, (cands) => gachaPick(world, seed, M0, cands, opts.family));
      const hid = world.addHero(rng, M0, mo, fa);
      const p = world.pop;
      p.look[hid] = opts.look != null ? (opts.look & 65535 | p.look[hid] & 4294901760) >>> 0 : p.look[hid];
      if (opts.needs) {
        p.needs[hid] = opts.needs;
        if (opts.needs & NEED.SUPPORT) p.flags[hid] |= F_SUPPORT;
      }
      const homeB = p.home[mo];
      const bd = M0 + 0;
      const hash0 = hash2(seed, 31);
      const name = applyHeroName(world, hid, fa, mo, opts.name);
      const parentApt = (p.apt[mo] + p.apt[fa]) / 2;
      const S2 = {
        sy: 1,
        v: SCHEMA_VERSION,
        game: GAME_ID,
        seed,
        startYear,
        M: M0,
        day: 1 + hash0 % 28,
        min: 7 * 60 + 12,
        bornM: M0,
        bornDay: 1 + hash0 % 28,
        ended: false,
        queue: [],
        log: [],
        rngCtr: 0,
        uid: 1,
        hero: { id: hid, name, sprite: opts.sprite || null, mother: mo, father: fa, stats: { health: 85, energy: 90, hunger: 70, mood: 75, intel: clamp(18 + parentApt / 255 * 40, 10, 70), fitness: 35, social: 25, charm: 30 }, money: 0, debt: 0, skills: {}, quals: {}, edu: { level: 0, cur: 0, b: -1, year: 0 }, job: null, homeB, homeIsParents: true, spouse: null, kids: [], rel: {}, flags: { done: {} }, inv: { food: 0 }, study: 0, owned: [] },
        m: { hours: 0, attend: 0, absent: 0, income: [], expense: [], ev: [], news: [], stat0: null, parttimeHours: 0 },
        day0: { schoolWanted: false, attended: false, ate: 0 },
        loc: { k: "in", b: homeB, floor: 0, x: 6, y: 5, f: "d" },
        stats: { eventsSeen: 0, moves: 0, rides: 0, meals: 0, workHours: 0 }
      };
      const g = new _Game(world, S2);
      g.hero.stats.fitness = 35;
      g.addFamilyKnown();
      g.hero.money = 0;
      g.hero.stats.hunger = 80;
      g.placeInHome();
      g.snapshotStats();
      g.log("birth", `${g.hero.name}\u304C${world.map.buildings[homeB].name}\u3067\u751F\u307E\u308C\u305F(\u4E21\u89AA: ${g.nameOf(mo)}\u30FB${g.nameOf(fa)})`);
      try {
        const bs = birthSheet(g);
        g.hero.birth = bs;
        g.log("birth", `\u751F\u307E\u308C\u305F\u5BB6\u5EAD: ${bs.label}\u30FB\u7236\u306F${bs.father.job}\u3001\u6BCD\u306F${bs.mother.job}\u30FB\u66AE\u3089\u3057\u5411\u304D\u306F${bs.livelihood}`);
      } catch (_) {
      }
      g.queueEvent("birth_info", {});
      g.nextMonthStartHooks(true);
      return g;
    }
    static load(data) {
      const world = World.restore(data.world);
      const g = new _Game(world, data.S);
      try {
        g.fixLoc();
      } catch (e) {
      }
      return g;
    }
    // 旧セーブの屋内位置が、階構成の変更(集合住宅・百貨店)で存在しない階/壁の中になっていたら入口へ戻す
    fixLoc() {
      const L2 = this.S.loc;
      if (!L2 || L2.k !== "in") {
        if (L2) {
          delete L2.tr;
          delete L2.z;
        }
        return;
      }
      const b = this.bld(L2.b);
      if (!b) {
        L2.k = "out";
        return;
      }
      delete L2.tr;
      delete L2.z;
      delete L2.sl;
      const bk = bigKind(b);
      if (bk && !isUnitFloor(L2.floor)) {
        const { lo, hi: hi2 } = levelRange(b);
        if (!(L2.floor >= lo && L2.floor <= hi2)) L2.floor = 0;
      } else if (!bk && !isUnitFloor(L2.floor) && (L2.floor < 0 || L2.floor >= (b.floors || 1))) L2.floor = 0;
      const { I: I2, solid } = interiorOf(this, L2.b, L2.floor);
      const bad = (x, y) => x < 0.3 || y < 0.3 || x > I2.W - 0.3 || y > I2.H + 0.5 || solid[Math.floor(x) + Math.floor(y) * I2.W] === 1;
      if (bad(L2.x, L2.y)) {
        let done = false;
        for (let r = 1; r < 40 && !done; r++) for (let dy = -r; dy <= r && !done; dy++) for (let dx = -r; dx <= r && !done; dx++) {
          const x = Math.floor(L2.x) + dx + 0.5, y = Math.floor(L2.y) + dy + 0.5;
          if (!bad(x, y) && y < I2.H - 0.5) {
            L2.x = x;
            L2.y = y;
            done = true;
          }
        }
        if (!done) {
          if (isUnitFloor(L2.floor) || L2.floor === 0) {
            L2.x = I2.door.x + 0.5;
            L2.y = I2.H - 1.6;
          } else {
            L2.floor = 0;
            const J = interiorOf(this, L2.b, 0).I;
            L2.x = J.door.x + 0.5;
            L2.y = J.H - 1.6;
          }
        }
      }
    }
    serialize() {
      return { S: this.S, world: this.world.serialize() };
    }
    // ----- 基本ユーティリティ
    pi() {
      return priceIndex(this.year());
    }
    yen(n2) {
      return Math.round(n2 * this.pi());
    }
    year() {
      return 1900 + Math.floor(this.S.M / 12);
    }
    month0() {
      return this.S.M % 12;
    }
    age() {
      return Math.floor((this.S.M - this.S.bornM) / 12);
    }
    ageMonths() {
      return this.S.M - this.S.bornM;
    }
    ageAt(M) {
      return Math.floor((M - this.S.bornM) / 12);
    }
    date() {
      const y = this.year(), m0 = this.month0(), d = this.S.day;
      return { y, m0, d, h: Math.floor(this.S.min / 60), mi: this.S.min % 60, dow: new Date(Date.UTC(y, m0, d)).getUTCDay() };
    }
    absMin() {
      const dt = this.date();
      return Math.floor(Date.UTC(dt.y, dt.m0, dt.d) / 864e5) * 1440 + this.S.min;
    }
    rngInt(n2) {
      return this.actRng().int(n2);
    }
    actRng(tag = "act") {
      return new Rng(this.S.seed, `${tag}:${this.S.M}:${this.S.day}:${this.S.rngCtr++}`);
    }
    // 名字の整合チェック(既存セーブは勝手に変えない。確認して、利用者が選んだときだけ修復する)
    nameCheck() {
      const h = this.hero, W2 = this.world;
      const fs = h.father >= 0 ? W2.surName(W2.curSur(h.father)) : null;
      const hs = h.name.split(/[\s\u3000]+/)[0];
      const out = [];
      if (fs && hs !== fs) out.push(`\u4E3B\u4EBA\u516C\u306E\u540D\u5B57\u300C${hs}\u300D\u3068\u7236\u306E\u540D\u5B57\u300C${fs}\u300D\u304C\u9055\u3044\u307E\u3059`);
      if (h.mother >= 0 && fs && W2.surName(W2.curSur(h.mother)) !== fs && !W2.sn[h.mother]) out.push(`\u6BCD\u306E\u540D\u5B57\u300C${W2.surName(W2.curSur(h.mother))}\u300D\u304C\u7236\u3068\u9055\u3044\u307E\u3059`);
      if (W2.pop.sur[h.id] !== 255 ? W2.surName(W2.curSur(h.id)) !== hs : false) out.push("\u4EBA\u7269\u30C7\u30FC\u30BF\u306E\u540D\u5B57\u3068\u8868\u793A\u540D\u304C\u9055\u3044\u307E\u3059");
      return out;
    }
    repairNames(mode2) {
      const h = this.hero, W2 = this.world;
      if (mode2 === "family") {
        applyHeroName(W2, h.id, h.father, h.mother, h.name);
        this.log("family", "\u5BB6\u65CF\u306E\u540D\u5B57\u3092\u4E3B\u4EBA\u516C\u306B\u5408\u308F\u305B\u3066\u6574\u3048\u305F");
      } else {
        const fs = W2.surName(W2.curSur(h.father));
        const gn = h.name.split(/[\s\u3000]+/).slice(1).join("");
        W2.pop.givenOv[h.id] = gn;
        W2.pop.sur[h.id] = W2.curSur(h.father);
        h.name = fs + " " + gn;
        this.log("family", "\u4E3B\u4EBA\u516C\u306E\u540D\u5B57\u3092\u5BB6\u65CF\u306B\u5408\u308F\u305B\u305F");
      }
      return this.nameCheck();
    }
    nameOf(id) {
      if (id === this.hero.id) return this.hero.name;
      return id == null || id < 0 ? "(\u4E0D\u660E)" : nameOf(this.S.seed, id, this.world.pop);
    }
    ageOf(id) {
      return ageYears(this.world.pop, id, this.S.M);
    }
    homeName() {
      const b = this.world.map.buildings[this.hero.homeB];
      return `${b.name}(${b.addr})`;
    }
    bld(i) {
      return this.world.map.buildings[i];
    }
    log(kind, text, extra = {}) {
      this.S.log.push({ i: this.S.uid++, M: this.S.M, d: this.S.day, kind, text, ...extra });
    }
    on(fn) {
      this.listeners.push(fn);
    }
    emit(type, data) {
      for (const f2 of this.listeners) f2(type, data);
    }
    chg(delta) {
      const st3 = this.hero.stats;
      const parts = [];
      for (let [k, v] of Object.entries(delta)) {
        const before = st3[k];
        if (k === "intel" && v > 0) v *= 1 - st3.intel / 90;
        st3[k] = clamp(st3[k] + v, 0, 100);
        const dv = Math.round(st3[k] - before);
        if (dv) parts.push(`${{ health: "\u5065\u5EB7", energy: "\u4F53\u529B", hunger: "\u6E80\u8179", mood: "\u6C17\u5206", intel: "\u5B66\u529B", fitness: "\u904B\u52D5", social: "\u793E\u4EA4", charm: "\u9B45\u529B" }[k]}${dv > 0 ? "+" : ""}${dv}`);
      }
      return parts.length ? "(" + parts.join(" ") + ")" : "";
    }
    pay(n2, why) {
      n2 = Math.round(n2);
      if (n2 <= 0) return;
      this.hero.money -= n2;
      this.S.m.expense.push([why, n2]);
      if (this.hero.money < 0) {
        this.hero.debt += -this.hero.money;
        this.S.m.expense.push(["(\u4E0D\u8DB3\u5206\u3092\u501F\u5165)", 0]);
        this.hero.money = 0;
      }
    }
    earn(n2, why) {
      n2 = Math.round(n2);
      if (n2 <= 0) return;
      this.hero.money += n2;
      this.S.m.income.push([why, n2]);
    }
    snapshotStats() {
      this.S.m.stat0 = { ...this.hero.stats, money: this.hero.money };
    }
    // ----- 関係
    meet(id, d = 5) {
      if (id == null || id < 0 || id === this.hero.id) return;
      const r = this.hero.rel;
      let x = r[id];
      const first = !x;
      if (!x) {
        x = r[id] = { aff: 0, met: this.S.M, last: this.S.M, romance: false, closeLog: 0 };
        this.world.known.add(id);
      }
      x.aff = clamp(x.aff + d, 0, 100);
      x.last = this.S.M;
      if (first && this.world.lives.has(id)) {
        this.world.remember(id, `${this.hero.name}\u3068\u77E5\u308A\u5408\u3063\u305F`, { who: this.hero.id, w: 2 });
        this.world.lives.get(id).chg++;
      }
      if (first && d >= 6) this.log("meet", `${this.nameOf(id)}(${this.ageOf(id)}\u6B73)\u3068\u77E5\u308A\u5408\u3063\u305F`, { who: id });
      if (x.aff >= 50 && !x.friendLogged) {
        x.friendLogged = 1;
        this.world.remember(id, `${this.hero.name}\u3068\u53CB\u3060\u3061\u306B\u306A\u3063\u305F`, { who: this.hero.id, w: 3 });
        this.log("friend", `${this.nameOf(id)}\u3068\u53CB\u3060\u3061\u306B\u306A\u3063\u305F`, { who: id });
      }
      if (x.aff >= 85 && !x.bestLogged) {
        x.bestLogged = 1;
        this.log("bestfriend", `${this.nameOf(id)}\u3068\u306F\u4F55\u3067\u3082\u8A71\u305B\u308B\u4EF2\u306B\u306A\u3063\u305F`, { who: id });
      }
    }
    relOf(id) {
      return this.hero.rel[id] || null;
    }
    randomClassmate() {
      const e = this.hero.edu;
      if (e.b < 0) return null;
      const rng = this.actRng("cm");
      const L2 = this._cmCache && this._cmCache.k === e.b + ":" + (this.S.M / 12 | 0) ? this._cmCache.L : null;
      let list = L2;
      if (!list) {
        list = this.world.classmates(this.hero.id, e.b);
        this._cmCache = { k: e.b + ":" + (this.S.M / 12 | 0), L: list };
      }
      if (!list.length) return null;
      return rng.pick(list);
    }
    randomKnownFriend() {
      const ids = Object.keys(this.hero.rel).map(Number).filter((i) => this.hero.rel[i].aff >= 25 && !this.world.pop.gone[i]);
      if (!ids.length) return null;
      return this.actRng("kf").pick(ids);
    }
    meetRandomKnownFriend(d) {
      const f2 = this.randomKnownFriend();
      if (f2 != null) this.meet(f2, d);
    }
    meetRandomResident(d) {
      const p = this.world.pop;
      const rng = this.actRng("rr");
      for (let t = 0; t < 40; t++) {
        const i = rng.int(p.n);
        if (!p.gone[i] && i !== this.hero.id && Math.abs(this.ageOf(i) - this.age()) < 15 && this.world.dist(p.home[i] < 0 ? this.hero.homeB : p.home[i], this.hero.homeB) < 60) {
          this.meet(i, d);
          return i;
        }
      }
      return null;
    }
    pickSingle() {
      const p = this.world.pop, rng = this.actRng("single");
      const a = this.age();
      for (let t = 0; t < 400; t++) {
        const i = rng.int(p.n);
        if (p.gone[i] || p.spouse[i] >= 0 || i === this.hero.id || p.flags[i] & F_STUDENT) continue;
        const ai = this.ageOf(i);
        if (ai < 20 || Math.abs(ai - a) > 8 || p.mother[i] >= 0 && p.mother[i] === this.hero.mother) continue;
        if (this.hero.rel[i]?.romance) continue;
        return i;
      }
      return null;
    }
    addFamilyKnown() {
      const p = this.world.pop, h = this.hero;
      const fam = /* @__PURE__ */ new Set([h.mother, h.father]);
      for (const q of [h.mother, h.father]) for (const g of [p.mother[q], p.father[q]]) if (g >= 0 && !p.gone[g]) fam.add(g);
      for (let i = 0; i < p.n; i++) if (i !== h.id && (p.mother[i] === h.mother || p.father[i] === h.father) && p.mother[i] >= 0) fam.add(i);
      for (const i of fam) {
        if (i < 0 || p.gone[i]) continue;
        h.rel[i] = h.rel[i] || { aff: 60, met: this.S.M, last: this.S.M, romance: false, family: true };
        this.world.known.add(i);
      }
      this.world.known.add(h.id);
    }
    // 交際の申し込み(18歳以上同士のみ)。成否は好感度と魅力に依存。断られても関係が壊れるわけではない。
    askOut(id) {
      const h = this.hero, p = this.world.pop, r = h.rel[id];
      if (!r) return { ok: false, msg: "\u307E\u3060\u3088\u304F\u77E5\u3089\u306A\u3044\u4EBA\u3067\u3059\u3002" };
      if (this.age() < 18 || this.ageOf(id) < 18) return { ok: false, msg: "\u4EA4\u969B\u306E\u7533\u3057\u8FBC\u307F\u306F\u3001\u304A\u305F\u304C\u304418\u6B73\u4EE5\u4E0A\u306E\u5834\u5408\u306E\u307F\u3067\u3059\u3002" };
      if (p.spouse[id] >= 0 || p.gone[id]) return { ok: false, msg: "\u76F8\u624B\u306B\u306F\u3001\u3059\u3067\u306B\u30D1\u30FC\u30C8\u30CA\u30FC\u304C\u3044\u307E\u3059\u3002" };
      if (r.family) return { ok: false, msg: "\u5BB6\u65CF\u3067\u3059\u3002" };
      if (r.romance) return { ok: false, msg: "\u3059\u3067\u306B\u4EA4\u969B\u3057\u3066\u3044\u307E\u3059\u3002" };
      if (h.spouse != null || Object.values(h.rel).some((x) => x.romance && !x.family)) return { ok: false, msg: "\u3042\u306A\u305F\u306B\u306F\u3059\u3067\u306B\u30D1\u30FC\u30C8\u30CA\u30FC\u304C\u3044\u307E\u3059\u3002" };
      if (r.aff < 40) return { ok: false, msg: "\u3082\u3046\u5C11\u3057\u4EF2\u826F\u304F\u306A\u3063\u3066\u304B\u3089\u306B\u3057\u307E\u3057\u3087\u3046\u3002" };
      const ok = this.actRng("ask").next() < 0.2 + r.aff / 160 + h.stats.charm / 500;
      if (ok) {
        r.romance = true;
        r.romanceSince = this.S.M;
        this.world.remember(id, `${h.name}\u3068\u4ED8\u304D\u5408\u3044\u59CB\u3081\u305F`, { who: h.id, w: 5 });
        this.log("couple", `${this.nameOf(id)}\u3068\u4EA4\u969B\u3092\u59CB\u3081\u305F`, { who: id });
        return { ok: true, msg: `${this.nameOf(id)}\u306F\u300C\u3088\u308D\u3057\u304F\u304A\u9858\u3044\u3057\u307E\u3059\u300D\u3068\u7B54\u3048\u3066\u304F\u308C\u307E\u3057\u305F\u3002` };
      }
      r.aff = Math.max(0, r.aff - 3);
      return { ok: false, msg: `${this.nameOf(id)}\u306F\u300C\u3054\u3081\u3093\u306A\u3055\u3044\u3001\u3044\u307E\u306F\u8003\u3048\u3089\u308C\u306A\u3044\u306E\u300D\u3068\u7B54\u3048\u307E\u3057\u305F\u3002\u6C17\u6301\u3061\u306F\u3001\u3061\u3083\u3093\u3068\u4F1D\u308F\u308A\u307E\u3057\u305F\u3002` };
    }
    autoSocial(rng) {
      const h = this.hero, a = this.age();
      if (a < 14) return;
      const ids = Object.keys(h.rel).map(Number).filter((i) => !this.world.pop.gone[i]);
      const non = ids.filter((i) => !h.rel[i].family && !h.rel[i].romance).sort((x, y) => h.rel[y].aff - h.rel[x].aff);
      non.forEach((i, k) => {
        const r = h.rel[i];
        if (k < 5 && this.S.M - r.last < 30) {
          r.aff = Math.min(100, r.aff + 2.2);
          r.last = this.S.M;
        } else r.aff = Math.max(0, r.aff - 0.3);
      });
      for (const i of ids) {
        const r = h.rel[i];
        if (r.romance && !r.family) {
          r.aff = Math.min(100, r.aff + 2.5);
          r.last = this.S.M;
        }
      }
      if (rng.next() < 0.35) {
        const c = a >= 20 ? this.pickSingle() : null;
        if (c != null && !h.rel[c]) this.meet(c, 12);
        else this.meetRandomResident(7);
      }
      if (a >= 20 && a <= 44 && h.spouse == null) {
        for (const i of ids) {
          const r = h.rel[i];
          if (!r.family && !r.romance && r.aff >= 55 && this.ageOf(i) >= 20 && Math.abs(this.ageOf(i) - a) <= 8 && rng.next() < 0.25) {
            this.askOut(i);
            break;
          }
        }
      }
    }
    placeInHome() {
      const b = this.bld(this.hero.homeB);
      if (b.estate === 2) {
        this.S.loc = { k: "in", b: b.idx, floor: 1, x: 6.5, y: 4.5, f: "d" };
        return;
      }
      if (isCondo(b)) {
        const u = unitOfPerson(this, this.hero.id);
        if (u) {
          const W3 = Math.max(10, Math.min(22, b.w * 2)), H5 = Math.max(9, Math.min(14, b.h * 2 + 3));
          this.S.loc = { k: "in", b: b.idx, floor: unitCode(u.lv, u.pos), x: (W3 >> 1) + 0.5, y: H5 - 3.2, f: "u" };
          return;
        }
      }
      const W2 = Math.max(10, Math.min(22, b.w * 2)), H4 = Math.max(9, Math.min(14, b.h * 2 + 3));
      this.S.loc = { k: "in", b: b.idx, floor: 0, x: (W2 >> 1) + 0.5, y: H4 - 3.2, f: "u" };
    }
    // ----- 時間
    blocked() {
      return this.S.queue.length > 0 || this.S.ended;
    }
    canWalk() {
      return this.ageMonths() >= 24;
    }
    applyTime(step2) {
      const st3 = this.hero.stats;
      const sleeping = this.S.sleeping;
      if (sleeping) {
        st3.energy = clamp(st3.energy + 0.22 * step2, 0, 100);
        st3.hunger = clamp(st3.hunger - 0.025 * step2, 0, 100);
        st3.health = clamp(st3.health + 0.01 * step2, 0, 100);
        return;
      }
      st3.hunger = clamp(st3.hunger - 0.055 * step2, 0, 100);
      st3.energy = clamp(st3.energy - 0.045 * step2, 0, 100);
      if (st3.hunger < 8) st3.health = clamp(st3.health - 0.01 * step2, 0, 100);
      if (st3.energy < 10) st3.mood = clamp(st3.mood - 0.01 * step2, 0, 100);
    }
    advance(mins) {
      let left = Math.round(mins);
      while (left > 0 && !this.blocked()) {
        const step2 = Math.min(left, 1440 - this.S.min, 60 - this.S.min % 60);
        this.applyTime(step2);
        this.S.min += step2;
        left -= step2;
        if (this.S.min >= 1440) {
          this.S.min = 0;
          this.rollDay();
        }
        if (this.hero.stats.energy <= 0 && !this.S.sleeping && !this.blocked()) this.collapse();
      }
    }
    collapse() {
      const st3 = this.hero.stats;
      this.log("health", "\u75B2\u308C\u304D\u3063\u3066\u5012\u308C\u3066\u3057\u307E\u3044\u3001\u3057\u3070\u3089\u304F\u4F11\u3093\u3060");
      st3.health = clamp(st3.health - 4, 0, 100);
      st3.mood = clamp(st3.mood - 3, 0, 100);
      this.S.sleeping = true;
      this.advance(7 * 60);
      this.S.sleeping = false;
      st3.energy = Math.max(st3.energy, 60);
    }
    // 夜までの睡眠: 朝(6:30)まで。日付が変わる。
    sleepUntilMorning(wakeH = 6.5) {
      const wake = Math.round(wakeH * 60);
      this.S.sleeping = true;
      let mins = this.S.min < wake ? wake - this.S.min : 1440 - this.S.min + wake;
      if (mins < 240) mins += 0;
      this.advance(mins);
      this.S.sleeping = false;
      return mins;
    }
    isSchoolDay(dt = this.date()) {
      if (dt.dow === 0 || dt.dow === 6) return false;
      if (HOLIDAYS(dt)) return false;
      const k = dt.m0 * 100 + dt.d;
      if (k >= 721 && k <= 831) return false;
      if (k >= 1226 || k <= 106) return false;
      if (k >= 325 && k <= 405) return false;
      return true;
    }
    workDayFor(job, dt = this.date()) {
      if (!job) return false;
      const hol = HOLIDAYS(dt);
      if (SERVICE_JOBS.has(job.jobId)) return dt.dow !== hash2(this.hero.id, 7) % 7;
      return dt.dow >= 1 && dt.dow <= 5 && !hol;
    }
    shiftOf(job) {
      const h = hash2(this.hero.id, 77);
      const j = job.jobId;
      if (job.part) return [16, 20];
      switch (j) {
        case "fisher":
          return [4, 12];
        case "farmer":
          return [6, 16];
        case "clerk":
        case "stocker":
          return h % 2 ? [9, 18] : [12, 21];
        case "cook":
        case "waitstaff":
          return [11, 20];
        case "hotelstaff":
          return [8, 17];
        case "doctor":
        case "nurse":
          return [8, 17];
        case "teacher":
        case "special_teacher":
        case "childcare":
          return [8, 17];
        default:
          return [9, 18];
      }
    }
    isStudentNow() {
      return this.hero.edu.b >= 0 && this.hero.edu.cur > 0;
    }
    // ----- 日・月の進行
    rollDay() {
      const S2 = this.S;
      const dt0 = this.date();
      if (this.isStudentNow() && this.S.day0.schoolWanted && !this.S.day0.attended) {
        S2.m.absent++;
      }
      this.S.day0 = { schoolWanted: false, attended: false, ate: 0, worked: 0 };
      S2.day++;
      dailyHealth(this);
      if (S2.day > dim(this.year(), this.month0())) {
        S2.day = 1;
        this.rollMonth();
      }
      if (!S2.ended) {
        this.S.day0.schoolWanted = this.isStudentNow() && this.isSchoolDay() && this.age() >= 3;
      }
    }
    heroPerson() {
      return this.hero.id;
    }
    monthlyWage(job = this.hero.job) {
      if (!job) return 0;
      const J = JOBS[job.jobId];
      const skill = this.hero.skills[J.skill] || 0;
      const pr = this.prof();
      const lv = jobLv(pr.jxp[job.jobId] || 0);
      return J.wage * this.pi() * (1 + 0.14 * (pr.rank || 0)) * (1 + 0.035 * (lv - 1)) * (1 + Math.min(0.2, skill / 500));
    }
    hourly(job = this.hero.job) {
      if (!job) return 0;
      return job.part ? Math.max(this.yen(900), this.monthlyWage(job) / 168 * 0.8) : this.monthlyWage(job) / 168;
    }
    jobYears(job = this.hero.job) {
      return job ? (this.S.M - job.since) / 12 : 0;
    }
    rentOf(b) {
      if (this.hero.flags.shelter && b.idx === this.hero.homeB) return this.yen(21e3);
      const t = b.type;
      return this.yen({ apt: 58e3, house: 88e3, tower: 135e3, farmhouse: 42e3, villa: 16e4 }[t] || 7e4);
    }
    rollMonth() {
      const S2 = this.S, h = this.hero, rep = { M: S2.M, lines: [], income: [], expense: [], events: [], news: [], world: [] };
      this.settleMonth(rep);
      S2.M++;
      this.world.tickMonth();
      if (this.heroLeftEarly()) {
      }
      S2.m = { hours: 0, attend: 0, absent: 0, income: [], expense: [], ev: [], news: [], stat0: null, parttimeHours: 0 };
      this.snapshotStats();
      this.nextMonthStartHooks(false);
      this.collectNews(rep);
      rep.after = { M: S2.M, money: h.money, debt: h.debt, stats: { ...h.stats } };
      rep.days = [];
      S2.queue.unshift({ type: "report", rep });
      monthlyScenario(this);
      if (S2.endM && S2.M === S2.endM - 2) {
        this.log("health", "\u91CD\u3044\u75C5\u6C17\u304C\u308F\u304B\u308A\u3001\u5165\u9662\u3059\u308B\u3053\u3068\u306B\u306A\u3063\u305F");
        h.stats.health = Math.min(h.stats.health, 22);
        h.stats.energy = Math.min(h.stats.energy, 30);
      }
      if (S2.M >= this.endMonth()) this.endLife();
      this.emit("month", rep);
    }
    heroLeftEarly() {
      return false;
    }
    settleMonth(rep) {
      const S2 = this.S, h = this.hero, st3 = h.stats, a = this.age();
      const m = S2.m;
      this.growHeroMonth(rep);
      if (h.job) {
        const hrs = m.hours;
        const base = this.hourly() * hrs;
        if (hrs > 0) {
          const net = Math.round(base * 0.84);
          this.earn(net, `\u7D66\u4E0E(${JOBS[h.job.jobId].name}\u30FB${hrs.toFixed(0)}\u6642\u9593)`);
          h.job.zero = 0;
        } else {
          h.job.zero = (h.job.zero || 0) + 1;
          if (h.job.zero >= 3 && !h.job.part) {
            this.dismiss("\u9577\u304F\u51FA\u52E4\u3057\u306A\u304B\u3063\u305F\u305F\u3081");
          }
        }
      }
      monthlyBiz(this);
      monthlyFirms(this);
      if (a >= 20 && h.homeIsParents && h.job && !parentsCover(this)) this.pay(Math.round(m.income.reduce((q, x) => q + x[1], 0) * 0.2), "\u5BB6\u306B\u5165\u308C\u308B\u304A\u91D1");
      if (h.spouse != null && this.world.pop.job[h.spouse] !== 255 && !this.world.pop.gone[h.spouse]) this.earn(Math.round(JOBS[JOB_IDS2[this.world.pop.job[h.spouse]]].wage * this.pi() * 0.84 * 0.9), "\u914D\u5076\u8005\u306E\u53CE\u5165(\u4E16\u5E2F)");
      if (h.spouse != null && !this.world.pop.gone[h.spouse] && this.world.pop.job[h.spouse] === 255 && this.ageOf(h.spouse) >= 65) this.earn(this.yen(105e3), "\u914D\u5076\u8005\u306E\u5E74\u91D1(\u4E16\u5E2F)");
      const al = ALLOWANCE(a) * this.pi();
      if (al > 0 && h.homeIsParents) this.earn(al, "\u304A\u5C0F\u9063\u3044");
      if (a >= 18 && a < 65 && !h.job && !h.flags.retired && h.money < this.yen(6e4) && !(h.spouse != null && this.world.pop.job[h.spouse] !== 255 && !this.world.pop.gone[h.spouse]) && !(h.homeIsParents && h.spouse == null)) this.earn(this.yen(h.homeIsParents ? 8e4 : 135e3), "\u751F\u6D3B\u4FDD\u8B77(\u751F\u6D3B\u6276\u52A9\u30FB\u4F4F\u5B85\u6276\u52A9)");
      if (!h.flags.retired && a >= 65 && !h.job) this.earn(this.yen(65e3 * (0.9 + hash2(h.id, 5) % 15 / 100)), "\u56FD\u6C11\u5E74\u91D1(\u57FA\u790E\u5E74\u91D1)");
      if (h.flags.retired && a >= 65) this.earn(this.yen(15e4 * (0.8 + hash2(h.id, 3) % 30 / 100)), "\u5E74\u91D1");
      if (a >= 20 && h.homeIsParents && h.spouse == null && !parentsCover(this)) {
        const ord0 = m.income.filter((x) => /給与|収入/.test(x[0]) && !/配偶者/.test(x[0])).reduce((q, x) => q + x[1], 0);
        if (ord0 > 0) this.pay(Math.round(ord0 * 0.28), "\u5B9F\u5BB6\u306B\u5165\u308C\u308B\u751F\u6D3B\u8CBB");
      }
      if (a >= 20 && (!h.homeIsParents || h.spouse != null)) {
        const P2 = this.world.pop;
        const kids = h.kids.filter((k) => !P2.gone[k]);
        const ku = kids.filter((k) => this.ageOf(k) < 18).length;
        const edu = kids.filter((k) => {
          const ka = this.ageOf(k);
          return ka >= 15 && ka < 22;
        }).length;
        const ordinary = m.income.filter((x) => !/相続|福引|お年玉|遺産|賞与|お小遣い/.test(x[0])).reduce((q, x) => q + x[1], 0);
        const base = this.yen(6e4 + (h.spouse != null ? 34e3 : 0) + 34e3 * ku + 26e3 * edu);
        const stress = h.debt > this.yen(6e5) ? Math.min(1, h.debt / (ordinary * 12 + 1)) : 0;
        const tight = 1 - 0.18 * stress;
        this.pay(Math.round((base + 0.4 * ordinary) * tight), "\u751F\u6D3B\u8CBB(\u98DF\u8CBB\u30FB\u65E5\u7528\u54C1\u30FB\u4EA4\u969B\u30FB\u6559\u80B2\u30FB\u5A2F\u697D\u306A\u3069)");
        this.pay(Math.round(ordinary * 0.09), "\u4F4F\u6C11\u7A0E\u30FB\u4FDD\u967A\u6599\u30FB\u8010\u4E45\u8CA1\u30FB\u65C5\u884C\u306A\u3069");
      }
      {
        const med = a < 40 ? 3e3 : a < 65 ? 9e3 : a < 80 ? 22e3 : 38e3;
        this.pay(this.yen(med), "\u533B\u7642\u30FB\u85AC\u4EE3(\u81EA\u5DF1\u8CA0\u62C5)");
      }
      if (!h.homeIsParents && !h.owned.includes(h.homeB)) {
        const rent = this.rentOf(this.bld(h.homeB));
        this.pay(rent, "\u5BB6\u8CC3");
        const inc = m.income.filter((x) => /給与|収入|年金|生活保護/.test(x[0])).reduce((q, x) => q + x[1], 0);
        const ex = rent - 0.3 * inc;
        if (ex > 0) this.earn(Math.round(Math.min(ex * 0.6, this.yen(6e4))), "\u5BB6\u8CC3\u88DC\u52A9(\u4F4F\u5C45\u78BA\u4FDD\u7D66\u4ED8)");
      }
      if (!h.homeIsParents) this.pay(this.yen(16e3), "\u5149\u71B1\u8CBB\u30FB\u901A\u4FE1");
      monthlyHousing(this);
      monthlyRealty(this);
      monthlyInvest(this);
      monthlyVehicle(this);
      monthlyLicense(this);
      monthlyGather(this);
      monthlyHair(this);
      monthlyHealth(this);
      monthlyStocks(this);
      if (a >= 12 && a < 18) this.pay(this.yen(3e3), "\u643A\u5E2F\u4EE3");
      if (h.edu.level === 4 && h.edu.cur === 5 && !parentsCover(this)) this.pay(this.yen(45e3), "\u5927\u5B66\u306E\u5B66\u8CBB(\u4E00\u90E8\u8CA0\u62C5)");
      lifeMonthly(this);
      if (h.debt > 0) {
        const intr = Math.round(h.debt * 3e-3);
        h.debt += intr;
        if (h.money > 0) {
          const r = Math.min(h.money, h.debt, Math.max(this.yen(2e4), 0));
          h.money -= r;
          h.debt -= r;
          this.S.m.expense.push(["\u501F\u5165\u306E\u8FD4\u6E08", r]);
        }
      }
      if (h.money > this.yen(3e5) && h.flags.saver) {
      }
      rep.income = m.income.slice();
      rep.expense = m.expense.slice();
      rep.hours = m.hours;
      rep.attend = m.attend;
      rep.absent = m.absent;
      if (h.debt > this.yen(6e5) && S2.M - (h.flags.debtSupportM ?? -999) > 24 && a >= 18) {
        h.flags.debtSupportM = S2.M;
        this.queueEvent("debt_support", {});
      }
      for (const k of h.kids.slice()) {
        const p = this.world.pop;
        if (p.gone[k]) continue;
        const ka = this.ageOf(k);
        const mo = (S2.M - p.born[k]) % 12;
        if (mo === 0 && [3, 6, 12, 15, 18, 20].includes(ka)) this.log("kids", `${this.nameOf(k)}\u304C${ka}\u6B73\u306B\u306A\u3063\u305F`, { who: k });
      }
    }
    growHeroMonth(rep) {
      const h = this.hero, S2 = this.S, m = S2.m, a = this.age(), pr = this.prof();
      if (a >= 3) pr.lxp += 2 + (this.isStudentNow() ? 1 : 0) + (h.job ? 1 : 0) + (h.spouse != null ? 1 : 0) + (h.kids.length ? 1 : 0);
      if (h.job) {
        const J = JOBS[h.job.jobId];
        const eff = m.hours / (h.job.part ? 80 : 150);
        pr.jxp[h.job.jobId] = (pr.jxp[h.job.jobId] || 0) + eff;
        addSkill(pr, J.skill, 0.45 * Math.min(1.3, eff));
        if (!h.job.part && m.hours >= 100 && this.actRng("promo").next() < 0.03) {
          const tbl = staffTables(this.world);
          if (promoteCheck(this.world, h.id, S2.M, tbl)) {
            const nm = doPromote(this.world, h.id, S2.M, tbl);
            h.job.rank = pr.rank;
            this.log("job", `${this.bld(h.job.b).name}\u3067${nm}\u306B\u6607\u9032\u3057\u305F`, { promo: 1 });
            this.queueEvent("promoted", { rank: nm, job: J.name });
          }
        }
      }
    }
    dismiss(reason) {
      const h = this.hero;
      if (!h.job) return;
      this.log("job", `${JOBS[h.job.jobId].name}\u306E\u4ED5\u4E8B\u3092\u96E2\u308C\u305F(${reason})`);
      this.world.freeSlot(h.id, "quit");
      h.job = null;
      this.queueEvent("job_lost", { text: `${reason}\u3001\u4ED5\u4E8B\u3092\u7D9A\u3051\u3089\u308C\u306A\u304F\u306A\u308A\u307E\u3057\u305F\u3002\u5E02\u5F79\u6240\u306E\u63B2\u793A\u677F\u3084\u5404\u304A\u5E97\u3067\u6B21\u306E\u4ED5\u4E8B\u3092\u63A2\u305B\u307E\u3059\u3002` });
    }
    retire() {
      const h = this.hero;
      if (h.job) {
        this.log("job", `${JOBS[h.job.jobId].name}\u3092\u9000\u8077\u3057\u305F(${this.age()}\u6B73)`, { retire: 1 });
        this.world.freeSlot(h.id, "retired");
        h.job = null;
      }
      h.flags.retired = true;
      this.world.pop.flags[h.id] |= F_RETIRED;
      return "(\u3053\u308C\u304B\u3089\u306F\u5E74\u91D1\u3068\u8CAF\u3048\u3067\u66AE\u3089\u3057\u307E\u3059)";
    }
    // ----- 世界の出来事を要約(知っている人だけ)
    collectNews(rep) {
      const w = this.world, S2 = this.S, h = this.hero;
      const txt2 = (e) => {
        const n2 = this.nameOf(e.id);
        switch (e.type) {
          case "married":
            return `${n2}\u304C\u7D50\u5A5A\u3057\u305F`;
          case "child":
            return `${n2}\u306B\u5B50\u3069\u3082\u304C\u751F\u307E\u308C\u305F`;
          case "died":
            return `${n2}\u304C\u4EA1\u304F\u306A\u3063\u305F`;
          case "newjob":
            return `${n2}\u304C\u65B0\u3057\u3044\u4ED5\u4E8B\u306B\u5C31\u3044\u305F`;
          case "retired":
            return `${n2}\u304C\u9000\u8077\u3057\u305F`;
          case "moved":
            return `${n2}\u304C\u5F15\u3063\u8D8A\u3057\u305F`;
          case "divorced":
            return `${n2}\u304C\u96E2\u5A5A\u3057\u305F`;
          case "widowed":
            return `${n2}\u304C\u30D1\u30FC\u30C8\u30CA\u30FC\u3092\u4EA1\u304F\u3057\u305F`;
          case "laidoff":
            return `${n2}\u306E\u8077\u5834\u304C\u306A\u304F\u306A\u3063\u305F`;
          case "visit_out":
            return `市外に住む${n2}が、${e.obon ? "お盆" : "正月"}に${this.nameOf(e.host)}の家を訪ねた`;
          default:
            return null;
        }
      };
      tallyMonth(this);
      if (this.month0() === 0 && this.year() > 1900) {
        rep.year = yearRecap(this, this.year() - 1);
        S2.vis = { y: rep.year.y, town: rep.year.town.slice(0, 2) };
        S2.yt = null;
      }
      for (const e of w.events) {
        if (e.id === h.id) continue;
        const t = txt2(e);
        if (!t) continue;
        if (!w.known.has(e.id)) continue;
        rep.news.push(t);
        this.log("news", t, { who: e.id, ev: e.type });
        if (e.type === "died") {
          const fam = h.rel[e.id]?.family || e.id === h.mother || e.id === h.father;
          if (fam || (h.rel[e.id]?.aff || 0) >= 70) {
            const kind = e.id === h.mother ? "\u6BCD" : e.id === h.father ? "\u7236" : h.rel[e.id]?.family ? "\u5BB6\u65CF" : "\u5927\u5207\u306A\u4EBA";
            this.queueEvent("family_loss", { title: `${this.nameOf(e.id)}\u3068\u306E\u304A\u5225\u308C`, text: `${kind}\u306E${this.nameOf(e.id)}\u304C\u4EA1\u304F\u306A\u308A\u307E\u3057\u305F\u3002`, id: e.id });
            this.hero.flags.lossCount = (h.flags.lossCount || 0) + 1;
            if (fam && this.age() >= 25) this.queueEvent("inheritance", { name: this.nameOf(e.id), amount: this.yen(2e5 + hash2(e.id, 5) % 12e5) });
          }
        }
        if (e.type === "child" && h.kids.some((k) => k === e.id || this.world.pop.mother[k] === e.id || this.world.pop.father[k] === e.id)) {
          const c = e.child;
          if (c != null) this.queueEvent("grandchild", { child: c });
        }
      }
      for (const we of WORLD_EVENTS) if (we.y === this.year() && we.m - 1 === this.month0()) {
        const k = eventKind(we.y);
        rep.world.push(`${we.text}${k === "history" ? "(\u5B9F\u969B\u306E\u51FA\u6765\u4E8B)" : ""}`);
        this.log("world", we.text, { kind: k });
      }
      if (this.month0() === 0) {
        const y = this.year() - 1;
        const ns = w.newsLog.filter((n2) => n2.y === y).slice(0, 4);
        for (const n2 of ns) rep.news.push(n2.text);
      }
      if (this.year() > 2026 && this.month0() === 0 && this.year() === 2027) rep.world.push("\u203B2026\u5E74\u3088\u308A\u5148\u306F\u3001\u3053\u306E\u30B2\u30FC\u30E0\u306E\u5275\u4F5C\u30B7\u30CA\u30EA\u30AA\u3067\u3059\u3002");
    }
    // ----- イベント
    queueEvent(id, ctx4 = {}) {
      this.S.queue.push({ type: "event", id, ctx: ctx4 });
    }
    nextMonthStartHooks(first) {
      const S2 = this.S, h = this.hero, a = this.age(), m0 = this.month0();
      const rng = monthRng(S2.seed, S2.M, "hev");
      if (!first) this.schoolHooks(rng);
      if (h.job && this.world.slots.who[h.job.slot] !== h.id) {
        this.log("job", `${this.bld(h.job.b).name}\u306E\u9589\u5E97\u7B49\u3067\u8077\u3092\u5931\u3063\u305F`);
        h.job = null;
        this.queueEvent("job_lost", {});
      }
      if (h.homeIsParents && p0(this).gone[h.mother] && p0(this).gone[h.father] && a >= 18) {
        h.homeIsParents = false;
        h.owned.push(h.homeB);
        this.log("home", `\u5B9F\u5BB6(${this.bld(h.homeB).name})\u3092\u76F8\u7D9A\u3057\u3066\u4F4F\u307F\u7D9A\u3051\u308B\u3053\u3068\u306B\u306A\u3063\u305F`);
      }
      if (h.job && a >= 65 && !h.flags.retireAsked) {
        h.flags.retireAsked = 1;
        this.queueEvent("retire", {});
      }
      if (h.job && h.flags.retireDefer && S2.M >= h.flags.retireDefer) {
        h.flags.retireDefer = 0;
        this.queueEvent("retire", {});
      }
      if (h.flags.retired === void 0 && !h.job && a >= 65) {
        h.flags.retired = true;
      }
      this.relationshipHooks(rng);
      this.drawEvents(rng);
      this.world.pop.apt[h.id] = clamp(Math.round(h.stats.intel * 2.4), 0, 255);
      this.syncWorldFlags();
    }
    syncWorldFlags() {
      const p = this.world.pop, h = this.hero;
      if (h.edu.cur > 0) p.flags[h.id] |= F_STUDENT;
      else p.flags[h.id] &= ~F_STUDENT;
      p.school[h.id] = h.edu.cur > 0 ? h.edu.b : -1;
      // 主人公の在籍記録(ties.js): 学校の種類から段階を決める
      if (h.edu.cur > 0 && h.edu.b >= 0 && typeof schRecord === "function") {
        const bt = this.world.map.buildings[h.edu.b];
        const lv = bt ? { kinder: 1, elem: 2, jh: 3, hs: 4, univ: 5 }[bt.type] : 0;
        if (lv) schRecord(this.world, h.id, lv, h.edu.b);
      }
      p.edu[h.id] = h.edu.level;
      if (h.job) {
        p.work[h.id] = h.job.b;
        p.job[h.id] = JOB_INDEX[h.job.jobId];
      } else {
        p.work[h.id] = -1;
        p.job[h.id] = 255;
      }
    }
    relationshipHooks(rng) {
      const h = this.hero, a = this.age();
      const p = this.world.pop;
      if (h.spouse != null && p.gone[h.spouse]) {
        this.log("family", `${this.nameOf(h.spouse)}\u3092\u898B\u9001\u3063\u305F`);
        h.spouse = null;
      }
      if (h.spouse == null && a >= 20 && !(h.flags.proposalWait > this.S.M)) {
        for (const k of Object.keys(h.rel)) {
          const r = h.rel[k];
          if (!r.romance || r.family) continue;
          if (p.gone[k] || p.spouse[k] >= 0) {
            r.romance = false;
            continue;
          }
          if (r.aff >= 85 && this.S.M - (r.romanceSince || 0) >= 10 && !h.flags["prop" + k]) {
            h.flags["prop" + k] = 1;
            this.queueEvent("proposal", { c: Number(k) });
            break;
          }
        }
      }
      if (h.spouse != null && p.spouse[h.spouse] === h.id && h.kids.length < 3) {
        const sa = this.ageOf(h.spouse);
        const ay = Math.min(a, sa);
        if (ay >= 22 && ay <= 41 && rng.next() < (ay < 35 ? 0.012 : 4e-3)) {
          const heroIsMother = heroIsMotherSlot(this);
          const before = p.n;
          if (heroIsMother) this.world.birth(rng, h.id, h.spouse, this.S.M);
          else this.world.birth(rng, h.spouse, h.id, this.S.M);
          const c = before;
          if (p.n > before) {
            h.kids.push(c);
            p.home[c] = h.homeB;
            this.world.known.add(c);
            h.rel[c] = { aff: 80, met: this.S.M, last: this.S.M, family: true, romance: false };
            this.queueEvent("child_born", { child: c });
            this.log("family", `${this.nameOf(c)}\u304C\u751F\u307E\u308C\u305F`, { who: c });
          }
        }
      }
    }
    marry(c, wedding) {
      const h = this.hero, p = this.world.pop;
      if (c == null || p.gone[c] || p.spouse[c] >= 0) return "";
      if (this.age() < 18 || this.ageOf(c) < 18) return "";
      if (wedding) this.pay(this.yen(6e5), "\u7D50\u5A5A\u5F0F");
      p.spouse[h.id] = c;
      p.spouse[c] = h.id;
      h.spouse = c;
      this.meet(c, 100);
      const r = h.rel[c];
      r.romance = true;
      r.family = true;
      {
        const W0 = this.world;
        const heroTakes = W0.isFem(h.id) && !W0.isFem(c);
        if (heroTakes) {
          const before = h.name;
          W0.setSur(h.id, W0.curSur(c), "marry");
          h.birthName = h.birthName || before;
          h.name = W0.surName(W0.curSur(h.id)) + " " + (before.split(/[\s\u3000]+/).slice(1).join("") || "");
          if (h.name !== before) this.log("family", `\u7D50\u5A5A\u3057\u3066\u540D\u5B57\u304C\u300C${h.name.split(" ")[0]}\u300D\u306B\u306A\u3063\u305F(\u65E7\u59D3: ${before.split(" ")[0]})`);
        } else W0.setSur(c, W0.curSur(h.id), "marry");
      }
      const rng = this.actRng("marry");
      const W2 = this.world;
      let nb = h.homeB;
      if (h.homeIsParents) {
        const pool = [...W2.resList.apt, ...W2.resList.house].filter((b) => W2.occ[b] < capOf(W2.map.buildings[b]) * 1.15);
        const cand = [];
        for (let t = 0; t < 14 && pool.length; t++) cand.push(pool[rng.int(pool.length)]);
        nb = cand.length ? cand.sort((x, y) => this.rentOf(W2.map.buildings[x]) - this.rentOf(W2.map.buildings[y]) || x - y)[0] : W2.pickHome(rng, "apt", this.S.M);
      }
      if (nb !== h.homeB) {
        this.world.moveHome(h.id, nb);
        h.homeB = nb;
        h.homeIsParents = false;
      }
      this.world.moveHome(c, nb);
      this.world.remember(c, `${h.name}\u3068\u7D50\u5A5A\u3057\u305F`, { who: h.id, w: 5 });
      this.log("marry", `${this.nameOf(c)}\u3068\u7D50\u5A5A\u3057\u305F${wedding ? "(\u7D50\u5A5A\u5F0F\u3092\u6319\u3052\u305F)" : ""}\u3002\u65B0\u5C45\u306F${this.bld(nb).name}`, { who: c });
      return this.chg({ mood: 15, social: 3 });
    }
    drawEvents(rng) {
      const S2 = this.S, h = this.hero, a = this.age(), m0 = this.month0();
      const done = h.flags.done;
      const ok = (e) => a >= e.ages[0] && a <= e.ages[1] && (!e.months || e.months.includes(m0)) && !(e.once && done[e.id]) && (!e.cond || e.cond(this));
      for (const e of Object.values(EVENTS)) if (e.w >= 99 && ok(e)) {
        if (this.tryQueue(e, rng, true)) {
        }
      }
      if (a < 2) return;
      if (rng.next() < 0.78) {
        const pool = MONTHLY_POOL().filter((e) => e.w < 99 && ok(e));
        let tries = 0;
        while (pool.length && tries++ < 6) {
          const total = pool.reduce((s, e) => s + e.w, 0);
          let r = rng.next() * total;
          let pick5 = pool[0];
          for (const e of pool) {
            r -= e.w;
            if (r < 0) {
              pick5 = e;
              break;
            }
          }
          pool.splice(pool.indexOf(pick5), 1);
          if (this.tryQueue(pick5, rng, false)) break;
        }
      }
    }
    tryQueue(e, rng, forced) {
      const probe = e.make(this, e.ctxProbe || {}, rng);
      if (!probe) return false;
      const ctx4 = probe.ctx || {};
      if (e.once) this.hero.flags.done[e.id] = 1;
      this.S.queue.push({ type: "event", id: e.id, ctx: ctx4 });
      return true;
    }
    // プロンプトの本文(UI用)
    promptView() {
      const q = this.S.queue[0];
      if (!q) return null;
      if (q.type === "report") return { type: "report", rep: q.rep };
      const e = EVENTS[q.id];
      const v = e.make(this, q.ctx || {}, this.actRng("mk"));
      if (!v) {
        this.S.queue.shift();
        return this.promptView();
      }
      return { type: "event", id: q.id, title: v.title, text: v.text, choices: v.choices.map((c) => c.label), ask: !!e.ask, auto: v.auto ?? 0 };
    }
    choose(i) {
      const q = this.S.queue[0];
      if (!q) return "";
      if (q.type === "report") {
        this.S.queue.shift();
        return "";
      }
      const e = EVENTS[q.id];
      const v = e.make(this, q.ctx || {}, this.actRng("mk"));
      this.S.queue.shift();
      if (!v) return "";
      const c = v.choices[i] || v.choices[0];
      const rr3 = c.apply(this, this.actRng("ev"));
      const res = typeof rr3 === "string" ? rr3 : "";
      this.S.stats.eventsSeen++;
      this.S.m.ev.push(v.title);
      if (q.id !== "birth_info") this.log("event", `${v.title}${c.label && c.label !== "OK" ? `: ${c.label}` : ""}`.trim(), { ev: q.id });
      this.emit("event", { id: q.id, choice: i });
      return res;
    }
    // ----- 学校
    nearestSchoolLevel(level) {
      return this.world.nearestSchool(this.world.schools[level], this.hero.homeB);
    }
    enroll(level, b) {
      const e = this.hero.edu;
      e.cur = level;
      e.b = b;
      e.year = 0;
      this._cmCache = null;
      this.log("school", `${this.bld(b).name}\u306B\u5165\u5B66\u3057\u305F`, { b, level });
      const cm = this.world.classmates(this.hero.id, b).slice(0, 40);
      for (let k = 0; k < Math.min(6, cm.length); k++) this.meet(cm[(k * 7 + this.S.M) % cm.length], 4);
    }
    graduate(level) {
      const e = this.hero.edu;
      e.level = Math.max(e.level, level);
      const nm = e.b >= 0 ? this.bld(e.b).name : "";
      this.log("school", `${nm}\u3092\u5352\u696D\u3057\u305F`, { b: e.b, level });
      e.cur = 0;
      e.b = -1;
      this.queueEvent("graduation", { title: "\u5352\u696D\u5F0F", text: `${nm}\u3092\u5352\u696D\u3057\u307E\u3057\u305F\u3002` });
    }
    examScore() {
      return this.hero.stats.intel * 2.2 + this.hero.study * 0.45 + (this.actRng("exam").next() - 0.5) * 24;
    }
    schoolHooks(rng) {
      const h = this.hero, e = h.edu, S2 = this.S, m0 = this.month0();
      const a = this.age();
      const sa = S2.sy && m0 < 3 ? this.ageAt(S2.M - m0 - 9) : a;
      const needsSupport = this.world.pop.needs[h.id] & NEED.SUPPORT || this.world.pop.flags[h.id] & F_SUPPORT;
      if (m0 === 1 && sa === 14 && h.flags.hsPick != null) {
        if (h.flags.hsPick < 0) {
          h.flags.hsFinal = -1;
        } else {
          const L2 = this.world.schools[4];
          const need = [150, 110, 60, 0];
          const sc = this.examScore();
          let tier2 = h.flags.hsTier ?? 0;
          let res = null;
          for (let t = tier2; t < L2.length; t++) {
            if (sc >= need[Math.min(3, t)]) {
              res = L2[t];
              break;
            }
          }
          if (res == null) res = L2[L2.length - 1];
          h.flags.hsFinal = res;
          const pass = res === h.flags.hsPick;
          this.log("exam", `\u9AD8\u6821\u53D7\u9A13: ${pass ? "\u5FD7\u671B\u6821\u306B\u5408\u683C\u3057\u305F" : "\u5FD7\u671B\u6821\u306F\u4E0D\u5408\u683C\u3001" + this.bld(res).name + "\u3078\u9032\u5B66\u304C\u6C7A\u307E\u3063\u305F"}`);
          this.queueEvent("exam_result", { title: "\u9AD8\u6821\u5165\u8A66\u306E\u7D50\u679C", text: pass ? `${this.bld(res).name}\u306B\u5408\u683C\u3057\u307E\u3057\u305F!` : `\u5FD7\u671B\u6821\u306F\u6B8B\u5FF5\u3067\u3057\u305F\u304C\u3001${this.bld(res).name}\u306B\u9032\u3080\u3053\u3068\u306B\u306A\u308A\u307E\u3057\u305F\u3002` });
        }
      }
      if (m0 === 1 && sa === 17 && h.flags.path18 === "univ" && h.flags.univPick != null) {
        const sc = this.examScore();
        const U2 = this.world.schools[5];
        const need = h.flags.univPick === U2[0] ? 105 : 80;
        const pass = sc >= need;
        if (pass) {
          h.flags.univFinal = h.flags.univPick;
          this.log("exam", `\u5927\u5B66\u5165\u8A66: ${this.bld(h.flags.univPick).name}\u306B\u5408\u683C\u3057\u305F`);
          this.queueEvent("exam_result", { title: "\u5927\u5B66\u5165\u8A66\u306E\u7D50\u679C", text: `${this.bld(h.flags.univPick).name}\u306B\u5408\u683C\u3057\u307E\u3057\u305F!` });
        } else {
          h.flags.univFinal = -1;
          this.log("exam", "\u5927\u5B66\u5165\u8A66: \u4E0D\u5408\u683C\u3060\u3063\u305F");
          this.queueEvent("ronin", {});
        }
      }
      if (m0 === 2) {
        if (e.cur === 1 && sa === 5) this.graduate(1);
        else if (e.cur === 2 && sa === 11) this.graduate(2);
        else if (e.cur === 3 && sa === 14) this.graduate(3);
        else if (e.cur === 4 && sa === 17) this.graduate(4);
        else if (e.cur === 5 && sa >= 21 && e.year >= 3) this.graduate(5);
        else if (e.cur === 6) {
        }
      }
      if (m0 === 3) {
        const ax = a;
        if (e.cur > 0) e.year++;
        if (ax === 3 && e.cur === 0 && e.level < 1) this.enroll(1, this.nearestSchoolLevel(1));
        else if (ax === 6 && e.cur === 0) {
          if (needsSupport && this.world.schools.sp.length) this.enroll(2, this.world.schools.sp[0]);
          else this.enroll(2, this.nearestSchoolLevel(2));
        } else if (ax === 12 && e.cur === 0 && e.level === 2) {
          if (needsSupport && this.world.schools.sp.length) this.enroll(3, this.world.schools.sp[0]);
          else this.enroll(3, this.nearestSchoolLevel(3));
        } else if (ax === 15 && e.cur === 0 && e.level >= 3) {
          const f2 = h.flags.hsFinal;
          if (f2 != null && f2 >= 0) this.enroll(4, f2);
          else if (f2 == null && this.world.schools[4].length) this.enroll(4, this.world.schools[4][this.world.schools[4].length - 1]);
        } else if (ax === 18 && e.cur === 0 && e.level === 4 && h.flags.path18 === "univ" && h.flags.univFinal >= 0) this.enroll(5, h.flags.univFinal);
        else if (ax === 19 && e.cur === 0 && e.level === 4 && h.flags.ronin && !h.flags.ronin2) {
          h.flags.ronin2 = 1;
          const sc = this.examScore();
          const U2 = this.world.schools[5];
          const t = h.flags.univPick;
          if (sc >= (t === U2[0] ? 105 : 80) - 5) this.enroll(5, t);
          else {
            this.log("exam", "\u518D\u53D7\u9A13\u3082\u53F6\u308F\u306A\u304B\u3063\u305F\u3002\u5C31\u8077\u306E\u9053\u3092\u63A2\u3059");
            h.flags.path18 = "work";
          }
        }
      }
      if (m0 === 3 && e.cur === 0 && e.level >= 3 && a >= 16 && !h.job && !h.flags.retired && !h.flags.wantJob && a >= 18) h.flags.wantJob = true;
      if (e.cur > 0) {
        h.study = Math.max(0, h.study - 3);
      }
    }
    // ----- 仕事
    heroEligible(jobId, s) {
      const h = this.hero, J = JOBS[jobId], a = this.age();
      if (!J) return false;
      if (a < J.minAge || a > 69) return false;
      if (J.fromY && this.year() < J.fromY) return false;
      if (this.isStudentNow() && h.edu.cur >= 2 && h.edu.cur <= 4 && !MINOR_JOBS.has(jobId)) return false;
      if (this.isStudentNow() && a < 18 && !MINOR_JOBS.has(jobId)) return false;
      if (a < 18 && (a < 15 || h.edu.level < 3 && a < 16)) return false;
      const req = EDU_REQ[jobId] || 0;
      if (h.edu.level < req && !(this.isStudentNow() && MINOR_JOBS.has(jobId))) return false;
      if (J.qual && !h.quals[J.qual]) {
        if (!this.world.eligibleFor(h.id, jobId, this.S.M)) return false;
      }
      if (J.lic && !h.quals[J.lic]) return false;
      if (J.exp && !expOK(this, J)) return false;
      return true;
    }
    vacanciesNear(limit = 30, filterB = -1) {
      const w = this.world, out = [];
      const home = this.hero.homeB;
      for (const s of w.vacant) {
        const b = w.slots.b[s];
        if (filterB >= 0 && b !== filterB) continue;
        const jid = JOB_IDS2[w.slots.job[s]];
        if (this.bld(b).status === "closed" || this.bld(b).type === "beachhouse") continue;
        if (!this.heroEligible(jid, s)) continue;
        out.push({ s, b, jobId: jid, d: w.dist(home, b) });
      }
      out.sort((a, c) => a.d - c.d);
      const seen = /* @__PURE__ */ new Set();
      const uniq = [];
      for (const o of out) {
        // オフィスビルは入居企業ごとに別の求人(tenants.js)
        const tb = typeof bizOfSlot === "function" ? bizOfSlot(this.world, o.s) : null;
        const k = o.b + ":" + o.jobId + (tb ? ":" + tb.id : "");
        if (seen.has(k)) continue;
        seen.add(k);
        uniq.push(o);
        if (uniq.length >= limit) break;
      }
      return uniq;
    }
    applyJob(s) {
      const w = this.world, h = this.hero;
      const idx = w.vacant.indexOf(s);
      if (idx < 0) return "(\u305D\u306E\u6C42\u4EBA\u306F\u57CB\u307E\u3063\u3066\u3044\u307E\u3057\u305F)";
      if (h.job) {
        w.freeSlot(h.id);
      }
      w.vacant[idx] = w.vacant[w.vacant.length - 1];
      w.vacant.pop();
      w.takeSlot(h.id, s);
      const jid = JOB_IDS2[w.slots.job[s]];
      const J = JOBS[jid];
      h.job = { jobId: jid, b: w.slots.b[s], slot: s, since: this.S.M, rank: this.world.profOf(h.id).rank, skill: J.skill, part: this.isStudentNow() || this.age() < 18 || h.flags.partTime };
      h.flags.wantJob = false;
      this.log("job", `${this.bld(h.job.b).name}\u3067${J.name}\u3068\u3057\u3066\u50CD\u304D\u59CB\u3081\u305F${h.job.part ? "(\u30A2\u30EB\u30D0\u30A4\u30C8)" : ""}`, { b: h.job.b, jobId: jid });
      this.world.known.add(h.id);
      this.coworkersMeet();
      this.syncWorldFlags();
      return `${J.name}\u3068\u3057\u3066\u63A1\u7528\u3055\u308C\u307E\u3057\u305F\u3002`;
    }
    coworkersMeet() {
      const h = this.hero, p = this.world.pop, w = this.world;
      let n2 = 0;
      for (let s = 0; s < w.slots.b.length && n2 < 4; s++) {
        if (w.slots.b[s] === h.job.b && w.slots.who[s] >= 0 && w.slots.who[s] !== h.id) {
          this.meet(w.slots.who[s], 5);
          n2++;
        }
      }
    }
    // ----- 自動の1日(月・年スキップ、確認不要の日)
    autoDay() {
      const S2 = this.S, h = this.hero, st3 = h.stats, a = this.age(), rng = this.actRng("auto");
      const dt = this.date();
      S2.min = 6 * 60 + 30;
      S2.sleeping = false;
      if (dt.d === 20) this.autoSocial(rng);
      let eat = 3, energy = 15;
      if (a >= 3 && this.isStudentNow() && this.isSchoolDay(dt)) {
        S2.day0.attended = true;
        S2.day0.schoolWanted = true;
        S2.m.attend++;
        const L2 = h.edu.cur;
        st3.intel = clamp(st3.intel + (L2 >= 4 ? 0.012 : 0.016) * (1 + h.study / 200) * (1 - st3.intel / 120), 0, 100);
        h.study = clamp(h.study + 0.4, 0, 100);
        st3.social = clamp(st3.social + 0.03, 0, 100);
        energy += 8;
        if (h.flags.club === "sports" && a >= 12 && a < 18) {
          st3.fitness = clamp(st3.fitness + 0.06, 0, 100);
        }
      } else if (h.job && this.workDayFor(h.job, dt) && a >= 15) {
        const [sa, sb] = this.shiftOf(h.job);
        const hrs = h.job.part ? 4 : Math.min(8, sb - sa);
        const isoff = !h.job.part || (dt.dow === 0 || dt.dow === 6 || !this.isStudentNow() || !this.isSchoolDay(dt));
        if (isoff) {
          S2.m.hours += hrs;
          S2.stats.workHours += hrs;
          const J = JOBS[h.job.jobId];
          h.skills[J.skill] = (h.skills[J.skill] || 0) + hrs * 0.04;
          energy += hrs * 1.5;
          st3.fitness = clamp(st3.fitness + (["stamina", "craft"].includes(J.skill) ? 0.02 : 0), 0, 100);
        }
      } else {
        st3.mood = clamp(st3.mood + 0.4, 0, 100);
        if (rng.next() < 0.04) this.meetRandomKnownFriend(1.5);
      }
      if (a < 18 && S2.m.attend === 0 && dt.d === 1) {
      }
      st3.hunger = 72;
      st3.energy = clamp(95 - energy * 0.4, 40, 100);
      st3.mood = clamp(st3.mood + (60 - st3.mood) * 0.02, 0, 100);
      st3.fitness = clamp(st3.fitness - 6e-3, 15, 100);
      st3.social = clamp(st3.social + (st3.social > 25 ? -0.02 : 0), 0, 100);
      st3.charm = clamp(st3.charm - (st3.charm > 40 ? 4e-3 : 0), 0, 100);
      if (a >= 40) st3.health = clamp(st3.health - 0.01, 0, 100);
      else st3.health = clamp(st3.health + 0.01, 0, 100);
      if (!h.job && !h.flags.retired && a >= 18 && a < 65 && !this.isStudentNow() && !h.flags.homemaker && dt.d === 10) {
        const v = this.vacanciesNear(8);
        if (v.length && rng.next() < 0.6) {
          h.flags.partTime = false;
          v.sort((x, y) => JOBS[y.jobId].wage - JOBS[x.jobId].wage);
          this.applyJob(v[0].s);
        }
      }
      if (!h.job && a >= 15 && a < 18 && this.isStudentNow() && h.flags.wantJob && dt.d === 10) {
        const v = this.vacanciesNear(8);
        if (v.length) {
          h.flags.partTime = true;
          this.applyJob(v[0].s);
        }
      }
      S2.min = 1439;
      this.advanceToNextDayFast();
    }
    advanceToNextDayFast() {
      this.S.min = 0;
      this.rollDay();
      if (!this.S.ended) {
        this.S.min = 6 * 60 + 30;
      }
    }
    // 自動イベント処理(スキップ時の既定選択)
    autoResolveOne(stopOnAsk) {
      const pv = this.promptView();
      if (!pv) return false;
      if (pv.type === "report") {
        this.S.queue.shift();
        return true;
      }
      if (stopOnAsk && pv.ask) return false;
      const res = this.choose(pv.auto ?? 0);
      this.log("auto", `(\u81EA\u52D5)${pv.title}`, {});
      return true;
    }
    skipTo(targetM, stopOnAsk = true) {
      let guard = 0;
      while (this.S.M < targetM && !this.S.ended && guard++ < 2e5) {
        while (this.S.queue.length) {
          if (!this.autoResolveOne(stopOnAsk)) return { stopped: "ask" };
        }
        if (this.S.ended) break;
        this.autoDay();
      }
      while (this.S.queue.length && !this.S.ended) {
        if (!this.autoResolveOne(stopOnAsk)) return { stopped: "ask" };
      }
      return { stopped: this.S.ended ? "end" : null };
    }
    // 人生の終わり(絶対月)。既定は80年固定(960か月)。lifeMode='natural'のときは個人差のある寿命(80年が上限)。古いセーブには endM がない。
    endMonth() {
      return this.S.endM ?? this.S.bornM + LIFE_MONTHS;
    }
    setLifeMode(mode2) {
      const S2 = this.S;
      if (mode2 !== "natural") {
        S2.lifeMode = "fixed";
        delete S2.endM;
        return this.endMonth();
      }
      S2.lifeMode = "natural";
      const B2 = 2e-5, G4 = 0.09, A0 = Math.max(0, (S2.M - S2.bornM) / 12);
      const H0 = B2 / G4 * (Math.exp(G4 * A0) - 1);
      const u = Math.max(1e-9, new Rng(S2.seed, "lifespan").next());
      const a = Math.log(1 + (H0 - Math.log(u)) * G4 / B2) / G4;
      const full = S2.bornM + LIFE_MONTHS;
      S2.endM = Math.min(full, Math.max(S2.M + 3, S2.bornM + Math.round(a * 12)));
      if (S2.endM >= full) delete S2.endM;
      return this.endMonth();
    }
    endLife() {
      const S2 = this.S;
      S2.ended = true;
      this.log("end", `${this.hero.name}\u306F${Math.floor((S2.M - S2.bornM) / 12)}\u5E74\u306E\u4EBA\u751F\u3092\u6B69\u307F\u7D42\u3048\u305F`);
      this.syncWorldFlags();
    }
    // 位置
    where() {
      const l = this.S.loc;
      return l.k === "in" ? this.bld(l.b).name : "\u5C4B\u5916";
    }
  };

