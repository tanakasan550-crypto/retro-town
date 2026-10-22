  // src/i18n.js
  var LANGS = { ja: "\u65E5\u672C\u8A9E", en: "English", zh: "\u4E2D\u6587", ko: "\uD55C\uAD6D\uC5B4", fr: "Fran\xE7ais", es: "Espa\xF1ol", pt: "Portugu\xEAs", id: "Bahasa Indonesia", hi: "\u0939\u093F\u0928\u094D\u0926\u0940", vi: "Ti\u1EBFng Vi\u1EC7t" };
  var D2 = (ja, en, o = {}) => [ja, { en, ...o }];
  var DICT = [
    D2("\u5730\u56F3", "Map", { zh: "\u5730\u56FE", ko: "\uC9C0\uB3C4", fr: "Carte", es: "Mapa", pt: "Mapa", id: "Peta", hi: "\u0928\u0915\u094D\u0936\u093E", vi: "B\u1EA3n \u0111\u1ED3" }),
    D2("\u4E88\u5B9A", "Plans", { zh: "\u8BA1\u5212", ko: "\uC77C\uC815", fr: "Agenda", es: "Agenda", pt: "Agenda", id: "Jadwal", hi: "\u092F\u094B\u091C\u0928\u093E", vi: "L\u1ECBch" }),
    D2("\u4EBA\u7269", "People", { zh: "\u4EBA\u7269", ko: "\uC778\uBB3C", fr: "Gens", es: "Gente", pt: "Pessoas", id: "Orang", hi: "\u0932\u094B\u0917", vi: "Ng\u01B0\u1EDDi" }),
    D2("\u6301\u7269", "Items", { zh: "\u7269\u54C1", ko: "\uC18C\uC9C0\uD488", fr: "Objets", es: "Objetos", pt: "Itens", id: "Barang", hi: "\u0938\u093E\u092E\u093E\u0928", vi: "\u0110\u1ED3" }),
    D2("\u65E5\u8A18", "Diary", { zh: "\u65E5\u8BB0", ko: "\uC77C\uAE30", fr: "Journal", es: "Diario", pt: "Di\xE1rio", id: "Diari", hi: "\u0921\u093E\u092F\u0930\u0940", vi: "Nh\u1EADt k\xFD" }),
    D2("\u6642\u9593", "Time", { zh: "\u65F6\u95F4", ko: "\uC2DC\uAC04", fr: "Temps", es: "Tiempo", pt: "Tempo", id: "Waktu", hi: "\u0938\u092E\u092F", vi: "Th\u1EDDi gian" }),
    D2("\u8D70\u308B", "Run", { zh: "\u8DD1", ko: "\uB2EC\uB9AC\uAE30", fr: "Courir", es: "Correr", pt: "Correr", id: "Lari", hi: "\u0926\u094C\u0921\u093C\u0947\u0902", vi: "Ch\u1EA1y" }),
    D2("\u306F\u3058\u3081\u304B\u3089", "New Game", { zh: "\u91CD\u65B0\u5F00\u59CB", ko: "\uCC98\uC74C\uBD80\uD130", fr: "Nouvelle partie", es: "Nueva partida", pt: "Novo jogo", id: "Mulai baru", hi: "\u0928\u092F\u093E \u0916\u0947\u0932", vi: "Ch\u01A1i m\u1EDBi" }),
    D2("\u3064\u3065\u304D\u304B\u3089", "Continue", { zh: "\u7EE7\u7EED", ko: "\uC774\uC5B4\uD558\uAE30", fr: "Continuer", es: "Continuar", pt: "Continuar", id: "Lanjutkan", hi: "\u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902", vi: "Ti\u1EBFp t\u1EE5c" }),
    D2("\u30D5\u30A1\u30A4\u30EB\u304B\u3089\u8AAD\u307F\u8FBC\u3080", "Load from file", { zh: "\u4ECE\u6587\u4EF6\u8BFB\u53D6", ko: "\uD30C\uC77C\uC5D0\uC11C \uBD88\uB7EC\uC624\uAE30" }),
    D2("\u8A2D\u5B9A\u30FB\u30BB\u30FC\u30D6", "Settings / Save", { zh: "\u8BBE\u7F6E\u30FB\u5B58\u6863", ko: "\uC124\uC815\u30FB\uC800\uC7A5" }),
    D2("\u9589\u3058\u308B", "Close", { zh: "\u5173\u95ED", ko: "\uB2EB\uAE30", fr: "Fermer", es: "Cerrar", pt: "Fechar", id: "Tutup", hi: "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902", vi: "\u0110\xF3ng" }),
    D2("OK", "OK"),
    D2("\u306F\u3044", "Yes", { zh: "\u662F", ko: "\uC608" }),
    D2("\u3044\u3044\u3048", "No", { zh: "\u5426", ko: "\uC544\uB2C8\uC624" }),
    D2("\u30B9\u30ED\u30C3\u30C81\u306B\u4FDD\u5B58", "Save to slot 1"),
    D2("\u30B9\u30ED\u30C3\u30C82\u306B\u4FDD\u5B58", "Save to slot 2"),
    D2("\u30D5\u30A1\u30A4\u30EB\u306B\u66F8\u304D\u51FA\u3059(.json)", "Export to file (.json)"),
    D2("\u4FDD\u5B58\u30C7\u30FC\u30BF\u3092\u958B\u304F", "Open saved data"),
    D2("\u4FDD\u5B58\u3057\u307E\u3057\u305F", "Saved"),
    D2("\u4FDD\u5B58\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093", "No saved data"),
    D2("\u540D\u524D", "Name", { zh: "\u540D\u5B57", ko: "\uC774\uB984" }),
    D2("\u306F\u3060\u8272", "Skin tone"),
    D2("\u3075\u304F", "Clothes"),
    D2("\u306F\u3058\u307E\u308A", "Start as"),
    D2("\u8857\u306E\u30B7\u30FC\u30C9", "Town seed"),
    D2("\u914D\u616E(\u4EFB\u610F)", "Accessibility (optional)"),
    D2("\u306A\u3057", "None"),
    D2("\u8ECA\u3044\u3059\u3067\u66AE\u3089\u3059", "Lives with a wheelchair"),
    D2("\u767D\u6756\u3067\u6B69\u304F", "Walks with a white cane"),
    D2("\u50CD\u304F(1\u6642\u9593)", "Work (1 hour)"),
    D2("\u30B7\u30D5\u30C8\u306E\u7D42\u308F\u308A\u307E\u3067\u50CD\u304F", "Work until end of shift"),
    D2("\u6C42\u4EBA\u3092\u63A2\u3059", "Look for jobs"),
    D2("\u4F4F\u307E\u3044\u3092\u63A2\u3059(\u5F15\u3063\u8D8A\u3057)", "Look for a home (move)"),
    D2("\u75C5\u5BA4\u306E\u69D8\u5B50\u3092\u898B\u308B", "Look in on the ward"),
    D2("\u6388\u696D\u3092\u53D7\u3051\u308B(\u5348\u524D)", "Attend class (morning)"),
    D2("\u8CB7\u3044\u7269\u3092\u3059\u308B", "Shop"),
    D2("\u98DF\u4E8B\u3092\u3059\u308B", "Eat"),
    D2("\u7720\u308B", "Sleep", { zh: "\u7761\u89C9", ko: "\uC790\uAE30" }),
    D2("\u5E30\u5B85\u3059\u308B", "Go home"),
    D2("\u6240\u6301\u91D1", "Money", { zh: "\u6240\u6301\u91D1", ko: "\uC18C\uC9C0\uAE08" }),
    D2("\u5065\u5EB7", "Health"),
    D2("\u6C17\u5206", "Mood"),
    D2("\u5B66\u529B", "Study"),
    D2("\u203B\u4FA1\u683C\u30FB\u8CC3\u91D1\u30FB\u4EBA\u53E3\u7D71\u8A08\u306A\u3069\u306F\u3001\u3059\u3079\u3066\u30B2\u30FC\u30E0\u7528\u306E\u4EEE\u30D1\u30E9\u30E1\u30FC\u30BF\u3067\u3059\u3002", "* Prices, wages and population statistics are all provisional game parameters."),
    D2("\u914D\u616E\u306E\u8A2D\u5B9A\u306F\u3001\u7269\u8A9E\u4E0A\u306E\u512A\u52A3\u3092\u6C7A\u3081\u307E\u305B\u3093\u3002\u8857\u306E\u9053\u30FB\u5EFA\u7269\u30FB\u5B66\u6821\u306E\u4F7F\u3044\u3084\u3059\u3055\u3060\u3051\u304C\u5909\u308F\u308A\u307E\u3059\u3002", "Accessibility settings never make the story better or worse. They only change how easy the roads, buildings and schools are to use."),
    D2("\u4E00\u4EBA\u79F0\u306E\u4EBA\u751F\u30B2\u30FC\u30E0\u3067\u3059", "A first-person life game."),
    D2("\u901A\u591C\u30FB\u846C\u5100\u306B\u53C2\u5217\u3059\u308B(\u9999\u5178\u30FB\u8EAB\u652F\u5EA6)", "Attend the wake and funeral"),
    D2("\u9759\u304B\u306B\u898B\u9001\u308B", "Say goodbye quietly"),
    D2("\u5893\u53C2\u308A\u306B\u884C\u304F(\u82B1\u30FB\u7DDA\u9999)", "Visit the grave (flowers, incense)"),
    D2("\u4ECA\u56DE\u306F\u884C\u304B\u306A\u3044", "Not this time"),
    D2("\u4EA4\u756A\u306B\u5C4A\u3051\u308B", "Take it to the police box"),
    D2("\u305D\u306E\u307E\u307E\u306B\u3059\u308B", "Leave it"),
    D2("\u901A\u308A\u904E\u304E\u308B", "Walk past"),
    D2("\u4ED5\u4E8B\u3092\u8ABF\u6574\u3057\u3066\u53C2\u89B3\u3059\u308B", "Adjust work and attend the open class")
  ];
  var STORE2 = "nls_lang";
  var cur = "ja";
  var map = new Map(DICT.map(([ja, o]) => [ja, o]));
  var orig = /* @__PURE__ */ new WeakMap();
  var obs = null;
  var busy2 = false;
  var getLang = () => cur;
  function applyText(n2) {
    const raw = n2.nodeValue;
    const t = raw.trim();
    if (!t) return;
    let src = orig.get(n2);
    if (src == null || map.get(src.trim()) == null && raw !== src && !map.has(t)) {
      if (map.has(t)) {
        orig.set(n2, raw);
        src = raw;
      } else return;
    }
    const k = src.trim();
    const o = map.get(k);
    if (!o) return;
    const out = cur === "ja" ? k : o[cur] || o.en;
    const lead = src.match(/^\s*/)[0], tail = src.match(/\s*$/)[0];
    const v = lead + out + tail;
    if (n2.nodeValue !== v) n2.nodeValue = v;
  }
  function translateTree(root) {
    if (typeof document === "undefined") return;
    busy2 = true;
    try {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n2;
      while (n2 = w.nextNode()) {
        const p = n2.parentNode;
        if (p && (p.tagName === "SCRIPT" || p.tagName === "STYLE")) continue;
        applyText(n2);
      }
    } finally {
      busy2 = false;
    }
  }
  function setLang(l) {
    if (!LANGS[l]) l = "ja";
    cur = l;
    try {
      localStorage.setItem(STORE2, l);
    } catch (e) {
    }
    if (typeof document === "undefined") return l;
    document.documentElement.lang = l;
    translateTree(document.body);
    if (!obs && typeof MutationObserver !== "undefined") {
      obs = new MutationObserver((ms) => {
        if (busy2 || cur === "ja") return;
        busy2 = true;
        try {
          for (const m of ms) {
            if (m.type === "characterData") applyText(m.target);
            else m.addedNodes.forEach((a) => {
              if (a.nodeType === 3) applyText(a);
              else if (a.nodeType === 1) {
                busy2 = false;
                translateTree(a);
                busy2 = true;
              }
            });
          }
        } finally {
          busy2 = false;
        }
      });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    return l;
  }
  function initLang() {
    let l = "ja";
    try {
      const q = new URLSearchParams(location.search).get("lang");
      l = q && LANGS[q] ? q : localStorage.getItem(STORE2) || "ja";
    } catch (e) {
    }
    if (!LANGS[l]) l = "ja";
    if (l !== "ja") setLang(l);
    else cur = "ja";
    return l;
  }
  function nextLang() {
    const ks = Object.keys(LANGS);
    return ks[(ks.indexOf(cur) + 1) % ks.length];
  }

