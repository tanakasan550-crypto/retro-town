  // src/traffic.js
  var LEN_M = { kei: 3.4, compact: 3.9, sedan: 4.7, minivan: 4.7, suv: 4.6, sports: 4.4, keitruck: 3.4, delivery: 4.7, bigtruck: 8.5, taxi: 4.7, bus: 10.5, tourbus: 11, police: 4.7, ambulance: 5.5, firetruck: 7 };
  var ACC = 5;
  var VMAX = { 1: 2.2, 2: 3.4, 3: 4.2, 4: 5 };
  var Traffic = class {
    constructor(map2, world) {
      this.map = map2;
      this.world = world;
      this.ri = roadInfo(map2);
      this.cl = junctions(map2);
      this.cars = [];
      this.n = 0;
      this.t = 0;
      this.acc = 0;
      this.lanes = [];
      const { W: W2, H: H4 } = this.ri;
      this.src = [];
      const comp = new Int32Array(W2 * H4).fill(-1), sz = [];
      for (let k = 0; k < W2 * H4; k++) {
        if (!this.ri.drv[k] || comp[k] >= 0) continue;
        const q = [k];
        comp[k] = sz.length;
        for (let qi = 0; qi < q.length; qi++) {
          const t = q[qi], x = t % W2, y = t / W2 | 0;
          for (let d = 0; d < 4; d++) {
            const nx = x + DX[d], ny = y + DY[d];
            if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
            const nk = nx + ny * W2;
            if (this.ri.drv[nk] && comp[nk] < 0) {
              comp[nk] = sz.length;
              q.push(nk);
            }
          }
        }
        sz.push(q.length);
      }
      for (let k = 0; k < W2 * H4; k++) {
        if (!(this.ri.drv[k] && this.ri.axis[k] !== AX.J && map2.ground[k] === T.ROAD) || sz[comp[k]] < 150) continue;
        const m = laneDirs(this.ri, k);
        for (let d = 0; d < 4; d++) if (m >> d & 1) this.src.push(k * 4 + d);
      }
      this.lanes = this.src;
    }
    // 歩行者・主人公などの位置 peds=[{x,y}] (タイル単位) / trains=[{x,y}] / clock=秒 / year=ゲーム年
    step(dt, hero, clock, peds, trains, year) {
      dt = Math.min(dt, 0.1);
      this.t += dt;
      const ri = this.ri, W2 = ri.W, cars = this.cars;
      for (const c of cars) this.move(c, dt, clock, peds, trains, cars);
      for (let i = cars.length - 1; i >= 0; i--) {
        const c = cars[i];
        if (c.dead || Math.abs(c.x - hero.x) > 58 || Math.abs(c.y - hero.y) > 36) cars.splice(i, 1);
      }
      this.acc += dt;
      if (this.acc < 0.25 || !this.lanes.length) return;
      this.acc = 0;
      const want = 36;
      if (cars.length >= want) return;
      for (let tr = 0; tr < 40; tr++) {
        const h = hash2((this.tries = (this.tries || 0) + 1) * 31 + tr, 7771) >>> 0;
        const sv = this.lanes[h % this.lanes.length], k = sv >> 2;
        const x = k % W2, y = k / W2 | 0;
        const ddx = Math.abs(x - hero.x), ddy = Math.abs(y - hero.y);
        if (ddx > 40 || ddy > 24 || ddx < 19 && ddy < 10) continue;
        const d = sv & 3;
        const cx = x + 0.5, cy = y + 0.5;
        if (cars.some((c) => Math.abs(c.x - cx) < 6 && Math.abs(c.y - cy) < 6 && (Math.abs(c.x - cx) < c.len + 1.5 && Math.abs(c.y - cy) < c.len + 1.5))) continue;
        const hh = hash2(this.n + 5, 31337) >>> 0;
        let ty = pickVehType(hh, year);
        this.n++;
        {
          if (!this.taxiPts) {
            this.taxiPts = [];
            for (const b of this.map.buildings) if (b.type === "station" || b.type === "airport" || b.type === "hospital" || b.type === "hotel" || b.type === "resorthotel" || b.type === "dept" || b.type === "mall") this.taxiPts.push([b.doorX, b.doorY]);
          }
          if (year >= 1950 && this.taxiPts.some((q) => Math.abs(q[0] - cx) < 26 && Math.abs(q[1] - cy) < 26) && (hh >>> 5) % 100 < 55) ty = "taxi";
        }
        let owner = -1;
        if (this.world && this.world.pop && ["kei", "compact", "sedan", "minivan", "suv", "sports", "keitruck", "wagon", "luxury"].includes(ty)) {
          const pn = this.world.pop.n;
          for (let q = 0; q < 12; q++) {
            const o = hash2(hh + q * 97, 6101) % pn;
            if (this.busy && this.busy.has(o)) continue;
            if (cars.some((c) => c.owner === o)) continue;
            if (ownsCar(this.world, o, year)) {
              owner = o;
              break;
            }
          }
        }
        const pv = owner >= 0 ? carOf(this.world, owner, year) : null;
        if (pv) ty = pv.ty;
        {
          const nl = (LEN_M[ty] || 4.5) / 2;
          if (cars.some((c) => Math.abs(c.x - cx) < (c.len + nl) / 2 + 1.5 && Math.abs(c.y - cy) < (c.len + nl) / 2 + 1.5)) continue;
        }
        cars.push({ dest: owner >= 0 ? this.world.pop.work[owner] >= 0 ? this.world.pop.work[owner] : this.world.pop.school[owner] : -1, home: owner >= 0 ? this.world.pop.home[owner] : -1, id: pv ? pv.id : "CAR" + String(this.n).padStart(4, "0"), owner, ty, x: cx, y: cy, d, v: 0, len: (LEN_M[ty] || 4.5) / 2, color: pv ? pv.color : (hh >>> 7) % CAR_COLORS.length, driver: owner >= 0 ? owner : this.world && this.world.pop ? (hh >>> 3) % this.world.pop.n : -1, wait: 0, horiz: d % 2 === 0, dir: d === 0 || d === 1 ? 1 : -1, era: eraOfYear(year), stopped: false });
        break;
      }
    }
    move(c, dt, clock, peds, trains, cars) {
      const ri = this.ri, W2 = ri.W, H4 = ri.H, cl = this.cl, d = c.d, sgn = d === 0 || d === 1 ? 1 : -1, horiz = d % 2 === 0;
      const pos = horiz ? c.x : c.y, front = pos + sgn * c.len / 2;
      const ti = Math.floor(front);
      const cx = Math.floor(c.x), cy = Math.floor(c.y);
      const k0 = cx + cy * W2;
      const thick = ri.thick[k0] || 1;
      let vmax = VMAX[Math.min(4, thick)] || 3;
      let limit = vmax;
      let why = "";
      const consider = (s, w) => {
        if (s <= 0.12 + 0.01 || true) {
          const vv = s <= 0.12 ? 0 : Math.sqrt(2 * ACC * (s - 0.12));
          if (vv < limit) why = w || "?";
        }
        const v = s <= 0.12 ? 0 : Math.sqrt(2 * ACC * (s - 0.12));
        if (v < limit) limit = v;
      };
      for (let i = 0; i <= 4; i++) {
        const tp = ti + sgn * i;
        const tx = horiz ? tp : cx, ty = horiz ? cy : tp;
        if (tx < 0 || ty < 0 || tx >= W2 || ty >= H4) {
          c.dead = true;
          return;
        }
        const k = tx + ty * W2;
        const near2 = sgn > 0 ? tp : tp + 1, far = sgn > 0 ? tp + 1 : tp;
        const sNear = (near2 - front) * sgn, sFar = (far - front) * sgn;
        if (!ri.drv[k]) {
          if (sFar >= -0.01) {
            consider(Math.max(0, sNear), "nodrv");
            if (sNear < 0.25) c.dead = true;
          }
          break;
        }
        const g = this.map.ground[k];
        if (cl.stop[k] >> d & 1 && sFar > 0.02 && i <= 3) {
          const ci = cl.stopCl[k];
          const cc = ci >= 0 ? cl.list[ci] : null;
          if (cc) {
            const st3 = signalAt(cc, clock, horiz ? AX.H : AX.V);
            const dist2 = sFar;
            if (st3 === "R" || st3 === "Y" && dist2 > 0.8 + c.v * c.v / (2 * ACC) * 0.6 || st3 === "N" && this.junctionBusy(cc, c, cars)) consider(dist2, "sig" + st3);
          }
        }
        if (cl.cwk[k] && sFar > -0.2 && this.pedIn(peds, tx, ty, 0.35)) consider(Math.max(0, sNear - 0.1), "cw");
        if (i <= 2 && this.pedIn(peds, tx, ty, 0.1, c)) consider(Math.max(0, sNear - 0.1), "ped");
        if (g === T.CROSSING && sFar > 0.02 && trains.some((q) => Math.abs(q.x - (tx + 0.5)) < 9 && Math.abs(q.y - (ty + 0.5)) < 9)) consider(Math.max(0, sNear - 0.2), "rail");
        if (ri.axis[k] !== AX.J && i >= 1 && !canEnter(ri, tx, ty, d) && sNear >= -0.02) {
          if (!this.canTurnBefore(c, ti, i)) {
            consider(Math.max(0, sNear), "noenter");
            if (sNear < 0.25) c.dead = true;
          }
          break;
        }
      }
      for (const o of this.extra ? cars.concat(this.extra) : cars) {
        if (o === c || o.dead || o.d !== d) continue;
        const op = horiz ? o.x : o.y, oc = horiz ? o.y : o.x, cc = horiz ? c.y : c.x;
        if (Math.abs(oc - cc) > 0.6) continue;
        const ahead = (op - pos) * sgn;
        if (ahead <= 0) continue;
        const gap = ahead - (o.len + c.len) / 2 - 0.35;
        if (gap < 6) consider(Math.max(0, gap + 0.12), "car");
      }
      c.v = c.v < limit ? Math.min(limit, c.v + ACC * dt) : Math.max(limit, c.v - ACC * 1.6 * dt);
      c.stopped = c.v < 0.05;
      c.why = why;
      c.wait = c.stopped ? c.wait + dt : 0;
      const step2 = c.v * dt;
      if (horiz) c.x += sgn * step2;
      else c.y += sgn * step2;
      const nx = Math.floor(c.x), ny = Math.floor(c.y), nk = nx + ny * W2;
      if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) {
        c.dead = true;
        return;
      }
      if (nk !== c.k) {
        c.k = nk;
        if (ri.axis[nk] === AX.J) this.chooseTurn(c, nx, ny, cars);
      }
      const off = isNarrowTwoWay(ri, nk) ? d === 0 || d === 3 ? -0.22 : 0.22 : 0;
      if (horiz) c.y += (ny + 0.5 + off - c.y) * Math.min(1, dt * 8);
      else c.x += (nx + 0.5 + off - c.x) * Math.min(1, dt * 8);
      if (c.wait > 60) c.dead = true;
      c.horiz = c.d % 2 === 0;
      c.dir = c.d === 0 || c.d === 1 ? 1 : -1;
    }
    junctionBusy(cc, me, cars) {
      for (const o of cars) {
        if (o === me || o.dead) continue;
        if (o.d % 2 === me.d % 2) continue;
        const k = Math.floor(o.x) + Math.floor(o.y) * this.ri.W;
        if (this.cl.id[k] === cc.id) return me.wait < 4;
      }
      return false;
    }
    canTurnBefore() {
      return true;
    }
    pedIn(peds, tx, ty, margin, car) {
      for (const p of peds) {
        if (p.x > tx - margin && p.x < tx + 1 + margin && p.y > ty - margin && p.y < ty + 1 + margin) return true;
      }
      return false;
    }
    chooseTurn(c, x, y, cars) {
      const ri = this.ri, W2 = ri.W;
      const h = hash2(c.id.length * 977 + +c.id.slice(3) * 13 + x * 3 + y * 7 + (c.v * 10 | 0), 5551) >>> 0;
      const opts = [];
      for (const dd of [c.d, (c.d + 1) % 4, (c.d + 3) % 4]) {
        const nx = x + DX[dd], ny = y + DY[dd];
        if (nx < 0 || ny < 0 || nx >= W2 || ny >= ri.H) continue;
        const nk = nx + ny * W2;
        if (!ri.drv[nk]) continue;
        if (ri.axis[nk] !== AX.J && !canEnter(ri, nx, ny, dd)) continue;
        if (dd !== c.d && ri.axis[nk] !== AX.J && cars && cars.some((o) => o !== c && !o.dead && o.d === dd && Math.abs(o.x - (nx + 0.5)) < o.len + c.len + 1 && Math.abs(o.y - (ny + 0.5)) < o.len + c.len + 1)) continue;
        opts.push(dd);
      }
      if (!opts.length) {
        c.dead = true;
        return;
      }
      if (opts.length === 1) {
        c.d = opts[0];
        return;
      }
      const r = h % 100;
      const straight = opts.includes(c.d);
      if (straight && r < 70) {
        c.d = c.d;
        return;
      }
      const turns = opts.filter((o) => o !== c.d);
      c.d = turns[h % turns.length];
    }
  };

