  // src/fac_themepark.js — 遊園地(テーマパーク): 屋外の園内に、実際に動くジェットコースター・観覧車・メリーゴーラウンド・
  // コーヒーカップ・フリーフォール・ゴーカート・お化け屋敷。乗ると専用の場面が流れる。パレード・花火。
  FAC_RANGE.themepark = () => ({ lo: 0, hi: 0, nf: 1 });
  FAC_LABEL.themepark = () => "園内";
  var TP_RIDES = {
    coaster: { name: "ジェットコースター「ブルーサンダー」", min: 4, fare: 1000, h: 120, thrill: 3 },
    ferris: { name: "大観覧車「スカイリング」", min: 15, fare: 800, h: 0, thrill: 0 },
    merry: { name: "メリーゴーラウンド", min: 5, fare: 500, h: 0, thrill: 0 },
    cups: { name: "コーヒーカップ", min: 4, fare: 500, h: 0, thrill: 1 },
    drop: { name: "フリーフォール「スカイドロップ」", min: 3, fare: 900, h: 130, thrill: 3 },
    kart: { name: "ゴーカート", min: 6, fare: 700, h: 110, thrill: 1 },
    haunt: { name: "お化け屋敷「廃病院」", min: 10, fare: 700, h: 0, thrill: 2 }
  };
  FAC_BUILD.themepark = (b, floor, g) => {
    const W2 = 72, H4 = 48;
    const P = plan(W2, H4, "floor_grass", "leisure");
    P.lv = 0;
    const dx = 36;
    P.door(dx);
    // 園路
    P.fill(dx - 3, 8, dx + 3, H4 - 2, "floor_paving");
    P.fill(4, 24, W2 - 5, 28, "floor_paving");
    P.fill(4, 8, 8, 40, "floor_paving");
    P.fill(W2 - 9, 8, W2 - 5, 40, "floor_paving");
    P.fill(dx - 10, H4 - 9, dx + 10, H4 - 2, "floor_paving");
    // 入場ゲート・チケット
    P.wide("ticketbooth", dx - 9, H4 - 8, 3, 1, "fx_tpticket", "チケットブース(1日パスポート・のりもの券)");
    P.wide("ticketbooth", dx + 7, H4 - 8, 3, 1, "fx_tpticket", "チケットブース(1日パスポート・のりもの券)");
    for (const x of [dx - 2, dx, dx + 2]) P.add("gate", x, H4 - 10, null, "入場ゲート", false);
    P.sign(dx, H4 - 11, "AOUMI DREAM PARK");
    P.add("board", dx - 5, H4 - 12, "fx_tpinfo", "園内マップ・パレードと花火の時間", true);
    P.add("locker", dx + 5, H4 - 4, "locker", "コインロッカー");
    P.staffSpots.push({ x: dx - 8, y: H4 - 9, role: "ticket" }, { x: dx + 8, y: H4 - 9, role: "ticket" }, { x: dx + 1, y: H4 - 11, role: "gate" });
    // メインストリート: 屋台
    const stalls = [["fx_tpfood", "ポップコーン(キャラメル)", "pop"], ["fx_tpfood", "チュロス", "churro"], ["fx_tpfood", "クレープ", "crepe"], ["fx_tpfood", "ホットドッグ", "dog"]];
    stalls.forEach(([a, l, k], i) => P.add("kiosk", i % 2 ? dx + 5 : dx - 5, 31 + (i >> 1) * 4, a, l, true, { food: k }));
    P.wide("showcase", dx + 5, 39, 3, 1, "fx_tpshop", "ギフトショップ(カチューシャ・ぬいぐるみ・お菓子)");
    // 中央: お城
    P.wide("fx_castle", dx - 4, 10, 8, 6, "fx_tpcastle", "ドリームキャッスル(記念撮影スポット)");
    // 北東: ジェットコースター
    P.wide("fx_coaster", 42, 1, 28, 18, "fx_tpride", TP_RIDES.coaster.name, { ride: "coaster" });
    P.sign(56, 20, "ブルーサンダー 待ち時間");
    // 北西: 観覧車
    P.wide("fx_ferris", 12, 4, 10, 4, "fx_tpride", TP_RIDES.ferris.name, { ride: "ferris" });
    P.sign(17, 9, "大観覧車");
    // 西: メリーゴーラウンド・コーヒーカップ
    P.wide("fx_merry", 10, 14, 6, 6, "fx_tpride", TP_RIDES.merry.name, { ride: "merry" });
    P.wide("fx_cups", 18, 14, 6, 6, "fx_tpride", TP_RIDES.cups.name, { ride: "cups" });
    // 南西: フリーフォール・お化け屋敷
    P.wide("fx_drop", 12, 31, 3, 3, "fx_tpride", TP_RIDES.drop.name, { ride: "drop" });
    P.wide("fx_haunt", 18, 31, 8, 6, "fx_tpride", TP_RIDES.haunt.name, { ride: "haunt" });
    // 南東: ゴーカート
    P.wide("fx_kart", 46, 31, 18, 9, "fx_tpride", TP_RIDES.kart.name, { ride: "kart" });
    // ベンチ・レストラン
    for (const [x, y] of [[10, 26], [16, 26], [26, 26], [46, 26], [56, 26], [64, 26]]) {
      P.add("bench", x, y, "fx_tprest", "ベンチ", false);
      P.seatSpots.push({ x, y });
    }
    P.wide("counter", 28, 40, 4, 1, "fx_tpfood", "レストラン「ドリームキッチン」(カレー・ハンバーガー)", { food: "meal" });
    for (const [x, y] of [[26, 42], [29, 42], [32, 42]]) {
      P.add("table", x, y, "fx_tpfood", "レストランの席", true, { food: "meal" });
      P.seatSpots.push({ x, y: y + 1 });
    }
    for (const [x, y] of [[4, 4], [30, 4], [4, 44], [68, 44], [30, 20], [44, 22]]) P.add("tree", x, y, null, "植え込み", true);
    P.add("toilet", 4, 22, "toilet", "トイレ");
    P.add("toilet", W2 - 4, 22, "toilet", "トイレ");
    P.add("vending", dx - 6, 22, null, "自販機");
    P.add("aed", dx + 6, 22, null, "AED");
    P.staffSpots.push({ x: 55, y: 20, role: "ride" }, { x: 17, y: 9, role: "ride" }, { x: 13, y: 21, role: "ride" }, { x: 13, y: 35, role: "ride" }, { x: 22, y: 38, role: "ride" }, { x: 50, y: 41, role: "ride" }, { x: dx, y: 18, role: "character" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 0.6, roof: true, outdoor: true, label: "園内" });
  };
  // ---- チケット
  var tpToday = (g) => g.S.tpDay === g.S.M * 40 + g.date().d;
  FAC_ACTS.fx_tpticket = (g, o, b, push) => {
    if (tpToday(g)) return push("none", "1日パスポートをお持ちです(のりもの乗り放題)", { disabled: true });
    const a = g.age(), pr = yenf(g, a < 4 ? 0 : a < 12 ? 3800 : a < 18 ? 4800 : BTYPES.themepark.price || 5800);
    push("tppass:" + pr, `1日パスポートを買う(¥${pr.toLocaleString()}・乗り放題)`, { disabled: g.hero.money < pr });
    push("none", "のりもの券は各アトラクションの入口で買えます", { disabled: true });
  };
  FAC_RUN.tppass = (g, arg, tg, r) => {
    const pr = +arg || 0;
    if (pr) g.pay(pr, "遊園地の1日パスポート");
    g.S.tpDay = g.S.M * 40 + g.date().d;
    g.advance(5);
    r.msg = "1日パスポートの腕章をつけてもらいました。どれから乗りますか?";
  };
  FAC_ACTS.fx_tpinfo = (g, o, b, push) => push("tpinfo", "園内マップ・本日のプログラムを見る");
  FAC_RUN.tpinfo = (g, arg, tg, r) => {
    r.msg = "パレード 14:00(メインストリート) / 花火 20:00(お城の上空)。北東: ジェットコースター / 北西: 大観覧車 / 西: メリーゴーラウンド・コーヒーカップ / 南西: フリーフォール・お化け屋敷 / 南東: ゴーカート。";
  };
  // ---- のりもの
  function tpWait(g, id) {
    const h = g.S.min / 60, dow = g.date().dow, wk = dow === 0 || dow === 6;
    const peak = h >= 11 && h < 16 ? 1 : h >= 9 && h < 19 ? 0.55 : 0.2;
    const base = { coaster: 60, ferris: 25, merry: 10, cups: 15, drop: 45, kart: 30, haunt: 20 }[id] || 20;
    return Math.round(base * peak * (wk ? 1.4 : 0.8) / 5) * 5;
  }
  FAC_ACTS.fx_tpride = (g, o, b, push) => {
    const R5 = TP_RIDES[o.ride];
    const m = g.S.min / 60;
    if (m < 9 || m >= 21) return push("none", "営業時間外です(9:00〜21:00)", { disabled: true });
    const wait = tpWait(g, o.ride);
    if (R5.h && g.age() < 9 && !testBypass(g, "age")) push("none", `身長${R5.h}cm以上の制限があります`, { disabled: true });
    else if (tpToday(g)) push("tpride:" + o.ride, `乗る(待ち時間 約${wait}分・パスポート)`);
    else push("tpride:" + o.ride + ":" + yenf(g, R5.fare), `のりもの券で乗る(¥${yenf(g, R5.fare).toLocaleString()}・待ち時間 約${wait}分)`, { disabled: g.hero.money < yenf(g, R5.fare) });
    push("tplook:" + o.ride, "外から眺める");
  };
  FAC_RUN.tpride = (g, arg, tg, r) => {
    const [id, fare] = String(arg).split(":");
    const R5 = TP_RIDES[id];
    if (fare) g.pay(+fare, "のりもの券");
    g.advance(tpWait(g, id) + R5.min);
    const fx = { coaster: { mood: 14, energy: -6 }, ferris: { mood: 10 }, merry: { mood: 6 }, cups: { mood: 7, energy: -2 }, drop: { mood: 12, energy: -5 }, kart: { mood: 9 }, haunt: { mood: 8, energy: -3 } }[id];
    const txt = { coaster: "ゴォォ…カタカタと登り切った瞬間、街と海が見えて——急降下!叫び声が止まりません。", ferris: "ゆっくりと空へ。てっぺんからは港と街、遠くの山並みまで見渡せました。", merry: "きらきらの音楽に合わせて、白い馬が上下にゆれながら回ります。", cups: "ハンドルを回しすぎて、景色がぐるぐる回っています…!", drop: "地上60m。足がぶらぶら…カウントダウンの後、一気に落下!", kart: "アクセル全開でコーナーを攻め、ゴールではタイムが表示されました。", haunt: "暗い廊下、軋むドア、背後の足音……出口の光が見えたときは本気でほっとしました。" }[id];
    r.msg = txt + g.chg(fx);
    g.S.tpRides = (g.S.tpRides || 0) + 1;
    g.log("leisure", `遊園地で${R5.name}に乗った`);
    const sc = TP_SCENES[id];
    if (sc) {
      r.ui = "fx_scene";
      r.scene = sc(g);
    }
  };
  FAC_RUN.tplook = (g, arg, tg, r) => {
    g.advance(5);
    r.msg = { coaster: "コースターが轟音とともに頭上を駆け抜け、悲鳴と歓声が降ってきました。", ferris: "大きな輪がゆっくり回っています。ゴンドラの窓に手を振る子どもが見えます。" }[arg] || "楽しそうな声が聞こえてきます。";
  };
  FAC_ACTS.fx_tpfood = (g, o, b, push) => {
    const k = o.food || "pop";
    const M2 = { pop: ["キャラメルポップコーン", 500, 10], churro: ["チュロス", 450, 10], crepe: ["いちごクレープ", 600, 15], dog: ["ホットドッグ", 600, 25], meal: ["キャラクターカレー", 1400, 45] }[k];
    push(`tpfood:${k}`, `${M2[0]}(¥${yenf(g, M2[1])})`, { disabled: g.hero.money < yenf(g, M2[1]) });
  };
  FAC_RUN.tpfood = (g, arg, tg, r) => {
    const M2 = { pop: ["キャラメルポップコーン", 500, 10], churro: ["チュロス", 450, 10], crepe: ["いちごクレープ", 600, 15], dog: ["ホットドッグ", 600, 25], meal: ["キャラクターカレー", 1400, 45] }[arg] || ["軽食", 500, 10];
    g.pay(yenf(g, M2[1]), "遊園地のフード");
    g.advance(arg === "meal" ? 35 : 10);
    r.msg = `${M2[0]}をほおばりながら園内を歩きました。` + g.chg({ hunger: M2[2], mood: 3 });
  };
  FAC_ACTS.fx_tpshop = (g, o, b, push) => push("tpshop", `キャラクターのカチューシャ(¥${yenf(g, 1800)})`, { disabled: g.hero.money < yenf(g, 1800) });
  FAC_RUN.tpshop = (g, arg, tg, r) => {
    g.pay(yenf(g, 1800), "遊園地のおみやげ");
    r.msg = "カチューシャをつけて、すっかりパークの一員です。" + g.chg({ mood: 4 });
  };
  FAC_ACTS.fx_tpcastle = (g, o, b, push) => {
    push("tpphoto", "お城の前で記念撮影");
    const m = g.S.min;
    if (Math.abs(m - 840) <= 40) push("tpparade", "パレードを見る(14:00)");
    if (m >= 19 * 60 + 30 && m <= 20 * 60 + 30) push("tpfire", "花火を見る(20:00)");
  };
  FAC_RUN.tpphoto = (g, arg, tg, r) => {
    g.advance(5);
    r.msg = "お城をバックにパシャリ。いい笑顔の一枚が撮れました。" + g.chg({ mood: 3 });
  };
  FAC_RUN.tpparade = (g, arg, tg, r) => {
    if (g.S.min < 840) g.advance(840 - g.S.min);
    g.advance(30);
    r.msg = "音楽とともにフロートが次々と現れ、キャラクターが手を振ってくれました。" + g.chg({ mood: 10 });
    r.ui = "fx_scene";
    r.scene = TP_SCENES.parade(g);
  };
  FAC_RUN.tpfire = (g, arg, tg, r) => {
    if (g.S.min < 1200) g.advance(1200 - g.S.min);
    g.advance(15);
    r.msg = "お城の上空に大輪の花火。最後のスターマインに大きな拍手が起きました。" + g.chg({ mood: 12 });
    r.ui = "fx_scene";
    r.scene = TP_SCENES.fire(g);
  };
  FAC_ACTS.fx_tprest = (g, o, b, push) => push("relax", "ベンチでひと休み");
  // ---- 乗車の場面
  var skyGrad = (c, W2, H4, night) => {
    const gr = c.createLinearGradient(0, 0, 0, H4);
    gr.addColorStop(0, night ? "#0b1230" : "#5cb2ef");
    gr.addColorStop(1, night ? "#2a2350" : "#cfeaff");
    c.fillStyle = gr;
    c.fillRect(0, 0, W2, H4);
  };
  function cityline(c, W2, H4, base, night, scale = 1, seed = 1) {
    for (let i = 0; i < 40; i++) {
      const bw = W2 / 40 * (0.8 + (i * seed * 37 % 7) / 10), bh = H4 * (0.05 + (i * 53 * seed % 11) / 60) * scale;
      const x = i * W2 / 40;
      c.fillStyle = night ? "#1a1f36" : ["#8fa3b8", "#a6b5c6", "#7d8fa4"][i % 3];
      c.fillRect(x, base - bh, bw, bh);
      if (night) {
        c.fillStyle = "#ffe08a";
        for (let k = 0; k < 6; k++) if ((i * 7 + k) % 3) c.fillRect(x + bw * 0.2 + k % 2 * bw * 0.4, base - bh + 4 + (k >> 1) * bh / 4, 2, 2);
      }
    }
  }
  var TP_SCENES = {
    coaster: (g) => ({
      title: "ジェットコースター",
      dur: 14,
      lines: [[0, "カタカタカタ…巻き上げが始まりました"], [4.5, "頂上!街と海が一望——"], [5.4, "急降下!!"], [8, "連続ヘリックス!"], [11, "ブレーキ…おかえりなさい!"]],
      draw(c, t, W2, H4) {
        const night = g.S.min >= 18 * 60;
        // 進行度: 巻き上げは遅く、その後は速い
        const s = t < 5 ? t / 5 * 0.25 : 0.25 + (t - 5) / 9 * 0.75;
        const zf = (q) => q < 0.25 ? q / 0.25 : q < 0.33 ? 1 - (q - 0.25) / 0.08 * 0.9 : 0.1 + 0.35 * Math.abs(Math.sin((q - 0.33) * 18));
        const z = zf(s);
        const tilt = t < 5 ? -0.32 : t < 5.6 ? 0.55 : Math.sin(t * 3) * 0.25;
        skyGrad(c, W2, H4, night);
        c.save();
        c.translate(W2 / 2, H4 / 2);
        c.rotate(t > 5 ? Math.sin(t * 5) * 0.05 : 0);
        c.translate(-W2 / 2, -H4 / 2 + (z - 0.5) * H4 * 0.5);
        cityline(c, W2, H4, H4 * 0.75, night, 1.2, 3);
        c.fillStyle = night ? "#123" : "#3a8ac0";
        c.fillRect(0, H4 * 0.75, W2, H4 * 0.3);
        c.restore();
        // レール(透視図: 枕木は奥ほど細かく、カーブとアップダウンで曲がる)
        {
          const hy = H4 * (0.45 + tilt * 0.55), cx = W2 / 2;
          const speed = t < 5 ? 0.6 : 3.2;
          const bend = (dd) => Math.sin(t * 0.9) * (t > 5 ? 1 : 0.15) * dd * dd * W2 * 0.012;
          const rise = (dd) => (t < 5 ? -1 : t < 5.6 ? 1.2 : Math.sin(t * 1.7)) * dd * dd * H4 * 0.006;
          const proj = (dd, side) => {
            const sc = 1 / dd;
            return [cx + bend(dd) * sc + side * W2 * 0.5 * sc, hy + H4 * 0.55 * sc - rise(dd) * sc];
          };
          const ph = t * speed % 1;
          c.lineCap = "round";
          for (let i = 14; i >= 0; i--) {
            const dd = 1 + i - ph;
            if (dd < 0.9) continue;
            const L4 = proj(dd, -1), R6 = proj(dd, 1);
            c.strokeStyle = "#8a8f96";
            c.lineWidth = Math.max(1, W2 * 0.012 / dd);
            c.beginPath();
            c.moveTo(L4[0], L4[1]);
            c.lineTo(R6[0], R6[1]);
            c.stroke();
          }
          for (const side of [-0.8, 0.8]) {
            c.strokeStyle = "#e33b3b";
            for (let i = 0; i < 40; i++) {
              const d0 = 0.9 + i * 0.35, q0 = proj(d0, side), q1 = proj(d0 + 0.35, side);
              c.lineWidth = Math.max(1, W2 * 0.025 / d0);
              c.beginPath();
              c.moveTo(q0[0], q0[1]);
              c.lineTo(q1[0], q1[1]);
              c.stroke();
            }
          }
        }
        // 安全バーと手
        c.fillStyle = "#222";
        c.fillRect(W2 * 0.2, H4 * 0.9, W2 * 0.6, H4 * 0.1);
        c.fillStyle = "#f0c7a0";
        const up = t > 5.3 && t < 10 ? -H4 * 0.18 : 0;
        for (const hx of [0.3, 0.7]) {
          c.beginPath();
          c.ellipse(W2 * hx, H4 * 0.86 + up, W2 * 0.03, H4 * 0.07, 0, 0, 7);
          c.fill();
          c.fillRect(W2 * hx - W2 * 0.02, H4 * 0.86 + up, W2 * 0.04, H4 * 0.2);
        }
      }
    }),
    ferris: (g) => ({
      title: "大観覧車",
      dur: 14,
      lines: [[0, "ゴンドラがゆっくり上がっていきます"], [5, "てっぺん!港・街・山まで見渡せます"], [10, "ゆっくりと地上へ…"]],
      draw(c, t, W2, H4) {
        const night = g.S.min >= 18 * 60;
        const z = Math.sin(t / 14 * Math.PI);
        skyGrad(c, W2, H4, night);
        const base = H4 * (0.95 - z * 0.45);
        c.fillStyle = night ? "#0d1a33" : "#2f7fb6";
        c.fillRect(0, base - H4 * 0.12, W2, H4 * 0.12);
        cityline(c, W2, H4, base, night, 0.6 + z * 0.4, 5);
        c.fillStyle = night ? "#0a0f1e" : "#6aa35a";
        c.fillRect(0, base, W2, H4);
        // ゴンドラの窓枠
        c.strokeStyle = "#c0392b";
        c.lineWidth = W2 * 0.03;
        c.strokeRect(W2 * 0.05, H4 * 0.05, W2 * 0.9, H4 * 0.75);
        c.beginPath();
        c.moveTo(W2 / 2, H4 * 0.05);
        c.lineTo(W2 / 2, H4 * 0.8);
        c.stroke();
        c.fillStyle = "#7b2a20";
        c.fillRect(0, H4 * 0.8, W2, H4 * 0.2);
      }
    }),
    drop: (g) => ({
      title: "フリーフォール",
      dur: 10,
      lines: [[0, "地上60mまで、ゆっくり上昇…"], [5, "3、2、1……"], [6.3, "落下!!!"], [8, "ふわっ…止まりました"]],
      draw(c, t, W2, H4) {
        const z = t < 5 ? t / 5 : t < 6.3 ? 1 : t < 7.2 ? 1 - (t - 6.3) / 0.9 : 0;
        skyGrad(c, W2, H4, g.S.min >= 18 * 60);
        const base = H4 * (0.98 - z * 0.6);
        cityline(c, W2, H4, base, g.S.min >= 18 * 60, 0.5 + z, 7);
        c.fillStyle = "#6aa35a";
        c.fillRect(0, base, W2, H4);
        c.fillStyle = "#333";
        c.fillRect(0, H4 * 0.85, W2, H4 * 0.15);
        c.fillStyle = "#f0c7a0";
        const k = Math.sin(t * 8) * (t > 6.3 && t < 7.5 ? 10 : 2);
        c.fillRect(W2 * 0.35 + k, H4 * 0.88, W2 * 0.05, H4 * 0.12);
        c.fillRect(W2 * 0.6 - k, H4 * 0.88, W2 * 0.05, H4 * 0.12);
      }
    }),
    parade: (g) => ({
      title: "ドリームパレード",
      dur: 14,
      draw(c, t, W2, H4) {
        skyGrad(c, W2, H4, false);
        c.fillStyle = "#d9cdb4";
        c.fillRect(0, H4 * 0.6, W2, H4 * 0.4);
        for (let i = 0; i < 5; i++) {
          const x = (t * 0.08 * W2 + i * W2 * 0.35) % (W2 * 1.6) - W2 * 0.3;
          const col = ["#ff6fa8", "#5bc0eb", "#ffd23f", "#9bc53d", "#c77dff"][i];
          c.fillStyle = col;
          c.fillRect(x, H4 * 0.42, W2 * 0.22, H4 * 0.2);
          c.fillStyle = "#fff";
          c.beginPath();
          c.arc(x + W2 * 0.11, H4 * 0.36 + Math.sin(t * 4 + i) * 6, H4 * 0.07, 0, 7);
          c.fill();
          c.fillStyle = "#333";
          c.fillRect(x + W2 * 0.09, H4 * 0.34 + Math.sin(t * 4 + i) * 6, 4, 4);
          c.fillRect(x + W2 * 0.125, H4 * 0.34 + Math.sin(t * 4 + i) * 6, 4, 4);
        }
        for (let i = 0; i < 60; i++) {
          c.fillStyle = ["#f44", "#fd4", "#4af", "#4d4"][i % 4];
          c.fillRect((i * 97 + t * 40) % W2, (i * 53 + t * 120) % (H4 * 0.6), 4, 6);
        }
      }
    }),
    fire: (g) => ({
      title: "花火",
      dur: 14,
      draw(c, t, W2, H4) {
        c.fillStyle = "rgba(8,10,30,0.35)";
        c.fillRect(0, 0, W2, H4);
        if (t < 0.1) {
          c.fillStyle = "#080a1e";
          c.fillRect(0, 0, W2, H4);
        }
        // お城のシルエット
        c.fillStyle = "#111";
        c.fillRect(W2 * 0.4, H4 * 0.65, W2 * 0.2, H4 * 0.35);
        for (const k of [0.38, 0.47, 0.56]) {
          c.fillRect(W2 * k, H4 * 0.55, W2 * 0.06, H4 * 0.45);
          c.beginPath();
          c.moveTo(W2 * k - 4, H4 * 0.55);
          c.lineTo(W2 * (k + 0.03), H4 * 0.45);
          c.lineTo(W2 * (k + 0.06) + 4, H4 * 0.55);
          c.fill();
        }
        for (let i = 0; i < 8; i++) {
          const t0 = i * 1.6 % 13, dt = t - t0;
          if (dt < 0 || dt > 1.8) continue;
          const cx = W2 * (0.15 + (i * 0.37 % 0.7)), cy = H4 * (0.2 + (i * 0.23 % 0.25));
          const r = Math.min(1, dt / 0.6) * H4 * 0.22;
          c.globalAlpha = Math.max(0, 1 - dt / 1.8);
          for (let k = 0; k < 28; k++) {
            const a = k / 28 * 6.283;
            c.fillStyle = `hsl(${i * 50 % 360},90%,${60 + k % 3 * 10}%)`;
            c.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r + dt * dt * 8, 3, 3);
          }
          c.globalAlpha = 1;
        }
      }
    })
  };
  // ---- 描画(実際に動くアトラクション)
  FXH.fx_coaster = 8;
  FXH.fx_ferris = 11;
  FXH.fx_merry = 3.2;
  FXH.fx_cups = 1;
  FXH.fx_drop = 14;
  FXH.fx_kart = 0.2;
  FXH.fx_haunt = 3.5;
  FXH.fx_castle = 7;
  var coasterPath = (x, y, w, h) => {
    const pts = [], N = 160, cx = x + w / 2, cy = y + h / 2, a = w / 2 - 1, b = h / 2 - 1;
    const zk = [[0, 0.6], [0.04, 0.6], [0.22, 7.5], [0.26, 7.5], [0.34, 0.8], [0.42, 4.5], [0.5, 1.2], [0.58, 3.4], [0.66, 0.9], [0.74, 2.6], [0.85, 0.6], [1, 0.6]];
    const zf = (s) => {
      for (let i = 1; i < zk.length; i++) if (s <= zk[i][0]) {
        const [s0, z0] = zk[i - 1], [s1, z1] = zk[i], f = (s - s0) / (s1 - s0);
        return z0 + (z1 - z0) * (0.5 - Math.cos(f * Math.PI) / 2);
      }
      return 0.6;
    };
    for (let i = 0; i < N; i++) {
      const s = i / N, th = s * 6.2832;
      const ct = Math.cos(th), st = Math.sin(th);
      // 角丸の長方形+内側への8の字ひねり
      const u = cx + a * Math.sign(ct) * Math.pow(Math.abs(ct), 0.45) * (1 - 0.25 * Math.sin(th * 2) ** 2);
      const v = cy + b * Math.sign(st) * Math.pow(Math.abs(st), 0.45);
      pts.push([u, v, zf(s)]);
    }
    return pts;
  };
  var coasterC = /* @__PURE__ */ new Map();
  FAC_DRAW.fx_coaster = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt } = d;
    const k = x + "," + y + "," + w + "," + h;
    let pts = coasterC.get(k);
    if (!pts) coasterC.set(k, pts = coasterPath(x, y, w, h));
    const N = pts.length;
    // 乗り場
    d.box(c, env.P, x + w / 2 - 3, y + h - 3, x + w / 2 + 3, y + h - 1, 0, 1.4, "#3c6fb0");
    d.box(c, env.P, x + w / 2 - 3.3, y + h - 3.3, x + w / 2 + 3.3, y + h - 0.7, 1.4, 1.6, "#e9e3d3");
    // 支柱(奥から)
    const order = pts.map((p, i) => i).sort((i, j) => pts[i][0] + pts[i][1] - (pts[j][0] + pts[j][1]));
    c.strokeStyle = "#d7d2c8";
    c.lineWidth = Math.max(1, Z * 0.45);
    c.beginPath();
    for (const i of order) if (i % 4 === 0 && pts[i][2] > 0.8) {
      const [u, v, z] = pts[i];
      const a = pt(u, v, 0), b = pt(u, v, z);
      c.moveTo(a[0], a[1]);
      c.lineTo(b[0], b[1]);
    }
    c.stroke();
    // レール(2本)
    for (const [off, col, lw] of [[-0.18, "#1d5fbf", 0.7], [0.18, "#2a74d9", 0.7]]) {
      c.strokeStyle = col;
      c.lineWidth = Math.max(1.5, Z * lw);
      c.beginPath();
      for (let i = 0; i <= N; i++) {
        const p0 = pts[i % N], p1 = pts[(i + 1) % N];
        const nx = -(p1[1] - p0[1]), ny = p1[0] - p0[0], nl = Math.hypot(nx, ny) || 1;
        const q = pt(p0[0] + nx / nl * off, p0[1] + ny / nl * off, p0[2]);
        if (i === 0) c.moveTo(q[0], q[1]);
        else c.lineTo(q[0], q[1]);
      }
      c.stroke();
    }
    // 列車: 巻き上げはゆっくり、落下後は速く
    const cyc = 16, tt = t % cyc;
    const sHead = tt < 6 ? 0.04 + tt / 6 * 0.2 : 0.24 + (tt - 6) / (cyc - 6) * 0.8;
    for (let car = 0; car < 5; car++) {
      const s = ((sHead - car * 0.012) % 1 + 1) % 1;
      const i = Math.floor(s * N), p = pts[i], q = pts[(i + 1) % N];
      const a = pt(p[0], p[1], p[2] + 0.35), b2 = pt(q[0], q[1], q[2] + 0.35);
      c.save();
      c.translate(a[0], a[1]);
      c.rotate(Math.atan2(b2[1] - a[1], b2[0] - a[0]));
      c.fillStyle = ["#ffcf3a", "#ff7a3a", "#ffcf3a", "#ff7a3a", "#ffcf3a"][car];
      c.fillRect(-2.4 * Z, -1.4 * Z, 4.8 * Z, 2.4 * Z);
      c.fillStyle = "#f2c39b";
      c.beginPath();
      c.arc(-0.8 * Z, -2 * Z, 0.7 * Z, 0, 7);
      c.arc(1 * Z, -2 * Z, 0.7 * Z, 0, 7);
      c.fill();
      c.restore();
    }
  };
  FAC_DRAW.fx_ferris = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt } = d;
    const cu = x + w / 2, cv2 = y + h / 2, R5 = Math.min(w / 2, 5), zc = R5 + 1.2;
    const night = env.g && (env.g.S.min >= 18 * 60 || env.g.S.min < 5 * 60);
    // 脚
    c.strokeStyle = "#cfd6de";
    c.lineWidth = Math.max(2, Z * 0.8);
    c.beginPath();
    for (const du of [-2.2, 2.2]) for (const dv of [-1, 1]) {
      const a = pt(cu + du, cv2 + dv, 0), b = pt(cu, cv2, zc);
      c.moveTo(a[0], a[1]);
      c.lineTo(b[0], b[1]);
    }
    c.stroke();
    // 輪・スポーク
    const rim = (r) => {
      c.beginPath();
      for (let k = 0; k <= 48; k++) {
        const a = k / 48 * 6.2832, p = pt(cu + Math.cos(a) * r, cv2, zc + Math.sin(a) * r);
        if (k) c.lineTo(p[0], p[1]);
        else c.moveTo(p[0], p[1]);
      }
      c.stroke();
    };
    c.strokeStyle = night ? "#ffd97a" : "#e8edf2";
    c.lineWidth = Math.max(1.5, Z * 0.5);
    rim(R5);
    rim(R5 * 0.97);
    const rot = t * 0.12;
    c.beginPath();
    for (let k = 0; k < 16; k++) {
      const a = rot + k / 16 * 6.2832, p = pt(cu + Math.cos(a) * R5, cv2, zc + Math.sin(a) * R5), cc = pt(cu, cv2, zc);
      c.moveTo(cc[0], cc[1]);
      c.lineTo(p[0], p[1]);
    }
    c.stroke();
    // ゴンドラ
    const cols = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#9b59b6", "#e67e22"];
    const g2 = [];
    for (let k = 0; k < 16; k++) {
      const a = rot + k / 16 * 6.2832;
      g2.push({ u: cu + Math.cos(a) * R5, z: zc + Math.sin(a) * R5, col: cols[k % cols.length] });
    }
    for (const q of g2) {
      const p = pt(q.u, cv2, q.z - 0.25);
      c.fillStyle = q.col;
      c.fillRect(p[0] - 1.6 * Z, p[1] - 0.6 * Z, 3.2 * Z, 2.6 * Z);
      c.fillStyle = night ? "#fff3b0" : "#cfe9ff";
      c.fillRect(p[0] - 1.1 * Z, p[1] - 0.2 * Z, 2.2 * Z, 1 * Z);
    }
    // 乗り場
    d.box(c, env.P, cu - 2, cv2 + 1, cu + 2, cv2 + 2, 0, 0.6, "#c0392b");
  };
  FAC_DRAW.fx_merry = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    const cu = x + w / 2, cv2 = y + h / 2, r = w / 2 - 0.4;
    const disk = (z, rr, col) => {
      const ps = [];
      for (let k = 0; k < 24; k++) {
        const a = k / 24 * 6.2832;
        ps.push(pt(cu + Math.cos(a) * rr, cv2 + Math.sin(a) * rr, z));
      }
      poly(c, ps, col);
    };
    disk(0.3, r, "#c9a14a");
    disk(0.35, r - 0.2, "#e9d8a6");
    const rot = t * 0.6;
    for (let k = 0; k < 8; k++) {
      const a = rot + k / 8 * 6.2832, u = cu + Math.cos(a) * (r - 0.8), v = cv2 + Math.sin(a) * (r - 0.8);
      const bob = 0.5 + Math.sin(t * 2.5 + k) * 0.3;
      const p0 = pt(u, v, 0.35), p1 = pt(u, v, 2.8);
      c.strokeStyle = "#d4af37";
      c.lineWidth = Math.max(1, Z * 0.25);
      c.beginPath();
      c.moveTo(p0[0], p0[1]);
      c.lineTo(p1[0], p1[1]);
      c.stroke();
      const hp = pt(u, v, 0.35 + bob + 0.4);
      c.fillStyle = k % 2 ? "#fff" : "#f7d6e0";
      c.beginPath();
      c.ellipse(hp[0], hp[1], 1.6 * Z, 0.8 * Z, 0, 0, 7);
      c.fill();
      c.fillRect(hp[0] + Math.cos(a + 1.57) * Z, hp[1] - 1.6 * Z, 0.7 * Z, 1.2 * Z);
    }
    // 屋根(円錐)
    const top = pt(cu, cv2, 4.2);
    for (let k = 0; k < 12; k++) {
      const a0 = k / 12 * 6.2832, a1 = (k + 1) / 12 * 6.2832;
      poly(c, [pt(cu + Math.cos(a0) * r, cv2 + Math.sin(a0) * r, 3), pt(cu + Math.cos(a1) * r, cv2 + Math.sin(a1) * r, 3), top], k % 2 ? "#e74c3c" : "#fdf2e9");
    }
  };
  FAC_DRAW.fx_cups = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    const cu = x + w / 2, cv2 = y + h / 2;
    const ps = [];
    for (let k = 0; k < 24; k++) ps.push(pt(cu + Math.cos(k / 24 * 6.28) * (w / 2 - 0.2), cv2 + Math.sin(k / 24 * 6.28) * (h / 2 - 0.2), 0.15));
    poly(c, ps, "#b8d8e8");
    for (let k = 0; k < 5; k++) {
      const a = t * 0.5 + k / 5 * 6.2832, u = cu + Math.cos(a) * 1.8, v = cv2 + Math.sin(a) * 1.8;
      const p = pt(u, v, 0.2);
      c.fillStyle = ["#ff8fb1", "#8fd3ff", "#ffe08f", "#b5f5a3", "#d6b3ff"][k];
      c.beginPath();
      c.ellipse(p[0], p[1] - 1.2 * Z, 2.4 * Z, 1.4 * Z, 0, 0, 7);
      c.fill();
      c.fillRect(p[0] - 2.4 * Z, p[1] - 1.2 * Z, 4.8 * Z, 1.4 * Z);
      c.fillStyle = "rgba(0,0,0,0.15)";
      c.beginPath();
      c.ellipse(p[0] + Math.cos(t * 3 + k) * 0.6 * Z, p[1] - 1.4 * Z, 1.4 * Z, 0.6 * Z, 0, 0, 7);
      c.fill();
    }
  };
  FAC_DRAW.fx_drop = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt } = d;
    const cu = x + w / 2, cv2 = y + h / 2;
    d.box(c, env.P, cu - 0.5, cv2 - 0.5, cu + 0.5, cv2 + 0.5, 0, 13, "#d0d6dd");
    d.box(c, env.P, cu - 0.8, cv2 - 0.8, cu + 0.8, cv2 + 0.8, 13, 13.6, "#e74c3c");
    const cyc = 12, tt = t % cyc;
    const z = tt < 6 ? 0.5 + tt / 6 * 11 : tt < 7.5 ? 11.5 : tt < 8.3 ? 11.5 - (tt - 7.5) / 0.8 * 11 : 0.5;
    d.box(c, env.P, cu - 1.2, cv2 - 1.2, cu + 1.2, cv2 + 1.2, z, z + 0.5, "#f1c40f");
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * 6.28, p = pt(cu + Math.cos(a) * 1.3, cv2 + Math.sin(a) * 1.3, z - 0.3);
      c.fillStyle = "#3b5998";
      c.fillRect(p[0] - 0.5 * Z, p[1] - 0.5 * Z, Z, 1.6 * Z);
    }
  };
  FAC_DRAW.fx_kart = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    poly(c, [pt(x, y, 0.02), pt(x + w, y, 0.02), pt(x + w, y + h, 0.02), pt(x, y + h, 0.02)], "#555b63");
    poly(c, [pt(x + 2, y + 2, 0.03), pt(x + w - 2, y + 2, 0.03), pt(x + w - 2, y + h - 2, 0.03), pt(x + 2, y + h - 2, 0.03)], "#4f9a3c");
    for (let k = 0; k < 4; k++) {
      const s = (t * (0.09 + k * 0.012) + k * 0.25) % 1, per = 2 * (w - 2) + 2 * (h - 2);
      let L3 = s * per, u, v;
      if (L3 < w - 2) {
        u = x + 1 + L3;
        v = y + 1;
      } else if ((L3 -= w - 2) < h - 2) {
        u = x + w - 1;
        v = y + 1 + L3;
      } else if ((L3 -= h - 2) < w - 2) {
        u = x + w - 1 - L3;
        v = y + h - 1;
      } else {
        L3 -= w - 2;
        u = x + 1;
        v = y + h - 1 - L3;
      }
      const p = pt(u, v, 0.1);
      c.fillStyle = ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71"][k];
      c.fillRect(p[0] - 1.4 * Z, p[1] - 1 * Z, 2.8 * Z, 1.4 * Z);
      c.fillStyle = "#222";
      c.beginPath();
      c.arc(p[0], p[1] - 1.6 * Z, 0.6 * Z, 0, 7);
      c.fill();
    }
  };
  FAC_DRAW.fx_haunt = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    d.box(c, env.P, x + 0.2, y + 0.2, x + w - 0.2, y + h - 0.2, 0, 3.2, "#5d5a63");
    for (let k = 0; k < 5; k++) {
      const p = pt(x + 1 + k * 1.4, y + h - 0.2, 2);
      c.fillStyle = Math.sin(t * 3 + k * 2) > 0.85 ? "#ffe9a0" : "#1d1b22";
      c.fillRect(p[0] - Z, p[1] - Z, 2 * Z, 1.6 * Z);
    }
    const dp = pt(x + w / 2, y + h - 0.2, 0);
    c.fillStyle = "#2a1d14";
    c.fillRect(dp[0] - 1.6 * Z, dp[1] - 5 * Z, 3.2 * Z, 5 * Z);
    void poly;
  };
  FAC_DRAW.fx_castle = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    d.box(c, env.P, x + 0.5, y + 1, x + w - 0.5, y + h - 0.5, 0, 3.5, "#f3eee6");
    const towers = [[x + 1, y + 1.5], [x + w - 2, y + 1.5], [x + 1, y + h - 1.5], [x + w - 2, y + h - 1.5], [x + w / 2 - 0.6, y + h / 2 - 0.6]];
    towers.forEach(([u, v], i) => {
      const hh = i === 4 ? 6 : 4.6;
      d.box(c, env.P, u, v - 0.5, u + 1.2, v + 0.7, 0, hh, "#ebe3d6");
      const tp = pt(u + 0.6, v + 0.1, hh + 2.2);
      poly(c, [pt(u - 0.1, v + 0.8, hh), pt(u + 1.3, v + 0.8, hh), tp], "#3f6fd0");
      poly(c, [pt(u + 1.3, v + 0.8, hh), pt(u + 1.3, v - 0.6, hh), tp], "#2d55a8");
    });
    const g0 = pt(x + w / 2, y + h - 0.5, 0);
    c.fillStyle = "#6b4a2a";
    c.fillRect(g0[0] - 1.4 * Z, g0[1] - 3.2 * Z, 2.8 * Z, 3.2 * Z);
    void t;
  };
