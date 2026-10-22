  // src/events.js
  var yen = (g, n2) => Math.round(n2 * g.pi());
  var fmt = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  var EVENTS = {};
  var E = (def) => {
    EVENTS[def.id] = def;
  };
  var JOB_QUALS_FOR = (g) => (g.hero.job ? JOB_QUALS[g.hero.job.jobId] || [] : []).filter((q) => !g.hero.quals[q]);
  var OK = [{ label: "OK", apply() {
  } }];
  E({ id: "birth_info", ages: [0, 0], w: 0, make: (g) => ({ title: "\u8A95\u751F", text: `${g.hero.name}\u304C\u751F\u307E\u308C\u307E\u3057\u305F\u3002${g.nameOf(g.hero.mother)}\u3068${g.nameOf(g.hero.father)}\u306E\u5B50\u3068\u3057\u3066\u3001${g.homeName()}\u3067\u66AE\u3089\u3057\u59CB\u3081\u307E\u3059\u3002

\u3010\u3054\u4E21\u89AA\u3011
${parentsText(g)}
(\u300C\u4EBA\u7269\u300D\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u3044\u3064\u3067\u3082\u78BA\u8A8D\u3067\u304D\u307E\u3059)`, choices: OK, auto: 0 }) });
  E({ id: "first_steps", ages: [1, 1], w: 5, once: true, make: (g) => ({ title: "\u306F\u3058\u3081\u306E\u4E00\u6B69", text: `${g.hero.name}\u304C\u3001\u3075\u3089\u3075\u3089\u3068\u7ACB\u3061\u4E0A\u304C\u3063\u3066\u6570\u6B69\u3042\u308B\u304D\u307E\u3057\u305F\u3002\u304A\u6BCD\u3055\u3093\u3082\u304A\u7236\u3055\u3093\u3082\u5927\u559C\u3073\u3067\u3059\u3002`, choices: [{ label: "\u62CD\u624B\u3059\u308B", apply: (g2) => g2.chg({ mood: 5, social: 1 }) }], auto: 0 }) });
  E({ id: "first_words", ages: [1, 2], w: 4, once: true, make: (g) => ({ title: "\u6700\u521D\u306E\u8A00\u8449", text: `${g.hero.name}\u304C\u3001\u306F\u3058\u3081\u3066\u300C${["\u30DE\u30DE", "\u30D1\u30D1", "\u307E\u3093\u307E", "\u308F\u3093\u308F\u3093"][g.rngInt(4)]}\u300D\u3068\u8A00\u3044\u307E\u3057\u305F\u3002`, choices: OK, auto: 0 }) });
  E({ id: "fever", ages: [0, 9], w: 6, make: (g) => ({ title: "\u306D\u3064", text: "\u671D\u304B\u3089\u71B1\u3063\u307D\u304F\u3001\u3050\u3063\u305F\u308A\u3057\u3066\u3044\u307E\u3059\u3002", choices: [{ label: "\u75C5\u9662\u306B\u304B\u304B\u308B(\xA5" + yen(g, 800) + ")", apply: (g2) => {
    g2.pay(yen(g2, 800), "\u8A3A\u5BDF");
    return g2.chg({ health: 6, mood: -1 });
  } }, { label: "\u5BB6\u3067\u3042\u305F\u305F\u304B\u304F\u3057\u3066\u4F11\u3080", apply: (g2) => {
    const bad = g2.rngInt(100) < 25;
    return g2.chg({ health: bad ? -8 : 2, mood: -2 }) + (bad ? "(\u9577\u5F15\u3044\u3066\u3057\u307E\u3063\u305F)" : "");
  } }], auto: 0 }) });
  E({ id: "kinder_friend", ages: [3, 5], w: 7, once: true, make: (g) => {
    const f2 = g.randomClassmate();
    return { title: "\u4EF2\u3088\u3057\u306E\u304A\u53CB\u3060\u3061", text: f2 != null ? `${g.nameOf(f2)}\u3061\u3083\u3093(\u304F\u3093)\u304C\u300C\u3044\u3063\u3057\u3087\u306B\u3042\u305D\u307C\u3046\u300D\u3068\u58F0\u3092\u304B\u3051\u3066\u304F\u308C\u307E\u3057\u305F\u3002` : "\u304A\u53CB\u3060\u3061\u304C\u3067\u304D\u305D\u3046\u3067\u3059\u3002", ctx: { f: f2 }, choices: [{ label: "\u3044\u3063\u3057\u3087\u306B\u3042\u305D\u3076", apply: (g2) => {
      if (f2 != null) g2.meet(f2, 20);
      return g2.chg({ social: 3, mood: 4 });
    } }, { label: "\u3072\u3068\u308A\u3067\u7D75\u3092\u304B\u304F", apply: (g2) => g2.chg({ intel: 1, charm: 1 }) }], auto: 0 };
  } });
  E({ id: "shichigosan", ages: [3, 7], months: [10], w: 10, make: (g) => {
    const a = g.age();
    return a === 3 || a === 5 || a === 7 ? { title: "\u4E03\u4E94\u4E09", text: `${a}\u6B73\u306E\u4E03\u4E94\u4E09\u3002\u5BB6\u65CF\u3067\u8FD1\u304F\u306E\u795E\u793E\u3078\u304A\u53C2\u308A\u306B\u884C\u304D\u307E\u3059\u3002`, choices: [{ label: "\u5343\u6B73\u98F4\u3092\u3082\u3089\u3046", apply: (g2) => g2.chg({ mood: 6, social: 1 }) }], auto: 0 } : null;
  } });
  E({ id: "lost_child", ages: [4, 8], w: 2, make: (g) => ({ title: "\u307E\u3044\u3054", text: "\u5546\u5E97\u8857\u3067\u306F\u3050\u308C\u3066\u3057\u307E\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u304A\u5E97\u306E\u4EBA\u306B\u58F0\u3092\u304B\u3051\u308B", apply: (g2) => g2.chg({ mood: 1, social: 2, charm: 1 }) }, { label: "\u305D\u306E\u5834\u3067\u6CE3\u3044\u3066\u3057\u307E\u3046", apply: (g2) => g2.chg({ mood: -3, social: 1 }) + "(\u901A\u308A\u304C\u304B\u308A\u306E\u4EBA\u304C\u89AA\u3092\u547C\u3093\u3067\u304F\u308C\u305F)" }], auto: 0 }) });
  E({ id: "pet", ages: [6, 13], w: 1.5, once: true, make: (g) => ({ title: "\u5B50\u72AC\u304C\u304D\u305F", text: "\u89AA\u305B\u304D\u306E\u5BB6\u3067\u5B50\u72AC\u304C\u751F\u307E\u308C\u307E\u3057\u305F\u3002\u3082\u3089\u3044\u307E\u3059\u304B?", choices: [{ label: "\u3082\u3089\u3046", apply: (g2) => {
    g2.hero.flags.pet = true;
    g2.log("pet", "\u5B50\u72AC\u3092\u98FC\u3044\u306F\u3058\u3081\u305F");
    return g2.chg({ mood: 8, fitness: 2 });
  } }, { label: "\u3084\u3081\u3066\u304A\u304F", apply: (g2) => g2.chg({ mood: -1 }) }], auto: 1 }) });
  E({ id: "sports_day", ages: [6, 17], months: [9], w: 9, make: (g) => ({ title: "\u904B\u52D5\u4F1A", text: "\u5B66\u6821\u306E\u904B\u52D5\u4F1A\u306E\u65E5\u3067\u3059\u3002", choices: [{ label: "\u30EA\u30EC\u30FC\u306B\u51FA\u308B", apply: (g2) => {
    const win = g2.hero.stats.fitness + g2.rngInt(40) > 62;
    g2.hero.flags.sportsHigh = (g2.hero.flags.sportsHigh || 0) + (win ? 1 : 0);
    return g2.chg({ fitness: 2, mood: win ? 8 : 2, social: 2 }) + (win ? "(1\u4F4D!)" : "(\u6700\u5F8C\u307E\u3067\u304C\u3093\u3070\u3063\u305F)");
  } }, { label: "\u5FDC\u63F4\u3092\u304C\u3093\u3070\u308B", apply: (g2) => g2.chg({ social: 3, mood: 3 }) }], auto: 1 }) });
  E({ id: "school_trip", ages: [11, 17], months: [4, 5, 9], w: 6, make: (g) => {
    const a = g.age();
    if (![11, 14, 17].includes(a)) return null;
    return { title: "\u4FEE\u5B66\u65C5\u884C", text: "\u5B66\u5E74\u307F\u3093\u306A\u3067\u4FEE\u5B66\u65C5\u884C\u306B\u51FA\u304B\u3051\u307E\u3059\u3002", choices: [{ label: "\u3081\u3044\u3063\u3071\u3044\u697D\u3057\u3080", apply: (g2) => g2.chg({ mood: 10, social: 4 }) }], auto: 0 };
  } });
  E({ id: "summer_festival", ages: [3, 90], months: [7], w: 8, make: (g) => ({ title: "\u590F\u307E\u3064\u308A", text: "\u795E\u793E\u306E\u590F\u307E\u3064\u308A\u304C\u958B\u304B\u308C\u3066\u3044\u307E\u3059\u3002\u7E01\u65E5\u306E\u706F\u308A\u304C\u304D\u308C\u3044\u3067\u3059\u3002", choices: [{ label: "\u53CB\u3060\u3061\u30FB\u5BB6\u65CF\u3068\u884C\u304F(\xA5" + yen(g, 1500) + ")", apply: (g2) => {
    g2.pay(yen(g2, 1500), "\u590F\u307E\u3064\u308A");
    return g2.chg({ mood: 8, social: 3 });
  } }, { label: "\u884C\u304B\u306A\u3044", apply: (g2) => g2.chg({ mood: -1 }) }], auto: 0 }) });
  E({ id: "new_year", ages: [0, 90], months: [0], w: 20, make: (g) => {
    const a = g.age();
    const o = a < 18 ? yen(g, 3e3 + a * 400) : 0;
    return { title: "\u521D\u8A63\u30FB\u304A\u6B63\u6708", text: a < 18 ? `\u304A\u6B63\u6708\u3002\u89AA\u305B\u304D\u304B\u3089\u304A\u5E74\u7389(${fmt(o)})\u3092\u3082\u3089\u3044\u307E\u3057\u305F\u3002` : "\u304A\u6B63\u6708\u3002\u65B0\u3057\u3044\u5E74\u306E\u306F\u3058\u307E\u308A\u3067\u3059\u3002", choices: [{ label: "\u521D\u8A63\u306B\u884C\u304F", apply: (g2) => {
      if (o) g2.earn(o, "\u304A\u5E74\u7389");
      return g2.chg({ mood: 4 });
    } }], auto: 0 };
  } });
  E({ id: "club_choice", ages: [12, 12], months: [3], w: 99, once: true, ask: true, make: (g) => ({ title: "\u90E8\u6D3B\u52D5\u3048\u3089\u3073", text: "\u4E2D\u5B66\u6821\u306B\u5165\u308A\u307E\u3057\u305F\u3002\u3069\u306E\u90E8\u6D3B\u306B\u5165\u308A\u307E\u3059\u304B?", choices: [{ label: "\u904B\u52D5\u90E8(\u4F53\u529B+)", apply: (g2) => {
    g2.hero.flags.club = "sports";
    g2.log("club", "\u4E2D\u5B66\u3067\u904B\u52D5\u90E8\u306B\u5165\u3063\u305F");
    return g2.chg({ fitness: 6, social: 3 });
  } }, { label: "\u6587\u5316\u90E8(\u611F\u6027+)", apply: (g2) => {
    g2.hero.flags.club = "culture";
    g2.log("club", "\u4E2D\u5B66\u3067\u6587\u5316\u90E8\u306B\u5165\u3063\u305F");
    return g2.chg({ charm: 4, intel: 3 });
  } }, { label: "\u5E30\u5B85\u90E8(\u81EA\u7531\u6642\u9593)", apply: (g2) => {
    g2.hero.flags.club = "none";
    return g2.chg({ mood: 3 });
  } }], auto: 2 }) });
  E({ id: "first_love", ages: [12, 17], w: 5, once: true, make: (g) => {
    const c = g.randomClassmate();
    if (c == null) return null;
    return { title: "\u3061\u3087\u3063\u3068\u6C17\u306B\u306A\u308B\u4EBA", text: `${g.nameOf(c)}\u306E\u3053\u3068\u304C\u3001\u306A\u3093\u3060\u304B\u6C17\u306B\u306A\u308A\u307E\u3059\u3002`, ctx: { c }, choices: [{ label: "\u8A71\u3057\u304B\u3051\u3066\u307F\u308B", apply: (g2) => {
      g2.meet(c, 12);
      g2.hero.flags.crush = c;
      return g2.chg({ mood: 5, social: 2 });
    } }, { label: "\u898B\u5B88\u3063\u3066\u3044\u308B\u3060\u3051", apply: (g2) => g2.chg({ mood: 1 }) }], auto: 0 };
  } });
  E({ id: "lonely_classmate", ages: [7, 17], w: 3, make: (g) => {
    const c = g.randomClassmate();
    if (c == null) return null;
    return { title: "\u3072\u3068\u308A\u3067\u3044\u308B\u5B50", text: `${g.nameOf(c)}\u304C\u3001\u6559\u5BA4\u3067\u3072\u3068\u308A\u3067\u904E\u3054\u3057\u3066\u3044\u307E\u3059\u3002\u3069\u3046\u601D\u3044\u307E\u3059\u304B?(\u4EBA\u3092\u898B\u305F\u76EE\u3084\u7279\u6027\u3067\u6C7A\u3081\u3064\u3051\u306A\u3044\u3001\u304C\u5927\u5207\u3067\u3059)`, ctx: { c }, choices: [{ label: "\u58F0\u3092\u304B\u3051\u3066\u307F\u308B", apply: (g2) => {
      g2.meet(c, 15);
      return g2.chg({ social: 3, charm: 2, mood: 3 });
    } }, { label: "\u5148\u751F\u306B\u76F8\u8AC7\u3059\u308B", apply: (g2) => g2.chg({ social: 1, intel: 1 }) }, { label: "\u69D8\u5B50\u3092\u898B\u308B", apply: (g2) => g2.chg({ mood: -1 }) }], auto: 0 };
  } });
  E({ id: "part_time_offer", ages: [15, 22], w: 3, once: true, cond: (g) => !g.hero.job, make: (g) => ({ title: "\u30A2\u30EB\u30D0\u30A4\u30C8\u306E\u3055\u305D\u3044", text: "\u8FD1\u6240\u306E\u304A\u5E97\u3067\u30A2\u30EB\u30D0\u30A4\u30C8\u3092\u52DF\u96C6\u3057\u3066\u3044\u307E\u3059\u3002(\u8857\u306E\u6C42\u4EBA\u306F\u5E02\u5F79\u6240\u306E\u63B2\u793A\u677F\u3084\u3001\u5404\u304A\u5E97\u3067\u63A2\u305B\u307E\u3059)", choices: [{ label: "\u524D\u5411\u304D\u306B\u8003\u3048\u308B", apply: (g2) => {
    g2.hero.flags.wantJob = true;
    return "";
  } }, { label: "\u4ECA\u306F\u3044\u3044", apply: (g2) => "" }], auto: 1 }) });
  E({ id: "promoted", w: 0, make: (g, ctx4) => ({ title: "\u6607\u9032", text: `\u50CD\u304D\u3076\u308A\u304C\u8A8D\u3081\u3089\u308C\u3001${ctx4.job}\u3068\u3057\u3066\u300C${ctx4.rank}\u300D\u3092\u4EFB\u3055\u308C\u308B\u3053\u3068\u306B\u306A\u308A\u307E\u3057\u305F\u3002\u8CAC\u4EFB\u306F\u5897\u3048\u307E\u3059\u304C\u3001\u304A\u7D66\u6599\u3082\u4E0A\u304C\u308A\u307E\u3059\u3002`, choices: [{ label: "\u304C\u3093\u3070\u308B", apply: (g2) => g2.chg({ mood: 6 }) }], auto: 0 }) });
  E({ id: "qual_try", ages: [20, 60], w: 3, cond: (g) => !!g.hero.job && JOB_QUALS_FOR(g).length > 0, make: (g) => {
    const q = JOB_QUALS_FOR(g)[0];
    const fee = yen(g, 12e3);
    return { title: "\u8CC7\u683C\u306B\u6311\u6226", text: `\u4ED5\u4E8B\u306B\u5F79\u7ACB\u3064\u300C${QUALS[q]}\u300D\u306E\u52C9\u5F37\u4F1A\u306B\u8A98\u308F\u308C\u307E\u3057\u305F\u3002\u53D7\u9A13\u6599 \xA5${fee.toLocaleString()}\u3002`, choices: [{ label: "\u53D7\u9A13\u3059\u308B", apply: (g2) => {
      if (g2.hero.money < fee) return "(\u304A\u91D1\u304C\u8DB3\u308A\u305A\u898B\u9001\u3063\u305F)";
      g2.pay(fee, "\u53D7\u9A13\u6599");
      const ok = g2.actRng("qual").next() < 0.35 + g2.hero.stats.intel / 160;
      if (ok) {
        g2.grantQual(q);
        g2.log("qual", `${QUALS[q]}\u3092\u53D6\u5F97\u3057\u305F`);
        return `\u5408\u683C!${QUALS[q]}\u3092\u53D6\u5F97\u3057\u307E\u3057\u305F\u3002` + g2.chg({ mood: 8 });
      }
      g2.log("qual", `${QUALS[q]}\u306E\u8A66\u9A13\u306B\u843D\u3061\u305F`);
      return "\u6B8B\u5FF5\u306A\u304C\u3089\u4E0D\u5408\u683C\u3067\u3057\u305F\u3002\u307E\u305F\u6311\u6226\u3057\u3088\u3046\u3002" + g2.chg({ mood: -3 });
    } }, { label: "\u898B\u9001\u308B", apply: (g2) => "" }], auto: 1 };
  } });
  E({ id: "license", ages: [18, 30], w: 3, once: true, make: (g) => ({ title: "\u904B\u8EE2\u514D\u8A31", text: `\u904B\u8EE2\u514D\u8A31\u3092\u53D6\u308A\u306B\u884C\u304D\u307E\u3059\u304B?(\xA5${yen(g, 28e4).toLocaleString()})`, choices: [{ label: "\u53D6\u308B", apply: (g2) => {
    if (g2.hero.money < yen(g2, 28e4)) return "(\u304A\u91D1\u304C\u8DB3\u308A\u305A\u898B\u9001\u3063\u305F)";
    g2.pay(yen(g2, 28e4), "\u6559\u7FD2\u6240");
    g2.hero.quals.driver = 1;
    g2.log("qual", "\u904B\u8EE2\u514D\u8A31\u3092\u53D6\u5F97\u3057\u305F");
    return g2.chg({ mood: 5 });
  } }, { label: "\u3084\u3081\u3066\u304A\u304F", apply: (g2) => "" }], auto: 1 }) });
  E({ id: "coming_of_age", ages: [20, 20], months: [0], w: 99, once: true, make: (g) => ({ title: "\u6210\u4EBA\u5F0F", text: "\u6210\u4EBA\u5F0F\u306E\u65E5\u3002\u4E45\u3057\u3076\u308A\u306B\u540C\u7D1A\u751F\u3068\u4F1A\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u540C\u7A93\u306E\u53CB\u4EBA\u3068\u8A71\u3059", apply: (g2) => {
    for (let k = 0; k < 4; k++) {
      const c = g2.randomClassmate();
      if (c != null) g2.meet(c, 8);
    }
    return g2.chg({ mood: 8, social: 3 });
  } }], auto: 0 }) });
  E({ id: "reunion", ages: [30, 60], months: [7], w: 3, cond: (g) => [30, 40, 50, 60].includes(g.age()), make: (g) => ({ title: "\u540C\u7A93\u4F1A", text: "\u540C\u7A93\u4F1A\u306E\u6848\u5185\u304C\u5C4A\u304D\u307E\u3057\u305F\u3002", choices: [{ label: "\u53C2\u52A0\u3059\u308B(\xA5" + yen(g, 5e3) + ")", apply: (g2) => {
    g2.pay(yen(g2, 5e3), "\u540C\u7A93\u4F1A");
    for (let k = 0; k < 4; k++) {
      const c = g2.randomClassmate();
      if (c != null) g2.meet(c, 6);
    }
    return g2.chg({ mood: 6, social: 3 });
  } }, { label: "\u6B20\u5E2D\u3059\u308B", apply: (g2) => "" }], auto: 0 }) });
  E({ id: "choose_hs", ages: [14, 14], months: [11], w: 99, once: true, ask: true, make: (g) => {
    const L2 = g.world.schools[4];
    const opts = L2.map((b, i) => ({ b, i }));
    return { title: "\u9AD8\u6821\u53D7\u9A13 \u5FD7\u671B\u6821", text: `\u9032\u8DEF\u3092\u6C7A\u3081\u308B\u6642\u671F\u3067\u3059\u3002(\u3044\u307E\u306E\u5B66\u529B\u306E\u76EE\u5B89: ${Math.round(g.hero.stats.intel)})`, choices: opts.map((o) => ({ label: `${g.world.map.buildings[o.b].name}(${["\u96E3\u95A2", "\u9032\u5B66", "\u6A19\u6E96", "\u6A19\u6E96"][Math.min(o.i, 3)]})`, apply: (g2) => {
      g2.hero.flags.hsPick = o.b;
      g2.hero.flags.hsTier = o.i;
      g2.log("plan", `\u9AD8\u6821\u53D7\u9A13: ${g2.world.map.buildings[o.b].name}\u3092\u5FD7\u671B\u3057\u305F`);
      return "";
    } })).concat([{ label: "\u9AD8\u6821\u306B\u306F\u884C\u304B\u305A\u50CD\u304F", apply: (g2) => {
      g2.hero.flags.hsPick = -1;
      g2.log("plan", "\u9AD8\u6821\u306B\u306F\u9032\u5B66\u305B\u305A\u50CD\u304F\u9053\u3092\u9078\u3093\u3060");
      return "";
    } }]), auto: Math.min(2, Math.max(0, opts.length - 1)) };
  } });
  E({ id: "choose_path18", ages: [17, 17], months: [10], w: 99, once: true, ask: true, make: (g) => {
    const U2 = g.world.schools[5];
    const cs = U2.map((b) => ({ label: `${g.world.map.buildings[b].name}\u3092\u53D7\u9A13\u3059\u308B`, apply: (g2) => {
      g2.hero.flags.univPick = b;
      g2.hero.flags.path18 = "univ";
      g2.log("plan", `\u5927\u5B66\u9032\u5B66(${g2.world.map.buildings[b].name})\u3092\u5FD7\u3057\u305F`);
      return "";
    } }));
    cs.push({ label: "\u5352\u696D\u3057\u3066\u5C31\u8077\u3059\u308B", apply: (g2) => {
      g2.hero.flags.path18 = "work";
      g2.log("plan", "\u9AD8\u6821\u5352\u696D\u5F8C\u306F\u5C31\u8077\u3059\u308B\u3068\u6C7A\u3081\u305F");
      return "";
    } });
    cs.push({ label: "\u307E\u305A\u306F\u30A2\u30EB\u30D0\u30A4\u30C8\u3067\u8003\u3048\u308B", apply: (g2) => {
      g2.hero.flags.path18 = "free";
      g2.log("plan", "\u5352\u696D\u5F8C\u306F\u30A2\u30EB\u30D0\u30A4\u30C8\u3067\u9032\u8DEF\u3092\u8003\u3048\u308B\u3053\u3068\u306B\u3057\u305F");
      return "";
    } });
    return { title: "\u5352\u696D\u5F8C\u306E\u9032\u8DEF", text: "\u9AD8\u6821\u5352\u696D\u5F8C\u3001\u3069\u3046\u3057\u307E\u3059\u304B?", choices: cs, auto: cs.length - 2 };
  } });
  E({ id: "promotion", ages: [25, 59], w: 2, cond: (g) => g.hero.job && g.jobYears() >= 3 && !g.hero.flags["promo" + g.hero.job.jobId], make: (g) => ({ title: "\u6607\u9032\u306E\u8A71", text: `\u8077\u5834\u3067\u3001\u5F79\u8077\u306B\u3064\u304B\u306A\u3044\u304B\u3068\u58F0\u3092\u304B\u3051\u3089\u308C\u307E\u3057\u305F\u3002(\u8CAC\u4EFB\u304C\u5897\u3048\u3001\u6708\u7D66\u304C\u7D0415%\u4E0A\u304C\u308A\u307E\u3059)`, choices: [{ label: "\u5F15\u304D\u53D7\u3051\u308B", apply: (g2) => {
    g2.hero.job.rank = (g2.hero.job.rank || 0) + 1;
    g2.hero.flags["promo" + g2.hero.job.jobId] = 1;
    g2.log("job", "\u8077\u5834\u3067\u6607\u9032\u3057\u305F");
    return g2.chg({ mood: 4, social: 1 });
  } }, { label: "\u4ECA\u306E\u307E\u307E\u3067\u3044\u305F\u3044", apply: (g2) => {
    g2.hero.flags["promo" + g2.hero.job.jobId] = 1;
    return g2.chg({ mood: 1 });
  } }], auto: 0 }) });
  E({ id: "matchmaker", ages: [23, 40], w: 3, cond: (g) => !g.hero.spouse, make: (g) => {
    const c = g.pickSingle();
    if (c == null) return null;
    return { title: "\u7D39\u4ECB", text: `\u77E5\u4EBA\u304B\u3089${g.nameOf(c)}\u3055\u3093(${g.ageOf(c)}\u6B73)\u3092\u7D39\u4ECB\u3055\u308C\u307E\u3057\u305F\u3002`, ctx: { c }, choices: [{ label: "\u4F1A\u3063\u3066\u307F\u308B", apply: (g2) => {
      g2.meet(c, 14);
      return g2.chg({ mood: 3, social: 2 });
    } }, { label: "\u4ECA\u56DE\u306F\u9060\u616E\u3059\u308B", apply: (g2) => "" }], auto: 0 };
  } });
  E({ id: "proposal", ages: [20, 60], w: 0, ask: true, make: (g, ctx4) => ({ title: "\u7D50\u5A5A", text: `${g.nameOf(ctx4.c)}\u3055\u3093\u3068\u306E\u95A2\u4FC2\u304C\u6DF1\u307E\u308A\u307E\u3057\u305F\u3002\u7D50\u5A5A\u306B\u3064\u3044\u3066\u8003\u3048\u307E\u3059\u3002`, choices: [{ label: "\u7D50\u5A5A\u3059\u308B(\u5165\u7C4D)", apply: (g2) => g2.marry(ctx4.c, false) }, { label: "\u7D50\u5A5A\u5F0F\u3082\u6319\u3052\u308B(\xA5" + yen(g, 6e5) + ")", apply: (g2) => g2.marry(ctx4.c, true) }, { label: "\u3082\u3046\u5C11\u3057\u5F85\u3064", apply: (g2) => {
    g2.hero.flags.proposalWait = g2.M + 6;
    return "";
  } }], auto: 0 }) });
  E({ id: "child_born", ages: [20, 60], w: 0, make: (g, ctx4) => ({ title: "\u5B50\u3069\u3082\u304C\u751F\u307E\u308C\u305F", text: `${g.nameOf(ctx4.child)}\u304C\u751F\u307E\u308C\u307E\u3057\u305F\u3002\u5BB6\u65CF\u304C\u3072\u3068\u308A\u5897\u3048\u307E\u3059\u3002`, choices: OK, auto: 0 }) });
  E({ id: "health_check", ages: [35, 90], months: [5], w: 6, make: (g) => ({ title: "\u5065\u5EB7\u8A3A\u65AD", text: "\u5065\u5EB7\u8A3A\u65AD\u306E\u5B63\u7BC0\u3067\u3059\u3002", choices: [{ label: "\u53D7\u3051\u308B(\xA5" + yen(g, 3e3) + ")", apply: (g2) => {
    g2.pay(yen(g2, 3e3), "\u5065\u5EB7\u8A3A\u65AD");
    return g2.chg({ health: 4 });
  } }, { label: "\u5FD9\u3057\u304F\u3066\u898B\u9001\u308B", apply: (g2) => g2.chg({ health: -1 }) }], auto: 0 }) });
  E({ id: "illness", ages: [30, 90], w: 3, cond: (g) => g.hero.stats.health < 55, make: (g) => ({ title: "\u4F53\u8ABF\u3092\u304F\u305A\u3057\u305F", text: "\u7121\u7406\u304C\u305F\u305F\u3063\u305F\u306E\u304B\u3001\u4F53\u8ABF\u3092\u5927\u304D\u304F\u304F\u305A\u3057\u3066\u3057\u307E\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u75C5\u9662\u3067\u6CBB\u7642\u30FB\u4F11\u990A\u3059\u308B(\xA5" + yen(g, 3e4) + ")", apply: (g2) => {
    g2.pay(yen(g2, 3e4), "\u6CBB\u7642");
    g2.hero.flags.rest = 3;
    return g2.chg({ health: 18, mood: -2 }) + "(\u6570\u65E5\u4F11\u990A\u3057\u305F)";
  } }, { label: "\u304C\u307E\u3093\u3057\u3066\u50CD\u304F", apply: (g2) => g2.chg({ health: -10, mood: -4 }) }], auto: 0 }) });
  E({ id: "retire", ages: [60, 70], w: 0, ask: true, make: (g) => ({ title: "\u5B9A\u5E74\u30FB\u9000\u8077", text: "\u9577\u5E74\u3064\u3068\u3081\u305F\u4ED5\u4E8B\u3092\u533A\u5207\u308A\u306B\u3059\u308B\u3068\u304D\u304C\u6765\u307E\u3057\u305F\u3002", choices: [{ label: "\u9000\u8077\u3059\u308B", apply: (g2) => g2.retire() }, { label: "\u5631\u8A17\u3068\u3057\u3066\u7D9A\u3051\u308B(\u3082\u3046\u5C11\u3057)", apply: (g2) => {
    g2.hero.flags.retireDefer = g2.M + 36;
    return "";
  } }], auto: 0 }) });
  E({ id: "elder_hobby", ages: [62, 85], w: 3, once: true, make: (g) => ({ title: "\u3086\u3063\u305F\u308A\u3057\u305F\u65E5\u3005", text: "\u3053\u308C\u304B\u3089\u306E\u6642\u9593\u306E\u4F7F\u3044\u65B9\u3092\u8003\u3048\u307E\u3059\u3002", choices: [{ label: "\u6563\u6B69\u3068\u7551\u30FB\u8DA3\u5473\u3092\u697D\u3057\u3080", apply: (g2) => g2.chg({ health: 3, mood: 5, fitness: 2 }) }, { label: "\u5730\u57DF\u306E\u6D3B\u52D5\u30FB\u30DC\u30E9\u30F3\u30C6\u30A3\u30A2", apply: (g2) => g2.chg({ social: 5, mood: 4 }) }], auto: 0 }) });
  E({ id: "typhoon", ages: [0, 90], months: [7, 8], w: 2, make: (g) => ({ title: "\u53F0\u98A8", text: "\u5927\u578B\u306E\u53F0\u98A8\u304C\u8857\u306B\u8FD1\u3065\u3044\u3066\u3044\u307E\u3059\u3002", choices: [{ label: "\u5099\u3048\u3066\u5BB6\u3067\u904E\u3054\u3059", apply: (g2) => g2.chg({ mood: -1 }) }], auto: 0 }) });
  E({ id: "found_money", ages: [5, 90], w: 1, make: (g) => ({ title: "\u3055\u3055\u3084\u304B\u306A\u5E78\u904B", text: `\u9053\u3067${fmt(yen(g, 500))}\u3092\u62FE\u3044\u307E\u3057\u305F\u3002`, choices: [{ label: "\u4EA4\u756A\u306B\u5C4A\u3051\u308B", apply: (g2) => g2.chg({ social: 1, mood: 2 }) }], auto: 0 }) });
  E({ id: "holiday_trip", ages: [16, 85], months: [4, 7, 9], w: 4, make: (g) => ({ title: "\u5C0F\u65C5\u884C", text: "\u4F11\u307F\u304C\u3068\u308C\u307E\u3057\u305F\u3002\u96FB\u8ECA\u3067\u5C0F\u65C5\u884C\u306B\u51FA\u304B\u3051\u307E\u305B\u3093\u304B?(\u6708\u898B\u6E29\u6CC9\u30FB\u81E8\u6D77\u30EA\u30BE\u30FC\u30C8\u306A\u3069\u3078\u99C5\u304B\u3089\u884C\u3051\u307E\u3059)", choices: [{ label: "\u884C\u3063\u3066\u307F\u308B(\xA5" + yen(g, 12e3) + ")", apply: (g2) => {
    g2.pay(yen(g2, 12e3), "\u5C0F\u65C5\u884C");
    g2.hero.flags.trips = (g2.hero.flags.trips || 0) + 1;
    g2.log("trip", "\u96FB\u8ECA\u3067\u5C0F\u65C5\u884C\u306B\u51FA\u304B\u3051\u305F");
    return g2.chg({ mood: 12, health: 2, social: 1 });
  } }, { label: "\u5BB6\u3067\u3086\u3063\u304F\u308A\u3059\u308B", apply: (g2) => g2.chg({ mood: 2 }) }], auto: 1 }) });
  var cheaperHome = (g) => {
    const h = g.hero;
    if (h.homeIsParents || h.owned.includes(h.homeB)) return null;
    const cur2 = g.rentOf(g.bld(h.homeB));
    const L2 = housingList(g, 40).filter((o) => o.rent <= cur2 * 0.7).sort((a, b) => a.rent - b.rent || a.d - b.d);
    return L2.length && cur2 > g.yen(7e4) ? L2[0] : null;
  };
  E({ id: "debt_support", ages: [18, 90], w: 0, make: (g) => {
    const ch = cheaperHome(g);
    const base = { label: "\u76F8\u8AC7\u3057\u3066\u652F\u63F4\u3092\u53D7\u3051\u308B", apply: (g2) => {
      g2.hero.money += yen(g2, 8e4);
      g2.hero.debt = Math.max(0, g2.hero.debt - yen(g2, 8e4));
      g2.log("money", "\u5E02\u5F79\u6240\u306E\u751F\u6D3B\u76F8\u8AC7\u3067\u652F\u63F4\u3092\u53D7\u3051\u305F");
      return g2.chg({ mood: 4 });
    } };
    const mv = ch ? { label: `\u5BB6\u8CC3\u306E\u5B89\u3044\u4F4F\u307E\u3044\u3078\u79FB\u308B(${ch.name}\u30FB\u5BB6\u8CC3\xA5${ch.rent.toLocaleString()})`, apply: (g2) => {
      g2.hero.money += yen(g2, 15e4);
      const r = moveTo(g2, ch.b);
      g2.log("money", "\u5BB6\u8A08\u3092\u898B\u76F4\u3057\u3066\u5BB6\u8CC3\u306E\u5B89\u3044\u4F4F\u307E\u3044\u3078\u79FB\u3063\u305F");
      return r.msg + g2.chg({ mood: 1 });
    } } : null;
    return { title: "\u304F\u3089\u3057\u306E\u76F8\u8AC7", text: "\u5BB6\u8A08\u304C\u82E6\u3057\u304F\u306A\u3063\u3066\u3044\u307E\u3059\u3002\u5E02\u5F79\u6240\u306B\u306F\u751F\u6D3B\u306E\u76F8\u8AC7\u7A93\u53E3\u304C\u3042\u308A\u307E\u3059\u3002\u76F8\u8AC7\u3059\u308B\u3053\u3068\u306F\u6065\u305A\u304B\u3057\u3044\u3053\u3068\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002" + (ch ? "\n\u7A93\u53E3\u3067\u3001\u3044\u307E\u3088\u308A\u5BB6\u8CC3\u306E\u5B89\u3044\u4F4F\u307E\u3044\u3092\u7D39\u4ECB\u3057\u3066\u3082\u3089\u3048\u307E\u3057\u305F\u3002" : ""), choices: mv ? [mv, base] : [base], auto: 0 };
  } });
  E({ id: "debt_support_old_unused", ages: [200, 201], w: 0, make: (g) => ({ title: "\u304F\u3089\u3057\u306E\u76F8\u8AC7", text: "\u5BB6\u8A08\u304C\u82E6\u3057\u304F\u306A\u3063\u3066\u3044\u307E\u3059\u3002\u5E02\u5F79\u6240\u306B\u306F\u751F\u6D3B\u306E\u76F8\u8AC7\u7A93\u53E3\u304C\u3042\u308A\u307E\u3059\u3002\u76F8\u8AC7\u3059\u308B\u3053\u3068\u306F\u6065\u305A\u304B\u3057\u3044\u3053\u3068\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002", choices: [{ label: "\u76F8\u8AC7\u3057\u3066\u652F\u63F4\u3092\u53D7\u3051\u308B", apply: (g2) => {
    g2.hero.money += yen(g2, 8e4);
    g2.hero.debt = Math.max(0, g2.hero.debt - yen(g2, 8e4));
    g2.log("money", "\u5E02\u5F79\u6240\u306E\u751F\u6D3B\u76F8\u8AC7\u3067\u652F\u63F4\u3092\u53D7\u3051\u305F");
    return g2.chg({ mood: 4 });
  } }], auto: 0 }) });
  E({ id: "dream_job", ages: [11, 13], w: 4, once: true, make: (g) => ({ title: "\u8077\u5834\u4F53\u9A13", text: "\u5730\u57DF\u306E\u8077\u5834\u4F53\u9A13\u306E\u6A5F\u4F1A\u304C\u3042\u308A\u307E\u3057\u305F\u3002\u3069\u3053\u3078\u884C\u304D\u307E\u3059\u304B?", choices: [{ label: "\u5546\u5E97\u30FB\u98F2\u98DF\u5E97", apply: (g2) => {
    g2.hero.flags.interest = "service";
    return g2.chg({ social: 3 });
  } }, { label: "\u8FB2\u5BB6\u30FB\u5DE5\u5834\u30FB\u3082\u306E\u3065\u304F\u308A", apply: (g2) => {
    g2.hero.flags.interest = "craft";
    return g2.chg({ fitness: 2, intel: 1 });
  } }, { label: "\u75C5\u9662\u30FB\u798F\u7949\u65BD\u8A2D", apply: (g2) => {
    g2.hero.flags.interest = "care";
    return g2.chg({ charm: 2, social: 2 });
  } }], auto: 0 }) });
  var memorial = (g, id) => {
    var _a;
    const L2 = (_a = g.hero).memorial || (_a.memorial = []);
    if (id != null && !L2.some((x) => x.id === id)) L2.push({ id, M: g.S.M, name: g.nameOf(id) });
  };
  E({ id: "family_loss", ages: [0, 90], w: 0, make: (g, ctx4) => ({ title: ctx4.title || "\u304A\u5225\u308C", text: ctx4.text + "\n\u901A\u591C\u30FB\u846C\u5100\u306B\u53C2\u5217\u3059\u308B\u304B\u3001\u9759\u304B\u306B\u898B\u9001\u308B\u304B\u3092\u9078\u3079\u307E\u3059\u3002", choices: [
    { label: "\u901A\u591C\u30FB\u846C\u5100\u306B\u53C2\u5217\u3059\u308B(\u9999\u5178\u30FB\u8EAB\u652F\u5EA6)", apply: (g2) => {
      const near2 = ctx4.id === g2.hero.mother || ctx4.id === g2.hero.father || g2.hero.rel[ctx4.id]?.family;
      const fee = g2.yen(near2 ? 12e4 : 3e4);
      g2.pay(Math.min(fee, Math.max(0, g2.hero.money)), near2 ? "\u846C\u5100\u306E\u8CBB\u7528(\u5BB6\u65CF\u306E\u5206\u62C5)" : "\u9999\u5178");
      g2.advance(600);
      memorial(g2, ctx4.id);
      bump(g2, "funeral", 1);
      g2.log("family", `${g2.nameOf(ctx4.id)}\u306E\u846C\u5100\u306B\u53C2\u5217\u3057\u305F`);
      return "\u6700\u5F8C\u306E\u304A\u5225\u308C\u3092\u3057\u307E\u3057\u305F\u3002\u5BB6\u65CF\u3084\u77E5\u4EBA\u3068\u601D\u3044\u51FA\u3092\u8A9E\u308A\u5408\u3044\u3001\u6C17\u6301\u3061\u304C\u5C11\u3057\u6574\u7406\u3055\u308C\u307E\u3057\u305F\u3002" + g2.chg({ mood: -8, social: 3 });
    } },
    { label: "\u9759\u304B\u306B\u898B\u9001\u308B", apply: (g2) => {
      memorial(g2, ctx4.id);
      return g2.chg({ mood: -12, social: 1 });
    } }
  ], auto: 0 }) });
  E({ id: "grave_visit", ages: [10, 100], w: 4, cond: (g) => !!(g.hero.memorial && g.hero.memorial.length) && ([2, 7, 8].includes(g.month0()) || g.hero.memorial.some((x) => x.M % 12 === g.month0() && g.S.M - x.M >= 6)), make: (g, ctx4, rng) => {
    const L2 = g.hero.memorial.filter((x) => g.S.M - x.M >= 6 && ([2, 7, 8].includes(g.month0()) || x.M % 12 === g.month0()));
    if (!ctx4.name) {
      const pick5 = L2.length ? L2[rng.int(L2.length)] : g.hero.memorial[0];
      ctx4.name = pick5.name;
      ctx4.id = pick5.id;
      ctx4.anniv = pick5.M % 12 === g.month0();
    }
    const why = ctx4.anniv ? `${ctx4.name}\u306E\u547D\u65E5\u306E\u6708\u3067\u3059\u3002` : g.month0() === 7 ? "\u304A\u76C6\u306E\u5B63\u7BC0\u3067\u3059\u3002" : "\u304A\u5F7C\u5CB8\u306E\u5B63\u7BC0\u3067\u3059\u3002";
    return { title: "\u5893\u53C2\u308A", text: `${why}${ctx4.name}\u306E\u304A\u5893\u306B\u624B\u3092\u5408\u308F\u305B\u306B\u884C\u304D\u307E\u305B\u3093\u304B\u3002`, choices: [
      { label: "\u5893\u53C2\u308A\u306B\u884C\u304F(\u82B1\u30FB\u7DDA\u9999)", apply: (g2) => {
        g2.pay(g2.yen(2500), "\u5893\u53C2\u308A\u306E\u82B1\u30FB\u7DDA\u9999");
        g2.advance(120);
        bump(g2, "graveVisit", 1);
        g2.log("family", `${ctx4.name}\u306E\u5893\u53C2\u308A\u3092\u3057\u305F`);
        return "\u304A\u5893\u3092\u304D\u308C\u3044\u306B\u3057\u3066\u3001\u624B\u3092\u5408\u308F\u305B\u307E\u3057\u305F\u3002\u5FC3\u304C\u3059\u3063\u3068\u9759\u304B\u306B\u306A\u308A\u307E\u3059\u3002" + g2.chg({ mood: 4, social: 1 });
      } },
      { label: "\u4ECA\u56DE\u306F\u884C\u304B\u306A\u3044", apply: (g2) => g2.chg({ mood: -1 }) }
    ], auto: 0 };
  } });
  E({ id: "inheritance", ages: [30, 90], w: 0, make: (g, ctx4) => ({ title: "\u907A\u7523\u30FB\u5F62\u898B", text: `${ctx4.name}\u306E\u907A\u54C1\u306E\u6574\u7406\u304C\u3042\u308A\u307E\u3057\u305F\u3002\u5F62\u898B\u3068\u5C11\u3057\u306E\u907A\u7523(${fmt(ctx4.amount)})\u3092\u53D7\u3051\u53D6\u308A\u307E\u3057\u305F\u3002`, choices: [{ label: "\u53D7\u3051\u53D6\u308B", apply: (g2) => {
    g2.earn(ctx4.amount, "\u76F8\u7D9A");
    return "";
  } }], auto: 0 }) });
  E({ id: "info", ages: [0, 120], w: 0, make: (g, ctx4) => ({ title: ctx4.title || "\u304A\u77E5\u3089\u305B", text: ctx4.text, choices: OK, auto: 0 }) });
  E({ id: "job_lost", ages: [16, 90], w: 0, make: (g, ctx4) => ({ title: "\u8077\u5834\u304C\u306A\u304F\u306A\u3063\u305F", text: ctx4.text || "\u52E4\u3081\u5148\u306E\u4E8B\u60C5\u3067\u4ED5\u4E8B\u3092\u7D9A\u3051\u3089\u308C\u306A\u304F\u306A\u308A\u307E\u3057\u305F\u3002\u5E02\u5F79\u6240\u306E\u63B2\u793A\u677F\u3084\u5404\u304A\u5E97\u3067\u6B21\u306E\u4ED5\u4E8B\u3092\u63A2\u305B\u307E\u3059\u3002", choices: [{ label: "\u6B21\u3092\u63A2\u3059", apply: (g2) => g2.chg({ mood: -4 }) }], auto: 0 }) });
  E({ id: "graduation", ages: [3, 30], months: [2], w: 0, make: (g, ctx4) => ({ title: ctx4.title, text: ctx4.text, choices: OK, auto: 0 }) });
  E({ id: "exam_result", ages: [14, 30], w: 0, ask: false, make: (g, ctx4) => ({ title: ctx4.title, text: ctx4.text, choices: OK, auto: 0 }) });
  E({ id: "ronin", ages: [18, 19], w: 0, ask: true, make: (g, ctx4) => ({ title: "\u53D7\u9A13\u306E\u7D50\u679C", text: "\u6B8B\u5FF5\u306A\u304C\u3089\u4E0D\u5408\u683C\u3067\u3057\u305F\u3002\u6B21\u3092\u3069\u3046\u3057\u307E\u3059\u304B?", choices: [{ label: "1\u5E74\u9593\u304C\u3093\u3070\u3063\u3066\u518D\u53D7\u9A13\u3059\u308B", apply: (g2) => {
    g2.hero.flags.path18 = "ronin";
    g2.hero.flags.ronin = 1;
    g2.log("plan", "\u6D6A\u4EBA\u3057\u3066\u518D\u53D7\u9A13\u3092\u76EE\u6307\u3057\u305F");
    return g2.chg({ mood: -3, intel: 4 });
  } }, { label: "\u5C31\u8077\u3059\u308B", apply: (g2) => {
    g2.hero.flags.path18 = "work";
    return g2.chg({ mood: -2 });
  } }, { label: "\u30A2\u30EB\u30D0\u30A4\u30C8\u3067\u8003\u3048\u308B", apply: (g2) => {
    g2.hero.flags.path18 = "free";
    return "";
  } }], auto: 1 }) });
  E({ id: "move_out", ages: [18, 45], w: 4, cond: (g) => g.hero.homeIsParents && g.hero.job && !g.hero.spouse && g.hero.money > g.yen(3e5), ask: true, make: (g) => ({ title: "\u3072\u3068\u308A\u66AE\u3089\u3057", text: "\u4ED5\u4E8B\u3082\u843D\u3061\u7740\u3044\u3066\u304D\u307E\u3057\u305F\u3002\u3072\u3068\u308A\u66AE\u3089\u3057\u3092\u306F\u3058\u3081\u307E\u3059\u304B?(\u5E02\u5F79\u6240\u3067\u4F4F\u307E\u3044\u3092\u63A2\u305B\u307E\u3059)", choices: [{ label: "\u4F4F\u307E\u3044\u3092\u63A2\u3059", apply: (g2) => {
    g2.hero.flags.wantMove = true;
    return "";
  } }, { label: "\u3082\u3046\u5C11\u3057\u5B9F\u5BB6\u306B\u3044\u308B", apply: (g2) => "" }], auto: 1 }) });
  E({ id: "ward_admit", ages: [0, 120], w: 0, make: (g, ctx4) => ({ title: "\u5165\u9662", text: `${ctx4.name || "\u75C5\u6C17"}\u306E\u305F\u3081\u5165\u9662\u3059\u308B\u3053\u3068\u306B\u306A\u308A\u307E\u3057\u305F\u3002\u6CBB\u7642\u3068\u5B89\u9759\u304C\u6700\u512A\u5148\u3067\u3059\u3002\u5165\u9662\u8CBB\u306F\u81EA\u5DF1\u8CA0\u62C5\u5206\u306E\u307F\u304B\u304B\u308A\u307E\u3059\u3002`, choices: [{ label: "\u3086\u3063\u304F\u308A\u4F11\u3080", apply: (g2) => g2.chg({ mood: -2 }) }], auto: 0 }) });
  var EVENT_LIST = Object.values(EVENTS);
  E({ id: "world_note", ages: [0, 120], w: 0, make: (g, ctx4) => ({ title: ctx4.title || "\u8857\u306E\u3067\u304D\u3054\u3068", text: ctx4.text, choices: OK, auto: 0 }) });
  E({ id: "adult_end", ages: [0, 120], w: 0, make: (g) => ({ title: "\u3072\u3068\u3064\u306E\u4EBA\u751F\u306E\u7D42\u308F\u308A", text: "\u9577\u3044\u7269\u8A9E\u304C\u3001\u9759\u304B\u306B\u7D42\u308F\u308D\u3046\u3068\u3057\u3066\u3044\u307E\u3059\u3002", choices: OK, auto: 0 }) });
  E({ id: "chore", ages: [4, 17], w: 3, make: (g) => ({ title: "\u304A\u624B\u4F1D\u3044", text: "\u304A\u6BCD\u3055\u3093(\u304A\u7236\u3055\u3093)\u304B\u3089\u3001\u304A\u624B\u4F1D\u3044\u3092\u305F\u306E\u307E\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u3059\u308B(\u304A\u3053\u3065\u304B\u3044+)", apply: (g2) => {
    g2.earn(g2.yen(300), "\u304A\u624B\u4F1D\u3044");
    return g2.chg({ mood: 2, social: 1 });
  } }, { label: "\u3053\u3068\u308F\u308B", apply: (g2) => g2.chg({ mood: 1 }) }], auto: 0 }) });
  E({ id: "exam_period", ages: [9, 19], months: [5, 10], w: 4, make: (g) => ({ title: "\u5B9A\u671F\u30C6\u30B9\u30C8", text: "\u30C6\u30B9\u30C8\u671F\u9593\u3067\u3059\u3002", choices: [{ label: "\u3057\u3063\u304B\u308A\u52C9\u5F37\u3059\u308B", apply: (g2) => {
    g2.hero.study = Math.min(100, g2.hero.study + 15);
    return g2.chg({ intel: 2, mood: -1 });
  } }, { label: "\u307B\u3069\u307B\u3069\u306B\u3059\u308B", apply: (g2) => g2.chg({ intel: 1 }) }], auto: 0 }) });
  E({ id: "neighbor", ages: [6, 90], w: 3, make: (g) => ({ title: "\u3054\u8FD1\u6240\u3065\u304D\u3042\u3044", text: "\u3068\u306A\u308A\u306E\u4EBA\u304C\u3001\u304A\u3059\u305D\u308F\u3051\u3092\u304F\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u304A\u793C\u3092\u3044\u3046", apply: (g2) => g2.chg({ social: 2, mood: 2 }) }], auto: 0 }) });
  E({ id: "overtime", ages: [20, 64], w: 3, cond: (g) => !!g.hero.job, make: (g) => ({ title: "\u4ED5\u4E8B\u304C\u3044\u305D\u304C\u3057\u3044", text: "\u7E41\u5FD9\u671F\u3067\u3001\u6B8B\u696D\u3092\u305F\u306E\u307E\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u5F15\u304D\u53D7\u3051\u308B(\u624B\u5F53\u3042\u308A)", apply: (g2) => {
    g2.earn(g2.yen(25e3), "\u6B8B\u696D\u624B\u5F53");
    return g2.chg({ energy: -10, health: -2, mood: -2 });
  } }, { label: "\u5B9A\u6642\u3067\u5E30\u308B", apply: (g2) => g2.chg({ mood: 2 }) }], auto: 1 }) });
  E({ id: "grandchild", ages: [45, 90], w: 0, make: (g, ctx4) => ({ title: "\u5B6B\u304C\u751F\u307E\u308C\u305F", text: `${g.nameOf(ctx4.child)}\u304C\u751F\u307E\u308C\u307E\u3057\u305F\u3002\u3042\u306A\u305F\u306B\u5B6B\u304C\u3067\u304D\u307E\u3057\u305F\u3002`, choices: OK, auto: 0 }) });
  E({ id: "hobby_club", ages: [18, 70], w: 2, once: true, make: (g) => ({ title: "\u8DA3\u5473\u306E\u30B5\u30FC\u30AF\u30EB", text: "\u5730\u57DF\u306E\u8DA3\u5473\u306E\u30B5\u30FC\u30AF\u30EB\u306B\u8A98\u308F\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u53C2\u52A0\u3059\u308B", apply: (g2) => {
    for (let k = 0; k < 3; k++) g2.meetRandomResident(6);
    return g2.chg({ social: 4, mood: 4 });
  } }, { label: "\u4ECA\u56DE\u306F\u898B\u9001\u308B", apply: (g2) => "" }], auto: 0 }) });
  E({ id: "caregiving", ages: [45, 70], w: 0, ask: false, make: (g, ctx4) => ({ title: "\u89AA\u306E\u4ECB\u8B77", text: `${g.nameOf(ctx4.p)}\u306E\u4F53\u304C\u5F31\u3063\u3066\u304D\u307E\u3057\u305F\u3002\u4ECB\u8B77\u65BD\u8A2D\u3084\u5730\u57DF\u306E\u652F\u63F4(\u969C\u5BB3\u798F\u7949\u30FB\u4ECB\u8B77\u306E\u7A93\u53E3)\u3082\u4F7F\u3044\u306A\u304C\u3089\u3001\u7121\u7406\u306A\u304F\u652F\u3048\u3066\u3044\u304D\u307E\u3059\u3002`, choices: [{ label: "\u65BD\u8A2D\u30FB\u652F\u63F4\u30B5\u30FC\u30D3\u30B9\u3092\u5229\u7528\u3059\u308B", apply: (g2) => {
    g2.pay(g2.yen(4e4), "\u4ECB\u8B77\u30B5\u30FC\u30D3\u30B9");
    return g2.chg({ mood: -2, social: 1 });
  } }, { label: "\u81EA\u5B85\u3067\u6642\u9593\u3092\u3064\u304F\u3063\u3066\u652F\u3048\u308B", apply: (g2) => g2.chg({ energy: -8, health: -3, social: 2 }) }], auto: 0 }) });
  E({ id: "wedding_anniv", ages: [30, 90], months: [5], w: 2, cond: (g) => g.hero.spouse != null, make: (g) => ({ title: "\u7D50\u5A5A\u8A18\u5FF5\u65E5", text: "\u3075\u305F\u308A\u306E\u7D50\u5A5A\u8A18\u5FF5\u65E5\u3067\u3059\u3002", choices: [{ label: "\u3055\u3055\u3084\u304B\u306B\u98DF\u4E8B\u306B\u3044\u304F", apply: (g2) => {
    g2.pay(g2.yen(8e3), "\u8A18\u5FF5\u65E5\u306E\u98DF\u4E8B");
    const s = g2.hero.spouse;
    if (s != null) g2.meet(s, 6);
    return g2.chg({ mood: 8, social: 1 });
  } }, { label: "\u624B\u7D19\u3092\u308F\u305F\u3059", apply: (g2) => g2.chg({ mood: 5 }) }], auto: 0 }) });
  E({ id: "sudden_rain", ages: [3, 90], w: 1.5, make: (g) => ({ title: "\u3068\u3064\u305C\u3093\u306E\u96E8", text: "\u5E30\u308A\u9053\u3067\u3001\u6025\u306B\u96E8\u304C\u3075\u308A\u3060\u3057\u307E\u3057\u305F\u3002", choices: [{ label: "\u96E8\u3084\u3069\u308A\u3092\u3059\u308B", apply: (g2) => g2.chg({ mood: 1 }) }, { label: "\u306C\u308C\u3066\u8D70\u3063\u3066\u5E30\u308B", apply: (g2) => g2.chg({ health: -1, mood: 2, fitness: 1 }) }], auto: 0 }) });
  E({ id: "good_teacher", ages: [6, 17], w: 3, make: (g) => ({ title: "\u307B\u3081\u3089\u308C\u305F", text: "\u5148\u751F\u306B\u300C\u3088\u304F\u304C\u3093\u3070\u3063\u3066\u3044\u308B\u306D\u300D\u3068\u307B\u3081\u3089\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u3046\u308C\u3057\u3044!", apply: (g2) => g2.chg({ mood: 5, intel: 1 }) }], auto: 0 }) });
  E({ id: "festival_autumn", ages: [3, 90], months: [9], w: 4, make: (g) => ({ title: "\u79CB\u796D\u308A", text: "\u8857\u3067\u79CB\u306E\u307E\u3064\u308A\u304C\u958B\u304B\u308C\u3066\u3044\u307E\u3059\u3002", choices: [{ label: "\u898B\u306B\u884C\u304F", apply: (g2) => g2.chg({ mood: 4, social: 1 }) }], auto: 0 }) });
  E({ id: "snow", ages: [3, 90], months: [0, 1, 11], w: 3, make: (g) => ({ title: "\u96EA", text: "\u671D\u304A\u304D\u305F\u3089\u3001\u8857\u304C\u3046\u3063\u3059\u3089\u3068\u767D\u304F\u306A\u3063\u3066\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u96EA\u306E\u306A\u304B\u3092\u6B69\u304F", apply: (g2) => g2.chg({ mood: 4, health: -1 }) }], auto: 0 }) });
  E({ id: "cherry", ages: [0, 90], months: [3], w: 8, make: (g) => ({ title: "\u304A\u82B1\u898B", text: "\u685C\u304C\u6E80\u958B\u3067\u3059\u3002", choices: [{ label: "\u304A\u82B1\u898B\u306B\u884C\u304F", apply: (g2) => g2.chg({ mood: 6, social: 1 }) }], auto: 0 }) });
  E({ id: "christmas", ages: [3, 90], months: [11], w: 6, make: (g) => ({ title: "\u30AF\u30EA\u30B9\u30DE\u30B9", text: "\u8857\u304C\u30A4\u30EB\u30DF\u30CD\u30FC\u30B7\u30E7\u30F3\u3067\u304B\u304C\u3084\u3044\u3066\u3044\u307E\u3059\u3002", choices: [{ label: "\u5BB6\u65CF\u3084\u53CB\u4EBA\u3068\u904E\u3054\u3059", apply: (g2) => {
    g2.pay(g2.yen(3e3), "\u30AF\u30EA\u30B9\u30DE\u30B9");
    return g2.chg({ mood: 6, social: 2 });
  } }, { label: "\u3072\u3068\u308A\u3067\u9759\u304B\u306B\u904E\u3054\u3059", apply: (g2) => g2.chg({ mood: 1 }) }], auto: 0 }) });
  E({ id: "summer_vacation", ages: [6, 17], months: [7], w: 6, make: (g) => ({ title: "\u590F\u4F11\u307F", text: "\u590F\u4F11\u307F\u304C\u306F\u3058\u307E\u308A\u307E\u3057\u305F!", choices: [{ label: "\u5BBF\u984C\u3092\u3059\u3053\u3057\u305A\u3064\u9032\u3081\u308B", apply: (g2) => g2.chg({ intel: 3, mood: 1 }) }, { label: "\u6D77\u3084\u5DDD\u3067\u3042\u305D\u3076", apply: (g2) => g2.chg({ fitness: 3, mood: 6, social: 2 }) }], auto: 1 }) });
  E({ id: "hero_end", ages: [0, 120], w: 0, make: (g, ctx4) => ({ title: ctx4.title || "", text: ctx4.text || "", choices: OK, auto: 0 }) });
  var MONTHLY_POOL = () => Object.values(EVENTS).filter((e) => e.w > 0);
  E({ id: "quarrel", ages: [25, 80], w: 2, cond: (g) => g.hero.spouse != null, make: (g) => ({ title: "\u3061\u3087\u3063\u3068\u3057\u305F\u3051\u3093\u304B", text: "\u4E9B\u7D30\u306A\u3053\u3068\u3067\u8A00\u3044\u5408\u3044\u306B\u306A\u3063\u3066\u3057\u307E\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u307E\u305A\u81EA\u5206\u304B\u3089\u8B1D\u3063\u3066\u8A71\u3057\u5408\u3046", apply: (g2) => {
    const s = g2.hero.spouse;
    if (s != null) g2.meet(s, 4);
    return g2.chg({ mood: 2, social: 1 });
  } }, { label: "\u5C11\u3057\u6642\u9593\u3092\u304A\u304F", apply: (g2) => g2.chg({ mood: -2 }) }], auto: 0 }) });
  E({ id: "wage_raise", ages: [20, 64], w: 3, months: [3], cond: (g) => !!g.hero.job && g.jobYears() >= 1, make: (g) => ({ title: "\u6607\u7D66", text: "\u6625\u306E\u6607\u7D66\u304C\u3042\u308A\u307E\u3057\u305F\u3002", choices: [{ label: "\u3046\u308C\u3057\u3044", apply: (g2) => {
    g2.hero.job.rank = (g2.hero.job.rank || 0) + 0.25;
    return g2.chg({ mood: 4 });
  } }], auto: 0 }) });
  E({ id: "gift_friend", ages: [6, 80], w: 3, make: (g) => {
    const f2 = g.randomKnownFriend();
    if (f2 == null) return null;
    return { title: "\u53CB\u3060\u3061\u306E\u8A95\u751F\u65E5", text: `${g.nameOf(f2)}\u306E\u8A95\u751F\u65E5\u304C\u8FD1\u3044\u3067\u3059\u3002`, ctx: { f: f2 }, choices: [{ label: "\u30D7\u30EC\u30BC\u30F3\u30C8\u3092\u8D08\u308B(\xA5" + yen(g, 1500) + ")", apply: (g2) => {
      g2.pay(yen(g2, 1500), "\u30D7\u30EC\u30BC\u30F3\u30C8");
      g2.meet(f2, 8);
      return g2.chg({ mood: 3 });
    } }, { label: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3060\u3051\u9001\u308B", apply: (g2) => {
      g2.meet(f2, 3);
      return "";
    } }], auto: 1 };
  } });
  E({ id: "old_friend_met", ages: [20, 90], w: 3, make: (g) => {
    const f2 = g.randomKnownFriend();
    if (f2 == null) return null;
    return { title: "\u8857\u3067\u306E\u518D\u4F1A", text: `\u99C5\u306E\u8FD1\u304F\u3067${g.nameOf(f2)}\u306B\u3070\u3063\u305F\u308A\u4F1A\u3044\u307E\u3057\u305F\u3002`, ctx: { f: f2 }, choices: [{ label: "\u7ACB\u3061\u8A71\u3092\u3059\u308B", apply: (g2) => {
      g2.meet(f2, 6);
      return g2.chg({ mood: 4, social: 1 });
    } }], auto: 0 };
  } });
  E({ id: "study_group", ages: [13, 22], w: 3, make: (g) => ({ title: "\u52C9\u5F37\u4F1A", text: "\u53CB\u3060\u3061\u306B\u300C\u3044\u3063\u3057\u3087\u306B\u52C9\u5F37\u3057\u3088\u3046\u300D\u3068\u3055\u305D\u308F\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u53C2\u52A0\u3059\u308B", apply: (g2) => {
    const c = g2.randomClassmate();
    if (c != null) g2.meet(c, 6);
    return g2.chg({ intel: 3, social: 2 });
  } }, { label: "\u3072\u3068\u308A\u3067\u3084\u308B", apply: (g2) => g2.chg({ intel: 2 }) }], auto: 0 }) });
  E({ id: "mentor", ages: [20, 55], w: 2, cond: (g) => !!g.hero.job, make: (g) => ({ title: "\u5148\u8F29\u306E\u30A2\u30C9\u30D0\u30A4\u30B9", text: "\u8077\u5834\u306E\u5148\u8F29\u304C\u3001\u4ED5\u4E8B\u306E\u30B3\u30C4\u3092\u6559\u3048\u3066\u304F\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u7D20\u76F4\u306B\u5B66\u3076", apply: (g2) => {
    g2.hero.skills[g2.hero.job.skill] = Math.min(100, (g2.hero.skills[g2.hero.job.skill] || 0) + 4);
    return g2.chg({ social: 2, mood: 2 });
  } }], auto: 0 }) });
  E({ id: "baby_sit", ages: [14, 30], w: 1, make: (g) => ({ title: "\u304A\u3068\u306A\u308A\u306E\u8D64\u3061\u3083\u3093", text: "\u3054\u8FD1\u6240\u306E\u8D64\u3061\u3083\u3093\u306E\u5B50\u5B88\u308A\u3092\u305F\u306E\u307E\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u5F15\u304D\u53D7\u3051\u308B", apply: (g2) => {
    g2.earn(g2.yen(2e3), "\u5B50\u5B88\u308A\u306E\u304A\u793C");
    return g2.chg({ social: 2, charm: 1 });
  } }], auto: 0 }) });
  E({ id: "library_visit", ages: [8, 80], w: 2, make: (g) => ({ title: "\u56F3\u66F8\u9928\u3067", text: "\u56F3\u66F8\u9928\u3067\u3001\u304A\u3082\u3057\u308D\u305D\u3046\u306A\u672C\u3092\u898B\u3064\u3051\u307E\u3057\u305F\u3002", choices: [{ label: "\u501F\u308A\u3066\u8AAD\u3080", apply: (g2) => g2.chg({ intel: 2, mood: 2 }) }], auto: 0 }) });
  E({ id: "wedding_guest", ages: [20, 60], w: 1.5, make: (g) => ({ title: "\u53CB\u4EBA\u306E\u7D50\u5A5A\u5F0F", text: "\u53CB\u4EBA\u306E\u7D50\u5A5A\u5F0F\u306B\u62DB\u304B\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u51FA\u5E2D\u3059\u308B(\xA5" + yen(g, 3e4) + ")", apply: (g2) => {
    g2.pay(yen(g2, 3e4), "\u3054\u795D\u5100");
    return g2.chg({ mood: 6, social: 3 });
  } }, { label: "\u304A\u795D\u3044\u3060\u3051\u8D08\u308B", apply: (g2) => {
    g2.pay(yen(g2, 1e4), "\u304A\u795D\u3044");
    return g2.chg({ mood: 1 });
  } }], auto: 0 }) });
  E({ id: "elder_care_visit", ages: [60, 90], w: 2, make: (g) => ({ title: "\u75C5\u9662\u306E\u5F85\u5408\u5BA4", text: "\u5B9A\u671F\u306E\u901A\u9662\u65E5\u3067\u3059\u3002\u540C\u3058\u5E74\u3054\u308D\u306E\u4EBA\u305F\u3061\u3068\u4E16\u9593\u8A71\u3092\u3057\u307E\u3057\u305F\u3002", choices: [{ label: "\u306E\u3093\u3073\u308A\u8A71\u3059", apply: (g2) => g2.chg({ social: 2, mood: 2, health: 1 }) }], auto: 0 }) });
  E({ id: "lucky_draw", ages: [10, 90], w: 1, make: (g) => ({ title: "\u5546\u5E97\u8857\u306E\u798F\u5F15", text: "\u5546\u5E97\u8857\u306E\u798F\u5F15\u5238\u3092\u3082\u3089\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u5F15\u3044\u3066\u307F\u308B", apply: (g2) => {
    const r = g2.rngInt(100);
    if (r < 5) {
      g2.earn(g2.yen(3e4), "\u798F\u5F15");
      return "\u6E29\u6CC9\u5BBF\u6CCA\u5238(\u63DB\u91D1\xA530,000)\u304C\u5F53\u305F\u3063\u305F!";
    }
    if (r < 30) {
      g2.earn(g2.yen(1e3), "\u798F\u5F15");
      return "\u5546\u54C1\u5238(\xA51,000)\u304C\u5F53\u305F\u3063\u305F\u3002";
    }
    return "\u30C6\u30A3\u30C3\u30B7\u30E5\u3060\u3063\u305F\u3002";
  } }], auto: 0 }) });
  E({ id: "skill_contest", ages: [12, 60], w: 1.5, make: (g) => ({ title: "\u6280\u80FD\u306E\u8155\u8A66\u3057", text: "\u306A\u306B\u304B\u3092\u6975\u3081\u3066\u307F\u305F\u304F\u306A\u308A\u307E\u3057\u305F\u3002", choices: [{ label: "\u7DF4\u7FD2\u3092\u304C\u3093\u3070\u308B", apply: (g2) => g2.chg({ intel: 1, fitness: 1, charm: 1, mood: 2 }) }], auto: 0 }) });
  E({ id: "midlife_change", ages: [38, 55], w: 1.5, cond: (g) => !!g.hero.job, make: (g) => ({ title: "\u3053\u306E\u5148\u306E\u50CD\u304D\u65B9", text: "\u3053\u308C\u304B\u3089\u5148\u306E\u50CD\u304D\u65B9\u3092\u8003\u3048\u308B\u6642\u671F\u3067\u3059\u3002", choices: [{ label: "\u4ECA\u306E\u4ED5\u4E8B\u3092\u7D9A\u3051\u308B", apply: (g2) => g2.chg({ mood: 1 }) }, { label: "\u8EE2\u8077\u3092\u63A2\u3059(\u5E02\u5F79\u6240\u306E\u6C42\u4EBA\u30FB\u5404\u304A\u5E97\u3078)", apply: (g2) => {
    g2.hero.flags.wantJob = true;
    return "";
  } }], auto: 0 }) });
  E({ id: "accident_minor", ages: [5, 80], w: 1.5, make: (g) => ({ title: "\u3061\u3087\u3063\u3068\u3057\u305F\u30B1\u30AC", text: "\u3064\u307E\u305A\u3044\u3066\u3001\u3072\u3056\u3092\u3059\u308A\u3080\u3044\u3066\u3057\u307E\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u624B\u5F53\u3066\u3092\u3059\u308B", apply: (g2) => g2.chg({ health: -2, mood: -1 }) }], auto: 0 }) });
  E({ id: "new_neighbor", ages: [6, 90], w: 2, make: (g) => ({ title: "\u5F15\u3063\u8D8A\u3057\u3066\u304D\u305F\u4EBA", text: "\u8FD1\u6240\u306B\u65B0\u3057\u3044\u5BB6\u65CF\u304C\u5F15\u3063\u8D8A\u3057\u3066\u304D\u307E\u3057\u305F\u3002", choices: [{ label: "\u3042\u3044\u3055\u3064\u306B\u884C\u304F", apply: (g2) => {
    g2.meetRandomResident(8);
    return g2.chg({ social: 2 });
  } }], auto: 0 }) });
  E({ id: "second_chance", ages: [20, 60], w: 0, make: (g) => ({ title: "\u65B0\u3057\u3044\u51FA\u767A", text: "\u4ED5\u4E8B\u3092\u5931\u3063\u305F\u3042\u3068\u3001\u5468\u308A\u306E\u52A9\u3051\u3082\u3042\u3063\u3066\u65B0\u3057\u3044\u4E00\u6B69\u3092\u8E0F\u307F\u51FA\u3057\u307E\u3057\u305F\u3002", choices: [{ label: "\u524D\u3092\u5411\u304F", apply: (g2) => g2.chg({ mood: 6, charm: 2 }) }], auto: 0 }) });
  E({ id: "baby_name", ages: [20, 60], w: 0, make: (g, ctx4) => ({ title: ctx4.title, text: ctx4.text, choices: OK, auto: 0 }) });
  E({ id: "bonus", ages: [20, 64], months: [5, 11], w: 6, cond: (g) => !!g.hero.job && g.jobYears() >= 1 && g.hero.job.jobId !== "farmer", make: (g) => ({ title: "\u30DC\u30FC\u30CA\u30B9", text: `\u8CDE\u4E0E\u304C\u652F\u7D66\u3055\u308C\u307E\u3057\u305F\u3002`, choices: [{ label: "\u8CAF\u91D1\u3059\u308B", apply: (g2) => {
    const a = g2.monthlyWage() * 1.2;
    g2.earn(a, "\u8CDE\u4E0E");
    return `+${fmt(a)}`;
  } }], auto: 0 }) });
  E({ id: "university_life", ages: [18, 23], w: 4, cond: (g) => g.hero.edu.level === 5, make: (g) => ({ title: "\u5927\u5B66\u751F\u6D3B", text: "\u30B5\u30FC\u30AF\u30EB\u3084\u7814\u7A76\u5BA4\u306E\u4EF2\u9593\u3068\u3059\u3054\u3059\u65E5\u3005\u3067\u3059\u3002", choices: [{ label: "\u7814\u7A76\u30FB\u52C9\u5F37\u306B\u3046\u3061\u3053\u3080", apply: (g2) => g2.chg({ intel: 4, mood: 1 }) }, { label: "\u30B5\u30FC\u30AF\u30EB\u3084\u53CB\u4EBA\u3068\u306E\u6642\u9593\u3092\u5927\u5207\u306B\u3059\u308B", apply: (g2) => {
    const c = g2.randomClassmate();
    if (c != null) g2.meet(c, 8);
    return g2.chg({ social: 4, mood: 4 });
  } }], auto: 1 }) });
  E({ id: "work_trouble", ages: [18, 64], w: 3, cond: (g) => !!g.hero.job, make: (g) => ({ title: "\u4ED5\u4E8B\u306E\u30DF\u30B9", text: "\u4ED5\u4E8B\u3067\u5C0F\u3055\u306A\u30DF\u30B9\u3092\u3057\u3066\u3057\u307E\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u3059\u3050\u5831\u544A\u3057\u3066\u3001\u3044\u3063\u3057\u3087\u306B\u76F4\u3059", apply: (g2) => {
    g2.hero.skills[g2.hero.job.skill] = (g2.hero.skills[g2.hero.job.skill] || 0) + 2;
    return g2.chg({ mood: -1, social: 2 });
  } }, { label: "\u9ED9\u3063\u3066\u304A\u304F", apply: (g2) => g2.chg({ mood: -4, social: -2 }) }], auto: 0 }) });
  E({ id: "customer_thanks", ages: [16, 64], w: 3, cond: (g) => !!g.hero.job && ["clerk", "waitstaff", "hotelstaff", "cook"].includes(g.hero.job.jobId), make: (g) => ({ title: "\u304A\u5BA2\u3055\u3093\u304B\u3089\u306E\u304A\u793C", text: "\u304A\u5BA2\u3055\u3093\u306B\u300C\u3042\u308A\u304C\u3068\u3046\u3001\u52A9\u304B\u3063\u305F\u3088\u300D\u3068\u8A00\u3063\u3066\u3082\u3089\u3048\u307E\u3057\u305F\u3002", choices: [{ label: "\u3084\u308A\u304C\u3044\u3092\u611F\u3058\u308B", apply: (g2) => g2.chg({ mood: 6, charm: 1 }) }], auto: 0 }) });
  E({ id: "harvest", ages: [16, 70], months: [8, 9], w: 6, cond: (g) => !!g.hero.job && g.hero.job.jobId === "farmer", make: (g) => ({ title: "\u53CE\u7A6B\u306E\u79CB", text: "\u4F5C\u7269\u304C\u3088\u304F\u5B9F\u308A\u307E\u3057\u305F\u3002", choices: [{ label: "\u76F4\u58F2\u6240\u306B\u51FA\u3059", apply: (g2) => {
    g2.earn(g2.yen(6e4), "\u53CE\u7A6B");
    return g2.chg({ mood: 5 });
  } }], auto: 0 }) });
  E({ id: "big_catch", ages: [16, 70], w: 4, cond: (g) => !!g.hero.job && g.hero.job.jobId === "fisher", make: (g) => ({ title: "\u5927\u6F01", text: "\u4ECA\u65E5\u306F\u5927\u6F01\u3067\u3057\u305F\u3002", choices: [{ label: "\u9B5A\u5E02\u5834\u306B\u51FA\u3059", apply: (g2) => {
    g2.earn(g2.yen(5e4), "\u5927\u6F01");
    return g2.chg({ mood: 5, fitness: 1 });
  } }], auto: 0 }) });
  E({ id: "patient_thanks", ages: [20, 64], w: 3, cond: (g) => !!g.hero.job && ["nurse", "doctor", "caregiver"].includes(g.hero.job.jobId), make: (g) => ({ title: "\u60A3\u8005\u3055\u3093\u306E\u7B11\u9854", text: "\u60A3\u8005\u3055\u3093(\u5229\u7528\u8005\u3055\u3093)\u306E\u7B11\u9854\u306B\u652F\u3048\u3089\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u3082\u3046\u5C11\u3057\u304C\u3093\u3070\u308D\u3046", apply: (g2) => g2.chg({ mood: 5, social: 1 }) }], auto: 0 }) });
  E({ id: "student_exchange", ages: [12, 17], w: 2, make: (g) => ({ title: "\u7279\u5225\u652F\u63F4\u5B66\u6821\u3068\u306E\u4EA4\u6D41", text: "\u7279\u5225\u652F\u63F4\u5B66\u6821\u306E\u5150\u7AE5\u30FB\u751F\u5F92\u3068\u306E\u4EA4\u6D41\u4F1A\u304C\u3042\u308A\u307E\u3057\u305F\u3002\u305F\u304C\u3044\u306E\u5F97\u610F\u306A\u3053\u3068\u3092\u7D39\u4ECB\u3057\u5408\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u697D\u3057\u304F\u4EA4\u6D41\u3059\u308B", apply: (g2) => {
    g2.hero.flags.inclusion = 1;
    return g2.chg({ social: 3, charm: 2, mood: 4 });
  } }], auto: 0 }) });
  E({ id: "wheelchair_helper", ages: [10, 80], w: 2, make: (g) => ({ title: "\u8857\u3067\u56F0\u3063\u3066\u3044\u308B\u4EBA", text: "\u99C5\u3067\u3001\u6BB5\u5DEE\u306E\u3068\u3053\u308D\u3067\u5C11\u3057\u56F0\u3063\u3066\u3044\u308B\u4EBA\u304C\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u300C\u304A\u624B\u4F1D\u3044\u3057\u307E\u3057\u3087\u3046\u304B?\u300D\u3068\u58F0\u3092\u304B\u3051\u308B", apply: (g2) => {
    g2.hero.flags.helped = (g2.hero.flags.helped || 0) + 1;
    return g2.chg({ social: 3, mood: 3 }) + "(\u76F8\u624B\u306E\u5E0C\u671B\u3092\u805E\u3044\u3066\u304B\u3089\u624B\u4F1D\u3063\u305F)";
  } }, { label: "\u99C5\u54E1\u3055\u3093\u3092\u547C\u3076", apply: (g2) => g2.chg({ social: 1 }) }], auto: 0 }) });
  E({ id: "savings_goal", ages: [20, 60], w: 1.5, make: (g) => ({ title: "\u304A\u91D1\u306E\u4F7F\u3044\u65B9", text: "\u8CAF\u91D1\u306B\u3064\u3044\u3066\u8003\u3048\u307E\u3057\u305F\u3002", choices: [{ label: "\u5C11\u3057\u305A\u3064\u7A4D\u307F\u7ACB\u3066\u308B", apply: (g2) => {
    g2.hero.flags.saver = 1;
    return g2.chg({ mood: 1 });
  } }, { label: "\u597D\u304D\u306A\u3053\u3068\u306B\u4F7F\u3046", apply: (g2) => g2.chg({ mood: 3 }) }], auto: 0 }) });
  E({ id: "cooking_try", ages: [8, 70], w: 2, make: (g) => ({ title: "\u6599\u7406\u306B\u6311\u6226", text: "\u4ECA\u65E5\u306F\u81EA\u5206\u3067\u6599\u7406\u3092\u3064\u304F\u3063\u3066\u307F\u308B\u3053\u3068\u306B\u3057\u307E\u3057\u305F\u3002", choices: [{ label: "\u3064\u304F\u3063\u3066\u307F\u308B", apply: (g2) => {
    g2.hero.skills.cooking = Math.min(100, (g2.hero.skills.cooking || 0) + 3);
    return g2.chg({ mood: 3, charm: 1 });
  } }], auto: 0 }) });
  E({ id: "reading_habit", ages: [6, 80], w: 2, make: (g) => ({ title: "\u672C\u306E\u4E16\u754C", text: "\u5922\u4E2D\u306B\u306A\u308C\u308B\u672C\u306B\u51FA\u4F1A\u3044\u307E\u3057\u305F\u3002", choices: [{ label: "\u8AAD\u307F\u3075\u3051\u308B", apply: (g2) => g2.chg({ intel: 3, mood: 3 }) }], auto: 0 }) });
  E({ id: "walk_habit", ages: [30, 90], w: 2, make: (g) => ({ title: "\u671D\u306E\u6563\u6B69", text: "\u671D\u306E\u6563\u6B69\u3092\u65E5\u8AB2\u306B\u3057\u3088\u3046\u3068\u601D\u3044\u307E\u3059\u3002", choices: [{ label: "\u7D9A\u3051\u3066\u307F\u308B", apply: (g2) => g2.chg({ health: 3, fitness: 2, mood: 2 }) }], auto: 0 }) });
  E({ id: "sleepless", ages: [15, 80], w: 2, make: (g) => ({ title: "\u7720\u308C\u306A\u3044\u591C", text: "\u8003\u3048\u3054\u3068\u3067\u3001\u306A\u304B\u306A\u304B\u5BDD\u3064\u3051\u307E\u305B\u3093\u3002", choices: [{ label: "\u3042\u305F\u305F\u304B\u3044\u98F2\u307F\u7269\u3092\u98F2\u3093\u3067\u4F11\u3080", apply: (g2) => g2.chg({ energy: -5, mood: 0 }) }, { label: "\u4FE1\u983C\u3067\u304D\u308B\u4EBA\u306B\u8A71\u3092\u805E\u3044\u3066\u3082\u3089\u3046", apply: (g2) => {
    g2.meetRandomKnownFriend(4);
    return g2.chg({ mood: 3, social: 2 });
  } }], auto: 0 }) });
  E({ id: "mental_rest", ages: [16, 80], w: 1.5, cond: (g) => g.hero.stats.mood < 35, make: (g) => ({ title: "\u3053\u3053\u308D\u306E\u75B2\u308C", text: "\u3053\u306E\u3068\u3053\u308D\u6C17\u6301\u3061\u304C\u91CD\u304F\u3001\u75B2\u308C\u304C\u305F\u307E\u3063\u3066\u3044\u307E\u3059\u3002\u3053\u3053\u308D\u306E\u4E0D\u8ABF\u306F\u3001\u3060\u308C\u306B\u3067\u3082\u8D77\u3053\u308B\u3053\u3068\u3067\u3001\u4F11\u3093\u3060\u308A\u76F8\u8AC7\u3057\u305F\u308A\u3057\u3066\u56DE\u5FA9\u3067\u304D\u307E\u3059\u3002", choices: [{ label: "\u4F11\u307F\u3092\u3068\u3063\u3066\u5C02\u9580\u306E\u76F8\u8AC7\u7A93\u53E3\u30FB\u533B\u7642\u6A5F\u95A2\u306B\u76F8\u8AC7\u3059\u308B(\xA5" + yen(g, 5e3) + ")", apply: (g2) => {
    g2.pay(yen(g2, 5e3), "\u76F8\u8AC7\u30FB\u53D7\u8A3A");
    return g2.chg({ mood: 15, health: 4 });
  } }, { label: "\u5BB6\u65CF\u3084\u53CB\u4EBA\u306B\u8A71\u3092\u805E\u3044\u3066\u3082\u3089\u3046", apply: (g2) => {
    g2.meetRandomKnownFriend(5);
    return g2.chg({ mood: 8, social: 2 });
  } }], auto: 1 }) });
  E({ id: "spring_cleaning", ages: [10, 90], months: [11], w: 1, make: (g) => ({ title: "\u5927\u6383\u9664", text: "\u5E74\u672B\u306E\u5927\u6383\u9664\u3002", choices: [{ label: "\u304C\u3093\u3070\u308B", apply: (g2) => g2.chg({ fitness: 1, mood: 1 }) }], auto: 0 }) });
  E({ id: "rail_fan", ages: [5, 80], w: 1.5, make: (g) => ({ title: "\u96FB\u8ECA\u306E\u6642\u523B", text: "\u99C5\u306E\u30DB\u30FC\u30E0\u3067\u3001\u96FB\u8ECA\u304C\u6B21\u3005\u3068\u767A\u7740\u3059\u308B\u306E\u3092\u306A\u304C\u3081\u307E\u3057\u305F\u3002", choices: [{ label: "\u6642\u523B\u8868\u3092\u306A\u304C\u3081\u308B", apply: (g2) => g2.chg({ mood: 3 }) }], auto: 0 }) });
  E({ id: "town_walk", ages: [6, 90], w: 3, make: (g) => ({ title: "\u8857\u3092\u3076\u3089\u308A", text: "\u7528\u4E8B\u306E\u3042\u3044\u307E\u306B\u3001\u8857\u3092\u3076\u3089\u3076\u3089\u3068\u6B69\u304D\u307E\u3057\u305F\u3002\u65B0\u3057\u3044\u767A\u898B\u304C\u3042\u308B\u304B\u3082\u3057\u308C\u307E\u305B\u3093\u3002", choices: [{ label: "\u6C17\u307E\u307E\u306B\u6B69\u304F", apply: (g2) => {
    g2.meetRandomResident(3);
    return g2.chg({ mood: 3, fitness: 1 });
  } }], auto: 0 }) });
  E({ id: "blood_donation", ages: [18, 65], w: 1, make: (g) => ({ title: "\u732E\u8840", text: "\u99C5\u524D\u3067\u732E\u8840\u3092\u547C\u3073\u304B\u3051\u3066\u3044\u307E\u3059\u3002", choices: [{ label: "\u5354\u529B\u3059\u308B", apply: (g2) => g2.chg({ social: 2, mood: 2, energy: -3 }) }, { label: "\u4ECA\u56DE\u306F\u898B\u9001\u308B", apply: (g2) => "" }], auto: 1 }) });
  E({ id: "garden", ages: [30, 90], w: 1.5, make: (g) => ({ title: "\u5EAD\u30FB\u30D9\u30E9\u30F3\u30C0", text: "\u82B1\u3092\u80B2\u3066\u308B\u697D\u3057\u307F\u304C\u5897\u3048\u307E\u3057\u305F\u3002", choices: [{ label: "\u4E16\u8A71\u3092\u3059\u308B", apply: (g2) => g2.chg({ mood: 3 }) }], auto: 0 }) });
  E({ id: "cultural_festival", ages: [15, 17], months: [10], w: 8, make: (g) => ({ title: "\u6587\u5316\u796D", text: "\u9AD8\u6821\u306E\u6587\u5316\u796D\u3067\u3059\u3002", choices: [{ label: "\u30AF\u30E9\u30B9\u306E\u51FA\u3057\u7269\u3092\u304C\u3093\u3070\u308B", apply: (g2) => {
    const c = g2.randomClassmate();
    if (c != null) g2.meet(c, 6);
    return g2.chg({ social: 4, mood: 6, charm: 1 });
  } }], auto: 0 }) });
  E({ id: "seasonal_trip_family", ages: [3, 17], months: [7, 3], w: 3, make: (g) => ({ title: "\u5BB6\u65CF\u3067\u304A\u51FA\u304B\u3051", text: "\u9031\u672B\u306B\u5BB6\u65CF\u3067\u304A\u51FA\u304B\u3051\u3057\u307E\u3057\u305F\u3002", choices: [{ label: "\u697D\u3057\u3080", apply: (g2) => g2.chg({ mood: 6, social: 1 }) }], auto: 0 }) });
  E({ id: "aquarium_trip", ages: [3, 14], w: 2, make: (g) => ({ title: "\u6C34\u65CF\u9928", text: "\u81E8\u6D77\u30EA\u30BE\u30FC\u30C8\u306E\u6C34\u65CF\u9928\u3078\u3002", choices: [{ label: "\u9B5A\u3092\u3058\u3063\u304F\u308A\u898B\u308B", apply: (g2) => g2.chg({ mood: 6, intel: 1 }) }], auto: 0 }) });
  E({ id: "heat_stroke", ages: [3, 90], months: [7], w: 2, make: (g) => ({ title: "\u731B\u6691", text: "\u53B3\u3057\u3044\u6691\u3055\u306E\u65E5\u3067\u3059\u3002\u6C34\u5206\u3092\u3068\u308A\u3001\u7121\u7406\u305B\u305A\u4F11\u307F\u307E\u3057\u3087\u3046\u3002", choices: [{ label: "\u6DBC\u3057\u3044\u5834\u6240\u3067\u4F11\u3080", apply: (g2) => g2.chg({ health: 1 }) }, { label: "\u5E73\u6C17\u3060\u3068\u5916\u3067\u52D5\u304F", apply: (g2) => g2.chg({ health: -5, energy: -10 }) }], auto: 0 }) });
  E({ id: "flu_season", ages: [3, 90], months: [0, 1, 11], w: 3, make: (g) => ({ title: "\u30A4\u30F3\u30D5\u30EB\u30A8\u30F3\u30B6\u306E\u6D41\u884C", text: "\u5B66\u6821\u3084\u8077\u5834\u3067\u98A8\u90AA\u304C\u6D41\u884C\u3063\u3066\u3044\u307E\u3059\u3002", choices: [{ label: "\u30EF\u30AF\u30C1\u30F3\u3092\u53D7\u3051\u308B(\xA5" + yen(g, 3500) + ")", apply: (g2) => {
    g2.pay(yen(g2, 3500), "\u30EF\u30AF\u30C1\u30F3");
    return g2.chg({ health: 2 });
  } }, { label: "\u624B\u6D17\u3044\u30FB\u3046\u304C\u3044\u3067\u5099\u3048\u308B", apply: (g2) => g2.chg({ health: g2.rngInt(100) < 35 ? -6 : 0 }) }], auto: 0 }) });
  E({ id: "hometown_pride", ages: [3, 90], w: 1, make: (g) => ({ title: "\u9752\u6D77\u306E\u6D77", text: "\u6E2F\u3067\u3001\u671D\u65E5\u306B\u304B\u304C\u3084\u304F\u6D77\u3092\u773A\u3081\u307E\u3057\u305F\u3002", choices: [{ label: "\u3057\u3070\u3089\u304F\u898B\u3068\u308C\u308B", apply: (g2) => g2.chg({ mood: 4 }) }], auto: 0 }) });
  E({ id: "sports_event_town", ages: [8, 70], months: [4, 10], w: 2, make: (g) => ({ title: "\u8857\u306E\u904B\u52D5\u30A4\u30D9\u30F3\u30C8", text: "\u8857\u306E\u904B\u52D5\u30A4\u30D9\u30F3\u30C8(\u99C5\u4F1D\u30FB\u30A6\u30A9\u30FC\u30AD\u30F3\u30B0)\u304C\u958B\u304B\u308C\u307E\u3057\u305F\u3002", choices: [{ label: "\u53C2\u52A0\u3059\u308B", apply: (g2) => g2.chg({ fitness: 3, social: 2, mood: 3 }) }, { label: "\u5FDC\u63F4\u3059\u308B", apply: (g2) => g2.chg({ social: 2, mood: 2 }) }], auto: 0 }) });
  var scn = (id) => (g) => g.S.scenario && g.S.scenario.id === id && g.S.scenario.state === "running";
  var peer = (g) => {
    const w = g.world, p = w.pop, a = g.age();
    const L2 = [...w.detailIds].filter((i) => i !== g.hero.id && !p.gone[i] && Math.abs(g.ageOf(i) - a) <= 6 && g.ageOf(i) >= 12 && !g.hero.rel[i]?.family);
    return L2.length ? g.actRng("peer").pick(L2) : null;
  };
  var bump = (g, k, d) => {
    g.hero.flags[k] = (g.hero.flags[k] || 0) + d;
  };
  E({ id: "ban_challenge", ages: [15, 24], w: 6, cond: scn("banchou"), make: (g) => ({ title: "\u6C7A\u95D8\u306E\u7533\u3057\u8FBC\u307F", text: "\u96A3\u753A\u306E\u300C\u756A\u9577\u300D\u3092\u540D\u4E57\u308B\u76F8\u624B\u304C\u3001\u6CB3\u5DDD\u6577\u3067\u306E\u30BF\u30A4\u30DE\u30F3(\u4E00\u5BFE\u4E00)\u3092\u7533\u3057\u8FBC\u3093\u3067\u304D\u307E\u3057\u305F\u3002\u8857\u306E\u82E5\u8005\u305F\u3061\u304C\u3001\u3042\u306A\u305F\u306E\u8FD4\u4E8B\u3092\u898B\u3066\u3044\u307E\u3059\u3002", choices: [
    { label: "\u53D7\u3051\u3066\u7ACB\u3064", apply: (g2) => {
      const win = g2.hero.stats.fitness + g2.rngInt(45) > 60;
      if (win) {
        bump(g2, "banRep", 10);
        g2.log("fight", "\u6CB3\u5DDD\u6577\u3067\u96A3\u753A\u306E\u756A\u9577\u3068\u306E\u30BF\u30A4\u30DE\u30F3\u306B\u52DD\u3063\u305F");
        return "\u52DD\u3063\u305F!\u8857\u4E2D\u306B\u540D\u524D\u304C\u77E5\u308C\u6E21\u3063\u305F\u3002" + g2.chg({ health: -8, mood: 6, social: 2 });
      }
      bump(g2, "banRep", -3);
      g2.log("fight", "\u6CB3\u5DDD\u6577\u306E\u30BF\u30A4\u30DE\u30F3\u3067\u8CA0\u3051\u305F");
      return "\u8CA0\u3051\u305F\u3002\u6094\u3057\u3055\u3068\u75DB\u307F\u304C\u6B8B\u308B\u3002" + g2.chg({ health: -18, mood: -6 });
    } },
    { label: "\u8A71\u3092\u3064\u3051\u306B\u3044\u304F(\u8A00\u8449\u3067)", apply: (g2) => {
      const ok = g2.hero.stats.charm + g2.hero.stats.social + g2.rngInt(50) > 85;
      if (ok) {
        bump(g2, "banRep", 5);
        const p = peer(g2);
        g2.meet(p, 14);
        return "\u8179\u3092\u5272\u3063\u3066\u8A71\u3059\u3068\u3001\u76F8\u624B\u3068\u306F\u5999\u306B\u6C17\u304C\u5408\u3063\u305F\u3002" + g2.chg({ social: 3, mood: 3 });
      }
      return "\u8A71\u306F\u5E73\u884C\u7DDA\u306E\u307E\u307E\u3060\u3063\u305F\u3002" + g2.chg({ mood: -3 });
    } },
    { label: "\u65AD\u308B", apply: (g2) => {
      bump(g2, "banRep", -2);
      return "\u300C\u3084\u3089\u306A\u3044\u300D\u3068\u4F1D\u3048\u305F\u3002\u7B11\u3046\u8005\u3082\u3044\u305F\u304C\u3001\u305D\u308C\u3082\u9078\u629E\u3060\u3002" + g2.chg({ mood: -2 });
    } }
  ], auto: 2 }) });
  E({ id: "ban_friend", ages: [14, 22], w: 5, cond: scn("banchou"), make: (g, c0) => {
    const p = c0.p ?? peer(g);
    return { title: "\u56F0\u3063\u3066\u3044\u308B\u5F8C\u8F29", text: `${p != null ? g.nameOf(p) : "\u5F8C\u8F29"}\u304C\u3001\u305F\u3061\u306E\u60AA\u3044\u9023\u4E2D\u306B\u304B\u3089\u307E\u308C\u3066\u3044\u307E\u3059\u3002`, ctx: { p }, choices: [
      { label: "\u9593\u306B\u5165\u3063\u3066\u52A9\u3051\u308B", apply: (g2) => {
        const win = g2.hero.stats.fitness + g2.rngInt(40) > 50;
        g2.meet(p, win ? 28 : 12);
        bump(g2, "banRep", win ? 6 : 1);
        g2.log("fight", `${g2.nameOf(p)}\u3092\u52A9\u3051\u305F`);
        return (win ? "\u4F53\u3092\u5F35\u3063\u3066\u8FFD\u3044\u6255\u3063\u305F\u3002" : "\u6BB4\u3089\u308C\u305F\u304C\u3001\u5F8C\u8F29\u306F\u9003\u3052\u3089\u308C\u305F\u3002") + g2.chg({ health: win ? -3 : -12, mood: 5, social: 2 });
      } },
      { label: "\u5927\u4EBA\u30FB\u5148\u751F\u3092\u547C\u3076", apply: (g2) => {
        g2.meet(p, 14);
        return "\u65E9\u3081\u306B\u5927\u4EBA\u3092\u547C\u3093\u3067\u3001\u3053\u3068\u306A\u304D\u3092\u5F97\u305F\u3002" + g2.chg({ mood: 2, intel: 0.5 });
      } },
      { label: "\u898B\u3066\u898B\u306C\u3075\u308A\u3092\u3059\u308B", apply: (g2) => g2.chg({ mood: -5, social: -1 }) + "(\u5F8C\u5473\u304C\u60AA\u3044)" }
    ], auto: 1 };
  } });
  E({ id: "ban_warning", ages: [15, 24], w: 5, cond: (g) => scn("banchou")(g) && (g.hero.flags.banRep || 0) >= 12, make: (g) => ({ title: "\u88DC\u5C0E", text: "\u6D3E\u624B\u306A\u8A55\u5224\u304C\u305F\u305F\u308A\u3001\u5DE1\u56DE\u4E2D\u306E\u8B66\u5BDF\u5B98\u306B\u58F0\u3092\u304B\u3051\u3089\u308C\u307E\u3057\u305F\u3002", choices: [
    { label: "\u7D20\u76F4\u306B\u8B1D\u308A\u3001\u5BB6\u306B\u5E30\u308B", apply: (g2) => g2.chg({ mood: -3 }) + "(\u53B3\u91CD\u6CE8\u610F\u3067\u6E08\u3093\u3060)" },
    { label: "\u53CD\u767A\u3057\u3066\u98DF\u3063\u3066\u304B\u304B\u308B", apply: (g2) => {
      g2.hero.flags.banRecord = true;
      g2.log("police", "\u8B66\u5BDF\u3067\u53B3\u3057\u304F\u6CE8\u610F\u3055\u308C\u305F(\u8A18\u9332\u304C\u6B8B\u3063\u305F)");
      return "\u7F72\u3067\u9577\u304F\u8AAC\u6559\u3055\u308C\u305F\u3002\u8A18\u9332\u304C\u6B8B\u3063\u3066\u3057\u307E\u3063\u305F\u3002" + g2.chg({ mood: -6 });
    } }
  ], auto: 0 }) });
  E({ id: "ban_senpai", ages: [18, 22], w: 5, once: true, cond: scn("banchou"), make: (g) => ({ title: "\u5148\u8F29\u306E\u3072\u3068\u3053\u3068", text: "\u5730\u5143\u306E\u5148\u8F29\u304C\u58F0\u3092\u304B\u3051\u3066\u304D\u307E\u3057\u305F\u3002\u300C\u3044\u3064\u307E\u3067\u3082\u30B1\u30F3\u30AB\u3070\u304B\u308A\u3058\u3083\u98DF\u3048\u306D\u3048\u305E\u3002\u3046\u3061\u306E\u5DE5\u5834\u3067\u50CD\u3044\u3066\u307F\u306A\u3044\u304B\u300D", choices: [
    { label: "\u8A71\u3092\u805E\u3044\u3066\u307F\u308B", apply: (g2) => {
      g2.hero.money += g2.yen(5e4);
      g2.hero.flags.interest = "craft";
      g2.log("job", "\u5148\u8F29\u306B\u4ED5\u4E8B\u306E\u4E16\u8A71\u3092\u53D7\u3051\u305F");
      return "\u5148\u8F29\u306E\u3064\u3066\u3067\u3001\u50CD\u304D\u53E3\u306E\u8A71\u3092\u3082\u3089\u3063\u305F\u3002(\u5E02\u5F79\u6240\u3084\u5DE5\u5834\u306E\u6C42\u4EBA\u304B\u3089\u5FDC\u52DF\u3067\u304D\u307E\u3059)" + g2.chg({ mood: 5, social: 2 });
    } },
    { label: "\u300C\u307E\u3060\u65E9\u3044\u300D\u3068\u65AD\u308B", apply: (g2) => g2.chg({ mood: 1 }) }
  ], auto: 0 }) });
  E({ id: "out_gamble", ages: [20, 40], w: 6, cond: scn("outlaw"), make: (g) => ({ title: "\u4E00\u767A\u52DD\u8CA0", text: "\u4EF2\u9593\u304C\u300C\u4ECA\u65E5\u306F\u7D76\u5BFE\u5F53\u305F\u308B\u300D\u3068\u3001\u7AF6\u8F2A\u5834\u3078\u8A98\u3063\u3066\u304D\u307E\u3057\u305F\u3002", choices: [
    { label: `\u5C11\u3057\u3060\u3051\u8CED\u3051\u308B(\xA5${yen(g, 3e3).toLocaleString()})`, apply: (g2) => {
      g2.pay(yen(g2, 3e3), "\u8CED\u3051\u4E8B");
      if (g2.rngInt(100) < 38) {
        g2.earn(yen(g2, 9e3), "\u8CED\u3051\u306E\u6255\u623B");
        return "\u3055\u3055\u3084\u304B\u306B\u5F53\u305F\u3063\u305F\u3002" + g2.chg({ mood: 4 });
      }
      return "\u306F\u305A\u308C\u3002\u6388\u696D\u6599\u3060\u3068\u601D\u304A\u3046\u3002" + g2.chg({ mood: -1 });
    } },
    { label: `\u3053\u3053\u305E\u3068\u5927\u304D\u304F\u8CED\u3051\u308B(\xA5${yen(g, 5e4).toLocaleString()})`, apply: (g2) => {
      g2.pay(yen(g2, 5e4), "\u8CED\u3051\u4E8B");
      if (g2.rngInt(100) < 30) {
        g2.earn(yen(g2, 2e5), "\u8CED\u3051\u306E\u6255\u623B");
        g2.log("luck", "\u8CED\u3051\u3067\u5927\u304D\u304F\u5F53\u3066\u305F");
        return "\u5927\u5F53\u305F\u308A!\u2026\u3060\u304C\u3001\u3053\u308C\u306F\u904B\u3060\u3002" + g2.chg({ mood: 10 });
      }
      g2.log("money", "\u8CED\u3051\u3067\u5927\u304D\u304F\u8CA0\u3051\u305F");
      return "\u5927\u8CA0\u3051\u3002\u8CA1\u5E03\u304C\u7A7A\u306B\u306A\u3063\u305F\u3002" + g2.chg({ mood: -8 });
    } },
    { label: "\u884C\u304B\u306A\u3044", apply: (g2) => {
      bump(g2, "honor", 1);
      return g2.chg({ mood: 1 });
    } }
  ], auto: 2 }) });
  E({ id: "out_daylabor", ages: [20, 60], w: 7, cond: scn("outlaw"), make: (g) => ({ title: "\u65E5\u96C7\u3044\u306E\u4ED5\u4E8B", text: "\u4ECA\u65E5\u3060\u3051\u306E\u73FE\u5834\u4ED5\u4E8B\u304C\u56DE\u3063\u3066\u304D\u307E\u3057\u305F\u3002", choices: [
    { label: "\u5F15\u304D\u53D7\u3051\u308B", apply: (g2) => {
      g2.advance(480);
      g2.earn(yen(g2, 9500), "\u65E5\u96C7\u3044\u306E\u73FE\u5834");
      return "\u4E00\u65E5\u50CD\u3044\u3066\u65E5\u5F53\u3092\u3082\u3089\u3063\u305F\u3002" + g2.chg({ energy: -35, fitness: 0.6, hunger: -15 });
    } },
    { label: "\u4ECA\u65E5\u306F\u3084\u3081\u3066\u304A\u304F", apply: (g2) => g2.chg({ mood: 1 }) }
  ], auto: 0 }) });
  E({ id: "out_temptation", ages: [20, 45], w: 3, cond: scn("outlaw"), make: (g) => ({ title: "\u3042\u3084\u3057\u3044\u5132\u3051\u8A71", text: "\u300C\u8A71\u3092\u805E\u304F\u3060\u3051\u3067\u65E5\u5F53\u304C\u51FA\u308B\u300D\u3068\u3044\u3046\u3001\u3069\u3046\u898B\u3066\u3082\u3042\u3084\u3057\u3044\u8A71\u304C\u821E\u3044\u8FBC\u307F\u307E\u3057\u305F\u3002", choices: [
    { label: "\u304D\u3063\u3071\u308A\u65AD\u308B", apply: (g2) => {
      bump(g2, "honor", 1);
      return "\u65AD\u3063\u305F\u3002\u80F8\u3092\u306A\u3067\u304A\u308D\u3059\u3002" + g2.chg({ mood: 3 });
    } },
    { label: "\u8AB0\u304B\u306B\u76F8\u8AC7\u3059\u308B(\u5F79\u6240\u30FB\u8B66\u5BDF\u306E\u7A93\u53E3)", apply: (g2) => {
      bump(g2, "honor", 1);
      return "\u76F8\u8AC7\u3057\u3066\u3001\u5371\u306A\u3044\u8A71\u3060\u3068\u308F\u304B\u3063\u305F\u3002" + g2.chg({ mood: 2, intel: 0.5 });
    } },
    { label: "\u3046\u3063\u304B\u308A\u4E57\u3063\u3066\u3057\u307E\u3046", apply: (g2) => {
      g2.hero.flags.banRecord = true;
      g2.pay(yen(g2, 2e5), "\u793A\u8AC7\u91D1\u30FB\u7F70\u91D1");
      g2.log("police", "\u3042\u3084\u3057\u3044\u8A71\u306B\u5DFB\u304D\u8FBC\u307E\u308C\u3001\u8B66\u5BDF\u306E\u4E8B\u60C5\u8074\u53D6\u3092\u53D7\u3051\u305F");
      return "\u5DFB\u304D\u8FBC\u307E\u308C\u3066\u3057\u307E\u3044\u3001\u8B66\u5BDF\u3067\u4E8B\u60C5\u3092\u805E\u304B\u308C\u3001\u793A\u8AC7\u91D1\u3082\u6255\u3063\u305F\u3002" + g2.chg({ mood: -12 });
    } }
  ], auto: 0 }) });
  E({ id: "out_busk", ages: [20, 55], w: 5, cond: scn("outlaw"), make: (g) => ({ title: "\u8DEF\u4E0A\u30E9\u30A4\u30D6", text: "\u99C5\u524D\u306E\u5E83\u5834\u3067\u3001\u6B4C\u3084\u82B8\u3092\u62AB\u9732\u3057\u3066\u307F\u307E\u305B\u3093\u304B?", choices: [
    { label: "\u3084\u3063\u3066\u307F\u308B", apply: (g2) => {
      g2.advance(120);
      const ok = g2.hero.stats.charm + g2.rngInt(60) > 55;
      const p = peer(g2);
      if (ok) {
        g2.earn(yen(g2, 4200), "\u6295\u3052\u92AD");
        g2.meet(p, 14);
        return "\u8DB3\u3092\u6B62\u3081\u3066\u304F\u308C\u308B\u4EBA\u304C\u3044\u305F\u3002\u6295\u3052\u92AD\u3082\u5C11\u3057\u3002" + g2.chg({ mood: 6, social: 2, charm: 0.8 });
      }
      return "\u8AB0\u3082\u7ACB\u3061\u6B62\u307E\u3089\u306A\u304B\u3063\u305F\u3002\u3067\u3082\u3001\u3084\u308A\u304D\u3063\u305F\u3002" + g2.chg({ mood: -1, charm: 0.4 });
    } },
    { label: "\u898B\u3066\u3044\u308B\u3060\u3051", apply: (g2) => g2.chg({ mood: 1 }) }
  ], auto: 1 }) });
  E({ id: "out_guarantor", ages: [22, 50], w: 3, cond: scn("outlaw"), make: (g) => ({ title: "\u4FDD\u8A3C\u4EBA\u306E\u983C\u307F", text: "\u4EF2\u9593\u304C\u300C\u501F\u91D1\u306E\u4FDD\u8A3C\u4EBA\u306B\u306A\u3063\u3066\u304F\u308C\u300D\u3068\u983C\u3093\u3067\u304D\u307E\u3057\u305F\u3002", choices: [
    { label: "\u65AD\u308B(\u3064\u3089\u3044\u304C\u3001\u81EA\u5206\u3092\u5B88\u308B)", apply: (g2) => {
      bump(g2, "honor", 1);
      return g2.chg({ mood: -3, social: -1 });
    } },
    { label: "\u5F15\u304D\u53D7\u3051\u308B", apply: (g2) => {
      const bad = g2.rngInt(100) < 55;
      const p = peer(g2);
      g2.meet(p, 22);
      if (bad) {
        g2.hero.debt += yen(g2, 4e5);
        g2.log("money", "\u4FDD\u8A3C\u4EBA\u306B\u306A\u3063\u305F\u4EF2\u9593\u304C\u8FD4\u305B\u306A\u304F\u306A\u308A\u3001\u501F\u91D1\u3092\u80CC\u8CA0\u3063\u305F");
        return "\u7D50\u5C40\u3001\u4EF2\u9593\u306F\u8FD4\u305B\u306A\u304F\u306A\u308A\u3001\u501F\u91D1\u3092\u80CC\u8CA0\u3046\u3053\u3068\u306B\u306A\u3063\u305F\u3002" + g2.chg({ mood: -10 });
      }
      return "\u7121\u4E8B\u306B\u8FD4\u6E08\u3055\u308C\u3001\u4EF2\u9593\u304B\u3089\u611F\u8B1D\u3055\u308C\u305F\u3002" + g2.chg({ mood: 4, social: 2 });
    } }
  ], auto: 0 }) });
  var dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "\u6771" : "\u897F" : dy > 0 ? "\u5357" : "\u5317";
  E({ id: "good_way", ages: [10, 90], w: 3, make: (g, ctx4, rng) => {
    if (!ctx4.t) {
      const L2 = g.world.map.buildings.filter((b) => ["station", "hospital", "cityhall", "library", "museum", "cafe", "temple", "shrine", "police"].includes(b.type));
      const t = L2[rng.int(L2.length)];
      const hb = g.world.map.buildings[g.hero.homeB];
      ctx4.t = t.idx;
      ctx4.name = t.name;
      ctx4.right = dirOf(t.doorX - hb.doorX, t.doorY - hb.doorY);
    }
    const dirs = ["\u5317", "\u6771", "\u5357", "\u897F"];
    return { title: "\u9053\u3092\u305F\u305A\u306D\u3089\u308C\u305F", text: `\u65C5\u884C\u8005\u3089\u3057\u3044\u4EBA\u306B\u300C${ctx4.name}\u306F\u3069\u3061\u3089\u3067\u3059\u304B\u300D\u3068\u305F\u305A\u306D\u3089\u308C\u307E\u3057\u305F\u3002\u3042\u306A\u305F\u306E\u5BB6\u304B\u3089\u898B\u3066\u3001${ctx4.name}\u306F\u3069\u306E\u65B9\u89D2\u3067\u3057\u3087\u3046?`, choices: [...dirs.map((d) => ({ label: `${d}\u306E\u65B9\u3060\u3068\u601D\u3046`, apply: (g2) => {
      if (d === ctx4.right) {
        bump(g2, "goodDeed", 1);
        return `\u6B63\u3057\u304F\u6559\u3048\u3089\u308C\u3001\u300C\u3042\u308A\u304C\u3068\u3046!\u300D\u3068\u7B11\u9854\u3067\u53BB\u3063\u3066\u3044\u304D\u307E\u3057\u305F\u3002` + g2.chg({ mood: 4, social: 2 });
      }
      return "\u5C11\u3057\u9055\u3063\u3066\u3044\u305F\u3088\u3046\u3067\u3059\u3002\u3042\u3068\u3067\u6C17\u3065\u3044\u3066\u3001\u7533\u3057\u8A33\u306A\u3044\u6C17\u6301\u3061\u306B\u306A\u308A\u307E\u3057\u305F\u3002" + g2.chg({ mood: -1 });
    } })), { label: "\u300C\u3059\u307F\u307E\u305B\u3093\u3001\u3088\u304F\u5206\u304B\u308A\u307E\u305B\u3093\u300D\u3068\u4F1D\u3048\u308B", apply: (g2) => g2.chg({ social: 0 }) }], auto: 4 };
  } });
  E({ id: "good_lost_item", ages: [8, 90], w: 3, make: (g, ctx4, rng) => {
    if (!ctx4.k) {
      ctx4.k = ["\u8CA1\u5E03", "\u5B9A\u671F\u5165\u308C", "\u304B\u304E", "\u30B9\u30DE\u30FC\u30C8\u30D5\u30A9\u30F3", "\u30CF\u30F3\u30AB\u30C1"][rng.int(5)];
      ctx4.cash = ctx4.k === "\u8CA1\u5E03" ? g.yen(3e4) : 0;
    }
    return { title: "\u843D\u3068\u3057\u7269", text: `\u9053\u3070\u305F\u306B${ctx4.k}\u304C\u843D\u3061\u3066\u3044\u307E\u3059\u3002\u6301\u3061\u4E3B\u306E\u540D\u524D\u306F\u5206\u304B\u308A\u307E\u305B\u3093\u3002`, choices: [
      { label: "\u4EA4\u756A\u306B\u5C4A\u3051\u308B", apply: (g2) => {
        bump(g2, "goodDeed", 1);
        g2.advance(20);
        let r = "\u4EA4\u756A\u3067\u53D7\u4ED8\u3092\u3057\u3066\u3001\u304A\u793C\u3092\u8A00\u308F\u308C\u307E\u3057\u305F\u3002";
        if (ctx4.cash && g2.actRng("reward").next() < 0.5) {
          const rw = Math.round(ctx4.cash * 0.1);
          g2.earn(rw, "\u843D\u3068\u3057\u7269\u306E\u304A\u793C");
          r += `
\u5F8C\u65E5\u3001\u6301\u3061\u4E3B\u304B\u3089\u304A\u793C\u304C\u5C4A\u304D\u307E\u3057\u305F(\xA5${rw.toLocaleString("ja-JP")})\u3002`;
        }
        return r + g2.chg({ mood: 4 });
      } },
      { label: "\u305D\u306E\u307E\u307E\u306B\u3059\u308B", apply: (g2) => g2.chg({ mood: 0 }) },
      { label: "\u81EA\u5206\u306E\u3082\u306E\u306B\u3059\u308B", apply: (g2) => {
        bump(g2, "honor", -1);
        return "\u62FE\u3063\u305F\u3082\u306E\u3092\u81EA\u5206\u306E\u3082\u306E\u306B\u3059\u308B\u306E\u306F\u3001\u907A\u5931\u7269\u6A2A\u9818\u3068\u3044\u3046\u7F6A\u306B\u306A\u308A\u307E\u3059\u3002\u6C17\u6301\u3061\u304C\u843D\u3061\u7740\u304B\u306A\u3044\u307E\u307E\u3001\u7D50\u5C40\u4EA4\u756A\u306B\u5C4A\u3051\u307E\u3057\u305F\u3002" + g2.chg({ mood: -2 });
      } }
    ], auto: 0 };
  } });
  E({ id: "good_lost_child", ages: [14, 85], w: 2, make: (g, ctx4) => ({ title: "\u8FF7\u5B50\u306E\u5B50\u3069\u3082", text: "\u6CE3\u3044\u3066\u3044\u308B\u5C0F\u3055\u306A\u5B50\u304C\u3001\u4E00\u4EBA\u3067\u7ACB\u3063\u3066\u3044\u307E\u3059\u3002\u307E\u308F\u308A\u306B\u4FDD\u8B77\u8005\u306F\u898B\u5F53\u305F\u308A\u307E\u305B\u3093\u3002", choices: [
    { label: "\u3084\u3055\u3057\u304F\u58F0\u3092\u304B\u3051\u3001\u4EA4\u756A\u307E\u3067\u4E00\u7DD2\u306B\u884C\u304F", apply: (g2) => {
      bump(g2, "goodDeed", 2);
      g2.advance(40);
      return "\u4EA4\u756A\u3067\u4FDD\u8B77\u8005\u306B\u9023\u7D61\u304C\u3064\u304D\u3001\u89AA\u304C\u99C6\u3051\u3064\u3051\u307E\u3057\u305F\u3002\u300C\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3057\u305F\u300D\u3068\u4F55\u5EA6\u3082\u982D\u3092\u4E0B\u3052\u3089\u308C\u307E\u3057\u305F\u3002" + g2.chg({ mood: 6, social: 3 });
    } },
    { label: "\u305D\u3070\u3067\u898B\u5B88\u308A\u3001\u8FD1\u304F\u306E\u5927\u4EBA\u306B\u58F0\u3092\u304B\u3051\u308B", apply: (g2) => {
      bump(g2, "goodDeed", 1);
      g2.advance(15);
      return "\u8FD1\u304F\u306E\u5E97\u306E\u4EBA\u304C\u4E00\u7DD2\u306B\u63A2\u3057\u3066\u304F\u308C\u3066\u3001\u7121\u4E8B\u306B\u89AA\u304C\u898B\u3064\u304B\u308A\u307E\u3057\u305F\u3002" + g2.chg({ mood: 3, social: 1 });
    } },
    { label: "\u901A\u308A\u904E\u304E\u308B", apply: (g2) => g2.chg({ mood: -2 }) }
  ], auto: 0 }) });
  E({ id: "school_visit", ages: [24, 60], months: [5, 10], w: 6, cond: (g) => {
    const P2 = g.world.pop;
    return g.hero.kids.some((k) => !P2.gone[k] && g.ageOf(k) >= 6 && g.ageOf(k) <= 17);
  }, make: (g, ctx4, rng) => {
    const P2 = g.world.pop;
    if (ctx4.kid == null) {
      const ks = g.hero.kids.filter((k) => !P2.gone[k] && g.ageOf(k) >= 6 && g.ageOf(k) <= 17);
      ctx4.kid = ks[rng.int(ks.length)];
      ctx4.sp = !!(P2.flags[ctx4.kid] & 32);
    }
    const n2 = g.nameOf(ctx4.kid), a = g.ageOf(ctx4.kid);
    const text = ctx4.sp ? `${n2}(${a}\u6B73)\u304C\u901A\u3046\u7279\u5225\u652F\u63F4\u306E\u5B66\u3073\u306E\u5834\u3067\u6388\u696D\u53C2\u89B3\u304C\u3042\u308A\u307E\u3059\u3002\u4E00\u4EBA\u3072\u3068\u308A\u306E\u30DA\u30FC\u30B9\u306B\u5408\u308F\u305B\u305F\u6388\u696D\u3068\u3001\u5148\u751F\u65B9\u306E\u4E01\u5BE7\u306A\u95A2\u308F\u308A\u3092\u898B\u3089\u308C\u308B\u65E5\u3067\u3059\u3002` : `${n2}(${a}\u6B73)\u306E\u6388\u696D\u53C2\u89B3\u306E\u65E5\u3067\u3059\u3002\u6559\u5BA4\u306E\u5F8C\u308D\u304B\u3089\u3001\u304C\u3093\u3070\u308B\u59FF\u3092\u898B\u5B88\u308C\u307E\u3059\u3002`;
    return { title: ctx4.sp ? "\u6388\u696D\u53C2\u89B3(\u7279\u5225\u652F\u63F4)" : "\u6388\u696D\u53C2\u89B3", text, choices: [
      { label: "\u4ED5\u4E8B\u3092\u8ABF\u6574\u3057\u3066\u53C2\u89B3\u3059\u308B", apply: (g2) => {
        g2.advance(150);
        bump(g2, "schoolVisit", 1);
        const r = g2.hero.rel[ctx4.kid];
        if (r) r.aff = Math.min(100, (r.aff || 0) + 4);
        return ctx4.sp ? `${n2}\u306E\u300C\u3067\u304D\u305F\u300D\u3092\u5148\u751F\u3068\u4E00\u7DD2\u306B\u559C\u3073\u307E\u3057\u305F\u3002\u5F97\u610F\u306A\u3053\u3068\u3001\u624B\u52A9\u3051\u304C\u3044\u308B\u3053\u3068\u304C\u3088\u304F\u5206\u304B\u308A\u307E\u3057\u305F\u3002` + g2.chg({ mood: 5, social: 2 }) : `${n2}\u304C\u624B\u3092\u6319\u3052\u3066\u767A\u8868\u3059\u308B\u59FF\u306B\u3001\u80F8\u304C\u71B1\u304F\u306A\u308A\u307E\u3057\u305F\u3002` + g2.chg({ mood: 5, social: 2 });
      } },
      { label: "\u884C\u3051\u306A\u3044(\u5F8C\u3067\u5148\u751F\u3068\u9023\u7D61\u3092\u3068\u308B)", apply: (g2) => g2.chg({ mood: -1 }) }
    ], auto: 0 };
  } });
  E({ id: "gath_invite", w: 0, make: (g, ctx4) => {
    const key = ctx4.key;
    const M = +key.split(":")[0];
    const ev = planOf(g, M).find((e) => e.key === key);
    if (!ev) return null;
    const K3 = KINDS[ev.kind];
    const ac = ev.members.filter((i) => g.hero.rel[i]);
    const nm = ac.length ? g.nameOf(ac[0]) : g.nameOf(ev.host);
    return { title: `${K3.n}\u306E\u304A\u8A98\u3044`, text: `${g.bld(ev.b).name}\u3067${K3.n}(${ev.size}\u4EBA)\u304C\u958B\u304B\u308C\u3066\u3044\u307E\u3059\u3002\u77E5\u308A\u5408\u3044\u306E${nm}\u3055\u3093\u304C\u6C17\u3065\u3044\u3066\u624B\u3092\u632F\u308A\u3001\u300C\u3088\u304B\u3063\u305F\u3089\u4E00\u7DD2\u306B\u3069\u3046?\u300D\u3068\u58F0\u3092\u304B\u3051\u3066\u304F\u308C\u307E\u3057\u305F\u3002\u53C2\u52A0\u8CBB\u306F\xA5${g.yen(ev.fee).toLocaleString("ja-JP")}\u3067\u3059\u3002\u7121\u7406\u306B\u53C2\u52A0\u3059\u308B\u5FC5\u8981\u306F\u3042\u308A\u307E\u305B\u3093\u3002`, choices: [{ label: `\u53C2\u52A0\u3059\u308B(\xA5${g.yen(ev.fee).toLocaleString("ja-JP")})`, apply: (g2) => {
      const r = heroJoin(g2, key);
      return r.msg || "";
    } }, { label: "\u3042\u3044\u3055\u3064\u3060\u3051\u3057\u3066\u3001\u81EA\u5206\u306E\u5E2D\u306B\u623B\u308B", apply: (g2) => {
      for (const i of ac.slice(0, 2)) g2.meet(i, 2);
      return g2.chg({ mood: 1, social: 1 });
    } }], auto: 1 };
  } });

