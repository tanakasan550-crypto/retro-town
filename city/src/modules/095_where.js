  // src/where.js
  function areaName(map2, x, y) {
    const zs = map2.regions || map2.zones;
    if (!zs || !zs.length) return "\u5E02\u5185";
    let best = null, bd = 1e9;
    for (const z of zs) {
      const rx = z.rx || 20, ry = z.ry || 12;
      const d = Math.hypot((x - z.x) / rx, (y - z.y) / ry);
      if (d < bd) {
        bd = d;
        best = z;
      }
    }
    const nm = (best.name || "\u5E02\u5185").replace(/周辺$/, "");
    return bd <= 1.15 ? nm : nm + "\u4ED8\u8FD1";
  }
  function crumbs(g, levelFn2) {
    const map2 = g.world.map, L2 = g.S.loc;
    if (L2.k !== "in") {
      const near2 = [];
      for (const b2 of map2.buildings) {
        if (b2.tenant) continue;
        if (Math.abs(b2.doorX + 0.5 - L2.x) > 3 || Math.abs(b2.doorY + 0.5 - L2.y) > 3) continue;
        near2.push([Math.hypot(b2.doorX + 0.5 - L2.x, b2.doorY + 0.5 - L2.y), b2]);
      }
      near2.sort((a, c) => a[0] - c[0]);
      const out2 = [areaName(map2, L2.x, L2.y)];
      if (near2.length) out2.push(near2[0][1].name + (BTYPES[near2[0][1].type].enter ? "\u306E\u524D" : "(\u7ACB\u5165\u4E0D\u53EF)"));
      else out2.push(g.S.loc.lv ? "\u9AD8\u67B6\u9053\u8DEF" : "\u5C4B\u5916");
      return out2;
    }
    const b = g.bld(L2.b);
    const out = [areaName(map2, b.doorX, b.doorY), b.name];
    let lv = "";
    try {
      lv = levelFn2 ? levelFn2(b, L2.floor) : "";
    } catch {
    }
    if (lv) out.push(lv);
    else if (b.floors > 1) out.push(`${L2.floor + 1}\u968E`);
    return out;
  }
  var placeLine = (g, levelFn2) => crumbs(g, levelFn2).join(" \uFF1E ");

