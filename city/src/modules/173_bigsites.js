  // src/bigsites.js — 埋立地の南の列(第2期)の大きな施設: ドリームパーク(屋外の乗り物)・総合スタジアム(四方のスタンド)・臨海工場。
  // 実際の広さに近づける(1マス=2m・高さ1単位≒1m)。乗り物・スタンド・煙突などは敷地の設備(site.solid / site.props)として、
  // その場で線と面で描く(大きな一枚絵を作らないので、メモリを使いすぎない)。
  // 配置の形式は siteLayout と同じ(main/annex/ground/solid/props/gate)。門は南。
  function bigLayout(type, W2, H4, hsh) {
    const cx = W2 >> 1;
    if (type === "themepark") {
      // 青海ドリームパーク: 約25ha(後楽園ゆうえんちの数倍・としまえん程度)
      const L3 = { W: W2, H: H4, main: [cx - 14, H4 - 14, 28, 6, 2], annex: [], ground: [], solid: [], props: [], gate: [cx, H4 - 8], open: true, kit: "s_hall" };
      const g = L3.ground, s = L3.solid, p = L3.props;
      g.push(["paved", cx - 30, H4 - 16, 60, 16], ["paved", cx - 4, 60, 8, H4 - 74], ["paved", cx - 26, 30, 52, 32], ["paved", 10, 20, W2 - 20, 5], ["paved", 10, H4 - 42, W2 - 20, 5], ["paved", 10, 20, 5, H4 - 57], ["paved", W2 - 15, 20, 5, H4 - 57], ["paved", 10, 106, W2 - 20, 5]);
      // 乗り物(立入不可。入口の前に待ち列)
      const ride = (k, x, y, w, h, q) => {
        s.push([k, x, y, w, h, { big: 1, ride: k }]);
        if (q) p.push(["queue", q[0], q[1], q[2], q[3]]);
      };
      ride("castle", cx - 9, 36, 18, 14, null);
      ride("coaster", cx + 16, 30, 92, 70, [cx + 52, 101, 14, 4]);
      ride("ferris", 44, 36, 26, 14, [50, 51, 14, 4]);
      ride("drop", W2 - 48, 116, 12, 12, [W2 - 50, 129, 14, 4]);
      ride("merry", 36, 118, 18, 18, [36, 137, 14, 3]);
      ride("cups", 66, 118, 16, 16, [66, 135, 14, 3]);
      ride("kart", 22, 142, 72, 30, [96, 160, 4, 12]);
      ride("haunt", W2 - 84, 140, 32, 20, [W2 - 78, 161, 18, 3]);
      s.push(["lake", cx - 66, 66, 44, 32]);
      // 屋台・ベンチ・木・街灯
      for (let y = 66; y < H4 - 20; y += 10) p.push(["kiosk", cx - 8, y], ["tree", cx + 7, y + 4], ["lamp", cx - 6, y + 6], ["bench", cx + 6, y + 8]);
      for (let x = 18; x < W2 - 18; x += 14) p.push(["tree", x, 18], ["tree", x + 6, H4 - 36], ["lamp", x + 3, 26]);
      for (let y = 30; y < H4 - 50; y += 14) p.push(["tree", 17, y], ["tree", W2 - 18, y]);
      for (const [x, y] of [[cx - 20, 58], [cx + 20, 58], [cx - 22, H4 - 18], [cx + 22, H4 - 18]]) p.push(["fountain", x, y]);
      return L3;
    }
    if (type === "stadium") {
      // 青海総合スタジアム: すり鉢のスタンド(外寸 260m×220m・高さ約25m)・照明塔4基・正面(南)の広場・北に駐車場と練習場
      const bw = Math.min(130, W2 - 60), bh = 110, x0 = cx - (bw >> 1), y0 = H4 - 20 - bh, d = 22;
      const L3 = { W: W2, H: H4, main: [cx - 20, H4 - 16, 40, 10, 2], annex: [], ground: [], solid: [], props: [], gate: [cx, H4 - 8], kit: "s_hall" };
      const g = L3.ground, s = L3.solid, p = L3.props;
      g.push(["field", x0 + d, y0 + d, bw - 2 * d, bh - 2 * d], ["paved", 4, y0 + bh - 2, W2 - 8, H4 - (y0 + bh - 2) - 2], ["paved", x0 - 5, y0 - 5, bw + 10, 5], ["paved", x0 - 5, y0, 5, bh], ["paved", x0 + bw, y0, 5, bh]);
      s.push(["stand", x0, y0, bw, d, { big: 1, side: "N" }], ["stand", x0, y0 + bh - d, bw, d, { big: 1, side: "S" }], ["stand", x0, y0 + d, d, bh - 2 * d, { big: 1, side: "W" }], ["stand", x0 + bw - d, y0 + d, d, bh - 2 * d, { big: 1, side: "E" }]);
      p.push(["pitch", x0 + d, y0 + d, bw - 2 * d, bh - 2 * d]);
      for (const [x, y] of [[x0 - 3, y0 - 3], [x0 + bw + 2, y0 - 3], [x0 - 3, y0 + bh - 1], [x0 + bw + 2, y0 + bh - 1]]) p.push(["light", x, y]);
      // 北: 駐車場(左右)と練習場・テニスコート
      const ly = 4, lh = y0 - 12;
      if (lh > 12) {
        g.push(["paved", 6, ly, 70, lh], ["paved", W2 - 76, ly, 70, lh], ["field", 80, ly, W2 - 160, lh]);
        p.push(["lot", 6, ly, 70, lh], ["lot", W2 - 76, ly, 70, lh], ["track", 80, ly, W2 - 160, lh]);
      }
      // 西と東の通路(駐車場から正面の広場へ)
      g.push(["paved", 6, ly, 6, H4 - ly - 2], ["paved", W2 - 12, ly, 6, H4 - ly - 2]);
      if (x0 > 30) {
        g.push(["court", 14, y0 + 10, x0 - 22, 40]);
        p.push(["tennis", 14, y0 + 10, x0 - 22, 40]);
      }
      for (let x = 10; x < W2 - 10; x += 12) p.push(["tree", x, H4 - 4], ["lamp", x + 6, y0 + bh + 3]);
      return L3;
    }
    if (type === "factory") {
      // 臨海工場: 組立工場・倉庫2棟・タンク・煙突・トラックヤード
      const L3 = { W: W2, H: H4, main: [6, 116, W2 - 12, 30, 2], annex: [], ground: [], solid: [], props: [], gate: [cx, H4 - 8] };
      const g = L3.ground, s = L3.solid, p = L3.props;
      g.push(["paved", 2, 2, W2 - 4, H4 - 4]);
      s.push(["box", 4, 14, (W2 >> 1) - 6, 44, { big: 1, h2: 11, col: "#cfc8b8", roof: "saw", label: "第一倉庫" }], ["box", (W2 >> 1) + 2, 14, (W2 >> 1) - 6, 44, { big: 1, h2: 13, col: "#bfc6cc", roof: "flat", label: "第二倉庫" }]);
      for (let k = 0; k < 4; k++) s.push(["tank", 8 + k * 15, 66, 10, 10, { big: 1, h2: 12 }]);
      p.push(["chimney", W2 - 12, 96], ["chimney", W2 - 22, 98]);
      p.push(["lot", 6, 156, W2 - 12, 18]);
      for (let k = 0; k < 4; k++) p.push(["truck", 10 + k * 14, 182, 3, 11]);
      for (let x = 6; x < W2 - 4; x += 10) p.push(["lamp", x, 152]);
      return L3;
    }
    return null;
  }
  // ---- 描画の部品
  var bpt = (P2, u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
  function bpoly(c, a, fill, stroke, lw) {
    c.beginPath();
    c.moveTo(a[0][0], a[0][1]);
    for (let i = 1; i < a.length; i++) c.lineTo(a[i][0], a[i][1]);
    c.closePath();
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = lw || 1;
      c.stroke();
    }
  }
  var shadeC = (hex, k) => {
    const n2 = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
    return `rgb(${f(n2 >> 16)},${f(n2 >> 8 & 255)},${f(n2 & 255)})`;
  };
  // 箱(見える面: 上・手前左(v=v1)・手前右(u=u1))
  function bbox(c, P2, u0, v0, u1, v1, z0, z1, col) {
    const p = (u, v, z) => bpt(P2, u, v, z);
    bpoly(c, [p(u0, v1, z0), p(u1, v1, z0), p(u1, v1, z1), p(u0, v1, z1)], shadeC(col, 0.86));
    bpoly(c, [p(u1, v0, z0), p(u1, v1, z0), p(u1, v1, z1), p(u1, v0, z1)], shadeC(col, 0.7));
    bpoly(c, [p(u0, v0, z1), p(u1, v0, z1), p(u1, v1, z1), p(u0, v1, z1)], shadeC(col, 1.06));
  }
  function bline(c, a, b, col, w) {
    c.strokeStyle = col;
    c.lineWidth = Math.max(1, w);
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0], b[1]);
    c.stroke();
  }
  // 円柱(上から見た楕円+胴)
  function bcyl(c, P2, u, v, r, z0, z1, col, top) {
    const a = bpt(P2, u, v, z0), b = bpt(P2, u, v, z1), rx = r * TW * P2.Z * 1.41, ry = r * TH * P2.Z * 1.41;
    c.fillStyle = shadeC(col, 0.8);
    c.beginPath();
    c.ellipse(a[0], a[1], rx, ry, 0, 0, Math.PI);
    c.lineTo(b[0] - rx, b[1]);
    c.ellipse(b[0], b[1], rx, ry, 0, Math.PI, 0, true);
    c.closePath();
    c.fill();
    c.fillStyle = top || shadeC(col, 1.05);
    c.beginPath();
    c.ellipse(b[0], b[1], rx, ry, 0, 0, 7);
    c.fill();
  }
  var isNight = (R5) => {
    const h = R5 && R5.g ? R5.g.S.min % 1440 / 60 : 12;
    return h < 6 || h >= 18;
  };
  // 試合の日(stadium の電光掲示板と同じ: 土日の昼〜夜)
  var gameDay = (R5) => {
    if (!R5 || !R5.g) return false;
    const d = R5.g.date(), h = R5.g.S.min % 1440 / 60;
    return (d.dow === 0 || d.dow === 6) && h >= 12 && h < 22;
  };
  // 高さ(画面の上下の範囲に使う)
  var BIG_TOP = { ferris: 64, coaster: 36, drop: 60, castle: 32, merry: 8, cups: 4, kart: 2, haunt: 13, stand: 34, light: 42, chimney: 48, tank: 13, box: 16, kiosk: 4, truck: 4, queue: 2 };
  var BIG_PROPS = /* @__PURE__ */ new Set(["light", "chimney", "kiosk", "truck", "queue"]);
  // siteOutdoor から: 大きな設備を奥行きの並べ替えに入れる
  function bigPush(R5, push, P2, Z, r, hero, t) {
    const top = BIG_TOP[r.kind] || 6, w = r.w || 1, h = r.h || 1;
    if (r.x > hero.x + 80 || r.x + w < hero.x - 80 || r.y > hero.y + 70 || r.y + h < hero.y - 70) return false;
    const pad = r.kind === "ferris" ? 30 : 4;
    const xs = [P2.X(r.x - pad, r.y + h + pad), P2.X(r.x + w + pad, r.y - pad)], ys = [P2.Y(r.x, r.y, top + 4), P2.Y(r.x + w, r.y + h, 0)];
    push(r.x, r.y, r.x + w, r.y + h, xs[0] - 10 * Z, xs[1] + 10 * Z, ys[0] - 10 * Z, ys[1] + 6 * Z, (c) => {
      c.save();
      try {
        (BIG_DRAW[r.kind] || (() => 0))(c, P2, Z, r, t, R5);
      } catch (e) {
      }
      c.restore();
    });
    return true;
  }
  var BIG_DRAW = {
    // 大観覧車「スカイリング」: 直径約56m。ゴンドラ24台がゆっくり回る(1周約15分=ゲーム内の時間ではなく画面の時間で約2分)
    ferris(c, P2, Z, r, t) {
      const u = r.x + r.w / 2, v = r.y + r.h / 2, R6 = 28, hub = bpt(P2, u, v, R6 + 5), zp = PXM * P2.Z, rad = R6 * zp;
      c.lineCap = "round";
      for (const [du, dv] of [[-6, 3], [6, -3], [-5, -4], [5, 4]]) bline(c, bpt(P2, u + du, v + dv, 0), hub, "#e9edf2", 1.2 * zp);
      bbox(c, P2, u - 4, v - 3, u + 4, v + 3, 0, 3, "#d6dbe2");
      c.strokeStyle = "#f4f6f8";
      c.lineWidth = Math.max(1, 0.9 * zp);
      c.beginPath();
      c.arc(hub[0], hub[1], rad, 0, 7);
      c.stroke();
      c.lineWidth = Math.max(1, 0.35 * zp);
      c.beginPath();
      c.arc(hub[0], hub[1], rad * 0.93, 0, 7);
      c.stroke();
      const N = 24, a0 = t * 0.05;
      c.strokeStyle = "rgba(235,240,245,0.8)";
      for (let k = 0; k < N; k++) {
        const a = a0 + k * 6.2832 / N;
        c.beginPath();
        c.moveTo(hub[0], hub[1]);
        c.lineTo(hub[0] + Math.cos(a) * rad, hub[1] + Math.sin(a) * rad);
        c.stroke();
      }
      const cols = ["#e8505b", "#f9a03f", "#f6d743", "#5bc06b", "#4aa3df", "#9b6ad6"];
      for (let k = 0; k < N; k++) {
        const a = a0 + k * 6.2832 / N, gx = hub[0] + Math.cos(a) * rad, gy = hub[1] + Math.sin(a) * rad;
        c.fillStyle = cols[k % cols.length];
        c.fillRect(gx - 1.1 * zp, gy, 2.2 * zp, 2.2 * zp);
        c.fillStyle = "rgba(255,255,255,0.7)";
        c.fillRect(gx - 0.8 * zp, gy + 0.4 * zp, 1.6 * zp, 0.7 * zp);
      }
      c.fillStyle = "#c9ced6";
      c.beginPath();
      c.arc(hub[0], hub[1], 1.6 * zp, 0, 7);
      c.fill();
    },
    // ジェットコースター「ブルーサンダー」: 巻き上げの坂(約34m)と2つの山。支柱・二本のレール・5両の列車が走る
    coaster(c, P2, Z, r, t) {
      const cu = r.x + r.w / 2, cv = r.y + r.h / 2, a = r.w / 2 - 3, b = r.h / 2 - 3, zp = PXM * P2.Z;
      const bump = (s, m, wd) => Math.max(0, 1 - Math.abs(s - m) / wd);
      const at = (s) => {
        s = (s % 1 + 1) % 1;
        const ang = s * 6.2832, wob = Math.sin(ang * 3) * 0.12;
        return [cu + a * Math.cos(ang) * (1 - wob * 0.4), cv + b * Math.sin(ang) * (1 + wob), 3 + 31 * Math.pow(bump(s, 0.18, 0.16), 1.3) + 18 * bump(s, 0.45, 0.1) + 11 * bump(s, 0.68, 0.08) + 5 * bump(s, 0.86, 0.06)];
      };
      const N = 160, P = [];
      for (let i = 0; i < N; i++) P.push(at(i / N));
      // 奥から手前へ(u+v の小さい順)
      const order = P.map((q, i) => i).sort((i, j) => P[i][0] + P[i][1] - (P[j][0] + P[j][1]));
      for (const i of order) {
        const q = P[i], q2 = P[(i + 1) % N];
        if (i % 4 === 0) bline(c, bpt(P2, q[0], q[1], 0), bpt(P2, q[0], q[1], q[2]), "#9aa3ad", 0.35 * zp);
        bline(c, bpt(P2, q[0], q[1], q[2]), bpt(P2, q2[0], q2[1], q2[2]), "#2b5cab", 0.55 * zp);
        bline(c, bpt(P2, q[0], q[1], q[2] + 0.6), bpt(P2, q2[0], q2[1], q2[2] + 0.6), "#3c79d6", 0.3 * zp);
      }
      // 列車: 巻き上げはゆっくり、下りは速く(位置は時間から決まる)
      const lap = 70, ph = t % lap / lap, s0 = ph < 0.3 ? ph / 0.3 * 0.2 : 0.2 + (ph - 0.3) / 0.7 * 0.8;
      for (let k = 0; k < 5; k++) {
        const q = at(s0 - k * 0.012), p0 = bpt(P2, q[0], q[1], q[2] + 0.8);
        c.fillStyle = k === 0 ? "#f2c23a" : "#e8505b";
        c.fillRect(p0[0] - 1.2 * zp, p0[1] - 0.9 * zp, 2.4 * zp, 1.4 * zp);
        c.fillStyle = "#333";
        c.fillRect(p0[0] - 0.8 * zp, p0[1] - 1.5 * zp, 1.6 * zp, 0.6 * zp);
      }
      // 乗り場
      bbox(c, P2, cu - 6, r.y + r.h - 6, cu + 6, r.y + r.h - 1, 0, 4, "#7aa7d8");
    },
    // フリーフォール「スカイドロップ」(約58m)
    drop(c, P2, Z, r, t) {
      const u = r.x + r.w / 2, v = r.y + r.h / 2, zp = PXM * P2.Z, H = 58;
      bbox(c, P2, u - 4, v - 4, u + 4, v + 4, 0, 2, "#b9c0c8");
      const a = bpt(P2, u, v, 2), b = bpt(P2, u, v, H);
      c.fillStyle = "#e8505b";
      c.fillRect(a[0] - 1.1 * zp, b[1], 2.2 * zp, a[1] - b[1]);
      c.fillStyle = "rgba(255,255,255,0.5)";
      for (let z = 6; z < H; z += 6) {
        const q = bpt(P2, u, v, z);
        c.fillRect(q[0] - 1.1 * zp, q[1], 2.2 * zp, 0.4 * zp);
      }
      const cyc = t % 40, zr = cyc < 24 ? 3 + cyc / 24 * 50 : cyc < 29 ? 53 : cyc < 31 ? 53 - (cyc - 29) / 2 * 50 : 3;
      const g = bpt(P2, u, v, zr);
      c.fillStyle = "#f6d743";
      c.beginPath();
      c.ellipse(g[0], g[1], 3.4 * zp, 1.5 * zp, 0, 0, 7);
      c.fill();
      c.fillStyle = "#333";
      for (let k = -3; k <= 3; k++) c.fillRect(g[0] + k * zp - 0.2 * zp, g[1] + 0.6 * zp, 0.4 * zp, 1.2 * zp);
    },
    // ドリームキャッスル(約30m): 本館・四隅の塔・中央の尖塔
    castle(c, P2, Z, r, t) {
      const u0 = r.x + 1, v0 = r.y + 1, u1 = r.x + r.w - 1, v1 = r.y + r.h - 1, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, zp = PXM * P2.Z;
      bbox(c, P2, u0 + 2, v0 + 2, u1 - 2, v1 - 2, 0, 12, "#f1e9f6");
      const cone = (u, v, z, rr, hh) => {
        const a = bpt(P2, u, v, z), tp = bpt(P2, u, v, z + hh);
        bpoly(c, [[a[0] - rr * zp, a[1]], tp, [a[0] + rr * zp, a[1]]], "#4a6fd1");
      };
      for (const [u, v] of [[u0 + 1.5, v0 + 1.5], [u1 - 1.5, v0 + 1.5], [u0 + 1.5, v1 - 1.5], [u1 - 1.5, v1 - 1.5]]) {
        bcyl(c, P2, u, v, 1.4, 0, 16, "#efe5f5");
        cone(u, v, 16, 2.6, 7);
      }
      bcyl(c, P2, cu, cv, 2.2, 12, 22, "#f4ecf8");
      cone(cu, cv, 22, 3.4, 10);
      const g = bpt(P2, cu, v1 - 2, 0);
      c.fillStyle = "#6a4a8a";
      c.fillRect(g[0] - 1.4 * zp, g[1] - 5 * zp, 2.8 * zp, 5 * zp);
      const f = bpt(P2, cu, cv, 32);
      c.fillStyle = "#e8505b";
      c.fillRect(f[0], f[1], 2.2 * zp, 1.2 * zp + Math.sin(t * 3) * 0.2 * zp);
    },
    merry(c, P2, Z, r, t) {
      const u = r.x + r.w / 2, v = r.y + r.h / 2, zp = PXM * P2.Z;
      bcyl(c, P2, u, v, 6.5, 0, 1, "#d9c08a", "#f0dfb6");
      for (let k = 0; k < 12; k++) {
        const a = t * 0.4 + k * 0.5236, q = bpt(P2, u + Math.cos(a) * 5, v + Math.sin(a) * 5, 1);
        const bob = Math.sin(t * 2 + k) * 0.6 * zp;
        c.fillStyle = "#c9a54a";
        c.fillRect(q[0] - 0.1 * zp, q[1] - 5 * zp, 0.2 * zp, 5 * zp);
        c.fillStyle = k % 3 === 0 ? "#fff" : k % 3 === 1 ? "#f4c6d6" : "#c8e0f4";
        c.fillRect(q[0] - 0.9 * zp, q[1] - 2.4 * zp + bob, 1.8 * zp, 1 * zp);
      }
      const top = bpt(P2, u, v, 6), tip = bpt(P2, u, v, 9), rx = 6.8 * TW * P2.Z * 1.41, ry = 6.8 * TH * P2.Z * 1.41;
      for (let k = 0; k < 12; k++) {
        const a0 = k / 12 * 6.2832, a1 = (k + 1) / 12 * 6.2832;
        bpoly(c, [tip, [top[0] + Math.cos(a0) * rx, top[1] + Math.sin(a0) * ry], [top[0] + Math.cos(a1) * rx, top[1] + Math.sin(a1) * ry]], k & 1 ? "#e8505b" : "#fff6e8");
      }
    },
    cups(c, P2, Z, r, t) {
      const u = r.x + r.w / 2, v = r.y + r.h / 2, zp = PXM * P2.Z;
      bcyl(c, P2, u, v, 6, 0, 0.6, "#9fc6e6", "#cfe4f4");
      const cols = ["#e8505b", "#f6d743", "#5bc06b", "#9b6ad6", "#f9a03f", "#4aa3df"];
      for (let k = 0; k < 6; k++) {
        const a = t * 0.5 + k * 1.047;
        bcyl(c, P2, u + Math.cos(a) * 3.8, v + Math.sin(a) * 3.8, 1.1, 0.6, 2, cols[k]);
      }
      void zp;
    },
    // ゴーカート: コースの縁石と、走るカート
    kart(c, P2, Z, r, t) {
      const zp = PXM * P2.Z, cu = r.x + r.w / 2, cv = r.y + r.h / 2, a = r.w / 2 - 4, b = r.h / 2 - 4;
      for (let k = 0; k < 6; k++) {
        const s = t * 0.06 + k / 6, q = bpt(P2, cu + a * Math.cos(s * 6.2832), cv + b * Math.sin(s * 6.2832), 0.4);
        c.fillStyle = ["#e8505b", "#4aa3df", "#f6d743", "#5bc06b", "#fff", "#9b6ad6"][k];
        c.fillRect(q[0] - 0.9 * zp, q[1] - 0.6 * zp, 1.8 * zp, 0.9 * zp);
      }
    },
    haunt(c, P2, Z, r, t) {
      const u0 = r.x + 1, v0 = r.y + 1, u1 = r.x + r.w - 1, v1 = r.y + r.h - 1, zp = PXM * P2.Z;
      bbox(c, P2, u0, v0, u1, v1, 0, 9, "#6d6a72");
      bpoly(c, [bpt(P2, u0, v0, 9), bpt(P2, u1, v0, 9), bpt(P2, u1, (v0 + v1) / 2, 13), bpt(P2, u0, (v0 + v1) / 2, 13)], "#3f3a44");
      bpoly(c, [bpt(P2, u0, v1, 9), bpt(P2, u1, v1, 9), bpt(P2, u1, (v0 + v1) / 2, 13), bpt(P2, u0, (v0 + v1) / 2, 13)], "#4a4450");
      for (let k = 0; k < 6; k++) {
        const q = bpt(P2, u0 + 2 + k * (u1 - u0 - 4) / 5, v1, 6);
        c.fillStyle = (Math.sin(t * 2 + k * 7) > 0.85) ? "#e8f0a0" : "#222";
        c.fillRect(q[0] - 0.8 * zp, q[1], 1.6 * zp, 1.8 * zp);
      }
      const sg = bpt(P2, (u0 + u1) / 2, v1, 10.5);
      c.font = `bold ${Math.max(8, 1.6 * zp)}px sans-serif`;
      c.textAlign = "center";
      c.fillStyle = "#c22";
      c.fillText("廃病院", sg[0], sg[1]);
    },
    // スタンド: 内側(競技場側)が低く外側が高い。見える側だけ描く。試合の日は観客で埋まる
    stand(c, P2, Z, r, t, R5) {
      const zp = PXM * P2.Z, zi = 3, zo = 24, side = r.side, u0 = r.x, v0 = r.y, u1 = r.x + r.w, v1 = r.y + r.h;
      const full = gameDay(R5), seat = ["#2f6db5", "#3b7fd0", "#2a5f9e"], crowd = ["#e8505b", "#f2f2f2", "#2b2b2b", "#f6d743", "#4aa3df"];
      const p = (u, v, z) => bpt(P2, u, v, z);
      const roofC = "#d3d8de", wallC = "#9da4ad";
      if (side === "N" || side === "W") {
        // 座席の面が見える(内側の縁=低い)
        const rows = 14;
        for (let i = 0; i < rows; i++) {
          const f0 = i / rows, f1 = (i + 1) / rows, z0 = zo + (zi - zo) * f0, z1 = zo + (zi - zo) * f1;
          const quad = side === "N" ? [p(u0, v0 + r.h * f0, z0), p(u1, v0 + r.h * f0, z0), p(u1, v0 + r.h * f1, z1), p(u0, v0 + r.h * f1, z1)] : [p(u0 + r.w * f0, v0, z0), p(u0 + r.w * f0, v1, z0), p(u0 + r.w * f1, v1, z1), p(u0 + r.w * f1, v0, z1)];
          bpoly(c, quad, seat[i % 3]);
          if (full) {
            const n2 = side === "N" ? Math.floor(r.w / 1.2) : Math.floor(r.h / 1.2);
            for (let k = 0; k < n2; k++) {
              if (uh(k * 31 + i, r.x + r.y) % 10 < 2) continue;
              const ff = (k + 0.5) / n2, q = side === "N" ? p(u0 + r.w * ff, v0 + r.h * (f0 + f1) / 2, (z0 + z1) / 2 + 0.6) : p(u0 + r.w * (f0 + f1) / 2, v0 + r.h * ff, (z0 + z1) / 2 + 0.6);
              c.fillStyle = crowd[uh(k, i + r.x) % crowd.length];
              c.fillRect(q[0] - 0.4 * zp, q[1] - 0.5 * zp - (Math.sin(t * 4 + k) > 0.92 ? 0.5 * zp : 0), 0.8 * zp, 0.9 * zp);
            }
          }
        }
        // 内側の低い壁と、外側の背面の上の屋根
        if (side === "N") {
          bpoly(c, [p(u0, v1, 0), p(u1, v1, 0), p(u1, v1, zi), p(u0, v1, zi)], "#d8dadf");
          bpoly(c, [p(u1, v0, 0), p(u1, v1, 0), p(u1, v1, zi), p(u1, v0, zo)], shadeC(wallC, 0.75));
          bpoly(c, [p(u0, v0 - 1, zo + 4), p(u1, v0 - 1, zo + 4), p(u1, v0 + r.h * 0.45, zo + 3), p(u0, v0 + r.h * 0.45, zo + 3)], "rgba(233,237,241,0.92)", "#b8bec6", 1);
          // 電光掲示板(北のスタンドの上・競技場向き)
          const cu = (u0 + u1) / 2;
          bpoly(c, [p(cu - 14, v0 - 0.5, zo + 5), p(cu + 14, v0 - 0.5, zo + 5), p(cu + 14, v0 - 0.5, zo + 14), p(cu - 14, v0 - 0.5, zo + 14)], "#1d2128");
          const sc = p(cu, v0 - 0.5, zo + 9.5);
          c.font = `bold ${Math.max(8, 3 * zp)}px sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillStyle = full ? "#ffd84a" : "#7fd1ff";
          c.fillText(full ? `青海 ${Math.floor(t / 90) % 3} - ${Math.floor(t / 130) % 2} 東都` : "AOUMI STADIUM", sc[0], sc[1]);
        } else {
          bpoly(c, [p(u1, v0, 0), p(u1, v1, 0), p(u1, v1, zi), p(u1, v0, zi)], "#d8dadf");
          bpoly(c, [p(u0, v1, 0), p(u1, v1, 0), p(u1, v1, zi), p(u0, v1, zo)], shadeC(wallC, 0.86));
        }
      } else {
        // 背面(外側の壁)と屋根が見える
        const ribs = Math.floor((side === "S" ? r.w : r.h) / 4);
        if (side === "S") {
          bpoly(c, [p(u0, v1, 0), p(u1, v1, 0), p(u1, v1, zo + 2), p(u0, v1, zo + 2)], wallC);
          for (let k = 0; k <= ribs; k++) bline(c, p(u0 + k * r.w / ribs, v1, 0), p(u0 + k * r.w / ribs, v1, zo + 2), "#7d848d", 0.4 * zp);
          bpoly(c, [p(u0, v1, zo - 3), p(u1, v1, zo - 3), p(u1, v1, zo - 1), p(u0, v1, zo - 1)], "#2f6db5");
          bpoly(c, [p(u1, v0, 0), p(u1, v1, 0), p(u1, v1, zo + 2), p(u1, v0, zi)], shadeC(wallC, 0.72));
          bpoly(c, [p(u0, v0 + r.h * 0.5, zo + 3), p(u1, v0 + r.h * 0.5, zo + 3), p(u1, v1 + 1, zo + 4), p(u0, v1 + 1, zo + 4)], roofC, "#b8bec6", 1);
        } else {
          bpoly(c, [p(u1, v0, 0), p(u1, v1, 0), p(u1, v1, zo + 2), p(u1, v0, zo + 2)], shadeC(wallC, 0.78));
          for (let k = 0; k <= ribs; k++) bline(c, p(u1, v0 + k * r.h / ribs, 0), p(u1, v0 + k * r.h / ribs, zo + 2), "#7d848d", 0.4 * zp);
          bpoly(c, [p(u1, v0, zo - 3), p(u1, v1, zo - 3), p(u1, v1, zo - 1), p(u1, v0, zo - 1)], "#2a5f9e");
          bpoly(c, [p(u0 + r.w * 0.5, v0, zo + 3), p(u1 + 1, v0, zo + 4), p(u1 + 1, v1, zo + 4), p(u0 + r.w * 0.5, v1, zo + 3)], roofC, "#b8bec6", 1);
        }
        // 入場口の明かり
        for (let k = 1; k < 4; k++) {
          const q = side === "S" ? p(u0 + k * r.w / 4, v1, 2.5) : p(u1, v0 + k * r.h / 4, 2.5);
          c.fillStyle = full ? "#ffe08a" : "#3a4048";
          c.fillRect(q[0] - 1.6 * zp, q[1] - 1.2 * zp, 3.2 * zp, 2.6 * zp);
        }
      }
    },
    // 照明塔(約40m): 夜と試合の日に点く
    light(c, P2, Z, r, t, R5) {
      const u = r.x + 0.5, v = r.y + 0.5, zp = PXM * P2.Z, a = bpt(P2, u, v, 0), b = bpt(P2, u, v, 38);
      c.fillStyle = "#8b929b";
      c.fillRect(a[0] - 0.5 * zp, b[1], 1 * zp, a[1] - b[1]);
      const on = isNight(R5) || gameDay(R5);
      for (let i = 0; i < 4; i++) for (let k = 0; k < 6; k++) {
        c.fillStyle = on ? "#fffbe0" : "#cfd5dc";
        c.fillRect(b[0] - 3.3 * zp + k * 1.1 * zp, b[1] - 3.6 * zp + i * 0.95 * zp, 0.9 * zp, 0.8 * zp);
      }
      if (on) {
        c.fillStyle = "rgba(255,250,220,0.10)";
        c.beginPath();
        c.arc(b[0], b[1] - 1.5 * zp, 10 * zp, 0, 7);
        c.fill();
      }
    },
    // 煙突(約46m・紅白)と煙
    chimney(c, P2, Z, r, t) {
      const u = r.x + 0.5, v = r.y + 0.5, zp = PXM * P2.Z;
      for (let i = 0; i < 8; i++) {
        const a = bpt(P2, u, v, i * 5.75), b = bpt(P2, u, v, (i + 1) * 5.75), w = (1.5 - i * 0.06) * zp;
        c.fillStyle = i % 2 ? "#e9e6e1" : "#d2483f";
        c.fillRect(a[0] - w, b[1], 2 * w, a[1] - b[1] + 1);
      }
      const top = bpt(P2, u, v, 46);
      for (let k = 0; k < 5; k++) {
        const ph = (t * 0.15 + k / 5) % 1;
        c.fillStyle = `rgba(235,235,235,${(0.55 * (1 - ph)).toFixed(2)})`;
        c.beginPath();
        c.arc(top[0] + ph * 8 * zp, top[1] - ph * 10 * zp, (1.2 + ph * 3) * zp, 0, 7);
        c.fill();
      }
    },
    tank(c, P2, Z, r) {
      bcyl(c, P2, r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) / 2 - 0.6, 0, r.h2 || 12, "#dfe3e6", "#eef1f3");
    },
    box(c, P2, Z, r) {
      const zp = PXM * P2.Z, hh = r.h2 || 11;
      bbox(c, P2, r.x + 0.5, r.y + 0.5, r.x + r.w - 0.5, r.y + r.h - 0.5, 0, hh, r.col || "#cfc8b8");
      if (r.roof === "saw") for (let k = 1; k < 8; k++) {
        const v = r.y + 0.5 + k * (r.h - 1) / 8;
        bpoly(c, [bpt(P2, r.x + 0.5, v, hh), bpt(P2, r.x + r.w - 0.5, v, hh), bpt(P2, r.x + r.w - 0.5, v - 1.5, hh + 2.4), bpt(P2, r.x + 0.5, v - 1.5, hh + 2.4)], "#b9c3cc");
      }
      // 搬入口のシャッター
      for (let k = 0; k < 3; k++) {
        const q = bpt(P2, r.x + 3 + k * (r.w - 6) / 2.5, r.y + r.h - 0.5, 0);
        c.fillStyle = "#8d949b";
        c.fillRect(q[0] - 2 * zp, q[1] - 4.5 * zp, 4 * zp, 4.5 * zp);
      }
      if (r.label) {
        const sg = bpt(P2, r.x + r.w / 2, r.y + r.h - 0.5, hh - 2);
        c.font = `bold ${Math.max(8, 1.8 * zp)}px sans-serif`;
        c.textAlign = "center";
        c.fillStyle = "#33465a";
        c.fillText(r.label, sg[0], sg[1]);
      }
    },
    kiosk(c, P2, Z, r, t) {
      const u = r.x + 0.5, v = r.y + 0.5, zp = PXM * P2.Z;
      bbox(c, P2, u - 1.2, v - 1, u + 1.2, v + 1, 0, 2, "#f3e3c4");
      const top = bpt(P2, u, v, 3.6);
      for (let k = 0; k < 8; k++) {
        const a0 = k / 8 * 6.2832, a1 = (k + 1) / 8 * 6.2832;
        bpoly(c, [[top[0], top[1] - 1 * zp], [top[0] + Math.cos(a0) * 2.6 * zp, top[1] + Math.sin(a0) * 1.3 * zp], [top[0] + Math.cos(a1) * 2.6 * zp, top[1] + Math.sin(a1) * 1.3 * zp]], k & 1 ? "#fff" : (uh(r.x, r.y) & 1 ? "#e8505b" : "#4aa3df"));
      }
    },
    truck(c, P2, Z, r) {
      const u = r.x, v = r.y;
      bbox(c, P2, u, v, u + 3, v + 8, 0.6, 4.2, "#e6e9ec");
      bbox(c, P2, u, v + 8.3, u + 3, v + 10.5, 0.6, 3.4, "#3f72b8");
    },
    // 待ち列の柵(並ぶ人は parkOutdoorVisitors)
    queue(c, P2, Z, r) {
      const zp = PXM * P2.Z;
      c.strokeStyle = "#9aa3ad";
      c.lineWidth = Math.max(1, 0.25 * zp);
      const rows = Math.max(1, Math.floor(r.h / 1.5));
      for (let i = 0; i <= rows; i++) {
        const v = r.y + i * r.h / rows;
        c.beginPath();
        c.moveTo(...bpt(P2, r.x, v, 0.9));
        c.lineTo(...bpt(P2, r.x + r.w, v, 0.9));
        c.stroke();
      }
    }
  };
  // ---- 地面の線(drawSiteGround から): サッカーの線・駐車場の区画
  function bigGround(c, P2, Z, p, quad, pt) {
    if (p.kind === "pitch") {
      quad(p.x, p.y, p.x + p.w, p.y + p.h, "#5e9e4a");
      for (let k = 0; k < 10; k += 2) quad(p.x + p.w * k / 10, p.y, p.x + p.w * (k + 1) / 10, p.y + p.h, "rgba(255,255,255,0.06)");
      const m = 6, ln = (a, b) => {
        c.beginPath();
        c.moveTo(...pt(...a));
        c.lineTo(...pt(...b));
        c.stroke();
      };
      c.strokeStyle = "rgba(255,255,255,0.85)";
      c.lineWidth = Math.max(1, 0.3 * Z);
      const x0 = p.x + m, y0 = p.y + m, x1 = p.x + p.w - m, y1 = p.y + p.h - m, cxx = (x0 + x1) / 2, cyy = (y0 + y1) / 2;
      ln([x0, y0], [x1, y0]);
      ln([x1, y0], [x1, y1]);
      ln([x1, y1], [x0, y1]);
      ln([x0, y1], [x0, y0]);
      ln([cxx, y0], [cxx, y1]);
      for (const [xa, xb] of [[x0, x0 + 8], [x1, x1 - 8]]) {
        ln([xa, cyy - 10], [xb, cyy - 10]);
        ln([xb, cyy - 10], [xb, cyy + 10]);
        ln([xb, cyy + 10], [xa, cyy + 10]);
      }
      c.beginPath();
      for (let k = 0; k <= 24; k++) {
        const a = k / 24 * 6.2832, q = pt(cxx + Math.cos(a) * 4.6, cyy + Math.sin(a) * 4.6);
        k ? c.lineTo(...q) : c.moveTo(...q);
      }
      c.stroke();
      return true;
    }
    if (p.kind === "lot") {
      c.strokeStyle = "rgba(255,255,255,0.7)";
      c.lineWidth = Math.max(1, 0.2 * Z);
      for (let y = p.y + 1; y < p.y + p.h - 4; y += 9) for (let x = p.x + 1; x < p.x + p.w - 1; x += 1.5) {
        c.beginPath();
        c.moveTo(...pt(x, y));
        c.lineTo(...pt(x, y + 3));
        c.stroke();
      }
      return true;
    }
    return false;
  }
  // ---- 来園者: ドリームパークの屋外(乗り物の待ち列・メインストリート)。半分は園内(建物の中の場面)にいる
  function parkOutdoorVisitors(C2, out, hx, hy, radius) {
    const g = C2.g, m2 = g.world.map, min = g.S.min;
    if (!m2.fsites || typeof visitsOf !== "function") return;
    const have = new Set(out.map((o) => o.id));
    for (const s of m2.fsites) {
      if (s.type !== "themepark" || s.x > hx + radius || s.x + s.w < hx - radius || s.y > hy + radius || s.y + s.h < hy - radius) continue;
      const b = m2.buildings[s.b], qs = s.props.filter((p) => p.kind === "queue"), fill = qs.map(() => 0);
      for (const vz of visitsOf(C2, b, min, have)) {
        if (min < vz.arrive || min >= vz.leave || out.length >= 200 || uh(vz.id, 74) % 2) continue;
        let x, y;
        const qi = uh(vz.id, 75) % (qs.length + 2);
        if (qi < qs.length) {
          // 待ち列: 前から詰めて並ぶ(柵の間の通路)
          const q = qs[qi], rows = Math.max(1, Math.floor(q.h / 1.5)), perRow = Math.max(1, Math.floor(q.w / 0.9)), n2 = fill[qi]++;
          if (n2 >= rows * perRow) continue;
          const row = Math.floor(n2 / perRow), k = n2 % perRow;
          x = q.x + 0.5 + (row % 2 ? perRow - 1 - k : k) * 0.9;
          y = q.y + (row + 0.5) * q.h / rows;
        } else {
          x = s.x + s.w / 2 - 3 + (uh(vz.id, 76) % 600) / 100;
          y = s.y + 62 + (uh(vz.id, 77) % Math.max(1, s.h - 80));
        }
        if (Math.abs(x - hx) > radius || Math.abs(y - hy) > radius) continue;
        have.add(vz.id);
        out.push({ id: vz.id, static: true, x, y, dx: 0, dy: -1, s: 3, visit: b.idx });
        visitNow.set(vz.id, vz);
      }
    }
  }
