  // src/scenario.js
  var SCENARIOS = {
    normal: { name: "\u3075\u3064\u3046\u306E\u4EBA\u751F(0\u6B73\u304B\u3089)", startAge: 0 },
    layoff: { name: "\u89E3\u96C7\u304B\u3089\u306E\u9006\u8EE2\u4EBA\u751F(38\u6B73\u304B\u3089)", startAge: 38, years: 5, goal: "5\u5E74\u4EE5\u5185\u306B\u6B63\u793E\u54E1\u306E\u4ED5\u4E8B\u306B\u5C31\u304D\u3001\u501F\u91D1\u3092\u3059\u3079\u3066\u8FD4\u3059" },
    banchou: { name: "\u55A7\u5629\u756A\u9577\u4EBA\u751F(15\u6B73\u304B\u3089)", startAge: 15, years: 10, goal: "25\u6B73\u307E\u3067\u306B\u53CB\u3060\u3061\u30925\u4EBA\u4EE5\u4E0A\u3064\u304F\u308A\u3001\u8B66\u5BDF\u306E\u8A18\u9332\u3092\u6B8B\u3055\u305A\u3001\u4ED5\u4E8B\u306B\u5C31\u304F(\u756A\u9577\u304B\u3089\u4E00\u4EBA\u524D\u3078)" },
    outlaw: { name: "\u30A2\u30A6\u30C8\u30ED\u30FC\u4EBA\u751F(20\u6B73\u304B\u3089)", startAge: 20, years: 10, goal: "30\u6B73\u307E\u3067\u81EA\u7531\u306B\u751F\u304D\u629C\u304F\u3002\u501F\u91D1\u306A\u3057\u30FB\u8B66\u5BDF\u306E\u8A18\u9332\u306A\u3057\u30FB\u53CB\u3060\u30613\u4EBA\u4EE5\u4E0A\u30FB\u8CAF\u304880\u4E07\u5186\u76F8\u5F53" },
    heritage: { name: "\u56DB\u4EE3\u76EE\u8001\u8217\u306E\u8DE1\u7D99\u304E(26\u6B73\u304B\u3089)", startAge: 26, years: 30, goal: "\u5E97\u3092\u5B88\u3063\u3066\u8A55\u522455\u4EE5\u4E0A\u3092\u4FDD\u3061\u300150\u6B73\u307E\u3067\u306B\u5B50\u3078\u4ED5\u4E8B\u3092\u6559\u3048\u3066\u4E94\u4EE3\u76EE\u306B\u3064\u306A\u3050" },
    homeless: { name: "\u30DB\u30FC\u30E0\u30EC\u30B9\u304B\u3089\u306E\u518D\u8D77(45\u6B73\u304B\u3089)", startAge: 45, years: 4, goal: "4\u5E74\u4EE5\u5185\u306B\u4ED5\u4E8B\u306B\u5C31\u304D\u3001\u30A2\u30D1\u30FC\u30C8\u306A\u3069\u306E\u4F4F\u307E\u3044\u3092\u501F\u308A\u308B" }
  };
  // Mobile-friendly scenario preparation. Process at most one in-game month per
  // slice so the browser can redraw and Android can show genuine progress.
  async function fastForward(g, until, report) {
    const startM = g.S.M;
    const span = Math.max(1, until - startM);
    let last = -1;
    const emit = () => {
      const pct = Math.min(100, Math.floor((g.S.M - startM) * 100 / span));
      if (typeof report === "function" && pct !== last) {
        last = pct;
        report(pct, `これまでの人生を作成中（${pct}%）`);
      }
    };
    emit();
    while (g.S.M < until && !g.S.ended) {
      const nextMonth = Math.min(until, g.S.M + 1);
      let prompts = 0;
      let stalled = false;
      while (!g.S.ended) {
        const beforeM = g.S.M;
        const r = g.skipTo(nextMonth, true);
        if (r.stopped === "ask") {
          const pv = g.promptView();
          if (!pv || !pv.choices || !pv.choices.length) {
            throw new Error("成長シミュレーションの選択イベントを処理できませんでした");
          }
          g.choose(pv.type === "event" ? Math.min(pv.auto ?? 0, pv.choices.length - 1) : 0);
          if (++prompts > 800) throw new Error("成長シミュレーションで同じイベントが繰り返されています");
          // Some prompt resolutions advance the calendar themselves.
          if (g.S.M >= nextMonth || g.S.ended) break;
          continue;
        }
        if (g.S.M <= beforeM && !g.S.ended && g.S.M < nextMonth) stalled = true;
        break;
      }
      if (stalled) throw new Error("成長シミュレーションの日付を進められませんでした");
      emit();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    g.S.queue.length = 0;
    emit();
  }
  async function applyScenario(g, id, report) {
    const sc = SCENARIOS[id];
    if (!sc || id === "normal") return g;
    const S2 = g.S, h = g.hero;
    await fastForward(g, S2.bornM + 12 * sc.startAge + 1, report);
    if (S2.ended) return g;
    g.placeInHome();
    h.flags.retired = false;
    h.flags.partTime = false;
    S2.scenario = { id, startM: S2.M, deadlineM: S2.M + 12 * sc.years, state: "running", ok: false };
    if (id === "layoff") {
      const pr = g.prof();
      pr.jxp.officeworker = Math.max(pr.jxp.officeworker || 0, 150);
      pr.rank = Math.max(pr.rank, 2);
      if (h.job) g.dismiss("\u4F1A\u793E\u306E\u696D\u7E3E\u60AA\u5316\u3067\u89E3\u96C7\u3055\u308C");
      h.job = null;
      S2.queue.length = 0;
      h.money = g.yen(15e4);
      h.debt = g.yen(25e5);
      h.stats.mood = 35;
      h.stats.energy = 70;
      g.log("scenario", `${h.name}(${g.age()}\u6B73)\u306F\u4F1A\u793E\u306E\u696D\u7E3E\u60AA\u5316\u3067\u89E3\u96C7\u3055\u308C\u305F\u3002\u501F\u91D1${g.yen(25e5).toLocaleString("ja-JP")}\u5186\u3068\u3001\u308F\u305A\u304B\u306A\u8CAF\u91D1\u3002\u3053\u3053\u304B\u3089\u9006\u8EE2\u3067\u304D\u308B\u304B\u3002`);
    } else if (id === "homeless") {
      if (h.job) g.dismiss("\u4F1A\u793E\u304C\u5012\u308C");
      h.job = null;
      S2.queue.length = 0;
      const w = g.world, B2 = w.map.buildings;
      const inn = B2.filter((b) => b.type === "bizhotel" || b.type === "minshuku").sort((a, b) => a.idx - b.idx)[0] || B2.find((b) => b.type === "apt");
      const old = h.homeB;
      w.moveHome(h.id, inn.idx);
      h.homeB = inn.idx;
      h.homeIsParents = false;
      h.owned = [];
      h.mort = null;
      h.invest = null;
      h.veh = null;
      h.flags.shelter = true;
      h.money = g.yen(12e3);
      h.debt = 0;
      h.stats.health = Math.min(h.stats.health, 60);
      h.stats.mood = 30;
      h.stats.energy = 60;
      g.syncWorldFlags();
      g.placeInHome();
      g.log("scenario", `${h.name}(${g.age()}\u6B73)\u306F\u4ED5\u4E8B\u3068\u4F4F\u307E\u3044\u3092\u5931\u3044\u3001${inn.name}\u306E\u7C21\u6613\u306A\u4E00\u5BA4\u3067\u66AE\u3089\u3057\u59CB\u3081\u305F\u3002\u5E02\u5F79\u6240\u306E\u7A93\u53E3\u306B\u76F8\u8AC7\u3067\u304D\u308B\u3002`);
    } else if (id === "banchou") {
      h.stats.fitness = Math.max(h.stats.fitness, 55);
      h.flags.banRep = 0;
      g.log("scenario", `${h.name}(${g.age()}\u6B73)\u306F\u3001\u8857\u306E\u4E0D\u826F\u305F\u3061\u306E\u9593\u3067\u540D\u524D\u304C\u77E5\u3089\u308C\u306F\u3058\u3081\u3066\u3044\u305F\u3002\u8155\u3063\u3077\u3057\u3067\u751F\u304D\u308B\u306E\u304B\u3001\u5225\u306E\u9053\u3092\u9078\u3076\u306E\u304B\u3002`);
    } else if (id === "outlaw") {
      if (h.job) g.dismiss("\u578B\u306B\u306F\u307E\u3063\u305F\u66AE\u3089\u3057\u306B\u5ACC\u6C17\u304C\u3055\u3057\u3066");
      h.job = null;
      S2.queue.length = 0;
      h.money = g.yen(6e4);
      h.flags.honor = 0;
      g.log("scenario", `${h.name}(${g.age()}\u6B73)\u306F\u3001\u6C7A\u307E\u3063\u305F\u52E4\u3081\u5148\u3092\u6301\u305F\u306A\u3044\u300C\u306F\u3050\u308C\u8005\u300D\u3068\u3057\u3066\u751F\u304D\u3066\u3044\u304F\u3053\u3068\u306B\u3057\u305F\u3002`);
    } else if (id === "heritage") {
      if (h.job) g.dismiss("\u5BB6\u696D\u3092\u7D99\u3050\u305F\u3081");
      h.job = null;
      S2.queue.length = 0;
      setupBiz(g);
      h.money = g.yen(3e5);
      h.debt = 0;
      g.log("scenario", `${h.name}(${g.age()}\u6B73)\u306F\u3001\u4EE3\u3005\u7D9A\u304F\u5E97\u3092\u7D99\u3050\u3053\u3068\u306B\u306A\u3063\u305F\u3002\u5E97\u306B\u7ACB\u3061\u3001\u8A55\u5224\u3092\u80B2\u3066\u3001\u3044\u3064\u304B\u6B21\u306E\u4EE3\u306B\u3064\u306A\u3050\u3002`);
    }
    g.snapshotStats();
    return g;
  }
  var scenarioInfo = (g) => {
    const s = g.S.scenario;
    return s ? { ...s, ...SCENARIOS[s.id] } : null;
  };
  function monthlyScenario(g) {
    const S2 = g.S, sc = S2.scenario, h = g.hero;
    if (!sc || sc.state !== "running") return;
    let ok = false;
    if (sc.id === "layoff") {
      sc.stable = h.job && !h.flags.partTime ? (sc.stable || 0) + 1 : 0;
      ok = sc.stable >= 6 && h.debt <= 0;
    } else if (sc.id === "homeless") {
      const homed = !h.flags.shelter;
      sc.stable = homed && h.job ? (sc.stable || 0) + 1 : 0;
      ok = sc.stable >= 3;
    } else if (sc.id === "heritage") {
      const b = h.biz;
      if (!b || b.state !== "open") {
        sc.state = "lapsed";
        g.log("scenario", "\u5E97\u3092\u7D9A\u3051\u308B\u3053\u3068\u306F\u3067\u304D\u306A\u304B\u3063\u305F\u3002\u305D\u308C\u3067\u3082\u4EBA\u751F\u306F\u7D9A\u3044\u3066\u3044\u304F\u3002");
        return;
      }
      ok = g.age() >= 50 && b.heir >= 12 && b.rep >= 55;
    }
    const friends = Object.values(h.rel).filter((r) => r.aff >= 50 && !r.family).length;
    if (sc.id === "banchou") ok = g.age() >= 25 && friends >= 5 && !h.flags.banRecord && !!h.job;
    else if (sc.id === "outlaw") ok = g.age() >= 30 && h.debt <= 0 && !h.flags.banRecord && friends >= 3 && h.money >= g.yen(8e5);
    if (ok) {
      sc.state = "won";
      sc.ok = true;
      sc.wonM = S2.M;
      g.log("scenario", sc.id === "banchou" ? `${h.name}\u306F\u756A\u9577\u306E\u770B\u677F\u3092\u304A\u308D\u3057\u3001\u4EF2\u9593\u3068\u3068\u3082\u306B\u4E00\u4EBA\u524D\u306E\u9053\u3092\u6B69\u307F\u51FA\u3057\u305F\u3002\u9054\u6210!` : sc.id === "outlaw" ? `${h.name}\u306F\u8AB0\u306B\u3082\u7E1B\u3089\u308C\u305A\u3001\u80F8\u3092\u5F35\u308C\u308B\u81EA\u7531\u306A10\u5E74\u3092\u751F\u304D\u629C\u3044\u305F\u3002\u9054\u6210!` : sc.id === "heritage" ? `${h.name}\u306F\u5E97\u306E\u8A55\u5224\u3092\u5B88\u308A\u629C\u304D\u3001\u5B50\u3078\u4ED5\u4E8B\u3092\u4F1D\u3048\u305F\u3002\u4E94\u4EE3\u76EE\u3078\u3064\u306A\u304C\u308B\u9054\u6210!` : sc.id === "layoff" ? `${h.name}\u306F\u6B63\u793E\u54E1\u306B\u5FA9\u5E30\u3057\u3001\u501F\u91D1\u3082\u5B8C\u6E08\u3057\u305F\u3002\u9006\u8EE2\u4EBA\u751F\u306E\u9054\u6210!` : `${h.name}\u306F\u4ED5\u4E8B\u3068\u4F4F\u307E\u3044\u3092\u53D6\u308A\u623B\u3057\u305F\u3002\u518D\u8D77\u306E\u9054\u6210!`);
    } else if (S2.M >= sc.deadlineM) {
      sc.state = "lapsed";
      g.log("scenario", `\u6C7A\u3081\u305F\u671F\u9650\u304C\u6765\u305F\u3002\u76EE\u6A19\u306B\u306F\u5C4A\u304B\u306A\u304B\u3063\u305F\u304C\u3001\u4EBA\u751F\u306F\u7D9A\u3044\u3066\u3044\u304F\u3002`);
    }
  }

