  // src/fac_stadium.js — スタジアム(野球・サッカー): コンコース → 四方を囲む立体スタンド → 試合(選手とボールが動く・電光掲示板)
  // 日程: 野球(4〜9月の火〜日・平日18時/土日14時)、サッカー(2〜12月の土曜15時・水曜19時)。試合の結果は日付から決まる。
  var SD_TEAMS = { b: ["青海マリナーズ", ["東都ジャイアンツ", "浪花タイガース", "港北ベイスターズ", "杜の都イーグルス", "博多ホークス", "札幌ファイターズ"]], s: ["青海FC", ["東都ヴェルディア", "浪花セレッソ", "湘南ベルマーレン", "広島サンフレッチェ", "仙台ベガルタ"]] };
  function sdEvent(g, dayOff = 0) {
    if (globalThis.__SDEV && !dayOff) return globalThis.__SDEV;
    const d = g.date(), m0 = d.m0, dow = (d.dow + dayOff) % 7;
    const seed = uh(g.S.M * 40 + d.d + dayOff, 77);
    if (m0 >= 3 && m0 <= 8 && dow !== 1) {
      const start = dow === 0 || dow === 6 ? 14 * 60 : 18 * 60;
      return { kind: "b", start, end: start + 190, opp: SD_TEAMS.b[1][seed % 6], seed };
    }
    if (m0 >= 1 && m0 <= 11 && (dow === 6 || dow === 3)) {
      const start = dow === 6 ? 15 * 60 : 19 * 60;
      return { kind: "s", start, end: start + 110, opp: SD_TEAMS.s[1][seed % 5], seed };
    }
    return null;
  }
  // 試合経過(野球: 9回の得点、サッカー: 得点時刻)
  function sdGame(ev) {
    if (ev.kind === "b") {
      const inn = [];
      for (let i = 0; i < 18; i++) {
        const r = uh(ev.seed, i + 3) % 100;
        inn.push(r < 62 ? 0 : r < 82 ? 1 : r < 93 ? 2 : r < 98 ? 3 : 4);
      }
      return { inn };
    }
    const goals = [];
    const n2 = uh(ev.seed, 9) % 5;
    for (let i = 0; i < n2; i++) goals.push({ m: 3 + uh(ev.seed, 20 + i) % 88, home: uh(ev.seed, 40 + i) % 100 < 55 });
    goals.sort((a, b) => a.m - b.m);
    return { goals };
  }
  function sdScore(ev, min) {
    const G4 = sdGame(ev);
    if (ev.kind === "b") {
      const prog = Math.max(0, Math.min(18, Math.floor((min - ev.start) / (190 / 18))));
      let away = 0, home = 0;
      for (let i = 0; i < prog; i++) i % 2 ? home += G4.inn[i] : away += G4.inn[i];
      const inning = Math.min(9, Math.floor(prog / 2) + 1);
      return { away, home, label: prog >= 18 ? "試合終了" : `${inning}回${prog % 2 ? "裏" : "表"}`, done: prog >= 18, G: G4 };
    }
    const gm = Math.max(0, Math.min(90, Math.round((min - ev.start) * 90 / 105)));
    let home = 0, away = 0;
    for (const q of G4.goals) if (q.m <= gm) q.home ? home++ : away++;
    return { away, home, label: gm >= 90 ? "試合終了" : `後半${gm > 45 ? gm - 45 : 0}分`.replace("後半0分", `前半${gm}分`), done: gm >= 90, G: G4 };
  }
  FAC_RANGE.stadium = () => ({ lo: 0, hi: 1, nf: 2 });
  FAC_LABEL.stadium = (b, lv) => lv === 0 ? "1F コンコース・チケット・売店" : "2F スタンド(観客席)";
  FAC_KEY.stadium = (g) => {
    const ev = sdEvent(g);
    return ev ? ev.kind + ev.seed : "x";
  };
  FAC_BUILD.stadium = (b, floor, g) => floor === 0 ? sdConcourse(b, g) : sdBowl(b, g);
  function sdConcourse(b, g) {
    const W2 = 56, H4 = 20;
    const P = plan(W2, H4, "floor_paving", "leisure");
    P.lv = 0;
    const dx = 28;
    P.door(dx);
    for (const x of [dx - 10, dx - 7, dx + 7, dx + 10]) P.wide("ticketbooth", x - 1, H4 - 6, 3, 1, "fx_sdticket", "チケット売り場(当日券)");
    for (const x of [dx - 3, dx - 1, dx + 1, dx + 3]) P.add("gate", x, 10, null, "入場ゲート(チケット確認)", false);
    P.hwall(1, W2 - 2, 10, [dx - 3, dx - 1, dx + 1, dx + 3], "スタンドへの仕切り");
    P.sign(dx, 11, "ENTRANCE 入場口");
    P.add("board", dx - 6, 12, "fx_sdinfo", "今日の試合・日程", true);
    // 売店
    const food = [["からあげ・ポテト", "kara"], ["焼きそば", "yaki"], ["スタジアムグルメ(カレー)", "curry"], ["ドリンク・ビール", "drink"]];
    food.forEach(([l, k], i) => P.add("kiosk", 4 + i * 4, 4, "fx_sdfood", l, true, { food: k }));
    P.wide("showcase", W2 - 14, 4, 4, 1, "fx_sdshop", "オフィシャルショップ(ユニフォーム・タオル・メガホン)");
    P.add("shelf", W2 - 9, 4, "fx_sdshop", "応援グッズ");
    for (let i = 0; i < 4; i++) P.stair(6 + i * 14, 1, 1, "スタンドへ(階段)");
    P.lifts(W2 - 4, 1, 1, 0, 1, "エレベーター(車いす席)");
    P.add("toilet", 1, 7, "toilet", "トイレ");
    P.add("toilet", W2 - 2, 7, "toilet", "トイレ");
    P.staffSpots.push({ x: dx - 10, y: H4 - 7, role: "ticket" }, { x: dx + 10, y: H4 - 7, role: "ticket" }, { x: dx, y: 11, role: "gate" }, { x: 5, y: 3, role: "food" }, { x: W2 - 12, y: 3, role: "shop" });
    return P.done({ floors: 2, floor: 0, lv: 0, lo: 0, hi: 1, wallH: 3.2, label: FAC_LABEL.stadium(b, 0) });
  }
  function sdBowl(b, g) {
    const W2 = 60, H4 = 44;
    const P = plan(W2, H4, "floor_paving", "leisure");
    P.lv = 1;
    const ev = g ? sdEvent(g) : null;
    // フィールド
    P.wide("fx_field", 11, 11, 38, 24, "fx_sdwatch", "グラウンド", { mode: ev ? ev.kind : "b" });
    // スタンド: 北(高い)・西・東・南(手前は低く)
    P.wide("fx_stands", 2, 1, 56, 9, "fx_sdwatch", "バックスクリーン側・外野スタンド", { side: "n", rows: 9 });
    P.wide("fx_stands", 1, 11, 8, 24, "fx_sdwatch", "三塁側・アウェイ応援席", { side: "w", rows: 8, away: true });
    P.wide("fx_stands", 51, 11, 8, 24, "fx_sdwatch", "一塁側・ホーム応援席", { side: "e", rows: 4 });
    P.wide("fx_stands", 11, 37, 38, 4, "fx_sdwatch", "バックネット裏・内野席", { side: "s", rows: 3 });
    P.wide("fx_score", 24, 0, 12, 1, "fx_sdwatch", "電光掲示板・オーロラビジョン", {});
    for (const [x, y] of [[10, 10], [49, 10], [10, 36], [49, 36]]) P.stair(x, y, 0, "コンコースへ(階段)");
    P.lifts(W2 - 5, 36, 1, 0, 1, "エレベーター");
    for (let k = 0; k < 18; k++) P.seatSpots.push({ x: 12 + k * 2, y: 41 });
    P.staffSpots.push({ x: 30, y: 36, role: "vendor" }, { x: 9, y: 22, role: "vendor" }, { x: 50, y: 22, role: "vendor" });
    return P.done({ floors: 2, floor: 1, lv: 1, lo: 0, hi: 1, wallH: 0.8, roof: true, noDoor: true, label: FAC_LABEL.stadium(b, 1) });
  }
  // ---- 行動
  var sdToday = (g) => g.S.sdTicket && g.S.sdTicket.day === g.S.M * 40 + g.date().d;
  FAC_ACTS.fx_sdinfo = (g, o, b, push) => push("sdinfo", "今日と今週の日程を見る");
  FAC_RUN.sdinfo = (g, arg, tg, r) => {
    const out = [];
    for (let k = 0; k < 7; k++) {
      const ev = sdEvent(g, k);
      if (ev) out.push(`${k === 0 ? "今日" : k + "日後"} ${Math.floor(ev.start / 60)}:00 ${ev.kind === "b" ? "プロ野球 " + SD_TEAMS.b[0] : "サッカー " + SD_TEAMS.s[0]} vs ${ev.opp}`);
    }
    r.msg = out.length ? out.join(" / ") : "今週は試合がありません(スタジアムツアー・グラウンド整備)。";
  };
  FAC_ACTS.fx_sdticket = (g, o, b, push) => {
    const ev = sdEvent(g);
    if (!ev) return push("none", "今日は試合がありません(日程は掲示板で)", { disabled: true });
    if (g.S.min > ev.end) return push("none", "本日の試合は終了しました", { disabled: true });
    if (sdToday(g)) return push("none", `チケットをお持ちです(${g.S.sdTicket.seat})`, { disabled: true });
    for (const [k, l, p] of [["out", "外野自由席", 1800], ["in", "内野指定席", 3800], ["net", "バックネット裏SS席", 8800], ["vip", "VIPボックス", 25e3]]) {
      const pr = yenf(g, ev.kind === "s" ? Math.round(p * 0.9) : p);
      push(`sdbuy:${k}:${pr}`, `${l}(¥${pr.toLocaleString()})`, { disabled: g.hero.money < pr });
    }
  };
  FAC_RUN.sdbuy = (g, arg, tg, r) => {
    const [k, pr] = String(arg).split(":");
    const seat = { out: "外野自由席", in: "内野指定席", net: "バックネット裏SS席", vip: "VIPボックス" }[k];
    g.pay(+pr, "観戦チケット");
    g.S.sdTicket = { day: g.S.M * 40 + g.date().d, seat, k };
    const ev = sdEvent(g);
    r.msg = `${seat}のチケットを買いました。${ev.kind === "b" ? "プレイボール" : "キックオフ"}は${Math.floor(ev.start / 60)}:00。ゲートを入って階段からスタンドへ。`;
  };
  FAC_ACTS.fx_sdwatch = (g, o, b, push) => {
    const ev = sdEvent(g);
    if (!ev) {
      push("sdempty", "誰もいないグラウンドを眺める(グラウンド整備中)");
      return;
    }
    if (!sdToday(g)) return push("none", "観戦にはチケットが必要です(1Fチケット売り場)", { disabled: true });
    const m = g.S.min;
    if (m > ev.end) return push("none", "本日の試合は終了しました", { disabled: true });
    push("sdwatch:all", m < ev.start ? `試合開始まで待って最後まで観戦する(${Math.floor(ev.start / 60)}:00〜)` : "このまま最後まで観戦する");
    if (m >= ev.start) push("sdwatch:1", "しばらく観戦する(30分)");
    if (ev.kind === "b") push("sdcheer", "応援歌に合わせてメガホンを叩く");
  };
  FAC_RUN.sdempty = (g, arg, tg, r) => {
    g.advance(10);
    r.msg = "グラウンドキーパーさんが芝に水をまいています。静かなスタジアムもいいものです。" + g.chg({ mood: 2 });
  };
  FAC_RUN.sdcheer = (g, arg, tg, r) => {
    g.advance(10);
    r.msg = "スタンドが一体になって応援歌を歌いました。" + g.chg({ mood: 4 });
  };
  FAC_RUN.sdwatch = (g, arg, tg, r) => {
    const ev = sdEvent(g);
    const m = g.S.min;
    if (m < ev.start) g.advance(ev.start - m);
    const from = g.S.min;
    if (arg === "all") g.advance(Math.max(0, ev.end - g.S.min));
    else g.advance(30);
    const sc = sdScore(ev, g.S.min);
    const homeN = SD_TEAMS[ev.kind][0];
    let msg;
    if (sc.done) {
      const win = sc.home > sc.away, draw = sc.home === sc.away;
      msg = `試合終了 ${homeN} ${sc.home} - ${sc.away} ${ev.opp}。` + (draw ? "引き分けでした。" : win ? "ホームチームの勝利!スタンドは歓喜の渦です。" : "惜しくも敗れました…。また応援に来よう。");
      g.log("leisure", `スタジアムで${ev.kind === "b" ? "プロ野球" : "サッカー"}観戦(${homeN} ${sc.home}-${sc.away} ${ev.opp})`);
      r.msg = msg + g.chg({ mood: win ? 14 : draw ? 6 : 3, energy: -6 });
    } else {
      r.msg = `${sc.label} ${homeN} ${sc.home} - ${sc.away} ${ev.opp}。` + g.chg({ mood: 4 });
    }
    r.ui = "fx_scene";
    r.scene = sdScene(ev, from, g.S.min);
  };
  FAC_ACTS.fx_sdfood = (g, o, b, push) => {
    const k = o.food;
    const M2 = { kara: ["からあげ・ポテト", 700, 25], yaki: ["焼きそば", 600, 30], curry: ["スタジアムカレー", 900, 40], drink: [g.age() >= 20 ? "生ビール" : "ジュース", g.age() >= 20 ? 800 : 300, 3] }[k];
    push(`sdfood:${k}`, `${M2[0]}(¥${yenf(g, M2[1])})`, { disabled: g.hero.money < yenf(g, M2[1]) });
  };
  FAC_RUN.sdfood = (g, arg, tg, r) => {
    const M2 = { kara: ["からあげ・ポテト", 700, 25], yaki: ["焼きそば", 600, 30], curry: ["スタジアムカレー", 900, 40], drink: [g.age() >= 20 ? "生ビール" : "ジュース", g.age() >= 20 ? 800 : 300, 3] }[arg];
    g.pay(yenf(g, M2[1]), "スタジアムグルメ");
    g.advance(10);
    r.msg = `${M2[0]}を買いました。` + g.chg({ hunger: M2[2], mood: 3 });
  };
  FAC_ACTS.fx_sdshop = (g, o, b, push) => {
    push("sdshop:u", `レプリカユニフォーム(¥${yenf(g, 9800).toLocaleString()})`, { disabled: g.hero.money < yenf(g, 9800) });
    push("sdshop:t", `応援タオル(¥${yenf(g, 1800).toLocaleString()})`, { disabled: g.hero.money < yenf(g, 1800) });
  };
  FAC_RUN.sdshop = (g, arg, tg, r) => {
    g.pay(yenf(g, arg === "u" ? 9800 : 1800), "応援グッズ");
    r.msg = (arg === "u" ? "背番号入りのユニフォームを買いました。" : "チームカラーのタオルを買いました。") + g.chg({ mood: 3 });
  };
  // ---- 観戦の場面
  function sdScene(ev, from, to) {
    const homeN = SD_TEAMS[ev.kind][0];
    return {
      title: ev.kind === "b" ? "プロ野球 観戦" : "サッカー 観戦",
      dur: 16,
      draw(c, t, W2, H4) {
        const min = from + (to - from) * Math.min(1, t / 16);
        const sc = sdScore(ev, min);
        const night = min >= 18 * 60;
        c.fillStyle = night ? "#0b1530" : "#7cc4f0";
        c.fillRect(0, 0, W2, H4);
        // スタンド
        for (let r = 0; r < 12; r++) {
          const y = H4 * 0.05 + r * H4 * 0.022;
          c.fillStyle = r % 2 ? "#39465f" : "#43516e";
          c.fillRect(0, y, W2, H4 * 0.022);
          for (let i = 0; i < 70; i++) {
            c.fillStyle = ["#e94b3c", "#f5f5f5", "#2d6cdf", "#f2c94c"][(i + r) % 4];
            c.fillRect(i / 70 * W2 + (r % 2) * 4, y + 2 + Math.abs(Math.sin(t * 6 + i + r)) * 2, W2 / 140, H4 * 0.012);
          }
        }
        if (night) for (const lx of [0.1, 0.9]) {
          c.fillStyle = "#fff8d0";
          c.fillRect(W2 * lx - 20, H4 * 0.02, 40, 10);
        }
        const fy = H4 * 0.32;
        c.fillStyle = "#3f9a3e";
        c.fillRect(0, fy, W2, H4 - fy);
        for (let k = 0; k < 10; k++) {
          c.fillStyle = k % 2 ? "#44a443" : "#3f9a3e";
          c.fillRect(0, fy + k * (H4 - fy) / 10, W2, (H4 - fy) / 10);
        }
        if (ev.kind === "b") {
          // 内野・投手・打者・打球
          c.fillStyle = "#c79a64";
          c.beginPath();
          c.moveTo(W2 / 2, H4 * 0.95);
          c.lineTo(W2 * 0.25, H4 * 0.62);
          c.lineTo(W2 / 2, H4 * 0.45);
          c.lineTo(W2 * 0.75, H4 * 0.62);
          c.fill();
          const ph = t * 0.5 % 1;
          const fig = (x, y, col) => {
            c.fillStyle = col;
            c.fillRect(x - 5, y - 18, 10, 16);
            c.fillStyle = "#f0c7a0";
            c.beginPath();
            c.arc(x, y - 22, 5, 0, 7);
            c.fill();
          };
          fig(W2 / 2, H4 * 0.66, "#f5f5f5");
          fig(W2 / 2 - 14, H4 * 0.92, "#1f3c88");
          for (const [fx, fyy] of [[0.25, 0.6], [0.75, 0.6], [0.5, 0.42], [0.36, 0.5], [0.64, 0.5], [0.15, 0.4], [0.5, 0.36], [0.85, 0.4]]) fig(W2 * fx + Math.sin(t + fx * 9) * 3, H4 * fyy, "#f5f5f5");
          let bx, by;
          if (ph < 0.35) {
            bx = W2 / 2;
            by = H4 * (0.66 + ph / 0.35 * 0.24);
          } else {
            const f = (ph - 0.35) / 0.65;
            bx = W2 / 2 + Math.sin((ev.seed % 7 + Math.floor(t * 0.5)) * 1.7) * W2 * 0.4 * f;
            by = H4 * 0.9 - Math.sin(f * Math.PI) * H4 * 0.55 - f * H4 * 0.4;
          }
          c.fillStyle = "#fff";
          c.beginPath();
          c.arc(bx, by, 4, 0, 7);
          c.fill();
        } else {
          c.strokeStyle = "#f4f4f0";
          c.lineWidth = 2;
          c.strokeRect(W2 * 0.05, fy + 10, W2 * 0.9, H4 - fy - 20);
          c.beginPath();
          c.moveTo(W2 / 2, fy + 10);
          c.lineTo(W2 / 2, H4 - 10);
          c.stroke();
          const bx = W2 / 2 + Math.sin(t * 0.7) * W2 * 0.35, by = fy + (H4 - fy) / 2 + Math.sin(t * 1.3) * (H4 - fy) * 0.3;
          for (let i = 0; i < 22; i++) {
            const home = i < 11;
            const px2 = W2 * (0.1 + (i % 11) / 11 * 0.8) * 0.5 + bx * 0.5 + Math.sin(t * 1.5 + i) * 20, py = fy + (H4 - fy) * (0.15 + (i * 7 % 11) / 11 * 0.7) * 0.6 + by * 0.4 - fy * 0.4;
            c.fillStyle = home ? "#1f6fd1" : "#e94b3c";
            c.fillRect(px2 - 4, py - 12, 8, 12);
          }
          c.fillStyle = "#fff";
          c.beginPath();
          c.arc(bx, by, 4, 0, 7);
          c.fill();
        }
        // スコア表示
        c.fillStyle = "rgba(10,15,25,0.85)";
        c.fillRect(W2 * 0.3, H4 * 0.02, W2 * 0.4, H4 * 0.09);
        c.fillStyle = "#ffd24a";
        c.font = `bold ${Math.round(H4 * 0.04)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(`${ev.opp} ${sc.away} - ${sc.home} ${homeN}`, W2 / 2, H4 * 0.05);
        c.font = `${Math.round(H4 * 0.028)}px sans-serif`;
        c.fillStyle = "#fff";
        c.fillText(sc.label, W2 / 2, H4 * 0.09);
      }
    };
  }
  // ---- 描画: スタンド(観客)・フィールド(選手)・電光掲示板
  FXH.fx_stands = 2.4;
  FXH.fx_field = 0.05;
  FXH.fx_score = 4;
  FAC_DRAW.fx_stands = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, box } = d;
    const g = env.g, ev = g ? sdEvent(g) : null;
    const live = ev && g.S.min >= ev.start - 60 && g.S.min <= ev.end + 20;
    const fill = live ? 0.85 : 0.04;
    const rows = o.rows || h;
    const cols2 = o.away ? ["#e94b3c", "#f5f5f5"] : ["#1f6fd1", "#f5f5f5", "#f2c94c"];
    const lod = env.lod;
    for (let r = 0; r < rows; r++) {
      let u0, v0, u1, v1, z;
      if (o.side === "n") {
        v0 = y + (h - 1 - r) * (h / rows);
        v1 = v0 + h / rows;
        u0 = x;
        u1 = x + w;
        z = 0.35 * (r + 1);
      } else if (o.side === "s") {
        v0 = y + r * (h / rows);
        v1 = v0 + h / rows;
        u0 = x;
        u1 = x + w;
        z = 0.25 * (r + 1);
      } else if (o.side === "w") {
        u0 = x + (w - 1 - r) * (w / rows);
        u1 = u0 + w / rows;
        v0 = y;
        v1 = y + h;
        z = 0.32 * (r + 1);
      } else {
        u0 = x + r * (w / rows);
        u1 = u0 + w / rows;
        v0 = y;
        v1 = y + h;
        z = 0.25 * (r + 1);
      }
      box(c, env.P, u0, v0, u1, v1, 0, z, o.away ? r % 2 ? "#b84a44" : "#c9564f" : r % 2 ? "#2f5fae" : "#3a6cc0");
      // 観客(試合の日は満員)
      const along = o.side === "n" || o.side === "s" ? u1 - u0 : v1 - v0;
      for (let k = 0; k < along; k += lod ? 1.2 : 0.7) {
        if (uh(r * 131 + Math.floor(k * 10), x + y) % 100 >= fill * 100) continue;
        const u = o.side === "n" || o.side === "s" ? u0 + k + 0.4 : (u0 + u1) / 2, v = o.side === "n" || o.side === "s" ? (v0 + v1) / 2 : v0 + k + 0.4;
        const p = pt(u, v, z);
        const jump = live ? Math.max(0, Math.sin(t * 5 + k * 1.3 + r)) * 0.8 * Z : 0;
        c.fillStyle = cols2[(r + Math.floor(k)) % cols2.length];
        c.fillRect(p[0] - 0.6 * Z, p[1] - 2.4 * Z - jump, 1.2 * Z, 1.6 * Z);
        c.fillStyle = "#e9c3a0";
        c.fillRect(p[0] - 0.45 * Z, p[1] - 3.1 * Z - jump, 0.9 * Z, 0.8 * Z);
      }
    }
  };
  FAC_DRAW.fx_field = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    const g = env.g, ev = g ? sdEvent(g) : null;
    const mode = ev ? ev.kind : o.mode || "b";
    const live = ev && g.S.min >= ev.start && g.S.min <= ev.end;
    for (let k = 0; k < w; k += 2) poly(c, [pt(x + k, y, 0.02), pt(x + k + 1, y, 0.02), pt(x + k + 1, y + h, 0.02), pt(x + k, y + h, 0.02)], "#4c9a46");
    for (let k = 1; k < w; k += 2) poly(c, [pt(x + k, y, 0.02), pt(x + k + 1, y, 0.02), pt(x + k + 1, y + h, 0.02), pt(x + k, y + h, 0.02)], "#55a64e");
    const fig = (u, v, col) => {
      const p = pt(u, v, 0);
      c.fillStyle = col;
      c.fillRect(p[0] - 0.8 * Z, p[1] - 3 * Z, 1.6 * Z, 2.4 * Z);
      c.fillStyle = "#e9c3a0";
      c.beginPath();
      c.arc(p[0], p[1] - 3.6 * Z, 0.7 * Z, 0, 7);
      c.fill();
    };
    if (mode === "b") {
      // ダイヤモンド(本塁は手前=南東。一塁は西方向、三塁は北方向へ)
      const hu = x + w - 5, hv = y + h - 4, D2 = 7;
      const P1 = [hu - D2, hv], P2b = [hu - D2, hv - D2], P3 = [hu, hv - D2];
      // 外野の芝の弧(フェンス)・内野の土
      poly(c, [pt(hu + 0.8, hv + 0.8, 0.03), pt(hu - D2 - 1.6, hv + 0.8, 0.03), pt(hu - D2 - 1.6, hv - D2 - 1.6, 0.03), pt(hu + 0.8, hv - D2 - 1.6, 0.03)], "#c79a64");
      poly(c, [pt(hu - 1.2, hv - 1.2, 0.035), pt(hu - D2 + 1.2, hv - 1.2, 0.035), pt(hu - D2 + 1.2, hv - D2 + 1.2, 0.035), pt(hu - 1.2, hv - D2 + 1.2, 0.035)], "#55a64e");
      const mp = pt(hu - D2 / 2, hv - D2 / 2, 0.06);
      c.fillStyle = "#b88a55";
      c.beginPath();
      c.ellipse(mp[0], mp[1], 2.4 * Z, 1.2 * Z, 0, 0, 7);
      c.fill();
      c.strokeStyle = "#fff";
      c.lineWidth = Math.max(1, Z * 0.3);
      c.beginPath();
      const a0 = pt(hu, hv, 0.05), a1 = pt(x + 1, hv, 0.05), a2 = pt(hu, y + 1, 0.05);
      c.moveTo(a1[0], a1[1]);
      c.lineTo(a0[0], a0[1]);
      c.lineTo(a2[0], a2[1]);
      c.stroke();
      for (const [u, v] of [[hu, hv], P1, P2b, P3]) {
        const p = pt(u, v, 0.06);
        c.fillStyle = "#fff";
        c.fillRect(p[0] - Z * 0.7, p[1] - Z * 0.35, Z * 1.4, Z * 0.7);
      }
      // 外野フェンス
      c.strokeStyle = "#2f5d3a";
      c.lineWidth = Math.max(2, Z * 0.8);
      c.beginPath();
      for (let k = 0; k <= 20; k++) {
        const ang = k / 20 * Math.PI / 2, R6 = Math.min(w, h) * 1.05;
        const q = pt(Math.max(x + 0.5, hu - Math.cos(ang) * R6), Math.max(y + 0.5, hv - Math.sin(ang) * R6), 0.6);
        if (k) c.lineTo(q[0], q[1]);
        else c.moveTo(q[0], q[1]);
      }
      c.stroke();
      if (live) {
        fig(hu - D2 / 2, hv - D2 / 2, "#f5f5f5");
        fig(hu + 0.6, hv + 0.2, "#1f3c88");
        fig(hu + 1.2, hv + 1.2, "#333");
        for (const [u, v] of [[hu - D2 + 0.8, hv - 0.8], [hu - D2 + 0.6, hv - D2 + 2.5], [hu - 2.5, hv - D2 + 0.6], [hu - 0.8, hv - D2 + 0.8], [hu - 20, hv - 6], [hu - 16, hv - 16], [hu - 6, hv - 20]]) fig(u + Math.sin(t + u) * 0.3, v, "#f5f5f5");
        const ph = t * 0.45 % 1;
        let bu, bv, bz;
        if (ph < 0.3) {
          bu = hu - D2 / 2 + ph / 0.3 * D2 / 2;
          bv = hv - D2 / 2 + ph / 0.3 * D2 / 2;
          bz = 1.2;
        } else {
          const f = (ph - 0.3) / 0.7, ang = Math.PI / 4 + Math.sin(Math.floor(t * 0.45) * 2.3) * 0.6;
          bu = hu - Math.cos(ang) * f * 20;
          bv = hv - Math.sin(ang) * f * 20;
          bz = 0.5 + Math.sin(f * Math.PI) * 6;
        }
        const bp = pt(bu, bv, bz);
        c.fillStyle = "#fff";
        c.beginPath();
        c.arc(bp[0], bp[1], Math.max(1.5, 0.4 * Z), 0, 7);
        c.fill();
      }
    } else {
      c.strokeStyle = "#f4f4f0";
      c.lineWidth = Math.max(1, Z * 0.3);
      const rect = (u0, v0, u1, v1) => {
        const ps = [pt(u0, v0, 0.04), pt(u1, v0, 0.04), pt(u1, v1, 0.04), pt(u0, v1, 0.04)];
        c.beginPath();
        c.moveTo(ps[0][0], ps[0][1]);
        for (const p of ps.slice(1)) c.lineTo(p[0], p[1]);
        c.closePath();
        c.stroke();
      };
      rect(x + 1, y + 1, x + w - 1, y + h - 1);
      rect(x + w / 2 - 0.02, y + 1, x + w / 2 + 0.02, y + h - 1);
      rect(x + 1, y + h / 2 - 5, x + 6, y + h / 2 + 5);
      rect(x + w - 6, y + h / 2 - 5, x + w - 1, y + h / 2 + 5);
      if (live) {
        const bu = x + w / 2 + Math.sin(t * 0.6) * (w / 2 - 4), bv = y + h / 2 + Math.sin(t * 1.1) * (h / 2 - 3);
        for (let i = 0; i < 22; i++) {
          const home = i < 11, k = i % 11;
          const hu = x + (home ? 4 + k * 1.6 : w - 4 - k * 1.6), hv = y + 2 + k * 7 % (h - 4);
          fig(hu * 0.55 + bu * 0.45 + Math.sin(t * 2 + i) * 0.6, hv * 0.6 + bv * 0.4, home ? "#1f6fd1" : "#e94b3c");
        }
        const bp = pt(bu, bv, 0.3);
        c.fillStyle = "#fff";
        c.beginPath();
        c.arc(bp[0], bp[1], Math.max(1.5, 0.4 * Z), 0, 7);
        c.fill();
      }
    }
  };
  FAC_DRAW.fx_score = (c, env, o, H5, d) => {
    const { x, y, w, Z, pt, box } = d;
    box(c, env.P, x, y + 0.1, x + w, y + 0.6, 1.8, 4.2, "#1b222c");
    const g = env.g, ev = g ? sdEvent(g) : null;
    const q = pt(x + w / 2, y + 0.6, 3.6), q2 = pt(x + w / 2, y + 0.6, 2.6);
    c.save();
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `bold ${Math.max(8, 2.6 * Z)}px ${SIGN_FONT}`;
    if (ev) {
      const sc = sdScore(ev, Math.max(ev.start, Math.min(ev.end, g.S.min)));
      c.fillStyle = "#fff";
      c.fillText(`${ev.opp} ${sc.away} - ${sc.home} ${SD_TEAMS[ev.kind][0]}`, q[0], q[1]);
      c.fillStyle = "#ffd24a";
      c.fillText(g.S.min < ev.start ? `本日 ${Math.floor(ev.start / 60)}:00 試合開始` : sc.label, q2[0], q2[1]);
    } else {
      c.fillStyle = "#9fe0a8";
      c.fillText("本日は試合がありません", q[0], q[1]);
    }
    c.restore();
  };
