  // src/setupui.js
  var HAIR_OPTS = [
    { key: "", n: "\u304A\u307E\u304B\u305B", d: "\u5E74\u9F62\u30FB\u6642\u4EE3\u306B\u5408\u308F\u305B\u3066\u81EA\u52D5\u3067\u5909\u308F\u308B", fem: "a" },
    { key: "short", n: "\u77ED\u9AEA", d: "\u3055\u3063\u3071\u308A\u3057\u305F\u77ED\u3044\u9AEA", fem: "m" },
    { key: "spiky", n: "\u5916\u306F\u306D", d: "\u5143\u6C17\u306A\u5916\u306F\u306D", fem: "m" },
    { key: "swept", n: "\u6D41\u3057\u524D\u9AEA", d: "\u524D\u9AEA\u3092\u6A2A\u306B\u6D41\u3059", fem: "m" },
    { key: "side", n: "\u6A2A\u5206\u3051", d: "\u304D\u3061\u3093\u3068\u3057\u305F\u6A2A\u5206\u3051", fem: "m" },
    { key: "fringe", n: "\u524D\u9AEA\u3042\u308A", d: "\u524D\u9AEA\u304C\u76EE\u306B\u304B\u304B\u308B", fem: "a" },
    { key: "curly", n: "\u3075\u3093\u308F\u308A", d: "\u304F\u305B\u6BDB\u306E\u3075\u3093\u308F\u308A\u9AEA", fem: "a" },
    { key: "bowl", n: "\u30DE\u30C3\u30B7\u30E5", d: "\u307E\u308B\u3044\u304A\u304B\u3063\u3071", fem: "a" },
    { key: "bob", n: "\u30DC\u30D6", d: "\u3042\u3054\u306E\u30E9\u30A4\u30F3\u306E\u30DC\u30D6", fem: "f" },
    { key: "pixie", n: "\u30B7\u30E7\u30FC\u30C8", d: "\u8EFD\u3044\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8", fem: "f" },
    { key: "twin", n: "\u3075\u305F\u3064\u7D50\u3073", d: "\u5DE6\u53F3\u3067\u7D50\u3093\u3060\u9AEA", fem: "f" },
    { key: "ponytail", n: "\u30DD\u30CB\u30FC\u30C6\u30FC\u30EB", d: "\u9AD8\u3081\u306B\u7D50\u3093\u3060\u9AEA", fem: "f" },
    { key: "long", n: "\u30ED\u30F3\u30B0", d: "\u80A9\u3088\u308A\u9577\u3044\u9AEA", fem: "f" },
    { key: "bun", n: "\u304A\u3060\u3093\u3054", d: "\u982D\u306E\u4E0A\u3067\u7D50\u3093\u3060\u9AEA(10\u4EE3\u5F8C\u534A\u301C)", fem: "f" }
  ];
  var hairFits = (o, look) => o.fem === "a" || o.fem === "f" === (look === "f");
  var LOOK_TYPES = [
    { k: "m", n: "\u7537\u6027\u3089\u3057\u3044\u898B\u305F\u76EE", d: "\u9854\u3064\u304D\u30FB\u4F53\u3064\u304D\u30FB\u5236\u670D\u304C\u7537\u6027\u5BC4\u308A", hs: 0 },
    { k: "f", n: "\u5973\u6027\u3089\u3057\u3044\u898B\u305F\u76EE", d: "\u9854\u3064\u304D\u30FB\u4F53\u3064\u304D\u30FB\u5236\u670D\u304C\u5973\u6027\u5BC4\u308A", hs: 1 },
    { k: "a", n: "\u898B\u305F\u76EE\u306F\u304A\u307E\u304B\u305B", d: "\u8857\u306E\u30B7\u30FC\u30C9\u3067\u81EA\u52D5\u6C7A\u5B9A(\u9AEA\u578B\u306F\u81EA\u7531)", hs: -1 }
  ];
  var CALL_TYPES = [
    { k: "m", n: "\u7537\u6027\u3068\u3057\u3066", d: "\u5468\u308A\u306F\u300C\u304F\u3093\u300D\u300C\u5F7C\u300D\u306A\u3069\u3067\u547C\u3076\u3053\u3068\u304C\u591A\u3044" },
    { k: "f", n: "\u5973\u6027\u3068\u3057\u3066", d: "\u5468\u308A\u306F\u300C\u3061\u3083\u3093\u300D\u300C\u5F7C\u5973\u300D\u306A\u3069\u3067\u547C\u3076\u3053\u3068\u304C\u591A\u3044" },
    { k: "u", n: "\u672A\u8A2D\u5B9A\u30FB\u4E2D\u7ACB", d: "\u300C\u3055\u3093\u300D\u300C\u305D\u306E\u4EBA\u300D\u306A\u3069\u6027\u5225\u3092\u524D\u63D0\u306B\u3057\u306A\u3044\u547C\u3073\u65B9(\u3042\u3068\u304B\u3089\u5909\u66F4\u53EF)" }
  ];
  var hsOf = (type, seed) => type === "m" ? 0 : type === "f" ? 1 : (seed >>> 0) % 2 ? 1 : 0;
  var lookOf = (form) => (hsOf(form.lt, parseInt(form.seed, 10) || 20261020) | form.hc << 3 | form.sk << 6 | form.c1 << 8 | form.c2 << 12) >>> 0;
  var HD = (form) => form.hair ? { key: form.hair, m: 0, noGrow: true } : null;
  function previewInto(canvas, form, age, dir = "d", scale = 3, head = false) {
    const look = lookOf(form);
    let ok = false;
    try {
      const { A: A2, col } = lifeDescribe({ id: 7, look, age, hd: age >= 3 ? HD(form) : null, wardrobe: 0 });
      const cell2 = composeCell(A2, col, dir, 0, false);
      if (!cell2) return false;
      const ctx4 = canvas.getContext("2d");
      ctx4.clearRect(0, 0, canvas.width, canvas.height);
      ctx4.imageSmoothingEnabled = false;
      if (head) {
        ctx4.drawImage(cell2, 0, 0, 64, 56, 0, 0, canvas.width, canvas.height);
        return true;
      }
      ctx4.fillStyle = "rgba(0,0,0,.18)";
      ctx4.beginPath();
      ctx4.ellipse(canvas.width / 2, canvas.height - 6 * scale / 3, 14 * scale / 3 * 1.5, 4 * scale / 3, 0, 0, 7);
      ctx4.fill();
      const w = 64 * scale, h = 96 * scale;
      ctx4.drawImage(cell2, (canvas.width - w) / 2, canvas.height - h, w, h);
      ok = true;
    } catch (e) {
      ok = false;
    }
    return ok;
  }

