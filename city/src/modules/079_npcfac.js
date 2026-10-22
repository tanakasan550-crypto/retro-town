  // src/npcfac.js
  var cacheB = /* @__PURE__ */ new WeakMap();
  var cacheM = /* @__PURE__ */ new WeakMap();
  var byType = (map2, t) => {
    let c = cacheB.get(map2);
    if (!c) cacheB.set(map2, c = {});
    return c[t] || (c[t] = map2.buildings.filter((b) => b.type === t));
  };
  var nearest = (arr, b) => {
    let best = null, bd = 1e9;
    for (const q of arr) {
      const d = Math.abs(q.doorX - b.doorX) + Math.abs(q.doorY - b.doorY);
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
    return best;
  };
  var pickOwner = (world, year, seed) => {
    const p = world.pop;
    for (let k = 0; k < 300; k++) {
      const i = (hash2(seed, k * 7 + 3) >>> 0) % p.n;
      if (!p.gone[i] && p.home[i] >= 0 && ownsCar(world, i, year)) return i;
    }
    return -1;
  };
  var npcPump = (b) => ({ x: b.x + 2.2, y: b.y + 2.9 });
  var busy = (h) => h >= 7 && h < 9 ? 0.7 : h >= 11 && h < 14 ? 0.45 : h >= 16 && h < 20 ? 0.75 : h >= 6 && h < 22 ? 0.25 : 0;
  function facilityScene(world, year, minuteOfDay, hx2, hy, radius = 34) {
    const map2 = world.map, out = { cars: [], people: [] };
    const h = minuteOfDay / 60, hr = Math.floor(h), slot = Math.floor(minuteOfDay / 20);
    for (const b of byType(map2, "gasstation")) {
      if (Math.abs(b.x - hx2) > radius || Math.abs(b.y - hy) > radius * 0.8) continue;
      if (world.M !== void 0 && false) continue;
      if (hash2(b.idx * 31 + slot, 9001) % 100 >= busy(h) * 55) continue;
      const id = pickOwner(world, year, b.idx * 977 + slot);
      if (id < 0) continue;
      const p = npcPump(b);
      out.cars.push({ ci: carOf(world, id, year), pad: { px: p.x - 0.5, py: p.y - 0.5, ld: 0 }, fuel: true, owner: id });
      out.people.push({ id, x: p.x + 1.7, y: p.y - 0.9, dx: -1, dy: 0, act: "fuel" });
    }
    for (const t of ["cardealer", "usedcar"]) for (const b of byType(map2, t)) {
      if (Math.abs(b.x - hx2) > radius || Math.abs(b.y - hy) > radius * 0.8) continue;
      const open2 = h >= 10 && h < 19;
      if (!open2) continue;
      const n2 = 1 + (hash2(b.idx, slot) % 3 === 0 ? 1 : 0) + (hr >= 12 && hr < 17 ? 0 : 0);
      for (let k = 0; k < n2; k++) {
        const i = (hash2(b.idx * 13 + slot, 30 + k) >>> 0) % world.pop.n;
        const p = world.pop;
        if (p.gone[i] || p.home[i] < 0 || ageYears(p, i, world.M) < 18) continue;
        out.people.push({ id: i, x: b.x + 1.5 + hash2(i, 5) % 100 / 100 * (b.w - 3), y: b.y + b.h + 0.7 + k % 2 * 0.6, dx: 0, dy: -1, act: "browse" });
      }
    }
    return out;
  }
  var dayFrac = [0.9, 0.9, 1, 1, 1.05, 1.05, 1.1, 1.15, 1, 1, 1.05, 1.2];
  function monthlyFacility(world, year, month0) {
    let c = cacheM.get(world.map);
    if (!c) cacheM.set(world.map, c = /* @__PURE__ */ new Map());
    const key = year * 12 + month0;
    const hit2 = c.get(key);
    if (hit2) return hit2;
    const map2 = world.map, p = world.pop;
    const gas = byType(map2, "gasstation"), dealers = byType(map2, "cardealer"), used = byType(map2, "usedcar");
    const clothes = [...byType(map2, "clothes"), ...byType(map2, "mall"), ...byType(map2, "dept")], konbini = byType(map2, "konbini"), supers = byType(map2, "super");
    const R5 = { gas: /* @__PURE__ */ new Map(), dealer: /* @__PURE__ */ new Map(), clothes: /* @__PURE__ */ new Map(), konbini: /* @__PURE__ */ new Map(), super: /* @__PURE__ */ new Map(), owners: 0, liters: 0, carsSold: 0, newSold: 0, usedSold: 0, clothesSold: 0 };
    const add = (m, b, v) => m.set(b.idx, (m.get(b.idx) || 0) + v);
    const econ = year < 1995 ? 10 : year < 2010 ? 12 : 15;
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i] || p.home[i] < 0) continue;
      const hb = map2.buildings[p.home[i]];
      const age = ageYears(p, i, world.M);
      if (ownsCar(world, i, year)) {
        R5.owners++;
        const km = 350 + hash2(i, 61) % 500;
        const L2 = km * dayFrac[month0] / econ;
        R5.liters += L2;
        if (gas.length) add(R5.gas, nearest(gas, hb), L2);
        if (hash2(i * 7 + year * 13 + month0, 77) % 96 === 0) {
          R5.carsSold++;
          const isNew = hash2(i, year + 5) % 100 < (year < 1995 ? 55 : 42);
          if (isNew) {
            R5.newSold++;
            if (dealers.length) add(R5.dealer, nearest(dealers, hb), 1);
          } else {
            R5.usedSold++;
            if (used.length) add(R5.dealer, nearest(used, hb), 1);
          }
        }
      }
      if (age >= 3 && hash2(i * 3 + year * 11 + month0, 91) % 4 === 0) {
        R5.clothesSold++;
        if (clothes.length) add(R5.clothes, nearest(clothes, hb), 1);
      }
      const dst = konbini.length && hash2(i, 12) % 3 === 0 ? nearest(konbini, hb) : null;
      if (dst) add(R5.konbini, dst, 20 + hash2(i, 8) % 12);
      if (supers.length && age >= 16) add(R5.super, nearest(supers, hb), 6 + hash2(i, 14) % 4);
    }
    c.set(key, R5);
    if (c.size > 60) c.delete(c.keys().next().value);
    return R5;
  }
  var usageOf = (world, year, month0, b) => {
    const R5 = monthlyFacility(world, year, month0);
    const t = b.type;
    const v = t === "gasstation" ? R5.gas.get(b.idx) : t === "cardealer" || t === "usedcar" ? R5.dealer.get(b.idx) : t === "clothes" || t === "mall" || t === "dept" ? R5.clothes.get(b.idx) : t === "konbini" ? R5.konbini.get(b.idx) : t === "super" ? R5.super.get(b.idx) : void 0;
    return v || 0;
  };

