  // src/license.js
  var LICENSE_NAMES = { beautician: "\u7F8E\u5BB9\u5E2B\u514D\u8A31", barber: "\u7406\u5BB9\u5E2B\u514D\u8A31", nurse: "\u770B\u8B77\u5E2B\u514D\u8A31", cooklic: "\u8ABF\u7406\u5E2B\u514D\u8A31", childcare: "\u4FDD\u80B2\u58EB\u8CC7\u683C", mechanic: "\u81EA\u52D5\u8ECA\u6574\u5099\u58EB(2\u7D1A)\u8CC7\u683C", elec2: "\u7B2C\u4E8C\u7A2E\u96FB\u6C17\u5DE5\u4E8B\u58EB", forklift: "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8\u904B\u8EE2\u6280\u80FD\u8B1B\u7FD2\u4FEE\u4E86", heavy: "\u8ECA\u4E21\u7CFB\u5EFA\u8A2D\u6A5F\u68B0\u904B\u8EE2\u6280\u80FD\u8B1B\u7FD2\u4FEE\u4E86", sekou2: "2\u7D1A\u65BD\u5DE5\u7BA1\u7406\u6280\u58EB", curator: "\u5B66\u82B8\u54E1\u8CC7\u683C" };
  var VOC = {
    beauty: { n: "\u7F8E\u5BB9\u5C02\u9580\u5B66\u6821", long: "\u7F8E\u5BB9\u5E2B\u990A\u6210\u65BD\u8A2D", qual: "beautician", job: "hairdresser", law: "\u7F8E\u5BB9\u5E2B\u6CD5", yrs: (y) => y >= 1998 ? 2 : 1, intern: (y) => y >= 1998 ? 0 : 12, minAge: (y) => y >= 1998 ? 18 : 15, tuition: 13e5, entrance: 2e5, exam: { months: [3, 9], fee: 17e3, base: 0.78 }, reg: 9e3, rooms: ["\u7F8E\u5BB9\u5B9F\u7FD2\u5BA4(\u6905\u5B50\u30FB\u93E1\u30FB\u30B7\u30E3\u30F3\u30D7\u30FC\u53F0)", "\u6559\u5BA4", "\u8A66\u9A13\u5BA4"] },
    barber: { n: "\u7406\u5BB9\u5C02\u9580\u5B66\u6821", long: "\u7406\u5BB9\u5E2B\u990A\u6210\u65BD\u8A2D", qual: "barber", job: "hairdresser", law: "\u7406\u5BB9\u5E2B\u6CD5", yrs: (y) => y >= 1998 ? 2 : 1, intern: (y) => y >= 1998 ? 0 : 12, minAge: (y) => y >= 1998 ? 18 : 15, tuition: 12e5, entrance: 18e4, exam: { months: [3, 9], fee: 17e3, base: 0.8 }, reg: 9e3, rooms: ["\u7406\u5BB9\u5B9F\u7FD2\u5BA4(\u7406\u5BB9\u6905\u5B50\u30FB\u30B7\u30E3\u30F3\u30D7\u30FC\u53F0)", "\u6559\u5BA4", "\u8A66\u9A13\u5BA4"] },
    nursing: { n: "\u770B\u8B77\u5C02\u9580\u5B66\u6821", long: "\u770B\u8B77\u5E2B\u990A\u6210\u6240", qual: "nurse", job: "nurse", law: "\u4FDD\u5065\u5E2B\u52A9\u7523\u5E2B\u770B\u8B77\u5E2B\u6CD5", yrs: () => 3, intern: () => 0, minAge: () => 18, tuition: 11e5, entrance: 25e4, exam: { months: [1], fee: 5400, base: 0.9 }, reg: 9e3, rooms: ["\u6F14\u7FD2\u5BA4", "\u75C5\u5BA4\u3092\u6A21\u3057\u305F\u5B9F\u7FD2\u8A2D\u5099", "\u6559\u5BA4"] },
    cooking: { n: "\u8ABF\u7406\u5C02\u9580\u5B66\u6821", long: "\u8ABF\u7406\u5E2B\u990A\u6210\u65BD\u8A2D", qual: "cooklic", job: "cook", law: "\u8ABF\u7406\u5E2B\u6CD5", yrs: () => 1, intern: () => 0, minAge: () => 18, tuition: 1e6, entrance: 15e4, exam: null, reg: 6e3, rooms: ["\u8ABF\u7406\u5B9F\u7FD2\u5BA4(\u53A8\u623F\u30FB\u30AA\u30FC\u30D6\u30F3)", "\u6559\u5BA4"] },
    childcare: { n: "\u4FDD\u80B2\u5C02\u9580\u5B66\u6821", long: "\u6307\u5B9A\u4FDD\u80B2\u58EB\u990A\u6210\u65BD\u8A2D", qual: "childcare", job: "childcare", law: "\u5150\u7AE5\u798F\u7949\u6CD5", yrs: () => 2, intern: () => 0, minAge: () => 18, tuition: 9e5, entrance: 15e4, exam: null, reg: 4400, rooms: ["\u4FDD\u80B2\u5B9F\u7FD2\u5BA4", "\u97F3\u697D\u5BA4", "\u6559\u5BA4"] },
    mechanic: { n: "\u81EA\u52D5\u8ECA\u6574\u5099\u5C02\u9580\u5B66\u6821", long: "\u81EA\u52D5\u8ECA\u6574\u5099\u58EB\u990A\u6210\u65BD\u8A2D", qual: "mechanic", job: "factory", law: "\u9053\u8DEF\u904B\u9001\u8ECA\u4E21\u6CD5", yrs: () => 2, intern: () => 0, minAge: () => 18, tuition: 95e4, entrance: 15e4, exam: { months: [2], fee: 8e3, base: 0.85 }, reg: 0, rooms: ["\u6574\u5099\u5DE5\u5834(\u30EA\u30D5\u30C8\u30FB\u5DE5\u5177\u30FB\u5B9F\u7FD2\u8ECA)", "\u6559\u5BA4"] },
    // 電気・建設・産業(日本文化/産業拡張)。試験月: 第二種電気工事士は技能試験が7月/12月(筆記は4-5月/9-10月)、合格率は筆記55-62%・技能71-73%(TAC 令和8年度上期発表)。費用は目安。
    elec: { n: "\u96FB\u6C17\u30FB\u96FB\u5B50\u5C02\u9580\u5B66\u6821", long: "\u96FB\u6C17\u5DE5\u4E8B\u58EB\u990A\u6210\u65BD\u8A2D(\u7B2C\u4E8C\u7A2E)", qual: "elec2", job: "electrician", law: "\u96FB\u6C17\u5DE5\u4E8B\u58EB\u6CD5", yrs: () => 2, intern: () => 0, minAge: () => 18, tuition: 9e5, entrance: 15e4, exam: { months: [7, 12], fee: 9300, base: 0.55 }, reg: 5200, rooms: ["\u96FB\u6C17\u5B9F\u7FD2\u5BA4(\u914D\u7DDA\u30FB\u76E4)", "\u6559\u5BA4", "\u8A66\u9A13\u5BA4"] },
    civil: { n: "\u5EFA\u7BC9\u30FB\u571F\u6728\u5C02\u9580\u5B66\u6821", long: "\u65BD\u5DE5\u7BA1\u7406\u6280\u58EB(2\u7D1A)\u53D7\u9A13\u5BFE\u7B56\u8AB2\u7A0B", qual: "sekou2", job: "foreman", law: "\u5EFA\u8A2D\u696D\u6CD5", yrs: () => 2, intern: () => 0, minAge: () => 18, tuition: 95e4, entrance: 15e4, exam: { months: [6, 11], fee: 14e3, base: 0.5 }, reg: 0, rooms: ["\u88FD\u56F3\u5BA4", "\u6E2C\u91CF\u5B9F\u7FD2", "\u6559\u5BA4"] },
    forklift: { n: "\u6280\u80FD\u8B1B\u7FD2\u30BB\u30F3\u30BF\u30FC(\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8)", long: "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8\u904B\u8EE2\u6280\u80FD\u8B1B\u7FD2(1\u30C8\u30F3\u4EE5\u4E0A)", qual: "forklift", job: "forklift", law: "\u52B4\u50CD\u5B89\u5168\u885B\u751F\u6CD5", yrs: () => 1 / 12, intern: () => 0, minAge: () => 18, tuition: 36e3, entrance: 0, exam: null, reg: 0, rooms: ["\u8B1B\u7FD2\u5BA4", "\u5B9F\u6280\u30B3\u30FC\u30B9"] },
    heavy: { n: "\u6280\u80FD\u8B1B\u7FD2\u30BB\u30F3\u30BF\u30FC(\u8ECA\u4E21\u7CFB\u5EFA\u8A2D\u6A5F\u68B0)", long: "\u8ECA\u4E21\u7CFB\u5EFA\u8A2D\u6A5F\u68B0(\u6574\u5730\u30FB\u904B\u642C\u30FB\u7A4D\u8FBC\u307F\u30FB\u6398\u524A)\u904B\u8EE2\u6280\u80FD\u8B1B\u7FD2(3\u30C8\u30F3\u4EE5\u4E0A)", qual: "heavy", job: "heavy", law: "\u52B4\u50CD\u5B89\u5168\u885B\u751F\u6CD5", yrs: () => 1 / 12, intern: () => 0, minAge: () => 18, tuition: 42e3, entrance: 0, exam: null, reg: 0, rooms: ["\u8B1B\u7FD2\u5BA4", "\u5B9F\u6280\u30B3\u30FC\u30B9"] }
  };
  var NAMES = ["\u9752\u6D77", "\u307F\u306A\u3068", "\u3055\u304F\u3089", "\u5B66\u5712\u90FD\u5E02", "\u3042\u304A\u305E\u3089", "\u3072\u304B\u308A", "\u3064\u3070\u3055", "\u7DD1\u30F6\u4E18", "\u305B\u305B\u3089\u304E"];
  function assignVoc(map2) {
    const cr = map2.buildings.filter((b) => b.type === "cram");
    if (!cr.length) return;
    const order = ["beauty", "barber", "nursing", "cooking", "childcare", "mechanic"];
    cr.forEach((b, i) => {
      if (b.voc) return;
      const ks = [order[i % order.length]];
      if (cr.length >= 3 && i >= order.length) ks.push(order[(i + 2) % order.length]);
      if (cr.length > 6 && i < 3) ks.push(order[(i + 3) % order.length]);
      b.voc = { k: [...new Set(ks)] };
      b.name = `${NAMES[i % NAMES.length]}${VOC[ks[0]].n}`;
    });
    ["elec", "civil", "forklift", "heavy"].forEach((k, j) => {
      const b = cr[(j * 2 + 1) % cr.length];
      if (b.voc && !b.voc.k.includes(k)) b.voc.k.push(k);
    });
  }
  var vocKinds = (b) => b && b.voc ? b.voc.k : [];
  function licOf(g) {
    const h = g.hero;
    return h.lic || (h.lic = { enr: null, hist: [], work: {}, kanri: {}, tries: {}, pass: {}, intern: {} });
  }
  var hasLic = (g, key) => !!(g.hero.quals && g.hero.quals[key]);
  var salonKey = (b) => {
    const K3 = salonKind(b);
    return K3 && (K3.k === "barber" || K3.k === "oldbarber") ? "barber" : "beautician";
  };
  function npcLicensed(g, id) {
    const age = g.ageOf ? g.ageOf(id) : 99;
    return age >= 21;
  }
  function enrollOptions(g, bIdx) {
    const b = g.world.map.buildings[bIdx];
    return vocKinds(b).map((k) => ({ k, ...VOC[k], yrs: VOC[k].yrs(g.year()), intern: VOC[k].intern(g.year()), minAge: VOC[k].minAge(g.year()) }));
  }
  function enrollVoc(g, bIdx, k, opt = {}) {
    const h = g.hero, L2 = licOf(g), V2 = VOC[k], b = g.world.map.buildings[bIdx];
    if (!V2 || !vocKinds(b).includes(k)) return { ok: false, msg: "\u3053\u306E\u5B66\u6821\u306B\u306F\u305D\u306E\u5B66\u79D1\u304C\u3042\u308A\u307E\u305B\u3093" };
    const y = g.year();
    if (L2.enr) return { ok: false, msg: `\u3059\u3067\u306B${VOC[L2.enr.k].n}\u306B\u5728\u5B66\u4E2D\u3067\u3059` };
    if (hasLic(g, V2.qual)) return { ok: false, msg: `\u3059\u3067\u306B${LICENSE_NAMES[V2.qual]}\u3092\u6301\u3063\u3066\u3044\u307E\u3059` };
    if (g.age() < V2.minAge(y)) return { ok: false, msg: `${V2.n}\u306F${V2.minAge(y)}\u6B73\u304B\u3089\u5165\u5B66\u3067\u304D\u307E\u3059` };
    if (g.isStudentNow && g.isStudentNow()) return { ok: false, msg: "\u4ECA\u306E\u5B66\u6821\u3092\u5352\u696D\u3057\u3066\u304B\u3089\u5165\u5B66\u3067\u304D\u307E\u3059" };
    const ent = g.yen(V2.entrance);
    if (h.money < ent) return { ok: false, msg: `\u5165\u5B66\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(${ent.toLocaleString("ja-JP")}\u5186)` };
    g.pay(ent, `${V2.n}\u306E\u5165\u5B66\u91D1`);
    if (h.job && !h.job.part) {
      h.job.part = true;
      h.job.partBy = "voc";
    }
    L2.enr = { k, b: bIdx, M0: g.S.M, need: V2.yrs(y) * 12, M: 0, score: 0, loan: !!opt.loan, state: "study", internM: 0, passM: null, regM: null };
    L2.hist.push([g.S.M, k, "enroll", bIdx]);
    g.log("school", `${b.name}(${V2.long})\u306B\u5165\u5B66\u3057\u305F`, { b: bIdx });
    return { ok: true, msg: `${b.name}\u306B\u5165\u5B66\u3057\u307E\u3057\u305F\u3002\u4FEE\u696D\u5E74\u9650\u306F${V2.yrs(y) < 1 ? "\u8B1B\u7FD2" + Math.round(V2.yrs(y) * 12) + "\u304B\u6708(\u6570\u65E5\u9593\u306E\u5B9F\u6280\u3092\u542B\u3080)" : V2.yrs(y) + "\u5E74"}${V2.intern(y) ? `(\u5352\u696D\u5F8C\u306B\u5B9F\u5730\u4FEE\u7DF4${V2.intern(y)}\u304B\u6708\u304C\u5FC5\u8981)` : ""}\u3067\u3059\u3002` };
  }
  function withdrawVoc(g) {
    const L2 = licOf(g);
    if (!L2.enr) return { ok: false, msg: "\u5728\u5B66\u3057\u3066\u3044\u307E\u305B\u3093" };
    const k = L2.enr.k;
    L2.hist.push([g.S.M, k, "withdraw"]);
    L2.enr = null;
    endStudy(g);
    g.log("school", `${VOC[k].n}\u3092\u9000\u5B66\u3057\u305F`);
    return { ok: true, msg: "\u9000\u5B66\u3057\u307E\u3057\u305F(\u8CC7\u683C\u306F\u53D6\u5F97\u3057\u3066\u3044\u307E\u305B\u3093)\u3002" };
  }
  function passProb(g, E2, V2) {
    const tries = licOf(g).tries[E2.k] || 0;
    return Math.max(0.25, Math.min(0.97, V2.exam.base * (0.55 + Math.min(0.5, E2.score / 160)) + Math.min(0.1, tries * 0.04)));
  }
  function sitExam(g, E2, V2) {
    const L2 = licOf(g), h = g.hero;
    const fee = g.yen(V2.exam.fee);
    if (h.money < fee) {
      g.log("school", "\u53D7\u9A13\u6599\u304C\u8DB3\u308A\u305A\u3001\u4ECA\u56DE\u306E\u8A66\u9A13\u306F\u53D7\u3051\u3089\u308C\u306A\u304B\u3063\u305F");
      return false;
    }
    g.pay(fee, `${LICENSE_NAMES[V2.qual]}\u306E\u56FD\u5BB6\u8A66\u9A13(\u53D7\u9A13\u6599)`);
    L2.tries[E2.k] = (L2.tries[E2.k] || 0) + 1;
    const p = passProb(g, E2, V2);
    const roll = hash2(h.id * 7 + g.S.M, 9001 + L2.tries[E2.k]) % 1e3 / 1e3;
    if (roll < p) {
      E2.passM = g.S.M;
      L2.pass[E2.k] = g.S.M;
      L2.hist.push([g.S.M, E2.k, "pass"]);
      g.log("school", `${LICENSE_NAMES[V2.qual]}\u306E\u56FD\u5BB6\u8A66\u9A13\u306B\u5408\u683C\u3057\u305F`);
      return true;
    }
    L2.hist.push([g.S.M, E2.k, "fail"]);
    g.log("school", `${LICENSE_NAMES[V2.qual]}\u306E\u56FD\u5BB6\u8A66\u9A13\u306F\u4E0D\u5408\u683C\u3060\u3063\u305F(\u6B21\u306E\u8A66\u9A13\u3067\u518D\u6311\u6226\u3067\u304D\u308B)`);
    return false;
  }
  function register(g, E2, V2) {
    const L2 = licOf(g), h = g.hero;
    const fee = g.yen(V2.reg);
    if (fee && h.money < fee) return false;
    if (fee) g.pay(fee, `${LICENSE_NAMES[V2.qual]}\u306E\u767B\u9332\u514D\u8A31\u7A0E\u30FB\u767B\u9332\u624B\u6570\u6599`);
    h.quals[V2.qual] = 1;
    E2.regM = g.S.M;
    L2.hist.push([g.S.M, E2.k, "register"]);
    g.log("school", `${LICENSE_NAMES[V2.qual]}\u306E\u767B\u9332\u3092\u53D7\u3051\u3001\u514D\u8A31\u3092\u5F97\u305F`);
    L2.enr = null;
    endStudy(g);
    return true;
  }
  function endStudy(g) {
    const j = g.hero.job;
    if (j && j.partBy === "voc") {
      delete j.part;
      delete j.partBy;
    }
  }
  function monthlyLicense(g) {
    const h = g.hero, L2 = licOf(g), y = g.year();
    const m0 = g.month0();
    for (const key of ["beautician", "barber"]) {
      if (!hasLic(g, key)) continue;
      if (practising(g, key)) L2.work[key] = (L2.work[key] || 0) + 1;
    }
    if (h.job && h.job.jobId === "hairdresser" && !h.job.role) {
      const key = salonKey(g.bld(h.job.b));
      if (hasLic(g, key) && g.S.M - h.job.since >= 48 && (h.skills.styling || 0) >= 50) {
        h.job.role = "chief";
        g.log("job", `${g.bld(h.job.b).name}\u306E\u5E97\u9577\u306B\u6607\u9032\u3057\u305F`, { b: h.job.b });
      }
    }
    const E2 = L2.enr;
    if (!E2) return;
    const V2 = VOC[E2.k];
    if (h.job && !h.job.part) {
      h.job.part = true;
      h.job.partBy = "voc";
    }
    if (E2.state === "study") {
      E2.M++;
      const tu = g.yen(V2.yrs(y) < 1 ? V2.tuition : V2.tuition / 12);
      if (E2.loan) {
        h.debt = (h.debt || 0) + tu;
      } else {
        g.pay(tu, `${V2.n}\u306E\u6388\u696D\u6599`);
      }
      E2.score += 3 + h.stats.intel / 30 + (h.study || 0) / 60;
      if (V2.job === "hairdresser") h.skills.styling = Math.min(100, (h.skills.styling || 0) + 1.2);
      if (E2.M >= E2.need) {
        L2.hist.push([g.S.M, E2.k, "graduate"]);
        g.log("school", `${V2.n}\u3092\u5352\u696D\u3057\u305F`, { b: E2.b });
        const it = V2.intern(y);
        if (it > 0) {
          E2.state = "intern";
          E2.internNeed = it;
        } else if (!V2.exam) {
          register(g, E2, V2);
          return;
        } else E2.state = "exam";
      } else if (V2.exam && V2.yrs(y) * 12 - E2.M <= 6 && V2.intern(y) === 0 && E2.passM == null && V2.exam.months.includes(m0)) sitExam(g, E2, V2);
      return;
    }
    if (E2.state === "intern") {
      if (h.job && h.job.jobId === V2.job) E2.internM++;
      if (E2.internM >= E2.internNeed) {
        E2.state = "exam";
        g.log("school", "\u5B9F\u5730\u4FEE\u7DF4(\u30A4\u30F3\u30BF\u30FC\u30F3)\u3092\u7D42\u3048\u3001\u56FD\u5BB6\u8A66\u9A13\u3092\u53D7\u3051\u3089\u308C\u308B\u3088\u3046\u306B\u306A\u3063\u305F");
      }
      return;
    }
    if (E2.state === "exam") {
      if (E2.passM == null) {
        if (V2.exam.months.includes(m0)) sitExam(g, E2, V2);
      } else if (g.S.M > E2.passM) register(g, E2, V2);
    }
    if (E2.state === "study" && E2.passM != null && E2.M >= E2.need) E2.state = "exam";
  }
  function practising(g, key) {
    const h = g.hero;
    if (h.job && h.job.jobId === "hairdresser" && salonKey(g.bld(h.job.b)) === key && !h.job.part2) return true;
    const f2 = (h.firms || []).find((q) => q.state === "open" && q.ind === "salon" && q.mgr == null && salonKey(g.bld(q.b)) === key);
    return !!f2;
  }
  function kanriReady(g, key) {
    const L2 = licOf(g);
    return hasLic(g, key) && (L2.work[key] || 0) >= 36;
  }
  function takeKanriCourse(g, key) {
    const L2 = licOf(g), h = g.hero;
    if (!hasLic(g, key)) return { ok: false, msg: `${LICENSE_NAMES[key]}\u304C\u5FC5\u8981\u3067\u3059` };
    if ((L2.work[key] || 0) < 36) return { ok: false, msg: `\u514D\u8A31\u53D6\u5F97\u5F8C3\u5E74\u4EE5\u4E0A\u306E\u5B9F\u52D9\u304C\u5FC5\u8981\u3067\u3059(\u3044\u307E${L2.work[key] || 0}\u304B\u6708)` };
    if (L2.kanri[key] != null) return { ok: false, msg: "\u3059\u3067\u306B\u8B1B\u7FD2\u3092\u4FEE\u4E86\u3057\u3066\u3044\u307E\u3059" };
    const fee = g.yen(3e4);
    if (h.money < fee) return { ok: false, msg: `\u8B1B\u7FD2\u6599\u304C\u8DB3\u308A\u307E\u305B\u3093(${fee.toLocaleString("ja-JP")}\u5186)` };
    g.pay(fee, key === "barber" ? "\u7BA1\u7406\u7406\u5BB9\u5E2B\u8B1B\u7FD2" : "\u7BA1\u7406\u7F8E\u5BB9\u5E2B\u8B1B\u7FD2");
    g.advance(2 * 480);
    L2.kanri[key] = g.S.M;
    L2.hist.push([g.S.M, key, "kanri"]);
    g.log("school", `${key === "barber" ? "\u7BA1\u7406\u7406\u5BB9\u5E2B" : "\u7BA1\u7406\u7F8E\u5BB9\u5E2B"}\u306E\u8B1B\u7FD2\u3092\u4FEE\u4E86\u3057\u305F`);
    return { ok: true, msg: `${key === "barber" ? "\u7BA1\u7406\u7406\u5BB9\u5E2B" : "\u7BA1\u7406\u7F8E\u5BB9\u5E2B"}\u306E\u8CC7\u683C\u3092\u5F97\u307E\u3057\u305F\u3002` };
  }
  var isKanri = (g, key) => licOf(g).kanri[key] != null;
  function practitioners(g, f2) {
    const key = salonKey(g.bld(f2.b));
    let n2 = f2.staff.filter((s) => s.lic).length;
    if (f2.mgr == null && hasLic(g, key)) n2++;
    return n2;
  }
  function kanriValid(g, f2) {
    const key = salonKey(g.bld(f2.b));
    if (f2.kanri === "hero") return isKanri(g, key) && hasLic(g, key);
    if (f2.kanri != null) {
      const s = f2.staff.find((q) => q.id === f2.kanri);
      return !!(s && s.lic && s.kanri != null);
    }
    return false;
  }
  function salonLawK(g, f2) {
    const n2 = practitioners(g, f2);
    if (n2 < 1) return 0.03;
    if (n2 >= 2 && !kanriValid(g, f2)) {
      f2.law = 1;
      return 0.8;
    }
    f2.law = 0;
    return 1;
  }
  function heroRoles(g) {
    const h = g.hero, L2 = licOf(g);
    const f2 = (h.firms || []).find((q) => q.state === "open" && q.ind === "salon");
    return { practitioner: hasLic(g, "beautician") || hasLic(g, "barber"), owner: !!f2, chief: !!(h.job && h.job.role === "chief"), kanri: ["beautician", "barber"].filter((k) => isKanri(g, k)), assistant: !!(h.job && h.job.jobId === "hairdresser" && !(hasLic(g, "beautician") || hasLic(g, "barber"))), work: L2.work };
  }

