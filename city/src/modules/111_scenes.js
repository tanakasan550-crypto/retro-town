  // src/scenes.js
  var PLAN_TEXT = { birth: "\u304A\u304E\u3083\u3042! \u5143\u6C17\u306A\u7523\u58F0\u304C\u75C5\u5BA4\u306B\u3072\u3073\u304F", smile: "\u306B\u3063\u3053\u308A\u3002\u306F\u3058\u3081\u3066\u306E\u7B11\u9854", roll: "\u3054\u308D\u3093\u3002\u306F\u3058\u3081\u3066\u306E\u5BDD\u8FD4\u308A", crawl: "\u30CF\u30A4\u30CF\u30A4\u3067\u3001\u3059\u3044\u3059\u3044\u9032\u3080", step: "\u3071\u305F\u3071\u305F\u2026\u306F\u3058\u3081\u306E\u4E00\u6B69", stand: "\u3064\u304B\u307E\u308A\u7ACB\u3061\u3002\u3050\u3063\u3068\u4F38\u3073\u3042\u304C\u308B", walk: "\u3068\u3066\u3068\u3066\u6B69\u3044\u3066\u3001\u5BB6\u65CF\u306E\u3082\u3068\u3078", home: "\u304A\u3046\u3061\u3067\u3001\u5BB6\u65CF\u3068\u3059\u3054\u3059\u6642\u9593" };
  function scenePlan(g) {
    const m = g.ageMonths(), id = g.hero.id;
    if (m === 0) return "birth";
    const at = (i) => milestoneMonth(id, i) === m;
    if (at(13)) return "step";
    if (at(9)) return "crawl";
    if (at(10)) return "stand";
    if (at(4)) return "roll";
    if (at(1)) return "smile";
    if (m >= 18) return "walk";
    return "home";
  }
  var nearest2 = (g, jobKey, skip = -1) => {
    const p = g.world.pop, ji = JOB_IDS2.indexOf(jobKey);
    if (ji < 0) return -1;
    for (let i = g.hero.id * 7 % p.n, k = 0; k < p.n; k++, i = (i + 1) % p.n) if (p.job[i] === ji && !p.gone[i] && i !== skip) return i;
    return -1;
  };
  function cell(g, id, age, { role, outfit, dir = "d", fr = 0, hairKey } = {}) {
    const pop = g.world.pop;
    if (!g._sinh) {
      g._sinh = (i) => [pop.mother[i], pop.father[i]];
      g._sinh.lookOf = (i) => pop.look[i];
    }
    const look = id >= 0 && id < pop.n ? pop.look[id] : 4660;
    const hd = id >= 0 && id < pop.n ? hairFor(g, id, age) : null;
    const { A: A2, col } = lifeDescribe({ id: id < 0 ? 900 : id, look, age, role, outfit, hd, inh: id >= 0 ? g._sinh : void 0, wardrobe: 0 });
    return composeCell(A2, col, dir, fr, false);
  }
  var TW2 = 74;
  var TH2 = 37;
  var pj = (x, y, z = 0) => [(x - y) * TW2 / 2, (x + y) * TH2 / 2 - z];
  function poly6(ctx4, pts, fill, stroke) {
    ctx4.beginPath();
    pts.forEach(([x, y], i) => i ? ctx4.lineTo(x, y) : ctx4.moveTo(x, y));
    ctx4.closePath();
    ctx4.fillStyle = fill;
    ctx4.fill();
    if (stroke) {
      ctx4.strokeStyle = stroke;
      ctx4.lineWidth = 1.2;
      ctx4.stroke();
    }
  }
  function box4(ctx4, x, y, w, d, h, top, left, right, z0 = 0) {
    const P2 = (a, b, c) => pj(x + a, y + b, z0 + c);
    poly6(ctx4, [P2(0, d, 0), P2(w, d, 0), P2(w, d, h), P2(0, d, h)], left, "rgba(0,0,0,.18)");
    poly6(ctx4, [P2(w, 0, 0), P2(w, d, 0), P2(w, d, h), P2(w, 0, h)], right, "rgba(0,0,0,.18)");
    poly6(ctx4, [P2(0, 0, h), P2(w, 0, h), P2(w, d, h), P2(0, d, h)], top, "rgba(0,0,0,.18)");
  }
  function room(ctx4, kind, night, t) {
    const N2 = 7, wallH = 118;
    const wl = night ? "#3b4a7a" : kind === "hospital" ? "#e8f1f5" : "#f5e7cf", wr = night ? "#34436e" : kind === "hospital" ? "#d6e6ee" : "#ecd9b8", fl = night ? "#2c3558" : kind === "hospital" ? "#cfe3e0" : "#c99a62";
    poly6(ctx4, [pj(0, 0), pj(N2, 0), pj(N2, N2), pj(0, N2)], fl, "rgba(0,0,0,.2)");
    for (let i = 1; i < N2; i++) {
      ctx4.strokeStyle = "rgba(0,0,0,.07)";
      ctx4.beginPath();
      const a = pj(i, 0), b = pj(i, N2), c = pj(0, i), d = pj(N2, i);
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.moveTo(c[0], c[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.stroke();
    }
    poly6(ctx4, [pj(0, 0), pj(0, N2), pj(0, N2, wallH), pj(0, 0, wallH)].map((p) => p), wl, "rgba(0,0,0,.2)");
    poly6(ctx4, [pj(0, 0), pj(N2, 0), pj(N2, 0, wallH), pj(0, 0, wallH)], wr, "rgba(0,0,0,.2)");
    const win = (x0, w) => {
      poly6(ctx4, [pj(x0, 0, 40), pj(x0 + w, 0, 40), pj(x0 + w, 0, 100), pj(x0, 0, 100)], night ? "#16203f" : "#bfe6ff", "#8a7a62");
      if (night) {
        const c = pj(x0 + w / 2, 0, 76);
        ctx4.fillStyle = "#f4f0c8";
        ctx4.beginPath();
        ctx4.arc(c[0], c[1], 8, 0, 7);
        ctx4.fill();
        ctx4.fillStyle = "#16203f";
        ctx4.beginPath();
        ctx4.arc(c[0] - 4, c[1] - 3, 8, 0, 7);
        ctx4.fill();
      } else {
        const a = pj(x0, 0, 100), b = pj(x0 + w, 0, 100), c = pj(x0 + w + 1.6, 3.2), d = pj(x0 - 0.4, 3.2);
        ctx4.globalAlpha = 0.16 + 0.05 * Math.sin(t * 1.3);
        poly6(ctx4, [a, b, c, d], "#fff6c0");
        ctx4.globalAlpha = 1;
      }
    };
    win(1.2, 1.7);
    win(4.1, 1.7);
    poly6(ctx4, [pj(0, 1.2, 0), pj(0, 2.4, 0), pj(0, 2.4, 92), pj(0, 1.2, 92)], kind === "hospital" ? "#b9c9d6" : "#a8794a", "#6b5a48");
    const lp = pj(3.2, 3.2, wallH - 8);
    ctx4.fillStyle = night ? "#ffe9a8" : "#fff";
    ctx4.globalAlpha = 0.9;
    ctx4.beginPath();
    ctx4.ellipse(lp[0], lp[1] + 40, 22, 7, 0, 0, 7);
    ctx4.fill();
    ctx4.globalAlpha = 1;
    if (night || kind === "hospital") {
      const g2 = ctx4.createRadialGradient(lp[0], lp[1] + 60, 5, lp[0], lp[1] + 90, 150);
      g2.addColorStop(0, "rgba(255,240,190,.38)");
      g2.addColorStop(1, "rgba(255,240,190,0)");
      ctx4.fillStyle = g2;
      ctx4.fillRect(lp[0] - 160, lp[1] - 20, 320, 260);
    }
  }
  var BED = (ctx4, x, y, hosp) => {
    box4(ctx4, x, y, 3.2, 1.6, 12, "#e9eef4", "#c6d2df", "#b3c1d2");
    box4(ctx4, x, y, 3.2, 1.6, 4, "#8aa0c0", "#6f86a8", "#5f7698", 12);
    box4(ctx4, x + 0.1, y + 0.1, 0.7, 1.4, 22, "#fff", "#eef3f8", "#dde6ef", 12);
    box4(ctx4, x + 1, y + 0.1, 2.1, 1.4, 6, hosp ? "#a9d4cf" : "#f1b7c4", hosp ? "#8cbcb6" : "#d99aab", hosp ? "#7aa9a3" : "#c4879a", 12);
  };
  var MONITOR = (ctx4, x, y, t) => {
    box4(ctx4, x, y, 0.7, 0.6, 70, "#dfe6ee", "#bcc7d3", "#a9b6c4");
    const p = pj(x + 0.7, y + 0.1, 60);
    ctx4.fillStyle = "#0c2a24";
    ctx4.fillRect(p[0] - 12, p[1] - 26, 22, 18);
    ctx4.strokeStyle = "#4af2a0";
    ctx4.lineWidth = 1.4;
    ctx4.beginPath();
    for (let i = 0; i <= 20; i++) {
      const yy = 8 + (i % 7 === 3 ? -6 : 0) * (1 + Math.sin(t * 4));
      ctx4.lineTo(p[0] - 11 + i, p[1] - 26 + 9 + (i % 7 === 3 ? -5 : i % 7 === 4 ? 4 : 0));
    }
    ctx4.stroke();
  };
  var CRIB = (ctx4, x, y) => {
    box4(ctx4, x, y, 2, 1.3, 10, "#f3e4c6", "#d7c298", "#c3ae84");
    box4(ctx4, x + 0.08, y + 0.08, 1.84, 1.14, 4, "#fff7e8", "#f1e8d6", "#e6dcc6", 10);
  };
  var SOFA = (ctx4, x, y) => {
    box4(ctx4, x, y, 2.6, 1.1, 14, "#d9b28a", "#b88f69", "#a97f5c");
    box4(ctx4, x, y, 2.6, 0.35, 38, "#cfa57b", "#b88f69", "#a97f5c");
  };
  var TABLE = (ctx4, x, y) => {
    box4(ctx4, x, y, 1.6, 1, 18, "#c58c54", "#a8733f", "#96653a");
  };
  var TOY = (ctx4, x, y) => {
    box4(ctx4, x, y, 0.35, 0.35, 8, "#f26d6d", "#d95454", "#c44848");
    box4(ctx4, x + 0.5, y + 0.1, 0.3, 0.3, 7, "#6db4f2", "#559bd9", "#4888c4");
  };
  var sprite2 = (ctx4, c, sx, sy, s, flip = false, rot = 0) => {
    if (!c) {
      ctx4.fillStyle = "rgba(0,0,0,.2)";
      ctx4.fillRect(sx - 8, sy - 6, 16, 5);
      return;
    }
    const w = c.width * s, h = c.height * s;
    ctx4.save();
    ctx4.translate(sx, sy);
    if (rot) ctx4.rotate(rot);
    if (flip) ctx4.scale(-1, 1);
    ctx4.imageSmoothingEnabled = false;
    ctx4.fillStyle = "rgba(0,0,0,.16)";
    ctx4.beginPath();
    ctx4.ellipse(0, 0, w * 0.24, h * 0.045, 0, 0, 7);
    ctx4.fill();
    ctx4.drawImage(c, -w / 2, -h, w, h);
    ctx4.restore();
  };
  var bubble = (ctx4, x, y, txt2, night) => {
    ctx4.font = "bold 15px sans-serif";
    const w = ctx4.measureText(txt2).width + 18;
    ctx4.fillStyle = "rgba(255,255,255,.95)";
    ctx4.strokeStyle = "#7a8aa8";
    ctx4.lineWidth = 1.5;
    ctx4.beginPath();
    ctx4.roundRect(x - w / 2, y - 24, w, 26, 9);
    ctx4.fill();
    ctx4.stroke();
    ctx4.beginPath();
    ctx4.moveTo(x - 5, y + 2);
    ctx4.lineTo(x, y + 9);
    ctx4.lineTo(x + 5, y + 2);
    ctx4.fill();
    ctx4.fillStyle = "#26324f";
    ctx4.textAlign = "center";
    ctx4.fillText(txt2, x, y - 6);
    ctx4.textAlign = "left";
  };
  function drawScene(ctx4, W2, H4, g, plan, t, cache14) {
    const m = g.ageMonths(), hr = g.S.min / 60, night = hr < 6 || hr >= 19;
    const hosp = plan === "birth";
    ctx4.clearRect(0, 0, W2, H4);
    ctx4.fillStyle = night ? "#101830" : hosp ? "#cfe3ea" : "#f6e9cf";
    ctx4.fillRect(0, 0, W2, H4);
    const prog = Math.min(1, t / 9), ease2 = prog * prog * (3 - 2 * prog);
    const zoom = W2 / 600 * (0.9 + 0.1 * ease2);
    const cx = W2 / 2 + 10 * Math.sin(t * 0.35), cy = H4 * 0.2 + (hosp ? 20 : 8) * (1 - ease2);
    ctx4.save();
    ctx4.translate(cx, cy);
    ctx4.scale(zoom, zoom);
    room(ctx4, hosp ? "hospital" : "home", night, t);
    const h = g.hero, mo = h.mother, fa = h.father;
    const S2 = 1.2, bob = (k) => Math.sin(t * 2.2 + k) * 1.6;
    const age = (id) => id >= 0 ? Math.max(18, g.ageOf(id)) : 30;
    const key = (...a) => a.join("|");
    const get = (k, f2) => cache14[k] || (cache14[k] = f2());
    const P2 = (x, y, z = 0) => pj(x, y, z);
    const items = [];
    const add = (depth, fn) => items.push([depth, fn]);
    if (hosp) {
      add(1.5 + 0.8, () => BED(ctx4, 1.2, 3, true));
      add(1, () => MONITOR(ctx4, 0.5, 4.6, t));
      const doc = get("docId", () => nearest2(g, "doctor")), nur = get("nurId", () => nearest2(g, "nurse")), mid = get("midId", () => nearest2(g, "nurse", nur));
      const flash = Math.floor(t * 2) % 2;
      add(4.6, () => {
        const c = get(key("mo", mo), () => cell(g, mo, age(mo), { role: "none", outfit: "cardigan", dir: "r" }));
        const [sx, sy] = P2(2, 3.55, 24);
        sprite2(ctx4, c, sx, sy + bob(1), S2 * 0.95, false, -0.06);
      });
      add(5.2, () => {
        const c = get("doc", () => cell(g, doc, 40, { outfit: "coat", dir: "l" }));
        const [sx, sy] = P2(4.4, 4);
        sprite2(ctx4, c, sx, sy + bob(2), S2);
      });
      add(5.9, () => {
        const c = get("nurse", () => cell(g, nur, 32, { outfit: "coat", dir: "u" }));
        const [sx, sy] = P2(3.2, 5.4);
        sprite2(ctx4, c, sx, sy + bob(3), S2);
      });
      add(5, () => {
        const c = get("mid", () => cell(g, mid >= 0 ? mid : doc, 45, { outfit: "coat", dir: "l" }));
        const [sx, sy] = P2(4.2, 2.6);
        sprite2(ctx4, c, sx, sy + bob(4), S2);
        const b = get("baby0", () => cell(g, h.id, 0, { dir: "d" }));
        const [bx, by] = P2(3.7, 2.7, 48 + Math.sin(t * 3) * 1.5);
        sprite2(ctx4, b, bx, by, S2 * 0.75);
      });
      add(7.6, () => {
        const c = get(key("fa", fa), () => cell(g, fa, age(fa), { role: "office", dir: "u" }));
        const e = Math.min(1, Math.max(0, (t - 1.5) / 3.5));
        const [sx, sy] = P2(1.3 + 2.2 * e, 6.6 - 1.2 * e);
        sprite2(ctx4, c, sx, sy + bob(5), S2);
      });
    } else {
      const cribSide = plan === "home" || plan === "smile" || plan === "roll";
      add(2, () => SOFA(ctx4, 1.2, 0.6));
      add(5.2, () => TABLE(ctx4, 3.9, 3));
      add(2.8, () => TOY(ctx4, 4, 5.4));
      if (m < 12) add(3.1, () => CRIB(ctx4, 1, 3.2));
      const moC = () => get(key("mo", mo), () => cell(g, mo, age(mo), { role: "home", dir: "d" })), faC = () => get(key("fa", fa), () => cell(g, fa, age(fa), { role: "home", dir: "d" }));
      add(5, () => {
        const [sx, sy] = P2(2.6, 2.4);
        sprite2(ctx4, moC(), sx, sy + bob(1), S2);
      });
      add(6.2, () => {
        const [sx, sy] = P2(4.6, 2);
        sprite2(ctx4, faC(), sx, sy + bob(2), S2, true);
      });
      const bAge = Math.max(0, m / 12), dirs = ["d", "r", "u", "l"];
      let bx = 2.1, by = 3.8, dir = "d", fr = 0, rot = 0, z = 0, sc = S2 * (m < 6 ? 0.8 : m < 12 ? 0.88 : 0.96);
      if (plan === "crawl") {
        const u = t * 0.35 % 1;
        bx = 2.2 + 2 * u;
        by = 5.2;
        dir = "r";
        fr = 1 + (Math.floor(t * 4) & 1);
        sc *= 0.92;
      } else if (plan === "step" || plan === "walk") {
        const u = t * 0.22 % 1;
        bx = 5.4 - 2.6 * u;
        by = 4.6;
        dir = "l";
        fr = 1 + (Math.floor(t * 4) & 1);
      } else if (plan === "stand") {
        bx = 2.8;
        by = 4.3;
        dir = "d";
        z = 6 * Math.sin(t * 2) ** 2;
      } else if (plan === "roll") {
        bx = 2.2;
        by = 4.2;
        rot = Math.min(1.5, t % 4 * 0.6) * (Math.floor(t / 4) % 2 ? -1 : 1);
      } else if (m < 12) {
        bx = 1.8;
        by = 3.7;
        z = 12;
      } else {
        bx = 3.4;
        by = 4.6;
        dir = dirs[Math.floor(t / 3) % 4];
      }
      add(bx + by + 0.3, () => {
        const c = get(key("baby", Math.floor(m / 3), dir, fr), () => cell(g, h.id, m / 12, { dir, fr }));
        const [sx, sy] = P2(bx, by, z);
        sprite2(ctx4, c, sx, sy + bob(6) * (plan === "roll" ? 0 : 0.5), sc, false, rot);
        if (plan === "smile" && Math.sin(t * 3) > 0) {
          ctx4.fillStyle = "#ff7a9a";
          ctx4.font = "18px sans-serif";
          ctx4.fillText("\u2661", sx + 16, sy - 70 * sc / 1.2 - 4 * Math.sin(t * 3));
        }
      });
    }
    items.sort((a, b) => a[0] - b[0]);
    for (const [, f2] of items) {
      try {
        f2();
      } catch (e) {
        cache14.__err = String(e.message);
      }
    }
    ctx4.restore();
    const text = PLAN_TEXT[plan] || "";
    if (text) {
      ctx4.font = `bold ${Math.round(W2 / 30)}px sans-serif`;
      ctx4.textAlign = "center";
      const tw = ctx4.measureText(text).width + 24;
      ctx4.fillStyle = "rgba(15,22,48,.72)";
      ctx4.beginPath();
      ctx4.roundRect(W2 / 2 - tw / 2, H4 - 46, tw, 34, 12);
      ctx4.fill();
      ctx4.fillStyle = "#fff";
      ctx4.fillText(text, W2 / 2, H4 - 23);
      ctx4.textAlign = "left";
    }
    if (plan === "birth" && t > 2.5 && t < 8) {
      const e = Math.min(1, (t - 2.5) * 1.5);
      ctx4.globalAlpha = e * (t < 7 ? 1 : 8 - t);
      bubble(ctx4, W2 * 0.46, H4 * 0.33, "\u304A\u304E\u3083\u3042!", night);
      ctx4.globalAlpha = 1;
    }
  }
  function sceneInto(canvas, g) {
    const plan = scenePlan(g), cache14 = {};
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W2 = 640, H4 = 400;
    canvas.width = W2 * dpr;
    canvas.height = H4 * dpr;
    const ctx4 = canvas.getContext("2d");
    ctx4.scale(dpr, dpr);
    const t0 = performance.now();
    let id = 0;
    const loop = () => {
      if (!canvas.isConnected) return;
      try {
        drawScene(ctx4, W2, H4, g, plan, (performance.now() - t0) / 1e3, cache14);
      } catch (e) {
        ctx4.fillStyle = "#fff";
        ctx4.fillText("\u5834\u9762\u3092\u8868\u793A\u3067\u304D\u307E\u305B\u3093: " + e.message, 10, 20);
        return;
      }
      id = requestAnimationFrame(loop);
    };
    loop();
    return plan;
  }

