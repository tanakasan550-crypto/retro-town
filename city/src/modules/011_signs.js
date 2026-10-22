  // src/signs.js
  var SIGN_FONT = '"Hiragino Sans","Yu Gothic","Noto Sans CJK JP","Noto Sans JP","Meiryo","sans-serif"';
  var BRANDS = [["#1faa59", "#ffffff", "#f6c744"], ["#f08a24", "#ffffff", "#1e5aa8"], ["#2b6fc8", "#ffffff", "#ffd24a"], ["#c8352f", "#ffffff", "#ffe27a"], ["#6a3fa0", "#ffffff", "#ffd0ef"]];
  var USES = ["\u30AF\u30EA\u30CB\u30C3\u30AF", "\u6B6F\u79D1", "\u5B66\u7FD2\u587E", "\u7F8E\u5BB9\u5BA4", "\u53F8\u6CD5\u66F8\u58EB\u4E8B\u52D9\u6240", "\u5C45\u9152\u5C4B", "\u30AB\u30E9\u30AA\u30B1", "\u30A8\u30B9\u30C6", "\u30C0\u30F3\u30B9\u30B9\u30BF\u30B8\u30AA", "\u4E0D\u52D5\u7523", "\u6574\u9AA8\u9662", "\u30CD\u30A4\u30EB\u30B5\u30ED\u30F3", "\u9EBB\u96C0", "\u30B9\u30CA\u30C3\u30AF", "\u30E8\u30AC\u6559\u5BA4", "\u884C\u653F\u66F8\u58EB", "\u4FDD\u967A\u76F8\u8AC7", "\u5199\u771F\u9928"];
  var PFX = ["\u3055\u304F\u3089", "\u307F\u306A\u3068", "\u3072\u304B\u308A", "\u9752\u6D77", "\u6F6E\u98A8", "\u3042\u304B\u308A", "\u767D\u9CE5", "\u304B\u3082\u3081", "\u3053\u3068\u308A", "\u306F\u307E\u304B\u305C", "\u5927\u548C", "\u5343\u9CE5", "\u306A\u304E\u3055", "\u3042\u3059\u304B", "\u6804"];
  function upperTenants(b, sp) {
    const out = [];
    if (sp.nf < 2) return out;
    if (sp.ten.length && (sp.kind === "mall" || sp.kind === "dept" || sp.kind === "hotel")) {
      for (const t of sp.ten.slice(0, 8)) out.push({ f: Math.max(2, t.f), name: t.name, open: t.open });
      return out;
    }
    const kinds = ["shop", "eat", "office", "clinic", "conv", "cram", "game"];
    if (!kinds.includes(sp.kind) && !["shop", "eat", "office", "clinic"].includes(sp.kind)) return out;
    const n2 = Math.min(sp.nf - 1, 4);
    for (let i = 0; i < n2; i++) {
      const h = HB(b.idx, 40 + i);
      out.push({ f: i + 2, name: PFX[(h >>> 3) % PFX.length] + USES[(h >>> 9) % USES.length], open: true });
    }
    return out;
  }
  function signPlan(b, sp, year) {
    const style = year < 1992 ? "paint" : year < 2012 ? "box" : "led";
    const h = HB(b.idx, 3), h22 = HB(b.idx, 5);
    const k = sp.kind;
    const T4 = b.type;
    const items = [];
    const closed = sp.closed;
    const brand = BRANDS[h % BRANDS.length];
    const name = b.name;
    const add = (kk, o = {}) => items.push({ k: kk, text: name, bg: brand[0], fg: brand[1], acc: brand[2], ...o });
    const uppers = upperTenants(b, sp);
    const res = k === "res";
    if (res) {
      if (T4 === "villa" || T4 === "house" || T4 === "farmhouse") return { style, items: [{ k: "plate", text: b.name === "\u4F4F\u5B85" || b.name === "\u8FB2\u5BB6" || b.name === "\u5225\u8358" ? "" : b.name }], uppers, brand };
    }
    if (closed) {
      items.push({ k: "forrent", text: "\u8CB8\u5E97\u8217", bg: "#f4f1e6", fg: "#c0392b" });
      return { style, items, uppers: [], brand, closed: true };
    }
    if (k === "apt") {
      add("plate", { bg: "#f0efe8", fg: "#33424f", small: true });
      return { style, items, uppers, brand };
    }
    if (k === "conv") {
      add("wall", { band: true });
      if (year >= 1978) add("stand", { pole: true, text: year >= 1990 ? "24h" : "\u55B6\u696D", bg: brand[0], fg: "#fff" });
      add("glass", { text: ["\u304A\u5F01\u5F53", "\u304A\u3067\u3093", "ATM", "\u5B85\u914D\u4FBF"][h22 % 4] });
    } else if (k === "super") {
      add("roof", { text: name });
      add("wall", { band: true });
      if (sp.nf > 1) add("banner", { text: "\u672C\u65E5\u7279\u58F2", bg: "#e02e2e", fg: "#fff" });
      add("stand", { board: true, text: "\u672C\u65E5\u306E\u7279\u58F2", bg: "#fffbe6", fg: "#d02020" });
    } else if (k === "mall" || k === "dept") {
      add("roof", { text: name });
      add("wall", { band: true });
      add("tenant", {});
      add("banner", { text: k === "dept" ? "\u5927\u611F\u8B1D\u796D" : "SALE", bg: "#d83a3a", fg: "#fff" });
    } else if (k === "eat") {
      const izaka = T4 === "izakaya", ramen = T4 === "ramen", cafe = T4 === "cafe", sea = T4 === "seafood", beach = T4 === "beachhouse";
      if (izaka) {
        add("door", { text: name, bg: "#2a1c1c", fg: "#ffe9a6" });
        add("noren", { bg: "#232a4a", fg: "#fff" });
        add("proj", { lantern: true, text: name.slice(0, 3), bg: "#d6301f", fg: "#fff3c9" });
        if (sp.nf > 1) add("vert", { text: name, bg: "#1d1d22", fg: "#ff7ab8", neon: true });
      } else if (ramen) {
        add("wall", { band: true });
        add("noren", { bg: "#c33a2e", fg: "#fff" });
        add("vert", { text: "\u3089\u30FC\u3081\u3093", bg: "#d6301f", fg: "#fff3c9" });
      } else if (cafe) {
        add("wood", { text: name });
        add("stand", { board: true, text: "\u672C\u65E5\u306E\u30B3\u30FC\u30D2\u30FC", bg: "#2a3a2e", fg: "#f4ead2" });
        add("glass", { text: name });
      } else if (sea || beach) {
        add("wood", { text: name });
        add("noren", { bg: "#1f4a7a", fg: "#fff" });
      } else {
        add(h22 % 2 ? "wall" : "wood", { band: true, text: name });
        if (year < 2e3 || h22 % 3 === 0) add("noren", { bg: "#1f3a5a", fg: "#fff" });
        add("stand", { board: true, text: "\u30E9\u30F3\u30C1\u55B6\u696D\u4E2D", bg: "#fffbe6", fg: "#b03a2a" });
      }
    } else if (k === "clinic" || T4 === "pharmacy") {
      add("wall", { band: true, bg: "#f2f6f8", fg: "#1b6aa5" });
      add("proj", { cross: true, text: T4 === "pharmacy" ? "\u85AC" : "\uFF0B", bg: "#2fa05a", fg: "#fff" });
      if (T4 === "pharmacy") add("glass", { text: "\u51E6\u65B9\u7B8B" });
    } else if (k === "shop") {
      add("wall", { band: true });
      if (h22 % 3) add("proj", { text: name.slice(0, 4), bg: brand[0], fg: "#fff" });
      if (uppers.length) add("sleeve", {});
      if (T4 === "bookstore") add("glass", { text: "\u672C\u30FB\u96D1\u8A8C" });
      if (T4 === "clothes") add("glass", { text: "SALE" });
      if (year < 1992 && h22 % 2) add("wood", { text: name });
    } else if (k === "bank") {
      add("wall", { letters: true, bg: "#2a3f66", fg: "#f0e4b8" });
      add("stand", { pole: true, text: "ATM", bg: "#2a3f66", fg: "#fff" });
    } else if (k === "hotel") {
      add("roof", { text: name });
      add("door", { text: name, bg: "#1f2a3f", fg: "#e8d9a8" });
      add("tenant", {});
    } else if (k === "ryokan") {
      add("wood", { text: name });
      add("noren", { bg: "#3a2a4a", fg: "#fff" });
      add("stand", { lantern: true, text: "", bg: "#d6301f", fg: "#fff" });
    } else if (k === "game" || k === "cinema") {
      add("roof", { text: name });
      add("wall", { band: true, bg: "#241c3a", fg: "#ff9ad8", neon: true });
      add("vert", { text: name, bg: "#161226", fg: "#6af0ff", neon: true });
    } else if (k === "hall" || k === "gas" || k === "pier") {
      add("wall", { band: true, big: true });
      if (k === "gas") add("stand", { pole: true, text: "GS", bg: "#c33a2e", fg: "#fff" });
    } else if (k === "airport") {
      add("roof", { text: name });
      add("stand", { board: true, text: "\u51FA\u767A\u30ED\u30D3\u30FC", bg: "#1f4f93", fg: "#fff" });
    } else if (k === "station") {
      add("wall", { letters: true, bg: "#2f6aa8", fg: "#fff" });
      add("stand", { board: true, text: "1\u756A\u306E\u308A\u3070", bg: "#2f6aa8", fg: "#fff" });
    } else if (k === "tourtower") {
      add("door", { text: name, bg: "#c33a2e", fg: "#fff" });
    } else if (["civic", "school", "hosp", "care", "kinder", "office"].includes(k)) {
      add("wall", { letters: true, bg: "#f4f2ea", fg: "#273a52" });
      add("stand", { pillar: true, text: name, bg: "#f4f2ea", fg: "#273a52" });
      if (k === "office" && uppers.length) add("tenant", {});
    } else if (k === "shrine" || k === "temple") {
      add("wood", { text: name });
    } else add("wall", { band: true });
    return { style, items, uppers, brand };
  }

