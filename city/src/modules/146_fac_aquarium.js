  // src/fac_aquarium.js — 水族館: 二層吹き抜けの大水槽(泳ぐ魚)・クラゲ・サンゴ礁・深海・タッチプール・ペンギン・イルカショー
  FAC_RANGE.aquarium = () => ({ lo: 0, hi: 2, nf: 3 });
  FAC_LABEL.aquarium = (b, lv) => ["1F エントランス・黒潮大水槽・タッチプール", "2F 大水槽上層・クラゲ・サンゴ礁・深海", "屋上 イルカスタジアム・ペンギンビーチ"][lv] || "";
  FAC_BUILD.aquarium = (b, floor, g) => {
    if (floor === 0) return aqF1(b, g);
    if (floor === 1) return aqF2(b, g);
    return aqRoof(b, g);
  };
  function aqF1(b, g) {
    const W2 = 44, H4 = 26;
    const P = plan(W2, H4, "floor_dark", "leisure");
    P.lv = 0;
    const dx = 22;
    P.door(dx);
    P.fill(dx - 6, H4 - 6, dx + 6, H4 - 2, "floor_marble");
    P.wide("ticketbooth", dx - 7, H4 - 6, 3, 1, "fx_aqticket", "チケット売り場(入館料)");
    P.add("gate", dx - 1, H4 - 8, null, "入館ゲート", false);
    P.add("gate", dx + 1, H4 - 8, null, "入館ゲート", false);
    P.sign(dx, H4 - 9, "AQUARIUM かもめ水族館");
    P.staffSpots.push({ x: dx - 6, y: H4 - 7, role: "ticket" }, { x: dx + 2, y: H4 - 9, role: "guide" });
    // 黒潮大水槽(二層吹き抜け)
    P.wide("fx_tank", 4, 1, 26, 8, "fx_aqtank", "黒潮大水槽(ジンベエザメ・マイワシの群れ・エイ)", { kind: "big", z1: 4.2 });
    for (let x = 6; x < 29; x += 4) {
      P.add("bench", x, 11, "fx_aqwatch", "大水槽前のベンチ", false);
      P.seatSpots.push({ x, y: 11 });
    }
    P.sign(16, 10, "黒潮大水槽 KUROSHIO");
    // 東: タッチプール・ミュージアムショップ
    P.fill(32, 1, W2 - 1, 9, "floor_marble");
    P.wide("fx_touchpool", 32, 3, 6, 3, "fx_aqtouch", "タッチプール(ヒトデ・ナマコに触れる)");
    P.sign(36, 7, "タッチプール");
    P.vwall(31, 1, 14, [11, 12], "展示室の壁");
    P.wide("showcase", 34, 11, 4, 1, "fx_aqshop", "ミュージアムショップ(ぬいぐるみ・お菓子)");
    P.add("shelf", 39, 11, "fx_aqshop", "ショップの棚(ぬいぐるみ)");
    P.add("register", 41, 11, "fx_aqshop", "ショップのレジ");
    P.staffSpots.push({ x: 41, y: 10, role: "shop" }, { x: 35, y: 2, role: "keeper" });
    // 西: 小水槽の回廊
    for (let y = 13; y <= 19; y += 3) {
      P.wide("fx_tank", 1, y, 3, 2, "fx_aqtank", ["瀬戸内の魚たち", "川と湖の生き物", "熱帯の小さな魚"][(y - 13) / 3], { kind: (y - 13) / 3 === 2 ? "tropic" : "small", z1: 2 });
    }
    P.lifts(W2 - 5, 1, 1, 0, 2, "エレベーター");
    P.stair(W2 - 2, 1, 1, "2Fへ(エスカレーター・階段)");
    P.add("board", 10, 15, "fx_aqinfo", "館内マップ・イルカショーの時間", true);
    P.add("toilet", W2 - 2, H4 - 3, "toilet", "トイレ");
    P.add("aed", 1, H4 - 3, null, "AED");
    P.add("vending", 4, H4 - 3, null, "自販機");
    return P.done({ floors: 3, floor: 0, lv: 0, lo: 0, hi: 2, wallH: 3.6, label: FAC_LABEL.aquarium(b, 0) });
  }
  function aqF2(b, g) {
    const W2 = 44, H4 = 24;
    const P = plan(W2, H4, "floor_dark", "leisure");
    P.lv = 1;
    // 大水槽の上層(見下ろし)
    P.wide("fx_tank", 4, 1, 26, 5, "fx_aqtank", "黒潮大水槽(上からのぞく・水面)", { kind: "big", z1: 1.4, open: true });
    P.add("handrail", 4, 6, null, "手すり", true, { w: 26, h: 1 });
    // クラゲ
    P.vwall(12, 9, 20, [14, 15], "展示室の壁");
    P.sign(5, 9, "クラゲの回廊");
    for (let i = 0; i < 5; i++) P.wide("fx_jelly", 2 + i % 3 * 3, 10 + (i / 3 | 0) * 5, 2, 2, "fx_aqtank", ["ミズクラゲ", "アカクラゲ", "タコクラゲ", "カミクラゲ", "ブルージェリー"][i], { kind: "jelly", z1: 2.6 });
    // サンゴ礁
    P.wide("fx_tank", 14, 9, 10, 3, "fx_aqtank", "サンゴ礁の海(クマノミ・チョウチョウウオ)", { kind: "tropic", z1: 2.4 });
    P.sign(18, 13, "サンゴ礁");
    // 深海
    P.vwall(26, 9, 20, [14, 15], "展示室の壁");
    P.fill(27, 9, 40, 20, "floor_dark");
    P.wide("fx_tank", 28, 9, 6, 3, "fx_aqtank", "深海の生き物(タカアシガニ・ダイオウグソクムシ)", { kind: "deep", z1: 2.2 });
    P.sign(30, 13, "深海ゾーン");
    // カフェ
    P.fill(27, 16, W2 - 1, H4 - 2, "floor_wood");
    P.wide("counter", 36, 16, 4, 1, "fx_aqcafe", "オーシャンカフェ(ソフトクリーム・カレー)");
    for (const [x, y] of [[29, 18], [32, 18], [29, 21], [32, 21]]) {
      P.add("table", x, y, "fx_aqcafe", "カフェの席", true);
      P.seatSpots.push({ x: x + 1, y });
    }
    P.staffSpots.push({ x: 37, y: 15, role: "cafe" }, { x: 18, y: 15, role: "guide" });
    for (let x = 14; x < 24; x += 3) P.add("bench", x, 16, "fx_aqwatch", "ベンチ", false);
    P.lifts(W2 - 6, 1, 1, 0, 2, "エレベーター");
    P.stair(W2 - 3, 1, 2, "屋上へ(イルカスタジアム)");
    P.stair(W2 - 3, 4, 0, "1Fへ");
    return P.done({ floors: 3, floor: 1, lv: 1, lo: 0, hi: 2, wallH: 3.2, noDoor: true, label: FAC_LABEL.aquarium(b, 1) });
  }
  function aqRoof(b, g) {
    const W2 = 44, H4 = 28;
    const P = plan(W2, H4, "floor_paving", "leisure");
    P.lv = 2;
    // イルカスタジアム: プール+観客席
    P.fill(2, 1, 26, 9, "pool");
    P.wide("fx_dolphin", 2, 1, 25, 9, "fx_aqshow", "イルカショーのプール", {});
    P.wide("stand", 2, 11, 25, 6, "fx_aqshow", "スタジアム観客席(イルカショー)", { sec: 1 });
    for (let x = 3; x < 26; x += 2) P.seatSpots.push({ x, y: 13 }, { x, y: 15 });
    P.sign(13, 18, "DOLPHIN STADIUM");
    P.staffSpots.push({ x: 14, y: 10, role: "trainer" }, { x: 8, y: 10, role: "trainer" });
    // ペンギンビーチ
    P.fill(29, 5, W2 - 2, 16, "floor_dirt");
    P.fill(30, 10, W2 - 3, 15, "pool");
    P.wide("fx_penguin", 29, 5, W2 - 31, 11, "fx_aqpenguin", "ペンギンビーチ(ケープペンギン)", {});
    P.add("handrail", 29, 17, null, "手すり", true, { w: W2 - 31, h: 1 });
    P.sign(35, 18, "ペンギンビーチ");
    P.lifts(W2 - 8, 1, 1, 0, 2, "エレベーター");
    P.stair(W2 - 3, 1, 1, "2Fへ");
    P.add("vending", 2, H4 - 3, null, "自販機");
    P.add("kiosk", 6, H4 - 4, "fx_aqcafe", "売店(ドリンク・ポップコーン)");
    return P.done({ floors: 3, floor: 2, lv: 2, lo: 0, hi: 2, wallH: 1.1, roof: true, noDoor: true, label: FAC_LABEL.aquarium(b, 2) });
  }
  // ---- 入館券(その日のうちは何度でも)
  var aqToday = (g) => g.S.aqDay === g.S.M * 40 + g.date().d && g.S.aqB === g.S.loc.b;
  function aqNeed(g, push) {
    if (aqToday(g)) return true;
    push("none", "入館券が必要です(1階のチケット売り場)", { disabled: true });
    return false;
  }
  FAC_ACTS.fx_aqticket = (g, o, b, push) => {
    if (aqToday(g)) return push("none", "本日の入館券をお持ちです(再入館できます)", { disabled: true });
    const a = g.age(), pr = yenf(g, a < 6 ? 0 : a < 13 ? 1100 : a < 18 ? 1700 : BTYPES.aquarium.price);
    push("aqbuy:" + pr, `入館券を買う(¥${pr.toLocaleString()}${a < 18 ? "・こども料金" : ""})`, { disabled: g.hero.money < pr });
    push("aqinfo", "本日のプログラムを見る");
  };
  FAC_RUN.aqbuy = (g, arg, tg, r) => {
    const pr = +arg || 0;
    if (pr) g.pay(pr, "水族館の入館料");
    g.S.aqDay = g.S.M * 40 + g.date().d;
    g.S.aqB = g.S.loc.b;
    g.advance(3);
    r.msg = "入館券を買いました。ゲートの先に黒潮大水槽が広がっています。";
  };
  FAC_ACTS.fx_aqinfo = (g, o, b, push) => push("aqinfo", "館内マップ・ショーの時間を見る");
  FAC_RUN.aqinfo = (g, arg, tg, r) => {
    r.msg = "イルカショー 11:00 / 13:30 / 15:30(屋上スタジアム)。ペンギンのお散歩 14:30。大水槽の給餌解説 12:00。1F 大水槽・タッチプール / 2F クラゲ・サンゴ礁・深海・カフェ / 屋上 イルカ・ペンギン";
  };
  var AQ_TXT = {
    big: ["ジンベエザメがゆったりと目の前を横切りました。", "数千匹のマイワシの群れが銀色の渦をつくっています。", "マダラトビエイが翼を広げて舞うように泳いでいます。"],
    small: ["岩陰からカサゴがじっとこちらを見ています。", "メバルの群れが静かに漂っています。"],
    tropic: ["イソギンチャクの間からクマノミが顔を出しました。", "青いナンヨウハギがサンゴの間をすり抜けていきます。"],
    jelly: ["ライトに照らされたクラゲがふわふわと漂っています。見ているだけで心がほどけます。"],
    deep: ["暗い水槽の奥で、タカアシガニが長い脚をゆっくり動かしています。"]
  };
  FAC_ACTS.fx_aqtank = (g, o, b, push) => {
    if (!aqNeed(g, push)) return;
    push("aqlook:" + (o.kind || "big"), "じっくり観察する(15分)");
    if (o.kind === "big") push("aqfeed", "給餌の解説を聞く(12:00ごろ)", { disabled: Math.abs(g.S.min - 720) > 30 });
  };
  FAC_RUN.aqlook = (g, arg, tg, r) => {
    g.advance(15);
    const L3 = AQ_TXT[arg] || AQ_TXT.big;
    r.msg = L3[uh(g.absMin() | 0, 9) % L3.length] + g.chg({ mood: 4 });
    g.S.aqSeen = (g.S.aqSeen || 0) + 1;
  };
  FAC_RUN.aqfeed = (g, arg, tg, r) => {
    g.advance(20);
    r.msg = "ダイバーが水槽に入り、エサをまくと魚たちが一斉に集まりました。飼育員さんの解説で、ジンベエザメは1日に約30kgのエサを食べると知りました。" + g.chg({ mood: 6 });
    g.hero.study = Math.min(100, (g.hero.study || 0) + 1);
  };
  FAC_ACTS.fx_aqwatch = (g, o, b, push) => push("aqlook:big", "ベンチに座って大水槽を眺める(15分)");
  FAC_ACTS.fx_aqtouch = (g, o, b, push) => {
    if (!aqNeed(g, push)) return;
    push("aqtouch", "ヒトデやナマコにそっと触れてみる(10分)");
  };
  FAC_RUN.aqtouch = (g, arg, tg, r) => {
    g.advance(10);
    r.msg = "ヒトデはざらざら、ナマコはぷにぷに。係員さんが優しく教えてくれました。" + g.chg({ mood: 5 });
  };
  FAC_ACTS.fx_aqshop = (g, o, b, push) => {
    push("aqshop:p", `ジンベエザメのぬいぐるみ(¥${yenf(g, 2400)})`, { disabled: g.hero.money < yenf(g, 2400) });
    push("aqshop:c", `おみやげのクッキー(¥${yenf(g, 900)})`, { disabled: g.hero.money < yenf(g, 900) });
  };
  FAC_RUN.aqshop = (g, arg, tg, r) => {
    if (arg === "p") {
      g.pay(yenf(g, 2400), "水族館のおみやげ");
      g.hero.items = g.hero.items || {};
      r.msg = "ふかふかのジンベエザメのぬいぐるみを買いました。" + g.chg({ mood: 4 });
    } else {
      g.pay(yenf(g, 900), "水族館のおみやげ");
      g.hero.inv.food += 1;
      r.msg = "イルカの形のクッキーを買いました(食料+1)。";
    }
  };
  FAC_ACTS.fx_aqcafe = (g, o, b, push) => {
    push("aqcafe:s", `ソフトクリーム(¥${yenf(g, 400)})`, { disabled: g.hero.money < yenf(g, 400) });
    push("aqcafe:c", `ブルーカレー(¥${yenf(g, 1100)})`, { disabled: g.hero.money < yenf(g, 1100) });
  };
  FAC_RUN.aqcafe = (g, arg, tg, r) => {
    const s = arg === "s";
    g.pay(yenf(g, s ? 400 : 1100), "水族館のカフェ");
    g.advance(s ? 10 : 30);
    r.msg = (s ? "海を見ながら塩ソフトクリーム。" : "海の色をしたブルーカレーを食べました。") + g.chg({ hunger: s ? 8 : 40, mood: 3 });
  };
  FAC_ACTS.fx_aqpenguin = (g, o, b, push) => {
    if (!aqNeed(g, push)) return;
    push("aqlook:penguin", "ペンギンを眺める(15分)");
  };
  AQ_TXT.penguin = ["よちよち歩いたペンギンが、水に飛び込んだ瞬間に弾丸のように泳ぎだしました。", "2羽のペンギンが並んで毛づくろいをしています。"];
  FAC_ACTS.fx_aqshow = (g, o, b, push) => {
    if (!aqNeed(g, push)) return;
    const m = g.S.min, shows = [660, 810, 930];
    const next = shows.find((s) => s + 20 >= m);
    push("aqshow", next != null && next <= m + 30 ? "イルカショーを観る(約20分)" : next != null ? `イルカショーを観る(次回 ${Math.floor(next / 60)}:${String(next % 60).padStart(2, "0")}まで待つ)` : "本日のショーは終了しました", { disabled: next == null });
  };
  FAC_RUN.aqshow = (g, arg, tg, r) => {
    const m = g.S.min, shows = [660, 810, 930];
    const next = shows.find((s) => s + 20 >= m);
    if (next > m) g.advance(next - m);
    g.advance(20);
    r.msg = "大ジャンプの水しぶきが観客席まで届きました。拍手が鳴りやみません。" + g.chg({ mood: 12 });
    r.ui = "fx_scene";
    r.scene = dolphinScene();
    g.log("leisure", "水族館でイルカショーを観た");
  };
  // ---- イルカショーの場面
  function dolphinScene() {
    return {
      title: "イルカショー",
      dur: 16,
      lines: [[0, "トレーナーの合図で、3頭のイルカが泳ぎだしました"], [4, "大ジャンプ!"], [8, "ボールにタッチ!"], [12, "最前列に水しぶき!会場が笑いに包まれます"]],
      draw(c, t, W2, H4) {
        const sky = c.createLinearGradient(0, 0, 0, H4);
        sky.addColorStop(0, "#7fc8f0");
        sky.addColorStop(0.55, "#d6f0fb");
        sky.addColorStop(0.56, "#2f8fc4");
        sky.addColorStop(1, "#155c8c");
        c.fillStyle = sky;
        c.fillRect(0, 0, W2, H4);
        const wl = H4 * 0.56;
        // 観客席(手前)
        c.fillStyle = "#3a4a63";
        c.fillRect(0, H4 * 0.86, W2, H4 * 0.14);
        for (let i = 0; i < 40; i++) {
          const x = (i + 0.5) / 40 * W2, y = H4 * 0.9 + (i % 2) * H4 * 0.04;
          c.fillStyle = ["#f2c39b", "#e8b48a", "#d9a074"][i % 3];
          c.beginPath();
          c.arc(x, y - Math.abs(Math.sin(t * 3 + i)) * H4 * 0.006, H4 * 0.018, 0, 7);
          c.fill();
        }
        // 波
        c.strokeStyle = "rgba(255,255,255,0.5)";
        c.lineWidth = 2;
        for (let k = 0; k < 6; k++) {
          c.beginPath();
          for (let x = 0; x <= W2; x += 10) c.lineTo(x, wl + k * H4 * 0.05 + Math.sin(x / 40 + t * 2 + k) * 3);
          c.stroke();
        }
        // ボール(吊り)
        const bx = W2 * 0.62, by = H4 * 0.18;
        c.strokeStyle = "#555";
        c.beginPath();
        c.moveTo(bx, 0);
        c.lineTo(bx, by);
        c.stroke();
        c.fillStyle = "#ff5a5a";
        c.beginPath();
        c.arc(bx, by + H4 * 0.03, H4 * 0.03, 0, 7);
        c.fill();
        // イルカ(放物線ジャンプ)
        for (let i = 0; i < 3; i++) {
          const ph = (t * 0.45 + i * 0.33) % 1;
          const x = W2 * (0.15 + ph * 0.7);
          const hgt = t > 7 && t < 11 && i === 1 ? H4 * 0.42 : H4 * (0.22 + i * 0.05);
          const y = wl - Math.sin(ph * Math.PI) * hgt;
          const ang = Math.atan2(-Math.cos(ph * Math.PI) * hgt * Math.PI, W2 * 0.7);
          c.save();
          c.translate(x, y);
          c.rotate(ang);
          c.fillStyle = "#6f8fa8";
          c.beginPath();
          c.ellipse(0, 0, H4 * 0.08, H4 * 0.025, 0, 0, 7);
          c.fill();
          c.fillStyle = "#e8eef2";
          c.beginPath();
          c.ellipse(H4 * 0.01, H4 * 0.01, H4 * 0.05, H4 * 0.012, 0, 0, 7);
          c.fill();
          c.fillStyle = "#6f8fa8";
          c.beginPath();
          c.moveTo(-H4 * 0.075, 0);
          c.lineTo(-H4 * 0.11, -H4 * 0.03);
          c.lineTo(-H4 * 0.11, H4 * 0.03);
          c.fill();
          c.beginPath();
          c.moveTo(0, -H4 * 0.02);
          c.lineTo(-H4 * 0.02, -H4 * 0.05);
          c.lineTo(H4 * 0.02, -H4 * 0.02);
          c.fill();
          c.restore();
          if (ph < 0.08 || ph > 0.92) {
            c.fillStyle = "rgba(255,255,255,0.8)";
            for (let k = 0; k < 6; k++) {
              c.beginPath();
              c.arc(x + Math.cos(k) * H4 * 0.04, wl - Math.abs(Math.sin(k * 3 + t * 9)) * H4 * 0.05, H4 * 0.01, 0, 7);
              c.fill();
            }
          }
        }
        // トレーナー
        c.fillStyle = "#1e3a6e";
        c.fillRect(W2 * 0.08, wl - H4 * 0.12, H4 * 0.03, H4 * 0.1);
        c.fillStyle = "#f2c39b";
        c.beginPath();
        c.arc(W2 * 0.08 + H4 * 0.015, wl - H4 * 0.14, H4 * 0.02, 0, 7);
        c.fill();
        if (t > 11.5 && t < 14) {
          c.fillStyle = "rgba(255,255,255,0.75)";
          for (let k = 0; k < 30; k++) {
            c.beginPath();
            c.arc(W2 * (0.2 + k * 0.02), H4 * 0.86 - Math.abs(Math.sin(k * 1.7 + t * 4)) * H4 * 0.25, H4 * 0.012, 0, 7);
            c.fill();
          }
        }
      }
    };
  }
  // ---- 描画: 水槽(泳ぐ魚)・クラゲ・タッチプール・イルカプール・ペンギン
  FXH.fx_tank = 3;
  FXH.fx_jelly = 2.6;
  FXH.fx_touchpool = 0.8;
  FXH.fx_dolphin = 0.05;
  FXH.fx_penguin = 0.05;
  var FISH_COL = { big: ["#b9c6cf", "#8fa3b3", "#d7dee3"], small: ["#9a7b5b", "#c49a6c", "#7d8e6a"], tropic: ["#ff8a2a", "#ffd23a", "#2f7fe0", "#f05a8c"], deep: ["#c4473a", "#a85a48", "#e2d5c3"], jelly: ["#ffffff"] };
  FAC_DRAW.fx_tank = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    const z1 = o.z1 || 3, kind = o.kind || "big";
    // 底砂・岩・サンゴ
    poly(c, [pt(x, y, 0.02), pt(x + w, y, 0.02), pt(x + w, y + h, 0.02), pt(x, y + h, 0.02)], kind === "deep" ? "#2c2a33" : "#d9c79a");
    const hs = (k) => (x * 31 + y * 17 + k * 97) % 1e3 / 1e3;
    for (let k = 0; k < Math.max(3, w * h / 6); k++) {
      const u = x + 0.3 + hs(k) * (w - 0.6), v = y + 0.3 + hs(k + 50) * (h - 0.6);
      const col = kind === "tropic" ? ["#ff7f6e", "#f7b2c8", "#ffd27a", "#8fd18a"][k % 4] : kind === "deep" ? "#3b3946" : "#7c7a70";
      d.box(c, env.P, u - 0.25, v - 0.2, u + 0.25, v + 0.2, 0, 0.25 + hs(k + 9) * 0.5, col);
    }
    // 魚(水槽の大きさに比例)
    const cols = FISH_COL[kind] || FISH_COL.big;
    const n = Math.min(70, Math.round(w * h * (kind === "big" ? 0.45 : 1.2)));
    const fish = [];
    for (let i = 0; i < n; i++) {
      const sp = 0.25 + hs(i + 3) * 0.6, ph = hs(i + 7) * 6.28;
      const lane = hs(i + 11);
      const u = x + 0.4 + ((hs(i) * w + t * sp * (i % 2 ? 1 : -1)) % (w - 0.8) + (w - 0.8)) % (w - 0.8);
      const v = y + 0.4 + lane * (h - 0.8) + Math.sin(t * 0.7 + ph) * 0.15;
      const z = 0.4 + hs(i + 21) * (z1 - 0.8) + Math.sin(t * 1.1 + ph) * 0.12;
      fish.push({ u, v, z, dir: i % 2 ? 1 : -1, col: cols[i % cols.length], s: kind === "big" && i < 2 ? 3.2 : kind === "big" && i < 5 ? 1.8 : 1 });
    }
    // 群れ(マイワシ)
    if (kind === "big") {
      const cx = x + w / 2 + Math.sin(t * 0.25) * (w * 0.3), cv2 = y + h / 2 + Math.cos(t * 0.31) * h * 0.2, cz = z1 * 0.55 + Math.sin(t * 0.4) * 0.6;
      for (let i = 0; i < 60; i++) {
        const a = i * 2.39 + t * 0.9;
        fish.push({ u: cx + Math.cos(a) * (0.6 + i % 7 * 0.18), v: cv2 + Math.sin(a * 0.7) * 0.5, z: cz + Math.sin(a) * 0.5, dir: 1, col: "#dfe7ec", s: 0.45 });
      }
    }
    fish.sort((a, b) => a.u + a.v - (b.u + b.v));
    for (const f of fish) {
      const p = pt(f.u, f.v, f.z);
      const L3 = 2.2 * Z * f.s, H6 = 0.8 * Z * f.s;
      c.fillStyle = f.col;
      c.beginPath();
      c.ellipse(p[0], p[1], L3, H6, 0, 0, 7);
      c.fill();
      c.beginPath();
      c.moveTo(p[0] - f.dir * L3 * 0.8, p[1]);
      c.lineTo(p[0] - f.dir * L3 * 1.5, p[1] - H6);
      c.lineTo(p[0] - f.dir * L3 * 1.5, p[1] + H6);
      c.fill();
      if (f.s > 2) {
        c.fillStyle = "rgba(255,255,255,0.7)";
        for (let k = 0; k < 6; k++) c.fillRect(p[0] - L3 * 0.6 + k * L3 * 0.2, p[1] - H6 * 0.4 + (k % 2) * H6 * 0.4, Z * 0.5, Z * 0.5);
      }
    }
    // 水とガラス(手前の面は半透明)
    c.save();
    c.globalAlpha = o.open ? 0.28 : 0.22;
    poly(c, [pt(x, y + h, 0), pt(x + w, y + h, 0), pt(x + w, y + h, z1), pt(x, y + h, z1)], "#3aa6d9");
    poly(c, [pt(x + w, y, 0), pt(x + w, y + h, 0), pt(x + w, y + h, z1), pt(x + w, y, z1)], "#2b8cc0");
    c.globalAlpha = 0.18;
    poly(c, [pt(x, y, z1), pt(x + w, y, z1), pt(x + w, y + h, z1), pt(x, y + h, z1)], "#7fd3f5");
    c.restore();
    // 光の筋
    c.save();
    c.globalAlpha = 0.12;
    for (let k = 0; k < w; k += 2) {
      const sh = Math.sin(t * 0.8 + k) * 0.3;
      poly(c, [pt(x + k + sh, y + h, z1), pt(x + k + 0.4 + sh, y + h, z1), pt(x + k + 0.9, y + h, 0), pt(x + k + 0.5, y + h, 0)], "#ffffff");
    }
    c.restore();
    // 枠
    c.strokeStyle = "#1d2633";
    c.lineWidth = Math.max(1, Z * 0.5);
    c.beginPath();
    for (const [a, b] of [[[x, y + h, z1], [x + w, y + h, z1]], [[x + w, y, z1], [x + w, y + h, z1]], [[x + w, y + h, 0], [x + w, y + h, z1]], [[x, y + h, 0], [x, y + h, z1]], [[x, y + h, 0], [x + w, y + h, 0]], [[x + w, y, 0], [x + w, y + h, 0]]]) {
      const p0 = pt(...a), p1 = pt(...b);
      c.moveTo(p0[0], p0[1]);
      c.lineTo(p1[0], p1[1]);
    }
    c.stroke();
  };
  FAC_DRAW.fx_jelly = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    const cx = x + w / 2, cy = y + h / 2;
    // 円筒水槽(光る)
    c.save();
    const top = pt(cx, cy, 2.6), bot = pt(cx, cy, 0);
    const rx = w * 0.45 * 8 * env.P.Z * 1.2, ry = rx * 0.5;
    const gr = c.createLinearGradient(0, top[1], 0, bot[1]);
    const hue = (x * 40 + y * 20) % 360;
    gr.addColorStop(0, `hsla(${hue},70%,45%,0.85)`);
    gr.addColorStop(1, `hsla(${hue + 40},70%,20%,0.9)`);
    c.fillStyle = gr;
    c.fillRect(top[0] - rx, top[1], rx * 2, bot[1] - top[1]);
    c.beginPath();
    c.ellipse(bot[0], bot[1], rx, ry, 0, 0, 7);
    c.fill();
    c.fillStyle = `hsla(${hue},80%,70%,0.5)`;
    c.beginPath();
    c.ellipse(top[0], top[1], rx, ry, 0, 0, 7);
    c.fill();
    for (let i = 0; i < 7; i++) {
      const jx = top[0] + Math.sin(t * 0.4 + i * 2) * rx * 0.6, jy = top[1] + (bot[1] - top[1]) * (0.2 + (i * 0.13 + Math.sin(t * 0.3 + i) * 0.08) % 0.7);
      const pulse = 1 + Math.sin(t * 2.4 + i) * 0.15;
      c.fillStyle = "rgba(255,255,255,0.75)";
      c.beginPath();
      c.ellipse(jx, jy, 1.6 * Z * pulse, 1.1 * Z / pulse, 0, Math.PI, 0);
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.45)";
      c.lineWidth = Math.max(1, Z * 0.2);
      for (let k = -1; k <= 1; k++) {
        c.beginPath();
        c.moveTo(jx + k * Z, jy);
        c.quadraticCurveTo(jx + k * Z + Math.sin(t * 3 + k) * Z, jy + 2 * Z, jx + k * Z, jy + 4 * Z);
        c.stroke();
      }
    }
    c.restore();
    void poly;
  };
  FAC_DRAW.fx_touchpool = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly, box } = d;
    box(c, env.P, x, y, x + w, y + h, 0, 0.7, "#cfc6b4");
    poly(c, [pt(x + 0.2, y + 0.2, 0.71), pt(x + w - 0.2, y + 0.2, 0.71), pt(x + w - 0.2, y + h - 0.2, 0.71), pt(x + 0.2, y + h - 0.2, 0.71)], "#5fb7d8");
    for (let i = 0; i < 9; i++) {
      const p = pt(x + 0.5 + i * 37 % (w * 10) / 10, y + 0.5 + i * 53 % (h * 10 - 10) / 10, 0.72);
      c.fillStyle = i % 3 ? "#ff8a3a" : "#6a4a3a";
      c.beginPath();
      if (i % 3) for (let k = 0; k < 10; k++) {
        const a = k / 10 * 6.283 + t * 0.05, r = k % 2 ? 0.6 * Z : 1.6 * Z;
        c.lineTo(p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r * 0.5);
      }
      else c.ellipse(p[0], p[1], 1.6 * Z, 0.6 * Z, 0.3, 0, 7);
      c.fill();
    }
  };
  FAC_DRAW.fx_dolphin = (c, env, o, H5, d0) => {
    const d = { ...d0, Z: d0.Z * 2.2 };
    const { x, y, w, h, t, Z, pt } = d;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.18 + i * 0.33) % 1;
      const u = x + 1 + ph * (w - 2), v = y + 2 + i * 2.2;
      const jump = (t * 0.5 + i) % 6 < 1 ? Math.sin((t * 0.5 + i) % 6 * Math.PI) * 2.2 : 0;
      const p = pt(u, v, 0.1 + jump);
      c.fillStyle = jump ? "#7a98b0" : "rgba(80,110,135,0.75)";
      c.beginPath();
      c.ellipse(p[0], p[1], 4 * Z, 1.4 * Z, jump ? -0.4 : 0, 0, 7);
      c.fill();
      c.beginPath();
      c.moveTo(p[0], p[1] - 1.2 * Z);
      c.lineTo(p[0] - 1.2 * Z, p[1] - 2.8 * Z);
      c.lineTo(p[0] + 0.8 * Z, p[1] - 1 * Z);
      c.fill();
    }
  };
  FAC_DRAW.fx_penguin = (c, env, o, H5, d0) => {
    const d = { ...d0, Z: d0.Z * 2.4 };
    const { x, y, w, h, t, Z, pt } = d;
    const n = 12;
    for (let i = 0; i < n; i++) {
      const sw = i >= 8;
      const u = x + 1 + (i * 2.3 + (sw ? t * 0.6 : Math.sin(t * 0.3 + i) * 0.6)) % (w - 2), v = y + (sw ? 6 + i % 3 * 1.5 : 1 + i % 4 * 1.1);
      const p = pt(u, v, sw ? 0.05 : 0);
      const bob = sw ? 0 : Math.abs(Math.sin(t * 4 + i)) * 0.6 * Z;
      if (sw) {
        c.fillStyle = "rgba(30,30,40,0.8)";
        c.beginPath();
        c.ellipse(p[0], p[1], 1.8 * Z, 0.7 * Z, 0, 0, 7);
        c.fill();
        continue;
      }
      c.fillStyle = "#1d1f26";
      c.beginPath();
      c.ellipse(p[0], p[1] - 2.4 * Z - bob, 1.2 * Z, 2.2 * Z, Math.sin(t * 4 + i) * 0.12, 0, 7);
      c.fill();
      c.fillStyle = "#f4f4f0";
      c.beginPath();
      c.ellipse(p[0] + 0.3 * Z, p[1] - 2.2 * Z - bob, 0.7 * Z, 1.6 * Z, 0, 0, 7);
      c.fill();
      c.fillStyle = "#ffb03a";
      c.fillRect(p[0] + 0.8 * Z, p[1] - 4 * Z - bob, 0.8 * Z, 0.4 * Z);
    }
  };
