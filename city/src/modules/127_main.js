  // src/main.js
  var $ = (id) => document.getElementById(id);
  var esc4 = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  var WD = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];
  var G3 = null;
  var R4 = null;
  var C = null;
  var A = null;
  var cv = $("cv");
  var U = { modal: false, dest: null, route: null, routeMode: 0, scale: 1, clockFrac: 0, last: 0, walkers: [], people: [], cwAt: -1, cwMin: 0, toastT: 0, autosaveM: -1, big: false, hintTxt: "", walkRefresh: 0, started: false, fast: null };
  var input = { x: 0, y: 0, mag: 1, run: false, keys: /* @__PURE__ */ new Set() };
  function showModal(html, wire) {
    const m = $("modal"), c = $("card");
    c.innerHTML = html;
    m.classList.add("on");
    U.modal = true;
    if (wire) wire(c);
    c.scrollTop = 0;
  }
  function closeModal() {
    $("modal").classList.remove("on");
    U.modal = false;
    $("card").innerHTML = "";
  }
  function toast(t, ms = 2600) {
    const el = $("toast");
    el.textContent = t;
    el.classList.add("on");
    clearTimeout(U.toastT);
    U.toastT = setTimeout(() => el.classList.remove("on"), ms);
  }
  function btn(label, cls = "") {
    return `<button class="btn ${cls}">${label}</button>`;
  }
  function fade(on2) {
    $("fade").classList.toggle("on", on2);
  }
  var yen4 = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  var dstr = (y, m0, d) => `${y}\u5E74${m0 + 1}\u6708${d}\u65E5`;
  function fmtM(M) {
    return `${1900 + Math.floor(M / 12)}\u5E74${M % 12 + 1}\u6708`;
  }
  async function boot() {
    initLang();
    $("title").innerHTML = '<div class="brand">NAGAYAMA \u2606LAB</div><h1>\u4EBA\u751F\u7269\u8A9E\uFF5C\u65E5\u672C\u30E2\u30C7\u30EB\u90FD\u5E02</h1><div class="small">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</div>';
    window.addEventListener("error", (ev) => {
      if (!A) {
        const sm = $("title").querySelector(".small");
        if (sm) sm.textContent = "\u30A8\u30E9\u30FC: " + (ev.message || ev.type);
      }
    });
    window.addEventListener("unhandledrejection", (ev) => {
      if (!A) {
        const sm = $("title").querySelector(".small");
        if (sm) sm.textContent = "\u30A8\u30E9\u30FC: " + (ev.reason && ev.reason.message || ev.reason);
      }
    });
    try {
      A = await loadAssets("assets/");
    } catch (e) {
      $("title").innerHTML = `<h1>\u8AAD\u307F\u8FBC\u307F\u30A8\u30E9\u30FC</h1><div class="tx">${esc4(e.message)}</div>`;
      return;
    }
    registerSW();
    showTitle();
  }
  function registerSW() {
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(() => {
    });
  }
  var HAIRC = ["#282228", "#704a2e", "#96643e", "#e2be62", "#b24834", "#2c3864", "#e88eac", "#b0b0b8"];
  var SKINC = ["#ffe0c4", "#f4cda8", "#d6a87c", "#a87856"];
  async function showTitle() {
    const slots = await listSlots().catch(() => []);
    const cityQ = new URLSearchParams(location.search).get("city");
    const cityDef = cityQ === "3" || cityQ === "4" ? +cityQ : navigator.webdriver ? 3 : 4;
    const form = { city: cityDef, scn: "normal", sur: "", given: "", year: 1990, lt: "f", call: "u", sex: "u", hair: "", hc: 0, sk: 1, c1: 1, c2: 10, needs: 0, seed: 20261020, sprite: "", funds: "normal", fp: 0, step: 0, age: 25, dir: "d" };
    const t = $("title");
    t.style.display = "flex";
    const dev = devToolsEnabled();
    const fld = () => {
      const g = (id) => $(id);
      if (g("fSur")) form.sur = g("fSur").value.trim();
      if (g("fGiven")) form.given = g("fGiven").value.trim();
      if (g("fYear")) form.year = +g("fYear").value;
      if (g("fNeeds")) form.needs = +g("fNeeds").value;
      if (g("fSeed")) form.seed = g("fSeed").value;
      if (g("fCity")) form.city = +g("fCity").value;
      if (g("fScn")) form.scn = g("fScn").value;
    };
    const heroName = () => form.given ? form.sur ? form.sur + " " + form.given : form.given : "";
    const STEPS = ["\u306A\u307E\u3048\u30FB\u751F\u307E\u308C", "\u898B\u305F\u76EE", "\u306F\u3058\u307E\u308A\u30FB\u78BA\u8A8D"];
    const draw2 = () => {
      const sw = (k, arr) => arr.map((c, i) => `<span class="sw ${form[k] === i ? "sel" : ""}" data-k="${k}" data-v="${i}" style="background:${c}"></span>`).join("");
      const st3 = form.step;
      let body = "";
      if (st3 === 0) body = `
      <div class="formrow">\u540D\u5B57 <input id="fSur" maxlength="6" style="width:90px" placeholder="\u4F8B:\u7530\u4E2D" value="${esc4(form.sur)}"> \u540D\u524D <input id="fGiven" maxlength="8" style="width:110px" placeholder="\u4F8B:\u592A\u90CE" value="${esc4(form.given)}"></div>
      <div class="small">\u7A7A\u6B04\u306A\u3089\u540D\u524D\u306F\u81EA\u52D5\u3002\u540D\u5B57\u306F\u5165\u529B\u3069\u304A\u308A\u306B\u5BB6\u65CF(\u7236\u30FB\u6BCD\u30FB\u304D\u3087\u3046\u3060\u3044)\u3078\u305D\u308D\u3048\u307E\u3059\u3002${form.sur && !form.given ? '<b style="color:#fc6">\u540D\u524D\u3082\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044</b>' : ""}</div>
      <div class="small" style="margin-top:4px">\u6027\u5225(\u898B\u305F\u76EE\u30FB\u9AEA\u578B\u30FB\u670D\u88C5\u30FB\u547C\u3070\u308C\u65B9\u3068\u306F\u5225\u306B\u9078\u3079\u307E\u3059)</div>
      <div class="chips" id="sexChips">${SEX_TYPES.map((o) => `<button class="chip ${form.sex === o.k ? "sel" : ""}" data-k="sex" data-s="${o.k}" title="${esc4(o.d)}">${o.n}</button>`).join("")}</div>
      <div class="small">${esc4(SEX_TYPES.find((o) => o.k === form.sex).d)}\u3002${form.sex === "o" || form.sex === "u" ? "\u300C\u305D\u306E\u4ED6\u300D\u300C\u672A\u8A2D\u5B9A\u300D\u306F\u7537\u30FB\u5973\u306E\u3069\u3061\u3089\u304B\u306B\u56FA\u5B9A\u305B\u305A\u6271\u3044\u307E\u3059\u3002" : ""}</div>
      <details class="small"><summary>\u6027\u5225\u8A2D\u5B9A\u3067\u672A\u5BFE\u5FDC\u306E\u90E8\u5206</summary>${UNSUPPORTED.map((u) => "\u30FB" + esc4(u)).join("<br>")}</details>
      <div class="formrow">\u751F\u307E\u308C\u308B\u5E74 <select id="fYear">${[1946, 1960, 1970, 1980, 1990, 2e3, 2010, 2020, 2026].map((y) => `<option ${y === form.year ? "selected" : ""}>${y}</option>`).join("")}</select> <span class="small">\u8857\u30FB\u5BB6\u30FB\u4E57\u308A\u7269\u3082\u305D\u306E\u5E74\u4EE3\u304B\u3089\u59CB\u307E\u308A\u307E\u3059(2026\u5E74\u3088\u308A\u5148\u306F\u5275\u4F5C)</span></div>
      <div class="formrow">\u8857 <select id="fCity"><option value="4" ${form.city === 4 ? "selected" : ""}>\u65B0\u90FD\u5E02v2(\u7D0430\u500D\u30FB\u5927\u90FD\u4F1A\u304B\u3089\u7530\u820E\u307E\u3067)</option><option value="3" ${form.city === 3 ? "selected" : ""}>\u5F93\u6765\u306E\u5C0F\u3055\u306A\u8857(\u8EFD\u91CF)</option></select></div>
      <div class="small">\u65B0\u90FD\u5E02\u306F\u5E83\u3044\u5206\u3001\u6700\u521D\u306E\u6E96\u5099\u306B\u6570\u79D2\u304B\u304B\u308A\u307E\u3059\u3002\u7AEF\u672B\u304C\u91CD\u3044\u3068\u304D\u306F\u5F93\u6765\u306E\u8857\u3092\u9078\u3079\u307E\u3059\u3002</div>
      <div class="formrow">\u8857\u306E\u30B7\u30FC\u30C9 <input id="fSeed" style="width:120px" value="${form.seed}"> <span class="small">\u540C\u3058\u6570\u5B57\u306A\u3089\u540C\u3058\u8857\u30FB\u540C\u3058\u5BB6\u5EAD\u3067\u751F\u307E\u308C\u307E\u3059</span></div>
      <div class="formrow">\u914D\u616E(\u4EFB\u610F) <select id="fNeeds"><option value="0">\u306A\u3057</option><option value="1" ${form.needs === 1 ? "selected" : ""}>\u8ECA\u3044\u3059\u3067\u66AE\u3089\u3059</option><option value="2" ${form.needs === 2 ? "selected" : ""}>\u767D\u6756\u3067\u6B69\u304F</option><option value="4" ${form.needs === 4 ? "selected" : ""}>\u8074\u3053\u3048\u306B\u304F\u3044(\u88DC\u8074)</option><option value="8" ${form.needs === 8 ? "selected" : ""}>\u7279\u5225\u652F\u63F4\u5B66\u6821\u3067\u5B66\u3076</option></select></div>
      <div class="small">\u914D\u616E\u306F\u3001\u751F\u6D3B\u3067\u4F7F\u3046\u9053\u5177\u3084\u901A\u3046\u5B66\u6821\u30FB\u8857\u306E\u4F7F\u3044\u3084\u3059\u3055\u304C\u5909\u308F\u308B\u8A2D\u5B9A\u3067\u3059\u3002\u7269\u8A9E\u4E0A\u306E\u512A\u52A3\u306F\u3042\u308A\u307E\u305B\u3093\u3002</div>`;
      if (st3 === 1) body = `
      <div class="small">\u898B\u305F\u76EE\u306E\u30BF\u30A4\u30D7(\u57FA\u672C\u306E\u9854\u3064\u304D\u30FB\u4F53\u3064\u304D\u30FB\u5236\u670D\u306E\u5BC4\u305B\u65B9)</div>
      <div class="chips">${LOOK_TYPES.map((o) => `<button class="chip ${form.lt === o.k ? "sel" : ""}" data-k="lt" data-s="${o.k}" title="${esc4(o.d)}">${o.n}</button>`).join("")}</div>
      <div class="small">${esc4(LOOK_TYPES.find((o) => o.k === form.lt).d)}</div>
      <div class="small" style="margin-top:4px">\u547C\u3070\u308C\u65B9(\u6027\u81EA\u8A8D\u30FB\u547C\u79F0\u306E\u65B9\u91DD\u3002\u898B\u305F\u76EE\u3068\u306F\u5225\u306B\u9078\u3079\u307E\u3059)</div>
      <div class="chips">${CALL_TYPES.map((o) => `<button class="chip ${form.call === o.k ? "sel" : ""}" data-k="call" data-s="${o.k}">${o.n}</button>`).join("")}</div>
      <div class="small">${esc4(CALL_TYPES.find((o) => o.k === form.call).d)}\u3002\u6570\u5024\u3084\u80FD\u529B\u306B\u306F\u5F71\u97FF\u3057\u307E\u305B\u3093\u3002</div>
      <div class="small" style="margin-top:4px">\u9AEA\u578B(\u30BF\u30C3\u30D7\u3067\u898B\u672C\u3092\u78BA\u8A8D\u3002\u9078\u3070\u306A\u3051\u308C\u3070\u304A\u307E\u304B\u305B)</div>
      <div class="hairgrid">${HAIR_OPTS.filter((o) => hairFits(o, form.lt === "a" ? "f" : form.lt) || form.lt === "a").map((o) => `<button class="hair ${form.hair === o.key ? "sel" : ""}" data-hair="${o.key}"><canvas width="96" height="84" data-hv="${o.key}"></canvas><span>${o.n}</span></button>`).join("")}</div>
      <div class="small">${esc4((HAIR_OPTS.find((o) => o.key === form.hair) || HAIR_OPTS[0]).d)}</div>
      <div class="formrow">\u304B\u307F\u8272 ${sw("hc", HAIRC)}</div>
      <div class="formrow">\u306F\u3060\u8272 ${sw("sk", SKINC)}</div>
      <div class="small">\u3075\u3060\u3093\u7740\u306E\u8272\u306F\u3001\u5E74\u9F62\u30FB\u5B63\u7BC0\u30FB\u6642\u4EE3\u306B\u5408\u308F\u305B\u3066\u81EA\u52D5\u3067\u5909\u308F\u308A\u307E\u3059\u3002\u9854\u7ACB\u3061\u306F\u751F\u307E\u308C\u305F\u3042\u3068\u306E\u5BB6\u65CF(\u4E21\u89AA)\u304B\u3089\u6C7A\u307E\u308A\u307E\u3059\u3002</div>`;
      if (st3 === 2) body = `
      <div class="formrow">\u306F\u3058\u307E\u308A <select id="fScn">${Object.entries(SCENARIOS).map(([k, v]) => `<option value="${k}" ${form.scn === k ? "selected" : ""}>${esc4(v.name)}</option>`).join("")}</select></div>
      <div class="small">${form.scn === "normal" ? "0\u6B73(\u8D64\u3061\u3083\u3093)\u304B\u3089\u3001\u5BB6\u65CF\u306E\u3082\u3068\u3067\u4EBA\u751F\u3092\u59CB\u3081\u307E\u3059\u3002" : "\u9014\u4E2D\u306E\u5E74\u9F62\u304B\u3089\u59CB\u307E\u308B\u6311\u6226\u30B7\u30CA\u30EA\u30AA\u3002\u305D\u308C\u307E\u3067\u306E\u4EBA\u751F\u306F\u81EA\u52D5\u3067\u9032\u307F\u3001\u5BB6\u65CF\u30FB\u53CB\u3060\u3061\u30FB\u601D\u3044\u51FA\u306F\u5F15\u304D\u7D99\u304C\u308C\u307E\u3059\u3002"}</div>
      ${dev ? `<div class="formrow">\u8CC7\u91D1 <button class="chip ${form.funds === "normal" ? "sel" : ""}" data-k="funds" data-s="normal">\u901A\u5E38\u8CC7\u91D1</button><button class="chip ${form.funds === "max" ? "sel" : ""}" data-k="funds" data-s="max">\u8A66\u9A13\u7528MAX\u8CC7\u91D1</button></div>
      <div class="formrow">\u5E74\u9F62\u5236\u9650 <button class="chip ${!form.fp ? "sel" : ""}" data-k="fp" data-s="0">\u901A\u5E38(\u5E74\u9F62\u76F8\u5FDC)</button><button class="chip ${form.fp ? "sel" : ""}" data-k="fp" data-s="1">\u81EA\u7531\u8A66\u904A(\u958B\u767A\u7528)</button></div>
      <div class="small">\u81EA\u7531\u8A66\u904A: \u5E7C\u5150\u3067\u3082\u8857\u3092\u6B69\u304D\u3001\u5168\u65BD\u8A2D\u306B\u5165\u308C\u307E\u3059(\u8A66\u9A13\u5C02\u7528\u3002\u901A\u5E38\u30D7\u30EC\u30A4\u3068\u306F\u5225)\u3002</div>
      <div class="small">${form.funds === "max" ? "\u8A66\u9A13\u7528: \u8CB7\u3044\u7269\u30FB\u8ECA\u30FB\u4F4F\u5B85\u30FB\u65BD\u8A2D\u3092\u8CC7\u91D1\u3092\u6C17\u306B\u305B\u305A\u8A66\u305B\u307E\u3059\u3002\u901A\u5E38\u306E\u6240\u6301\u91D1\u30FB\u501F\u5165\u306F\u9000\u907F\u3055\u308C\u3001\u8A2D\u5B9A\u304B\u3089OFF\u306B\u3059\u308B\u3068\u5143\u306B\u623B\u308A\u307E\u3059\u3002\u753B\u9762\u306B\u3010MAX\u8CC7\u91D1\u3011\u3068\u8868\u793A\u3055\u308C\u307E\u3059\u3002" : "\u901A\u5E38: \u5BB6\u5EAD\u306E\u4E8B\u60C5\u306B\u5FDC\u3058\u305F\u6240\u6301\u91D1\u3067\u59CB\u307E\u308A\u307E\u3059(0\u6B73\u306F\u4FDD\u8B77\u8005\u304C\u7BA1\u7406)\u3002\u8A2D\u5B9A\u304B\u3089\u3042\u3068\u3067MAX\u8CC7\u91D1\u306B\u5207\u308A\u66FF\u3048\u3089\u308C\u307E\u3059\u3002"}</div>` : ""}
      <div class="card" style="background:#10224a;margin-top:6px"><b>\u3053\u306E\u8A2D\u5B9A\u3067\u59CB\u3081\u307E\u3059</b><br>\u540D\u524D: ${esc4(heroName() || "(\u81EA\u52D5)")}<br>\u751F\u307E\u308C\u308B\u5E74: ${form.year}\u5E74(\u30B7\u30FC\u30C9 ${esc4(String(form.seed))})<br>\u898B\u305F\u76EE: ${esc4(LOOK_TYPES.find((o) => o.k === form.lt).n)} / \u9AEA\u578B: ${esc4((HAIR_OPTS.find((o) => o.key === form.hair) || HAIR_OPTS[0]).n)}<br>\u6027\u5225: ${esc4(sexLabel(form.sex))}<br>\u547C\u3070\u308C\u65B9: ${esc4(CALL_TYPES.find((o) => o.k === form.call).n)}<br>\u306F\u3058\u307E\u308A: ${esc4(SCENARIOS[form.scn].name)}${form.needs ? "<br>\u914D\u616E\u3042\u308A" : ""}${dev ? "<br>\u8CC7\u91D1: " + (form.funds === "max" ? "\u8A66\u9A13\u7528MAX" : "\u901A\u5E38") + " / \u5E74\u9F62\u5236\u9650: " + (form.fp ? "\u81EA\u7531\u8A66\u904A" : "\u901A\u5E38") : ""}</div>`;
      t.innerHTML = `<div class="brand">NAGAYAMA \u2606LAB</div><h1 style="margin:2px 0">\u4EBA\u751F\u7269\u8A9E\uFF5C\u65E5\u672C\u30E2\u30C7\u30EB\u90FD\u5E02</h1>
    <div class="card setup" style="max-width:560px;width:100%;background:#0d1b3ccc;padding:8px 10px">
      <div class="steps">${STEPS.map((n2, i) => `<span class="${i === st3 ? "on" : ""}" data-step="${i}">${i + 1}. ${n2}</span>`).join("")}</div>
      <div class="setuprow"><div class="pvbox"><canvas id="pvBig" width="192" height="240"></canvas>
        <div class="chips tiny">${[0, 6, 15, 30, 70].map((a) => `<button class="chip ${form.age === a ? "sel" : ""}" data-age="${a}">${a}\u6B73</button>`).join("")}</div>
        <div class="chips tiny">${[["d", "\u524D"], ["r", "\u53F3"], ["u", "\u5F8C"], ["l", "\u5DE6"]].map(([d, n2]) => `<button class="chip ${form.dir === d ? "sel" : ""}" data-dir="${d}">${n2}</button>`).join("")}</div></div>
        <div class="setupbody">${body}</div></div>
      <div class="row" style="justify-content:center;margin-top:6px">${st3 > 0 ? btn("\u3082\u3069\u308B", "sec") : ""}${st3 < 2 ? btn("\u3064\u304E\u3078", "acc") : btn("\u306F\u3058\u3081\u308B", "acc")}${st3 === 0 ? btn("\u306F\u3058\u3081\u304B\u3089(\u304B\u3093\u305F\u3093\u958B\u59CB)", "sec") : ""}</div>
      <div class="row" style="justify-content:center">${slots.length ? btn("\u3064\u3065\u304D\u304B\u3089", "sec") : ""}${btn("\u30D5\u30A1\u30A4\u30EB\u304B\u3089\u8AAD\u307F\u8FBC\u3080", "sec")}</div>
      <div class="small">\u203B\u4FA1\u683C\u30FB\u8CC3\u91D1\u30FB\u4EBA\u53E3\u7D71\u8A08\u306A\u3069\u306F\u3001\u3059\u3079\u3066\u30B2\u30FC\u30E0\u7528\u306E\u4EEE\u30D1\u30E9\u30E1\u30FC\u30BF\u3067\u3059\u3002</div>
    </div>`;
      const paint2 = () => {
        const pv = $("pvBig");
        if (pv) previewInto(pv, form, form.age, form.dir, 3);
        t.querySelectorAll("canvas[data-hv]").forEach((c) => {
          const f2 = { ...form, hair: c.dataset.hv };
          previewInto(c, f2, 20, "d", 1, true);
        });
      };
      paint2();
      const rd2 = () => {
        fld();
      };
      t.querySelectorAll(".sw").forEach((s) => s.onclick = () => {
        rd2();
        form[s.dataset.k] = +s.dataset.v;
        draw2();
      });
      t.querySelectorAll("[data-s]").forEach((s) => s.onclick = () => {
        rd2();
        form[s.dataset.k] = s.dataset.k === "fp" ? +s.dataset.s : s.dataset.s;
        if (s.dataset.k === "lt" && form.hair && !hairFits(HAIR_OPTS.find((o) => o.key === form.hair), s.dataset.s === "a" ? "f" : s.dataset.s) && s.dataset.s !== "a") form.hair = "";
        draw2();
      });
      t.querySelectorAll("[data-hair]").forEach((s) => s.onclick = () => {
        rd2();
        form.hair = s.dataset.hair;
        draw2();
      });
      t.querySelectorAll("[data-age]").forEach((s) => s.onclick = () => {
        rd2();
        form.age = +s.dataset.age;
        paint2();
        t.querySelectorAll("[data-age]").forEach((x) => x.classList.toggle("sel", x === s));
      });
      t.querySelectorAll("[data-dir]").forEach((s) => s.onclick = () => {
        rd2();
        form.dir = s.dataset.dir;
        paint2();
        t.querySelectorAll("[data-dir]").forEach((x) => x.classList.toggle("sel", x === s));
      });
      t.querySelectorAll("[data-step]").forEach((s) => s.onclick = () => {
        rd2();
        form.step = +s.dataset.step;
        draw2();
      });
      const bs = [...t.querySelectorAll("button.btn")];
      const by = (n2) => bs.find((b) => b.textContent.trim() === n2);
      if (by("\u3082\u3069\u308B")) by("\u3082\u3069\u308B").onclick = () => {
        rd2();
        form.step--;
        draw2();
      };
      if (by("\u3064\u304E\u3078")) by("\u3064\u304E\u3078").onclick = () => {
        rd2();
        form.step++;
        draw2();
      };
      const go = async () => {
        rd2();
        const seed = parseInt(form.seed, 10) || 20261020;
        const name = heroName();
        t.style.display = "none";
        const loader = document.getElementById("nlsStartLoading");
        const loaderStatus = document.getElementById("nlsStartStatus");
        const loaderMeter = document.getElementById("nlsStartMeter");
        const loaderPercent = document.getElementById("nlsStartPercent");
        const progress = (pct, caption) => {
          if (loaderStatus) loaderStatus.textContent = caption;
          if (loaderMeter) loaderMeter.style.width = Math.min(100, Math.max(0, pct)) + "%";
          if (loaderPercent) loaderPercent.textContent = Math.round(pct) + "%";
        };
        if (loader) loader.classList.add("on");
        progress(0, "都市と家族のデータを作成しています…");
        // Paint loading screen before the potentially expensive world constructor.
        await new Promise((resolve) => setTimeout(resolve, 30));
        try {
          const look = lookOf({ ...form, seed });
          const g = Game.create({ seed, ver: form.city, startYear: form.year, name: name || void 0, look, needs: form.needs, sprite: form.sprite || void 0 });
          g.hero.ident = { look: form.lt, call: form.call, sex: form.sex };
          const hd = HD(form);
          if (hd) g.hero.hairdo = hd;
          g.log("family", `\u547C\u3070\u308C\u65B9\u306E\u8A2D\u5B9A: ${CALL_TYPES.find((o) => o.k === form.call).n}\u30FB\u6027\u5225: ${sexLabel(form.sex)}`);
          if (form.scn !== "normal") {
            progress(0, "これまでの人生を作成しています…");
            await applyScenario(g, form.scn, progress);
          }
          if (dev && form.funds === "max") testMoneyOn(g);
          if (dev && form.fp) setFreePlay(g, true);
          progress(100, "街へ移動しています…");
          await new Promise((resolve) => setTimeout(resolve, 30));
          start(g);
        } catch (err) {
          console.error("[NLS start]", err);
          // Keep the setup visible and offer a safe path back; never trap the
          // user behind a black canvas on mobile.
          t.style.display = "flex";
          showModal(`<h2>新しい人生を開始できませんでした</h2><div class="tx">${esc4(err && err.message || "不明なエラー")}\n設定を変えて再試行できます。セーブデータは変更していません。</div><div class="row"><button class="btn acc" id="nlsStartRetry">人生設定に戻る</button></div>`);
          const retry = document.getElementById("nlsStartRetry");
          if (retry) retry.onclick = () => closeModal();
        } finally {
          if (loader) loader.classList.remove("on");
        }
      };
      if (by("\u306F\u3058\u3081\u308B")) by("\u306F\u3058\u3081\u308B").onclick = go;
      if (by("\u306F\u3058\u3081\u304B\u3089(\u304B\u3093\u305F\u3093\u958B\u59CB)")) by("\u306F\u3058\u3081\u304B\u3089(\u304B\u3093\u305F\u3093\u958B\u59CB)").onclick = go;
      if (by("\u3064\u3065\u304D\u304B\u3089")) by("\u3064\u3065\u304D\u304B\u3089").onclick = () => slotMenu(slots);
      const fb = by("\u30D5\u30A1\u30A4\u30EB\u304B\u3089\u8AAD\u307F\u8FBC\u3080");
      if (fb) fb.onclick = () => {
        const f2 = document.createElement("input");
        f2.type = "file";
        f2.accept = ".json,.nlsave";
        f2.onchange = async () => {
          try {
            const txt2 = await f2.files[0].text();
            const d = fromJSON(txt2);
            t.style.display = "none";
            start(Game.load(d), true);
          } catch (e) {
            t.style.display = "flex";
            toast("\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F: " + e.message);
          }
        };
        f2.click();
      };
    };
    draw2();
  }
  function slotMenu(slots) {
    showModal(`<h2>\u30BB\u30FC\u30D6\u30C7\u30FC\u30BF</h2><div class="list">${slots.map((s) => `<button class="btn item" data-id="${esc4(s.id)}">${esc4(s.id === "auto" ? "\u30AA\u30FC\u30C8\u30BB\u30FC\u30D6" : "\u30B9\u30ED\u30C3\u30C8 " + s.id)} \u2014 ${esc4(s.meta.name || "")} ${esc4(s.meta.label || "")} <span class="small">${new Date(s.meta.ts).toLocaleString("ja-JP")}</span></button>`).join("")}</div><div class="row">${btn("\u3082\u3069\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = async () => {
        const r = await loadSlot(b.dataset.id);
        if (r) {
          closeModal();
          $("title").style.display = "none";
          start(Game.load(r.data), true);
        }
      });
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  function start(g, loaded) {
    G3 = g;
    C = new Crowd(G3);
    R4 = new Renderer(cv, A, G3, C);
    try {
      R4.zl = +localStorage.getItem("nls_zoom") || 0;
      const iz = localStorage.getItem("nls_izoom");
      R4.izl = iz == null ? 1 : +iz || 0;
    } catch (_) {
    }
    R4.resize();
    if (G3.hero.sprite === "w01") R4.special = { look: G3.world.pop.look[G3.hero.id] >>> 0 };
    try {
      fixCondoHeights(G3);
    } catch (e) {
      console.warn("[bldfix]", e);
    }
    U.started = true;
    U.dest = null;
    U.route = null;
    U.walkers = [];
    U.people = [];
    clearInteriorCache();
    window.NLS = { G: G3, R: R4, C, U, tryEnter, runAction, moveHero, input, step, setStreet, ui: { jTicketModal, jBoardModal, jInfoModal, jShuttle, jAwayPanel, rideScreen, startRide, RD, rideAction, pressA, mapModal, railModal, jobsModal, housingModal, financeModal, stockModal, bizModal, skipModal, planModal, peopleModal, itemsModal, diaryModal, cfgModal, timetableModal, devOpen: () => devPanel(devCtx()) }, nav: { navTo, navStop, onTap, tapPick, destSheet, goHome, interiorOf, navStairs, npcStatus, registry, storeys, levelRange, get NAV() {
      return NAV;
    } } };
    if (!loaded) {
      if (G3.S.scenario && G3.S.scenario.id) {
        toast(`${G3.age()}歳からの人生を開始しました。`, 4200);
      } else {
        toast("\u751F\u307E\u308C\u307E\u3057\u305F\u30022\u6B73\u307E\u3067\u306F\u3001\u5BB6\u65CF\u306E\u3082\u3068\u3067\u904E\u3054\u3057\u307E\u3059\u3002");
      }
    }
    U.last = performance.now();
    requestAnimationFrame(frame);
    updateHud(true);
    if (G3.blocked()) openPrompt();
    else if (!G3.canWalk()) babyPanel();
    else if (awayInfo(G3)) jAwayPanel();
  }
  window.addEventListener("resize", () => {
    if (R4) R4.resize();
  });
  var AQ = { ema: 16, slow: 0, fast: 0, on: !(navigator.webdriver || globalThis.NOAUTOQ) };
  function autoQuality(dtMs) {
    if (!AQ.on || !R4 || document.hidden || U.modal) return;
    if (dtMs > 500) return;
    AQ.ema += (dtMs - AQ.ema) * 0.05;
    const q = R4.qs || 1;
    if (AQ.ema > 34) {
      AQ.slow++;
      AQ.fast = 0;
    } else if (AQ.ema < 20) {
      AQ.fast++;
      AQ.slow = 0;
    } else {
      AQ.slow = AQ.fast = 0;
    }
    if (AQ.slow > 45 && q > 0.71) {
      R4.qs = Math.max(0.7, +(q - 0.15).toFixed(2));
      R4.resize();
      AQ.slow = 0;
      AQ.ema = 20;
    } else if (AQ.fast > 600 && q < 1) {
      R4.qs = Math.min(1, +(q + 0.15).toFixed(2));
      R4.resize();
      AQ.fast = 0;
    }
  }
  window.__autoQ = AQ;
  function frame(ts) {
    const dt = Math.min(0.1, (ts - U.last) / 1e3);
    autoQuality(ts - U.last);
    U.last = ts;
    step(dt);
    draw(dt);
    requestAnimationFrame(frame);
  }
  function step(dt) {
    if (!G3 || U.modal) return;
    if (taxiTripActive(G3)) {
      const r = taxiTripTick(G3, dt, U.taxiSkip);
      U.taxiSkip = false;
      if (r && r.ended) {
        updateHud(true);
        if (r.msg) toast(r.msg, 4e3);
        sfx.car();
      } else updateHint();
      return;
    }
    if (G3.S.pump && !U.modal) leavePump(G3);
    if (G3.blocked()) {
      openPrompt();
      return;
    }
    if (!G3.canWalk()) {
      babyPanel();
      return;
    }
    if (U.act) {
      stepActFrame(dt);
      return;
    }
    let ix = input.x, iy = input.y;
    const ks = input.keys;
    let navRun = false;
    if (NAV) {
      if (ix || iy || ks.size) navStop();
      else {
        const ni = navInput(dt);
        if (ni) {
          ix = ni.x;
          iy = ni.y;
          navRun = ni.run;
        }
      }
    }
    const runNow = input.run || ks.has("Shift") || navRun;
    if (ks.has("ArrowLeft") || ks.has("a")) ix -= 1;
    if (ks.has("ArrowRight") || ks.has("d")) ix += 1;
    if (ks.has("ArrowUp") || ks.has("w")) iy -= 1;
    if (ks.has("ArrowDown") || ks.has("s")) iy += 1;
    const L2 = G3.S.loc;
    const sxIn = ix, syIn = iy;
    let streetRes = null;
    if (R4.street && L2.k === "out") {
      if (!R4.sv) initStreet(R4);
      R4.sv.yaw += ix * 1.9 * dt;
      const fw = -iy;
      ix = Math.cos(R4.sv.yaw) * fw;
      iy = Math.sin(R4.sv.yaw) * fw;
      streetRes = moveHero(G3, ix, iy, dt, runNow, input.mag);
      L2.f = facingOfYaw(R4.sv.yaw);
    }
    if (!streetRes && R4.iso && (L2.k === "out" || L2.k === "in") && (ix || iy)) {
      const w = screenToWorldDir(ix, iy);
      ix = w[0];
      iy = w[1];
    }
    const res = streetRes || moveHero(G3, ix, iy, dt, runNow, NAV ? 1 : input.mag);
    if (!streetRes && R4.iso && (L2.k === "out" || L2.k === "in") && (sxIn || syIn)) L2.f = Math.abs(sxIn) > Math.abs(syIn) ? sxIn > 0 ? "r" : "l" : syIn > 0 ? "d" : "u";
    L2.moving = res.moved;
    if (res.ui === "liftsel" && !U.modal) {
      if (NAV && NAV.liftTo != null) {
        const r = chooseFloor(G3, NAV.liftTo);
        if (r && r.msg) toast(r.msg, 2e3);
      } else liftModal();
    }
    if (res.directory != null) {
      if (NAV && NAV.tg.kind === "bld" && NAV.tg.b === res.directory && (res.directory === G3.hero.homeB || NAV.tg.direct)) {
        const r2 = tryEnter(G3, res.directory, true);
        if (r2.ok) res.entered = res.directory;
        else {
          navStop();
          if (r2.msg) toast(r2.msg, 3e3);
        }
      } else {
        U.dirAt = res.directory;
        showDirectory(res.directory);
      }
    }
    if (res.msg) toast(res.msg);
    if (res.entered != null || res.exited || res.floor != null) {
      U.cwAt = -999;
      const eb = res.entered != null ? G3.bld(res.entered) : null;
      if (eb && (eb.type === "konbini" || eb.type === "super")) sfx.konbini();
      else sfx.door();
    }
    if (res.moved) {
      U.stepT = (U.stepT || 0) + dt;
      const run = runNow;
      if (U.stepT > (run ? 0.2 : 0.3)) {
        U.stepT = 0;
        sfx.step(run);
      }
    }
    U.clockFrac += dt * U.scale;
    while (U.clockFrac >= 1 && !G3.blocked()) {
      U.clockFrac -= 1;
      G3.advance(1);
    }
    const now = G3.absMin() + U.clockFrac;
    if (L2.k === "out") {
      if (U.cwAt < 0 || performance.now() - U.cwAt > 700) {
        U.cwAt = performance.now();
        U.cwMin = now;
        U.walkers = C.outdoor(L2.x, L2.y);
      }
      const dMin = now - U.cwMin;
      const PS = U.ped = U.ped || { wdelay: /* @__PURE__ */ new Map(), wprev: /* @__PURE__ */ new Map(), whold: /* @__PURE__ */ new Map() };
      const fr = Math.max(0, Math.min(0.5, now - (U.lastNow ?? now)));
      U.lastNow = now;
      const mp = G3.world.map, clk = R4.time || 0;
      for (const w of U.walkers) {
        const pr = pedPos(C, mp, w, dMin, fr, clk, PS);
        const q = pr.q;
        w.idle = pr.idle;
        if (q) {
          w.cx = q.x;
          w.cy = q.y;
          w.cdx = q.dx;
          w.cdy = q.dy;
          w.cph = q.ph;
          w.ccar = q.car;
          w.cjump = q.jump;
          w.vis = true;
        } else w.vis = false;
      }
      if (PS.wdelay.size > 400) {
        PS.wdelay.clear();
        PS.wprev.clear();
        PS.whold.clear();
      }
      R4.walkers = U.walkers.filter((w) => w.vis).map((w) => ({ id: w.id, x: w.cx, y: w.cy, dx: w.cdx, dy: w.cdy, ph: w.cph, car: w.ccar, jump: w.cjump, idle: !!w.idle }));
      R4.parked = U.walkers.parked || [];
    } else {
      if (U.cwAt < 0 || performance.now() - U.cwAt > 3e3) {
        U.cwAt = performance.now();
        const { I: I2 } = interiorOf(G3, L2.b, L2.floor);
        U.people = seatStudents(placeSitters(I2, C.indoor(L2.b, I2, L2.floor), Math.floor(G3.S.min / 90), U.act && U.act.seat.key));
      }
      R4.walkers = [];
    }
    updateHint();
    updateHud();
    if (G3.S.ended) endingScreen();
  }
  var levelFn = (b, fl) => isSchoolBig(b) ? floorLabel(b, fl) : isUnitFloor(fl) ? (() => {
    const u = decodeUnit(fl);
    return `${roomNo(u.lv, u.pos)}\u53F7\u5BA4`;
  })() : bigKind(b) ? levelLabel(b, fl) : b.type === "onsenbath" || b.type === "sento" ? ["\u53D7\u4ED8\u30FB\u4F11\u61A9\u6240", "\u7537\u6E6F", "\u5973\u6E6F", "\u5BB6\u65CF\u98A8\u5442(\u8CB8\u5207)"][fl] || "" : b.floors > 1 ? `${fl + 1}\u968E` : "";
  function floorTag(g) {
    const L2 = g.S.loc, b = g.bld(L2.b);
    if (isUnitFloor(L2.floor)) {
      const u = decodeUnit(L2.floor);
      return ` ${roomNo(u.lv, u.pos)}\u53F7\u5BA4`;
    }
    if (bigKind(b)) return " " + levelLabel(b, L2.floor).split(" ")[0];
    return b.floors > 1 ? ` ${L2.floor + 1}\u968E` : "";
  }
  function liftModal() {
    const L2 = G3.S.loc;
    if (!L2.tr || L2.tr.stage !== "select") return;
    const ch = floorChoices(G3);
    showModal(`<h2>\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC</h2><div class="tx small">\u884C\u304D\u5148\u306E\u968E\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044(\u5B9A\u54E1${LIFT_CAP}\u4EBA)</div><div class="list" style="max-height:52vh;overflow:auto">${ch.map((c) => `<button class="btn item" data-lv="${c.lv}" ${c.here ? "disabled" : ""}>${esc4(c.label)}${c.here ? "(\u3044\u307E\u306E\u968E)" : ""}</button>`).join("")}</div><div class="row">${btn("\u964D\u308A\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = () => {
        closeModal();
        const r = chooseFloor(G3, Number(b.dataset.lv));
        if (r.msg) toast(r.msg, 2400);
        sfx.door && sfx.door();
      });
      c.querySelector(".row .btn").onclick = () => {
        closeModal();
        chooseFloor(G3, L2.floor);
      };
    });
  }
  function curList() {
    return G3.S.loc.k === "out" ? R4.walkers : U.people;
  }
  function updateHint() {
    const t = targetsFor(G3, curList());
    const tx = t[0] ? t[0].kind === "npc" ? `${t[0].label}\u306B\u8A71\u3057\u304B\u3051\u308B` : t[0].label : "";
    if (tx !== U.hintTxt) {
      $("hint").textContent = tx ? "A: " + tx : "";
      $("hint").style.display = tx ? "" : "none";
      U.hintTxt = tx;
    }
    U.target = t[0] || null;
  }
  function draw(dt) {
    if (!G3 || !R4) return;
    const L2 = G3.S.loc;
    const hero = { x: L2.x, y: L2.y, f: L2.f, moving: !!L2.moving && (input.x || input.y || input.keys.size || NAV) };
    try {
      U.sndAt = (U.sndAt || 0) + dt;
      if (U.sndAt > 0.2) {
        sfx.world(soundState(G3, R4, hero), U.sndAt);
        U.sndAt = 0;
      }
    } catch (e) {
    }
    if (L2.k === "out") {
      R4.drawOutdoor(dt, hero, { route: U.route, dest: U.dest, focus: U.target && U.target.kind === "door" ? { x: G3.world.map.buildings[U.target.b].doorX, y: G3.world.map.buildings[U.target.b].doorY } : null });
    } else {
      const { I: I2 } = interiorOf(G3, L2.b, L2.floor);
      animIndoor(U.people, performance.now() / 1e3);
      const f2 = U.target && U.target.kind === "obj" ? { x: U.target.o.x, y: U.target.o.y } : null;
      R4.drawInterior(dt, hero, I2, U.people, { focus: f2, shop: (() => {
        const sb = G3.bld(L2.b);
        return sb && I2.kind === "shop" ? { b: sb, bt: BTYPES[sb.type] } : null;
      })() });
    }
  }
  var hudStamp = "";
  function updateHud(force) {
    const d = G3.date();
    const age = G3.age();
    const place = placeLine(G3, levelFn);
    const loc = G3.where() + "|" + place;
    const w = R4.weather();
    const st3 = `${G3.S.M}|${G3.S.day}|${G3.S.min}|${loc}|${Math.round(G3.hero.money)}|${Object.values(G3.hero.stats).map(Math.round).join(",")}|${w}`;
    if (!force && st3 === hudStamp) return;
    hudStamp = st3;
    $("hDate").textContent = `${dstr(d.y, d.m0, d.d)}(${WD[d.dow]}) ${String(d.h).padStart(2, "0")}:${String(d.mi).padStart(2, "0")}`;
    const L2 = G3.S.loc, fl = L2.k === "in" ? floorTag(G3) : "";
    $("hSub").textContent = `${esc4(G3.hero.name)} ${age}\u6B73(${G3.ageMonths()}\u304B\u6708\u76EE/${G3.endMonth() - G3.S.bornM})`;
    $("hPlace").textContent = place;
    void fl;
    $("hMoney").classList.toggle("testmax", isTestMode(G3));
    $("hMoney").textContent = (isTestMode(G3) ? "\u3010MAX\u8CC7\u91D1\u3011" : "") + yen4(G3.hero.money) + (G3.hero.debt > 0 ? ` (\u501F${yen4(G3.hero.debt)})` : "");
    $("hWeather").textContent = { sun: "\u2600\u6674\u308C", cloud: "\u2601\u304F\u3082\u308A", rain: "\u2614\u96E8", snow: "\u2744\u96EA" }[w] || "";
    const S2 = G3.hero.stats;
    const b = (k, ic, col) => `<div class="barwrap">${ic}<div class="bar"><i style="width:${Math.round(S2[k])}%;background:${col}"></i></div></div>`;
    $("bars").innerHTML = b("health", "\u2665", "#ef5350") + b("energy", "\u26A1", "#ffd54f") + b("hunger", "\u{1F359}", "#ffa726") + b("mood", "\u263A", "#66bb6a");
    if (U.dest) {
      const p = G3.S.loc;
      const bx = U.dest;
      const dist2 = Math.abs(bx.doorX - p.x) + Math.abs(bx.doorY - p.y);
      const g = $("guide");
      g.style.display = "";
      g.textContent = `\u76EE\u7684\u5730: ${bx.name}(\u7D04${Math.round(dist2)}\u30BF\u30A4\u30EB)`;
      if (dist2 < 2.5) {
        toast("\u76EE\u7684\u5730\u306B\u7740\u304D\u307E\u3057\u305F");
        clearDest();
      }
    } else $("guide").style.display = "none";
  }
  function clearDest() {
    U.dest = null;
    U.route = null;
    $("guide").style.display = "none";
  }
  function setDest(b, mode2 = 0) {
    const L2 = G3.S.loc;
    U.dest = b;
    U.routeMode = mode2;
    if (L2.k === "out") {
      U.route = findPath(G3.world.map, Math.floor(L2.x), Math.floor(L2.y), b.doorX, b.doorY, mode2);
    } else {
      const cb = G3.bld(L2.b);
      U.route = findPath(G3.world.map, cb.doorX, cb.doorY, b.doorX, b.doorY, mode2);
    }
  }
  function openPrompt() {
    if (U.modal) return;
    const pv = G3.promptView();
    if (!pv) return;
    if (pv.type === "report") {
      sfx.chime();
      return reportModal(pv.rep);
    }
    sfx.life(pv.title + " " + pv.text);
    showModal(`<h2>${esc4(pv.title)}</h2><div class="tx">${esc4(pv.text)}</div><div class="list">${pv.choices.map((c, i) => `<button class="btn item ${i === 0 ? "acc" : ""}" data-i="${i}">${esc4(c)}</button>`).join("")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = () => {
        const r = G3.choose(+b.dataset.i);
        closeModal();
        if (r) toast(r, 3200);
        U.cwAt = -999;
      });
    });
  }
  function reportModal(rep) {
    const inc = rep.income.reduce((a, x) => a + x[1], 0), exp = rep.expense.reduce((a, x) => a + x[1], 0);
    const lines = (arr) => arr.map((x) => `<tr><td>${esc4(x[0])}</td><td class="r">${yen4(x[1])}</td></tr>`).join("") || '<tr><td colspan=2 class="small">\u306A\u3057</td></tr>';
    showModal(`<h2>${fmtM(rep.M)} \u306E \u307E\u3068\u3081</h2>
   <div class="tx">${esc4(G3.hero.name)}(${G3.ageAt(rep.M)}\u6B73)\u306E\u3072\u3068\u6708\u3067\u3059\u3002${rep.hours ? `\u50CD\u3044\u305F\u6642\u9593 ${rep.hours.toFixed(0)}\u6642\u9593\u3002` : ""}${rep.attend ? `\u767B\u6821 ${rep.attend.toFixed(1)}\u65E5\u3002` : ""}</div>
   <h3>\u304A\u91D1</h3><table class="t"><tr><th>\u53CE\u5165</th><th class="r">${yen4(inc)}</th></tr>${lines(rep.income)}<tr><th>\u652F\u51FA</th><th class="r">${yen4(exp)}</th></tr>${lines(rep.expense)}</table>
   ${rep.year ? `<h3>${rep.year.y}\u5E74\u306E\u3075\u308A\u304B\u3048\u308A</h3><div class="tx">\u3010\u5168\u56FD\u3011
${rep.year.national.map(esc4).join("\n")}
\u3010\u8857\u3011
${rep.year.town.map(esc4).join("\n")}${rep.year.friends.length ? "\n\u3010\u77E5\u4EBA\u3011\n" + rep.year.friends.map(esc4).join("\n") : ""}
\u3010\u3042\u306A\u305F\u3011
${rep.year.hero.map(esc4).join("\n")}</div>` : ""}
   ${rep.world.length ? `<h3>\u4E16\u306E\u4E2D</h3><div class="tx">${rep.world.map(esc4).join("\n")}</div>` : ""}
   ${rep.news.length ? `<h3>\u77E5\u308A\u5408\u3044\u306E\u8FD1\u6CC1</h3><div class="tx">${rep.news.slice(0, 8).map(esc4).join("\n")}</div>` : ""}
   <h3>\u3044\u307E(${fmtM(rep.after.M)})</h3><div class="tx">\u6240\u6301\u91D1 ${yen4(rep.after.money)} \u30FB \u5065\u5EB7${Math.round(rep.after.stats.health)} \u6C17\u5206${Math.round(rep.after.stats.mood)} \u5B66\u529B${Math.round(rep.after.stats.intel)}</div>
   <div class="row">${btn(`${fmtM(rep.after.M)}\u3078\u9032\u3080`, "acc")}</div>`, (c) => {
      c.querySelector(".btn").onclick = () => {
        G3.choose(0);
        closeModal();
        autosave();
      };
    });
  }
  function babyPanel() {
    if (U.modal) return;
    const m = G3.ageMonths();
    showModal(`<h2>${esc4(G3.hero.name)} ${m === 0 ? "\u306E\u8A95\u751F" : m + "\u304B\u6708"}</h2><canvas id="scn" style="width:100%;border-radius:10px;background:#f6e9cf"></canvas><div class="tx">${esc4(m === 0 ? G3.world.map.buildings.find((b) => b.type === "hospital")?.name || "\u7523\u9662" : G3.homeName())}\u3067\u3001\u5BB6\u65CF\u306B\u898B\u5B88\u3089\u308C\u306A\u304C\u3089\u904E\u3054\u3057\u3066\u3044\u307E\u3059\u3002
${spiritLines(G3).map(esc4).join("\n")}
2\u6B73(24\u304B\u6708)\u306B\u306A\u308B\u3068\u3001\u81EA\u5206\u3067\u6B69\u304D\u307E\u308F\u308C\u308B\u3088\u3046\u306B\u306A\u308A\u307E\u3059\u3002</div><div class="row">${btn("1\u304B\u6708\u3059\u3054\u3059", "acc")}${btn("\u6B69\u3051\u308B\u3088\u3046\u306B\u306A\u308B\u307E\u3067\u9032\u3080", "sec")}</div>`, (c) => {
      const bs = c.querySelectorAll(".btn");
      bs[0].onclick = () => {
        closeModal();
        skipTo(G3.S.M + 1);
      };
      bs[1].onclick = () => {
        closeModal();
        skipTo(G3.S.bornM + 24);
      };
      try {
        sceneInto(c.querySelector("#scn"), G3);
        if (m === 0) {
          try {
            sfx.chime && sfx.chime();
          } catch (_) {
          }
        }
      } catch (e) {
        c.querySelector("#scn").outerHTML = spiritSvg(G3);
      }
    });
  }
  function skipTo(targetM, label) {
    const log0 = G3.S.log.length;
    const r = G3.skipTo(targetM, true);
    G3.placeInHome();
    U.cwAt = -999;
    clearInteriorCache();
    const news = G3.S.log.slice(log0).filter((e) => !["auto", "news", "event", "meet", "history"].includes(e.kind)).slice(0, 14);
    if (r.stopped === "ask" || news.length) {
      setTimeout(() => {
        if (U.modal) return;
        if (G3.blocked()) {
          openPrompt();
          return;
        }
        showModal(`<h2>${label || "\u3059\u3054\u3057\u305F\u6642\u9593"}</h2><div class="tx">${news.length ? news.map((e) => `${fmtM(e.M)} ${esc4(e.text)}`).join("\n") : "(\u3075\u3060\u3093\u901A\u308A\u306E\u65E5\u3005\u3067\u3057\u305F)"}</div><div class="row">${btn("OK", "acc")}</div>`, (c) => c.querySelector(".btn").onclick = closeModal);
      }, 30);
    }
    autosave();
  }
  var AS = makeAutosaver({ save: (ts) => saveSlot("auto", G3, { name: G3.hero.name, label: fmtM(G3.S.M) + " " + G3.age() + "\u6B73", ts }), verify: (ts) => verifySlot("auto", ts), notify: (n2) => {
    try {
      toast(n2.msg, n2.level === "ok" ? 2400 : 6e3);
    } catch (_) {
    }
  } });
  window.__nlsAutosave = () => AS.state();
  async function autosave() {
    if (isTestState(G3)) return;
    try {
      await AS.run();
    } catch (e) {
    }
  }
  function showDirectory(pIdx) {
    const map2 = G3.world.map, par = map2.buildings[pIdx];
    const list = (par.tenants || []).map((i) => map2.buildings[i]).sort((a, b) => (a.tfloor || 1) - (b.tfloor || 1) || a.idx - b.idx);
    const row = (b, label, floor) => {
      const o = isOpenFor(G3, b);
      const mine = G3.hero.job && G3.hero.job.b === b.idx || G3.hero.edu.b === b.idx;
      return { b, html: `${floor ? floor + "F " : ""}${esc4(label)}${mine ? " \u2605\u52E4\u52D9\u5148\u30FB\u901A\u5B66\u5148" : ""}${o.ok ? "" : ' <span class="small">(' + esc4(o.msg || "\u4ECA\u306F\u5165\u308C\u307E\u305B\u3093") + ")</span>"}`, ok: o.ok };
    };
    const rows2 = [...list.map((t) => row(t, `${t.name}(${PLAN[t.spec] && PLAN[t.spec].name || BTYPES[t.type].label})`, t.tfloor || 1)), row(par, `${par.name}(\u9928\u5185\u30FB\u30ED\u30D3\u30FC)`, 0)];
    showModal(`<h2>${esc4(par.name)} \u9928\u5185\u6848\u5185</h2><div class="small">\u5165\u308B\u65BD\u8A2D\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044(${list.length}\u65BD\u8A2D)</div><div class="list">${rows2.map((r, i) => `<button class="btn item" data-i="${i}" ${r.ok ? "" : "disabled"}>${r.html}</button>`).join("")}</div><div class="row">${btn("\u3084\u3081\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = () => {
        const r = tryEnter(G3, rows2[+b.dataset.i].b.idx, true);
        closeModal();
        if (!r.ok) {
          toast(r.msg, 3200);
          sfx.bad();
        } else {
          U.cwAt = -999;
          sfx.door();
        }
      });
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  function pressA() {
    if (G3 && taxiTripActive(G3)) {
      U.taxiSkip = true;
      return;
    }
    if (!G3 || U.modal || U.act || G3.blocked() || !G3.canWalk()) return;
    const t = targetsFor(G3, curList());
    if (!t.length) {
      toast("\u76EE\u306E\u524D\u306B\u306F\u4F55\u3082\u3042\u308A\u307E\u305B\u3093");
      return;
    }
    actOn(t[0]);
  }
  function actOn(tg) {
    if (!G3 || U.modal || U.act || G3.blocked() || !G3.canWalk()) return;
    const acts = targetActions(G3, tg);
    if (tg.kind === "door") {
      const r = tryEnter(G3, tg.b);
      if (r.directory != null) {
        showDirectory(r.directory);
        return;
      }
      if (r.gas != null) {
        fuelModal(G3, r.gas, carD());
        return;
      }
      if (r.dealer != null) {
        dealerModal(G3, r.dealer, carD());
        return;
      }
      if (r.used != null) {
        usedModal(G3, r.used, carD());
        return;
      }
      if (!r.ok) {
        toast(r.msg, 3200);
        sfx.bad();
      } else {
        U.cwAt = -999;
        sfx.door();
      }
      return;
    }
    showModal(`<h2>${esc4(tg.label)}</h2>${tg.kind === "npc" ? npcStatusHtml(tg.id) : ""}<div class="list">${acts.map((a, i) => `<button class="btn item" data-i="${i}" ${a.disabled ? "disabled" : ""}>${esc4(a.label)}</button>`).join("")}</div><div class="row">${btn("\u3084\u3081\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = () => doAction(acts[+b.dataset.i], tg));
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  function stepActFrame(dt) {
    const L2 = G3.S.loc, act = U.act;
    if (L2.k !== "in") {
      U.act = null;
      R4.heroPose = null;
      return;
    }
    const res = stepAct(act, dt, L2, { onRest: (mins, eff) => {
      G3.advance(mins);
      act.msg = act.A.msg + G3.chg(eff);
      if (act.after) act.after();
    } });
    R4.heroPose = res.pose;
    L2.moving = !!L2.moving && act.phase === "walk";
    updateHint();
    updateHud();
    if (res.done) {
      U.act = null;
      R4.heroPose = null;
      L2.moving = false;
      if (act.msg) toast(act.msg, 4200);
      if (G3.blocked()) setTimeout(openPrompt, 100);
    }
  }
  function doAction(a, tg) {
    if (a.id.startsWith("bath:") && tg && tg.o && SEAT_T.has(tg.o.t) && G3.S.loc.k === "in") {
      const pre = bathPrep(G3, tg, a.id.split(":")[1]);
      if (!pre.ok) {
        toast(pre.msg);
        sfx.bad();
        return;
      }
      closeModal();
      const L2 = G3.S.loc;
      const { I: I2 } = interiorOf(G3, L2.b, L2.floor);
      const r2 = beginSit(G3, I2, tg.o, U.people, { x: L2.x, y: L2.y, f: L2.f }, pre.rot ? "rbath" : "bath");
      if (!r2.ok) {
        toast(r2.msg);
        sfx.bad();
        return;
      }
      G3.pay(pre.pr, "\u5165\u6D74");
      sfx.coin();
      r2.act.after = () => {
        G3.S.washedAt = null;
      };
      r2.act.A.msg = pre.rot ? pre.night ? "\u884C\u706F\u306E\u660E\u304B\u308A\u306E\u4E0B\u3001\u661F\u7A7A\u306E\u9732\u5929\u98A8\u5442\u306B\u8EAB\u3092\u3072\u305F\u3057\u307E\u3057\u305F\u3002" : "\u6E6F\u3051\u3080\u308A\u306E\u5411\u3053\u3046\u306B\u6728\u3005\u3092\u773A\u3081\u306A\u304C\u3089\u3001\u9732\u5929\u98A8\u5442\u306B\u3086\u3063\u305F\u308A\u3064\u304B\u308A\u307E\u3057\u305F\u3002" : "\u304A\u6E6F\u306B\u3086\u3063\u305F\u308A\u3064\u304B\u308A\u307E\u3057\u305F\u3002";
      U.act = r2.act;
      return;
    }
    if (a.id === "relax" && tg && tg.o && SEAT_T.has(tg.o.t) && G3.S.loc.k === "in") {
      closeModal();
      const L2 = G3.S.loc;
      const { I: I2 } = interiorOf(G3, L2.b, L2.floor);
      const r2 = beginSit(G3, I2, tg.o, U.people, { x: L2.x, y: L2.y, f: L2.f });
      if (!r2.ok) {
        toast(r2.msg);
        sfx.bad();
        return;
      }
      U.act = r2.act;
      return;
    }
    closeModal();
    const before = G3.S.min;
    const money0 = G3.hero.money;
    const r = runAction(G3, a.id, tg);
    U.cwAt = -999;
    if (G3.hero.money < money0) sfx.coin();
    if (r.ui) return specialUI(r, tg);
    if (r.msg) toast(r.msg, 4200);
    if (G3.blocked()) setTimeout(openPrompt, 100);
  }
  function specialUI(r, tg) {
    if (r.ui === "fx_goroom") {
      if (r.msg) toast(r.msg, 5200);
      const h = G3.S.hotel;
      if (h) setTimeout(() => navTo({ kind: "bld", b: h.b, unit: h.room }, { label: `${roomNo(decodeUnit(h.room).lv, decodeUnit(h.room).pos)}号室` }), 400);
      return;
    }
    if (r.ui === "fx_move") return moveModal();
    if (r.ui === "fx_scene") return facScene(r.scene, r.msg);
    if (r.ui === "guide") {
      const gb = G3.bld(G3.S.loc.b);
      return showModal(`<h2>${esc4(gb.name)} \u30D5\u30ED\u30A2\u30AC\u30A4\u30C9</h2><div class="tx small" style="white-space:pre-line;text-align:left">${esc4(r.msg)}</div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
        c.querySelector(".row .btn").onclick = closeModal;
      });
    }
    if (r.ui === "jticket") return jTicketModal(r.mode);
    if (r.ui === "jboard") return jBoardModal(r.mode);
    if (r.ui === "jinfo") return jInfoModal();
    if (r.ui === "shuttle") return jShuttle();
    if (r.ui === "firm") return firmModal(G3, carD());
    if (r.ui === "shop") return shopModal(G3, G3.S.loc.b, carD(), tg && tg.o ? tg.o.label : "");
    if (r.ui === "fitting") return fittingModal(G3, R4, G3.S.loc.b, carD());
    if (r.ui === "voc") return vocModal(G3, G3.S.loc.b, carD());
    if (r.ui === "hair") return hairModal(G3, R4, G3.S.loc.b, carD());
    if (r.ui === "dealer") {
      const db = G3.bld(G3.S.loc.b);
      return (db.type === "usedcar" ? usedModal : dealerModal)(G3, db.idx, carD());
    }
    if (r.ui === "jobs") return jobsModal(r.filterB ?? -1);
    if (r.ui === "housing") return housingModal();
    if (r.ui === "finance") return financeModal();
    if (r.ui === "biz") return bizModal();
    if (r.ui === "rail") return railModal();
    if (r.ui === "timetable") return timetableModal();
    if (r.ui === "profile") return profileModal(r.id);
  }
  function jobsModal(filterB) {
    const v = G3.vacanciesNear(18, filterB);
    const h = G3.hero;
    showModal(`<h2>\u6C42\u4EBA${filterB >= 0 ? "(\u3053\u306E\u8077\u5834)" : "(\u81EA\u5B85\u306B\u8FD1\u3044\u9806)"}</h2><div class="tx small">\u5E74\u9F62\u30FB\u5B66\u6B74\u30FB\u8CC7\u683C\u3092\u6E80\u305F\u3059\u6C42\u4EBA\u3060\u3051\u8868\u793A\u3057\u307E\u3059\u3002${G3.isStudentNow() ? "(\u5728\u5B66\u4E2D\u306F\u30A2\u30EB\u30D0\u30A4\u30C8\u306E\u307F)" : ""}
\u7D66\u4E0E\u306F\u6708\u53CE\u306E\u76EE\u5B89(\u4EEE\u30D1\u30E9\u30E1\u30FC\u30BF)\u3002</div>${h.job ? `<div class="tx">\u73FE\u5728: ${esc4(JOBS[h.job.jobId].name)}(${esc4(G3.bld(h.job.b).name)}) ${btn("\u3053\u306E\u4ED5\u4E8B\u3092\u3084\u3081\u308B", "sec")}</div>` : ""}<div class="list">${v.length ? v.map((o, i) => `<button class="btn item" data-s="${o.s}">${esc4(G3.bld(o.b).name)} \u2014 ${esc4(JOBS[o.jobId].name)} <span class="small">\u6708 \u7D04${yen4(JOBS[o.jobId].wage * G3.pi() * (G3.isStudentNow() ? 0.5 : 1))} \u30FB ${o.d}\u30BF\u30A4\u30EB</span></button>`).join("") : '<div class="tx">\u3044\u307E\u5FDC\u52DF\u3067\u304D\u308B\u6C42\u4EBA\u306F\u3042\u308A\u307E\u305B\u3093\u3002(\u5B66\u6B74\u3084\u5E74\u9F62\u304C\u6761\u4EF6\u306B\u5C4A\u304B\u306A\u3044\u304B\u3001\u52DF\u96C6\u304C\u57CB\u307E\u3063\u3066\u3044\u307E\u3059\u3002\u6642\u671F\u3092\u304A\u3044\u3066\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044)</div>'}</div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = () => {
        G3.hero.flags.partTime = G3.isStudentNow() || G3.age() < 18;
        const m = G3.applyJob(+b.dataset.s);
        closeModal();
        toast(m, 3600);
      });
      const q = c.querySelector(".tx .btn");
      if (q) q.onclick = () => {
        G3.dismiss("\u81EA\u5206\u3067\u9000\u8077\u3092\u6C7A\u3081\u305F");
        closeModal();
        G3.S.queue.pop();
        toast("\u9000\u8077\u3057\u307E\u3057\u305F\u3002");
      };
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  function housingModal() {
    const L2 = housingList(G3, 15);
    const h = G3.hero;
    showModal(`<h2>\u4F4F\u307E\u3044\u3092\u63A2\u3059</h2><div class="tx small">\u5F15\u3063\u8D8A\u3057\u306B\u306F\u5BB6\u8CC32\u304B\u6708\u5206(\u6577\u91D1\u30FB\u8CBB\u7528)\u304C\u5FC5\u8981\u3067\u3059\u3002\u8CFC\u5165\u306F\u982D\u91D12\u5272+\u8AF8\u8CBB\u75285%\u3001\u6B8B\u308A\u306F35\u5E74\u30ED\u30FC\u30F3(\u9280\u884C\u306E\u7A93\u53E3\u3067\u8CC7\u7523\u306E\u76F8\u8AC7\u3082\u3067\u304D\u307E\u3059)\u3002</div><div class="list">${L2.map((o) => {
      const q = buyQuote(G3, o.b);
      return `<div class="item"><div>${esc4(o.name)}(${esc4(o.type === "apt" ? "\u30A2\u30D1\u30FC\u30C8" : o.type === "house" ? "\u4E00\u8ED2\u5BB6" : "\u30BF\u30EF\u30FC")}) <span class="small">${esc4(o.addr)} \u30FB ${o.d}\u30BF\u30A4\u30EB</span></div><div class="row"><button class="btn" data-b="${o.b}">\u501F\u308A\u308B \u5BB6\u8CC3${yen4(o.rent)}/\u6708</button><button class="btn acc" data-buy="${o.b}">\u8CB7\u3046 ${yen4(q.price)}(\u6708${yen4(q.pay)})</button></div></div>`;
    }).join("")}</div><div class="row"><button class="btn acc" id="realty">\u4E0D\u52D5\u7523\u306E\u8CC7\u7523\u7BA1\u7406(\u58F2\u5374\u30FB\u8CC3\u8CB8\u30FB\u571F\u5730)</button>${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelector("#realty").onclick = () => realtyModal(G3, carD());
      c.querySelectorAll("button[data-b]").forEach((b) => b.onclick = () => {
        const r = moveTo(G3, +b.dataset.b);
        closeModal();
        toast(r.msg, 3600);
      });
      c.querySelectorAll("button[data-buy]").forEach((b) => b.onclick = () => {
        const r = buyHome(G3, +b.dataset.buy);
        if (!r.ok) {
          toast(r.msg, 3600);
          return;
        }
        sfx.coin();
        closeModal();
        toast(r.msg, 3600);
        updateHud(true);
      });
      c.querySelector(".row .btn:last-child").onclick = closeModal;
    });
  }
  function bizModal() {
    const b = biz(G3);
    if (!b) return;
    const rp = b.last || monthlyReport(G3, b);
    const heirTxt = b.heir >= 12 ? "\u5341\u5206\u306B\u8EAB\u306B\u3064\u3044\u305F" : `${b.heir}/12`;
    showModal(`<h2>${esc4(b.name)}(${b.gen}\u4EE3\u76EE)</h2><div class="tx">\u8A55\u5224 ${b.rep.toFixed(1)} / 100 \u30FB \u5F93\u696D\u54E1 ${b.staff}\u4EBA \u30FB \u5F8C\u7D99\u8005\u306E\u7FD2\u719F ${heirTxt}
\u3010${b.last ? "\u5148\u6708" : "\u4ECA\u6708\u306E\u898B\u8FBC\u307F"}\u3011\u6765\u5BA2 ${rp.sold}\u4EBA(\u9700\u8981 ${rp.demand}\u30FB\u5BFE\u5FDC\u529B ${rp.cap})
\u58F2\u4E0A ${yen4(rp.rev)} \u2212 \u7D4C\u8CBB ${yen4(rp.cost)} = \u640D\u76CA ${rp.profit >= 0 ? "+" : ""}${yen4(rp.profit)}
\u4ECA\u6708\u3042\u306A\u305F\u304C\u5E97\u306B\u7ACB\u3063\u305F\u6642\u9593 ${G3.S.m.biz || 0}\u6642\u9593</div><div class="small">\u8A55\u5224\u306F\u5E97\u306B\u7ACB\u3064\u6642\u9593\u3067\u80B2\u3061\u307E\u3059\u3002\u5F93\u696D\u54E1\u3060\u3051\u306B\u4EFB\u305B\u308B\u3068\u8A55\u5224\u306F\u5C11\u3057\u305A\u3064\u4E0B\u304C\u308A\u307E\u3059\u3002</div><div class="row" style="flex-wrap:wrap"><button class="btn" data-w="hire">\u5F93\u696D\u54E1\u3092\u96C7\u3046(\u6708\u7D66 ${yen4(G3.yen(17e4))})</button><button class="btn" data-w="fire">\u5F93\u696D\u54E1\u3092\u6E1B\u3089\u3059</button><button class="btn" data-w="ad">\u5E83\u544A(${yen4(G3.yen(5e4))})</button><button class="btn" data-w="reno">\u6539\u88C5(${yen4(G3.yen(8e5))})</button><button class="btn" data-w="teach">\u5B50\u306B\u4ED5\u4E8B\u3092\u6559\u3048\u308B(2\u6642\u9593)</button></div><div class="row"><button class="btn sec" data-w="close">\u5E97\u3092\u7573\u3080</button>${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button[data-w]").forEach((bt) => bt.onclick = () => {
        if (bt.dataset.w === "close" && !confirm("\u672C\u5F53\u306B\u5E97\u3092\u7573\u307F\u307E\u3059\u304B?")) return;
        const r = adjust(G3, bt.dataset.w);
        if (r.msg) toast(r.msg, 3e3);
        closeModal();
        if (r.ok && bt.dataset.w !== "close") bizModal();
        updateHud(true);
      });
      const bs = c.querySelectorAll(".row .btn");
      bs[bs.length - 1].onclick = closeModal;
    });
  }
  function financeModal() {
    const h = G3.hero, iv = getInvest(h), m = h.mort;
    const gain = Math.round(iv.bal - iv.paid);
    showModal(`<h2>\u9280\u884C\u306E\u7A93\u53E3</h2><div class="tx">${m ? `\u4F4F\u5B85\u30ED\u30FC\u30F3 \u6B8B\u308A ${yen4(m.bal)}(\u6708${yen4(m.pay)}\u30FB\u6B8B\u308A${Math.ceil(m.left / 12)}\u5E74\u30FB\u5E74\u5229${(m.rate * 100).toFixed(1)}%)` : "\u4F4F\u5B85\u30ED\u30FC\u30F3: \u306A\u3057"}
\u6301\u3061\u5BB6: ${h.owned.includes(h.homeB) ? esc4(G3.homeName()) + "(\u58F2\u5374\u898B\u8FBC " + yen4(sellValue(G3, h.homeB)) + ")" : "\u306A\u3057"}

\u3010\u7A4D\u7ACB\u6295\u8CC7\u3011(\u5143\u672C\u4FDD\u8A3C\u306A\u3057\u30FB\u5024\u52D5\u304D\u3042\u308A)
\u904B\u7528\u4E2D ${yen4(investValue(h))}(\u5143\u672C ${yen4(iv.paid)} / \u640D\u76CA ${gain >= 0 ? "+" : ""}${yen4(gain)})
\u6BCE\u6708\u306E\u7A4D\u7ACB: ${iv.monthly ? yen4(G3.yen(iv.monthly)) : "\u306A\u3057"}</div><div class="small">\u6BCE\u6708\u306E\u7A4D\u7ACB\u984D</div><div class="row" style="flex-wrap:wrap">${INVEST_STEPS.map((k) => `<button class="btn ${iv.monthly === k ? "acc" : ""}" data-k="${k}">${k ? yen4(G3.yen(k)) : "\u3084\u3081\u308B"}</button>`).join("")}</div><div class="row"><button class="btn" id="wd">\u5168\u984D\u3092\u5F15\u304D\u51FA\u3059</button><button class="btn" id="stk">\u682A\u5F0F\u3092\u898B\u308B(\u67B6\u7A7A\u4F01\u696D)</button>${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button[data-k]").forEach((b) => b.onclick = () => {
        setMonthly(G3, +b.dataset.k);
        closeModal();
        financeModal();
      });
      c.querySelector("#stk").onclick = () => {
        closeModal();
        stockModal();
      };
      c.querySelector("#wd").onclick = () => {
        const r = withdrawInvest(G3);
        toast(r.msg, 3e3);
        closeModal();
        updateHud(true);
      };
      const bs = c.querySelectorAll(".row .btn");
      bs[bs.length - 1].onclick = closeModal;
    });
  }
  function stockModal(msg = "") {
    const H4 = getStocks(G3.hero);
    const rows2 = COMPANIES.map((c) => {
      const px2 = priceOf2(G3, c.id), ch = changeOf(G3, c.id), h = H4[c.id];
      return `<tr><td>${esc4(c.name)}</td><td class="r">${yen4(px2)}</td><td class="r" style="color:${ch >= 0 ? "#ff8a80" : "#80d8ff"}">${ch >= 0 ? "+" : ""}${(ch * 100).toFixed(1)}%</td><td class="r">${h ? h.n + "\u682A" : "-"}</td><td><button class="btn" data-b="${c.id}">\u8CB7</button><button class="btn" data-s="${c.id}" ${h ? "" : "disabled"}>\u58F2</button></td></tr>`;
    }).join("");
    showModal(`<h2>\u682A\u5F0F(\u67B6\u7A7A\u306E\u4F01\u696D)</h2><div class="tx small">10\u682A\u5358\u4F4D\u3002\u624B\u6570\u65990.55%\u3001\u5229\u76CA\u306B\u306F20%\u306E\u7A0E\u3002\u682A\u4FA1\u306F\u4E0A\u304C\u308B\u3053\u3068\u3082\u4E0B\u304C\u308B\u3053\u3068\u3082\u3042\u308A\u3001\u5143\u672C\u306F\u4FDD\u8A3C\u3055\u308C\u307E\u305B\u3093\u3002\u4F01\u696D\u30FB\u682A\u4FA1\u306F\u3059\u3079\u3066\u30B2\u30FC\u30E0\u7528\u306E\u67B6\u7A7A\u30FB\u4EEE\u8A2D\u5B9A\u3067\u3059\u3002
${msg ? esc4(msg) + "\n" : ""}\u4FDD\u6709\u306E\u6642\u4FA1 ${yen4(holdingsValue(G3))} / \u6240\u6301\u91D1 ${yen4(G3.hero.money)}</div><table class="t"><tr><th>\u4F1A\u793E</th><th class="r">\u682A\u4FA1</th><th class="r">\u524D\u6708\u6BD4</th><th class="r">\u4FDD\u6709</th><th></th></tr>${rows2}</table><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button[data-b]").forEach((b) => b.onclick = () => {
        const r = buyStock(G3, b.dataset.b, 1);
        closeModal();
        stockModal(r.msg);
        updateHud(true);
      });
      c.querySelectorAll("button[data-s]").forEach((b) => b.onclick = () => {
        const r = sellStock(G3, b.dataset.s, 1);
        closeModal();
        stockModal(r.msg);
        updateHud(true);
      });
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  function railModal() {
    const b = G3.bld(G3.S.loc.b);
    const from = b.stationId;
    if (!from) {
      toast("\u3053\u3053\u306F\u99C5\u3067\u306F\u3042\u308A\u307E\u305B\u3093");
      return;
    }
    const rows2 = G3.world.map.stations.filter((s) => s.id !== from).map((s) => {
      const T4 = planTrip(G3, from, s.id);
      return { s, T: T4 };
    }).filter((x) => x.T);
    const t0 = G3.absMin();
    const hm2 = (t) => {
      const m = (t % 1440 + 1440) % 1440;
      return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
    };
    showModal(`<h2>${esc4(b.name)} \u2014 \u96FB\u8ECA\u306B\u4E57\u308B</h2><div class="tx small">\u73FE\u5728 ${hm2(t0)} \u30FB \u9752\u6D77\u7DDA/\u6771\u897F\u74B0\u72B6\u7DDA(\u9752\u6D77\u4E2D\u592E\u3067\u4E57\u63DB)\u3002\u904B\u8CC3\u30FB\u6642\u523B\u306F\u30B2\u30FC\u30E0\u5185\u306E\u4EEE\u8A2D\u5B9A\u3067\u3059\u3002</div><table class="t"><tr><th>\u884C\u304D\u5148</th><th>\u767A</th><th>\u7740</th><th>\u904B\u8CC3</th><th></th></tr>${rows2.map(({ s, T: T4 }) => `<tr><td>${esc4(s.name)}${T4.plan.legs.length > 1 ? ' <span class="pill">\u4E57\u63DB</span>' : ""}</td><td>${T4.sim.ok ? hm2(T4.sim.legs[0].board) : "-"}</td><td>${T4.sim.ok ? hm2(T4.sim.arrive) : "-"}</td><td class="r">${yen4(T4.fare)}</td><td>${T4.sim.ok ? `<button class="btn" data-to="${s.id}" ${G3.hero.money < T4.fare ? "disabled" : ""}>\u306E\u308B</button>` : "\u7D42\u96FB\u5F8C"}</td></tr>`).join("")}</table><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button[data-to]").forEach((bt) => bt.onclick = () => {
        closeModal();
        const r = startRide(G3, from, bt.dataset.to);
        if (!r.ok) {
          toast(r.msg, 3600);
          return;
        }
        sfx.train();
        rideScreen(r.ride);
      });
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  var RD = { on: false, ride: null, acc: 0, rate: 2, last: 0, raf: 0, msg: "" };
  function sceneIds(kind, key) {
    const pop = G3.world.pop, out = [];
    for (let k = 0; k < 400 && out.length < (kind === "bus" ? 11 : 1); k++) {
      const id = hash2(G3.absMin() * 31 + key, k + (kind === "bus" ? 11 : 5)) % pop.n;
      if (pop.gone[id] || pop.home[id] < 0 || id === G3.hero.id || G3.ageOf(id) < (kind === "bus" ? 6 : 24) || G3.ageOf(id) > 75) continue;
      out.push(id);
    }
    return out;
  }
  function playScene(sc, done) {
    const el = $("ride"), cv2 = $("ridecv");
    el.classList.add("on");
    U.modal = true;
    RD.on = false;
    $("ridebar").innerHTML = '<button data-a="skip">\u3068\u3070\u3059</button>';
    $("rideinfo").textContent = sc.text || "";
    cv2.width = Math.round(cv2.clientWidth * (devicePixelRatio || 1));
    cv2.height = Math.round(cv2.clientHeight * (devicePixelRatio || 1));
    let ended = false, raf = 0;
    const t0 = performance.now();
    const end = () => {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      el.classList.remove("on");
      U.modal = false;
      U.cwAt = -999;
      try {
        done && done();
      } catch (e) {
      }
    };
    $("ridebar").querySelector("button").onclick = end;
    window.__scene = { end, sc };
    const loop = (ts) => {
      if (ended) return;
      const t = (ts - t0) / 1e3;
      R4.drawScene(cv2, sc, t);
      if (t >= sc.dur) end();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  function rideScreen(ride) {
    const el = $("ride"), cv2 = $("ridecv");
    el.classList.add("on");
    RD.on = true;
    RD.ride = ride;
    RD.acc = 0;
    RD.rate = 2;
    RD.msg = "";
    U.modal = true;
    RD.last = performance.now();
    const bar = $("ridebar");
    bar.innerHTML = `<button data-a="sit">\u5EA7\u308B/\u7ACB\u3064</button><button data-a="talk">\u8A71\u3057\u304B\u3051\u308B</button><button data-a="give">\u5E2D\u3092\u3086\u305A\u308B</button><button data-a="fast">\u306F\u3084\u304A\u304F\u308A</button><button data-a="skip">\u964D\u308A\u308B\u307E\u3067\u9032\u3081\u308B</button>`;
    bar.querySelectorAll("button").forEach((b) => b.onclick = () => rideAction(b.dataset.a));
    cv2.width = cv2.clientWidth * (devicePixelRatio || 1);
    cv2.height = cv2.clientHeight * (devicePixelRatio || 1);
    cancelAnimationFrame(RD.raf);
    RD.raf = requestAnimationFrame(rideLoop);
  }
  function rideAction(a) {
    const ride = RD.ride;
    if (!ride) return;
    const t = G3.absMin();
    const inf = ride.info(t);
    if (a === "sit") RD.msg = ride.toggleSit(t);
    else if (a === "give") RD.msg = ride.giveSeat(t);
    else if (a === "fast") {
      RD.rate = RD.rate >= 8 ? 2 : RD.rate * 2;
      RD.msg = `\u901F\u5EA6 x${RD.rate / 2}`;
    } else if (a === "skip") {
      RD.rate = 60;
      RD.msg = "\u964D\u308A\u308B\u307E\u3067\u9032\u3081\u3066\u3044\u307E\u3059\u2026";
    } else if (a === "talk") {
      if (inf.phase !== "ride" && !(inf.waiting && inf.waiting.length)) {
        RD.msg = "\u8A71\u305B\u308B\u76F8\u624B\u304C\u3044\u307E\u305B\u3093\u3002";
        return;
      }
      const pool = inf.phase === "ride" ? inf.riders.map((r2) => r2.id) : inf.waiting.map((r2) => r2.id);
      const known = pool.find((id2) => G3.hero.rel[id2]);
      const id = known ?? pool[G3.S.rngCtr++ % pool.length];
      const r = runAction(G3, "chat", { id });
      RD.msg = r.msg || "";
    }
  }
  function rideLoop(ts) {
    if (!RD.on) return;
    const dt = Math.min(0.1, (ts - RD.last) / 1e3);
    RD.last = ts;
    const ride = RD.ride;
    const cv2 = $("ridecv");
    if (cv2.width !== Math.round(cv2.clientWidth * (devicePixelRatio || 1))) {
      cv2.width = Math.round(cv2.clientWidth * (devicePixelRatio || 1));
      cv2.height = Math.round(cv2.clientHeight * (devicePixelRatio || 1));
    }
    if (G3.blocked()) {
      $("ride").classList.remove("on");
      U.modal = false;
      openPrompt();
      const iv = setInterval(() => {
        if (!G3.blocked() && !U.modal) {
          clearInterval(iv);
          if (RD.on) {
            $("ride").classList.add("on");
            U.modal = true;
            RD.last = performance.now();
            RD.raf = requestAnimationFrame(rideLoop);
          }
        }
      }, 200);
      return;
    }
    RD.acc += dt * RD.rate;
    let whole = Math.floor(RD.acc);
    RD.acc -= whole;
    if (whole > 0) {
      const t2 = G3.absMin();
      const left = Math.max(0, Math.ceil(ride.arrive - t2));
      G3.advance(Math.min(whole, Math.max(1, left)));
    }
    const t = G3.absMin();
    const tf = t + RD.acc;
    const inf = ride.info(tf);
    if (inf.phase === "done" || t >= Math.ceil(ride.arrive)) {
      rideEnd();
      return;
    }
    if (!ride.metKnown && inf.phase === "ride") {
      const k = ride.knownAboard(t);
      if (k) {
        ride.metKnown = true;
        G3.meet(k.id, 4);
        RD.msg = `${G3.nameOf(k.id)}\u304C\u540C\u3058\u96FB\u8ECA\u306B\u4E57\u3063\u3066\u3044\u307E\u3057\u305F\u3002\u8EFD\u304F\u4F1A\u91C8\u3092\u3057\u305F\u3002`;
        G3.log("trip", `\u96FB\u8ECA\u3067${G3.nameOf(k.id)}\u3068\u4E57\u308A\u5408\u308F\u305B\u305F`, { who: k.id });
      }
    }
    R4.drawRide(cv2, ride, inf, tf);
    const hm2 = (x) => {
      const m = (Math.floor(x) % 1440 + 1440) % 1440;
      return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    };
    let txt2;
    if (inf.phase === "wait" || inf.phase === "xfer") txt2 = `${inf.station}\u99C5\u306E\u30DB\u30FC\u30E0(${hm2(t)})
${inf.phase === "xfer" ? "\u4E57\u63DB: " : ""}${inf.leg.lineName} ${inf.leg.terminus}\u65B9\u9762 ${hm2(inf.board)}\u767A\u307E\u3067\u3042\u3068${Math.max(0, Math.ceil(inf.minsToBoard))}\u5206  \u5F85\u3063\u3066\u3044\u308B\u4EBA ${inf.waiting.length}\u4EBA`;
    else if (inf.phase === "ride") txt2 = `${inf.line} ${inf.toward}\u65B9\u9762 ${hm2(t)}
${inf.atStop ? `${inf.next.name}\u306B\u505C\u8ECA\u4E2D` : `\u6B21\u306F ${inf.next.name}`}${inf.final ? "(\u7D42\u70B9\u307E\u3067\u4E57\u308A\u307E\u3059)" : ""} \u30FB \u76EE\u7684\u5730 ${inf.dest} \u30FB \u3042\u3068${Math.ceil(inf.minsLeft)}\u5206
\u4E57\u5BA2 ${inf.load}\u4EBA \u30FB \u7A7A\u5E2D ${inf.freeSeats} ${inf.sitting ? "\u30FB \u5EA7\u3063\u3066\u3044\u307E\u3059" : ""}`;
    else txt2 = "";
    if (RD.msg) txt2 += "\n" + RD.msg;
    $("rideinfo").textContent = txt2;
    $("ride").style.setProperty("--rc", inf.color || inf.leg && inf.leg.color || "#1e88e5");
    RD.raf = requestAnimationFrame(rideLoop);
  }
  function rideEnd() {
    const ride = RD.ride;
    RD.on = false;
    $("ride").classList.remove("on");
    U.modal = false;
    const msg = ride.finish();
    RD.ride = null;
    U.cwAt = -999;
    fade(false);
    toast(msg, 4200);
    if (G3.blocked()) setTimeout(openPrompt, 100);
  }
  function jTicketModal(mode2) {
    const M = MODE[mode2], list = offers(G3, mode2);
    const have = G3.S.trip;
    showModal(`<h2>${M.icon} ${esc4(M.label)}\u306E\u5207\u7B26\u58F2\u308A\u5834</h2><div class="tx small">\u904B\u8CC3\u30FB\u6642\u523B\u306F\u30B2\u30FC\u30E0\u5185\u306E\u4EEE\u8A2D\u5B9A\u3067\u3059\u3002${have ? "\n<b>\u304A\u6301\u3061\u306E\u5238: " + esc4(have.name) + "</b>" : ""}</div>${list.length ? `<table class="t"><tr><th>\u884C\u304D\u5148\u30FB\u5185\u5BB9</th><th>\u6240\u8981</th><th>\u6599\u91D1</th><th></th></tr>${list.map((o) => `<tr><td>${esc4(o.name)}${o.stub ? ' <span class="pill">\u5230\u7740\u30ED\u30D3\u30FC\u307E\u3067</span>' : ""}</td><td>${o.mins}\u5206</td><td>\xA5${o.fare.toLocaleString("ja-JP")}</td><td>${o.ok ? `<button class="btn acc" data-o="${o.id}">\u8CB7\u3046</button>` : `<span class="small">${esc4(o.reasons.map((x) => REASON[x] || x).join(" / "))}</span>`}</td></tr>`).join("")}</table>` : '<div class="tx">\u3044\u307E\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u308B\u4FBF\u306F\u3042\u308A\u307E\u305B\u3093\u3002</div>'}<div class="row">${have && have.step < 3 ? btn("\u5238\u3092\u6255\u3044\u623B\u3059", "sec") : ""}${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button[data-o]").forEach((b) => b.onclick = () => {
        const r = buyTicket(G3, mode2, b.dataset.o);
        toast(r.msg, 4200);
        if (r.ok) {
          sfx.coin();
          updateHud(true);
          closeModal();
        } else jTicketModal(mode2);
      });
      const bs = c.querySelectorAll(".row .btn");
      bs[bs.length - 1].onclick = closeModal;
      if (bs.length > 1) bs[0].onclick = () => {
        const r = refund(G3);
        toast(r.msg, 3e3);
        updateHud(true);
        jTicketModal(mode2);
      };
    });
  }
  function jInfoModal() {
    const b = G3.bld(G3.S.loc.b);
    const mode2 = b.type === "airport" ? "air" : b.type === "ferry" ? "ferry" : "bullet";
    const M = MODE[mode2];
    const now = G3.S.min;
    showModal(`<h2>${M.icon} ${esc4(b.name)} \u767A\u7740\u6848\u5185</h2><div class="tx">\u73FE\u5728 ${hm(now)}
\u6B21\u306E${mode2 === "air" ? "\u51FA\u767A" : mode2 === "ferry" ? "\u51FA\u822A" : "\u767A\u8ECA"}: ${departures(mode2, now, 5).map(hm).join(" / ") || "\u672C\u65E5\u306F\u7D42\u4E86"}</div>${G3.S.trip ? `<div class="tx small">\u304A\u6301\u3061\u306E\u5238: ${esc4(G3.S.trip.name)}</div>` : ""}<div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => c.querySelector(".btn").onclick = closeModal);
  }
  function jBoardModal(mode2) {
    const M = MODE[mode2], bi = boardInfo(G3, mode2);
    if (!bi.ok) {
      toast(bi.msg, 4200);
      return;
    }
    showModal(`<h2>${M.icon} ${esc4(G3.S.trip.name)}</h2><div class="tx">\u6B21\u306E\u4FBF\u306F ${hm(bi.dep)} \u767A\u3067\u3059(\u3042\u3068${bi.wait}\u5206)\u3002
${mode2 === "air" ? "\u642D\u4E57\u53E3\u3067\u304A\u5F85\u3061\u304F\u3060\u3055\u3044\u3002" : "\u4E57\u308A\u5834\u3067\u304A\u5F85\u3061\u304F\u3060\u3055\u3044\u3002"}</div><div class="row">${btn("\u4E57\u308B", "acc")}${btn("\u3084\u3081\u308B", "sec")}</div>`, (c) => {
      c.querySelector(".acc").onclick = () => {
        closeModal();
        const r = board(G3, mode2);
        if (!r.ok) {
          toast(r.msg, 4200);
          return;
        }
        updateHud(true);
        sfx.train && sfx.train();
        jPlay(r.scene, () => {
          const a = arrive(G3);
          if (a.back) {
            toast(a.msg, 4600);
            updateHud(true);
          } else jAwayPanel();
        });
      };
      c.querySelector(".sec").onclick = closeModal;
    });
  }
  function jPlay(scene, done) {
    const ids = sceneIds("bus", scene.mins || 7).slice(0, 8);
    playScene({ ...scene, ids: ids.slice(0, 6), stand: ids.slice(6), mode: G3.S.trip ? G3.S.trip.mode : "air" }, done);
  }
  function jAwayPanel() {
    const a = awayInfo(G3);
    if (!a) return;
    const M = MODE[a.mode];
    showModal(`<h2>${M.icon} ${esc4(a.name)} \u306B\u5230\u7740</h2><div class="tx">${esc4(a.name)}\u306E${a.mode === "air" ? "\u5230\u7740\u30ED\u30D3\u30FC" : a.mode === "ferry" ? "\u685F\u6A4B" : "\u99C5"}\u306B\u964D\u308A\u7ACB\u3061\u307E\u3057\u305F\u3002${a.stub ? "\n(\u3053\u306E\u8857\u306E\u8A73\u7D30\u30DE\u30C3\u30D7\u306F\u4ECA\u5F8C\u306E\u958B\u767A\u3067\u3059\u3002\u3044\u307E\u306F\u5230\u7740\u5730\u3067\u904E\u3054\u3057\u3066\u5E30\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002)" : ""}</div><div class="row">${btn("\u5230\u7740\u5730\u3067\u540D\u7269\u3092\u98DF\u3079\u3066\u904E\u3054\u3059(90\u5206)", "acc")}${btn("\u5E30\u308A\u306E\u4FBF\u306B\u4E57\u308B", "acc")}</div>`, (c) => {
      const bs = c.querySelectorAll(".btn");
      bs[0].onclick = () => {
        const r = stayAway(G3);
        toast(r.msg, 4200);
        updateHud(true);
        jAwayPanel();
      };
      bs[1].onclick = () => {
        closeModal();
        const r = goHome(G3);
        if (!r.ok) return;
        jPlay(r.scene, () => {
          const f2 = finishReturn(G3);
          toast(f2.msg, 4200);
          updateHud(true);
        });
      };
    });
  }
  function jShuttle() {
    const L2 = G3.S.loc, b = G3.bld(L2.b), t = shuttleTarget(G3.world.map, b);
    if (!t) {
      toast("\u9023\u7D61\u30D0\u30B9\u306F\u3042\u308A\u307E\u305B\u3093");
      return;
    }
    const ids = sceneIds("bus", 3);
    G3.advance(8);
    L2.k = "out";
    delete L2.b;
    delete L2.floor;
    L2.x = t.x;
    L2.y = t.y;
    L2.f = "d";
    updateHud(true);
    clearInteriorCache && clearInteriorCache();
    playScene({ kind: "bus", ids: ids.slice(0, 8), stand: ids.slice(8), label: `\u7A7A\u6E2F\u9023\u7D61\u30D0\u30B9 \u2192 ${t.label}`, text: `\u7A7A\u6E2F\u9023\u7D61\u30D0\u30B9(\u7D048\u5206)`, dur: 3.4 }, () => toast(`${t.label}\u306B\u7740\u304D\u307E\u3057\u305F`, 3e3));
  }
  function timetableModal() {
    const b = G3.bld(G3.S.loc.b);
    const sid = b.stationId;
    const t0 = G3.absMin();
    const hm2 = (t) => {
      const m = (t % 1440 + 1440) % 1440;
      return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
    };
    const rows2 = [];
    for (const L2 of G3.tr.lines) {
      const i = L2.stops.findIndex((s) => s.id === sid);
      if (i < 0) continue;
      for (const dir of [1, -1]) {
        const nx = (dir === 1 ? i < L2.stops.length - 1 : i > 0) ? nextDeparture(G3.tr, L2.id, dir, i, t0) : null;
        if (!nx) continue;
        const dest = L2.stops[dir === 1 ? L2.stops.length - 1 : 0].name;
        const list = [];
        let t = t0;
        for (let k = 0; k < 3; k++) {
          const n2 = nextDeparture(G3.tr, L2.id, dir, i, t);
          if (!n2) break;
          list.push(hm2(n2.at));
          t = n2.at + 1;
        }
        rows2.push(`<tr><td><span class="pill" style="background:${L2.color}">${esc4(L2.name)}</span> ${esc4(dest)}\u65B9\u9762</td><td>${list.join(" / ")}</td></tr>`);
      }
    }
    showModal(`<h2>${esc4(b.name)} \u6642\u523B\u8868</h2><table class="t">${rows2.join("") || "<tr><td>\u672C\u65E5\u306E\u904B\u8EE2\u306F\u7D42\u4E86\u3057\u307E\u3057\u305F</td></tr>"}</table><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => c.querySelector(".btn").onclick = closeModal);
  }
  function careerHtml(id, full) {
    const pv = profileView(G3.world, id, G3.S.M);
    const L2 = G3.world.lives.get(id);
    const W2 = G3.world;
    const out = [];
    out.push(`<h3>\u6210\u9577</h3><div class="tx small">\u4EBA\u751FLv ${pv.lifeLv} \u30FB ${pv.job ? esc4(JOBS[pv.job].name) + " \u8077\u696DLv " + pv.jobLv + (pv.rankName ? " \u30FB \u5F79\u8077: " + esc4(pv.rankName) : "") : "\u7121\u8077/\u5B66\u751F/\u5F15\u9000"}</div>`);
    if (pv.skills.length) out.push(`<div class="tx small">\u6280\u80FD: ${pv.skills.slice(0, 8).map((k) => `${esc4(k.name)} Lv${k.lv}`).join(" / ")}</div>`);
    if (pv.quals.length) out.push(`<div class="tx small">\u8CC7\u683C: ${pv.quals.map((q) => esc4(q.name)).join("\u3001")}</div>`);
    const hs = pv.hist.slice(-8).map((e) => esc4(histText(W2, e)));
    if (hs.length) out.push(`<h3>\u8077\u6B74\u30FB\u8EE2\u8077\u5C65\u6B74</h3><div class="tx small">${hs.join("\n")}</div>`);
    if (L2) {
      out.push(`<h3>\u4EBA\u3068\u306A\u308A</h3><div class="tx small">${esc4(L2.traits.join("\u30FB"))} \uFF0F \u8DA3\u5473: ${esc4(L2.hobby)} \uFF0F \u6C17\u5206 ${Math.round(L2.mood)}</div>`);
      out.push(`<h3>\u4EBA\u751F\u306E\u6B69\u307F</h3><div class="tx small">${L2.life.slice(-(full ? 12 : 6)).map((e) => `${1900 + Math.floor(e.M / 12)}\u5E74 ${esc4(e.text)}`).join("\n")}</div>`);
      out.push(`<h3>\u3064\u306A\u304C\u308A</h3><div class="tx small">${L2.rel.filter((r) => r.k !== "late" || full).slice(0, 8).map((r) => `${esc4(relName(r.k))}: ${esc4(G3.nameOf(r.id))}`).join(" / ") || "\u306A\u3057"}</div>`);
      out.push(`<h3>\u304A\u307C\u3048\u3066\u3044\u308B\u3053\u3068</h3><div class="tx small">${L2.mem.slice(-5).map((m) => "\u30FB" + esc4(m.text)).join("\n") || "\u306A\u3057"}</div>`);
    }
    return out.join("");
  }
  function profileModal(id) {
    const d = G3.world.describe(id);
    const r = G3.hero.rel[id];
    const p = G3.world.pop;
    const nm = G3.nameOf(id);
    const needs = d.needs ? ["", "\u8ECA\u3044\u3059\u3092\u4F7F\u3046", "\u767D\u6756\u3092\u4F7F\u3046", "", "\u8074\u3053\u3048\u306B\u304F\u3044", "", "", "", "\u652F\u63F4\u3092\u53D7\u3051\u3066\u5B66\u3076"][d.needs & 15] || "\u914D\u616E\u3042\u308A" : "";
    showModal(`<h2>${esc4(nm)}</h2><div class="tx">${d.age}\u6B73 \u30FB ${esc4(d.job)}${d.work ? "(" + esc4(d.work) + ")" : ""}
\u4F4F\u307E\u3044: ${esc4(d.home)}${d.school ? "\n\u5B66\u6821: " + esc4(d.school) : ""}
${p.spouse[id] >= 0 ? "\u30D1\u30FC\u30C8\u30CA\u30FC: " + esc4(G3.nameOf(p.spouse[id])) + "\n" : ""}${r ? `\u89AA\u3057\u3055: ${Math.round(r.aff)}/100 ${r.family ? "(\u5BB6\u65CF)" : r.romance ? "(\u4EA4\u969B\u4E2D)" : ""}` : "\u307E\u3060\u77E5\u308A\u5408\u3063\u3066\u3044\u307E\u305B\u3093"}${needs ? "\n\u66AE\u3089\u3057\u306E\u914D\u616E: " + needs : ""}
\u4EBA\u7269ID: P${String(id).padStart(5, "0")}</div>${careerHtml(id, false)}<div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => c.querySelector(".btn").onclick = closeModal);
  }
  function mapModal() {
    const L2 = G3.S.loc;
    const pos = L2.k === "out" ? { x: L2.x, y: L2.y, f: L2.f } : { x: G3.bld(L2.b).doorX, y: G3.bld(L2.b).doorY, f: "d" };
    showModal(`<h2>\u5730\u56F3\u30FB\u691C\u7D22\u30FB\u9053\u6848\u5185</h2><div class="formrow" style="justify-content:flex-start"><input id="mq" placeholder="\u540D\u524D\u30FB\u7A2E\u985E\u3067\u691C\u7D22(\u4F8B: \u75C5\u9662 / \u5B66\u6821 / \u99C5 / \u30E9\u30FC\u30E1\u30F3)" style="flex:1;min-width:200px"> ${btn("\u691C\u7D22", "acc")} <select id="mmode"><option value="0">\u5F92\u6B69</option><option value="1" ${U.routeMode === 1 ? "selected" : ""}>\u8ECA\u3044\u3059</option><option value="2" ${U.routeMode === 2 ? "selected" : ""}>\u767D\u6756</option></select></div>
  <div class="small">\u8FD1\u304F\u306E\u65BD\u8A2D: ${[["\u75C5\u9662", (b) => ["hospital", "clinic"].includes(b.type)], ["\u5B66\u6821", (b) => BTYPES[b.type].cat === "school"], ["\u99C5", (b) => b.type === "station"], ["\u30B3\u30F3\u30D3\u30CB", (b) => b.type === "konbini"], ["\u5E02\u5F79\u6240", (b) => b.type === "cityhall"]].map(([n2]) => `<span class="pill" data-q="${n2}" style="cursor:pointer">${n2}</span>`).join("")}</div>
  <div style="display:flex;gap:6px;align-items:center;margin:4px 0"><button class="btn sec" id="mzin" style="min-width:48px;min-height:44px">\uFF0B</button><button class="btn sec" id="mzout" style="min-width:48px;min-height:44px">\uFF0D</button><span class="small" id="mzl">\u5730\u56F3\u306E\u62E1\u5927\u7E2E\u5C0F</span></div><div class="small">\u9EC4\u8272\u306E\u4E38\u3068\u25B2=\u3042\u306A\u305F\u306E\u4F4D\u7F6E\u3068\u5411\u304D \u30FB \u767D\u3044\u70B9=\u3044\u307E\u5165\u308C\u308B\u5165\u53E3 \u30FB \u8D64=\u76EE\u7684\u5730\u3068\u9053\u9806 \u30FB \u767D\u3044\u4E38=\u99C5(\u8272\u306E\u7DDA=\u9244\u9053) \u30FB \u7070\u8272\u306E\u7DDA=\u9053\u8DEF \u30FB \u304F\u3059\u3093\u3060\u7DD1\u306E\u6577\u5730=\u7ACB\u5165\u4E0D\u53EF(\u5893\u5730\u30FB\u516C\u5712\u306A\u3069)</div><div id="mapwrap"><canvas id="mapcv"></canvas></div><div id="mres" class="list"></div><div class="row">${U.dest ? btn("\u6848\u5185\u3092\u3084\u3081\u308B", "sec") : ""}${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      const mc = c.querySelector("#mapcv");
      const redraw = () => {
        R4.drawMinimapTo(mc, { hero: pos, route: U.route, dest: U.dest });
      };
      redraw();
      let mz = 1;
      const wrap = c.querySelector("#mapwrap");
      const setMz = (z) => {
        const ow = mc.clientWidth;
        const oc = [(wrap.scrollLeft + wrap.clientWidth / 2) / ow, (wrap.scrollTop + wrap.clientHeight / 2) / (mc.clientHeight || 1)];
        mz = Math.max(1, Math.min(4, z));
        mc.style.width = mz * 100 + "%";
        wrap.scrollLeft = oc[0] * mc.clientWidth - wrap.clientWidth / 2;
        wrap.scrollTop = oc[1] * mc.clientHeight - wrap.clientHeight / 2;
        c.querySelector("#mzl").textContent = "\u5730\u56F3 \xD7" + mz.toFixed(1);
      };
      c.querySelector("#mzin").onclick = () => setMz(mz + 0.5);
      c.querySelector("#mzout").onclick = () => setMz(mz - 0.5);
      const mp = /* @__PURE__ */ new Map();
      let md0 = 0, mz0 = 1;
      wrap.addEventListener("pointerdown", (e) => {
        mp.set(e.pointerId, [e.clientX, e.clientY]);
        if (mp.size === 2) {
          const [a, b] = [...mp.values()];
          md0 = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
          mz0 = mz;
        }
      });
      wrap.addEventListener("pointermove", (e) => {
        if (!mp.has(e.pointerId)) return;
        const pv = mp.get(e.pointerId);
        mp.set(e.pointerId, [e.clientX, e.clientY]);
        if (mp.size === 1 && e.pointerType !== "mouse") {
          wrap.scrollLeft -= e.clientX - pv[0];
          wrap.scrollTop -= e.clientY - pv[1];
        }
        if (mp.size === 2) {
          const [a, b] = [...mp.values()];
          setMz(Math.round(mz0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / md0 * 2) / 2);
        }
      });
      const mpEnd = (e) => mp.delete(e.pointerId);
      wrap.addEventListener("pointerup", mpEnd);
      wrap.addEventListener("pointercancel", mpEnd);
      mc.onclick = (e) => {
        const r = mc.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width * G3.world.map.W, y = (e.clientY - r.top) / r.height * G3.world.map.H;
        let best = null, bd = 1e9;
        for (const b of G3.world.map.buildings) {
          const d = Math.abs(b.x + b.w / 2 - x) + Math.abs(b.y + b.h / 2 - y);
          if (d < bd) {
            bd = d;
            best = b;
          }
        }
        if (best && bd < 8) show([best]);
      };
      const show = (list) => {
        c.querySelector("#mres").innerHTML = list.length ? list.slice(0, 14).map((b) => `<button class="btn item" data-b="${b.idx}">${esc4(b.name)} <span class="small">(${esc4(BTYPES[b.type].label)}\u30FB${esc4(b.addr)}\u30FB${!BTYPES[b.type].enter ? "\u5165\u308C\u307E\u305B\u3093(\u5916\u304B\u3089\u773A\u3081\u308B)" : isOpenFor(G3, b).ok ? "\u5165\u308C\u308B" : "\u4ECA\u306F\u5165\u308C\u306A\u3044"}\u30FB\u7D04${Math.abs(b.doorX - pos.x) + Math.abs(b.doorY - pos.y) | 0}\u30BF\u30A4\u30EB)</span></button>`).join("") : '<div class="tx small">\u898B\u3064\u304B\u308A\u307E\u305B\u3093</div>';
        c.querySelectorAll("#mres button").forEach((bb) => bb.onclick = () => {
          setDest(G3.bld(+bb.dataset.b), +c.querySelector("#mmode").value);
          const rep = U.route ? describeRoute(G3.world.map, U.route, G3.bld(+bb.dataset.b).name) : ["\u7D4C\u8DEF\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093"];
          redraw();
          c.querySelector("#mres").innerHTML = `<h3>${esc4(G3.bld(+bb.dataset.b).name)}\u3078\u306E\u9053\u6848\u5185</h3><div class="tx">${rep.map((t, i) => `${i + 1}. ${esc4(t)}`).join("\n")}</div>${U.routeMode === 1 ? '<div class="small">\u8ECA\u3044\u3059\u5411\u3051: \u7802\u5730\u30FB\u7551\u30FB\u6BB5\u5DEE\u306E\u3042\u308B\u6240\u3092\u907F\u3051\u305F\u7D4C\u8DEF\u3067\u3059\u3002</div>' : ""}`;
          wireTaxi(c, +bb.dataset.b);
        });
      };
      c.querySelector(".acc").onclick = () => show(buildingMatches(G3.world, c.querySelector("#mq").value));
      c.querySelectorAll(".pill[data-q]").forEach((p) => p.onclick = () => {
        const q = p.dataset.q;
        const pred = { \u75C5\u9662: (b) => ["hospital", "clinic"].includes(b.type), \u5B66\u6821: (b) => BTYPES[b.type].cat === "school", \u99C5: (b) => b.type === "station", \u30B3\u30F3\u30D3\u30CB: (b) => b.type === "konbini", \u5E02\u5F79\u6240: (b) => b.type === "cityhall" }[q];
        show(nearestOfType(G3.world, pos.x, pos.y, pred, 6).map((x) => x.b));
      });
      const bs = c.querySelectorAll(".row .btn");
      bs[bs.length - 1].onclick = closeModal;
      if (bs.length > 1) bs[0].onclick = () => {
        clearDest();
        closeModal();
      };
    });
  }
  function wireTaxi(c, bi) {
    const dest = G3.bld(bi), L2 = G3.S.loc;
    {
      const box0 = c.querySelector("#mres");
      if (box0 && U.route) {
        const ro = railOption(bi);
        box0.insertAdjacentHTML("beforeend", `<div class="row"><button class="btn acc" id="walkBtn">\u{1F6B6} \u6B69\u3044\u3066\u884C\u304F(\u81EA\u52D5\u30FB\u7D04${Math.max(1, Math.round(U.route.length / WALK_TPM))}\u5206)</button>${ro ? `<button class="btn acc" id="railBtn">\u{1F683} \u96FB\u8ECA\u3067\u884C\u304F(${esc4(ro.s1.name)}\u2192${esc4(ro.s2.name)}\u30FB\u7D04${ro.mins}\u5206\u30FB\xA5${ro.fare.toLocaleString("ja-JP")})</button>` : ""}</div>`);
        const rb = box0.querySelector("#railBtn");
        if (rb) rb.onclick = () => railGo(bi);
        box0.querySelector("#walkBtn").onclick = () => {
          closeModal();
          navTo({ kind: "bld", b: bi }, { run: U.route.length > 30 });
        };
      }
    }
    if (!U.route || G3.age() < 12 && !testBypass(G3, "age")) return;
    const tiles = U.route.length, q = taxiQuote(G3, tiles);
    const box5 = c.querySelector("#mres");
    box5.insertAdjacentHTML("beforeend", `<div class="row"><button class="btn acc" id="taxiBtn">\u{1F695} \u30BF\u30AF\u30B7\u30FC\u3067\u884C\u304F(\u7D04${q.mins}\u5206\u30FB\u7D04\xA5${q.fare.toLocaleString("ja-JP")}${q.night ? "\u30FB\u591C\u9593\u5272\u5897" : ""})</button></div>`);
    {
      const ds = nearestStop(G3.world.map, dest.doorX, dest.doorY), os = nearestStop(G3.world.map, L2.k === "out" ? L2.x : G3.bld(L2.b).doorX, L2.k === "out" ? L2.y : G3.bld(L2.b).doorY);
      if (ds && os && os.tiles <= BUS_REACH && ds.stop.id !== os.stop.id && ds.tiles < tiles - 12) {
        const bq = busQuote(G3, os.stop, ds.stop);
        box5.insertAdjacentHTML("beforeend", `<div class="row"><button class="btn" id="busBtn">\u{1F68C} \u30D0\u30B9\u3067${esc4(ds.stop.name)}\u524D\u3078(${bq.running ? `\u5F85\u3061\u7D04${bq.wait}\u5206+\u4E57\u8ECA${bq.ride}\u5206\u30FB\xA5${bq.fare.toLocaleString("ja-JP")}` : "\u904B\u884C\u6642\u9593\u5916 6:00\u301C22:30"})</button></div>`);
        c.querySelector("#busBtn").onclick = () => {
          const r = busRide(G3, ds.stop);
          if (!r.ok) {
            toast(r.msg);
            return;
          }
          sfx.car();
          closeModal();
          updateHud(true);
          const sids = sceneIds("bus", r.q.mins);
          playScene({ kind: "bus", ids: sids.slice(0, 8), stand: sids.slice(8), label: `${r.from.name}\u524D \u2192 ${ds.stop.name}\u524D`, text: `\u30D0\u30B9\u306B\u4E57\u3063\u3066\u3044\u307E\u3059(\u7D04${r.q.mins}\u5206)`, dur: 3.4 }, () => toast(r.msg + " \u76EE\u7684\u5730\u3078\u306F\u6B69\u3044\u3066\u5411\u304B\u3044\u307E\u3057\u3087\u3046", 3600));
        };
      }
    }
    c.querySelector("#taxiBtn").onclick = () => {
      const r = taxiTripBegin(G3, dest, tiles);
      if (r.ok && r.real) {
        sfx.car();
        clearDest();
        closeModal();
        updateHud(true);
        toast(r.msg, 5e3);
        return;
      }
      if (!r.ok) {
        toast(r.msg);
        return;
      }
      sfx.car();
      clearDest();
      closeModal();
      updateHud(true);
      playScene({ kind: "taxi", ids: sceneIds("taxi", r.q.mins), fare: r.q.fare, text: `\u30BF\u30AF\u30B7\u30FC\u3067${dest.name}\u3078(\u7D04${r.q.mins}\u5206)`, dur: 3.2 }, () => toast(r.msg));
    };
  }
  function moveModal() {
    const L2 = G3.S.loc;
    const inB = L2.k === "in";
    const cb = inB ? G3.bld(L2.b) : null;
    const pos = inB ? { x: cb.doorX, y: cb.doorY } : { x: L2.x, y: L2.y };
    const picks = [["\u6700\u5BC4\u308A\u306E\u99C5", (b) => b.type === "station"], ["\u30B9\u30BF\u30B8\u30A2\u30E0", (b) => b.type === "stadium"], ["\u7A7A\u6E2F", (b) => b.type === "airport"], ["\u30D5\u30A7\u30EA\u30FC", (b) => b.type === "ferry"], ["\u75C5\u9662", (b) => ["hospital", "clinic"].includes(b.type)], ["\u5E02\u5F79\u6240", (b) => b.type === "cityhall"], ["\u30B3\u30F3\u30D3\u30CB", (b) => b.type === "konbini"], ["\u6E29\u6CC9", (b) => b.type === "onsenbath" || b.type === "ryokan"], ["\u5B66\u6821", (b) => BTYPES[b.type].cat === "school"]];
    showModal(`<h2>\u79FB\u52D5(\u30BF\u30AF\u30B7\u30FC\u30FB\u30D0\u30B9\u30FB\u96FB\u8ECA)</h2><div class="tx small">${inB ? esc4(cb.name) + "\u306E\u4E2D" : "\u5916"}\u306B\u3044\u307E\u3059\u3002\u884C\u304D\u5148\u3092\u9078\u3076\u3068\u3001\u30BF\u30AF\u30B7\u30FC(\u7384\u95A2\u306E\u524D\u307E\u3067)\u30FB\u30D0\u30B9(\u99C5\u524D\u306E\u505C\u7559\u6240\u307E\u3067)\u30FB\u5F92\u6B69\u306E\u9053\u6848\u5185\u304C\u51FA\u307E\u3059\u3002\u96FB\u8ECA\u306F\u99C5\u306E\u4E2D\u306E\u5238\u58F2\u6A5F\u30FB\u30DB\u30FC\u30E0\u304B\u3089\u4E57\u308A\u307E\u3059\u3002${G3.age() < 12 && !testBypass(G3, "age") ? "\n12\u6B73\u672A\u6E80\u306F\u3072\u3068\u308A\u3067\u30BF\u30AF\u30B7\u30FC\u306B\u4E57\u308C\u307E\u305B\u3093\u3002" : ""}</div>
    <div class="formrow" style="justify-content:flex-start"><input id="mq" placeholder="\u884C\u304D\u5148(\u540D\u524D\u30FB\u7A2E\u985E\u3002\u4F8B: \u99C5 / \u30B9\u30BF\u30B8\u30A2\u30E0 / \u75C5\u9662)" style="flex:1;min-width:200px"> ${btn("\u63A2\u3059", "acc")}</div>
    <div class="small">${picks.map(([n2]) => `<span class="pill" data-q="${n2}" style="cursor:pointer">${n2}</span>`).join("")}<span class="pill" data-home="1" style="cursor:pointer">\u81EA\u5B85</span></div>
    <div id="mres" class="list" style="margin-top:6px"></div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      const show = (list) => {
        c.querySelector("#mres").innerHTML = list.length ? list.slice(0, 12).map((b) => `<button class="btn item" data-b="${b.idx}">${esc4(b.name)} <span class="small">(${esc4(BTYPES[b.type].label)}\u30FB${esc4(b.addr || "")}${b.status === "closed" ? "\u30FB\u9589\u5E97\u4E2D" : ""}\u30FB\u7D04${Math.abs(b.doorX - pos.x) + Math.abs(b.doorY - pos.y) | 0}\u30BF\u30A4\u30EB)</span></button>`).join("") : '<div class="tx small">\u898B\u3064\u304B\u308A\u307E\u305B\u3093</div>';
        c.querySelectorAll("#mres button").forEach((bb) => bb.onclick = () => {
          const b = G3.bld(+bb.dataset.b);
          setDest(b, 0);
          const rep = U.route ? describeRoute(G3.world.map, U.route, b.name) : ["\u7D4C\u8DEF\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093"];
          c.querySelector("#mres").innerHTML = `<h3>${esc4(b.name)}</h3><div class="small">\u5165\u53E3: (${b.doorX},${b.doorY}) ${!BTYPES[b.type].enter ? "\u30FB\u5916\u304B\u3089\u773A\u3081\u308B\u65BD\u8A2D(\u4E2D\u306B\u306F\u5165\u308C\u307E\u305B\u3093)" : isOpenFor(G3, b).ok ? "\u30FB\u3044\u307E\u5165\u308C\u307E\u3059" : "\u30FB" + esc4(isOpenFor(G3, b).msg || "\u4ECA\u306F\u5165\u308C\u307E\u305B\u3093")}</div><div class="tx small">${rep.slice(0, 8).map((t, i) => `${i + 1}. ${esc4(t)}`).join("\n")}${rep.length > 8 ? "\n\u2026" : ""}</div><div class="row">${btn("\u5730\u56F3\u3067\u9053\u6848\u5185\u3092\u898B\u308B", "sec")}</div>`;
          c.querySelector("#mres .btn").onclick = () => {
            closeModal();
            mapModal();
          };
          wireTaxi(c, b.idx);
        });
      };
      c.querySelector(".acc").onclick = () => show(buildingMatches(G3.world, c.querySelector("#mq").value));
      c.querySelectorAll(".pill[data-q]").forEach((p) => p.onclick = () => {
        const pr = picks.find((x) => x[0] === p.dataset.q);
        show(nearestOfType(G3.world, pos.x, pos.y, pr[1], 6).map((x) => x.b));
      });
      c.querySelector(".pill[data-home]").onclick = () => show([G3.bld(G3.hero.homeB)]);
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  function planModal() {
    const h = G3.hero, d = G3.date();
    const lines = [];
    if (G3.isStudentNow()) lines.push(`\u5B66\u6821: ${esc4(G3.bld(h.edu.b).name)}(${G3.isSchoolDay() ? "\u4ECA\u65E5\u306F\u767B\u6821\u65E5\u30FB8:20\u301C15:30" : "\u4ECA\u65E5\u306F\u4F11\u307F"})`);
    if (h.job) {
      const [a, e] = G3.shiftOf(h.job);
      lines.push(`\u4ED5\u4E8B: ${esc4(JOBS[h.job.jobId].name)} @${esc4(G3.bld(h.job.b).name)} ${G3.workDayFor(h.job) ? `\u4ECA\u65E5\u306E\u52E4\u52D9 ${a}:00\u301C${e}:00` : "\u4ECA\u65E5\u306F\u4F11\u307F"} / \u4ECA\u6708\u306E\u52E4\u52D9 ${G3.S.m.hours}\u6642\u9593`);
    }
    {
      const si = scenarioInfo(G3);
      if (si) lines.push(`\u76EE\u6A19: ${esc4(si.goal)}(${si.state === "won" ? "\u9054\u6210!" : si.state === "lapsed" ? "\u671F\u9650\u5207\u308C\u30FB\u4EBA\u751F\u306F\u7D9A\u304F" : `\u3042\u3068${Math.max(0, Math.ceil((si.deadlineM - G3.S.M) / 12 * 10) / 10)}\u5E74`})`);
    }
    const hist = WORLD_EVENTS.filter((e) => e.y >= G3.year() && e.y <= G3.year() + 1).slice(0, 4);
    showModal(`<h2>\u4E88\u5B9A\u30FB\u30E1\u30E2</h2><div class="tx">${lines.join("\n") || "\u7279\u5225\u306A\u4E88\u5B9A\u306F\u3042\u308A\u307E\u305B\u3093\u3002"}

\u4F4F\u307E\u3044: ${esc4(G3.homeName())}${h.homeIsParents ? "(\u5B9F\u5BB6)" : ""}
${h.spouse != null ? "\u30D1\u30FC\u30C8\u30CA\u30FC: " + esc4(G3.nameOf(h.spouse)) : ""}</div><h3>\u8857\u306E\u30AB\u30EC\u30F3\u30C0\u30FC</h3><div class="tx small">${hist.map((e) => `${e.y}\u5E74${e.m}\u6708 ${esc4(e.text)}`).join("\n") || "(\u8FD1\u3044\u4E88\u5B9A\u306A\u3057)"}</div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => c.querySelector(".btn").onclick = closeModal);
  }
  function peopleModal() {
    const h = G3.hero;
    const ids = Object.keys(h.rel).map(Number).filter((i) => !G3.world.pop.gone[i]).sort((a, b) => h.rel[b].aff - h.rel[a].aff);
    const par = parentsOf(G3);
    const parHtml = par.length ? `<div class="tx small" style="margin-bottom:6px"><b>\u3054\u4E21\u89AA</b>
${par.map((c) => `${c.role}: ${esc4(c.name)}(${c.sex}\u30FB${c.gone ? "\u6545\u4EBA" : c.age + "\u6B73"}\u30FB${esc4(c.job)})`).join("\n")}</div><div class="row" style="margin-bottom:6px"><button class="btn sec" id="parbtn">\u4E21\u89AA\u306E\u8A73\u3057\u3044\u60C5\u5831</button></div>` : "";
    showModal(`<h2>\u4EBA\u7269(${ids.length}\u4EBA)</h2>${parHtml}<div class="list">${ids.slice(0, 60).map((i) => {
      const r = h.rel[i];
      const d = G3.world.describe(i);
      return `<button class="btn item" data-i="${i}">${esc4(G3.nameOf(i))} <span class="small">${d.age}\u6B73 \u30FB ${esc4(d.job)} \u30FB \u89AA\u3057\u3055${Math.round(r.aff)} ${r.family ? "\u30FB\u5BB6\u65CF" : ""}${r.romance ? "\u30FB\u4EA4\u969B\u4E2D" : ""}</span></button>`;
    }).join("") || '<div class="tx">\u307E\u3060\u77E5\u308A\u5408\u3044\u304C\u3044\u307E\u305B\u3093\u3002\u8857\u3067\u4EBA\u306B\u8A71\u3057\u304B\u3051\u3066\u307F\u307E\u3057\u3087\u3046\u3002</div>'}</div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = () => profileModal(+b.dataset.i));
      const cb = c.querySelectorAll(".row .btn");
      cb[cb.length - 1].onclick = closeModal;
      const pb = c.querySelector("#parbtn");
      if (pb) pb.onclick = parentsModal;
    });
  }
  function parentsModal() {
    const par = parentsOf(G3);
    showModal(`<h2>\u3054\u4E21\u89AA</h2>${par.map((c) => `<div class="tx"><b>${c.role}</b>: ${esc4(c.name)}
\u6027\u5225: ${c.sex}\u3000\u5E74\u9F62: ${c.gone ? "\u6545\u4EBA(\u4EAB\u5E74" + c.age + "\u6B73)" : c.age + "\u6B73"}
\u8077\u696D: ${esc4(c.job)}${c.work ? "(" + esc4(c.work) + ")" : ""}
\u5916\u898B: ${esc4(c.look)}
\u4E3B\u4EBA\u516C\u3068\u306E\u95A2\u4FC2: ${esc4(G3.hero.name)}\u306E${c.role}(\u5B9F\u306E${c.role === "\u7236" ? "\u7236\u89AA" : "\u6BCD\u89AA"})
\u4EBA\u7269ID: P${String(c.id).padStart(5, "0")}</div><div class="row"><button class="btn sec" data-p="${c.id}">\u3053\u306E\u4EBA\u3092\u898B\u308B</button></div>`).join("")}<div class="tx small"><b>\u8A95\u751F\u6642\u306E\u5BB6\u5EAD</b>
${householdAtBirth(G3).map(esc4).join("\n")}</div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => profileModal(+b.dataset.p));
      const cb = c.querySelectorAll(".row .btn");
      cb[cb.length - 1].onclick = closeModal;
    });
  }
  function itemsModal() {
    const h = G3.hero;
    const sk2 = Object.entries(h.skills).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const S2 = h.stats;
    showModal(`<h2>\u6301\u3061\u7269\u30FB\u30B9\u30C6\u30FC\u30BF\u30B9</h2><div class="tx">\u6240\u6301\u91D1 ${yen4(h.money)} ${h.debt ? " / \u501F\u5165 " + yen4(h.debt) : ""}
\u98DF\u6750\u30B9\u30C8\u30C3\u30AF ${h.inv.food.toFixed(1)}
\u5B66\u6B74: ${["\u672A\u5C31\u5B66", "", "\u5C0F\u5B66\u6821\u5352", "\u4E2D\u5B66\u6821\u5352", "\u9AD8\u6821\u5352", "\u5927\u5B66\u5352"][h.edu.level] || "-"}${h.edu.cur ? " / \u5728\u5B66\u4E2D" : ""}
\u6027\u5225: ${sexLabel(sexOf(G3))}
\u8CC7\u683C: ${Object.keys(h.quals).map((k) => QUALS[k]).join("\u3001") || "\u306A\u3057"}
\u4ED5\u4E8B: ${h.job ? JOBS[h.job.jobId].name + "@" + G3.bld(h.job.b).name : "\u306A\u3057"}
</div><h3>\u30B9\u30C6\u30FC\u30BF\u30B9</h3><div class="tx">\u5065\u5EB7 ${Math.round(S2.health)} \u30FB \u4F53\u529B ${Math.round(S2.energy)} \u30FB \u6E80\u8179 ${Math.round(S2.hunger)} \u30FB \u6C17\u5206 ${Math.round(S2.mood)}
\u5B66\u529B ${Math.round(S2.intel)} \u30FB \u904B\u52D5 ${Math.round(S2.fitness)} \u30FB \u793E\u4EA4 ${Math.round(S2.social)} \u30FB \u9B45\u529B ${Math.round(S2.charm)}</div>${careerHtml(h.id, true)}${drinkHtml()}${vehicleHtml()}<div class="row"><button class="btn" id="closetBtn">\u{1F455} \u30AF\u30ED\u30FC\u30BC\u30C3\u30C8(\u670D\u3092\u7740\u66FF\u3048\u308B)</button></div><h3>\u5F97\u610F\u306A\u3053\u3068</h3><div class="tx small">${sk2.map(([k, v]) => `${esc4(k)} ${v.toFixed(1)}`).join(" / ") || "\u307E\u3060\u3042\u308A\u307E\u305B\u3093"}</div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      bindCarsPanel(c, G3, carD());
      c.querySelectorAll("button[data-drink]").forEach((b) => b.onclick = () => {
        const r = drinkGoods(G3, b.dataset.drink);
        toast(r.msg, 3600);
        if (r.ok) {
          updateHud(true);
        }
        itemsModal();
      });
      c.querySelector("#closetBtn").onclick = () => closetModal(G3, R4, carD());
      c.querySelectorAll("button[data-veh]").forEach((b) => b.onclick = () => {
        const id = b.dataset.veh;
        const r = setRide(G3, id === "none" ? null : id);
        if (id === "car") {
          sfx.carDoor();
          setTimeout(() => sfx.engine(), 300);
        } else if (id === "none") sfx.carDoor();
        toast(r.msg, 2400);
        if (r.ok) {
          closeModal();
        }
      });
      c.querySelector(".row:last-child .btn").onclick = closeModal;
    });
  }
  var carD = () => ({ showModal, closeModal, toast, updateHud, sfx });
  function drinkHtml() {
    const L2 = drinkList(G3);
    if (!L2.length) return "";
    const left = drunkLeft(G3);
    return `<h3>\u304A\u9152(\u8CB7\u3063\u305F\u3082\u306E)</h3><div class="tx small">${left > 0 ? `\u9154\u3044\u304C\u6B8B\u3063\u3066\u3044\u307E\u3059(\u3042\u3068\u7D04${Math.ceil(left / 60)}\u6642\u9593\u306F\u4E57\u308A\u7269\u306B\u4E57\u308C\u307E\u305B\u3093)` : "\u98F2\u3080\u3068\u6C17\u5206\u304C\u4E0A\u304C\u308A\u3001\u3057\u3070\u3089\u304F\u4E57\u308A\u7269(\u8ECA\u30FB\u30D0\u30A4\u30AF\u30FB\u81EA\u8EE2\u8ECA)\u306B\u4E57\u308C\u307E\u305B\u3093\u300220\u6B73\u304B\u3089\u3002"}</div><div class="row" style="flex-wrap:wrap">${L2.map((o) => `<button class="btn" data-drink="${o.it.id}">${o.it.e} ${esc4(o.it.n)}\u3092\u98F2\u3080(\xD7${o.n})</button>`).join("")}</div>`;
  }
  function vehicleHtml() {
    const v = getVeh(G3.hero), own = Object.keys(v.own).filter((k) => k !== "car");
    const outside = G3.S.loc.k === "out";
    const cars = carsPanelHtml(G3);
    if (!own.length && !cars) return "";
    const bike = own.length ? `<h3>\u4E57\u308A\u7269</h3><div class="tx small">${own.map((k) => VEHICLES[k].name).join("\u30FB")}\u3092\u6301\u3063\u3066\u3044\u307E\u3059\u3002\u4E57\u308C\u308B\u306E\u306F\u5C4B\u5916\u3060\u3051\u3067\u3001\u5EFA\u7269\u306B\u5165\u308B\u3068\u964D\u308A\u307E\u3059\u3002</div><div class="row" style="flex-wrap:wrap">${own.map((k) => `<button class="btn ${v.ride === k ? "acc" : ""}" data-veh="${k}" ${outside ? "" : "disabled"}>${v.ride === k ? "\u4E57\u8ECA\u4E2D: " : ""}${VEHICLES[k].name}\u306B\u4E57\u308B</button>`).join("")}${v.ride === "bicycle" || v.ride === "moto" ? '<button class="btn" data-veh="none">\u964D\u308A\u308B</button>' : ""}</div>` : "";
    return bike + cars;
  }
  function diaryModal() {
    const L2 = G3.S.log.filter((e) => !["auto", "news", "event", "history"].includes(e.kind) || e.kind === "news" && G3.hero.rel[e.who]?.aff >= 60).slice(-80).reverse();
    showModal(`<h2>\u65E5\u8A18(\u3053\u308C\u307E\u3067\u306E\u51FA\u6765\u4E8B)</h2><div class="tx small">\u30ED\u30B0 ${G3.S.log.length}\u4EF6(\u30A8\u30F3\u30C7\u30A3\u30F3\u30B0\u306E\u56DE\u60F3\u306F\u3001\u3053\u306E\u8A18\u9332\u3060\u3051\u304B\u3089\u4F5C\u3089\u308C\u307E\u3059)</div><div class="tx">${L2.map((e) => `${fmtM(e.M)} ${esc4(e.text)}`).join("\n") || "(\u307E\u3060\u4F55\u3082\u3042\u308A\u307E\u305B\u3093)"}</div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => c.querySelector(".btn").onclick = closeModal);
  }
  function skipModal() {
    showModal(`<h2>\u6642\u9593\u3092\u3059\u3059\u3081\u308B</h2><div class="tx">\u5BDD\u308B\u30FB\u30B9\u30AD\u30C3\u30D7\u4E2D\u306F\u3001\u6BCE\u65E5\u306E\u66AE\u3089\u3057(\u767B\u6821\u30FB\u52E4\u52D9\u30FB\u98DF\u4E8B\u306A\u3069)\u304C\u81EA\u52D5\u3067\u9032\u307F\u307E\u3059\u3002\u91CD\u8981\u306A\u9078\u629E(\u9032\u8DEF\u30FB\u7D50\u5A5A\u30FB\u9000\u8077\u306A\u3069)\u306E\u6240\u3067\u6B62\u307E\u308A\u307E\u3059\u3002</div><div class="list"><button class="btn item" data-k="day">\u6B21\u306E\u671D\u307E\u3067(1\u65E5)</button><button class="btn item" data-k="week">1\u9031\u9593</button><button class="btn item" data-k="month">1\u304B\u6708(\u6708\u306E\u307E\u3068\u3081\u3078)</button><button class="btn item" data-k="year">1\u5E74</button></div><div class="row">${btn("\u3084\u3081\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = () => {
        closeModal();
        const k = b.dataset.k;
        if (k === "month") skipTo(G3.S.M + 1, "1\u304B\u6708");
        else if (k === "year") skipTo(G3.S.M + 12, "1\u5E74");
        else {
          const n2 = k === "week" ? 7 : 1;
          const M0 = G3.S.M;
          let i = 0;
          while (i++ < n2 && !G3.S.ended && !G3.blocked() && G3.S.M === M0) G3.autoDay();
          G3.placeInHome();
          U.cwAt = -999;
          toast(k === "week" ? "1\u9031\u9593\u304C\u904E\u304E\u307E\u3057\u305F" : "\u671D\u306B\u306A\u308A\u307E\u3057\u305F");
          if (G3.blocked()) setTimeout(openPrompt, 100);
        }
      });
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  function soundModal() {
    const v = sfx.vol;
    const row = (k, nm) => `<div class="tx small">${nm}: <span id="v_${k}">${Math.round(v[k] * 100)}</span>%</div><input type="range" min="0" max="100" value="${Math.round(v[k] * 100)}" data-v="${k}" style="width:100%">`;
    showModal(`<h2>\u97F3\u91CF\u30FB\u5B57\u5E55</h2>${row("sfx", "\u52B9\u679C\u97F3")}${row("amb", "\u74B0\u5883\u97F3(\u96FB\u8ECA\u30FB\u8ECA\u30FB\u81EA\u7136\u30FB\u753A)")}${row("mus", "\u97F3\u697D(BGM)")}<div class="list"><button class="btn item" id="cap">\u5B57\u5E55(\u97F3\u3092\u6587\u5B57\u3067\u3082\u8868\u793A): ${v.cap ? "ON" : "OFF"}</button><button class="btn item" id="test">\u8A66\u3057\u306B\u9CF4\u3089\u3059</button></div><div class="row"><button class="btn sec" id="x">\u623B\u308B</button></div>`, (c) => {
      c.querySelectorAll("input[data-v]").forEach((i) => i.oninput = () => {
        sfx.setVol(i.dataset.v, i.value / 100);
        c.querySelector("#v_" + i.dataset.v).textContent = i.value;
      });
      c.querySelector("#cap").onclick = () => {
        sfx.setVol("cap", !sfx.vol.cap);
        soundModal();
      };
      c.querySelector("#test").onclick = () => {
        sfx.unlock();
        sfx.konbini();
        sfx.tune("shotengai_new", 8);
        sfx.caption("\u97F3\u306E\u30C6\u30B9\u30C8");
      };
      c.querySelector("#x").onclick = () => cfgModal();
    });
  }
  function devBanner() {
    let el = document.getElementById("devBanner");
    if (!el) {
      el = document.createElement("div");
      el.id = "devBanner";
      el.style.cssText = "position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:60;background:#b3261e;color:#fff;font:bold 12px sans-serif;padding:2px 10px;border-radius:0 0 8px 8px;pointer-events:none;display:none";
      el.textContent = "\u3010\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u3011\u901A\u5E38\u30BB\u30FC\u30D6\u306B\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093";
      document.body.appendChild(el);
    }
    el.style.display = isTestSession(G3) ? "block" : "none";
  }
  function devCtx() {
    return {
      G: () => G3,
      U,
      showModal,
      closeModal,
      toast,
      updateHud,
      clear: () => {
        clearDest();
        clearInteriorCache();
      },
      enterTest: (t) => {
        U.normalG = G3;
        U.scale = 1;
        start(t, true);
        devBanner();
      },
      leaveTest: () => {
        const n2 = U.normalG;
        U.normalG = null;
        U.scale = 1;
        if (n2) {
          start(n2, true);
          devBanner();
        }
      },
      showRoute: (b) => {
        setDest(b);
        mapModal();
      }
    };
  }
  function cfgModal() {
    showModal(`<h2>\u8A2D\u5B9A\u30FB\u30BB\u30FC\u30D6</h2><div class="list"><button class="btn item" data-k="s1">\u30B9\u30ED\u30C3\u30C81\u306B\u4FDD\u5B58</button><button class="btn item" data-k="s2">\u30B9\u30ED\u30C3\u30C82\u306B\u4FDD\u5B58</button><button class="btn item" data-k="exp">\u30D5\u30A1\u30A4\u30EB\u306B\u66F8\u304D\u51FA\u3059(.json)</button><button class="btn item" data-k="load">\u4FDD\u5B58\u30C7\u30FC\u30BF\u3092\u958B\u304F</button><button class="btn item" data-k="lang">Language / \u8A00\u8A9E: ${LANGS[getLang()]}</button><button class="btn item" data-k="life">\u4EBA\u751F\u306E\u9577\u3055: ${G3.S.lifeMode === "natural" ? "\u500B\u4EBA\u5DEE\u3042\u308A(\u65E9\u4E16\u3082\u3042\u308B)" : "80\u5E74\u56FA\u5B9A"}</button><button class="btn item" data-k="namefix">\u5BB6\u65CF\u306E\u540D\u5B57\u306E\u78BA\u8A8D\u30FB\u4FEE\u5FA9</button><button class="btn item" data-k="guides">\u5165\u53E3\u30FB\u968E\u6BB5\u306A\u3069\u306E\u6848\u5185\u8868\u793A: ${guidesOn() ? "ON" : "OFF"}</button><button class="btn item" data-k="snd">\u30B5\u30A6\u30F3\u30C9: ${sfx.enabled ? "ON" : "OFF"}</button><button class="btn item" data-k="vol">\u97F3\u91CF\u30FB\u5B57\u5E55\u306E\u8A2D\u5B9A</button><button class="btn item" data-k="big">\u6587\u5B57\u3092\u5927\u304D\u304F\u3059\u308B: ${U.big ? "ON" : "OFF"}</button><button class="btn item" data-k="speed">\u6642\u9593\u306E\u6D41\u308C: ${U.scale === 0 ? "\u6B62\u3081\u308B" : U.scale + "\u500D"}</button><button class="btn item" data-k="diag">\u7AEF\u672B\u8A3A\u65AD(Android\u5B9F\u6A5F\u691C\u8A3C\u30FB5\u79D2)</button><button class="btn item" data-k="title">\u30BF\u30A4\u30C8\u30EB\u3078</button></div>${devToolsEnabled() ? `<div class="tx small" style="margin-top:8px;border:1px dashed #f90;padding:6px"><b>\u{1F6E0} \u958B\u767A\u30FB\u8A66\u9A13\u7528(\u516C\u958B\u7248\u3067\u306F\u8868\u793A\u3055\u308C\u307E\u305B\u3093)</b>
\u8A66\u9A13\u7528\u306E\u6240\u6301\u91D1MAX\u306F\u901A\u5E38\u306E\u53CE\u652F\u30FB\u5B9F\u7E3E\u30FB\u30BB\u30FC\u30D6\u304B\u3089\u5206\u96E2\u3055\u308C\u307E\u3059\u3002ON\u306B\u3059\u308B\u3068\u901A\u5E38\u306E\u6240\u6301\u91D1\u3092\u9000\u907F\u3057\u3001OFF\u3067\u53B3\u5BC6\u306B\u623B\u3057\u307E\u3059\u3002
\u72B6\u614B: ${isTestMode(G3) ? "<b>ON(\u30C6\u30B9\u30C8\u4E2D)</b>" : "OFF"}</div><div class="list"><button class="btn item" data-k="tmoney">${isTestSession(G3) ? "\u3010\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u4E2D\u3011\u958B\u767A\u8005\u30D1\u30CD\u30EB(\u7D42\u4E86\u30FB\u5E74\u9F62/\u65E5\u4ED8/\u6642\u523B\u30FB\u65BD\u8A2D\u4E00\u89A7)" : "\u958B\u767A\u8005: \u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3(\u5225\u306E\u8907\u88FD\u3067\u8A66\u9A13\u3002\u901A\u5E38\u30BB\u30FC\u30D6\u306F\u5909\u308F\u308A\u307E\u305B\u3093)"}</button><button class="btn item" data-k="freeplay">${freePlayOn(G3) ? "\u81EA\u7531\u8A66\u904A\u3092OFF(\u5E74\u9F62\u306B\u3088\u308B\u884C\u52D5\u5236\u9650\u3092\u623B\u3059)" : "\u81EA\u7531\u8A66\u904A\u3092ON(\u5E74\u9F62\u5236\u9650\u3092\u89E3\u9664\u30FB\u958B\u767A\u7528)"}</button></div>` : ""}<div class="small">NAGAYAMA \u2606LAB / \u4FDD\u5B58\u306F\u300C\u4EBA\u751F\u7269\u8A9E\u30FB\u65E5\u672C\u30E2\u30C7\u30EB\u90FD\u5E02\u300D\u5C02\u7528\u306E\u9818\u57DF\u3067\u3001\u4ED6\u306E\u4F5C\u54C1\u306E\u30C7\u30FC\u30BF\u306B\u306F\u89E6\u308C\u307E\u305B\u3093\u3002</div><div class="row">${btn("\u9589\u3058\u308B", "sec")}</div>`, (c) => {
      c.querySelectorAll("button.item").forEach((b) => b.onclick = async () => {
        const k = b.dataset.k;
        if (k === "s1" || k === "s2") {
          try {
            await saveSlot(k.slice(1), G3, { name: G3.hero.name, label: fmtM(G3.S.M) + " " + G3.age() + "\u6B73" });
            toast("\u4FDD\u5B58\u3057\u307E\u3057\u305F");
          } catch (e) {
            toast("\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093: " + e.message);
          }
          closeModal();
        } else if (k === "exp") {
          const blob = new Blob([toJSON(G3.serialize())], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `nagayama_lifestory_${G3.hero.name}_${fmtM(G3.S.M)}.json`;
          a.click();
          closeModal();
        } else if (k === "load") {
          closeModal();
          const sl = await listSlots();
          sl.length ? slotMenu(sl) : toast("\u4FDD\u5B58\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093");
        } else if (k === "namefix") {
          const is = G3.nameCheck();
          if (!is.length) {
            toast("\u540D\u5B57\u3068\u5BB6\u65CF\u95A2\u4FC2\u306B\u554F\u984C\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
            return;
          }
          showModal(`<h2>\u5BB6\u65CF\u306E\u540D\u5B57\u306E\u78BA\u8A8D</h2><div class="tx">${is.map(esc4).join("<br>")}

\u3069\u3061\u3089\u306B\u5408\u308F\u305B\u307E\u3059\u304B?(\u4EBA\u7269ID\u30FB\u89AA\u5B50\u95A2\u4FC2\u306F\u5909\u308F\u308A\u307E\u305B\u3093)</div><div class="row"><button class="btn acc" id="nf1">\u5BB6\u65CF\u3092\u4E3B\u4EBA\u516C\u306E\u540D\u5B57\u306B\u5408\u308F\u305B\u308B</button><button class="btn sec" id="nf2">\u4E3B\u4EBA\u516C\u3092\u5BB6\u65CF\u306E\u540D\u5B57\u306B\u5408\u308F\u305B\u308B</button><button class="btn sec" id="nf3">\u305D\u306E\u307E\u307E\u306B\u3059\u308B</button></div>`, (c2) => {
            c2.querySelector("#nf1").onclick = () => {
              G3.repairNames("family");
              closeModal();
              toast("\u5BB6\u65CF\u306E\u540D\u5B57\u3092\u6574\u3048\u307E\u3057\u305F");
              updateHud(true);
            };
            c2.querySelector("#nf2").onclick = () => {
              G3.repairNames("hero");
              closeModal();
              toast("\u4E3B\u4EBA\u516C\u306E\u540D\u5B57\u3092\u5BB6\u65CF\u306B\u5408\u308F\u305B\u307E\u3057\u305F");
              updateHud(true);
            };
            c2.querySelector("#nf3").onclick = closeModal;
          });
        } else if (k === "guides") {
          setGuides(!guidesOn());
          toast(guidesOn() ? "\u6848\u5185\u8868\u793A\u3092ON\u306B\u3057\u307E\u3057\u305F" : "\u6848\u5185\u8868\u793A\u3092OFF\u306B\u3057\u307E\u3057\u305F");
          cfgModal();
        } else if (k === "life") {
          const nat = G3.S.lifeMode !== "natural";
          G3.setLifeMode(nat ? "natural" : "fixed");
          toast(nat ? "\u5BFF\u547D\u306B\u500B\u4EBA\u5DEE\u304C\u51FA\u307E\u3059(80\u5E74\u3088\u308A\u524D\u306B\u4EBA\u751F\u3092\u7D42\u3048\u308B\u3053\u3068\u304C\u3042\u308A\u307E\u3059)" : "80\u5E74(960\u304B\u6708)\u306E\u4EBA\u751F\u306B\u623B\u3057\u307E\u3057\u305F", 3600);
          cfgModal();
        } else if (k === "freeplay") {
          setFreePlay(G3, !freePlayOn(G3));
          toast(freePlayOn(G3) ? "\u81EA\u7531\u8A66\u904A: \u5E74\u9F62\u5236\u9650\u3092\u89E3\u9664\u3057\u307E\u3057\u305F" : "\u5E74\u9F62\u306B\u3088\u308B\u884C\u52D5\u5236\u9650\u3092\u623B\u3057\u307E\u3057\u305F");
          closeModal();
        } else if (k === "tmoney") {
          closeModal();
          devPanel(devCtx());
        } else if (k === "diag") {
          toast("5\u79D2\u9593\u3001\u63CF\u753B\u6027\u80FD\u3092\u8A08\u6E2C\u3057\u307E\u3059\u2026", 2500);
          const d = await runDiag(R4, G3, 5);
          const tx = diagText(d);
          showModal(`<h2>\u7AEF\u672B\u8A3A\u65AD</h2><pre class="tx small" style="white-space:pre-wrap;user-select:all">${esc4(tx)}</pre><div class="row"><button class="btn acc" id="cp">\u30B3\u30D4\u30FC</button><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c2) => {
            c2.querySelector("#cp").onclick = async () => {
              try {
                await navigator.clipboard.writeText(tx + "\n" + JSON.stringify(d));
                toast("\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F");
              } catch (e) {
                toast("\u30B3\u30D4\u30FC\u3067\u304D\u307E\u305B\u3093(\u9577\u62BC\u3057\u3067\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044)");
              }
            };
            c2.querySelector("#x").onclick = closeModal;
          });
          window.__diag = d;
        } else if (k === "lang") {
          setLang(nextLang());
          cfgModal();
        } else if (k === "snd") {
          sfx.set(!sfx.enabled);
          cfgModal();
        } else if (k === "vol") {
          soundModal();
        } else if (k === "big") {
          U.big = !U.big;
          document.body.classList.toggle("big", U.big);
          cfgModal();
        } else if (k === "speed") {
          U.scale = U.scale === 1 ? 2 : U.scale === 2 ? 0 : 1;
          cfgModal();
        } else if (k === "title") {
          await autosave();
          location.reload();
        }
      });
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  function endingScreen() {
    if (U.modal || U.endShown) return;
    U.endShown = true;
    const e = buildEnding(G3);
    showModal(`<h2>${esc4(G3.hero.name)}\u306E\u4EBA\u751F</h2><div class="tx">${esc4(e.summary)}</div>${e.sections.map((s) => `<h3>${esc4(s.title)}</h3><div class="tx">${s.lines.map((l) => esc4(l.text)).join("\n")}</div>`).join("")}<h3>\u6570\u5B57\u3067\u898B\u308B</h3><div class="tx small">${Object.entries(e.facts).map(([k, v]) => `${k}: ${v}`).join(" / ")}</div><div class="row">${btn("\u30BF\u30A4\u30C8\u30EB\u3078", "acc")}</div>`, (c) => c.querySelector(".btn").onclick = () => location.reload());
  }
  document.querySelectorAll("#menubar button").forEach((b) => b.onclick = () => {
    if (!G3 || U.modal || G3.blocked()) return;
    ({ map: mapModal, move: moveModal, plan: planModal, people: peopleModal, items: itemsModal, diary: diaryModal, skip: skipModal, cfg: cfgModal })[b.dataset.m]();
  });
  $("btnA").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    pressA();
  });
  $("btnB").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    input.run = !input.run;
    $("btnB").textContent = input.run ? "\u8D70\u308B\u4E2D" : "\u8D70\u308B";
    $("btnB").style.background = input.run ? "#fb8c00cc" : "#1e88e5cc";
  });
  var joy = $("joy");
  var joyId = null;
  var knob = joy.querySelector("i");
  var joyC = null;
  var JOY_REACH = 0.6, JOY_DEAD = 0.08;
  var joyCenter = () => {
    const r = joy.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, max: r.width / 2 };
  };
  // 360度アナログ: 円形の遊び・小さな指の動きで最高速・指が外へ出たら中心が追従(すぐ反対へ切り返せる)
  var joyMove = (e) => {
    const c = joyC || joyCenter();
    let dx = e.clientX - c.x, dy = e.clientY - c.y;
    let d = Math.hypot(dx, dy);
    const reach = c.max * JOY_REACH;
    if (joyC && d > c.max) {
      const k = (d - c.max) / d;
      joyC.x += dx * k;
      joyC.y += dy * k;
      dx = e.clientX - joyC.x;
      dy = e.clientY - joyC.y;
      d = Math.hypot(dx, dy);
      if (joy.classList.contains("fl")) {
        const ar = $("app").getBoundingClientRect();
        joy.style.left = joyC.x - ar.left - c.max + "px";
        joy.style.top = joyC.y - ar.top - c.max + "px";
      }
    }
    const kd = Math.min(d, c.max);
    knob.style.transform = d ? `translate(${dx / d * kd}px,${dy / d * kd}px)` : "";
    const m = Math.min(1, d / reach);
    if (m < JOY_DEAD) {
      input.x = input.y = 0;
      input.mag = 0;
      return;
    }
    input.mag = Math.min(1, (m - JOY_DEAD) / (1 - JOY_DEAD) * 1.15);
    input.x = dx / d;
    input.y = dy / d;
  };
  var resetJoy = () => {
    joyId = null;
    joyC = null;
    input.x = 0;
    input.y = 0;
    input.mag = 1;
    knob.style.transform = "";
    joy.classList.remove("fl");
    joy.style.left = joy.style.top = "";
  };
  joy.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (joyId != null) return;
    joyId = e.pointerId;
    joyC = null;
    try {
      joy.setPointerCapture(joyId);
    } catch (_) {
    }
    joyMove(e);
  });
  joy.addEventListener("pointermove", (e) => {
    if (e.pointerId === joyId) joyMove(e);
  });
  var joyEnd = (e) => {
    if (e.pointerId === joyId) resetJoy();
  };
  joy.addEventListener("pointerup", joyEnd);
  joy.addEventListener("pointercancel", joyEnd);
  joy.addEventListener("lostpointercapture", joyEnd);
  var cvPtrs = /* @__PURE__ */ new Map();
  var pinch0 = 0;
  var pinchZ = 0;
  var lastTap = { t: 0, x: 0, y: 0 };
  var zoomStep = (dz) => {
    if (!R4) return;
    if (G3 && G3.S.loc && G3.S.loc.k === "in") {
      const z0 = R4.izl ?? 1;
      R4.izl = Math.max(-2, Math.min(8, z0 + dz));
      try {
        localStorage.setItem("nls_izoom", String(R4.izl));
      } catch (_) {
      }
      return;
    }
    R4.zoomBy(dz);
    try {
      localStorage.setItem("nls_zoom", String(R4.zl));
    } catch (_) {
    }
  };
  cv.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (U.modal) return;
    cvPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now(), tap: cvPtrs.size === 0 });
    if (cvPtrs.size >= 2) {
      for (const p of cvPtrs.values()) p.tap = false;
      resetJoy();
      const [a, b] = [...cvPtrs.values()];
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      pinchZ = 0;
      return;
    }
    e.preventDefault();
    try {
      cv.setPointerCapture(e.pointerId);
    } catch (_) {
    }
    const r = cv.getBoundingClientRect();
    if (e.pointerType === "mouse" || e.clientX - r.left > r.width * 0.55 || joyId != null) return;
    const jr = joyCenter();
    joyId = e.pointerId;
    joyC = { x: e.clientX, y: e.clientY, max: jr.max };
    const ar = $("app").getBoundingClientRect();
    joy.classList.add("fl");
    joy.style.left = e.clientX - ar.left - jr.max + "px";
    joy.style.top = e.clientY - ar.top - jr.max + "px";
    knob.style.transform = "";
  });
  cv.addEventListener("pointermove", (e) => {
    const p = cvPtrs.get(e.pointerId);
    if (!p) return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (p.tap && Math.hypot(p.x - p.x0, p.y - p.y0) > 14) p.tap = false;
    if (cvPtrs.size >= 2) {
      const [a, b] = [...cvPtrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const st3 = Math.round(Math.log2(d / pinch0) * 2);
      if (st3 !== pinchZ) {
        zoomStep(st3 - pinchZ);
        pinchZ = st3;
      }
      return;
    }
    if (e.pointerId === joyId && joyC) joyMove(e);
  });
  var cvUp = (e) => {
    const p = cvPtrs.get(e.pointerId);
    cvPtrs.delete(e.pointerId);
    if (e.pointerId === joyId) resetJoy();
    if (cvPtrs.size < 2) pinch0 = 0;
    // タップ(短く・ほぼ動かさない) → その場所・建物・人・設備へ自動移動。素早く2回で走る
    if (e.type === "pointerup" && p && p.tap && performance.now() - p.t0 < 450) {
      const now = performance.now(), dbl = now - lastTap.t < 380 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40;
      lastTap = { t: now, x: e.clientX, y: e.clientY };
      showTapMark(e);
      onTap({ clientX: e.clientX, clientY: e.clientY, detail: dbl ? 2 : 1 });
    }
  };
  cv.addEventListener("pointerup", cvUp);
  cv.addEventListener("pointercancel", cvUp);
  cv.addEventListener("lostpointercapture", cvUp);
  cv.addEventListener("touchstart", (e) => {
    e.preventDefault();
  }, { passive: false });
  $("zin").addEventListener("click", () => zoomStep(1));
  $("zout").addEventListener("click", () => zoomStep(-1));
  cv.addEventListener("wheel", (e) => {
    if (U.modal) return;
    e.preventDefault();
    zoomStep(e.deltaY < 0 ? 1 : -1);
  }, { passive: false });
  var resetAllInput = () => {
    input.keys.clear();
    resetJoy();
    cvPtrs.clear();
  };
  window.addEventListener("pagehide", resetAllInput);
  sfx.setMood(() => ({ inside: !!G3 && G3.S.loc.k === "in", night: !!G3 && (G3.S.min >= 20 * 60 || G3.S.min < 6 * 60) }));
  sfx.setCaptionHook((t) => {
    const el = $("cap");
    if (!el) return;
    el.textContent = "\u266A " + t;
    el.classList.add("on");
    clearTimeout(U.capT);
    U.capT = setTimeout(() => el.classList.remove("on"), 3200);
  });
  function setStreet(on2) {
    if (on2 && G3 && G3.S.loc.k !== "out") {
      toast("\u901A\u308A\u8996\u70B9\u306F\u5C4B\u5916\u3067\u4F7F\u3048\u307E\u3059");
      return;
    }
    R4.street = !!on2;
    if (on2) {
      if (!R4.sv) initStreet(R4);
      setYawFromFacing(R4, G3.S.loc.f);
    }
    try {
      localStorage.setItem("nls_street", on2 ? "1" : "0");
    } catch (_) {
    }
    toast(on2 ? "\u901A\u308A\u8996\u70B9: \u5DE6\u53F3\u3067\u5411\u304D\u3092\u5909\u3048\u3001\u4E0A\u4E0B\u3067\u524D\u5F8C\u306B\u9032\u307F\u307E\u3059" : "\u901A\u5E38(\u30A2\u30A4\u30BD\u30E1)\u8996\u70B9\u306B\u623B\u3057\u307E\u3057\u305F", 3200);
  }
  $("zview").addEventListener("click", () => setStreet(!R4.street));
  window.addEventListener("keydown", (e) => {
    if ((e.key === "v" || e.key === "V") && G3 && R4 && !U.modal && !e.metaKey && !e.ctrlKey) setStreet(!R4.street);
  });
  window.NLSAudio = sfx;
  var unlockSnd = () => sfx.unlock();
  window.addEventListener("pointerdown", unlockSnd, { passive: true });
  window.addEventListener("keydown", unlockSnd);
  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest("button")) sfx.tap();
  });
  window.addEventListener("keydown", (e) => {
    if (U.modal) {
      if (e.key === "Escape") closeModal();
      return;
    }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    input.keys.add(k);
    if (k === "z" || k === "Enter" || k === " ") {
      pressA();
      e.preventDefault();
    }
    if (k === "m") document.querySelector("[data-m=map]").click();
    if (k.startsWith("Arrow")) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    input.keys.delete(k);
  });
  window.addEventListener("blur", () => resetAllInput());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetAllInput();
    if (document.hidden && G3 && U.started) autosave();
  });
