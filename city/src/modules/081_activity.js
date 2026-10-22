  // src/activity.js
  var SEAT_T = /* @__PURE__ */ new Set(["sofa", "chair", "stool", "bench", "bath", "rotenbath"]);
  function seatList(I2) {
    const out = [];
    const objs = I2.objs || [];
    const tables = objs.filter((o) => o.t === "table");
    for (const o of objs) {
      if (!SEAT_T.has(o.t)) continue;
      const w = Math.max(1, o.w || 1);
      for (let i = 0; i < w; i++) {
        const cx = o.x + i + 0.5, cy = o.y + (o.t === "sofa" ? 0.62 : 0.5);
        let f2 = "d";
        if (o.t === "chair" || o.t === "stool") {
          let best = null, bd = 9;
          for (const t of tables) {
            const tx = t.x + (t.w || 1) / 2, ty = t.y + (t.h || 1) / 2;
            const d = Math.hypot(tx - cx, ty - cy);
            if (d < bd) {
              bd = d;
              best = [tx - cx, ty - cy];
            }
          }
          if (best && bd < 2.6) f2 = Math.abs(best[0]) > Math.abs(best[1]) ? best[0] > 0 ? "r" : "l" : best[1] > 0 ? "d" : "u";
        }
        out.push({ key: `${o.t}@${o.x + i},${o.y}`, x: cx, y: cy, f: f2, o, t: o.t });
      }
    }
    return out;
  }
  function freeSeatFor(I2, obj, people, heroXY) {
    const taken = new Set((people || []).filter((p) => p.seat).map((p) => p.seat));
    const seats = seatList(I2).filter((s) => s.o === obj);
    const free = seats.filter((s) => !taken.has(s.key));
    if (!free.length) return null;
    free.sort((a, b) => Math.hypot(a.x - heroXY.x, a.y - heroXY.y) - Math.hypot(b.x - heroXY.x, b.y - heroXY.y));
    return free[0];
  }
  var ACTS = {
    sit: { walkMax: 1.4, sitDown: 0.55, rest: 3.2, standUp: 0.5, minutes: 60, effect: { mood: 4, energy: 4 }, msg: "\u30BD\u30D5\u30A1\u3067\u3086\u3063\u304F\u308A\u904E\u3054\u3057\u307E\u3057\u305F\u3002" },
    bath: { walkMax: 1.8, sitDown: 1, rest: 6, standUp: 0.9, minutes: 45, effect: { health: 3, mood: 8, energy: 4 }, msg: "\u304A\u6E6F\u306B\u3086\u3063\u305F\u308A\u3064\u304B\u308A\u307E\u3057\u305F\u3002" },
    rbath: { walkMax: 1.8, sitDown: 1, rest: 7, standUp: 0.9, minutes: 55, effect: { health: 4, mood: 11, energy: 4 }, msg: "\u9732\u5929\u98A8\u5442\u306B\u8EAB\u3092\u3072\u305F\u3057\u307E\u3057\u305F\u3002" }
  };
  function beginSit(g, I2, obj, people, hero, kind = "sit") {
    if (g.age() < 3) return { ok: false, msg: "\u307E\u3060\u3072\u3068\u308A\u3067\u306F\u5EA7\u308C\u307E\u305B\u3093\u3002" };
    const seat = freeSeatFor(I2, obj, people, hero);
    if (!seat) return { ok: false, msg: "\u3053\u306E\u5E2D\u306F\u5148\u5BA2\u304C\u3044\u307E\u3059\u3002" };
    const A2 = ACTS[kind] || ACTS.sit;
    const approach = { x: seat.x, y: seat.y + 0.95 };
    return { ok: true, act: { k: "sit", seat, phase: "walk", t: 0, from: { x: hero.x, y: hero.y, f: hero.f }, approach, applied: false, sat: false, A: { ...A2 }, kind } };
  }
  var ease = (u) => u * u * (3 - 2 * u);
  function stepAct(act, dt, hero, hooks = {}) {
    const A2 = act.A, s = act.seat;
    act.t += dt;
    let pose = null;
    if (act.phase === "walk") {
      const u = Math.min(1, act.t / Math.max(0.2, Math.min(A2.walkMax, Math.hypot(act.approach.x - act.from.x, act.approach.y - act.from.y) / 3.2)));
      hero.x = act.from.x + (act.approach.x - act.from.x) * ease(u);
      hero.y = act.from.y + (act.approach.y - act.from.y) * ease(u);
      hero.moving = u < 1;
      hero.f = Math.abs(act.approach.x - act.from.x) > Math.abs(act.approach.y - act.from.y) ? act.approach.x > act.from.x ? "r" : "l" : act.approach.y > act.from.y ? "d" : "u";
      if (u >= 1) {
        act.phase = "sitdown";
        act.t = 0;
        hero.moving = false;
        hero.f = "d";
      }
    } else if (act.phase === "sitdown") {
      const u = Math.min(1, act.t / A2.sitDown);
      hero.x = act.approach.x + (s.x - act.approach.x) * ease(u);
      hero.y = act.approach.y + (s.y - act.approach.y) * ease(u);
      hero.f = s.f;
      hero.moving = false;
      pose = { pose: "sit", k: ease(u) };
      if (u >= 1) {
        act.phase = "rest";
        act.t = 0;
        act.sat = true;
      }
    } else if (act.phase === "rest") {
      hero.x = s.x;
      hero.y = s.y;
      hero.f = s.f;
      pose = { pose: "sit", k: 1 };
      if (act.t >= A2.rest) {
        if (!act.applied) {
          act.applied = true;
          hooks.onRest && hooks.onRest(A2.minutes, A2.effect);
        }
        act.phase = "standup";
        act.t = 0;
      }
    } else if (act.phase === "standup") {
      const u = Math.min(1, act.t / A2.standUp);
      hero.x = s.x + (act.approach.x - s.x) * ease(u);
      hero.y = s.y + (act.approach.y - s.y) * ease(u);
      hero.f = s.f;
      pose = { pose: "sit", k: 1 - ease(u) };
      if (u >= 1) {
        hero.f = "d";
        return { done: true, pose: null };
      }
    }
    return { done: false, pose };
  }
  function placeSitters(I2, people, slot, heroSeatKey) {
    const seats = seatList(I2);
    if (!seats.length) return people;
    const taken = /* @__PURE__ */ new Set();
    if (heroSeatKey) taken.add(heroSeatKey);
    for (const p of people) {
      if (p.wp || p.moving || p.role === "staff" || p.act) continue;
      const h = hash2(p.id * 31 + slot, 9917);
      if (h % 100 >= (p.role === "customer" || p.role === "visitor" ? 70 : 35)) continue;
      let best = null, bd = 6;
      for (const s of seats) {
        if (taken.has(s.key)) continue;
        const d = Math.hypot(s.x - p.x, s.y - p.y);
        if (d < bd) {
          bd = d;
          best = s;
        }
      }
      if (!best) continue;
      taken.add(best.key);
      p.seat = best.key;
      p.pose = "sit";
      p.x = best.x;
      p.y = best.y;
      p.dir = best.f;
      p.moving = false;
    }
    return people;
  }
  var hipFrac = (age) => age < 6 ? 0.6 : age < 13 ? 0.585 : 0.575;
  function seatStudents(people) {
    for (const p of people) if (p.role === "student" && !p.moving && !p.wp) {
      p.pose = "sit";
      p.dir = "u";
      p.seat = p.seat || `desk@${Math.round(p.x * 2)},${Math.round(p.y * 2)}`;
    }
    return people;
  }
  var JOB_LABEL = { teacher: "\u6388\u696D\u4E2D", special_teacher: "\u6388\u696D\u4E2D", doctor: "\u8A3A\u5BDF\u4E2D", nurse: "\u60A3\u8005\u5BFE\u5FDC\u4E2D", clerk: "\u63A5\u5BA2\u4E2D", cashier: "\u30EC\u30B8\u5BFE\u5FDC\u4E2D", stocker: "\u54C1\u51FA\u3057\u4E2D", waitstaff: "\u914D\u81B3\u4E2D", cleaner: "\u6E05\u6383\u4E2D", railstaff: "\u6539\u672D\u30FB\u6848\u5185\u4E2D", police: "\u8B66\u3089\u3044\u4E2D", firefighter: "\u5F85\u6A5F\u30FB\u70B9\u691C\u4E2D", factory: "\u88FD\u9020\u4E2D", logistics: "\u4ED5\u5206\u3051\u4E2D", carpenter: "\u4F5C\u696D\u4E2D", hotelstaff: "\u5BA2\u5BA4\u5BFE\u5FDC\u4E2D", childcare: "\u4FDD\u80B2\u4E2D", caregiver: "\u4ECB\u8B77\u4E2D", librarian: "\u8CB8\u51FA\u5BFE\u5FDC\u4E2D", officeworker: "\u30C7\u30B9\u30AF\u30EF\u30FC\u30AF\u4E2D", official: "\u7A93\u53E3\u5BFE\u5FDC\u4E2D", cook: "\u8ABF\u7406\u4E2D", chef: "\u8ABF\u7406\u4E2D" };
  var STAFF_ACT = { rounds: "\u56DE\u8A3A\u30FB\u770B\u8B77\u4E2D", consult: "\u8A3A\u5BDF\u4E2D", reception: "\u53D7\u4ED8\u5BFE\u5FDC\u4E2D", deliver: "\u66F8\u985E\u3092\u904B\u3073\u4E2D", ritual: "\u793E\u52D9\u30FB\u7948\u7977\u4E2D", guide: "\u6848\u5185\u4E2D", concierge: "\u30D5\u30ED\u30F3\u30C8\u5BFE\u5FDC\u4E2D", sales: "\u5546\u8AC7\u30FB\u6848\u5185\u4E2D", patrol: "\u8A2D\u5099\u306E\u70B9\u691C\u4E2D", tour: "\u673A\u9593\u5DE1\u8996\u4E2D" };
  var CUST_ACT = { patient: "\u53D7\u8A3A\u4E2D", visit: "\u304A\u898B\u821E\u3044\u4E2D", inpatient: "\u5165\u9662\u4E2D(\u7642\u990A)", bathing: "\u5165\u6D74\u4E2D", washing: "\u4F53\u3092\u6D17\u3063\u3066\u3044\u307E\u3059", resting: "\u6E6F\u4E0A\u304C\u308A\u3067\u3072\u3068\u4F11\u307F", errand: "\u7A93\u53E3\u3067\u624B\u7D9A\u304D\u4E2D", worship: "\u304A\u53C2\u308A\u4E2D", play: "\u904A\u3093\u3067\u3044\u307E\u3059", checkin: "\u30C1\u30A7\u30C3\u30AF\u30A4\u30F3\u4E2D", viewcar: "\u8ECA\u3092\u898B\u5B66\u4E2D", viewing: "\u898B\u5B66\u4E2D" };
  function stateLabel(p, jobIdOf, inFood) {
    if (!p) return "";
    if (p.role === "bather") return CUST_ACT[p.act] || "\u5165\u6D74\u4E2D";
    if (p.role === "patient") return "\u5165\u9662\u4E2D(\u7642\u990A)";
    if (p.role === "student") return p.pose === "sit" ? "\u6388\u696D\u4E2D" : "\u4F11\u307F\u6642\u9593";
    if (p.role === "staff") {
      if (p.act === "register") return "\u30EC\u30B8\u5BFE\u5FDC\u4E2D";
      if (STAFF_ACT[p.act]) return STAFF_ACT[p.act];
      if (p.act === "restock") return "\u54C1\u51FA\u3057\u4E2D";
      if (p.act === "serve") return "\u914D\u81B3\u4E2D";
      const j = jobIdOf && jobIdOf(p.id);
      return JOB_LABEL[j] || "\u52E4\u52D9\u4E2D";
    }
    if (p.role === "customer" && CUST_ACT[p.act] && p.pose !== "sit") return CUST_ACT[p.act];
    if (p.role === "customer") return p.pose === "sit" ? inFood ? "\u98DF\u4E8B\u4E2D" : "\u4F11\u61A9\u4E2D" : p.act === "shop" ? "\u8CB7\u3044\u7269\u4E2D" : "\u6765\u5E97\u4E2D";
    if (p.role === "family") return p.pose === "sit" ? "\u304F\u3064\u308D\u304E\u4E2D" : "\u5BB6\u65CF\u3068\u3059\u3054\u3057\u4E2D";
    if (p.role === "resident") return p.pose === "sit" ? "\u304F\u3064\u308D\u304E\u4E2D" : "\u3059\u3054\u3057\u4E2D";
    if (p.role === "commuter") return "\u901A\u52E4\u30FB\u901A\u5B66\u4E2D";
    return p.pose === "sit" ? "\u4F11\u61A9\u4E2D" : "";
  }

