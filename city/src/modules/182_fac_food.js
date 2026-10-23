  // src/fac_food.js — 飲食店(ラーメン店・喫茶店/カフェ・居酒屋・食堂/ファミレス・海鮮食堂)の中の作り。
  // v11 ではどの店も「テーブル4つ+カウンター3席」の同じ作りだったのを、業種・年代(開店した年と今の年)・場所(駅前や中心街はチェーン風、
  // 農村や古い町は個人店)・階数(2階席)・店ごとの違い(左右・席の数)で作り分ける。注文は v11 と同じ操作(order)。
  // 厨房に料理人、ホールに店員、入口にレジ。席(seatSpots)は来店客が座る場所
  var FOOD_T = ["ramen", "cafe", "izakaya", "restaurant", "seafood"];
  var CHAIN_ZONE = /* @__PURE__ */ new Set(["downtown", "tower", "shotengai", "newtown", "campus", "civic"]);
  var foodOn = (b) => b && FOOD_T.includes(b.type) && b.campusOf == null && !b.tenants;
  var foodFloors = (b) => Math.max(1, Math.min(2, typeof storeys === "function" ? storeys(b) : b.floors || 1));
  FAC_RANGE.ramen = FAC_RANGE.cafe = FAC_RANGE.izakaya = FAC_RANGE.restaurant = FAC_RANGE.seafood = (b) => foodOn(b) ? { lo: 0, hi: foodFloors(b) - 1, nf: foodFloors(b) } : null;
  FAC_LABEL.ramen = FAC_LABEL.cafe = FAC_LABEL.izakaya = FAC_LABEL.restaurant = FAC_LABEL.seafood = (b, lv) => foodOn(b) ? lv === 0 ? "1F(店内)" : "2F(座席・座敷)" : null;
  // 開店した年と、今の年代(10年ごと)で作り直す
  FAC_KEY.ramen = FAC_KEY.cafe = FAC_KEY.izakaya = FAC_KEY.restaurant = FAC_KEY.seafood = (g, b) => `${b.openYear || 0}:${Math.floor(g.year() / 10)}`;
  FAC_BUILD.ramen = FAC_BUILD.cafe = FAC_BUILD.izakaya = FAC_BUILD.restaurant = FAC_BUILD.seafood = (b, floor, g) => foodOn(b) ? buildFood(b, floor, g) : null;
  function buildFood(b, floor, g) {
    const F = foodFloors(b), lv = Math.max(0, Math.min(F - 1, floor || 0)), y = g && g.year ? g.year() : 2e3, oy = b.openYear || 1990;
    const t = b.type, v = uh(b.idx, 3401), flip = v % 2 === 1, chain = CHAIN_ZONE.has(b.zone) && oy >= 1975;
    const W2 = Math.max(t === "restaurant" ? 14 : 12, Math.min(18, b.w * 3 + (v >> 3) % 3)), H4 = Math.max(10, Math.min(13, b.h * 3 + 2 + (v >> 5) % 2));
    const X = (x) => flip ? W2 - 1 - x : x;
    const XW = (x, w) => flip ? W2 - x - w : x;
    const old = oy < 1975;
    const tile = t === "izakaya" || t === "seafood" || t === "cafe" && old ? "floor_wood" : t === "ramen" ? "floor_tile" : "floor_wood";
    const P = plan(W2, H4, tile, "food");
    P.lv = lv;
    P.windows(3);
    const seat = (x, yy, lab = "席") => {
      const o = P.add("chair", x, yy, null, lab, false);
      if (o) P.seatSpots.push({ x, y: yy });
      return o;
    };
    // 4人掛けのテーブル(テーブル1マス+左右の椅子)
    const table4 = (x, yy, lab) => {
      if (!P.add("table", x, yy, "order", lab, true)) return 0;
      let n2 = 0;
      // 椅子は歩けるので、上下左右の空いたマスに置く(4人掛け)
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, 1], [0, -1]]) if (yy + dy > 2 && seat(x + dx, yy + dy)) n2++;
      return n2;
    };
    // ボックス席(ソファ+テーブル+ソファ。縦に3マス)
    const booth = (x, yy, lab) => {
      const x0 = flip ? x - 1 : x;
      if (!P.add("table", x0, yy + 1, "order", lab, true, { w: 2, h: 1 })) return 0;
      P.add("sofa", x0, yy, null, "ボックス席のソファ", false, { w: 2, h: 1 });
      P.add("sofa", x0, yy + 2, null, "ボックス席のソファ", false, { w: 2, h: 1 });
      P.seatSpots.push({ x: x0, y: yy }, { x: x0 + 1, y: yy }, { x: x0, y: yy + 2 }, { x: x0 + 1, y: yy + 2 });
      return 4;
    };
    if (lv === 0) {
      const dx = X([W2 >> 1, 3, W2 - 4][v % 3]);
      P.door(dx);
      P.reserve(dx, H4 - 4, dx, H4 - 2);
      if (F > 1) P.stair(X(W2 - 2), H4 - 3, 1, "2階席へ");
      // 厨房(奥): 流し・コンロ・冷蔵庫と料理人の立ち位置
      const kit = (y0, label) => {
        P.fill(1, 1, W2 - 2, y0, "floor_tile");
        P.add("sink", X(1), 1, null, "厨房(流し)", true);
        P.add("counter", X(2), 1, null, label, true);
        P.add("fridge", X(W2 - 2), 1, null, "業務用冷蔵庫", true);
        P.staffSpots.push({ x: X(3), y: 2, role: "cook" }, { x: X(5), y: 2, role: "cook" }, { x: X(7), y: 2, role: "cook" });
      };
      // レジ(入口の横)
      const reg = () => {
        const rx = dx + (dx < W2 >> 1 ? 2 : -2);
        P.add("register", rx, H4 - 3, null, y >= 1985 ? "レジ" : "お会計", true);
        P.staffSpots.push({ x: rx, y: H4 - 4, role: "register" });
      };
      if (t === "ramen") {
        kit(2, "寸胴鍋と麺ゆで機");
        // L字のカウンター(厨房に向かって)
        const cy = 4;
        for (let x = 2; x < W2 - 2; x++) {
          P.add("counter", x, cy - 1, "order", "カウンター(ラーメンを注文)", true);
          seat(x, cy, "カウンター席");
        }
        const tn = W2 >= 15 ? 3 : 2;
        for (let k = 0; k < tn; k++) table4(X(3 + k * 4), H4 - 5, "テーブル席");
        if (y >= 1980) P.add("vending", X(1), H4 - 3, "order", "券売機(食券を買う)", true);
        P.add("watersrv", X(W2 - 2), cy + 2, null, "お冷(セルフ)", true);
        P.staffSpots.push({ x: X(W2 >> 1), y: 2, role: "cook" });
        P.sign(X(W2 >> 1), 3, old ? "中華そば" : "ラーメン");
      } else if (t === "cafe") {
        if (old || !chain) {
          // 喫茶店: カウンター(サイフォン)とボックス席
          kit(1, "サイフォンとコーヒーミル");
          for (let x = 2; x < W2 - 5; x++) {
            P.add("counter", x, 3, "order", "カウンター(コーヒーを注文)", true);
            seat(x, 4, "カウンター席");
          }
          const nb = Math.floor((W2 - 3) / 3);
          for (let k = 0; k < nb; k++) booth(X(2 + k * 3), 6, "ボックス席");
          P.add("bookcase", X(W2 - 2), 4, "read", "新聞・週刊誌・マンガ", true);
          if (y >= 1955 && y < 2e3) P.add("tv", X(W2 - 2), 6, "tv", "店のテレビ", true);
          P.staffSpots.push({ x: X(W2 - 4), y: 2, role: "master" });
        } else {
          // チェーンのカフェ: 注文カウンター・ケーキのショーケース・小さなテーブル・壁ぎわのカウンター席
          kit(1, "エスプレッソマシン");
          for (let x = 2; x < 7; x++) P.add("counter", X(x), 3, "order", "注文カウンター(レジ)", true);
          P.add("showcase", X(8), 3, null, "ケーキ・サンドイッチのショーケース", true);
          for (let k = 0; k * 3 + 2 < W2 - 2; k++) {
            if (P.add("table", X(2 + k * 3), 6, "order", "2人席", true)) {
              seat(X(2 + k * 3), 5);
              seat(X(2 + k * 3), 7);
            }
          }
          for (let x = 2; x < W2 - 2; x++) {
            P.add("counter", x, H4 - 5, null, y >= 2005 ? "窓ぎわのカウンター(コンセントあり)" : "窓ぎわのカウンター", true);
            seat(x, H4 - 4, "カウンター席");
          }
          P.staffSpots.push({ x: X(4), y: 2, role: "barista" });
        }
      } else if (t === "izakaya") {
        kit(1, "焼き台・揚げ場");
        for (let x = 2; x < W2 - 6; x++) {
          P.add("counter", X(x), 3, "order", "カウンター(料理と飲み物を注文)", true);
          seat(X(x), 4, "カウンター席");
        }
        P.add("counter", X(W2 - 5), 3, null, y >= 1975 ? "生ビールのサーバー" : "酒の一升瓶の棚", true);
        // 小上がりの座敷(畳・座卓・座布団)
        const zx = XW(W2 - 6, 5);
        P.fill(zx, 5, zx + 4, H4 - 4, "floor_tatami");
        for (let k = 0; k < 2; k++) {
          const tx = zx + 1 + k * 2;
          if (P.add("table", tx, 6, "order", "座敷の座卓", true)) {
            P.add("zabuton", tx, 7, null, "座布団", false);
            P.add("zabuton", tx, 5, null, "座布団", false);
            P.seatSpots.push({ x: tx, y: 7 }, { x: tx, y: 5 });
          }
        }
        P.sign(zx + 2, H4 - 4, "小上がり(座敷)");
        for (let k = 0; k < 2; k++) table4(X(2 + k * 4), 7, "テーブル席");
        for (let x = 2; x < W2 - 2; x += 4) P.add("lamp", x, 1, null, "提灯", false, { deco: true });
        P.add("board", X(1), 5, "order", "今日のおすすめ(黒板)", true);
      } else if (t === "seafood") {
        kit(1, "まな板と焼き場");
        P.add("fishtank", X(1), 3, null, "生け簀(今朝の魚)", true, { w: 2, h: 1 });
        for (let x = 4; x < W2 - 2; x++) {
          P.add("counter", X(x), 3, "order", "カウンター(海鮮丼・定食を注文)", true);
          seat(X(x), 4, "カウンター席");
        }
        const tn = Math.floor((W2 - 2) / 4);
        for (let k = 0; k < tn; k++) table4(X(2 + k * 4), 7, "テーブル席");
        P.add("board", X(W2 - 2), 5, "order", "今日の魚(黒板)", true);
      } else {
        // 食堂・レストラン: 古い店や農村は定食屋、それ以外の1975年以降はファミリーレストラン
        if (chain && oy >= 1975) {
          kit(1, "調理ライン(グリル・フライヤー)");
          P.add("counter", X(2), 3, null, "料理の受け渡し口", true);
          const nb = Math.floor((W2 - 3) / 3);
          for (let k = 0; k < nb; k++) booth(X(2 + k * 3), 4, "ボックス席");
          for (let k = 0; k * 4 + 3 < W2 - 3; k++) table4(X(3 + k * 4), H4 - 5, "テーブル席");
          if (y >= 1992) P.add("counter", X(W2 - 2), 4, "order", "ドリンクバー", true);
          P.add("sofa", dx + (dx < W2 >> 1 ? 3 : -3), H4 - 2, "rest", "順番待ちの椅子", false);
          if (y >= 2010) P.add("desk", X(W2 - 2), H4 - 3, "order", "タッチパネルの注文端末", true);
        } else {
          kit(2, "ガス台と大鍋");
          // テーブルは3マスごと・行は1行おき(間の行が通路)
          for (let yy = 4; yy <= H4 - 4; yy += 3) for (let x = 2; x <= W2 - 3; x += 3) table4(X(x), yy, "テーブル席");
          P.add("board", X(W2 - 2), 3, "order", old ? "品書き(壁の短冊)" : "メニュー(定食・丼)", true);
          if (y >= 1960) P.add("tv", X(1), 3, "tv", "店のテレビ", true);
        }
      }
      reg();
      P.staffSpots.push({ x: X(4), y: H4 - 6, role: "hall" }, { x: X(W2 - 5), y: H4 - 6, role: "hall" });
      P.add("plant", X(W2 - 2), H4 - 2, null, "観葉植物", true);
    } else {
      // 2階: 座敷または客席(階段で上がる)
      P.stair(X(W2 - 2), H4 - 3, 0, "1階へ");
      const zash = t === "izakaya" || t === "seafood" || old;
      if (zash) P.fill(1, 1, W2 - 2, H4 - 2, "floor_tatami");
      for (let yy = 2; yy < H4 - 3; yy += 3) for (let x = 2; x < W2 - 3; x += 3) {
        if (zash) {
          if (P.add("table", X(x), yy, "order", "座敷の座卓(宴会・法事)", true)) {
            P.add("zabuton", X(x), yy + 1, null, "座布団", false);
            P.add("zabuton", X(x), yy - 1, null, "座布団", false);
            P.seatSpots.push({ x: X(x), y: yy + 1 }, { x: X(x), y: yy - 1 });
          }
        } else table4(X(x), yy, "2階のテーブル席");
      }
      P.staffSpots.push({ x: X(W2 >> 1), y: H4 - 3, role: "hall" });
    }
    return P.done({ floors: F, floor: lv, lv, lo: 0, hi: F - 1, wallH: 2.8, label: lv === 0 ? "1F(店内)" : "2F", food: { t, chain, old, seats: P.seatSpots.length } });
  }
