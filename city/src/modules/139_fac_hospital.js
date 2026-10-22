  // src/fac_hospital.js — 総合病院: 1F外来(受付→番号札→待合→診察室→会計・薬)・救急外来 / 2F診療科 / 3F検査・手術・ICU /
  // 4F〜病棟(ナースステーション・4床室・個室・デイルーム) / 屋上ヘリポート(ドクターヘリ)。入院は病棟のベッドへ。
  var hospFloors = (b) => Math.max(5, Math.min(9, storeys(b)));
  FAC_RANGE.hospital = (b) => ({ lo: 0, hi: hospFloors(b), nf: hospFloors(b) });
  FAC_LABEL.hospital = (b, lv) => {
    const nf = hospFloors(b);
    if (lv === 0) return "1F 外来受付・救急外来・会計";
    if (lv === 1) return "2F 診療科外来";
    if (lv === 2) return "3F 検査・手術室・ICU";
    if (lv >= nf) return "屋上 ヘリポート";
    return `${lv + 1}F 病棟(${["内科", "外科", "小児科", "整形外科", "循環器", "産婦人科"][(lv - 3) % 6]})`;
  };
  FAC_KEY.hospital = (g) => g.S.hq ? "q" + g.S.hq.room : "";
  FAC_BUILD.hospital = (b, floor, g) => {
    const nf = hospFloors(b);
    if (floor === 0) return hoF1(b, g, nf);
    if (floor === 1) return hoF2(b, g, nf);
    if (floor === 2) return hoF3(b, g, nf);
    if (floor >= nf) return hoRoof(b, g, nf);
    return hoWard(b, g, nf, floor);
  };
  var HO_W = 60;
  function hoCore(P, nf, y = 1) {
    P.lifts(26, y, 3, 0, nf, "エレベーター");
    if (P.lv < nf) P.stair(33, y, P.lv + 1, P.lv + 1 >= nf ? "屋上へ(階段)" : `${P.lv + 2}Fへ(階段)`);
    if (P.lv > 0) P.stair(35, y, P.lv - 1, `${P.lv}Fへ(階段)`);
  }
  function hoF1(b, g, nf) {
    const W2 = HO_W, H4 = 30;
    const P = plan(W2, H4, "floor_tile", "hospital");
    P.lv = 0;
    P.windows(4);
    const dx = 22;
    P.door(dx);
    // 受付・会計・薬
    P.wide("counter", dx - 6, 18, 5, 1, "fx_horeg", "総合受付(初診・再診・番号札)");
    P.wide("counter", dx + 2, 18, 4, 1, "fx_hocash", "会計(お支払い)・処方せん");
    P.add("tmachine", dx - 8, 18, "fx_horeg", "再来受付機");
    P.add("tmachine", dx + 7, 18, "fx_hocash", "自動精算機");
    P.wide("board", dx - 3, 15, 6, 1, "fx_hocall", "呼び出し表示(番号)", {});
    P.sign(dx - 4, 20, "総合受付");
    P.sign(dx + 4, 20, "会計");
    P.staffSpots.push({ x: dx - 5, y: 17, role: "clerk" }, { x: dx - 3, y: 17, role: "clerk" }, { x: dx + 3, y: 17, role: "clerk" });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) {
      const x = dx - 8 + k * 2, y = 22 + r * 2;
      if (Math.abs(x - dx) < 2) continue;
      P.add("seat", x, y, null, "外来待合のいす", false);
      P.seatSpots.push({ x, y });
    }
    // 診察室1〜6(北)
    for (let i = 0; i < 6; i++) {
      const x0 = 1 + i * 4;
      const no = i + 1;
      P.room(x0, 3, x0 + 4, 9, { door: [x0 + 2, 9], label: `第${no}診察室`, tile: "floor_tile", sign: false });
      P.add("desk", x0 + 1, 4, "clinic", `第${no}診察室 診察机(医師)`, true, { room: no });
      P.add("hospital_bed", x0 + 3, 5, null, "診察台", true);
      P.add("sink", x0 + 1, 7, null, "手洗い", true);
      P.add("roomsign", x0 + 2, 10, null, `診察室${no}`, false, { text: `診察室${no}` });
      P.staffSpots.push({ x: x0 + 2, y: 5, role: "doctor" }, { x: x0 + 3, y: 7, role: "nurse" });
    }
    // 検査: 採血・X線
    P.room(38, 3, 44, 9, { door: [41, 9], label: "採血・検尿", tile: "floor_tile" });
    P.add("counter", 39, 5, "checkup", "採血台(健康診断・検査)");
    P.add("counter", 40, 5, "checkup", "採血台");
    P.room(45, 3, 51, 9, { door: [48, 9], label: "X線撮影室", tile: "floor_tile" });
    P.add("xray", 47, 5, "fx_hoxray", "X線撮影装置(レントゲン)", true);
    P.staffSpots.push({ x: 40, y: 6, role: "lab" }, { x: 48, y: 7, role: "tech" });
    // 救急外来(東)
    P.room(52, 3, W2 - 1, 16, { doors: [[52, 12]], label: "救急外来 ER", tile: "floor_tile", noTop: true });
    P.add("hospital_bed", 54, 5, "fx_hoer", "救急処置ベッド", true);
    P.add("hospital_bed", 56, 5, "fx_hoer", "救急処置ベッド", true);
    P.add("aed", 57, 9, null, "除細動器・救急カート");
    P.add("counter", 54, 13, "fx_hoer", "救急受付(24時間)");
    P.staffSpots.push({ x: 55, y: 7, role: "doctor" }, { x: 56, y: 10, role: "nurse" });
    // 院内コンビニ・カフェ・ATM
    P.fill(38, 20, W2 - 2, H4 - 2, "floor_wood");
    P.add("kiosk", 40, 21, "fx_hoshop", "院内コンビニ(お見舞い品・日用品)");
    P.add("shelf", 42, 21, "fx_hoshop", "コンビニの棚");
    P.wide("counter", 46, 21, 3, 1, "fx_hoshop", "カフェ(コーヒー・パン)", { cafe: true });
    for (const x of [45, 48, 51]) P.add("table", x, 24, "fx_hoshop", "カフェの席", true, { cafe: true });
    P.add("atm", 55, 21, null, "ATM");
    P.add("toilet", W2 - 2, 26, "toilet", "トイレ");
    hoCore(P, nf, 12);
    P.sign(29, 14, "エレベーター 病棟・各科へ");
    P.add("board", 36, 15, "fx_hoguide", "院内案内図(フロアガイド)", true);
    return P.done({ floors: nf + 1, floor: 0, lv: 0, lo: 0, hi: nf, wallH: 3.2, hospital: true, label: FAC_LABEL.hospital(b, 0) });
  }
  function hoF2(b, g, nf) {
    const W2 = HO_W, H4 = 24;
    const P = plan(W2, H4, "floor_tile", "hospital");
    P.lv = 1;
    P.windows(4);
    const depts = ["内科", "外科", "小児科", "眼科", "耳鼻咽喉科", "皮膚科", "整形外科", "産婦人科", "歯科口腔外科", "心療内科"];
    depts.forEach((nm, i) => {
      const x0 = 1 + i % 5 * 11, top = i < 5;
      const y0 = top ? 3 : 15, y1 = top ? 9 : 21;
      if (Math.abs(x0 + 5 - 28) < 5 && top) return;
      P.room(x0, y0, x0 + 9, y1, { door: [x0 + 4, top ? y1 : y0], label: nm, tile: "floor_tile", lowFront: top ? void 0 : false, noTop: false });
      P.add("desk", x0 + 2, y0 + 2, "clinic", `${nm} 診察室`, true);
      const eq = { 眼科: ["board", "視力検査表"], 耳鼻咽喉科: ["chair", "診察いす"], 歯科口腔外科: ["hairchair", "歯科ユニット"], 小児科: ["playmat", "キッズスペース"], 整形外科: ["hospital_bed", "リハビリ台"], 産婦人科: ["hospital_bed", "内診台・エコー"] }[nm] || ["hospital_bed", "診察台"];
      P.add(eq[0], x0 + 6, y0 + 2, null, eq[1], true);
      P.staffSpots.push({ x: x0 + 3, y: y0 + 3, role: "doctor" });
      for (let k = 0; k < 3; k++) {
        const sx = x0 + 2 + k * 2, sy = top ? y1 + 2 : y0 - 2;
        P.add("seat", sx, sy, null, `${nm}の待合いす`, false);
        P.seatSpots.push({ x: sx, y: sy });
      }
    });
    hoCore(P, nf, 3);
    P.add("toilet", W2 - 2, 12, "toilet", "トイレ");
    return P.done({ floors: nf + 1, floor: 1, lv: 1, lo: 0, hi: nf, wallH: 3, noDoor: true, hospital: true, label: FAC_LABEL.hospital(b, 1) });
  }
  function hoF3(b, g, nf) {
    const W2 = HO_W, H4 = 24;
    const P = plan(W2, H4, "floor_tile", "hospital");
    P.lv = 2;
    P.windows(4);
    P.room(1, 3, 11, 10, { door: [6, 10], label: "CT室", tile: "floor_tile" });
    P.add("fx_scanner", 4, 5, "fx_hoscan", "CTスキャナー", true, { w: 3, h: 2 });
    P.room(12, 3, 22, 10, { door: [17, 10], label: "MRI室", tile: "floor_tile" });
    P.add("fx_scanner", 15, 5, "fx_hoscan", "MRI装置", true, { w: 3, h: 2, mri: true });
    P.room(38, 3, 48, 12, { door: [43, 12], label: "手術室(関係者以外立入禁止)", tile: "floor_tile" });
    P.add("hospital_bed", 42, 6, "fx_hoor", "手術台", true);
    P.add("lamp", 43, 5, null, "無影灯", true);
    P.add("cabinet", 39, 4, null, "医療器具", true);
    P.staffSpots.push({ x: 41, y: 7, role: "doctor" }, { x: 44, y: 7, role: "nurse" });
    P.room(49, 3, W2 - 1, 16, { door: [52, 16], label: "ICU(集中治療室)", tile: "floor_tile", noTop: false });
    for (let k = 0; k < 4; k++) P.add("hospital_bed", 51 + k % 2 * 4, 5 + (k >> 1) * 5, "ward", "ICUベッド(面会は家族のみ)", true);
    P.staffSpots.push({ x: 53, y: 8, role: "nurse" });
    P.room(1, 14, 11, 21, { door: [6, 14], label: "内視鏡室", tile: "floor_tile", lowFront: false });
    P.add("hospital_bed", 5, 17, "checkup", "内視鏡検査(胃カメラ)", true);
    hoCore(P, nf, 3);
    for (let x = 14; x < 36; x += 3) P.add("seat", x, 20, null, "検査待ちのいす", false);
    return P.done({ floors: nf + 1, floor: 2, lv: 2, lo: 0, hi: nf, wallH: 3, noDoor: true, hospital: true, label: FAC_LABEL.hospital(b, 2) });
  }
  function hoWard(b, g, nf, floor) {
    const W2 = HO_W, H4 = 22;
    const P = plan(W2, H4, "floor_tile", "hospital");
    P.lv = floor;
    P.windows(3);
    const rooms = [];
    // 北側: 4床室・個室
    for (let i = 0; i < 8; i++) {
      if (i === 6) continue;
      const x0 = 1 + i * 7, single = i % 3 === 2;
      P.room(x0, 1, x0 + 6, 8, { door: [x0 + 3, 8], label: `${floor + 1}${String(i + 1).padStart(2, "0")}号室${single ? "(個室)" : ""}`, tile: "floor_wood", sign: false });
      P.add("roomsign", x0 + 3, 9, null, `${floor + 1}${String(i + 1).padStart(2, "0")}`, false, { text: `${floor + 1}${String(i + 1).padStart(2, "0")}${single ? " 個室" : ""}` });
      const beds = single ? [[x0 + 3, 3]] : [[x0 + 1, 2], [x0 + 5, 2], [x0 + 1, 5], [x0 + 5, 5]];
      beds.forEach(([bx, by], k) => {
        P.add("hospital_bed", bx, by, "fx_hobed", `ベッド(${floor + 1}${String(i + 1).padStart(2, "0")}-${k + 1})`, true, { room: i, bed: k });
        if (!single) P.add("curtain", bx + (bx === x0 + 1 ? 1 : -1), by, null, "カーテン", false);
        rooms.push({ x: bx, y: by, i, k });
      });
      if (single) {
        P.add("sofa", x0 + 5, 6, null, "面会用ソファ", false);
        P.add("tv", x0 + 1, 2, null, "テレビ", true);
      }
    }
    // ナースステーション(中央南)
    P.wide("counter", 22, 13, 8, 1, "fx_honurse", "ナースステーション(面会受付)");
    P.add("pcdesk", 24, 15, null, "電子カルテ", true);
    P.add("cart", 31, 13, null, "配薬カート");
    P.staffSpots.push({ x: 24, y: 14, role: "nurse" }, { x: 27, y: 14, role: "nurse" }, { x: 12, y: 10, role: "nurse" });
    // デイルーム
    P.room(40, 12, W2 - 1, H4 - 1, { door: [44, 12], label: "デイルーム(談話室)", tile: "floor_wood", noTop: false, lowFront: false });
    P.add("tv", 46, 14, "tv", "デイルームのテレビ", true);
    for (const x of [43, 47, 51]) {
      P.add("table", x, 17, "rest", "デイルームのテーブル", true);
      P.seatSpots.push({ x: x + 1, y: 17 });
    }
    P.add("vending", 55, 14, null, "自販機");
    P.add("watersrv", 56, 14, null, "給茶機");
    hoCore(P, nf, 12);
    return P.done({ floors: nf + 1, floor, lv: floor, lo: 0, hi: nf, wallH: 3, noDoor: true, hospital: true, beds: rooms, label: FAC_LABEL.hospital(b, floor) });
  }
  function hoRoof(b, g, nf) {
    const W2 = HO_W, H4 = 26;
    const P = plan(W2, H4, "floor_paving", "hospital");
    P.lv = nf;
    P.add("fx_heli", 18, 4, "fx_hoheli", "ヘリポート(ドクターヘリ)", true, { w: 16, h: 14 });
    P.stair(35, 1, nf - 1, `${nf}Fへ(階段)`);
    P.lifts(26, 20, 3, 0, nf, "エレベーター");
    P.add("fence", 2, 2, null, "安全柵", true);
    return P.done({ floors: nf + 1, floor: nf, lv: nf, lo: 0, hi: nf, wallH: 0.8, roof: true, noDoor: true, hospital: true, label: FAC_LABEL.hospital(b, nf) });
  }
  // ---- 外来の流れ: 受付 → 番号札 → 呼び出し → 診察室 → 会計
  FAC_ACTS.fx_horeg = (g, o, b, push) => {
    const q = g.S.hq;
    if (q && q.b === b.idx && !q.paid) return push("hoq", `受付済み(番号 ${q.no}・第${q.room}診察室)`);
    push("hoq:new", "受付をする(保険証を出す・番号札を受け取る)");
    push("checkupq", `健康診断を申し込む(¥${yenf(g, 3e3).toLocaleString()})`, { disabled: g.hero.money < yenf(g, 3e3) });
  };
  FAC_RUN.checkupq = (g, arg, tg, r) => {
    g.pay(yenf(g, 3e3), "健康診断");
    g.advance(90);
    r.msg = "身長・体重・視力・血圧・採血・レントゲン…順番に回って健康診断を終えました。" + g.chg({ health: 3 });
  };
  FAC_RUN.hoq = (g, arg, tg, r) => {
    const b = g.bld(g.S.loc.b);
    if (arg === "new") {
      const wait = hash2(g.absMin() | 0, 3) % 30 + (g.S.min < 11 * 60 ? 30 : 10);
      g.S.hq = { b: b.idx, no: 100 + hash2(g.absMin() | 0, 5) % 300, room: 1 + hash2(g.absMin() | 0, 7) % 6, called: false, done: false, paid: false };
      g.advance(5);
      r.msg = `受付番号 ${g.S.hq.no} 番。待合でお待ちください(目安 約${wait}分)。`;
      g.S.hq.at = g.absMin() + wait;
      return;
    }
    const q = g.S.hq;
    if (g.absMin() < q.at) g.advance(Math.ceil(q.at - g.absMin()));
    q.called = true;
    r.msg = `ピンポーン「${q.no}番の方、第${q.room}診察室へお入りください」`;
    r.ui = "fx_goexam";
  };
  FAC_ACTS.fx_hocall = (g, o, b, push) => push("hoq", "呼び出し表示を見る(呼ばれるまで待つ)");
  FAC_ACTS.fx_hocash = (g, o, b, push) => {
    const q = g.S.hq;
    if (q && q.b === b.idx && q.done && !q.paid) push("hopay", "会計をする(処方せんを受け取る)");
    else push("none", "診察が終わったら会計です", { disabled: true });
  };
  FAC_RUN.hopay = (g, arg, tg, r) => {
    const q = g.S.hq;
    q.paid = true;
    g.advance(10);
    r.msg = "会計を済ませ、処方せんを受け取りました。お大事に。";
    g.S.hq = null;
  };
  // 診察室の医師: 受付済みなら自分の番の診察室で受診できる(既存の診察・予防接種・相談は "clinic")
  var _clinicActs = null;
  FAC_ACTS.fx_hoguide = (g, o, b, push) => push("hoguide", "フロアガイドを見る");
  FAC_RUN.hoguide = (g, arg, tg, r) => {
    const b = g.bld(g.S.loc.b), nf = hospFloors(b);
    const out = [];
    for (let lv = 0; lv <= nf; lv++) out.push(FAC_LABEL.hospital(b, lv));
    r.msg = out.join(" / ");
  };
  FAC_ACTS.fx_hoxray = (g, o, b, push) => push("checkup", `レントゲン撮影・健康診断(¥${yenf(g, 3e3).toLocaleString()})`, { disabled: g.hero.money < yenf(g, 3e3) });
  FAC_ACTS.fx_hoscan = (g, o, b, push) => push("hoscan", "検査を受ける(医師の指示がある場合)", { disabled: !(g.hero.cond && g.hero.cond.ill) });
  FAC_RUN.hoscan = (g, arg, tg, r) => {
    g.advance(40);
    r.msg = "機械の中でじっとして検査を受けました。結果は主治医から説明されます。";
  };
  FAC_ACTS.fx_hoor = (g, o, b, push) => push("none", "手術中のため立入禁止です", { disabled: true });
  FAC_ACTS.fx_hoer = (g, o, b, push) => {
    push("doctor", "救急で診てもらう(24時間)", { disabled: g.hero.money < yenf(g, 1500) });
  };
  FAC_ACTS.fx_hoshop = (g, o, b, push) => {
    if (o.cafe) push("hoshop:c", `コーヒーとパン(¥${yenf(g, 600)})`, { disabled: g.hero.money < yenf(g, 600) });
    else push("hoshop:m", `お見舞いの品(果物・花)を買う(¥${yenf(g, 2e3)})`, { disabled: g.hero.money < yenf(g, 2e3) });
  };
  FAC_RUN.hoshop = (g, arg, tg, r) => {
    if (arg === "c") {
      g.pay(yenf(g, 600), "院内カフェ");
      g.advance(15);
      r.msg = "ひと息つきました。" + g.chg({ hunger: 15, mood: 2 });
    } else {
      g.pay(yenf(g, 2e3), "お見舞いの品");
      g.S.hoGift = (g.S.hoGift || 0) + 1;
      r.msg = "果物のかごを買いました。病棟のナースステーションで面会を申し込めます。";
    }
  };
  FAC_ACTS.fx_honurse = (g, o, b, push) => {
    const c = g.hero.cond;
    if (c && c.ward && c.ward.b === b.idx) push("honurse:w", "看護師さんに体調を伝える");
    push("honurse:v", "面会を申し込む(お見舞い)");
  };
  FAC_RUN.honurse = (g, arg, tg, r) => {
    if (arg === "w") {
      g.advance(10);
      r.msg = "「無理しないでくださいね」と、看護師さんが点滴の速さを調整してくれました。" + g.chg({ mood: 2 });
      return;
    }
    g.advance(30);
    const gift = g.S.hoGift > 0;
    if (gift) g.S.hoGift--;
    r.msg = `面会者カードを受け取り、病室でしばらく話をしました。${gift ? "お見舞いの品をとても喜んでくれました。" : ""}` + g.chg({ mood: gift ? 4 : 2 });
  };
  FAC_ACTS.fx_hobed = (g, o, b, push) => {
    const c = g.hero.cond;
    if (c && c.ward && c.ward.b === b.idx) {
      push("hobed:s", "ベッドで休む(朝まで)");
      push("hobed:n", "少し眠る(2時間)");
    } else push("visit", "病室の様子を見る");
  };
  FAC_RUN.hobed = (g, arg, tg, r) => {
    if (arg === "s") {
      g.sleepUntilMorning(6.5);
      g.hero.stats.energy = 100;
      r.msg = "消灯の後、静かな病室で眠りました。朝の回診で先生が様子を見に来てくれました。" + g.chg({ health: 2 });
    } else {
      g.S.sleeping = true;
      g.advance(120);
      g.S.sleeping = false;
      r.msg = "点滴の音を聞きながら少し眠りました。" + g.chg({ health: 1 });
    }
  };
  FAC_ACTS.fx_hoheli = (g, o, b, push) => push("hoheli", "ドクターヘリを見学する");
  FAC_RUN.hoheli = (g, arg, tg, r) => {
    g.advance(15);
    r.msg = "赤と白のドクターヘリが待機しています。要請があれば医師と看護師を乗せて数分で飛び立ちます。" + g.chg({ mood: 2 });
  };
  // 入院: 病棟のベッドへ
  function wardSpot(g, b) {
    const nf = hospFloors(b);
    for (let lv = 3; lv < nf; lv++) {
      let I2;
      try {
        I2 = interiorOf(g, b.idx, lv).I;
      } catch (_) {
        continue;
      }
      const beds = I2.beds || [];
      if (beds.length) {
        const k = hash2(g.hero.id, lv) % beds.length;
        return { floor: lv, x: beds[k].x + 0.5, y: beds[k].y + 1.6 };
      }
    }
    return null;
  }
  // ---- 描画
  FXH.fx_scanner = 1.6;
  FXH.fx_heli = 0.1;
  FAC_DRAW.fx_scanner = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt } = d;
    d.box(c, env.P, x, y, x + 1.4, y + h, 0, 1.9, "#eef1f4");
    const q = pt(x + 1.4, y + h / 2, 0.95);
    c.fillStyle = "#3b4350";
    c.beginPath();
    c.ellipse(q[0], q[1], 0.9 * Z, 1.4 * Z, 0, 0, 7);
    c.fill();
    d.box(c, env.P, x + 1.4, y + h / 2 - 0.35, x + w, y + h / 2 + 0.35, 0, 0.7, "#c9d1da");
    if (o.mri) {
      c.fillStyle = `rgba(80,160,255,${0.3 + 0.2 * Math.sin(t * 6)})`;
      c.fillRect(q[0] - Z, q[1] - 1.6 * Z, 2 * Z, 3.2 * Z);
    }
  };
  FAC_DRAW.fx_heli = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    const cu = x + w / 2, cv2 = y + h / 2;
    const ring = [];
    for (let k = 0; k < 32; k++) ring.push(pt(cu + Math.cos(k / 32 * 6.28) * (w / 2 - 0.5), cv2 + Math.sin(k / 32 * 6.28) * (h / 2 - 0.5), 0.03));
    poly(c, ring, "#3d4a3c");
    c.strokeStyle = "#f2c94c";
    c.lineWidth = Math.max(1, Z * 0.5);
    c.beginPath();
    ring.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
    c.closePath();
    c.stroke();
    // H マーク
    c.strokeStyle = "#fff";
    c.lineWidth = Math.max(2, Z * 0.9);
    c.beginPath();
    for (const [a, b2] of [[[cu - 2, cv2 - 2.5], [cu - 2, cv2 + 2.5]], [[cu + 2, cv2 - 2.5], [cu + 2, cv2 + 2.5]], [[cu - 2, cv2], [cu + 2, cv2]]]) {
      const p0 = pt(a[0], a[1], 0.04), p1 = pt(b2[0], b2[1], 0.04);
      c.moveTo(p0[0], p0[1]);
      c.lineTo(p1[0], p1[1]);
    }
    c.stroke();
    // ドクターヘリ(ローターがゆっくり回る)
    const hu = cu + 3, hv = cv2 + 3;
    d.box(c, env.P, hu - 2.2, hv - 0.6, hu + 1.2, hv + 0.6, 0.3, 1.5, "#d93a3a");
    d.box(c, env.P, hu + 1.2, hv - 0.15, hu + 4, hv + 0.15, 0.9, 1.3, "#f4f4f4");
    const rc = pt(hu - 0.5, hv, 1.8);
    c.strokeStyle = "#2b2b2b";
    c.lineWidth = Math.max(1, Z * 0.35);
    c.beginPath();
    for (let k = 0; k < 4; k++) {
      const a = t * 0.8 + k * Math.PI / 2;
      c.moveTo(rc[0], rc[1]);
      c.lineTo(rc[0] + Math.cos(a) * 5 * Z, rc[1] + Math.sin(a) * 2.5 * Z);
    }
    c.stroke();
    void poly;
  };
