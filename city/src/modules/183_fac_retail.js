  // src/fac_retail.js — 小さな店(商店・コンビニ・書店・洋服店・薬局・魚屋・酒屋・八百屋・直売所)の中の作り。
  // v11 ではどの店も「商品棚2列」の同じ作りだったのを、業種と小分類(商店はよろず屋・ドラッグストア・100円ショップ・パン屋・ブティック・
  // 電器店・花屋・ペットショップ。コンビニは駅前・住宅地・郊外)・年代(開店した年と今の年: ATM 1999〜・コーヒー 2013〜など)・店ごとの違いで作り分ける。
  // 買い物は v11 と同じ操作(shelf・register。洋服は fitting)。来店客は通路(seatSpots)に立つ。美容室(b.salon)は v11 のまま
  var RETAIL_T = ["shop", "konbini", "bookstore", "clothes", "pharmacy", "fishshop", "liquor", "greengrocer", "directsale"];
  var retailOn = (b) => b && RETAIL_T.includes(b.type) && !b.salon && b.campusOf == null && !b.tenants;
  for (const t of RETAIL_T) {
    FAC_RANGE[t] = (b) => retailOn(b) ? { lo: 0, hi: 0, nf: 1 } : null;
    FAC_LABEL[t] = (b) => retailOn(b) ? "売り場" : null;
    FAC_KEY[t] = (g, b) => `${b.openYear || 0}:${Math.floor(g.year() / 5)}`;
    FAC_BUILD[t] = (b, floor, g) => retailOn(b) ? buildRetail(b, g) : null;
  }
  function buildRetail(b, g) {
    const y = g && g.year ? g.year() : 2e3, oy = b.openYear || 1990, t = b.type, v = uh(b.idx, 3501), flip = v % 2 === 1;
    const sub = t === "shop" || t === "konbini" ? subOf(b) || "gen" : t;
    const W2 = Math.max(12, Math.min(20, b.w * 3 + (v >> 3) % 3)), H4 = Math.max(10, Math.min(13, b.h * 3 + 1 + (v >> 5) % 2));
    const X = (x) => flip ? W2 - 1 - x : x;
    const old = oy < 1975 || y < 1975;
    const P = plan(W2, H4, t === "fishshop" || t === "greengrocer" || t === "directsale" ? "floor_paving" : old ? "floor_wood" : "floor_tile", "shop");
    P.lv = 0;
    P.windows(3);
    const dx = X([W2 >> 1, 3, W2 - 4][v % 3]);
    P.door(dx);
    P.reserve(dx, H4 - 4, dx, H4 - 2);
    // レジ(入口の横)と店員の立ち位置
    const regX = dx + (dx < W2 >> 1 ? 3 : -3);
    const register = (n2 = 1, lab = y >= 1985 ? "レジ" : "お会計(帳場)") => {
      // 入口の近くから順に、置ける場所を探す(店員はレジの奥側)
      const cands = [];
      for (const yy of [H4 - 4, H4 - 3, H4 - 5]) for (let d = 2; d < W2; d++) for (const sgn of regX < dx ? [-1, 1] : [1, -1]) cands.push([dx + sgn * d, yy]);
      let placed = 0;
      for (const [rx, ry] of cands) {
        if (placed >= n2) break;
        if (rx < 1 || rx > W2 - 2 || P.occ.has(rx + (ry - 1) * W2)) continue;
        if (P.add("register", rx, ry, "register", lab + (n2 > 1 ? `${placed + 1}` : ""), true)) {
          P.reserve(rx, ry - 1, rx, ry - 1);
          P.staffSpots.push({ x: rx, y: ry - 1, role: "register" });
          placed++;
        }
      }
    };
    // 棚の列(縦の通路つき)。棚の前を来店客の立ち位置にする
    const gOff = (v >> 7) % 2, gStep = (v >> 9) % 3 === 0 ? 1 : 0;
    const gondolas = (x0, x1, y0, y1, step, lab, act = "shelf", tp = "shelf") => {
      for (let x = x0 + gOff; x <= x1; x += step + (step >= 3 ? gStep : 0)) for (let yy = y0; yy <= y1; yy++) {
        if (P.add(tp, X(x), yy, act, lab, true) && (yy - y0) % 2 === 0) P.seatSpots.push({ x: X(x + 1), y: yy });
      }
    };
    const wall = (y0, x0, x1, tp, lab, act = "shelf") => {
      for (let x = x0; x <= x1; x++) if (P.add(tp, X(x), y0, act, lab, true) && x % 2 === 0) P.seatSpots.push({ x: X(x), y: y0 + 1 });
    };
    const backRoom = (lab) => {
      // 奥のバックヤード(在庫・休憩)
      P.room(X(W2 - 5) < X(W2 - 2) ? X(W2 - 5) : X(W2 - 2), 0, X(W2 - 5) < X(W2 - 2) ? X(W2 - 2) : X(W2 - 5), 3, { noTop: true, door: [X(W2 - 4), 3], label: lab, tile: "floor_tile" });
      P.add("shelf", X(W2 - 3), 1, null, "在庫の段ボール", true);
      P.staffSpots.push({ x: X(W2 - 4), y: 2, role: "back" });
    };
    let lab2 = "売り場";
    if (t === "konbini") {
      lab2 = "コンビニ";
      wall(1, 1, W2 - 7, "fridge", "冷蔵ケース(飲み物・アイス)");
      backRoom("バックヤード(検品・休憩)");
      P.add("fridge", X(1), 3, "shelf", "おにぎり・弁当・サンドイッチの棚", true);
      P.add("fridge", X(1), 4, "shelf", "パン・デザートの棚", true);
      gondolas(4, W2 - 5, 4, H4 - 6, 3, "日用品・お菓子・カップ麺の棚");
      wall(H4 - 2, 1, Math.min(4, dx - 2), "bookcase", "雑誌・マンガの棚(窓ぎわ)", "read");
      register(sub === "ekimae" ? 3 : 2);
      P.add("showcase", regX + (regX < dx ? -5 : 5), H4 - 4, "register", "からあげ・肉まん(レジ横のケース)", true);
      if (y >= 1985) P.add("desk", X(W2 - 2), 5, null, y >= 2005 ? "マルチコピー機(コピー・チケット)" : "コピー機", true);
      if (y >= 1999) P.add("atm", X(W2 - 2), 7, null, "ATM", true);
      if (y >= 2013) P.add("watersrv", regX, H4 - 2, "register", "セルフのコーヒーマシン", true);
      if (sub === "suburb" && y >= 2008) for (let x = W2 - 6; x < W2 - 2; x++) {
        P.add("counter", X(x), H4 - 3, null, "イートインのカウンター", true);
        P.seatSpots.push({ x: X(x), y: H4 - 2 });
      }
      P.add("toilet", X(W2 - 2), H4 - 2, "toilet", "トイレ(お客さま用)", true);
    } else if (t === "bookstore") {
      lab2 = "書店";
      wall(1, 1, W2 - 2, "bookcase", "本棚(文庫・単行本)");
      gondolas(2, W2 - 4, 3, H4 - 6, 3, "本棚(マンガ・参考書・実用書)", "shelf", "bookcase");
      P.add("table", X(W2 - 3), H4 - 5, "shelf", "新刊・話題の本の平台", true, { w: 2, h: 1 });
      wall(H4 - 2, 1, Math.min(4, dx - 2), "bookcase", "雑誌の棚(窓ぎわ)", "read");
      if (y >= 1990) P.add("shelf", X(W2 - 2), 5, "shelf", "文房具のコーナー", true);
      register(1, "レジ(カバーをかけます)");
    } else if (t === "clothes" || sub === "boutique") {
      lab2 = t === "clothes" ? "洋服店" : "ブティック";
      for (let x = 2; x < W2 - 5; x += 3) for (const yy of [3, 6]) if (P.add("rack", X(x), yy, "fitting", "洋服ラック(試着できます)", true, { w: 2, h: 1 })) P.seatSpots.push({ x: X(x), y: yy + 1 });
      // 試着室(奥の壁ぎわ。カーテンで仕切る)
      for (let k = 0; k < 2; k++) P.add("fitting", X(W2 - 3 - k * 2), 1, "fitting", "試着室", true);
      P.add("table", X(W2 - 4), H4 - 5, "fitting", "たたんだシャツ・小物の台", true, { w: 2, h: 1 });
      P.add("mirror", X(1), H4 - 4, null, "姿見", true, { deco: false });
      register(1);
    } else if (t === "pharmacy" || sub === "drug") {
      lab2 = t === "pharmacy" ? "薬局" : "ドラッグストア";
      if (t === "pharmacy") {
        for (let x = 2; x < 7; x++) P.add("counter", X(x), 3, "shelf", "調剤カウンター(処方箋・お薬の相談)", true);
        P.add("shelf", X(2), 1, null, "薬の引き出し(調剤室)", true, { w: 4, h: 1 });
        P.staffSpots.push({ x: X(3), y: 2, role: "pharmacist" }, { x: X(5), y: 2, role: "pharmacist" });
        for (let x = 2; x < 6; x++) {
          P.add("sofa", X(x), 6, null, "待合のソファ", false);
          P.seatSpots.push({ x: X(x), y: 6 });
        }
        gondolas(W2 - 7, W2 - 3, 3, H4 - 6, 2, "市販薬・衛生用品の棚");
      } else {
        wall(1, 1, W2 - 2, "shelf", "化粧品・日用品の壁の棚");
        gondolas(2, W2 - 3, 3, H4 - 6, 3, "薬・洗剤・お菓子の棚");
      }
      register(t === "pharmacy" ? 1 : 2);
    } else if (sub === "yen100") {
      lab2 = y >= 1990 ? "100円ショップ" : "雑貨店";
      wall(1, 1, W2 - 2, "shelf", y >= 1990 ? "100円の雑貨(台所用品・文具)" : "雑貨の棚");
      gondolas(2, W2 - 3, 3, H4 - 6, 2, y >= 1990 ? "100円の商品棚" : "雑貨の棚");
      register(2);
    } else if (sub === "bakery") {
      lab2 = "パン屋";
      P.room(1, 0, W2 - 2, 3, { noTop: true, door: [X(W2 - 3), 3], label: "工房(オーブン)", tile: "floor_tile" });
      P.add("fridge", X(2), 1, null, "オーブン", true, { w: 2, h: 1 });
      P.add("counter", X(5), 1, null, "こね台", true, { w: 3, h: 1 });
      P.staffSpots.push({ x: X(4), y: 2, role: "baker" });
      for (let x = 2; x < W2 - 4; x += 3) if (P.add("showcase", X(x), 5, "shelf", "焼きたてのパンの棚", true, { w: 2, h: 1 })) P.seatSpots.push({ x: X(x), y: 6 });
      P.add("table", X(1), H4 - 4, "shelf", "トレーとトング", true);
      if (oy >= 1995) {
        P.add("table", X(W2 - 3), 7, null, "イートイン", true);
        P.seatSpots.push({ x: X(W2 - 4), y: 7 });
      }
      register(1);
    } else if (sub === "appliance") {
      lab2 = "電器店";
      for (let x = 1; x < W2 - 1; x += 2) P.add("tv", X(x), 1, "shelf", y >= 2003 ? "薄型テレビの展示" : y >= 1960 ? "テレビの展示" : "ラジオの展示", true);
      for (let x = 2; x < W2 - 4; x += 3) {
        P.add("fridge", X(x), 4, "shelf", "冷蔵庫の展示", true);
        P.add("wash", X(x + 1), 4, "shelf", "洗濯機の展示", true);
        P.seatSpots.push({ x: X(x), y: 5 });
      }
      P.add("counter", X(W2 - 3), H4 - 5, "shelf", "修理の受付(電池・電球)", true, { w: 2, h: 1 });
      if (y >= 1985) P.add("desk", X(2), H4 - 5, "shelf", y >= 1995 ? "パソコン・携帯電話の売り場" : "ワープロの売り場", true);
      register(1);
    } else if (sub === "flower") {
      lab2 = "花屋";
      for (let x = 1; x < W2 - 1; x += 2) if (P.add("planter", X(x), 5, "shelf", "季節の花(バケツ)", true)) P.seatSpots.push({ x: X(x), y: 6 });
      P.add("fridge", X(1), 1, "shelf", "フラワーキーパー(冷蔵ケース)", true, { w: 3, h: 1 });
      P.add("table", X(6), 2, "shelf", "花束をつくる作業台", true, { w: 3, h: 1 });
      P.staffSpots.push({ x: X(7), y: 3, role: "florist" });
      register(1);
    } else if (sub === "pet") {
      lab2 = "ペットショップ";
      for (let x = 1; x < W2 - 1; x += 2) P.add("shelf", X(x), 1, "shelf", "子犬・子猫のケージ", true);
      for (let x = 2; x < 8; x += 3) if (P.add("fishtank", X(x), 4, "shelf", "熱帯魚の水槽", true, { w: 2, h: 1 })) P.seatSpots.push({ x: X(x), y: 5 });
      gondolas(W2 - 5, W2 - 3, 4, H4 - 6, 2, "ペットフード・用品の棚");
      register(1);
    } else if (t === "fishshop") {
      lab2 = "魚屋";
      for (let x = 2; x < W2 - 2; x++) if (P.add("showcase", X(x), H4 - 5, "shelf", "氷の上の鮮魚(店先)", true) && x % 2 === 0) P.seatSpots.push({ x: X(x), y: H4 - 4 });
      P.add("counter", X(2), 2, null, "まな板(さばいてくれる)", true, { w: 3, h: 1 });
      P.add("fridge", X(W2 - 3), 1, null, "冷凍庫", true, { w: 2, h: 1 });
      P.add("sink", X(6), 1, null, "流し", true);
      P.staffSpots.push({ x: X(3), y: 3, role: "fishmonger" });
      register(1, "お会計(ざる銭)");
    } else if (t === "greengrocer" || t === "directsale") {
      lab2 = t === "directsale" ? "直売所" : "八百屋";
      const crates = t === "directsale" ? ["朝どれ野菜(生産者の名前つき)", "果物", "米・漬物・加工品"] : ["季節の野菜の箱", "果物の箱", "きのこ・豆腐"];
      let k = 0;
      for (let yy = 3; yy <= H4 - 5; yy += 3) for (let x = 2; x < W2 - 2; x += 2) if (P.add("shelf", X(x), yy, "shelf", crates[k++ % crates.length], true) && x % 4 === 2) P.seatSpots.push({ x: X(x), y: yy + 1 });
      P.add("table", X(1), H4 - 5, null, old ? "はかり(量り売り)" : "はかり", true);
      if (t === "directsale") P.add("board", X(W2 - 2), 1, null, "今日の出荷者の一覧", true);
      register(t === "directsale" ? 2 : 1);
    } else if (t === "liquor") {
      lab2 = "酒屋";
      wall(1, 1, W2 - 2, "shelf", "日本酒・焼酎の一升瓶");
      P.add("fridge", X(1), 3, "shelf", "ビールの冷蔵ケース", true, { w: 1, h: 3 });
      gondolas(4, W2 - 4, 3, H4 - 6, 3, "ワイン・ウイスキー・おつまみの棚");
      if (old) P.add("counter", X(W2 - 3), H4 - 5, null, "角打ち(立ち飲み)", true, { w: 2, h: 1 });
      register(1);
    } else {
      // よろず屋(何でも置く小さな商店)
      lab2 = old ? "よろず屋" : "商店";
      wall(1, 1, W2 - 2, "shelf", "日用品・乾物・たばこ");
      gondolas(2, W2 - 4, 3, H4 - 6, 3, "お菓子・缶詰・洗剤の棚");
      P.add("fridge", X(W2 - 2), 4, "shelf", y >= 1960 ? "冷蔵ケース(牛乳・ジュース)" : "氷の箱(ラムネ)", true);
      register(1, old ? "帳場(店主が座る)" : "レジ");
    }
    P.add("doormat", dx, H4 - 2, null, "", false);
    // 来店客の立ち位置: 商品・レジのとなりの空いた通路(店ごとに散らして最大16か所)
    {
      const sol = new Uint8Array(W2 * H4), used = new Set(P.seatSpots.map((q) => q.x + q.y * W2)), goods = new Uint8Array(W2 * H4);
      for (const o of P.objs) for (let yy = o.y; yy < o.y + (o.h || 1); yy++) for (let xx = o.x; xx < o.x + (o.w || 1); xx++) {
        if (o.solid) sol[xx + yy * W2] = 1;
        if (["shelf", "fitting", "read", "register"].includes(o.act)) goods[xx + yy * W2] = 1;
      }
      for (const q of P.staffSpots) used.add(q.x + q.y * W2);
      const c = [];
      for (let yy = 2; yy < H4 - 2; yy++) for (let xx = 1; xx < W2 - 1; xx++) {
        const k = xx + yy * W2;
        if (sol[k] || used.has(k) || xx === dx) continue;
        if (goods[k - 1] || goods[k + 1] || goods[k - W2] || goods[k + W2]) c.push({ x: xx, y: yy, h: uh(k, b.idx) });
      }
      c.sort((a, d) => a.h - d.h);
      for (const q of c.slice(0, Math.max(0, 16 - P.seatSpots.length))) P.seatSpots.push({ x: q.x, y: q.y });
    }
    P.staffSpots.push({ x: X(W2 >> 1), y: H4 - 5, role: "floor" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 2.8, label: lab2, retail: { t, sub, old } });
  }
