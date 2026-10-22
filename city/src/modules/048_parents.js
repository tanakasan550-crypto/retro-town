  // src/parents.js
  var HAIR_N = ["\u9ED2", "\u9ED2\u8336", "\u3053\u3052\u8336", "\u8336", "\u660E\u308B\u3044\u8336", "\u8D64\u8336", "\u9752\u307F\u304C\u304B\u3063\u305F\u9ED2", "\u91D1\u8336"];
  var EYE_N = { round: "\u4E38\u3044\u76EE", almond: "\u30A2\u30FC\u30E2\u30F3\u30C9\u5F62\u306E\u76EE", narrow: "\u5207\u308C\u9577\u306E\u76EE", sleepy: "\u306D\u3080\u305F\u3052\u306A\u76EE", cat: "\u3064\u308A\u76EE\u304E\u307F\u306E\u76EE", arc: "\u3084\u3055\u3057\u3044\u5F27\u306E\u76EE" };
  var isFemale = (pop, id) => FEMALE_STYLE.has(pop.look[id] & 7);
  function appearanceText(g, id) {
    const p = g.world.pop;
    const inh = (i) => [p.mother[i], p.father[i]];
    inh.lookOf = (i) => p.look[i];
    const I2 = identityOf(id, p.look[id], inh, null);
    const age = g.world.describe(id).age;
    const bits = [`\u9AEA\u306F${HAIR_N[I2.hairColor & 7]}`, EYE_N[I2.eye] || "", I2.build === 0 ? "\u307B\u3063\u305D\u308A" : I2.build === 2 ? "\u304C\u3063\u3057\u308A" : "\u6A19\u6E96\u7684\u306A\u4F53\u683C"];
    if (I2.facial && age >= I2.facialAge) bits.push(I2.facial === "beard" ? "\u3042\u3054\u3072\u3052" : "\u3061\u3087\u3073\u3072\u3052");
    if (I2.glassAge <= age) bits.push("\u3081\u304C\u306D");
    if (age >= I2.grayOnset + 10) bits.push("\u767D\u9AEA\u307E\u3058\u308A");
    return bits.filter(Boolean).join("\u30FB");
  }
  function personCard(g, id, role) {
    const p = g.world.pop, d = g.world.describe(id), gone = !!p.gone[id];
    const age = gone ? Math.floor((p.goneAt[id] - p.born[id]) / 12) : d.age;
    return { id, role, name: g.nameOf(id), sex: isFemale(p, id) ? "\u5973\u6027" : "\u7537\u6027", age, gone, job: d.job, work: d.work, look: appearanceText(g, id), home: d.home };
  }
  function parentsOf(g) {
    const h = g.hero, p = g.world.pop;
    const out = [];
    if (h.father >= 0) out.push(personCard(g, h.father, "\u7236"));
    if (h.mother >= 0) out.push(personCard(g, h.mother, "\u6BCD"));
    return out;
  }
  function householdAtBirth(g) {
    const h = g.hero, w = g.world, p = w.pop, B2 = w.map.buildings;
    const home = B2[h.homeB];
    const sibs = w.childrenOf(h.mother).filter((k) => k !== h.id && !p.gone[k]).map((k) => ({ k, age: Math.floor((g.M - p.born[k]) / 12) }));
    const gps = [p.mother[h.mother], p.father[h.mother], p.mother[h.father], p.father[h.father]].filter((x) => x >= 0 && !p.gone[x]);
    const together = gps.filter((x) => p.home[x] === p.home[h.mother]);
    const parts = [`\u4F4F\u307E\u3044: ${home ? home.name + "(" + home.addr + ")" : "-"}`];
    parts.push(sibs.length ? `\u304D\u3087\u3046\u3060\u3044: ${sibs.map((s) => g.nameOf(s.k) + "(" + s.age + "\u6B73)").join("\u3001")}` : "\u4E00\u4EBA\u3063\u5B50\u3068\u3057\u3066\u751F\u307E\u308C\u307E\u3057\u305F");
    if (gps.length) parts.push(`\u7956\u7236\u6BCD: ${gps.map((x) => g.nameOf(x) + (together.includes(x) ? "(\u540C\u5C45)" : "")).join("\u3001")}`);
    const apt = (p.apt[h.mother] + p.apt[h.father]) / 2;
    parts.push(apt > 150 ? "\u66AE\u3089\u3057\u3080\u304D\u306F\u4F59\u88D5\u306E\u3042\u308B\u5BB6\u5EAD" : apt < 100 ? "\u3064\u3064\u307E\u3057\u304F\u66AE\u3089\u3059\u5BB6\u5EAD" : "\u3075\u3064\u3046\u306E\u66AE\u3089\u3057\u3080\u304D\u306E\u5BB6\u5EAD");
    return parts;
  }
  function parentsText(g) {
    const out = parentsOf(g).map((c) => `${c.role}: ${c.name}(${c.sex}\u30FB${c.gone ? "\u6545\u4EBA\u30FB\u4EAB\u5E74" + c.age + "\u6B73" : c.age + "\u6B73"}\u30FB${c.job}${c.work ? "/" + c.work : ""})
\u3000\u5916\u898B: ${c.look}`);
    return out.join("\n") + "\n\u95A2\u4FC2: " + g.hero.name + "\u306E\u7236\u30FB\u6BCD(\u5B9F\u306E\u4E21\u89AA)\n" + householdAtBirth(g).join("\n");
  }

