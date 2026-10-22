  // src/fac_draw.js — 施設改修で追加した設備の描画(アイソメ屋内)
  FLOORC.pool = ["#3fa9d8", "#4ab3e0"];
  FLOORC.water = ["#24618f", "#2a6a99"];
  FLOORC.floor_dark = ["#2b3140", "#313849"];
  FLOORC.floor_red = ["#8c2f39", "#96363f"];
  FLOORC.floor_turf = ["#4f9a3c", "#57a443"];
  FLOORC.floor_dirt = ["#b98b5b", "#c29462"];
  var FXH = { roomsign: 0.05, fx_pool: 0.05, sunbed: 0.5 };
  function drawFac(c, env, o, H4) {
    const { P: P2, Z, R: R5 } = env;
    const { box, poly, shadow, pt } = H4;
    const x = o.x, y = o.y, w = o.w || 1, h = o.h || 1;
    const t = R5 && R5.time || 0;
    switch (o.t) {
      case "roomsign": {
        // 天井から下がる案内板(文字)
        const s = String(o.text || o.label || "");
        const q = pt(x + 0.5, y + 0.5, 2.6);
        const fs = Math.max(8, 2.6 * Z);
        c.save();
        c.font = `bold ${fs}px ${SIGN_FONT}`;
        const tw = c.measureText(s).width + fs;
        c.fillStyle = "rgba(20,32,58,0.92)";
        c.fillRect(q[0] - tw / 2, q[1] - fs * 0.8, tw, fs * 1.6);
        c.strokeStyle = "#d9b45a";
        c.lineWidth = Math.max(1, Z * 0.3);
        c.strokeRect(q[0] - tw / 2, q[1] - fs * 0.8, tw, fs * 1.6);
        c.fillStyle = "#fff";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(s, q[0], q[1] + fs * 0.05);
        c.restore();
        return true;
      }
      case "fx_pool": {
        // 水面のきらめき
        c.save();
        c.globalAlpha = 0.35;
        for (let i = 0; i < w * h / 3; i++) {
          const u = x + (i * 37 % (w * 10)) / 10 + 0.3 * Math.sin(t * 0.8 + i), v = y + (i * 53 % (h * 10)) / 10;
          const a = pt(u, v, 0.02), b = pt(u + 0.5, v, 0.02);
          c.strokeStyle = "#e8fbff";
          c.lineWidth = Math.max(1, Z * 0.4);
          c.beginPath();
          c.moveTo(a[0], a[1]);
          c.lineTo(b[0], b[1]);
          c.stroke();
        }
        c.restore();
        // プールの縁
        box(c, P2, x - 0.1, y - 0.1, x + w + 0.1, y, 0, 0.12, "#e6e1d6");
        box(c, P2, x - 0.1, y + h, x + w + 0.1, y + h + 0.1, 0, 0.12, "#e6e1d6");
        return true;
      }
      case "sunbed": {
        shadow(c, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.95);
        box(c, P2, x + 0.15, y + 0.05, x + 0.85, y + 0.95, 0.25, 0.35, "#f4f1ea");
        box(c, P2, x + 0.15, y + 0.05, x + 0.85, y + 0.3, 0.35, 0.75, "#f4f1ea");
        return true;
      }
    }
    return false;
  }
