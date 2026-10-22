  // src/yearend.js
  var YT = (g) => {
    const y = 1900 + Math.floor((g.S.M - 1) / 12);
    let t = g.S.yt;
    if (!t || t.y !== y) t = g.S.yt = { y, born: 0, died: 0, married: 0, friends: [], m0: g.hero.money, d0: g.hero.debt };
    return t;
  };
  function tallyMonth(g) {
    const t = YT(g), w = g.world;
    for (const e of w.events || []) {
      if (e.type === "child") t.born++;
      else if (e.type === "died") t.died++;
      else if (e.type === "married") t.married++;
      if (e.id !== g.hero.id && w.known.has(e.id) && ["married", "child", "died", "newjob", "retired", "moved"].includes(e.type)) t.friends.push({ id: e.id, type: e.type });
    }
  }
  function yearRecap(g, y) {
    const t = g.S.yt && g.S.yt.y === y ? g.S.yt : { born: 0, died: 0, married: 0, friends: [], m0: g.hero.money, d0: g.hero.debt };
    const h = g.hero, w = g.world;
    const nat = WORLD_EVENTS.filter((e) => e.y === y).map((e) => e.text);
    const pi0 = priceIndex(y - 1), pi1 = priceIndex(y);
    const infl = pi0 ? (pi1 / pi0 - 1) * 100 : 0;
    nat.push(`\u7269\u4FA1\u306F\u304A\u3088\u305D${infl >= 0 ? "+" : ""}${infl.toFixed(1)}%\u306E\u52D5\u304D\u3067\u3057\u305F`);
    const alive = Array.from({ length: w.pop.n }, (_, i) => i).reduce((a, i) => a + (w.pop.gone[i] ? 0 : 1), 0);
    const lo = (y - 1900) * 12, hi2 = lo + 12;
    let nb = 0, nd = 0, ni = 0;
    for (let i = 0; i < w.pop.n; i++) {
      const b = w.pop.born[i];
      if (b >= lo && b < hi2) nb++;
      if (w.pop.gone[i] === 1 && w.pop.goneAt[i] >= lo && w.pop.goneAt[i] < hi2) nd++;
      if (w.pop.gone[i] === 2 && w.pop.goneAt[i] >= lo && w.pop.goneAt[i] < hi2) ni++;
    }
    const town = [`\u8857\u306E\u4EBA\u53E3\u306F\u7D04${alive.toLocaleString("ja-JP")}\u4EBA`, `\u3053\u306E1\u5E74\u306E\u8A95\u751F ${nb}\u4EBA\u30FB\u65C5\u7ACB\u3061 ${nd}\u4EBA\u30FB\u8EE2\u51FA ${ni}\u4EBA\u30FB\u7D50\u5A5A ${t.married}\u7D44(\u77E5\u3063\u3066\u3044\u308B\u4EBA\u306E\u7BC4\u56F2)`];
    const names = { married: "\u7D50\u5A5A", child: "\u5B50\u3069\u3082\u304C\u8A95\u751F", died: "\u4ED6\u754C", newjob: "\u8EE2\u8077\u30FB\u5C31\u8077", retired: "\u9000\u8077", moved: "\u5F15\u3063\u8D8A\u3057" };
    const fr = t.friends.slice(0, 6).map((f2) => `${g.nameOf(f2.id)}: ${names[f2.type]}`);
    const logs = g.S.log.filter((l) => Math.floor(l.M / 12) + 1900 === y);
    const cnt = (k) => logs.filter((l) => l.kind === k).length;
    const me = [`${g.ageAt(g.S.M)}\u6B73\u3067\u65B0\u3057\u3044\u5E74\u3092\u8FCE\u3048\u307E\u3057\u305F`, `\u304A\u91D1: ${((h.money - t.m0 + h.debt * 0 - (h.debt - t.d0)) / 1).toLocaleString("ja-JP")}\u5186\u306E\u5897\u6E1B(\u501F\u91D1\u8FBC\u307F)`];
    if (h.job) me.push("\u4ED5\u4E8B: " + (g.bld(h.job.b)?.name || "") + "\u3067\u50CD\u3044\u3066\u3044\u307E\u3059");
    if (cnt("health")) me.push(`\u4F53\u8ABF\u306E\u51FA\u6765\u4E8B ${cnt("health")}\u4EF6`);
    if (cnt("meet")) me.push(`\u65B0\u3057\u3044\u51FA\u4F1A\u3044 ${cnt("meet")}\u4EBA`);
    return { y, national: nat, town, friends: fr, hero: me };
  }

