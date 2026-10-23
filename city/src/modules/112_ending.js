  // src/ending.js
  function buildEnding(g) {
    const S2 = g.S, h = g.hero, L2 = S2.log;
    const yr = (M) => 1900 + Math.floor(M / 12);
    const pick5 = (kind, f2) => L2.filter((e) => e.kind === kind && (!f2 || f2(e)));
    const sections = [];
    const add = (title, items) => {
      const lines = items.filter(Boolean);
      if (lines.length) sections.push({ title, lines });
    };
    const line2 = (e) => e ? { text: `${yr(e.M)}\u5E74 ${e.text}`, ref: e.i } : null;
    add("\u306F\u3058\u307E\u308A", [line2(pick5("birth")[0])]);
    add("\u6311\u6226", pick5("scenario").map(line2));
    add("\u5B66\u3073\u820E", pick5("school").filter((e, i, a) => /入学/.test(e.text)).map(line2).concat(pick5("exam").map(line2)));
    const jobs = pick5("job").filter((e) => /働き始めた/.test(e.text));
    add("\u4ED5\u4E8B", jobs.slice(0, 6).map(line2).concat(pick5("job").filter((e) => /昇進|退職/.test(e.text)).slice(0, 4).map(line2)));
    add("\u3068\u3082\u306B\u6B69\u3044\u305F\u4EBA", pick5("marry").map(line2).concat(pick5("couple").slice(0, 2).map(line2), pick5("family").filter((e) => /生まれた/.test(e.text)).map(line2), pick5("bestfriend").slice(0, 4).map(line2), pick5("friend").slice(0, 4).map(line2)));
    add("\u304F\u3089\u3057", pick5("move").slice(0, 6).map(line2).concat(pick5("home").map(line2), pick5("trip").slice(0, 4).map(line2)));
    add("\u5225\u308C", pick5("news").filter((e) => e.ev === "died" && (h.rel[e.who]?.aff >= 50 || h.rel[e.who]?.family)).slice(0, 6).map(line2));
    add("\u3075\u3068\u601D\u3044\u51FA\u3059\u51FA\u6765\u4E8B", pick5("event").filter((e) => ["first_steps", "coming_of_age", "summer_festival", "wedding_anniv", "holiday_trip", "cherry"].includes(e.ev)).slice(0, 8).map(line2));
    add("\u8857\u306E\u3067\u304D\u3054\u3068", pick5("world").slice(0, 8).map(line2));
    // 街の表彰(実績の記録だけを根拠に、決定的に選ぶ。ledger.js)
    if (typeof ledgerAwards === "function") try {
      add("\u8857\u306E\u8868\u5F70", ledgerAwards(g).map((a) => ({ text: `${a.title} ${a.name}\u3055\u3093 \u2014 ${a.evidence}`, rule: a.rule, who: a.id })));
    } catch (e) {
    }
    const facts = { ...h.testMode?.used ? { \u30C6\u30B9\u30C8\u4F7F\u7528: "\u8A66\u9A13\u7528\u306E\u6240\u6301\u91D1MAX\u3092\u4F7F\u7528(\u901A\u5E38\u30D7\u30EC\u30A4\u306E\u8A18\u9332\u3067\u306F\u3042\u308A\u307E\u305B\u3093)" } : {}, \u5E74\u9F62: g.age(), \u846C\u5100\u53C2\u5217: h.flags.funeral || 0, \u5893\u53C2\u308A: h.flags.graveVisit || 0, \u5584\u884C: h.flags.goodDeed || 0, \u682A\u5F0F\u306E\u6642\u4FA1: Math.round(Object.entries(h.stocks || {}).reduce((a, [k, v]) => a + v.n * (g.S.stk?.px?.[k] || 0) * g.pi(), 0)), \u5BFF\u547D\u8A2D\u5B9A: S2.lifeMode === "natural" ? "\u500B\u4EBA\u5DEE\u3042\u308A" : "80\u5E74\u56FA\u5B9A", \u53CB\u4EBA\u6570: Object.values(h.rel).filter((r) => r.aff >= 50 && !r.family).length, \u5B50\u3069\u3082: h.kids.length, \u50CD\u3044\u305F\u6642\u9593: S2.stats.workHours, \u4E57\u8ECA\u56DE\u6570: S2.stats.rides, \u6240\u6301\u91D1: Math.round(h.money), \u501F\u5165: Math.round(h.debt), \u6295\u8CC7\u8CC7\u7523: Math.round(h.invest?.bal || 0), \u4F4F\u5B85\u30ED\u30FC\u30F3\u6B8B: Math.round(h.mort?.bal || 0), \u6301\u3061\u5BB6: h.owned.length };
    const summary = `${h.name}\u306E${g.age()}\u5E74\u3002${sections.reduce((n2, s) => n2 + s.lines.length, 0)}\u306E\u601D\u3044\u51FA\u304C\u3001\u8857\u306E\u3069\u3053\u304B\u306B\u523B\u307E\u308C\u3066\u3044\u307E\u3059\u3002`;
    return { summary, sections, facts, ok: true };
  }

