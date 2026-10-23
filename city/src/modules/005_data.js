  // src/data.js
  var GAME_ID = "nagayama_japan_lifestory";
  var SCHEMA_VERSION = 1;
  var MAP_W = 240;
  var MAP_H = 170;
  var STATIONS = [
    { id: "kazeminato", name: "\u6D77\u98A8\u6E2F", kana: "\u304B\u305C\u307F\u306A\u3068", x: 16, y: 128, zone: "port" },
    { id: "shiomi", name: "\u6F6E\u898B", kana: "\u3057\u304A\u307F", x: 52, y: 122, zone: "oldtown" },
    { id: "aoumi_chuo", name: "\u9752\u6D77\u4E2D\u592E", kana: "\u3042\u304A\u307F\u3061\u3085\u3046\u304A\u3046", x: 110, y: 96, zone: "downtown" },
    { id: "midoricho", name: "\u7DD1\u753A", kana: "\u307F\u3069\u308A\u3061\u3087\u3046", x: 142, y: 74, zone: "civic" },
    { id: "sakuragaoka", name: "\u685C\u30F6\u4E18", kana: "\u3055\u304F\u3089\u304C\u304A\u304B", x: 168, y: 56, zone: "school" },
    { id: "minorino", name: "\u307F\u306E\u308A\u91CE", kana: "\u307F\u306E\u308A\u306E", x: 196, y: 46, zone: "farm" },
    { id: "tsukimi_onsen", name: "\u6708\u898B\u6E29\u6CC9", kana: "\u3064\u304D\u307F\u304A\u3093\u305B\u3093", x: 224, y: 18, zone: "onsen" },
    { id: "gakuen", name: "\u5B66\u5712\u90FD\u5E02", kana: "\u304C\u304F\u3048\u3093\u3068\u3057", x: 34, y: 66, zone: "campus" },
    { id: "showacho", name: "\u662D\u548C\u753A", kana: "\u3057\u3087\u3046\u308F\u3061\u3087\u3046", x: 72, y: 84, zone: "shotengai" },
    { id: "tohtower", name: "\u6771\u90FD\u30BF\u30EF\u30FC\u524D", kana: "\u3068\u3046\u3068\u305F\u308F\u30FC\u307E\u3048", x: 146, y: 114, zone: "tower" },
    { id: "rinkai", name: "\u81E8\u6D77\u30EA\u30BE\u30FC\u30C8", kana: "\u308A\u3093\u304B\u3044\u308A\u305E\u30FC\u3068", x: 178, y: 128, zone: "resort" },
    { id: "konan", name: "\u6E2F\u5357\u30DE\u30EA\u30FC\u30CA", kana: "\u3053\u3046\u306A\u3093\u307E\u308A\u30FC\u306A", x: 212, y: 136, zone: "marina" }
  ];
  var LINES = [
    { id: "AOUMI", name: "\u9752\u6D77\u7DDA", color: "#1e88e5", stations: ["kazeminato", "shiomi", "aoumi_chuo", "midoricho", "sakuragaoka", "minorino", "tsukimi_onsen"], speed: 3.2, headway: 10, dwell: 1 },
    { id: "LOOP", name: "\u6771\u897F\u74B0\u72B6\u7DDA(\u4E00\u90E8\u533A\u9593)", color: "#e53935", stations: ["gakuen", "showacho", "aoumi_chuo", "tohtower", "rinkai", "konan"], speed: 3, headway: 9, dwell: 1 }
  ];
  var EXTRA_ZONES = [
    { id: "temple_town", name: "\u5BFA\u753A", x: 106, y: 40, rx: 22, ry: 16 },
    { id: "industrial", name: "\u81E8\u6E2F\u5DE5\u696D\u5730", x: 76, y: 132, rx: 22, ry: 10 },
    { id: "suburb_n", name: "\u5317\u90CA\u4F4F\u5B85\u5730", x: 70, y: 40, rx: 22, ry: 14 },
    { id: "suburb_e", name: "\u6771\u90CA\u4F4F\u5B85\u5730", x: 190, y: 92, rx: 20, ry: 14 },
    { id: "suburb_w", name: "\u897F\u90CA\u4F4F\u5B85\u5730", x: 22, y: 100, rx: 16, ry: 12 },
    { id: "rural_s", name: "\u5357\u8FB2\u6751", x: 100, y: 125, rx: 14, ry: 10 }
  ];
  var ZONE_MIX = {
    port: { market: 3, seafood: 4, warehouse: 3, house: 5, apt: 4, shop: 3, harboroffice: 1, pier: 0, izakaya: 2, clinic: 1, konbini: 2, shrine: 1 },
    oldtown: { shop: 7, house: 8, apt: 4, ramen: 2, restaurant: 2, temple: 1, bookstore: 1, sento: 1, konbini: 2, clothes: 2, pharmacy: 1, clinic: 1, izakaya: 2 },
    downtown: { office: 7, tower: 4, dept: 1, mall: 1, hotel: 2, bizhotel: 2, restaurant: 5, cafe: 4, izakaya: 4, konbini: 4, cinema: 1, gamecenter: 2, bowling: 1, gym: 1, media: 1, lawfirm: 2, court: 1, bank: 2, bookstore: 1, clothes: 3, apt: 4, super: 1, homecenter: 0, agency: 1 },
    civic: { cityhall: 1, hospital: 1, police: 1, fire: 1, library: 1, apt: 9, house: 8, clinic: 2, super: 2, pharmacy: 2, nursing: 2, welfare: 1, konbini: 2, museum: 1, shop: 2, kinder: 1, funeral: 0 },
    school: { elem: 1, jh: 1, hs: 1, kinder: 2, house: 11, apt: 8, super: 2, konbini: 2, clinic: 1, park: 0, shop: 3, cram: 2, special: 1, shrine: 1 },
    farm: { farmhouse: 12, shop: 2, clinic: 1, farmcoop: 1, elem: 1, konbini: 1, house: 5, directsale: 1, gasstation: 1, factory: 1, kinder: 1 },
    onsen: { ryokan: 6, onsenbath: 2, shop: 3, house: 3, shrine: 1, minshuku: 3, konbini: 1, villa: 1 },
    campus: { univ: 1, apt: 12, cafe: 4, bookstore: 2, konbini: 3, restaurant: 3, house: 3, gym: 1, cram: 1, lab: 1, shop: 2 },
    shotengai: { shop: 9, ramen: 3, restaurant: 3, house: 7, apt: 4, izakaya: 3, temple: 1, clothes: 3, bookstore: 1, pharmacy: 1, konbini: 2, sento: 1, cafe: 2, fishshop: 2, greengrocer: 2 },
    tower: { tourtower: 1, office: 5, hotel: 2, restaurant: 4, cafe: 3, apt: 7, tower: 3, edovillage: 0, konbini: 3, mall: 0, shop: 3, gamecenter: 1, bank: 1, bizhotel: 1, aquarium: 0 },
    resort: { resorthotel: 3, beachhouse: 0, villa: 3, restaurant: 3, apt: 6, house: 3, konbini: 2, cafe: 3, aquarium: 1, gym: 1, shop: 2, tower: 1 },
    marina: { marina: 1, villa: 4, restaurant: 3, apt: 5, house: 5, konbini: 2, ferry: 1, cafe: 2, hotel: 1, shop: 2 },
    temple_town: { temple: 5, shrine: 2, cemetery: 2, crematorium: 1, funeral: 2, house: 8, apt: 2, shop: 1, nursing: 1 },
    industrial: { factory: 6, warehouse: 6, construction: 2, house: 2, konbini: 1, logistics: 2, gasstation: 1 },
    suburb_n: { house: 14, apt: 6, super: 1, konbini: 2, clinic: 1, elem: 1, kinder: 1, park: 0, shop: 1, jh: 1, hs: 1 },
    suburb_e: { house: 12, apt: 6, super: 1, konbini: 2, clinic: 1, elem: 1, jh: 1, hs: 1, gasstation: 1, homecenter: 1, special: 0, kinder: 1 },
    suburb_w: { house: 12, apt: 6, konbini: 1, clinic: 1, shop: 2, elem: 1, kinder: 1, hs: 0 },
    rural_s: { farmhouse: 10, house: 3, shop: 1, directsale: 1 },
    default: { house: 10, farmhouse: 3, apt: 2 }
  };
  var BTYPES = {
    house: { label: "\u4F4F\u5B85", w: 4, h: 3, cat: "res", cap: 5, enter: true, interior: "home" },
    farmhouse: { label: "\u8FB2\u5BB6", w: 5, h: 3, cat: "res", cap: 7, enter: true, interior: "home", slots: { farmer: 3 } },
    apt: { label: "\u96C6\u5408\u4F4F\u5B85", w: 5, h: 4, cat: "res", cap: 90, enter: true, interior: "home", slots: { janitor: 1 } },
    tower: { label: "\u30BF\u30EF\u30FC", w: 6, h: 5, cat: "res", cap: 360, enter: true, interior: "home", floors: 2, slots: { janitor: 2 } },
    villa: { label: "\u5225\u8358", w: 4, h: 3, cat: "res", cap: 3, enter: true, interior: "home" },
    shop: { label: "\u5546\u5E97", w: 4, h: 3, cat: "shop", enter: true, interior: "shop", slots: { clerk: 2 }, sells: "daily" },
    konbini: { label: "\u30B3\u30F3\u30D3\u30CB", w: 4, h: 3, cat: "shop", enter: true, interior: "shop", slots: { clerk: 5 }, sells: "daily" },
    super: { label: "\u30B9\u30FC\u30D1\u30FC", w: 12, h: 6, cat: "shop", enter: true, interior: "shop", slots: { clerk: 14, stocker: 4 }, sells: "grocery" },
    mall: { label: "\u30B7\u30E7\u30C3\u30D4\u30F3\u30B0\u30E2\u30FC\u30EB", w: 28, h: 10, cat: "shop", enter: true, interior: "shop", floors: 2, slots: { clerk: 24, cleaner: 3, stocker: 5 }, sells: "mall" },
    dept: { label: "\u767E\u8CA8\u5E97", w: 18, h: 9, cat: "shop", enter: true, interior: "shop", floors: 2, slots: { clerk: 20, cleaner: 3 }, sells: "mall" },
    bookstore: { label: "\u66F8\u5E97", w: 4, h: 3, cat: "shop", enter: true, interior: "shop", slots: { clerk: 3 }, sells: "books" },
    clothes: { label: "\u6D0B\u670D\u5E97", w: 4, h: 3, cat: "shop", enter: true, interior: "shop", slots: { clerk: 2 }, sells: "clothes" },
    pharmacy: { label: "\u85AC\u5C40", w: 4, h: 3, cat: "med", enter: true, interior: "shop", slots: { pharmacist: 1, clerk: 2 }, sells: "medicine" },
    fishshop: { label: "\u9B5A\u5C4B", w: 4, h: 3, cat: "shop", enter: true, interior: "shop", slots: { clerk: 2 }, sells: "fish" },
    liquor: { label: "\u9152\u5C4B", w: 4, h: 3, cat: "shop", enter: true, interior: "shop", slots: { clerk: 2 }, sells: "liquor" },
    greengrocer: { label: "\u516B\u767E\u5C4B", w: 4, h: 3, cat: "shop", enter: true, interior: "shop", slots: { clerk: 2 }, sells: "veg" },
    homecenter: { label: "\u30DB\u30FC\u30E0\u30BB\u30F3\u30BF\u30FC", w: 8, h: 4, cat: "shop", enter: true, interior: "shop", slots: { clerk: 10, stocker: 3 }, sells: "home" },
    directsale: { label: "\u8FB2\u7523\u7269\u76F4\u58F2\u6240", w: 5, h: 3, cat: "shop", enter: true, interior: "shop", slots: { clerk: 3, farmer: 2 }, sells: "veg" },
    gasstation: { label: "\u30AC\u30BD\u30EA\u30F3\u30B9\u30BF\u30F3\u30C9", w: 6, h: 3, cat: "shop", enter: false, slots: { clerk: 4 } },
    cardealer: { label: "\u65B0\u8ECA\u30C7\u30A3\u30FC\u30E9\u30FC", w: 8, h: 4, cat: "shop", enter: true, interior: "showroom", slots: { clerk: 6 } },
    // 地図v3以降(新規ゲーム)で倉庫の一部を用途変更して配置。玄関で販売画面(carui)を開く
    usedcar: { label: "\u4E2D\u53E4\u8ECA\u8CA9\u58F2\u5E97", w: 8, h: 4, cat: "shop", enter: true, interior: "showroom", slots: { clerk: 3 } },
    ramen: { label: "\u30E9\u30FC\u30E1\u30F3\u5E97", w: 4, h: 3, cat: "food", enter: true, interior: "food", slots: { cook: 2, waitstaff: 2 }, menu: "ramen" },
    restaurant: { label: "\u98DF\u5802\u30FB\u30EC\u30B9\u30C8\u30E9\u30F3", w: 4, h: 3, cat: "food", enter: true, interior: "food", slots: { cook: 3, waitstaff: 3 }, menu: "set" },
    seafood: { label: "\u6D77\u9BAE\u98DF\u5802", w: 5, h: 3, cat: "food", enter: true, interior: "food", slots: { cook: 3, waitstaff: 2 }, menu: "seafood" },
    izakaya: { label: "\u5C45\u9152\u5C4B", w: 4, h: 3, cat: "food", enter: true, interior: "food", slots: { cook: 2, waitstaff: 3 }, menu: "izakaya", adult: true },
    cafe: { label: "\u55AB\u8336\u5E97", w: 4, h: 3, cat: "food", enter: true, interior: "food", slots: { cook: 1, waitstaff: 2 }, menu: "cafe" },
    market: { label: "\u9B5A\u5E02\u5834", w: 8, h: 4, cat: "work", enter: true, interior: "shop", slots: { fisher: 12, clerk: 4, logistics: 3 }, sells: "fish" },
    pier: { label: "\u685F\u6A4B", w: 6, h: 2, cat: "work", enter: true, interior: "warehouse", slots: { fisher: 4 } },
    harboroffice: { label: "\u6E2F\u6E7E\u4E8B\u52D9\u6240", w: 5, h: 3, cat: "work", enter: true, interior: "office", slots: { officeworker: 6, logistics: 4 } },
    warehouse: { label: "\u5009\u5EAB", w: 8, h: 4, cat: "work", enter: true, interior: "warehouse", slots: { logistics: 8, factory: 4 } },
    factory: { label: "\u753A\u5DE5\u5834", w: 7, h: 4, cat: "work", enter: true, interior: "factory", slots: { factory: 14, officeworker: 2 } },
    logistics: { label: "\u7269\u6D41\u30BB\u30F3\u30BF\u30FC", w: 9, h: 4, cat: "work", enter: true, interior: "warehouse", slots: { logistics: 18, officeworker: 3 } },
    construction: { label: "\u5EFA\u8A2D\u4F1A\u793E", w: 5, h: 3, cat: "work", enter: true, interior: "office", slots: { carpenter: 8, officeworker: 3 } },
    farmcoop: { label: "\u307F\u306E\u308A\u8FB2\u5354(\u67B6\u7A7A)", w: 6, h: 3, cat: "work", enter: true, interior: "office", slots: { officeworker: 5, farmer: 3 } },
    office: { label: "\u30AA\u30D5\u30A3\u30B9\u30D3\u30EB", w: 6, h: 5, cat: "work", enter: true, interior: "office", floors: 2, slots: { officeworker: 30 } },
    bank: { label: "\u9280\u884C", w: 5, h: 3, cat: "work", enter: true, interior: "office", slots: { banker: 10 } },
    media: { label: "\u30E1\u30C7\u30A3\u30A2\u30BB\u30F3\u30BF\u30FC", w: 7, h: 4, cat: "work", enter: true, interior: "office", slots: { reporter: 8, announcer: 3, officeworker: 8 } },
    agency: { label: "\u82B8\u80FD\u4E8B\u52D9\u6240", w: 5, h: 3, cat: "work", enter: true, interior: "office", slots: { entertainer: 6, officeworker: 3 } },
    lawfirm: { label: "\u6CD5\u5F8B\u4E8B\u52D9\u6240", w: 4, h: 3, cat: "work", enter: true, interior: "office", slots: { lawyer: 3, officeworker: 2 } },
    court: { label: "\u88C1\u5224\u6240", w: 7, h: 4, cat: "public", enter: true, interior: "office", slots: { judge: 4, officeworker: 8 } },
    cityhall: { label: "\u5E02\u5F79\u6240", w: 8, h: 4, cat: "public", enter: true, interior: "office", floors: 2, slots: { official: 40 }, hall: true },
    police: { label: "\u8B66\u5BDF\u7F72", w: 6, h: 3, cat: "public", enter: true, interior: "office", slots: { police: 30 } },
    fire: { label: "\u6D88\u9632\u7F72", w: 6, h: 3, cat: "public", enter: true, interior: "office", slots: { firefighter: 24 } },
    library: { label: "\u56F3\u66F8\u9928", w: 6, h: 3, cat: "public", enter: true, interior: "shop", slots: { official: 6 }, sells: "books" },
    museum: { label: "\u535A\u7269\u9928", w: 6, h: 3, cat: "sight", enter: true, interior: "shop", slots: { official: 5 } },
    hospital: { label: "\u7DCF\u5408\u75C5\u9662", w: 20, h: 8, cat: "med", enter: true, interior: "hospital", floors: 2, slots: { doctor: 14, nurse: 40, cleaner: 5 } },
    clinic: { label: "\u8A3A\u7642\u6240", w: 4, h: 3, cat: "med", enter: true, interior: "hospital", slots: { doctor: 1, nurse: 2 } },
    nursing: { label: "\u4ECB\u8B77\u65BD\u8A2D", w: 6, h: 3, cat: "med", enter: true, interior: "hospital", slots: { caregiver: 14, nurse: 3 } },
    welfare: { label: "\u969C\u5BB3\u798F\u7949\u30FB\u5C31\u52B4\u652F\u63F4\u65BD\u8A2D", w: 6, h: 3, cat: "med", enter: true, interior: "office", slots: { caregiver: 8, official: 3 } },
    kinder: { label: "\u5E7C\u7A1A\u5712\u30FB\u4FDD\u80B2\u5712", w: 6, h: 3, cat: "school", level: 1, enter: true, interior: "school", slots: { childcare: 9 } },
    elem: { label: "\u5C0F\u5B66\u6821", w: 9, h: 4, cat: "school", level: 2, enter: true, interior: "school", floors: 2, slots: { teacher: 18 } },
    jh: { label: "\u4E2D\u5B66\u6821", w: 9, h: 4, cat: "school", level: 3, enter: true, interior: "school", floors: 2, slots: { teacher: 20 } },
    hs: { label: "\u9AD8\u7B49\u5B66\u6821", w: 9, h: 4, cat: "school", level: 4, enter: true, interior: "school", floors: 2, slots: { teacher: 26 } },
    univ: { label: "\u5927\u5B66", w: 24, h: 8, cat: "school", level: 5, enter: true, interior: "school", floors: 2, slots: { professor: 40, officeworker: 12 } },
    special: { label: "\u7279\u5225\u652F\u63F4\u5B66\u6821", w: 8, h: 4, cat: "school", level: 2, enter: true, interior: "school", floors: 2, slots: { special_teacher: 20, caregiver: 8 }, support: true },
    cram: { label: "\u5B66\u7FD2\u587E", w: 4, h: 3, cat: "school", enter: true, interior: "office", slots: { teacher: 4 } },
    lab: { label: "\u7814\u7A76\u6240", w: 6, h: 4, cat: "work", enter: true, interior: "office", slots: { scientist: 12, officeworker: 3, astronaut: 1 } },
    hotel: { label: "\u30B7\u30C6\u30A3\u30DB\u30C6\u30EB", w: 7, h: 5, cat: "hotel", enter: true, interior: "hotel", floors: 2, slots: { hotelstaff: 20 }, price: 11e3 },
    bizhotel: { label: "\u30D3\u30B8\u30CD\u30B9\u30DB\u30C6\u30EB", w: 5, h: 4, cat: "hotel", enter: true, interior: "hotel", slots: { hotelstaff: 8 }, price: 6500 },
    resorthotel: { label: "\u30EA\u30BE\u30FC\u30C8\u30DB\u30C6\u30EB", w: 8, h: 5, cat: "hotel", enter: true, interior: "hotel", floors: 2, slots: { hotelstaff: 28 }, price: 22e3 },
    ryokan: { label: "\u6E29\u6CC9\u65C5\u9928", w: 7, h: 4, cat: "hotel", enter: true, interior: "hotel", slots: { hotelstaff: 14, artist: 2 }, price: 18e3, onsen: true },
    minshuku: { label: "\u6C11\u5BBF", w: 4, h: 3, cat: "hotel", enter: true, interior: "hotel", slots: { hotelstaff: 3 }, price: 7e3 },
    onsenbath: { label: "\u65E5\u5E30\u308A\u6E29\u6CC9", w: 5, h: 3, cat: "leisure", enter: true, interior: "bath", slots: { hotelstaff: 4 }, price: 700 },
    sento: { label: "\u92AD\u6E6F", w: 5, h: 3, cat: "leisure", enter: true, interior: "bath", slots: { hotelstaff: 3 }, price: 450 },
    cinema: { label: "\u6620\u753B\u9928", w: 6, h: 3, cat: "leisure", enter: true, interior: "leisure", slots: { clerk: 8 }, price: 1800 },
    gamecenter: { label: "\u30B2\u30FC\u30E0\u30BB\u30F3\u30BF\u30FC", w: 5, h: 3, cat: "leisure", enter: true, interior: "leisure", slots: { clerk: 5 }, price: 500 },
    bowling: { label: "\u30DC\u30A6\u30EA\u30F3\u30B0\u5834", w: 7, h: 3, cat: "leisure", enter: true, interior: "leisure", slots: { clerk: 6 }, price: 900 },
    gym: { label: "\u30B8\u30E0", w: 5, h: 3, cat: "leisure", enter: true, interior: "leisure", slots: { clerk: 4, athlete: 3, coach: 1 }, price: 800 },
    aquarium: { label: "\u6C34\u65CF\u9928", w: 8, h: 4, cat: "sight", enter: true, interior: "leisure", slots: { zookeeper: 10, clerk: 6 }, price: 2200 },
    tourtower: { label: "\u6771\u90FD\u30BF\u30EF\u30FC(\u67B6\u7A7A)", w: 4, h: 6, cat: "sight", enter: true, interior: "tower", floors: 2, slots: { clerk: 12, guide: 3 }, price: 1200 },
    edovillage: { label: "\u6C5F\u6238\u3055\u304F\u3089\u6751(\u67B6\u7A7A)", w: 10, h: 6, cat: "sight", enter: true, interior: "leisure", slots: { entertainer: 10, clerk: 8 }, price: 2800 },
    beachhouse: { label: "\u6D77\u306E\u5BB6", w: 4, h: 2, cat: "food", enter: true, interior: "food", slots: { cook: 2, waitstaff: 3 }, menu: "beach", summer: true },
    shrine: { label: "\u795E\u793E", w: 7, h: 5, cat: "religion", enter: true, interior: "shrine", slots: { priest: 2, fortune: 1 } },
    temple: { label: "\u5BFA\u9662", w: 6, h: 4, cat: "religion", enter: true, interior: "shrine", slots: { priest: 2 } },
    cemetery: { label: "\u5893\u5730", w: 8, h: 6, cat: "religion", enter: false },
    funeral: { label: "\u846C\u5100\u5834", w: 5, h: 3, cat: "public", enter: true, interior: "office", slots: { funeralstaff: 6 } },
    crematorium: { label: "\u706B\u846C\u5834", w: 5, h: 3, cat: "public", enter: true, interior: "office", slots: { funeralstaff: 5 } },
    station: { label: "\u99C5", w: 13, h: 3, cat: "transit", enter: true, interior: "station", floors: 2, slots: { railstaff: 10 }, sells: "ekiben" },
    marina: { label: "\u30DE\u30EA\u30FC\u30CA", w: 8, h: 3, cat: "work", enter: true, interior: "shop", slots: { sailor: 6, clerk: 3, racer: 3 }, sells: "daily" },
    ferry: { label: "\u89B3\u5149\u8239\u30BF\u30FC\u30DF\u30CA\u30EB", w: 6, h: 3, cat: "transit", enter: true, interior: "station", slots: { sailor: 6, railstaff: 3 } },
    park: { label: "\u516C\u5712", w: 6, h: 4, cat: "sight", enter: false },
    // 都市v2(mapVer 4)で追加した大型施設の本館。v1〜v3の地図には現れない(敷地・滑走路・観客席などの広がりは src/city2.js の sites が担当)
    airport: { label: "\u7A7A\u6E2F\u30BF\u30FC\u30DF\u30CA\u30EB", w: 56, h: 10, cat: "transit", enter: true, interior: "station", floors: 3, sells: "airport", slots: { railstaff: 20, clerk: 14, guide: 4, cleaner: 4 } },
    stadium: { label: "\u30B9\u30BF\u30B8\u30A2\u30E0", w: 40, h: 20, cat: "sight", enter: true, interior: "leisure", floors: 2, slots: { athlete: 8, coach: 4, clerk: 10, entertainer: 4 }, price: 3e3 },
    themepark: { label: "\u30C6\u30FC\u30DE\u30D1\u30FC\u30AF", w: 10, h: 5, cat: "sight", enter: true, interior: "leisure", slots: { entertainer: 16, clerk: 12, cleaner: 4 }, price: 5800 },
    zoo: { label: "\u52D5\u7269\u5712", w: 10, h: 5, cat: "sight", enter: true, interior: "leisure", slots: { zookeeper: 12, clerk: 6 }, price: 1800 }
  };
  var JOBS = {
    clerk: { name: "\u5E97\u54E1(\u30EC\u30B8\u30FB\u63A5\u5BA2)", wage: 15e4, minAge: 15, interactive: true, skill: "service" },
    stocker: { name: "\u54C1\u51FA\u3057\u30FB\u5009\u5EAB\u5185\u4F5C\u696D", wage: 145e3, minAge: 16, interactive: true, skill: "stamina" },
    cleaner: { name: "\u6E05\u6383\u54E1", wage: 14e4, minAge: 16, interactive: true, skill: "stamina" },
    cook: { name: "\u8ABF\u7406\u5E2B\u30FB\u6599\u7406\u4EBA", wage: 175e3, minAge: 16, interactive: true, skill: "cooking" },
    waitstaff: { name: "\u30DB\u30FC\u30EB\u30FB\u63A5\u5BA2", wage: 145e3, minAge: 16, interactive: true, skill: "service" },
    fisher: { name: "\u6F01\u5E2B\u30FB\u6C34\u7523", wage: 2e5, minAge: 18, interactive: true, skill: "stamina" },
    farmer: { name: "\u8FB2\u5BB6\u30FB\u8FB2\u696D", wage: 165e3, minAge: 16, interactive: true, skill: "stamina" },
    factory: { name: "\u5DE5\u5834\u4F5C\u696D\u54E1", wage: 19e4, minAge: 18, interactive: true, skill: "craft" },
    logistics: { name: "\u7269\u6D41\u30FB\u914D\u9001", wage: 19e4, minAge: 18, interactive: true, skill: "driving" },
    carpenter: { name: "\u5927\u5DE5\u30FB\u5EFA\u8A2D", wage: 215e3, minAge: 18, interactive: true, skill: "craft" },
    officeworker: { name: "\u4F1A\u793E\u54E1(\u4E8B\u52D9)", wage: 23e4, minAge: 18, interactive: true, skill: "office" },
    banker: { name: "\u9280\u884C\u54E1", wage: 27e4, minAge: 22, interactive: true, skill: "finance" },
    official: { name: "\u5E02\u5F79\u6240\u8077\u54E1", wage: 25e4, minAge: 18, interactive: true, skill: "office" },
    teacher: { name: "\u5B66\u6821\u6559\u54E1", wage: 28e4, minAge: 22, qual: "teaching", interactive: true, skill: "teaching" },
    special_teacher: { name: "\u7279\u5225\u652F\u63F4\u5B66\u6821\u6559\u54E1", wage: 285e3, minAge: 22, qual: "teaching", interactive: true, skill: "teaching" },
    professor: { name: "\u5927\u5B66\u6559\u54E1\u30FB\u7814\u7A76\u8005", wage: 33e4, minAge: 28, qual: "phd", interactive: true, skill: "research" },
    childcare: { name: "\u4FDD\u80B2\u58EB", wage: 19e4, minAge: 18, qual: "childcare", interactive: true, skill: "caring" },
    doctor: { name: "\u533B\u5E2B", wage: 65e4, minAge: 26, qual: "doctor", interactive: true, skill: "medical" },
    nurse: { name: "\u770B\u8B77\u5E2B", wage: 29e4, minAge: 20, qual: "nurse", interactive: true, skill: "medical" },
    pharmacist: { name: "\u85AC\u5264\u5E2B", wage: 35e4, minAge: 24, qual: "pharmacist", interactive: true, skill: "medical" },
    caregiver: { name: "\u4ECB\u8B77\u30FB\u798F\u7949\u652F\u63F4\u8077", wage: 2e5, minAge: 18, interactive: true, skill: "caring" },
    police: { name: "\u8B66\u5BDF\u5B98", wage: 3e5, minAge: 19, qual: "police", interactive: true, skill: "law" },
    firefighter: { name: "\u6D88\u9632\u58EB", wage: 29e4, minAge: 19, qual: "fire", interactive: true, skill: "stamina" },
    judge: { name: "\u88C1\u5224\u5B98", wage: 7e5, minAge: 28, qual: "bar", interactive: true, skill: "law" },
    lawyer: { name: "\u5F01\u8B77\u58EB", wage: 5e5, minAge: 25, qual: "bar", interactive: true, skill: "law" },
    hotelstaff: { name: "\u5BBF\u30FB\u30DB\u30C6\u30EB\u30B9\u30BF\u30C3\u30D5", wage: 17e4, minAge: 16, interactive: true, skill: "service" },
    railstaff: { name: "\u99C5\u54E1\u30FB\u9244\u9053\u8077\u54E1", wage: 26e4, minAge: 18, interactive: true, skill: "service" },
    sailor: { name: "\u8239\u54E1\u30FB\u822A\u6D77", wage: 26e4, minAge: 18, interactive: true, skill: "stamina" },
    reporter: { name: "\u8A18\u8005\u30FB\u30E1\u30C7\u30A3\u30A2", wage: 32e4, minAge: 22, interactive: true, skill: "writing" },
    announcer: { name: "\u30A2\u30CA\u30A6\u30F3\u30B5\u30FC", wage: 38e4, minAge: 22, interactive: true, skill: "speaking" },
    entertainer: { name: "\u82B8\u80FD\u30FB\u30A8\u30F3\u30BF\u30E1", wage: 2e5, minAge: 15, interactive: true, skill: "charm" },
    scientist: { name: "\u7814\u7A76\u54E1", wage: 35e4, minAge: 24, qual: "phd", interactive: true, skill: "research" },
    zookeeper: { name: "\u98FC\u80B2\u54E1", wage: 2e5, minAge: 20, interactive: true, skill: "caring" },
    priest: { name: "\u795E\u8077\u30FB\u50E7\u4FB6", wage: 22e4, minAge: 20, interactive: true, skill: "speaking" },
    funeralstaff: { name: "\u846C\u5100\u30FB\u706B\u846C\u5834\u8077\u54E1", wage: 23e4, minAge: 20, interactive: true, skill: "caring" },
    janitor: { name: "\u7BA1\u7406\u4EBA\u30FB\u8A2D\u5099", wage: 17e4, minAge: 20, interactive: true, skill: "stamina" },
    // --- 競技・文化・探検系(附録Aの sport/hobby 系を共通エンジンで遊べるようにしたもの。末尾追加=既存セーブの職業番号を保つ)
    athlete: { name: "\u30D7\u30ED\u30A2\u30B9\u30EA\u30FC\u30C8(\u5404\u7A2E\u7AF6\u6280)", wage: 24e4, minAge: 18, interactive: true, skill: "stamina" },
    coach: { name: "\u76E3\u7763\u30FB\u30B3\u30FC\u30C1", wage: 32e4, minAge: 28, interactive: true, skill: "speaking" },
    racer: { name: "\u516C\u55B6\u7AF6\u6280\u30FB\u30EC\u30FC\u30B9\u9078\u624B", wage: 28e4, minAge: 18, interactive: true, skill: "driving" },
    artist: { name: "\u4F1D\u7D71\u82B8\u80FD\u30FB\u83EF\u9053\u30FB\u4E09\u7DDA", wage: 19e4, minAge: 16, interactive: true, skill: "charm" },
    fortune: { name: "\u5360\u3044\u5E2B", wage: 18e4, minAge: 18, interactive: true, skill: "speaking" },
    guide: { name: "\u5C71\u5CB3\u30FB\u63A2\u691C\u30AC\u30A4\u30C9", wage: 23e4, minAge: 20, interactive: true, skill: "stamina" },
    astronaut: { name: "\u5B87\u5B99\u98DB\u884C\u58EB(\u8A13\u7DF4\u751F)", wage: 45e4, minAge: 28, qual: "phd", interactive: true, skill: "research" },
    hairdresser: { name: "\u7F8E\u5BB9\u5E2B\u30FB\u7406\u5BB9\u5E2B(\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8\u301C\u30B9\u30BF\u30A4\u30EA\u30B9\u30C8)", wage: 195e3, minAge: 16, lic: "beautician", interactive: true, skill: "styling" }
  };
  Object.assign(JOBS, JOBS_EXT);
  var QUALS = {
    teaching: "\u6559\u54E1\u514D\u8A31",
    childcare: "\u4FDD\u80B2\u58EB\u8CC7\u683C",
    doctor: "\u533B\u5E2B\u514D\u8A31",
    nurse: "\u770B\u8B77\u5E2B\u514D\u8A31",
    pharmacist: "\u85AC\u5264\u5E2B\u514D\u8A31",
    police: "\u8B66\u5BDF\u5B98\u63A1\u7528",
    fire: "\u6D88\u9632\u5B98\u63A1\u7528",
    bar: "\u53F8\u6CD5\u8A66\u9A13\u5408\u683C",
    phd: "\u535A\u58EB(\u307E\u305F\u306F\u76F8\u5F53\u306E\u7814\u7A76\u5B9F\u7E3E)",
    driver: "\u904B\u8EE2\u514D\u8A31",
    boki: "\u7C3F\u8A18\u691C\u5B9A",
    cooklic: "\u8ABF\u7406\u5E2B\u514D\u8A31",
    carewelfare: "\u4ECB\u8B77\u798F\u7949\u58EB",
    takken: "\u5B85\u5730\u5EFA\u7269\u53D6\u5F15\u58EB",
    hazmat: "\u5371\u967A\u7269\u53D6\u6271\u8005",
    eiken: "\u82F1\u8A9E\u691C\u5B9A(\u6E961\u7D1A)"
  };
  var capOf = (b) => b.cap ?? BTYPES[b.type].cap;
  function priceIndex(y) {
    const pts = [[1970, 0.45], [1980, 0.8], [1990, 1], [2e3, 1.12], [2010, 1.07], [2020, 1.15], [2026, 1.28]];
    if (y <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (y <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + (y1 - y0) * (y - x0) / (x1 - x0);
    }
    return 1.28 * Math.pow(1.012, y - 2026);
  }
  var WORLD_EVENTS = [
    { y: 1970, m: 3, text: "\u5927\u962A\u3067\u65E5\u672C\u4E07\u56FD\u535A\u89A7\u4F1A\u304C\u958B\u5E55\u3057\u305F", kind: "history" },
    { y: 1989, m: 4, text: "\u6D88\u8CBB\u7A0E(3%)\u304C\u5C0E\u5165\u3055\u308C\u305F", kind: "history" },
    { y: 1995, m: 1, text: "\u962A\u795E\u30FB\u6DE1\u8DEF\u5927\u9707\u707D\u304C\u767A\u751F\u3057\u305F", kind: "history" },
    { y: 1997, m: 4, text: "\u6D88\u8CBB\u7A0E\u304C5%\u306B\u306A\u3063\u305F", kind: "history" },
    { y: 2011, m: 3, text: "\u6771\u65E5\u672C\u5927\u9707\u707D\u304C\u767A\u751F\u3057\u305F", kind: "history" },
    { y: 2014, m: 4, text: "\u6D88\u8CBB\u7A0E\u304C8%\u306B\u306A\u3063\u305F", kind: "history" },
    { y: 2019, m: 5, text: "\u5143\u53F7\u304C\u4EE4\u548C\u306B\u306A\u3063\u305F", kind: "history" },
    { y: 2019, m: 10, text: "\u6D88\u8CBB\u7A0E\u304C10%\u306B\u306A\u3063\u305F", kind: "history" },
    { y: 2020, m: 3, text: "\u65B0\u578B\u30B3\u30ED\u30CA\u30A6\u30A4\u30EB\u30B9\u611F\u67D3\u75C7\u306E\u6D41\u884C\u304C\u65E5\u5E38\u3092\u5909\u3048\u305F", kind: "history" },
    { y: 2021, m: 7, text: "\u6771\u4EAC2020\u30AA\u30EA\u30F3\u30D4\u30C3\u30AF\u304C\u958B\u50AC\u3055\u308C\u305F(2021\u5E74)", kind: "history" },
    { y: 2002, m: 6, text: "\u30B5\u30C3\u30AB\u30FCW\u676F\u65E5\u97D3\u5927\u4F1A\u304C\u958B\u304B\u308C\u3001\u8857\u306E\u3042\u3061\u3053\u3061\u3067\u89B3\u6226\u4F1A\u304C\u958B\u304B\u308C\u305F", kind: "history" },
    { y: 2008, m: 9, text: "\u30EA\u30FC\u30DE\u30F3\u30FB\u30B7\u30E7\u30C3\u30AF\u3067\u4E16\u754C\u306E\u666F\u6C17\u304C\u6025\u306B\u51B7\u3048\u8FBC\u3093\u3060", kind: "history" },
    { y: 2016, m: 4, text: "\u718A\u672C\u5730\u9707\u304C\u767A\u751F\u3057\u305F", kind: "history" },
    { y: 2024, m: 1, text: "\u80FD\u767B\u534A\u5CF6\u5730\u9707\u304C\u767A\u751F\u3057\u305F", kind: "history" },
    { y: 2025, m: 4, text: "\u5927\u962A\u30FB\u95A2\u897F\u4E07\u535A\u304C\u958B\u5E55\u3057\u305F", kind: "history" },
    // ↓ 2026年より後は「架空の出来事」(実在の予言ではありません)
    { y: 2030, m: 4, text: "\u3010\u67B6\u7A7A\u3011\u9752\u6D77\u90FD\u5E02\u570F\u3067\u3001\u65B0\u3057\u3044\u99C5\u524D\u5E83\u5834\u306E\u6574\u5099\u304C\u59CB\u307E\u3063\u305F", kind: "fiction" },
    { y: 2038, m: 10, text: "\u3010\u67B6\u7A7A\u3011\u9752\u6D77\u7DDA\u306E\u8ECA\u4E21\u304C\u65B0\u578B\u306B\u7F6E\u304D\u63DB\u3048\u3089\u308C\u305F", kind: "fiction" },
    { y: 2050, m: 5, text: "\u3010\u67B6\u7A7A\u3011\u8857\u306E100\u5E74\u796D\u304C\u958B\u304B\u308C\u3001\u5927\u52E2\u306E\u4EBA\u3067\u306B\u304E\u308F\u3063\u305F", kind: "fiction" },
    { y: 2062, m: 3, text: "\u3010\u67B6\u7A7A\u3011\u6D77\u98A8\u6E2F\u306B\u65B0\u3057\u3044\u5C55\u671B\u30C7\u30C3\u30AD\u304C\u5B8C\u6210\u3057\u305F", kind: "fiction" }
  ];
  var eventKind = (y) => y <= 2026 ? "history" : "fiction";
  var CAREER_NAMES = ["\u91CE\u7403\u4EBA\u751F", "\u7AF6\u8F2A\u4EBA\u751F", "\u30B5\u30C3\u30AB\u30FC\u4EBA\u751F", "\u5973\u5B50\u30B5\u30C3\u30AB\u30FC\u4EBA\u751F", "\u7537\u5B50\u30D0\u30B9\u30B1\u4EBA\u751F", "\u5973\u5B50\u30D0\u30B9\u30B1\u4EBA\u751F", "\u76F8\u64B2\u4EBA\u751F", "\u67D4\u9053\u4EBA\u751F", "\u5353\u7403\u4EBA\u751F", "\u30D0\u30C9\u30DF\u30F3\u30C8\u30F3\u4EBA\u751F", "\u9678\u4E0A\u4EBA\u751F", "\u6C34\u6CF3\u4EBA\u751F", "\u30B9\u30AD\u30FC\u4EBA\u751F", "\u30B9\u30CE\u30FC\u30DC\u30FC\u30C9\u4EBA\u751F", "\u30D7\u30ED\u30EC\u30B9\u30E9\u30FC\u4EBA\u751F", "\u30DC\u30AF\u30B5\u30FC\u4EBA\u751F", "\u9A0E\u624B\u4EBA\u751F", "\u30DC\u30FC\u30C8\u30EC\u30FC\u30B5\u30FC\u4EBA\u751F", "\u30EC\u30FC\u30B5\u30FC\u4EBA\u751F", "\u653F\u6CBB\u5BB6\u4EBA\u751F", "\u9280\u884C\u54E1\u4EBA\u751F", "\u533B\u5E2B\u4EBA\u751F", "\u8B66\u5BDF\u5B98\u4EBA\u751F", "\u81EA\u885B\u5B98\u4EBA\u751F", "\u30A2\u30CA\u30A6\u30F3\u30B5\u30FC\u4EBA\u751F", "\u30C6\u30EC\u30D3\u30D7\u30ED\u30C7\u30E5\u30FC\u30B5\u30FC\u4EBA\u751F", "\u4FF3\u512A\u4EBA\u751F", "\u5973\u6027\u30A2\u30A4\u30C9\u30EB\u4EBA\u751F", "\u7537\u6027\u30A2\u30A4\u30C9\u30EB\u4EBA\u751F", "\u6B4C\u624B\u4EBA\u751F", "\u6F14\u6B4C\u6B4C\u624B\u4EBA\u751F", "\u30C0\u30F3\u30B5\u30FC\u4EBA\u751F", "\u82B8\u4EBA\u4EBA\u751F", "\u6F2B\u8AC7\u5BB6\u4EBA\u751F", "\u843D\u8A9E\u5BB6\u4EBA\u751F", "\u6620\u753B\u76E3\u7763\u4EBA\u751F", "\u97F3\u697D\u30D7\u30ED\u30C7\u30E5\u30FC\u30B5\u30FC\u4EBA\u751F", "\u6F2B\u753B\u5BB6\u4EBA\u751F", "\u5BFF\u53F8\u8077\u4EBA\u4EBA\u751F", "\u548C\u83D3\u5B50\u8077\u4EBA\u4EBA\u751F", "\u6D0B\u83D3\u5B50\u8077\u4EBA\u4EBA\u751F", "\u30E9\u30FC\u30E1\u30F3\u5C4B\u4EBA\u751F", "\u5B9A\u98DF\u5C4B\u4EBA\u751F", "\u30A4\u30BF\u30EA\u30A2\u30F3\u4EBA\u751F", "\u30D5\u30EC\u30F3\u30C1\u4EBA\u751F", "\u73C8\u7432\u30B7\u30E7\u30C3\u30D7\u4EBA\u751F", "\u30BD\u30E0\u30EA\u30A8\u4EBA\u751F", "\u9152\u8535\u4EBA\u751F", "\u6CE1\u76DB\u8535\u4EBA\u751F", "\u713C\u914E\u8535\u4EBA\u751F", "\u7F8E\u5BB9\u5E2B\u4EBA\u751F", "\u7406\u5BB9\u5E2B\u4EBA\u751F", "\u30E1\u30A4\u30AF\u30A2\u30C3\u30D7\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8\u4EBA\u751F", "\u5927\u5DE5\u4EBA\u751F", "\u690D\u6728\u5C4B\u4EBA\u751F", "\u9CF6\u8077\u4EBA\u751F", "\u81EA\u52D5\u8ECA\u6574\u5099\u58EB\u4EBA\u751F", "\u30D0\u30A4\u30AF\u6574\u5099\u58EB\u4EBA\u751F", "\u81EA\u8EE2\u8ECA\u6574\u5099\u58EB\u4EBA\u751F", "\u30AB\u30B9\u30BF\u30E0\u30B7\u30E7\u30C3\u30D7\u4EBA\u751F", "\u8CA9\u58F2\u5E97\u4EBA\u751F", "\u516B\u767E\u5C4B\u4EBA\u751F", "\u679C\u7269\u5C4B\u4EBA\u751F", "\u670D\u5C4B\u4EBA\u751F", "\u6C11\u5BBF\u4EBA\u751F", "\u30C6\u30FC\u30DE\u30D1\u30FC\u30AF\u7D4C\u55B6\u4EBA\u751F", "\u52D5\u7269\u5712\u7D4C\u55B6\u4EBA\u751F", "\u793E\u9577\u4EBA\u751F", "\u99AC\u4E3B\u4EBA\u751F", "\u7AF6\u8D70\u99AC\u7267\u5834\u4EBA\u751F", "\u5BB6\u755C\u7267\u5834\u4EBA\u751F", "\u30D6\u30EA\u30FC\u30C0\u30FC\u4EBA\u751F", "\u30DE\u30B0\u30ED\u6F01\u5E2B\u4EBA\u751F", "\u91E3\u308A\u4EBA\u4EBA\u751F", "\u9244\u9053\u30DE\u30CB\u30A2\u4EBA\u751F", "\u30DB\u30FC\u30E0\u30EC\u30B9\u4EBA\u751F", "\u30A2\u30A6\u30C8\u30ED\u30FC\u4EBA\u751F", "\u55A7\u5629\u756A\u9577\u4EBA\u751F", "\u4E09\u7DDA\u594F\u8005\u4EBA\u751F", "\u6C11\u8B21\u6B4C\u624B\u4EBA\u751F", "\u83EF\u9053\u4EBA\u751F", "\u30E1\u30FC\u30AB\u30FC\u958B\u767A\u8005\u4EBA\u751F", "\u30D1\u30A4\u30ED\u30C3\u30C8\u4EBA\u751F", "\u5B87\u5B99\u98DB\u884C\u58EB\u4EBA\u751F", "\u822A\u7A7A\u7BA1\u5236\u5B98\u4EBA\u751F", "\u30AD\u30E3\u30D3\u30F3\u30A2\u30C6\u30F3\u30C0\u30F3\u30C8\u4EBA\u751F", "\u6D77\u4E0A\u4FDD\u5B89\u5B98\u4EBA\u751F", "\u6D88\u9632\u58EB\u4EBA\u751F", "\u6551\u6025\u6551\u547D\u58EB\u4EBA\u751F", "\u5916\u4EA4\u5B98\u4EBA\u751F", "\u88C1\u5224\u5B98\u4EBA\u751F", "\u5F01\u8B77\u58EB\u4EBA\u751F", "\u691C\u5BDF\u5B98\u4EBA\u751F", "\u56FD\u7A0E\u5C02\u9580\u5B98\u4EBA\u751F", "\u5B66\u6821\u6559\u5E2B\u4EBA\u751F", "\u4FDD\u80B2\u58EB\u4EBA\u751F", "\u5927\u5B66\u6559\u6388\u4EBA\u751F", "\u79D1\u5B66\u8005\u4EBA\u751F", "\u7363\u533B\u5E2B\u4EBA\u751F", "\u52D5\u7269\u5712\u98FC\u80B2\u54E1\u4EBA\u751F", "\u6C34\u65CF\u9928\u98FC\u80B2\u54E1\u4EBA\u751F", "\u8ABF\u6559\u5E2B\u4EBA\u751F", "\u53A9\u52D9\u54E1\u4EBA\u751F", "\u8FB2\u5BB6\u4EBA\u751F", "\u6F01\u5E2B\u4EBA\u751F", "\u30D1\u30F3\u8077\u4EBA\u4EBA\u751F", "\u30B7\u30E7\u30B3\u30E9\u30C6\u30A3\u30A8\u4EBA\u751F", "\u4E2D\u83EF\u6599\u7406\u4EBA\u4EBA\u751F", "\u30D0\u30FC\u30C6\u30F3\u30C0\u30FC\u4EBA\u751F", "\u65C5\u9928\u4EBA\u751F", "\u30DB\u30C6\u30EB\u30DE\u30F3\u4EBA\u751F", "\u30C4\u30A2\u30FC\u30B3\u30F3\u30C0\u30AF\u30BF\u30FC\u4EBA\u751F", "\u9244\u9053\u904B\u8EE2\u58EB\u4EBA\u751F", "\u822A\u6D77\u58EB\u4EBA\u751F", "\u58F0\u512A\u4EBA\u751F", "\u5C0F\u8AAC\u5BB6\u4EBA\u751F", "\u30A2\u30CB\u30E1\u30FC\u30BF\u30FC\u4EBA\u751F", "\u30B2\u30FC\u30E0\u30AF\u30EA\u30A8\u30A4\u30BF\u30FC\u4EBA\u751F", "\u30D5\u30A1\u30C3\u30B7\u30E7\u30F3\u30C7\u30B6\u30A4\u30CA\u30FC\u4EBA\u751F", "\u5EFA\u7BC9\u5BB6\u4EBA\u751F", "\u9676\u82B8\u5BB6\u4EBA\u751F", "\u5BB6\u5177\u8077\u4EBA\u4EBA\u751F", "\u795E\u8077\u4EBA\u751F", "\u50E7\u4FB6\u4EBA\u751F", "\u5360\u3044\u5E2B\u4EBA\u751F", "\u5546\u793E\u30DE\u30F3\u4EBA\u751F", "\u91D1\u878D\u30C7\u30A3\u30FC\u30E9\u30FC\u4EBA\u751F", "\u4E0D\u52D5\u7523\u738B\u4EBA\u751F", "\u63A2\u5075\u4EBA\u751F", "\u65B0\u805E\u8A18\u8005\u4EBA\u751F", "\u5199\u771F\u5BB6\u4EBA\u751F", "YouTuber\u4EBA\u751F", "\u30B5\u30C3\u30AB\u30FC\u65E5\u672C\u4EE3\u8868\u76E3\u7763\u4EBA\u751F", "\u91CE\u7403\u65E5\u672C\u4EE3\u8868\u76E3\u7763\u4EBA\u751F", "\u30D0\u30B9\u30B1\u30C3\u30C8\u30DC\u30FC\u30EB\u65E5\u672C\u4EE3\u8868\u76E3\u7763\u4EBA\u751F", "\u30D7\u30ED\u91CE\u7403\u76E3\u7763\u4EBA\u751F", "\u30B5\u30C3\u30AB\u30FC\u30AF\u30E9\u30D6\u76E3\u7763\u4EBA\u751F", "\u9AD8\u6821\u91CE\u7403\u76E3\u7763\u4EBA\u751F", "\u9AD8\u6821\u30B5\u30C3\u30AB\u30FC\u76E3\u7763\u4EBA\u751F", "\u767B\u5C71\u5BB6\u4EBA\u751F", "\u5192\u967A\u5BB6\u4EBA\u751F", "\u5C71\u5CB3\u30AC\u30A4\u30C9\u4EBA\u751F", "\u4E8C\u4EE3\u76EE\u30E9\u30FC\u30E1\u30F3\u5C4B\u4EBA\u751F", "\u4E8C\u4EE3\u76EE\u5BFF\u53F8\u5C4B\u4EBA\u751F", "\u4E8C\u4EE3\u76EE\u65C5\u9928\u4EBA\u751F", "\u4E8C\u4EE3\u76EE\u9152\u8535\u4EBA\u751F", "\u4E8C\u4EE3\u76EE\u753A\u5DE5\u5834\u4EBA\u751F", "\u4E8C\u4EE3\u76EE\u8FB2\u5BB6\u4EBA\u751F", "\u4E8C\u4EE3\u76EE\u5546\u5E97\u4EBA\u751F", "\u4E8C\u4EE3\u76EE\u5EFA\u8A2D\u4F1A\u793E\u4EBA\u751F", "\u4E09\u4EE3\u76EE\u8001\u8217\u65C5\u9928\u4EBA\u751F", "\u4E09\u4EE3\u76EE\u5BFF\u53F8\u5C4B\u4EBA\u751F", "\u4E09\u4EE3\u76EE\u9152\u8535\u4EBA\u751F", "\u4E09\u4EE3\u76EE\u548C\u83D3\u5B50\u5C4B\u4EBA\u751F", "\u4E09\u4EE3\u76EE\u753A\u5DE5\u5834\u4EBA\u751F", "\u4E09\u4EE3\u76EE\u8FB2\u5BB6\u4EBA\u751F", "\u4E09\u4EE3\u76EE\u4F1A\u793E\u793E\u9577\u4EBA\u751F", "\u56DB\u4EE3\u76EE\u8001\u8217\u4EBA\u751F", "\u5E02\u753A\u6751\u9577\u4EBA\u751F", "\u5E02\u5F79\u6240\u8077\u54E1\u4EBA\u751F", "\u5730\u65B9\u516C\u52D9\u54E1\u30FB\u5185\u90E8\u544A\u767A\u4EBA\u751F", "\u4F1A\u793E\u54E1\u30FB\u5185\u90E8\u544A\u767A\u4EBA\u751F", "\u89E3\u96C7\u304B\u3089\u306E\u9006\u8EE2\u4EBA\u751F", "\u5730\u57DF\u65B0\u805E\u8A18\u8005\u4EBA\u751F", "\u5730\u57DF\u518D\u751F\u30D7\u30ED\u30C7\u30E5\u30FC\u30B5\u30FC\u4EBA\u751F", "\u3082\u3057\u5742\u672C\u9F8D\u99AC\u304C\u6697\u6BBA\u3092\u56DE\u907F\u3057\u3066\u3044\u305F\u3089", "\u3082\u3057\u7E54\u7530\u4FE1\u9577\u304C\u672C\u80FD\u5BFA\u3092\u751F\u304D\u5EF6\u3073\u305F\u3089", "\u3082\u3057\u95A2\u30F6\u539F\u306E\u52DD\u6557\u304C\u9006\u3060\u3063\u305F\u3089", "\u3082\u3057\u897F\u90F7\u9686\u76DB\u304C\u897F\u5357\u6226\u4E89\u3092\u56DE\u907F\u3057\u3066\u3044\u305F\u3089", "\u3082\u3057\u592A\u5E73\u6D0B\u6226\u4E89\u306E\u91CD\u8981\u5206\u5C90\u304C\u9055\u3063\u3066\u3044\u305F\u3089", "\u6B74\u53F2IF\u7269\u8A9E\u30E1\u30FC\u30AB\u30FC", "\u6C96\u7E04\u3072\u3068\u308A\u65C5\u7269\u8A9E", "\u6C96\u7E04\u5CF6\u3081\u3050\u308A\u7269\u8A9E", "\u6C96\u7E04\u79FB\u4F4F\u304A\u8A66\u3057\u4EBA\u751F", "\u65E5\u672C\u5168\u56FD\u3072\u3068\u308A\u65C5\u7269\u8A9E", "\u30A4\u30BF\u30EA\u30A2\u65C5\u7269\u8A9E"];
  var SPORT = /野球人生|競輪|サッカー人生|バスケ人生|相撲|柔道|卓球|バドミントン|陸上|水泳|スキー人生|スノーボード|プロレス|ボクサー|騎手|ボートレーサー|レーサー人生|監督人生/;
  var HOBBY = /釣り人|鉄道マニア|登山家|冒険家|華道|三線|民謡|占い師/;
  var LIFESTYLE = /ホームレス|アウトロー|喧嘩番長|解雇からの逆転/;
  var HISTORY = /^もし|歴史IF/;
  var TRAVEL = /ひとり旅|島めぐり|お試し人生|旅物語/;
  var SUCC = /^(二代目|三代目|四代目)/;
  var JOBMAP = [
    [/銀行員|金融ディーラー/, "banker"],
    [/医師/, "doctor"],
    [/獣医/, "doctor"],
    [/警察官|海上保安/, "police"],
    [/消防士|救急救命/, "firefighter"],
    [/アナウンサー/, "announcer"],
    [/新聞記者|地域新聞/, "reporter"],
    [/テレビプロデューサー|映画監督/, "reporter"],
    [/俳優|アイドル|歌手|ダンサー|芸人|漫談|落語|声優|音楽プロデューサー|YouTuber|民謡/, "entertainer"],
    [/寿司|和菓子|洋菓子|ラーメン|定食|イタリアン|フレンチ|珈琲|中華|パン職人|ショコラ|バーテンダー|ソムリエ/, "cook"],
    [/大工|鳶|建築家|建設/, "carpenter"],
    [/植木屋|家具|陶芸|自動車整備|バイク整備|自転車整備|カスタム|メーカー開発|町工場|酒蔵|泡盛|焼酎/, "factory"],
    [/販売店|八百屋|果物屋|服屋|商店/, "clerk"],
    [/民宿|旅館|ホテルマン|テーマパーク|ツアーコンダクター/, "hotelstaff"],
    [/農家|畜産|家畜|牧場|ブリーダー/, "farmer"],
    [/漁師|マグロ/, "fisher"],
    [/鉄道運転士/, "railstaff"],
    [/航海士|パイロット|航空管制|キャビンアテンダント/, "sailor"],
    [/裁判官/, "judge"],
    [/弁護士|検察官|国税/, "lawyer"],
    [/教師|学校/, "teacher"],
    [/保育士/, "childcare"],
    [/大学教授|科学者/, "professor"],
    [/飼育員|動物園/, "zookeeper"],
    [/神職|僧侶/, "priest"],
    [/市役所|市町村長|地方公務員|外交官/, "official"],
    [/社長|商社|不動産|会社員/, "officeworker"],
    [/漫画家|小説家|アニメーター|ゲームクリエイター|ファッション|写真家|メイク|美容師|理容師|探偵|地域再生/, "officeworker"],
    [/監督/, "coach"],
    [/競輪|ボートレーサー|騎手|レーサー/, "racer"],
    [/野球人生|サッカー人生|バスケ人生|相撲|柔道|卓球|バドミントン|陸上|水泳|スキー人生|スノーボード|プロレス|ボクサー/, "athlete"],
    [/三線|華道/, "artist"],
    [/占い師/, "fortune"],
    [/登山家|冒険家|山岳ガイド/, "guide"],
    [/宇宙飛行士/, "astronaut"],
    [/釣り人/, "fisher"],
    [/鉄道マニア/, "railstaff"],
    [/自衛官/, "police"],
    [/政治家/, "official"],
    [/馬主|競走馬|調教|厩務/, "farmer"]
  ];
  function classifyCareer(name, idx) {
    let kind = "job";
    if (HISTORY.test(name)) kind = "history_if";
    else if (TRAVEL.test(name)) kind = "travel";
    else if (LIFESTYLE.test(name)) kind = "lifestyle";
    else if (SUCC.test(name)) kind = "succession";
    else if (SPORT.test(name)) kind = "sport";
    else if (HOBBY.test(name)) kind = "hobby";
    let engineJob = null;
    if (kind === "job" || kind === "succession" || kind === "sport" || kind === "hobby") {
      for (const [re, j] of JOBMAP) if (re.test(name)) {
        engineJob = j;
        break;
      }
    }
    let status = "registered";
    if (engineJob) status = JOBS[engineJob].interactive ? "interactive" : "engine";
    const SCN = [[/解雇からの逆転/, "layoff"], [/ホームレス/, "homeless"], [/四代目老舗/, "heritage"], [/喧嘩番長/, "banchou"], [/アウトロー/, "outlaw"]];
    const scenario = (SCN.find(([re]) => re.test(name)) || [])[1] || null;
    if (scenario) status = "interactive";
    return { no: idx + 1, name, kind, engineJob, scenario, status };
  }
  var CAREERS = CAREER_NAMES.map((n2, i) => classifyCareer(n2, i));
  var SURNAMES = ["\u9752\u5C71", "\u77F3\u7530", "\u4E95\u4E0A", "\u4ECA\u4E95", "\u4E0A\u7530", "\u5185\u7530", "\u9060\u85E4", "\u5927\u585A", "\u5CA1\u7530", "\u5C0F\u5DDD", "\u52A0\u85E4", "\u6CB3\u91CE", "\u6728\u6751", "\u4E45\u4FDD", "\u5C0F\u5CF6", "\u8FD1\u85E4", "\u658E\u85E4", "\u9152\u4E95", "\u4F50\u3005\u6728", "\u5CF6\u7530", "\u6749\u5C71", "\u95A2", "\u9AD8\u6A4B", "\u7530\u4E2D", "\u5343\u8449", "\u8FBB", "\u5BFA\u7530", "\u4E2D\u5CF6", "\u897F\u6751", "\u91CE\u53E3", "\u6A4B\u672C", "\u6797", "\u85E4\u4E95", "\u524D\u7530", "\u677E\u672C", "\u4E09\u6D66", "\u6751\u7530", "\u68EE", "\u5B89\u7530", "\u5C71\u53E3", "\u6A2A\u5C71", "\u5409\u7530", "\u6E21\u8FBA", "\u9577\u8C37\u5DDD", "\u6F6E\u898B", "\u685C\u4E95", "\u7DD1\u5DDD", "\u6E2F", "\u6D77\u91CE", "\u6708\u5CA1"];
  var GIVEN = ["\u3042\u304A\u3044", "\u3042\u304D\u3089", "\u3042\u3086\u307F", "\u3044\u305A\u307F", "\u304B\u304A\u308B", "\u304B\u305A\u304D", "\u3051\u3093\u305F", "\u3053\u3046\u305F", "\u3055\u304F\u3089", "\u3057\u3087\u3046\u305F", "\u3059\u305A", "\u305D\u3089", "\u305F\u304F\u307F", "\u3064\u3070\u3055", "\u306A\u3064\u307F", "\u306E\u305E\u307F", "\u306F\u308B\u3068", "\u3072\u304B\u308A", "\u3072\u306A\u305F", "\u3075\u307F", "\u307E\u3053\u3068", "\u307F\u3055\u304D", "\u307F\u306A\u3068", "\u3080\u304E", "\u3082\u3082", "\u3086\u3044", "\u3086\u3046\u304D", "\u3088\u3046\u3053", "\u3088\u3057\u306E", "\u308A\u304F", "\u308A\u3087\u3046", "\u308C\u3093", "\u308F\u304B\u306A", "\u305F\u3051\u3057", "\u3072\u308D\u3057", "\u307E\u3055\u304A", "\u307F\u3061\u3053", "\u3051\u3044\u3053", "\u3068\u3057\u304A", "\u306F\u306A\u3053", "\u3057\u3093\u3058", "\u3048\u307F", "\u3055\u3068\u3057", "\u306A\u304A\u307F", "\u3058\u3085\u3093", "\u3086\u3046\u3053", "\u304B\u3093\u306A", "\u3044\u3064\u304D", "\u3053\u306F\u308B", "\u3060\u3044\u304D"];
  var SHOP_PREFIX = ["\u3072\u3060\u307E\u308A", "\u307E\u308B\u3044", "\u3055\u304F\u3089", "\u3042\u304A\u305E\u3089", "\u307F\u3069\u308A", "\u306A\u304E\u3055", "\u306F\u308B\u304B", "\u3053\u3082\u308C\u3073", "\u3064\u3070\u304D", "\u3044\u308D\u306F", "\u307B\u3057\u305E\u3089", "\u304F\u3058\u3089", "\u3084\u307E\u3073\u3053", "\u3042\u3055\u3072", "\u3053\u3068\u308A", "\u3075\u305F\u3070", "\u304A\u304A\u305E\u3089", "\u306B\u3058\u3044\u308D", "\u305F\u3044\u3088\u3046", "\u304B\u3082\u3081"];
  var APT_NAMES = ["\u30E1\u30BE\u30F3", "\u30B3\u30FC\u30DD", "\u30CF\u30A4\u30C4", "\u30D1\u30EC\u30B9", "\u30EC\u30B8\u30C7\u30F3\u30B9", "\u30F4\u30A3\u30E9"];
  var APT_FLOWER = ["\u685C\u53F0", "\u6A58", "\u83D6\u84B2", "\u693F", "\u6854\u6897", "\u7D2B\u967D\u82B1", "\u85E4", "\u6885\u30F6\u4E18", "\u5C71\u5439", "\u64AB\u5B50"];
  var SIZE_V1 = { stadium: [16, 7], airport: [16, 5], station: [7, 3], hospital: [8, 4], univ: [10, 5], dept: [8, 5], mall: [9, 5], super: [7, 4] };
  var SIZE_V2 = { stadium: [40, 20], airport: [56, 10], station: [13, 3], hospital: [20, 8], univ: [24, 8], dept: [18, 9], mall: [28, 10], super: [12, 6] };
  function applySizes(ver) {
    const T4 = (ver || 1) >= 4 ? SIZE_V2 : SIZE_V1;
    for (const k in T4) if (BTYPES[k]) {
      BTYPES[k].w = T4[k][0];
      BTYPES[k].h = T4[k][1];
    }
    if (BTYPES.airport) BTYPES.airport.floors = (ver || 1) >= 4 ? 3 : 2;
    if (BTYPES.hospital) BTYPES.hospital.floors = (ver || 1) >= 4 ? 4 : 2;
  }

