  // src/shop.js
  var I = (id, n2, e, p, fx, col, from = 0, to = 9999, mo = null, cat = "\u98DF\u54C1") => ({ id, n: n2, e, p, fx, col, from, to, mo, cat });
  var WARM = [9, 10, 11, 0, 1, 2];
  var HOT = [5, 6, 7, 8];
  var AL = (id, n2, e, p, mood2, drunk, col, from = 0, to = 9999) => ({ ...I(id, n2, e, p, { mood: mood2, drunk }, col, from, to, null, "\u9152"), adult: true });
  var CATALOG = {
    daily: [
      // コンビニ・商店
      I("onigiri", "\u304A\u306B\u304E\u308A", "\u{1F359}", 130, { hunger: 18 }, "#f4f4ee", 1975),
      I("bento", "\u304A\u5F01\u5F53", "\u{1F371}", 480, { hunger: 40, mood: 1 }, "#c9894a", 1980),
      I("sand", "\u30B5\u30F3\u30C9\u30A4\u30C3\u30C1", "\u{1F96A}", 300, { hunger: 28 }, "#e5c98a", 1975),
      I("tea", "\u304A\u8336", "\u{1F375}", 150, { mood: 1, hunger: 2 }, "#6aa56a", 1985),
      I("can", "\u7F36\u30B3\u30FC\u30D2\u30FC", "\u2615", 120, { energy: 5, mood: 1 }, "#7a4a2a", 1975),
      I("juice", "\u30B8\u30E5\u30FC\u30B9", "\u{1F9C3}", 140, { mood: 2, hunger: 3 }, "#f0a040", 1975),
      I("pet", "\u30DA\u30C3\u30C8\u30DC\u30C8\u30EB\u306E\u304A\u8336", "\u{1F376}", 150, { mood: 1, hunger: 2 }, "#4a9a6a", 1996),
      I("gum", "\u30AC\u30E0", "\u{1F36C}", 100, { mood: 1 }, "#e060a0", 1975),
      I("snack", "\u30B9\u30CA\u30C3\u30AF\u83D3\u5B50", "\u{1F37F}", 150, { mood: 2, hunger: 5 }, "#e0b030", 1975),
      I("cup", "\u30AB\u30C3\u30D7\u9EBA", "\u{1F35C}", 200, { hunger: 32 }, "#d04030", 1975),
      I("ice", "\u30A2\u30A4\u30B9", "\u{1F368}", 120, { mood: 4, hunger: 4 }, "#a0d8f0", 1975, 9999, HOT),
      I("bun", "\u4E2D\u83EF\u307E\u3093", "\u{1F95F}", 130, { hunger: 14, mood: 2 }, "#f0e0c0", 1980, 9999, WARM),
      I("oden", "\u304A\u3067\u3093", "\u{1F362}", 100, { hunger: 14, mood: 2 }, "#c09060", 1985, 9999, WARM),
      I("mag", "\u96D1\u8A8C", "\u{1F4D6}", 400, { mood: 4, intel: 0.3 }, "#d0508a", 1975, 9999, null, "\u65E5\u7528\u54C1"),
      I("news", "\u65B0\u805E", "\u{1F4F0}", 100, { intel: 0.2 }, "#c8c8c0", 1975, 9999, null, "\u65E5\u7528\u54C1"),
      I("pcard", "\u30C6\u30EC\u30DB\u30F3\u30AB\u30FC\u30C9", "\u{1F4B3}", 500, { social: 0.3 }, "#8080d0", 1982, 2006, null, "\u65E5\u7528\u54C1"),
      I("cam", "\u4F7F\u3044\u6368\u3066\u30AB\u30E1\u30E9", "\u{1F4F7}", 1200, { mood: 3 }, "#e0d040", 1986, 2010, null, "\u65E5\u7528\u54C1"),
      I("vhs", "\u30D3\u30C7\u30AA\u30C6\u30FC\u30D7", "\u{1F4FC}", 600, { mood: 1 }, "#303040", 1978, 2003, null, "\u65E5\u7528\u54C1"),
      I("cd", "CD", "\u{1F4BF}", 2500, { mood: 5 }, "#a0b0c8", 1983, 2018, null, "\u65E5\u7528\u54C1"),
      I("emoney", "\u96FB\u5B50\u30DE\u30CD\u30FC\u30AB\u30FC\u30C9", "\u{1F4B3}", 1e3, { social: 0.2 }, "#40b0e0", 2004, 9999, null, "\u65E5\u7528\u54C1"),
      I("batt", "\u4E7E\u96FB\u6C60", "\u{1F50B}", 300, { energy: 0 }, "#e0c030", 1975, 9999, null, "\u65E5\u7528\u54C1"),
      I("umb", "\u30D3\u30CB\u30FC\u30EB\u5098", "\u2602\uFE0F", 500, { mood: 1 }, "#80c0f0", 1975, 9999, null, "\u65E5\u7528\u54C1"),
      I("chg", "\u30B9\u30DE\u30DB\u5145\u96FB\u5668", "\u{1F50C}", 1500, { intel: 0.1 }, "#d8d8d8", 2010, 9999, null, "\u65E5\u7528\u54C1"),
      I("mask", "\u30DE\u30B9\u30AF", "\u{1F637}", 300, { health: 1 }, "#f0f0f8", 2009, 9999, null, "\u65E5\u7528\u54C1"),
      I("cold", "\u304B\u305C\u85AC", "\u{1F48A}", 900, { health: 6 }, "#f0f0f0", 1975, 9999, null, "\u65E5\u7528\u54C1"),
      I("pack", "\u98DF\u6750\u30D1\u30C3\u30AF(\u81EA\u708A\u7528)", "\u{1F96C}", 1500, { food: 3 }, "#70b050", 1975)
    ],
    grocery: [
      // スーパー
      I("veg", "\u91CE\u83DC\u30BB\u30C3\u30C8", "\u{1F96C}", 1e3, { food: 3 }, "#58a040"),
      I("fish", "\u304A\u9B5A", "\u{1F41F}", 900, { food: 3 }, "#8ab0d0"),
      I("meat", "\u304A\u8089", "\u{1F969}", 1400, { food: 4 }, "#c84a4a"),
      I("egg", "\u5375", "\u{1F95A}", 250, { food: 1 }, "#f0e0b0"),
      I("rice", "\u304A\u7C73", "\u{1F33E}", 2e3, { food: 5 }, "#f0ecdc"),
      I("milk", "\u725B\u4E73", "\u{1F95B}", 200, { hunger: 6, health: 0.3 }, "#f4f6ff"),
      I("sozai", "\u304A\u60E3\u83DC", "\u{1F364}", 450, { hunger: 30 }, "#d08a3a", 1975),
      I("onigiri", "\u304A\u306B\u304E\u308A", "\u{1F359}", 130, { hunger: 18 }, "#f4f4ee"),
      I("tea", "\u304A\u8336", "\u{1F375}", 150, { mood: 1, hunger: 2 }, "#6aa56a"),
      I("bread", "\u98DF\u30D1\u30F3", "\u{1F35E}", 180, { food: 1, hunger: 8 }, "#e0c080"),
      I("frozen", "\u51B7\u51CD\u98DF\u54C1", "\u{1F9CA}", 350, { food: 1, hunger: 14 }, "#a8d0e8", 1980),
      I("kakigori", "\u304B\u304D\u6C37\u30BB\u30C3\u30C8", "\u{1F367}", 300, { mood: 4 }, "#a8e0f0", 0, 9999, HOT),
      I("nabe", "\u934B\u30BB\u30C3\u30C8", "\u{1F372}", 1800, { food: 4, mood: 2 }, "#d8a860", 0, 9999, WARM),
      I("tissue", "\u30C6\u30A3\u30C3\u30B7\u30E5\u30FB\u6D17\u5264", "\u{1F9FB}", 600, { mood: 1 }, "#f0f0e0", 0, 9999, null, "\u65E5\u7528\u54C1"),
      I("mask", "\u30DE\u30B9\u30AF", "\u{1F637}", 300, { health: 1 }, "#f0f0f8", 2009, 9999, null, "\u65E5\u7528\u54C1")
    ],
    clothes: [],
    books: [I("mag", "\u96D1\u8A8C", "\u{1F4D6}", 400, { mood: 4, intel: 0.3 }, "#d0508a", 0, 9999, null, "\u672C"), I("pic", "\u7D75\u672C", "\u{1F4DA}", 900, { mood: 3, intel: 0.3 }, "#e8a8c0", 0, 9999, null, "\u672C"), I("jr", "\u5150\u7AE5\u66F8", "\u{1F4D8}", 700, { mood: 3, intel: 0.5 }, "#7a9ae0", 0, 9999, null, "\u672C"), I("travel", "\u65C5\u884C\u30AC\u30A4\u30C9", "\u{1F9F3}", 1500, { mood: 2, intel: 0.3 }, "#3aa6a0", 0, 9999, null, "\u672C"), I("cook", "\u6599\u7406\u672C", "\u{1F4D9}", 1400, { mood: 1, intel: 0.3 }, "#e8a83a", 0, 9999, null, "\u672C"), I("manga2", "\u30DE\u30F3\u30AC(\u5C11\u5E74)", "\u{1F4D7}", 400, { mood: 4 }, "#d86a3a", 0, 9999, null, "\u672C"), I("ref", "\u53C2\u8003\u66F8", "\u{1F4D8}", 1800, { intel: 1.5, study: 5 }, "#4a70b8", 0, 9999, null, "\u672C"), I("novel", "\u5C0F\u8AAC", "\u{1F4D5}", 800, { mood: 3, intel: 0.3 }, "#b84a4a", 0, 9999, null, "\u672C"), I("manga", "\u30DE\u30F3\u30AC", "\u{1F4D7}", 450, { mood: 4 }, "#58a858", 0, 9999, null, "\u672C"), I("dict", "\u8F9E\u66F8", "\u{1F4D9}", 3e3, { intel: 1 }, "#c89a48", 0, 9999, null, "\u672C"), I("ebook", "\u96FB\u5B50\u66F8\u7C4D\u30AB\u30FC\u30C9", "\u{1F4B3}", 1e3, { mood: 2, intel: 0.4 }, "#40b0e0", 2010, 9999, null, "\u672C")],
    medicine: [I("cold", "\u304B\u305C\u85AC", "\u{1F48A}", 900, { health: 6 }, "#f0f0f0"), I("drink", "\u6804\u990A\u30C9\u30EA\u30F3\u30AF", "\u{1F9EA}", 300, { energy: 8 }, "#e0a030"), I("plaster", "\u7D46\u5275\u818F", "\u{1FA79}", 250, { health: 1 }, "#f0c8a0"), I("vit", "\u30D3\u30BF\u30DF\u30F3\u5264", "\u{1F34A}", 800, { health: 3 }, "#f0a830"), I("mask", "\u30DE\u30B9\u30AF", "\u{1F637}", 300, { health: 1 }, "#f0f0f8", 2009)],
    fish: [I("fish", "\u65B0\u9BAE\u306A\u9B5A(\u81EA\u708A\u7528)", "\u{1F41F}", 1800, { food: 4 }, "#8ab0d0"), I("shell", "\u8C9D\u985E", "\u{1F41A}", 1200, { food: 3 }, "#e0d0c0"), I("dried", "\u5E72\u7269", "\u{1F420}", 900, { food: 2, hunger: 8 }, "#c0a070")],
    veg: [I("carrot", "\u306B\u3093\u3058\u3093(3\u672C)", "\u{1F955}", 150, { food: 1 }, "#ee7a1c"), I("daikon", "\u3060\u3044\u3053\u3093", "\u{1F955}", 200, { food: 1.5 }, "#f6f7ef", 0, 9999, [9, 10, 11, 0, 1, 2]), I("hakusai", "\u767D\u83DC", "\u{1F96C}", 300, { food: 2 }, "#e8efc4", 0, 9999, [10, 11, 0, 1, 2]), I("negi", "\u306D\u304E", "\u{1F331}", 180, { food: 1 }, "#3f9a45"), I("cabbage", "\u30AD\u30E3\u30D9\u30C4", "\u{1F96C}", 220, { food: 2 }, "#7fc24a"), I("tomato", "\u30C8\u30DE\u30C8", "\u{1F345}", 350, { food: 1.5, health: 0.3 }, "#e03a2e", 0, 9999, [4, 5, 6, 7, 8]), I("apple", "\u308A\u3093\u3054", "\u{1F34E}", 400, { mood: 2, hunger: 5 }, "#d8322b", 0, 9999, [9, 10, 11, 0]), I("mikan", "\u307F\u304B\u3093", "\u{1F34A}", 450, { mood: 2, hunger: 5, health: 0.3 }, "#f39a1a", 0, 9999, [10, 11, 0, 1]), I("banana", "\u30D0\u30CA\u30CA", "\u{1F34C}", 250, { hunger: 8, energy: 2 }, "#f2d230"), I("vegset", "\u91CE\u83DC\u30BB\u30C3\u30C8(\u81EA\u708A\u7528)", "\u{1F96C}", 1500, { food: 4 }, "#58a040"), I("fruit", "\u679C\u7269", "\u{1F34E}", 800, { mood: 3, hunger: 6, health: 0.5 }, "#d84040"), I("potato", "\u3058\u3083\u304C\u3044\u3082\u30FB\u7389\u306D\u304E", "\u{1F954}", 500, { food: 2 }, "#c8a870")],
    liquor: [
      AL("sake_ip", "\u65E5\u672C\u9152(\u4E00\u5347\u74F6)", "\u{1F376}", 2400, 4, 300, "#2f8a52"),
      AL("sake_gin", "\u7D14\u7C73\u541F\u91B8(\u56DB\u5408\u74F6)", "\u{1F376}", 1800, 5, 150, "#3a6ab0", 1985),
      AL("sake_cup", "\u30EF\u30F3\u30AB\u30C3\u30D7", "\u{1F376}", 250, 2, 80, "#a8742a"),
      AL("beer_can", "\u7F36\u30D3\u30FC\u30EB", "\u{1F37A}", 230, 3, 90, "#e8b920", 1975),
      AL("beer_blk", "\u9ED2\u30D3\u30FC\u30EB", "\u{1F37A}", 280, 3, 90, "#222a38", 1985),
      AL("beer_btl", "\u30D3\u30FC\u30EB(\u5927\u74F6)", "\u{1F37A}", 330, 3, 150, "#6b3f14"),
      AL("shochu_i", "\u828B\u713C\u914E", "\u{1F943}", 1800, 3, 240, "#c24a2a"),
      AL("shochu_k", "\u9EA6\u713C\u914E", "\u{1F943}", 1500, 3, 240, "#3a6a8a"),
      AL("umeshu", "\u6885\u9152", "\u{1F379}", 1500, 3, 150, "#d08a1a"),
      AL("wine_r", "\u8D64\u30EF\u30A4\u30F3", "\u{1F377}", 1400, 4, 150, "#4a1a2a"),
      AL("wine_w", "\u767D\u30EF\u30A4\u30F3", "\u{1F377}", 1300, 4, 150, "#8aa84a"),
      AL("whisky", "\u30A6\u30A4\u30B9\u30AD\u30FC", "\u{1F943}", 2500, 4, 300, "#b8761a"),
      AL("chuhai", "\u7F36\u30C1\u30E5\u30FC\u30CF\u30A4", "\u{1F379}", 140, 3, 80, "#e84a6a", 1984),
      I("nuts", "\u304A\u3064\u307E\u307F", "\u{1F95C}", 200, { hunger: 6, mood: 1 }, "#c89a48"),
      I("nonal", "\u30CE\u30F3\u30A2\u30EB\u30B3\u30FC\u30EB", "\u{1F964}", 150, { mood: 1 }, "#8ac0a0", 2009)
    ],
    home: [I("furn", "\u5BB6\u5177\u30FB\u96D1\u8CA8", "\u{1FA91}", 5e3, { mood: 3 }, "#b08a58"), I("plant", "\u89B3\u8449\u690D\u7269", "\u{1FAB4}", 1200, { mood: 2 }, "#48a048"), I("tool", "\u5DE5\u5177\u30BB\u30C3\u30C8", "\u{1F527}", 3e3, { mood: 1 }, "#808890"), I("bulb", "\u96FB\u7403", "\u{1F4A1}", 500, {}, "#f0e8a0"), I("bike", "\u81EA\u8EE2\u8ECA", "\u{1F6B2}", 28e3, { veh: "bicycle" }, "#4060c8"), I("moto", "\u539F\u4ED8\u30D0\u30A4\u30AF", "\u{1F6F5}", 18e4, { veh: "moto" }, "#d83a3a")],
    mall: [I("sozai", "\u304A\u60E3\u83DC", "\u{1F364}", 450, { hunger: 30 }, "#d08a3a"), I("book", "\u672C", "\u{1F4D8}", 1500, { intel: 1, mood: 2 }, "#4a70b8"), I("veg", "\u98DF\u6750\u30BB\u30C3\u30C8", "\u{1F96C}", 2e3, { food: 5 }, "#58a040"), I("misc", "\u96D1\u8CA8", "\u{1F381}", 2500, { mood: 3 }, "#d070a0"), I("cd", "CD", "\u{1F4BF}", 2500, { mood: 5 }, "#a0b0c8", 1983, 2018), I("gift", "\u30AE\u30D5\u30C8", "\u{1F380}", 3500, { mood: 4, social: 0.5 }, "#e06080")]
  };
  CATALOG.ekiben = [
    // 駅弁・駅の売店(地域の名物弁当は年代で増える)
    I("ek_maku", "\u5E55\u306E\u5185\u5F01\u5F53(\u99C5\u5F01)", "\u{1F371}", 900, { hunger: 52, mood: 2 }, "#c9894a", 1950),
    I("ek_gyu", "\u725B\u3081\u3057\u5F01\u5F53(\u99C5\u5F01)", "\u{1F371}", 950, { hunger: 55, mood: 2 }, "#b0623a", 1975),
    I("ek_kama", "\u91DC\u3081\u3057\u5F01\u5F53(\u99C5\u5F01\u30FB\u76CA\u5B50\u713C\u306E\u91DC)", "\u{1F372}", 1100, { hunger: 58, mood: 3 }, "#8a5a3a", 1958),
    I("ek_sushi", "\u3055\u3070\u62BC\u3057\u5BFF\u53F8(\u99C5\u5F01)", "\u{1F363}", 1e3, { hunger: 40, mood: 3 }, "#e8d8b0", 1950),
    I("ek_sand", "\u30B5\u30F3\u30C9\u30A4\u30C3\u30C1", "\u{1F96A}", 300, { hunger: 28 }, "#e8c878", 1975),
    I("ek_onigiri", "\u304A\u306B\u304E\u308A(2\u500B)", "\u{1F359}", 240, { hunger: 24 }, "#f4f4ee", 1950),
    I("ek_tea", "\u304A\u8336(\u99C5\u5F01\u7528\u306E\u8336\u74F6)", "\u{1F375}", 150, { mood: 1, hunger: 2 }, "#6a9a4a", 1950, 1995),
    I("ek_tea2", "\u304A\u8336(\u30DA\u30C3\u30C8\u30DC\u30C8\u30EB)", "\u{1F375}", 150, { mood: 1, hunger: 2 }, "#6a9a4a", 1996),
    I("ek_coffee", "\u7F36\u30B3\u30FC\u30D2\u30FC", "\u{1F96B}", 120, { energy: 3, mood: 1 }, "#6a4a3a", 1969),
    I("ek_news", "\u65B0\u805E", "\u{1F4F0}", 120, { intel: 0.2, mood: 1 }, "#d8d8d0", 1950),
    I("ek_omiyage", "\u5730\u5143\u9298\u83D3(\u304A\u307F\u3084\u3052)", "\u{1F381}", 1200, { mood: 4 }, "#d8a0a0", 1950),
    I("ek_icecream", "\u30A2\u30A4\u30B9\u30AF\u30EA\u30FC\u30E0", "\u{1F366}", 250, { mood: 2, hunger: 4 }, "#f4e8d8", 1960, 9999, [5, 6, 7, 8])
  ];
  CATALOG.airport = [
    // 空港の売店・免税店(お土産・機内持ち込みの軽食・旅行用品)
    I("ap_bento", "\u7A7A\u6E2F\u5F01\u5F53(\u6A5F\u5185\u3067\u98DF\u3079\u308B)", "\u{1F371}", 1200, { hunger: 50, mood: 2 }, "#c9894a", 1960),
    I("ap_sand", "\u30B5\u30F3\u30C9\u30A4\u30C3\u30C1", "\u{1F96A}", 450, { hunger: 28 }, "#e8c878", 1960),
    I("ap_coffee", "\u30B3\u30FC\u30D2\u30FC(\u30C6\u30A4\u30AF\u30A2\u30A6\u30C8)", "\u2615", 350, { mood: 1, hunger: 2 }, "#6a4a2a", 1960),
    I("ap_water", "\u30DF\u30CD\u30E9\u30EB\u30A6\u30A9\u30FC\u30BF\u30FC", "\u{1F964}", 180, { mood: 1 }, "#8ac0e0", 1985),
    I("ap_news", "\u65B0\u805E\u30FB\u96D1\u8A8C", "\u{1F4F0}", 200, { intel: 0.3, mood: 1 }, "#d8d8d0", 1960),
    I("ap_omiyage", "\u7A7A\u6E2F\u9650\u5B9A\u306E\u9298\u83D3(\u304A\u307F\u3084\u3052)", "\u{1F381}", 1500, { mood: 4 }, "#d8a0a0", 1960),
    I("ap_dutyfree", "\u514D\u7A0E\u5E97\u306E\u6D0B\u9152\u30FB\u9999\u6C34", "\u{1F37E}", 6800, { mood: 6 }, "#a8742a", 1978),
    I("ap_pillow", "\u30CD\u30C3\u30AF\u30D4\u30ED\u30FC\u30FB\u65C5\u884C\u7528\u54C1", "\u{1F9F3}", 1800, { mood: 2 }, "#8aa0c8", 1975),
    I("ap_toy", "\u98DB\u884C\u6A5F\u306E\u6A21\u578B", "\u2708\uFE0F", 2400, { mood: 3 }, "#e8eef6", 1960)
  ];
  CATALOG.clothes = [];
  var kindOf = (bt) => bt && bt.sells || "daily";
  var goodsFor = (b, bt, year, month0) => (CATALOG[kindOf(bt)] || CATALOG.daily).filter((it) => year >= it.from && year <= it.to && (!it.mo || it.mo.includes(month0)));
  var dayOf = (g) => Math.floor(g.absMin() / 1440);
  function sold(g) {
    const S2 = g.S;
    const d = dayOf(g);
    if (!S2.shopSold || S2.shopSold.d !== d) S2.shopSold = { d, m: {} };
    return S2.shopSold.m;
  }
  var stockOf = (g, b, it) => Math.max(0, 2 + hash2(b.idx * 131 + dayOf(g), it.id.length * 977 + it.id.charCodeAt(0) * 31 + it.id.charCodeAt(it.id.length - 1)) % 9 - (sold(g)[b.idx + ":" + it.id] || 0));
  var priceOf = (g, it) => Math.max(10, Math.round(g.yen(it.p) / 10) * 10);
  var drunkLeft = (g) => Math.max(0, (g.S.drunkUntil || 0) - g.absMin());
  var drinksOf = (g) => g.hero.inv.drinks || (g.hero.inv.drinks = {});
  var drinkList = (g) => Object.entries(drinksOf(g)).filter(([, n2]) => n2 > 0).map(([id, n2]) => ({ it: CATALOG.liquor.find((q) => q.id === id), n: n2 })).filter((o) => o.it);
  function drinkGoods(g, id) {
    const it = CATALOG.liquor.find((q) => q.id === id), d = drinksOf(g);
    if (!it || !(d[id] > 0)) return { ok: false, msg: "\u305D\u306E\u98F2\u307F\u7269\u306F\u6301\u3063\u3066\u3044\u307E\u305B\u3093" };
    if (g.age() < 20) return { ok: false, msg: "\u304A\u9152\u306F20\u6B73\u306B\u306A\u3063\u3066\u304B\u3089" };
    if (g.hero.veh && g.hero.veh.ride) return { ok: false, msg: "\u4E57\u308A\u7269\u304B\u3089\u964D\u308A\u3066\u304B\u3089\u98F2\u307F\u307E\u3057\u3087\u3046" };
    d[id]--;
    const now = g.absMin();
    g.S.drunkUntil = Math.max(now, g.S.drunkUntil || 0) + (it.fx.drunk || 0);
    const t = g.chg({ mood: it.fx.mood || 0 });
    g.advance(20);
    return { ok: true, msg: `${it.n}\u3092\u98F2\u307F\u307E\u3057\u305F\u3002${t} \u9154\u3044\u304C\u56DE\u3063\u3066\u3044\u307E\u3059(\u7D04${Math.round(drunkLeft(g) / 6) / 10}\u6642\u9593\u306F\u8ECA\u30FB\u30D0\u30A4\u30AF\u30FB\u81EA\u8EE2\u8ECA\u306B\u4E57\u308C\u307E\u305B\u3093)`, item: it };
  }
  function buyGoods(g, b, bt, id) {
    const list = goodsFor(b, bt, g.year(), g.month0());
    const it = list.find((q) => q.id === id);
    if (!it) return { ok: false, msg: "\u3053\u306E\u5E97\u3067\u306F\u6271\u3063\u3066\u3044\u307E\u305B\u3093" };
    if (stockOf(g, b, it) <= 0) return { ok: false, msg: `${it.n}\u306F\u58F2\u308A\u5207\u308C\u3067\u3059` };
    if (it.adult && g.age() < 20) return { ok: false, msg: "\u304A\u9152\u306F20\u6B73\u306B\u306A\u3063\u3066\u304B\u3089(\u672A\u6210\u5E74\u306B\u306F\u58F2\u308C\u307E\u305B\u3093)" };
    const pr = priceOf(g, it);
    if (g.hero.money < pr) return { ok: false, msg: "\u6240\u6301\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093" };
    if (it.fx.veh) return { ok: false, veh: it.fx.veh, msg: "" };
    g.pay(pr, it.n);
    const m = sold(g);
    m[b.idx + ":" + it.id] = (m[b.idx + ":" + it.id] || 0) + 1;
    g.advance(3);
    if (it.adult) {
      const d = drinksOf(g);
      d[it.id] = (d[it.id] || 0) + 1;
      return { ok: true, msg: `${it.n}\u3092\u8CB7\u3044\u307E\u3057\u305F(\xA5${pr.toLocaleString("ja-JP")})\u3002\u6301\u3061\u7269\u306B\u5165\u308C\u307E\u3057\u305F(\u98F2\u3080\u306E\u306F\u300C\u6301\u3061\u7269\u300D\u304B\u3089)`, item: it, price: pr };
    }
    const fx = { ...it.fx };
    if (fx.food) {
      g.hero.inv.food += fx.food;
      delete fx.food;
    }
    if (fx.study) {
      g.hero.study = Math.min(100, (g.hero.study || 0) + fx.study);
      delete fx.study;
    }
    let dr = "";
    if (fx.drunk) {
      const now = g.absMin();
      const cur2 = Math.max(now, g.S.drunkUntil || 0);
      g.S.drunkUntil = cur2 + fx.drunk;
      delete fx.drunk;
      dr = ` \u9154\u3044\u304C\u56DE\u308A\u307E\u3057\u305F(\u7D04${Math.round((g.S.drunkUntil - now) / 60 * 10) / 10}\u6642\u9593\u306F\u904B\u8EE2\u3067\u304D\u307E\u305B\u3093)`;
    }
    const t = g.chg(fx);
    return { ok: true, msg: `${it.n}\u3092\u8CB7\u3044\u307E\u3057\u305F(\xA5${pr.toLocaleString("ja-JP")})\u3002${t}${dr}`, item: it, price: pr };
  }
  function shelfLayout(g, b, bt, o, cooler) {
    let goods = goodsFor(b, bt, g.year(), g.month0()).filter((q) => q.cat !== "\u65E5\u7528\u54C1" || kindOf(bt) !== "grocery");
    if (cooler) goods = goods.filter((q) => /茶|ジュース|牛乳|ドリンク|缶|ペット|アイス|お弁当|サンド|おにぎり|惣菜|冷凍/.test(q.n));
    else if (kindOf(bt) === "daily" || kindOf(bt) === "grocery") goods = goods.filter((q) => !/アイス|牛乳|ジュース/.test(q.n));
    if (!goods.length) return [];
    const seed = hash2(b.idx * 7 + o.x, o.y * 13 + 5);
    const tiers = 3, per = 5;
    const out = [];
    for (let t = 0; t < tiers; t++) for (let k = 0; k < per; k++) {
      const it = goods[(seed + t * 3 + k * 5 + (t * per + k >> 2)) % goods.length];
      const rem = stockOf(g, b, it);
      if (rem <= (k + t) % 3 && rem < 4) continue;
      out.push({ t, k, it, id: it.id, kind: /茶|ジュース|牛乳|ドリンク|缶/.test(it.n) ? "bottle" : /雑誌|本|参考|小説|マンガ|CD|ビデオ|カード/.test(it.n) ? "flat" : "box" });
    }
    return out;
  }
  function drawShelf(ctx4, b, bt, o, S2, ox, oy, ts, g, cooler) {
    let goods = goodsFor(b, bt, g.year(), g.month0()).filter((q) => q.cat !== "\u65E5\u7528\u54C1" || kindOf(bt) !== "grocery");
    if (cooler) goods = goods.filter((q) => /茶|ジュース|牛乳|ドリンク|缶|ペット|アイス|お弁当|サンド|おにぎり|惣菜|冷凍/.test(q.n));
    else if (kindOf(bt) === "daily" || kindOf(bt) === "grocery") goods = goods.filter((q) => !/アイス|牛乳|ジュース/.test(q.n));
    if (!goods.length) return;
    const px2 = ts / 16, seed = hash2(b.idx * 7 + o.x, o.y * 13 + 5);
    const tiers = 3, per = 5;
    for (let t = 0; t < tiers; t++) for (let k = 0; k < per; k++) {
      const it = goods[(seed + t * 3 + k * 5 + (t * per + k >> 2)) % goods.length];
      const rem = stockOf(g, b, it);
      if (rem <= (k + t) % 3 && rem < 4) continue;
      const x = ox + (1.4 + k * 2.7) * px2, y = oy + (12 + t * 5.6) * px2;
      const bottle = /茶|ジュース|牛乳|ドリンク|缶/.test(it.n), flat = /雑誌|本|参考|小説|マンガ|CD|ビデオ|カード/.test(it.n);
      ctx4.fillStyle = it.col;
      if (bottle) {
        ctx4.fillRect(x, y - 3.2 * px2, 1.8 * px2, 4.2 * px2);
        ctx4.fillStyle = "rgba(255,255,255,.6)";
        ctx4.fillRect(x + 0.4 * px2, y - 3.2 * px2, 0.6 * px2, 0.8 * px2);
      } else if (flat) {
        ctx4.fillRect(x, y - 3.6 * px2, 2.2 * px2, 4.6 * px2);
        ctx4.fillStyle = "rgba(0,0,0,.25)";
        ctx4.fillRect(x + 1.6 * px2, y - 3.6 * px2, 0.5 * px2, 4.6 * px2);
      } else {
        ctx4.fillRect(x, y - 2.2 * px2, 2.4 * px2, 3.2 * px2);
        ctx4.fillStyle = "rgba(255,255,255,.35)";
        ctx4.fillRect(x + 0.3 * px2, y - 1.9 * px2, 1.6 * px2, 0.7 * px2);
      }
    }
  }

