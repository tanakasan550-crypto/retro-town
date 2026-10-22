  // src/fac_station.js — 駅: コンコース(券売機・みどりの窓口・駅弁・待合室)→ 自動改札(切符が無いと通れない)→
  // 階段・エレベーター → 路線ごとのホーム(列車が入線・停車・発車)→ 乗車 → 到着駅のホーム → 改札で切符回収 → 出口
  function stLines(g, b) {
    const tr = g.tr;
    if (!tr || !b.stationId) return [];
    return tr.lines.filter((L3) => L3.stops.some((s) => s.id === b.stationId));
  }
  // 階の割り当て: 地上の路線は 2F〜、地下の路線は B1〜(地下鉄出入口は 1F入口 → B1改札 → B2〜ホーム)
  function stLayout(g, b) {
    const all = stLines(g, b);
    const surf = all.filter((L3) => !L3.underground).slice(0, 3), under = all.filter((L3) => L3.underground).slice(0, 3);
    const metro = b.type === "metro";
    if (metro) return { metro, surf: [], under, lo: -(under.length + 1), hi: 0, gateF: -1 };
    return { metro, surf: surf.length ? surf : [], under, lo: -under.length, hi: Math.max(1, surf.length), gateF: 0 };
  }
  function stLineFloor(lay, L3) {
    const i = lay.surf.indexOf(L3);
    if (i >= 0) return i + 1;
    const j = lay.under.indexOf(L3);
    if (j >= 0) return lay.metro ? -(j + 2) : -(j + 1);
    return null;
  }
  var stFloors = (g, b) => {
    const lay = stLayout(g, b);
    return lay.hi - lay.lo + 1;
  };
  for (const tp of ["station", "metro"]) {
    FAC_RANGE[tp] = (b) => {
      if (!G3) return { lo: 0, hi: 1, nf: 2 };
      const lay = stLayout(G3, b);
      return { lo: lay.lo, hi: lay.hi, nf: lay.hi + 1 };
    };
    FAC_LABEL[tp] = (b, lv) => {
      const lay = G3 ? stLayout(G3, b) : { surf: [], under: [], metro: false };
      const fl = lv < 0 ? `B${-lv}F` : `${lv + 1}F`;
      if (lay.metro && lv === 0) return "1F 地下鉄出入口";
      if (lay.metro && lv === -1 || !lay.metro && lv === 0) return `${fl} コンコース・改札`;
      const L3 = [...lay.surf, ...lay.under].find((q) => stLineFloor(lay, q) === lv);
      return L3 ? `${fl} ${L3.name}ホーム` : `${fl} ホーム`;
    };
    FAC_KEY[tp] = (g) => g.S.rail ? "t" + g.S.rail.to : "";
    FAC_BUILD[tp] = (b, floor, g) => {
      if (!g) return null;
      const lay = stLayout(g, b);
      if (lay.metro && floor === 0) return stMetroEntrance(b, g, lay);
      if (floor === lay.gateF) return stConcourse(b, g, lay);
      const L3 = [...lay.surf, ...lay.under].find((q) => stLineFloor(lay, q) === floor);
      return stPlatform(b, g, floor, lay, L3);
    };
  }
  function stMetroEntrance(b, g, lay) {
    const W2 = 16, H4 = 11;
    const P = plan(W2, H4, "floor_tile", "station");
    P.lv = 0;
    P.door(8);
    P.stair(6, 2, -1, "B1F 改札へ(階段)");
    P.stair(7, 2, -1, "B1F 改札へ(エスカレーター)");
    P.lifts(10, 1, 1, lay.lo, lay.hi, "エレベーター");
    P.sign(8, 5, `${b.name.replace(/駅$/, "")}駅 ${lay.under.map((q) => q.name).join("・")}`);
    P.wide("board", 1, 1, 3, 1, "timetable", "路線図・運賃表", {});
    P.add("board", 13, 1, "fx_stinfo", "出口案内・周辺地図", true);
    P.add("vending", 1, 7, null, "自販機");
    P.staffSpots.push({ x: 4, y: 6, role: "staff" });
    return P.done({ floors: lay.hi - lay.lo + 1, floor: 0, lv: 0, lo: lay.lo, hi: lay.hi, wallH: 3, label: "1F 地下鉄出入口" });
  }
  function stConcourse(b, g, lay) {
    const W2 = 48, H4 = 22;
    const P = plan(W2, H4, lay.metro ? "floor_tile" : "floor_marble", "station");
    P.lv = lay.gateF;
    const nf = lay.hi - lay.lo + 1;
    if (!lay.metro) P.windows(4);
    const dx = 24;
    if (!lay.metro) P.door(dx);
    else {
      P.stair(dx - 1, H4 - 2, 0, "1F 出入口へ(階段)");
      P.stair(dx, H4 - 2, 0, "1F 出入口へ(エスカレーター)");
    }
    const gy = 10;
    // 自動改札の列(門扉の間は通路。切符が無いと押し戻される)
    P.hwall(2, W2 - 3, gy, [19, 21, 23, 25, 27], "改札の仕切り");
    for (const x of [19, 21, 23, 25, 27]) P.add("gate", x, gy, "fx_stgate", "自動改札(きっぷ・ICカード)", false);
    P.add("counter", 29, gy, "fx_stgate", "有人改札(駅員さん)", true);
    P.staffSpots.push({ x: 29, y: gy - 1, role: "gate" });
    P.sign(23, gy + 1, "改札口 TICKET GATES");
    // 券売機・みどりの窓口・運賃表
    for (let x = 8; x <= 14; x += 2) P.add("tmachine", x, gy + 2, "fx_stticket", "自動券売機(きっぷ・ICチャージ)", true);
    P.wide("board", 8, gy + 1, 7, 1, "timetable", "運賃表・路線図", { wall: true });
    P.wide("counter", 2, gy + 2, 4, 1, "fx_stticket", "みどりの窓口(きっぷ・定期券)");
    P.staffSpots.push({ x: 3, y: gy + 1, role: "ticket" });
    // 駅弁・キオスク
    P.fill(33, 12, W2 - 2, H4 - 2, "floor_wood");
    P.sign(38, 12, "駅弁 EKIBEN");
    P.add("shelf", 34, 14, "shelf", "駅弁売り場(幕の内・ご当地弁当・お茶)");
    P.add("shelf", 35, 14, "shelf", "駅弁売り場(幕の内・ご当地弁当・お茶)");
    P.add("shelf", 36, 14, "shelf", "駅弁売り場(鯛めし・牛たん・いかめし)");
    P.add("register", 38, 14, "register", "駅弁売り場 レジ");
    P.add("kiosk", 41, 14, "shelf", "売店(新聞・飲み物・お菓子)");
    P.wide("showcase", 34, 17, 4, 1, "shelf", "おみやげ(銘菓・地酒・工芸品)");
    P.staffSpots.push({ x: 38, y: 13, role: "shop" }, { x: 41, y: 13, role: "shop" });
    // 待合室・ロッカー・トイレ
    for (let x = 3; x <= 13; x += 2) {
      P.add("bench", x, H4 - 4, "rest", "待合室のベンチ", false);
      P.seatSpots.push({ x, y: H4 - 4 });
    }
    P.sign(8, H4 - 6, "待合室");
    P.add("locker", 2, H4 - 2, "locker", "コインロッカー");
    P.add("locker", 3, H4 - 2, "locker", "コインロッカー");
    P.add("toilet", W2 - 2, gy + 2, "toilet", "トイレ");
    P.add("board", 18, H4 - 2, "fx_stinfo", "駅前案内(バス・タクシー乗り場)", true);
    P.add("vending", 16, gy + 2, null, "自販機");
    P.add("aed", 30, H4 - 2, null, "AED");
    // 改札内: 発車標・階段・エレベーター
    P.wide("dboard", 16, 1, 6, 1, "fx_stdep", "発車標(次の列車)", {});
    [...lay.surf, ...lay.under].forEach((ln, i) => {
      const x = 2 + i * 4;
      const f = stLineFloor(lay, ln);
      P.stair(x, 1, f, `${ln.name}ホームへ(${f < 0 ? "B" + -f : f + 1}F)`);
      P.sign(x, 3, `${i * 2 + 1}・${i * 2 + 2}番線 ${ln.name}`);
    });
    P.lifts(28, 1, 1, lay.lo, lay.hi, "エレベーター(ホーム)");
    for (let x = 32; x <= 42; x += 3) P.add("bench", x, 6, "rest", "ベンチ", false);
    P.add("toilet", W2 - 2, 2, "toilet", "トイレ(改札内)");
    P.staffSpots.push({ x: 20, y: 5, role: "staff" });
    return P.done({ floors: nf, floor: lay.gateF, lv: lay.gateF, lo: lay.lo, hi: lay.hi, wallH: 3.4, noDoor: lay.metro, gate: { y: gy, x0: 2, x1: W2 - 3 }, label: FAC_LABEL[b.type](b, lay.gateF) });
  }
  function stPlatform(b, g, floor, lay, ln) {
    const W2 = 52, H4 = 18;
    const P = plan(W2, H4, "floor_tile", "station");
    P.lv = floor;
    const nf = lay.hi - lay.lo + 1;
    const under = !!(ln && ln.underground);
    const si = ln ? ln.stops.findIndex((s) => s.id === b.stationId) : -1;
    const n2 = ln ? ln.stops.length : 0;
    let toA = ln && si < n2 - 1 ? ln.stops[n2 - 1].name : null, toB = ln && si > 0 ? ln.stops[0].name : null;
    if (ln && ln.ring) {
      toA = "外回り";
      toB = "内回り";
    }
    const t1 = Math.max(0, [...lay.surf, ...lay.under].indexOf(ln)) * 2 + 1;
    // 線路(北)・島式ホーム・線路(南)
    P.fill(0, 1, W2 - 1, 4, "floor_asphalt");
    P.fill(0, 12, W2 - 1, 15, "floor_asphalt");
    P.add("fx_track", 0, 1, toA ? "fx_stboard" : null, toA ? `${t1}番線 ${ln.name} ${toA}方面` : "線路", true, { w: W2, h: 4, col: ln && ln.color, dir: 1, line: ln && ln.id, ph: 0, to: toA });
    P.add("fx_track", 0, 12, toB ? "fx_stboard" : null, toB ? `${t1 + 1}番線 ${ln.name} ${toB}方面` : "線路", true, { w: W2, h: 4, col: ln && ln.color, dir: -1, line: ln && ln.id, ph: 0.5, to: toB });
    for (let x = 1; x < W2 - 1; x++) {
      P.add("ptline", x, 5, null, "点字ブロック(黄色い線の内側へ)", false);
      P.add("ptline", x, 11, null, "点字ブロック(黄色い線の内側へ)", false);
    }
    // 駅名標・発車標・ベンチ・屋根柱
    P.add("stationsign", 10, 7, null, b.name, true, { text: b.name });
    P.add("stationsign", 40, 9, null, b.name, true, { text: b.name });
    P.sign(18, 6, toA ? `${t1}番線 ${toA}方面` : `${t1}番線`);
    P.sign(34, 10, toB ? `${t1 + 1}番線 ${toB}方面` : `${t1 + 1}番線`);
    P.wide("dboard", 22, 8, 3, 1, "fx_stdep", "発車標", {});
    for (const x of [6, 14, 30, 46]) {
      P.add("bench", x, 8, "rest", "ホームのベンチ", false);
      P.seatSpots.push({ x, y: 8 });
    }
    P.add("vending", 44, 7, null, "自販機");
    P.add("kiosk", 5, 9, "shelf", "ホームの売店(駅弁・飲み物)");
    P.stair(26, 7, lay.gateF, `改札口へ(${lay.gateF < 0 ? "B" + -lay.gateF : lay.gateF + 1}F)`);
    P.lifts(28, 7, 1, lay.lo, lay.hi, "エレベーター(改札階)");
    P.staffSpots.push({ x: 20, y: 9, role: "conductor" });
    for (let x = 8; x < 46; x += 6) P.seatSpots.push({ x, y: 6 + x % 4 });
    return P.done({ floors: nf, floor, lv: floor, lo: lay.lo, hi: lay.hi, wallH: under ? 3 : 1.2, roof: !under, noDoor: true, label: FAC_LABEL[b.type](b, floor), platform: { line: ln && ln.id, under } });
  }
  // ---- 改札の通過(歩いて通る)
  FAC_STEP.metro = FAC_STEP.station = (g, L2, I2, iy) => {
    if (!I2.gate) return null;
    const gy = I2.gate.y;
    const S2 = g.S;
    if (!S2.railIn && L2.y < gy + 0.55 && L2.y > gy - 1.5) {
      const t = S2.rail;
      if (t && t.from === g.bld(L2.b).stationId && !t.used || testBypass(g, "money") && false) {
        S2.railIn = true;
        t.in = g.absMin();
        sfx.tap && sfx.tap();
        return "ピッ。改札を通りました。ホームは階段・エレベーターから";
      }
      L2.y = gy + 1.3;
      return t && t.used ? "このきっぷは使用済みです。券売機で新しいきっぷを" : t ? `このきっぷは${g.world.map.stations.find((s) => s.id === t.from)?.name || "別の駅"}から有効です` : "きっぷが必要です(券売機・みどりの窓口で買えます)";
    }
    if (S2.railIn && L2.y > gy + 0.45 && L2.y < gy + 1.6) {
      S2.railIn = false;
      const t = S2.rail;
      if (t && t.used) {
        S2.rail = null;
        clearInteriorCache();
        return "ピッ。きっぷは改札で回収されました。お疲れさまでした";
      }
      return "改札を出ました(きっぷはまだ使えます)";
    }
    return null;
  };
  // ---- 券売機
  FAC_ACTS.fx_stticket = (g, o, b, push) => {
    const t = g.S.rail;
    if (t && !t.used) push("none", `お持ちのきっぷ: ${t.fromName} → ${t.toName}(¥${t.fare.toLocaleString()})`, { disabled: true });
    push("stbuy", "行き先を選んできっぷを買う");
    if (t && !t.used && !g.S.railIn) push("strefund", "きっぷを払い戻す(手数料¥220)");
  };
  FAC_RUN.stbuy = (g, arg, tg, r) => {
    r.ui = "fx_ticket";
  };
  FAC_RUN.strefund = (g, arg, tg, r) => {
    const t = g.S.rail;
    if (t) g.hero.money += Math.max(0, t.fare - yenf(g, 220));
    g.S.rail = null;
    r.msg = "きっぷを払い戻しました。";
  };
  function ticketModal() {
    const b = G3.bld(G3.S.loc.b), from = b.stationId;
    const rows = G3.world.map.stations.filter((s) => s.id !== from).map((s) => ({ s, T: (() => {
      try {
        return planTrip(G3, from, s.id);
      } catch (_) {
        return null;
      }
    })() })).filter((x) => x.T).sort((a, c) => a.T.fare - c.T.fare);
    showModal(`<h2>🎫 自動券売機 — ${esc4(b.name)}から</h2><div class="tx small">行き先のボタンを押すと、きっぷが出てきます。改札を通ってホームへ。</div><div class="list" style="max-height:56vh;overflow:auto">${rows.map((x) => `<button class="btn item" data-to="${x.s.id}" ${G3.hero.money < x.T.fare ? "disabled" : ""}>${esc4(x.s.name)} <span class="small">¥${x.T.fare.toLocaleString()}・約${Math.max(1, Math.round(x.T.total))}分${x.T.plan && x.T.plan.legs && x.T.plan.legs.length > 1 ? "・乗換あり" : ""}</span></button>`).join("")}</div><div class="row">${btn("やめる", "sec")}</div>`, (c) => {
      c.querySelectorAll("button[data-to]").forEach((bt) => bt.onclick = () => {
        const x = rows.find((q) => q.s.id === bt.dataset.to);
        G3.pay(x.T.fare, "電車のきっぷ");
        G3.S.rail = { from, to: x.s.id, fare: x.T.fare, fromName: b.name.replace(/駅$/, ""), toName: x.s.name, bought: G3.absMin(), used: false };
        G3.advance(1);
        clearInteriorCache();
        closeModal();
        sfx.coin && sfx.coin();
        toast(`${x.s.name}までのきっぷ(¥${x.T.fare.toLocaleString()})を買いました。改札を通ってホームへ`, 4200);
      });
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  FAC_ACTS.fx_stgate = (g, o, b, push) => {
    push("stgateinfo", g.S.railIn ? "改札を出る(歩いて南へ)" : "改札を通る(歩いて北へ。きっぷが必要です)");
    if (g.S.rail && g.S.rail.used) push("stgateinfo", "精算・きっぷの回収");
  };
  FAC_RUN.stgateinfo = (g, arg, tg, r) => {
    const t = g.S.rail;
    r.msg = t ? `${t.fromName} → ${t.toName} のきっぷ${t.used ? "(到着済み: 出場時に回収)" : ""}` : "きっぷをお持ちではありません。券売機でお求めください。";
  };
  FAC_ACTS.fx_stinfo = (g, o, b, push) => push("stinfo", "駅前の乗り場を確認する");
  FAC_RUN.stinfo = (g, arg, tg, r) => {
    r.msg = "駅前ロータリー: バス乗り場・タクシー乗り場は出口を出てすぐ。行き先はメニューの「移動」から選べます。";
  };
  // ---- 発車標
  FAC_ACTS.fx_stdep = (g, o, b, push) => push("stdep", "次の列車を見る");
  FAC_RUN.stdep = (g, arg, tg, r) => {
    const b = g.bld(g.S.loc.b);
    const lines = stLines(g, b);
    const hm2 = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
    const out = [];
    for (const ln of lines) {
      const n2 = ln.stops.length, si = ln.stops.findIndex((s) => s.id === b.stationId);
      for (const [to, k] of [[ln.stops[n2 - 1], si < n2 - 1], [ln.stops[0], si > 0]]) {
        if (!k) continue;
        try {
          const T4 = planTrip(g, b.stationId, to.id);
          if (T4 && T4.sim && T4.sim.ok) out.push(`${ln.name} ${to.name}行 ${hm2(T4.sim.legs[0].board)}発`);
        } catch (_) {
        }
      }
    }
    r.msg = out.length ? out.join(" / ") : "本日の運転は終了しました。";
  };
  // ---- 乗車(ホームの線路側)
  FAC_ACTS.fx_stboard = (g, o, b, push) => {
    const t = g.S.rail;
    if (!g.S.railIn || !t || t.used) return push("none", "改札の外です(きっぷを買って改札へ)", { disabled: true });
    push("stride", `${t.toName}へ向かう列車に乗る(${o.label})`);
  };
  FAC_RUN.stride = (g, arg, tg, r) => {
    const t = g.S.rail;
    const plan2 = planRail(g.tr, t.from, t.to);
    if (!plan2) return r.msg = "この駅からは行けません";
    const t0 = g.absMin() + 1;
    const sim = simulateTrip(g.tr, plan2, t0);
    if (!sim.ok) return r.msg = sim.reason || "本日の列車は終了しました";
    const ride = new Ride(g, t.from, t.to, plan2, sim, t.fare);
    ride.toPlatform = true;
    t.used = true;
    r.ui = "fx_ride";
    r.ride = ride;
  };
  // 到着: 降りた駅のホームへ(改札で切符を回収)
  function stationArrive(g, ride) {
    const map2 = g.world.map, L2 = g.S.loc;
    const bi = map2.buildings.findIndex((b2) => (b2.type === "station" || b2.type === "metro") && b2.stationId === ride.toId);
    if (bi < 0) return;
    const b = map2.buildings[bi];
    const last = ride.legs[ride.legs.length - 1];
    const lay = stLayout(g, b);
    const L3 = [...lay.surf, ...lay.under].find((q) => q.id === (last && last.line)) || lay.surf[0] || lay.under[0];
    L2.k = "in";
    L2.b = bi;
    L2.floor = stLineFloor(lay, L3) ?? 1;
    const I2 = interiorOf(g, bi, L2.floor).I;
    L2.x = 24.5;
    L2.y = I2.H / 2;
    L2.f = "d";
    g.S.railIn = true;
  }
  // ---- 描画: 線路と列車(入線・停車・発車)
  FXH.fx_track = 0.2;
  FAC_DRAW.fx_track = (c, env, o, H5, d) => {
    const { x, y, w, h, t, Z, pt, poly } = d;
    const v0 = y + 0.6, v1 = y + h - 0.6;
    // バラスト・枕木・レール
    poly(c, [pt(x, y + 0.3, 0.01), pt(x + w, y + 0.3, 0.01), pt(x + w, y + h - 0.3, 0.01), pt(x, y + h - 0.3, 0.01)], "#6d6a64");
    c.strokeStyle = "#5a4636";
    c.lineWidth = Math.max(1, Z * 0.6);
    c.beginPath();
    for (let u = x + 0.3; u < x + w; u += 0.7) {
      const a = pt(u, v0, 0.03), b2 = pt(u, v1, 0.03);
      c.moveTo(a[0], a[1]);
      c.lineTo(b2[0], b2[1]);
    }
    c.stroke();
    c.strokeStyle = "#c9ccd1";
    c.lineWidth = Math.max(1, Z * 0.35);
    c.beginPath();
    for (const v of [y + h / 2 - 0.45, y + h / 2 + 0.45]) {
      const a = pt(x, v, 0.06), b2 = pt(x + w, v, 0.06);
      c.moveTo(a[0], a[1]);
      c.lineTo(b2[0], b2[1]);
    }
    c.stroke();
    if (!o.to) return;
    // 列車: 60秒周期(入線 8秒・停車 15秒・発車 8秒)
    const cyc = 60, tt = (t + (o.ph || 0) * cyc) % cyc;
    const len = 34, stopU = x + (w - len) / 2;
    let u0;
    if (tt < 8) {
      const f = tt / 8;
      u0 = o.dir > 0 ? stopU - (1 - f) * (1 - f) * 70 : stopU + (1 - f) * (1 - f) * 70;
    } else if (tt < 23) u0 = stopU;
    else if (tt < 31) {
      const f = (tt - 23) / 8;
      u0 = o.dir > 0 ? stopU + f * f * 70 : stopU - f * f * 70;
    } else return;
    const open = tt >= 9 && tt < 21;
    const col = o.col || "#1e88e5";
    const vc0 = y + h / 2 - 0.9, vc1 = y + h / 2 + 0.9;
    for (let k = 0; k < 4; k++) {
      const a0 = u0 + k * 8.5, a1 = a0 + 8.2;
      const c0 = Math.max(x, a0), c1 = Math.min(x + w, a1);
      if (c1 <= c0) continue;
      d.box(c, env.P, c0, vc0, c1, vc1, 0.25, 2.6, "#e9edf1");
      poly(c, [pt(c0, vc1, 1.2), pt(c1, vc1, 1.2), pt(c1, vc1, 1.45), pt(c0, vc1, 1.45)], col);
      for (let j = 0; j < 4; j++) {
        const du = a0 + 1 + j * 2;
        if (du < c0 || du + 1.1 > c1) continue;
        poly(c, [pt(du, vc1, 0.5), pt(du + 1.1, vc1, 0.5), pt(du + 1.1, vc1, 2.2), pt(du, vc1, 2.2)], open && j % 2 ? "#3a3f47" : "#9fb4c8");
      }
    }
  };
  // ---- 駅の利用者(住民の通勤・通学の予定から): ホームでは乗る路線・方面の乗車位置に並び、改札階では改札とホームの間を歩く
  function stationPeople(g, b, I2, floor) {
    const w = g.world, cm = w.getCommute(), dt = g.date(), m = g.S.min + (U.clockFrac || 0);
    const si2 = w.map.stations.findIndex((x) => x.building === b.idx);
    if (si2 < 0) return [];
    const out = [], lay = stLayout(g, b), lines = [...lay.surf, ...lay.under];
    if (I2.platform && I2.platform.line) {
      const cnt = { 1: 0, "-1": 0 };
      for (const r of cm.waiting(dt.dow, si2, Math.floor(m))) {
        if (r.line !== I2.platform.line) continue;
        const north = r.dir === 1, k = cnt[north ? 1 : -1]++;
        if (k > 31) continue;
        const door = [8, 17, 25, 33, 41][k % 5], row = Math.floor(k / 5);
        out.push({ id: r.id, x: door + 0.5 + (hash2(r.id, 3) % 3 - 1) * 0.18, y: north ? 6.2 + row * 0.5 : 10.8 - row * 0.5, dir: north ? "u" : "d", role: "commuter" });
      }
      return out;
    }
    if (floor !== lay.gateF || !I2.gate) return out;
    const gy = I2.gate.y, stairX = (lid) => {
      const i = lines.findIndex((q) => q.id === lid);
      return 2 + Math.max(0, i) * 4 + 0.5;
    };
    // 改札を入ってホームの階段へ(ホームに着く前の2分間)
    for (const r of cm.waiting(dt.dow, si2, Math.floor(m))) {
      const u = (m - r.t0) / 2;
      if (u < 0 || u >= 1 || out.length > 24) continue;
      const gx = 4 + hash2(r.id, 5) % (I2.W - 10) + 0.5, sx = stairX(r.line);
      out.push({ id: r.id, x: gx + (sx - gx) * u, y: gy + 1.5 + (2.2 - gy - 1.5) * u, dir: "u", role: "commuter" });
    }
    // 降りてホームから改札を出て出口へ
    for (const r of cm.alighting(dt.dow, si2, Math.floor(m))) {
      const u = Math.max(0, Math.min(1, (m - r.t0) / Math.max(1, r.t1 - r.t0)));
      if (out.length > 40) break;
      const gx = 4 + hash2(r.id, 5) % (I2.W - 10) + 0.5, dx = I2.door.x + 0.5;
      const x = u < 0.5 ? 2.5 + (gx - 2.5) * u * 2 : gx + (dx - gx) * (u - 0.5) * 2, y = u < 0.5 ? 2.2 + (gy + 1.5 - 2.2) * u * 2 : gy + 1.5 + (I2.H - 1.5 - gy - 1.5) * (u - 0.5) * 2;
      out.push({ id: r.id, x, y, dir: "d", role: "commuter" });
    }
    return out;
  }
