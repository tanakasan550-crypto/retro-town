  // src/lifestart.js
  var FAMILY_ENVS = {
    auto: { name: "\u304A\u307E\u304B\u305B", desc: "\u6642\u4EE3\u306B\u5FDC\u3058\u305F\u5206\u5E03\u3067\u3001\u3044\u308D\u3044\u308D\u306A\u5BB6\u5EAD\u304B\u3089\u6C7A\u307E\u308A\u307E\u3059\u3002", classes: null },
    rich: { name: "\u5927\u5BCC\u8C6A", desc: "\u5E83\u3044\u6577\u5730\u306E\u8C6A\u90B8\u3084\u9AD8\u7D1A\u30DE\u30F3\u30B7\u30E7\u30F3\u306B\u4F4F\u307F\u3001\u89AA\u306F\u4F01\u696D\u7D4C\u55B6\u8005\u30FB\u6295\u8CC7\u5BB6\u30FB\u4E0D\u52D5\u7523\u7D4C\u55B6\u8005\u306A\u3069\u3002\u305F\u3060\u3057\u89AA\u306E\u8CA1\u7523\u306F\u89AA\u306E\u3082\u306E\u3002\u81EA\u5206\u306E\u6210\u7E3E\u30FB\u4ED5\u4E8B\u30FB\u5C06\u6765\u306F\u81EA\u5206\u306E\u884C\u52D5\u3067\u6C7A\u307E\u308A\u307E\u3059\u3002", classes: ["mansion", "luxcondo"] },
    comfortable: { name: "\u88D5\u798F", desc: "\u5EAD\u306E\u3042\u308B\u4E00\u6238\u5EFA\u3066\u3084\u5206\u8B72\u30DE\u30F3\u30B7\u30E7\u30F3\u3002\u6559\u80B2\u8CBB\u306B\u4F59\u88D5\u304C\u3042\u308B\u304C\u3001\u8D05\u6CA2\u306F\u3067\u304D\u306A\u3044\u3002", classes: ["luxcondo", "condo", "detached", "mansion"] },
    ordinary: { name: "\u3075\u3064\u3046", desc: "\u4E00\u6238\u5EFA\u3066\u3084\u5206\u8B72\u30DE\u30F3\u30B7\u30E7\u30F3\u306E\u3001\u3054\u304F\u666E\u901A\u306E\u5BB6\u5EAD\u3002", classes: ["detached", "condo", "wa"] },
    modest: { name: "\u3064\u3064\u307E\u3057\u3044", desc: "\u30A2\u30D1\u30FC\u30C8\u3084\u56E3\u5730\u3001\u53E4\u3044\u6728\u9020\u4F4F\u5B85\u3002\u5BB6\u8A08\u306F\u53B3\u3057\u3081\u3002", classes: ["apart", "danchi", "oldwood", "farm"] }
  };
  var PATHS = {
    hs: { name: "\u9AD8\u6821\u5728\u5B66\u4E2D", desc: "\u9AD8\u68213\u5E74(\u65E9\u751F\u307E\u308C\u306E18\u6B73)\u3002\u5352\u696D\u3068\u9032\u8DEF\u6C7A\u5B9A\u304C\u76EE\u524D\u30021\u301C3\u6708\u304B\u3089\u59CB\u307E\u308A\u307E\u3059\u3002", month: 0 },
    univ: { name: "\u5927\u5B66\u9032\u5B66\u30FB\u5927\u5B66\u751F", desc: "\u5927\u5B66\u306B\u9032\u5B66\u3057\u305F1\u5E74\u751F(\u53D7\u9A13\u306B\u843D\u3061\u308C\u3070\u6D6A\u4EBA)\u30024\u6708\u304B\u3089\u59CB\u307E\u308A\u307E\u3059\u3002", month: 3 },
    work: { name: "\u5C31\u8077\u3057\u305F\u3070\u304B\u308A", desc: "\u9AD8\u6821\u5352\u696D\u5F8C\u3059\u3050\u306B\u50CD\u304D\u59CB\u3081\u305F\u793E\u4F1A\u4EBA1\u5E74\u76EE\u30024\u6708\u304B\u3089\u59CB\u307E\u308A\u307E\u3059\u3002", month: 3 },
    family: { name: "\u5BB6\u696D\u3092\u624B\u4F1D\u3046", desc: "\u5BB6\u306E\u4E8B\u696D\u3067\u898B\u7FD2\u3044\u3068\u3057\u3066\u50CD\u304F\u3002\u4ED5\u4E8B\u3092\u899A\u3048\u308C\u3070\u5F79\u76EE\u304C\u5897\u3048\u307E\u3059\u30024\u6708\u304B\u3089\u59CB\u307E\u308A\u307E\u3059\u3002", month: 3 },
    undecided: { name: "\u9032\u8DEF\u672A\u5B9A", desc: "\u5352\u696D\u3057\u305F\u304C\u3001\u307E\u3060\u4F55\u3092\u3059\u308B\u304B\u6C7A\u3081\u3066\u3044\u306A\u3044\u3002\u6642\u9593\u306F\u81EA\u7531\u3060\u304C\u3001\u4F55\u3082\u3057\u306A\u3051\u308C\u3070\u4F55\u3082\u5909\u308F\u308A\u307E\u305B\u3093\u3002", month: 3 }
  };
  var FATHER_ROLES = [
    { k: "ceo", name: "\u4F01\u696D\u7D4C\u55B6\u8005", from: 1946, w: 5, biz: ["\u88FD\u9020\u696D\u306E\u4F1A\u793E", "\u5546\u793E", "\u5EFA\u8A2D\u4F1A\u793E", "\u904B\u9001\u4F1A\u793E", "\u98DF\u54C1\u30E1\u30FC\u30AB\u30FC"] },
    { k: "investor", name: "\u6295\u8CC7\u5BB6", from: 1975, w: 2.5, biz: ["\u6295\u8CC7\u4F1A\u793E"] },
    { k: "realty", name: "\u4E0D\u52D5\u7523\u7D4C\u55B6\u8005", from: 1946, w: 3, biz: ["\u4E0D\u52D5\u7523\u4F1A\u793E"] },
    { k: "hospital", name: "\u75C5\u9662\u7D4C\u55B6\u8005", from: 1946, w: 1.5, biz: ["\u7DCF\u5408\u75C5\u9662"] },
    { k: "retail", name: "\u767E\u8CA8\u5E97\u30FB\u5C0F\u58F2\u30C1\u30A7\u30FC\u30F3\u306E\u7D4C\u55B6\u8005", from: 1950, w: 1.5, biz: ["\u5C0F\u58F2\u30C1\u30A7\u30FC\u30F3"] },
    { k: "tech", name: "IT\u4F01\u696D\u306E\u5275\u696D\u8005", from: 1995, w: 2.5, biz: ["IT\u4F01\u696D"] },
    { k: "bank", name: "\u91D1\u878D\u4F1A\u793E\u306E\u5F79\u54E1", from: 1946, w: 1.5, biz: ["\u91D1\u878D\u4F1A\u793E"] }
  ];
  var MOTHER_ROLES = [
    { k: "home", name: "\u5BB6\u5EAD\u3092\u5B88\u308B(\u793E\u4EA4\u30FB\u6148\u5584\u6D3B\u52D5)", w: 4 },
    { k: "co-ceo", name: "\u5171\u540C\u7D4C\u55B6\u8005", w: 2 },
    { k: "realty", name: "\u4E0D\u52D5\u7523\u30AA\u30FC\u30CA\u30FC", w: 1.5 },
    { k: "doctor", name: "\u533B\u5E2B", w: 0.8, from: 1960 },
    { k: "artist", name: "\u753B\u5ECA\u30FB\u6587\u5316\u4E8B\u696D\u306E\u7D4C\u55B6", w: 1 }
  ];
  var pickW2 = (rng, arr, year) => {
    const a = arr.filter((r) => (!r.from || year >= r.from) && (!r.to || year <= r.to));
    let t = 0;
    for (const r of a) t += r.w;
    let x = rng.next() * t;
    for (const r of a) {
      x -= r.w;
      if (x <= 0) return r;
    }
    return a[a.length - 1];
  };
  function makeFamily(g, env, startAgeYear) {
    const h = g.hero, year = startAgeYear ?? g.year();
    const rng = new Rng(g.S.seed, "family-env");
    const F = { env, v: 1 };
    if (env === "rich") {
      const fr = pickW2(rng, FATHER_ROLES, year), mr = pickW2(rng, MOTHER_ROLES, year);
      const biz2 = rng.pick(fr.biz);
      const scale = 0.7 + rng.next() * 0.9;
      F.father = { id: h.father, role: fr.name, rk: fr.k, biz: biz2 };
      F.mother = { id: h.mother, role: mr.name, rk: mr.k };
      F.assets = { realEstate: Math.round(g.yen(24e8 * scale)), deposit: Math.round(g.yen(48e7 * scale)), securities: Math.round(g.yen(9e8 * scale)), business: Math.round(g.yen(15e8 * scale)) };
      F.bizName = `${(g.nameOf(h.father) || "").split(/[\s　]+/)[0]}${fr.k === "tech" ? "\u30C6\u30AF\u30CE\u30ED\u30B8\u30FC\u30BA" : fr.k === "investor" ? "\u30AD\u30E3\u30D4\u30BF\u30EB" : fr.k === "realty" ? "\u4E0D\u52D5\u7523" : fr.k === "hospital" ? "\u7DCF\u5408\u75C5\u9662" : fr.k === "bank" ? "\u91D1\u878D" : fr.k === "retail" ? "\u30B9\u30C8\u30A2\u30FC\u30BA" : "\u7523\u696D"}`;
      F.staff = { chauffeur: rng.chance(year < 1975 ? 0.55 : 0.7), housekeeper: rng.chance(0.75), gardener: rng.chance(0.4) };
      F.cars = [{ k: "parent_lux", name: "\u7236\u306E\u9AD8\u7D1A\u30BB\u30C0\u30F3", owner: "father", who: "father" }, ...rng.chance(0.6) ? [{ k: "parent_wagon", name: "\u6BCD\u306E\u8ECA", owner: "mother", who: "mother" }] : []];
      F.stipend = { student: g.yen(1e5), idle: g.yen(6e4), hs: g.yen(3e4) };
      F.biz = true;
    } else if (env === "comfortable") {
      const fr = rng.pick([["\u533B\u5E2B", "hospital"], ["\u5F01\u8B77\u58EB", "lawyer"], ["\u4F1A\u793E\u306E\u7BA1\u7406\u8077", "mgr"], ["\u4F1A\u8A08\u58EB", "acct"]]);
      F.father = { id: h.father, role: fr[0], rk: fr[1] };
      F.mother = { id: h.mother, role: rng.pick(["\u6559\u54E1", "\u85AC\u5264\u5E2B", "\u5BB6\u5EAD\u3092\u5B88\u308B", "\u770B\u8B77\u5E2B"]), rk: "m" };
      F.assets = { realEstate: Math.round(g.yen(9e7)), deposit: Math.round(g.yen(25e6)), securities: Math.round(g.yen(15e6)), business: 0 };
      F.staff = { chauffeur: false, housekeeper: rng.chance(0.1), gardener: false };
      F.cars = [{ k: "parent_car", name: "\u5BB6\u65CF\u306E\u8ECA", owner: "father", who: "father" }];
      F.stipend = { student: g.yen(6e4), idle: g.yen(3e4), hs: g.yen(2e4) };
      F.biz = false;
    } else {
      F.father = { id: h.father, role: "", rk: "" };
      F.mother = { id: h.mother, role: "", rk: "" };
      F.assets = { realEstate: 0, deposit: 0, securities: 0, business: 0 };
      F.staff = { chauffeur: false, housekeeper: false, gardener: false };
      F.cars = [];
      F.stipend = { student: g.yen(env === "modest" ? 15e3 : 4e4), idle: 0, hs: g.yen(env === "modest" ? 8e3 : 15e3) };
      F.biz = false;
    }
    const SELF = /* @__PURE__ */ new Set(["farmer", "fisher", "craftsman", "cook", "carpenter", "hairdresser"]);
    const pj2 = g.world.pop.job[h.father];
    const jid = pj2 < 255 ? Object.keys(JOBS)[pj2] : null;
    if (jid && SELF.has(jid)) {
      F.biz = true;
      F.bizKind = jid;
    }
    F.trust = 70;
    F.perm = { car: false };
    F.pocket = 0;
    F.owedM = 0;
    return F;
  }
  var tick = () => new Promise((r) => setTimeout(r, 0));
  async function runLifeStart(g, o, onProgress = () => {
  }) {
    const { age = 18, env = "auto", path = "univ", uni = 0 } = o;
    const S2 = g.S, h = g.hero;
    const say = (label, pct2) => {
      try {
        onProgress({ label, pct: pct2 });
      } catch (_) {
      }
    };
    say("\u8857\u3068\u5BB6\u65CF\u3092\u6E96\u5099\u3057\u3066\u3044\u307E\u3059", 2);
    await tick();
    const born = S2.bornM;
    const startM = born + age * 12 + (age === 18 ? PATHS[path]?.month ?? 3 : 0) + 0;
    const mid = Math.min(startM, born + 17 * 12 + 9);
    for (let M = born + 12; M <= mid; M += 12) {
      fastForward(g, Math.min(M, mid));
      const yrs = Math.floor((Math.min(M, mid) - born) / 12);
      say(`${yrs}\u6B73\u307E\u3067\u306E\u66AE\u3089\u3057\u3092\u4F5C\u3063\u3066\u3044\u307E\u3059(\u5BB6\u65CF\u30FB\u53CB\u3060\u3061\u30FB\u5B66\u6821)`, 5 + Math.round(70 * (Math.min(M, mid) - born) / (mid - born)));
      await tick();
    }
    fastForward(g, mid);
    say("\u9032\u8DEF\u3092\u6C7A\u3081\u3066\u3044\u307E\u3059", 78);
    await tick();
    h.flags.done = h.flags.done || {};
    h.flags.done.choose_path18 = 1;
    const U2 = g.world.schools[5] || [];
    if (path === "univ" || path === "hs") {
      const uPick = U2.length ? U2[Math.max(0, Math.min(U2.length - 1, uni | 0))] : null;
      if (path === "univ" && uPick != null) {
        h.flags.univPick = uPick;
        h.flags.path18 = "univ";
        g.log("plan", `\u9032\u8DEF: ${g.bld(uPick).name}\u3092\u53D7\u9A13\u3059\u308B\u3053\u3068\u306B\u3057\u305F`);
      } else if (path === "hs") {
        h.flags.univPick = uPick;
        h.flags.path18 = uPick != null && env !== "modest" ? "univ" : "work";
        g.log("plan", h.flags.path18 === "univ" ? "\u5352\u696D\u5F8C\u306F\u5927\u5B66\u9032\u5B66\u3092\u8003\u3048\u3066\u3044\u308B" : "\u5352\u696D\u5F8C\u306F\u50CD\u304F\u3064\u3082\u308A\u3067\u3044\u308B");
      }
    } else {
      h.flags.path18 = path === "family" ? "work" : path === "undecided" ? "work" : "work";
    }
    say("\u5B66\u6821\u306E\u65E5\u3005\u3092\u9032\u3081\u3066\u3044\u307E\u3059", 82);
    await tick();
    fastForward(g, startM);
    S2.queue.length = 0;
    say("\u5BB6\u5EAD\u306E\u72B6\u614B\u3092\u6574\u3048\u3066\u3044\u307E\u3059", 92);
    await tick();
    applyFamily(g, env, path, age);
    say("\u81EA\u5B85\u3092\u6E96\u5099\u3057\u3066\u3044\u307E\u3059", 97);
    await tick();
    try {
      hireStaff(g);
    } catch (e) {
    }
    g.placeInHome();
    g.snapshotStats();
    S2.queue.length = 0;
    say("\u5B8C\u4E86", 100);
    return g;
  }
  function applyFamily(g, env, path, age) {
    const h = g.hero, S2 = g.S;
    const F = makeFamily(g, env, g.year());
    h.family = F;
    const cap2 = env === "rich" ? g.yen(12e4) : env === "comfortable" ? g.yen(8e4) : g.yen(5e4);
    h.money = Math.min(Math.max(h.money, g.yen(2e4)), cap2);
    h.debt = 0;
    if (path === "work") {
      if (!h.job) {
        try {
          const v = g.vacanciesNear(8);
          if (v.length) {
            v.sort((x, y) => JOBS[y.jobId].wage - JOBS[x.jobId].wage);
            h.flags.partTime = false;
            g.applyJob(v[0].s);
          }
        } catch (_) {
        }
      }
      if (h.job) h.flags.partTime = false;
    } else if (h.job && path !== "hs") {
      g.dismiss("\u9032\u8DEF\u3092\u6C7A\u3081\u308B\u305F\u3081");
      S2.queue.length = 0;
    } else if (h.job && path === "hs") {
      g.dismiss("\u53D7\u9A13\u30FB\u5352\u696D\u306B\u5C02\u5FF5\u3059\u308B\u305F\u3081");
      S2.queue.length = 0;
    }
    if (path === "family") {
      F.work = { role: "\u5BB6\u696D\u306E\u898B\u7FD2\u3044", since: S2.M, xp: 0, hours: 0 };
      if (h.job) g.dismiss("\u5BB6\u696D\u3092\u624B\u4F1D\u3046\u305F\u3081");
      h.job = null;
      h.flags.partTime = false;
      S2.queue.length = 0;
    }
    if (path === "undecided") {
      if (h.job) {
        g.dismiss("\u9032\u8DEF\u3092\u6C7A\u3081\u308B\u305F\u3081");
      }
      h.job = null;
      h.flags.wantJob = false;
      S2.queue.length = 0;
    }
    F.path = path;
    F.startAge = age;
    F.startM = S2.M;
    S2.life = { env, path, age, startM: S2.M, y0: g.year(), v: 1 };
    const nm = FAMILY_ENVS[env]?.name || "";
    g.log("life", `${h.name}(${age}\u6B73)\u306E\u4EBA\u751F\u304C\u59CB\u307E\u3063\u305F\u3002\u5BB6\u5EAD: ${nm}\u30FB\u9032\u8DEF: ${PATHS[path]?.name || ""}`);
  }
  function lifeMonthly(g) {
    const h = g.hero, F = h.family;
    if (!F) return;
    const a = g.age();
    if (F.assets && g.month0() === 0) {
      const r = new Rng(g.S.seed, "fam-assets:" + g.year());
      const d = 1 + (r.next() - 0.45) * 0.1;
      for (const k of ["securities", "business"]) F.assets[k] = Math.round(F.assets[k] * d);
      F.assets.deposit = Math.round(F.assets.deposit * 1.005);
    }
    let dt = 0;
    const student = g.isStudentNow();
    if (student) dt = g.S.m.attend >= 8 ? 2 : g.S.m.absent >= 5 ? -4 : 0;
    else if (h.job || F.work && F.work.hours > 20) dt = 1;
    else if (a >= 18) dt = -1.5;
    if (h.stats.mood < 25) dt -= 0.5;
    F.trust = Math.max(0, Math.min(100, F.trust + dt));
    let pay = 0, why = "";
    const st3 = F.stipend || {};
    if (student) {
      pay = a < 18 || h.edu.cur === 4 ? st3.hs || 0 : st3.student || 0;
      why = "\u89AA\u304B\u3089\u306E\u304A\u5C0F\u9063\u3044\u30FB\u4ED5\u9001\u308A";
    } else if (!h.job && !F.work) {
      pay = (st3.idle || 0) * (F.trust >= 40 ? 1 : 0.3);
      why = "\u89AA\u304B\u3089\u306E\u751F\u6D3B\u8CBB\u306E\u63F4\u52A9";
      if (F.idleM == null) F.idleM = g.S.M;
      if (g.S.M - F.idleM > 18) pay *= 0.5;
    } else {
      F.idleM = null;
      if (F.work) {
        const hrs = F.work.hours;
        const wage = Math.round(g.yen(12e4) * Math.min(1.4, 0.5 + hrs / 140));
        g.earn(wage, `\u7D66\u4E0E(\u5BB6\u696D\u30FB${F.work.role})`);
        F.work.xp += Math.min(1.4, hrs / 120);
        F.work.hours = 0;
        if (F.work.xp > 6 && F.work.role === "\u5BB6\u696D\u306E\u898B\u7FD2\u3044") {
          F.work.role = "\u5BB6\u696D\u306E\u4E00\u4EBA\u524D";
          g.log("job", "\u5BB6\u696D\u3067\u4E00\u4EBA\u524D\u3068\u8A8D\u3081\u3089\u308C\u305F");
        }
      }
    }
    if (student) F.idleM = null;
    if (pay > 0 && F.trust > 15) g.earn(Math.round(pay * (0.6 + F.trust / 250)), why);
    F.covered = (F.covered || 0) + (student && h.edu.cur === 5 ? g.yen(45e3) : 0);
    if (F.env === "rich" || F.env === "comfortable") {
      const back = h.homeIsParents ? 1 : 0;
      void back;
    }
  }
  var parentsCover = (g) => {
    const F = g.hero.family;
    return !!F && (F.env === "rich" || F.env === "comfortable") && g.hero.homeIsParents;
  };
  var DOW2 = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];
  function activityOf(g, id) {
    const W2 = g.world, p = W2.pop, h = g.hero;
    const F = h.family;
    const dt = g.date();
    const hr = dt.h + dt.mi / 60;
    const known = id === h.father || id === h.mother || !!h.rel[id] || W2.known?.has?.(id);
    if (!known) return null;
    const st3 = personActivity(W2, id, g.S.min, dt.dow);
    const dp = dayPlan(W2, id, dt.dow);
    const role = id === h.father ? F?.father?.role : id === h.mother ? F?.mother?.role : "";
    const bname = (i) => (i != null && i >= 0 ? W2.map.buildings[i]?.name : "") || "";
    let now = "\u81EA\u5B85\u3067\u904E\u3054\u3057\u3066\u3044\u308B", next = "";
    const rich = F && F.env === "rich";
    const isExec = rich && id === h.father;
    const isMomBiz = rich && id === h.mother && F.mother?.rk !== "home";
    if (p.gone[id]) return { now: "\u3059\u3067\u306B\u4EA1\u304F\u306A\u3063\u3066\u3044\u307E\u3059", next: "" };
    if (st3.s === 1) now = st3.to === p.home[id] ? "\u5E30\u5B85\u306E\u9014\u4E2D" : `${bname(st3.to) || "\u52E4\u3081\u5148"}\u3078\u79FB\u52D5\u4E2D`;
    else if (st3.s === 2) now = isExec ? `${F.bizName || bname(st3.at) || "\u4F1A\u793E"}\u3067${hr < 12 ? "\u4F1A\u8B70\u30FB\u6C7A\u88C1" : hr < 17 ? "\u6765\u5BA2\u30FB\u5546\u8AC7" : "\u7D4C\u55B6\u4F1A\u8B70"}` : `${bname(st3.at) || "\u52E4\u3081\u5148"}\u3067${dp?.kind === "school" ? "\u52C9\u5F37\u4E2D" : "\u52E4\u52D9\u4E2D"}`;
    else if (st3.s === 3) now = "\u5916\u51FA\u4E2D";
    else if (rich && id === h.father && (dt.dow === 6 || dt.dow === 0) && hr >= 8 && hr < 17) now = dt.dow === 6 ? "\u63A5\u5F85\u30B4\u30EB\u30D5(\u5916\u51FA\u4E2D)" : "\u81EA\u5B85\u3067\u3086\u3063\u304F\u308A\u904E\u3054\u3057\u3066\u3044\u308B";
    else if (isMomBiz && hr >= 10 && hr < 16 && dt.dow >= 1 && dt.dow <= 5) now = "\u5916\u51FA\u4E2D(\u4ED5\u4E8B\u306E\u7528\u4E8B)";
    else if (rich && id === h.mother && F.mother?.rk === "home" && hr >= 11 && hr < 15 && dt.dow !== 0) now = "\u5916\u51FA\u4E2D(\u4F1A\u98DF\u30FB\u6148\u5584\u6D3B\u52D5)";
    else if (hr >= 23 || hr < 6) now = "\u5C31\u5BDD\u4E2D";
    else if (hr >= 6.5 && hr < 8) now = "\u671D\u98DF\u3092\u3068\u3063\u3066\u3044\u308B";
    if (dp && st3.s === 0 && hr < dp.a) next = `${Math.floor(dp.a)}\u6642\u3054\u308D\u51FA\u304B\u3051\u308B\u4E88\u5B9A(${bname(dp.dest) || (dp.kind === "school" ? "\u5B66\u6821" : "\u52E4\u3081\u5148")})`;
    else if (dp && (st3.s === 1 || st3.s === 2) && hr < dp.b) next = `${Math.floor(dp.b)}\u6642\u3054\u308D\u5E30\u5B85\u306E\u4E88\u5B9A`;
    else if (dp && hr >= dp.b) next = "\u4ECA\u65E5\u306F\u3053\u306E\u3042\u3068\u81EA\u5B85\u3067\u904E\u3054\u3059\u4E88\u5B9A";
    else {
      for (let d = 1; d <= 3; d++) {
        const dd = (dt.dow + d) % 7;
        const q = dayPlan(W2, id, dd);
        if (q) {
          next = `${d === 1 ? "\u660E\u65E5" : DOW2[dd] + "\u66DC\u65E5"}\u306E${Math.floor(q.a)}\u6642\u3054\u308D\u51FA\u304B\u3051\u308B\u4E88\u5B9A`;
          break;
        }
      }
      if (!next) next = "\u7279\u306B\u4E88\u5B9A\u306F\u306A\u3055\u305D\u3046";
    }
    return { now, next, role };
  }

