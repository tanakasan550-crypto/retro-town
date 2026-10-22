  // src/archpaint.js
  var rr2 = (seed) => {
    let s = (seed | 1) >>> 0;
    return () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
  };
  function paintWallMat(ctx4, e, A2, Wp, Ht, T4, M, side, bl) {
    const R5 = e.R, S2 = side === "S";
    const rnd3 = rr2(HB(e.b.idx, 700 + (side === "S" ? 1 : 2) + (bl ? bl.f0 * 7 : 0)));
    const lw = Math.max(0.6, R5 * 0.55);
    ctx4.save();
    ctx4.beginPath();
    ctx4.rect(0, -Ht, Wp, Ht);
    ctx4.clip();
    ctx4.lineWidth = lw;
    const dark = S2 ? "rgba(40,30,20,0.16)" : "rgba(20,15,10,0.22)", lite = S2 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)";
    const col = shade(A2.col, S2 ? 1 : 0.8);
    switch (A2.mat) {
      case "plank": {
        const bh = 0.2 * M;
        let i = 0;
        for (let y = 0; y < Ht; y += bh, i++) {
          ctx4.fillStyle = `rgba(${rnd3() < 0.5 ? "0,0,0" : "255,255,255"},${0.02 + rnd3() * 0.06})`;
          ctx4.fillRect(0, -y - bh, Wp, bh);
          ctx4.fillStyle = dark;
          ctx4.fillRect(0, -y - lw, Wp, lw * 1.2);
          ctx4.fillStyle = lite;
          ctx4.fillRect(0, -y - bh, Wp, lw * 0.6);
        }
        ctx4.strokeStyle = "rgba(40,25,10,0.12)";
        for (let k = 0; k < Wp / (3 * R5); k++) {
          const x = rnd3() * Wp, y = rnd3() * Ht;
          ctx4.beginPath();
          ctx4.moveTo(x, -y);
          ctx4.lineTo(x + (4 + rnd3() * 14) * R5, -y);
          ctx4.stroke();
        }
        break;
      }
      case "shitami": {
        const bw = 0.16 * T4;
        for (let x = 0, i = 0; x < Wp; x += bw, i++) {
          ctx4.fillStyle = `rgba(${i & 1 ? "255,255,255" : "0,0,0"},${0.03 + rnd3() * 0.05})`;
          ctx4.fillRect(x, -Ht, bw, Ht);
          ctx4.fillStyle = dark;
          ctx4.fillRect(x, -Ht, lw, Ht);
        }
        ctx4.fillStyle = "rgba(30,20,12,0.5)";
        for (let y = 0.9 * M; y < Ht; y += 1.1 * M) ctx4.fillRect(0, -y, Wp, lw * 1.6);
        break;
      }
      case "mortar":
      case "plaster": {
        const n2 = Math.min(900, Wp * Ht / (6 * R5 * R5)) | 0;
        for (let k = 0; k < n2; k++) {
          ctx4.fillStyle = rnd3() < 0.5 ? "rgba(255,255,255,0.28)" : "rgba(60,45,30,0.14)";
          const s = (0.6 + rnd3()) * R5;
          ctx4.fillRect(rnd3() * Wp, -rnd3() * Ht, s, s);
        }
        if (A2.mat === "mortar" && A2.wear > 0.25) {
          ctx4.strokeStyle = "rgba(60,45,30,0.25)";
          for (let k = 0; k < 3; k++) {
            let x = rnd3() * Wp, y = rnd3() * Ht * 0.8 + 0.3 * M;
            ctx4.beginPath();
            ctx4.moveTo(x, -y);
            for (let j = 0; j < 4; j++) {
              x += (rnd3() - 0.5) * 8 * R5;
              y += (rnd3() - 0.2) * 7 * R5;
              ctx4.lineTo(x, -y);
            }
            ctx4.stroke();
          }
        }
        if (A2.mat === "plaster") {
          ctx4.fillStyle = "rgba(120,100,70,0.35)";
          ctx4.fillRect(0, -0.12 * M, Wp, 0.12 * M);
        }
        break;
      }
      case "namako":
      case "mosaic":
      case "tile": {
        const big = A2.mat === "tile";
        const tw = (big ? 0.34 : 0.1) * T4, th = (big ? 0.2 : 0.06) * M * 3;
        ctx4.strokeStyle = S2 ? "rgba(70,60,50,0.28)" : "rgba(30,25,20,0.3)";
        for (let y = 0, r = 0; y < Ht; y += th, r++) for (let x = big && r & 1 ? tw / 2 : 0; x < Wp; x += tw) {
          const j = rnd3();
          if (j < 0.4) {
            ctx4.fillStyle = `rgba(${j < 0.2 ? "255,255,255" : "0,0,0"},${0.04 + rnd3() * 0.07})`;
            ctx4.fillRect(x, -y - th, tw, th);
          }
        }
        ctx4.beginPath();
        for (let y = 0; y <= Ht; y += th) {
          ctx4.moveTo(0, -y);
          ctx4.lineTo(Wp, -y);
        }
        for (let x = 0, r = 0; x <= Wp; x += tw, r++) {
          ctx4.moveTo(x, 0);
          ctx4.lineTo(x, -Ht);
        }
        ctx4.stroke();
        ctx4.fillStyle = lite;
        ctx4.fillRect(0, -Ht, Wp, lw);
        break;
      }
      case "brick": {
        const bh = 0.13 * M * 1.6, bw = 0.3 * T4;
        ctx4.strokeStyle = S2 ? "rgba(230,215,190,0.55)" : "rgba(200,185,160,0.4)";
        for (let y = 0, r = 0; y < Ht; y += bh, r++) {
          ctx4.beginPath();
          ctx4.moveTo(0, -y);
          ctx4.lineTo(Wp, -y);
          ctx4.stroke();
          for (let x = (r & 1) * bw / 2; x < Wp; x += bw) {
            ctx4.beginPath();
            ctx4.moveTo(x, -y);
            ctx4.lineTo(x, -y - bh);
            ctx4.stroke();
            if (rnd3() < 0.5) {
              ctx4.fillStyle = `rgba(${rnd3() < 0.5 ? "60,20,10" : "255,200,160"},${0.08 + rnd3() * 0.12})`;
              ctx4.fillRect(x + lw, -y - bh + lw, bw - lw, bh - lw);
            }
          }
        }
        break;
      }
      case "stone": {
        ctx4.strokeStyle = S2 ? "rgba(80,70,55,0.4)" : "rgba(40,35,28,0.4)";
        let y = 0, r = 0;
        while (y < Ht) {
          const bh = (0.3 + r % 3 * 0.12) * M * 1.5;
          ctx4.beginPath();
          ctx4.moveTo(0, -y);
          ctx4.lineTo(Wp, -y);
          ctx4.stroke();
          let x = (r & 1) * 0.4 * T4;
          while (x < Wp) {
            const bw = (0.5 + rnd3() * 0.7) * T4;
            ctx4.beginPath();
            ctx4.moveTo(x, -y);
            ctx4.lineTo(x, -y - bh);
            ctx4.stroke();
            ctx4.fillStyle = `rgba(${rnd3() < 0.5 ? "255,255,255" : "0,0,0"},${0.03 + rnd3() * 0.06})`;
            ctx4.fillRect(x, -y - bh, bw, bh);
            x += bw;
          }
          y += bh;
          r++;
        }
        break;
      }
      case "conc":
      case "panel": {
        const pw = (A2.mat === "conc" ? 1.1 : 0.9) * T4, ph = (A2.mat === "conc" ? 1 : 1.3) * M * 1.5;
        ctx4.strokeStyle = S2 ? "rgba(60,60,60,0.3)" : "rgba(30,30,30,0.35)";
        ctx4.beginPath();
        for (let x = pw; x < Wp; x += pw) {
          ctx4.moveTo(x, 0);
          ctx4.lineTo(x, -Ht);
        }
        for (let y = ph; y < Ht; y += ph) {
          ctx4.moveTo(0, -y);
          ctx4.lineTo(Wp, -y);
        }
        ctx4.stroke();
        if (A2.mat === "conc") {
          ctx4.fillStyle = "rgba(40,40,40,0.28)";
          for (let x = pw / 2; x < Wp; x += pw) for (let y = ph / 2; y < Ht; y += ph) ctx4.fillRect(x, -y, R5 * 1.2, R5 * 1.2);
        } else {
          ctx4.fillStyle = lite;
          for (let x = 0; x < Wp; x += pw) ctx4.fillRect(x + lw, -Ht, lw, Ht);
        }
        if (A2.wear > 0.2) {
          ctx4.fillStyle = `rgba(50,50,45,${0.05 + A2.wear * 0.1})`;
          for (let k = 0; k < 6; k++) {
            const x = rnd3() * Wp;
            ctx4.fillRect(x, -Ht, (1 + rnd3() * 3) * R5, Ht * (0.3 + rnd3() * 0.5));
          }
        }
        break;
      }
      case "siding": {
        const bh = 0.4 * M;
        for (let y = 0; y < Ht; y += bh) {
          ctx4.fillStyle = dark;
          ctx4.fillRect(0, -y - lw, Wp, lw * 1.4);
          ctx4.fillStyle = lite;
          ctx4.fillRect(0, -y - bh + lw, Wp, lw * 0.8);
        }
        ctx4.strokeStyle = dark;
        for (let x = 0; x < Wp; x += 1.8 * T4) {
          ctx4.beginPath();
          ctx4.moveTo(x, 0);
          ctx4.lineTo(x, -Ht);
          ctx4.stroke();
        }
        break;
      }
      case "metal": {
        const rw = 0.12 * T4;
        for (let x = 0, i = 0; x < Wp; x += rw, i++) {
          ctx4.fillStyle = i & 1 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
          ctx4.fillRect(x, -Ht, rw, Ht);
        }
        break;
      }
      default:
        break;
    }
    if (A2.wear > 0.15 && A2.mat !== "glass") {
      const g = ctx4.createLinearGradient(0, 0, 0, -Math.min(Ht, 1.2 * M));
      g.addColorStop(0, `rgba(40,35,25,${0.1 + A2.wear * 0.22})`);
      g.addColorStop(1, "rgba(40,35,25,0)");
      ctx4.fillStyle = g;
      ctx4.fillRect(0, -Math.min(Ht, 1.2 * M), Wp, Math.min(Ht, 1.2 * M));
    }
    ctx4.restore();
    void col;
    void T4;
  }
  function paintWindow(ctx4, e, A2, side, x, y, ww, hh, key, opt = {}) {
    const R5 = e.R, S2 = side === "S";
    const rnd3 = rr2(HB(e.b.idx, key));
    const lw = Math.max(0.8, R5 * 0.7);
    const fc = A2.frameCol;
    const fr = Math.max(1.2, R5 * 1.2) * (A2.frame === "wood" ? 1.4 : A2.frame === "steel" ? 1.1 : 0.9);
    if (A2.shutter === "amado" && rnd3() < 0.3 && !opt.noShutter) {
      ctx4.fillStyle = shade("#7a5a3a", S2 ? 1 : 0.8);
      ctx4.fillRect(x - fr, y - hh - fr, ww + fr * 2, hh + fr * 2);
      ctx4.strokeStyle = "rgba(30,18,8,0.45)";
      ctx4.lineWidth = lw;
      for (let k = 1; k < 5; k++) {
        const xx = x + ww * k / 5;
        ctx4.beginPath();
        ctx4.moveTo(xx, y - hh);
        ctx4.lineTo(xx, y);
        ctx4.stroke();
      }
      return;
    }
    if (A2.lintel) {
      ctx4.fillStyle = shade(A2.col, S2 ? 0.78 : 0.6);
      ctx4.fillRect(x - fr * 1.6, y - hh - fr * 2.4, ww + fr * 3.2, fr * 1.6);
    }
    ctx4.fillStyle = shade(fc, S2 ? 1 : 0.8);
    ctx4.fillRect(x - fr, y - hh - fr, ww + fr * 2, hh + fr * 2);
    const gx = x, gy = y - hh;
    const gr = ctx4.createLinearGradient(gx, gy, gx, gy + hh);
    gr.addColorStop(0, S2 ? "#d6ebf6" : "#b3d2e3");
    gr.addColorStop(0.6, S2 ? "#a5c9de" : "#86adc4");
    gr.addColorStop(1, S2 ? "#8fb5cc" : "#7396ad");
    ctx4.fillStyle = gr;
    ctx4.fillRect(gx, gy, ww, hh);
    const r = rnd3();
    const lit = opt.dim;
    const wm = A2.win || "res";
    if (wm === "ind") {
      ctx4.fillStyle = "rgba(30,38,46,0.55)";
      ctx4.fillRect(gx, gy, ww, hh);
      ctx4.strokeStyle = "rgba(210,225,235,0.55)";
      ctx4.lineWidth = Math.max(0.5, R5 * 0.45);
      ctx4.beginPath();
      for (let k = -4; k < 8; k++) {
        ctx4.moveTo(gx + ww * k / 4, gy);
        ctx4.lineTo(gx + ww * (k + 2) / 4, gy + hh);
        ctx4.moveTo(gx + ww * (k + 2) / 4, gy);
        ctx4.lineTo(gx + ww * k / 4, gy + hh);
      }
      ctx4.save();
      ctx4.beginPath();
      ctx4.rect(gx, gy, ww, hh);
      ctx4.clip();
      ctx4.stroke();
      ctx4.restore();
    } else if (wm === "inst" && !lit) {
      if (r < 0.55) {
        ctx4.fillStyle = shade("#f1f3f2", S2 ? 1 : 0.85);
        const bh = hh * (0.5 + rnd3() * 0.5);
        ctx4.fillRect(gx, gy, ww, bh);
        ctx4.strokeStyle = "rgba(90,100,110,0.3)";
        ctx4.lineWidth = Math.max(0.5, R5 * 0.45);
        for (let yy = gy + 2 * R5; yy < gy + bh; yy += 2.2 * R5) {
          ctx4.beginPath();
          ctx4.moveTo(gx, yy);
          ctx4.lineTo(gx + ww, yy);
          ctx4.stroke();
        }
      } else {
        ctx4.fillStyle = "rgba(230,240,245,0.55)";
        ctx4.fillRect(gx, gy + hh * 0.62, ww, hh * 0.38);
      }
    } else if (wm === "school" && !lit) {
      ctx4.strokeStyle = shade("#5f6a72", S2 ? 1 : 0.8);
      ctx4.lineWidth = Math.max(0.7, R5 * 0.6);
      ctx4.beginPath();
      ctx4.moveTo(gx, gy + hh * 0.22);
      ctx4.lineTo(gx + ww, gy + hh * 0.22);
      ctx4.moveTo(gx + ww / 3, gy + hh * 0.22);
      ctx4.lineTo(gx + ww / 3, gy + hh);
      ctx4.moveTo(gx + ww * 2 / 3, gy + hh * 0.22);
      ctx4.lineTo(gx + ww * 2 / 3, gy + hh);
      ctx4.stroke();
      if (r < 0.2) {
        ctx4.fillStyle = "rgba(240,240,225,0.8)";
        ctx4.fillRect(gx + ww / 3, gy + hh * 0.22, ww / 3, hh * 0.78);
      } else if (r < 0.4) {
        ctx4.fillStyle = "rgba(60,50,40,0.28)";
        ctx4.fillRect(gx + ww * 0.2, gy + hh * 0.55, ww * 0.14, hh * 0.45);
      }
    } else if (wm === "comm" && !lit && r < 0.6) {
      ctx4.fillStyle = shade("#ddd8c8", S2 ? 1 : 0.8);
      ctx4.fillRect(gx, gy, ww, hh * (0.4 + rnd3() * 0.5));
      ctx4.strokeStyle = "rgba(80,70,50,0.3)";
      ctx4.lineWidth = Math.max(0.5, R5 * 0.45);
      ctx4.beginPath();
      for (let k = 1; k < 8; k++) {
        ctx4.moveTo(gx + ww * k / 8, gy);
        ctx4.lineTo(gx + ww * k / 8, gy + hh * 0.9);
      }
      ctx4.stroke();
    } else if (wm !== "res") {
    } else if (!lit && r < 0.42) {
      const cc = A2.curtain[HB(e.b.idx, key + 3) % A2.curtain.length];
      ctx4.fillStyle = shade(cc, S2 ? 1 : 0.8);
      const cw = ww * (r < 0.2 ? 0.3 : 0.5);
      ctx4.fillRect(gx, gy, cw, hh);
      if (r >= 0.2) ctx4.fillRect(gx + ww - cw, gy, cw, hh);
      else ctx4.fillRect(gx + ww * 0.72, gy, ww * 0.28, hh);
      ctx4.strokeStyle = "rgba(0,0,0,0.14)";
      ctx4.lineWidth = Math.max(0.5, R5 * 0.5);
      for (let k = 1; k < 4; k++) {
        const xx = gx + cw * k / 4;
        ctx4.beginPath();
        ctx4.moveTo(xx, gy);
        ctx4.lineTo(xx, gy + hh);
        ctx4.stroke();
      }
    } else if (!lit && r < 0.62) {
      ctx4.fillStyle = shade("#e6e0d0", S2 ? 1 : 0.8);
      const bh = hh * (0.35 + rnd3() * 0.45);
      ctx4.fillRect(gx, gy, ww, bh);
      ctx4.strokeStyle = "rgba(80,70,50,0.35)";
      ctx4.lineWidth = Math.max(0.5, R5 * 0.5);
      for (let yy = gy + 2 * R5; yy < gy + bh; yy += 2.4 * R5) {
        ctx4.beginPath();
        ctx4.moveTo(gx, yy);
        ctx4.lineTo(gx + ww, yy);
        ctx4.stroke();
      }
    } else if (!lit && r < 0.7) {
      ctx4.fillStyle = "rgba(60,50,40,0.35)";
      ctx4.fillRect(gx + ww * 0.15, gy + hh * 0.55, ww * 0.3, hh * 0.45);
      ctx4.fillStyle = "rgba(70,130,70,0.8)";
      ctx4.beginPath();
      ctx4.arc(gx + ww * 0.7, gy + hh * 0.8, Math.min(ww, hh) * 0.16, 0, 7);
      ctx4.fill();
    }
    ctx4.fillStyle = S2 ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.2)";
    ctx4.beginPath();
    ctx4.moveTo(gx, gy);
    ctx4.lineTo(gx + ww * 0.45, gy);
    ctx4.lineTo(gx + ww * 0.1, gy + hh);
    ctx4.lineTo(gx, gy + hh);
    ctx4.fill();
    ctx4.strokeStyle = shade(fc, S2 ? 1 : 0.8);
    ctx4.lineWidth = Math.max(0.8, fr * 0.7);
    ctx4.beginPath();
    if (A2.frame === "wood") {
      ctx4.moveTo(gx + ww / 2, gy);
      ctx4.lineTo(gx + ww / 2, gy + hh);
      ctx4.moveTo(gx, gy + hh / 2);
      ctx4.lineTo(gx + ww, gy + hh / 2);
      if (hh > 2 * R5 * 14) {
        ctx4.moveTo(gx, gy + hh / 4);
        ctx4.lineTo(gx + ww, gy + hh / 4);
      }
    } else if (A2.frame === "steel") {
      for (let k = 1; k < 3; k++) {
        ctx4.moveTo(gx + ww * k / 3, gy);
        ctx4.lineTo(gx + ww * k / 3, gy + hh);
      }
      ctx4.moveTo(gx, gy + hh * 0.35);
      ctx4.lineTo(gx + ww, gy + hh * 0.35);
    } else {
      ctx4.moveTo(gx + ww / 2, gy);
      ctx4.lineTo(gx + ww / 2, gy + hh);
    }
    ctx4.stroke();
    if (A2.sill) {
      ctx4.fillStyle = shade("#d9d4c8", S2 ? 1 : 0.78);
      ctx4.fillRect(x - fr * 1.8, y + fr * 0.5, ww + fr * 3.6, fr * 1.8);
      ctx4.fillStyle = "rgba(0,0,0,0.22)";
      ctx4.fillRect(x - fr * 1.8, y + fr * 2.3, ww + fr * 3.6, fr * 0.8);
    }
    if (A2.shutter === "louver") {
      for (const sx of [x - ww * 0.28 - fr, x + ww + fr]) {
        ctx4.fillStyle = shade(A2.fa >= 4 ? "#3b4f44" : "#4f6a5a", S2 ? 1 : 0.8);
        ctx4.fillRect(sx, y - hh - fr, ww * 0.28, hh + fr * 2);
        ctx4.strokeStyle = "rgba(0,0,0,0.3)";
        ctx4.lineWidth = Math.max(0.5, R5 * 0.5);
        for (let yy = y - hh; yy < y; yy += 2.6 * R5) {
          ctx4.beginPath();
          ctx4.moveTo(sx, yy);
          ctx4.lineTo(sx + ww * 0.28, yy);
          ctx4.stroke();
        }
      }
    }
    if (opt.ac && A2.acRate > 0 && rnd3() < A2.acRate) {
      const ax = x + ww * 0.1, ay = y + 2.6 * R5 * 2;
      ctx4.fillStyle = "rgba(0,0,0,0.25)";
      ctx4.fillRect(ax + R5, ay - 0.1 * R5 + 1, ww * 0.7, 3 * R5);
      ctx4.fillStyle = shade("#e8ebec", S2 ? 1 : 0.8);
      ctx4.fillRect(ax, ay - 4 * R5, ww * 0.7, 6 * R5);
      ctx4.fillStyle = "#9aa2a8";
      ctx4.beginPath();
      ctx4.arc(ax + ww * 0.35, ay - R5, 2.2 * R5, 0, 7);
      ctx4.fill();
      ctx4.strokeStyle = "#7a8288";
      ctx4.lineWidth = Math.max(0.6, R5 * 0.5);
      ctx4.stroke();
    }
  }
  function paintBalcony(ctx4, e, A2, x, y, ww, key) {
    const R5 = e.R, rnd3 = rr2(HB(e.b.idx, key));
    const bw = ww * 1.25, bx = x - ww * 0.12, bh = 1 * 12 * R5;
    const lw = Math.max(0.7, R5 * 0.6);
    ctx4.fillStyle = shade(A2.col, 0.72);
    ctx4.fillRect(bx, y - 2 * R5, bw, 3 * R5);
    ctx4.fillStyle = "rgba(0,0,0,0.2)";
    ctx4.fillRect(bx, y + R5, bw, 1.6 * R5);
    if (A2.bal === "solid") {
      ctx4.fillStyle = shade(A2.col, 0.95);
      ctx4.fillRect(bx, y - bh, bw, bh - 2 * R5);
      ctx4.fillStyle = "rgba(255,255,255,0.25)";
      ctx4.fillRect(bx, y - bh, bw, 1.5 * R5);
      ctx4.strokeStyle = "rgba(0,0,0,0.22)";
      ctx4.lineWidth = lw;
      ctx4.beginPath();
      for (let k = 1; k < 4; k++) {
        ctx4.moveTo(bx + bw * k / 4, y - bh);
        ctx4.lineTo(bx + bw * k / 4, y - 2 * R5);
      }
      ctx4.stroke();
    } else if (A2.bal === "glass") {
      ctx4.fillStyle = "rgba(190,225,240,0.55)";
      ctx4.fillRect(bx, y - bh, bw, bh - 2 * R5);
      ctx4.strokeStyle = "#d6dde0";
      ctx4.lineWidth = lw * 1.3;
      ctx4.strokeRect(bx, y - bh, bw, bh - 2 * R5);
    } else {
      ctx4.strokeStyle = "#4a5058";
      ctx4.lineWidth = lw;
      ctx4.beginPath();
      ctx4.moveTo(bx, y - bh);
      ctx4.lineTo(bx + bw, y - bh);
      for (let xx = bx; xx <= bx + bw + 0.1; xx += 3.2 * R5) {
        ctx4.moveTo(xx, y - bh);
        ctx4.lineTo(xx, y - 2 * R5);
      }
      ctx4.stroke();
    }
    const r = rnd3();
    if (r < 0.3) {
      const cc = ["#ffffff", "#e86a6a", "#6aa0e8", "#f0d060"][rnd3() * 4 | 0];
      ctx4.strokeStyle = "#555";
      ctx4.lineWidth = lw;
      ctx4.beginPath();
      ctx4.moveTo(bx + 2 * R5, y - bh - 8 * R5);
      ctx4.lineTo(bx + bw - 2 * R5, y - bh - 8 * R5);
      ctx4.stroke();
      for (let k = 0; k < 3; k++) {
        ctx4.fillStyle = k % 2 ? cc : "#f4f4f4";
        ctx4.fillRect(bx + (3 + k * 7) * R5, y - bh - 8 * R5, 5 * R5, 7 * R5);
      }
    } else if (r < 0.45) {
      ctx4.fillStyle = "#e9d8c8";
      ctx4.fillRect(bx + bw * 0.2, y - bh - 5 * R5, bw * 0.55, 6 * R5);
      ctx4.fillStyle = "rgba(0,0,0,0.12)";
      ctx4.fillRect(bx + bw * 0.2, y - bh - R5, bw * 0.55, R5);
    } else if (r < 0.6) {
      ctx4.fillStyle = "#7a4a2a";
      ctx4.fillRect(bx + bw * 0.6, y - bh - 3 * R5, 5 * R5, 4 * R5);
      ctx4.fillStyle = "#4a8a4a";
      ctx4.beginPath();
      ctx4.arc(bx + bw * 0.6 + 2.5 * R5, y - bh - 5 * R5, 3.5 * R5, 0, 7);
      ctx4.fill();
    }
  }
  function paintPipes(ctx4, e, A2, Wp, Ht, side, M, T4) {
    const R5 = e.R, S2 = side === "S";
    ctx4.save();
    if (A2.pipes) {
      ctx4.fillStyle = shade("#8a8f94", S2 ? 1 : 0.8);
      const pw = Math.max(1.4, R5 * 1.5);
      for (const x of side === "S" ? [Wp - pw * 2] : [pw]) {
        ctx4.fillRect(x, -Ht, pw, Ht);
        ctx4.fillStyle = "rgba(255,255,255,0.3)";
        ctx4.fillRect(x, -Ht, pw * 0.35, Ht);
        ctx4.fillStyle = shade("#8a8f94", S2 ? 1 : 0.8);
      }
    }
    if (A2.gutter) {
      ctx4.fillStyle = shade("#7d8388", S2 ? 1 : 0.8);
      ctx4.fillRect(0, -Ht, Wp, Math.max(1.6, R5 * 1.6));
    }
    if (A2.cornice) {
      ctx4.fillStyle = shade(A2.col, S2 ? 1.12 : 0.9);
      ctx4.fillRect(-R5, -Ht - 0.28 * M, Wp + 2 * R5, 0.28 * M);
      ctx4.fillStyle = "rgba(0,0,0,0.2)";
      ctx4.fillRect(-R5, -Ht, Wp + 2 * R5, R5);
    }
    ctx4.fillStyle = shade(A2.col, S2 ? 0.6 : 0.5);
    ctx4.fillRect(0, -0.3 * M, Wp, 0.3 * M);
    ctx4.fillStyle = "rgba(255,255,255,0.18)";
    ctx4.fillRect(0, -0.3 * M, Wp, Math.max(0.8, R5 * 0.6));
    ctx4.restore();
    void T4;
  }
  function roofTex(ctx4, P2, A2, B2, C2, mat, col, R5, hsh, wear = 0) {
    const at = (s, t) => P2(A2[0] + (B2[0] - A2[0]) * s + (C2[0] - A2[0]) * t, A2[1] + (B2[1] - A2[1]) * s + (C2[1] - A2[1]) * t, A2[2] + (B2[2] - A2[2]) * s + (C2[2] - A2[2]) * t);
    const eave = Math.hypot(B2[0] - A2[0], B2[1] - A2[1]);
    const slope = Math.hypot(C2[0] - A2[0], C2[1] - A2[1], (C2[2] - A2[2]) * 0.5);
    const rows2 = Math.max(5, Math.round(slope * 3.4));
    const lw = Math.max(0.6, R5 * 0.5);
    const dk = shade(col, 0.66), lt = shade(col, 1.28);
    ctx4.save();
    ctx4.lineWidth = lw;
    ctx4.lineCap = "round";
    const rnd3 = rr2(hsh >>> 0);
    if (mat === "kawara") {
      const cols2 = Math.max(4, Math.round(eave * 2.6));
      for (let i = 0; i < rows2; i++) {
        const t0 = i / rows2, t1 = (i + 1) / rows2;
        ctx4.strokeStyle = dk;
        ctx4.beginPath();
        for (let k = 0; k < cols2; k++) {
          const s0 = k / cols2, s1 = (k + 1) / cols2;
          const a = at(s0, t0), b = at(s1, t0), m = at((s0 + s1) / 2, t0 + (t1 - t0) * 0.45);
          ctx4.moveTo(a[0], a[1]);
          ctx4.quadraticCurveTo(m[0], m[1], b[0], b[1]);
        }
        ctx4.stroke();
        ctx4.strokeStyle = lt;
        ctx4.globalAlpha = 0.45;
        ctx4.beginPath();
        for (let k = 0; k < cols2; k++) {
          const s = (k + 0.5 + (i & 1) * 0) / cols2;
          const a = at(s, t0 + (t1 - t0) * 0.1), b = at(s, t1 - (t1 - t0) * 0.1);
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(b[0], b[1]);
        }
        ctx4.stroke();
        ctx4.globalAlpha = 1;
      }
      const r0 = at(0, 0.96), r1 = at(1, 0.96);
      ctx4.strokeStyle = shade(col, 0.55);
      ctx4.lineWidth = Math.max(1.4, R5 * 1.2);
      ctx4.beginPath();
      ctx4.moveTo(r0[0], r0[1]);
      ctx4.lineTo(r1[0], r1[1]);
      ctx4.stroke();
    } else if (mat === "tin") {
      const ribs = Math.max(6, Math.round(eave * 4));
      for (let k = 0; k <= ribs; k++) {
        const s = k / ribs;
        const a = at(s, 0), b = at(s, 1);
        ctx4.strokeStyle = k & 1 ? lt : dk;
        ctx4.globalAlpha = k & 1 ? 0.35 : 0.5;
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(b[0], b[1]);
        ctx4.stroke();
      }
      ctx4.globalAlpha = 1;
      if (wear > 0.25) {
        ctx4.fillStyle = "rgba(150,70,30,0.25)";
        for (let k = 0; k < 4; k++) {
          const s = rnd3() * 0.9, t = rnd3() * 0.8;
          const a = at(s, t), b = at(s + 0.06, t + 0.1);
          ctx4.fillRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]) + 1, Math.abs(b[1] - a[1]) + 1);
        }
      }
    } else if (mat === "slate" || mat === "solar") {
      const rr22 = rows2 * 2;
      ctx4.strokeStyle = dk;
      ctx4.globalAlpha = 0.55;
      for (let i = 1; i < rr22; i++) {
        const a = at(0, i / rr22), b = at(1, i / rr22);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(b[0], b[1]);
        ctx4.stroke();
      }
      ctx4.globalAlpha = 0.35;
      const cols2 = Math.max(4, Math.round(eave * 3));
      for (let i = 0; i < rr22; i++) {
        const off = i & 1 ? 0.5 : 0;
        ctx4.beginPath();
        for (let k = 0; k < cols2; k++) {
          const s = (k + off) / cols2;
          const a = at(s, i / rr22), b = at(s, (i + 1) / rr22);
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(b[0], b[1]);
        }
        ctx4.stroke();
      }
      ctx4.globalAlpha = 1;
      if (mat === "solar") {
        ctx4.fillStyle = "rgba(20,35,70,0.78)";
        const q = [at(0.12, 0.12), at(0.88, 0.12), at(0.88, 0.62), at(0.12, 0.62)];
        ctx4.beginPath();
        q.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
        ctx4.closePath();
        ctx4.fill();
        ctx4.strokeStyle = "rgba(190,210,235,0.55)";
        for (let k = 1; k < 6; k++) {
          const a = at(0.12 + 0.76 * k / 6, 0.12), b = at(0.12 + 0.76 * k / 6, 0.62);
          ctx4.beginPath();
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(b[0], b[1]);
          ctx4.stroke();
        }
      }
    } else {
      const ribs = Math.max(5, Math.round(eave * 2.2));
      ctx4.strokeStyle = lt;
      ctx4.globalAlpha = 0.6;
      for (let k = 0; k <= ribs; k++) {
        const s = k / ribs;
        const a = at(s, 0), b = at(s, 1);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(b[0], b[1]);
        ctx4.stroke();
      }
      ctx4.strokeStyle = dk;
      ctx4.globalAlpha = 0.35;
      for (let k = 0; k < ribs; k++) {
        const s = (k + 0.08) / ribs;
        const a = at(s, 0), b = at(s, 1);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(b[0], b[1]);
        ctx4.stroke();
      }
      ctx4.globalAlpha = 1;
    }
    if (wear > 0.5 && mat !== "metal") {
      ctx4.fillStyle = "rgba(70,110,50,0.14)";
      const a = at(0, 0), b = at(1, 0), c2 = at(1, 0.18), d = at(0, 0.18);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.lineTo(c2[0], c2[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.closePath();
      ctx4.fill();
    }
    ctx4.restore();
  }

