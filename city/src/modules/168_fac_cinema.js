  // src/fac_cinema.js — 映画館(シネコン): ロビー(チケット売り場・売店・ポスター・上映案内)と、2〜4のスクリーン(暗い客席・赤い座席の列・動く映像)。
  // 上映はスクリーンごとの作品(架空の題名・ジャンル・上映時間)と時刻表。チケットを買い、その回のスクリーンの座席で観る。
  // 来客(visitors.js)は上映中のスクリーンの座席に座る。映像は合成した動き(実在の作品・素材は使わない)。
  var CINE_FILMS = [
    { t: "星降る坂道の約束", g: "アニメ", len: 110, k: "sky" },
    { t: "港町ラストラン", g: "アクション", len: 125, k: "city" },
    { t: "海の底のピアノ", g: "ドラマ", len: 118, k: "sea" },
    { t: "星間列車の灯", g: "SF", len: 132, k: "space" },
    { t: "向かいの探偵さん", g: "コメディ", len: 102, k: "city" },
    { t: "風の丘の小さな冒険", g: "ファミリー", len: 98, k: "sky" },
    { t: "深海ステーション", g: "サスペンス", len: 121, k: "sea" },
    { t: "月面の運動会", g: "アニメ", len: 95, k: "space" }
  ];
  var cineN = (b) => 2 + uh(b.idx, 901) % 3;
  // スクリーン i の作品(月ごとに入れ替え)と上映開始時刻(分)
  function cineProg(g, b, i) {
    const f = CINE_FILMS[(uh(b.idx, 902) + i * 3 + g.S.M) % CINE_FILMS.length];
    const starts = [];
    for (let m = 600 + i * 35; m + f.len <= 24 * 60; m += f.len + 25) starts.push(m);
    return { ...f, i, starts };
  }
  function cineNow(g, b, i) {
    const pr = cineProg(g, b, i), m = g.S.min;
    const s = pr.starts.find((a) => m >= a - 10 && m < a + pr.len);
    return s == null ? null : { ...pr, start: s, on: m >= s };
  }
  var cineHM = (m) => `${m / 60 | 0}:${String(m % 60).padStart(2, "0")}`;
  FAC_RANGE.cinema = () => ({ lo: 0, hi: 0, nf: 1 });
  FAC_LABEL.cinema = () => "ロビー・スクリーン";
  FAC_BUILD.cinema = (b, floor, g) => {
    const N2 = cineN(b), RW = 11, W2 = N2 * RW + 3, H4 = 28, ly = 18;
    const P = plan(W2, H4, "floor_carpet", "cinema");
    P.lv = 0;
    const dx = W2 >> 1;
    P.door(dx);
    // スクリーン(北側に並ぶ)
    for (let i = 0; i < N2; i++) {
      const x0 = 1 + i * RW, x1 = x0 + RW - 1;
      P.room(x0, 1, x1, ly - 2, { doors: [[x0 + 2, ly - 2]], label: `スクリーン${i + 1}`, tile: "floor_dark" });
      P.add("fx_cscreen", x0 + 1, 2, null, `スクリーン${i + 1}の画面`, true, { w: RW - 2, h: 1, scr: i });
      for (let r = 0; r < 8; r++) for (let x = x0 + 1; x < x1; x++) {
        if (x === x0 + 2) continue;
        P.add("fx_cseat", x, 5 + r * 1.25 | 0, "fx_cwatch", `スクリーン${i + 1}の座席`, false, { scr: i, row: r });
      }
      P.add("exitsign", x0 + 1, ly - 3, null, "非常口", true);
    }
    // ロビー: チケット売り場・売店・上映案内・ポスター・ソファ
    P.fill(1, ly - 1, W2 - 2, H4 - 2, "floor_carpet");
    P.wide("counter", 2, ly + 2, 4, 1, "fx_cticket", "チケット売り場(上映スケジュール)");
    P.wide("counter", W2 - 7, ly + 2, 4, 1, "fx_conc", "売店(ポップコーン・ドリンク)");
    P.add("fx_cboard", dx - 1, ly, "fx_cinfo", "本日の上映スケジュール", true, { w: 3, h: 1 });
    for (let i = 0; i < N2; i++) P.add("fx_poster", 2 + i * 3, H4 - 2, null, `ポスター「${cineProg(g || { S: { M: 0 } }, b, i).t}」`, true, { scr: i });
    P.add("sofa", dx + 3, H4 - 4, "rest", "ロビーのソファ", false);
    P.add("sofa", dx - 4, H4 - 4, "rest", "ロビーのソファ", false);
    P.add("vending", W2 - 2, H4 - 3, null, "飲み物の自動販売機");
    P.add("toilet", W2 - 2, ly, "toilet", "トイレ");
    P.staffSpots.push({ x: 3, y: ly + 3, role: "ticket" }, { x: W2 - 5, y: ly + 3, role: "shop" }, { x: dx, y: ly - 1, role: "usher" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 4, label: "ロビー・スクリーン", cineN: N2, cineLy: ly });
  };
  // ---- 操作
  FAC_ACTS.fx_cinfo = (g, o, b, push) => push("cinfo", "上映スケジュールを見る");
  FAC_RUN.cinfo = (g, arg, tg, r) => {
    const b = g.world.map.buildings[g.S.loc.b];
    r.msg = [...Array(cineN(b)).keys()].map((i) => {
      const pr = cineProg(g, b, i);
      return `スクリーン${i + 1}「${pr.t}」(${pr.g}・${pr.len}分) ${pr.starts.map(cineHM).join(" / ")}`;
    }).join("\n");
  };
  FAC_ACTS.fx_cticket = (g, o, b, push) => {
    const m = g.S.min, pr = yenf(g, g.age() < 13 ? 1000 : g.age() < 18 ? 1500 : 1900);
    let n2 = 0;
    for (let i = 0; i < cineN(b); i++) {
      const p = cineProg(g, b, i), s = p.starts.find((a) => a >= m - 10);
      if (s == null) continue;
      push(`cbuy:${i}:${s}`, `スクリーン${i + 1}「${p.t}」${cineHM(s)}の回(¥${pr.toLocaleString()})`, { disabled: g.hero.money < pr });
      n2++;
    }
    if (!n2) push("none", "本日の上映は終了しました", { disabled: true });
  };
  FAC_RUN.cbuy = (g, arg, tg, r) => {
    const [i, s] = String(arg).split(":").map(Number), b = g.world.map.buildings[g.S.loc.b], p = cineProg(g, b, i);
    const pr = yenf(g, g.age() < 13 ? 1000 : g.age() < 18 ? 1500 : 1900);
    g.pay(pr, "映画のチケット");
    g.S.cine = { b: b.idx, scr: i, start: s, t: p.t, len: p.len, day: g.S.M * 40 + g.date().d };
    r.msg = `「${p.t}」${cineHM(s)}の回のチケットを買いました。スクリーン${i + 1}へどうぞ(入場は10分前から)。`;
  };
  FAC_ACTS.fx_conc = (g, o, b, push) => {
    push("cpop", `ポップコーンとドリンクのセット(¥${yenf(g, 800)})`, { disabled: g.hero.money < yenf(g, 800) });
  };
  FAC_RUN.cpop = (g, arg, tg, r) => {
    g.pay(yenf(g, 800), "映画館の売店");
    g.S.cinePop = g.S.M * 40 + g.date().d;
    r.msg = "キャラメルと塩のハーフ&ハーフにしました。" + g.chg({ hunger: 6, mood: 1 });
  };
  FAC_ACTS.fx_cwatch = (g, o, b, push) => {
    const c = g.S.cine, now = cineNow(g, b, o.scr);
    const ok = c && c.b === b.idx && c.scr === o.scr && c.day === g.S.M * 40 + g.date().d && now && now.start === c.start;
    if (!ok) return push("none", now ? "この回のチケットがありません(ロビーで購入)" : "いまは上映していません", { disabled: true });
    const left = c.start + c.len - g.S.min;
    push("cwatch", `座って「${c.t}」を観る(${now.on ? "上映中・残り" + left + "分" : "まもなく上映"})`);
  };
  FAC_RUN.cwatch = (g, arg, tg, r) => {
    const c = g.S.cine;
    const end = c.start + c.len;
    g.advance(Math.max(1, end - g.S.min));
    g.S.cine = null;
    const pop = g.S.cinePop === g.S.M * 40 + g.date().d;
    g.log("event", `映画「${c.t}」を観た`);
    r.msg = `「${c.t}」を最後まで観ました。${pop ? "ポップコーンも食べきりました。" : ""}エンドロールの曲が耳に残っています。` + g.chg({ mood: 10, intel: 0.2 });
  };
  // ---- 来客: 上映中のスクリーンの座席へ(visitorsInside で置かれた来客を座席に移す)
  function cinemaIndoor(C2, bIdx, I2, floor, res) {
    const g = C2.g, b = g.world.map.buildings[bIdx];
    if (!b || b.type !== "cinema" || !I2.cineN) return res;
    const seats = {};
    for (const o of I2.objs) if (o.t === "fx_cseat") (seats[o.scr] || (seats[o.scr] = [])).push(o);
    const live = [...Array(I2.cineN).keys()].filter((i) => cineNow(g, b, i));
    if (!live.length) return res;
    let k = 0;
    for (const q of res) {
      if (q.role !== "visitor") continue;
      const i = live[uh(q.id, 903) % live.length], L3 = seats[i];
      if (!L3 || !L3.length) continue;
      const s = L3[(uh(q.id, 904) + k++) % L3.length];
      q.x = s.x + 0.5;
      q.y = s.y + 0.5;
      q.dir = "u";
      q.pose = "sit";
      q.seat0 = true;
    }
    return res;
  }
  // ---- 描画
  FXH.fx_cseat = 0.6;
  FAC_DRAW.fx_cseat = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    box(c, d0.P, x + 0.12, y + 0.35, x + 0.88, y + 0.85, 0, 0.42, "#8e1c24");
    box(c, d0.P, x + 0.12, y + 0.72, x + 0.88, y + 0.88, 0.42, 1.05, "#a3232d");
  };
  FXH.fx_cscreen = 3.6;
  FAC_DRAW.fx_cscreen = (c, env, o, H5, d0) => {
    const { x, y, w, pt, t, Z } = d0, g = env.g, b = env.b;
    const v = y + 0.15, z0 = 1.0, z1 = 3.5;
    const q = (u, z) => pt(x + u * w, v, z0 + z * (z1 - z0));
    const quad = (u0, z0b, u1, z1b, col) => {
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(...q(u0, z0b));
      c.lineTo(...q(u1, z0b));
      c.lineTo(...q(u1, z1b));
      c.lineTo(...q(u0, z1b));
      c.closePath();
      c.fill();
    };
    quad(-0.02, -0.04, 1.02, 1.04, "#111");
    const now = g && b ? cineNow(g, b, o.scr) : null;
    if (!now || !now.on) {
      quad(0, 0, 1, 1, "#1d2230");
      return;
    }
    // 映像(ジャンルごとの合成した動き)
    const T = t * 0.6;
    if (now.k === "sky") {
      quad(0, 0, 1, 1, "#7cc4f0");
      quad(0, 0, 1, 0.25, "#6cbf5a");
      for (let i = 0; i < 4; i++) {
        const u = ((i * 0.31 + T * 0.03 * (1 + i % 2)) % 1.2) - 0.1;
        quad(u, 0.7 - i * 0.08, u + 0.18, 0.78 - i * 0.08, "rgba(255,255,255,0.9)");
      }
    } else if (now.k === "sea") {
      quad(0, 0, 1, 1, "#1c5a8a");
      for (let i = 0; i < 6; i++) {
        const u = ((i * 0.19 + T * 0.02) % 1), z = 0.2 + (i * 0.13 + Math.sin(T + i) * 0.05) % 0.6;
        quad(u, z, Math.min(1, u + 0.06), z + 0.04, "#f2c84a");
      }
      quad(0, 0.85, 1, 1, "#3c8ac0");
    } else if (now.k === "space") {
      quad(0, 0, 1, 1, "#0b0e24");
      for (let i = 0; i < 18; i++) {
        const u = ((i * 0.137 + T * 0.01 * (1 + i % 3)) % 1), z = (i * 0.29) % 1;
        quad(u, z, Math.min(1, u + 0.01), Math.min(1, z + 0.02), "#ffffff");
      }
      const u = (T * 0.04) % 1.2 - 0.1;
      quad(u, 0.45, u + 0.12, 0.55, "#e8642a");
    } else {
      quad(0, 0, 1, 1, "#2a2f4a");
      for (let i = 0; i < 7; i++) quad(i / 7 + 0.01, 0, i / 7 + 0.11, 0.35 + (i * 0.17) % 0.4, "#141826");
      const u = ((T * 0.08) % 1.3) - 0.15;
      quad(u, 0.05, u + 0.1, 0.12, "#e8402a");
      quad(u + 0.01, 0.12, u + 0.07, 0.16, "#ffd36a");
    }
    // 画面の光が客席に届く
    c.fillStyle = "rgba(160,190,255,0.05)";
    c.beginPath();
    c.moveTo(...q(0, 0));
    c.lineTo(...q(1, 0));
    c.lineTo(...pt(x + w, v + 12, 0));
    c.lineTo(...pt(x, v + 12, 0));
    c.closePath();
    c.fill();
    void Z;
  };
  FAC_DRAW.fx_cboard = (c, env, o, H5, d0) => {
    const { x, y, w, box, pt, Z } = d0;
    box(c, d0.P, x, y + 0.4, x + w, y + 0.55, 1.2, 2.6, "#1d2230");
    c.fillStyle = "#7ad0ff";
    for (let i = 0; i < 4; i++) {
      const a = pt(x + 0.3, y + 0.55, 2.4 - i * 0.3);
      c.fillRect(a[0], a[1], (w * 10 - 6) * Z * (0.6 + (i % 2) * 0.3), Math.max(1, Z * 0.6));
    }
  };
  FAC_DRAW.fx_poster = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    const cols = ["#d84a3a", "#3a7ad8", "#3aa86a", "#a83ad8"];
    box(c, d0.P, x + 0.15, y + 0.4, x + 0.85, y + 0.5, 1, 2.6, "#222");
    box(c, d0.P, x + 0.2, y + 0.38, x + 0.8, y + 0.4, 1.08, 2.52, cols[(o.scr || 0) % cols.length]);
  };
