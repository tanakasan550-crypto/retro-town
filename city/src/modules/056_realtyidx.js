  // src/realtyidx.js
  var LI = [[1960, 0.45], [1980, 0.7], [1985, 0.82], [1990, 1], [1993, 0.9], [1996, 0.78], [2e3, 0.7], [2004, 0.64], [2008, 0.68], [2010, 0.64], [2014, 0.68], [2018, 0.8], [2022, 0.9], [2026, 0.96], [2035, 1], [2050, 1.08], [2100, 1.15]];
  var ZONEK = { downtown: 1.22, tower: 1.28, shotengai: 1.1, oldtown: 1, school: 1.02, suburb_n: 0.95, suburb_w: 0.92, suburb_e: 0.92, campus: 1, civic: 1.05, farm: 0.6, onsen: 0.85, temple_town: 0.88, port: 0.82, industrial: 0.75 };
  function landCurve(y) {
    if (y <= LI[0][0]) return LI[0][1];
    for (let i = 1; i < LI.length; i++) if (y <= LI[i][0]) {
      const a = LI[i - 1], b = LI[i];
      return a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0]);
    }
    return LI[LI.length - 1][1];
  }
  var zoneK = (z) => ZONEK[z] || 1;
  function landIndex(g, b, y = g.year()) {
    return landCurve(y) * zoneK(b.zone) * (1 + 0.05 * Math.sin(y * 0.7 + hash2(b.idx >>> 0, 77) % 628 / 100));
  }
  var reformOf = (g, bi) => g.hero.estate && g.hero.estate.reform && g.hero.estate.reform[bi] || null;
  function ageInfo(g, b, y = g.year()) {
    const built = historyOf(g, b.idx).built;
    const rf = reformOf(g, b.idx);
    const age = Math.max(0, y - built);
    const eff = Math.max(0, age - (rf ? rf.yrs : 0));
    return { built, age, eff, rf };
  }
  var ageFactor = (g, b, y) => {
    const a = ageInfo(g, b, y);
    return Math.max(0.4, Math.min(1.05, 1.05 - 85e-4 * a.eff));
  };
  var valueFactor = (g, b, y = g.year()) => landIndex(g, b, y) * ageFactor(g, b, y);

