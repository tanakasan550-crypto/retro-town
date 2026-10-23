  // src/fac_public.js — 公共施設の全面改修: 警察署・消防署・市役所・裁判所・介護施設・福祉施設・研究所。
  // 働く人の数(職の枠 slots)に見合う机と部屋を、複数の階に分けて置く。1階は来る人の窓口、上の階は執務室・専門の部屋。
  // 市役所の窓口(act "hall")・警察の留置室・裁判官席など、v11 の操作に使う設備はそのまま残す。
  var slotSum = (t) => Object.values(BTYPES[t].slots || {}).reduce((a, b) => a + b, 0);
  // 執務室の机の島(2列ずつ向かい合わせ)。n 席ぶん置き、職員の立ち位置を足す
  function pubDesks(P, x0, y0, x1, y1, n2, label = "職員の机", act = "work") {
    let c = 0;
    for (let y = y0; y + 1 <= y1 && c < n2; y += 3) for (let x = x0; x <= x1 && c < n2; x++) {
      if ((x - x0) % 5 === 4) continue;
      if (P.add("pcdesk", x, y, act, label, true)) {
        P.staffSpots.push({ x, y: y - 1 < y0 - 1 ? y + 2 : y + 1 });
        c++;
      }
    }
    return c;
  }
  function pubStairs(P, lv, nf, x, label) {
    if (lv > 0) P.stair(x, 1, lv - 1, `${label(lv - 1)}へ(階段)`);
    if (lv < nf - 1) P.stair(x + 1, 1, lv + 1, `${label(lv + 1)}へ(階段)`);
  }
  var PUB_FLOORS = { police: 3, fire: 2, cityhall: 5, court: 2, nursing: 2, welfare: 2, lab: 3 };
  var PUB_LABELS = {
    police: ["1階 受付・相談・交通課", "2階 刑事課・生活安全課", "3階 署長室・会議室・道場"],
    fire: ["1階 車庫・出動準備", "2階 事務室・仮眠室・食堂"],
    cityhall: ["1階 総合窓口(住民票・戸籍)", "2階 税・保険・福祉の窓口", "3階 まちづくり・教育の課", "4階 市長室・総務課", "5階 議場"],
    court: ["1階 受付・法廷", "2階 裁判官室・書記官室"],
    nursing: ["1階 食堂・機能訓練・浴室", "2階 居室"],
    welfare: ["1階 作業室・相談室", "2階 研修室・事務室"],
    lab: ["1階 受付・会議室", "2階 実験室", "3階 研究室・計測室"]
  };
  for (const t of Object.keys(PUB_FLOORS)) {
    FAC_RANGE[t] = () => ({ lo: 0, hi: PUB_FLOORS[t] - 1, nf: PUB_FLOORS[t] });
    FAC_LABEL[t] = (b, lv) => PUB_LABELS[t][lv] || `${lv + 1}階`;
    FAC_BUILD[t] = (b, floor, g) => pubBuild(t, b, Math.max(0, Math.min(PUB_FLOORS[t] - 1, floor | 0)), g);
  }
  function pubBuild(t, b, lv, g) {
    const nf = PUB_FLOORS[t], staff = slotSum(t), perFloor = Math.ceil(staff / Math.max(1, nf - 1));
    const W2 = Math.max(30, Math.min(56, 18 + Math.ceil(perFloor / 2) * 2)), H4 = 20;
    const P = plan(W2, H4, t === "nursing" || t === "welfare" ? "floor_wood" : "floor_tile", "office");
    P.lv = lv;
    P.windows(3);
    const dx = W2 >> 1, lab = (k) => PUB_LABELS[t][k] || `${k + 1}階`;
    if (lv === 0) P.door(dx);
    pubStairs(P, lv, nf, W2 - 4, lab);
    if (t === "cityhall" || t === "police" || t === "lab" || t === "court") P.lifts(W2 - 8, 1, 1, 0, nf - 1);
    P.add("toilet", 1, 1, "toilet", "トイレ");
    const lobby = () => {
      for (let x = dx - 6; x <= dx + 6; x += 3) P.add("bench", x, H4 - 5, "rest", "待合のベンチ", false);
      P.add("plant", 2, H4 - 3, null, "観葉植物");
      P.add("plant", W2 - 3, H4 - 3, null, "観葉植物");
    };
    const B = BTYPES[t];
    if (t === "police") {
      if (lv === 0) {
        for (let x = 4; x < W2 - 8; x += 1) if (x % 6 !== 0) P.add("counter", x, 9, B.hall ? "hall" : "info", x < W2 / 2 ? "受付・相談窓口" : "交通課の窓口(免許・事故の届け)");
        for (let x = 4; x < W2 - 8; x += 6) P.staffSpots.push({ x: x + 1, y: 8 });
        pubDesks(P, 3, 4, W2 - 10, 6, Math.round(staff * 0.25), "当直・地域課の机");
        P.add("board", 3, 1, "board", "掲示板(防犯・交通安全・指名手配)");
        lobby();
      } else if (lv === 1) {
        P.room(1, 12, 9, H4 - 2, { doors: [[5, 12]], label: "取調室1" });
        P.add("table", 4, 15, null, "取調室の机");
        P.room(10, 12, 18, H4 - 2, { doors: [[14, 12]], label: "取調室2" });
        P.add("table", 13, 15, null, "取調室の机");
        P.wide("cell", W2 - 9, 13, 2, 2, null, "留置室");
        P.wide("cell", W2 - 6, 13, 2, 2, null, "留置室");
        pubDesks(P, 3, 4, W2 - 10, 10, Math.round(staff * 0.5), "刑事課・生活安全課の机");
        P.add("whiteboard", 3, 1, "board", "捜査状況のボード");
      } else {
        P.room(1, 3, 12, 10, { doors: [[12, 6]], label: "署長室" });
        P.add("desk", 6, 5, "work", "署長の机");
        P.staffSpots.push({ x: 6, y: 6 });
        P.add("sofa", 4, 8, "rest", "応接ソファ", false);
        P.room(13, 3, 26, 10, { doors: [[19, 10]], label: "会議室" });
        P.wide("table", 16, 5, 7, 2, null, "会議テーブル");
        P.fill(2, 12, W2 - 3, H4 - 2, "floor_tatami");
        P.sign(dx, 12, "道場(柔道・剣道)");
        pubDesks(P, 28, 4, W2 - 6, 9, Math.round(staff * 0.15), "警務課の机");
      }
    } else if (t === "fire") {
      if (lv === 0) {
        // 車庫: 消防車・はしご車・救急車が前の道へ出られる
        P.fill(1, 3, W2 - 12, H4 - 2, "floor_tile");
        P.wide("firetruck", 2, 5, 3, 6, null, "消防車(ポンプ車)");
        P.wide("firetruck", 7, 5, 3, 7, null, "はしご車");
        P.wide("firetruck", 12, 5, 3, 5, null, "救急車");
        P.wide("firetruck", 17, 5, 3, 6, null, "水槽付ポンプ車");
        for (let y = 4; y < H4 - 4; y += 2) P.add("locker", W2 - 11, y, null, "防火衣ロッカー(出動準備)");
        P.add("counter", W2 - 7, H4 - 5, B.hall ? "hall" : "info", "受付(119番の相談・防火の届け)");
        P.staffSpots.push({ x: W2 - 7, y: H4 - 6 });
        pubDesks(P, W2 - 9, 4, W2 - 3, 10, Math.round(staff * 0.2), "通信指令の机");
      } else {
        pubDesks(P, 3, 4, 20, 10, Math.round(staff * 0.4), "事務室の机");
        P.room(22, 3, W2 - 2, 11, { doors: [[26, 11]], label: "仮眠室" });
        for (let x = 24; x < W2 - 3; x += 3) P.add("bed", x, 5, "rest", "仮眠のベッド");
        P.room(1, 12, 18, H4 - 2, { doors: [[10, 12]], label: "食堂" });
        for (let x = 3; x < 16; x += 4) P.wide("table", x, 15, 2, 1, "eat", "食堂のテーブル");
        P.add("fridge", 2, 13, null, "冷蔵庫");
        P.add("sink", 4, 13, null, "流し");
        P.add("board", 3, 1, "board", "出動表・訓練予定");
      }
    } else if (t === "cityhall") {
      if (lv <= 1) {
        // 窓口: 番号札・用途ごとのカウンター・待合
        const CNT = lv === 0 ? ["住民票・印鑑登録", "戸籍・婚姻・出生", "転入・転出"] : ["税(市民税・固定資産税)", "国民健康保険・年金", "福祉・介護・子育て"];
        const cw = Math.floor((W2 - 12) / 3);
        CNT.forEach((nm, i) => {
          for (let x = 3 + i * cw; x < 3 + (i + 1) * cw - 1; x++) P.add("counter", x, 8, "hall", `${nm}の窓口`);
          P.sign(3 + i * cw + (cw >> 1), 9, nm);
          for (let x = 4 + i * cw; x < 3 + (i + 1) * cw - 1; x += 2) P.staffSpots.push({ x, y: 7 });
        });
        pubDesks(P, 3, 3, W2 - 10, 5, Math.round(staff * 0.18), "窓口の後ろの机");
        P.add("vending", 2, H4 - 4, "info", "番号札の発券機");
        P.add("board", dx, H4 - 3, "board", "フロア案内");
        lobby();
        for (let x = 4; x < W2 - 6; x += 4) P.add("bench", x, 13, "rest", "窓口の待合", false);
      } else if (lv < nf - 1) {
        const KA = lv === 2 ? ["都市計画課", "道路・公園課", "教育委員会"] : ["市長室", "総務課", "秘書課"];
        if (lv === 3) {
          P.room(1, 3, 14, 11, { doors: [[14, 7]], label: "市長室" });
          P.add("desk", 7, 5, "work", "市長の机");
          P.add("flag", 2, 4, null, "市旗");
          P.add("sofa", 5, 9, "rest", "応接ソファ", false);
          P.staffSpots.push({ x: 7, y: 6 });
          pubDesks(P, 17, 4, W2 - 6, H4 - 4, Math.round(staff * 0.22), "総務課・秘書課の机");
        } else {
          pubDesks(P, 3, 4, W2 - 6, H4 - 4, Math.round(staff * 0.25), KA.join("・") + "の机");
          P.sign(dx, H4 - 3, KA.join("・"));
        }
      } else {
        // 議場: 議長席・演壇・議員席(半円)・傍聴席
        P.fill(1, 2, W2 - 2, H4 - 2, "floor_carpet");
        P.wide("judgebench", dx - 2, 3, 5, 1, null, "議長席");
        P.add("podium", dx, 5, null, "演壇");
        for (let r = 0; r < 3; r++) for (let x = dx - 9 + r; x <= dx + 9 - r; x += 2) P.add("seat", x, 8 + r * 2, null, "議員席", false);
        for (let x = 3; x < W2 - 3; x += 1) P.add("seat", x, H4 - 3, "rest", "傍聴席", false);
        P.staffSpots.push({ x: dx, y: 4 });
      }
    } else if (t === "court") {
      if (lv === 0) {
        // 法廷2つ(裁判官席・証言台・原告/被告席・傍聴席)と受付
        for (let k = 0; k < 2; k++) {
          const x0 = 1 + k * ((W2 - 2) >> 1), x1 = x0 + ((W2 - 2) >> 1) - 1, cx = (x0 + x1) >> 1;
          P.room(x0, 2, x1, 14, { doors: [[cx, 14]], label: `第${k + 1}法廷`, tile: "floor_wood" });
          P.wide("judgebench", cx - 2, 3, 5, 1, null, "裁判官席");
          P.add("podium", cx, 6, null, "証言台");
          P.add("desk", x0 + 2, 6, "work", "原告(検察)側の席");
          P.add("desk", x1 - 2, 6, "work", "被告(弁護)側の席");
          P.staffSpots.push({ x: cx, y: 4 }, { x: x0 + 2, y: 7 }, { x: x1 - 2, y: 7 });
          for (let y = 9; y <= 12; y++) for (let x = x0 + 2; x <= x1 - 2; x++) if (x !== cx) P.add("seat", x, y, "rest", "傍聴席", false);
        }
        P.wide("counter", 3, H4 - 4, 6, 1, "info", "受付(事件の手続き・傍聴の案内)");
        P.staffSpots.push({ x: 5, y: H4 - 5 });
        lobby();
      } else {
        P.room(1, 3, 16, H4 - 2, { doors: [[16, 8]], label: "裁判官室" });
        pubDesks(P, 3, 5, 14, H4 - 4, BTYPES.court.slots.judge || 4, "裁判官の机");
        P.add("bookcase", 2, 4, null, "法律書の書架");
        pubDesks(P, 19, 4, W2 - 6, H4 - 4, BTYPES.court.slots.officeworker || 8, "書記官室の机");
      }
    } else if (t === "nursing") {
      if (lv === 0) {
        P.room(1, 2, 20, 12, { doors: [[10, 12]], label: "食堂・機能訓練室", tile: "floor_wood" });
        for (let x = 3; x < 19; x += 4) for (const y of [4, 7]) {
          P.wide("table", x, y, 2, 1, "eat", "食堂のテーブル");
          P.add("chair", x, y + 1, "rest", "椅子", false);
          P.seatSpots.push({ x: x + 1, y: y + 1 });
        }
        P.add("tv", 3, 10, null, "テレビ");
        P.add("handrail", 15, 10, null, "歩行訓練の手すり");
        P.room(21, 2, W2 - 2, 10, { doors: [[25, 10]], label: "浴室(機械浴・個浴)" });
        P.wide("bath", 23, 4, 3, 2, null, "機械浴の浴槽");
        P.wide("bath", 28, 4, 2, 2, null, "個浴の浴槽");
        pubDesks(P, 22, 13, W2 - 4, 15, Math.round(staff * 0.3), "事務所・介護記録の机");
        // 食堂と浴室の介助
        for (let x = 4; x < 19; x += 4) P.staffSpots.push({ x, y: 9 });
        P.staffSpots.push({ x: 24, y: 7 }, { x: 28, y: 7 });
        lobby();
      } else {
        // 居室: 個室と2人部屋(ベッド・手すり・ナースコール)
        const rooms = Math.floor((W2 - 2) / 6);
        for (let k = 0; k < rooms; k++) {
          const x0 = 1 + k * 6;
          P.room(x0, 2, x0 + 6, 9, { doors: [[x0 + 3, 9]], label: `${201 + k}号室`, sign: false });
          P.add("bed", x0 + 2, 4, "rest", `${201 + k}号室のベッド`);
          if (k % 2) P.add("bed", x0 + 4, 4, "rest", `${201 + k}号室のベッド`);
          P.seatSpots.push({ x: x0 + 2, y: 6 });
        }
        for (let k = 0; k < rooms; k++) {
          const x0 = 1 + k * 6;
          P.room(x0, 12, x0 + 6, H4 - 2, { doors: [[x0 + 3, 12]], label: `${221 + k}号室`, sign: false });
          P.add("bed", x0 + 2, 15, "rest", `${221 + k}号室のベッド`);
        }
        for (let x = 3; x < W2 - 3; x += 4) P.staffSpots.push({ x, y: 10 });
        P.add("counter", dx, 10, "info", "介護スタッフの詰所");
      }
    } else if (t === "welfare") {
      if (lv === 0) {
        P.room(1, 2, W2 - 12, 13, { doors: [[8, 13]], label: "作業室(軽作業・パン作り)", tile: "floor_wood" });
        for (let x = 3; x < W2 - 14; x += 5) for (const y of [4, 8]) {
          P.wide("table", x, y, 3, 1, "work", "作業台");
          P.seatSpots.push({ x: x + 1, y: y + 1 });
        }
        P.room(W2 - 11, 2, W2 - 2, 9, { doors: [[W2 - 7, 9]], label: "相談室" });
        P.add("table", W2 - 7, 5, "info", "相談の机");
        P.staffSpots.push({ x: W2 - 7, y: 4 });
        lobby();
      } else {
        P.room(1, 2, 18, 12, { doors: [[9, 12]], label: "研修室" });
        for (let y = 4; y < 11; y += 2) for (let x = 3; x < 17; x += 2) P.add("desk", x, y, "class", "研修室の机");
        P.add("kokuban", 4, 3, null, "ホワイトボード", true, { w: 6 });
        pubDesks(P, 21, 4, W2 - 4, H4 - 4, Math.round(staff * 0.6), "事務室の机");
      }
    } else if (t === "lab") {
      if (lv === 0) {
        P.wide("counter", dx - 3, 9, 6, 1, "info", "受付(見学・来客)");
        P.staffSpots.push({ x: dx, y: 8 });
        P.room(1, 2, 14, 12, { doors: [[7, 12]], label: "会議室" });
        P.wide("table", 4, 5, 7, 2, null, "会議テーブル");
        P.add("showcase", W2 - 6, 4, null, "研究成果の展示");
        lobby();
      } else {
        const benches = lv === 1;
        for (let k = 0; k < 3; k++) {
          const x0 = 1 + k * Math.floor((W2 - 2) / 3), x1 = x0 + Math.floor((W2 - 2) / 3) - 1;
          P.room(x0, 2, x1, H4 - 6, { doors: [[x0 + 3, H4 - 6]], label: benches ? ["化学実験室", "生物実験室", "クリーンルーム"][k] : ["研究室A", "研究室B", "計測室"][k], tile: benches && k === 2 ? "floor_tile" : undefined });
          for (let y = 5; y < H4 - 8; y += 3) {
            P.wide(benches ? "table" : "desk", x0 + 2, y, x1 - x0 - 3, 1, "work", benches ? "実験台" : "研究者の机");
            P.staffSpots.push({ x: x0 + 3, y: y + 1 });
          }
          if (benches) P.add("sink", x1 - 1, 3, null, "流し(実験用)");
          else P.add("bookcase", x1 - 1, 3, null, "論文・資料の棚");
        }
      }
    }
    return P.done({ floors: nf, floor: lv, lv, lo: 0, hi: nf - 1, wallH: 3.2, label: lab(lv) });
  }
