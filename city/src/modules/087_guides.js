  // src/guides.js
  var guidesOn = () => {
    try {
      return localStorage.getItem("nls_guides") !== "0";
    } catch (_) {
      return true;
    }
  };
  var setGuides = (on2) => {
    try {
      localStorage.setItem("nls_guides", on2 ? "1" : "0");
    } catch (_) {
    }
  };
  var COL = { door: [255, 214, 90], stairs: [120, 210, 255], elev: [150, 170, 255], exit: [120, 230, 150], closed: [170, 170, 180] };
  function ring(ctx4, P2, u, v, w, h, rgb2, a, t, near2) {
    const k = 0.55 + 0.45 * Math.sin(t * 3.2);
    const al = Math.min(1, a * (0.5 + 0.5 * k) * (near2 ? 1.25 : 1));
    const pts = [[u, v], [u + w, v], [u + w, v + h], [u, v + h]].map(([x, y]) => [P2.X(x, y), P2.Y(x, y)]);
    ctx_fill(ctx4, pts, `rgba(${rgb2},${(al * 0.22).toFixed(3)})`);
    ctx4.strokeStyle = `rgba(${rgb2},${al.toFixed(3)})`;
    ctx4.lineWidth = Math.max(2, P2.Z * (near2 ? 1.1 : 0.8));
    ctx4.beginPath();
    pts.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
    ctx4.closePath();
    ctx4.stroke();
  }
  var ctx = null;
  function ctx_fill(c, pts, col) {
    c.fillStyle = col;
    c.beginPath();
    pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
    c.closePath();
    c.fill();
  }
  function chip(c, x, y, text, rgb2, Z, bounce) {
    c.save();
    c.font = `bold ${Math.max(12, 5.4 * Z)}px sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    const w = c.measureText(text).width + 8 * Z * 0.9, h = Math.max(7.2 * Z, 17);
    const yy = y - (bounce ? Math.abs(Math.sin(performance.now() / 260)) * 2 * Z : 0);
    c.fillStyle = "rgba(20,24,40,0.82)";
    c.strokeStyle = `rgba(${rgb2},0.95)`;
    c.lineWidth = Math.max(1.5, Z * 0.5);
    c.beginPath();
    c.roundRect(x - w / 2, yy - h / 2, w, h, h / 2);
    c.fill();
    c.stroke();
    c.fillStyle = "#fff";
    c.fillText(text, x, yy + 0.3);
    c.beginPath();
    c.moveTo(x - 1.6 * Z, yy + h / 2);
    c.lineTo(x, yy + h / 2 + 2.4 * Z);
    c.lineTo(x + 1.6 * Z, yy + h / 2);
    c.fillStyle = `rgba(${rgb2},0.95)`;
    c.fill();
    c.restore();
  }
  function drawOutdoorGuides(R5, c, P2, hero, g) {
    if (!guidesOn()) return;
    ctx = c;
    const map2 = g.world.map, t = R5.time, Z = P2.Z;
    const R0 = 7.5;
    for (const b of map2.buildings) {
      const dx = b.doorX + 0.5 - hero.x, dy = b.doorY + 0.5 - hero.y;
      const d = Math.hypot(dx, dy);
      if (d > R0) continue;
      const bt = BTYPES[b.type];
      if (!bt || !bt.enter) continue;
      let ok = true, why = "";
      try {
        const o = isOpenFor(g, b);
        ok = o.ok;
        why = o.ok ? "" : "\u6642\u9593\u5916";
      } catch (_) {
      }
      const near2 = d < 2.4, rgb2 = (ok ? COL.door : COL.closed).join(",");
      const fade2 = Math.max(0, Math.min(1, (R0 - d) / 3));
      ring(c, P2, b.doorX, b.doorY, 1, 1, rgb2, 0.9 * fade2, t + b.idx, near2);
      const nm = (b.name || bt.label).slice(0, 10);
      const x = P2.X(b.doorX + 0.5, b.doorY + 0.5), y = P2.Y(b.doorX + 0.5, b.doorY + 0.5, 4.2);
      if (d < 5.5 || near2) chip(c, x, y, `${near2 ? "\u25BC " : ""}${nm}${why ? "(" + why + ")" : ""}`, rgb2, Z, near2 && ok);
    }
  }
  function drawIndoorGuides(R5, c, P2, hero, I2, g, b) {
    if (!guidesOn()) return;
    ctx = c;
    const t = R5.time, Z = P2.Z;
    const floors = b ? b.floors || 1 : 1;
    const near2 = (x, y, w = 1, h = 1) => Math.hypot(x + w / 2 - hero.x, y + h / 2 - hero.y) < 2.6;
    for (const o of I2.objs) {
      const w = o.w || 1, h = o.h || 1;
      if (o.t === "stairs_up" || o.t === "stairs_down") {
        const up = o.t === "stairs_up", to = o.to ?? 0;
        const n2 = near2(o.x, o.y);
        ring(c, P2, o.x, o.y + 0.9, w, 1, COL.stairs.join(","), 0.85, t, n2);
        chip(c, P2.X(o.x + 0.5, o.y + 1.4), P2.Y(o.x + 0.5, o.y + 1.4, 3.3), `${up ? "\u25B2 \u4E0A" : "\u25BC \u4E0B"} ${to < 0 ? "\u5730\u4E0B" + -to + "\u968E" : to + 1 + "\u968E"}\u3078`, COL.stairs.join(","), Z, n2);
      } else if (o.t === "elev") {
        const n2 = near2(o.x, o.y + 1, w, 1);
        ring(c, P2, o.x, o.y + 1, w, 1, COL.elev.join(","), 0.85, t, n2);
        chip(c, P2.X(o.x + w / 2, o.y + 1.5), P2.Y(o.x + w / 2, o.y + 1.5, 3.4), `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC(${o.lo < 0 ? "B1" : "1"}\u301C${o.hi != null ? o.hi + 1 : floors}\u968E)`, COL.elev.join(","), Z, n2);
      } else if (o.t === "esc") {
        const n2 = near2(o.x, o.y, w, h);
        ring(c, P2, o.x, o.y, w, h, COL.stairs.join(","), 0.7, t, n2);
        chip(c, P2.X(o.x + w / 2, o.y + h / 2), P2.Y(o.x + w / 2, o.y + h / 2, 2.6), "\u30A8\u30B9\u30AB\u30EC\u30FC\u30BF\u30FC", COL.stairs.join(","), Z, n2);
      }
    }
    if (I2.door && !I2.noDoor) {
      const n2 = near2(I2.door.x, I2.door.y);
      ring(c, P2, I2.door.x, I2.door.y, 1, 1, COL.exit.join(","), 0.9, t, n2);
      chip(c, P2.X(I2.door.x + 0.5, I2.door.y + 0.5), P2.Y(I2.door.x + 0.5, I2.door.y + 0.5, 3.4), n2 ? "\u25BC \u51FA\u53E3(A\u3067\u5916\u3078)" : "\u51FA\u53E3", COL.exit.join(","), Z, n2);
    }
  }

