  // src/bldfix.js — 建物規模の整合: 居住世帯が入りきらない集合住宅は、その世帯数に見合う階数へ建て増す
  // (外観・館内の階・階段・エレベーターが一致する。部屋番号は condoPlan の計画階数 planNf で固定)
  var condoFixM = -1;
  function fixCondoHeights(g) {
    if (!g || condoFixM === g.S.M) return;
    condoFixM = g.S.M;
    let n = 0;
    for (const b of g.world.map.buildings) {
      if (b.type !== "apt" && b.type !== "tower") continue;
      let r;
      try {
        r = registry(g, b.idx);
      } catch (_) {
        continue;
      }
      let top = 0;
      for (const u of r.units) if (u.lv > top) top = u.lv;
      const cur = storeys(b);
      if (top + 1 > cur) {
        if (b.planNf == null) b.planNf = r.plan.nf;
        b.nf = top + 1;
        n++;
      }
    }
    if (n) clearInteriorCache();
    return n;
  }
