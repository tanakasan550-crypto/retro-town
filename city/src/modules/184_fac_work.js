  // src/fac_work.js — v11 の汎用の中のままだった職場・小さな施設(診療所・倉庫・物流センター・学習塾・法律事務所・芸能事務所・
  // 港湾事務所・農協・ゲームセンター)の中の作り。その職場で働く職(job)ごとの立ち位置(staffSpots の role)と、その職の実際の作業の場所を置く。
  // 操作は v11 と同じ(受付・診察 clinic/checkup・机 work・ロッカー locker・ゲーム play/pay)。年代と店ごとの違いで作り分ける
  var WORK_T = ["clinic", "warehouse", "logistics", "cram", "lawfirm", "agency", "harboroffice", "farmcoop", "gamecenter"];
  var workOn = (b) => b && WORK_T.includes(b.type) && b.campusOf == null && !b.tenants && !b.voc;
  var workFloors = (b) => ["warehouse", "logistics", "gamecenter"].includes(b.type) ? 1 : Math.max(1, Math.min(3, typeof storeys === "function" ? storeys(b) : b.floors || 1));
  for (const t of WORK_T) {
    FAC_RANGE[t] = (b) => workOn(b) ? { lo: 0, hi: workFloors(b) - 1, nf: workFloors(b) } : null;
    FAC_LABEL[t] = (b, lv) => workOn(b) ? lv === 0 ? "1F" : `${lv + 1}F` : null;
    FAC_KEY[t] = (g, b) => `${b.openYear || 0}:${Math.floor(g.year() / 5)}`;
    FAC_BUILD[t] = (b, floor, g) => workOn(b) ? buildWork(b, floor, g) : null;
  }
  function buildWork(b, floor, g) {
    const t = b.type, y = g && g.year ? g.year() : 2e3, oy = b.openYear || 1990, v = uh(b.idx, 3601), flip = v % 2 === 1;
    const F = workFloors(b), lv = Math.max(0, Math.min(F - 1, floor || 0));
    const big = t === "warehouse" || t === "logistics";
    const W2 = big ? Math.max(24, Math.min(32, b.w * 3 + (v >> 3) % 3)) : Math.max(12, Math.min(18, b.w * 3 + (v >> 3) % 3));
    const H4 = big ? Math.max(14, Math.min(18, b.h * 3 + 3)) : Math.max(10, Math.min(13, b.h * 3 + 1 + (v >> 5) % 2));
    const X = (x) => flip ? W2 - 1 - x : x;
    const P = plan(W2, H4, big ? "floor_asphalt" : t === "clinic" ? "floor_tile" : t === "gamecenter" ? "floor_dark" : "floor_carpet", t === "clinic" ? "hospital" : big ? "warehouse" : t === "gamecenter" ? "leisure" : "office");
    P.lv = lv;
    P.windows(big ? 5 : 3);
    const dx = X(big ? 3 : [W2 >> 1, 3, W2 - 4][v % 3]);
    if (lv === 0) {
      P.door(dx);
      P.reserve(dx, H4 - 4, dx, H4 - 2);
    }
    if (F > 1) {
      if (lv === 0) P.stair(X(W2 - 2), H4 - 3, 1, "上の階へ");
      else {
        P.stair(X(W2 - 2), H4 - 3, lv - 1, "下の階へ");
        if (lv + 1 < F) P.stair(X(W2 - 3), H4 - 3, lv + 1, "上の階へ");
      }
    }
    const desks = (x0, x1, y0, y1, lab, role, act = "work") => {
      let n2 = 0;
      for (let yy = y0; yy <= y1; yy += 2) for (let x = x0; x <= x1; x++) if (P.add("desk", X(x), yy, act, lab, true)) {
        P.staffSpots.push({ x: X(x), y: yy + 1, role });
        n2++;
      }
      return n2;
    };
    let label = "";
    // 奥の個室の下の壁の行(浅い建物では1行浅く)。受付はその2行下・受付の人は1行下
    const rr = Math.min(5, H4 - 6);
    if (t === "clinic") {
      label = lv === 0 ? "受付・待合・診察室" : "処置室・検査室";
      if (lv === 0) {
        // 受付と待合(入口側)・診察室(奥。個室)
        for (let x = 2; x < 5; x++) P.add("counter", X(x), rr + 2, "clinic", "受付(診察券・保険証)", true);
        P.staffSpots.push({ x: X(3), y: rr + 1, role: "reception" });
        for (let x = 6; x < W2 - 3; x++) {
          P.add("seat", X(x), H4 - 3, null, "待合の椅子", false);
          P.seatSpots.push({ x: X(x), y: H4 - 3 });
        }
        P.add("mrack", X(W2 - 2), H4 - 4, null, "雑誌・絵本の棚", true);
        const r1 = Math.min(X(1), X(7)), r2 = Math.max(X(1), X(7));
        P.room(r1, 0, r2, rr, { noTop: true, door: [X(4), rr], label: "診察室1", tile: "floor_tile" });
        P.add("hospital_bed", X(2), 1, "checkup", "診察台(診てもらう)", true);
        P.add("desk", X(5), 1, null, y >= 2000 ? "電子カルテと机" : "カルテと机", true);
        P.staffSpots.push({ x: X(5), y: 2, role: "doctor" }, { x: X(4), y: rr - 1, role: "nurse" });
        if (W2 >= 14) {
          const q1 = Math.min(X(8), X(W2 - 2)), q2 = Math.max(X(8), X(W2 - 2));
          P.room(q1, 0, q2, rr, { noTop: true, door: [X(10), rr], label: y >= 1980 ? "処置室・レントゲン" : "処置室", tile: "floor_tile" });
          P.add("hospital_bed", X(9), 1, "checkup", "処置用のベッド(点滴)", true);
          if (y >= 1980) P.add("fx_xray", X(W2 - 3), 1, null, "レントゲン装置", true);
          P.staffSpots.push({ x: X(10), y: rr - 1, role: "nurse" });
        }
        P.add("board", X(W2 - 2), 6, null, "診療時間・予防接種のお知らせ", true);
      } else {
        P.add("hospital_bed", X(2), 2, "ward", "回復室のベッド", true);
        P.add("hospital_bed", X(5), 2, "ward", "回復室のベッド", true);
        P.add("shelf", X(W2 - 3), 1, null, "薬品・検査キットの棚", true);
        P.add("desk", X(W2 - 4), 4, null, "検査機器(血液・尿)", true);
        P.staffSpots.push({ x: X(4), y: 4, role: "nurse" });
      }
    } else if (big) {
      label = t === "logistics" ? "物流センター(仕分け・保管・出荷)" : "倉庫";
      // 奥: 高い棚(パレットラック)/ 中: 仕分けのコンベヤー(物流センター)/ 手前: トラックの荷おろし場(バース)・事務所
      for (let x = 2; x < W2 - 6; x += 3) for (let yy = 1; yy <= 3; yy++) P.add("palrack", X(x), yy, null, "パレットラック(保管)", true, { w: 2, h: 1 });
      P.staffSpots.push({ x: X(4), y: 4, role: "forklift" }, { x: X(10), y: 4, role: "forklift" }, { x: X(16), y: 4, role: "stocker" });
      if (t === "logistics" || oy >= 1985) {
        for (let x = 3; x < W2 - 7; x++) P.add("conveyor", X(x), 7, null, y >= 2000 ? "自動仕分けのコンベヤー" : "仕分けのコンベヤー", true);
        for (let x = 4; x < W2 - 8; x += 3) P.staffSpots.push({ x: X(x), y: 8, role: "courier" }, { x: X(x), y: 6, role: "logistics" });
      }
      for (let k = 0; k < 3; k++) P.add("pallet", X(6 + k * 4), H4 - 4, null, "荷おろし場のパレット(入荷)", true);
      P.add("forklift", X(12), 5, null, "フォークリフト", true);
      if (W2 >= 26) P.add("forklift", X(20), 5, null, "フォークリフト", true);
      for (let k = 0; k < 3; k++) P.staffSpots.push({ x: X(7 + k * 4), y: H4 - 5, role: "truckdriver" });
      // 事務所(右奥): 配車と在庫の管理
      const o1 = Math.min(X(W2 - 6), X(W2 - 1)), o2 = Math.max(X(W2 - 6), X(W2 - 1));
      P.room(o1, 0, o2, 6, { noTop: true, door: [X(W2 - 4), 6], label: "事務所(配車・在庫管理)", tile: "floor_carpet" });
      P.add("desk", X(W2 - 5), 2, "work", y >= 1990 ? "在庫管理のパソコン" : "伝票の机", true);
      P.add("desk", X(W2 - 3), 2, "work", "配車の机(無線)", true);
      P.add("locker", X(W2 - 2), 4, "locker", "ロッカー", true);
      P.staffSpots.push({ x: X(W2 - 5), y: 3, role: "logmgr" }, { x: X(W2 - 3), y: 3, role: "officeworker" });
      P.add("board", X(1), 6, null, "安全第一・今日の出荷予定", true);
    } else if (t === "cram") {
      label = lv === 0 ? "受付・自習室" : "教室";
      if (lv === 0) {
        for (let x = 2; x < 5; x++) P.add("counter", X(x), H4 - 5, null, "受付(入塾の相談)", true);
        P.staffSpots.push({ x: X(3), y: H4 - 6, role: "reception" });
        // 講師室と自習室
        desks(2, 5, 1, 1, "講師の机(採点・授業の準備)", "tutor");
        for (let x = 7; x < W2 - 2; x++) {
          P.add("desk", X(x), 3, "study", "自習室の机(仕切りつき)", true);
          P.seatSpots.push({ x: X(x), y: 4 });
        }
        P.add("board", X(W2 - 2), 6, null, "合格実績・模試の日程", true);
      } else {
        // 教室(ホワイトボードと生徒の机。規模で1〜2教室)
        const two = W2 >= 15;
        const rooms = two ? [[1, (W2 >> 1) - 1], [(W2 >> 1), W2 - 2]] : [[1, W2 - 2]];
        rooms.forEach(([a, c], i) => {
          P.room(Math.min(X(a), X(c)), 0, Math.max(X(a), X(c)), H4 - 4, { noTop: true, door: [X(a + 2), H4 - 4], label: `教室${lv}${i ? "B" : "A"}(${i ? "個別指導" : "集団授業"})`, tile: "floor_carpet" });
          P.add("kokuban", X(a + 1), 1, null, "ホワイトボード", true, { w: 3, h: 1 });
          P.staffSpots.push({ x: X(a + 2), y: 2, role: "tutor" });
          for (let yy = 3; yy < H4 - 5; yy += 2) for (let x = a + 1; x < c; x += i ? 2 : 1) if (P.add("desk", X(x), yy, "study", "生徒の机", true)) P.seatSpots.push({ x: X(x), y: yy + 1 });
        });
      }
    } else if (t === "lawfirm") {
      label = lv === 0 ? "受付・相談室" : "弁護士室・書庫";
      if (lv === 0) {
        for (let x = 2; x < 5; x++) P.add("counter", X(x), rr + 2, null, "受付(法律相談の予約)", true);
        P.staffSpots.push({ x: X(3), y: rr + 1, role: "officeworker" });
        const r1 = Math.min(X(1), X(7)), r2 = Math.max(X(1), X(7));
        P.room(r1, 0, r2, rr, { noTop: true, door: [X(4), rr], label: "相談室(秘密を守ります)", tile: "floor_carpet" });
        P.add("table", X(2), 2, "work", "相談の机", true, { w: 2, h: 1 });
        P.staffSpots.push({ x: X(2), y: 1, role: "lawyer" });
        P.seatSpots.push({ x: X(2), y: 3 });
        desks(9, W2 - 3, 2, 4, "事務の机(書類作成)", "officeworker");
        P.add("bookcase", X(W2 - 2), 1, null, "六法全書・判例集", true);
      } else {
        desks(2, W2 - 4, 2, 2, "弁護士の机(訴状・準備書面)", "lawyer");
        for (let x = 2; x < W2 - 2; x++) P.add("bookcase", X(x), H4 - 4, null, "書庫(事件の記録)", true);
      }
    } else if (t === "agency") {
      label = lv === 0 ? "事務所・会議室" : "レッスン室";
      if (lv === 0) {
        desks(2, W2 - 6, 2, 4, "マネージャーの机(出演の調整)", "officeworker");
        P.add("table", X(W2 - 4), 6, "work", "打ち合わせの机(台本読み)", true, { w: 2, h: 1 });
        P.add("board", X(W2 - 2), 1, null, "所属タレントのポスター・今月の予定", true);
        P.staffSpots.push({ x: X(W2 - 4), y: 7, role: "entertainer" });
      } else {
        P.fill(1, 1, W2 - 2, H4 - 2, "floor_wood");
        P.add("mirror", X(2), 1, null, "鏡の壁(ダンス)", true, { w: W2 - 4, h: 1, deco: false });
        for (let x = 3; x < W2 - 3; x += 3) P.staffSpots.push({ x: X(x), y: 4, role: "entertainer" });
        P.add("desk", X(W2 - 2), 6, "work", "ピアノ(歌のレッスン)", true);
      }
    } else if (t === "harboroffice" || t === "farmcoop") {
      const coop = t === "farmcoop";
      label = coop ? lv === 0 ? "窓口・集荷場" : "事務室" : "港湾事務所";
      if (lv === 0) {
        for (let x = 2; x < 6; x++) P.add("counter", X(x), H4 - 5, null, coop ? "窓口(出荷・貯金・共済の相談)" : "窓口(入出港の届け)", true);
        P.staffSpots.push({ x: X(3), y: H4 - 6, role: "officeworker" }, { x: X(5), y: H4 - 6, role: "officeworker" });
        if (coop) {
          for (let x = 8; x < W2 - 2; x += 2) P.add("pallet", X(x), 2, null, "集荷場(米・野菜の箱)", true);
          P.add("desk", X(W2 - 3), 5, "work", "検査台(等級を決める)", true);
          P.staffSpots.push({ x: X(9), y: 3, role: "farmer" }, { x: X(W2 - 3), y: 6, role: "forester" });
          P.add("board", X(1), 1, null, "今週の出荷予定・農薬の講習会", true);
        } else {
          desks(8, W2 - 3, 2, 2, "船の動きを見る机(無線)", "officeworker");
          P.add("board", X(1), 1, null, "入港予定の船・潮位", true);
          P.add("fx_radar", X(W2 - 2), 4, null, "レーダーの画面", true);
          P.staffSpots.push({ x: X(W2 - 3), y: 5, role: "logistics" });
        }
      } else desks(2, W2 - 3, 2, H4 - 5, coop ? "事務の机(組合員の記録)" : "事務の机", "officeworker");
    } else if (t === "gamecenter") {
      label = "ゲームセンター";
      const gens = y < 1985 ? ["テーブルゲーム(インベーダー)", "ピンボール"] : y < 2e3 ? ["格闘ゲーム", "UFOキャッチャー", "レースゲーム", "メダルゲーム"] : ["格闘ゲーム", "UFOキャッチャー", "音楽ゲーム", "メダルゲーム", "レースゲーム"];
      let k = 0;
      for (let yy = 2; yy < H4 - 5; yy += 3) for (let x = 2; x < W2 - 2; x++) if (P.add("arcade", X(x), yy, "play", gens[(k++ + (v >> 4)) % gens.length], true) && x % 2 === 0) P.seatSpots.push({ x: X(x), y: yy + 1 });
      if (y >= 1995) P.add("fx_photo", X(W2 - 2), H4 - 4, "play", "プリントシール機", true);
      P.add("counter", X(W2 - 3), H4 - 3, "pay", "両替機・カウンター", true);
      P.staffSpots.push({ x: X(W2 - 4), y: H4 - 3, role: "clerk" }, { x: X(W2 >> 1), y: 4, role: "clerk" });
    }
    return P.done({ floors: F, floor: lv, lv, lo: 0, hi: F - 1, wallH: big ? 4 : 2.8, label, work: { t } });
  }
  FXH.fx_xray = 1.8;
  FAC_DRAW.fx_xray = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    box(c, d0.P, x + 0.1, y + 0.2, x + 0.9, y + 0.8, 0, 0.6, "#c9ccd2");
    box(c, d0.P, x + 0.3, y + 0.3, x + 0.7, y + 0.5, 0.6, 1.8, "#8f949c");
  };
  FXH.fx_radar = 1.3;
  FAC_DRAW.fx_radar = (c, env, o, H5, d0) => {
    const { x, y, box, pt, Z, t } = d0;
    box(c, d0.P, x + 0.1, y + 0.2, x + 0.9, y + 0.8, 0, 0.9, "#2b3a32");
    const a = pt(x + 0.5, y + 0.5, 1.0);
    c.strokeStyle = "#5af08a";
    c.lineWidth = Math.max(1, 0.3 * Z);
    c.beginPath();
    c.arc(a[0], a[1], 2.2 * Z, 0, 7);
    c.moveTo(a[0], a[1]);
    c.lineTo(a[0] + Math.cos(t * 2) * 2.2 * Z, a[1] + Math.sin(t * 2) * 1.1 * Z);
    c.stroke();
  };
  FXH.fx_photo = 2;
  FAC_DRAW.fx_photo = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    box(c, d0.P, x, y + 0.1, x + 1, y + 0.9, 0, 2, "#f2a6c8");
    box(c, d0.P, x + 0.2, y + 0.85, x + 0.8, y + 0.95, 0.4, 1.8, "#ffffff");
  };
