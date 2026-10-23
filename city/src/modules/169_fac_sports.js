  // src/fac_sports.js — ボウリング場(12〜20レーン・助走路・頭上のスコア画面・ボール棚・受付とシューズ・プロショップ・ゲームコーナー)と
  // 商業のスポーツジム(v11 のおよそ2倍: 受付・男女の更衣室とシャワー・有酸素マシン・筋トレマシン・フリーウェイトと鏡・スタジオ)。
  // 遊ぶ・鍛える操作は v11 の play(料金・時間・効果)をそのまま使う。学校の体育館は fac_campus.js(種類が別)。
  FAC_RANGE.bowling = () => ({ lo: 0, hi: 0, nf: 1 });
  FAC_LABEL.bowling = () => "レーン";
  FAC_BUILD.bowling = (b) => {
    const N2 = 12 + uh(b.idx, 911) % 3 * 4, W2 = N2 * 2 + 6, H4 = 26, len = 13;
    const P = plan(W2, H4, "floor_carpet", "bowling");
    P.lv = 0;
    const dx = W2 >> 1;
    P.door(dx);
    for (let i = 0; i < N2; i++) {
      const x = 3 + i * 2;
      P.wide("lane", x, 1, 1, len, "play", `${i + 1}番レーン`);
      if (i % 2 === 0) {
        P.add("fx_score", x, len + 1, null, `${i + 1}・${i + 2}番レーンのスコア画面`, true, { w: 2, h: 1, lane: i });
        P.add("fx_ballrack", x, len + 4, null, "ボール棚", true, { w: 2, h: 1 });
        P.add("sofa", x, len + 3, "rest", "ボウラーズベンチ", false);
      }
    }
    P.fill(1, len + 1, W2 - 2, len + 2, "floor_wood");
    // 受付・シューズ・プロショップ・ゲームコーナー
    P.wide("counter", 2, H4 - 5, 5, 1, "pay", "受付(ゲーム料金・シューズ貸出)");
    for (let k = 0; k < 4; k++) P.add("shoebox", 2 + k, H4 - 3, null, "貸出シューズの棚", true);
    P.wide("counter", W2 - 8, H4 - 5, 3, 1, null, "プロショップ(マイボール・グローブ)");
    for (let k = 0; k < 3; k++) P.add("arcade", W2 - 4 + (k % 2), H4 - 8 + k, "play", "ゲームコーナー", true);
    P.add("vending", dx + 3, H4 - 3, null, "飲み物の自動販売機");
    P.add("toilet", W2 - 2, H4 - 3, "toilet", "トイレ");
    P.staffSpots.push({ x: 3, y: H4 - 6, role: "front" }, { x: W2 - 7, y: H4 - 6, role: "shop" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 3, label: "レーン", lanes: N2 });
  };
  FAC_RANGE.gym = (b) => b.campusOf != null ? null : { lo: 0, hi: 0, nf: 1 };
  FAC_LABEL.gym = () => "トレーニングフロア";
  FAC_BUILD.gym = (b) => {
    const W2 = 30, H4 = 20;
    const P = plan(W2, H4, "floor_dark", "gym");
    P.lv = 0;
    const dx = W2 >> 1;
    P.door(dx);
    // 受付と更衣室(男女・ロッカーとシャワー)
    P.wide("counter", dx - 2, H4 - 4, 4, 1, "pay", "受付(会員証・タオル)");
    for (const [x0, lab] of [[1, "男性更衣室"], [W2 - 8, "女性更衣室"]]) {
      P.room(x0, H4 - 8, x0 + 6, H4 - 2, { door: [x0 + (x0 < dx ? 6 : 0), H4 - 5], label: lab, tile: "floor_wood" });
      for (let k = 0; k < 4; k++) P.add("locker", x0 + 1 + k, H4 - 7, "locker", "ロッカー");
      P.add("wash", x0 + 5 - (x0 < dx ? 0 : 4), H4 - 3, null, "シャワー", false);
    }
    // 有酸素マシン(ランニングマシン・バイク)
    for (let k = 0; k < 8; k++) P.add("treadmill", 2 + k * 2, 2, "play", "ランニングマシン");
    for (let k = 0; k < 6; k++) P.add("fx_bike", 2 + k * 2, 4, "play", "エアロバイク", true);
    // 筋トレマシン・フリーウェイト(鏡の前)
    for (let k = 0; k < 4; k++) P.add("weights", 2 + k * 3, 7, "play", "筋トレマシン");
    P.add("mirror", 18, 1, null, "鏡の壁", true, { w: 6, h: 1 });
    for (let k = 0; k < 3; k++) P.add("weights", 18 + k * 2, 3, "play", "フリーウェイト(ベンチ)");
    // スタジオ(ヨガ・ダンス)
    P.room(18, 5, W2 - 2, 10, { door: [20, 10], label: "スタジオ(ヨガ 19:00 / ダンス 20:30)", tile: "floor_wood" });
    for (let k = 0; k < 4; k++) P.add("playmat", 19 + k * 2, 7, "play", "ヨガマット", false);
    P.add("watersrv", dx, 9, null, "給水機", true);
    P.staffSpots.push({ x: dx - 1, y: H4 - 5, role: "front" }, { x: 10, y: 6, role: "trainer" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 3, label: "トレーニングフロア" });
  };
  // ---- 描画
  FXH.fx_score = 2.6;
  FAC_DRAW.fx_score = (c, env, o, H5, d0) => {
    const { x, y, w, box, pt, Z, t } = d0;
    box(c, d0.P, x + 0.1, y + 0.4, x + w - 0.1, y + 0.5, 2.0, 2.6, "#1d2230");
    c.fillStyle = "#7ad0ff";
    for (let i = 0; i < 3; i++) {
      const a = pt(x + 0.25, y + 0.5, 2.45 - i * 0.15);
      c.fillRect(a[0], a[1], (8 + (((t * 0.5 + i + (o.lane || 0)) % 3) + 3) % 3 * 3) * Z, Math.max(1, 0.5 * Z));
    }
  };
  FAC_DRAW.fx_ballrack = (c, env, o, H5, d0) => {
    const { x, y, w, box, pt, Z } = d0;
    box(c, d0.P, x + 0.1, y + 0.3, x + w - 0.1, y + 0.7, 0, 0.5, "#6b6f78");
    const cols = ["#d84a3a", "#3a7ad8", "#2a2a2a", "#3aa86a", "#e8a23a"];
    for (let i = 0; i < 5; i++) {
      const a = pt(x + 0.3 + i * 0.32, y + 0.5, 0.65);
      c.fillStyle = cols[i];
      c.beginPath();
      c.arc(a[0], a[1], 1.4 * Z, 0, 7);
      c.fill();
    }
  };
  FAC_DRAW.fx_bike = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    box(c, d0.P, x + 0.3, y + 0.3, x + 0.7, y + 0.8, 0, 0.35, "#3a3f48");
    box(c, d0.P, x + 0.42, y + 0.6, x + 0.58, y + 0.7, 0.35, 1.0, "#5a5f68");
    box(c, d0.P, x + 0.35, y + 0.55, x + 0.65, y + 0.75, 1.0, 1.08, "#1d1f24");
    box(c, d0.P, x + 0.4, y + 0.25, x + 0.6, y + 0.35, 0.35, 1.25, "#5a5f68");
  };
