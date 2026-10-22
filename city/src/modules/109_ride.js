  // src/ride.js
  var SEATS = 14;
  var Ride = class {
    constructor(g, fromId, toId, plan, sim, fareYen) {
      this.g = g;
      this.fromId = fromId;
      this.toId = toId;
      this.plan = plan;
      this.fare = fareYen;
      this.tr = g.tr;
      this.cm = g.world.getCommute();
      this.start = g.absMin();
      this.dow = g.date().dow;
      this.sitting = false;
      this.metKnown = false;
      this.msgs = [];
      this.gaveSeat = false;
      this.legs = sim.legs.map((lg) => {
        const L2 = g.tr.byId[lg.line];
        const n2 = L2.stops.length;
        const si = (i) => lg.dir === 1 ? i : n2 - 1 - i;
        const seq = [];
        const step2 = lg.dir === 1 ? 1 : -1;
        for (let i = lg.fromIdx; ; i += step2) {
          seq.push(i);
          if (i === lg.toIdx) break;
        }
        const depT = lg.board - L2.dep[si(lg.fromIdx)];
        const stops = seq.map((i) => ({ idx: i, name: L2.stops[i].name, id: L2.stops[i].id, arr: depT + L2.arr[si(i)], dep: depT + L2.dep[si(i)] }));
        const dayStart = Math.floor(depT / 1440) * 1440;
        return { ...lg, L: L2, color: L2.color, lineName: L2.name, depT, stops, dayStart, depRel: Math.round(depT - dayStart), terminus: lg.dir === 1 ? L2.stops[n2 - 1].name : L2.stops[0].name };
      });
      this.arrive = sim.arrive;
      this.extraCache = /* @__PURE__ */ new Map();
    }
    get destName() {
      return this.g.world.map.stations.find((s) => s.id === this.toId).name;
    }
    get originName() {
      return this.g.world.map.stations.find((s) => s.id === this.fromId).name;
    }
    // 列車の背景乗客(通勤以外で出かけている人)
    extras(leg) {
      const k = leg.line + leg.dir + leg.depRel;
      let e = this.extraCache.get(k);
      if (e) return e;
      e = [];
      const w = this.g.world, p = w.pop;
      const h = leg.depRel / 60 | 0;
      const nTarget = h >= 9 && h < 17 ? 7 : h >= 17 && h < 21 ? 6 : 5;
      const m0 = leg.depRel + 5;
      const nStops = leg.L.stops.length;
      for (let t = 0, got = 0; t < 400 && got < nTarget; t++) {
        const id = hash2(leg.depRel * 7 + leg.dir + leg.line.length, t) % p.n;
        if (p.gone[id] || id === this.g.hero.id || p.home[id] < 0 || ageYears(p, id, w.M) < 10) continue;
        const a = personActivity(w, id, m0, this.dow);
        if (a.s !== 0 && a.s !== 3) continue;
        const i0 = hash2(id, 5) % nStops, i1 = hash2(id, 6) % nStops;
        if (i0 === i1) continue;
        const f2 = Math.min(i0, i1), tt = Math.max(i0, i1);
        e.push({ id, fromIdx: leg.dir === 1 ? f2 : tt, toIdx: leg.dir === 1 ? tt : f2, extra: true });
        got++;
      }
      this.extraCache.set(k, e);
      return e;
    }
    legAt(t) {
      for (let i = 0; i < this.legs.length; i++) {
        const lg = this.legs[i];
        if (t < lg.board) return { phase: i === 0 ? "wait" : "xfer", i };
        if (t < lg.alight) return { phase: "ride", i };
      }
      return { phase: "done", i: this.legs.length - 1 };
    }
    // 時刻tの詳細
    info(t) {
      const ph = this.legAt(t);
      const lg = this.legs[ph.i];
      const out = { phase: ph.phase, legIndex: ph.i, leg: lg, t };
      const stIdx = this.g.world.map.stations.findIndex((s) => s.id === (ph.phase === "ride" || ph.phase === "wait" || ph.phase === "xfer" ? lg.from : this.toId));
      if (ph.phase === "wait" || ph.phase === "xfer") {
        out.station = lg.stops[0].name;
        out.stIdx = this.g.world.map.stations.findIndex((s) => s.id === lg.from);
        out.trainIn = t >= lg.board - 1.5 ? Math.min(1, (t - (lg.board - 1.5)) / 1.5) : 0;
        out.board = lg.board;
        out.minsToBoard = lg.board - t;
        out.waiting = this.cm.waiting(this.dow, out.stIdx, t - lg.dayStart).slice(0, 12);
        return out;
      }
      if (ph.phase === "ride") {
        const S2 = lg.stops;
        let j = 0;
        while (j < S2.length - 1 && t >= S2[j].dep) j++;
        const atStop = t >= S2[j].arr && t < S2[j].dep + (j === S2.length - 1 ? 0 : 0);
        out.atStop = atStop && j > 0 ? true : j === 0 ? t < S2[0].dep : atStop;
        const prev = j > 0 ? S2[j - 1] : S2[0];
        out.next = S2[Math.min(j, S2.length - 1)];
        out.prev = prev;
        out.progress = atStop ? 0 : j === 0 ? 0 : Math.max(0, Math.min(1, (t - S2[j - 1].dep) / Math.max(0.5, S2[j].arr - S2[j - 1].dep)));
        out.final = j === S2.length - 1;
        out.minsLeft = Math.max(0, this.arrive - t);
        out.dest = this.destName;
        out.line = lg.lineName;
        out.color = lg.color;
        out.toward = lg.terminus;
        const m = t - lg.dayStart;
        const base = this.cm.riders(this.dow, lg.line, lg.dir, lg.depRel, m).map((r) => ({ id: r.id, fromIdx: r.fromIdx, toIdx: r.toIdx }));
        const ex = this.extras(lg).filter((r) => {
          const a = lg.stops.findIndex((s) => s.idx === r.fromIdx), b = lg.stops.findIndex((s) => s.idx === r.toIdx);
          if (a < 0 || b < 0) return false;
          return a >= 0 && (a < j || a === j && atStop) && (b > j || b === j && !atStop);
        });
        const seen = new Set(base.map((b) => b.id));
        const riders2 = base.concat(ex.filter((x) => !seen.has(x.id)));
        out.riders = riders2;
        out.load = riders2.length;
        out.seated = riders2.slice().sort((a, b) => hash2(a.id, 3) - hash2(b.id, 3)).slice(0, SEATS - (this.sitting ? 1 : 0)).map((r) => r.id);
        out.freeSeats = Math.max(0, SEATS - out.seated.length - (this.sitting ? 1 : 0));
        out.sitting = this.sitting;
        return out;
      }
      out.station = this.destName;
      return out;
    }
    // 行動
    toggleSit(t) {
      const inf = this.info(t);
      if (inf.phase !== "ride") return "(\u8ECA\u5185\u3067\u306E\u307F\u5EA7\u308C\u307E\u3059)";
      if (this.sitting) {
        this.sitting = false;
        return "\u7ACB\u3061\u4E0A\u304C\u308A\u307E\u3057\u305F\u3002";
      }
      if (inf.freeSeats <= 0) return "\u7A7A\u3044\u3066\u3044\u308B\u5E2D\u304C\u3042\u308A\u307E\u305B\u3093\u3002";
      this.sitting = true;
      return "\u5EA7\u5E2D\u306B\u5EA7\u308A\u307E\u3057\u305F\u3002";
    }
    knownAboard(t) {
      const inf = this.info(t);
      if (inf.phase !== "ride") return null;
      return inf.riders.find((r) => this.g.hero.rel[r.id] && !this.g.world.pop.gone[r.id]) || null;
    }
    needsSeat(t) {
      const inf = this.info(t);
      if (inf.phase !== "ride") return null;
      const p = this.g.world.pop;
      const stand = inf.riders.map((r) => r.id).filter((id) => !inf.seated.includes(id));
      return stand.find((id) => ageYears(p, id, this.g.world.M) >= 70 || p.needs[id] & 3) ?? null;
    }
    giveSeat(t) {
      const inf = this.info(t);
      if (!this.sitting) return "\u5E2D\u306B\u5EA7\u3063\u3066\u3044\u306A\u3044\u306E\u3067\u3001\u3086\u305A\u308C\u307E\u305B\u3093\u3002";
      const id = this.needsSeat(t);
      if (id == null) return "\u3044\u307E\u5E2D\u3092\u5FC5\u8981\u3068\u3057\u3066\u3044\u305D\u3046\u306A\u4EBA\u306F\u898B\u5F53\u305F\u308A\u307E\u305B\u3093\u3002";
      this.sitting = false;
      this.gaveSeat = true;
      const g = this.g;
      g.meet(id, 7);
      g.world.remember(id, `\u96FB\u8ECA\u3067${g.hero.name}\u304C\u5E2D\u3092\u3086\u305A\u3063\u3066\u304F\u308C\u305F`, { who: g.hero.id, w: 3 });
      g.log("kind", `\u96FB\u8ECA\u3067${g.nameOf(id)}\u306B\u5E2D\u3092\u3086\u305A\u3063\u305F`, { who: id });
      return `${g.nameOf(id)}\u306F\u300C\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u300D\u3068\u7B11\u9854\u3067\u5EA7\u308A\u307E\u3057\u305F\u3002` + g.chg({ mood: 3 });
    }
    chatWith(id) {
      return id;
    }
    finish() {
      const g = this.g;
      const dest = g.world.map.stations.find((s) => s.id === this.toId);
      const L2 = g.S.loc;
      L2.k = "out";
      delete L2.b;
      delete L2.floor;
      L2.x = dest.door.x + 0.5;
      L2.y = dest.door.y + 0.6;
      L2.f = "d";
      g.S.stats.rides++;
      g.log("trip", `\u96FB\u8ECA\u3067${dest.name}\u99C5\u306B\u7740\u3044\u305F(${this.originName}\u2192${dest.name})`);
      if (this.sitting) g.chg({ energy: 3 });
      return `${dest.name}\u99C5\u306B\u5230\u7740\u3057\u307E\u3057\u305F\u3002(\u904B\u8CC3 \xA5${this.fare.toLocaleString()})`;
    }
  };
  function startRide(g, fromId, toId) {
    const plan = planRail(g.tr, fromId, toId);
    if (!plan) return { ok: false, msg: "\u7D4C\u8DEF\u304C\u3042\u308A\u307E\u305B\u3093\u3002" };
    const t0 = g.absMin() + 1;
    const sim = simulateTrip(g.tr, plan, t0);
    if (!sim.ok) return { ok: false, msg: sim.reason || "\u96FB\u8ECA\u304C\u3042\u308A\u307E\u305B\u3093\u3002" };
    const f2 = fare(plan.stops, g.pi());
    if (g.hero.money < f2) return { ok: false, msg: `\u904B\u8CC3\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${f2.toLocaleString()})` };
    g.pay(f2, "\u96FB\u8ECA\u904B\u8CC3");
    g.advance(1);
    return { ok: true, ride: new Ride(g, fromId, toId, plan, sim, f2) };
  }

