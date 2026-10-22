  // src/fac_airport.js — 空港: 巨大ターミナル(到着/チェックイン → 保安検査 → 6つの搭乗口と搭乗橋 → 駐機場の航空機)
  // 展望デッキ(離着陸が見える)・フードコート・管制塔(レーダー・見学)。搭乗は既存の旅(jticket/jsec/jboard)を使う。
  FAC_RANGE.airport = () => ({ lo: 0, hi: 3, nf: 3 });
  FAC_LABEL.airport = (b, lv) => ["1F 到着ロビー・チェックイン", "2F 出発ロビー・保安検査・搭乗口", "3F フードコート・展望デッキ", "管制塔(見学)"][lv] || "";
  FAC_BUILD.airport = (b, floor, g) => [apF1, apF2, apF3, apTower][floor] ? [apF1, apF2, apF3, apTower][floor](b, g) : null;
  var AP_W = 96;
  function apF1(b, g) {
    const W2 = AP_W, H4 = 28;
    const P = plan(W2, H4, "floor_marble", "station");
    P.lv = 0;
    P.windows(4);
    const dx = 48;
    P.door(dx);
    // チェックインカウンター(航空会社ごと)
    const airlines = ["あおうみ航空", "ジャパンスカイ", "ブルーウイング", "LCC ピーチライン"];
    airlines.forEach((nm, i) => {
      const x0 = 30 + i * 9;
      P.wide("conveyor", x0, 2, 7, 1, null, `${nm} 手荷物ベルト`);
      for (let k = 0; k < 4; k++) P.add("counter", x0 + k * 2, 4, "checkin", `${nm} チェックインカウンター`);
      P.add("roomsign", x0 + 3, 6, null, nm, false, { text: nm });
      P.staffSpots.push({ x: x0 + 1, y: 3, role: "airline" }, { x: x0 + 5, y: 3, role: "airline" });
    });
    for (const x of [24, 26, 28]) P.add("tmachine", x, 4, "checkin", "自動チェックイン機");
    P.wide("board", 40, 1, 8, 1, "jinfo", "出発便案内(フライト・搭乗口・時刻)", {});
    // 到着(西): ターンテーブル・出迎え
    P.fill(1, 1, 20, H4 - 2, "floor_tile");
    P.wide("conveyor", 3, 4, 8, 2, null, "手荷物受取所 ターンテーブル1");
    P.wide("conveyor", 3, 10, 8, 2, null, "手荷物受取所 ターンテーブル2");
    P.add("board", 6, 1, "jinfo", "到着便案内", true);
    for (const y of [5, 11]) P.add("cart", 13, y, null, "手荷物カート");
    P.vwall(21, 1, 16, [8, 9, 10], "到着口の仕切り");
    P.sign(11, 17, "到着ロビー ARRIVALS");
    for (let x = 3; x <= 17; x += 2) {
      P.add("bench", x, 20, null, "出迎えのベンチ", false);
      P.seatSpots.push({ x, y: 20 });
    }
    P.add("counter", 3, 24, "info", "総合案内");
    // 東: 交通・売店
    P.wide("counter", W2 - 14, 18, 3, 1, "shuttle", "空港連絡バス・空港駅への案内(無料シャトル)");
    P.add("kiosk", W2 - 18, 22, null, "売店(新聞・飲み物・軽食)");
    P.wide("showcase", W2 - 10, 22, 3, 1, null, "お土産(地元銘菓・工芸品)");
    for (const x of [W2 - 4, W2 - 3]) P.add("locker", x, 10, "locker", "コインロッカー");
    P.add("toilet", W2 - 2, 14, "toilet", "トイレ");
    P.sign(dx, 8, "出発 DEPARTURES ↑2F 保安検査場");
    P.stair(54, 8, 1, "2F 出発ロビーへ(エスカレーター)");
    P.stair(56, 8, 1, "2F 出発ロビーへ(エスカレーター)");
    P.lifts(58, 7, 2, 0, 3, "エレベーター");
    for (const x of [30, 38, 62, 70]) {
      P.add("sofa", x, 13, null, "ロビーのソファ", false);
      P.seatSpots.push({ x, y: 13 });
    }
    P.add("clock", dx, 1, null, "大時計", true);
    P.staffSpots.push({ x: 4, y: 23, role: "info" }, { x: W2 - 13, y: 17, role: "bus" });
    return P.done({ floors: 4, floor: 0, lv: 0, lo: 0, hi: 3, wallH: 4, label: FAC_LABEL.airport(b, 0) });
  }
  function apF2(b, g) {
    const W2 = AP_W, H4 = 32;
    const P = plan(W2, H4, "floor_carpet", "station");
    P.lv = 1;
    // 北: 駐機場(屋外)と航空機・誘導路・滑走路
    P.fill(0, 1, W2 - 1, 11, "floor_asphalt");
    P.add("fx_apron", 0, 1, "view", "駐機場・誘導路・滑走路(大きな窓から)", true, { w: W2, h: 11, gates: 6 });
    // ガラス壁と搭乗口
    for (let x = 0; x < W2; x++) if (!(x % 14 === 10)) P.add("glass", x, 12, null, "展望ガラス", true);
    for (let i = 0; i < 6; i++) {
      const gx = 10 + i * 14;
      P.add("gate", gx, 12, "gate", `${i + 1}番搭乗口(搭乗橋から航空機へ)`, true);
      P.add("board", gx + 2, 13, "jinfo", `${i + 1}番搭乗口 出発案内`, true);
      P.sign(gx, 14, `GATE ${i + 1}`);
      for (let k = -4; k <= 4; k += 2) if (k) {
        P.add("seat", gx + k, 16, null, "搭乗待合席", false);
        P.seatSpots.push({ x: gx + k, y: 16 });
      }
      P.staffSpots.push({ x: gx + 1, y: 13, role: "gate" });
    }
    // 南: 保安検査場(ここを通ると搭乗エリア)
    P.wide("xray", 34, 24, 8, 1, "security", "保安検査場(手荷物X線・金属探知機)");
    for (const x of [44, 46, 48]) P.add("gate", x, 24, "security", "金属探知ゲート", false);
    P.hwall(1, W2 - 2, 22, [36, 37, 38, 39, 44, 45, 46, 47, 48], "保安検査の仕切り");
    P.sign(41, 26, "保安検査場 SECURITY");
    for (const x of [35, 39, 45]) P.staffSpots.push({ x, y: 25, role: "security" });
    // 免税店・ラウンジ
    P.wide("showcase", 4, 18, 4, 1, "pay", "免税店(化粧品・酒・菓子)");
    P.add("register", 9, 18, "pay", "免税店のレジ");
    P.wide("bar", W2 - 14, 18, 5, 1, "fx_alounge", "航空会社ラウンジ(上級会員・ビジネスクラス)");
    P.add("kiosk", 28, 18, "fx_afood", "売店(お弁当・飲み物)", true, { food: "bento" });
    P.add("toilet", W2 - 2, 20, "toilet", "トイレ");
    P.stair(54, 28, 0, "1F 到着ロビーへ");
    P.stair(56, 28, 2, "3F フードコート・展望デッキへ");
    P.lifts(58, 27, 2, 0, 3, "エレベーター");
    return P.done({ floors: 4, floor: 1, lv: 1, lo: 0, hi: 3, wallH: 1.2, noDoor: true, label: FAC_LABEL.airport(b, 1) });
  }
  function apF3(b, g) {
    const W2 = AP_W, H4 = 30;
    const P = plan(W2, H4, "floor_wood", "station");
    P.lv = 2;
    P.fill(0, 1, W2 - 1, 11, "floor_asphalt");
    P.add("fx_apron", 0, 1, "fx_adeck", "展望デッキから見る滑走路(離着陸)", true, { w: W2, h: 11, gates: 6 });
    P.fill(0, 12, W2 - 1, 15, "floor_paving");
    for (let x = 0; x < W2; x++) P.add("fence", x, 12, null, "展望デッキのフェンス", true);
    for (let x = 6; x < W2 - 6; x += 10) {
      P.add("bench", x, 14, "fx_adeck", "展望デッキのベンチ", false);
      P.seatSpots.push({ x, y: 14 });
    }
    P.add("fx_scope", 30, 13, "fx_adeck", "有料望遠鏡(100円)", true);
    P.sign(48, 15, "展望デッキ OBSERVATION DECK");
    // フードコート
    const stalls = [["ラーメン", "ramen"], ["寿司", "sushi"], ["カレー", "curry"], ["ハンバーガー", "burger"], ["カフェ", "cafe"]];
    stalls.forEach(([nm, k], i) => {
      P.wide("counter", 6 + i * 12, 18, 4, 1, "fx_afood", `フードコート ${nm}`, { food: k });
      P.sign(8 + i * 12, 20, nm);
      P.staffSpots.push({ x: 7 + i * 12, y: 17, role: "cook" });
    });
    for (let i = 0; i < 12; i++) {
      const x = 6 + i % 6 * 10, y = 23 + (i / 6 | 0) * 3;
      P.add("table", x, y, "fx_afood", "フードコートの席", true, { food: "cafe" });
      P.seatSpots.push({ x: x + 1, y });
    }
    P.add("door", 80, 18, "fx_atower", "管制塔見学ツアー受付(1日3回)", true);
    P.stair(54, 26, 1, "2F 出発ロビーへ");
    P.lifts(58, 25, 2, 0, 3, "エレベーター");
    P.stair(84, 26, 3, "管制塔へ(見学者のみ)");
    P.add("toilet", W2 - 2, 22, "toilet", "トイレ");
    return P.done({ floors: 4, floor: 2, lv: 2, lo: 0, hi: 3, wallH: 1, roof: true, noDoor: true, label: FAC_LABEL.airport(b, 2) });
  }
  function apTower(b, g) {
    const W2 = 22, H4 = 16;
    const P = plan(W2, H4, "floor_dark", "office");
    P.lv = 3;
    for (let x = 0; x < W2; x++) P.add("glass", x, 1, null, "全面ガラス(滑走路が一望できる)", true);
    P.fill(0, 1, W2 - 1, 1, "floor_asphalt");
    P.add("fx_radar", 3, 3, "fx_atc", "レーダー画面(航空機の位置)", true, { w: 3, h: 2 });
    P.add("fx_radar", 9, 3, "fx_atc", "飛行場管制卓(タワー)", true, { w: 3, h: 2 });
    P.add("fx_radar", 15, 3, "fx_atc", "地上管制卓(グランド)", true, { w: 3, h: 2 });
    for (const x of [4, 10, 16]) P.staffSpots.push({ x, y: 5, role: "controller" });
    P.wide("board", 7, 1, 8, 1, "fx_atc", "滑走路の全景(全面ガラス)", {});
    P.add("pcdesk", 5, 9, "fx_atc", "フライトストリップ(運航票)", true);
    P.add("fx_scope", 14, 9, "fx_atc", "双眼鏡", true);
    P.sign(11, 12, "TOWER 管制塔");
    P.stair(18, 13, 2, "3Fへ戻る");
    return P.done({ floors: 4, floor: 3, lv: 3, lo: 0, hi: 3, wallH: 0.9, noDoor: true, label: FAC_LABEL.airport(b, 3) });
  }
  // ---- 行動
  FAC_ACTS.fx_adeck = (g, o, b, push) => {
    push("adeck", "飛行機の離着陸を眺める(20分)");
    push("adeckscope", `望遠鏡をのぞく(¥${yenf(g, 100)})`, { disabled: g.hero.money < yenf(g, 100) });
  };
  FAC_RUN.adeck = (g, arg, tg, r) => {
    g.advance(20);
    r.msg = "轟音とともにジェット機が滑走路を駆け抜け、ふわりと空へ。次の便が着陸灯を光らせて降りてきます。" + g.chg({ mood: 6 });
    r.ui = "fx_scene";
    r.scene = apRunwayScene(g, false);
  };
  FAC_RUN.adeckscope = (g, arg, tg, r) => {
    g.pay(yenf(g, 100), "望遠鏡");
    g.advance(5);
    r.msg = "コックピットのパイロットが手を振っているのが見えました。" + g.chg({ mood: 3 });
  };
  FAC_ACTS.fx_afood = (g, o, b, push) => {
    const M2 = AP_FOOD[o.food || "cafe"];
    push("afood:" + (o.food || "cafe"), `${M2[0]}(¥${yenf(g, M2[1])})`, { disabled: g.hero.money < yenf(g, M2[1]) });
  };
  var AP_FOOD = { ramen: ["空港ラーメン", 1e3, 45], sushi: ["にぎり寿司セット", 1800, 45], curry: ["空港カレー", 950, 45], burger: ["ハンバーガーセット", 850, 40], cafe: ["コーヒーとケーキ", 750, 15], bento: ["空弁(機内持ち込み弁当)", 1200, 45] };
  FAC_RUN.afood = (g, arg, tg, r) => {
    const M2 = AP_FOOD[arg] || AP_FOOD.cafe;
    g.pay(yenf(g, M2[1]), "空港の食事");
    g.advance(arg === "cafe" ? 20 : 30);
    r.msg = `${M2[0]}を食べました。窓の外を飛行機がゆっくり動いていきます。` + g.chg({ hunger: M2[2], mood: 3 });
  };
  FAC_ACTS.fx_alounge = (g, o, b, push) => {
    const tr = g.S.trip;
    if (tr && tr.mode === "air" && tr.fare > yenf(g, 6e4)) push("alounge", "ラウンジでくつろぐ(搭乗券で入室)");
    else push("alounge:pay", `ラウンジを利用する(¥${yenf(g, 4e3)})`, { disabled: g.hero.money < yenf(g, 4e3) });
  };
  FAC_RUN.alounge = (g, arg, tg, r) => {
    if (arg === "pay") g.pay(yenf(g, 4e3), "空港ラウンジ");
    g.advance(40);
    r.msg = "静かなラウンジで飲み物と軽食。窓いっぱいに駐機場が広がっています。" + g.chg({ mood: 6, energy: 6, hunger: 10 });
  };
  FAC_ACTS.fx_atower = (g, o, b, push) => {
    const m = g.S.min;
    const slots = [600, 780, 900];
    const next = slots.find((s) => s + 30 >= m);
    push("atour", next != null ? `管制塔見学ツアーに参加(${Math.floor(next / 60)}:00〜・¥${yenf(g, 500)})` : "本日の見学ツアーは終了しました", { disabled: next == null || g.hero.money < yenf(g, 500) });
  };
  FAC_RUN.atour = (g, arg, tg, r) => {
    const m = g.S.min, next = [600, 780, 900].find((s) => s + 30 >= m);
    if (next > m) g.advance(next - m);
    g.pay(yenf(g, 500), "管制塔見学");
    const L2 = g.S.loc;
    L2.floor = 3;
    L2.x = 11;
    L2.y = 10;
    g.S.atcTour = g.S.M * 40 + g.date().d;
    r.floor = true;
    r.msg = "案内係と一緒に管制塔へ上がりました。360度ガラス張りの部屋で、管制官が滑走路を見守っています。";
  };
  FAC_ACTS.fx_atc = (g, o, b, push) => {
    push("atc", "管制官の仕事を見学する(15分)");
  };
  FAC_RUN.atc = (g, arg, tg, r) => {
    g.advance(15);
    r.msg = "「あおうみ123、滑走路34、離陸を許可します」——無線の声に合わせて機体が加速していきました。" + g.chg({ mood: 6 });
    g.hero.study = Math.min(100, (g.hero.study || 0) + 1);
    r.ui = "fx_scene";
    r.scene = apRunwayScene(g, true);
  };
  function apRunwayScene(g, atc) {
    return {
      title: atc ? "管制塔から見た滑走路" : "展望デッキ",
      dur: 14,
      lines: atc ? [[0, "管制官「あおうみ123、滑走路34、風320度8ノット、離陸を許可します」"], [5, "機長「あおうみ123、離陸します」"], [10, "管制官「あおうみ123、出発管制へどうぞ。グッデイ」"]] : [[0, "滑走路に入った機体が、エンジンの回転を上げていきます"], [6, "離陸!"], [10, "次の便が着陸してきます"]],
      draw(c, t, W2, H4) {
        const night = g.S.min >= 18 * 60 || g.S.min < 5 * 60;
        const gr = c.createLinearGradient(0, 0, 0, H4);
        gr.addColorStop(0, night ? "#0a1230" : "#79bdf0");
        gr.addColorStop(1, night ? "#27304d" : "#d9eefc");
        c.fillStyle = gr;
        c.fillRect(0, 0, W2, H4);
        c.fillStyle = night ? "#1a1f2a" : "#8bb06a";
        c.fillRect(0, H4 * 0.6, W2, H4 * 0.4);
        c.fillStyle = "#555b63";
        c.beginPath();
        c.moveTo(0, H4 * 0.78);
        c.lineTo(W2, H4 * 0.68);
        c.lineTo(W2, H4 * 0.74);
        c.lineTo(0, H4 * 0.9);
        c.fill();
        c.strokeStyle = "#fff";
        c.setLineDash([20, 18]);
        c.beginPath();
        c.moveTo(0, H4 * 0.84);
        c.lineTo(W2, H4 * 0.71);
        c.stroke();
        c.setLineDash([]);
        // 離陸機
        const f = Math.min(1, t / 9);
        const px2 = W2 * (0.05 + f * f * 1.1), py = H4 * (0.82 - f * 0.12) - (t > 5 ? (t - 5) * (t - 5) * H4 * 0.012 : 0);
        const ang = t > 5 ? -0.18 : -0.08;
        const plane = (x, y, s, a) => {
          c.save();
          c.translate(x, y);
          c.rotate(a);
          c.scale(s, s);
          c.fillStyle = "#f5f7fa";
          c.beginPath();
          c.ellipse(0, 0, 60, 9, 0, 0, 7);
          c.fill();
          c.fillStyle = "#1e88e5";
          c.fillRect(-50, -2, 100, 4);
          c.beginPath();
          c.moveTo(-52, -6);
          c.lineTo(-64, -32);
          c.lineTo(-46, -6);
          c.fill();
          c.fillStyle = "#c5ccd6";
          c.beginPath();
          c.moveTo(-6, 2);
          c.lineTo(-26, 26);
          c.lineTo(10, 3);
          c.fill();
          c.fillStyle = "#2d3a4a";
          for (let k = 0; k < 10; k++) c.fillRect(-36 + k * 8, -4, 4, 3);
          c.restore();
        };
        plane(px2, py, H4 / 300, ang);
        // 着陸機(遠く)
        if (t > 8) {
          const f2 = Math.min(1, (t - 8) / 6);
          plane(W2 * (1.1 - f2 * 0.7), H4 * (0.2 + f2 * 0.45), H4 / 700, 0.08);
        }
        if (atc) {
          c.fillStyle = "rgba(10,20,30,0.85)";
          c.fillRect(0, H4 * 0.88, W2, H4 * 0.12);
          c.strokeStyle = "#39ff88";
          c.beginPath();
          c.arc(W2 * 0.08, H4 * 0.94, H4 * 0.05, 0, 7);
          c.stroke();
          const a = t * 2;
          c.beginPath();
          c.moveTo(W2 * 0.08, H4 * 0.94);
          c.lineTo(W2 * 0.08 + Math.cos(a) * H4 * 0.05, H4 * 0.94 + Math.sin(a) * H4 * 0.05);
          c.stroke();
        }
      }
    };
  }
  // ---- 描画: 駐機場の航空機(駐機・プッシュバック・タキシング・離着陸)、ガラス、レーダー、望遠鏡
  FXH.fx_apron = 0.1;
  FXH.glass = 2.6;
  FXH.fx_radar = 1.2;
  FXH.fx_scope = 1.3;
  function drawPlane(c, d, env, u, v, z, heading, scale = 1, livery = "#1e88e5") {
    const { pt, poly, box } = d;
    // heading: 0 = 北向き(機首が -v)、1 = 東向き(機首が +u)
    const L3 = 9 * scale, Wg = 7.5 * scale, fw = 0.7 * scale;
    const P2 = env.P;
    if (heading === 0) {
      box(c, P2, u - fw, v - L3 / 2, u + fw, v + L3 / 2, z + 0.5, z + 1.8 * scale, "#f3f5f8");
      poly(c, [pt(u - Wg, v + 0.6, z + 1), pt(u + Wg, v + 0.6, z + 1), pt(u + fw, v - 1.6 * scale, z + 1), pt(u - fw, v - 1.6 * scale, z + 1)], "#c9d0d9");
      poly(c, [pt(u - 2.6 * scale, v + L3 / 2 - 0.2, z + 1.6), pt(u + 2.6 * scale, v + L3 / 2 - 0.2, z + 1.6), pt(u, v + L3 / 2 - 1.8 * scale, z + 1.6)], "#c9d0d9");
      poly(c, [pt(u, v + L3 / 2 - 0.1, z + 1.8 * scale), pt(u, v + L3 / 2 - 1.8 * scale, z + 1.8 * scale), pt(u, v + L3 / 2 - 0.4, z + 4 * scale)], livery);
      poly(c, [pt(u + fw, v - L3 / 2 + 1, z + 1.2 * scale), pt(u + fw, v + L3 / 2 - 1, z + 1.2 * scale), pt(u + fw, v + L3 / 2 - 1, z + 1.35 * scale), pt(u + fw, v - L3 / 2 + 1, z + 1.35 * scale)], livery);
    } else {
      const s = heading > 0 ? 1 : -1;
      box(c, P2, u - L3 / 2, v - fw, u + L3 / 2, v + fw, z + 0.5, z + 1.8 * scale, "#f3f5f8");
      poly(c, [pt(u + 0.6 * s, v - Wg, z + 1), pt(u + 0.6 * s, v + Wg, z + 1), pt(u - 1.6 * scale * s, v + fw, z + 1), pt(u - 1.6 * scale * s, v - fw, z + 1)], "#c9d0d9");
      poly(c, [pt(u - s * (L3 / 2 - 0.1), v, z + 1.8 * scale), pt(u - s * (L3 / 2 - 1.8 * scale), v, z + 1.8 * scale), pt(u - s * (L3 / 2 - 0.4), v, z + 4 * scale)], livery);
      poly(c, [pt(u - L3 / 2 + 1, v + fw, z + 1.2 * scale), pt(u + L3 / 2 - 1, v + fw, z + 1.2 * scale), pt(u + L3 / 2 - 1, v + fw, z + 1.35 * scale), pt(u - L3 / 2 + 1, v + fw, z + 1.35 * scale)], livery);
    }
  }
  FAC_DRAW.fx_apron = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    // 滑走路(北端)・誘導路
    poly(c, [pt(x, y, 0.02), pt(x + w, y, 0.02), pt(x + w, y + 2.2, 0.02), pt(x, y + 2.2, 0.02)], "#3e4248");
    c.strokeStyle = "#fff";
    c.lineWidth = Math.max(1, Z * 0.3);
    c.beginPath();
    for (let u = x + 1; u < x + w; u += 3) {
      const a = pt(u, y + 1.1, 0.03), b2 = pt(u + 1.5, y + 1.1, 0.03);
      c.moveTo(a[0], a[1]);
      c.lineTo(b2[0], b2[1]);
    }
    c.stroke();
    c.strokeStyle = "#f2c94c";
    c.beginPath();
    {
      const a = pt(x, y + 4, 0.03), b2 = pt(x + w, y + 4, 0.03);
      c.moveTo(a[0], a[1]);
      c.lineTo(b2[0], b2[1]);
    }
    c.stroke();
    const liv = ["#1e88e5", "#e53935", "#43a047", "#8e24aa", "#fb8c00", "#00897b"];
    // 駐機中の航空機と搭乗橋
    for (let i = 0; i < (o.gates || 6); i++) {
      const gx = x + 10 + i * 14 + 0.5;
      const cyc = 90, tt = (t + i * 23) % cyc;
      let v = y + h - 4.6, gone = false;
      if (tt > 70) {
        v -= (tt - 70) * 0.25;
        if (tt > 80) gone = true;
      }
      // 搭乗橋
      d.box(c, env.P, gx + 0.8, y + h - 2.2, gx + 1.8, y + h, 1.2, 2.2, "#c3c9d1");
      if (!gone) drawPlane(c, d, env, gx, v, 0, 0, 1, liv[i % liv.length]);
      // 地上作業車
      const tug = pt(gx - 2.5 + Math.sin(t * 0.3 + i) * 0.5, y + h - 2, 0.1);
      c.fillStyle = "#f2c94c";
      c.fillRect(tug[0] - Z, tug[1] - Z, 2 * Z, Z);
    }
    // 誘導路をタキシングする機体
    {
      const s = t * 0.9 % (w + 20) - 10;
      drawPlane(c, d, env, x + s, y + 4, 0, 1, 0.9, "#e53935");
    }
    // 離陸(滑走 → 浮上)
    {
      const cyc = 40, tt = t % cyc;
      if (tt < 16) {
        const f = tt / 16, u = x + w - f * f * (w + 30);
        const z = f > 0.6 ? (f - 0.6) * 25 : 0;
        drawPlane(c, d, env, u, y + 1.1, z, -1, 1.1, "#1e88e5");
      } else if (tt > 22 && tt < 36) {
        const f = (tt - 22) / 14, u = x - 20 + f * (w * 0.7);
        const z = Math.max(0, (1 - f) * 18 - 2);
        drawPlane(c, d, env, u, y + 1.1, z, 1, 1.1, "#43a047");
      }
    }
  };
  FAC_DRAW.glass = (c, env, o, H5, d) => {
    const { x, y, pt, poly } = d;
    c.save();
    c.globalAlpha = 0.28;
    poly(c, [pt(x, y + 0.5, 0), pt(x + 1, y + 0.5, 0), pt(x + 1, y + 0.5, 2.6), pt(x, y + 0.5, 2.6)], "#9fd3ee");
    c.restore();
    d.box(c, env.P, x, y + 0.45, x + 0.08, y + 0.55, 0, 2.6, "#8a939e");
    d.box(c, env.P, x, y + 0.45, x + 1, y + 0.55, 2.5, 2.6, "#8a939e");
  };
  FAC_DRAW.fx_radar = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt } = d;
    d.box(c, env.P, x, y, x + w, y + h, 0, 0.9, "#3c4450");
    const q = pt(x + w / 2, y + h / 2, 1.05);
    const r = Math.max(4, 3.2 * Z);
    c.fillStyle = "#06210f";
    c.beginPath();
    c.ellipse(q[0], q[1], r * 1.6, r * 0.8, 0, 0, 7);
    c.fill();
    c.strokeStyle = "#39ff88";
    c.lineWidth = Math.max(1, Z * 0.2);
    const a = t * 1.5;
    c.beginPath();
    c.moveTo(q[0], q[1]);
    c.lineTo(q[0] + Math.cos(a) * r * 1.6, q[1] + Math.sin(a) * r * 0.8);
    c.stroke();
    c.fillStyle = "#b6ffd0";
    for (let k = 0; k < 4; k++) {
      const bx = Math.cos(k * 1.7 + t * 0.05) * r * 1.2, by = Math.sin(k * 2.3 + t * 0.05) * r * 0.6;
      c.fillRect(q[0] + bx - 1, q[1] + by - 1, 2, 2);
    }
  };
  FAC_DRAW.fx_scope = (c, env, o, H5, d) => {
    const { x, y, Z, pt } = d;
    d.box(c, env.P, x + 0.4, y + 0.4, x + 0.6, y + 0.6, 0, 1, "#6b7280");
    d.box(c, env.P, x + 0.25, y + 0.3, x + 0.75, y + 0.7, 1, 1.3, "#2e7d32");
    void Z;
    void pt;
  };
