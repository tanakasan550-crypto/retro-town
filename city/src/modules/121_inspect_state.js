  // src/inspect_state.js
  var AXES = INSPECT_AXES;
  var CH2 = { P: "PASS", F: "FAIL", U: "\u672A\u691C\u8A3C", N: "\u5BFE\u8C61\u5916" };
  function axesOf(b) {
    const t = INSPECT_TYPE[b.type] || "UUUUUUUUUU";
    const o = INSPECT_BLD[b.idx];
    const s = o ? [...t].map((c, i) => o[i] && o[i] !== "-" ? o[i] : c).join("") : t;
    return [...s].map((c) => CH2[c] || "\u672A\u691C\u8A3C");
  }
  function inspectLine(g, b, short = false) {
    const a = axesOf(b);
    const n2 = (v) => a.filter((x) => x === v).length;
    return short ? `P${n2("PASS")}/F${n2("FAIL")}/\u672A${n2("\u672A\u691C\u8A3C")}` : AXES.map((k, i) => `${k}:${a[i]}`).join(" ");
  }

