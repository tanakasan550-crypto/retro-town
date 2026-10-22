  // src/lift.js
  var LIFT_CAP = 10;
  var FLOOR_SEC = 1.1;
  var DOOR_SEC = 0.9;
  var DWELL = 12;
  var ESC_SEC = 4.2;
  function carFloor(b, shaft, lo, hi2, tSec) {
    const n2 = hi2 - lo + 1;
    if (n2 <= 1) return lo;
    const seg = Math.floor(tSec / DWELL);
    const f0 = lo + hash2(b.idx * 7 + shaft, seg) % n2, f1 = lo + hash2(b.idx * 7 + shaft, seg + 1) % n2;
    const dist2 = Math.abs(f1 - f0) * FLOOR_SEC, within = tSec - seg * DWELL;
    const run = Math.min(1, dist2 <= 0 ? 1 : within / dist2);
    return f0 + (f1 - f0) * run;
  }
  function riders(g, b, shaft, floor, tSec) {
    const h = g.S.min / 60 % 24;
    const rush = h >= 7 && h < 9.2 || h >= 17 && h < 19.2 ? 4 : h >= 11.5 && h < 13.5 ? 2 : 0;
    const base = b.type === "dept" || b.type === "mall" ? 6 : 4;
    return Math.min(LIFT_CAP + 2, hash2(b.idx * 13 + shaft * 5 + floor + 40, Math.floor(tSec / 20)) % (base + rush + 2));
  }
  var tNow = (g) => g.absMin() * 60;
  var doorOf = (I2, shaft) => (I2.objs || []).find((o) => o.t === "elev" && o.shaft === shaft);
  function callLift(g, o) {
    const L2 = g.S.loc;
    if (L2.tr) return { ok: false, msg: "\u79FB\u52D5\u4E2D\u3067\u3059" };
    const b = g.world.map.buildings[L2.b];
    const lo = o.lo, hi2 = o.hi;
    const t0 = tNow(g);
    const cf = carFloor(b, o.shaft, lo, hi2, t0);
    let wait = 1.2 + Math.abs(cf - L2.floor) * FLOOR_SEC;
    let full = 0;
    for (let k = 0; k < 2; k++) {
      if (riders(g, b, o.shaft, L2.floor, t0 + wait) >= LIFT_CAP) {
        full++;
        wait += 7 + hash2(b.idx, k + 3) % 5;
      } else break;
    }
    L2.tr = { k: "lift", stage: "wait", b: L2.b, shaft: o.shaft, from: L2.floor, t: 0, wait, full, dx: o.x + 0.5 + (o.w || 2) / 2 - 0.5, dy: o.y, hx: L2.x, hy: L2.y, door: 0 };
    return { ok: true, msg: `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC${o.shaft + 1}\u53F7\u6A5F\u3092\u547C\u3073\u307E\u3057\u305F(${levelLabel(b, cf < L2.floor ? Math.floor(cf) : Math.ceil(cf))}\u3042\u305F\u308A\u3092\u8D70\u884C\u4E2D)` };
  }
  function chooseFloor(g, to) {
    const L2 = g.S.loc, tr = L2.tr;
    if (!tr || tr.k !== "lift" || tr.stage !== "select") return { ok: false, msg: "" };
    const b = g.world.map.buildings[L2.b];
    const { lo, hi: hi2 } = levelRange(b);
    if (to < lo || to > hi2) return { ok: false, msg: "\u305D\u306E\u968E\u306B\u306F\u884C\u3051\u307E\u305B\u3093" };
    if (to === tr.from) {
      tr.stage = "alight";
      tr.t = 0;
      tr.to = tr.from;
      tr.msg = "\u540C\u3058\u968E\u3067\u3059\u3002\u964D\u308A\u307E\u3059";
      return { ok: true, msg: tr.msg };
    }
    tr.to = to;
    tr.stage = "ride";
    tr.t = 0;
    tr.dur = 1 + Math.abs(to - tr.from) * FLOOR_SEC;
    tr.dir = to > tr.from ? 1 : -1;
    tr.door = 0;
    return { ok: true, msg: `${levelLabel(b, to)}\u3078\u5411\u304B\u3044\u307E\u3059` };
  }
  function startEsc(g, o) {
    const L2 = g.S.loc;
    if (L2.tr) return { ok: false, msg: "" };
    if (g.world.pop.needs[g.hero.id] & NEED.WHEEL) return { ok: false, msg: "\u30A8\u30B9\u30AB\u30EC\u30FC\u30BF\u30FC\u306B\u306F\u8ECA\u3044\u3059\u3067\u4E57\u308C\u307E\u305B\u3093(\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u3092\u3054\u5229\u7528\u304F\u3060\u3055\u3044)" };
    const up = o.dir === "up";
    L2.tr = { k: "esc", b: L2.b, from: L2.floor, to: o.to, t: 0, dur: ESC_SEC, x: o.x + 0.5, y0: up ? o.y + 3.5 : o.y - 0.5, y1: up ? o.y - 0.5 : o.y + 3.5, land: o.land, up };
    L2.x = L2.tr.x;
    L2.y = L2.tr.y0;
    L2.f = up ? "u" : "d";
    return { ok: true, msg: up ? "\u4E0A\u308A\u30A8\u30B9\u30AB\u30EC\u30FC\u30BF\u30FC\u306B\u4E57\u308A\u307E\u3057\u305F(\u53F3\u5074\u306B\u7ACB\u3061\u307E\u3059)" : "\u4E0B\u308A\u30A8\u30B9\u30AB\u30EC\u30FC\u30BF\u30FC\u306B\u4E57\u308A\u307E\u3057\u305F" };
  }
  function tickTransit(g, dt, intent = false) {
    const L2 = g.S.loc, tr = L2.tr;
    if (!tr) return null;
    const res = { moved: false };
    if (L2.k !== "in" || L2.b !== tr.b) {
      L2.tr = null;
      return res;
    }
    const b = g.world.map.buildings[L2.b];
    if (tr.k === "esc") {
      tr.t += dt;
      const u = Math.min(1, tr.t / tr.dur);
      L2.x = tr.x;
      L2.y = tr.y0 + (tr.y1 - tr.y0) * u;
      L2.f = tr.up ? "u" : "d";
      res.moved = true;
      L2.z = (tr.up ? 1 : -1) * u * 3.4;
      if (u >= 1) {
        L2.floor = tr.to;
        L2.x = tr.land.x + 0.5;
        L2.y = tr.land.y + 0.5;
        L2.z = 0;
        L2.sl = { f: L2.floor, b: L2.b, x: L2.x, y: L2.y };
        L2.tr = null;
        res.floor = L2.floor;
        res.msg = `${levelLabel(b, L2.floor)}\u306B\u7740\u304D\u307E\u3057\u305F`;
      }
      return res;
    }
    if (tr.stage === "wait") {
      if (intent) {
        L2.tr = null;
        res.msg = "\u547C\u3076\u306E\u3092\u3084\u3081\u307E\u3057\u305F";
        return res;
      }
      tr.t += dt;
      if (tr.t >= tr.wait) {
        tr.stage = "open";
        tr.t = 0;
        tr.door = 0;
        res.msg = tr.full ? "\u6E80\u54E1\u3067\u3057\u305F\u304C\u3001\u6B21\u306E\u53F7\u6A5F\u304C\u6765\u307E\u3057\u305F" : "\u30C9\u30A2\u304C\u958B\u304D\u307E\u3057\u305F";
      }
    } else if (tr.stage === "open") {
      tr.t += dt;
      tr.door = Math.min(1, tr.t / DOOR_SEC);
      if (tr.t >= DOOR_SEC) {
        tr.stage = "board";
        tr.t = 0;
        tr.bx = L2.x;
        tr.by = L2.y;
      }
    } else if (tr.stage === "board") {
      tr.t += dt;
      const u = Math.min(1, tr.t / 0.9);
      L2.x = tr.bx + (tr.dx - tr.bx) * u;
      L2.y = tr.by + (tr.dy + 0.55 - tr.by) * u;
      L2.f = "u";
      res.moved = true;
      if (u >= 1) {
        tr.stage = "select";
        tr.t = 0;
        res.ui = "liftsel";
      }
    } else if (tr.stage === "select") {
      tr.t += dt;
      res.ui = res.ui || "liftsel";
      if (tr.t > 25) {
        tr.to = tr.from;
        tr.stage = "alight";
        tr.t = 0;
        res.msg = "\u968E\u3092\u9078\u3070\u306A\u304B\u3063\u305F\u306E\u3067\u3001\u5143\u306E\u968E\u3067\u964D\u308A\u307E\u3059";
      }
    } else if (tr.stage === "ride") {
      tr.t += dt;
      tr.door = Math.max(0, 1 - tr.t / 0.4);
      tr.pos = tr.from + (tr.to - tr.from) * Math.min(1, tr.t / tr.dur);
      if (tr.t >= tr.dur) {
        L2.floor = tr.to;
        const I2 = interior(g);
        const d2 = doorOf(I2, tr.shaft);
        if (d2) {
          tr.dx = d2.x + (d2.w || 2) / 2;
          tr.dy = d2.y + 0.55;
        }
        L2.x = tr.dx;
        L2.y = tr.dy;
        L2.f = "d";
        L2.sl = { f: L2.floor, b: L2.b, x: L2.x, y: L2.y + 1 };
        tr.stage = "alight";
        tr.t = 0;
        tr.door = 0;
        res.floor = L2.floor;
        res.msg = `${levelLabel(b, L2.floor)}\u306B\u7740\u304D\u307E\u3057\u305F`;
      }
    } else if (tr.stage === "alight") {
      tr.t += dt;
      if (tr.t < DOOR_SEC) tr.door = Math.min(1, tr.t / DOOR_SEC);
      else {
        const u = Math.min(1, (tr.t - DOOR_SEC) / 0.8);
        L2.y = tr.dy + (2.5 - tr.dy) * u;
        L2.f = "d";
        res.moved = true;
        tr.door = 1;
        if (u >= 1) {
          L2.tr = null;
          L2.z = 0;
        }
      }
    }
    return res;
  }
  var _interior = null;
  function bindInterior(fn) {
    _interior = fn;
  }
  var interior = (g) => _interior(g);
  function floorChoices(g) {
    const L2 = g.S.loc, b = g.world.map.buildings[L2.b];
    const { lo, hi: hi2, nf } = levelRange(b);
    const out = [];
    for (let lv = hi2; lv >= lo; lv--) out.push({ lv, label: levelLabel(b, lv), short: levelShort(b, lv), here: lv === L2.floor });
    return out;
  }

