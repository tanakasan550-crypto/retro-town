  // src/jobs_ext.js
  var JOBS_EXT = {
    // --- 文化施設
    curator: { name: "\u5B66\u82B8\u54E1", wage: 27e4, minAge: 22, lic: "curator", edu: 5, interactive: true, skill: "curation" },
    museumstaff: { name: "\u53D7\u4ED8\u30FB\u5C55\u793A\u7BA1\u7406\u30B9\u30BF\u30C3\u30D5", wage: 17e4, minAge: 18, interactive: true, skill: "curation" },
    craftsman: { name: "\u4F1D\u7D71\u5DE5\u82B8\u8077\u4EBA", wage: 2e5, minAge: 18, interactive: true, skill: "craft" },
    // --- 工場・物流
    inspector: { name: "\u691C\u54C1\u4F5C\u696D\u54E1", wage: 175e3, minAge: 18, edu: 3, interactive: true, skill: "craft" },
    prodmgr: { name: "\u751F\u7523\u7BA1\u7406\u8005", wage: 3e5, minAge: 24, edu: 4, interactive: true, skill: "manage" },
    plantmgr: { name: "\u5DE5\u5834\u9577", wage: 45e4, minAge: 38, edu: 4, exp: { jobs: ["factory", "inspector", "prodmgr"], months: 72 }, interactive: true, skill: "manage" },
    forklift: { name: "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8\u904B\u8EE2\u8005", wage: 205e3, minAge: 18, lic: "forklift", interactive: true, skill: "logistics" },
    truckdriver: { name: "\u30C8\u30E9\u30C3\u30AF\u904B\u8EE2\u624B", wage: 27e4, minAge: 20, lic: "driver", interactive: true, skill: "driving" },
    courier: { name: "\u914D\u9001\u54E1", wage: 22e4, minAge: 18, lic: "driver", interactive: true, skill: "driving" },
    logmgr: { name: "\u7269\u6D41\u7BA1\u7406\u8005", wage: 32e4, minAge: 26, edu: 4, exp: { jobs: ["logistics", "forklift", "truckdriver", "courier", "stocker"], months: 36 }, interactive: true, skill: "manage" },
    // --- 電力・水道・建設
    powerstaff: { name: "\u96FB\u529B\u4F1A\u793E\u8077\u54E1", wage: 33e4, minAge: 22, edu: 4, interactive: true, skill: "electric" },
    electrician: { name: "\u96FB\u6C17\u5DE5\u4E8B\u58EB", wage: 28e4, minAge: 18, lic: "elec2", edu: 3, interactive: true, skill: "electric" },
    elecmaint: { name: "\u96FB\u6C17\u8A2D\u5099\u4FDD\u5B88\u54E1", wage: 29e4, minAge: 20, lic: "elec2", edu: 3, interactive: true, skill: "electric" },
    waterstaff: { name: "\u6C34\u9053\u5C40\u8077\u54E1", wage: 27e4, minAge: 18, edu: 4, interactive: true, skill: "office" },
    waterworker: { name: "\u6C34\u9053\u5DE5\u4E8B\u4F5C\u696D\u54E1", wage: 22e4, minAge: 18, edu: 3, interactive: true, skill: "construction" },
    plumber: { name: "\u914D\u7BA1\u5DE5", wage: 235e3, minAge: 18, edu: 3, interactive: true, skill: "construction" },
    sewer: { name: "\u4E0B\u6C34\u9053\u4FDD\u5B88\u54E1", wage: 225e3, minAge: 18, edu: 3, interactive: true, skill: "construction" },
    roadworker: { name: "\u9053\u8DEF\u5DE5\u4E8B\u4F5C\u696D\u54E1", wage: 205e3, minAge: 18, interactive: true, skill: "construction" },
    trafficguide: { name: "\u4EA4\u901A\u8A98\u5C0E\u8B66\u5099\u54E1", wage: 185e3, minAge: 18, interactive: true, skill: "stamina" },
    builder: { name: "\u5EFA\u8A2D\u4F5C\u696D\u54E1", wage: 215e3, minAge: 18, interactive: true, skill: "construction" },
    heavy: { name: "\u91CD\u6A5F\u30AA\u30DA\u30EC\u30FC\u30BF\u30FC", wage: 27e4, minAge: 18, lic: "heavy", interactive: true, skill: "construction" },
    foreman: { name: "\u73FE\u5834\u76E3\u7763", wage: 36e4, minAge: 22, lic: "sekou2", edu: 3, exp: { jobs: ["carpenter", "builder", "roadworker", "waterworker", "heavy", "foreman"], months: 24 }, interactive: true, skill: "manage" },
    civil: { name: "\u571F\u6728\u6280\u8853\u8005", wage: 37e4, minAge: 22, lic: "sekou2", edu: 5, interactive: true, skill: "construction" },
    // --- ビルのテナント企業・専門職・生活の仕事(tenants.js)。末尾に足す(職の番号はセーブに残るので順を変えない)
    itengineer: { name: "システムエンジニア", wage: 33e4, minAge: 20, edu: 4, interactive: true, skill: "research", fromY: 1970 },
    insurance: { name: "保険営業・代理店", wage: 26e4, minAge: 20, edu: 3, interactive: true, skill: "speaking" },
    realtor: { name: "不動産仲介", wage: 27e4, minAge: 20, edu: 3, interactive: true, skill: "speaking" },
    accountant: { name: "税理士・会計事務", wage: 3e5, minAge: 22, edu: 4, interactive: true, skill: "office" },
    architect: { name: "建築士・設計", wage: 32e4, minAge: 22, edu: 5, interactive: true, skill: "research" },
    designer: { name: "デザイナー", wage: 25e4, minAge: 20, edu: 3, interactive: true, skill: "writing", fromY: 1955 },
    travelagent: { name: "旅行会社スタッフ", wage: 22e4, minAge: 20, edu: 3, interactive: true, skill: "service", fromY: 1960 },
    receptionist: { name: "受付・案内", wage: 19e4, minAge: 18, interactive: true, skill: "service" },
    security: { name: "警備員(施設)", wage: 21e4, minAge: 18, interactive: true, skill: "stamina" },
    tutor: { name: "塾講師・家庭教師", wage: 22e4, minAge: 19, edu: 4, interactive: true, skill: "teaching" },
    mechanic: { name: "自動車整備士", wage: 26e4, minAge: 18, lic: "mechanic", interactive: true, skill: "craft" },
    gardener: { name: "造園・植木職人", wage: 24e4, minAge: 18, interactive: true, skill: "craft" },
    forester: { name: "林業作業員", wage: 23e4, minAge: 18, interactive: true, skill: "stamina" },
    garbage: { name: "ごみ収集・清掃作業員", wage: 25e4, minAge: 18, interactive: true, skill: "driving" }
  };
  var EDU_EXT = Object.fromEntries(Object.entries(JOBS_EXT).filter(([, j]) => j.edu).map(([k, j]) => [k, j.edu]));
  var SLOTS_EXT = {
    factory: { inspector: 3, prodmgr: 1, plantmgr: 1, forklift: 1, electrician: 1 },
    warehouse: { forklift: 3, truckdriver: 2, logmgr: 1, courier: 2 },
    logistics: { forklift: 6, truckdriver: 6, courier: 6, logmgr: 2 },
    harboroffice: { forklift: 2, truckdriver: 2, logmgr: 1 },
    construction: { foreman: 2, heavy: 2, builder: 6, roadworker: 3, trafficguide: 3, electrician: 2, plumber: 2, civil: 1 },
    cityhall: { waterstaff: 4, waterworker: 3, sewer: 3, roadworker: 2, civil: 2 },
    museum: { curator: 2, museumstaff: 3, craftsman: 1 },
    // 自動車の整備工場(販売店・中古車店)・塾・森林組合(農協)・市の清掃と公園
    cardealer: { mechanic: 3 },
    usedcar: { mechanic: 2 },
    cram: { tutor: 3 },
    farmcoop: { forester: 2 },
    gasstation: { mechanic: 1 }
  };
  // 既にある職場への追加(職ごとに、まだ無い職だけ足す)
  SLOTS_EXT.cityhall.garbage = 6;
  SLOTS_EXT.cityhall.gardener = 3;
  SLOTS_EXT.construction.gardener = 2;
  var UTIL_SLOTS = { power: { powerstaff: 6, elecmaint: 4, electrician: 3 }, water: { waterstaff: 4, waterworker: 5, plumber: 3, sewer: 3 } };
  function expOK(g, J) {
    const jx = g.prof && g.prof().jxp || {};
    let m = 0;
    for (const k of J.exp.jobs) m += jx[k] || 0;
    return m >= J.exp.months;
  }
  function assignUtil(map2) {
    const of = map2.buildings.filter((b) => b.type === "office" && !b.util && !b.salon);
    if (of.length < 2) return;
    const a = of[Math.min(1, of.length - 1)], c = of[Math.min(4, of.length - 1) === 1 ? 2 : Math.min(4, of.length - 1)];
    a.util = "power";
    a.name = "\u9752\u6D77\u96FB\u529B \u55B6\u696D\u6240";
    if (c !== a) {
      c.util = "water";
      c.name = "\u9752\u6D77\u5E02\u6C34\u9053\u5C40 \u5DE5\u4E8B\u8AB2";
    }
  }

