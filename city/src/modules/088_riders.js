  // src/riders.js
  var RIDE_UNIT = { bust: 0.8, bike: 0.5 };
  var rideReady = (R5) => !!R5;
  var cache10 = /* @__PURE__ */ new Map();
  var pending = /* @__PURE__ */ new Set();
  var version = 0;
  function raster(key, svgFn, uw, uh, wpx) {
    const w = Math.max(8, Math.round(wpx / 4) * 4), h = Math.max(8, Math.round(w * uh / uw));
    const k = key + "@" + w;
    const c = cache10.get(k);
    if (c) return c;
    if (pending.has(k)) return null;
    if (pending.size > 40 || typeof Image === "undefined" || typeof document === "undefined") return null;
    pending.add(k);
    const im = new Image();
    const v = version;
    im.onload = () => {
      pending.delete(k);
      if (v !== version) return;
      const cv2 = document.createElement("canvas");
      cv2.width = w;
      cv2.height = h;
      const x = cv2.getContext("2d");
      x.imageSmoothingEnabled = true;
      x.imageSmoothingQuality = "high";
      x.drawImage(im, 0, 0, w, h);
      cv2.uw = uw;
      cv2.uh = uh;
      if (cache10.size > 900) cache10.clear();
      cache10.set(k, cv2);
    };
    im.onerror = () => pending.delete(k);
    im.src = "data:image/svg+xml;charset=utf8," + encodeURIComponent(wrapSVG(uw, uh, svgFn()));
    return null;
  }
  var sk = (s) => `${s.skin}${s.hair}${s.shirt}${s.pants}${s.hairKey}${s.eye}${s.brow}${s.mouth}${s.glass}${s.facial}${s.faceRx}${s.faceRy}${s.lash}${s.freckles}${s.mole}${s.wrinkle}${s.iris}${s.body || ""}${s.helmet || ""}`;
  function riderSpec(R5, id, look, age, extra = {}) {
    let s = { ...DEFAULT_SPEC };
    try {
      const d = R5.lifeDesc(id, look, age, {});
      const I2 = d.I, A2 = d.A, k = d.col;
      Object.assign(s, faceDims(A2.faceShape ?? I2.faceShape), { skin: k.skin, skinSh: k.skinS, hair: k.hair, hairSh: k.hairS, shirt: k.top, shirtSh: k.topS, pants: k.bottom, pantsSh: k.bottomS, eye: A2.eye, lash: A2.lash ? 1 : 0, brow: A2.brow, mouth: A2.mouth, hairKey: A2.hair, glass: A2.glass || "", facial: A2.facial || "", freckles: A2.freckles ? 1 : 0, mole: A2.mole || 0, wrinkle: A2.wrinkle || 0, fem: !!A2.fem, iris: ["#2a2230", "#3a6ab8", "#3a8a5a"][A2.iris | 0] || "#2a2230" });
    } catch (e) {
    }
    return Object.assign(s, extra);
  }
  var riderColors = riderSpec;
  function drawBust(R5, ctx4, spec, view, cx, cy, unitPx, o = {}) {
    const sc = unitPx * (o.scale || 1);
    const c = raster(`bust|${view}|${sk(spec)}|${o.helmet ? 1 : 0}`, () => bustSVG(view, spec, o), 20, 20, 20 * sc);
    if (!c) return false;
    const w = 20 * sc, h = 20 * sc;
    if (o.flip) {
      ctx4.save();
      ctx4.translate(cx, 0);
      ctx4.scale(-1, 1);
      ctx4.drawImage(c, -w / 2, cy - 8.4 * sc, w, h);
      ctx4.restore();
    } else ctx4.drawImage(c, cx - w / 2, cy - 8.4 * sc, w, h);
    return true;
  }
  function drawMoto(R5, ctx4, spec, o, cx, cy, unitPx) {
    const c = raster(`${o.kind === "bicycle" ? "cyc" : "bike"}|${o.view}|${o.rider === false ? 0 : 1}|${o.helmet ? 1 : 0}|${o.frame ? 1 : 0}|${o.rider === false && o.parked ? 1 : 0}|${sk(spec)}`, () => (o.kind === "bicycle" ? bicycleSVG : bikeSVG)({ view: o.view, rider: o.rider !== false, helmet: !!o.helmet, frame: o.frame ? 1 : 0, parked: o.rider === false }, spec), 48, 52, 48 * unitPx);
    if (!c) return null;
    const w = 48 * unitPx, h = 52 * unitPx, x = cx - w / 2, y = cy - 49 * unitPx - (o.bob ? unitPx : 0);
    if (o.flip) {
      ctx4.save();
      ctx4.translate(cx, 0);
      ctx4.scale(-1, 1);
      ctx4.drawImage(c, -w / 2, y, w, h);
      ctx4.restore();
    } else ctx4.drawImage(c, x, y, w, h);
    return { x, y, w, h };
  }
  function drawHelmetHand(R5, ctx4, spec, x, y, unitPx) {
    const c = raster(`hh|${spec.helmet}`, () => helmetHandSVG(spec), 10, 10, 10 * unitPx);
    if (c) ctx4.drawImage(c, x - 5 * unitPx, y - 5 * unitPx, 10 * unitPx, 10 * unitPx);
  }
  var VIEW_OF = [["R", false], ["R", true], ["B", true], ["B", false]];
  function drawCarOccupants(R5, ctx4, P2, Z, ty, era, d, cx, cy, occs) {
    const G4 = cabinGeom(ty, era, d, cx, cy);
    if (!G4 || !occs || !occs.length) return false;
    const [view, flip] = VIEW_OF[d & 3];
    ctx4.save();
    ctx4.beginPath();
    G4.win.forEach((q, i) => {
      const X = P2.X(q[0], q[1]), Y2 = P2.Y(q[0], q[1], q[2]);
      i ? ctx4.lineTo(X, Y2) : ctx4.moveTo(X, Y2);
    });
    ctx4.closePath();
    ctx4.clip();
    const order = { rl: 0, rr: 0, pas: 1, drv: 1 };
    const list = [...occs].sort((a, b) => (G4.near[a.seat] ? 1 : 0) - (G4.near[b.seat] ? 1 : 0) || order[a.seat] - order[b.seat]);
    for (const o of list) {
      const q = G4.seats[o.seat];
      if (!q) continue;
      const X = P2.X(q[0], q[1]), Y2 = P2.Y(q[0], q[1], q[2]);
      const near2 = G4.near[o.seat];
      drawBust(R5, ctx4, o.colors, o.face || view, X, Y2, RIDE_UNIT.bust * Z * (o.kid ? 0.78 : 1) * (near2 ? 1 : 0.94), { flip });
      if (!near2) {
        ctx4.fillStyle = "rgba(20,34,50,0.28)";
        ctx4.fillRect(X - 9 * Z, Y2 - 6 * Z, 18 * Z, 14 * Z);
      }
    }
    ctx4.fillStyle = "rgba(150,200,230,0.16)";
    ctx4.fillRect(P2.X(G4.win[0][0], G4.win[0][1]) - 40 * Z, P2.Y(G4.win[3][0], G4.win[3][1], G4.win[3][2]) - 6 * Z, 120 * Z, 40 * Z);
    ctx4.restore();
    return true;
  }

