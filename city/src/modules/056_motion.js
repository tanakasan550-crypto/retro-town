  // src/motion.js
  function parkHereAt(g, b) {
    const c = curCar(g.hero);
    if (!c) return;
    c.parked = { x: b.doorX + 0.5 + 1.6, y: b.doorY + 1.1, d: 0, b: b.idx, where: b.name + "\u306E\u524D" };
  }
  var R3 = 0.27;
  function heroSpeed(g) {
    const nd = g.world.pop.needs[g.hero.id];
    const a = g.age();
    let v = 4.4;
    if (a < 9) v = 3.4;
    else if (a > 72) v = 3.1;
    else if (a > 60) v = 3.8;
    if (nd & NEED.WHEEL) v = Math.min(v, 3.7);
    if (nd & NEED.CANE) v = Math.min(v, 3.3);
    return v * speedMult(g);
  }
  var interiorCache = /* @__PURE__ */ new Map();
  function interiorOf(g, bIdx, floor) {
    const b0 = g.world.map.buildings[bIdx];
    const k = bIdx + ":" + floor + ":e" + eraBucket(g.year()) + (bigKind(b0) === "condo" ? ":" + g.S.M + ":" + (g.hero.homeB === bIdx ? 1 : 0) : "");
    let r = interiorCache.get(k);
    if (!r) {
      const b = b0;
      const I2 = buildInterior(b, floor, g);
      r = { I: I2, solid: interiorSolid(I2) };
      interiorCache.set(k, r);
    }
    return r;
  }
  function clearInteriorCache() {
    interiorCache.clear();
  }
  bindInterior((g) => interiorOf(g, g.S.loc.b, g.S.loc.floor).I);
  function blockedOut(map2, x, y) {
    const tx = Math.floor(x), ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= map2.W || ty >= map2.H) return true;
    return map2.solid[tx + ty * map2.W] === 1;
  }
  function boxFreeOut(map2, x, y) {
    return !(blockedOut(map2, x - R3, y - R3) || blockedOut(map2, x + R3, y - R3) || blockedOut(map2, x - R3, y + R3 * 0.2) || blockedOut(map2, x + R3, y + R3 * 0.2));
  }
  function blockedIn(I2, s, x, y) {
    const tx = Math.floor(x), ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= I2.W || ty >= I2.H) return true;
    return s[tx + ty * I2.W] === 1;
  }
  function boxFreeIn(I2, s, x, y) {
    return !(blockedIn(I2, s, x - R3, y - R3 * 0.3) || blockedIn(I2, s, x + R3, y - R3 * 0.3) || blockedIn(I2, s, x - R3, y + R3 * 0.3) || blockedIn(I2, s, x + R3, y + R3 * 0.3));
  }
  function moveHero(g, ix, iy, dt, run = false, mag = 1) {
    const L2 = g.S.loc;
    const res = { moved: false };
    if (!g.canWalk()) return res;
    if (L2.tr && L2.k === "in") {
      const tr = tickTransit(g, dt, !!(ix || iy));
      return tr || res;
    }
    if (ix === 0 && iy === 0) return res;
    const len = Math.hypot(ix, iy);
    ix /= len;
    iy /= len;
    const sp = heroSpeed(g) * (run ? 1.35 : 1) * dt * (globalThis.__NAVSPEED || 1) * (mag == null ? 1 : Math.max(0.35, Math.min(1, mag)));
    if (Math.abs(ix) > Math.abs(iy)) L2.f = ix > 0 ? "r" : "l";
    else L2.f = iy > 0 ? "d" : "u";
    const nx = L2.x + ix * sp, ny = L2.y + iy * sp;
    if (L2.k === "out") {
      const map2 = g.world.map;
      const ride0 = g.hero.veh && g.hero.veh.ride;
      const isCar = ride0 === "car" || ride0 === "test";
      if (L2.lv) {
        const lr = stepLevel(g, L2, ix, iy, sp, isCar ? "car" : ride0);
        if (lr) {
          res.moved = lr.moved;
          if (res.moved && ride0 === "car") {
            const dr = driveTick(g, sp);
            if (dr) {
              res.msg = dr.msg;
              res.dismounted = true;
            }
          }
          return res;
        }
      }
      if (leashBlock(g, nx, ny)) {
        res.msg = LEASH_MSG;
        return res;
      }
      if (boxFreeOut(map2, nx, L2.y)) {
        L2.x = nx;
        res.moved = true;
      }
      if (boxFreeOut(map2, L2.x, ny)) {
        L2.y = ny;
        res.moved = true;
      }
      if (res.moved) tryBoard(g, L2, ix, iy, isCar ? "car" : ride0);
      if (res.moved && g.hero.veh && g.hero.veh.ride === "car") {
        const dr = driveTick(g, sp);
        if (dr) {
          res.msg = dr.msg;
          res.dismounted = true;
        }
      }
      if (iy < 0) {
        const tx = Math.floor(L2.x), ty = Math.floor(L2.y - R3 - 0.16);
        const bi = tx >= 0 && ty >= 0 && tx < map2.W && ty < map2.H ? map2.bid[tx + ty * map2.W] : -1;
        if (bi >= 0) {
          const b = map2.buildings[bi];
          if (b.doorX === tx && b.doorY - 1 === ty) {
            const r = tryEnter(g, bi);
            if (r.ok) res.entered = bi;
            else if (r.directory != null) res.directory = r.directory;
            else res.msg = r.msg;
          }
        }
      }
    } else {
      const { I: I2, solid } = interiorOf(g, L2.b, L2.floor);
      const stepOk = (x, y) => boxFreeIn(I2, solid, x, y) || y >= I2.H - 1.5 && Math.abs(x - (I2.door.x + 0.5)) < 0.7 && y < I2.H + 0.2;
      if (stepOk(nx, L2.y)) {
        L2.x = nx;
        res.moved = true;
      }
      if (stepOk(L2.x, ny)) {
        L2.y = ny;
        res.moved = true;
      }
      if (L2.y >= I2.H - 0.6 && Math.abs(L2.x - (I2.door.x + 0.5)) < 0.8) {
        if (isUnitFloor(L2.floor)) {
          leaveUnit(g);
          res.floor = L2.floor;
          return res;
        }
        exitBuilding(g);
        res.exited = true;
        return res;
      }
      if (L2.sl) {
        const q = L2.sl;
        if (q.f !== L2.floor || q.b !== L2.b || Math.hypot(L2.x - q.x, L2.y - q.y) > 1.9) L2.sl = null;
      }
      for (const o of I2.objs) if (!L2.sl && o.act === "stairs" && Math.floor(L2.x) === o.x && Math.floor(L2.y) === o.y) {
        const b = g.world.map.buildings[L2.b];
        const nd = g.world.pop.needs[g.hero.id];
        if (o.gate && !bathGateOk(g, o.gate)) {
          res.msg = o.gate === "K" ? "\u5BB6\u65CF\u98A8\u5442(\u8CB8\u5207)\u306F12\u6B73\u672A\u6E80\u306E\u304B\u305F\u306F\u4FDD\u8B77\u8005\u540C\u4F34\u304C\u5FC5\u8981\u3067\u3059(\u3053\u306E\u7248\u3067\u306F\u672A\u5BFE\u5FDC)" : o.gate === "M" ? "\u3053\u3053\u306F\u7537\u6E6F\u3067\u3059\u3002\u3042\u306A\u305F\u306E\u8A2D\u5B9A(\u6027\u5225)\u3067\u306F\u5973\u6E6F\u306E\u307B\u3046\u3078\u3069\u3046\u305E" : "\u3053\u3053\u306F\u5973\u6E6F\u3067\u3059\u3002\u3042\u306A\u305F\u306E\u8A2D\u5B9A(\u6027\u5225)\u3067\u306F\u7537\u6E6F\u306E\u307B\u3046\u3078\u3069\u3046\u305E";
          L2.y += 0.6;
        } else if (nd & NEED.WHEEL && !hasElevator(b)) {
          res.msg = "\u968E\u6BB5\u3057\u304B\u306A\u3044\u305F\u3081\u3001\u8ECA\u3044\u3059\u3067\u306F\u4E0A\u304C\u308C\u307E\u305B\u3093(\u3053\u306E\u5EFA\u7269\u306B\u306F\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u304C\u3042\u308A\u307E\u305B\u3093)";
          L2.y += 0.6;
        } else {
          changeFloor(g, o.to, o.t === "stairs_up" ? "down" : "up", o.via);
          res.floor = o.to;
        }
        break;
      }
      if (!L2.sl && !L2.tr) {
        for (const o of I2.objs) if (o.t === "esc" && o.enter && Math.floor(L2.x) === o.enter.x && Math.floor(L2.y) === o.enter.y && Math.abs(L2.x - (o.enter.x + 0.5)) < 0.45 && (o.dir === "up" && iy < -0.3 || o.dir === "down" && iy > 0.3)) {
          const er = startEsc(g, o);
          if (er.msg) res.msg = er.msg;
          if (er.ok) res.moved = true;
          else {
            L2.y += o.dir === "up" ? 0.5 : -0.5;
          }
          break;
        }
      }
    }
    return res;
  }
  var bathGateOk = (g, side) => {
    if (side === "K") return g.age() >= 12;
    const sx = g.hero.ident && g.hero.ident.sex || "u";
    return sx === "m" ? side === "M" : sx === "f" ? side === "F" : true;
  };
  function freeNear(I2, s, x, y) {
    const ok = (px2, py) => boxFreeIn(I2, s, px2, py) && px2 > 0.4 && py > 0.4 && px2 < I2.W - 0.4 && py < I2.H - 0.4;
    if (ok(x, y)) return [x, y];
    for (let r = 1; r < 8; r++) for (let dy = r; dy >= -r; dy--) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const px2 = Math.floor(x) + dx + 0.5, py = Math.floor(y) + dy + 0.5;
      if (ok(px2, py)) return [px2, py];
    }
    return [x, y];
  }
  function changeFloor(g, to, from, via) {
    const L2 = g.S.loc;
    const { I: I2, solid: sol0 } = interiorOf(g, L2.b, to);
    const st3 = I2.stairs.find((s) => s.to === L2.floor && (!via || s.via === via)) || I2.stairs.find((s) => s.to === L2.floor) || I2.stairs[0];
    L2.floor = to;
    if (st3) {
      [L2.x, L2.y] = freeNear(I2, sol0, st3.x + 0.5, st3.y + 1.6);
      L2.sl = { f: to, b: L2.b, x: st3.x + 0.5, y: st3.y + 0.5 };
    } else {
      L2.x = I2.W / 2;
      L2.y = I2.H - 2;
    }
    L2.f = "d";
  }
  function tryEnter(g, bIdx, direct = false) {
    const b = g.world.map.buildings[bIdx];
    const bt = BTYPES[b.type];
    if (b.type === "gasstation") return { ok: false, gas: bIdx, msg: "" };
    {
      const rd2 = g.hero.veh && (g.hero.veh.ride === "car" || g.hero.veh.ride === "test");
      if (b.type === "cardealer" && rd2) return { ok: false, dealer: bIdx, msg: "" };
      if (b.type === "usedcar" && rd2) return { ok: false, used: bIdx, msg: "" };
    }
    if (!direct && b.tenants && b.tenants.length) return { ok: false, directory: bIdx, msg: "" };
    if (!bt.enter) return { ok: false, msg: `${b.name}\u306F\u7ACB\u3061\u5165\u308C\u307E\u305B\u3093(\u5916\u304B\u3089\u773A\u3081\u308B\u3060\u3051\u3067\u3059)` };
    if (!bt.interior && !bigKind(b)) return { ok: false, msg: `${b.name}\u306E\u5185\u90E8\u306F\u307E\u3060\u4F5C\u3089\u308C\u3066\u3044\u307E\u305B\u3093(\u672A\u5B9F\u88C5)` };
    {
      const mb = enterBlock(g, b, b.type);
      if (mb) return { ok: false, msg: mb };
    }
    const chk = isOpenFor(g, b);
    if (!chk.ok) return chk;
    if (g.hero.veh) {
      if (g.hero.veh.ride === "car") {
        parkHereAt(g, b);
      } else if (g.hero.veh.ride === "moto") {
        parkMoto(g);
      } else if (g.hero.veh.ride === "bicycle") {
        parkBike(g);
      }
      g.hero.veh.ride = null;
    }
    const L2 = g.S.loc;
    delete L2.tr;
    delete L2.z;
    L2.k = "in";
    L2.b = bIdx;
    L2.floor = 0;
    const { I: I2 } = interiorOf(g, bIdx, 0);
    L2.x = I2.door.x + 0.5;
    L2.y = I2.H - 1.6;
    L2.f = "u";
    g.S.stats.enters = (g.S.stats.enters || 0) + 1;
    try {
      inviteIfAny(g, bIdx);
    } catch (_) {
    }
    return { ok: true };
  }
  function enterUnit(g, lv, pos) {
    const L2 = g.S.loc;
    if (L2.k !== "in") return false;
    L2.floor = unitCode(lv, pos);
    const { I: I2 } = interiorOf(g, L2.b, L2.floor);
    L2.x = I2.door.x + 0.5;
    L2.y = I2.H - 1.6;
    L2.f = "u";
    L2.sl = null;
    return true;
  }
  function leaveUnit(g) {
    const L2 = g.S.loc;
    if (!isUnitFloor(L2.floor)) return;
    const { lv, pos } = decodeUnit(L2.floor);
    L2.floor = lv;
    L2.x = 2 + pos * 3 + 1.5;
    L2.y = 6.4;
    L2.f = "d";
    L2.sl = { f: lv, b: L2.b, x: L2.x, y: 5.5 };
  }
  function exitBuilding(g) {
    const L2 = g.S.loc;
    if (L2.k !== "in") return;
    delete L2.tr;
    delete L2.z;
    const b = g.world.map.buildings[L2.b];
    L2.k = "out";
    L2.x = b.doorX + 0.5;
    L2.y = b.doorY + 0.6;
    L2.f = "d";
    delete L2.b;
    delete L2.floor;
  }
  function targetsFor(g, crowdList) {
    const L2 = g.S.loc;
    const out = [];
    const fx = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] }[L2.f] || [0, 1];
    const score = (px2, py, maxd) => {
      const dx = px2 - L2.x, dy = py - L2.y;
      const d = Math.hypot(dx, dy);
      if (d > maxd) return null;
      const dot = d < 0.01 ? 1 : (dx * fx[0] + dy * fx[1]) / d;
      if (dot < 0.15 && d > 0.8) return null;
      return d - dot * 0.5;
    };
    if (L2.k === "out") {
      const map2 = g.world.map;
      for (const b of map2.buildings) {
        if (b.tenant) continue;
        {
          const bt0 = BTYPES[b.type];
          if (bt0 && !bt0.enter && b.type !== "gasstation") continue;
        }
        if (Math.abs(b.doorX - L2.x) > 2 || Math.abs(b.doorY - L2.y) > 2) continue;
        const s = score(b.doorX + 0.5, b.doorY + 0.5, 1.6);
        if (s != null) out.push({ kind: "door", b: b.idx, s: s - 0.3, label: `${b.name}\u306B\u5165\u308B` });
      }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const tx = Math.floor(L2.x) + dx, ty = Math.floor(L2.y) + dy;
        if (tx < 0 || ty < 0 || tx >= map2.W || ty >= map2.H) continue;
        const d = map2.deco[tx + ty * map2.W];
        if (d === 2 || d === 3) {
          const s = score(tx + 0.5, ty + 0.5, 1.6);
          if (s != null) out.push({ kind: "deco", d, x: tx, y: ty, s, label: d === 2 ? "\u81EA\u52D5\u8CA9\u58F2\u6A5F" : "\u30D9\u30F3\u30C1" });
        }
      }
      for (const w of crowdList || []) {
        const s = score(w.x, w.y, 1.7);
        if (s != null) out.push({ kind: "npc", id: w.id, s: s - 0.2, label: g.nameOf(w.id) });
      }
    } else {
      const { I: I2 } = interiorOf(g, L2.b, L2.floor);
      for (const o of I2.objs) {
        if (!o.act || o.act === "stairs") continue;
        const s = score(o.w ? Math.max(o.x + 0.5, Math.min(L2.x, o.x + o.w - 0.5)) : o.x + 0.5, o.h ? Math.max(o.y + 0.5, Math.min(L2.y, o.y + o.h - 0.5)) : o.y + 0.5, 1.7);
        if (s != null) out.push({ kind: "obj", o, s, label: o.label || o.t });
      }
      for (const w of crowdList || []) {
        const s = score(w.x, w.y, 1.7);
        if (s != null) out.push({ kind: "npc", id: w.id, s: s - 0.2, label: g.nameOf(w.id), role: w.role });
      }
    }
    out.sort((a, b) => a.s - b.s);
    return out;
  }

