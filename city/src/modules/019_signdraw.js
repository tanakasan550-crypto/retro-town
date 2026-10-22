  // src/signdraw.js
  function fit(ctx4, s, maxW, size, weight = "bold") {
    ctx4.font = `${weight} ${size}px ${SIGN_FONT}`;
    const w = ctx4.measureText(s).width;
    if (w > maxW && w > 0) {
      size = Math.max(4, size * maxW / w);
      ctx4.font = `${weight} ${size}px ${SIGN_FONT}`;
    }
    return size;
  }
  function txt(ctx4, s, cx, cy, maxW, size, col, o = {}) {
    if (!s) return;
    size = fit(ctx4, s, maxW, size, o.weight);
    ctx4.textAlign = "center";
    ctx4.textBaseline = "middle";
    if (o.glow) {
      ctx4.shadowColor = o.glow;
      ctx4.shadowBlur = o.blur || size * 0.6;
    }
    if (o.stroke) {
      ctx4.lineWidth = Math.max(1, size * 0.12);
      ctx4.strokeStyle = o.stroke;
      ctx4.strokeText(s, cx, cy);
    }
    ctx4.fillStyle = col;
    ctx4.fillText(s, cx, cy);
    ctx4.shadowBlur = 0;
    ctx4.shadowColor = "transparent";
  }
  function vtxt(ctx4, s, cx, y0, y1, maxW, col, o = {}) {
    const ch = [...s];
    if (!ch.length) return;
    const n2 = ch.length;
    const hh = (y1 - y0) / n2;
    const size = Math.min(maxW, hh * 0.95);
    ctx4.font = `bold ${size}px ${SIGN_FONT}`;
    ctx4.textAlign = "center";
    ctx4.textBaseline = "middle";
    if (o.glow) {
      ctx4.shadowColor = o.glow;
      ctx4.shadowBlur = size * 0.5;
    }
    ctx4.fillStyle = col;
    for (let i = 0; i < n2; i++) ctx4.fillText(ch[i], cx, y0 + hh * (i + 0.5));
    ctx4.shadowBlur = 0;
    ctx4.shadowColor = "transparent";
  }
  var rr = (ctx4, x, y, w, h, r) => {
    ctx4.beginPath();
    ctx4.moveTo(x + r, y);
    ctx4.lineTo(x + w - r, y);
    ctx4.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx4.lineTo(x + w, y + h - r);
    ctx4.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx4.lineTo(x + r, y + h);
    ctx4.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx4.lineTo(x, y + r);
    ctx4.quadraticCurveTo(x, y, x + r, y);
    ctx4.closePath();
  };
  function paintSignsImpl(ctx4, e, P2, poly7, mode2, o) {
    const { sp, b, w, h, R: R5, Hm } = e;
    const plan = e.plan;
    if (!plan) return;
    const day = mode2 === "day";
    const T4 = 16 * R5, M = 12 * R5;
    const { south, east } = o;
    const doorU = o.doorU;
    const style = plan.style;
    const gh = sp.gh;
    const Wp = w * T4;
    const closed = sp.closed;
    const era = sp.era;
    const neonOK = style !== "led";
    const items = plan.items;
    const find = (k) => items.filter((i) => i.k === k);
    const storefront = ["conv", "super", "shop", "eat", "mall", "dept", "game", "cinema", "clinic", "hall"].includes(sp.kind) || b.type === "pharmacy";
    south(() => {
      for (const it of items) {
        if (it.k === "wall") {
          let x0, x1, y0, hh;
          if (it.letters) {
            const cx = Wp / 2;
            const ww = Math.min(Wp * 0.8, it.text.length * 1 * T4 + 0.5 * T4);
            const yy = -(Hm - 1) * M;
            const hh2 = 0.8 * M;
            if (day) {
              ctx4.fillStyle = shade(it.bg, 0.98);
              rr(ctx4, cx - ww / 2, yy - hh2 / 2, ww, hh2, 2);
              ctx4.fill();
              txt(ctx4, it.text, cx, yy, ww - 6, hh2 * 0.72, it.fg);
            } else {
              txt(ctx4, it.text, cx, yy, ww - 6, hh2 * 0.72, "rgba(255,248,214,0.9)", { glow: "rgba(255,230,150,0.9)" });
            }
            continue;
          }
          x0 = 0.1 * T4;
          x1 = Wp - 0.1 * T4;
          hh = (it.big ? 1.2 : 0.85) * M;
          y0 = -(gh - 0.05) * M;
          const bw = x1 - x0;
          const bg = it.bg || "#fff", fg = it.fg || "#fff";
          if (day) {
            ctx4.fillStyle = shade(bg, 0.82);
            rr(ctx4, x0 - 1, y0 - 1, bw + 2, hh + 2, 3);
            ctx4.fill();
            ctx4.fillStyle = bg;
            rr(ctx4, x0, y0, bw, hh - 1, 3);
            ctx4.fill();
            ctx4.fillStyle = "rgba(255,255,255,0.18)";
            ctx4.fillRect(x0 + 2, y0 + 1, bw - 4, hh * 0.28);
            txt(ctx4, it.text, (x0 + x1) / 2, y0 + hh / 2 - 0.5, bw - 8, hh * 0.64, fg, { stroke: shade(bg, 0.6) });
            if (sp.kind === "conv") {
              ctx4.fillStyle = it.acc || "#ffd24a";
              ctx4.fillRect(x0, y0 + hh - 3, bw, 2);
              ctx4.fillStyle = "#fff";
              ctx4.fillRect(x0, y0 + hh - 5, bw, 1.5);
            }
          } else if (neonOK || style === "led") {
            ctx4.fillStyle = mixc(bg.startsWith("#") ? bg : "#888888", "#ffffff", 0.25);
            ctx4.globalAlpha = it.neon ? 0.5 : 0.8;
            rr(ctx4, x0, y0, bw, hh - 1, 3);
            ctx4.fill();
            ctx4.globalAlpha = 1;
            txt(ctx4, it.text, (x0 + x1) / 2, y0 + hh / 2 - 0.5, bw - 8, hh * 0.64, "#fff", { glow: it.neon ? "#ff5fd0" : "rgba(255,255,255,0.8)" });
          }
        } else if (it.k === "plate") {
          if (!it.text) continue;
          const ww = Math.min(Wp * 0.6, (it.text.length + 1) * 0.55 * T4);
          const cx = doorU * T4;
          const yy = -1.5 * M;
          if (day) {
            ctx4.fillStyle = it.bg || "#efe6d0";
            ctx4.fillRect(cx - ww / 2, yy - 0.3 * M, ww, 0.6 * M);
            ctx4.strokeStyle = "rgba(60,60,60,0.5)";
            ctx4.lineWidth = 1;
            ctx4.strokeRect(cx - ww / 2, yy - 0.3 * M, ww, 0.6 * M);
            txt(ctx4, it.text, cx, yy, ww - 4, 0.48 * M, it.fg || "#2a2a2a");
          }
        } else if (it.k === "door") {
          const cx = doorU * T4;
          const ww = Math.min(Wp * 0.9, Math.max(2.2 * T4, it.text.length * 0.75 * T4));
          const yy = -2.6 * M;
          const hh = 0.75 * M;
          if (day) {
            ctx4.fillStyle = shade(it.bg, 0.8);
            ctx4.fillRect(cx - ww / 2 - 1, yy - hh / 2 - 1, ww + 2, hh + 2);
            ctx4.fillStyle = it.bg;
            ctx4.fillRect(cx - ww / 2, yy - hh / 2, ww, hh);
            txt(ctx4, it.text, cx, yy, ww - 6, hh * 0.68, it.fg);
          } else {
            txt(ctx4, it.text, cx, yy, ww - 6, hh * 0.68, it.fg, { glow: it.fg });
          }
        } else if (it.k === "wood") {
          const cx = Math.max(1.4 * T4, Math.min(Wp - 1.4 * T4, doorU * T4 + (Wp > 3.5 * T4 ? -1.5 * T4 : 0)));
          const ww = Math.min(Wp * 0.7, Math.max(1.8 * T4, it.text.length * 0.7 * T4));
          const yy = -(gh - 0.55) * M;
          const hh = 0.7 * M;
          if (day) {
            ctx4.fillStyle = "#5b3a22";
            ctx4.fillRect(cx - ww / 2 - 2, yy - hh / 2 - 2, ww + 4, hh + 4);
            ctx4.fillStyle = "#8a5a34";
            ctx4.fillRect(cx - ww / 2, yy - hh / 2, ww, hh);
            ctx4.strokeStyle = "rgba(60,35,18,0.35)";
            ctx4.lineWidth = 1;
            for (let k = 1; k < 4; k++) {
              ctx4.beginPath();
              ctx4.moveTo(cx - ww / 2, yy - hh / 2 + hh * k / 4);
              ctx4.lineTo(cx + ww / 2, yy - hh / 2 + hh * k / 4);
              ctx4.stroke();
            }
            txt(ctx4, it.text, cx, yy, ww - 6, hh * 0.62, "#f6ecd2");
          }
        } else if (it.k === "noren") {
          const cx = doorU * T4;
          const ww = 1.25 * T4;
          const y0 = -2.2 * M, hh = 0.95 * M;
          const n2 = 3;
          const chars = [...b.name || ""].slice(0, 3);
          if (day) {
            ctx4.fillStyle = "#3a2a1a";
            ctx4.fillRect(cx - ww / 2 - 2, y0 - 2, ww + 4, 3);
            for (let i = 0; i < n2; i++) {
              const x = cx - ww / 2 + i * ww / n2;
              ctx4.fillStyle = it.bg;
              ctx4.beginPath();
              ctx4.moveTo(x + 1, y0);
              ctx4.lineTo(x + ww / n2 - 1, y0);
              ctx4.lineTo(x + ww / n2 - 1, y0 + hh);
              ctx4.lineTo(x + ww / (2 * n2), y0 + hh - 3);
              ctx4.lineTo(x + 1, y0 + hh);
              ctx4.fill();
              txt(ctx4, chars[i] || "", x + ww / (2 * n2), y0 + hh * 0.45, ww / n2 - 3, hh * 0.6, it.fg);
            }
          }
        } else if (it.k === "vert") {
          const x = Wp - 0.45 * T4;
          const yTop = -(gh + 0.6) * M, yBot = -1 * M;
          const ww = 0.45 * T4;
          if (day) {
            ctx4.fillStyle = shade(it.bg, 0.7);
            ctx4.fillRect(x - ww / 2 - 1, yTop - 1, ww + 2, yBot - yTop + 2);
            ctx4.fillStyle = it.bg;
            ctx4.fillRect(x - ww / 2, yTop, ww, yBot - yTop);
            vtxt(ctx4, it.text.slice(0, 5), x, yTop + 1, yBot - 1, ww - 2, it.fg);
          } else vtxt(ctx4, it.text.slice(0, 5), x, yTop + 1, yBot - 1, ww - 2, it.neon ? "#ffd0ff" : "#fff", { glow: it.fg });
        } else if (it.k === "glass") {
          const cx = Wp * 0.28;
          const yy = -(gh - 1.9) * M;
          if (it.text) {
            if (day) txt(ctx4, it.text, cx, yy, Wp * 0.3, 0.55 * M, "rgba(255,255,255,0.9)", { stroke: "rgba(40,70,100,0.55)" });
          }
        } else if (it.k === "forrent") {
          const cx = Wp / 2, yy = -(gh - 0.45) * M;
          if (day) {
            ctx4.fillStyle = "#f4f1e6";
            ctx4.fillRect(cx - 1.1 * T4, yy - 0.35 * M, 2.2 * T4, 0.7 * M);
            ctx4.strokeStyle = "#c0392b";
            ctx4.lineWidth = 1.5;
            ctx4.strokeRect(cx - 1.1 * T4, yy - 0.35 * M, 2.2 * T4, 0.7 * M);
            txt(ctx4, "\u8CB8\u5E97\u8217 \u30C6\u30CA\u30F3\u30C8\u52DF\u96C6", cx, yy, 2.1 * T4, 0.45 * M, "#c0392b");
          }
        } else if (it.k === "banner") {
          if (sp.nf > 1) {
            const x = Wp * 0.82;
            const y0 = -(Hm - 0.4) * M;
            const hh = Math.min(5 * M, (Hm - gh - 0.6) * M);
            if (hh > 1 * M && day) {
              ctx4.fillStyle = it.bg;
              ctx4.fillRect(x - 0.35 * T4, y0, 0.7 * T4, hh);
              vtxt(ctx4, it.text.slice(0, 4), x, y0 + 2, y0 + hh - 2, 0.6 * T4, it.fg);
            }
          }
        } else if (it.k === "tenant") {
          const cx = Math.min(Wp - 0.5 * T4, doorU * T4 + 1.25 * T4);
          const ww = 0.9 * T4, hh = 1.5 * M, yy = -1.9 * M;
          if (day) {
            ctx4.fillStyle = "#2b3140";
            ctx4.fillRect(cx - ww / 2, yy - hh / 2, ww, hh);
            ctx4.fillStyle = "#e7e2cf";
            const n2 = Math.min(6, Math.max(2, sp.ten.length || 3));
            for (let i = 0; i < n2; i++) {
              const t = sp.ten[i];
              ctx4.fillRect(cx - ww / 2 + 2, yy - hh / 2 + 2 + i * (hh - 4) / n2, ww - 4, (hh - 4) / n2 - 1);
              if (t) txt(ctx4, `${Math.max(1, t.f)}F ${t.name}`, cx, yy - hh / 2 + 2 + (i + 0.5) * (hh - 4) / n2, ww - 6, (hh - 4) / n2 * 0.8, "#222", { weight: "normal" });
            }
          }
        }
      }
      if (plan.uppers && plan.uppers.length && !["mall", "dept", "hotel"].includes(sp.kind)) {
        for (const t of plan.uppers) {
          const z0 = gh + (t.f - 2) * sp.sh;
          const cx = Wp * (0.2 + 0.2 * (t.f % 3));
          const yy = -(z0 + 1.6) * M;
          if (day) {
            txt(ctx4, t.name, cx + Wp * 0.1, yy, Wp * 0.5, 0.5 * M, "rgba(255,255,255,0.85)", { stroke: "rgba(40,60,90,0.5)" });
          }
        }
      }
    });
    const roofS = items.find((i) => i.k === "roof");
    if (roofS) {
      const tp = e.top;
      const rh = Math.min(2.4, 1.6 + 0.2 * R5);
      const ww = Math.min((tp.u1 - tp.u0) * T4 * 0.92, Math.max(3 * T4, roofS.text.length * 0.9 * T4));
      const cu = (tp.u0 + tp.u1) / 2;
      const bg = roofS.bg || "#d9362f";
      south(() => {
        const cx = (cu - e.top.u0) * T4;
        const y0 = -(Hm + 0.5) * M, y1 = -(Hm + 0.5 + rh) * M;
        const base = (Hm + 0.5) * M;
        void base;
        if (day) {
          ctx4.fillStyle = "#555c66";
          ctx4.fillRect(cx - ww / 2 + 3, y0 + 0.5 * M, 2, 0.5 * M);
          ctx4.fillRect(cx + ww / 2 - 5, y0 + 0.5 * M, 2, 0.5 * M);
          ctx4.fillStyle = shade(bg, 0.78);
          ctx4.fillRect(cx - ww / 2 - 1, y1 - 1, ww + 2, y0 - y1 + 2);
          ctx4.fillStyle = bg;
          ctx4.fillRect(cx - ww / 2, y1, ww, y0 - y1);
          txt(ctx4, roofS.text, cx, (y0 + y1) / 2, ww - 8, (y0 - y1) * 0.7, roofS.fg || "#fff", { stroke: shade(bg, 0.55) });
        } else {
          ctx4.fillStyle = "rgba(255,255,255,0.35)";
          ctx4.fillRect(cx - ww / 2, y1, ww, y0 - y1);
          txt(ctx4, roofS.text, cx, (y0 + y1) / 2, ww - 8, (y0 - y1) * 0.7, "#fff", { glow: "rgba(255,255,255,0.9)" });
        }
      }, e.top.u0, e.top.v1, 0);
    }
    const proj = items.find((i) => i.k === "proj");
    if (proj) {
      const uu = doorU < w / 2 ? Math.min(w - 0.3, doorU + 1.1) : Math.max(0.3, doorU - 1.1);
      const dep = 0.45;
      const hz = proj.lantern ? 0.8 : 1.4;
      const z1 = gh - 0.35;
      east(Math.min(w - 0.1, uu), () => {
        const a0 = 0, a1 = dep * T4;
        const y0 = -z1 * M, y1 = -(z1 - hz) * M;
        if (day) {
          ctx4.strokeStyle = "#444";
          ctx4.lineWidth = 1.5;
          ctx4.beginPath();
          ctx4.moveTo(a1, y0 + 2);
          ctx4.lineTo(a0 - 1, y0 + 2);
          ctx4.stroke();
          if (proj.lantern) {
            ctx4.fillStyle = "#d6301f";
            ctx4.beginPath();
            ctx4.ellipse((a0 + a1) / 2 + 0.1 * T4, (y0 + y1) / 2 + 3, 0.2 * T4, hz * M * 0.5, 0, 0, 7);
            ctx4.fill();
            ctx4.fillStyle = "#ffeab0";
            ctx4.fillRect((a0 + a1) / 2 - 0.1 * T4, y0 + 4, 0.4 * T4, 2);
            txt(ctx4, proj.text.slice(0, 2), (a0 + a1) / 2 + 0.1 * T4, (y0 + y1) / 2 + 3, 0.34 * T4, 0.5 * M, "#fff3c9");
          } else {
            ctx4.fillStyle = shade(proj.bg, 0.75);
            ctx4.fillRect(a0 - 1, y0 + 3 - 1, a1 - a0 + 2, y1 - y0 - 1);
            ctx4.fillStyle = proj.bg;
            ctx4.fillRect(a0, y0 + 3, a1 - a0, y1 - y0 - 3);
            if (proj.cross) {
              ctx4.fillStyle = "#fff";
              ctx4.fillRect((a0 + a1) / 2 - 1.5, y0 + 6, 3, y1 - y0 - 8);
              ctx4.fillRect((a0 + a1) / 2 - (y1 - y0) * 0.3, (y0 + y1) / 2 + 1, (y1 - y0) * 0.6, 3);
            } else vtxt(ctx4, proj.text.slice(0, 4), (a0 + a1) / 2, y0 + 5, y1 - 2, a1 - a0 - 3, proj.fg);
          }
        } else {
          if (proj.lantern) {
            ctx4.fillStyle = "rgba(255,120,60,0.9)";
            ctx4.beginPath();
            ctx4.ellipse((a0 + a1) / 2 + 0.1 * T4, (y0 + y1) / 2 + 3, 0.22 * T4, hz * M * 0.52, 0, 0, 7);
            ctx4.fill();
          } else {
            ctx4.fillStyle = "rgba(255,255,255,0.5)";
            ctx4.fillRect(a0, y0 + 3, a1 - a0, y1 - y0 - 3);
          }
        }
      }, h + dep);
    }
    const sleeve = items.find((i) => i.k === "sleeve");
    if (sleeve && plan.uppers && plan.uppers.length) {
      east(w, () => {
        const x = 0.32 * T4, ww = 0.5 * T4;
        const yTop = -(gh + plan.uppers.length * sp.sh * 0.95) * M, yBot = -(gh - 0.2) * M;
        const n2 = plan.uppers.length;
        if (day) {
          ctx4.fillStyle = "#2d3a4f";
          ctx4.fillRect(x - ww / 2 - 1, yTop - 1, ww + 2, yBot - yTop + 2);
          for (let i = 0; i < n2; i++) {
            const t = plan.uppers[i];
            const y0 = yTop + i * (yBot - yTop) / n2;
            ctx4.fillStyle = ["#f2efe3", "#ffe9a6", "#dff2ff"][i % 3];
            ctx4.fillRect(x - ww / 2, y0 + 1, ww, (yBot - yTop) / n2 - 2);
            vtxt(ctx4, `${t.f}F${t.name}`.slice(0, 7), x, y0 + 2, y0 + (yBot - yTop) / n2 - 2, ww - 3, "#222");
          }
        } else {
          ctx4.fillStyle = "rgba(255,248,214,0.55)";
          ctx4.fillRect(x - ww / 2, yTop, ww, yBot - yTop);
        }
      });
    }
    const stand = items.find((i) => i.k === "stand");
    if (stand) {
      const base = ctx4.getTransform();
      void base;
      const u = stand.pole ? Math.max(0.3, w - 0.45) : stand.pillar ? 0.45 : Math.min(w - 0.4, doorU + 0.95);
      const v = h + (stand.pole ? 0.28 : 0.3);
      const p = P2(u, v, 0);
      ctx4.save();
      ctx4.setTransform(base);
      ctx4.transform(1, 0.5, 0, 1, p[0], p[1]);
      const ww = stand.pole ? 0.55 * T4 : 0.7 * T4;
      const hz = stand.pole ? 4.8 : stand.pillar ? 1.4 : stand.lantern ? 1.8 : 1;
      if (day) {
        if (stand.pole) {
          ctx4.fillStyle = "#7b828a";
          ctx4.fillRect(-1.5, -hz * M, 3, hz * M);
          ctx4.fillStyle = shade(stand.bg, 0.78);
          ctx4.fillRect(-ww / 2 - 1, -hz * M - 1, ww + 2, 1.5 * M + 2);
          ctx4.fillStyle = stand.bg;
          ctx4.fillRect(-ww / 2, -hz * M, ww, 1.5 * M);
          txt(ctx4, stand.text, 0, -hz * M + 0.75 * M, ww - 4, 0.6 * M, stand.fg);
        } else if (stand.lantern) {
          ctx4.fillStyle = "#6a4a2a";
          ctx4.fillRect(-1.5, -hz * M, 3, hz * M);
          ctx4.fillStyle = "#d6301f";
          ctx4.beginPath();
          ctx4.ellipse(0, -hz * M + 0.3 * M, 0.2 * T4, 0.4 * M, 0, 0, 7);
          ctx4.fill();
        } else if (stand.pillar) {
          ctx4.fillStyle = "#9ca3aa";
          ctx4.fillRect(-ww / 2 - 1, -hz * M, ww + 2, hz * M);
          ctx4.fillStyle = stand.bg;
          ctx4.fillRect(-ww / 2, -hz * M + 2, ww, hz * M - 4);
          vtxt(ctx4, (stand.text || "").slice(0, 6), 0, -hz * M + 4, -3, ww - 4, stand.fg);
        } else {
          ctx4.fillStyle = "#4a3a2a";
          ctx4.fillRect(-ww / 2, -hz * M, 2, hz * M);
          ctx4.fillRect(ww / 2 - 2, -hz * M, 2, hz * M);
          ctx4.fillStyle = stand.bg;
          ctx4.fillRect(-ww / 2 + 2, -hz * M + 2, ww - 4, hz * M * 0.78);
          txt(ctx4, stand.text, 0, -hz * M + 2 + hz * M * 0.39, ww - 8, 0.4 * M, stand.fg);
        }
        ctx4.fillStyle = "rgba(0,0,0,0.18)";
        ctx4.fillRect(-ww / 2, -1, ww + 3, 3);
      } else if (stand.pole) {
        ctx4.fillStyle = "rgba(255,255,255,0.8)";
        ctx4.fillRect(-ww / 2, -hz * M, ww, 1.5 * M);
        txt(ctx4, stand.text, 0, -hz * M + 0.75 * M, ww - 4, 0.6 * M, "#fff", { glow: "rgba(255,255,255,0.9)" });
      } else if (stand.lantern) {
        ctx4.fillStyle = "rgba(255,120,60,0.9)";
        ctx4.beginPath();
        ctx4.ellipse(0, -hz * M + 0.3 * M, 0.22 * T4, 0.42 * M, 0, 0, 7);
        ctx4.fill();
      } else if (stand.board) {
        ctx4.fillStyle = "rgba(255,240,190,0.25)";
        ctx4.fillRect(-ww / 2, -hz * M, ww, hz * M);
      }
      ctx4.restore();
    }
    void storefront;
    void find;
    void era;
    void HB;
    void closed;
    void poly7;
  }

