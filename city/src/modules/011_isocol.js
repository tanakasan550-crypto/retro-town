  // src/isocol.js
  var HB = (a, b = 0) => hash2(a * 73856093 ^ (b + 1) * 19349663, 1374496523) >>> 0;
  var shade = (c, f2) => {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
    if (!m) return c;
    const r = [1, 2, 3].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(m[i], 16) * f2))));
    return `rgb(${r[0]},${r[1]},${r[2]})`;
  };
  var mixc = (a, b, t) => {
    const pa = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(a), pb = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(b);
    if (!pa || !pb) return a;
    const r = [1, 2, 3].map((i) => Math.round(parseInt(pa[i], 16) * (1 - t) + parseInt(pb[i], 16) * t));
    return "#" + r.map((v) => v.toString(16).padStart(2, "0")).join("");
  };

