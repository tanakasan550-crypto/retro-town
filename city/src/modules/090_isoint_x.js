  // src/isoint_x.js
  var XH = {
    chandelier: 0.1,
    painting: 0.1,
    rug: 0.03,
    statue: 2,
    vase: 1,
    winerack: 2,
    billiard: 1,
    pool: 0.05,
    console: 0.9,
    gstair: 0.1,
    gate: 1.1,
    tmachine: 1.7,
    kiosk: 2.1,
    track: 0.2,
    train: 2.9,
    ptline: 0.03,
    pdoor: 1.6,
    stationsign: 2.2,
    stand: 0.9,
    pitch: 0.05,
    scoreboard: 3,
    carousel: 3.2,
    ferris: 6,
    ticketbooth: 2.2,
    kitchen: 2.3,
    wardrobe: 2.1,
    shoebox: 1.1,
    washer: 1,
    luggage: 1.4,
    keyrack: 2,
    minibar: 0.9,
    pcdesk: 1.25,
    meeting: 0.8,
    cabinet: 1.8,
    copier: 1.2,
    whiteboard: 2,
    partition: 1.2,
    stove: 1.4,
    stool: 0.7,
    menuboard: 2,
    boothseat: 1.2,
    basket: 0.6,
    cart: 1,
    stockdoor: 2.1,
    produce: 1,
    frozen: 1,
    endcap: 1.5,
    ticketqueue: 1.5,
    flag: 3,
    extinguisher: 1.2,
    aed: 1.3,
    exitsign: 2.4,
    coatrack: 1.8,
    trashbin: 0.8,
    umbrella: 0.9,
    xray: 1.7,
    dboard: 3,
    offering: 1,
    bell: 2.6,
    omikuji: 1.4,
    sofa2: 0.9,
    reception: 1.2,
    dining: 0.8,
    tatamiroom: 0.05,
    kotatsu: 0.55,
    chabudai: 0.5,
    rice: 1,
    torii: 3.6,
    lantern: 1.6,
    bunk: 1.9,
    desk2: 0.8,
    lectern: 1.2,
    stage: 0.5,
    piano: 1.3,
    bar: 1.2,
    mat: 0.05
  };
  function drawExtra(c, env, o, H4) {
    const { P: P2, Z, b, g } = env;
    const { box: box5, poly: poly7, shadow: shadow2, pick: pick5, pt, mix: mix3 } = H4;
    const x = o.x, y = o.y;
    const w = o.w || 1, h = o.h || 1;
    const hs = x * 7 + y * 13 + (b ? b.idx : 0) >>> 0;
    const lod = !!env.lod;
    const fq = (u0, u1, z0, z1, col, v) => poly7(c, [pt(u0, v, z0), pt(u1, v, z0), pt(u1, v, z1), pt(u0, v, z1)], col);
    const rq = (v0, v1, z0, z1, col, u) => poly7(c, [pt(u, v0, z0), pt(u, v1, z0), pt(u, v1, z1), pt(u, v0, z1)], col);
    const top = (u0, v0, u1, v1, z, col) => poly7(c, [pt(u0, v0, z), pt(u1, v0, z), pt(u1, v1, z), pt(u0, v1, z)], col);
    switch (o.t) {
      case "rug": {
        const col = o.col || "#8e2f3b", edge = o.edge || "#d8b45a";
        top(x + 0.04, y + 0.04, x + w - 0.04, y + h - 0.04, 0.02, edge);
        top(x + 0.14, y + 0.14, x + w - 0.14, y + h - 0.14, 0.025, col);
        if (!lod) {
          top(x + 0.3, y + 0.3, x + w - 0.3, y + h - 0.3, 0.03, mix3 ? mix3(col, "#ffffff", 0.12) : col);
        }
        return true;
      }
      case "chandelier": {
        const night = env.g && (env.g.S.min >= 16 * 60 || env.g.S.min < 6 * 60);
        const cx = x + w / 2, cy = y + h / 2, R5 = Math.min(w, h) * 0.32;
        const z0 = 2.55;
        box5(c, P2, cx - 0.04, cy - 0.04, cx + 0.04, cy + 0.04, z0 + 0.2, 3.5, "#a89060");
        box5(c, P2, cx - R5, cy - R5, cx + R5, cy + R5, z0, z0 + 0.1, "#d4b25a");
        box5(c, P2, cx - R5 * 0.6, cy - R5 * 0.6, cx + R5 * 0.6, cy + R5 * 0.6, z0 - 0.25, z0, "#e8d28a");
        if (!lod) {
          for (let k = 0; k < 8; k++) {
            const a = k * Math.PI / 4, u = cx + Math.cos(a) * R5, v = cy + Math.sin(a) * R5;
            box5(c, P2, u - 0.03, v - 0.03, u + 0.03, v + 0.03, z0 + 0.1, z0 + 0.32, "#fff6d8");
            box5(c, P2, u - 0.02, v - 0.02, u + 0.02, v + 0.02, z0 - 0.45, z0 - 0.05, "rgba(210,232,255,0.8)");
          }
        }
        if (night) {
          const q = pt(cx, cy, z0);
          const gr = c.createRadialGradient(q[0], q[1], 1, q[0], q[1], 46 * Z * Math.max(w, h) * 0.5);
          gr.addColorStop(0, "rgba(255,230,150,0.55)");
          gr.addColorStop(1, "rgba(255,230,150,0)");
          c.fillStyle = gr;
          c.beginPath();
          c.arc(q[0], q[1], 46 * Z * Math.max(w, h) * 0.5, 0, 7);
          c.fill();
        }
        return true;
      }
      case "painting": {
        const cols2 = [["#2c4a6e", "#d9a441", "#7aa6c2"], ["#5a2f2f", "#e8d8b0", "#c48a4a"], ["#2f5a3d", "#d9e0b0", "#8fb86a"], ["#3a2f5a", "#e0c0d8", "#b08ad0"]][hs % 4];
        const ww = (o.w || 1) - 0.2;
        fq(x + 0.1, x + 0.1 + ww, 1.15, 2.3, "#c9a23a", y + 0.06);
        fq(x + 0.18, x + 0.02 + ww, 1.23, 2.22, cols2[0], y + 0.07);
        if (!lod) {
          fq(x + 0.18, x + 0.02 + ww, 1.23, 1.6, cols2[2], y + 0.075);
          fq(x + 0.28 + ww * 0.3, x + 0.28 + ww * 0.55, 1.6, 2, cols2[1], y + 0.08);
        }
        return true;
      }
      case "statue": {
        shadow2(c, P2, x + 0.15, y + 0.15, x + 0.85, y + 0.85);
        box5(c, P2, x + 0.2, y + 0.2, x + 0.8, y + 0.8, 0, 0.8, "#d8d4c8");
        box5(c, P2, x + 0.15, y + 0.15, x + 0.85, y + 0.85, 0.8, 0.9, "#bfb9aa");
        box5(c, P2, x + 0.36, y + 0.36, x + 0.64, y + 0.64, 0.9, 1.7, "#f1eee6");
        const q = pt(x + 0.5, y + 0.5, 1.95);
        c.fillStyle = "#f4f1ea";
        c.beginPath();
        c.arc(q[0], q[1], 3.6 * Z, 0, 7);
        c.fill();
        return true;
      }
      case "vase": {
        shadow2(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7);
        box5(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 0, 0.7, "#2f5f8f");
        box5(c, P2, x + 0.38, y + 0.38, x + 0.62, y + 0.62, 0.7, 0.95, "#2f5f8f");
        const q = pt(x + 0.5, y + 0.5, 1);
        if (!lod) for (let k = 0; k < 5; k++) {
          c.fillStyle = ["#e46a8a", "#f4c84a", "#ffffff", "#e46a8a", "#f4c84a"][k];
          c.beginPath();
          c.arc(q[0] + (k - 2) * 3 * Z, q[1] - k % 2 * 5 * Z - 3 * Z, 3 * Z, 0, 7);
          c.fill();
        }
        return true;
      }
      case "console": {
        shadow2(c, P2, x, y + 0.2, x + w, y + 0.85);
        box5(c, P2, x + 0.02, y + 0.25, x + w - 0.02, y + 0.8, 0.7, 0.78, "#c9b27a");
        for (let k = 0; k <= w; k += Math.max(1, w - 0.1)) box5(c, P2, x + k + 0.05 - (k ? 0.12 : 0), y + 0.3, x + k + 0.14 - (k ? 0.12 : 0), y + 0.7, 0, 0.7, "#8a6a3a");
        if (!lod) {
          const q = pt(x + w * 0.5, y + 0.5, 0.78);
          c.fillStyle = "#e8d8a0";
          c.beginPath();
          c.arc(q[0], q[1] - 4 * Z, 3 * Z, 0, 7);
          c.fill();
        }
        return true;
      }
      case "winerack": {
        const w2 = w;
        shadow2(c, P2, x, y + 0.15, x + w2, y + 0.95);
        box5(c, P2, x, y + 0.2, x + w2, y + 0.92, 0, 2, "#4a2f1e");
        if (!lod) {
          const fy = y + 0.92;
          for (let r = 0; r < 6; r++) for (let k = 0; k < w2 * 4; k++) {
            const u = x + 0.12 + k * 0.24 + r % 2 * 0.1;
            if (u > x + w2 - 0.1) continue;
            const cc = (r + k + hs) % 3 === 0 ? "#2f4a2f" : (r + k) % 3 === 1 ? "#5a1f2a" : "#7a2f3a";
            fq(u, u + 0.16, 0.15 + r * 0.3, 0.32 + r * 0.3, cc, fy);
          }
        }
        return true;
      }
      case "billiard": {
        const w2 = w, h22 = h;
        shadow2(c, P2, x, y, x + w2, y + h22);
        for (const [u, v] of [[0.15, 0.15], [w2 - 0.3, 0.15], [0.15, h22 - 0.3], [w2 - 0.3, h22 - 0.3]]) box5(c, P2, x + u, y + v, x + u + 0.15, y + v + 0.15, 0, 0.8, "#3a2518");
        box5(c, P2, x + 0.05, y + 0.05, x + w2 - 0.05, y + h22 - 0.05, 0.8, 0.95, "#5a3a22");
        box5(c, P2, x + 0.25, y + 0.25, x + w2 - 0.25, y + h22 - 0.25, 0.95, 0.98, "#2f7a4a");
        if (!lod) for (let k = 0; k < 6; k++) {
          const q = pt(x + w2 * 0.6 + k % 3 * 0.12, y + h22 * 0.4 + Math.floor(k / 3) * 0.14, 1.02);
          c.fillStyle = ["#d9534f", "#f2c84a", "#4a7fc8", "#ffffff", "#222", "#58a868"][k];
          c.beginPath();
          c.arc(q[0], q[1], 2.2 * Z, 0, 7);
          c.fill();
        }
        return true;
      }
      case "pool": {
        const w2 = w, h22 = h;
        box5(c, P2, x, y, x + w2, y + h22, 0, 0.12, "#e6e1d2");
        top(x + 0.3, y + 0.3, x + w2 - 0.3, y + h22 - 0.3, 0.13, "#6ec6e6");
        if (!lod) {
          const t = performance.now() / 1e3;
          c.save();
          c.strokeStyle = "rgba(255,255,255,0.5)";
          c.lineWidth = Math.max(1, Z * 0.6);
          for (let k = 1; k < w2 - 1; k += 1) {
            const ph = Math.sin(t * 1.4 + k) * 0.12;
            const a = pt(x + k, y + 0.5 + ph, 0.14), d = pt(x + k + 0.5, y + h22 - 0.5 + ph, 0.14);
            c.beginPath();
            c.moveTo(a[0], a[1]);
            c.lineTo(d[0], d[1]);
            c.stroke();
          }
          c.restore();
        }
        return true;
      }
      case "gstair": {
        const w2 = w, h22 = h;
        for (let k = 0; k < h22 * 2; k++) {
          const z = 0.12 + k * 0.1;
          box5(c, P2, x, y + k * 0.5, x + w2, y + k * 0.5 + 0.5, 0, z, k % 2 ? "#e8e2d2" : "#ddd6c4");
        }
        box5(c, P2, x + w2 * 0.3, y, x + w2 * 0.7, y + h22, 0.05, 0.08 + h22 * 0.2, "#8e2f3b");
        return true;
      }
      case "gate": {
        shadow2(c, P2, x + 0.2, y + 0.1, x + 0.8, y + 0.95);
        box5(c, P2, x + 0.18, y + 0.12, x + 0.82, y + 0.9, 0, 1, "#8c95a6");
        box5(c, P2, x + 0.16, y + 0.1, x + 0.84, y + 0.92, 1, 1.07, "#d3d8e2");
        if (!lod) {
          fq(x + 0.3, x + 0.7, 0.62, 0.9, "#26303c", y + 0.9);
          fq(x + 0.4, x + 0.6, 0.72, 0.8, "#3ad17a", y + 0.9);
          box5(c, P2, x + 0.18, y + 0.4, x + 0.82, y + 0.5, 1.07, 1.2, "#5aa0e0");
        }
        return true;
      }
      case "tmachine": {
        shadow2(c, P2, x + 0.1, y + 0.2, x + 0.9, y + 0.9);
        box5(c, P2, x + 0.1, y + 0.2, x + 0.9, y + 0.85, 0, 1.7, "#35597f");
        if (!lod) {
          fq(x + 0.18, x + 0.82, 1.1, 1.5, "#1b2633", y + 0.85);
          fq(x + 0.22, x + 0.78, 1.15, 1.45, "#3f7fb0", y + 0.85);
          for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) fq(x + 0.2 + i * 0.2, x + 0.34 + i * 0.2, 0.62 + j * 0.2, 0.74 + j * 0.2, "#f2c84a", y + 0.85);
          fq(x + 0.3, x + 0.7, 0.3, 0.4, "#0d1218", y + 0.85);
        }
        return true;
      }
      case "kiosk": {
        const w2 = w || 2;
        shadow2(c, P2, x, y + 0.2, x + w2, y + 0.95);
        box5(c, P2, x, y + 0.3, x + w2, y + 0.9, 0, 1, "#c99a62");
        box5(c, P2, x - 0.05, y + 0.25, x + w2 + 0.05, y + 0.95, 1, 1.08, "#e8d3a8");
        box5(c, P2, x, y + 0.3, x + w2, y + 0.45, 1.08, 2.1, "#e6e3dc");
        if (!lod) {
          for (let k = 0; k < w2 * 3; k++) {
            const u = x + 0.1 + k * ((w2 - 0.2) / (w2 * 3));
            fq(u, u + (w2 - 0.2) / (w2 * 3) * 0.8, 1.5, 2, pick5(["#e8584a", "#f2c84a", "#58a868", "#4a8ad8", "#e888a8"], hs + k), y + 0.45);
          }
          for (let k = 0; k < w2 * 4; k++) {
            const u = x + 0.08 + k * ((w2 - 0.2) / (w2 * 4));
            box5(c, P2, u, y + 0.5, u + 0.14, y + 0.7, 1.08, 1.28 + k % 3 * 0.06, pick5(["#d9534f", "#58a868", "#4a8ad8", "#f2c84a"], hs + k * 3));
          }
          for (let k = 0; k < w2 * 2; k++) box5(c, P2, x + k * 0.5, y + 0.9, x + k * 0.5 + 0.5, y + 1.02, 2.05, 2.25, k % 2 ? "#fff" : "#d9534f");
        }
        return true;
      }
      case "track": {
        const lw = w >= h;
        const L2 = lw ? w : h;
        shadow2(c, P2, x, y, x + w, y + h);
        box5(c, P2, x, y, x + w, y + h, 0, 0.07, "#8b8478");
        for (let k = 0; k < L2 * 3; k++) {
          const t0 = (k + 0.3) / 3;
          if (lw) box5(c, P2, x + t0, y + 0.18, x + t0 + 0.14, y + h - 0.18, 0.07, 0.11, "#6a5a48");
          else box5(c, P2, x + 0.18, y + t0, x + w - 0.18, y + t0 + 0.14, 0.07, 0.11, "#6a5a48");
        }
        for (const k of lw ? [0.3, h - 0.38] : [0.3, w - 0.38]) {
          if (lw) box5(c, P2, x, y + k, x + w, y + k + 0.08, 0.11, 0.18, "#aab0b8");
          else box5(c, P2, x + k, y, x + k + 0.08, y + h, 0.11, 0.18, "#aab0b8");
        }
        return true;
      }
      case "train": {
        const lw = w >= h;
        const w2 = w, h22 = h;
        shadow2(c, P2, x, y + 0.05, x + w2, y + h22 + 0.05);
        box5(c, P2, x + 0.05, y + 0.12, x + w2 - 0.05, y + h22 - 0.1, 0.2, 2.8, "#e9edf2");
        box5(c, P2, x + 0.05, y + 0.12, x + w2 - 0.05, y + h22 - 0.1, 0.2, 0.55, "#59616e");
        box5(c, P2, x + 0.08, y + 0.15, x + w2 - 0.08, y + h22 - 0.13, 2.8, 2.95, "#c7ccd4");
        if (!lod) {
          const fy = y + h22 - 0.1;
          fq(x + 0.05, x + w2 - 0.05, 0.9, 1.15, "#2a7fd4", fy);
          const n2 = Math.floor(w2 / 1.5);
          for (let k = 0; k < n2; k++) {
            const u = x + 0.25 + k * ((w2 - 0.5) / n2);
            fq(u, u + 0.8, 1.35, 2.35, "#86b8d8", fy);
            fq(u + 0.05, u + 0.75, 1.4, 2.3, "rgba(255,255,255,0.22)", fy);
          }
          for (const k of [1, 3]) if (k < n2) {
            const u = x + 0.25 + k * ((w2 - 0.5) / n2) - 0.12;
            fq(u, u + 0.08, 0.6, 2.5, "#9aa2ac", fy);
          }
        }
        return true;
      }
      case "ptline": {
        top(x, y, x + w, y + h, 0.03, "#e8c32a");
        if (!lod) for (let k = 0; k < w * 4; k++) top(x + 0.1 + k * 0.25, y + h * 0.2, x + 0.18 + k * 0.25, y + h * 0.8, 0.045, "#c9a010");
        return true;
      }
      case "pdoor": {
        const w2 = w;
        box5(c, P2, x, y + 0.4, x + w2, y + 0.5, 0, 0.15, "#6b7280");
        poly7(c, [pt(x, y + 0.5, 0.15), pt(x + w2, y + 0.5, 0.15), pt(x + w2, y + 0.5, 1.6), pt(x, y + 0.5, 1.6)], "rgba(160,205,230,0.35)");
        for (let k = 0; k <= w2; k++) box5(c, P2, x + k - 0.03, y + 0.4, x + k + 0.03, y + 0.5, 0.15, 1.6, "#8b93a0");
        box5(c, P2, x, y + 0.4, x + w2, y + 0.5, 1.6, 1.68, "#6b7280");
        return true;
      }
      case "stationsign": {
        shadow2(c, P2, x + 0.3, y + 0.4, x + 0.7, y + 0.7);
        box5(c, P2, x + 0.46, y + 0.46, x + 0.54, y + 0.54, 0, 1.6, "#7b828c");
        box5(c, P2, x + 0.05, y + 0.42, x + 0.95, y + 0.58, 1.3, 2.2, "#f4f6f8");
        fq(x + 0.07, x + 0.93, 1.32, 1.52, "#3a73b8", y + 0.58);
        if (!lod && o.label) {
          const q = pt(x + 0.5, y + 0.58, 1.85);
          c.fillStyle = "#1b2430";
          c.font = `bold ${Math.max(6, 4.4 * Z)}px sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(String(o.label).replace(/^駅名標[:：]?/, "").slice(0, 8), q[0], q[1]);
        }
        return true;
      }
      case "stand": {
        const w2 = w, h22 = h;
        const cc = pick5(["#d9534f", "#4a7fc8", "#e8c44a", "#58a868"], (o.sec || 0) + 1);
        for (let r = 0; r < h22; r++) {
          const z = 0.25 * (h22 - r);
          box5(c, P2, x, y + r, x + w2, y + r + 1, 0, z, "#9aa3b0");
          if (!lod) for (let k = 0; k < w2; k++) {
            box5(c, P2, x + k + 0.18, y + r + 0.35, x + k + 0.82, y + r + 0.75, z, z + 0.22, cc);
            box5(c, P2, x + k + 0.18, y + r + 0.35, x + k + 0.82, y + r + 0.42, z + 0.22, z + 0.55, mix3(cc, "#000", 0.12));
          }
        }
        return true;
      }
      case "pitch": {
        const w2 = w, h22 = h;
        top(x, y, x + w2, y + h22, 0.04, "#4f9a4a");
        if (!lod) {
          for (let k = 0; k < w2; k += 2) top(x + k, y, x + k + 1, y + h22, 0.045, "#5aa655");
          const ln = "#f4f4f0";
          const t = (u0, v0, u1, v1) => top(x + u0, y + v0, x + u1, y + v1, 0.06, ln);
          t(0.3, 0.3, w2 - 0.3, 0.4);
          t(0.3, h22 - 0.4, w2 - 0.3, h22 - 0.3);
          t(0.3, 0.3, 0.4, h22 - 0.3);
          t(w2 - 0.4, 0.3, w2 - 0.3, h22 - 0.3);
          t(w2 / 2 - 0.05, 0.3, w2 / 2 + 0.05, h22 - 0.3);
          t(w2 / 2 - 0.9, h22 / 2 - 0.9, w2 / 2 + 0.9, h22 / 2 - 0.82);
          t(w2 / 2 - 0.9, h22 / 2 + 0.82, w2 / 2 + 0.9, h22 / 2 + 0.9);
          for (const gx of [0.1, w2 - 0.5]) {
            box5(c, P2, x + gx, y + h22 / 2 - 0.9, x + gx + 0.4, y + h22 / 2 + 0.9, 0, 0.9, "rgba(255,255,255,0.0)");
            box5(c, P2, x + gx, y + h22 / 2 - 0.9, x + gx + 0.06, y + h22 / 2 - 0.84, 0, 1, "#f4f4f4");
            box5(c, P2, x + gx, y + h22 / 2 + 0.84, x + gx + 0.06, y + h22 / 2 + 0.9, 0, 1, "#f4f4f4");
          }
        }
        return true;
      }
      case "scoreboard": {
        const w2 = w;
        box5(c, P2, x, y + 0.1, x + w2, y + 0.3, 1.6, 3, "#1f2630");
        if (!lod) {
          fq(x + 0.15, x + w2 - 0.15, 1.8, 2.8, "#0d1218", y + 0.3);
          const q = pt(x + w2 / 2, y + 0.3, 2.45);
          c.fillStyle = "#ffd24a";
          c.font = `bold ${Math.max(7, 6 * Z)}px monospace`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText("0 - 0", q[0], q[1]);
          fq(x + 0.3, x + w2 - 0.3, 1.9, 2, "#3a8a5a", y + 0.3);
        }
        return true;
      }
      case "carousel": {
        const w2 = w, h22 = h;
        shadow2(c, P2, x, y, x + w2, y + h22);
        box5(c, P2, x + 0.1, y + 0.1, x + w2 - 0.1, y + h22 - 0.1, 0, 0.25, "#c9b27a");
        box5(c, P2, x + w2 / 2 - 0.15, y + h22 / 2 - 0.15, x + w2 / 2 + 0.15, y + h22 / 2 + 0.15, 0.25, 2.8, "#e8d9b0");
        if (!lod) for (let k = 0; k < 6; k++) {
          const a = k / 6 * Math.PI * 2, u = x + w2 / 2 + Math.cos(a) * (w2 / 2 - 0.55), v = y + h22 / 2 + Math.sin(a) * (h22 / 2 - 0.55);
          box5(c, P2, u - 0.03, v - 0.03, u + 0.03, v + 0.03, 0.25, 2.5, "#d4af37");
          box5(c, P2, u - 0.18, v - 0.12, u + 0.18, v + 0.12, 0.6 + k % 2 * 0.25, 1.1 + k % 2 * 0.25, pick5(["#f2f2f2", "#e88aa8", "#58a8d8", "#f2c84a"], k + hs));
        }
        box5(c, P2, x - 0.05, y - 0.05, x + w2 + 0.05, y + h22 + 0.05, 2.8, 3, "#d9534f");
        box5(c, P2, x + w2 / 4, y + h22 / 4, x + w2 * 3 / 4, y + h22 * 3 / 4, 3, 3.25, "#f2c84a");
        return true;
      }
      case "ferris": {
        const R0 = 2.6;
        shadow2(c, P2, x + 0.5, y + 0.3, x + w - 0.5, y + 0.9);
        const cx = x + w / 2, cy = y + 0.5, zc = 3.4;
        box5(c, P2, cx - 0.12, cy - 0.1, cx + 0.12, cy + 0.1, 0, zc, "#9aa0a8");
        const tt = R_t(env) * 0.15;
        c.lineWidth = Math.max(1, 1.6 * Z);
        c.strokeStyle = "#d9534f";
        c.beginPath();
        for (let i = 0; i <= 28; i++) {
          const a = i / 28 * Math.PI * 2, q = pt(cx + Math.cos(a) * R0, cy, zc + Math.sin(a) * R0);
          i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]);
        }
        c.stroke();
        if (!lod) {
          c.strokeStyle = "#9aa0a8";
          for (let k = 0; k < 8; k++) {
            const a = k / 8 * Math.PI * 2 + tt;
            const q0 = pt(cx, cy, zc), q1 = pt(cx + Math.cos(a) * R0, cy, zc + Math.sin(a) * R0);
            c.beginPath();
            c.moveTo(q0[0], q0[1]);
            c.lineTo(q1[0], q1[1]);
            c.stroke();
            box5(c, P2, cx + Math.cos(a) * R0 - 0.2, cy - 0.15, cx + Math.cos(a) * R0 + 0.2, cy + 0.15, zc + Math.sin(a) * R0 - 0.45, zc + Math.sin(a) * R0 - 0.05, pick5(["#f2c84a", "#58a8d8", "#e88aa8", "#58a868"], k));
          }
        }
        return true;
      }
      case "ticketbooth": {
        shadow2(c, P2, x, y + 0.2, x + w, y + 0.95);
        box5(c, P2, x, y + 0.3, x + w, y + 0.9, 0, 2, "#e8d3a8");
        if (!lod) {
          fq(x + 0.15, x + w - 0.15, 1, 1.7, "#9fd0e8", y + 0.9);
          fq(x + 0.1, x + w - 0.1, 0.95, 1, "#8a6a48", y + 0.9);
        }
        box5(c, P2, x - 0.05, y + 0.25, x + w + 0.05, y + 0.95, 2, 2.2, "#d9534f");
        return true;
      }
      case "kitchen": {
        const w2 = Math.max(2, w);
        shadow2(c, P2, x, y + 0.2, x + w2, y + 0.9);
        box5(c, P2, x, y + 0.3, x + w2, y + 0.85, 0, 0.9, "#d9d4c8");
        box5(c, P2, x, y + 0.3, x + w2, y + 0.85, 0.9, 0.95, "#b9bec6");
        box5(c, P2, x + 0.1, y + 0.4, x + 0.8, y + 0.78, 0.9, 0.96, "#9aa5b0");
        if (!lod) {
          for (const [a, bb] of [[1.1, 0.5], [1.5, 0.5], [1.1, 0.72], [1.5, 0.72]]) box5(c, P2, x + a, y + bb - 0.07, x + a + 0.18, y + bb + 0.07, 0.95, 0.99, "#2b2f36");
          box5(c, P2, x + 1, y + 0.3, x + w2 - 0.1, y + 0.6, 1.7, 2.05, "#bfc4cc");
          box5(c, P2, x, y + 0.3, x + 1, y + 0.55, 1.55, 2.25, "#e8dcc4");
          fq(x + 0.05, x + 0.95, 1.6, 2.2, "#f4ead4", y + 0.55);
          box5(c, P2, x + w2 - 0.7, y + 0.3, x + w2, y + 0.55, 1.55, 2.25, "#e8dcc4");
        }
        return true;
      }
      case "wardrobe": {
        shadow2(c, P2, x + 0.05, y + 0.2, x + w - 0.05, y + 0.95);
        box5(c, P2, x + 0.05, y + 0.25, x + w - 0.05, y + 0.9, 0, 2.1, "#8a6a48");
        if (!lod) {
          const n2 = Math.max(2, w * 2);
          for (let k = 0; k < n2; k++) {
            const u = x + 0.08 + k * ((w - 0.16) / n2);
            fq(u, u + (w - 0.16) / n2 - 0.03, 0.1, 2, k % 2 ? "#9a7a56" : "#957352", y + 0.9);
            fq(u + (w - 0.16) / n2 - 0.12, u + (w - 0.16) / n2 - 0.08, 1, 1.25, "#d8c9a8", y + 0.9);
          }
        }
        return true;
      }
      case "shoebox": {
        shadow2(c, P2, x + 0.05, y + 0.3, x + w - 0.05, y + 0.9);
        box5(c, P2, x + 0.05, y + 0.35, x + w - 0.05, y + 0.85, 0, 1.1, "#a98456");
        if (!lod) for (let k = 0; k < 3; k++) fq(x + 0.12, x + w - 0.12, 0.12 + k * 0.32, 0.36 + k * 0.32, "#6f5636", y + 0.85);
        return true;
      }
      case "washer": {
        shadow2(c, P2, x + 0.15, y + 0.2, x + 0.85, y + 0.9);
        box5(c, P2, x + 0.15, y + 0.25, x + 0.85, y + 0.85, 0, 1, "#eef1f4");
        if (!lod) {
          const q = pt(x + 0.5, y + 0.85, 0.5);
          c.fillStyle = "#6a8fb0";
          c.beginPath();
          c.ellipse(q[0], q[1], 4.2 * Z, 4.2 * Z * 0.9, 0, 0, 7);
          c.fill();
          c.fillStyle = "#c9dfef";
          c.beginPath();
          c.ellipse(q[0], q[1], 2.8 * Z, 2.8 * Z * 0.9, 0, 0, 7);
          c.fill();
          fq(x + 0.2, x + 0.8, 0.85, 0.95, "#c9ced6", y + 0.85);
        }
        return true;
      }
      case "luggage": {
        shadow2(c, P2, x + 0.1, y + 0.2, x + 0.9, y + 0.9);
        for (const u of [0.15, 0.85]) box5(c, P2, x + u - 0.03, y + 0.3, x + u + 0.03, y + 0.8, 0, 1.4, "#c9a24a");
        box5(c, P2, x + 0.12, y + 0.28, x + 0.88, y + 0.82, 0.12, 0.18, "#c9a24a");
        if (!lod) {
          box5(c, P2, x + 0.2, y + 0.35, x + 0.55, y + 0.7, 0.18, 0.6, "#9a3a3a");
          box5(c, P2, x + 0.5, y + 0.4, x + 0.8, y + 0.7, 0.18, 0.5, "#3a5a8a");
          box5(c, P2, x + 0.28, y + 0.4, x + 0.46, y + 0.62, 0.6, 0.85, "#6a4a2e");
        }
        return true;
      }
      case "keyrack": {
        box5(c, P2, x + 0.05, y + 0.08, x + w - 0.05, y + 0.2, 0.9, 2, "#6a4a2e");
        if (!lod) for (let k = 0; k < w * 5; k++) for (let j = 0; j < 4; j++) fq(x + 0.12 + k * ((w - 0.3) / (w * 5)), x + 0.17 + k * ((w - 0.3) / (w * 5)), 1 + j * 0.22, 1.12 + j * 0.22, "#e8c84a", y + 0.2);
        return true;
      }
      case "minibar": {
        shadow2(c, P2, x + 0.15, y + 0.25, x + 0.85, y + 0.9);
        box5(c, P2, x + 0.15, y + 0.3, x + 0.85, y + 0.85, 0, 0.9, "#f1f1f1");
        if (!lod) {
          fq(x + 0.22, x + 0.78, 0.15, 0.8, "rgba(150,200,230,0.55)", y + 0.85);
          for (let k = 0; k < 4; k++) fq(x + 0.26 + k * 0.12, x + 0.32 + k * 0.12, 0.25, 0.5, pick5(["#58a868", "#d9534f", "#f2c84a", "#4a8ad8"], k + hs), y + 0.85);
        }
        return true;
      }
      case "pcdesk": {
        const w2 = w;
        shadow2(c, P2, x + 0.05, y + 0.2, x + w2 - 0.05, y + 0.95);
        box5(c, P2, x + 0.05, y + 0.25, x + w2 - 0.05, y + 0.9, 0.62, 0.7, "#c9b08a");
        for (const u of [x + 0.1, x + w2 - 0.14]) box5(c, P2, u, y + 0.3, u + 0.04, y + 0.85, 0, 0.62, "#7b828c");
        if (!lod) {
          for (let k = 0; k < w2; k++) {
            box5(c, P2, x + k + 0.28, y + 0.3, x + k + 0.72, y + 0.4, 0.7, 1.1, "#1b2128");
            fq(x + k + 0.3, x + k + 0.7, 0.74, 1.08, "#4a7aa8", y + 0.4);
            box5(c, P2, x + k + 0.42, y + 0.36, x + k + 0.58, y + 0.5, 0.7, 0.76, "#2b3038");
            box5(c, P2, x + k + 0.3, y + 0.6, x + k + 0.7, y + 0.78, 0.7, 0.74, "#d8dce2");
          }
        }
        return true;
      }
      case "meeting": {
        const w2 = Math.max(2, w), h22 = Math.max(1, h);
        shadow2(c, P2, x + 0.05, y + 0.1, x + w2 - 0.05, y + h22 - 0.05);
        box5(c, P2, x + 0.1, y + 0.2, x + w2 - 0.1, y + h22 - 0.2, 0.7, 0.78, "#8a6a48");
        for (const u of [x + 0.25, x + w2 - 0.3]) for (const v of [y + 0.3, y + h22 - 0.35]) box5(c, P2, u, v, u + 0.06, v + 0.06, 0, 0.7, "#5a4630");
        if (!lod) {
          for (let k = 0; k < w2; k++) {
            box5(c, P2, x + k + 0.3, y - 0.02, x + k + 0.7, y + 0.18, 0, 0.55, "#4a5a78");
            box5(c, P2, x + k + 0.3, y + h22 - 0.18, x + k + 0.7, y + h22 + 0.02, 0, 0.55, "#4a5a78");
          }
          box5(c, P2, x + w2 / 2 - 0.3, y + h22 / 2 - 0.15, x + w2 / 2 + 0.3, y + h22 / 2 + 0.15, 0.78, 0.84, "#e8e8e8");
        }
        return true;
      }
      case "cabinet": {
        shadow2(c, P2, x + 0.1, y + 0.3, x + 0.9, y + 0.9);
        box5(c, P2, x + 0.1, y + 0.35, x + 0.9, y + 0.85, 0, 1.8, "#9aa3ae");
        if (!lod) for (let k = 0; k < 4; k++) {
          fq(x + 0.14, x + 0.86, 0.1 + k * 0.42, 0.5 + k * 0.42, "#b3bcc6", y + 0.85);
          fq(x + 0.4, x + 0.6, 0.27 + k * 0.42, 0.33 + k * 0.42, "#5a626c", y + 0.85);
        }
        return true;
      }
      case "copier": {
        shadow2(c, P2, x + 0.1, y + 0.25, x + 0.9, y + 0.9);
        box5(c, P2, x + 0.1, y + 0.3, x + 0.9, y + 0.85, 0, 1, "#d9dde3");
        box5(c, P2, x + 0.1, y + 0.3, x + 0.9, y + 0.85, 1, 1.12, "#aab0b8");
        if (!lod) {
          fq(x + 0.2, x + 0.5, 0.75, 0.9, "#2b6aa8", y + 0.85);
          for (let k = 0; k < 3; k++) fq(x + 0.15, x + 0.85, 0.12 + k * 0.2, 0.28 + k * 0.2, "#bfc5cc", y + 0.85);
        }
        return true;
      }
      case "whiteboard": {
        box5(c, P2, x + 0.05, y + 0.06, x + w - 0.05, y + 0.14, 0.9, 2, "#f4f6f8");
        fq(x + 0.12, x + w - 0.12, 1, 1.9, "#fbfcfd", y + 0.14);
        if (!lod) {
          for (let k = 0; k < 4; k++) fq(x + 0.25, x + 0.25 + (0.4 + k * 37 % 5 * 0.25) * (w - 0.5) / 2, 1.7 - k * 0.2, 1.74 - k * 0.2, k % 2 ? "#4a7ac8" : "#d9534f", y + 0.14);
        }
        return true;
      }
      case "partition": {
        box5(c, P2, x + 0.05, y + 0.42, x + w - 0.05, y + 0.52, 0, 1.2, "#9aa8b8");
        return true;
      }
      case "stove": {
        shadow2(c, P2, x + 0.1, y + 0.2, x + w - 0.1, y + 0.95);
        box5(c, P2, x + 0.05, y + 0.25, x + w - 0.05, y + 0.9, 0, 0.95, "#b9bec6");
        box5(c, P2, x + 0.05, y + 0.25, x + w - 0.05, y + 0.9, 0.95, 1, "#d9dde3");
        if (!lod) {
          for (let k = 0; k < Math.max(2, w * 2); k++) {
            box5(c, P2, x + 0.2 + k * 0.45, y + 0.4, x + 0.5 + k * 0.45, y + 0.72, 1, 1.05, "#2b2f36");
          }
          box5(c, P2, x + 0.2, y + 0.45, x + 0.62, y + 0.82, 1.05, 1.35, "#8a8f98");
          box5(c, P2, x + 0.25, y + 0.5, x + 0.58, y + 0.78, 1.35, 1.4, "#cfd3d9");
          fq(x + 0.08, x + w - 0.08, 0.2, 0.7, "#8a9098", y + 0.9);
        }
        return true;
      }
      case "stool": {
        shadow2(c, P2, x + 0.25, y + 0.25, x + 0.75, y + 0.75);
        box5(c, P2, x + 0.46, y + 0.46, x + 0.54, y + 0.54, 0, 0.6, "#6a6f78");
        box5(c, P2, x + 0.28, y + 0.28, x + 0.72, y + 0.72, 0.6, 0.7, "#c0504a");
        return true;
      }
      case "menuboard": {
        box5(c, P2, x + 0.08, y + 0.06, x + w - 0.08, y + 0.14, 0.9, 1.95, "#2b2f36");
        if (!lod) {
          fq(x + 0.14, x + w - 0.14, 1, 1.85, "#1e2a22", y + 0.14);
          for (let k = 0; k < 5; k++) fq(x + 0.22, x + 0.22 + (0.35 + k * 53 % 6 * 0.1) * (w - 0.5), 1.65 - k * 0.15, 1.7 - k * 0.15, k % 2 ? "#f4f0e0" : "#f2c84a", y + 0.14);
        }
        return true;
      }
      case "boothseat": {
        const w2 = w;
        shadow2(c, P2, x + 0.05, y + 0.1, x + w2 - 0.05, y + 0.95);
        box5(c, P2, x + 0.05, y + 0.15, x + w2 - 0.05, y + 0.85, 0, 0.5, "#8a3a32");
        box5(c, P2, x + 0.05, y + 0.12, x + w2 - 0.05, y + 0.28, 0.5, 1.2, "#7a2f28");
        return true;
      }
      case "basket": {
        for (let k = 0; k < 4; k++) box5(c, P2, x + 0.18, y + 0.3, x + 0.82, y + 0.8, k * 0.13, k * 0.13 + 0.15, k % 2 ? "#e8742a" : "#f08a3c");
        return true;
      }
      case "cart": {
        shadow2(c, P2, x + 0.1, y + 0.2, x + 0.9, y + 0.9);
        box5(c, P2, x + 0.15, y + 0.3, x + 0.85, y + 0.8, 0.35, 0.8, "#aeb4bc");
        box5(c, P2, x + 0.15, y + 0.3, x + 0.85, y + 0.36, 0.8, 1, "#6b7280");
        box5(c, P2, x + 0.2, y + 0.35, x + 0.8, y + 0.75, 0.2, 0.35, "#8a9098");
        return true;
      }
      case "stockdoor": {
        box5(c, P2, x + 0.08, y + 0.05, x + w - 0.08, y + 0.18, 0, 2.1, "#8a929c");
        fq(x + 0.18, x + w - 0.18, 0.1, 1.95, "#a9b1bb", y + 0.18);
        if (!lod) {
          fq(x + 0.3, x + w - 0.3, 1.5, 1.8, "#d9534f", y + 0.18);
          fq(x + w - 0.4, x + w - 0.32, 0.9, 1.05, "#4a4f58", y + 0.18);
        }
        return true;
      }
      case "produce": {
        shadow2(c, P2, x + 0.05, y + 0.25, x + w - 0.05, y + 0.9);
        box5(c, P2, x + 0.05, y + 0.3, x + w - 0.05, y + 0.85, 0, 0.7, "#b88a52");
        if (!lod) for (let k = 0; k < w * 3; k++) {
          const col = pick5(["#d9534f", "#58a858", "#f2c84a", "#e8742a", "#7a4a8a"], hs + k);
          box5(c, P2, x + 0.1 + k * ((w - 0.3) / (w * 3)), y + 0.36, x + 0.1 + k * ((w - 0.3) / (w * 3)) + 0.2, y + 0.58, 0.7, 0.9 + k % 2 * 0.06, col);
          box5(c, P2, x + 0.1 + k * ((w - 0.3) / (w * 3)), y + 0.6, x + 0.1 + k * ((w - 0.3) / (w * 3)) + 0.2, y + 0.8, 0.7, 0.86, col);
        }
        return true;
      }
      case "frozen": {
        shadow2(c, P2, x + 0.05, y + 0.2, x + w - 0.05, y + 0.95);
        box5(c, P2, x + 0.05, y + 0.25, x + w - 0.05, y + 0.9, 0, 0.85, "#eef3f6");
        top(x + 0.1, y + 0.3, x + w - 0.1, y + 0.85, 0.88, "rgba(150,200,230,0.7)");
        if (!lod) for (let k = 0; k < w * 3; k++) box5(c, P2, x + 0.15 + k * ((w - 0.4) / (w * 3)), y + 0.4, x + 0.15 + k * ((w - 0.4) / (w * 3)) + 0.18, y + 0.75, 0.6, 0.78, pick5(["#e8584a", "#4a8ad8", "#f2c84a", "#58a868"], hs + k));
        return true;
      }
      case "endcap": {
        shadow2(c, P2, x + 0.1, y + 0.2, x + 0.9, y + 0.9);
        box5(c, P2, x + 0.1, y + 0.3, x + 0.9, y + 0.8, 0, 1.5, "#e8c84a");
        if (!lod) for (let t = 0; t < 3; t++) for (let k = 0; k < 4; k++) fq(x + 0.16 + k * 0.17, x + 0.28 + k * 0.17, 0.2 + t * 0.4, 0.5 + t * 0.4, pick5(["#d9534f", "#58a868", "#4a8ad8", "#e888a8", "#f2f2f2"], hs + t * 4 + k), y + 0.8);
        return true;
      }
      case "ticketqueue": {
        shadow2(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.8);
        box5(c, P2, x + 0.3, y + 0.35, x + 0.7, y + 0.75, 0, 1.1, "#e8c84a");
        box5(c, P2, x + 0.28, y + 0.33, x + 0.72, y + 0.77, 1.1, 1.5, "#2b6aa8");
        if (!lod) {
          fq(x + 0.34, x + 0.66, 1.15, 1.42, "#16212e", y + 0.77);
          fq(x + 0.4, x + 0.6, 0.55, 0.7, "#fff", y + 0.75);
        }
        return true;
      }
      case "flag": {
        box5(c, P2, x + 0.47, y + 0.47, x + 0.53, y + 0.53, 0, 3, "#c9ced6");
        const q0 = pt(x + 0.5, y + 0.5, 2.9), q1 = pt(x + 1.1, y + 0.5, 2.9), q2 = pt(x + 1.1, y + 0.5, 2.1), q3 = pt(x + 0.5, y + 0.5, 2.1);
        poly7(c, [q0, q1, q2, q3], "#f4f4f4");
        const qc = pt(x + 0.8, y + 0.5, 2.5);
        c.fillStyle = "#c8202a";
        c.beginPath();
        c.ellipse(qc[0], qc[1], 2.6 * Z, 2.4 * Z, 0, 0, 7);
        c.fill();
        return true;
      }
      case "extinguisher": {
        box5(c, P2, x + 0.38, y + 0.38, x + 0.62, y + 0.62, 0, 0.55, "#d62828");
        box5(c, P2, x + 0.44, y + 0.44, x + 0.56, y + 0.56, 0.55, 0.7, "#222");
        if (!lod) fq(x + 0.3, x + 0.7, 1, 1.4, "#d62828", y + 0.1);
        return true;
      }
      case "aed": {
        box5(c, P2, x + 0.25, y + 0.08, x + 0.75, y + 0.2, 0.9, 1.4, "#f4f4f4");
        fq(x + 0.3, x + 0.7, 0.95, 1.35, "#2e9e5a", y + 0.2);
        if (!lod) {
          const q = pt(x + 0.5, y + 0.2, 1.15);
          c.fillStyle = "#fff";
          c.beginPath();
          c.arc(q[0], q[1], 2.6 * Z, 0, 7);
          c.fill();
          c.fillStyle = "#d62828";
          c.fillRect(q[0] - 1.2 * Z, q[1] - 1.5 * Z, 2.4 * Z, 3 * Z);
        }
        return true;
      }
      case "exitsign": {
        box5(c, P2, x + 0.25, y + 0.1, x + 0.75, y + 0.2, 2.2, 2.55, "#2e9e5a");
        if (!lod) fq(x + 0.3, x + 0.7, 2.25, 2.5, "#d8f5e0", y + 0.2);
        return true;
      }
      case "coatrack": {
        shadow2(c, P2, x + 0.25, y + 0.25, x + 0.75, y + 0.75);
        box5(c, P2, x + 0.47, y + 0.47, x + 0.53, y + 0.53, 0, 1.8, "#6a4a2e");
        box5(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 0, 0.06, "#6a4a2e");
        if (!lod) box5(c, P2, x + 0.35, y + 0.4, x + 0.65, y + 0.6, 0.7, 1.5, "#4a5a78");
        return true;
      }
      case "trashbin": {
        shadow2(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.75);
        box5(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 0, 0.8, "#5a6a78");
        box5(c, P2, x + 0.28, y + 0.28, x + 0.72, y + 0.72, 0.8, 0.86, "#3c4854");
        return true;
      }
      case "umbrella": {
        box5(c, P2, x + 0.25, y + 0.3, x + 0.75, y + 0.7, 0, 0.55, "#7b828c");
        if (!lod) for (let k = 0; k < 4; k++) box5(c, P2, x + 0.3 + k * 0.1, y + 0.4, x + 0.34 + k * 0.1, y + 0.44, 0.55, 0.9, pick5(["#2a3a5a", "#d9534f", "#2e9e5a", "#222"], k + hs));
        return true;
      }
      case "xray": {
        shadow2(c, P2, x, y + 0.1, x + w, y + 0.95);
        box5(c, P2, x, y + 0.2, x + w, y + 0.8, 0, 0.9, "#3a4452");
        box5(c, P2, x + w * 0.3, y + 0.2, x + w * 0.7, y + 0.8, 0.9, 1.7, "#59616e");
        if (!lod) fq(x + w * 0.35, x + w * 0.65, 0.95, 1.5, "#12161b", y + 0.8);
        return true;
      }
      case "dboard": {
        const w2 = w;
        box5(c, P2, x, y + 0.08, x + w2, y + 0.22, 1.4, 3, "#1a1e24");
        if (!lod) {
          fq(x + 0.1, x + w2 - 0.1, 1.5, 2.9, "#0e1218", y + 0.22);
          for (let k = 0; k < 6; k++) {
            fq(x + 0.2, x + 0.5, 2.7 - k * 0.2, 2.78 - k * 0.2, "#ffd24a", y + 0.22);
            fq(x + 0.6, x + w2 * 0.6, 2.7 - k * 0.2, 2.78 - k * 0.2, "#e8f0f4", y + 0.22);
            fq(x + w2 - 1, x + w2 - 0.4, 2.7 - k * 0.2, 2.78 - k * 0.2, k % 3 ? "#58d88a" : "#f08a3c", y + 0.22);
          }
        }
        return true;
      }
      case "offering": {
        shadow2(c, P2, x + 0.1, y + 0.25, x + 0.9, y + 0.85);
        box5(c, P2, x + 0.12, y + 0.3, x + 0.88, y + 0.8, 0, 1, "#7a5636");
        if (!lod) for (let k = 0; k < 7; k++) fq(x + 0.16 + k * 0.1, x + 0.2 + k * 0.1, 0.75, 1, "#2a1c10", y + 0.8);
        return true;
      }
      case "bell": {
        box5(c, P2, x + 0.1, y + 0.45, x + 0.9, y + 0.55, 2.4, 2.6, "#6a4a2e");
        if (!lod) {
          const q = pt(x + 0.5, y + 0.5, 1.9);
          c.fillStyle = "#d4af37";
          c.beginPath();
          c.ellipse(q[0], q[1], 3.4 * Z, 3.6 * Z, 0, 0, 7);
          c.fill();
          box5(c, P2, x + 0.46, y + 0.46, x + 0.54, y + 0.54, 2, 2.4, "#e8e0c8");
        }
        return true;
      }
      case "omikuji": {
        shadow2(c, P2, x + 0.1, y + 0.3, x + 0.9, y + 0.8);
        box5(c, P2, x + 0.15, y + 0.35, x + 0.85, y + 0.75, 0, 1.2, "#a98456");
        if (!lod) for (let k = 0; k < 6; k++) fq(x + 0.2 + k * 0.1, x + 0.26 + k * 0.1, 0.3, 0.5, "#f4f0e0", y + 0.75);
        return true;
      }
      case "torii": {
        const w2 = Math.max(2, w);
        for (const u of [x + 0.25, x + w2 - 0.45]) box5(c, P2, u, y + 0.4, u + 0.2, y + 0.6, 0, 3.4, "#c8302a");
        box5(c, P2, x + 0.1, y + 0.38, x + w2 - 0.1, y + 0.62, 3.2, 3.5, "#a8201c");
        box5(c, P2, x + 0.25, y + 0.42, x + w2 - 0.25, y + 0.58, 2.6, 2.75, "#c8302a");
        return true;
      }
      case "lantern": {
        shadow2(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7);
        box5(c, P2, x + 0.35, y + 0.35, x + 0.65, y + 0.65, 0, 0.7, "#9aa0a8");
        box5(c, P2, x + 0.42, y + 0.42, x + 0.58, y + 0.58, 0.7, 1.1, "#9aa0a8");
        box5(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 1.1, 1.4, "#c9ced6");
        box5(c, P2, x + 0.25, y + 0.25, x + 0.75, y + 0.75, 1.4, 1.55, "#8a9098");
        return true;
      }
      case "dining": {
        const w2 = Math.max(1, w), h22 = Math.max(1, h);
        shadow2(c, P2, x + 0.05, y + 0.05, x + w2 - 0.05, y + h22 - 0.05);
        box5(c, P2, x + 0.1, y + 0.15, x + w2 - 0.1, y + h22 - 0.15, 0.65, 0.73, "#c9a26a");
        for (const u of [x + 0.18, x + w2 - 0.24]) for (const v of [y + 0.22, y + h22 - 0.28]) box5(c, P2, u, v, u + 0.06, v + 0.06, 0, 0.65, "#8a6a48");
        return true;
      }
      case "kotatsu": {
        shadow2(c, P2, x + 0.05, y + 0.05, x + w - 0.05, y + h - 0.05);
        box5(c, P2, x + 0.1, y + 0.1, x + w - 0.1, y + h - 0.1, 0.35, 0.42, "#c9a26a");
        box5(c, P2, x + 0.08, y + 0.08, x + w - 0.08, y + h - 0.08, 0.05, 0.38, "#9a4a5a");
        return true;
      }
      case "bar": {
        const w2 = w;
        shadow2(c, P2, x, y + 0.2, x + w2, y + 0.95);
        box5(c, P2, x, y + 0.3, x + w2, y + 0.9, 0, 1.1, "#4a2f1e");
        box5(c, P2, x - 0.05, y + 0.28, x + w2 + 0.05, y + 0.92, 1.1, 1.18, "#7a5636");
        if (!lod) for (let k = 0; k < w2 * 2; k++) box5(c, P2, x + 0.2 + k * 0.5, y + 0.5, x + 0.3 + k * 0.5, y + 0.6, 1.18, 1.5, pick5(["#58a868", "#f2c84a", "#9a3a3a", "#e8e8e8"], hs + k));
        return true;
      }
      case "lectern": {
        shadow2(c, P2, x + 0.2, y + 0.3, x + 0.8, y + 0.8);
        box5(c, P2, x + 0.2, y + 0.35, x + 0.8, y + 0.75, 0, 1, "#7a5636");
        box5(c, P2, x + 0.18, y + 0.3, x + 0.82, y + 0.8, 1, 1.1, "#9a7a56");
        return true;
      }
      case "stage": {
        shadow2(c, P2, x, y, x + w, y + h);
        box5(c, P2, x, y, x + w, y + h, 0, 0.5, "#7a5636");
        if (!lod) fq(x, x + w, 0.1, 0.45, "#5a3a22", y + h);
        return true;
      }
      case "piano": {
        shadow2(c, P2, x + 0.05, y + 0.1, x + w - 0.05, y + h - 0.05);
        box5(c, P2, x + 0.1, y + 0.15, x + w - 0.1, y + h - 0.15, 0.4, 1.3, "#1b1b1f");
        for (const u of [x + 0.2, x + w - 0.26]) box5(c, P2, u, y + 0.3, u + 0.06, y + 0.36, 0, 0.4, "#1b1b1f");
        return true;
      }
      case "reception": {
        const w2 = Math.max(2, w);
        shadow2(c, P2, x, y + 0.2, x + w2, y + 0.95);
        box5(c, P2, x, y + 0.3, x + w2, y + 0.85, 0, 1.1, "#6a4a2e");
        box5(c, P2, x - 0.04, y + 0.28, x + w2 + 0.04, y + 0.9, 1.1, 1.18, "#d9c9a8");
        if (!lod) {
          fq(x + 0.1, x + w2 - 0.1, 0.15, 1, "#5a3a22", y + 0.85);
          box5(c, P2, x + 0.4, y + 0.5, x + 0.55, y + 0.65, 1.18, 1.3, "#d4af37");
        }
        return true;
      }
      case "bunk": {
        shadow2(c, P2, x + 0.05, y + 0.1, x + w - 0.05, y + h - 0.05);
        for (const u of [x + 0.08, x + w - 0.14]) for (const v of [y + 0.12, y + h - 0.18]) box5(c, P2, u, v, u + 0.06, v + 0.06, 0, 1.9, "#8a6a48");
        for (const z of [0.4, 1.3]) {
          box5(c, P2, x + 0.08, y + 0.12, x + w - 0.08, y + h - 0.12, z, z + 0.14, "#f0ece0");
          box5(c, P2, x + 0.12, y + 0.14, x + 0.5, y + 0.4, z + 0.14, z + 0.24, "#fff");
        }
        return true;
      }
      case "tatamiroom": {
        top(x, y, x + w, y + h, 0.02, "#c9c08a");
        if (!lod) for (let k = 0; k <= w; k += 2) top(x + k - 0.02, y, x + k + 0.02, y + h, 0.03, "#6a5a2a");
        return true;
      }
      case "mat": {
        top(x + 0.05, y + 0.05, x + w - 0.05, y + h - 0.05, 0.03, o.col || "#8a3a32");
        return true;
      }
      default:
        return false;
    }
  }
  var R_t = (env) => env.R && env.R.time || 0;

