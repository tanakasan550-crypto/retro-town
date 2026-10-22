  // src/actions.js
  var yenf = (g, n2) => Math.round(n2 * g.pi());
  function hoursOf(b, g) {
    const t = b.type, bt = BTYPES[t];
    const MAP2 = { konbini: [0, 24], gasstation: [6, 22], warehouse: [7, 19, "wk"], pier: [4, 17], logistics: [0, 24], hospital: [0, 24, "ward"], clinic: [9, 18, "wk6"], pharmacy: [9, 19], police: [0, 24], fire: [0, 24], hotel: [0, 24], bizhotel: [0, 24], resorthotel: [0, 24], ryokan: [0, 24], minshuku: [0, 24], station: [4, 25], ferry: [8, 18], cityhall: [9, 17, "wk"], court: [9, 17, "wk"], library: [9, 19], museum: [9, 17], tourtower: [9, 21], aquarium: [9, 18], cinema: [9, 23], gamecenter: [10, 23], bowling: [10, 24], gym: [8, 22], sento: [14, 23], onsenbath: [10, 22], shrine: [5, 19], temple: [6, 18], ramen: [11, 22], restaurant: [11, 22], seafood: [11, 21], izakaya: [17, 25], cafe: [8, 19], beachhouse: [10, 18], market: [4, 14], mall: [10, 21], dept: [10, 20], super: [9, 21], edovillage: [9, 18], nursing: [0, 24], welfare: [9, 17, "wk"], marina: [7, 19], funeral: [9, 18], crematorium: [9, 16], cram: [15, 22], bank: [9, 15, "wk"], lawfirm: [9, 18, "wk"], agency: [10, 19, "wk"], media: [8, 20, "wk"], harboroffice: [8, 18, "wk"], construction: [8, 18, "wk"], farmcoop: [8, 18, "wk"], factory: [8, 18, "wk"], office: [8, 20, "wk"], lab: [9, 18, "wk"] };
    if (b.salon) return [9, 19, "salon"];
    if (MAP2[t]) return MAP2[t];
    if (bt.cat === "school") return [7, 18, "wk"];
    if (bt.cat === "shop") return [9, 21];
    if (bt.cat === "food") return [11, 22];
    return [9, 18];
  }
  function isOpenFor(g, b) {
    if (b.status !== "closed" && testBypass(g, "hours")) return { ok: true, test: true };
    const bt = BTYPES[b.type];
    const dt = g.date();
    const h = g.S.min / 60;
    const hero = g.hero;
    if (b.status === "closed") return { ok: false, msg: `${b.name}\u306F\u9589\u5E97\u3057\u3066\u3044\u307E\u3059` };
    if (bt.cat === "res") {
      if (b.idx === hero.homeB) return { ok: true };
      const friendHere = Object.keys(hero.rel).some((k) => g.world.pop.home[k] === b.idx && hero.rel[k].aff >= 30 && !g.world.pop.gone[k]);
      if (friendHere && h >= 9 && h < 21) return { ok: true };
      return { ok: false, msg: "\u3060\u308C\u304B\u306E\u5BB6\u3067\u3059\u3002\u9375\u304C\u304B\u304B\u3063\u3066\u3044\u307E\u3059(\u53CB\u3060\u3061\u306E\u5BB6\u306F\u3001\u4EF2\u826F\u304F\u306A\u308B\u3068\u8A2A\u306D\u3089\u308C\u307E\u3059)" };
    }
    if (hero.job && hero.job.b === b.idx) {
      const [a, e] = g.shiftOf(hero.job);
      if (g.workDayFor(hero.job, dt) && h >= a - 1 && h < e + 1) return { ok: true };
    }
    if (hero.edu.b === b.idx && g.isSchoolDay(dt) && h >= 7 && h < 18) return { ok: true };
    if (b.voc) {
      const dtv = g.date();
      if (dtv.dow >= 1 && dtv.dow <= 6) {
        if (h >= 9 && h < 18) return { ok: true };
        return { ok: false, msg: `${b.name}\u306F\u55B6\u696D\u6642\u9593\u5916\u3067\u3059(\u6708\u301C\u571F 9:00\u301C18:00)` };
      }
      return { ok: false, msg: `${b.name}\u306F\u65E5\u66DC\u4F11\u6821\u3067\u3059` };
    }
    const hr = hoursOf(b, g);
    const [o, c, flag] = hr;
    const wk = dt.dow >= 1 && dt.dow <= 5;
    const hol = g.date().dow === 0;
    if (flag === "wk" && !wk) return { ok: false, msg: `${b.name}\u306F\u672C\u65E5\u4F11\u307F(\u5E73\u65E5 ${o}:00\u301C${c}:00)` };
    if (flag === "wk6" && dt.dow === 0) return { ok: false, msg: `${b.name}\u306F\u65E5\u66DC\u4F11\u8A3A\u3067\u3059` };
    if (BTYPES[b.type].cat === "school" && BTYPES[b.type].level) {
      if (!(hero.edu.b === b.idx)) return { ok: false, msg: `${b.name}\u306F\u95A2\u4FC2\u8005\u4EE5\u5916\u7ACB\u5165\u7981\u6B62\u3067\u3059` };
    }
    if (b.type === "beachhouse" && !(dt.m0 >= 5 && dt.m0 <= 8)) return { ok: false, msg: "\u6D77\u306E\u5BB6\u306F\u590F\u5B63\u306E\u307F\u306E\u55B6\u696D\u3067\u3059" };
    const hh = h < o && c > 24 ? h + 24 : h;
    if (!(hh >= o && hh < c)) return { ok: false, msg: `${b.name}\u306F\u55B6\u696D\u6642\u9593\u5916\u3067\u3059(${o}:00\u301C${c > 24 ? c - 24 : c}:00)` };
    return { ok: true };
  }
  var SELL = {
    daily: [["\u304A\u306B\u304E\u308A", 130, { hunger: 18 }], ["\u30B5\u30F3\u30C9\u30A4\u30C3\u30C1", 300, { hunger: 28 }], ["\u304A\u8336", 150, { mood: 1, hunger: 2 }], ["\u96D1\u8A8C", 400, { mood: 4, intel: 0.3 }], ["\u304B\u305C\u85AC", 900, { health: 6 }], ["\u98DF\u6750\u30D1\u30C3\u30AF(\u81EA\u708A\u7528)", 1500, { food: 3 }]],
    grocery: [["\u98DF\u6750\u30BB\u30C3\u30C8", 2e3, { food: 5 }], ["\u304A\u60E3\u83DC", 450, { hunger: 30 }], ["\u304A\u306B\u304E\u308A", 130, { hunger: 18 }], ["\u304A\u8336", 150, { mood: 1, hunger: 2 }]],
    clothes: [["\u670D(\u65B0\u3057\u3044\u4E00\u7740)", 6e3, { charm: 1.5, mood: 3 }]],
    books: [["\u53C2\u8003\u66F8", 1800, { intel: 1.5, study: 5 }], ["\u5C0F\u8AAC", 800, { mood: 3, intel: 0.3 }]],
    medicine: [["\u304B\u305C\u85AC", 900, { health: 6 }], ["\u6804\u990A\u30C9\u30EA\u30F3\u30AF", 300, { energy: 8 }]],
    fish: [["\u65B0\u9BAE\u306A\u9B5A(\u81EA\u708A\u7528)", 1800, { food: 4 }]],
    veg: [["\u91CE\u83DC\u30BB\u30C3\u30C8(\u81EA\u708A\u7528)", 1500, { food: 4 }]],
    home: [["\u5BB6\u5177\u30FB\u96D1\u8CA8", 5e3, { mood: 3 }], ["\u89B3\u8449\u690D\u7269", 1200, { mood: 2 }], ["\u81EA\u8EE2\u8ECA", 28e3, { veh: "bicycle" }], ["\u539F\u4ED8\u30D0\u30A4\u30AF", 18e4, { veh: "moto" }]],
    mall: [["\u4E2D\u53E4\u8ECA\u30D5\u30A7\u30A2:\u81EA\u5BB6\u7528\u8ECA(\u8981\u30FB\u904B\u8EE2\u514D\u8A31)", 9e5, { veh: "car" }], ["\u304A\u60E3\u83DC", 450, { hunger: 30 }], ["\u670D(\u65B0\u3057\u3044\u4E00\u7740)", 6e3, { charm: 1.5, mood: 3 }], ["\u672C", 1500, { intel: 1, mood: 2 }], ["\u98DF\u6750\u30BB\u30C3\u30C8", 2e3, { food: 5 }], ["\u96D1\u8CA8", 2500, { mood: 3 }]]
  };
  var MENU = {
    ramen: [["\u30E9\u30FC\u30E1\u30F3", 650, { hunger: 45, mood: 3 }], ["\u30E9\u30FC\u30E1\u30F3+\u9903\u5B50", 950, { hunger: 60, mood: 5 }]],
    set: [["\u65E5\u66FF\u308F\u308A\u5B9A\u98DF", 850, { hunger: 50, mood: 3 }], ["\u30AB\u30EC\u30FC\u30E9\u30A4\u30B9", 700, { hunger: 45, mood: 3 }]],
    seafood: [["\u6D77\u9BAE\u4E3C", 1500, { hunger: 55, mood: 7 }], ["\u713C\u304D\u9B5A\u5B9A\u98DF", 1100, { hunger: 50, mood: 4 }]],
    izakaya: [["\u3072\u3068\u54C1\u3068\u304A\u9152(20\u6B73\u4EE5\u4E0A)", 2500, { hunger: 35, mood: 5, social: 1 }, 20], ["\u30CE\u30F3\u30A2\u30EB\u30B3\u30FC\u30EB\u3068\u3054\u306F\u3093", 1800, { hunger: 40, mood: 3 }]],
    cafe: [["\u30B3\u30FC\u30D2\u30FC", 450, { mood: 3 }], ["\u30B1\u30FC\u30AD\u30BB\u30C3\u30C8", 800, { hunger: 15, mood: 6 }]],
    beach: [["\u713C\u304D\u305D\u3070", 700, { hunger: 35, mood: 4 }], ["\u304B\u304D\u6C37", 400, { mood: 5, hunger: 5 }]]
  };
  var PLAY = { cinema: [["\u6620\u753B\u3092\u89B3\u308B", 1800, { mood: 10, intel: 0.2 }, 120]], gamecenter: [["\u30B2\u30FC\u30E0\u3092\u904A\u3076", 500, { mood: 6 }, 60]], bowling: [["\u30DC\u30A6\u30EA\u30F3\u30B0", 900, { mood: 6, fitness: 0.6 }, 90]], gym: [["\u30C8\u30EC\u30FC\u30CB\u30F3\u30B0", 800, { fitness: 2, health: 1, energy: -10 }, 90]], aquarium: [["\u6C34\u65CF\u9928\u3092\u898B\u5B66", 2200, { mood: 10, intel: 0.3 }, 120]], tourtower: [["\u5C55\u671B\u53F0\u306B\u767B\u308B", 1200, { mood: 8 }, 60]], museum: [["\u5C55\u793A\u3092\u898B\u308B", 600, { intel: 1, mood: 3 }, 60]], edovillage: [["\u6C5F\u6238\u3055\u304F\u3089\u6751\u3067\u904A\u3076", 2800, { mood: 12, social: 1 }, 150]] };
  function targetActions(g, tg) {
    const L2 = g.S.loc, hero = g.hero;
    const out = [];
    const push = (id, label, o2 = {}) => out.push({ id, label, ...o2 });
    if (tg.kind === "door") {
      push("enter", tg.label);
      push("history:" + tg.b, "\u3053\u306E\u5834\u6240\u306E\u6B74\u53F2(\u4EE5\u524D\u3053\u3053\u306B\u3042\u3063\u305F\u3082\u306E)");
      return out;
    }
    if (tg.kind === "deco") {
      if (tg.d === 2) push("vending", `\u98F2\u307F\u7269\u3092\u8CB7\u3046(\xA5${yenf(g, 130)})`, { disabled: hero.money < yenf(g, 130) });
      else push("bench", "\u30D9\u30F3\u30C1\u3067\u3072\u3068\u4F11\u307F(30\u5206)");
      return out;
    }
    if (tg.kind === "npc") return npcActions(g, tg.id);
    const o = tg.o, b = g.world.map.buildings[L2.b], bt = BTYPES[b.type];
    const a = g.age();
    if (facActs(g, o, b, push)) return out;
    switch (o.act) {
      case "sleep": {
        const hotel2 = bt.cat === "hotel";
        if (!hotel2 && b.idx !== hero.homeB) {
          push("none", "\u3053\u3053\u306F\u3088\u305D\u306E\u5BB6\u3067\u3059", { disabled: true });
          break;
        }
        push("sleep", "\u671D\u307E\u3067\u7720\u308B");
        push("nap", "\u663C\u5BDD\u3059\u308B(2\u6642\u9593)");
        break;
      }
      case "meal":
        push("home_meal", "\u98DF\u4E8B\u3092\u3068\u308B(30\u5206)");
        break;
      case "fridge":
        push("snack", "\u51B7\u8535\u5EAB\u306E\u8EFD\u98DF\u3092\u3068\u308B");
        break;
      case "kitchen":
        push("cook", "\u6599\u7406\u306E\u7DF4\u7FD2\u3092\u3059\u308B(\u98DF\u67501\u3064\u4F7F\u7528\u30FB45\u5206)", { disabled: hero.inv.food < 1 });
        break;
      case "study":
        push("study1", "\u52C9\u5F37\u3059\u308B(1\u6642\u9593)");
        push("study3", "\u96C6\u4E2D\u3057\u3066\u52C9\u5F37\u3059\u308B(3\u6642\u9593)");
        break;
      case "tv":
      case "rest":
        push("relax", "\u304F\u3064\u308D\u3050(1\u6642\u9593)");
        break;
      case "fitting":
        push("fitting", "\u670D\u3092\u9078\u3076\u30FB\u8A66\u7740\u3059\u308B");
        break;
      case "voc":
        push("voc", "\u5165\u5B66\u76F8\u8AC7\u30FB\u5B66\u8CBB\u30FB\u8A66\u9A13\u30FB\u514D\u8A31\u767B\u9332(\u5C02\u9580\u5B66\u6821\u306E\u7A93\u53E3)");
        break;
      case "hair":
        push("hair", "\u9AEA\u578B\u30FB\u9AEA\u8272\u30FB\u3072\u3052\u3092\u5909\u3048\u308B(\u30E1\u30CB\u30E5\u30FC\u3068\u6599\u91D1\u3092\u898B\u308B)");
        break;
      case "dealer":
        push("dealer", b.type === "usedcar" ? "\u4E2D\u53E4\u8ECA\u3092\u898B\u308B\u30FB\u8CB7\u3046\u30FB\u58F2\u308B" : "\u65B0\u8ECA\u3092\u898B\u308B\u30FB\u898B\u7A4D\u308A\u30FB\u8A66\u4E57\u30FB\u8CFC\u5165");
        break;
      case "shelf":
      case "register": {
        if (hero.biz && hero.biz.state === "open" && hero.biz.b === b.idx) {
          push("bizwork", "\u5E97\u306B\u7ACB\u3064(1\u6642\u9593)");
          push("biz", "\u5E97\u306E\u7D4C\u55B6(\u640D\u76CA\u30FB\u5F93\u696D\u54E1\u30FB\u5E83\u544A\u30FB\u6539\u88C5\u30FB\u5F8C\u7D99\u8005)");
        }
        if (bt.sells === "clothes") push("fitting", "\u670D\u3092\u9078\u3076\u30FB\u8A66\u7740\u3059\u308B");
        else push("shop", `\u5546\u54C1\u3092\u898B\u308B\u30FB\u8CB7\u3046(${o.act === "register" ? "\u30EC\u30B8" : o.label})`);
        if (b.type === "konbini" || bt.cat === "shop") {
          const v = g.vacanciesNear(3, b.idx);
          if (v.length) push("applyHere", `\u3053\u3053\u3067\u50CD\u304F(\u6C42\u4EBA\u3092\u898B\u308B)`);
        }
        break;
      }
      case "order": {
        const list = MENU[bt.menu] || MENU.set;
        list.forEach((it, i) => push("order:" + i, `${it[0]}(\xA5${yenf(g, it[1]).toLocaleString()})`, { disabled: hero.money < yenf(g, it[1]) || it[3] && a < it[3] }));
        const v = g.vacanciesNear(3, b.idx);
        if (v.length) push("applyHere", "\u3053\u3053\u3067\u50CD\u304F(\u6C42\u4EBA\u3092\u898B\u308B)");
        break;
      }
      case "class": {
        if (hero.edu.b !== b.idx) {
          push("none", "(\u3088\u305D\u306E\u5E2D\u3067\u3059)", { disabled: true });
          break;
        }
        const h = g.S.min / 60;
        push("class_am", "\u6388\u696D\u3092\u53D7\u3051\u308B(\u5348\u524D)", { disabled: !g.isSchoolDay() || h >= 12 || h < 7 });
        push("class_pm", "\u6388\u696D\u3092\u53D7\u3051\u308B(\u5348\u5F8C)", { disabled: !g.isSchoolDay() || h >= 15.5 || h < 7 });
        if (hero.flags.club && hero.flags.club !== "none" && hero.edu.cur >= 3) push("club", "\u90E8\u6D3B\u52D5\u306B\u53C2\u52A0\u3059\u308B(2\u6642\u9593)", { disabled: !g.isSchoolDay() || h < 14 || h >= 18 });
        push("study1", "\u3072\u3068\u308A\u3067\u81EA\u7FD2\u3059\u308B(1\u6642\u9593)");
        break;
      }
      case "board":
      case "hall": {
        if (b.type === "cityhall" || o.act === "hall") {
          push("jobs", "\u6C42\u4EBA\u3092\u63A2\u3059");
          push("housing", "\u4F4F\u307E\u3044\u3092\u63A2\u3059(\u5F15\u3063\u8D8A\u3057)");
          push("consult", "\u304F\u3089\u3057\u306E\u76F8\u8AC7\u7A93\u53E3");
          push("procedures", "\u8A3C\u660E\u66F8\u30FB\u624B\u7D9A\u304D(\u60C5\u5831)");
        } else {
          push("jobs", "\u6C42\u4EBA\u63B2\u793A\u3092\u898B\u308B");
        }
        break;
      }
      case "bank":
        push("finance", "\u4F4F\u5B85\u30ED\u30FC\u30F3\u30FB\u7A4D\u7ACB\u6295\u8CC7\u306E\u76F8\u8AC7");
        push("firm", "\u8D77\u696D\u30FB\u4E8B\u696D\u306E\u76F8\u8AC7(\u7D4C\u55B6)");
        break;
      case "work": {
        if (hero.job && hero.job.b === b.idx) {
          push("work1", "\u50CD\u304F(1\u6642\u9593)");
          push("workshift", "\u30B7\u30D5\u30C8\u306E\u7D42\u308F\u308A\u307E\u3067\u50CD\u304F");
        } else {
          push("applyHere", "\u3053\u3053\u3067\u50CD\u304D\u305F\u3044(\u6C42\u4EBA\u3092\u898B\u308B)", { disabled: g.vacanciesNear(3, b.idx).length === 0 });
        }
        break;
      }
      case "clinic":
        push("doctor", `\u8A3A\u5BDF\u3092\u53D7\u3051\u308B(\u81EA\u5DF1\u8CA0\u62C5 ${Math.round(copayRate(g) * 100)}%)`, { disabled: hero.money < yenf(g, 1500) });
        for (const v of dueVaccines(g)) if (!v.auto) push("vax:" + v.id, `\u4E88\u9632\u63A5\u7A2E: ${v.name}${vaccineCost(g, v) ? `(\xA5${vaccineCost(g, v).toLocaleString("ja-JP")})` : "(\u516C\u8CBB)"}`, { disabled: hero.money < vaccineCost(g, v) });
        if (g.age() >= 15) push("mental", "\u3053\u3053\u308D\u306E\u76F8\u8AC7(\u4EFB\u610F\u30FB\u8A3A\u65AD\u540D\u306F\u3064\u3051\u307E\u305B\u3093)", { disabled: hero.money < yenf(g, 1500) });
        break;
      case "checkup":
        push("checkup", `\u5065\u5EB7\u8A3A\u65AD(\xA5${yenf(g, 3e3)})`, { disabled: hero.money < yenf(g, 3e3) });
        break;
      case "ward":
        push("visit", "\u75C5\u5BA4\u306E\u69D8\u5B50\u3092\u898B\u308B");
        break;
      case "stay": {
        const pr = yenf(g, bt.price || 8e3);
        push("stay", `\u5BBF\u6CCA\u3059\u308B(\xA5${pr.toLocaleString()})`, { disabled: hero.money < pr });
        push("lounge", "\u30ED\u30D3\u30FC\u3067\u4F11\u3080(30\u5206)");
        break;
      }
      case "bath": {
        const pr = yenf(g, (bt.price || 500) * (b.type === "onsenbath" && L2.k === "in" && L2.floor === 3 ? 3 : 1)), ok = g.S.washedAt != null && g.absMin() - g.S.washedAt < 240 || bt.interior !== "onsen" && bt.interior !== "bath" && !(bt.interior === "hotel" && bt.onsen) ? true : false;
        push("bath:" + (/露天/.test(o.label || "") ? "r" : "i"), (/露天/.test(o.label || "") ? "\u9732\u5929\u98A8\u5442\u306B\u5165\u308B" : "\u6E6F\u8239\u306B\u5165\u308B") + `(\xA5${pr.toLocaleString()})` + (ok ? "" : " \u203B\u5148\u306B\u6D17\u3044\u5834\u3067\u4F53\u3092\u6D17\u3044\u307E\u3059"), { disabled: hero.money < pr || !ok });
        break;
      }
      case "wash":
        push("wash", "\u4F53\u3092\u6D17\u3046(10\u5206)");
        break;
      case "milk": {
        const pr = yenf(g, 160);
        push("milk", `\u304A\u98A8\u5442\u4E0A\u304C\u308A\u306E\u725B\u4E73\u3092\u98F2\u3080(\xA5${pr})`, { disabled: hero.money < pr });
        break;
      }
      case "reception":
        push("none", "\u53D7\u4ED8\u3067\u3059\u3002\u5165\u6D74\u6599\u306F\u6E6F\u8239\u306B\u5165\u308B\u3068\u304D\u306B\u652F\u6255\u3044\u307E\u3059", { disabled: true });
        break;
      case "pray":
        push("pray", `\u304A\u53C2\u308A\u3059\u308B(\xA5${yenf(g, 100)})`, { disabled: hero.money < yenf(g, 100) });
        break;
      case "omamori":
        push("omamori", `\u304A\u5B88\u308A\u3092\u6388\u304B\u308B(\xA5${yenf(g, 800)})`, { disabled: hero.money < yenf(g, 800) });
        break;
      case "play":
      case "pay": {
        const list = PLAY[b.type];
        if (list) list.forEach((it, i) => push("play:" + i, `${it[0]}(\xA5${yenf(g, it[1]).toLocaleString()})`, { disabled: hero.money < yenf(g, it[1]) }));
        else if (b.type === "library") push("read", "\u672C\u3092\u8AAD\u3080(1\u6642\u9593)");
        else push("none", "(\u53D7\u4ED8\u3067\u3059)", { disabled: true });
        break;
      }
      case "view":
        push("view", "\u5C55\u671B\u3059\u308B");
        break;
      case "ticket":
      case "platform":
        push("rail", "\u96FB\u8ECA\u306B\u4E57\u308B(\u884C\u304D\u5148\u3092\u9078\u3076)");
        break;
      case "timetable":
        push("timetable", "\u6642\u523B\u8868\u30FB\u8DEF\u7DDA\u56F3\u3092\u898B\u308B");
        break;
      case "checkin":
        push("jticket:air", "\u642D\u4E57\u624B\u7D9A\u304D(\u822A\u7A7A\u5238\u3092\u8CB7\u3046)");
        break;
      case "ferryticket":
        push("jticket:ferry", "\u4E57\u8239\u5238\u3092\u8CB7\u3046");
        break;
      case "bullet":
        push("jticket:bullet", "\u65B0\u5E79\u7DDA\u306E\u5207\u7B26\u3092\u8CB7\u3046");
        break;
      case "security":
        push("jsec", "\u4FDD\u5B89\u691C\u67FB\u3092\u53D7\u3051\u308B");
        break;
      case "gate":
        push("jboard:air", "\u642D\u4E57\u53E3\u3078\u9032\u3080(\u642D\u4E57\u3059\u308B)");
        break;
      case "boardship":
        push("jboard:ferry", "\u4E57\u8239\u53E3\u3078\u9032\u3080(\u4E57\u8239\u3059\u308B)");
        break;
      case "bulletgate":
        push("jboard:bullet", "\u65B0\u5E79\u7DDA\u306E\u308A\u3070\u3078(\u4E57\u8ECA\u3059\u308B)");
        break;
      case "jinfo":
        push("jinfo", "\u767A\u8ECA\u30FB\u51FA\u767A\u6848\u5185\u3092\u898B\u308B");
        break;
      case "shuttle":
        push("shuttle", "\u7A7A\u6E2F\u9023\u7D61\u30D0\u30B9\u306B\u4E57\u308B(\u7121\u6599\u30FB\u7D048\u5206)");
        break;
      case "locker":
        push("none", "(\u30ED\u30C3\u30AB\u30FC\u3067\u3059)", { disabled: true });
        break;
      case "lift":
      case "esc":
      case "info":
      case "toilet":
      case "mail":
      case "parcel":
      case "manager":
      case "trash":
      case "bike":
      case "unit":
      case "park":
      case "vend":
        bigActions(g, o, b, push);
        break;
      default:
        push("none", "\u7279\u306B\u3067\u304D\u308B\u3053\u3068\u306F\u3042\u308A\u307E\u305B\u3093", { disabled: true });
    }
    return out;
  }
  function npcActions(g, id) {
    const a = [], r = g.hero.rel[id], h = g.hero;
    const push = (i, l, o = {}) => a.push({ id: i, label: l, ...o });
    push("chat", "\u8A71\u3057\u304B\u3051\u308B(10\u5206)");
    push("profile", "\u3069\u3093\u306A\u4EBA\u304B\u601D\u3044\u51FA\u3059");
    const L2 = g.S.loc;
    const food = L2.k === "in" && BTYPES[g.world.map.buildings[L2.b].type].cat === "food";
    if (r || true) {
      push("gift", `\u30D7\u30EC\u30BC\u30F3\u30C8\u3092\u6E21\u3059(\xA5${yenf(g, 1500).toLocaleString()})`, { disabled: h.money < yenf(g, 1500) });
    }
    if (food) push("meal_together", `\u3044\u3063\u3057\u3087\u306B\u98DF\u4E8B\u3059\u308B(\xA5${yenf(g, 1800).toLocaleString()})`, { disabled: h.money < yenf(g, 1800) });
    if (g.age() >= 18 && g.ageOf(id) >= 18 && r && !r.family) push("askout", "\u6C17\u6301\u3061\u3092\u4F1D\u3048\u308B(\u4EA4\u969B\u3092\u7533\u3057\u8FBC\u3080)");
    return a;
  }
  var TOPICS = ["\u6700\u8FD1\u306E\u304A\u5929\u6C17\u306E\u3053\u3068", "\u8857\u306E\u65B0\u3057\u3044\u304A\u5E97\u306E\u3053\u3068", "\u96FB\u8ECA\u306E\u6DF7\u307F\u5177\u5408\u306E\u3053\u3068", "\u304A\u663C\u3054\u306F\u3093\u306E\u3053\u3068", "\u4ED5\u4E8B\u3084\u5B66\u6821\u306E\u3053\u3068", "\u9031\u672B\u306E\u4E88\u5B9A\u306E\u3053\u3068", "\u597D\u304D\u306A\u97F3\u697D\u306E\u3053\u3068", "\u5B50\u3069\u3082\u306E\u3053\u308D\u306E\u601D\u3044\u51FA"];
  function bathPrep(g, tg, arg) {
    const L2 = g.S.loc, b = g.world.map.buildings[L2.b], bt = BTYPES[b.type];
    const fam = L2.k === "in" && b.type === "onsenbath" && L2.floor === 3, pr = yenf(g, (bt.price || 500) * (fam ? 3 : 1)), rot = arg === "r";
    const needWash = bt.interior === "onsen" || bt.interior === "bath" || bt.interior === "hotel" && bt.onsen;
    if (needWash && !(g.S.washedAt != null && g.absMin() - g.S.washedAt < 240)) return { ok: false, msg: "\u5148\u306B\u6D17\u3044\u5834\u3067\u4F53\u3092\u6D17\u3063\u3066\u304F\u3060\u3055\u3044(\u30DE\u30CA\u30FC)\u3002" };
    if (g.hero.money < pr) return { ok: false, msg: "\u6240\u6301\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093\u3002" };
    return { ok: true, pr, rot, night: g.S.min >= 17 * 60 || g.S.min < 6 };
  }
  function runAction(g, id, tg) {
    const hero = g.hero, st3 = hero.stats;
    const L2 = g.S.loc;
    const b = L2.k === "in" ? g.world.map.buildings[L2.b] : null;
    const bt = b ? BTYPES[b.type] : null;
    const r = { msg: "" };
    const [kind, arg] = id.split(":");
    const idx = arg != null ? Number(arg) : null;
    const apply = (fx, pay) => {
      const m = { ...fx };
      if (m.food) {
        hero.inv.food += m.food;
        delete m.food;
      }
      if (m.study) {
        hero.study = Math.min(100, hero.study + m.study);
        delete m.study;
      }
      return g.chg(m);
    };
    if (facRun(g, kind, arg != null ? id.slice(kind.length + 1) : arg, tg, r)) return r;
    switch (kind) {
      case "enter":
        break;
      case "history": {
        r.msg = historyOf(g, idx).text;
        break;
      }
      case "vending":
        g.pay(yenf(g, 130), "\u81EA\u52D5\u8CA9\u58F2\u6A5F");
        g.advance(2);
        r.msg = "\u51B7\u305F\u3044(\u3042\u305F\u305F\u304B\u3044)\u98F2\u307F\u7269\u3067\u4E00\u606F\u3064\u304D\u307E\u3057\u305F\u3002" + g.chg({ mood: 1, hunger: 2 });
        break;
      case "bench":
        g.advance(30);
        r.msg = "\u30D9\u30F3\u30C1\u3067\u306E\u3093\u3073\u308A\u3002" + g.chg({ energy: 6, mood: 2 });
        break;
      case "sleep": {
        if (g.S.min < 18 * 60 && g.S.min > 8 * 60 && st3.energy > 75) {
          r.msg = "\u307E\u3060\u7720\u304F\u3042\u308A\u307E\u305B\u3093(18\u6642\u3054\u308D\u304B\u3089\u7720\u308C\u307E\u3059\u3002\u663C\u5BDD\u306F\u3067\u304D\u307E\u3059)";
          break;
        }
        const m = g.sleepUntilMorning(g.isSchoolDay(nextDate(g)) || hero.job ? 6.5 : 7.5);
        r.msg = `\u3050\u3063\u3059\u308A\u7720\u308A\u307E\u3057\u305F\u3002` + g.chg({ mood: 2 });
        st3.energy = 100;
        break;
      }
      case "nap":
        g.S.sleeping = true;
        g.advance(120);
        g.S.sleeping = false;
        r.msg = "\u663C\u5BDD\u3092\u3057\u307E\u3057\u305F\u3002" + g.chg({ mood: 1 });
        break;
      case "home_meal": {
        const fam = hero.homeIsParents && (!g.world.pop.gone[hero.mother] || !g.world.pop.gone[hero.father]);
        if (fam) {
          g.advance(30);
          r.msg = "\u5BB6\u65CF\u3068\u3044\u3063\u3057\u3087\u306B\u98DF\u4E8B\u3092\u3057\u307E\u3057\u305F\u3002" + g.chg({ hunger: 50, mood: 3, social: 0.3 });
          hero.rel[hero.mother] && (hero.rel[hero.mother].aff = Math.min(100, hero.rel[hero.mother].aff + 0.5));
        } else if (hero.inv.food > 0) {
          hero.inv.food--;
          g.advance(40);
          r.msg = "\u98DF\u6750\u3092\u4F7F\u3063\u3066\u98DF\u4E8B\u3092\u3064\u304F\u308A\u307E\u3057\u305F\u3002" + g.chg({ hunger: 50, mood: 2 });
        } else r.msg = "\u98DF\u3079\u308B\u3082\u306E\u304C\u3042\u308A\u307E\u305B\u3093(\u30B9\u30FC\u30D1\u30FC\u306A\u3069\u3067\u98DF\u6750\u3092\u8CB7\u3048\u307E\u3059)";
        break;
      }
      case "snack": {
        if (hero.homeIsParents || hero.inv.food > 0) {
          if (!hero.homeIsParents) hero.inv.food -= 0.5;
          g.advance(5);
          r.msg = "\u8EFD\u304F\u98DF\u3079\u307E\u3057\u305F\u3002" + g.chg({ hunger: 15 });
        } else r.msg = "\u51B7\u8535\u5EAB\u306F\u7A7A\u3063\u307D\u3067\u3059\u3002";
        break;
      }
      case "cook":
        hero.inv.food--;
        g.advance(45);
        addSkill(g.prof(), "cooking", 1.2);
        r.msg = "\u6599\u7406\u306E\u8155\u304C\u5C11\u3057\u4E0A\u304C\u308A\u307E\u3057\u305F\u3002" + g.chg({ hunger: 40, mood: 3 });
        break;
      case "study1":
        g.advance(60);
        hero.study = Math.min(100, hero.study + 4);
        r.msg = "\u96C6\u4E2D\u3057\u3066\u52C9\u5F37\u3057\u307E\u3057\u305F\u3002" + g.chg({ intel: 0.5, energy: -6, mood: -1 });
        break;
      case "study3":
        g.advance(180);
        hero.study = Math.min(100, hero.study + 11);
        r.msg = "\u3057\u3063\u304B\u308A\u52C9\u5F37\u3057\u307E\u3057\u305F\u3002" + g.chg({ intel: 1.5, energy: -15, mood: -2 });
        break;
      case "relax":
        g.advance(60);
        r.msg = "\u3086\u3063\u304F\u308A\u904E\u3054\u3057\u307E\u3057\u305F\u3002" + g.chg({ mood: 4, energy: 4 });
        break;
      case "buy": {
        const list = SELL[bt.sells || "daily"] || SELL.daily;
        const it = list[idx];
        if (!it) break;
        if (it[2].veh) {
          const vr = buyVehicle(g, it[2].veh);
          r.msg = vr.msg;
          if (vr.ok) g.advance(15);
          break;
        }
        g.pay(yenf(g, it[1]), it[0]);
        g.advance(5);
        r.msg = `${it[0]}\u3092\u8CB7\u3044\u307E\u3057\u305F\u3002` + apply(it[2]);
        break;
      }
      case "order": {
        const list = MENU[bt.menu] || MENU.set;
        const it = list[idx];
        if (!it) break;
        if (it[3] && g.age() < it[3]) {
          r.msg = "20\u6B73\u672A\u6E80\u306F\u304A\u9152\u3092\u6CE8\u6587\u3067\u304D\u307E\u305B\u3093\u3002";
          break;
        }
        g.pay(yenf(g, it[1]), it[0]);
        g.advance(40);
        st3.hunger = Math.min(100, st3.hunger);
        r.msg = `${it[0]}\u3092\u3044\u305F\u3060\u304D\u307E\u3057\u305F\u3002` + apply(it[2]);
        g.S.stats.meals++;
        break;
      }
      case "class_am":
      case "class_pm": {
        const target = kind === "class_am" ? 12 * 60 : 15.5 * 60;
        const mins = Math.max(30, target - g.S.min);
        const L0 = hero.edu.cur;
        g.S.day0.attended = true;
        g.S.day0.schoolWanted = true;
        g.S.m.attend += mins > 120 ? 0.5 : 0.25;
        g.advance(mins);
        const gain = (L0 >= 4 ? 0.9 : 1.2) * (mins / 240) * (1 + hero.study / 200) * (1 - st3.intel / 120);
        st3.intel = Math.min(100, st3.intel + gain);
        hero.study = Math.min(100, hero.study + 1.5);
        const cm = g.randomClassmate();
        if (cm != null) g.meet(cm, 1.5);
        r.msg = "\u6388\u696D\u3092\u53D7\u3051\u307E\u3057\u305F\u3002" + g.chg({ energy: -mins / 40, hunger: 0 });
        break;
      }
      case "club": {
        g.advance(120);
        r.msg = "\u90E8\u6D3B\u52D5\u3067\u6C57\u3092\u6D41\u3057\u307E\u3057\u305F\u3002" + (hero.flags.club === "sports" ? g.chg({ fitness: 1.2, social: 0.6, energy: -10, mood: 3 }) : g.chg({ charm: 0.8, intel: 0.3, social: 0.6, energy: -6, mood: 3 }));
        const cm = g.randomClassmate();
        if (cm != null) g.meet(cm, 2.5);
        break;
      }
      case "shop":
        r.ui = "shop";
        break;
      case "fitting":
        r.ui = "fitting";
        break;
      case "hair":
        r.ui = "hair";
        break;
      case "voc":
        r.ui = "voc";
        break;
      case "dealer":
        r.ui = "dealer";
        break;
      case "jobs":
        r.ui = "jobs";
        break;
      case "applyHere":
        r.ui = "jobs";
        r.filterB = L2.k === "in" ? L2.b : -1;
        break;
      case "bizwork": {
        const sr = standShop(g);
        r.msg = sr.msg;
        break;
      }
      case "biz":
        r.ui = "biz";
        break;
      case "housing":
        r.ui = "housing";
        break;
      case "finance":
        r.ui = "finance";
        break;
      case "firm":
        r.ui = "firm";
        break;
      case "consult":
        if (hero.flags.shelter && !hero.flags.aided) {
          hero.flags.aided = true;
          g.earn(g.yen(1e5), "\u751F\u6D3B\u518D\u5EFA\u306E\u652F\u63F4\u91D1");
          g.log("scenario", "\u5E02\u5F79\u6240\u306E\u7A93\u53E3\u3067\u751F\u6D3B\u518D\u5EFA\u306E\u652F\u63F4\u3092\u53D7\u3051\u305F");
          r.msg = "\u7A93\u53E3\u3067\u4E8B\u60C5\u3092\u8A71\u3059\u3068\u3001\u751F\u6D3B\u518D\u5EFA\u306E\u652F\u63F4\u91D1(\u4E00\u6642)\u3068\u5C31\u52B4\u652F\u63F4\u306E\u6848\u5185\u3092\u53D7\u3051\u3089\u308C\u307E\u3057\u305F\u3002";
          break;
        }
        r.msg = "\u7A93\u53E3\u3067\u3001\u304F\u3089\u3057\u30FB\u4ED5\u4E8B\u30FB\u533B\u7642\u30FB\u798F\u7949\u306E\u5236\u5EA6\u306B\u3064\u3044\u3066\u6848\u5185\u3092\u53D7\u3051\u307E\u3057\u305F\u3002\u56F0\u3063\u305F\u3068\u304D\u306F\u3001\u3072\u3068\u308A\u3067\u304B\u304B\u3048\u3053\u307E\u305A\u76F8\u8AC7\u3067\u304D\u307E\u3059\u3002";
        if (hero.debt > g.yen(3e5)) {
          g.queueEvent("debt_support", {});
        }
        break;
      case "procedures":
        r.msg = `\u4F4F\u6C11\u7968: ${g.homeName()}
\u5A5A\u59FB: ${hero.spouse != null ? g.nameOf(hero.spouse) + "\u3055\u3093\u3068\u7D50\u5A5A" : "\u672A\u5A5A"}
\u5B50\u3069\u3082: ${hero.kids.length}\u4EBA`;
        break;
      case "work1":
      case "workshift":
        return doWork(g, kind === "workshift");
      case "vax": {
        r.msg = giveVaccine(g, id.slice(4)).msg;
        break;
      }
      case "mental": {
        r.msg = mentalConsult(g).msg;
        break;
      }
      case "doctor": {
        const v = visitDoctor(g, b && b.type === "hospital" ? "hospital" : "clinic");
        r.msg = v.msg;
        break;
      }
      case "checkup": {
        g.pay(yenf(g, 3e3), "\u5065\u5EB7\u8A3A\u65AD");
        g.advance(60);
        r.msg = "\u5065\u5EB7\u8A3A\u65AD\u3092\u53D7\u3051\u307E\u3057\u305F\u3002" + g.chg({ health: 3 });
        break;
      }
      case "visit":
        r.msg = "\u9759\u304B\u306A\u75C5\u5BA4\u3067\u3059\u3002\u304A\u898B\u821E\u3044\u306E\u4EBA\u3084\u3001\u50CD\u304F\u4EBA\u305F\u3061\u306E\u6C17\u914D\u304C\u3042\u308A\u307E\u3059\u3002";
        break;
      case "stay": {
        const pr = yenf(g, bt.price || 8e3);
        g.pay(pr, "\u5BBF\u6CCA");
        g.sleepUntilMorning(7.5);
        r.msg = "\u5BBF\u3067\u3086\u3063\u304F\u308A\u4F11\u307F\u307E\u3057\u305F\u3002" + g.chg({ mood: 10, health: 3 });
        st3.energy = 100;
        g.log("trip", `${b.name}\u306B\u6CCA\u307E\u3063\u305F`);
        break;
      }
      case "lounge":
        g.advance(30);
        r.msg = "\u30ED\u30D3\u30FC\u3067\u3072\u3068\u4F11\u307F\u3002" + g.chg({ energy: 5, mood: 2 });
        break;
      case "bath": {
        const pr = yenf(g, (bt.price || 500) * (b.type === "onsenbath" && L2.k === "in" && L2.floor === 3 ? 3 : 1));
        const rot = arg === "r";
        g.pay(pr, "\u5165\u6D74");
        if (tg && tg.o && L2.k === "in" && tg.o.t !== void 0) {
          L2.x = tg.o.x + 0.5;
          L2.y = tg.o.y + 0.5;
        }
        g.advance(rot ? 55 : 45);
        const night = g.S.min >= 17 * 60 || g.S.min < 6;
        r.msg = (rot ? night ? "\u884C\u706F\u306E\u660E\u304B\u308A\u306E\u4E0B\u3001\u661F\u7A7A\u306E\u9732\u5929\u98A8\u5442\u306B\u8EAB\u3092\u3072\u305F\u3057\u307E\u3057\u305F\u3002" : "\u6E6F\u3051\u3080\u308A\u306E\u5411\u3053\u3046\u306B\u6728\u3005\u3092\u773A\u3081\u306A\u304C\u3089\u3001\u9732\u5929\u98A8\u5442\u306B\u3086\u3063\u305F\u308A\u3064\u304B\u308A\u307E\u3057\u305F\u3002" : "\u304A\u6E6F\u306B\u3086\u3063\u305F\u308A\u3064\u304B\u308A\u307E\u3057\u305F\u3002") + g.chg({ health: rot ? 4 : 3, mood: rot ? 11 : 8, energy: 4 });
        g.S.washedAt = null;
        break;
      }
      case "wash":
        g.advance(10);
        g.S.washedAt = g.absMin();
        r.msg = "\u6D17\u3044\u5834\u3067\u4F53\u3092\u6D17\u3044\u307E\u3057\u305F\u3002\u3055\u3063\u3071\u308A\u3057\u307E\u3057\u305F\u3002";
        break;
      case "milk": {
        const pr = yenf(g, 160);
        g.pay(pr, "\u725B\u4E73");
        g.advance(5);
        r.msg = "\u8170\u306B\u624B\u3092\u5F53\u3066\u3066\u3001\u51B7\u305F\u3044\u725B\u4E73\u3092\u3054\u304F\u308A\u3002" + g.chg({ mood: 4, hunger: 5 });
        break;
      }
      case "pray":
        g.pay(yenf(g, 100), "\u304A\u8CFD\u92AD");
        g.advance(10);
        r.msg = "\u9759\u304B\u306B\u624B\u3092\u5408\u308F\u305B\u307E\u3057\u305F\u3002" + g.chg({ mood: 4 });
        break;
      case "omamori":
        g.pay(yenf(g, 800), "\u304A\u5B88\u308A");
        r.msg = "\u304A\u5B88\u308A\u3092\u6388\u304B\u308A\u307E\u3057\u305F\u3002" + g.chg({ mood: 2 });
        break;
      case "play": {
        const it = (PLAY[b.type] || [])[idx];
        if (!it) break;
        g.pay(yenf(g, it[1]), it[0]);
        g.advance(it[3]);
        r.msg = `${it[0]}\u3002` + apply(it[2]);
        break;
      }
      case "read":
        g.advance(60);
        r.msg = "\u672C\u306E\u4E16\u754C\u306B\u3072\u305F\u308A\u307E\u3057\u305F\u3002" + g.chg({ intel: 1, mood: 2 });
        break;
      case "view":
        g.advance(30);
        r.msg = "\u9060\u304F\u307E\u3067\u8857\u3068\u6D77\u304C\u898B\u308F\u305F\u305B\u307E\u3059\u3002\u9244\u9053\u306E\u7DDA\u8DEF\u3001\u6E2F\u3001\u5C71\u3005\u2026\u2026\u3053\u306E\u8857\u306E\u3059\u3079\u3066\u304C\u898B\u3048\u307E\u3059\u3002" + g.chg({ mood: 6 });
        break;
      case "rail":
        r.ui = "rail";
        break;
      case "timetable":
        r.ui = "timetable";
        break;
      case "jticket":
        r.ui = "jticket";
        r.mode = arg;
        break;
      case "jsec": {
        const j = securityCheck(g);
        r.msg = j.msg;
        break;
      }
      case "jboard":
        r.ui = "jboard";
        r.mode = arg;
        break;
      case "jinfo":
        r.ui = "jinfo";
        break;
      case "shuttle":
        r.ui = "shuttle";
        break;
      case "chat":
        return talk(g, tg.id);
      case "profile":
        r.ui = "profile";
        r.id = tg.id;
        break;
      case "gift": {
        g.world.remember(tg.id, `${g.hero.name}\u304B\u3089\u30D7\u30EC\u30BC\u30F3\u30C8\u3092\u3082\u3089\u3063\u305F`, { who: g.hero.id, w: 3 });
        g.pay(yenf(g, 1500), "\u30D7\u30EC\u30BC\u30F3\u30C8");
        g.meet(tg.id, 7);
        r.msg = `${g.nameOf(tg.id)}\u306F\u300C\u3042\u308A\u304C\u3068\u3046\u3001\u3046\u308C\u3057\u3044!\u300D\u3068\u559C\u3093\u3067\u304F\u308C\u307E\u3057\u305F\u3002`;
        break;
      }
      case "meal_together": {
        g.pay(yenf(g, 1800), "\u98DF\u4E8B");
        g.advance(60);
        g.meet(tg.id, 8);
        r.msg = `${g.nameOf(tg.id)}\u3068\u3044\u3063\u3057\u3087\u306B\u98DF\u4E8B\u3092\u3057\u3066\u3001\u697D\u3057\u3044\u6642\u9593\u3092\u3059\u3054\u3057\u307E\u3057\u305F\u3002` + g.chg({ hunger: 45, mood: 6, social: 1 });
        break;
      }
      case "askout": {
        const x = g.askOut(tg.id);
        r.msg = x.msg;
        break;
      }
      default:
        if (!bigRun(g, kind, tg, r)) r.msg = "";
    }
    return r;
  }
  function nextDate(g) {
    const d = g.date();
    const t = new Date(Date.UTC(d.y, d.m0, d.d + 1));
    return { y: t.getUTCFullYear(), m0: t.getUTCMonth(), d: t.getUTCDate(), dow: t.getUTCDay() };
  }
  function talk(g, id) {
    const rng = g.actRng("talk");
    const hero = g.hero;
    const d = g.world.describe(id);
    const r = hero.rel[id];
    const base = 2 + hero.stats.charm / 40 + hero.stats.social / 50 + rng.next() * 2;
    g.meet(id, r ? base : Math.max(6, base));
    g.advance(10);
    if (g.world.lives.has(id)) {
      g.world.remember(id, `${hero.name}\u3068\u8A71\u3057\u305F`, { who: hero.id, w: 1 });
      g.world.lives.get(id).nHero++;
    }
    const topic = TOPICS[rng.int(TOPICS.length)];
    const line = d.age >= 60 && rng.next() < 0.4 ? "\u3080\u304B\u3057\u306E\u8857\u306E\u8A71\u3092\u805E\u304B\u305B\u3066\u304F\u308C\u307E\u3057\u305F\u3002" : `${topic}\u3092\u8A71\u3057\u307E\u3057\u305F\u3002`;
    const rel = g.hero.rel[id];
    const rc = g.world.lives.has(id) && rng.next() < 0.6 ? recallLine(g.world, id, rng) : null;
    return { msg: `${g.nameOf(id)}\u3068${line}(\u89AA\u3057\u3055 ${Math.round(rel.aff)})` + (rc ? `
\u300C${rc}\u300D\u306E\u3053\u3068\u3092\u8A71\u3057\u3066\u304F\u308C\u305F\u3002` : "") + g.chg({ social: 0.3, mood: 1 }) };
  }
  function doWork(g, toEnd) {
    const hero = g.hero, job = hero.job, st3 = hero.stats;
    const r = { msg: "" };
    if (!job) return { msg: "\u4ED5\u4E8B\u306B\u5C31\u3044\u3066\u3044\u307E\u305B\u3093\u3002" };
    if (isSick(g)) return { msg: "\u4F53\u8ABF\u304C\u60AA\u304F\u3001\u4ED5\u4E8B\u3092\u4F11\u3080\u3053\u3068\u306B\u3057\u307E\u3057\u305F\u3002\u307E\u305A\u306F\u8A3A\u5BDF\u3092\u53D7\u3051\u3066\u4F11\u307F\u307E\u3057\u3087\u3046\u3002" };
    const dt = g.date();
    const [a, e] = g.shiftOf(job);
    const h = g.S.min / 60;
    if (!g.workDayFor(job, dt)) return { msg: "\u4ECA\u65E5\u306F\u4F11\u307F\u306E\u65E5\u3067\u3059\u3002" };
    if (h < a - 0.5) return { msg: `\u52E4\u52D9\u958B\u59CB\u306F${a}:00\u304B\u3089\u3067\u3059\u3002` };
    if (h >= e) return { msg: "\u4ECA\u65E5\u306E\u52E4\u52D9\u306F\u7D42\u308F\u3063\u3066\u3044\u307E\u3059\u3002" };
    let hours = toEnd ? Math.ceil(e - Math.max(h, a)) : 1;
    hours = Math.max(1, Math.min(hours, Math.ceil(e - h)));
    const J = JOBS[job.jobId];
    if (st3.energy < 15) return { msg: "\u75B2\u308C\u304C\u305F\u307E\u3063\u3066\u3044\u307E\u3059\u3002\u4F11\u3093\u3067\u304B\u3089\u50CD\u304D\u307E\u3057\u3087\u3046\u3002" };
    let done = 0, mood2 = 0, bonus = "";
    for (let i = 0; i < hours; i++) {
      if (g.blocked()) break;
      g.advance(60);
      done++;
      const rng = g.actRng("work");
      const skill = hero.skills[J.skill] || 0;
      addSkill(g.prof(), J.skill, 3e-3 * 60 / 60);
      if (rng.next() < 0.12 + skill / 400) {
        mood2 += 1;
      }
      if (st3.energy < 10) break;
    }
    g.S.m.hours += done;
    g.S.stats.workHours += done;
    g.S.day0.worked = (g.S.day0.worked || 0) + done;
    st3.energy = Math.max(0, st3.energy - done * 4.5);
    st3.hunger = Math.max(0, st3.hunger - done * 1.5);
    if (["stamina", "craft"].includes(J.skill)) st3.fitness = Math.min(100, st3.fitness + 0.15 * done);
    if (J.skill === "service") st3.social = Math.min(100, st3.social + 0.2 * done);
    const earned = Math.round(g.hourly() * done * 0.84);
    const fv = done > 0 ? rollFlavor(job.jobId, g.actRng("workev"), g.date().m0) : null;
    let fvTxt = "";
    if (fv) {
      fvTxt = "\n" + fv.msg;
      if (fv.k === "m") g.chg({ mood: 3 });
      else if (fv.k === "s") addSkill(g.prof(), J.skill, 0.6);
      else if (fv.k === "x") g.prof().lxp += 3;
      else if (fv.k === "t") {
        const tip = Math.round(g.hourly() * 0.7);
        g.earn(tip, "\u5FC3\u3065\u3051");
        fvTxt += `(\u5FC3\u3065\u3051 \xA5${tip.toLocaleString()})`;
      }
    }
    r.msg = `${J.name}\u3068\u3057\u3066${done}\u6642\u9593\u50CD\u304D\u307E\u3057\u305F\u3002(\u4ECA\u6708\u306E\u52E4\u52D9 ${g.S.m.hours}\u6642\u9593\u30FB\u4ECA\u6708\u306E\u7D66\u4E0E\u898B\u8FBC \u7D04\xA5${Math.round(g.hourly() * g.S.m.hours * 0.84).toLocaleString()})` + g.chg({ mood: mood2 > 0 ? 2 : 0 }) + fvTxt;
    return r;
  }
  function housingList(g, limit = 14) {
    const w = g.world, h = g.hero;
    const out = [];
    const lists = [["apt", w.resList.apt], ["house", w.resList.house], ["tower", w.resList.tower]];
    for (const [t, L2] of lists) for (const bi of L2) {
      const b = g.world.map.buildings[bi];
      const cap2 = capOf(b);
      if (w.occ[bi] >= cap2 * 0.96 || bi === h.homeB) continue;
      out.push({ b: bi, type: t, rent: g.rentOf(b), d: w.dist(h.homeB, bi), name: b.name, addr: b.addr });
    }
    out.sort((a, c) => a.d - c.d);
    const pick5 = [];
    const seenType = {};
    for (const o of out) {
      const k = o.type;
      seenType[k] = (seenType[k] || 0) + 1;
      if (seenType[k] <= Math.ceil(limit / 3)) pick5.push(o);
      if (pick5.length >= limit) break;
    }
    return pick5;
  }
  function moveTo(g, bi) {
    const h = g.hero, w = g.world, b = w.map.buildings[bi];
    const rent = g.rentOf(b);
    if (h.money < rent * 2) return { ok: false, msg: `\u5F15\u3063\u8D8A\u3057\u306B\u306F\u5BB6\u8CC32\u304B\u6708\u5206(\u7D04\xA5${(rent * 2).toLocaleString()})\u304C\u5FC5\u8981\u3067\u3059\u3002` };
    const sold2 = sellOwned(g);
    h.flags.shelter = false;
    h.flags.moveBy = 0;
    g.pay(rent * 2, "\u6577\u91D1\u30FB\u5F15\u3063\u8D8A\u3057\u8CBB\u7528");
    onMove(g, rent);
    const group = [h.id];
    if (h.spouse != null) group.push(h.spouse);
    for (const k of h.kids) if (!w.pop.gone[k] && g.ageOf(k) < 18) group.push(k);
    for (const i of group) w.moveHome(i, bi);
    h.homeB = bi;
    h.homeIsParents = false;
    g.S.stats.moves++;
    g.log("move", `${b.name}(${b.addr})\u306B\u5F15\u3063\u8D8A\u3057\u305F`, { b: bi });
    g.syncWorldFlags();
    return { ok: true, msg: `${b.name}\u306B\u5F15\u3063\u8D8A\u3057\u307E\u3057\u305F\u3002` };
  }
  function planTrip(g, fromId, toId) {
    const plan = planRail(g.tr, fromId, toId);
    if (!plan) return null;
    const t0 = g.absMin();
    const sim = simulateTrip(g.tr, plan, t0);
    const nStops = plan.stops;
    const f2 = fare(nStops, g.pi());
    return { plan, sim, fare: f2, wait: sim.ok ? sim.legs[0].board - t0 : 0, total: sim.ok ? sim.arrive - t0 : 0 };
  }

