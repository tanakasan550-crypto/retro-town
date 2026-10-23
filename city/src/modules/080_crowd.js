  // src/crowd.js
  var Crowd = class {
    constructor(g) {
      this.g = g;
      this.pathCache = /* @__PURE__ */ new Map();
      this.last = { key: "", walkers: [], t: -1 };
      this.pending = 0;
      const B2 = g.world.map.buildings;
      this.grid = /* @__PURE__ */ new Map();
      this.gridS = /* @__PURE__ */ new Map();
      for (const b of B2) {
        if (b.type !== "park") continue;
        const k = (b.doorX >> 4) + "," + (b.doorY >> 4);
        (this.gridS.get(k) || this.gridS.set(k, []).get(k)).push(b.idx);
      }
      for (const b of B2) {
        if (!BTYPES[b.type].enter || BTYPES[b.type].cat === "res") continue;
        const k = (b.doorX >> 4) + "," + (b.doorY >> 4);
        (this.grid.get(k) || this.grid.set(k, []).get(k)).push(b.idx);
      }
      this.pubCache = /* @__PURE__ */ new Map();
      this.cd = /* @__PURE__ */ new Map();
      this.cdYear = 0;
      this.plans = /* @__PURE__ */ new Map();
    }
    // 自家用車で通う住民の目的地(車を使わない/持たない人は -1)。電車通勤者・近距離の人は徒歩のまま。
    carDest(i) {
      const g = this.g, w = g.world, p = w.pop;
      const year = g.year();
      if (this.cdYear !== year) {
        this.cd.clear();
        this.cdYear = year;
      }
      let r = this.cd.get(i);
      if (r !== void 0) return r;
      r = -1;
      if (ownsCar(w, i, year)) {
        const hb = p.home[i], d = p.work[i] >= 0 ? p.work[i] : p.school[i] >= 0 ? p.school[i] : -1;
        if (hb >= 0 && d >= 0 && !w.getCommute().link(hb, d)) {
          if (this.pending >= 10) return void 0;
          const pl = this.carPlan(hb, d);
          if (pl === void 0) return void 0;
          r = pl ? d : -1;
        }
      }
      this.cd.set(i, r);
      return r;
    }
    // 建物AからBへの車移動の計画(経路・駐車枠・徒歩部分・各段階の配分)。建物の組ごとに共通。
    carPlan(a, b) {
      const k = a * 4096 + b;
      let pl = this.plans.get(k);
      if (pl !== void 0) return pl;
      if (this.pending >= 10) return void 0;
      const map2 = this.g.world.map, B2 = map2.buildings;
      const trip = carTrip(map2, a, b);
      if (!trip) {
        this.plans.set(k, null);
        return null;
      }
      this.pending++;
      const A2 = B2[a], D3 = B2[b];
      const w0p = findPath(map2, A2.doorX, A2.doorY, trip.a.px, trip.a.py, 0, 4e4, true), w1p = findPath(map2, trip.b.px, trip.b.py, D3.doorX, D3.doorY, 0, 4e4, true);
      if (!w0p || !w1p) {
        this.plans.set(k, null);
        return null;
      }
      const w0 = { pts: w0p, n: w0p.length }, w1 = { pts: w1p, n: w1p.length };
      const wt = [(w0.n - 1) / 2, 2.5, trip.route.len / 5.5, 2.5, (w1.n - 1) / 2];
      const tot = wt.reduce((x, y) => x + y, 0);
      let acc = 0;
      const fr = wt.map((x) => acc += x / tot);
      pl = { trip, a: trip.a, b: trip.b, w0, w1, fr };
      this.plans.set(k, pl);
      if (this.plans.size > 3e3) this.plans.delete(this.plans.keys().next().value);
      return pl;
    }
    // 車を使う移動中の人物・車の状態: ph = walk0(車へ歩く) / board(ドアを開けて乗る) / drive(走行) / park(駐車して降りる) / walk1(店・職場へ歩く)
    carPos(w, dMin) {
      const t = w.t0 + w.v * dMin;
      if (t < 0 || t > 1) return null;
      const P2 = w.plan, f2 = P2.fr, map2 = this.g.world.map;
      const ci = w.carInfo;
      const lerp2 = (a, b, u) => a + (b - a) * u;
      if (t < f2[0]) {
        const q2 = this.posAlong(P2.w0, t / f2[0]);
        const cp2 = padCarPos(P2.a);
        return { x: q2.x, y: q2.y, dx: q2.dx, dy: q2.dy, ph: "walk0", car: { ...cp2, id: ci.id, ci, open: false } };
      }
      if (t < f2[1]) {
        const u = (t - f2[0]) / (f2[1] - f2[0]);
        const dp = padDoorPos(P2.a), cp2 = padCarPos(P2.a);
        const k = Math.min(1, u / 0.6);
        return { x: lerp2(dp.x, cp2.x, k), y: lerp2(dp.y, cp2.y, k), dx: Math.sign(cp2.x - dp.x), dy: Math.sign(cp2.y - dp.y), ph: u > 0.65 ? "in" : "board", car: { ...cp2, id: ci.id, ci, open: u < 0.8 } };
      }
      if (t < f2[2]) {
        const u = (t - f2[1]) / (f2[2] - f2[1]);
        const s = u * P2.trip.route.len;
        const q2 = routePos(map2, P2.trip.route, s);
        return { x: q2.x, y: q2.y, dx: 0, dy: 0, ph: "drive", car: { x: q2.x, y: q2.y, d: q2.d, id: ci.id, ci, open: false, s, route: P2.trip.route, driver: ci.owner } };
      }
      if (t < f2[3]) {
        const u = (t - f2[2]) / (f2[3] - f2[2]);
        const e = routePos(map2, P2.trip.route, P2.trip.route.len), cp2 = padCarPos(P2.b), dp = padDoorPos(P2.b);
        const k = Math.min(1, u / 0.5);
        const cx = lerp2(e.x, cp2.x, k), cy = lerp2(e.y, cp2.y, k);
        const o = Math.max(0, (u - 0.5) / 0.5);
        return { x: lerp2(cp2.x, dp.x, o), y: lerp2(cp2.y, dp.y, o), dx: Math.sign(dp.x - cp2.x), dy: Math.sign(dp.y - cp2.y), ph: u < 0.55 ? "park" : "alight", car: { x: cx, y: cy, d: k < 1 ? e.d : cp2.d, id: ci.id, ci, open: u > 0.45 } };
      }
      const q = this.posAlong(P2.w1, (t - f2[3]) / (1 - f2[3]));
      const cp = padCarPos(P2.b);
      return { x: q.x, y: q.y, dx: q.dx, dy: q.dy, ph: "walk1", car: { ...cp, id: ci.id, ci, open: false } };
    }
    // 公園で過ごす住民: 公園の敷地(なければ建物の周り)の歩ける場所を、散歩(周回)または立ち話(静止)で過ごす。木・柵・建物の上には立たない。
    parkCells(b) {
      this._pc = this._pc || /* @__PURE__ */ new Map();
      if (this._pc.has(b.idx)) return this._pc.get(b.idx);
      const m = this.g.world.map;
      const S2 = b.site != null && m.sites ? m.sites[b.site] : null;
      const r = S2 && S2.kind === "park" ? { x0: S2.x, y0: S2.y, x1: S2.x + S2.w, y1: S2.y + S2.h } : { x0: b.x - 7, y0: b.y - 6, x1: b.x + b.w + 7, y1: b.y + b.h + 2 };
      const cells = [];
      for (let y = r.y0; y < r.y1; y++) for (let x = r.x0; x < r.x1; x++) {
        if (x < 1 || y < 1 || x >= m.W - 1 || y >= m.H - 1) continue;
        const k = y * m.W + x;
        if (!m.solid[k] && m.bid[k] < 0 && !m.deco?.[k]) cells.push([x, y]);
      }
      this._pc.set(b.idx, cells);
      return cells;
    }
    parkWalker(i, b) {
      const cells = this.parkCells(b);
      if (cells.length < 8) return null;
      const h = hash2(i, 7711);
      const pick5 = (k) => {
        const c = cells[hash2(i, 7712 + k) % cells.length];
        return { x: c[0] + 0.5, y: c[1] + 0.5 };
      };
      if (h % 5 < 2) {
        const c = pick5(0);
        return { id: i, park: 1, static: true, x: c.x, y: c.y, dx: 0, dy: 1, s: 3, t0: 0, v: 0 };
      }
      const m = this.g.world.map;
      const clear = (p1, p2) => {
        const n2 = Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) * 2) + 1;
        for (let k = 0; k <= n2; k++) {
          const x = Math.floor(p1.x + (p2.x - p1.x) * k / n2), y = Math.floor(p1.y + (p2.y - p1.y) * k / n2), q2 = y * m.W + x;
          if (m.solid[q2] || m.bid[q2] >= 0 || m.deco?.[q2]) return false;
        }
        return true;
      };
      let a = null, b2 = null, c3 = null;
      for (let t = 0; t < 14 && !c3; t++) {
        const A2 = pick5(10 + t * 3), B2 = pick5(11 + t * 3), C3 = pick5(12 + t * 3);
        if (Math.hypot(A2.x - B2.x, A2.y - B2.y) > 3 && clear(A2, B2) && clear(B2, C3) && clear(C3, A2)) {
          a = A2;
          b2 = B2;
          c3 = C3;
        }
      }
      if (!c3) {
        const c = pick5(0);
        return { id: i, park: 1, static: true, x: c.x, y: c.y, dx: 0, dy: 1, s: 3, t0: 0, v: 0 };
      }
      const q = { id: i, park: 1, loop: { pts: [a, b2, c3], sp: 0.9 + h % 7 * 0.1, ph: (h >>> 4) % 40 }, s: 3, t0: 0, v: 0, x: a.x, y: a.y };
      return q;
    }
    strollTarget(i) {
      const g = this.g, p = g.world.pop, hb = p.home[i];
      if (hb < 0) return -1;
      if (this.pubCache.has(i)) return this.pubCache.get(i);
      const b = g.world.map.buildings[hb];
      const cx = b.doorX >> 4, cy = b.doorY >> 4;
      let best = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const L2 = this.grid.get(cx + dx + "," + (cy + dy));
        if (L2) for (const q of L2) best.push(q);
        const L22 = this.gridS.get(cx + dx + "," + (cy + dy));
        if (L22) for (const q of L22) best.push(q);
      }
      const t = best.length ? best[hash2(i, 31) % best.length] : -1;
      this.pubCache.set(i, t);
      return t;
    }
    path(a, b) {
      const k = a * 65536 + b;
      let r = this.pathCache.get(k);
      if (r !== void 0) return r;
      if (this.pending >= 10) return void 0;
      this.pending++;
      const B2 = this.g.world.map.buildings;
      const A2 = B2[a], T4 = B2[b];
      const pts = findPath(this.g.world.map, A2.doorX, A2.doorY, T4.doorX, T4.doorY, 0, 4e4, true);
      r = pts ? { pts, n: pts.length } : null;
      this.pathCache.set(k, r);
      if (this.pathCache.size > 4e3) this.pathCache.delete(this.pathCache.keys().next().value);
      return r;
    }
    posAlong(r, t) {
      const f2 = Math.max(0, Math.min(0.9999, t)) * (r.n - 1);
      const i = Math.floor(f2), u = f2 - i;
      const a = r.pts[i], b = r.pts[Math.min(r.n - 1, i + 1)];
      return { x: a[0] + (b[0] - a[0]) * u + 0.5, y: a[1] + (b[1] - a[1]) * u + 0.5, dx: Math.sign(b[0] - a[0]), dy: Math.sign(b[1] - a[1]), jump: Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]) > 1.5 ? { u, fx: a[0], y0: a[1], y1: b[1] } : void 0 };
    }
    // 屋外歩行者: hero付近のみ。戻り値は {id,x,y,dir,moving}
    outdoor(hx2, hy, radius = 34) {
      const g = this.g, w = g.world, p = w.pop, B2 = w.map.buildings;
      const dt = g.date();
      const m = g.S.min;
      this.pending = 0;
      const out = [];
      const parked = [];
      const padUsed = /* @__PURE__ */ new Set();
      const year = g.year();
      const nearSt = w.map.stations.some((s) => Math.abs(s.x - hx2) < radius * 1.2 && Math.abs(s.y - hy) < radius);
      const cmIdx = nearSt ? w.getCommute().index(dt.dow) : null;
      for (let i = 0; i < p.n; i++) {
        if (p.gone[i] || i === g.hero.id) continue;
        const hb = p.home[i];
        if (hb < 0) continue;
        const hd = B2[hb];
        const nearHome = Math.abs(hd.doorX - hx2) < radius * 1.6 && Math.abs(hd.doorY - hy) < radius * 1.2;
        let wd = null;
        if (p.work[i] >= 0) wd = B2[p.work[i]];
        else if (p.school[i] >= 0) wd = B2[p.school[i]];
        const nearWork = wd && Math.abs(wd.doorX - hx2) < radius * 1.6 && Math.abs(wd.doorY - hy) < radius * 1.2;
        if (!nearHome && !nearWork && !(cmIdx && cmIdx.who.has(i))) continue;
        const act = personActivity(w, i, m, dt.dow);
        const cd = !act.train && (nearHome || nearWork) ? this.carDest(i) : -1;
        if (cd >= 0) {
          const pb = (act.s === 0 || act.s === 3) && nearHome ? hb : act.s === 2 && nearWork && act.at === cd ? cd : -1;
          if (pb >= 0 && parked.length < 70) {
            const pad = padFor(w.map, pb);
            const key = pb;
            if (pad && !padUsed.has(key) && Math.abs(pad.px - hx2) < radius && Math.abs(pad.py - hy) < radius * 0.8) {
              padUsed.add(key);
              parked.push({ ci: carOf(w, i, year), pad });
            }
          }
          if (act.s === 1) {
            const from = act.from ?? hb, to = act.to;
            if (from === hb && to === cd || from === cd && to === hb) {
              const pl = this.carPlan(from, to);
              if (pl) {
                const a2 = personActivity(w, i, m + 1, dt.dow);
                const vv = a2.s === 1 && a2.t > act.t ? a2.t - act.t : 1 / 40;
                const wk = { id: i, plan: pl, carInfo: carOf(w, i, year), t0: act.t, v: vv, s: 1 };
                const q2 = this.carPos(wk, 0);
                if (q2 && Math.abs(q2.x - hx2) < radius && Math.abs(q2.y - hy) < radius * 0.8) {
                  Object.assign(wk, { x: q2.x, y: q2.y, dx: q2.dx, dy: q2.dy, ph: q2.ph, car: q2.car });
                  out.push(wk);
                  if (out.length >= 90) break;
                  continue;
                } else if (q2) continue;
              }
            }
          }
        }
        if (act.s === 0 || act.s === 2) continue;
        let r = null, t = 0, v = 0;
        if (act.train) {
          const sg = act.seg;
          if (sg.k === "walk") {
            r = this.path(sg.fromB, sg.toB);
            if (!r) continue;
            t = act.u;
            v = 1 / Math.max(1, sg.t1 - sg.t0);
          } else if (sg.k === "plat" || sg.k === "exit") {
            const pp = platformPos(w.map, sg.st, i);
            if (Math.abs(pp.x - hx2) > radius || Math.abs(pp.y - hy) > radius * 0.8) continue;
            out.push({ id: i, r: null, t0: 0, v: 0, s: 1, x: pp.x, y: pp.y, dx: 0, dy: sg.k === "exit" ? 1 : -1, static: true, waiting: sg.k === "plat" });
            continue;
          } else continue;
        } else if (act.s === 1) {
          const from = act.from ?? hb, to = act.to;
          if (from === to) continue;
          r = this.path(from, to);
          if (!r) continue;
          t = act.t;
          const a2 = personActivity(w, i, m + 1, dt.dow);
          v = a2.s === 1 && a2.t > t ? a2.t - t : 1 / 40;
        } else if (act.s === 3) {
          const tg = this.strollTarget(i);
          if (tg < 0) continue;
          const u = m % 60 / 60;
          if (u > 0.35 && u < 0.65) {
            if (B2[tg].type === "park" && Math.abs(B2[tg].doorX - hx2) < radius * 1.3 && Math.abs(B2[tg].doorY - hy) < radius) {
              const pw = this.parkWalker(i, B2[tg]);
              if (pw) out.push(pw);
            }
            continue;
          }
          r = this.path(hb, tg);
          if (!r) continue;
          if (u <= 0.35) {
            t = u / 0.35;
            v = 1 / 21;
          } else {
            t = 1 - (u - 0.65) / 0.35;
            v = -1 / 21;
          }
        }
        const q = this.posAlong(r, t);
        if (Math.abs(q.x - hx2) > radius || Math.abs(q.y - hy) > radius * 0.8) continue;
        out.push({ id: i, r, t0: t, v, s: act.s, x: q.x, y: q.y, dx: q.dx, dy: q.dy });
        if (out.length >= 90) break;
      }
      {
        const hr = m / 60;
        const want = hr >= 7 && hr < 9 ? 2 : hr >= 9 && hr < 16 ? 3 : hr >= 16 && hr < 19 ? 5 : 0;
        const have = new Set(out.map((o) => o.id));
        if (want) for (const pk of B2) {
          if (pk.type !== "park" || Math.abs(pk.doorX - hx2) > radius * 1.3 || Math.abs(pk.doorY - hy) > radius) continue;
          let n2 = 0;
          for (let j = 0; j < want * 8 && n2 < want; j++) {
            const i = hash2(pk.idx * 131 + j, 7720) % p.n;
            if (have.has(i) || p.gone[i] || i === g.hero.id || p.home[i] < 0 || ageYears(p, i, g.S.M) < 5) continue;
            if (w.dist(p.home[i], pk.idx) > 70) continue;
            if (personActivity(w, i, m, dt.dow).s !== 0) continue;
            const pw = this.parkWalker(i, pk);
            if (pw) {
              out.push(pw);
              have.add(i);
              n2++;
            }
          }
        }
      }
      try {
        if (globalThis.NOFAC) throw 0;
        const fs = facilityScene(w, year, m, hx2, hy, radius);
        for (const c of fs.cars) if (parked.length < 90) parked.push(c);
        const seenId = new Set(out.map((o2) => o2.id));
        for (const q of fs.people) if (!(q.id === g.hero.id) && !seenId.has(q.id) && out.length < 100) {
          seenId.add(q.id);
          out.push({ id: q.id, static: true, x: q.x, y: q.y, dx: q.dx, dy: q.dy, s: 3 });
        }
      } catch (e) {
      }
      try {
        for (const q of estateOutdoorPeople(g, hx2, hy, radius)) if (out.length < 110) out.push(q);
      } catch (e) {
      }
      try {
        if (typeof visitorWalkers === "function") visitorWalkers(this, out, hx2, hy, radius);
        if (typeof kinVisitWalkers === "function") kinVisitWalkers(this, out, hx2, hy, radius);
      } catch (e) {
      }
      try {
        if (typeof campusOutdoor === "function") campusOutdoor(this, out, hx2, hy, radius);
        if (typeof zooOutdoorVisitors === "function") zooOutdoorVisitors(this, out, hx2, hy, radius);
        if (typeof parkOutdoorVisitors === "function") parkOutdoorVisitors(this, out, hx2, hy, radius);
      } catch (e) {
        console.warn("[campus]", e);
      }
      out.parked = parked;
      return out;
    }
    // refresh時点からdMin分(ゲーム内分)進んだ位置。範囲外なら null
    walkerPos(w, dMin) {
      if (w.plan) return this.carPos(w, dMin);
      if (w.static) return { x: w.x, y: w.y, dx: w.dx, dy: w.dy };
      if (w.loop) {
        const P2 = w.loop.pts, n2 = P2.length;
        let L2 = 0;
        const seg = [];
        for (let k = 0; k < n2; k++) {
          const a = P2[k], b = P2[(k + 1) % n2];
          const l = Math.hypot(b.x - a.x, b.y - a.y);
          seg.push(l);
          L2 += l;
        }
        if (L2 < 0.01) return { x: P2[0].x, y: P2[0].y, dx: 0, dy: 1 };
        let d = ((w.loop.ph + w.loop.sp * dMin) % L2 + L2) % L2;
        for (let k = 0; k < n2; k++) {
          if (d <= seg[k] || k === n2 - 1) {
            const a = P2[k], b = P2[(k + 1) % n2], u = seg[k] ? Math.min(1, d / seg[k]) : 0;
            return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, dx: Math.sign(b.x - a.x) * (Math.abs(b.x - a.x) > 0.01 ? 1 : 0), dy: Math.sign(b.y - a.y) * (Math.abs(b.y - a.y) > 0.01 ? 1 : 0), ph: d * 1.6 };
          }
          d -= seg[k];
        }
      }
      const t = w.t0 + w.v * dMin;
      if (t < 0 || t > 1) return null;
      const q = this.posAlong(w.r, t);
      if (w.v < 0) {
        q.dx = -q.dx;
        q.dy = -q.dy;
      }
      return q;
    }
    // 屋内の在室者
    // 屋内の人物・巡回の経由点が机や壁の上に乗っていたら、いちばん近い空きマスへ寄せる(座る/寝る人は除く)
    indoor(bIdx, I2, floor) {
      let res = this.indoor0(bIdx, I2, floor);
      if (!res || !I2 || !I2.objs) return res;
      try {
        if (typeof campusIndoor === "function") res = campusIndoor(this, bIdx, I2, floor, res);
        if (typeof funeralIndoor === "function") res = funeralIndoor(this, bIdx, I2, floor, res);
        if (typeof cinemaIndoor === "function") res = cinemaIndoor(this, bIdx, I2, floor, res);
      } catch (e) {
        console.warn("[campus in]", e);
      }
      const sol = interiorSolid(I2), W2 = I2.W, H4 = I2.H;
      const near2 = (x, y) => {
        const sx = Math.floor(x), sy = Math.floor(y);
        if (sx >= 0 && sy >= 0 && sx < W2 && sy < H4 && !sol[sx + sy * W2]) return null;
        const seen = /* @__PURE__ */ new Set([sx + "," + sy]);
        const q = [[sx, sy]];
        for (let h = 0; h < q.length; h++) {
          const [cx, cy] = q[h];
          for (const [dx, dy] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) {
            const nx = cx + dx, ny = cy + dy, k = nx + "," + ny;
            if (nx < 0 || ny < 1 || nx >= W2 || ny >= H4 - 1 || seen.has(k)) continue;
            seen.add(k);
            if (!sol[nx + ny * W2]) return [nx + 0.5, ny + 0.5];
            q.push([nx, ny]);
          }
        }
        return null;
      };
      for (const q of res) {
        const rest = q.pose === "sit" || q.pose === "lie" || ["sit", "inpatient", "bath", "rbath"].includes(q.act) || q.seat0;
        if (!rest) {
          const n2 = near2(q.x, q.y);
          if (n2) {
            q.x = n2[0];
            q.y = n2[1];
          }
        }
        if (q.wp) for (const w of q.wp) {
          const n2 = near2(w.x, w.y);
          if (n2) {
            w.x = n2[0];
            w.y = n2[1];
          }
        }
      }
      return res;
    }
    indoor0(bIdx, I2, floor) {
      const g = this.g, w = g.world, p = w.pop, B2 = w.map.buildings, b = B2[bIdx];
      const dt = g.date();
      const m = g.S.min;
      const res = [];
      let indoorCnt = null, hUsed = null;
      const bt = BTYPES[b.type];
      const spotsS = I2.staffSpots, spotsV = I2.seatSpots;
      let si = 0, vi = 0;
      const used = /* @__PURE__ */ new Set();
      const take = (arr, k) => arr.length ? arr[k % arr.length] : null;
      const seen = /* @__PURE__ */ new Set();
      for (const f2 of g.hero.firms || []) {
        if (f2.b !== bIdx || f2.state !== "open") continue;
        const hr = m / 60;
        if (hr < f2.hrs[0] || hr >= f2.hrs[1]) continue;
        const ord = [...f2.staff].sort((a, c) => (c.id === f2.mgr) - (a.id === f2.mgr));
        for (const st3 of ord) {
          if (res.some((q) => q.id === st3.id)) continue;
          const sp = take(spotsS, si++);
          if (sp) res.push({ id: st3.id, x: sp.x + 0.5, y: sp.y + 0.5, dir: "d", role: "staff", firm: f2.id });
        }
      }
      if (isUnitFloor(floor)) return unitPeople(this, bIdx, I2, floor, res);
      if (I2.big) return bigPeople(this, bIdx, I2, floor, res);
      if (FAC_BUILD[b.type] && typeof stationPeople === "function" && (b.type === "station" || b.type === "metro")) {
        for (const q of stationPeople(g, b, I2, floor)) res.push(q);
      } else if (b.type === "station") {
        const cm = w.getCommute();
        const si2 = w.map.stations.findIndex((x) => x.building === bIdx);
        if (si2 >= 0) {
          const sol = interiorSolid(I2);
          const cells = [];
          for (let y = 3; y < I2.H - 2; y++) for (let x = 1; x < I2.W - 1; x++) if (!sol[x + y * I2.W]) cells.push([x, y]);
          const used2 = /* @__PURE__ */ new Set();
          for (const r of cm.waiting(dt.dow, si2, m).slice(0, 16)) {
            let k = hash2(r.id, 17) % cells.length;
            for (let q = 0; q < 6 && used2.has(k); q++) k = (k + 7) % cells.length;
            used2.add(k);
            const c = cells[k];
            res.push({ id: r.id, x: c[0] + 0.5, y: c[1] + 0.5, dir: "u", role: "commuter" });
          }
          for (const r of cm.alighting(dt.dow, si2, m).slice(0, 10)) {
            const u = Math.min(1, (m - r.t0) / Math.max(1, r.t1 - r.t0));
            res.push({ id: r.id, x: I2.W - 3 + 0.5 + (I2.door.x + 0.5 - (I2.W - 3 + 0.5)) * u, y: 3 + (I2.H - 2 - 3) * u, dir: "d", role: "commuter" });
          }
        }
      }
      try {
        if (typeof visitorsInside === "function" && !isUnitFloor(floor)) for (const q of visitorsInside(this, b, I2, floor)) if (!res.some((r) => r.id === q.id)) res.push(q);
      } catch (e) {
      }
      // 帰省している市外の親族(kinvisit.js)。一戸建て(集合住宅の住戸は unitPeople)
      if (bt.cat === "res" && typeof kinVisitInside === "function") try {
        for (const q of kinVisitInside(this, bIdx, I2)) if (!res.some((r) => r.id === q.id)) res.push(q);
      } catch (e) {
      }
      if (bt.cat === "res") {
        if (I2.mansion && bIdx === g.hero.homeB) return mansionPeople(this, g, bIdx, I2, floor, res, personActivity, dt);
        if (bIdx === g.hero.homeB) {
          const fam = [];
          for (let i = 0; i < p.n; i++) if (!p.gone[i] && p.home[i] === bIdx && i !== g.hero.id && (g.hero.rel[i]?.family || i === g.hero.mother || i === g.hero.father)) fam.push(i);
          for (const i of fam) {
            const act = personActivity(w, i, m, dt.dow);
            if (act.s === 0 || act.s === 3 && false) {
              const sp = take(spotsS, si++);
              if (sp) res.push({ id: i, x: sp.x + 0.5, y: sp.y + 0.5, dir: "d", role: "family" });
            }
          }
        } else {
          for (const i of Object.keys(g.hero.rel).map(Number)) {
            if (p.home[i] === bIdx && !p.gone[i] && personActivity(w, i, m, dt.dow).s === 0) {
              const sp = take(spotsS, si++);
              if (sp) res.push({ id: i, x: sp.x + 0.5, y: sp.y + 0.5, dir: "d", role: "resident" });
            }
          }
        }
        return res;
      }
      if (floor === 0 || b.floors > 1) {
        for (let s = 0; s < w.slots.b.length && res.length < 14; s++) {
          if (w.slots.b[s] !== bIdx) continue;
          const i = w.slots.who[s];
          if (i < 0 || i === g.hero.id || p.gone[i]) continue;
          const act = personActivity(w, i, m, dt.dow);
          if (act.s !== 2 || act.at !== bIdx) continue;
          if (I2.hospital) {
            const jk = JOB_IDS2[p.job[i]];
            const role = jk === "doctor" ? "doctor" : jk === "nurse" ? "nurse" : "recep";
            const fl0 = role === "nurse" ? hash2(i, 5) % (I2.floors > 2 ? I2.floors : 2) : role === "doctor" ? hash2(i, 5) % 5 === 0 ? 1 : 0 : 0;
            if (fl0 !== floor) continue;
            hUsed = hUsed || /* @__PURE__ */ new Set();
            const k0 = spotsS.findIndex((q, k) => q.role === role && !hUsed.has(k));
            const k1 = k0 >= 0 ? k0 : spotsS.findIndex((q, k) => !hUsed.has(k) && role !== "doctor");
            if (k1 < 0) continue;
            hUsed.add(k1);
            const sp2 = spotsS[k1];
            res.push({ id: i, x: sp2.x + 0.5, y: sp2.y + 0.5, dir: "d", role: "staff", hrole: role });
            continue;
          }
          const nfl = isSchoolBig(b) ? schoolFloors(b) : b.floors;
          const fl = isSchoolBig(b) ? act.s === 2 && m % 60 < 50 && m / 60 >= 8.5 && m / 60 < 15.5 && hash2(i, 6) % 4 ? 1 + hash2(i, 5) % (nfl - 1) : 0 : nfl > 1 ? hash2(i, 5) % nfl : 0;
          if (fl !== floor) continue;
          if (si >= spotsS.length + 2) break;
          const sp = take(spotsS, si++);
          if (!sp) break;
          res.push({ id: i, x: sp.x + 0.5, y: sp.y + 0.5, dir: "d", role: "staff" });
        }
      }
      if (bt.cat === "school" && bt.level) schoolPeople(this, b, I2, floor, res, dt);
      if (!["school"].includes(bt.cat) && bt.cat !== "res" && spotsV.length + I2.W > 0) {
        const u = m % 60 / 60;
        if (u > 0.05 && u < 0.95) {
          let c = 0;
          for (let i = 0; i < p.n && c < 6; i++) {
            if (p.gone[i] || i === g.hero.id || p.home[i] < 0) continue;
            if (hash2(i, 31) % 7 !== 0) continue;
            if (this.strollTarget(i) !== bIdx) continue;
            const act = personActivity(w, i, m, dt.dow);
            if (act.s !== 3) continue;
            const sp = spotsV.length ? spotsV[(c * 3 + hash2(i, 2)) % spotsV.length] : { x: 2 + c * 2, y: H_FALLBACK(I2) };
            res.push({ id: i, x: sp.x + 0.5, y: sp.y + 0.5, dir: "d", role: "customer" });
            c++;
          }
        }
      }
      globalThis.__min = m;
      globalThis.__M = w.M;
      try {
        if (I2.hospital && (I2.wardFloor !== void 0 ? I2.wardFloor : floor === 1)) {
          for (const ip of inpatientsOf(g, b, I2)) if (!res.some((q) => q.id === ip.id)) res.push({ id: ip.id, x: ip.bed.x + 0.5, y: ip.bed.y + 0.5, dir: "d", role: "patient", act: "inpatient", pose: "sit", seat: "bed@" + ip.bed.x + "," + ip.bed.y });
        }
        shopLife(res, I2, b, bt, p);
        kindLife(res, I2, b, bt, p);
        if (I2.kind === "onsen" && floor >= 1 && !I2.family) onsenBathers(this.g, b, I2, floor, res);
      } catch (e) {
      }
      if (floor === 0 && bt.cat === "food") {
        try {
          const ev = activeAt(g, bIdx);
          if (ev) {
            for (let k = res.length - 1; k >= 0; k--) if (res[k].role === "customer") res.splice(k, 1);
            for (const q of partyPeople(g, ev, I2)) res.push(q);
          }
        } catch (e) {
        }
      }
      return res;
    }
  };
  function H_FALLBACK(I2) {
    return I2.H - 3;
  }
  function schoolPeople(C2, b, I2, floor, res, dt) {
    const g = C2.g, w = g.world, p = w.pop, m = g.S.min;
    const big = isSchoolBig(b);
    const nF = big ? schoolFloors(b) : Math.max(1, b.floors || 1);
    const roster = [];
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i] || i === g.hero.id || p.school[i] !== b.idx || !(p.flags[i] & F_STUDENT)) continue;
      roster.push(i);
    }
    const recess = m % 60 >= 50 && m >= 9 * 60 && m < 15 * 60;
    const sol = interiorSolid(I2);
    const free = (x, y) => x >= 1 && y >= 3 && x < I2.W - 1 && y < I2.H - 2 && !sol[x + y * I2.W];
    const byCls = /* @__PURE__ */ new Map();
    const gradeCount = {};
    const cfg = big ? cfgOf(b) : null, nC = big ? schoolClasses(w, b) : 1;
    for (const i of roster) {
      const gr = big ? gradeOfPerson(w, i, cfg) : 0;
      const fl = big ? floorOfGrade(cfg, gr) : hash2(i, 5) % nF;
      const gk = big ? "g" + gr : fl;
      const n2 = (gradeCount[gk] = (gradeCount[gk] || 0) + 1) - 1;
      // 学級は人ごとに決まる(ties.js の kumiOf と同じ)。席は学級の中で来た順
      const kumi = big ? kumiOf(i, { kinder: 1, elem: 2, jh: 3, hs: 4, univ: 5 }[b.type] || 3, nC) : 0;
      const ck = big ? "c" + gr + ":" + kumi : null;
      const cl = big ? slotOf(cfg, gr, kumi, nC) : 0, k = big ? (byCls.set(ck, (byCls.get(ck) || 0) + 1), byCls.get(ck) - 1) : n2;
      if (fl !== floor) continue;
      if (personActivity(w, i, m, dt.dow).s !== 2) continue;
      const seats = big ? (I2.classSeats || [])[cl] || [] : I2.seatSpots || [];
      const stand = big ? (I2.classStand || [])[cl] || [] : [];
      let pos, seated = true;
      if (k < seats.length) pos = seats[k];
      else if (stand[k - seats.length]) {
        pos = stand[k - seats.length];
        seated = false;
      } else {
        const cells = [];
        const y0 = big ? 2 : 3, y1 = big ? 4 : I2.H - 2;
        for (let y = y0; y < y1; y++) for (let x = 1; x < I2.W - 1; x++) if (x >= 1 && !sol[x + y * I2.W]) cells.push([x, y]);
        const c = cells[hash2(i, 41) % Math.max(1, cells.length)] || [2, 3];
        pos = { x: c[0], y: c[1] };
        seated = false;
      }
      const q = { id: i, x: pos.x + 0.5, y: pos.y + 0.5, dir: "u", role: "student", cls: big ? cl + 1 : void 0, seat0: seated };
      if (recess) {
        const dx0 = big ? 1 + 10 * cl + 8 : pos.x, ox = big ? Math.max(2, Math.min(I2.W - 5, dx0 + hash2(i, 8) % 9 - 4)) : Math.max(1, Math.min(I2.W - 2, pos.x + hash2(i, 8) % 5 - 2)), oy = big ? 2.5 : Math.max(3, Math.min(I2.H - 3, pos.y + hash2(i, 9) % 3 - 1)) + 0.5;
        q.x = dx0 + 0.5;
        q.y = big ? 3.5 : pos.y + 0.5;
        q.act = "recess";
        q.ph = hash2(i, 3) % 12;
        q.seat0 = false;
        q.wp = [{ x: dx0 + 0.5, y: q.y, pause: 1 + hash2(i, 4) % 3, dir: "d" }, { x: ox + 0.5, y: oy, pause: 2 + hash2(i, 6) % 3, dir: "u" }];
      }
      res.push(q);
    }
    if (!recess) {
      for (const q of res) if (q.role === "staff" && (!big || floor > 0)) {
        const sx = q.x, sy = q.y;
        const e = big ? { x: sx, y: 10.5 } : { x: Math.min(I2.W - 2, sx + 2) + 0.5 - 0.5, y: Math.min(I2.H - 3, sy + 3) + 0.5 };
        if (free(Math.floor(e.x), Math.floor(e.y))) {
          q.act = "tour";
          q.wp = [{ x: sx, y: sy, pause: 6, dir: "d" }, { x: e.x, y: e.y, pause: 3, dir: "u" }];
          q.ph = hash2(q.id, 3) % 30;
        }
      }
    }
  }
  var SPD = 1.1;
  function shopLife(res, I2, b, bt, p) {
    const objs = I2.objs || [];
    const reg = objs.find((o) => o.t === "register");
    const W2 = I2.W, H4 = I2.H;
    const shelves = objs.filter((o) => (o.t === "shelf" || o.t === "rack") && o.y === 2).map((o) => o.x).sort((a, c) => a - c);
    const wp2 = (x, y, pause = 0, dir) => ({ x: x + 0.5, y: y + 0.5, pause, dir });
    const door = I2.door || { x: W2 >> 1, y: H4 - 1 };
    const yT = H4 - 2;
    let nst = 0, ncu = 0;
    if (reg && shelves.length) {
      if (!res.some((q) => q.role === "staff") && globalThis.__min >= 8 * 60 && globalThis.__min < 21 * 60) {
        for (let k = 0; k < 20; k++) {
          const i = hash2((b.idx ?? 0) * 7 + k, 7311) % p.n;
          if (p.gone[i] || p.home[i] < 0) continue;
          const ag = ageYears(p, i, globalThis.__M || 0);
          if (ag < 18 || ag > 68) continue;
          res.push({ id: i, x: 0, y: 0, dir: "d", role: "staff" });
          break;
        }
      }
      const xe = (x) => x % 2 === 0 ? x : x + 1;
      for (const q of res) {
        if (q.role === "staff") {
          nst++;
          if (nst === 1) {
            {
              const so = interiorSolid(I2);
              let ry = reg.y - 1;
              for (const dy of [0, -1, -2, -3, 1, 2]) {
                const yy = reg.y - 1 + dy;
                if (yy >= 1 && yy < H4 - 1 && !so[reg.x + yy * W2]) {
                  ry = yy;
                  break;
                }
              }
              q.x = reg.x + 0.5;
              q.y = ry + 0.5;
            }
            q.dir = "d";
            q.act = "register";
            continue;
          }
          const ws = [];
          for (const sx of shelves.slice(0, 5)) ws.push(wp2(sx, 3, 3, "u"));
          const back = ws.slice(1, -1).reverse();
          q.wp = ws.concat(back);
          q.act = "restock";
          q.ph = hash2(q.id, 3) % 20;
          continue;
        }
        if (q.role === "customer") {
          ncu++;
          const a = shelves[hash2(q.id, 11) % shelves.length], bsx = shelves[hash2(q.id, 12) % shelves.length];
          const e1 = Math.min(W2 - 6, xe(bsx));
          q.wp = [wp2(door.x, yT, 0), wp2(a, yT), wp2(a, 5, 2.5, "u"), wp2(e1, 5), wp2(e1, 3), wp2(bsx, 3, 2.5, "u"), wp2(e1, 3), wp2(e1, yT), wp2(reg.x, yT, 2.2, "u"), wp2(door.x, yT, 0)];
          q.act = "shop";
          q.ph = hash2(q.id, 4) % 40;
        }
      }
    } else if (b.type && (bt.cat === "food" || objs.some((o) => o.t === "order"))) {
      let n2 = 0;
      for (const q of res) if (q.role === "staff") {
        n2++;
        if (n2 === 2) {
          q.wp = [wp2(W2 - 2, 3, 1), wp2(W2 - 2, 5), wp2(2, 5, 2.5, "u"), wp2(6, 5, 2.5, "u"), wp2(W2 - 2, 5)];
          q.act = "serve";
          q.ph = hash2(q.id, 5) % 20;
        }
      }
    }
  }
  function kindLife(res, I2, b, bt, p) {
    const kind = I2.kind;
    if (!kind || I2.school || ["shop", "food", "home", "station", "airport", "ferry", "onsen"].includes(kind) || I2.big) return;
    const objs = (I2.objs || []).filter((o) => !o.deco);
    const sol = interiorSolid(I2);
    const W2 = I2.W, H4 = I2.H;
    const door = I2.door || { x: W2 >> 1, y: H4 - 1 };
    const free = (x, y) => x >= 1 && y >= 1 && x < W2 - 1 && y < H4 - 1 && !sol[x + y * W2];
    const stand = (o) => {
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1]]) if (free(o.x + dx, o.y + dy)) return { x: o.x + dx, y: o.y + dy };
      return null;
    };
    const wp2 = (o, pause, dir) => {
      const s = stand(o);
      return s ? { x: s.x + 0.5, y: s.y + 0.5, pause, dir: dir || (s.y > o.y ? "u" : s.y < o.y ? "d" : "u") } : null;
    };
    const dw = { x: door.x + 0.5, y: Math.min(H4 - 2, door.y - 1) + 0.5, pause: 0, dir: "d" };
    const by = (a) => objs.filter((o) => o.act === a);
    const byT = (t) => objs.filter((o) => o.t === t);
    const pick5 = (arr, id, k) => arr.length ? arr[hash2(id, k) % arr.length] : null;
    let ns = 0;
    if (I2.hospital) {
      const beds = by("checkup"), wards = by("ward"), seats = byT("seat"), counters = by("clinic"), recC = I2.wardFloor !== void 0 ? counters.filter((o) => /受付/.test(o.label || "")) : counters.filter((o) => o.y === 3), payC = I2.wardFloor !== void 0 ? counters.filter((o) => /会計|精算|薬局/.test(o.label || "")) : counters.filter((o) => o.y === 8);
      const spawn = (floor1) => floor1 ? { x: I2.W - 3 + 0.5, y: 2.5, pause: 0, dir: "d" } : dw;
      const fl1 = I2.wardFloor !== void 0 ? I2.wardFloor : I2.floor === 1;
      for (const q of res) {
        if (q.role === "staff") {
          const r = q.hrole;
          if (r === "doctor" && !fl1) {
            const bd = beds[hash2(q.id, 9) % beds.length], w1 = bd && wp2(bd, 4, "u");
            q.act = "consult";
            if (w1) {
              q.wp = [{ x: q.x, y: q.y, pause: 7, dir: "d" }, w1];
              q.ph = hash2(q.id, 3) % 40;
            }
          } else if (r === "nurse") {
            q.act = "rounds";
            const tg = (fl1 ? wards : beds).map((o) => wp2(o, 3, "u")).filter(Boolean);
            if (tg.length) {
              const a = tg[hash2(q.id, 2) % tg.length], c2 = tg[(hash2(q.id, 2) + 1 + hash2(q.id, 7) % Math.max(1, tg.length - 1)) % tg.length];
              q.wp = [{ x: q.x, y: q.y, pause: 5, dir: "d" }, a, c2];
              q.ph = hash2(q.id, 3) % 50;
            }
          } else q.act = r === "doctor" ? "rounds" : "reception";
        } else if (q.role === "customer") {
          if (fl1) {
            const bd = pick5(wards, q.id, 61), sof = pick5(byT("sofa"), q.id, 62);
            const st3 = [bd && wp2(bd, 5, "u"), sof && wp2(sof, 3)].filter(Boolean);
            if (!st3.length) continue;
            q.wp = [spawn(true), ...st3, spawn(true)];
            q.act = "visit";
            q.ph = hash2(q.id, 4) % 40;
            q.x = spawn(true).x;
            q.y = spawn(true).y;
          } else {
            const stops = [pick5(recC, q.id, 40) && wp2(pick5(recC, q.id, 40), 3), pick5(seats, q.id, 41) && wp2(pick5(seats, q.id, 41), 6), pick5(beds, q.id, 42) && wp2(pick5(beds, q.id, 42), 5, "u"), pick5(payC, q.id, 43) && wp2(pick5(payC, q.id, 43), 2.5)].filter(Boolean);
            q.wp = [dw, ...stops, dw];
            q.act = "patient";
            q.ph = hash2(q.id, 4) % 40;
            q.x = dw.x;
            q.y = dw.y;
          }
        }
      }
      return;
    }
    const rules = {
      hospital: { c: "patient", s: "rounds", cust: (id) => [by("clinic"), byT("seat"), by("checkup").concat(by("ward")), by("clinic")], pauses: [2.5, 3, 3.5, 2], staff: () => by("ward").concat(by("checkup"), by("clinic")) },
      office: { c: "errand", s: "deliver", cust: (id) => [by("hall").concat(by("bank"), by("voc")), by("board")], pauses: [3, 1.5], staff: () => by("hall").concat(by("bank"), byT("desk")) },
      shrine: { c: "worship", s: "ritual", cust: (id) => [by("pray"), by("omamori")], pauses: [3.5, 2], staff: () => by("omamori").concat(by("pray")) },
      leisure: { c: "play", s: "guide", cust: (id) => {
        const a = by("play");
        const n2 = Math.min(3, a.length);
        const o = [];
        for (let k = 0; k < n2; k++) o.push([a[hash2(id, 20 + k) % a.length]]);
        o.push(by("pay"));
        return o;
      }, pauses: [3, 3, 3, 2], staff: () => by("pay").concat(by("play")) },
      hotel: { c: "checkin", s: "concierge", cust: (id) => [by("stay"), by("rest"), by("stay")], pauses: [3, 4, 2], staff: () => by("stay") },
      showroom: { c: "viewcar", s: "sales", cust: (id) => [by("dealer").concat(byT("showcar")), by("dealer")], pauses: [3.5, 2.5], staff: () => byT("showcar").concat(by("dealer")) },
      warehouse: { c: "viewing", s: "patrol", cust: (id) => [by("work"), by("locker")], pauses: [3, 1.5], staff: () => by("work") },
      factory: { c: "viewing", s: "patrol", cust: (id) => [by("work"), by("locker")], pauses: [3, 1.5], staff: () => by("work") },
      school: { c: "viewing", s: "tour", cust: (id) => [by("class"), by("board")], pauses: [3, 2], staff: () => by("class").concat(by("board")) },
      tower: { c: "viewing", s: "guide", cust: (id) => [by("play").concat(by("pay")), by("pay")], pauses: [3, 2], staff: () => by("pay") }
    };
    const R5 = rules[kind];
    if (!R5) return;
    for (const q of res) {
      if (q.role === "customer") {
        const stops = R5.cust(q.id).map((arr, i) => {
          const o = pick5(arr, q.id, 40 + i);
          return o ? wp2(o, R5.pauses[i] || 2) : null;
        }).filter(Boolean);
        if (!stops.length) continue;
        q.wp = [dw, ...stops, dw];
        q.act = R5.c;
        q.ph = hash2(q.id, 4) % 40;
        q.x = dw.x;
        q.y = dw.y;
      } else if (q.role === "staff") {
        ns++;
        if (ns === 1) continue;
        const t0 = R5.staff();
        const rot = ns * 2 % Math.max(1, t0.length);
        const t = t0.slice(rot).concat(t0.slice(0, rot));
        const ws = t.slice(0, 4).map((o, i) => wp2(o, 2 + i % 2)).filter(Boolean);
        if (ws.length < 2) continue;
        q.wp = ws.concat(ws.slice(1, -1).reverse());
        q.act = R5.s;
        q.ph = 7 * ns + hash2(q.id, 3) % 40;
      }
    }
  }
  function onsenBathers(g, b, I2, floor, res) {
    const w = g.world, p = w.pop, h = g.S.min / 60;
    const open2 = h >= 6 && h < 23;
    if (!open2) return;
    const busy3 = h >= 16 && h < 22 ? 1 : h >= 10 && h < 16 ? 0.55 : 0.3;
    const tubs = (I2.objs || []).filter((o) => o.t === "bath" || o.t === "rotenbath" || o.t === "fx_yubune"), washes = (I2.objs || []).filter((o) => o.t === "wash"), lock = (I2.objs || []).find((o) => o.t === "locker"), bench = (I2.objs || []).find((o) => o.t === "seat" && o.act === "rest");
    if (!tubs.length || !washes.length) return;
    // 広い湯船は2マスに1人まで入れる
    const cap = tubs.reduce((a, o) => a + Math.max(1, Math.floor((o.w || 1) * (o.h || 1) / 2)), 0);
    const want = Math.max(1, Math.min(cap, Math.round(cap * busy3))), male = floor === 1;
    const slot = Math.floor(g.S.min / 30), day = g.S.M * 31 + (g.S.day || 0);
    const used = new Set(res.map((q) => q.id));
    const picked = [];
    for (let k = 0; k < 600 && picked.length < want; k++) {
      const i = (hash2(b.idx * 211 + slot + day * 3, 700 + k) >>> 0) % p.n;
      if (used.has(i) || p.gone[i] || i === g.hero.id || p.home[i] < 0) continue;
      const age = ageYears(p, i, w.M);
      if (age < 4) continue;
      if (w.isFem(i) === male) continue;
      used.add(i);
      picked.push(i);
    }
    const cell2 = (o, dy = 0, k = 0) => ({ x: o.x + 0.5 + ((o.w || 1) > 1 ? (k * 2 + (k / (o.w || 1) | 0)) % (o.w || 1) : 0), y: o.y + 0.5 + dy + ((o.h || 1) > 1 ? (k * 2 / (o.w || 1) | 0) % (o.h || 1) : 0) });
    picked.forEach((id, k) => {
      const tub = tubs[k % tubs.length], wash = washes[k % washes.length], lk = lock ? { x: lock.x + 0.5, y: Math.min(I2.H - 2, lock.y) - 0 + 0.5 - 1 } : { x: 3.5, y: I2.H - 3.5 };
      const seq = [{ ...lk, pause: 2, dir: "u" }, { ...cell2(wash, 0), pause: 6, dir: "u", pose: "sit", act: "washing" }, { ...cell2(tub, 0, Math.floor(k / tubs.length)), pause: 14, dir: "d", pose: "sit", act: "bathing" }];
      if (bench) seq.push({ x: bench.x + 0.5, y: bench.y + 0.5, pause: 5, dir: "d", pose: "sit", act: "resting" });
      res.push({ id, x: seq[0].x, y: seq[0].y, dir: "d", role: "bather", act: "bathing", act0: "bathing", wp: seq, ph: hash2(id, 5) % 40 + k * 9 });
    });
  }
  function animIndoor(people, tSec) {
    for (const q of people) {
      const w = q.wp;
      if (!w || w.length < 2) continue;
      if (!q._cy) {
        let t2 = 0;
        q._seg = [];
        for (let i = 0; i < w.length; i++) {
          const a = w[i], c = w[(i + 1) % w.length];
          const d = Math.abs(c.x - a.x) + Math.abs(c.y - a.y);
          q._seg.push([t2, a.pause || 0, d / SPD]);
          t2 += (a.pause || 0) + d / SPD;
        }
        q._cy = t2 || 1;
      }
      let t = (tSec + (q.ph || 0)) % q._cy;
      for (let i = 0; i < w.length; i++) {
        const [t0, ps, tm] = q._seg[i];
        if (t >= t0 + ps + tm) continue;
        const a = w[i], c = w[(i + 1) % w.length];
        if (t < t0 + ps) {
          q.x = a.x;
          q.y = a.y;
          q.dir = a.dir || q.dir || "d";
          q.moving = false;
          q.pose = a.pose;
          if (a.act) q.act = a.act;
        } else {
          q.pose = void 0;
          if (q.act0) q.act = q.act0;
          const u = tm > 0 ? (t - t0 - ps) / tm : 1;
          q.x = a.x + (c.x - a.x) * u;
          q.y = a.y + (c.y - a.y) * u;
          const dx = c.x - a.x, dy = c.y - a.y;
          q.dir = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "r" : "l" : dy > 0 ? "d" : "u";
          q.moving = true;
        }
        break;
      }
    }
  }

