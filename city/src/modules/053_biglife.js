  // src/biglife.js
  function bigActions(g, o, b, push) {
    switch (o.act) {
      case "lift":
        push("lift_call", "\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u3092\u547C\u3076(\u4E57\u3063\u3066\u884C\u304D\u5148\u306E\u968E\u3092\u9078\u3073\u307E\u3059)");
        break;
      case "esc":
        push("esc_ride", `${o.label}\u306B\u4E57\u308B`);
        break;
      case "info":
        push("floor_guide", "\u30D5\u30ED\u30A2\u30AC\u30A4\u30C9\u3092\u898B\u308B(\u968E\u3054\u3068\u306E\u58F2\u5834\u30FB\u30C6\u30CA\u30F3\u30C8)");
        break;
      case "toilet":
        push("toilet", "\u5316\u7CA7\u5BA4\u3092\u4F7F\u3046(5\u5206)");
        break;
      case "vend":
        push("vending", "\u98F2\u307F\u7269\u3092\u8CB7\u3046");
        break;
      case "mail":
        push("mail", "\u30DD\u30B9\u30C8\u3092\u78BA\u8A8D\u3059\u308B");
        break;
      case "parcel":
        push("parcel", "\u5B85\u914D\u30DC\u30C3\u30AF\u30B9\u3092\u78BA\u8A8D\u3059\u308B");
        break;
      case "manager":
        push("manager_info", "\u7BA1\u7406\u4EBA\u3055\u3093\u306B\u8A71\u3092\u805E\u304F(\u5EFA\u7269\u306E\u6982\u8981\u30FB\u7A7A\u5BA4)");
        push("housing", "\u4F4F\u307E\u3044\u3092\u63A2\u3059(\u7A7A\u5BA4\u306E\u8CC3\u8CB8\u30FB\u8CFC\u5165)");
        break;
      case "trash":
        push("trash", "\u3054\u307F\u306E\u51FA\u3057\u65B9\u30FB\u53CE\u96C6\u65E5\u3092\u78BA\u8A8D\u3059\u308B");
        break;
      case "bike":
        push("bike", "\u99D0\u8F2A\u5834\u3092\u78BA\u8A8D\u3059\u308B");
        break;
      case "park":
        push("park_info", "\u99D0\u8ECA\u533A\u753B\u3092\u78BA\u8A8D\u3059\u308B");
        break;
      case "unit": {
        if (o.mine) {
          push("unit_enter", `${o.room}\u53F7\u5BA4(\u81EA\u5206\u306E\u90E8\u5C4B)\u306B\u5165\u308B`);
          break;
        }
        const r = registry(g, b.idx);
        const u = r.units[(o.lv - 1) * r.plan.perFloor + o.pos];
        if (!u || u.root < 0) {
          push("unit_info", `${o.room}\u53F7\u5BA4\u306F\u7A7A\u5BA4\u3067\u3059(\u8A73\u7D30\u3092\u898B\u308B)`);
          push("housing", "\u4F4F\u307E\u3044\u3092\u63A2\u3059(\u7A7A\u5BA4\u306E\u8CC3\u8CB8\u30FB\u8CFC\u5165)");
          break;
        }
        const friend = u.hh.some((i) => g.hero.rel[i] && g.hero.rel[i].aff >= 30);
        if (friend) push("unit_visit", `${o.room}\u53F7\u5BA4(${nameplate(g, u)})\u3092\u8A2A\u306D\u308B`);
        push("unit_knock", "\u30A4\u30F3\u30BF\u30FC\u30DB\u30F3\u3092\u62BC\u3059");
        break;
      }
    }
  }
  var DOW = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];
  function bigRun(g, kind, tg, r) {
    const L2 = g.S.loc, b = g.world.map.buildings[L2.b], o = tg && tg.o;
    switch (kind) {
      case "lift_call":
        r.msg = callLift(g, o).msg;
        return true;
      case "esc_ride": {
        const e = startEsc(g, o);
        r.msg = e.msg;
        return true;
      }
      case "floor_guide":
        r.ui = "guide";
        r.msg = floorGuide(b);
        return true;
      case "toilet":
        g.advance(5);
        r.msg = "\u5316\u7CA7\u5BA4\u3092\u5229\u7528\u3057\u307E\u3057\u305F\u3002" + g.chg({ mood: 1 });
        return true;
      case "mail":
      case "parcel": {
        const me = unitOfPerson(g, g.hero.id);
        const mine = me && me.b === b.idx;
        if (!mine) {
          r.msg = kind === "mail" ? "\u90F5\u4FBF\u53D7\u3051\u306F\u4F4F\u4EBA\u3060\u3051\u304C\u958B\u3051\u3089\u308C\u307E\u3059\u3002" : "\u5B85\u914D\u30DC\u30C3\u30AF\u30B9\u306F\u4F4F\u4EBA\u3060\u3051\u304C\u4F7F\u3048\u307E\u3059\u3002";
          return true;
        }
        const d = g.date();
        const h = hash2(d.y * 400 + d.m * 31 + d.d, g.hero.id + (kind === "mail" ? 1 : 2)) % 10;
        r.msg = kind === "mail" ? h < 3 ? "\u90F5\u4FBF\u53D7\u3051\u306B\u30C1\u30E9\u30B7\u304C\u6570\u679A\u5165\u3063\u3066\u3044\u307E\u3057\u305F\u3002" : h < 5 ? "\u624B\u7D19\u304C1\u901A\u5C4A\u3044\u3066\u3044\u307E\u3057\u305F\u3002" : "\u90F5\u4FBF\u53D7\u3051\u306F\u7A7A\u3067\u3057\u305F\u3002" : h < 3 ? "\u5B85\u914D\u30DC\u30C3\u30AF\u30B9\u306B\u8377\u7269\u304C\u5C4A\u3044\u3066\u3044\u307E\u3057\u305F\u3002" + g.chg({ mood: 2 }) : "\u5B85\u914D\u30DC\u30C3\u30AF\u30B9\u306B\u8377\u7269\u306F\u3042\u308A\u307E\u305B\u3093\u3002";
        return true;
      }
      case "manager_info": {
        const rg = registry(g, b.idx);
        const own = rg.units.filter((u) => u.owner === "resident" || u.owner === "hero").length;
        r.msg = `${b.name}
\u5168${rg.units.length}\u6238 / \u5165\u5C45${rg.households}\u4E16\u5E2F(\u4F4F\u4EBA${rg.residents}\u4EBA) / \u7A7A\u5BA4${rg.vacant}\u6238
\u5206\u8B72\u306E\u81EA\u5DF1\u6240\u6709${own}\u6238\u30FB\u8CC3\u8CB8\u306E\u4F4F\u6238${rg.units.filter((u) => u.owner === "landlord").length}\u6238
\u7BA1\u7406\u4EBA: \u6E05\u6383\u30FB\u3054\u307F\u7F6E\u304D\u5834\u30FB\u5B85\u914D\u306E\u898B\u5B88\u308A\u3092\u3057\u3066\u3044\u307E\u3059\u3002`;
        return true;
      }
      case "trash": {
        const dow = g.date().dow;
        r.msg = `\u3054\u307F\u7F6E\u304D\u5834: \u71C3\u3048\u308B\u3054\u307F\u306F\u6708\u30FB\u6728\u3001\u8CC7\u6E90\u306F\u6C34\u66DC\u3002\u4ECA\u65E5\u306F${DOW[dow % 7]}\u66DC\u65E5\u3067\u3059\u3002`;
        return true;
      }
      case "bike": {
        const rg = registry(g, b.idx);
        r.msg = `\u99D0\u8F2A\u5834: \u7D04${Math.max(8, Math.round(rg.households * 1.2))}\u53F0\u5206\u3002\u4F4F\u4EBA\u304C\u81EA\u8EE2\u8ECA\u3092\u505C\u3081\u3066\u3044\u307E\u3059\u3002`;
        return true;
      }
      case "park_info": {
        r.msg = `\u99D0\u8ECA\u533A\u753B ${o.no}\u756A\u3002` + (o.carOwner != null ? `${g.nameOf(o.carOwner)}\u3055\u3093\u306E\u8ECA\u304C\u505C\u307E\u3063\u3066\u3044\u307E\u3059\u3002` : "\u7A7A\u3044\u3066\u3044\u307E\u3059(\u4F4F\u4EBA\u306F\u6708\u984D\u3067\u501F\u308A\u3089\u308C\u307E\u3059)\u3002");
        return true;
      }
      case "unit_enter":
      case "unit_visit": {
        if (enterUnit(g, o.lv, o.pos)) {
          r.msg = kind === "unit_enter" ? "" : "\u304A\u3058\u3083\u307E\u3057\u307E\u3059\u3002";
          r.floor = true;
        }
        return true;
      }
      case "unit_knock": {
        const rg = registry(g, b.idx);
        const u = rg.units[(o.lv - 1) * rg.plan.perFloor + o.pos];
        const m = g.S.min;
        const dow = g.date().dow;
        const home = u && u.hh.find((i) => personActivity(g.world, i, m, dow).s === 0);
        r.msg = home != null ? `\u30A4\u30F3\u30BF\u30FC\u30DB\u30F3\u306B\u300C\u306F\u3044\u3001${nameplate(g, u).replace("\u5BB6", "")}\u3067\u3059\u300D\u3068\u5FDC\u7B54\u304C\u3042\u308A\u307E\u3057\u305F\u3002\u4F55\u304B\u3054\u7528\u3067\u3057\u305F\u304B\u2026\u3068\u805E\u304B\u308C\u3001\u4F1A\u91C8\u3057\u3066\u305D\u306E\u5834\u3092\u96E2\u308C\u307E\u3057\u305F\u3002` : "\u30A4\u30F3\u30BF\u30FC\u30DB\u30F3\u3092\u62BC\u3057\u307E\u3057\u305F\u304C\u3001\u5FDC\u7B54\u304C\u3042\u308A\u307E\u305B\u3093(\u7559\u5B88\u306E\u3088\u3046\u3067\u3059)\u3002";
        g.advance(2);
        return true;
      }
      case "unit_info": {
        const rg = registry(g, b.idx);
        const u = rg.units[(o.lv - 1) * rg.plan.perFloor + o.pos];
        r.msg = `${o.room}\u53F7\u5BA4: ${OWNER_LABEL[u ? u.owner : "developer"]}\u3002\u9593\u53D6\u308A\u306F\u5C45\u4F4F\u7528\u3067\u3001\u4F4F\u307E\u3044\u63A2\u3057\u306E\u7A93\u53E3\u304B\u3089\u5951\u7D04\u3067\u304D\u307E\u3059\u3002`;
        return true;
      }
    }
    return false;
  }
  var wp = (x, y, pause = 0, dir) => ({ x: x + 0.5, y: y + 0.5, pause, dir });
  function bigPeople(crowd, bIdx, I2, floor, res) {
    const g = crowd.g, w = g.world, p = w.pop, b = w.map.buildings[bIdx];
    const m = g.S.min;
    const dow = g.date().dow;
    const k = bigKind(b);
    if (k === "condo") return condoPeople(crowd, bIdx, I2, floor, res, m, dow);
    const lvN = I2.hi - I2.lo + 1;
    const ten = I2.tenants || [];
    const ok = (i) => i !== g.hero.id && !p.gone[i] && p.home[i] >= 0;
    const have = new Set(res.map((q) => q.id));
    const work = [];
    for (let s = 0; s < w.slots.b.length; s++) {
      if (w.slots.b[s] !== bIdx) continue;
      const i = w.slots.who[s];
      if (i < 0 || !ok(i) || have.has(i)) continue;
      const a = personActivity(w, i, m, dow);
      if (a.s === 2 && a.at === bIdx) work.push(i);
    }
    const mine = work.filter((i) => (hash2(i, 5) % lvN + lvN) % lvN === I2.lv - I2.lo);
    const open2 = m >= 9 * 60 && m < 20 * 60 + 30;
    if (I2.lv === 0 && I2.tenants) {
    }
    let ti = 0;
    const pickPart = (n2) => {
      for (let q = 0; q < 24; q++) {
        const i = hash2(bIdx * 131 + I2.lv * 17 + n2, 7311 + q) % p.n;
        if (!ok(i) || have.has(i)) continue;
        const ag = g.ageOf(i);
        if (ag < 18 || ag > 66) continue;
        return i;
      }
      return -1;
    };
    if (open2) for (const t of ten) {
      let id = mine[ti] ?? -1;
      if (id < 0) id = pickPart(t.i + 3);
      ti++;
      if (id < 0 || have.has(id)) continue;
      have.add(id);
      const x0 = t.x0, north = t.side === "N";
      const cx = north ? { x: x0 + 5, y: 4, d: "d" } : { x: x0 + 5, y: 14, d: "u" };
      if (t.style === "dine") res.push({ id, x: x0 + 4.5, y: (north ? 1 : 17) + 0.5, dir: north ? "d" : "u", role: "staff", act: "serve" });
      else res.push({ id, x: cx.x + 0.5, y: cx.y + 0.5, dir: cx.d, role: "staff", act: "register" });
    }
    if (I2.lv === 0 && open2) {
      const id = pickPart(91);
      if (id >= 0 && !have.has(id)) {
        have.add(id);
        res.push({ id, x: 22.5, y: 18.5, dir: "d", role: "staff", act: "info" });
      }
    }
    const cust = [];
    if (open2 && !I2.noCust) {
      for (let i = 0; i < p.n && cust.length < 14; i++) {
        if (!ok(i) || have.has(i)) continue;
        if (hash2(i, 31) % 5 !== 0) continue;
        if (crowd.strollTarget(i) !== bIdx) continue;
        const a = personActivity(w, i, m, dow);
        if (a.s !== 3) continue;
        if ((hash2(i, 6) % lvN + lvN) % lvN !== I2.lv - I2.lo) continue;
        cust.push(i);
      }
    }
    for (const id of cust) {
      have.add(id);
      if (!ten.length) {
        const sp = I2.seatSpots[hash2(id, 3) % Math.max(1, I2.seatSpots.length)] || { x: 20, y: 9 };
        res.push({ id, x: sp.x + 0.5, y: sp.y + 0.5, dir: "d", role: "customer" });
        continue;
      }
      const a = ten[hash2(id, 11) % ten.length], c = ten[hash2(id, 12) % ten.length];
      const leg = (t, dx) => {
        const north = t.side === "N", x = t.x0 + dx;
        return north ? [wp(20, 7), wp(x, 7), wp(x, 5), wp(x, 2, 2.4, "u"), wp(x, 5), wp(x, 7), wp(20, 7)] : [wp(20, 11), wp(x, 11), wp(x, 13), wp(x, 16, 2.4, "d"), wp(x, 13), wp(x, 11), wp(20, 11)];
      };
      const route = [...leg(a, 2), ...leg(c, 4)];
      if (a.style === "dine" && I2.seatSpots.length) {
        const sp = I2.seatSpots[hash2(id, 3) % I2.seatSpots.length];
        res.push({ id, x: sp.x + 0.5, y: sp.y + 0.5, dir: "d", role: "customer", act: "eat" });
        continue;
      }
      res.push({ id, x: 20.5, y: 9.5, dir: "d", role: "customer", wp: route, act: "shop", ph: hash2(id, 4) % 60 });
    }
    return res;
  }
  function condoPeople(crowd, bIdx, I2, floor, res, m, dow) {
    const g = crowd.g, w = g.world, p = w.pop, b = w.map.buildings[bIdx];
    const rg = registry(g, bIdx);
    const have = new Set(res.map((q) => q.id));
    const lifts = I2.lifts || [];
    const lx = lifts.length ? lifts[0].x + 1 : I2.W - 3;
    if (floor === 0 && m >= 8 * 60 && m < 17 * 60) {
      for (let s = 0; s < w.slots.b.length; s++) {
        if (w.slots.b[s] !== bIdx) continue;
        const i = w.slots.who[s];
        if (i < 0 || p.gone[i] || have.has(i) || i === g.hero.id) continue;
        have.add(i);
        res.push({ id: i, x: 3.5, y: 9.5, dir: "d", role: "staff", act: "manager" });
        break;
      }
    }
    for (const u of rg.units) {
      for (const i of u.hh) {
        if (i === g.hero.id || p.gone[i] || have.has(i)) continue;
        const a = personActivity(w, i, m, dow);
        if (a.s !== 1) continue;
        const out = a.to !== bIdx;
        const tt = a.t == null ? 0 : a.t;
        if (floor === u.lv && I2.corridor) {
          const dx = 2 + u.pos * 3 + 1.5;
          const ph = out ? tt / 0.2 : (tt - 0.8) / 0.2;
          if (ph < 0 || ph > 1) continue;
          const u2 = out ? ph : 1 - ph;
          const x = dx + (lx - dx) * u2;
          res.push({ id: i, x, y: 6.5 + i % 2 * 0.6, dir: lx >= dx ? out ? "r" : "l" : out ? "l" : "r", moving: true, role: "resident" });
          have.add(i);
        } else if (floor === 0 && I2.W) {
          const ph = out ? (tt - 0.2) / 0.2 : (tt - 0.6) / 0.2;
          if (ph < 0 || ph > 1) continue;
          const u2 = out ? ph : 1 - ph;
          const x = lx + ((I2.W >> 1) + 0.5 - lx) * u2, y = 3 + (I2.H - 3 - 3) * u2;
          res.push({ id: i, x, y, dir: "d", moving: true, role: "resident" });
          have.add(i);
        }
        if (res.length > 16) return res;
      }
    }
    return res;
  }
  function unitPeople(crowd, bIdx, I2, floor, res) {
    const g = crowd.g, w = g.world, p = w.pop;
    const m = g.S.min, dow = g.date().dow;
    const rg = registry(g, bIdx);
    const { lv, pos } = I2.unit;
    const u = rg.units[(lv - 1) * rg.plan.perFloor + pos];
    if (!u) return res;
    let si = 0;
    const sp = I2.staffSpots.length ? I2.staffSpots : [{ x: 5, y: 5 }];
    for (const i of u.hh) {
      if (i === g.hero.id || p.gone[i]) continue;
      if (personActivity(w, i, m, dow).s !== 0) continue;
      const s = sp[si++ % sp.length];
      res.push({ id: i, x: s.x + 0.5, y: s.y + 0.5, dir: "d", role: u.hero ? "family" : "resident" });
    }
    // 帰省している市外の親族(この住戸の世帯の親・kinvisit.js)
    if (typeof kinVisitInside === "function") try {
      for (const q of kinVisitInside(crowd, bIdx, I2, u.hh)) res.push(q);
    } catch (e) {
    }
    return res;
  }

