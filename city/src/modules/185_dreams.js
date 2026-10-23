  // src/dreams.js — 将来の夢と人生の目標(主人公とすべての住民)。夢を持つ → 学ぶ → 挑戦する(試験・採用) → 就く → 働く → 人生の記録に残る。
  // ・夢は人口の配列に持つ(dr1 いちばんの夢・dr2 二つ目・drS 段階・drBy 憧れた人の人物ID・drM 夢を持った月)。夢を持たない人生も認める(dr1=255)。
  // ・資格の要る職業は、資格(p.quals / p.lic2)を取るまで就けない(eligibleFor)。資格は「養成の学校・大学 → 試験」で取り、職歴(prof.hist)に
  //   入学・受験・合否・取得を残す。街の始まりより前に働いていた大人の資格は「街の記録より前に取得」として記録する(pre)。
  // ・進路は学力(apt)・家の暮らし向き(親の仕事)・本人の夢で決まり、試験に何度も落ちたら別の道へ(諦める)。社会人からの再挑戦・夢の職への転職・独立もある。
  // ・決定はすべて人物IDと年月からの決定的な値(乱数の流れを変えない)
  // 夢の一覧(番号は追加のみ。セーブに番号で残る)
  var DREAMS = [
    { k: "doctor", n: "医師", jobs: ["doctor"], route: "doctor" },
    { k: "nurse", n: "看護師", jobs: ["nurse"], route: "nurse" },
    { k: "teacher", n: "学校の先生", jobs: ["teacher", "special_teacher"], route: "teaching" },
    { k: "police", n: "警察官", jobs: ["police"], route: "police" },
    { k: "fire", n: "消防士", jobs: ["firefighter"], route: "fire" },
    { k: "pilot", n: "パイロット", jobs: ["pilot"], route: "pilot" },
    { k: "train", n: "電車の運転士・駅員", jobs: ["railstaff"], route: null },
    { k: "mechanic", n: "自動車整備士", jobs: ["mechanic"], route: "mechanic" },
    { k: "architect", n: "建築士", jobs: ["architect", "civil"], route: null, edu: 5 },
    { k: "hair", n: "美容師・理容師", jobs: ["hairdresser"], route: "beautician" },
    { k: "cook", n: "料理人", jobs: ["cook"], route: null, biz: "restaurant" },
    { k: "craft", n: "職人", jobs: ["craftsman", "carpenter"], route: null },
    { k: "science", n: "研究者・科学者", jobs: ["scientist", "professor"], route: "phd" },
    { k: "program", n: "プログラマー", jobs: ["itengineer"], route: null, edu: 4, fromY: 1975 },
    { k: "artist", n: "芸術家・音楽家", jobs: ["artist", "entertainer", "designer"], route: null },
    { k: "athlete", n: "スポーツ選手", jobs: ["athlete", "coach"], route: null },
    { k: "owner", n: "社長・起業家", jobs: ["prodmgr", "plantmgr", "officeworker"], route: null, biz: "office" },
    { k: "farmer", n: "農家", jobs: ["farmer", "forester"], route: null },
    { k: "fisher", n: "漁師", jobs: ["fisher", "sailor"], route: null },
    { k: "official", n: "公務員(市役所)", jobs: ["official", "waterstaff"], route: null, edu: 4 },
    { k: "lawyer", n: "弁護士・裁判官", jobs: ["lawyer", "judge"], route: "bar" },
    { k: "care", n: "介護・福祉の仕事", jobs: ["caregiver"], route: null },
    { k: "pharm", n: "薬剤師", jobs: ["pharmacist"], route: "pharmacist" },
    { k: "nursery", n: "保育士", jobs: ["childcare"], route: "childcare" },
    { k: "media", n: "記者・アナウンサー", jobs: ["reporter", "announcer"], route: null, edu: 4 },
    { k: "shop", n: "自分の店を持つ", jobs: ["clerk", "cook"], route: null, biz: "shop" },
    { k: "electric", n: "電気工事士", jobs: ["electrician", "elecmaint"], route: "elec2" },
    // 職業ではない人生の目標
    { k: "family", n: "家族と仲良く暮らす", life: 1 },
    { k: "community", n: "地域の役に立つ", life: 1 },
    { k: "travel", n: "いろいろな所を旅する", life: 1 }
  ];
  var DREAM_BY = Object.fromEntries(DREAMS.map((d, i) => [d.k, i]));
  // 段階: 0 まだない / 1 あこがれ / 2 学ぶ(養成の学校・大学) / 3 挑戦(受験・採用試験) / 4 かなえた(その仕事に就いた・目標を達成) / 5 別の道へ / 6 諦めた / 7 独立した
  var DREAM_STAGE = ["まだ決めていない", "あこがれ", "学んでいる", "挑戦している", "かなえた", "別の道へ進んだ", "諦めた", "独立した"];
  // 資格の道(養成・受験の条件)。q: p.quals の資格 / l: p.lic2 の免許。edu: 必要な学歴(5=大学)、yrs: 養成の年数、age: 受験できる年齢、
  // apt: 合格の目安、pass: 1回の合格率の目安(実際の試験に近い値)、tries: 諦めるまでの受験回数、exam: 試験の名前、school: 養成の場
  var QROUTE = {
    doctor: { q: "doctor", edu: 5, yrs: 6, age: 24, apt: 150, pass: 0.9, tries: 3, exam: "医師国家試験", school: "大学医学部(6年)" },
    nurse: { q: "nurse", edu: 4, yrs: 3, age: 21, apt: 90, pass: 0.9, tries: 3, exam: "看護師国家試験", school: "看護学校(3年)" },
    pharmacist: { q: "pharmacist", edu: 5, yrs: 6, age: 24, apt: 130, pass: 0.7, tries: 3, exam: "薬剤師国家試験", school: "大学薬学部(6年)" },
    teaching: { q: "teaching", edu: 5, yrs: 4, age: 22, apt: 105, pass: 0.35, tries: 4, exam: "教員採用試験", school: "大学の教職課程" },
    childcare: { q: "childcare", edu: 4, yrs: 2, age: 20, apt: 80, pass: 0.9, tries: 2, exam: "保育士養成校の卒業", school: "保育の専門学校(2年)" },
    police: { q: "police", edu: 3, yrs: 0, age: 18, apt: 80, pass: 0.3, tries: 4, exam: "警察官採用試験", school: "警察学校" },
    fire: { q: "fire", edu: 3, yrs: 0, age: 18, apt: 75, pass: 0.25, tries: 4, exam: "消防官採用試験", school: "消防学校" },
    bar: { q: "bar", edu: 5, yrs: 6, age: 24, apt: 165, pass: 0.35, tries: 5, exam: "司法試験", school: "法学部と法科大学院" },
    phd: { q: "phd", edu: 5, yrs: 9, age: 27, apt: 155, pass: 0.6, tries: 2, exam: "博士論文の審査", school: "大学院の博士課程" },
    pilot: { l: "pilot", edu: 5, yrs: 6, age: 24, apt: 135, pass: 0.7, tries: 3, exam: "事業用操縦士の試験", school: "航空大学校" },
    mechanic: { l: "mechanic", edu: 3, yrs: 2, age: 20, apt: 60, pass: 0.75, tries: 3, exam: "自動車整備士(2級)の試験", school: "整備の専門学校(2年)" },
    beautician: { l: "beautician", edu: 3, yrs: 2, age: 20, apt: 50, pass: 0.85, tries: 3, exam: "美容師国家試験", school: "美容の専門学校(2年)" },
    elec2: { l: "elec2", edu: 3, yrs: 1, age: 18, apt: 70, pass: 0.6, tries: 4, exam: "第二種電気工事士の試験", school: "電気の専門学校・職業訓練" },
    forklift: { l: "forklift", edu: 0, yrs: 0, age: 18, apt: 45, pass: 0.95, tries: 3, exam: "フォークリフト運転技能講習の修了試験", school: "技能講習センター" },
    heavy: { l: "heavy", edu: 0, yrs: 0, age: 18, apt: 50, pass: 0.95, tries: 3, exam: "車両系建設機械の技能講習の修了試験", school: "技能講習センター" },
    sekou2: { l: "sekou2", edu: 3, yrs: 3, age: 23, apt: 85, pass: 0.4, tries: 4, exam: "2級施工管理技士の試験", school: "建設の現場での実務(3年)" },
    curator: { l: "curator", edu: 5, yrs: 4, age: 22, apt: 110, pass: 0.9, tries: 2, exam: "学芸員課程の修了", school: "大学の学芸員課程" }
  };
  // p.lic2 のビット(職業の免許。QUALS に無いもの)
  var LIC2 = ["curator", "forklift", "elec2", "heavy", "sekou2", "mechanic", "beautician", "pilot"];
  var LIC2_NAME = { curator: "学芸員", forklift: "フォークリフト運転技能講習", elec2: "第二種電気工事士", heavy: "車両系建設機械の講習", sekou2: "2級施工管理技士", mechanic: "自動車整備士", beautician: "美容師免許", pilot: "事業用操縦士" };
  var hasLic2 = (p, i, l) => !!(p.lic2 && p.lic2[i] & 1 << LIC2.indexOf(l));
  // その職に就くための資格・免許を持っているか(資格の要らない職は true)
  function holdsFor(w, i, J) {
    const p = w.pop;
    if (J.qual) {
      const qi = QUAL_IDS2.indexOf(J.qual);
      if (qi >= 0 && !(p.quals[i] & 1 << qi)) return false;
    }
    if (J.lic) {
      const qi = QUAL_IDS2.indexOf(J.lic);
      if (qi >= 0) {
        if (!(p.quals[i] & 1 << qi)) return false;
      } else if (LIC2.includes(J.lic) && p.lic2 && !hasLic2(p, i, J.lic)) return false;
    }
    return true;
  }
  var dU = (i, k) => uh(i, k) % 1e4 / 1e4;
  var ageOf = (p, i, M) => Math.floor((M - p.born[i]) / 12);
  function dreamHist(w, i, e) {
    if (!w.prof) return;
    pushHist(w.profOf(i), e);
  }
  function giveRoute(w, i, rt, M, pre) {
    const p = w.pop;
    if (rt.q) {
      const qi = QUAL_IDS2.indexOf(rt.q);
      if (qi < 0 || p.quals[i] & 1 << qi) return false;
      p.quals[i] |= 1 << qi;
    } else {
      const li = LIC2.indexOf(rt.l);
      if (li < 0 || !p.lic2 || p.lic2[i] & 1 << li) return false;
      p.lic2[i] |= 1 << li;
    }
    dreamHist(w, i, { M, k: "qual", q: rt.q || rt.l, ...pre ? { pre: 1 } : {} });
    return true;
  }
  // ---- 街の始まり: 大人の資格(街の記録より前に取得したもの)。その資格の要る職の枠の数の約1.4倍の人が持つ(足りないと街の病院や学校が
  // 始まりから空になる)。学歴・年齢・学力に合う人の中から、決定的な順で選ぶ。専門の資格は1人1つまで・職業の免許も1人1つまで
  function initQuals(w, M) {
    const p = w.pop;
    if (!p.lic2) return;
    // 運転免許(career.js と同じ人。雇う前に)
    const di = QUAL_IDS2.indexOf("driver");
    const demand = {};
    for (let s = 0; s < w.slots.b.length; s++) {
      const J = JOBS[JOB_IDS2[w.slots.job[s]]];
      const k = J.qual || J.lic;
      if (k) demand[k] = (demand[k] || 0) + 1;
    }
    const adults = [];
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i] || p.home[i] < 0) continue;
      const a = ageOf(p, i, M);
      if (a < 18) continue;
      if (di >= 0 && a <= 75 && hash2(i, 909) % 100 < 72) p.quals[i] |= 1 << di;
      adults.push(i);
    }
    const ORDERQ = ["doctor", "bar", "phd", "pharmacist", "teaching", "nurse", "police", "fire", "childcare"];
    const proHas = new Uint8Array(p.n), licHas = new Uint8Array(p.n);
    // 街の始まりの採用(_placeJobsV4)では、専門の資格を持つ人をその資格の職に回す(ふつうの職に先に取られないように)
    w._proHold = proHas;
    for (const k of ORDERQ) {
      const r = QROUTE[k], target = Math.ceil((demand[r.q] || 0) * 1.4);
      const L3 = adults.filter((i) => !proHas[i] && ageOf(p, i, M) >= r.age && ageOf(p, i, M) < 68 && p.apt[i] >= r.apt).sort((a, c) => uh(a, 3702 + r.q.length) - uh(c, 3702 + r.q.length));
      for (const i of L3.slice(0, target)) {
        if (r.edu >= 5) p.edu[i] = Math.max(p.edu[i], 5);
        else if (r.edu === 4) p.edu[i] = Math.max(p.edu[i], 4);
        giveRoute(w, i, r, p.born[i] + r.age * 12, true);
        proHas[i] = 1;
      }
    }
    const LIC_MIN = { curator: [22, 110], forklift: [18, 60], elec2: [18, 70], heavy: [18, 60], sekou2: [25, 90], mechanic: [20, 60], beautician: [20, 50], pilot: [24, 135] };
    for (const l of LIC2) {
      const [ag, ap] = LIC_MIN[l], target = Math.ceil((demand[l] || 0) * 2);
      const L3 = adults.filter((i) => !licHas[i] && ageOf(p, i, M) >= ag && ageOf(p, i, M) < 66 && p.apt[i] >= ap).sort((a, c) => uh(a, 3706 + l.length) - uh(c, 3706 + l.length));
      for (const i of L3.slice(0, target)) {
        giveRoute(w, i, { l }, p.born[i] + ag * 12, true);
        licHas[i] = 1;
        proHas[i] = 1;
      }
    }
  }
  // ---- 夢の決め方: 親・祖父母の仕事、学力、時代、先生から(重み)。決定的
  function dreamWeights(w, i, M, age) {
    const p = w.pop, y = 1900 + Math.floor(M / 12), wt = DREAMS.map((d) => d.life ? 0 : 1);
    const jobOf = (j) => j >= 0 && !p.gone[j] && p.job[j] < 255 ? JOB_IDS2[p.job[j]] : null;
    const fam = [p.mother[i], p.father[i]], gp = [];
    for (const f of fam) if (f >= 0) gp.push(p.mother[f], p.father[f]);
    DREAMS.forEach((d, k) => {
      if (d.fromY && y < d.fromY) wt[k] = 0;
      if (!d.jobs) return;
      // 親・祖父母の仕事(店員・会社員のようなよくある仕事は少しだけ)
      const GEN = /* @__PURE__ */ new Set(["clerk", "officeworker", "cook", "stocker", "cleaner"]);
      for (const f of fam) if (d.jobs.includes(jobOf(f))) wt[k] += GEN.has(jobOf(f)) ? 0.6 : 3;
      for (const f of gp) if (d.jobs.includes(jobOf(f))) wt[k] += GEN.has(jobOf(f)) ? 0.2 : 1;
      const r = d.route ? QROUTE[d.route] : null;
      const need = r ? r.apt : d.edu >= 5 ? 110 : d.edu >= 4 ? 90 : 0;
      if (need && p.apt[i] < need - 25) wt[k] *= age < 12 ? 0.6 : 0.25;
      if (need >= 130 && p.apt[i] >= need) wt[k] *= 1.8;
    });
    // 子どもに人気の夢(スポーツ選手・料理人・先生など)
    for (const [k, v] of [["athlete", 1.5], ["cook", 0.6], ["teacher", 0.5], ["nursery", 0.5], ["doctor", 0.3], ["police", 0.4], ["pilot", 0.3], ["train", 0.4], ["artist", 0.5]]) wt[DREAM_BY[k]] += age < 12 ? v : v / 2;
    if (age >= 15) {
      wt[DREAM_BY.family] = 1.2;
      wt[DREAM_BY.community] = 0.5;
      wt[DREAM_BY.travel] = 0.4;
    }
    return wt;
  }
  function pickDream(w, i, M, age, salt) {
    const wt = dreamWeights(w, i, M, age), tot = wt.reduce((a, c) => a + c, 0);
    let r = dU(i, 3710 + salt) * tot;
    for (let k = 0; k < wt.length; k++) {
      r -= wt[k];
      if (r <= 0) return k;
    }
    return wt.length - 1;
  }
  // 憧れた人: 親がその仕事なら親、先生の夢なら今の担任(在籍している学校の先生)、それ以外は近所の人(同じ職の人の中から)
  function inspirerOf(w, i, d, M) {
    const p = w.pop, D = DREAMS[d];
    if (!D.jobs) return -1;
    for (const f of [p.mother[i], p.father[i]]) if (f >= 0 && !p.gone[f] && p.job[f] < 255 && D.jobs.includes(JOB_IDS2[p.job[f]])) return f;
    if (D.k === "teacher" && p.school[i] >= 0 && typeof teachersAt === "function") {
      const L3 = teachersAt(w, p.school[i], 1900 + Math.floor(M / 12));
      if (L3.length) return L3[uh(i, M) % L3.length];
    }
    return -1;
  }
  function setDream(w, i, d, M, why) {
    const p = w.pop, old = p.dr1[i];
    if (old === d) return;
    if (old !== 255 && p.dr2) p.dr2[i] = old;
    p.dr1[i] = d;
    p.drS[i] = d === 255 ? 0 : 1;
    p.drM[i] = M;
    const by = d === 255 ? -1 : inspirerOf(w, i, d, M);
    p.drBy[i] = by;
    p.trk[i] = 255;
    p.trkY[i] = 0;
    dreamHist(w, i, { M, k: "dream", d, from: old, by, why });
  }
  // 夢の職に就いているか
  var inDreamJob = (p, i) => p.dr1[i] !== 255 && DREAMS[p.dr1[i]].jobs && p.job[i] < 255 && DREAMS[p.dr1[i]].jobs.includes(JOB_IDS2[p.job[i]]);
  // 仕事を探すとき夢の職を優先する(_findJobV4 の距離に掛ける)
  // 選びやすい職: 夢の職と、持っている資格・免許を使う職(運転免許だけで就ける職は除く)
  var QJOBS = null;
  function dreamJobsOf(w, i) {
    const p = w.pop;
    if (!p.dr1) return null;
    QJOBS || (QJOBS = JOB_IDS2.filter((j) => JOBS[j].qual || JOBS[j].lic && JOBS[j].lic !== "driver"));
    // 職の番号 → 距離に掛ける値(夢の職・資格を使う職 0.35、運転免許を使う職 0.7)
    let out = null;
    const put = (j, f2) => {
      out || (out = /* @__PURE__ */ new Map());
      if (!out.has(j) || out.get(j) > f2) out.set(j, f2);
    };
    if (p.dr1[i] !== 255 && DREAMS[p.dr1[i]].jobs) for (const j of DREAMS[p.dr1[i]].jobs) if (JOB_INDEX[j] != null) put(JOB_INDEX[j], 0.35);
    if (p.quals[i] || p.lic2[i]) for (const j of QJOBS) if (holdsFor(w, i, JOBS[j])) put(JOB_INDEX[j], 0.35);
    const di = QUAL_IDS2.indexOf("driver");
    if (di >= 0 && p.quals[i] & 1 << di) for (const j of ["truckdriver", "courier"]) if (JOB_INDEX[j] != null) put(JOB_INDEX[j], 0.7);
    return out;
  }
  // 18歳の進学: 夢に大学が要るなら、学力と家の暮らし向きに合わせて進学しやすく
  function dreamUnivProb(w, i, prob) {
    const p = w.pop;
    if (!p.dr1 || p.dr1[i] === 255) return prob;
    const D = DREAMS[p.dr1[i]], r = D.route ? QROUTE[D.route] : null, edu = r ? r.edu : D.edu || 0;
    if (edu < 5) return prob * 0.8;
    const need = r ? r.apt - 20 : 100;
    if (p.apt[i] < need) return prob;
    // 親の仕事(月給)が少ない家は、進学をあきらめることもある
    let inc = 0;
    for (const f of [p.mother[i], p.father[i]]) if (f >= 0 && !p.gone[f] && p.job[f] < 255) inc += JOBS[JOB_IDS2[p.job[f]]].wage || 0;
    return Math.min(0.95, Math.max(prob, inc >= 25e4 ? 0.88 : 0.6));
  }
  // ---- 毎年(3月=試験・4月=新しい年度)。人ごとに呼ぶ(world.tickMonth)
  function dreamPerson(w, i, M, age) {
    const p = w.pop;
    if (!p.dr1) return;
    const m0 = M % 12;
    if (m0 === 3) {
      // 養成中の年数(夢の道も、仕事の需要からの道も)
      if (p.trk[i] !== 255 && p.trkY[i] < 250) p.trkY[i]++;
      // 夢を持つ(6歳)・考え直す(12・15・18歳)。夢を持たない子もいる
      if (age === 6 && p.dr1[i] === 255 && p.drS[i] === 0) {
        if (dU(i, 3720) < 0.85) setDream(w, i, pickDream(w, i, M, age, 0), M, "子どものころの夢");
        else p.drS[i] = 0;
      } else if ((age === 12 || age === 15 || age === 18) && !inDreamJob(p, i) && p.drS[i] <= 2) {
        const r = dU(i, 3721 + age);
        if (p.dr1[i] === 255 ? r < 0.6 : r < 0.3) setDream(w, i, r < (age === 18 ? 0.06 : 0.03) ? 255 : pickDream(w, i, M, age, age), M, `${age}歳で夢を考え直した`);
      }
      if (age >= 15 && age <= 45) dreamRoute(w, i, M, age);
      // 仕事の需要から資格を目指す(夢とは別に。空きの多い資格の職へ)
      if (age >= 18 && age <= 45 && p.trk[i] === 255) demandRoute(w, i, M, age);
      // 運転免許(18〜22歳で自動車教習所へ)
      if (age >= 18 && age <= 22 && dU(i, M + 3790) < 0.35) {
        const di = QUAL_IDS2.indexOf("driver");
        if (di >= 0 && !(p.quals[i] & 1 << di)) {
          p.quals[i] |= 1 << di;
          dreamHist(w, i, { M, k: "qual", q: "driver", via: "自動車教習所" });
        }
      }
    } else if (m0 === 2 && age >= 18 && age <= 45 && p.trk[i] !== 255) dreamExam(w, i, M, age);
    // 人生の目標(家族): 結婚して子どもがいれば(4月に確かめる)
    if (m0 === 3 && p.dr1[i] === DREAM_BY.family && p.drS[i] === 1 && p.spouse[i] >= 0 && p.kids[i] > 0) {
      p.drS[i] = 4;
      dreamHist(w, i, { M, k: "dreamok", d: p.dr1[i] });
    }
  }
  // 夢をかなえた(その仕事に就いた): 職に就いたとき(world.takeSlot)に確かめて一度だけ記録
  function dreamOnHire(w, i) {
    const p = w.pop;
    if (!p.dr1 || !(p.drS[i] >= 1 && p.drS[i] <= 3) || !inDreamJob(p, i)) return;
    p.drS[i] = 4;
    dreamHist(w, i, { M: w.M, k: "dreamok", d: p.dr1[i], b: p.work[i] });
    dreamReunion(w, i, w.M);
  }
  // 4月: 進路(養成の学校・大学に入る、学ぶ年数を数える、試験を受けられる段階へ)・社会人からの再挑戦・夢の職への転職・独立
  function dreamRoute(w, i, M, age) {
    const p = w.pop, d = p.dr1[i];
    if (d === 255) return;
    const D = DREAMS[d];
    if (D.life) return;
    const r = D.route ? QROUTE[D.route] : null;
    if (r) {
      if (holdsFor(w, i, { qual: r.q, lic: r.l })) {
        if (p.drS[i] < 3) p.drS[i] = 3;
      } else if (p.trk[i] === 255) {
        // 養成に入る: 学歴と学力と年齢がそろったとき(大学が要る道は大学に在学・卒業していること)
        const eduOK = r.edu >= 5 ? p.edu[i] >= 5 || p.school[i] >= 0 && (w.map.buildings[p.school[i]] || {}).type === "univ" : r.edu === 4 ? age >= 18 && p.edu[i] >= 3 : age >= 18;
        if (eduOK && p.apt[i] >= r.apt - 25) {
          p.trk[i] = Object.keys(QROUTE).indexOf(D.route);
          p.trkY[i] = 0;
          p.drS[i] = 2;
          dreamHist(w, i, { M, k: "school", what: r.school, d });
        } else if (age >= 23 && r.edu >= 5 && p.edu[i] < 5 || age >= 30) {
          // 進学できなかった・年齢が過ぎた: 別の道へ(近い夢か、夢を持たない人生)
          dreamChange(w, i, M, age, r.edu >= 5 && p.edu[i] < 5 ? "大学に進めなかった" : "条件がそろわなかった");
        }
      }
    } else if (p.drS[i] === 1 && age >= 18) {
      // 資格の要らない仕事: 学歴の目安がそろえば挑戦(就職活動)
      const ok = !D.edu || p.edu[i] >= D.edu || p.school[i] >= 0;
      if (ok) {
        p.drS[i] = 3;
        dreamHist(w, i, { M, k: "try", d });
      } else if (age >= 25) dreamChange(w, i, M, age, "学歴の目安に届かなかった");
    }
    // 夢の職への転職: 資格がそろい、別の仕事をしているとき(年に一度)
    if (p.drS[i] === 3 && p.work[i] >= 0 && !inDreamJob(p, i) && age < 50 && dU(i, M + 3730) < 0.35) dreamSwitch(w, i, M);
    // 長く働かずに夢がかなわない: 30代で別の道へ
    if (p.drS[i] === 3 && !inDreamJob(p, i) && age >= 35 && dU(i, M + 3731) < 0.25) dreamChange(w, i, M, age, "夢の仕事の空きがなかった");
    // 社会人からの再挑戦(25〜45歳で、夢を諦めた人・別の道の人)
    if ((p.drS[i] === 5 || p.drS[i] === 6) && age >= 25 && age <= 45 && dU(i, M + 3732) < 0.03) {
      const k = ["nurse", "nursery", "care", "elec2r", "mechanic"][uh(i, M) % 5];
      const nd = k === "elec2r" ? DREAM_BY.electric : DREAM_BY[k];
      if (nd != null && nd !== d) {
        setDream(w, i, nd, M, "社会人になってから挑戦し直した");
        dreamHist(w, i, { M, k: "retry", d: nd });
      }
    }
    // 独立(夢の職で5年以上・係長以上): 店を持つ・事務所を開く
    if (p.drS[i] === 4 && D.biz && inDreamJob(p, i) && w.profOf(i).rank >= 2 && (M - w.profOf(i).since) >= 60 && dU(i, M + 3733) < 0.05 && typeof dreamFound === "function") dreamFound(w, i, M);
  }
  // 資格の職の不足(空きの数 − 職のない資格者 − 養成中の人)を年に一度数える
  function qualGaps(w, M) {
    if (w._qgapM === M) return w._qgap;
    const p = w.pop, keys = Object.keys(QROUTE), gap = {};
    const keyOfJob = (J) => J ? keys.find((k) => QROUTE[k].q && QROUTE[k].q === J.qual || QROUTE[k].l && QROUTE[k].l === J.lic) : null;
    for (const s of w.vacant) {
      const k = keyOfJob(JOBS[JOB_IDS2[w.slots.job[s]]]);
      if (k && w.slots.who[s] < 0) gap[k] = (gap[k] || 0) + 1;
    }
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i] || p.home[i] < 0) continue;
      if (p.trk[i] !== 255) {
        const k = keys[p.trk[i]];
        if (k) gap[k] = (gap[k] || 0) - 1;
        continue;
      }
      if (p.work[i] >= 0 || p.flags[i] & 16) continue;
      const a = ageOf(p, i, M);
      if (a < 18 || a > 64) continue;
      for (const k of keys) if (holdsFor(w, i, { qual: QROUTE[k].q, lic: QROUTE[k].l })) gap[k] = (gap[k] || 0) - 1;
    }
    w._qgapM = M;
    w._qgap = gap;
    return gap;
  }
  // 需要から資格を目指す: 職がない人・別の仕事の人・大学生の一部が、空きの多い資格の道へ(学力と学歴が届くものだけ)
  function demandRoute(w, i, M, age) {
    const p = w.pop, gap = qualGaps(w, M);
    if (p.job[i] < 255 && (JOBS[JOB_IDS2[p.job[i]]].qual || JOBS[JOB_IDS2[p.job[i]]].lic)) return;
    if (dU(i, M + 3795) > (p.work[i] < 0 ? 0.3 : 0.06)) return;
    const inUniv = p.school[i] >= 0 && (w.map.buildings[p.school[i]] || {}).type === "univ";
    let best = null, bg = 0;
    for (const [k, r] of Object.entries(QROUTE)) {
      const g = gap[k] || 0;
      if (g <= bg || p.apt[i] < r.apt - 5 || age > r.age + 16) continue;
      if (r.edu >= 5 && !(p.edu[i] >= 5 || inUniv)) continue;
      if (r.edu === 4 && p.edu[i] < 3) continue;
      if (holdsFor(w, i, { qual: r.q, lic: r.l })) continue;
      bg = g;
      best = k;
    }
    if (!best) return;
    gap[best]--;
    p.trk[i] = Object.keys(QROUTE).indexOf(best);
    p.trkY[i] = 0;
    dreamHist(w, i, { M, k: "school", what: QROUTE[best].school, why: "仕事の需要(空きの多い資格の職)" });
  }
  // 3月: 試験(合否と回数を記録。合格で資格を取る。決められた回数で諦める)
  function dreamExam(w, i, M, age) {
    const p = w.pop, key = Object.keys(QROUTE)[p.trk[i]], r = QROUTE[key];
    if (!r) {
      p.trk[i] = 255;
      return;
    }
    // 養成の年数と受験できる年齢
    if (p.trkY[i] < r.yrs - (r.edu >= 5 ? 4 : 0) || age < r.age) return;
    const tries = (p.trkY[i] >> 4) + 0;
    void tries;
    const tried = (w.profOf(i).hist || []).filter((e) => e.k === "exam" && e.q === (r.q || r.l)).length;
    const pr = Math.max(0.05, Math.min(0.97, r.pass + (p.apt[i] - r.apt) / 160));
    const ok = dU(i, M + 3740) < pr;
    dreamHist(w, i, { M, k: "exam", q: r.q || r.l, ok: ok ? 1 : 0, n: tried + 1 });
    if (ok) {
      giveRoute(w, i, r, M, false);
      p.trk[i] = 255;
      if (p.dr1[i] !== 255 && DREAMS[p.dr1[i]].route === key) p.drS[i] = 3;
      // 取った資格を使う職へ(今の仕事が資格の要らない仕事なら、空きがあれば移る)
      if (p.work[i] >= 0 && !(JOBS[JOB_IDS2[p.job[i]]].qual || JOBS[JOB_IDS2[p.job[i]]].lic)) dreamSwitch(w, i, M);
      if (typeof lifeNote === "function") lifeNote(w, i, M, "qual", `${r.exam}に合格した`);
    } else if (tried + 1 >= r.tries) {
      p.trk[i] = 255;
      dreamGiveUp(w, i, M, `${r.exam}に${tried + 1}回落ちた`);
    }
  }
  function dreamGiveUp(w, i, M, why) {
    const p = w.pop;
    p.drS[i] = 6;
    dreamHist(w, i, { M, k: "giveup", d: p.dr1[i], why });
  }
  function dreamChange(w, i, M, age, why) {
    const p = w.pop, old = p.dr1[i];
    // 近い仕事(医師 → 看護師・薬剤師、弁護士 → 公務員 など)か、夢を持たない人生
    const NEAR = { doctor: ["nurse", "pharm", "care"], pharm: ["nurse", "care"], lawyer: ["official", "owner"], science: ["program", "teacher"], teacher: ["nursery", "official"], pilot: ["train", "mechanic"], police: ["official", "care"], fire: ["official", "care"], athlete: ["teacher", "shop"], artist: ["shop", "media"], architect: ["craft", "official"], program: ["owner", "official"], official: ["owner", "care"], media: ["owner", "official"] };
    const L3 = (NEAR[DREAMS[old].k] || []).map((k) => DREAM_BY[k]).filter((k) => {
      const r = DREAMS[k].route ? QROUTE[DREAMS[k].route] : null;
      return !r || p.apt[i] >= r.apt - 15;
    });
    const nd = L3.length && dU(i, M + 3750) < 0.7 ? L3[uh(i, M) % L3.length] : 255;
    p.drS[i] = 5;
    dreamHist(w, i, { M, k: "change", d: old, to: nd, why });
    if (nd !== 255) {
      setDream(w, i, nd, M, `${DREAMS[old].n}から${DREAMS[nd].n}へ`);
    } else {
      p.dr2[i] = old;
      p.dr1[i] = 255;
      p.drS[i] = 5;
    }
  }
  // 夢の職の空き(資格がそろっている人だけ)へ転職
  // 空いている職の枠を職ごとにまとめる(月に一度)
  function vacByJob(w, M) {
    if (w._vbjM === M && w._vbjN === w.slots.b.length) return w._vbj;
    const m = /* @__PURE__ */ new Map();
    for (const s of w.vacant) if (w.slots.who[s] < 0) {
      const j = w.slots.job[s];
      (m.get(j) || m.set(j, []).get(j)).push(s);
    }
    w._vbjM = M;
    w._vbjN = w.slots.b.length;
    w._vbj = m;
    return m;
  }
  function dreamSwitch(w, i, M) {
    const p = w.pop, S2 = w.slots, dj = dreamJobsOf(w, i);
    if (!dj) return false;
    const hb = w.map.buildings[p.home[i]], V = vacByJob(w, M);
    let best = -1, bd = 1e9;
    for (const [j, f2] of dj) {
      if (f2 > 0.35) continue;
      for (const s of V.get(j) || []) {
        if (S2.who[s] >= 0) continue;
        const b = w.map.buildings[S2.b[s]];
        if (b.status === "closed" || !w.eligibleFor(i, JOB_IDS2[j], M)) continue;
        const d = Math.abs(b.doorX - hb.doorX) + Math.abs(b.doorY - hb.doorY);
        if (d < bd) bd = d, best = s;
      }
    }
    if (best < 0) return false;
    const old = p.work[i];
    w.freeSlot(i, "quit");
    const vi = w.vacant.indexOf(best);
    if (vi >= 0) w.vacant.splice(vi, 1);
    w.takeSlot(i, best);
    dreamHist(w, i, { M, k: "switch", from: old, b: S2.b[best] });
    return true;
  }
  // 憧れた人との再会: 夢をかなえた職場に、憧れた人(担任の先生・親)が今も勤めているとき
  function dreamReunion(w, i, M) {
    const p = w.pop, by = p.drBy[i];
    if (by < 0 || p.gone[by]) return;
    const same = p.work[by] >= 0 && p.work[by] === p.work[i];
    const ev = { M, k: "inspire", by, same: same ? 1 : 0, b: p.work[i] };
    dreamHist(w, i, ev);
    dreamHist(w, by, { M, k: "inspired", who: i, b: p.work[i] });
    const rl = by === p.mother[i] ? "母" : by === p.father[i] ? "父" : "先生や先輩";
    if (same) w.newsLog && w.newsLog.push({ y: 1900 + Math.floor(M / 12), kind: "dream", text: `${nameOf(w.seed, i, p)}さんが、子どものころ憧れた${rl === "先生や先輩" ? "" : rl + "の"}${nameOf(w.seed, by, p)}さんと同じ職場で働き始めた`, who: i, by });
  }
  // 古いセーブ・新しい街: 子どもと若い人に夢を、大人には(今の仕事が夢の職なら)かなえた夢を記録する
  function dreamInit(w, M, fresh) {
    const p = w.pop;
    if (!p.dr1 || w.dreamV) return;
    w.dreamV = 1;
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i] || p.home[i] < 0) continue;
      const a = ageOf(p, i, M);
      if (a < 6) continue;
      if (a <= 22) {
        if (dU(i, 3720) < 0.85) {
          p.dr1[i] = pickDream(w, i, M, a, 0);
          p.drS[i] = 1;
          p.drM[i] = M;
          p.drBy[i] = inspirerOf(w, i, p.dr1[i], M);
          dreamHist(w, i, { M, k: "dream", d: p.dr1[i], from: 255, by: p.drBy[i], why: fresh ? "子どものころの夢" : "夢の記録を始めた" });
        }
      } else if (p.job[i] < 255) {
        // 大人: 今の仕事が子どものころの夢だった人(記録より前の夢。pre)
        const jid = JOB_IDS2[p.job[i]], k = DREAMS.findIndex((d) => d.jobs && d.jobs.includes(jid));
        if (k >= 0 && dU(i, 3760) < 0.4) {
          p.dr1[i] = k;
          p.drS[i] = 4;
          p.drM[i] = 0;
        }
      }
    }
  }
  function dreamLabel(p, i) {
    if (!p.dr1) return "";
    const d = p.dr1[i];
    if (d === 255) return p.drS[i] === 5 && p.dr2 && p.dr2[i] !== 255 ? `夢を持たずに暮らしている(昔の夢: ${DREAMS[p.dr2[i]].n})` : "夢はまだない";
    return `${DREAMS[d].n}(${DREAM_STAGE[p.drS[i]]})`;
  }
  // 旧セーブ(夢と免許の記録がない): 今その免許の要る職で働いている人は免許を持っている(記録より前)。大人の資格・子どもの夢を足す
  function dreamUpgrade(w) {
    const p = w.pop, M = w.M;
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i] || p.job[i] === 255) continue;
      const J = JOBS[JOB_IDS2[p.job[i]]];
      if (J && J.lic && LIC2.includes(J.lic)) giveRoute(w, i, { l: J.lic }, M, true);
    }
    initQuals(w, M);
    dreamInit(w, M, false);
  }
  // パイロット(夢の職)の仕事と、その作業・できごと
  if (typeof WORK_TASKS === "object") Object.assign(WORK_TASKS, { pilot: ["飛行前の点検と気象の確認", "操縦(副操縦士と交代)", "到着後の報告と次の便の準備"] });
  if (typeof FLAVOR === "object") Object.assign(FLAVOR, { pilot: [["横風の強い日に、静かに着陸できた。", "s"], ["機長から次の昇格の訓練に推薦された。", "x"]] });
  // ---- 独立(夢の職で経験を積んだ人): 事務所を開く(オフィスビルの空室を借りる)・店を開く(閉まった店を借りる)
  var FOUND_OFFICE = { owner: "trade", lawyer: "law", architect: "arch", program: "soft", media: "press", artist: "design" };
  var FOUND_SHOP = { cook: ["restaurant", "ramen", "cafe", "izakaya"], shop: ["shop", "clothes", "bookstore", "greengrocer", "liquor", "fishshop"] };
  function dreamFound(w, i, M) {
    const p = w.pop, D = DREAMS[p.dr1[i]], y = 1900 + Math.floor(M / 12), hb = w.map.buildings[p.home[i]];
    const sur = (nameOf(w.seed, i, p).split(/\s|　/)[0] || "");
    const dist = (b) => Math.abs(b.doorX - hb.doorX) + Math.abs(b.doorY - hb.doorY);
    const done = (b, what, extra) => {
      dreamHist(w, i, { M, k: "found", b: b.idx, what, ...extra });
      p.drS[i] = 7;
      (w.dev || (w.dev = [])).push({ y, b: b.idx, kind: "found", text: `${nameOf(w.seed, i, p)}さんが${what}を開いた(子どものころの夢: ${D.n})`, ev: `職歴: ${D.n}の仕事${Math.floor((M - w.profOf(i).since) / 12)}年・職位${w.profOf(i).rank}` });
      w.newsLog && w.newsLog.push({ y, kind: "dream", text: `${nameOf(w.seed, i, p)}さんが${b.name}で${what}を開いた`, who: i, b: b.idx });
    };
    const ok = FOUND_OFFICE[D.k];
    if (ok && typeof officeTenants === "function") {
      let best = null, bd = 1e9;
      for (const b of w.map.buildings) {
        if (!isTenantOffice(b) || b.status === "closed" || dist(b) > 120) continue;
        const v = officeTenants(w, b).find((t) => t.vacant);
        if (v && dist(b) < bd) bd = dist(b), best = [b, v];
      }
      if (!best) return false;
      const [b, t] = best, kind = OK_BY[ok], name = sur + (kind.sfx[0] || "事務所");
      w.bizOv || (w.bizOv = {});
      const ov = w.bizOv[b.idx] || (w.bizOv[b.idx] = {}), sl = [];
      const staff = 3 + uh(i, M) % 3;
      let left = staff;
      Object.entries(kind.jobs).forEach(([j, f2], k, arr) => {
        const n2 = k === arr.length - 1 ? left : Math.max(1, Math.min(left, Math.round(staff * f2)));
        for (let q = 0; q < n2; q++) {
          const s = w.slots.b.length;
          w.slots.b.push(b.idx);
          w.slots.job.push(JOB_INDEX[j]);
          w.slots.who.push(-1);
          w.vacant.push(s);
          sl.push(s);
        }
        left -= n2;
      });
      ov[t.key] = { kind: kind.k, name, from: y, sl, rep: i };
      // 創業者は自分の会社の枠へ(資格の要る職ならその資格があること)
      const mine = sl.find((s) => w.eligibleFor(i, JOB_IDS2[w.slots.job[s]], M) && D.jobs.includes(JOB_IDS2[w.slots.job[s]])) ?? sl.find((s) => w.eligibleFor(i, JOB_IDS2[w.slots.job[s]], M));
      if (mine == null) {
        delete ov[t.key];
        return false;
      }
      w.freeSlot(i, "quit");
      const vi = w.vacant.indexOf(mine);
      if (vi >= 0) w.vacant.splice(vi, 1);
      w.takeSlot(i, mine);
      if (typeof foundTeam === "function") foundTeam(w, b, sl.filter((s) => s !== mine), name);
      done(b, `${name}(${kind.n}・${floorName(t.lv)})`, { biz: t.key });
      return true;
    }
    const types = FOUND_SHOP[D.biz === "restaurant" ? "cook" : D.biz === "shop" ? "shop" : ""];
    if (!types) return false;
    let best = null, bd = 1e9;
    for (const b of w.map.buildings) if (types.includes(b.type) && b.status === "closed" && b.campusOf == null && dist(b) < 90 && dist(b) < bd) bd = dist(b), best = b;
    if (!best) return false;
    const b = best, old = b.name;
    const label = BTYPES[b.type].label.split("・")[0];
    b.status = "open";
    b.name = `${sur}${b.type === "restaurant" ? "食堂" : b.type === "ramen" ? "ラーメン" : b.type === "cafe" ? "珈琲店" : b.type === "izakaya" ? "酒場" : label}`;
    b.nameSim = 1;
    b.openYear = y;
    if (b.history) b.history.push({ y, text: `${y}年 ${nameOf(w.seed, i, p)}さんが${b.name}を開いた(旧 ${old})` });
    (w.shopOwn || (w.shopOwn = {}))[b.idx] = i;
    // 自分の店の枠(その建物の空いた枠のうち夢の職のもの。無ければ1つ足す)
    let mine = -1;
    for (let s = 0; s < w.slots.b.length && mine < 0; s++) if (w.slots.b[s] === b.idx && w.slots.who[s] < 0 && D.jobs.includes(JOB_IDS2[w.slots.job[s]])) mine = s;
    if (mine < 0) {
      mine = w.slots.b.length;
      w.slots.b.push(b.idx);
      w.slots.job.push(JOB_INDEX[D.jobs[0]]);
      w.slots.who.push(-1);
    }
    w.freeSlot(i, "quit");
    const vi = w.vacant.indexOf(mine);
    if (vi >= 0) w.vacant.splice(vi, 1);
    w.takeSlot(i, mine);
    done(b, b.name, {});
    return true;
  }
  // ---- 会話: 夢の段階と、記録(職歴の dream/school/exam/dreamok/found/inspire)から
  function dreamFacts(g, id) {
    const w = g.world, p = w.pop, out = [];
    if (!p.dr1 || id == null || id < 0 || p.gone[id]) return out;
    const say = (s, why, pri) => out.push({ say: s, why, pri });
    const age = ageOf(p, id, w.M), d = p.dr1[id], D = d !== 255 ? DREAMS[d] : null;
    const H = w.prof && w.prof.get(id) ? w.prof.get(id).hist || [] : [];
    const last = (k) => [...H].reverse().find((e) => e.k === k);
    const yr = (M) => 1900 + Math.floor(M / 12);
    const nm = (x) => g.nameOf(x), rel = (x) => x === p.mother[id] ? "お母さん" : x === p.father[id] ? "お父さん" : `${nm(x).split(/\s|　/)[0]}先生`;
    const insp = H.find((e) => e.k === "inspired");
    if (insp && !p.gone[insp.who]) say(`${nm(insp.who)}が、私にあこがれて同じ仕事に就いたんだって。うれしいね。`, `職歴の記録(${yr(insp.M)}年・${nm(insp.who)}が夢をかなえた)`, 3);
    if (!D) {
      const ch = last("change"), gu = last("giveup");
      if (age >= 18 && (ch || gu)) {
        const od = DREAMS[(gu || ch).d];
        say(`昔は${od ? od.n : "別の仕事"}になりたかったんだ。${gu ? gu.why + "けど" : ""}今は今の暮らしが気に入ってるよ。`, `夢の記録(${yr((gu || ch).M)}年 ${gu ? "諦めた" : "別の道へ"})`, 2);
      } else if (age >= 6 && age < 18) say("将来の夢? まだ決めてないんだ。", "夢の記録(なし)", 1);
      return out;
    }
    const st = p.drS[id], ds = last("dream"), by = p.drBy[id];
    const byTxt = by >= 0 && !p.gone[by] ? `${rel(by)}みたいになりたくて。` : by >= 0 ? `${rel(by)}にあこがれてね。` : "";
    if (D.life) {
      say(st === 4 ? `${D.n}――それが私の目標。今はそれがかなっているかな。` : `私の目標は「${D.n}」こと。`, `人生の目標の記録(${ds ? yr(ds.M) + "年から" : "記録より前から"})`, 2);
      return out;
    }
    if (age < 15) say(`大きくなったら${D.n}になりたい!${byTxt}`, `夢の記録(${ds ? yr(ds.M) + "年・" + ageOf(p, id, ds.M) + "歳" : ""}${by >= 0 ? "・あこがれた人 " + nm(by) : ""})`, 2);
    else if (st === 1) say(`${D.n}になるのが夢なんだ。${byTxt}`, `夢の記録(${ds ? yr(ds.M) + "年から" : ""})`, 2);
    else if (st === 2) {
      const sc = last("school");
      say(`${D.n}を目指して、${sc ? sc.what : "勉強"}をがんばってるところ。`, `進路の記録(${sc ? yr(sc.M) + "年 " + sc.what : ""})`, 2);
    } else if (st === 3) {
      const ex = last("exam");
      if (ex && !ex.ok) say(`${QROUTE[Object.keys(QROUTE).find((k) => (QROUTE[k].q || QROUTE[k].l) === ex.q)]?.exam || "試験"}に落ちちゃって……でも、あきらめないよ。`, `受験の記録(${yr(ex.M)}年・${ex.n}回目・不合格)`, 3);
      else say(`${D.n}になるために、仕事を探しているんだ。`, "進路の記録(資格・学歴はそろった)", 2);
    } else if (st === 4) {
      const ok = last("dreamok"), ins = last("inspire");
      const wl = p.work[id] >= 0 ? (typeof workplaceLabel === "function" ? workplaceLabel(w, id) : null) || w.map.buildings[p.work[id]].name : "";
      say(`子どものころからの夢だった${D.n}になれたんだ。${wl ? "今は" + wl + "で働いているよ。" : ""}`, `職歴の記録(${ok ? yr(ok.M) + "年 " + D.n + "に就いた" : "記録より前から"})`, 3);
      if (ins && ins.same && !p.gone[ins.by]) say(`${rel(ins.by)}と同じ職場で働けるなんて、子どものころは思ってもみなかった。`, `職歴の記録(${yr(ins.M)}年・あこがれた${nm(ins.by)}と同じ職場)`, 3);
    } else if (st === 7) {
      const f = last("found");
      say(`思い切って独立して、自分で${f ? f.what : "店"}を開いたんだ。`, `独立の記録(${f ? yr(f.M) + "年" : ""})`, 3);
    } else if (st === 6) {
      const gu = last("giveup");
      say(`${D.n}になりたかったけど、${gu ? gu.why : "うまくいかなかった"}。でも、その分ほかのことを見つけたよ。`, `夢の記録(${gu ? yr(gu.M) + "年 諦めた" : ""})`, 2);
    }
    return out;
  }
  // ---- 主人公の夢: 6・12・15・18歳の4月に選ぶ(候補は家族の仕事・学力・時代から)。大学の学部・資格の試験(3月)
  var HERO_EXAM = ["doctor", "pharmacist", "teaching", "bar", "phd", "police", "fire", "pilot", "curator"];
  var FAC_OF = { doctor: ["医学部", 6], pharmacist: ["薬学部", 6], teaching: ["教育学部", 4], bar: ["法学部", 4], phd: ["理学部", 4], pilot: ["工学部", 4], curator: ["文学部", 4] };
  function heroDreamMonth(g) {
    const w = g.world, p = w.pop, h = g.hero, id = h.id, M = g.S.M, m0 = M % 12, a = g.age();
    if (!p.dr1) return;
    if (m0 === 3 && [6, 12, 15, 18].includes(a) && !(h.flags.dreamAsk || {})[a]) {
      (h.flags.dreamAsk || (h.flags.dreamAsk = {}))[a] = 1;
      g.queueEvent("dream_choose", { age: a });
    }
    // 3月: 資格の試験(夢の道で条件がそろったとき)
    if (m0 === 2 && p.dr1[id] !== 255) {
      const D = DREAMS[p.dr1[id]], key = D.route;
      if (key && HERO_EXAM.includes(key) && !heroHolds(g, key) && heroExamReady(g, key)) g.queueEvent("qual_exam", { key });
    }
  }
  function heroHolds(g, key) {
    const r = QROUTE[key];
    return !!(g.hero.quals && g.hero.quals[r.q || r.l]);
  }
  // 受験の条件(学歴・学部・年齢・大学院の年数など)と、足りないもの
  function heroExamNeed(g, key) {
    const r = QROUTE[key], h = g.hero, e = h.edu, a = g.age(), need = [];
    if (r.edu >= 5 && e.level < 5) need.push("大学を卒業する");
    if (FAC_OF[key] && ["doctor", "pharmacist"].includes(key) && (h.flags.fac || "") !== FAC_OF[key][0]) need.push(`${FAC_OF[key][0]}で学ぶ`);
    if (key === "teaching" && !(h.flags.fac === "教育学部" || h.flags.kyoshoku)) need.push("教職課程をとる");
    if (key === "bar" && !(h.flags.gradM != null && M_(g) - h.flags.gradM >= 24)) need.push("法科大学院で2年学ぶ(大学卒業後2年)");
    if (key === "phd" && !(h.flags.gradM != null && M_(g) - h.flags.gradM >= 60)) need.push("大学院で5年研究する(大学卒業後5年)");
    if (key === "pilot" && !(h.flags.gradM != null && M_(g) - h.flags.gradM >= 24)) need.push("航空大学校で2年訓練する");
    if (r.edu === 3 && e.level < 3) need.push("中学を卒業する");
    if (a < r.age) need.push(`${r.age}歳になる`);
    if ((key === "police" || key === "fire") && a > 30) need.push("採用試験は30歳まで");
    return need;
  }
  var M_ = (g) => g.S.M;
  var heroExamReady = (g, key) => heroExamNeed(g, key).length === 0;
  function heroFaculty(g, e) {
    const p = g.world.pop, h = g.hero, d = p.dr1 ? p.dr1[h.id] : 255, D = d !== 255 ? DREAMS[d] : null;
    const f = D && D.route && FAC_OF[D.route] ? FAC_OF[D.route] : D && D.k === "program" ? ["工学部", 4] : D && D.k === "architect" ? ["工学部(建築)", 4] : null;
    const pick = f || [["経済学部", 4], ["文学部", 4], ["工学部", 4], ["理学部", 4], ["法学部", 4]][uh(h.id, 3801) % 5];
    h.flags.fac = pick[0];
    e.yrs = pick[1];
    if (D && D.route === "teaching") h.flags.kyoshoku = 1;
    g.log("school", `${pick[0]}で学ぶことにした${D ? `(夢: ${D.n})` : ""}`, { ev: "faculty" });
  }
  E({ id: "dream_choose", w: 0, make: (g, ctx4) => {
    const w = g.world, p = w.pop, id = g.hero.id, a = ctx4.age;
    const wt = dreamWeights(w, id, g.S.M, a), idx = wt.map((v, k) => [v * (0.6 + dU(id + a, 3810 + k)), k]).sort((x, y) => y[0] - x[0]).slice(0, 3).map((x) => x[1]);
    const cur = p.dr1[id] !== 255 ? DREAMS[p.dr1[id]].n : null;
    const why = (k) => {
      const D = DREAMS[k];
      if (!D.jobs) return "";
      for (const f of [p.mother[id], p.father[id]]) if (f >= 0 && !p.gone[f] && p.job[f] < 255 && D.jobs.includes(JOB_IDS2[p.job[f]])) return `(${f === p.mother[id] ? "お母さん" : "お父さん"}の仕事)`;
      return "";
    };
    const pickC = (k) => ({ label: `${DREAMS[k].n}${why(k)}`, apply: (g2) => {
      setDream(g2.world, id, k, g2.S.M, `${a}歳で選んだ夢`);
      g2.log("dream", `${a}歳: 将来の夢は「${DREAMS[k].n}」${p.drBy[id] >= 0 ? `(${g2.nameOf(p.drBy[id])}さんにあこがれて)` : ""}`, { ev: "dream", d: k });
      return "";
    } });
    return { title: "将来の夢", text: `${a}歳の春。将来、何になりたいですか?${cur ? `(今の夢: ${cur})` : ""}`, choices: [...idx.map(pickC), ...cur ? [{ label: `${cur}のまま`, apply: () => "" }] : [], { label: "まだ決めていない", apply: (g2) => {
      g2.log("dream", `${a}歳: 将来の夢はまだ決めていない`, { ev: "dream", d: 255 });
      return "";
    } }], auto: 0 };
  } });
  E({ id: "qual_exam", w: 0, make: (g, ctx4) => {
    const r = QROUTE[ctx4.key];
    if (!r || heroHolds(g, ctx4.key)) return null;
    const fee = yen(g, ctx4.key === "doctor" ? 15300 : ctx4.key === "bar" ? 28e3 : 8e3), tried = g.S.log.filter((e) => e.ev === "qual_exam" && e.q === ctx4.key).length;
    return { title: r.exam, text: `${r.exam}を受けますか?(受験料 ${fmt(fee)}・これまで${tried}回)`, choices: [{ label: "受験する", apply: (g2) => {
      if (g2.hero.money < fee) return "(受験料が足りなかった)";
      g2.pay(fee, `${r.exam}の受験料`);
      const sc = g2.examScore(), need = 80 + (r.apt - 100) * 0.5 - r.pass * 30;
      const ok = sc >= need;
      g2.log("exam", `${r.exam}: ${ok ? "合格した" : "不合格だった"}(${tried + 1}回目)`, { ev: "qual_exam", q: ctx4.key, ok: ok ? 1 : 0 });
      if (!ok) return `残念ながら不合格でした(点数の目安 ${Math.round(sc)}/${Math.round(need)})。` + g2.chg({ mood: -4 });
      g2.hero.quals[r.q || r.l] = 1;
      if (r.q) g2.grantQual(r.q);
      else giveRoute(g2.world, g2.hero.id, r, g2.S.M, false);
      g2.log("qual", `${r.exam}に合格し、${r.q ? QUALS[r.q] : LIC2_NAME[r.l]}を得た`, { ev: "qual", q: r.q || r.l });
      return `合格! ${r.q ? QUALS[r.q] : LIC2_NAME[r.l]}を得ました。` + g2.chg({ mood: 10 });
    } }, { label: "今年は見送る", apply: () => "" }], auto: 1 };
  } });
  // 主人公の夢の画面(日記の先頭): 夢・段階・次に必要なこと・記録
  function heroDreamPanel(g) {
    const w = g.world, p = w.pop, id = g.hero.id;
    if (!p.dr1) return "";
    const d = p.dr1[id];
    if (d === 255) return "将来の夢: まだ決めていない(夢を持たない人生もあります)";
    const D = DREAMS[d], r = D.route ? QROUTE[D.route] : null;
    const held = r ? heroHolds(g, D.route) : true, job = g.hero.job && D.jobs && D.jobs.includes(g.hero.job.jobId);
    const stage = D.life ? DREAM_STAGE[p.drS[id]] : job ? "かなえた(その仕事に就いた)" : held && r ? "資格をとった(就職をめざす)" : r && g.hero.edu.cur > 0 ? "学んでいる" : DREAM_STAGE[Math.max(1, p.drS[id])];
    const need = r && !held && HERO_EXAM.includes(D.route) ? heroExamNeed(g, D.route) : r && !held ? [`${r.school}で学び、${r.exam}に合格する(専門学校の入学は学校の建物で)`] : [];
    const ev = g.S.log.filter((e) => ["dream", "exam", "qual"].includes(e.kind) || e.ev === "faculty").slice(-4).map((e) => `${1900 + Math.floor(e.M / 12)}年 ${e.text}`);
    return `将来の夢: ${D.n} — 段階: ${stage}${r ? `<br>必要な資格: ${r.q ? QUALS[r.q] : LIC2_NAME[r.l]}(${r.exam})` : ""}${need.length ? `<br>次にすること: ${need.join("・")}` : ""}${ev.length ? `<br>記録: ${ev.join(" / ")}` : ""}`;
  }
  // ---- 表彰(ledger.js の ledgerAwards から): 夢と進路の記録だけを根拠に。街の記録より前(pre)の資格・夢は数えない
  function dreamAwards(g, cand, used) {
    const w = g.world, p = w.pop, out = [], yr = (M) => 1900 + Math.floor(M / 12);
    const H = (id) => w.prof && w.prof.get(id) ? w.prof.get(id).hist || [] : [];
    const best = (score) => {
      let b = -1, bv = 0, ex = null;
      for (const id of cand) {
        if (used.has(id)) continue;
        const r = score(id);
        if (r && (r.v > bv || r.v === bv && id < b)) b = id, bv = r.v, ex = r;
      }
      return b >= 0 ? { id: b, ...ex } : null;
    };
    const A = [
      ["夢をかなえた賞", (id) => {
        const ok = H(id).find((e) => e.k === "dreamok" && e.d != null && DREAMS[e.d] && DREAMS[e.d].jobs), ds = ok && H(id).find((e) => e.k === "dream" && e.d === ok.d);
        if (!ok || !ds) return null;
        const yrs = p.dr1[id] === ok.d && inDreamJob(p, id) ? Math.floor((w.M - ok.M) / 12) : 0;
        return yrs >= 3 ? { v: yrs, ev: `${yr(ds.M)}年(${ageOf(p, id, ds.M)}歳)の夢「${DREAMS[ok.d].n}」→ ${yr(ok.M)}年にその仕事に就き${yrs}年続けている(職歴の記録)` } : null;
      }],
      ["生涯努力賞", (id) => {
        const ex = H(id).filter((e) => e.k === "exam"), pass = ex.filter((e) => e.ok);
        return ex.length >= 3 && pass.length ? { v: ex.length, ev: `資格の試験 ${ex.length}回(合格 ${pass.length}回・最後の合格 ${yr(pass[pass.length - 1].M)}年)` } : null;
      }],
      ["成長賞", (id) => {
        const q = H(id).filter((e) => e.k === "qual" && !e.pre && e.q !== "driver");
        return q.length >= 2 ? { v: q.length, ev: `大人になってから取った資格 ${q.length}つ(${q.map((e) => QUALS[e.q] || LIC2_NAME[e.q] || e.q).join("・")})` } : null;
      }],
      ["地域貢献賞", (id) => {
        const f = H(id).find((e) => e.k === "found");
        return f ? { v: Math.floor((w.M - f.M) / 12) + 1, ev: `${yr(f.M)}年に街で${f.what}を開いた(独立の記録)` } : null;
      }]
    ];
    for (const [title, sc] of A) {
      const r = best(sc);
      if (!r) continue;
      used.add(r.id);
      out.push({ title, id: r.id, name: g.nameOf(r.id), value: r.v, evidence: r.ev, rule: `${title}: 知人・家族の中で、夢と進路の記録(職歴)から決めた(同じ値なら人物IDの小さい人)` });
    }
    return out;
  }
  // ---- エンディング: 主人公の夢と進路(日記の記録から)と、ひとことのふりかえり
  function heroDreamEnding(g) {
    const L3 = g.S.log.filter((e) => e.kind === "dream" || e.kind === "exam" || e.kind === "qual" || e.ev === "faculty");
    const p = g.world.pop, id = g.hero.id, first = L3.find((e) => e.kind === "dream" && e.d != null && e.d !== 255);
    const d = p.dr1 ? p.dr1[id] : 255, D = d !== 255 ? DREAMS[d] : null, job = g.hero.job && D && D.jobs && D.jobs.includes(g.hero.job.jobId);
    let note = "";
    if (first && D && first.d === d && (job || D.life && p.drS[id] === 4)) note = `子どものころの夢「${DREAMS[d].n}」をかなえた人生。`;
    else if (first && D && first.d !== d) note = `夢は「${DREAMS[first.d].n}」から「${D.n}」へ。途中で見つけた道を歩いた人生。`;
    else if (first && !D) note = `「${DREAMS[first.d].n}」を夢見たこともあった。夢の形にとらわれず、日々の暮らしを大切にした人生。`;
    return { note, lines: L3.slice(0, 12) };
  }
