  // src/bldhist.js
  var FORMER = {
    konbini: ["\u9152\u5C4B", "\u7C73\u7A40\u5E97", "\u6587\u623F\u5177\u5E97", "\u5C0F\u3055\u306A\u30B9\u30FC\u30D1\u30FC"],
    super: ["\u516B\u767E\u5C4B\u3068\u9B5A\u5C4B\u306E\u5E02\u5834", "\u500B\u4EBA\u5546\u5E97\u8857\u306E\u4E00\u89D2", "\u6620\u753B\u9928"],
    shop: ["\u99C4\u83D3\u5B50\u5C4B", "\u5199\u771F\u9928", "\u5E03\u56E3\u5E97", "\u753A\u5DE5\u5834"],
    cafe: ["\u5199\u771F\u9928", "\u6642\u8A08\u5E97", "\u55AB\u8336\u5E97(\u5148\u4EE3)", "\u5449\u670D\u5E97"],
    ramen: ["\u4E2D\u83EF\u6599\u7406\u5E97(\u5148\u4EE3)", "\u5BFF\u53F8\u5C4B", "\u98DF\u5802"],
    restaurant: ["\u5272\u70F9", "\u65C5\u9928\u306E\u98DF\u5802", "\u6D0B\u98DF\u5E97"],
    izakaya: ["\u30B9\u30CA\u30C3\u30AF", "\u9B5A\u5C4B", "\u99C5\u524D\u306E\u98DF\u5802"],
    house: ["\u7551", "\u7A7A\u304D\u5730", "\u53E4\u3044\u5E73\u5C4B", "\u6750\u6728\u7F6E\u304D\u5834"],
    apt: ["\u793E\u5B85", "\u7A7A\u304D\u5730", "\u753A\u5DE5\u5834", "\u7551"],
    tower: ["\u5DE5\u5834\u8DE1\u5730", "\u9020\u8239\u6240\u306E\u5009\u5EAB", "\u99D0\u8ECA\u5834"],
    villa: ["\u4FDD\u990A\u6240", "\u7A7A\u304D\u5730", "\u7551"],
    farmhouse: ["\u990A\u8695\u8FB2\u5BB6", "\u7530\u7551", "\u725B\u820E"],
    mall: ["\u5DE5\u5834\u8DE1\u5730", "\u56FD\u9244\u7528\u5730", "\u5927\u304D\u306A\u7A7A\u304D\u5730"],
    dept: ["\u5449\u670D\u554F\u5C4B", "\u5E02\u5834", "\u767E\u8CA8\u5E97(\u5148\u4EE3)"],
    hotel: ["\u65C5\u9928", "\u793E\u54E1\u5BEE", "\u75C5\u9662"],
    bizhotel: ["\u65C5\u9928", "\u5DE5\u5834\u306E\u5BEE", "\u9280\u884C\u306E\u652F\u5E97"],
    ryokan: ["\u6E6F\u6CBB\u5BBF", "\u6599\u4EAD", "\u7DB2\u5143\u306E\u5C4B\u6577"],
    minshuku: ["\u6F01\u5E2B\u306E\u5BB6", "\u6C11\u5BBF(\u5148\u4EE3)", "\u7DB2\u5143\u306E\u5C4B\u6577"],
    clinic: ["\u85AC\u5C40", "\u500B\u4EBA\u533B\u9662(\u5148\u4EE3)", "\u5E8A\u5C4B"],
    pharmacy: ["\u96D1\u8CA8\u5E97", "\u500B\u4EBA\u533B\u9662", "\u5199\u771F\u9928"],
    hospital: ["\u7642\u990A\u6240", "\u7D50\u6838\u7642\u990A\u6240", "\u7551"],
    school: ["\u5BFA\u5B50\u5C4B\u306E\u8DE1", "\u5C0F\u3055\u306A\u5206\u6821"],
    elem: ["\u5206\u6821", "\u8FB2\u5354\u306E\u5009\u5EAB"],
    jh: ["\u65E7\u5236\u4E2D\u5B66\u306E\u8DE1", "\u7A7A\u304D\u5730"],
    hs: ["\u5973\u5B66\u6821\u306E\u8DE1", "\u7A7A\u304D\u5730"],
    univ: ["\u5DE5\u5834\u8DE1\u5730", "\u8ECD\u9700\u5DE5\u5834\u306E\u8DE1", "\u7A7A\u304D\u5730"],
    station: ["\u6728\u9020\u99C5\u820E", "\u8CA8\u7269\u30DB\u30FC\u30E0", "\u5C0F\u3055\u306A\u99C5\u820E"],
    gasstation: ["\u81EA\u8EE2\u8ECA\u5C4B", "\u99D0\u8ECA\u5834"],
    bank: ["\u4FE1\u7528\u7D44\u5408", "\u5449\u670D\u5E97"],
    cityhall: ["\u753A\u5F79\u5834(\u65E7\u5E81\u820E)", "\u516C\u4F1A\u5802"],
    library: ["\u516C\u6C11\u9928", "\u56F3\u66F8\u5BA4\u306E\u3042\u308B\u96C6\u4F1A\u6240"],
    museum: ["\u9020\u308A\u9152\u5C4B\u306E\u8535", "\u7DB2\u5143\u306E\u5C4B\u6577"],
    cinema: ["\u829D\u5C45\u5C0F\u5C4B", "\u6620\u753B\u9928(\u5148\u4EE3)"],
    gamecenter: ["\u30D1\u30C1\u30F3\u30B3\u5E97", "\u6620\u753B\u9928"],
    bowling: ["\u30DC\u30A6\u30EA\u30F3\u30B0\u5834(\u5148\u4EE3)", "\u5009\u5EAB"],
    gym: ["\u4F53\u80B2\u9928", "\u5009\u5EAB"],
    sento: ["\u92AD\u6E6F(\u5148\u4EE3)", "\u9577\u5C4B"],
    temple: ["\u5EB5", "\u5C0F\u3055\u306A\u304A\u5802"],
    shrine: ["\u5C0F\u3055\u306A\u7960", "\u93AE\u5B88\u306E\u675C"]
  };
  var GENERIC = ["\u7A7A\u304D\u5730", "\u7551", "\u5009\u5EAB", "\u753A\u5DE5\u5834", "\u53E4\u3044\u5E73\u5C4B"];
  function historyOf(g, bIdx) {
    const b = g.world.map.buildings[bIdx], bt = BTYPES[b.type];
    const r = new Rng(g.S.seed, "bh:" + bIdx);
    const y = g.year();
    const resTypes = ["house", "apt", "farmhouse"];
    const old = resTypes.includes(b.type) || ["temple", "shrine", "museum", "ryokan", "minshuku"].includes(b.type);
    const built = Math.min(old ? 1930 + r.int(55) : 1955 + r.int(40), g.S.startYear - 1);
    const lst = FORMER[b.type] || GENERIC;
    const events = [];
    const nFormer = b.type === "shrine" || b.type === "temple" ? 0 : 1 + r.int(2);
    let t = Math.max(1900, built - 6 - r.int(10));
    for (let i = 0; i < nFormer; i++) {
      const w = lst[r.int(lst.length)];
      const span = 8 + r.int(25);
      events.push({ y: t, text: `${w}\u304C\u3042\u3063\u305F`, kind: "former" });
      t += span;
    }
    events.push({ y: Math.min(Math.max(built, t), g.S.startYear - 1), text: `\u73FE\u5728\u306E\u59FF(${bt.label || b.type})\u3068\u3057\u3066\u5EFA\u3066\u3089\u308C\u305F`, kind: "built" });
    if (r.chance(0.55) && !old) events.push({ y: built + 10 + r.int(25), text: "\u6539\u88C5\u3055\u308C\u305F", kind: "renew" });
    if (r.chance(0.2)) events.push({ y: 1993 + r.int(20), text: "\u5730\u57DF\u306E\u884C\u4E8B\u306E\u4F1A\u5834\u3068\u3057\u3066\u4F7F\u308F\u308C\u305F", kind: "event" });
    {
      const by = events.find((e) => e.kind === "built").y;
      let k = 0;
      for (const e of events) if (e.kind === "former" && e.y >= by) e.y = by - 3 - 5 * k++;
    }
    for (const e of npcFirmHistory(g, b, y)) events.push({ y: e.y, text: e.text, kind: "biz" });
    events.sort((a, b2) => a.y - b2.y);
    const shown = events.filter((e) => e.y <= y);
    return { name: b.name, built, events: shown, text: `${b.name}
` + (shown.length ? shown.map((e) => `${e.y}\u5E74\u3054\u308D: ${e.text}`).join("\n") : "\u8A18\u9332\u306F\u3042\u307E\u308A\u6B8B\u3063\u3066\u3044\u307E\u305B\u3093\u3002") + "\n\u203B\u6765\u6B74\u306F\u30B2\u30FC\u30E0\u7528\u306E\u67B6\u7A7A\u8A2D\u5B9A\u3067\u3059\u3002" };
  }

