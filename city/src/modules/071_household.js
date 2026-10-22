  // src/household.js
  var CLASSES = {
    mansion: "\u8C6A\u90B8\u30FB\u5EAD\u4ED8\u304D\u90B8\u5B85",
    luxcondo: "\u9AD8\u7D1A\u30DE\u30F3\u30B7\u30E7\u30F3",
    condo: "\u5206\u8B72\u30DE\u30F3\u30B7\u30E7\u30F3",
    detached: "\u666E\u901A\u306E\u4E00\u6238\u5EFA\u3066",
    wa: "\u65E5\u672C\u5BB6\u5C4B",
    apart: "\u30A2\u30D1\u30FC\u30C8",
    danchi: "\u56E3\u5730",
    oldwood: "\u53E4\u3044\u6728\u9020\u4F4F\u5B85",
    farm: "\u8FB2\u5BB6\u4F4F\u5B85"
  };
  var ANCHOR = {
    1960: { mansion: 0.03, luxcondo: 0, condo: 0, detached: 0.25, wa: 0.18, apart: 0.17, danchi: 0.05, oldwood: 0.2, farm: 0.12 },
    1990: { mansion: 0.03, luxcondo: 0.02, condo: 0.17, detached: 0.38, wa: 0.08, apart: 0.15, danchi: 0.08, oldwood: 0.04, farm: 0.05 },
    2020: { mansion: 0.03, luxcondo: 0.06, condo: 0.27, detached: 0.33, wa: 0.04, apart: 0.15, danchi: 0.04, oldwood: 0.02, farm: 0.03 }
  };
  function weightsAt(year) {
    const y = Math.max(1960, Math.min(2020, year));
    const [a, b] = y <= 1990 ? [1960, 1990] : [1990, 2020];
    const t = (y - a) / (b - a);
    const o = {};
    for (const k of Object.keys(CLASSES)) o[k] = ANCHOR[a][k] * (1 - t) + ANCHOR[b][k] * t;
    return o;
  }
  function classOf(b, year) {
    if (!b) return "detached";
    if (b.type === "villa" || b.estate) return "mansion";
    if (b.type === "farmhouse") return "farm";
    if (b.type === "tower") return "luxcondo";
    if (b.type === "apt") {
      const f2 = b.floors || 1;
      if (f2 >= 6) return year >= 1985 ? "condo" : "danchi";
      if (f2 >= 4) return year >= 1955 && year < 2e3 ? "danchi" : "condo";
      return year >= 2e3 && f2 >= 3 ? "condo" : "apart";
    }
    if (b.type === "house") return b.wa ? "wa" : year < 1975 ? "oldwood" : "detached";
    return "detached";
  }
  var wageOf = (p, id) => {
    const j = p.job[id];
    return j === 255 || j == null ? 0 : Object.values(JOBS)[j]?.wage || 0;
  };
  function livelihood(p, fa, mo) {
    const w = wageOf(p, fa) + wageOf(p, mo) * 0.8;
    return w >= 52e4 ? "\u3086\u3068\u308A\u304C\u3042\u308B" : w >= 3e5 ? "\u3075\u3064\u3046" : w > 0 ? "\u3064\u3064\u307E\u3057\u3044" : "\u304D\u3073\u3057\u3044";
  }
  var FAM_PREF = { rich: ["mansion", "luxcondo"], comfortable: ["luxcondo", "condo", "detached", "mansion"], ordinary: ["detached", "condo", "wa"], modest: ["apart", "danchi", "oldwood", "farm"] };
  function gachaPick(world, seed, M, cands, famEnv) {
    const year = 1900 + Math.floor(M / 12);
    const rng = new Rng(seed, "birth-household");
    const p = world.pop;
    const w = weightsAt(world.startYear ?? year);
    const by = {};
    for (const f2 of cands) {
      const c = classOf(world.map.buildings[p.home[f2]], world.startYear ?? year);
      (by[c] || (by[c] = [])).push(f2);
    }
    if (famEnv && famEnv !== "auto") {
      const pref = FAM_PREF[famEnv] || [];
      for (const c of pref) if (by[c] && by[c].length) {
        const bs = world.map.buildings;
        const grand = by[c].filter((f2) => bs[p.home[f2]]?.estate === 2), est = by[c].filter((f2) => bs[p.home[f2]]?.estate);
        return rng.pick(grand.length ? grand : est.length ? est : by[c]);
      }
      const wage = (f2) => {
        const j = p.job[f2];
        return j === 255 || j == null ? 0 : Object.values(JOBS)[j]?.wage || 0;
      };
      const s = cands.slice().sort((a, b) => famEnv === "modest" ? wage(a) - wage(b) : wage(b) - wage(a));
      return rng.pick(s.slice(0, Math.max(1, Math.min(12, s.length))));
    }
    const keys = Object.keys(by).filter((k) => w[k] > 0);
    if (!keys.length) return rng.pick(cands);
    let tot = 0;
    for (const k of keys) tot += w[k];
    let r = rng.next() * tot;
    let pickK = keys[keys.length - 1];
    for (const k of keys) {
      r -= w[k];
      if (r <= 0) {
        pickK = k;
        break;
      }
    }
    return rng.pick(by[pickK]);
  }
  function birthSheet(g) {
    const h = g.hero, W2 = g.world, p = W2.pop;
    const b = W2.map.buildings[h.homeB];
    const year = W2.startYear;
    const jn = (id) => {
      const j = p.job[id];
      return j === 255 || j == null ? "\u7121\u8077\u30FB\u5BB6\u4E8B" : Object.values(JOBS)[j]?.name || "\u52E4\u3081\u4EBA";
    };
    return { cls: classOf(b, year), label: CLASSES[classOf(b, year)], home: b?.name, father: { id: h.father, job: jn(h.father) }, mother: { id: h.mother, job: jn(h.mother) }, livelihood: livelihood(p, h.father, h.mother) };
  }

