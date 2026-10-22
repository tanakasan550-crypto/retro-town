  // src/commute.js
  var WALK_TPM = 4;
  var REF_DAY = 3;
  var DIRECT_WALK = 36;
  function trainKey(line, dir, depRel) {
    return `${line}|${dir}|${depRel}`;
  }
  var Commute = class {
    constructor(world, tr) {
      this.world = world;
      this.map = world.map;
      this.tr = tr || buildTransit(world.map);
      this.stDoor = this.map.stations.map((s) => ({ id: s.id, b: s.building, x: s.door.x, y: s.door.y }));
      this.nearCache = new Int16Array(this.map.buildings.length).fill(-2);
      this.linkCache = /* @__PURE__ */ new Map();
      this.schedCache = /* @__PURE__ */ new Map();
      this.planCache = /* @__PURE__ */ new Map();
      this.idx = { M: -1, dow: -1, byTrain: /* @__PURE__ */ new Map(), plat: /* @__PURE__ */ new Map(), alight: /* @__PURE__ */ new Map() };
    }
    nearStation(b) {
      let v = this.nearCache[b];
      if (v !== -2) return v;
      const B2 = this.map.buildings[b];
      let best = -1, bd = 1e9;
      this.stDoor.forEach((s, i) => {
        const d = Math.abs(s.x - B2.doorX) + Math.abs(s.y - B2.doorY);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      this.nearCache[b] = best;
      return best;
    }
    dist(a, b) {
      const A2 = this.map.buildings[a], B2 = this.map.buildings[b];
      return Math.abs(A2.doorX - B2.doorX) + Math.abs(A2.doorY - B2.doorY);
    }
    // 自宅(または職場)-勤務先の経路。鉄道を使うなら {si,sj,plan,w1,w2}、徒歩なら null
    link(homeB, destB) {
      const key = homeB * 4096 + destB;
      let L2 = this.linkCache.get(key);
      if (L2 !== void 0) return L2;
      L2 = null;
      if (homeB >= 0 && destB >= 0 && homeB !== destB) {
        const direct = this.dist(homeB, destB);
        const si = this.nearStation(homeB), sj = this.nearStation(destB);
        if (direct > DIRECT_WALK && si !== sj && si >= 0 && sj >= 0) {
          const A2 = this.stDoor[si], B2 = this.stDoor[sj];
          const hb = this.map.buildings[homeB], db = this.map.buildings[destB];
          const w1 = Math.abs(hb.doorX - A2.x) + Math.abs(hb.doorY - A2.y), w2 = Math.abs(db.doorX - B2.x) + Math.abs(db.doorY - B2.y);
          if (w1 + w2 < direct * 0.8) {
            const pk = si * 64 + sj;
            let plan = this.planCache.get(pk);
            if (plan === void 0) {
              plan = planRail(this.tr, A2.id, B2.id);
              this.planCache.set(pk, plan);
            }
            if (plan && plan.legs.length) L2 = { homeB, destB, si, sj, plan, w1: Math.ceil(w1 * 1.15 / WALK_TPM), w2: Math.ceil(w2 * 1.15 / WALK_TPM), wt1: w1, wt2: w2 };
          }
        }
      }
      this.linkCache.set(key, L2);
      return L2;
    }
    // 'to': 目標時刻T(分)までに目的地へ着く。'from': 時刻T(分)に目的地を出て帰宅。返り値は区間配列 or null
    sched(L2, dir, T4, slack = 0) {
      const key = `${L2.homeB}|${L2.destB}|${dir}|${T4}|${slack}`;
      let S2 = this.schedCache.get(key);
      if (S2 !== void 0) return S2;
      S2 = null;
      const base = REF_DAY * 1440;
      const tr = this.tr;
      const plan = dir === "to" ? L2.plan : this.reverse(L2);
      if (dir === "to") {
        for (let s = T4 - L2.w2 - 1; s >= T4 - L2.w2 - 150 && s >= 0; s--) {
          const sim = simulateTrip(tr, plan, base + s);
          if (!sim.ok) continue;
          const arrive2 = sim.arrive - base;
          if (arrive2 + 1 + L2.w2 <= T4) {
            S2 = this.build(L2, "to", s - slack, sim, base);
            break;
          }
        }
      } else {
        const s = T4 + L2.w2;
        const sim = simulateTrip(tr, plan, base + s);
        if (sim.ok && sim.arrive - base + 1 + L2.w1 < 1440) S2 = this.build(L2, "from", s, sim, base);
      }
      if (S2 && S2.t0 < 0) S2 = null;
      this.schedCache.set(key, S2);
      return S2;
    }
    reverse(L2) {
      const k = `r${L2.sj}|${L2.si}`;
      let p = this.planCache.get(k);
      if (!p) {
        p = planRail(this.tr, this.stDoor[L2.sj].id, this.stDoor[L2.si].id);
        this.planCache.set(k, p);
      }
      return p;
    }
    build(L2, dir, sArr, sim, base) {
      const o = dir === "to" ? { fromB: L2.homeB, st0: L2.si, st1: L2.sj, toB: L2.destB, wa: L2.w1, wb: L2.w2 } : { fromB: L2.destB, st0: L2.sj, st1: L2.si, toB: L2.homeB, wa: L2.w2, wb: L2.w1 };
      const segs = [];
      const t0 = sArr - o.wa;
      segs.push({ k: "walk", t0, t1: sArr, fromB: o.fromB, toB: this.stDoor[o.st0].b });
      let t = sArr;
      sim.legs.forEach((lg, i) => {
        const board2 = lg.board - base, alight = lg.alight - base;
        const stIdFrom = lg.from;
        const sIdx = this.stDoor.findIndex((s) => s.id === stIdFrom);
        segs.push({ k: "plat", st: sIdx, t0: t, t1: board2 });
        segs.push({ k: "ride", line: lg.line, dir: lg.dir, fromIdx: lg.fromIdx, toIdx: lg.toIdx, t0: board2, t1: alight, dep: this.depRel(lg, board2), stFrom: sIdx, stTo: this.stDoor.findIndex((s) => s.id === lg.to) });
        t = alight;
      });
      const endSt = o.st1;
      segs.push({ k: "exit", st: endSt, t0: t, t1: t + 1 });
      t += 1;
      segs.push({ k: "walk", t0: t, t1: t + o.wb, fromB: this.stDoor[endSt].b, toB: o.toB });
      return { dir, t0, t1: t + o.wb, segs };
    }
    depRel(lg, board2) {
      const L2 = this.tr.byId[lg.line];
      const n2 = L2.stops.length;
      const si = lg.dir === 1 ? lg.fromIdx : n2 - 1 - lg.fromIdx;
      return Math.round(board2 - L2.dep[si]);
    }
    // 時刻mの状態(なければnull)。dp: {a,b,dest}(勤務/登校の開始・終了時刻[時]、目的地建物)
    state(id, homeB, dp, m) {
      const L2 = this.link(homeB, dp.dest);
      if (!L2) return null;
      const toT = Math.round(dp.a * 60 - 2), fromT = Math.round(dp.b * 60);
      const sl = hash2(id, 1) % 5;
      const S1 = this.sched(L2, "to", toT, sl), S2 = this.sched(L2, "from", fromT);
      if (!S1 || !S2) return null;
      if (m >= S1.t0 && m < S1.t1) return this.at(S1, m);
      if (m >= S1.t1 && m < fromT) return { s: 2, at: dp.dest };
      if (m >= fromT && m < S2.t0) return { s: 2, at: dp.dest };
      if (m >= S2.t0 && m < S2.t1) return this.at(S2, m);
      return null;
    }
    at(S2, m) {
      for (const g of S2.segs) if (m >= g.t0 && m < g.t1) {
        const u = (m - g.t0) / Math.max(1, g.t1 - g.t0);
        return { s: 1, train: true, seg: g, u, dir: S2.dir };
      }
      return null;
    }
    // ---- その曜日の全員の電車利用の索引(列車ごとの乗客・駅ごとのホーム待ち)
    index(dow) {
      const w = this.world;
      if (this.idx.M === w.M && this.idx.dow === dow) return this.idx;
      const p = w.pop;
      const idx = { M: w.M, dow, byTrain: /* @__PURE__ */ new Map(), plat: /* @__PURE__ */ new Map(), alight: /* @__PURE__ */ new Map(), who: /* @__PURE__ */ new Set() };
      this.idx = idx;
      for (let i = 0; i < p.n; i++) {
        if (p.gone[i]) continue;
        const dp = w.dayPlan(i, dow);
        if (!dp) continue;
        const hb = p.home[i];
        const L2 = this.link(hb, dp.dest);
        if (!L2) continue;
        for (const [dir, T4] of [["to", Math.round(dp.a * 60 - 2)], ["from", Math.round(dp.b * 60)]]) {
          const S2 = this.sched(L2, dir, T4, dir === "to" ? hash2(i, 1) % 5 : 0);
          if (!S2) continue;
          if (dir === "to" && !this.sched(L2, "from", Math.round(dp.b * 60))) continue;
          if (dir === "from" && !this.sched(L2, "to", Math.round(dp.a * 60 - 2))) continue;
          idx.who.add(i);
          for (const g of S2.segs) {
            if (g.k === "ride") {
              const k = trainKey(g.line, g.dir, g.dep);
              let a = idx.byTrain.get(k);
              if (!a) idx.byTrain.set(k, a = []);
              a.push({ id: i, fromIdx: g.fromIdx, toIdx: g.toIdx, board: g.t0, alight: g.t1 });
            } else if (g.k === "plat") {
              let a = idx.plat.get(g.st);
              if (!a) idx.plat.set(g.st, a = []);
              a.push({ id: i, t0: g.t0, t1: g.t1 });
            } else if (g.k === "exit") {
              let a = idx.alight.get(g.st);
              if (!a) idx.alight.set(g.st, a = []);
              a.push({ id: i, t0: g.t0, t1: g.t1 });
            }
          }
        }
      }
      return idx;
    }
    riders(dow, line, dir, depRel, m) {
      const a = this.index(dow).byTrain.get(trainKey(line, dir, depRel));
      if (!a) return [];
      return a.filter((r) => m >= r.board && m < r.alight);
    }
    waiting(dow, stIdx, m) {
      const a = this.index(dow).plat.get(stIdx);
      if (!a) return [];
      return a.filter((r) => m >= r.t0 && m < r.t1);
    }
    alighting(dow, stIdx, m) {
      const a = this.index(dow).alight.get(stIdx);
      if (!a) return [];
      return a.filter((r) => m >= r.t0 && m < r.t1);
    }
    stats() {
      let n2 = 0;
      const w = this.world, p = w.pop;
      for (let i = 0; i < p.n; i++) {
        if (p.gone[i]) continue;
        const dp = w.dayPlan(i, 2);
        if (dp && this.link(p.home[i], dp.dest)) n2++;
      }
      return n2;
    }
  };
  function platformPos(map2, stIdx, id) {
    const s = map2.stations[stIdx];
    return { x: s.x - 5 + hash2(id, 7) % 11 + 0.5, y: s.platformY + 0.3 + hash2(id, 3) % 3 * 0.26 };
  }

