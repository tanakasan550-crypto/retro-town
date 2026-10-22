  // src/world.js
  var CAP = 6e4;
  var JOB_IDS2 = Object.keys(JOBS);
  var JOB_INDEX = Object.fromEntries(JOB_IDS2.map((k, i) => [k, i]));
  var QUAL_IDS2 = Object.keys(QUALS);
  var monthIdx = (y, m0) => (y - 1900) * 12 + m0;
  var TARGET_POP = 1e4;
  var TARGET_POP_V4 = 3e4;
  var HOME_W = { downtown: 1.3, tower: 1.4, shinkansen: 0.8, shotengai: 1.1, chinatown: 1, oldtown: 1.1, port: 0.8, industrial: 0.25, campus: 1, culture: 0.8, suburb_n: 1, civic: 1, school: 1, newtown: 1.5, suburb_e: 1, suburb_w: 1, farm: 0.35, onsen: 0.4, themepark: 0.2, resort: 0.6, marina: 0.7, airport: 0.2, temple_town: 0.6, rural_n: 0.3, rural_s: 0.35 };
  var F_DETAIL = 1;
  var F_HERO = 2;
  var F_OUTWORK = 4;
  var F_RETIRED = 8;
  var F_STUDENT = 16;
  var F_SUPPORT = 32;
  var F_MIGRANT = 64;
  var F_HOMEMAKER = 128;
  var NEED = { WHEEL: 1, CANE: 2, HEARING: 4, SUPPORT: 8 };
  var Population = class {
    constructor() {
      const c = CAP;
      this.born = new Int32Array(c);
      this.gone = new Uint8Array(c);
      this.goneAt = new Int32Array(c).fill(-1);
      this.spouse = new Int32Array(c).fill(-1);
      this.mother = new Int32Array(c).fill(-1);
      this.father = new Int32Array(c).fill(-1);
      this.home = new Int16Array(c).fill(-1);
      this.work = new Int16Array(c).fill(-1);
      this.job = new Uint8Array(c).fill(255);
      this.school = new Int16Array(c).fill(-1);
      this.edu = new Uint8Array(c);
      this.apt = new Uint8Array(c);
      this.needs = new Uint8Array(c);
      this.look = new Uint32Array(c);
      this.flags = new Uint8Array(c);
      this.sur = new Uint8Array(c).fill(255);
      this.quals = new Uint16Array(c);
      this.kids = new Uint8Array(c);
      this.slot = new Int32Array(c).fill(-1);
      this.n = 0;
      this.surX = [];
      this.givenOv = {};
    }
    alive(i) {
      return this.gone[i] === 0;
    }
  };
  function ageYears(pop, id, M) {
    return Math.floor((M - pop.born[id]) / 12);
  }
  function nameOf(seed, id, pop) {
    const h = hash2(seed ^ 1540483477, id);
    const si = pop && pop.sur[id] !== 255 ? pop.sur[id] : h % SURNAMES.length;
    const sn = si >= 200 && pop && pop.surX ? pop.surX[si - 200] || SURNAMES[h % SURNAMES.length] : SURNAMES[si];
    const gn = pop && pop.givenOv && pop.givenOv[id] ? pop.givenOv[id] : GIVEN[(h >>> 8) % GIVEN.length];
    return sn + " " + gn;
  }
  var HZ = [];
  var hazardM0 = (age) => {
    const q = 2e-4 + 1e-5 * Math.exp(0.1 * age) + (age < 1 ? 2e-3 : 0);
    return 1 - Math.pow(1 - Math.min(0.9, q), 1 / 12);
  };
  var hazardM = (age) => {
    age = Math.max(0, Math.min(130, age | 0));
    let v = HZ[age];
    if (v === void 0) v = HZ[age] = hazardM0(age);
    return v;
  };
  var KC = ["start", "quit", "laid", "retired", "promo", "qual", "died"];
  var round1 = (o) => {
    const r = {};
    for (const k in o) {
      o[k] = Math.round(o[k] * 10) / 10;
      r[k] = o[k];
    }
    return r;
  };
  function packProf(p) {
    if (!p.hist || p.hist.length === void 0) return p;
    return { l: p.lxp, r: p.rank, rs: p.rankSince, s: p.since, k: round1(p.sk), j: round1(p.jxp), h: p.hist.map((e) => [e.M, Math.max(0, KC.indexOf(e.k)), e.job ?? "", e.b ?? -1, e.rank ?? e.q ?? 0]) };
  }
  function unpackProf(d) {
    if (d.lxp !== void 0) return d;
    return { lxp: d.l, rank: d.r, rankSince: d.rs, since: d.s, sk: d.k, jxp: d.j, hist: d.h.map((a) => {
      const e = { M: a[0], k: KC[a[1]] };
      if (a[2] !== "") e.job = a[2];
      if (a[3] >= 0) e.b = a[3];
      if (e.k === "qual") e.q = a[4];
      else if (e.k === "start" || e.k === "promo") e.rank = a[4];
      return e;
    }) };
  }
  var ERA_PIN = { oldwood: [18, 45], old: [18, 45], kissa: [14, 40], modern: [0, 12], mansion: [0, 14], high: [0, 15] };
  var TENANT_JOB_SCALE = 0.6;
  var _World = class _World {
    constructor(seed, startYear, opts = {}) {
      this.seed = seed;
      this.startYear = startYear;
      this.ver = opts.ver ?? 3;
      this.targetPop = this.ver >= 4 ? TARGET_POP_V4 : TARGET_POP;
      this.map = generateMap(seed, { ver: this.ver });
      augmentTransit(this.map);
      assignSalons(this.map);
      assignVoc(this.map);
      assignWa(this.map);
      assignUtil(this.map);
      this.M = monthIdx(startYear, 0);
      this.pop = new Population();
      this.occ = new Int32Array(this.map.buildings.length);
      this.known = /* @__PURE__ */ new Set();
      this.events = [];
      this.newsLog = [];
      this.tickCount = 0;
      this.stats = { births: 0, deaths: 0, marriages: 0, moves: 0, migrantsIn: 0, migrantsOut: 0 };
      const B2 = this.map.buildings;
      this.resList = { apt: [], house: [], farm: [], tower: [], villa: [] };
      B2.forEach((b) => {
        const t = b.type;
        if (t === "apt") this.resList.apt.push(b.idx);
        else if (t === "house") this.resList.house.push(b.idx);
        else if (t === "farmhouse") this.resList.farm.push(b.idx);
        else if (t === "tower") this.resList.tower.push(b.idx);
      });
      this.schools = { 1: [], 2: [], 3: [], 4: [], 5: [], sp: [] };
      B2.forEach((b) => {
        const bt = BTYPES[b.type];
        if (bt.cat === "school" && bt.level) {
          if (bt.support) this.schools.sp.push(b.idx);
          else this.schools[bt.level].push(b.idx);
        }
      });
      this.sn = {};
      this.heroId = -1;
      this.prof = /* @__PURE__ */ new Map();
      this.lives = /* @__PURE__ */ new Map();
      this.detailIds = /* @__PURE__ */ new Set();
      this._kids = null;
      if (opts.skipInit) {
        this.slots = { b: [], job: [], who: [] };
        this.vacant = [];
        return;
      }
      this.buildSlots(new Rng(seed, "slots"));
      this.initPopulation(new Rng(seed, "pop-init"));
      this.initBuildingHistory(new Rng(seed, "bhist"));
      backfill(this, new Rng(seed, "prof-init"));
      this.initLives(new Rng(seed, "lives-init"));
    }
    getCommute() {
      return this._cm || (this._cm = new Commute(this));
    }
    dayPlan(id, dow) {
      return dayPlan(this, id, dow);
    }
    nm(id) {
      return nameOf(this.seed, id, this.pop);
    }
    profOf(id) {
      let r = this.prof.get(id);
      if (!r) {
        r = newProf();
        this.prof.set(id, r);
      }
      return r;
    }
    noteLife(id, M, k, t) {
      lifeNote(this, id, M, k, t);
    }
    remember(id, text, o = {}) {
      return remember(this, id, this.M, text, o);
    }
    // ---- 名字(現在の名字と出生時の名字を区別。改姓の履歴は this.sn[id] = {b:出生時の名字番号, h:[[M,旧,新,理由]]})
    isFem(id) {
      return FEMALE_STYLE.has(this.pop.look[id] & 7);
    }
    curSur(id) {
      const p = this.pop;
      return p.sur[id] !== 255 ? p.sur[id] : hash2(this.seed ^ 1540483477, id) % SURNAMES.length;
    }
    surName(idx) {
      return idx >= 200 ? this.pop.surX[idx - 200] || "" : SURNAMES[idx];
    }
    surIdxOf(name) {
      const i = SURNAMES.indexOf(name);
      if (i >= 0) return i;
      const X = this.pop.surX;
      let j = X.indexOf(name);
      if (j < 0) {
        if (X.length >= 55) return hash2(this.seed, name.length) % SURNAMES.length;
        X.push(name);
        j = X.length - 1;
      }
      return 200 + j;
    }
    setSur(id, idx, why) {
      var _a;
      const p = this.pop;
      const cur2 = this.curSur(id);
      if (cur2 === idx) {
        if (p.sur[id] === 255) p.sur[id] = idx;
        return false;
      }
      const e = (_a = this.sn)[id] || (_a[id] = { b: cur2, h: [] });
      e.h.push([this.M, cur2, idx, why || ""]);
      p.sur[id] = idx;
      return true;
    }
    birthSurName(id) {
      const e = this.sn[id];
      return this.surName(e ? e.b : this.curSur(id));
    }
    // 夫婦は同じ名字(夫婦同姓)。夫(男性の見た目)の名字に妻が合わせる。同性/不明は先に挙げた方に合わせる
    coupleSur(a, b) {
      const [h, w] = this.isFem(a) && !this.isFem(b) ? [b, a] : [a, b];
      return this.setSur(w, this.curSur(h), "marry");
    }
    childrenOf(id) {
      const p = this.pop;
      if (!this._kids) {
        const m = /* @__PURE__ */ new Map();
        for (let i = 0; i < p.n; i++) this._linkKid(m, i);
        this._kids = m;
      }
      return this._kids.get(id) || [];
    }
    _linkKid(m, i) {
      const p = this.pop;
      for (const q of [p.mother[i], p.father[i]]) if (q >= 0) {
        let a = m.get(q);
        if (!a) m.set(q, a = []);
        if (!a.includes(i)) a.push(i);
      }
    }
    initLives(rng) {
      for (const i of this.detailIds) genLife(this, i, rng);
    }
    profileView(id) {
      return profileView(this, id, this.M);
    }
    serialize() {
      const p = this.pop, arrays = {};
      for (const k of _World.ARRS) arrays[k] = p[k].slice(0, p.n);
      return { prof: Object.fromEntries([...this.prof].filter(([k]) => !this.pop.gone[k] || this.lives.has(k)).map(([k, v]) => [k, packProf(v)])), lives: Object.fromEntries([...this.lives].map(([k, v]) => [k, v])), detail: [...this.detailIds], seed: this.seed, mapVer: this.ver, startYear: this.startYear, M: this.M, n: p.n, arrays, occ: Array.from(this.occ), slots: { b: this.slots.b.slice(), job: this.slots.job.slice(), who: this.slots.who.slice() }, vacant: this.vacant.slice(), known: [...this.known], events: this.events, newsLog: this.newsLog, tickCount: this.tickCount, stats: this.stats, heroId: this.heroId, alive: this.alive, bdyn: this.map.buildings.map((b) => ({ name: b.name, openYear: b.openYear, history: b.history, status: b.status, era: b.era, wa: b.wa || null, floors: b.floors, nf: b.nf || 0, ...b.planNf ? { planNf: b.planNf } : {} })), surX: p.surX, givenOv: p.givenOv, sn: this.sn };
    }
    static restore(d) {
      const w = new _World(d.seed, d.startYear, { skipInit: true, ver: d.mapVer ?? 1 });
      const p = w.pop;
      for (const k of _World.ARRS) if (d.arrays[k]) p[k].set(d.arrays[k]);
      p.surX = d.surX || [];
      p.givenOv = d.givenOv || {};
      w.sn = d.sn || {};
      for (const k of Object.keys(d.prof || {})) w.prof.set(+k, unpackProf(d.prof[k]));
      for (const k of Object.keys(d.lives || {})) w.lives.set(+k, d.lives[k]);
      w.detailIds = new Set(d.detail || []);
      p.n = d.n;
      w.M = d.M;
      w.occ.set(d.occ);
      w.slots = d.slots;
      w.vacant = d.vacant;
      w.extendSlots();
      w.known = new Set(d.known);
      w.events = d.events;
      w.newsLog = d.newsLog;
      w.tickCount = d.tickCount;
      w.stats = d.stats;
      w.heroId = d.heroId;
      w.alive = d.alive;
      d.bdyn.forEach((x, i) => {
        Object.assign(w.map.buildings[i], x);
        if (!x.nf) delete w.map.buildings[i].nf;
      });
      return w;
    }
    dist(i, j) {
      const B2 = this.map.buildings;
      return Math.abs(B2[i].doorX - B2[j].doorX) + Math.abs(B2[i].doorY - B2[j].doorY);
    }
    distPt(i, x, y) {
      const b = this.map.buildings[i];
      return Math.abs(b.doorX - x) + Math.abs(b.doorY - y);
    }
    // ---------- 求人スロット(職場×職種)
    buildSlots(rng) {
      this.slots = { b: [], job: [], who: [] };
      const B2 = this.map.buildings;
      const SC = 1.25;
      for (const b of B2) {
        const bt = BTYPES[b.type];
        if (!bt.slots) continue;
        for (const [job, nBase] of Object.entries(b.salon ? { hairdresser: b.salon.k === "luxury" || b.salon.k === "total" ? 4 : 2, clerk: 1 } : bt.slots)) {
          let n2 = Math.max(1, Math.round(nBase * SC * (b.tenant ? TENANT_JOB_SCALE : 1) * (0.75 + rng.next() * 0.5)));
          if (b.type === "station") n2 = Math.max(2, Math.round(n2 * 0.7));
          for (let i = 0; i < n2; i++) {
            this.slots.b.push(b.idx);
            this.slots.job.push(JOB_INDEX[job]);
            this.slots.who.push(-1);
          }
        }
      }
      this.extendSlots();
      this.vacant = [];
      for (let i = 0; i < this.slots.b.length; i++) this.vacant.push(i);
    }
    // 文化・産業・インフラ職業の勤務枠を追加。冪等(すでに拡張職の枠がある建物は触らない)=古いセーブ読込後も呼べる。
    extendSlots() {
      const ext = new Set(Object.keys(JOBS_EXT).map((k) => JOB_INDEX[k]));
      const have = /* @__PURE__ */ new Set();
      const S2 = this.slots;
      for (let s = 0; s < S2.b.length; s++) if (ext.has(S2.job[s])) have.add(S2.b[s]);
      let n2 = 0;
      for (const b of this.map.buildings) {
        if (have.has(b.idx) || b.status === "closed") continue;
        const tbl = b.util ? UTIL_SLOTS[b.util] : SLOTS_EXT[b.type];
        if (!tbl) continue;
        for (const [job, c] of Object.entries(tbl)) for (let i = 0; i < c; i++) {
          const s = S2.b.length;
          S2.b.push(b.idx);
          S2.job.push(JOB_INDEX[job]);
          S2.who.push(-1);
          if (this.vacant) this.vacant.push(s);
          n2++;
        }
      }
      return n2;
    }
    takeSlot(id, s) {
      this.slots.who[s] = id;
      const p = this.pop;
      p.work[id] = this.slots.b[s];
      p.job[id] = this.slots.job[s];
      p.slot[id] = s;
      if (this.prof) {
        const pr = this.profOf(id);
        const jid = JOB_IDS2[p.job[id]];
        const prevSame = pr.hist.length && [...pr.hist].reverse().find((e) => e.k === "quit" || e.k === "laid")?.job === jid;
        pr.rank = prevSame ? Math.floor(pr.rank / 2) : 0;
        pr.since = this.M;
        pr.rankSince = this.M;
        pushHist(pr, { M: this.M, k: "start", job: jid, b: this.slots.b[s], rank: pr.rank });
      }
      const q = QUAL_IDS2.indexOf(JOBS[JOB_IDS2[this.slots.job[s]]].qual);
      if (q >= 0) p.quals[id] |= 1 << q;
    }
    freeSlot(id, why = "quit") {
      const p = this.pop, s = p.slot[id];
      if (s < 0) return;
      if (this.prof && p.job[id] < 255) pushHist(this.profOf(id), { M: this.M, k: why, job: JOB_IDS2[p.job[id]], b: p.work[id] });
      this.slots.who[s] = -1;
      p.work[id] = -1;
      p.job[id] = 255;
      p.slot[id] = -1;
      this.vacant.push(s);
    }
    eligibleFor(id, jobId, M) {
      const p = this.pop, J = JOBS[jobId];
      const age = ageYears(p, id, M);
      if (age < J.minAge || age > 69) return false;
      if (J.lic || J.exp) {
        if (p.apt[id] < (J.edu >= 5 ? 120 : J.edu >= 4 ? 95 : 70) || age < J.minAge + (J.exp ? 6 : 1)) return false;
      }
      if (J.qual) {
        const qi = QUAL_IDS2.indexOf(J.qual);
        if (!(p.quals[id] & 1 << qi)) {
          const need = { doctor: 175, bar: 175, phd: 160, pharmacist: 140, nurse: 105, teaching: 110, childcare: 90, police: 90, fire: 90 }[J.qual] || 100;
          if (p.apt[id] < need) return false;
        }
      }
      return true;
    }
    findJob(rng, id, M, tries = 14) {
      if (this.ver >= 4) return this._findJobV4(rng, id, M);
      const p = this.pop;
      const home = p.home[id];
      let best = -1, bd = 1e9;
      if (!this.vacant.length) return false;
      for (let t = 0; t < tries; t++) {
        const vi = rng.int(this.vacant.length), s2 = this.vacant[vi];
        const jid = JOB_IDS2[this.slots.job[s2]];
        if (!this.eligibleFor(id, jid, M)) continue;
        const d = home >= 0 ? this.dist(home, this.slots.b[s2]) : 0;
        if (d < bd) {
          bd = d;
          best = vi;
        }
      }
      if (best < 0) return false;
      const s = this.vacant[best];
      this.vacant[best] = this.vacant[this.vacant.length - 1];
      this.vacant.pop();
      this.takeSlot(id, s);
      return true;
    }
    // 都市v2の初期配置: 求人の建物に近い住民から順に埋める(住民を自宅の格子に振り分けて、環状に探す)
    _placeJobsV4(rng, pool, M) {
      const p = this.pop, B2 = this.map.buildings, S2 = this.slots;
      const bucket = /* @__PURE__ */ new Map();
      const cellOf = (id) => {
        const b = B2[p.home[id]];
        return (b.doorX >> 5) + (b.doorY >> 5) * 64;
      };
      for (const id of pool) {
        const c = cellOf(id);
        let a = bucket.get(c);
        if (!a) bucket.set(c, a = []);
        a.push(id);
      }
      const order = [...Array(S2.b.length).keys()].sort((a, b) => (JOBS[JOB_IDS2[S2.job[b]]].qual ? 1 : 0) - (JOBS[JOB_IDS2[S2.job[a]]].qual ? 1 : 0) || a - b);
      const vac = [];
      let left = pool.length;
      for (const s of order) {
        const jid = JOB_IDS2[S2.job[s]];
        const sb = B2[S2.b[s]];
        const cx = sb.doorX >> 5, cy = sb.doorY >> 5;
        let bestId = -1, bestC = -1, bestI = -1, bd = 1e9, found = 0, rFirst = -1;
        for (let r = 0; r <= 14 && left > 0; r++) {
          if (found >= 1 && r > rFirst + 1) break;
          for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const gx = cx + dx, gy = cy + dy;
            if (gx < 0 || gy < 0 || gx >= 40 || gy >= 30) continue;
            const c = gx + gy * 64;
            const a2 = bucket.get(c);
            if (!a2) continue;
            for (let i = 0; i < a2.length; i++) {
              const id = a2[i];
              if (p.work[id] >= 0) continue;
              const age = ageYears(p, id, M);
              if (age > 66 && !JOBS[jid].qual && hash2(id, s) % 10 < 6) continue;
              if (!this.eligibleFor(id, jid, M)) continue;
              const hb = B2[p.home[id]];
              const d = Math.abs(hb.doorX - sb.doorX) + Math.abs(hb.doorY - sb.doorY);
              found++;
              if (rFirst < 0) rFirst = r;
              if (d < bd) {
                bd = d;
                bestId = id;
                bestC = c;
                bestI = i;
              }
            }
          }
        }
        if (bestId < 0 || rng.chance(0.06)) {
          vac.push(s);
          continue;
        }
        const a = bucket.get(bestC);
        a[bestI] = a[a.length - 1];
        a.pop();
        left--;
        this.takeSlot(bestId, s);
      }
      this.vacant = vac;
    }
    // 都市v2: 自宅に近い求人を優先する(求人の空間インデックス=32マスの格子。決定論)
    _slotCellIndex() {
      const S2 = this.slots, B2 = this.map.buildings;
      let ix = this._sci;
      if (!ix) ix = this._sci = { n: 0, cells: /* @__PURE__ */ new Map() };
      for (; ix.n < S2.b.length; ix.n++) {
        const b = B2[S2.b[ix.n]];
        const c = (b.doorX >> 5) + (b.doorY >> 5) * 64;
        let a = ix.cells.get(c);
        if (!a) ix.cells.set(c, a = []);
        a.push(ix.n);
      }
      return ix;
    }
    _findJobV4(rng, id, M) {
      const p = this.pop;
      const home = p.home[id];
      if (!this.vacant.length) return false;
      const hb = home >= 0 ? this.map.buildings[home] : this.map.buildings[0];
      const hx2 = hb.doorX, hy = hb.doorY;
      const ix = this._slotCellIndex();
      const cx = hx2 >> 5, cy = hy >> 5;
      let best = -1, bd = 1e9, found = 0, rFirst = -1;
      const B2 = this.map.buildings, S2 = this.slots;
      for (let r = 0; r <= 40; r++) {
        if (found >= 4 && r > rFirst + 1) break;
        for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const gx = cx + dx, gy = cy + dy;
          if (gx < 0 || gy < 0 || gx >= 40 || gy >= 30) continue;
          const a = ix.cells.get(gx + gy * 64);
          if (!a) continue;
          for (const s of a) {
            if (S2.who[s] >= 0) continue;
            const jid = JOB_IDS2[S2.job[s]];
            if (!this.eligibleFor(id, jid, M)) continue;
            const b = B2[S2.b[s]];
            if (b.status === "closed") continue;
            const d = (Math.abs(b.doorX - hx2) + Math.abs(b.doorY - hy)) * (0.85 + rng.next() * 0.3);
            found++;
            if (rFirst < 0) rFirst = r;
            if (d < bd) {
              bd = d;
              best = s;
            }
          }
        }
      }
      if (best < 0) return false;
      const vi = this.vacant.indexOf(best);
      if (vi < 0) return false;
      this.vacant[vi] = this.vacant[this.vacant.length - 1];
      this.vacant.pop();
      this.takeSlot(id, best);
      return true;
    }
    // ---------- 住居
    pickHome(rng, kind, M) {
      const lists = { apt: this.resList.apt, house: this.resList.house, farm: this.resList.farm, tower: this.resList.tower };
      const L2 = kind === "any" ? [...this.resList.apt, ...this.resList.house] : lists[kind];
      if (!L2 || !L2.length) return this.pickHome(rng, "any", M);
      if (this.ver >= 4) {
        const b = this._pickHomeV4(rng, kind, L2);
        if (b >= 0) return b;
      }
      for (let t = 0; t < 30; t++) {
        const b = L2[rng.int(L2.length)];
        if (this.occ[b] < capOf(this.map.buildings[b]) * 0.97) return b;
      }
      for (const b of L2) if (this.occ[b] < capOf(this.map.buildings[b])) return b;
      for (const b of [...this.resList.apt, ...this.resList.house, ...this.resList.tower]) if (this.occ[b] < capOf(this.map.buildings[b])) return b;
      return L2[0];
    }
    // 都市v2: 地域の重み×建物規模の平方根で選ぶ(都心やニュータウンに人が集まり、農村・工業地には少ない)
    _pickHomeV4(rng, kind, L2) {
      const hw = this._hw || (this._hw = {});
      let c = hw[kind];
      if (!c || c.L !== L2 || c.n !== L2.length) {
        const cum = new Float64Array(L2.length);
        let tot = 0;
        for (let i = 0; i < L2.length; i++) {
          const b = this.map.buildings[L2[i]];
          tot += (HOME_W[b.zone] ?? 0.5) * Math.sqrt(capOf(b));
          cum[i] = tot;
        }
        c = hw[kind] = { L: L2, n: L2.length, cum, tot };
      }
      for (let t = 0; t < 30; t++) {
        const r = rng.next() * c.tot;
        let lo = 0, hi2 = L2.length - 1;
        while (lo < hi2) {
          const m = lo + hi2 >> 1;
          if (c.cum[m] < r) lo = m + 1;
          else hi2 = m;
        }
        const b = L2[lo];
        if (this.occ[b] < capOf(this.map.buildings[b]) * 0.97) return b;
      }
      return -1;
    }
    moveHome(id, b) {
      const p = this.pop;
      if (p.home[id] >= 0) this.occ[p.home[id]]--;
      p.home[id] = b;
      this.occ[b]++;
    }
    // ---------- 人物生成
    newPerson(rng, ageM, M, opts = {}) {
      const p = this.pop;
      const id = p.n++;
      p.born[id] = M - ageM;
      p.gone[id] = 0;
      p.look[id] = rng.next() * 4294967296 >>> 0;
      const par = opts.mother >= 0 && opts.father >= 0 ? (p.apt[opts.mother] + p.apt[opts.father]) / 2 : 128;
      p.apt[id] = Math.max(0, Math.min(255, Math.round(par * 0.35 + (128 + rng.gauss() * 38) * 0.65)));
      p.mother[id] = opts.mother ?? -1;
      p.father[id] = opts.father ?? -1;
      if (this._kids) this._linkKid(this._kids, id);
      {
        const par2 = opts.father >= 0 ? opts.father : opts.mother;
        p.sur[id] = par2 >= 0 ? p.sur[par2] !== 255 ? p.sur[par2] : hash2(this.seed ^ 1540483477, par2) % SURNAMES.length : hash2(this.seed ^ 1540483477, id) % SURNAMES.length;
      }
      const age = Math.floor(ageM / 12);
      const pn = 0.02 + 14e-4 * Math.max(0, age - 40);
      if (rng.chance(pn)) {
        p.needs[id] = rng.weighted([[NEED.WHEEL, 0.3], [NEED.CANE, 0.2], [NEED.HEARING, 0.25], [NEED.SUPPORT, 0.25]]);
        if (age < 18 && p.needs[id] & (NEED.SUPPORT | NEED.HEARING) && rng.chance(0.55)) p.flags[id] |= F_SUPPORT;
      }
      if (age < 3 && rng.chance(4e-3)) {
        p.needs[id] = NEED.SUPPORT;
      }
      if (this.prof && age >= 3) this.profOf(id).lxp = Math.round(age * 12 * 3.1 * (0.85 + p.apt[id] % 31 / 100));
      return id;
    }
    initPopulation(rng) {
      const M = this.M, p = this.pop, Y2 = this.startYear;
      const elderBias = Math.min(0.35, 0.12 + Math.max(0, Y2 - 1990) * 33e-4);
      const ageAdult = (a, b) => rng.range(a, b);
      const addHH = (members, home) => {
        for (const id of members) {
          p.home[id] = home;
          this.occ[home]++;
        }
      };
      let guard = 0;
      while (p.n < this.targetPop && guard++ < 4e4) {
        const roll = rng.weighted([["single", 16], ["couple", 20], ["family", 31], ["sp", 6], ["gen3", 11], ["eldcouple", 7 + elderBias * 30], ["eldsingle", 4 + elderBias * 20], ["young", 5]]);
        const mk5 = (age, o = {}) => this.newPerson(rng, age * 12 + rng.int(12), M, o);
        const ms = [];
        let kind = "apt";
        if (roll === "single") {
          ms.push(mk5(ageAdult(20, 64)));
          kind = "apt";
        } else if (roll === "young") {
          ms.push(mk5(ageAdult(19, 29)));
          kind = "apt";
        } else if (roll === "couple") {
          const a = ageAdult(23, 62);
          const x = mk5(a), y = mk5(Math.max(20, a + rng.range(-4, 4)));
          p.spouse[x] = y;
          p.spouse[y] = x;
          this.coupleSur(x, y);
          ms.push(x, y);
          kind = rng.chance(0.5) ? "apt" : "house";
        } else if (roll === "family" || roll === "sp" || roll === "gen3") {
          const a = ageAdult(27, 50);
          const x = mk5(a);
          ms.push(x);
          let y = -1;
          if (roll !== "sp") {
            y = mk5(Math.max(22, a + rng.range(-4, 3)));
            p.spouse[x] = y;
            p.spouse[y] = x;
            this.coupleSur(x, y);
            ms.push(y);
          }
          const nk = rng.weighted([[1, 38], [2, 42], [3, 15], [4, 5]]);
          const maxChild = Math.min(22, a - 22);
          for (let i = 0; i < nk && maxChild >= 0; i++) {
            const c = mk5(rng.range(0, maxChild), { mother: x, father: y >= 0 ? y : x });
            ms.push(c);
            p.kids[x]++;
            if (y >= 0) p.kids[y]++;
          }
          if (roll === "gen3") {
            const g = mk5(a + rng.range(24, 34));
            ms.push(g);
            p.mother[x] = g;
            if (rng.chance(0.6)) {
              const g2 = mk5(Math.min(95, a + rng.range(24, 34)));
              p.spouse[g] = g2;
              p.spouse[g2] = g;
              this.coupleSur(g, g2);
              ms.push(g2);
            }
            kind = "house";
          } else kind = rng.chance(0.55) ? "house" : "apt";
        } else if (roll === "eldcouple") {
          const a = ageAdult(62, 90);
          const x = mk5(a), y = mk5(Math.min(95, a + rng.range(-4, 4)));
          p.spouse[x] = y;
          p.spouse[y] = x;
          this.coupleSur(x, y);
          ms.push(x, y);
          kind = rng.chance(0.6) ? "house" : "apt";
        } else {
          ms.push(mk5(ageAdult(65, 95)));
          kind = rng.chance(0.5) ? "house" : "apt";
        }
        let home;
        if (kind === "house" && rng.chance(0.14) && this.resList.farm.length) home = this.pickHome(rng, "farm");
        else home = this.pickHome(rng, kind === "house" && !this.resList.house.length ? "any" : kind);
        if (kind === "apt" && this.resList.tower.length && rng.chance(0.2)) home = this.pickHome(rng, "tower");
        addHH(ms, home);
      }
      this.assignSchoolsAll(rng, M, true);
      const pool = [];
      for (let i = 0; i < p.n; i++) {
        const age = ageYears(p, i, M);
        if (age >= 15 && age <= 69 && !(p.flags[i] & F_STUDENT)) pool.push(i);
        if (age >= 24) p.edu[i] = p.edu[i] || (p.apt[i] > 150 && rng.chance(0.55) ? 5 : p.apt[i] > 70 ? 4 : 3);
        else if (age >= 18) p.edu[i] = p.edu[i] || 4;
        else if (age >= 15) p.edu[i] = 3;
        else if (age >= 12) p.edu[i] = 2;
        else if (age >= 6) p.edu[i] = 1;
      }
      rng.shuffle(pool);
      if (this.ver >= 4) {
        this._placeJobsV4(rng, pool, M);
      } else {
        const order = [...Array(this.slots.b.length).keys()].sort((a, b) => (JOBS[JOB_IDS2[this.slots.job[b]]].qual ? 1 : 0) - (JOBS[JOB_IDS2[this.slots.job[a]]].qual ? 1 : 0));
        const vac = this.vacant;
        this.vacant = [];
        let hm2 = 0;
        for (const s of order) {
          const jid = JOB_IDS2[this.slots.job[s]];
          let got = -1;
          for (let t = 0; t < 40 && pool.length; t++) {
            const pi = rng.int(pool.length), id2 = pool[pi];
            if (p.work[id2] >= 0) continue;
            const age = ageYears(p, id2, M);
            if (age > 66 && !JOBS[jid].qual && rng.chance(0.6)) continue;
            if (!this.eligibleFor(id2, jid, M)) continue;
            got = pi;
            break;
          }
          if (got < 0 || rng.chance(0.06)) {
            this.vacant.push(s);
            continue;
          }
          const id = pool[got];
          pool[got] = pool[pool.length - 1];
          pool.pop();
          this.takeSlot(id, s);
        }
      }
      for (const id of pool) {
        if (p.work[id] >= 0) continue;
        const age = ageYears(p, id, M);
        if (age >= 65) {
          p.flags[id] |= F_RETIRED;
          continue;
        }
        if (rng.chance(0.6)) p.flags[id] |= F_OUTWORK;
        else if (rng.chance(0.4)) p.flags[id] |= F_HOMEMAKER;
      }
      for (let i = 0; i < p.n; i++) {
        const age = ageYears(p, i, M);
        if (age >= 65 && p.work[i] < 0) p.flags[i] |= F_RETIRED;
      }
      let det = 0;
      const idsAll = rng.shuffle([...Array(p.n).keys()]);
      for (const i of idsAll) {
        if (det >= 1e3) break;
        if (p.gone[i]) continue;
        p.flags[i] |= F_DETAIL;
        this.detailIds.add(i);
        det++;
      }
    }
    nearestSchool(list, home) {
      let best = -1, bd = 1e9;
      for (const s of list) {
        const d = this.dist(home, s);
        if (d < bd) {
          bd = d;
          best = s;
        }
      }
      return best;
    }
    schoolFor(rng, id, ageA) {
      const p = this.pop, home = p.home[id];
      if (home < 0) return -1;
      if (ageA >= 3 && ageA <= 5) return rng.chance(0.93) ? this.nearestSchool(this.schools[1], home) : -1;
      if (ageA >= 6 && ageA <= 17 && p.flags[id] & F_SUPPORT && this.schools.sp.length) return this.schools.sp[0];
      if (ageA >= 6 && ageA <= 11) return this.nearestSchool(this.schools[2], home);
      if (ageA >= 12 && ageA <= 14) return this.nearestSchool(this.schools[3], home);
      if (ageA >= 15 && ageA <= 17) return this.pickHighSchool(rng, id);
      if (ageA >= 18 && ageA <= 21) {
        const prob = p.apt[id] > 150 ? 0.7 : p.apt[id] > 110 ? 0.35 : 0.08;
        return rng.chance(prob) ? this.nearestSchool(this.schools[5], home) : -1;
      }
      return -1;
    }
    pickHighSchool(rng, id) {
      const p = this.pop, L2 = this.schools[4];
      if (!L2.length || !rng.chance(0.975)) return -1;
      const home = p.home[id];
      let best = -1, bs = -1e9;
      L2.forEach((s, tier2) => {
        const need = [150, 110, 60, 0][Math.min(tier2, 3)];
        if (p.apt[id] + rng.gauss() * 12 < need) return;
        const sc = (tier2 === 0 ? 20 : 0) - this.dist(home, s) * 0.25 + rng.next() * 18;
        if (sc > bs) {
          bs = sc;
          best = s;
        }
      });
      return best >= 0 ? best : L2[L2.length - 1];
    }
    schoolLevelOf(b) {
      const bt = BTYPES[this.map.buildings[b].type];
      return bt.level || 0;
    }
    assignSchoolsAll(rng, M, init) {
      const p = this.pop;
      for (let i = 0; i < p.n; i++) {
        if (p.gone[i] || p.flags[i] & F_HERO) continue;
        this.updateSchool(rng, i, M, init);
      }
    }
    updateSchool(rng, i, M, force = false) {
      const p = this.pop;
      const m0 = M % 12;
      const a = Math.max(0, Math.floor((M - (m0 >= 3 ? m0 - 3 : m0 + 9) - p.born[i]) / 12));
      const cur2 = p.school[i];
      const want = a >= 3 && a <= 21;
      const entryAges = [3, 6, 12, 15, 18];
      if (!want) {
        if (cur2 >= 0) {
          p.school[i] = -1;
          p.flags[i] &= ~F_STUDENT;
        }
        return;
      }
      if (cur2 < 0 && !force && !entryAges.includes(a)) {
        p.flags[i] &= ~F_STUDENT;
        return;
      }
      const need = a >= 3 && a <= 5 ? 1 : a <= 11 ? 2 : a <= 14 ? 3 : a <= 17 ? 4 : 5;
      const curLevel = cur2 >= 0 ? BTYPES[this.map.buildings[cur2].type].support ? 0 : this.schoolLevelOf(cur2) : -1;
      if (force || entryAges.includes(a) || cur2 >= 0 && curLevel !== need && curLevel !== 0) {
        const s = this.schoolFor(rng, i, a);
        if (s >= 0) {
          p.school[i] = s;
          p.flags[i] |= F_STUDENT;
          p.edu[i] = Math.max(p.edu[i], need - 1);
        } else {
          p.school[i] = -1;
          p.flags[i] &= ~F_STUDENT;
        }
      } else if (cur2 >= 0) p.flags[i] |= F_STUDENT;
      if (a === 22 && cur2 >= 0) {
        p.edu[i] = Math.max(p.edu[i], 5);
      }
      if (a === 18 && !(p.flags[i] & F_STUDENT)) p.edu[i] = Math.max(p.edu[i], 4);
    }
    // ---------- 建物履歴(以前ここに何があったか)
    initBuildingHistory(rng) {
      for (const b of this.map.buildings) {
        const open2 = this.startYear - rng.range(2, b.type === "shrine" || b.type === "temple" ? 300 : 45);
        b.openYear = Math.max(1400, open2);
        b.history = [{ y: b.openYear, text: `${b.name}(${BTYPES[b.type].label})\u3068\u3057\u3066\u958B\u696D\u30FB\u5EFA\u8A2D` }];
        if (b.pin && ERA_PIN[b.pin]) {
          const [a, z] = ERA_PIN[b.pin];
          b.openYear = this.startYear - rng.range(a, z);
          b.history[0].y = b.openYear;
        }
        b.status = "open";
        b.era = b.openYear < 1975 ? 0 : b.openYear < 2e3 ? 1 : 2;
        const ef = eraFloors(b, this.startYear);
        if (ef !== baseStoreys(b)) b.nf = ef;
      }
    }
    yearlyTownChange(y, rng) {
      for (const b of this.map.buildings) {
        if (!b.nf) continue;
        const t = eraFloors(b, y);
        if (t > b.nf && (t - b.nf >= 3 || hash2(b.idx * 13 + y, 7311) % 100 < 35)) {
          b.nf = t;
          b.history.push({ y, text: `${y}\u5E74 \u9AD8\u5C64\u5316(${t}\u968E\u5EFA\u3066\u306B\u5EFA\u3066\u66FF\u3048)` });
        }
      }
      const B2 = this.map.buildings;
      let changes = 0;
      for (const b of B2) {
        if (!["shop", "ramen", "restaurant", "cafe", "clothes", "bookstore", "izakaya", "fishshop", "greengrocer", "liquor", "gamecenter"].includes(b.type)) continue;
        if (b.status === "open" && rng.chance(0.022)) {
          b.status = "closed";
          b.history.push({ y, text: `${b.name}\u304C\u9589\u5E97\u3057\u305F` });
          this.newsLog.push({ y, kind: "town", text: `${b.name}\u304C\u9589\u5E97\u3057\u305F(${b.addr})`, b: b.idx });
          changes++;
          this.vacateBuildingJobs(b.idx);
        } else if (b.status === "closed" && rng.chance(0.4)) {
          b.status = "open";
          const old = b.name;
          b.name = b.salon ? salonName(b, old) : rng.pick(SHOP_PREFIX) + BTYPES[b.type].label;
          b.era = y < 1975 ? 0 : y < 2e3 ? 1 : 2;
          b.openYear = y;
          b.history.push({ y, text: `\u8DE1\u5730\u306B${b.name}\u304C\u958B\u5E97\u3057\u305F(\u65E7${old})` });
          this.newsLog.push({ y, kind: "town", text: `${b.name}\u304C\u958B\u5E97\u3057\u305F(${b.addr})`, b: b.idx });
          changes++;
        }
      }
      const REB = /* @__PURE__ */ new Set(["house", "apt", "shop", "office", "ramen", "restaurant", "cafe", "izakaya", "clothes", "bookstore", "pharmacy", "clinic", "konbini", "fishshop", "greengrocer", "liquor", "gym", "warehouse", "factory", "bizhotel", "hotel"]);
      for (const b of B2) {
        if (!REB.has(b.type) || b.status === "closed" || y - b.openYear < 40 || b.tenant) continue;
        if (!rng.chance(0.015)) continue;
        const oldY = b.openYear;
        b.openYear = y;
        b.era = y < 1975 ? 0 : y < 2e3 ? 1 : 2;
        b.rebuilt = (b.rebuilt || 0) + 1;
        let waTxt = "";
        if (b.wa) {
          const hw = hash2(b.idx * 7 + y, 5120) % 100;
          const w0 = b.wa;
          if (y >= 1985 && hw < 55) {
            b.wa = "modern";
            waTxt = "(\u73FE\u4EE3\u548C\u98A8\u4F4F\u5B85\u3078)";
          } else if (y >= 1970 && hw < 80) {
            delete b.wa;
            waTxt = "(\u6D0B\u98A8\u4F4F\u5B85\u3078)";
          } else waTxt = `(${w0 === "kaya" ? "\u74E6\u5C4B\u6839" : "\u65E5\u672C\u5BB6\u5C4B"}\u3068\u3057\u3066\u518D\u5EFA)`, b.wa = w0 === "kaya" ? "kawara" : w0;
        }
        if (b.type === "house" && !b.wa && y >= 1995 && (b.nf || 2) < 3 && hash2(b.idx * 11 + y, 5121) % 100 < 30) {
          b.nf = 3;
          waTxt += "(3\u968E\u5EFA\u3066\u306E\u72ED\u5C0F\u4F4F\u5B85\u3078)";
        }
        b.history.push({ y, text: `\u7BC9${y - oldY}\u5E74\u306E\u65E7\u5EFA\u7269\u3092\u53D6\u308A\u58CA\u3057\u3001${b.name}\u3068\u3057\u3066\u5EFA\u3066\u66FF\u3048\u305F${waTxt}` });
        this.newsLog.push({ y, kind: "town", text: `${b.name}\u304C\u5EFA\u3066\u66FF\u3048\u3089\u308C\u305F(${b.addr})`, b: b.idx });
        changes++;
      }
      return changes;
    }
    vacateBuildingJobs(bidx2) {
      const p = this.pop;
      for (let s = 0; s < this.slots.b.length; s++) if (this.slots.b[s] === bidx2 && this.slots.who[s] >= 0) {
        const id = this.slots.who[s];
        this.freeSlot(id, "laid");
        this.addEvent("laidoff", id);
      }
    }
    // ---------- 月次シミュレーション
    addEvent(type, id, extra) {
      if (this.lives && this.lives.has(id)) lifeFromEvent(this, type, id, extra || {});
      if (this.known.has(id)) this.events.push({ M: this.M, type, id, ...extra });
    }
    tickMonth() {
      this.M++;
      const M = this.M, p = this.pop;
      const rng = monthRng(this.seed, M, "sim");
      const m0 = M % 12;
      const y = 1900 + Math.floor(M / 12);
      this.events = [];
      const n0 = p.n;
      const marriagePool = [];
      for (let i = 0; i < n0; i++) {
        if (p.gone[i]) continue;
        const hero = p.flags[i] & F_HERO;
        const age = Math.floor((M - p.born[i]) / 12);
        if (!hero && rng.next() < hazardM(age)) {
          this.kill(i, M, 1);
          continue;
        }
        if (hero) continue;
        if (m0 === 3) this.updateSchool(rng, i, M);
        growNpc(this, i, M, rng, age);
        const hasJob = p.work[i] >= 0;
        const student = p.flags[i] & F_STUDENT;
        if (!hasJob && !student && age >= 16 && age < 65 && !(p.flags[i] & (F_OUTWORK | F_RETIRED | F_HOMEMAKER))) {
          if (rng.chance(0.07) && this.findJob(rng, i, M)) this.addEvent("newjob", i);
        } else if (hasJob) {
          if (age >= 65 && rng.chance(0.04)) {
            this.freeSlot(i, "retired");
            p.flags[i] |= F_RETIRED;
            this.addEvent("retired", i);
          } else if (rng.chance(age < 30 ? 5e-3 : age < 45 ? 3e-3 : 12e-4)) {
            this.freeSlot(i, "quit");
            if (this.findJob(rng, i, M)) this.addEvent("newjob", i);
          }
        } else if (p.flags[i] & F_OUTWORK && age >= 66 && rng.chance(0.05)) {
          p.flags[i] = p.flags[i] & ~F_OUTWORK | F_RETIRED;
        }
        if (age >= 65 && !(p.flags[i] & F_RETIRED) && !hasJob) p.flags[i] |= F_RETIRED;
        if (p.spouse[i] < 0 && age >= 22 && age <= 45 && !student) {
          const pm = age < 26 ? 0.01 : age < 36 ? 0.016 : age < 42 ? 6e-3 : 2e-3;
          if (rng.next() < pm) marriagePool.push(i);
        }
        if (p.spouse[i] >= 0 && p.spouse[i] > i && p.kids[i] < 3) {
          const j = p.spouse[i], a2 = Math.floor((M - p.born[j]) / 12);
          const ay = Math.min(age, a2);
          if (ay >= 20 && ay <= 42) {
            const base = ay < 25 ? 75e-4 : ay < 35 ? 0.0105 : ay < 40 ? 5e-3 : 12e-4;
            if (rng.next() < base) this.birth(rng, i, j, M);
          } else if (rng.chance(2e-4) && age > 30) {
          }
          if (rng.chance(18e-5)) this.divorce(rng, i, j, M);
        }
        if (age >= 20 && age <= 32 && p.work[i] >= 0 && (p.mother[i] >= 0 || p.father[i] >= 0) && p.spouse[i] < 0 && this.isLivingWithParent(i) && rng.chance(0.012)) {
          const nb = this.pickHome(rng, "apt");
          this.moveHome(i, nb);
          this.addEvent("moved", i, { b: nb });
          this.stats.moves++;
        } else if (age >= 22 && rng.chance(11e-4)) {
          const nb = this.pickHome(rng, rng.chance(0.5) ? "apt" : "house");
          if (nb !== p.home[i]) {
            this.moveFamily(i, nb);
            this.addEvent("moved", i, { b: nb });
            this.stats.moves++;
          }
        }
      }
      rng.shuffle(marriagePool);
      for (let k = 0; k + 1 < marriagePool.length; k += 2) {
        const a = marriagePool[k], b = marriagePool[k + 1];
        if (Math.abs(p.born[a] - p.born[b]) > 6 * 12) continue;
        if (p.mother[a] >= 0 && p.mother[a] === p.mother[b]) continue;
        p.spouse[a] = b;
        p.spouse[b] = a;
        this.coupleSur(a, b);
        const nb = this.pickHome(rng, rng.chance(0.65) ? "apt" : "house");
        this.moveHome(a, nb);
        this.moveHome(b, nb);
        this.stats.marriages++;
        this.addEvent("married", a, { partner: b });
        this.addEvent("married", b, { partner: a });
      }
      let alive = 0;
      for (let i = 0; i < p.n; i++) if (!p.gone[i]) alive++;
      this.alive = alive;
      const TP = this.targetPop;
      if (alive < TP * 0.985) {
        const nin = Math.min(40, Math.round((TP - alive) / 8) + 2);
        for (let h = 0; h < nin / 2.6; h++) this.immigrateHousehold(rng, M);
      } else if (alive > TP * 1.02) {
        let cnt = 0;
        for (let i = 0; i < p.n && cnt < (alive - TP) / 6; i++) {
          if (!p.gone[i] && !(p.flags[i] & F_HERO) && !this.known.has(i) && rng.chance(4e-3)) {
            this.leave(i, M);
            cnt++;
          }
        }
      }
      if (m0 === 0) {
        this.yearlyTownChange(y, new Rng(this.seed, "town:" + y));
      }
      this.ensureVacancies(rng);
      promoteRound(this, M, monthRng(this.seed, M, "promo"));
      tickLives(this, M, monthRng(this.seed, M, "lives"));
      this.tickCount++;
      return this.events;
    }
    // 求人の新陣容(事業拡大・欠員補充): 空き求人が全体の約4%を下回らないように、毎月少しだけ新規募集枠を足す
    ensureVacancies(rng) {
      const total = this.slots.b.length;
      const target = Math.floor(total * 0.04);
      let guard = 0;
      while (this.vacant.length < target && guard++ < 60) {
        const s0 = rng.int(total);
        const b = this.slots.b[s0];
        if (this.map.buildings[b].status === "closed") continue;
        const s = this.slots.b.length;
        this.slots.b.push(b);
        this.slots.job.push(this.slots.job[s0]);
        this.slots.who.push(-1);
        this.vacant.push(s);
      }
    }
    isLivingWithParent(i) {
      const p = this.pop;
      for (const q of [p.mother[i], p.father[i]]) if (q >= 0 && !p.gone[q] && p.home[q] === p.home[i]) return true;
      return false;
    }
    moveFamily(i, nb) {
      const p = this.pop;
      const home = p.home[i];
      const group = [i];
      if (p.spouse[i] >= 0 && p.home[p.spouse[i]] === home) group.push(p.spouse[i]);
      for (let k = 0; k < p.n && group.length < 8; k++) {
        if (p.gone[k] || p.home[k] !== home || group.includes(k)) continue;
        if ((p.mother[k] === i || p.father[k] === i || group.length > 1 && (p.mother[k] === group[1] || p.father[k] === group[1])) && Math.floor((this.M - p.born[k]) / 12) < 18) group.push(k);
      }
      for (const g of group) this.moveHome(g, nb);
    }
    kill(i, M, how) {
      const p = this.pop;
      p.gone[i] = how;
      p.goneAt[i] = M;
      if (p.home[i] >= 0) this.occ[p.home[i]]--;
      this.freeSlot(i, "died");
      if (!this.lives.has(i)) this.prof.delete(i);
      else {
        const L2 = this.lives.get(i);
        if (L2.mem.length > 8) L2.mem = L2.mem.slice(-8);
      }
      const s = p.spouse[i];
      if (s >= 0) {
        p.spouse[s] = -1;
        this.addEvent("widowed", s, { partner: i });
      }
      if (how === 1) {
        this.stats.deaths++;
        this.addEvent("died", i);
      }
      for (const k of how === 1 ? this.childrenOf(i).slice() : []) {
        if (p.gone[k]) continue;
        if (Math.floor((M - p.born[k]) / 12) >= 16) continue;
        const o = p.mother[k] === i ? p.father[k] : p.mother[k];
        if (o >= 0 && !p.gone[o]) continue;
        const g = [p.mother[i], p.father[i]].find((x) => x >= 0 && !p.gone[x]);
        if (g !== void 0 && p.home[g] >= 0) this.moveHome(k, p.home[g]);
      }
    }
    leave(i, M) {
      this.kill(i, M, 2);
      this.stats.migrantsOut++;
    }
    birth(rng, i, j, M) {
      const p = this.pop;
      if (p.n >= CAP - 5) return;
      const c = this.newPerson(rng, 0, M, { mother: i, father: j });
      p.home[c] = p.home[i];
      this.occ[p.home[i]]++;
      p.kids[i]++;
      p.kids[j]++;
      p.flags[c] |= 0;
      this.stats.births++;
      this.addEvent("child", i, { child: c });
      this.addEvent("child", j, { child: c });
      if (this.known.has(i) || this.known.has(j)) this.known.add(c);
    }
    divorce(rng, i, j, M) {
      const p = this.pop;
      p.spouse[i] = -1;
      p.spouse[j] = -1;
      const nb = this.pickHome(rng, "apt");
      this.moveFamily(j, nb);
      this.addEvent("divorced", i, { partner: j });
      this.addEvent("divorced", j, { partner: i });
    }
    immigrateHousehold(rng, M) {
      const p = this.pop;
      if (p.n > CAP - 20) return;
      const a = rng.range(22, 55);
      const ids = [];
      const x = this.newPerson(rng, a * 12 + rng.int(12), M);
      p.flags[x] |= F_MIGRANT;
      ids.push(x);
      if (rng.chance(0.55)) {
        const y = this.newPerson(rng, Math.max(20 * 12, a * 12 + rng.range(-40, 40)), M);
        p.spouse[x] = y;
        p.spouse[y] = x;
        this.coupleSur(x, y);
        p.flags[y] |= F_MIGRANT;
        ids.push(y);
      }
      if (rng.chance(0.45)) {
        const c = this.newPerson(rng, rng.range(0, Math.min(14, a - 22)) * 12 + rng.int(12), M, { mother: x, father: ids[1] ?? x });
        p.flags[c] |= F_MIGRANT;
        ids.push(c);
        p.kids[x]++;
      }
      const home = this.pickHome(rng, rng.chance(0.7) ? "apt" : "house");
      for (const id of ids) {
        p.home[id] = home;
        this.occ[home]++;
      }
      for (const id of ids) {
        const age = Math.floor((M - p.born[id]) / 12);
        if (age >= 18) {
          if (!this.findJob(rng, id, M)) p.flags[id] |= F_OUTWORK;
        }
        this.updateSchool(rng, id, M);
      }
      this.stats.migrantsIn += ids.length;
    }
    // ---------- 主人公の誕生(母集団に追加)
    addHero(rng, M, mother, father) {
      const p = this.pop;
      const id = p.n++;
      p.born[id] = M;
      p.gone[id] = 0;
      p.look[id] = rng.next() * 4294967296 >>> 0;
      p.apt[id] = 128;
      p.flags[id] |= F_HERO | F_DETAIL;
      p.mother[id] = mother;
      p.father[id] = father;
      p.home[id] = p.home[mother];
      this.occ[p.home[id]]++;
      p.kids[mother]++;
      if (father >= 0) p.kids[father]++;
      this.heroId = id;
      return id;
    }
    // 出産可能な世帯(主人公の親候補)を選ぶ
    pickParents(rng, M, kind, pickFn) {
      const p = this.pop;
      const cands = [];
      for (let i = 0; i < p.n; i++) {
        if (p.gone[i] || p.spouse[i] < 0 || p.spouse[i] < i) continue;
        const j = p.spouse[i];
        const a = ageYears(p, i, M), b = ageYears(p, j, M);
        if (Math.min(a, b) >= 24 && Math.max(a, b) <= 38 && p.kids[i] <= 2 && FEMALE_STYLE.has(p.look[i] & 7) !== FEMALE_STYLE.has(p.look[j] & 7)) cands.push(i);
      }
      if (!cands.length) for (let i = 0; i < p.n; i++) {
        if (p.gone[i] || p.spouse[i] < 0 || p.spouse[i] < i) continue;
        const a = ageYears(p, i, M), b = ageYears(p, p.spouse[i], M);
        if (Math.min(a, b) >= 22 && Math.max(a, b) <= 44) cands.push(i);
      }
      const f2 = pickFn ? pickFn(cands) : rng.pick(cands);
      const s = p.spouse[f2];
      return FEMALE_STYLE.has(p.look[f2] & 7) ? [f2, s] : [s, f2];
    }
    setHome(id, b) {
      const p = this.pop;
      if (p.home[id] >= 0) this.occ[p.home[id]]--;
      p.home[id] = b;
      this.occ[b]++;
    }
    // 同じ学年・同じ学校の同級生ID
    classmates(id, schoolB) {
      const p = this.pop;
      const out = [];
      const coh = (i) => Math.floor((p.born[i] - 3) / 12);
      const c0 = coh(id);
      for (let i = 0; i < p.n; i++) if (i !== id && p.school[i] === schoolB && coh(i) === c0 && !p.gone[i]) out.push(i);
      return out;
    }
    describe(id) {
      const p = this.pop, B2 = this.map.buildings;
      const age = ageYears(p, id, this.M);
      const jid = p.job[id] < 255 ? JOB_IDS2[p.job[id]] : null;
      return { id, name: nameOf(this.seed, id, this.pop), age, job: jid ? JOBS[jid].name : p.flags[id] & F_RETIRED ? "\u9000\u8077" : p.flags[id] & F_STUDENT ? "\u5B66\u751F\u30FB\u5150\u7AE5" : p.flags[id] & F_HOMEMAKER ? "\u5BB6\u4E8B\u30FB\u80B2\u5150" : p.flags[id] & F_OUTWORK ? "\u5E02\u5916\u52E4\u52D9" : age < 3 ? "\u4E73\u5E7C\u5150" : "\u7121\u8077\u30FB\u6C42\u8077\u4E2D", home: p.home[id] >= 0 ? B2[p.home[id]].name + " " + B2[p.home[id]].addr : "-", work: p.work[id] >= 0 ? B2[p.work[id]].name : "", school: p.school[id] >= 0 ? B2[p.school[id]].name : "", alive: p.gone[id] === 0, goneHow: p.gone[id], needs: p.needs[id] };
    }
  };
  __publicField(_World, "ARRS", ["born", "gone", "goneAt", "spouse", "mother", "father", "home", "work", "job", "school", "edu", "apt", "needs", "look", "flags", "quals", "kids", "slot", "sur"]);
  var World = _World;
  function shiftOf(id, job) {
    const h = hash2(id, 77);
    switch (job) {
      case "fisher":
        return [4, 12];
      case "farmer":
        return [6, 16];
      case "clerk":
      case "stocker":
        return h % 2 ? [9, 18] : [12, 21];
      case "cook":
      case "waitstaff":
        return h % 3 === 0 ? [10, 19] : [15, 23];
      case "hotelstaff":
        return h % 2 ? [7, 16] : [14, 23];
      case "doctor":
      case "nurse":
        return h % 3 ? [8, 17] : [16, 25];
      case "teacher":
      case "special_teacher":
      case "childcare":
        return [8, 17];
      case "police":
      case "firefighter":
      case "railstaff":
      case "caregiver":
        return h % 2 ? [7, 16] : [11, 20];
      default:
        return [9, 18];
    }
  }
  function dayPlan(world, id, dow) {
    const p = world.pop;
    const wk = dow >= 1 && dow <= 5;
    if (p.home[id] < 0) return null;
    if (p.flags[id] & F_STUDENT && p.school[id] >= 0) {
      if (!wk) return null;
      const age = ageYears(p, id, world.M);
      const a = 8.2 + (age < 6 ? 0.8 : 0), b = age < 6 ? 15 : age < 15 ? 15.5 : 16.5;
      return { a, b, dest: p.school[id], kind: "school" };
    }
    if (p.work[id] >= 0 && p.job[id] < 255) {
      const jid = JOB_IDS2[p.job[id]];
      const [a, b] = shiftOf(id, jid);
      const off = hash2(id, dow) % 7 === 0 || !wk && !["clerk", "cook", "waitstaff", "hotelstaff", "doctor", "nurse", "caregiver", "police", "firefighter", "railstaff", "fisher", "stocker"].includes(jid) || !wk && hash2(id, 5 + dow) % 2 === 0;
      if (!off) return { a, b, dest: p.work[id], kind: "work" };
    }
    return null;
  }
  function personActivity(world, id, minuteOfDay, dow) {
    const p = world.pop;
    const h = minuteOfDay / 60;
    if (world.staffDuty) {
      const sd = staffDutyState(world, id, minuteOfDay, dow);
      if (sd && sd.s === 2) return sd;
    }
    if (p.home[id] < 0) return { s: 0 };
    const dp = dayPlan(world, id, dow);
    if (dp) {
      const cm = world.getCommute();
      const L2 = cm.link(p.home[id], dp.dest);
      if (L2 && dp.b <= 23.5) {
        const st3 = cm.state(id, p.home[id], dp, minuteOfDay);
        if (st3) return st3;
        if (cm.sched(L2, "to", Math.round(dp.a * 60 - 2), hash2(id, 1) % 5) && cm.sched(L2, "from", Math.round(dp.b * 60))) return { s: 0 };
      }
      {
        const bc = typeof busCommuteState === "function" ? busCommuteState(world, id, dp, minuteOfDay) : null;
        if (bc) return bc;
      }
      const { a, b } = dp;
      const w = dp.kind === "school" ? 0.7 : 0.6;
      if (h >= a - w && h < a) return { s: 1, to: dp.dest, t: (h - (a - w)) / w };
      if (h >= a && h < Math.min(b, 24)) return { s: 2, at: dp.dest };
      if (h >= b && h < b + w) return { s: 1, to: p.home[id], from: dp.dest, t: (h - b) / w };
    }
    if (h >= 7 && h < 21 && hash2(id, dow * 24 + (h | 0)) % 5 === 0) return { s: 3 };
    return { s: 0 };
  }

