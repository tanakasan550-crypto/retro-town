  // src/fac_campus.js — 学校・大学・動物園の敷地の中の棟(sites.js の付属棟)の中の作り
  // 学校の体育館は「学校の体育館」(商業ジムではない): ステージ・コート・バスケットゴール・バレーのネット・器具庫(跳び箱・マット)・下足箱。
  // 部室棟・特別教室棟(理科室・家庭科室・音楽室・美術室・図書室・パソコン室)・動物園の飼育員管理棟。
  // 入れる人は actions.js isOpenFor の「敷地の中の棟」の決まり(その学校の生徒と職員・登校日)。
  var campusParent = (g, b) => g.world.map.buildings[b.campusOf ?? b.parentB] || null;
  FAC_RANGE.annex = (b) => {
    const n2 = b.kind === "gym" || b.kind === "club" ? 1 : Math.max(1, b.nf || b.floors || 1);
    return { lo: 0, hi: n2 - 1, nf: n2 };
  };
  FAC_LABEL.annex = (b, lv) => b.kind === "gym" ? "アリーナ" : `${lv + 1}階`;
  FAC_BUILD.annex = (b, floor, g) => {
    const f = { gym: campusGym, club: campusClub, wing: campusWing, keeper: zooKeeperHouse }[b.kind];
    return f ? f(b, floor, g) : null;
  };
  function campusGym(b, floor, g) {
    const pb = g ? campusParent(g, b) : null, pt2 = pb ? pb.type : "hs";
    // 大学・高校は広いアリーナ(コート2面)、小学校・中学校は1面+ステージ
    const big = pt2 === "univ" || pt2 === "hs";
    const W2 = big ? 34 : 28, H4 = big ? 24 : 20;
    const P = plan(W2, H4, "floor_wood", "school");
    P.lv = 0;
    const dx = W2 >> 1;
    P.door(dx);
    // ステージ(北側)と緞帳
    P.wide("fx_gstage", 8, 1, W2 - 16, 4, "fx_gymstage", "ステージ");
    P.add("clock", 3, 1, null, "時計", true);
    P.add("fx_gflag", W2 - 4, 1, null, pb ? `${pb.name}の校旗` : "校旗", true);
    // コート(床のライン)・バスケットゴール・バレーボールのネット
    const cy0 = 6, cy1 = H4 - 6;
    // (ネットを先に置く: コートの線は範囲全体を占有するため)
    P.add("fx_vnet", dx, cy0 + 1, null, "バレーボールのネット", false, { w: 1, h: cy1 - cy0 - 1 });
    P.add("fx_courtlines", 2, cy0, null, "コート", false, { w: W2 - 4, h: cy1 - cy0 + 1, two: big });
    const my = (cy0 + cy1) >> 1;
    P.add("fx_hoop", 1, my, "fx_hoop", "バスケットゴール", true, { face: 1 });
    P.add("fx_hoop", W2 - 2, my, "fx_hoop", "バスケットゴール", true, { face: -1 });
    // 器具庫(跳び箱・マット・ボールかご)
    P.room(1, H4 - 6, 7, H4 - 2, { door: [7, H4 - 4], label: "体育器具庫", tile: "floor_wood", lowFront: false });
    P.add("fx_tobibako", 2, H4 - 5, "fx_tobibako", "跳び箱", true);
    P.wide("mat", 4, H4 - 5, 2, 1, null, "体操マット", { col: "#3a6a9a" });
    P.add("basket", 2, H4 - 3, "fx_gymball", "ボールかご", true);
    P.add("basket", 3, H4 - 3, "fx_gymball", "ボールかご", true);
    // 下足箱・入口
    for (let x = dx - 6; x <= dx - 2; x++) P.add("shoebox", x, H4 - 3, null, "下足箱", true);
    for (let x = dx + 2; x <= dx + 6; x++) P.add("shoebox", x, H4 - 3, null, "下足箱", true);
    P.sign(dx, H4 - 4, "体育館シューズにはきかえましょう");
    // 壁ぎわのベンチ・トイレ
    for (let y = cy0 + 1; y < cy1; y += 3) P.add("bench", W2 - 2, y, "bench", "ベンチ", true);
    P.add("toilet", W2 - 3, H4 - 3, "toilet", "トイレ");
    P.staffSpots.push({ x: dx, y: 5, role: "teacher" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 5, label: "アリーナ" });
  }
  // 部室棟: 運動部・文化部の部室が並ぶ(中学・高校・大学)
  var CLUBS = { jh: ["野球部", "サッカー部", "バスケ部", "吹奏楽部"], hs: ["野球部", "サッカー部", "テニス部", "陸上部", "吹奏楽部", "美術部"], univ: ["サークル室A", "サークル室B", "軽音楽部", "写真部", "山岳部", "放送研究会"] };
  function campusClub(b, floor, g) {
    const pb = g ? campusParent(g, b) : null;
    const names = CLUBS[pb && pb.type] || CLUBS.hs;
    const RW = 6, W2 = names.length * RW + 2, H4 = 12;
    const P = plan(W2, H4, "floor_corr", "school");
    P.lv = 0;
    P.door(W2 >> 1);
    names.forEach((nm, i) => {
      const x0 = 1 + i * RW, x1 = x0 + RW - 1;
      P.room(x0, 1, x1, 7, { door: [x0 + 2, 7], label: nm, tile: "floor_wood" });
      P.add("locker", x0 + 1, 2, null, "ロッカー", true);
      P.add("locker", x0 + 2, 2, null, "ロッカー", true);
      if (/吹奏楽|軽音/.test(nm)) P.add("piano", x0 + 3, 3, "fx_clubroom", "楽器", true, { w: 2, h: 1 });
      else if (/美術|写真/.test(nm)) P.add("table", x0 + 3, 3, "fx_clubroom", "作業台", true);
      else P.add("basket", x0 + 3, 2, "fx_clubroom", nm.replace(/部$/, "") + "の道具", true);
      P.add("bench", x0 + 2, 5, "bench", "ベンチ", true);
    });
    P.add("shoebox", 1, H4 - 3, null, "下足箱", true);
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 3, label: "部室棟" });
  }
  // 特別教室棟: 階ごとに特別教室
  var WING_ROOMS = [["理科室", "家庭科室"], ["音楽室", "美術室"], ["図書室", "パソコン室"]];
  function campusWing(b, floor, g) {
    const nf = FAC_RANGE.annex(b).nf, f = Math.max(0, Math.min(nf - 1, floor | 0));
    const W2 = 30, H4 = 16;
    const P = plan(W2, H4, f === 0 ? "floor_tile" : "floor_wood", "school");
    P.lv = f;
    if (f === 0) P.door(W2 >> 1);
    P.fill(1, H4 - 5, W2 - 2, H4 - 2, "floor_corr");
    const rooms = WING_ROOMS[f % WING_ROOMS.length];
    rooms.forEach((nm, i) => {
      const x0 = i ? 16 : 1, x1 = i ? W2 - 2 : 13;
      P.room(x0, 1, x1, H4 - 6, { door: [x0 + 3, H4 - 6], label: nm });
      P.add("kokuban", x0 + 4, 1, null, "黒板", true, { w: 4, h: 1 });
      for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
        const x = x0 + 2 + k * 4, y = 4 + r * 3;
        if (nm === "理科室" || nm === "家庭科室") P.add(nm === "理科室" ? "table" : "sink", x, y, "fx_spclass", nm === "理科室" ? "実験台" : "調理台", true, { w: 2, h: 1, room: nm });
        else if (nm === "図書室") P.add("bookcase", x, y, "fx_spclass", "本棚", true, { w: 2, h: 1, room: nm });
        else if (nm === "パソコン室") P.add("desk", x, y, "fx_spclass", "パソコン", true, { w: 2, h: 1, room: nm });
        else if (nm === "音楽室" && r === 0 && k === 0) P.add("piano", x, y, "fx_spclass", "ピアノ", true, { w: 2, h: 1, room: nm });
        else P.add("desk", x, y, "fx_spclass", nm === "美術室" ? "画板の机" : "机", true, { w: 2, h: 1, room: nm });
      }
    });
    if (nf > 1) {
      if (f < nf - 1) P.stair(W2 - 3, H4 - 4, f + 1, "階段(上へ)");
      if (f > 0) P.stair(2, H4 - 4, f - 1, "階段(下へ)");
    }
    return P.done({ floors: nf, floor: f, lv: f, lo: 0, hi: nf - 1, wallH: 3, label: `${f + 1}階` });
  }
  // 動物園の飼育員管理棟(関係者のみ)
  function zooKeeperHouse(b, floor, g) {
    const W2 = 24, H4 = 12;
    const P = plan(W2, H4, "floor_tile", "office");
    P.lv = 0;
    P.door(W2 >> 1);
    P.room(1, 1, 11, 7, { door: [6, 7], label: "飼育員室" });
    for (let k = 0; k < 3; k++) P.add("desk", 2 + k * 3, 3, null, "飼育日誌の机", true, { w: 2, h: 1 });
    for (let k = 0; k < 4; k++) P.add("locker", 2 + k, 1, null, "ロッカー", true);
    P.room(13, 1, W2 - 2, 7, { door: [17, 7], label: "調餌室(エサの準備)" });
    P.add("sink", 14, 2, null, "流し", true, { w: 2, h: 1 });
    P.add("fridge", 17, 2, null, "エサの冷蔵庫", true);
    P.add("table", 19, 4, null, "調餌台", true, { w: 2, h: 1 });
    P.add("board", 12, 9, null, "当番表・健康チェック表", true);
    P.staffSpots.push({ x: 4, y: 4, role: "keeper" }, { x: 18, y: 5, role: "keeper" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 3, label: "飼育員管理棟" });
  }
  // ---- 操作
  var gymSay = (g, L3) => L3[uh(g.absMin() | 0, 9) % L3.length];
  FAC_ACTS.fx_hoop = (g, o, b, push) => push("gymshoot", "シュート練習をする(20分)", { disabled: g.hero.stats.energy < 10 });
  FAC_RUN.gymshoot = (g, arg, tg, r) => {
    g.advance(20);
    r.msg = gymSay(g, ["フリースローを10本。6本入りました。", "レイアップの練習。だんだんリズムがつかめてきました。", "スリーポイントは遠い…。でも1本入りました!"]) + g.chg({ fitness: 1, energy: -6, mood: 2 });
  };
  FAC_ACTS.fx_tobibako = (g, o, b, push) => {
    if (g.age() <= 15) push("gymvault", "跳び箱を跳ぶ(15分)", { disabled: g.hero.stats.energy < 8 });
    else push("gymvault", "跳び箱とマットを片付けるのを手伝う(10分)");
  };
  FAC_RUN.gymvault = (g, arg, tg, r) => {
    if (g.age() <= 15) {
      g.advance(15);
      r.msg = gymSay(g, ["5段を跳べました!", "4段で手をつく位置を直したら、きれいに跳べました。", "6段はまだこわい…。先生が補助してくれました。"]) + g.chg({ fitness: 1, energy: -5, mood: 2 });
    } else {
      g.advance(10);
      r.msg = "器具庫に跳び箱とマットを片付けました。" + g.chg({ social: 0.5, energy: -3 });
    }
  };
  FAC_ACTS.fx_gymball = (g, o, b, push) => push("gymball", "ボールを出して遊ぶ(20分)", { disabled: g.hero.stats.energy < 8 });
  FAC_RUN.gymball = (g, arg, tg, r) => {
    g.advance(20);
    r.msg = gymSay(g, ["バレーボールでパスの練習をしました。", "ドッジボールで盛り上がりました。", "ボールを使ってストレッチをしました。"]) + g.chg({ fitness: 0.8, social: 0.5, energy: -5, mood: 2 });
  };
  // ステージ: 月ごとの学校行事(入学式・始業式・文化祭・卒業式など)
  var GYM_EVENTS = { 3: "卒業式", 4: "入学式・始業式", 7: "終業式", 9: "始業式", 11: "文化祭(体育館の発表)", 12: "終業式", 1: "始業式" };
  FAC_ACTS.fx_gymstage = (g, o, b, push) => {
    const dt = g.date(), ev = GYM_EVENTS[dt.m0 + 1];
    push("gymstage", ev ? `ステージを見る(今月の行事: ${ev})` : "ステージを見る");
  };
  FAC_RUN.gymstage = (g, arg, tg, r) => {
    const dt = g.date(), ev = GYM_EVENTS[dt.m0 + 1];
    g.advance(5);
    r.msg = ev ? `${ev}の準備で、ステージに紅白幕と演台が置かれています。` : "朝の全校集会では、ここで校長先生の話を聞きます。";
  };
  FAC_ACTS.fx_clubroom = (g, o, b, push) => {
    const club = g.hero.flags.club;
    push("clubroom", club && club !== "none" ? "部室で道具の手入れをする(15分)" : "部室をのぞく(部活に入っていません)", { disabled: !club || club === "none" });
  };
  FAC_RUN.clubroom = (g, arg, tg, r) => {
    g.advance(15);
    r.msg = "部室で道具の手入れをしながら、先輩と次の大会の話をしました。" + g.chg({ social: 0.6, mood: 1 });
  };
  FAC_ACTS.fx_spclass = (g, o, b, push) => push("spclass:" + (o.room || ""), `${o.room || "教室"}で自習する(30分)`);
  FAC_RUN.spclass = (g, arg, tg, r) => {
    g.advance(30);
    const say = { 理科室: "実験の手順をノートにまとめました。", 家庭科室: "調理実習の献立を考えました。", 音楽室: "合唱曲のパートを練習しました。", 美術室: "スケッチを1枚仕上げました。", 図書室: "静かな図書室で調べものをしました。", パソコン室: "パソコンで資料を作りました。" }[arg] || "自習しました。";
    r.msg = say + g.chg({ intel: 0.6, energy: -3 });
  };
  // ---- 描画
  FXH.fx_courtlines = 0.02;
  FAC_DRAW.fx_courtlines = (c, env, o, H5, d0) => {
    const { x, y, w, h, pt, Z } = d0;
    const line = (pts, col) => {
      c.strokeStyle = col;
      c.lineWidth = Math.max(1, Z * 0.25);
      c.beginPath();
      pts.forEach((p, i) => i ? c.lineTo(...pt(p[0], p[1], 0.02)) : c.moveTo(...pt(p[0], p[1], 0.02)));
      c.stroke();
    };
    const rect = (x0, y0, x1, y1, col) => line([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], col);
    // バスケットボール(白)
    rect(x, y, x + w, y + h, "rgba(255,255,255,0.85)");
    line([[x + w / 2, y], [x + w / 2, y + h]], "rgba(255,255,255,0.85)");
    const cyy = y + h / 2;
    for (const [ex, s] of [[x, 1], [x + w, -1]]) {
      rect(Math.min(ex, ex + s * 4), cyy - 1.5, Math.max(ex, ex + s * 4), cyy + 1.5, "rgba(255,255,255,0.85)");
      const arc = [];
      for (let k = 0; k <= 12; k++) {
        const a = -Math.PI / 2 + k / 12 * Math.PI;
        arc.push([ex + s * Math.cos(a) * 5.5, cyy + Math.sin(a) * 5.5]);
      }
      line(arc, "rgba(255,255,255,0.85)");
    }
    // バレーボール(黄)・バドミントン(緑)
    rect(x + w / 2 - 6, y + 1, x + w / 2 + 6, y + h - 1, "rgba(240,200,60,0.85)");
    if (o.two) for (const bx of [x + 2, x + w - 8]) rect(bx, y + 1.5, bx + 6, y + h - 1.5, "rgba(80,170,90,0.75)");
  };
  FAC_DRAW.fx_hoop = (c, env, o, H5, d0) => {
    const { x, y, box, pt, Z } = d0, f = o.face || 1, bx = f > 0 ? x + 0.15 : x + 0.7;
    box(c, d0.P, bx, y + 0.4, bx + 0.15, y + 0.6, 0, 3.2, "#5b606a");
    box(c, d0.P, f > 0 ? bx + 0.15 : bx - 0.05, y - 0.4, f > 0 ? bx + 0.2 : bx, y + 1.4, 2.4, 3.4, "#f4f6f8");
    const rc = pt(bx + f * 0.55 + 0.07, y + 0.5, 2.6);
    c.strokeStyle = "#e8642a";
    c.lineWidth = Math.max(1, Z * 0.35);
    c.beginPath();
    c.ellipse(rc[0], rc[1], 0.45 * Z * 2, 0.22 * Z * 2, 0, 0, 7);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.8)";
    c.lineWidth = 1;
    for (let k = -2; k <= 2; k++) {
      c.beginPath();
      c.moveTo(rc[0] + k * 0.35 * Z, rc[1]);
      c.lineTo(rc[0] + k * 0.2 * Z, rc[1] + 1.4 * Z);
      c.stroke();
    }
  };
  FAC_DRAW.fx_vnet = (c, env, o, H5, d0) => {
    const { x, y, h, box, pt } = d0, u = x + 0.5;
    box(c, d0.P, u - 0.06, y - 0.06, u + 0.06, y + 0.06, 0, 2.5, "#c9ccd2");
    box(c, d0.P, u - 0.06, y + h - 0.06, u + 0.06, y + h + 0.06, 0, 2.5, "#c9ccd2");
    const a = pt(u, y, 2.4), b2 = pt(u, y + h, 2.4), a1 = pt(u, y, 1.6), b1 = pt(u, y + h, 1.6);
    c.fillStyle = "rgba(30,30,40,0.25)";
    c.beginPath();
    c.moveTo(...a);
    c.lineTo(...b2);
    c.lineTo(...b1);
    c.lineTo(...a1);
    c.closePath();
    c.fill();
    c.strokeStyle = "#f4f6f8";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(...a);
    c.lineTo(...b2);
    c.stroke();
  };
  FAC_DRAW.fx_tobibako = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    for (let k = 0; k < 5; k++) box(c, d0.P, x + 0.12 + k * 0.02, y + 0.15, x + 0.88 - k * 0.02, y + 0.85, k * 0.22, k * 0.22 + 0.2, k % 2 ? "#b88a52" : "#c99a5e");
    box(c, d0.P, x + 0.2, y + 0.2, x + 0.8, y + 0.8, 1.1, 1.22, "#f0ece0");
  };
  // 体育館のステージ(高さ約1m)と奥の緞帳
  FAC_DRAW.fx_gstage = (c, env, o, H5, d0) => {
    const { x, y, w, h, box, pt, Z } = d0;
    box(c, d0.P, x, y, x + w, y + h, 0, 0.9, "#7a5636");
    box(c, d0.P, x, y + h - 0.05, x + w, y + h, 0, 0.9, "#5a3a22");
    // 緞帳: 奥の壁ぎわに一枚の幕(ひだを濃淡の帯で)
    for (let k = 0; k < w * 2; k++) {
      const u0 = x + k / 2, u1 = u0 + 0.5;
      c.fillStyle = k % 2 ? "#8a1f2a" : "#a1283a";
      c.beginPath();
      c.moveTo(...pt(u0, y + 0.1, 0.9));
      c.lineTo(...pt(u1, y + 0.1, 0.9));
      c.lineTo(...pt(u1, y + 0.1, 4));
      c.lineTo(...pt(u0, y + 0.1, 4));
      c.closePath();
      c.fill();
    }
    const em = pt(x + w / 2, y + 0.2, 4.4);
    c.fillStyle = "#2a3f7a";
    c.fillRect(em[0] - 3 * Z, em[1] - 0.6 * Z, 6 * Z, 1.2 * Z);
  };
  FAC_DRAW.fx_gcurtain = (c, env, o, H5, d0) => {
    const { x, y, w, pt, Z } = d0;
    for (let k = 0; k < w * 3; k++) {
      const u = x + k / 3, a = pt(u, y + 0.1, 0.5), b2 = pt(u, y + 0.1, 3.6);
      c.fillStyle = k % 2 ? "#8a1f2a" : "#a1283a";
      c.fillRect(a[0], b2[1], Math.max(1, Z * 0.7), a[1] - b2[1]);
    }
  };
  FAC_DRAW.fx_gflag = (c, env, o, H5, d0) => {
    const { x, y, box, pt, Z } = d0;
    box(c, d0.P, x + 0.45, y + 0.45, x + 0.55, y + 0.55, 0, 3, "#c9a94a");
    const a = pt(x + 0.55, y + 0.5, 2.9);
    c.fillStyle = "#2a3f7a";
    c.fillRect(a[0], a[1], 1.6 * Z, 1.1 * Z);
    c.fillStyle = "#f2d16b";
    c.beginPath();
    c.arc(a[0] + 0.8 * Z, a[1] + 0.55 * Z, 0.3 * Z, 0, 7);
    c.fill();
  };
