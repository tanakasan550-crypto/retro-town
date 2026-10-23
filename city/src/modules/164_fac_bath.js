  // src/fac_bath.js — 銭湯と日帰り温泉の作り直し: 受付(下足箱・番台/フロント・牛乳・休憩所)・脱衣所・ガラス戸の仕切り・洗い場(壁ぎわと島)・
  // 大きな湯船・ジェットバス・水風呂・サウナ(店による)・温泉は岩の露天風呂。銭湯の湯船の奥には山と海の壁画(架空の風景)。
  // 操作の名前(bath/wash/locker/stairs の gate/milk/rest/reception)は v11 と同じなので、入浴の手順・料金・洗ってから湯船の決まりはそのまま使える。
  // 浴室の人(主人公・NPC)はバスタオルを巻いた姿で描く(isoint.js の人物の描画で I.bathFloor の浴室側だけ)。家族風呂の階(温泉の4階)は v11 のまま。
  FAC_RANGE.sento = () => ({ lo: 0, hi: 2, nf: 3 });
  FAC_RANGE.onsenbath = () => ({ lo: 0, hi: 3, nf: 4 });
  FAC_LABEL.sento = (b, lv) => ["受付", "男湯", "女湯"][lv] || "";
  FAC_LABEL.onsenbath = (b, lv) => ["受付・休憩処", "男湯", "女湯", "家族風呂"][lv] || "";
  FAC_BUILD.sento = (b, floor) => floor === 0 ? bathLobby(b, false) : floor <= 2 ? bathFloor(b, floor, false) : null;
  FAC_BUILD.onsenbath = (b, floor) => floor === 0 ? bathLobby(b, true) : floor <= 2 ? bathFloor(b, floor, true) : null;
  function bathLobby(b, onsen) {
    const W2 = onsen ? 30 : 22, H4 = onsen ? 18 : 14, h = uh(b.idx, 801);
    const P = plan(W2, H4, "floor_wood", "onsen");
    P.lv = 0;
    const dx = W2 >> 1;
    P.door(dx);
    // 入口: 下足箱(靴を脱いで上がる)
    for (let x = dx - 5; x <= dx - 2; x++) P.add("locker", x, H4 - 3, "locker", "下足箱(木札の鍵)");
    for (let x = dx + 2; x <= dx + 5; x++) P.add("locker", x, H4 - 3, "locker", "下足箱(木札の鍵)");
    P.sign(dx, H4 - 4, "くつをぬいでお上がりください");
    // 男湯・女湯ののれん(北側)と、そのあいだの番台/フロント
    P.add("noren", 2, 1, "stairs", "男湯(のれん)", false, { to: 1, gate: "M" });
    P.add("noren", W2 - 3, 1, "stairs", "女湯(のれん)", false, { to: 2, gate: "F" });
    if (onsen) P.add("noren", dx, 1, "stairs", "家族風呂(貸切)へ(のれん)", false, { to: 3, gate: "K", family: true });
    P.wide("counter", dx - 3, 3, onsen ? 2 : 3, 1, "reception", onsen ? "フロント(入館券・タオル貸出)" : "番台(入浴料・石けん・タオル)");
    if (onsen) P.wide("counter", dx + 2, 3, 2, 1, "reception", "フロント(入館券)");
    P.sign(dx, 2, onsen ? "男湯は左・女湯は右・家族風呂は奥" : "男湯は左・女湯は右");
    // 湯上がりの牛乳・休憩
    P.add("vending", W2 - 2, 4, "milk", "牛乳・コーヒー牛乳の冷蔵庫");
    P.add("vending", W2 - 2, 5, "milk", "飲み物の自動販売機");
    for (let k = 0; k < 3; k++) P.add("seat", 2 + k, 6, "rest", "湯上がりのベンチ", false);
    P.add("seat", 2, 8, "rest", "マッサージチェア", false);
    P.add("tv", 3, 9, null, "テレビ(相撲中継・ニュース)", true);
    P.add("plant", W2 - 2, H4 - 3, null, "観葉植物");
    if (onsen) {
      // 休憩処(畳)・食事処・売店
      P.room(dx + 2, 6, W2 - 4, 11, { door: [dx + 4, 11], label: "休憩処(お座敷)", tile: "floor_tatami" });
      for (let k = 0; k < 3; k++) P.add("seat", dx + 4 + k * 2, 8, "rest", "座布団", false);
      P.room(4, 10, dx - 2, H4 - 5, { door: [dx - 4, H4 - 5], label: "お食事処", tile: "floor_wood" });
      for (let k = 0; k < 3; k++) P.wide("table", 6 + k * 3, 12, 2, 1, null, "食事処のテーブル");
      P.add("counter", W2 - 4, H4 - 4, "reception", "売店(温泉まんじゅう・入浴剤)");
      P.seatSpots.push({ x: dx + 4, y: 8 }, { x: dx + 6, y: 8 });
    }
    P.staffSpots.push({ x: dx - 2, y: 4, role: "front" }, { x: dx + 1, y: 4, role: "front" });
    P.seatSpots.push({ x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 });
    return P.done({ floors: onsen ? 4 : 3, floor: 0, lv: 0, lo: 0, hi: onsen ? 3 : 2, wallH: 3, label: FAC_LABEL[b.type](b, 0), sauna: h % 2 === 0 });
  }
  function bathFloor(b, floor, onsen) {
    const W2 = onsen ? 30 : 22, H4 = onsen ? 20 : 17, h = uh(b.idx, 801), side = floor === 1 ? "M" : "F";
    const sauna = onsen || h % 2 === 0;
    const P = plan(W2, H4, "bath", "onsen");
    P.lv = floor;
    const dressY = H4 - 6;
    // 脱衣所(板の間)
    P.fill(0, dressY + 1, W2 - 1, H4 - 1, "floor_wood");
    P.add("noren", 1, H4 - 2, "stairs", "受付ロビーへ(のれん)", false, { to: 0, gate: side });
    for (let i = 0; i < 6; i++) P.add("locker", 3 + i, H4 - 2, "locker", "脱衣ロッカー");
    for (let i = 0; i < 3; i++) P.add("basket", 3 + i, dressY + 2, "locker", "脱衣かご", true);
    P.add("vanity", W2 - 4, H4 - 2, null, "洗面台(ドライヤー)");
    P.add("vanity", W2 - 5, H4 - 2, null, "洗面台(ドライヤー)");
    P.add("toilet", W2 - 2, H4 - 3, "toilet", "トイレ");
    P.add("fx_scale", W2 - 3, dressY + 2, null, "体重計", true);
    P.add("seat", 10, H4 - 3, "rest", "湯上がりの長いす", false);
    P.add("seat", 11, H4 - 3, "rest", "湯上がりの長いす", false);
    // ガラス戸の仕切り(浴室と脱衣所)
    P.add("fx_glasswall", 0, dressY, null, "ガラスの仕切り", true, { w: 6, h: 1 });
    P.add("fx_glasswall", 8, dressY, null, "ガラスの仕切り", true, { w: W2 - 8, h: 1 });
    P.add("fx_glassdoor", 6, dressY, null, "ガラス戸(湯気が出ないように閉めます)", false, { w: 2, h: 1 });
    P.sign(6, dressY - 1, "かけ湯をしてから湯船へ");
    // 洗い場: 西の壁ぎわと、中央の島(背中合わせ)
    for (let y = 2; y <= dressY - 3; y++) P.add("wash", 1, y, "wash", "洗い場(シャワー・桶・椅子)", false);
    for (let x = 4; x <= 9; x++) {
      P.add("wash", x, dressY - 5, "wash", "洗い場(島のカラン)", false);
      P.add("wash", x, dressY - 3, "wash", "洗い場(島のカラン)", false);
    }
    P.add("fx_washisle", 4, dressY - 4, null, "洗い場の島(鏡とカラン)", true, { w: 6, h: 1 });
    // 大きな湯船・ジェットバス・水風呂
    const bx0 = 12, bw = W2 - bx0 - (onsen ? 9 : 2);
    P.add("fx_yubune", bx0, 2, "bath", onsen ? "内湯(源泉かけ流し)" : "大きな湯船(あつ湯・ぬる湯)", false, { w: bw, h: 4, kind: onsen ? "onsen" : "sento" });
    P.add("fx_yubune", bx0, 7, "bath", "ジェットバス", false, { w: 3, h: 2, kind: "jet" });
    P.add("fx_yubune", bx0 + 4, 7, "bath", "水風呂", false, { w: 2, h: 2, kind: "cold" });
    if (!onsen) P.add("fx_mural", bx0, 1, null, "湯船の奥の壁画(山と海)", true, { w: bw });
    if (sauna) {
      P.room(bx0, 10, bx0 + 5, dressY - 1, { door: [bx0 + 2, dressY - 1], label: "サウナ", tile: "floor_wood", lowFront: false });
      for (let k = 0; k < 3; k++) P.add("seat", bx0 + 1 + k, 11, "rest", "サウナのひな壇", false);
      P.add("fx_stove", bx0 + 4, 11, null, "サウナストーブ", true);
    }
    if (onsen) {
      // 露天風呂(東側): 岩の湯船・竹の目隠し・灯籠・植え込み
      const rx = W2 - 8;
      P.fill(rx, 1, W2 - 1, dressY - 1, "floor_dirt");
      P.vwall(rx - 1, 1, dressY - 1, [dressY - 3], "露天風呂への戸");
      P.add("fx_yubune", rx + 1, 3, "bath", "岩の露天風呂", false, { w: 5, h: 5, kind: "roten" });
      for (let x = rx; x < W2; x++) P.add("fence", x, 1, null, "竹の目隠し", true);
      P.add("lamp", rx, 2, null, "石灯籠", true);
      P.add("rock", W2 - 2, 9, null, "庭石", true);
      P.add("plant", rx + 2, 10, null, "植え込み", true);
      P.add("seat", rx + 4, 10, "rest", "露天の縁台", false);
    }
    P.seatSpots.push({ x: 10, y: H4 - 3 }, { x: 11, y: H4 - 3 });
    return P.done({ floors: onsen ? 4 : 3, floor, lv: floor, lo: 0, hi: onsen ? 3 : 2, wallH: 3, label: FAC_LABEL[b.type](b, floor), bathFloor: true, dressY, gateSide: side });
  }
  // ---- 描画
  FXH.fx_yubune = 0.55;
  FAC_DRAW.fx_yubune = (c, env, o, H5, d0) => {
    const { x, y, w, h, box, pt, t, Z } = d0, k = o.kind;
    const rim = k === "roten" ? "#8a8a80" : k === "onsen" ? "#c79a5e" : "#d8dee2";
    const water = k === "cold" ? "#9fd3ef" : k === "roten" ? "#7fb8b0" : k === "onsen" ? "#88c6c9" : "#6cbfe0";
    // 縁(4辺)と湯面
    box(c, d0.P, x, y, x + w, y + 0.18, 0, 0.55, rim);
    box(c, d0.P, x, y + h - 0.18, x + w, y + h, 0, 0.55, rim);
    box(c, d0.P, x, y, x + 0.18, y + h, 0, 0.55, rim);
    box(c, d0.P, x + w - 0.18, y, x + w, y + h, 0, 0.55, rim);
    box(c, d0.P, x + 0.18, y + 0.18, x + w - 0.18, y + h - 0.18, 0, 0.42, water);
    if (k === "roten") for (let i = 0; i < w + h; i++) {
      const u = i < w ? x + i + 0.5 : x + w - 0.1, v = i < w ? y + h - 0.1 : y + (i - w) + 0.5;
      box(c, d0.P, u - 0.35, v - 0.25, u + 0.3, v + 0.2, 0, 0.75 + (i % 3) * 0.08, i % 2 ? "#7c7a70" : "#8f8c80");
    }
    // 湯気・泡
    c.save();
    for (let i = 0; i < (k === "cold" ? 0 : Math.ceil(w * h / 3)); i++) {
      const ph = ((t * 0.25 + i * 0.37) % 1 + 1) % 1, u = x + 0.5 + (i * 1.7 % Math.max(1, w - 1)), v = y + 0.5 + (i * 1.3 % Math.max(1, h - 1));
      const a = pt(u, v, 0.6 + ph * 1.6);
      c.fillStyle = `rgba(255,255,255,${(0.35 * (1 - ph)).toFixed(2)})`;
      c.beginPath();
      c.arc(a[0], a[1], (2 + ph * 4) * Z, 0, 7);
      c.fill();
    }
    if (k === "jet") for (let i = 0; i < 6; i++) {
      const a = pt(x + 0.5 + i % 3, y + 0.5 + (i >> 1) % 2, 0.44);
      c.strokeStyle = "rgba(255,255,255,0.8)";
      c.lineWidth = 1;
      c.beginPath();
      c.arc(a[0], a[1], (1 + (((t * 3 + i) % 2) + 2) % 2) * Z, 0, 7);
      c.stroke();
    }
    c.restore();
  };
  FAC_DRAW.fx_mural = (c, env, o, H5, d0) => {
    // 壁画: 雪をかぶった山・青い海・白い帆(架空の風景)。奥の壁(y=1 の北面)に描く
    const { x, w, pt } = d0, y = d0.y + 0.02, q = (u, z) => pt(x + u * w, y, z);
    const poly = (L3, col) => {
      c.fillStyle = col;
      c.beginPath();
      L3.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p));
      c.closePath();
      c.fill();
    };
    poly([q(0, 0.9), q(1, 0.9), q(1, 3), q(0, 3)], "#9fd0f0");
    poly([q(0, 0.9), q(1, 0.9), q(1, 1.4), q(0, 1.4)], "#2f7fc1");
    poly([q(0.15, 1.4), q(0.5, 2.75), q(0.85, 1.4)], "#5a7aa8");
    poly([q(0.4, 2.35), q(0.5, 2.75), q(0.6, 2.35), q(0.55, 2.4), q(0.5, 2.3), q(0.45, 2.4)], "#f6f8fb");
    poly([q(0.8, 1.15), q(0.83, 1.5), q(0.86, 1.15)], "#ffffff");
  };
  FAC_DRAW.fx_washisle = (c, env, o, H5, d0) => {
    const { x, y, w, box } = d0;
    box(c, d0.P, x, y + 0.35, x + w, y + 0.65, 0, 0.8, "#d8dee2");
    box(c, d0.P, x, y + 0.42, x + w, y + 0.58, 0.8, 1.6, "#cfe6f2");
    for (let i = 0; i < w; i++) box(c, d0.P, x + i + 0.45, y + 0.3, x + i + 0.55, y + 0.7, 0.85, 1.0, "#9aa3ad");
  };
  // ガラスの仕切り(浴室と脱衣所のあいだ): 薄い枠と半透明のガラス
  FXH.fx_glasswall = 2.4;
  FAC_DRAW.fx_glasswall = (c, env, o, H5, d0) => {
    const { x, y, w, box, pt } = d0, v = y + 0.5;
    box(c, d0.P, x, v - 0.05, x + w, v + 0.05, 0, 0.25, "#b8c2cc");
    box(c, d0.P, x, v - 0.05, x + w, v + 0.05, 2.3, 2.45, "#b8c2cc");
    for (let i = 0; i <= w; i += 2) box(c, d0.P, x + i - 0.04, v - 0.05, x + i + 0.04, v + 0.05, 0, 2.45, "#9aa5b0");
    c.fillStyle = "rgba(205,230,245,0.28)";
    c.beginPath();
    c.moveTo(...pt(x, v, 0.25));
    c.lineTo(...pt(x + w, v, 0.25));
    c.lineTo(...pt(x + w, v, 2.3));
    c.lineTo(...pt(x, v, 2.3));
    c.closePath();
    c.fill();
  };
  FXH.fx_glassdoor = 2.4;
  FAC_DRAW.fx_glassdoor = (c, env, o, H5, d0) => {
    const { x, y, w, box } = d0, v = y + 0.5;
    box(c, d0.P, x, v - 0.05, x + w, v + 0.05, 2.3, 2.45, "#9aa5b0");
    box(c, d0.P, x, v - 0.05, x + 0.08, v + 0.05, 0, 2.45, "#9aa5b0");
    box(c, d0.P, x + w - 0.08, v - 0.05, x + w, v + 0.05, 0, 2.45, "#9aa5b0");
  };
  FAC_DRAW.fx_scale = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    box(c, d0.P, x + 0.25, y + 0.3, x + 0.75, y + 0.8, 0, 0.12, "#e8e8e8");
    box(c, d0.P, x + 0.4, y + 0.3, x + 0.6, y + 0.4, 0.12, 1.1, "#c9ccd2");
    box(c, d0.P, x + 0.3, y + 0.28, x + 0.7, y + 0.42, 1.1, 1.45, "#f4f4f4");
  };
  FAC_DRAW.fx_stove = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    box(c, d0.P, x + 0.2, y + 0.2, x + 0.8, y + 0.8, 0, 0.9, "#5a5f68");
    box(c, d0.P, x + 0.25, y + 0.25, x + 0.75, y + 0.75, 0.9, 1.1, "#8a7a6a");
  };
  // 浴室側の人: バスタオルを巻いた姿・湯船では頭にタオル(isoint.js の人物の描画から呼ぶ)
  function bathTowel(c, I2, x, y, X, Y2, Z, inTub) {
    if (!I2 || !I2.bathFloor || y >= I2.dressY) return;
    c.save();
    c.fillStyle = "#f7f7f2";
    c.strokeStyle = "rgba(120,140,160,0.6)";
    c.lineWidth = Math.max(1, Z * 0.3);
    {
      c.beginPath();
      c.roundRect ? c.roundRect(X - 4.2 * Z, Y2 - 9.2 * Z, 8.4 * Z, 6.6 * Z, 1.8 * Z) : c.rect(X - 4.2 * Z, Y2 - 9.2 * Z, 8.4 * Z, 6.6 * Z);
      c.fill();
      c.stroke();
      c.fillStyle = "#8fc1e3";
      c.fillRect(X - 4.2 * Z, Y2 - 4.4 * Z, 8.4 * Z, 0.8 * Z);
    }
    c.fillStyle = "#f7f7f2";
    c.beginPath();
    c.ellipse(X, Y2 - 17.6 * Z, 3.2 * Z, 1.1 * Z, 0, 0, 7);
    c.fill();
    c.restore();
  }
