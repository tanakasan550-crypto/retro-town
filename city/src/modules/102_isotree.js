  // src/isotree.js
  var PAL2 = [
    // 春(桜/新緑) 夏 秋 冬
    [["#e9a9bd", "#f6cad6", "#d58aa3"], ["#7fc06a", "#a6dc8a", "#5fa24d"], ["#6eaa55", "#93c875", "#4f8a3f"]],
    [["#4f9a45", "#78c065", "#37783a"], ["#3f8d4a", "#68b565", "#2c6a3a"], ["#4a7a4a", "#6c9a5e", "#2f5a3a"]],
    [["#e0792e", "#f2a550", "#b85a22"], ["#c6422c", "#e06a45", "#9a3022"], ["#d9a63a", "#ecc866", "#b0802a"]],
    [["#8b7a68", "#a89886", "#6a5a4c"], ["#8b7a68", "#a89886", "#6a5a4c"], ["#3d6a4a", "#5a8a64", "#2a4a36"]]
  ];
  function treeSprite2(R5, season, variant, Z, snow) {
    const key = `${season}|${variant}|${Z}|${snow ? 1 : 0}`;
    let s = R5.treeC.get(key);
    if (s) return s;
    const W2 = Math.ceil(30 * Z), H4 = Math.ceil(86 * Z), cv2 = document.createElement("canvas");
    cv2.width = W2;
    cv2.height = H4;
    const c = cv2.getContext("2d");
    const cx = W2 / 2, by = H4 - 3 * Z, hz = 12 * Z, mz = 10 * Z;
    const kind = variant % 3;
    const pal = PAL2[season][kind];
    const conifer = kind === 2 && season !== 3 ? true : kind === 2;
    c.fillStyle = "rgba(0,0,0,0.22)";
    c.beginPath();
    c.ellipse(cx + 0.4 * mz, by, 1.9 * mz, 0.85 * mz, 0, 0, 7);
    c.fill();
    const trunkH = (conifer ? 1.2 : 2.2) * hz;
    c.fillStyle = "#6a4a32";
    c.fillRect(cx - 0.28 * mz, by - trunkH, 0.56 * mz, trunkH);
    c.fillStyle = "rgba(0,0,0,0.25)";
    c.fillRect(cx, by - trunkH, 0.28 * mz, trunkH);
    const blob = (x, y, rx, ry) => {
      c.fillStyle = pal[2];
      c.beginPath();
      c.ellipse(x + 0.12 * rx, y + 0.1 * ry, rx, ry, 0, 0, 7);
      c.fill();
      c.fillStyle = pal[0];
      c.beginPath();
      c.ellipse(x, y, rx * 0.96, ry * 0.94, 0, 0, 7);
      c.fill();
      c.fillStyle = pal[1];
      c.beginPath();
      c.ellipse(x - 0.22 * rx, y - 0.25 * ry, rx * 0.6, ry * 0.55, 0, 0, 7);
      c.fill();
    };
    const h = HB(variant, 7);
    if (season === 3 && !conifer) {
      c.strokeStyle = "#5b4636";
      c.lineWidth = Math.max(1, 0.28 * mz);
      c.lineCap = "round";
      const top = by - trunkH;
      const br = (x, y, ang, len, d) => {
        const x2 = x + Math.cos(ang) * len, y2 = y - Math.sin(ang) * len;
        c.lineWidth = Math.max(1, 0.3 * mz * (d + 1) / 3);
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x2, y2);
        c.stroke();
        if (d > 0) {
          br(x2, y2, ang + 0.55, len * 0.7, d - 1);
          br(x2, y2, ang - 0.5, len * 0.72, d - 1);
        }
      };
      br(cx, top, Math.PI / 2, 2.4 * hz, 3);
      br(cx, top + 0.3 * hz, Math.PI / 2 + 0.8, 2 * hz, 2);
      br(cx, top + 0.3 * hz, Math.PI / 2 - 0.8, 2 * hz, 2);
      if (snow) {
        c.fillStyle = "rgba(255,255,255,0.75)";
        for (let i = 0; i < 10; i++) c.fillRect(cx + (h >> i & 7) * 0.5 * mz - 2 * mz, top - i * 0.45 * hz, 0.7 * mz, 0.25 * hz);
      }
    } else if (conifer) {
      const tiers = 3;
      for (let i = 0; i < tiers; i++) {
        const y = by - trunkH - i * 1.7 * hz, rw = (2.2 - i * 0.55) * mz;
        c.fillStyle = pal[2];
        c.beginPath();
        c.moveTo(cx - rw, y);
        c.lineTo(cx + rw, y);
        c.lineTo(cx, y - 2.6 * hz);
        c.fill();
        c.fillStyle = pal[0];
        c.beginPath();
        c.moveTo(cx - rw, y);
        c.lineTo(cx, y + 0.05 * hz);
        c.lineTo(cx, y - 2.6 * hz);
        c.fill();
        if (snow || season === 3) {
          c.fillStyle = "rgba(255,255,255,0.7)";
          c.beginPath();
          c.moveTo(cx - rw * 0.6, y - 1 * hz);
          c.lineTo(cx + rw * 0.6, y - 1 * hz);
          c.lineTo(cx, y - 2.6 * hz);
          c.fill();
        }
      }
    } else {
      const top = by - trunkH;
      blob(cx - 0.9 * mz, top - 0.9 * hz, 1.8 * mz, 1.5 * hz);
      blob(cx + 1 * mz, top - 1.1 * hz, 1.7 * mz, 1.4 * hz);
      blob(cx, top - 2.3 * hz, 2.1 * mz, 1.7 * hz);
      c.fillStyle = shade("#ffffff", 1);
      c.globalAlpha = 0.25;
      for (let i = 0; i < 14; i++) {
        const a = ((h >> i % 20) + i * 37) % 100 / 100 * 6.28, r = i * 53 % 17 / 17;
        c.fillRect(cx + Math.cos(a) * r * 2.6 * mz, top - 1.8 * hz + Math.sin(a) * r * 1.8 * hz, 0.4 * mz, 0.4 * mz);
      }
      c.globalAlpha = 1;
    }
    s = { cv: cv2, ax: cx, ay: by };
    R5.treeC.set(key, s);
    if (R5.treeC.size > 80) R5.treeC.clear();
    return s;
  }

