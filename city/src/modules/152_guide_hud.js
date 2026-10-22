  // src/guide_hud.js — 移動案内の表示: タップ地点の目印・自動移動中の「目的地/残り距離/次の曲がり角」・屋内の経路線
  var M_PER_TILE = 2;
  function guideState() {
    if (!G3) return null;
    const L2 = G3.S.loc;
    let pts = null, i = 0, label = "";
    if (typeof AW !== "undefined" && AW.active && AW.path) {
      pts = AW.path.map((p) => Array.isArray(p) ? [p[0] + 0.5, p[1] + 0.5] : [p.x + 0.5, p.y + 0.5]);
      i = AW.i || 0;
      label = AW.goal && (AW.goal.label || (AW.goal.kind === "exit" ? "出口" : "目的地")) || "目的地";
    } else if (NAV && NAV.path) {
      pts = NAV.path;
      i = NAV.i || 0;
      label = NAV.label;
    }
    if (!pts || !pts.length) return null;
    i = Math.max(0, Math.min(pts.length - 1, i));
    {
      let bi = i, bd = 1e9;
      for (let k = i; k < Math.min(pts.length, i + 12); k++) {
        const d = Math.hypot(pts[k][0] - L2.x, pts[k][1] - L2.y);
        if (d < bd) {
          bd = d;
          bi = k;
        }
      }
      i = bi;
    }
    let rem = Math.hypot(pts[i][0] - L2.x, pts[i][1] - L2.y);
    for (let k = i; k < pts.length - 1; k++) rem += Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]);
    // 次の曲がり角(画面上の左右)
    let turn = null;
    const sdir = (a, b) => {
      const wx = b[0] - a[0], wy = b[1] - a[1];
      return R4 && R4.iso ? [(wx - wy) / 2, (wx + wy) / 4] : [wx, wy];
    };
    let acc = Math.hypot(pts[i][0] - L2.x, pts[i][1] - L2.y);
    for (let k = i; k + 2 < pts.length; k++) {
      const d1 = sdir(pts[k], pts[k + 1]), d2 = sdir(pts[k + 1], pts[k + 2]);
      acc += Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]);
      const cr = d1[0] * d2[1] - d1[1] * d2[0], dot = d1[0] * d2[0] + d1[1] * d2[1];
      if (Math.abs(cr) > 1e-3 && dot < 0.9 * Math.hypot(...d1) * Math.hypot(...d2)) {
        turn = { dist: acc, dir: cr > 0 ? "右" : "左" };
        break;
      }
    }
    return { pts, i, label, rem, turn, inside: L2.k === "in" };
  }
  function fmtDist(tiles) {
    const m = tiles * M_PER_TILE;
    return m >= 1e3 ? (m / 1e3).toFixed(1) + "km" : Math.max(1, Math.round(m)) + "m";
  }
  (function wireGuide() {
    const st = document.createElement("style");
    st.textContent = `#guideHud{position:absolute;left:50%;top:calc(46px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:none;z-index:6;background:#0d1a33e8;border:1px solid #4fc3f7;border-radius:12px;padding:5px 12px;font-size:13px;line-height:1.35;text-align:center;max-width:70vw;pointer-events:none;color:#fff}
#guideHud b{color:#ffd54a}
#tapRing{position:absolute;pointer-events:none;width:34px;height:34px;margin:-17px 0 0 -17px;border:3px solid #ffd54a;border-radius:50%;z-index:5;opacity:0;transform:scale(.4)}
#tapRing.on{animation:tapr .7s ease-out}
@keyframes tapr{0%{opacity:1;transform:scale(.4)}100%{opacity:0;transform:scale(1.6)}}`;
    document.head.appendChild(st);
    const hud = document.createElement("div");
    hud.id = "guideHud";
    $("app").appendChild(hud);
    const ring = document.createElement("div");
    ring.id = "tapRing";
    $("app").appendChild(ring);
    // タップ地点の目印(短く触れて離したとき)
    let t0 = null;
    cv.addEventListener("pointerdown", (e) => {
      t0 = { t: performance.now(), x: e.clientX, y: e.clientY, id: e.pointerId };
    }, true);
    cv.addEventListener("pointerup", (e) => {
      if (!t0 || t0.id !== e.pointerId) return;
      const ok = performance.now() - t0.t < 400 && Math.hypot(e.clientX - t0.x, e.clientY - t0.y) < 14;
      t0 = null;
      if (!ok || U.modal) return;
      const ar = $("app").getBoundingClientRect();
      ring.style.left = e.clientX - ar.left + "px";
      ring.style.top = e.clientY - ar.top + "px";
      ring.classList.remove("on");
      void ring.offsetWidth;
      ring.classList.add("on");
    }, true);
    window.__guideState = guideState;
    let last = "";
    setInterval(() => {
      const gs = guideState();
      let html = "";
      if (gs) {
        html = `🚶 <b>${esc4(gs.label)}</b>まで 約${fmtDist(gs.rem)}`;
        if (gs.turn && gs.turn.dist < gs.rem - 1) html += `<br>${fmtDist(gs.turn.dist)}先を<b>${gs.turn.dir}</b>へ`;
        else html += "<br>このまま進むと到着";
        if (NAV && NAV.signal) html = `🚦 信号待ち<br>${html}`;
      }
      if (html !== last) {
        hud.innerHTML = html;
        hud.style.display = html ? "" : "none";
        last = html;
      }
    }, 300);
  })();
  // 屋内の経路線(屋外は本体の経路描画を使う)
  function drawIndoorRoute() {
    const gs = guideState();
    if (!gs || !gs.inside || !R4 || !R4.ip) return;
    const c = R4.ctx, P2 = R4.ip, L2 = G3.S.loc;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.strokeStyle = "rgba(255,213,74,0.85)";
    c.lineWidth = Math.max(3, P2.Z * 1.1);
    c.setLineDash([P2.Z * 3, P2.Z * 2]);
    c.lineDashOffset = -(R4.time || 0) * P2.Z * 8;
    c.beginPath();
    c.moveTo(P2.X(L2.x, L2.y), P2.Y(L2.x, L2.y, 0.05));
    for (let k = gs.i; k < gs.pts.length; k++) c.lineTo(P2.X(gs.pts[k][0], gs.pts[k][1]), P2.Y(gs.pts[k][0], gs.pts[k][1], 0.05));
    c.stroke();
    const e = gs.pts[gs.pts.length - 1];
    c.setLineDash([]);
    c.fillStyle = "rgba(255,213,74,0.9)";
    c.beginPath();
    c.ellipse(P2.X(e[0], e[1]), P2.Y(e[0], e[1], 0.05), P2.Z * 3, P2.Z * 1.5, 0, 0, 7);
    c.fill();
    c.restore();
  }
