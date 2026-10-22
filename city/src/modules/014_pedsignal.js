  // src/pedsignal.js
  var cache4 = /* @__PURE__ */ new WeakMap();
  function crosswalks(map2) {
    let m = cache4.get(map2);
    if (m) return m;
    m = /* @__PURE__ */ new Map();
    const ri = roadInfo(map2), cl = junctions(map2), W2 = map2.W;
    for (const c of cl.list) {
      if (!c.signal) continue;
      for (const a of c.arms) {
        if (cl.cwk[a.k]) m.set(a.k, { c, horiz: ri.axis[a.k] === AX.H });
      }
    }
    cache4.set(map2, m);
    return m;
  }
  function pedState(c, horizArm, clock) {
    const st3 = signalAt(c, clock, horizArm ? AX.V : AX.H);
    if (st3 === "G") return "G";
    if (st3 === "Y") return (clock * 2 | 0) % 2 ? "G" : "F";
    return "R";
  }
  function crosswalkAt(map2, x, y) {
    return crosswalks(map2).get(Math.floor(y) * map2.W + Math.floor(x)) || null;
  }
  function pedPos(C2, map2, w, dMin, fr, clk, S2) {
    const dmax = w.v > 0 ? Math.max(0, dMin + w.t0 / w.v) : 1e9;
    let dl = Math.min(dmax, S2.wdelay.get(w.id) || 0);
    if (S2.whold.get(w.id)) dl = Math.min(dmax, dl + fr);
    let q = C2.walkerPos(w, dMin - dl);
    let idle = false;
    if (q && !q.car && map2.ver === 4) {
      const cur2 = crosswalkAt(map2, q.x, q.y), ahead = !cur2 && (q.dx || q.dy) ? crosswalkAt(map2, q.x + Math.sign(q.dx) * 0.7, q.y + Math.sign(q.dy) * 0.7) : null;
      const st3 = ahead ? pedState(ahead.c, ahead.horiz, clk) : "N";
      if (S2.whold.get(w.id)) {
        if (!ahead || st3 === "G" || st3 === "F" || dl > 20) S2.whold.delete(w.id);
        else idle = true;
      } else if (ahead && st3 === "R") {
        S2.whold.set(w.id, true);
        idle = true;
      }
      if (S2.whold.get(w.id)) {
        S2.wdelay.set(w.id, dl);
        q = C2.walkerPos(w, dMin - dl);
      } else if (dl) S2.wdelay.set(w.id, dl);
    }
    return { q, idle };
  }

