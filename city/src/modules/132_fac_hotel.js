  // src/fac_hotel.js — ホテル(シティ・ビジネス・リゾート): フロントでチェックイン → 鍵 → 客室階 → 自分の部屋 → ベッドで眠る → チェックアウト
  var HOTEL_T = { hotel: { rooms: 10, rw: 4, name: "シティホテル", tile: "floor_carpet", twin: true }, bizhotel: { rooms: 13, rw: 3, name: "ビジネスホテル", tile: "floor_carpet", twin: false }, resorthotel: { rooms: 8, rw: 5, name: "リゾートホテル", tile: "floor_wood", twin: true, resort: true } };
  var hotelFloors = (b) => Math.max(3, storeys(b));
  for (const t of Object.keys(HOTEL_T)) {
    FAC_RANGE[t] = (b) => ({ lo: 0, hi: hotelFloors(b) - 1 + (HOTEL_T[b.type].resort ? 1 : 0), nf: hotelFloors(b) });
    FAC_LABEL[t] = (b, lv) => {
      const H5 = HOTEL_T[b.type], nf = hotelFloors(b);
      if (lv === 0) return "1F ロビー・フロント・レストラン";
      if (H5.resort && lv === nf) return "屋上 プール・スパ・展望テラス";
      return `${lv + 1}F 客室(${(lv + 1) * 100 + 1}〜${(lv + 1) * 100 + H5.rooms}号室)`;
    };
    FAC_KEY[t] = (g, b) => {
      const h = g.S.hotel;
      return h && h.b === b.idx ? "h" + h.room : "";
    };
    FAC_BUILD[t] = buildHotel;
  }
  var hotelPrice = (g, b, planK) => {
    const base = BTYPES[b.type].price || 9e3;
    return yenf(g, Math.round(base * (planK === "meal" ? 1.25 : planK === "suite" ? 2.6 : 1)));
  };
  function buildHotel(b, floor, g) {
    const H5 = HOTEL_T[b.type], nf = hotelFloors(b), hi2 = nf - 1 + (H5.resort ? 1 : 0);
    if (isUnitFloor(floor)) return buildHotelRoom(b, floor, g);
    const core = 14;
    const W2 = Math.max(40, 2 + H5.rooms * H5.rw + core);
    const nLift = b.type === "bizhotel" ? 1 : 2;
    if (floor === 0) return buildHotelLobby(b, g, W2, hi2, nLift);
    if (H5.resort && floor === hi2) return buildHotelRoof(b, g, W2, hi2, nLift);
    // ---- 客室階: 北側に客室、南の廊下にドア
    const P = plan(W2, 11, H5.tile, "hotel");
    P.lv = floor;
    P.windows(4);
    P.fill(0, 6, W2 - 1, 8, "floor_carpet");
    const mine = g && g.S.hotel && g.S.hotel.b === b.idx ? decodeUnit(g.S.hotel.room) : null;
    for (let p = 0; p < H5.rooms; p++) {
      const x = 2 + p * H5.rw;
      const room = roomNo(floor, p);
      const isMine = !!(mine && mine.lv === floor && mine.pos === p);
      P.add("ublock", x, 1, null, "", true, { w: H5.rw, h: 5, room, wallc: p % 2, mine: isMine, plate: isMine ? "あなたの部屋" : "" });
      P.add("udoor", x + (H5.rw >> 1), 6, "fx_hroom", `${room}号室${isMine ? "(あなたの部屋)" : ""}`, false, { room, lv: floor, pos: p, mine: isMine });
    }
    const xc = 2 + H5.rooms * H5.rw + 1;
    P.lifts(xc, 1, nLift, 0, hi2);
    P.stair(xc + nLift * 2 + 1, 1, floor + 1 <= hi2 ? floor + 1 : floor - 1, floor + 1 <= hi2 ? `${floor + 2}Fへ(階段)` : `${floor}Fへ(階段)`);
    if (floor + 1 <= hi2) P.stair(xc + nLift * 2 + 3, 1, floor - 1, `${floor}Fへ(階段)`);
    P.add("estair", 1, 7, "stairs", "非常階段", false, { to: floor - 1, via: "emg" });
    P.stairs.push({ x: 1, y: 7, to: floor - 1, via: "emg" });
    P.add("vending", xc + 1, 8, null, "自販機(飲み物)");
    P.add("watersrv", xc + 3, 8, null, "製氷機・給湯");
    P.add("plant", W2 - 2, 7, null, "観葉植物");
    P.add("extinguisher", W2 - 2, 9, null, "消火器");
    P.add("trashbin", xc + 5, 8, null, "リネンカート");
    P.sign(xc + 1, 5, `${floor + 1}F 客室 ${roomNo(floor, 0)}〜${roomNo(floor, H5.rooms - 1)}`);
    for (let x = 6; x < xc - 2; x += 9) P.staffSpots.push({ x, y: 7, role: "linen" });
    return P.done({ floors: hi2 + 1, floor, lv: floor, lo: 0, hi: hi2, big: true, bigKind: "hotel", wallH: 3, label: FAC_LABEL[b.type](b, floor), corridor: { y0: 6, y1: 8, x0: 2, x1: W2 - 2 } });
  }
  function buildHotelLobby(b, g, W2, hi2, nLift) {
    const H5 = HOTEL_T[b.type];
    const H4 = 20;
    const P = plan(W2, H4, "floor_marble", "hotel");
    P.lv = 0;
    P.windows(3);
    const dx = W2 >> 1;
    P.door(dx);
    P.fill(dx - 3, H4 - 4, dx + 3, H4 - 2, "floor_paving");
    P.add("doormat", dx, H4 - 2, null, "玄関マット(回転扉)", false);
    // フロント
    P.wide("reception", dx - 4, 6, 5, 1, "fx_hdesk", "フロント(チェックイン・チェックアウト)");
    P.wide("keyrack", dx - 4, 2, 4, 1, null, "ルームキー棚");
    P.add("board", dx - 6, 1, null, "時計(東京・ロンドン・ニューヨーク)", true);
    P.staffSpots.push({ x: dx - 3, y: 5, role: "front" }, { x: dx - 1, y: 5, role: "front" }, { x: dx + 3, y: H4 - 4, role: "bell" });
    P.wide("counter", dx + 2, 6, 2, 1, "fx_hconcierge", "コンシェルジュ(観光案内・タクシー手配)");
    P.add("luggage", dx + 5, 6, null, "ベルデスク(荷物預かり)");
    P.sign(dx - 2, 8, "FRONT フロント");
    // ロビーラウンジ
    for (const [x, y] of [[dx - 6, 11], [dx - 4, 11], [dx + 3, 11], [dx + 5, 11], [dx - 6, 13], [dx + 5, 13]]) P.add("sofa", x, y, "rest", "ロビーのソファ", false);
    P.add("table", dx - 5, 12, null, "ローテーブル", true);
    P.add("table", dx + 4, 12, null, "ローテーブル", true);
    P.add("plant", dx - 8, 15, null, "観葉植物");
    P.add("plant", dx + 7, 15, null, "観葉植物");
    if (b.type !== "bizhotel") P.add("piano", dx - 1, 12, "fx_hpiano", "グランドピアノ(ラウンジの生演奏)");
    // 西: レストラン(朝食ビュッフェ・ディナー)
    const rx = Math.max(3, dx - 18);
    P.vwall(rx + 11, 1, 9, [5, 6], "レストランの壁");
    P.fill(1, 1, rx + 10, 9, "floor_wood");
    P.sign(rx + 3, 9, b.type === "bizhotel" ? "朝食会場" : "レストラン");
    P.wide("kitchen", 1, 1, 5, 1, null, "オープンキッチン");
    P.wide("counter", 1, 3, 4, 1, "fx_hdine", b.type === "bizhotel" ? "朝食ビュッフェ(6:30〜9:30)" : "ビュッフェ台(朝食・ランチ・ディナー)");
    for (let i = 0; i < 6; i++) {
      const tx = 2 + i % 3 * 3, ty = 5 + (i / 3 | 0) * 3;
      P.add("dining", tx, ty, "fx_hdine", "レストランの席", true);
      P.seatSpots.push({ x: tx + 1, y: ty });
    }
    P.staffSpots.push({ x: 3, y: 2, role: "cook" }, { x: 7, y: 6, role: "waiter" });
    // 東: バー・売店・トイレ
    const ex = Math.min(W2 - 12, dx + 9);
    P.vwall(ex, 1, 9, [5, 6], "バーの壁");
    P.fill(ex + 1, 1, W2 - 1, 9, "floor_wood");
    if (b.type !== "bizhotel") {
      P.wide("bar", ex + 2, 2, 5, 1, "fx_hbar", "メインバー(カクテル)");
      P.sign(ex + 3, 9, "BAR");
      P.add("stool", ex + 2, 3, null, "カウンター席", false);
      P.add("stool", ex + 4, 3, null, "カウンター席", false);
      P.staffSpots.push({ x: ex + 3, y: 1, role: "bartender" });
    } else {
      P.add("washer", ex + 2, 2, "fx_hlaundry", "コインランドリー");
      P.add("washer", ex + 3, 2, "fx_hlaundry", "コインランドリー");
      P.add("vending", ex + 5, 2, null, "自販機");
      P.add("tmachine", ex + 7, 2, null, "自動チェックイン機");
    }
    P.wide("showcase", ex + 2, 6, 3, 1, "fx_hshop", "売店(おみやげ・日用品)");
    P.add("toilet", W2 - 2, 8, "toilet", "トイレ");
    // 北: エレベーターホール・階段
    const lx = dx + 2;
    P.lifts(lx, 1, nLift, 0, hi2);
    P.stair(lx + nLift * 2 + 1, 1, 1, "2Fへ(階段)");
    P.sign(lx, 3, "エレベーター 客室フロア");
    P.add("extinguisher", 1, H4 - 3, null, "消火器");
    P.add("aed", W2 - 2, H4 - 3, null, "AED");
    P.add("umbrella", dx - 3, H4 - 2, null, "傘立て", false);
    return P.done({ floors: hi2 + 1, floor: 0, lv: 0, lo: 0, hi: hi2, wallH: 3.4, label: "1F ロビー・フロント・レストラン" });
  }
  function buildHotelRoof(b, g, W2, hi2, nLift) {
    const P = plan(W2, 18, "floor_paving", "hotel");
    P.lv = hi2;
    P.lifts(W2 - 8, 1, nLift, 0, hi2);
    P.stair(W2 - 3, 1, hi2 - 1, `${hi2}Fへ(階段)`);
    // プール(水面タイル+プールサイドチェア)
    P.fill(3, 4, 22, 11, "pool");
    P.add("fx_pool", 3, 4, "fx_hpool", "屋上インフィニティプール", false, { w: 20, h: 8 });
    for (let x = 4; x < 22; x += 3) P.add("sunbed", x, 13, "rest", "デッキチェア", false);
    P.add("umbrella", 24, 13, null, "パラソル", false);
    P.add("bar", 25, 4, "fx_hbar", "プールサイドバー", true, { w: 4, h: 1 });
    P.add("bath", 26, 9, "bath", "スパ(ジャグジー)", false, { tub: "stone" });
    P.add("bath", 27, 9, "bath", "スパ(ジャグジー)", false, { tub: "stone" });
    P.add("rotenview", 30, 9, "fx_hview", "展望テラス(海と街を一望)", false);
    P.sign(10, 15, "ROOFTOP POOL");
    P.staffSpots.push({ x: 26, y: 3, role: "bartender" }, { x: 12, y: 14, role: "lifeguard" });
    for (let x = 4; x < 22; x += 3) P.seatSpots.push({ x, y: 13 });
    return P.done({ floors: hi2 + 1, floor: hi2, lv: hi2, lo: 0, hi: hi2, wallH: 1.1, roof: true, label: "屋上 プール・スパ・展望テラス" });
  }
  // ---- 客室の中
  function buildHotelRoom(b, floor, g) {
    const H5 = HOTEL_T[b.type], u = decodeUnit(floor);
    const suite = !!(g && g.S.hotel && g.S.hotel.room === floor && g.S.hotel.plan === "suite");
    const W2 = H5.resort || suite ? 14 : b.type === "bizhotel" ? 8 : 11, H4 = b.type === "bizhotel" ? 9 : 10;
    const P = plan(W2, H4, H5.tile, "hotel");
    P.lv = floor;
    P.windows(2);
    P.door(1);
    // 入口の右手に浴室(壁で仕切る)
    P.vwall(3, H4 - 5, H4 - 2, [], "浴室の壁");
    P.hwall(1, 3, H4 - 6, [1], "浴室の壁");
    P.fill(1, H4 - 5, 2, H4 - 2, "floor_tile");
    P.add("bath", 2, H4 - 5, "fx_hbath", "バスタブ(ユニットバス)", false);
    P.add("toilet", 2, H4 - 3, "toilet", "トイレ");
    P.add("sink", 2, H4 - 2, null, "洗面台・アメニティ");
    // 寝室
    const bx = W2 - 4;
    P.add("bed", bx, 2, "fx_hsleep", "ベッド(朝まで眠る)", true);
    if (H5.twin || suite) P.add("bed", bx + 2, 2, "fx_hsleep", "ベッド", true);
    P.add("lamp", bx - 1, 1, null, "ナイトテーブル・スタンド", true);
    P.add("desk", 4, 1, "fx_hdesk2", "ライティングデスク(館内案内・電話)");
    P.add("chair", 4, 2, null, "椅子", false);
    P.add("tv", 6, 1, "tv", "テレビ");
    P.add("minibar", 7, 1, "fx_hminibar", "冷蔵庫・ミニバー");
    P.add("wardrobe", 4, H4 - 2, null, "クローゼット(浴衣・スリッパ)");
    P.add("luggage", 5, H4 - 2, null, "荷物台");
    if (H5.resort || suite) {
      P.add("sofa", 6, 5, "rest", "ソファ", false);
      P.add("table", 7, 5, null, "ローテーブル");
      P.add("rotenview", W2 - 2, 6, "fx_hview", "バルコニー(オーシャンビュー)", false);
    }
    P.add("doormat", 1, H4 - 2, null, "入口(廊下へ)", false);
    return P.done({ floors: 1, floor, unit: u, unitCode: floor, label: `${roomNo(u.lv, u.pos)}号室` });
  }
  // ---- 行動
  function hotelOf(g) {
    const h = g.S.hotel;
    if (!h) return null;
    if (g.absMin() > h.until) {
      g.S.hotel = null;
      return null;
    }
    return h;
  }
  FAC_ACTS.fx_hdesk = (g, o, b, push) => {
    const h = hotelOf(g);
    if (h && h.b === b.idx) {
      push("hgo", `${roomNo(decodeUnit(h.room).lv, decodeUnit(h.room).pos)}号室へ案内してもらう`);
      push("hcheckout", "チェックアウトする");
      push("hextend", `もう1泊延長する(¥${hotelPrice(g, b, h.plan).toLocaleString()})`, { disabled: g.hero.money < hotelPrice(g, b, h.plan) });
      return;
    }
    if (h) {
      push("none", `${g.bld(h.b).name}にチェックイン中です`, { disabled: true });
      return;
    }
    const age = g.age();
    if (age < 15 && !testBypass(g, "age")) {
      push("none", "未成年だけでは宿泊できません(保護者の同意が必要)", { disabled: true });
      return;
    }
    for (const [k, l] of [["room", "素泊まり"], ["meal", "朝食付き"], ...b.type !== "bizhotel" ? [["suite", "スイートルーム"]] : []]) {
      const pr = hotelPrice(g, b, k);
      push("hcheckin:" + ["room", "meal", "suite"].indexOf(k), `チェックイン — ${l} 1泊 ¥${pr.toLocaleString()}`, { disabled: g.hero.money < pr });
    }
    push("hlook", "空室状況・館内のご案内");
  };
  FAC_RUN.hcheckin = (g, arg, tg, r) => {
    const L2 = g.S.loc, b = g.bld(L2.b), H5 = HOTEL_T[b.type];
    const planK = ["room", "meal", "suite"][+arg || 0];
    const pr = hotelPrice(g, b, planK);
    if (g.hero.money < pr) return r.msg = "所持金が足りません";
    g.pay(pr, "宿泊(" + b.name + ")");
    const nf = hotelFloors(b);
    const hs = hash2(g.absMin() | 0, b.idx);
    const lv = planK === "suite" ? nf - 1 : 1 + hs % Math.max(1, nf - 1);
    const pos = (hs >> 4) % H5.rooms;
    const room = unitCode(lv, pos);
    const d = g.date();
    // チェックアウト: 翌日11:00
    const until = g.absMin() - g.S.min + 1440 + 11 * 60;
    g.S.hotel = { b: b.idx, room, plan: planK, until, since: g.absMin() };
    g.advance(5);
    g.log("trip", `${b.name}にチェックイン(${roomNo(lv, pos)}号室)`);
    clearInteriorCache();
    r.msg = `チェックインしました。${roomNo(lv, pos)}号室(${lv + 1}階)のカードキーをお渡しします。${planK === "meal" ? "朝食は1階レストランで6:30から。" : ""}チェックアウトは明日11:00です。`;
    r.ui = "fx_goroom";
    void d;
  };
  FAC_RUN.hgo = (g, arg, tg, r) => {
    r.ui = "fx_goroom";
  };
  FAC_RUN.hcheckout = (g, arg, tg, r) => {
    const h = g.S.hotel;
    g.S.hotel = null;
    clearInteriorCache();
    g.advance(3);
    r.msg = `チェックアウトしました。ご利用ありがとうございました。`;
    if (h) g.log("trip", `${g.bld(h.b).name}をチェックアウト`);
  };
  FAC_RUN.hextend = (g, arg, tg, r) => {
    const h = g.S.hotel, b = g.bld(h.b), pr = hotelPrice(g, b, h.plan);
    g.pay(pr, "宿泊延長");
    h.until += 1440;
    r.msg = "1泊延長しました。";
  };
  FAC_RUN.hlook = (g, arg, tg, r) => {
    const b = g.bld(g.S.loc.b), nf = hotelFloors(b), H5 = HOTEL_T[b.type];
    r.msg = `${b.name}: 客室${(nf - 1) * H5.rooms}室(${2}〜${nf}階)。本日の空室あり。` + (H5.resort ? "屋上にプール・スパ・展望テラス。" : "") + "1階にレストラン" + (b.type === "bizhotel" ? "(朝食)とコインランドリー。" : "・バー・売店。");
  };
  FAC_ACTS.fx_hroom = (g, o, b, push) => {
    const h = hotelOf(g);
    if (h && h.b === b.idx && h.room === unitCode(o.lv, o.pos)) push("hroomin:" + o.lv * 100 + o.pos, "カードキーで部屋に入る");
    else {
      push("none", `${o.room}号室(ほかのお客様の部屋です)`, { disabled: true });
      push("hknock", "ノックする");
    }
  };
  FAC_RUN.hroomin = (g, arg, tg, r) => {
    const v = +arg;
    if (enterUnit(g, v / 100 | 0, v % 100)) {
      r.floor = true;
      r.msg = "ピッ。カードキーで部屋に入りました。";
    }
  };
  FAC_RUN.hknock = (g, arg, tg, r) => {
    r.msg = hash2(g.absMin() | 0, 3) % 3 ? "応答はありません。" : "「はい?」…部屋を間違えたようです。会釈して離れました。";
  };
  FAC_ACTS.fx_hsleep = (g, o, b, push) => {
    const h = hotelOf(g);
    const L2 = g.S.loc;
    if (!h || h.b !== b.idx || h.room !== L2.floor) {
      push("none", "あなたの部屋ではありません", { disabled: true });
      return;
    }
    push("hsleep", "ベッドで朝まで眠る");
    push("nap", "少し横になる(2時間)");
  };
  FAC_RUN.hsleep = (g, arg, tg, r) => {
    const h = g.S.hotel;
    g.sleepUntilMorning(7);
    g.hero.stats.energy = 100;
    r.msg = "ふかふかのベッドでぐっすり眠りました。" + g.chg({ mood: 8, health: 3 });
    if (h && h.plan === "meal") r.msg += " 1階レストランで朝食が食べられます。";
    if (h && h.plan === "suite") r.msg += " スイートの朝は格別です。";
    g.log("trip", `${g.bld(h.b).name}に泊まった`);
  };
  FAC_ACTS.fx_hbath = (g, o, b, push) => push("hbath", "お風呂に入る(30分)");
  FAC_RUN.hbath = (g, arg, tg, r) => {
    g.advance(30);
    g.S.washedAt = null;
    r.msg = "湯船につかって旅の疲れをとりました。" + g.chg({ mood: 4, energy: 6, health: 1 });
  };
  FAC_ACTS.fx_hminibar = (g, o, b, push) => push("hminibar", `ミニバーの飲み物(¥${yenf(g, 400)})`, { disabled: g.hero.money < yenf(g, 400) });
  FAC_RUN.hminibar = (g, arg, tg, r) => {
    g.pay(yenf(g, 400), "ミニバー");
    g.advance(5);
    r.msg = "冷えた飲み物でひと息。" + g.chg({ mood: 2, hunger: 2 });
  };
  FAC_ACTS.fx_hdesk2 = (g, o, b, push) => {
    push("hroomsvc", `ルームサービスを頼む(¥${yenf(g, 2800)})`, { disabled: g.hero.money < yenf(g, 2800) });
    push("hlook", "館内案内を読む");
    push("study1", "デスクで勉強・作業する(1時間)");
  };
  FAC_RUN.hroomsvc = (g, arg, tg, r) => {
    g.pay(yenf(g, 2800), "ルームサービス");
    g.advance(40);
    r.msg = "ノックの音。ワゴンでクラブハウスサンドとスープが届きました。" + g.chg({ hunger: 40, mood: 4 });
  };
  FAC_ACTS.fx_hdine = (g, o, b, push) => {
    const h = hotelOf(g), m = g.S.min / 60;
    const breakfast = m >= 6.5 && m < 10;
    const free = breakfast && h && h.b === b.idx && h.plan !== "room" && !h.ate;
    if (breakfast) push("hdine:b", free ? "朝食ビュッフェ(宿泊プランに含まれます)" : `朝食ビュッフェ(¥${yenf(g, 2200)})`, { disabled: !free && g.hero.money < yenf(g, 2200) });
    else if (b.type !== "bizhotel" && m >= 11 && m < 22) push("hdine:d", m < 15 ? `ランチ(¥${yenf(g, 2800)})` : `ディナーコース(¥${yenf(g, 8800)})`, { disabled: g.hero.money < yenf(g, m < 15 ? 2800 : 8800) });
    else push("none", "営業時間外です(朝食6:30〜10:00" + (b.type !== "bizhotel" ? "・ランチ11:00〜・ディナー〜22:00" : "") + ")", { disabled: true });
  };
  FAC_RUN.hdine = (g, arg, tg, r) => {
    const h = g.S.hotel, b = g.bld(g.S.loc.b);
    if (arg === "b") {
      const free = h && h.b === b.idx && h.plan !== "room" && !h.ate;
      if (free) h.ate = true;
      else g.pay(yenf(g, 2200), "朝食ビュッフェ");
      g.advance(40);
      r.msg = "焼きたてのパン、オムレツ、和食の小鉢…ビュッフェの朝食を楽しみました。" + g.chg({ hunger: 50, mood: 5 });
    } else {
      const lunch = g.S.min / 60 < 15, pr = yenf(g, lunch ? 2800 : 8800);
      g.pay(pr, lunch ? "ホテルランチ" : "ホテルディナー");
      g.advance(lunch ? 50 : 100);
      r.msg = (lunch ? "パスタランチを味わいました。" : "前菜からデザートまで、フルコースのディナーを堪能しました。") + g.chg({ hunger: 60, mood: lunch ? 5 : 12 });
    }
  };
  FAC_ACTS.fx_hbar = (g, o, b, push) => {
    if (g.age() < 20 && !testBypass(g, "age")) push("hbar:s", `ノンアルコールカクテル(¥${yenf(g, 900)})`, { disabled: g.hero.money < yenf(g, 900) });
    else push("hbar:c", `カクテルを一杯(¥${yenf(g, 1800)})`, { disabled: g.hero.money < yenf(g, 1800) });
  };
  FAC_RUN.hbar = (g, arg, tg, r) => {
    g.pay(yenf(g, arg === "c" ? 1800 : 900), "ホテルのバー");
    g.advance(45);
    r.msg = (arg === "c" ? "夜景を眺めながらカクテルを一杯。" : "フルーツのモクテルで乾杯。") + g.chg({ mood: 6 });
  };
  FAC_ACTS.fx_hpiano = (g, o, b, push) => push("hpiano", "ピアノの生演奏を聴く(30分)");
  FAC_RUN.hpiano = (g, arg, tg, r) => {
    g.advance(30);
    r.msg = "ラウンジに流れるジャズピアノに耳を傾けました。" + g.chg({ mood: 4 });
  };
  FAC_ACTS.fx_hconcierge = (g, o, b, push) => {
    push("hcon", "近くのおすすめを聞く");
    push("hconT", "タクシーを手配してもらう(移動メニュー)");
  };
  FAC_RUN.hcon = (g, arg, tg, r) => {
    const L2 = g.S.loc, b = g.bld(L2.b);
    const pick = nearestOfType(g.world, b.doorX, b.doorY, (x) => ["aquarium", "themepark", "tourtower", "museum", "onsenbath", "shrine", "stadium", "zoo", "edovillage"].includes(x.type), 3).map((x) => x.b.name);
    r.msg = `コンシェルジュ「${pick.length ? pick.join("、") + "などはいかがでしょう。" : "街歩きがおすすめです。"}地図からご案内できます」`;
  };
  FAC_RUN.hconT = (g, arg, tg, r) => {
    r.ui = "fx_move";
  };
  FAC_ACTS.fx_hshop = (g, o, b, push) => push("hshop", `おみやげを買う(¥${yenf(g, 1500)})`, { disabled: g.hero.money < yenf(g, 1500) });
  FAC_RUN.hshop = (g, arg, tg, r) => {
    g.pay(yenf(g, 1500), "ホテルの売店");
    g.hero.inv.food += 1;
    r.msg = "ご当地のお菓子を買いました(食料+1)。";
  };
  FAC_ACTS.fx_hlaundry = (g, o, b, push) => push("hlaundry", `洗濯・乾燥(¥${yenf(g, 500)}・60分)`, { disabled: g.hero.money < yenf(g, 500) });
  FAC_RUN.hlaundry = (g, arg, tg, r) => {
    g.pay(yenf(g, 500), "コインランドリー");
    g.advance(60);
    r.msg = "洗濯物がふんわり仕上がりました。" + g.chg({ mood: 1 });
  };
  FAC_ACTS.fx_hview = (g, o, b, push) => push("hview", "景色を眺める(15分)");
  FAC_RUN.hview = (g, arg, tg, r) => {
    g.advance(15);
    const m = g.S.min / 60;
    r.msg = (m >= 18 || m < 5 ? "街の夜景と港の灯りがきらめいています。" : m < 8 ? "朝日が海を染めていきます。" : "青い海と街並みがどこまでも広がっています。") + g.chg({ mood: 4 });
  };
  FAC_ACTS.fx_hpool = (g, o, b, push) => {
    const h = hotelOf(g);
    const guest = h && h.b === b.idx;
    push("hpool", guest ? "プールで泳ぐ(宿泊者無料・40分)" : `プールで泳ぐ(ビジター¥${yenf(g, 3e3)}・40分)`, { disabled: !guest && g.hero.money < yenf(g, 3e3) });
  };
  FAC_RUN.hpool = (g, arg, tg, r) => {
    const h = g.S.hotel, b = g.bld(g.S.loc.b);
    if (!(h && h.b === b.idx)) g.pay(yenf(g, 3e3), "プール");
    g.advance(40);
    r.msg = "空と海がつながるようなプールで泳ぎました。" + g.chg({ mood: 8, energy: -10, health: 2 });
  };
