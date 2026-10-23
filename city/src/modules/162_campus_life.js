  // src/campus_life.js — 学校の一日(時間割)に合わせて、生徒が敷地の場所を使い分ける
  // 授業(教室)・体育(校庭か体育館)・中休みと昼休み(校庭)・放課後の部活(トラック・野球・サッカー・テニス・体育館・部室・特別教室)。
  // 出てくるのはその学校に在籍し、いま登校している住民(人物IDそのまま)。同じ人が教室と校庭に同時に出ないよう、居場所は1か所に決める。
  // 体育の割当・部活の所属は人物IDと日付から決定的に決まる(乱数で毎回変わらない)。
  var CAMPUS_LEVEL = { kinder: 1, elem: 2, special: 2, jh: 3, hs: 3, univ: 4 };
  // 時間割(分): [開始, 終了, 種類, 時限]
  var CAMPUS_DAY = {
    2: [[525, 570, "class", 1], [580, 625, "class", 2], [625, 645, "break"], [645, 690, "class", 3], [700, 745, "class", 4], [745, 795, "lunch"], [795, 815, "break"], [825, 870, "class", 5], [880, 925, "class", 6], [925, 990, "after"]],
    3: [[525, 575, "class", 1], [585, 635, "class", 2], [645, 695, "class", 3], [705, 755, "class", 4], [755, 785, "lunch"], [785, 815, "break"], [825, 875, "class", 5], [885, 935, "class", 6], [950, 1080, "club"]],
    1: [[540, 600, "play"], [600, 690, "play"], [690, 780, "lunch"], [780, 840, "nap"], [840, 900, "play"]],
    4: [[540, 630, "class", 1], [640, 730, "class", 2], [730, 790, "lunch"], [790, 880, "class", 3], [890, 980, "class", 4], [990, 1080, "class", 5], [1080, 1170, "club"]]
  };
  var campusWet = (g) => Renderer.prototype.weather.call({ g }) !== "sun" && Renderer.prototype.weather.call({ g }) !== "cloud";
  function campusSlot(type, min) {
    const L3 = CAMPUS_DAY[CAMPUS_LEVEL[type]];
    if (!L3) return null;
    for (const s of L3) if (min >= s[0] && min < s[1]) return { a: s[0], b: s[1], k: s[2], per: s[3] || 0 };
    return null;
  }
  var CLc = { key: -1, by: /* @__PURE__ */ new Map() };
  // その学校の在籍者(1日ごとに作り直す)
  function campusRoster(g, sb) {
    const key = g.S.M * 40 + g.date().d;
    if (CLc.key !== key) {
      CLc.key = key;
      CLc.by.clear();
    }
    let L3 = CLc.by.get(sb.idx);
    if (L3) return L3;
    const p = g.world.pop;
    L3 = [];
    for (let i = 0; i < p.n; i++) if (p.school[i] === sb.idx && !p.gone[i]) L3.push(i);
    CLc.by.set(sb.idx, L3);
    return L3;
  }
  // 部活(中学・高校・大学): 運動部(トラック/野球/サッカー/テニス/バスケ/バレー)・文化部(吹奏楽/美術/科学)・帰宅部
  var CLUB_KIND = ["track", "baseball", "soccer", "tennis", "basket", "volley", "brass", "art", "science", "none", "none", "none"];
  var CLUB_NAME = { track: "陸上部", baseball: "野球部", soccer: "サッカー部", tennis: "テニス部", basket: "バスケ部", volley: "バレー部", brass: "吹奏楽部", art: "美術部", science: "科学部" };
  var campusClubOf = (id) => CLUB_KIND[uh(id, 4242) % CLUB_KIND.length];
  // 学年(入学年で分ける)と組(30人ずつ)
  var campusCohort = (p, id) => Math.floor((p.born[id] - 3) / 12);
  // いまどこにいるか: {where: "main"|"yard"|"gym"|"club"|"wing"|"plaza", what: 表示文, spot: 校庭の中の位置の種類}
  function campusWhere(g, sb, id, min) {
    const s = campusSlot(sb.type, min);
    if (!s) return { where: "main" };
    const p = g.world.pop, d = g.S.M * 40 + g.date().d, wet = campusWet(g);
    const lv = CAMPUS_LEVEL[sb.type];
    if (lv === 1) return s.k === "play" && !wet ? { where: "yard", what: "園庭で遊んでいます", spot: "play" } : { where: "main", what: s.k === "nap" ? "お昼寝の時間" : "保育室で過ごしています" };
    if (s.k === "class") {
      if (lv === 4) {
        // 大学: 授業の合間(はじめの10分)は建物から建物へ移動
        if (min < s.a + 10 && uh(id, d * 10 + s.per) % 3 === 0) return { where: "plaza", what: "次の講義の建物へ移動中" };
        return { where: "main", what: `${s.per}限の講義` };
      }
      // 体育: 学年と組ごとに週3コマほど(決定的)
      const coh = campusCohort(p, id), kumi = uh(id, 77) % 3;
      if (uh(sb.idx * 131 + coh * 7 + kumi, d * 10 + s.per) % 9 === 0) {
        const inGym = wet || uh(sb.idx * 17 + coh, d * 10 + s.per) % 3 === 0;
        return { where: inGym ? "gym" : "yard", what: `${s.per}時間目は体育(${inGym ? "体育館" : "校庭"})`, spot: "pe", grp: coh * 3 + kumi };
      }
      return { where: "main", what: `${s.per}時間目の授業` };
    }
    if (s.k === "break") {
      if (!wet && uh(id, d * 7 + s.a) % 10 < 3) return { where: "yard", what: s.a >= 780 ? "昼休みに校庭で遊んでいます" : "中休みに校庭で遊んでいます", spot: "play" };
      return { where: "main", what: "休み時間" };
    }
    if (s.k === "lunch") return lv === 4 && uh(id, d) % 2 ? { where: "plaza", what: "昼休み(キャンパスの広場)" } : { where: "main", what: lv === 4 ? "学生食堂で昼食" : "教室で給食・お弁当" };
    if (s.k === "after") return uh(id, d) % 4 === 0 && !wet ? { where: "yard", what: "放課後、校庭で遊んでいます", spot: "play" } : { where: "main", what: "放課後" };
    if (s.k === "club") {
      const c = campusClubOf(id);
      if (c === "none") return null;
      if (["basket", "volley"].includes(c) || wet && ["track", "baseball", "soccer", "tennis"].includes(c)) return { where: "gym", what: `${CLUB_NAME[c]}の練習(体育館)`, spot: c };
      if (c === "brass" || c === "art" || c === "science") return { where: campusHas(g, sb, "wing") ? "wing" : "main", what: `${CLUB_NAME[c]}の活動`, spot: c };
      return { where: "yard", what: `${CLUB_NAME[c]}の練習`, spot: c };
    }
    return { where: "main" };
  }
  // その学校の敷地に、その種類の棟があるか
  var campusHas = (g, sb, kind) => g.world.map.buildings.some((q) => (q.campusOf ?? q.parentB) === sb.idx && q.kind === kind);
  // いま登校している在籍者(personActivity が学校にいる人)
  function campusPresent(g, sb, min) {
    const w = g.world, dow = g.date().dow, out = [];
    for (const id of campusRoster(g, sb)) {
      if (id === g.hero.id) continue;
      const a = personActivity(w, id, min, dow);
      if (a && a.s === 2 && a.at === sb.idx) out.push(id);
    }
    return out;
  }
  var siteOf = (g, sb) => sb.siteI != null && g.world.map.fsites ? g.world.map.fsites[sb.siteI] : null;
  // 校庭の中の位置(spot ごとの場所)。t: 分(動きのある練習はこれで位置が進む)
  function campusYardPos(site, wh, id, i, n2, min) {
    const yard = site.ground.find((q) => q[0] === "yard" || q[0] === "field") || [0, site.x + 2, site.y + 2, site.w - 4, site.h - 4];
    const [, yx, yy, yw, yh] = yard;
    const tr = site.props.find((q) => q.kind === "track");
    const R = (a, b) => (uh(id, a) % 1e3) / 1e3 * b;
    const sp = wh.spot;
    if ((sp === "track" || sp === "pe" && wh.grp % 2 === 0) && tr) {
      // トラックを走る(楕円の上を分ごとに進む)
      const ph = R(5, 6.283) + min * 0.35 * (sp === "track" ? 1.4 : 1);
      return { x: tr.x + tr.w / 2 + Math.cos(ph) * (tr.w / 2 - 1.2), y: tr.y + tr.h / 2 + Math.sin(ph) * (tr.h / 2 - 1.2), dx: -Math.sin(ph), dy: Math.cos(ph) };
    }
    if (sp === "pe") {
      // 体育の整列(4列)
      const cols = Math.ceil(n2 / 4), r = i % 4, c = Math.floor(i / 4);
      return { x: yx + yw / 2 - cols / 2 + c + 0.5, y: yy + yh / 2 - 2 + r, dx: 0, dy: 1 };
    }
    if (sp === "baseball") {
      const bs = site.props.find((q) => q.kind === "backstop" || q.kind === "diamond");
      const bx = bs ? bs.x + 3 : yx + 4, by = bs ? bs.y + 3 : yy + 4;
      return { x: bx + R(6, 8), y: by + R(7, 8), dx: -1, dy: -1 };
    }
    if (sp === "soccer") {
      const gx = yx + yw / 2 + Math.sin(min * 0.4 + R(8, 6)) * yw * 0.3;
      return { x: gx + R(9, 6) - 3, y: yy + yh / 2 + R(10, yh * 0.6) - yh * 0.3, dx: Math.cos(min * 0.4), dy: 0 };
    }
    if (sp === "tennis") {
      const tc = site.props.find((q) => q.kind === "tennis");
      if (tc) return { x: tc.x + 1 + R(11, tc.w - 2), y: tc.y + 1 + R(12, tc.h - 2), dx: 0, dy: 1 };
    }
    // 遊び(遊具のまわり・校庭のあちこち)
    const pr = site.props.filter((q) => ["slide", "swing", "jungle", "iron_bar", "sandbox"].includes(q.kind));
    if (pr.length && uh(id, 13) % 2) {
      const q = pr[uh(id, 14) % pr.length];
      return { x: q.x + R(15, 3) - 1, y: q.y + 1 + R(16, 2), dx: 0, dy: -1 };
    }
    return { x: yx + 1 + R(17, yw - 2) + Math.sin(min * 0.5 + R(18, 6)) * 0.8, y: yy + 1 + R(19, yh - 2), dx: Math.cos(min * 0.5 + i), dy: 0 };
  }
  // 屋外: 敷地の中の生徒(Crowd.outdoor から)
  function campusOutdoor(C2, out, hx, hy, radius) {
    const g = C2.g, map2 = g.world.map, min = g.S.min;
    if (!map2.fsites || !g.isSchoolDay()) return;
    const have = new Set(out.map((o) => o.id));
    for (const site of map2.fsites) {
      if (!CAMPUS_LEVEL[site.type] || site.x > hx + radius || site.x + site.w < hx - radius || site.y > hy + radius || site.y + site.h < hy - radius) continue;
      const sb = map2.buildings[site.b];
      const grp = {};
      for (const id of campusPresent(g, sb, min)) {
        if (have.has(id)) continue;
        const wh = campusWhere(g, sb, id, min);
        if (!wh || wh.where !== "yard" && wh.where !== "plaza") continue;
        const k = wh.spot + ":" + (wh.grp || 0);
        (grp[k] || (grp[k] = [])).push([id, wh]);
      }
      for (const L3 of Object.values(grp)) L3.forEach(([id, wh], i) => {
        if (out.length >= 190) return;
        let q;
        if (wh.where === "plaza") {
          // 大学: 建物と建物のあいだの広場を歩く
          const ps = site.ground.filter((z) => z[0] === "paved");
          const z = ps[uh(id, 21) % Math.max(1, ps.length)] || [0, site.x, site.y, site.w, site.h];
          const u = (min * 0.6 + (uh(id, 22) % 100)) % 100 / 100;
          q = { x: z[1] + 0.5 + u * (z[3] - 1), y: z[2] + 0.5 + (uh(id, 23) % 100) / 100 * (z[4] - 1), dx: 1, dy: 0 };
        } else q = campusYardPos(site, wh, id, i, L3.length, min);
        if (Math.abs(q.x - hx) > radius || Math.abs(q.y - hy) > radius) return;
        have.add(id);
        out.push({ id, static: true, x: q.x, y: q.y, dx: q.dx, dy: q.dy, s: 3, campus: wh.what });
        CLnow.set(id, { what: wh.what, min: g.S.min, d: g.S.M * 40 + g.date().d });
      });
    }
  }
  var CLnow = /* @__PURE__ */ new Map();
  // 屋内: 校舎からは外にいる人を除き、体育館・部室棟・特別教室棟には使っている人を置く(Crowd.indoor から)
  function campusIndoor(C2, bIdx, I2, floor, res) {
    const g = C2.g, map2 = g.world.map, b = map2.buildings[bIdx];
    if (!b || !g.isSchoolDay()) return res;
    const min = g.S.min;
    if (CAMPUS_LEVEL[b.type] && b.siteI != null) {
      // 校舎: いま校庭・体育館・部室にいる生徒は教室にいない
      return res.filter((q) => {
        if (map2.buildings[g.world.pop.school[q.id]] !== b) return true;
        const wh = campusWhere(g, b, q.id, min);
        return !wh || wh.where === "main";
      });
    }
    const par = b.campusOf ?? b.parentB, sb = par != null ? map2.buildings[par] : null;
    if (!sb || !CAMPUS_LEVEL[sb.type]) return res;
    const want = b.kind === "gym" ? "gym" : b.kind === "club" ? "club" : b.kind === "wing" ? "wing" : null;
    if (!want) return res;
    const sol = interiorSolid(I2), cells = [];
    for (let y = 2; y < I2.H - 2; y++) for (let x = 1; x < I2.W - 1; x++) if (!sol[x + y * I2.W]) cells.push([x, y]);
    if (!cells.length) return res;
    const seen = new Set(res.map((q) => q.id));
    const list = campusPresent(g, sb, min).map((id) => [id, campusWhere(g, sb, id, min)]).filter(([id, wh]) => wh && (wh.where === want || want === "club" && wh.where === "yard" && min % 60 < 8));
    list.forEach(([id, wh], i) => {
      if (seen.has(id) || res.length > 48) return;
      let x, y;
      if (want === "gym" && wh.spot === "pe") {
        const cols = Math.ceil(list.length / 4);
        x = I2.W / 2 - cols / 2 + Math.floor(i / 4) + 0.5;
        y = 8 + i % 4;
      } else if (want === "gym") {
        // バスケ/バレー: コートの中を動く
        const ph = (uh(id, 31) % 628) / 100 + min * 0.5;
        x = I2.W / 2 + Math.cos(ph) * (I2.W / 2 - 4);
        y = I2.H / 2 + Math.sin(ph * 1.3) * (I2.H / 2 - 6);
      } else {
        const c = cells[uh(id, 33) % cells.length];
        x = c[0] + 0.5;
        y = c[1] + 0.5;
      }
      res.push({ id, x, y, dir: "u", role: "student" });
      CLnow.set(id, { what: wh.what, min: g.S.min, d: g.S.M * 40 + g.date().d });
    });
    return res;
  }
  // 人物情報: 直近(10分以内)に学校の中で見かけた居場所
  function campusNpcStatus(id) {
    const s = CLnow.get(id);
    if (!s || !G3 || s.d !== G3.S.M * 40 + G3.date().d || Math.abs(G3.S.min - s.min) > 10) return null;
    return "🏫 " + s.what;
  }
