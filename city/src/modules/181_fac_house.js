  // src/fac_house.js — 一戸建て(住宅・農家・別荘)の中の作り。v11 では全部の家が同じ間取り(ベッド2つ・机・台所・テレビ)だったのを、
  // ①広さ(1階の床面積 × 階数 → 小: 2DK 前後・中: 3〜4LDK・大: 5LDK 以上)②建てた年代(昭和の和室とちゃぶ台 → こたつと食卓 → 対面キッチンとソファ)
  // ③種類と地域(農家の土間・囲炉裏・縁側、別荘の暖炉、町家の通り庭)④住んでいる家族(夫婦の寝室・子ども部屋・祖父母の和室と仏壇)
  // ⑤家ごとの違い(台所の左右・玄関の位置・部屋の並び)で決める。家族が変われば(人数・年代の5年ごと)作り直す。
  // 寝る・勉強・台所・冷蔵庫・食事・テレビ・休む・風呂・洗面・トイレは v11 と同じ操作(act)を使う。豪邸(estate=2)は interior_estate.js のまま
  var HOUSE_T = ["house", "farmhouse", "villa"];
  var houseFloors = (b) => Math.max(1, Math.min(3, typeof storeys === "function" ? storeys(b) : b.nf || b.floors || 1));
  var houseOn = (b) => b && HOUSE_T.includes(b.type) && !isMansion(b) && b.campusOf == null;
  // 住んでいる人(年齢・夫婦)。家の作りを決めるときだけ数える
  function household(g, b) {
    const out = [];
    if (!g || !g.world) return out;
    const p = g.world.pop, M = g.world.M;
    for (let i = 0; i < p.n; i++) if (!p.gone[i] && p.home[i] === b.idx) out.push({ id: i, age: Math.floor((M - p.born[i]) / 12), sp: p.spouse[i] });
    return out;
  }
  // 部屋の割り当て: 夫婦の寝室・祖父母(70歳以上)の和室・子ども部屋(2人まで相部屋)・ひとりの大人の部屋
  function roomNeeds(hh, b) {
    if (!hh.length) {
      const n2 = 1 + uh(b.idx, 3310) % 4;
      hh = [{ id: -1, age: 40, sp: -2 }, ...n2 > 1 ? [{ id: -2, age: 38, sp: -1 }] : [], ...Array.from({ length: Math.max(0, n2 - 2) }, (_, k) => ({ id: -3 - k, age: 8 + k * 3, sp: -1 }))];
    }
    const ids = new Set(hh.map((x) => x.id)), used = /* @__PURE__ */ new Set(), R = [];
    for (const x of hh) {
      if (used.has(x.id) || x.age < 18) continue;
      if (x.sp != null && ids.has(x.sp) && !used.has(x.sp)) {
        const y = hh.find((q) => q.id === x.sp);
        used.add(x.id).add(x.sp);
        R.push({ ids: [x.id, x.sp], k: x.age >= 70 && y.age >= 70 ? "elder2" : "couple", n: 2, ...R.some((q) => q.k === "couple") ? { lab: "子世帯の夫婦の寝室" } : {} });
      } else if (x.sp === -2 && hh.some((q) => q.id === -2)) {
        used.add(x.id).add(-2);
        R.push({ k: "couple", n: 2 });
      }
    }
    for (const x of hh) {
      if (used.has(x.id) || x.age < 18) continue;
      used.add(x.id);
      R.push({ ids: [x.id], k: x.age >= 70 ? "elder" : "single", n: 1 });
    }
    const kids = hh.filter((x) => x.age < 18).sort((a, c) => c.age - a.age);
    for (let i = 0; i < kids.length; i += 2) R.push({ k: kids[i].age < 4 ? "baby" : "kid", n: Math.min(2, kids.length - i), age: kids[i].age });
    return { R, n: hh.length };
  }
  // 年代の作り: 0 昭和の和風(〜1969)・1 昭和後期〜平成(〜1999)・2 いま風(2000〜)。茅葺き・瓦・町家は 0
  var houseEra = (b) => b.wa ? 0 : (b.openYear || 1990) < 1970 ? 0 : (b.openYear || 1990) < 2e3 ? 1 : 2;
  FAC_RANGE.house = FAC_RANGE.farmhouse = FAC_RANGE.villa = (b) => houseOn(b) ? { lo: 0, hi: houseFloors(b) - 1, nf: houseFloors(b) } : null;
  FAC_LABEL.house = FAC_LABEL.farmhouse = FAC_LABEL.villa = (b, lv) => houseOn(b) ? lv === 0 ? "1F(玄関・居間・台所)" : `${lv + 1}F(寝室)` : null;
  // 家族の人数と年代(5年ごと)で作り直す
  FAC_KEY.house = FAC_KEY.farmhouse = FAC_KEY.villa = (g, b) => `${g.world && g.world.occ ? g.world.occ[b.idx] : 0}:${Math.floor(g.year() / 5)}:${b.openYear || 0}:${b.wa || ""}`;
  FAC_BUILD.house = FAC_BUILD.farmhouse = FAC_BUILD.villa = (b, floor, g) => houseOn(b) ? buildHouse(b, floor, g) : null;
  function buildHouse(b, floor, g, hhOv = null) {
    const F = houseFloors(b), lv = Math.max(0, Math.min(F - 1, floor || 0)), y = g && g.year ? g.year() : 2e3;
    const A = b.w * b.h * 4, tot = A * F, tier = tot < 70 ? 0 : tot < 125 ? 1 : 2, era = houseEra(b);
    const farm = b.type === "farmhouse", villa = b.type === "villa", machiya = b.wa === "machiya", kaya = b.wa === "kaya";
    const W2 = Math.max(12, Math.min(22, b.w * 3 + 2 + (tier === 2 ? 2 : 0))), H4 = Math.max(11, Math.min(16, b.h * 3 + 3));
    const v = uh(b.idx, 3301), flip = v % 2 === 1;
    const X = (x) => flip ? W2 - 1 - x : x;
    const XW = (x, w) => flip ? W2 - x - w : x;
    const P = plan(W2, H4, era === 0 ? "floor_tatami" : "floor_wood", "home");
    P.lv = lv;
    P.windows(3);
    if (era === 0) for (const o of P.objs) if (o.t === "window") o.shoji = true;
    const vacantU = hhOv === "vacant", hh = vacantU ? [] : hhOv || household(g, b), need = vacantU ? { R: [], n: 0 } : roomNeeds(hh, b);
    const mid = Math.floor(H4 / 2), stX = X(W2 - 3);
    const tatami = (x0, y0, x1, y1) => P.fill(x0, y0, x1, y1, "floor_tatami");
    const wood = (x0, y0, x1, y1) => P.fill(x0, y0, x1, y1, "floor_wood");
    const labelKid = (r) => r.n > 1 ? "子ども部屋(きょうだい)" : r.k === "baby" ? "子ども部屋(ベビーベッド)" : "子ども部屋";
    // 空いているマスに置く(部屋の内側 ix..jx × iy..jy を、上の段から/下の段から順に探す)
    const place = (rm, t, act, label, solid = true, extra = {}, fromBottom = false) => {
      const w = extra.w || 1, rows = [];
      for (let yy = rm.iy; yy <= rm.jy; yy++) rows.push(yy);
      if (fromBottom) rows.reverse();
      // 扉の列(通路)はできるだけ空ける。どうしても入らないときだけ使う
      for (const pass of rm.aisle != null ? [0, 1] : [1]) for (const yy of rows) for (let xx = rm.ix; xx + w - 1 <= rm.jx; xx++) {
        let ok = true;
        for (let k = 0; k < w; k++) if (P.occ.has(xx + k + yy * W2) || !pass && xx + k === rm.aisle) ok = false;
        if (!ok) continue;
        const o = P.add(t, xx, yy, act, label, solid, extra);
        if (!o) continue;
        if (!rm.din || roomReach(rm)) return o;
        // 置くと奥の家具へ行けなくなる: 取り消して次のマスへ
        P.objs.splice(P.objs.indexOf(o), 1);
        for (let k = 0; k < w; k++) P.occ.delete(xx + k + yy * W2);
      }
      return null;
    };
    // 部屋の中で、扉の内側から全部の家具のとなりへ歩いて行けるか
    const roomReach = (rm) => {
      const inR = (x, y2) => x >= rm.ix && x <= rm.jx && y2 >= rm.iy && y2 <= rm.jy;
      const solidAt = new Set();
      for (const o of P.objs) if (o.solid) for (let yy = o.y; yy < o.y + (o.h || 1); yy++) for (let xx = o.x; xx < o.x + (o.w || 1); xx++) if (inR(xx, yy)) solidAt.add(xx + yy * W2);
      const seen = /* @__PURE__ */ new Set([rm.din[0] + rm.din[1] * W2]), q = [[rm.din[0], rm.din[1]]];
      while (q.length) {
        const [x, y2] = q.pop();
        for (const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + ddx, ny = y2 + ddy, k = nx + ny * W2;
          if (!inR(nx, ny) || seen.has(k) || solidAt.has(k)) continue;
          seen.add(k);
          q.push([nx, ny]);
        }
      }
      for (const o of P.objs) {
        if (!o.act || !inR(o.x, o.y)) continue;
        let ok = false;
        for (let yy = o.y - 1; yy <= o.y + (o.h || 1) && !ok; yy++) for (let xx = o.x - 1; xx <= o.x + (o.w || 1) && !ok; xx++) if (seen.has(xx + yy * W2)) ok = true;
        if (!ok) return false;
      }
      return true;
    };
    const tryAt = (cands, rm, t, act, label, solid = true, extra = {}) => {
      for (const [xx, yy] of cands) {
        const o = P.add(t, xx, yy, act, label, solid, extra);
        if (o) return o;
      }
      return rm ? place(rm, t, act, label, solid, extra, true) : null;
    };
    // 部屋の家具(寝る場所は住む人数ぶん必ず置く。入りきらなければ布団に)
    // その人の趣味の物(人物IDから決まる。同じ人はいつも同じ趣味)
    const HOBBY = [["shelf", null, "ギターとアンプ"], ["bookcase", "read", "大きな本棚(読書)"], ["plant", null, "観葉植物(毎朝水やり)"], ["tv", "tv", "ゲーム機とテレビ"], ["fishtank", null, "熱帯魚の水槽"], ["desk", "study", "ミシン(手芸)"], ["treadmill", null, "ルームランナー"], ["shelf", null, "プラモデルの棚"], ["desk", "study", "書道の道具"], ["shelf", null, "釣り竿と道具箱"]];
    const hobby = (rm, ids) => {
      for (const id of ids || []) if (id != null && id >= 0) {
        const hb = HOBBY[uh(id, 3341) % HOBBY.length];
        if (hb[0] === "tv" && y < 1980 || hb[0] === "treadmill" && y < 1990) continue;
        place(rm, hb[0], hb[1], hb[2], true, {}, true);
      }
    };
    const furnish = (r, rm) => {
      const futon = era === 0 || r.k === "elder" || r.k === "elder2";
      const bed = (lab) => place(rm, futon ? "futon" : "bed", "sleep", lab) || place(rm, "futon", "sleep", "布団");
      if (futon) tatami(rm.ix, rm.iy, rm.jx, rm.jy);
      if (r.k === "couple" || r.k === "elder2") {
        if (futon) {
          bed("布団(夫婦)");
          bed("布団");
          place(rm, "shelf", null, "押入れ・たんす", true, {}, true);
        } else {
          if (!place(rm, "bed", "sleep", "ダブルベッド(夫婦の寝室)", true, { w: 2, h: 1 })) {
            bed("ベッド");
            bed("ベッド");
          }
          place(rm, "shelf", null, "クローゼット・たんす", true, {}, true);
        }
        if (r.k === "elder2") place(rm, "altar", "fx_butsu", "仏壇", true, {}, true);
      } else if (r.k === "elder") {
        bed("布団(祖父母)");
        place(rm, "altar", "fx_butsu", "仏壇", true, {}, true);
        if (y >= 1955) place(rm, "tv", "tv", "小さなテレビ", true, {}, true);
      } else if (r.k === "baby") {
        for (let k = 0; k < r.n; k++) place(rm, "bed", "sleep", k ? "子ども用の布団" : "ベビーベッド") || place(rm, "futon", "sleep", "布団");
        place(rm, "shelf", null, "おむつ・着替えの棚", true, {}, true);
      } else if (r.k === "kid") {
        for (let k = 0; k < r.n; k++) bed(r.n > 1 ? "二段ベッド" : "ベッド");
        for (let k = 0; k < r.n; k++) place(rm, "desk", "study", y >= 1995 && (r.age || 10) >= 12 ? "勉強机(パソコン)" : "勉強机(ランドセル)", true, {}, true);
      } else {
        bed(futon ? "布団" : "ベッド");
        place(rm, "desk", "study", y >= 1995 ? "机(パソコン)" : "机", true, {}, true);
      }
      hobby(rm, r.ids);
    };
    // 扉の内側と外側のマスは空けておく(出入りできるように)
    const keepDoor = (x, yIn, yOut) => {
      for (const yy of [yIn, yOut]) if (yy >= 1 && yy < H4 - 1) P.reserve(x, yy, x, yy);
    };
    // 部屋を横に並べる(y0..y1)。幅は割り当てに合わせて均等
    const rowRooms = (list, x0, x1, y0, y1, doorY, noTop) => {
      if (!list.length) return;
      const n2 = list.length, w = (x1 - x0) / n2;
      for (let i = 0; i < n2; i++) {
        const a = Math.round(x0 + w * i), c = Math.round(x0 + w * (i + 1));
        const r = list[i], lab = r.lab || (r.k === "couple" ? "夫婦の寝室" : r.k === "elder" || r.k === "elder2" ? "祖父母の部屋(和室)" : r.k === "kid" || r.k === "baby" ? labelKid(r) : r.k === "spare" ? r.lab2 || "書斎" : "個室");
        const dx = X(Math.round((a + c) / 2)), rx0 = XW(a, c - a + 1), rx1 = rx0 + (c - a);
        P.room(rx0, y0, rx1, y1, { noTop, door: [dx, doorY], label: lab, tile: r.k === "elder" || r.k === "elder2" || era === 0 ? "floor_tatami" : "floor_wood" });
        keepDoor(dx, doorY === y1 ? y1 - 1 : y0 + 1, doorY === y1 ? y1 + 1 : y0 - 1);
        const rm = { ix: rx0 + 1, jx: rx1 - 1, iy: y0 + 1, jy: y1 - 1, aisle: dx, din: [dx, doorY === y1 ? y1 - 1 : y0 + 1] };
        if (r.k === "spare") {
          if (r.lab2 === "納戸") place(rm, "shelf", null, "納戸(季節の道具・ひな人形の箱)");
          else {
            place(rm, "desk", "study", y >= 1995 ? "書斎の机(パソコン)" : "書斎の机");
            place(rm, "bookcase", "read", "本棚");
          }
        } else furnish(r, rm);
      }
    };
    const wet = (x0, y0, y1) => {
      // 浴室・洗面・トイレ(幅5)
      const a = XW(x0, 5), dx = X(x0 + 2);
      P.room(a, y0, a + 4, y1, { noTop: true, door: [dx, y1], label: "浴室・洗面・トイレ", tile: "floor_tile" });
      keepDoor(dx, y1 - 1, y1 + 1);
      P.add("bath", a + 1, y0 + 1, "bath", era === 0 && y < 1965 ? "五右衛門風呂" : y >= 1990 ? "お風呂(追いだき)" : "お風呂", true);
      P.add("toilet", a + 3, y0 + 1, "toilet", y >= 1980 ? "トイレ(洋式)" : "トイレ(和式)", true);
      P.add("wash", a + 1, y1 - 1, "wash", y >= 1965 ? "洗面台・洗濯機" : "洗い場(たらい)", true);
    };
    if (lv === 0) {
      // ---- 1階: 上の帯 = 水回り・和室など / 下の帯 = 玄関・LDK
      const dx = machiya ? X(1) : farm || kaya ? X(2) : X([W2 >> 1, 3, W2 - 4][v % 3]);
      P.door(dx);
      if (F > 1) P.stair(stX, mid + 1, 1, "2階へ");
      const top = [];
      const singleFloor = F === 1;
      // 1階に置く部屋: 平屋はすべての寝室、2階建ては祖父母と(中・大は)客間・仏間
      const R0 = need.R.filter((r) => singleFloor || r.k === "elder" || r.k === "elder2");
      top.push(...R0);
      if (!singleFloor && tier >= 1 && !top.some((r) => r.k === "elder" || r.k === "elder2")) top.push({ k: "spare", lab: era === 0 || farm ? "仏間・客間(和室)" : "和室(客間)", lab2: "納戸" });
      if (villa) top.push({ k: "spare", lab: "ゲストルーム", lab2: "書斎" });
      wet(1, 0, mid);
      const maxR = Math.max(1, Math.floor((W2 - 6) / 4));
      rowRooms(top.slice(0, maxR), 5, W2 - 1, 0, mid, mid, true);
      // 平屋で部屋が入りきらないとき: 居間の隅に布団
      const extra = top.slice(maxR);
      // 玄関
      if (!farm && !kaya) {
        const gx = Math.max(1, Math.min(W2 - 4, dx - 1));
        P.fill(gx, H4 - 3, gx + 2, H4 - 2, "floor_paving");
        P.add("shelf", machiya ? X(3) : gx + 2 < W2 - 1 ? gx + 2 : gx - 1, H4 - 3, null, era === 0 ? "下駄箱" : "シューズボックス", true);
      }
      // 農家の土間(農具・かまど)・町家の通り庭
      if (farm || machiya || kaya) {
        const dw = machiya ? 2 : 4, dxx = XW(1, dw);
        P.fill(dxx, mid + 1, dxx + dw - 1, H4 - 2, "floor_paving");
        // 水回りの入口(上の帯の扉)の前は空けて、2列目から置く
        if (farm) {
          P.add("shelf", dxx, mid + 3, null, "農具(鍬・鎌・長靴)", true);
          P.add("shelf", dxx, mid + 4, null, "収穫かご・種もみ", true);
        }
        P.add("sink", machiya ? X(1) : dxx + dw - 1, mid + 2, "kitchen", y < 1960 ? "かまどと流し(土間)" : "台所(土間の流し・ガス台)", true);
        P.add("fridge", machiya ? X(2) : dxx + dw - 2, mid + 2, "fridge", y < 1960 ? "氷の冷蔵庫" : "冷蔵庫", true);
      } else {
        // 台所(壁ぎわ)
        // 台所(横の壁ぎわに縦に並べる。水回りの入口をふさがない)
        const kx = X(1);
        if (era === 0) wood(Math.min(X(1), X(2)), mid + 1, Math.max(X(1), X(2)), H4 - 2);
        P.add("sink", kx, mid + 1, "kitchen", era === 2 ? "対面キッチン(コンロ・食洗機)" : era === 1 ? "台所(流し・ガス台)" : y < 1960 ? "台所(流し・かまど)" : "台所(流し・ガス台)", true);
        P.add("counter", kx, mid + 2, "kitchen", era === 2 ? "IHコンロ・電子レンジ" : "ガス台", true);
        P.add("fridge", kx, mid + 3, "fridge", y < 1960 ? "氷の冷蔵庫" : "冷蔵庫", true);
        if (y >= 1975 && mid + 4 < H4 - 1) P.add("shelf", kx, mid + 4, null, y >= 1990 ? "食器棚・炊飯器・電子レンジ" : "食器棚・炊飯器", true);
      }
      // 食事と居間
      const lx0 = X(farm || kaya ? 6 : 3), ly = mid + 2, LDK = { ix: 1, jx: W2 - 2, iy: mid + 1, jy: H4 - 2 };
      if (vacantU) P.sign(X(W2 >> 1), ly, "空室(内見できます)");
      else if (era === 0 || kaya || machiya) {
        if (farm || kaya) {
          P.add("fx_irori", X(W2 >> 1), ly, "meal", "囲炉裏(家族で食事)", true);
          for (const [ox, oy] of [[-1, 0], [1, 0], [0, 1]]) P.add("zabuton", X(W2 >> 1) + (flip ? -ox : ox), ly + oy, "rest", "座布団", false);
          P.seatSpots.push({ x: X(W2 >> 1) - 1, y: ly }, { x: X(W2 >> 1) + 1, y: ly });
        } else {
          tryAt([[lx0, ly], [lx0, ly + 1]], LDK, "table", "meal", "ちゃぶ台(食事)", true);
          P.add("zabuton", lx0 + 1, ly, "rest", "座布団", false);
          P.add("zabuton", lx0 - 1 >= 1 ? lx0 - 1 : lx0 + 2, ly, "rest", "座布団", false);
          P.seatSpots.push({ x: lx0 + 1, y: ly }, { x: lx0, y: ly + 1 });
        }
        if (y >= 1955) tryAt([[X(W2 - 3), ly], [X(W2 - 4), ly], [X(W2 - 3), H4 - 3]], LDK, "tv", "tv", y >= 1966 ? "テレビ" : "白黒テレビ", true);
        if (farm || kaya) for (let x = 6; x < W2 - 2; x++) P.add("engawa", X(x), H4 - 2, "rest", "縁側(庭を見る)", false);
      } else {
        // 食卓と椅子
        tryAt([[flip ? lx0 - 1 : lx0, ly], [flip ? lx0 - 1 : lx0, ly + 1]], LDK, "table", "meal", "食卓", true, { w: 2, h: 1 });
        for (const ox of [0, 1]) {
          P.add("chair", lx0 + ox, ly - 1, null, "", false);
          P.add("chair", lx0 + ox, ly + 1, null, "", false);
        }
        P.seatSpots.push({ x: lx0, y: ly - 1 }, { x: lx0 + 1, y: ly + 1 });
        // 居間: こたつ(平成)・ソファ(いま)
        const sx = X(W2 - 5);
        if (era === 1) {
          tryAt([[sx, ly], [sx, ly + 1]], LDK, "fx_kotatsu", "rest", "こたつ(冬は布団をかける)", true);
          P.seatSpots.push({ x: sx, y: ly + 1 });
        } else {
          P.add("sofa", sx, ly + 1, "rest", villa ? "大きなソファ" : "ソファ", false);
          P.seatSpots.push({ x: sx, y: ly + 1 });
        }
        tryAt([[sx, ly - 1], [X(W2 - 2), ly], [sx, ly + 2]], LDK, "tv", "tv", y >= 2003 ? "薄型テレビ" : "テレビ", true);
        if (villa) P.add("fx_fireplace", X(W2 - 2), ly - 1, "rest", "暖炉(薪)", true);
        if (y >= 1985 && tier >= 1) P.add("plant", X(W2 - 2), H4 - 3, null, "観葉植物");
      }
      // 平屋で入りきらない寝床(居間の隅)
      for (const r of extra) {
        for (let k = 0; k < (r.n || 1); k++) place(LDK, "futon", "sleep", "布団(居間で寝る)", true, {}, true);
        if (r.k === "kid") place(LDK, "desk", "study", "居間の机(宿題)", true, {}, true);
      }
      P.staffSpots.push({ x: X(3), y: mid + 2 }, { x: lx0, y: ly + 1 }, { x: X(W2 - 4), y: ly + 1 }, { x: X(W2 >> 1), y: H4 - 3 }, { x: X(5), y: H4 - 3 }, { x: X(W2 - 6), y: mid + 2 });
      P.add("doormat", dx, H4 - 2, null, "", false);
    } else {
      // ---- 2階より上: 廊下(中央)と寝室
      const R1 = need.R.filter((r) => r.k !== "elder" && r.k !== "elder2");
      const upper = F > 2 ? R1.filter((_, i) => i % (F - 1) === lv - 1) : R1;
      const list = upper.length ? upper.slice() : [{ k: "spare", lab: "納戸", lab2: "納戸" }];
      if (tier >= 1 && list.length < 3) list.push({ k: "spare", lab: "書斎", lab2: "書斎" });
      P.stair(stX, mid, 0, "1階へ");
      if (lv + 1 < F) P.stair(X(W2 - 4), mid, lv + 1, "上の階へ");
      wood(1, mid, W2 - 2, mid);
      const half = Math.ceil(list.length / 2);
      rowRooms(list.slice(0, half), 1, W2 - 1, 0, mid - 1, mid - 1, true);
      const rest = list.slice(half);
      if (tier >= 2 || rest.length) {
        if (tier >= 2) {
          const a = XW(1, 4);
          P.room(a, mid + 1, a + 3, H4 - 1, { door: [X(2), mid + 1], label: "2階のトイレ・洗面", tile: "floor_tile" });
          P.add("toilet", a + 1, H4 - 3, "toilet", "トイレ", true);
          P.add("wash", a + 2, H4 - 3, "wash", "洗面台", true);
          rowRooms(rest, 5, W2 - 1, mid + 1, H4 - 1, mid + 1, false);
        } else rowRooms(rest, 1, W2 - 1, mid + 1, H4 - 1, mid + 1, false);
      }
      if (!rest.length && tier < 2) {
        P.add("fx_washer", X(2), H4 - 3, "wash", y >= 1990 ? "ベランダ(洗濯物を干す)" : "物干し台", true);
      }
      P.staffSpots.push({ x: X(4), y: mid }, { x: X(W2 >> 1), y: mid }, { x: X(7), y: mid });
    }
    return P.done({ floors: F, floor: lv, lv, lo: 0, hi: F - 1, wallH: 2.6, label: lv === 0 ? "1F(玄関・居間・台所)" : `${lv + 1}F`, house: { tier, era, rooms: need.R.map((r) => r.k), n: need.n } });
  }
  // 仏壇に手を合わせる: 亡くなった家族(人物IDと没年の記録)を思い出す
  FAC_ACTS.fx_butsu = (g, o, b, push) => push("butsu", "仏壇に手を合わせる");
  FAC_RUN.butsu = (g, arg, tg, r) => {
    const p = g.world.pop, h = g.hero, dead = [];
    for (const k of Object.keys(h.rel || {})) {
      const i = +k, rl = h.rel[k];
      if (rl && rl.family && p.gone[i] === 1) dead.push(i);
    }
    for (const i of [h.mother, h.father]) if (i != null && i >= 0 && p.gone[i] === 1 && !dead.includes(i)) dead.push(i);
    g.advance(5);
    if (!dead.length) {
      r.msg = "仏壇に手を合わせ、ご先祖さまに家族の無事を祈りました。" + g.chg({ mood: 1 });
      return;
    }
    const i = dead[uh(g.S.M, 3320) % dead.length], ty = 1900 + Math.floor(p.goneAt[i] / 12);
    if (typeof memorial === "function") try {
      memorial(g, i);
    } catch (_) {
    }
    g.log("family", `仏壇に手を合わせ、${g.nameOf(i)}(${ty}年に亡くなった)を思い出した`);
    r.msg = `仏壇に手を合わせ、${g.nameOf(i)}のことを思い出しました(${ty}年に亡くなって${g.year() - ty}年)。` + g.chg({ mood: 1 });
  };
  // ---- 描画(こたつ・囲炉裏・暖炉・物干し)
  FXH.fx_kotatsu = 0.6;
  FAC_DRAW.fx_kotatsu = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    box(c, d0.P, x - 0.15, y - 0.15, x + 1.15, y + 1.15, 0, 0.35, "#b0503c");
    box(c, d0.P, x + 0.05, y + 0.05, x + 0.95, y + 0.95, 0.35, 0.45, "#c9a26a");
  };
  FXH.fx_irori = 0.3;
  FAC_DRAW.fx_irori = (c, env, o, H5, d0) => {
    const { x, y, box, pt, Z, t } = d0;
    box(c, d0.P, x - 0.1, y - 0.1, x + 1.1, y + 1.1, 0, 0.12, "#5a4632");
    box(c, d0.P, x + 0.15, y + 0.15, x + 0.85, y + 0.85, 0.12, 0.16, "#8a8378");
    const a = pt(x + 0.5, y + 0.5, 0.3 + 0.05 * Math.sin(t * 6));
    c.fillStyle = "rgba(255,140,40,0.85)";
    c.beginPath();
    c.arc(a[0], a[1], 1.6 * Z, 0, 7);
    c.fill();
    const k = pt(x + 0.5, y + 0.5, 1.6);
    c.strokeStyle = "#3a2c20";
    c.lineWidth = Math.max(1, 0.3 * Z);
    c.beginPath();
    c.moveTo(k[0], k[1]);
    c.lineTo(a[0], a[1]);
    c.stroke();
  };
  FXH.fx_fireplace = 1.6;
  FAC_DRAW.fx_fireplace = (c, env, o, H5, d0) => {
    const { x, y, box, pt, Z, t } = d0;
    box(c, d0.P, x, y + 0.2, x + 1, y + 0.9, 0, 1.6, "#8b8580");
    const a = pt(x + 0.5, y + 0.9, 0.35 + 0.05 * Math.sin(t * 7));
    c.fillStyle = "rgba(255,120,30,0.9)";
    c.beginPath();
    c.arc(a[0], a[1], 1.5 * Z, 0, 7);
    c.fill();
  };
  FXH.fx_washer = 1.2;
  FAC_DRAW.fx_washer = (c, env, o, H5, d0) => {
    const { x, y, box } = d0;
    box(c, d0.P, x + 0.1, y + 0.4, x + 0.2, y + 0.5, 0, 1.2, "#9aa0a8");
    box(c, d0.P, x + 0.8, y + 0.4, x + 0.9, y + 0.5, 0, 1.2, "#9aa0a8");
    for (let k = 0; k < 3; k++) box(c, d0.P, x + 0.2 + k * 0.2, y + 0.42, x + 0.35 + k * 0.2, y + 0.48, 0.6, 1.1, ["#f2f2f2", "#7fb0e0", "#e8a0a0"][k]);
  };
  // 集合住宅(アパート・団地・タワー)の住戸の中: 住戸に住む世帯(units.js の部屋割り)と、建物の種類に合う広さ
  // (団地・古いアパート 約45㎡の2DK、ふつうのアパート 約55〜70㎡、タワー 約80〜100㎡)で、一戸建てと同じ作り方の平屋にする
  function buildUnitHome(b, floor, g) {
    if (!g || !g.world || typeof registry !== "function" || !isCondo(b)) return null;
    const { lv, pos } = decodeUnit(floor), R5 = registry(g, b.idx), u = R5.units.find((x) => x.lv === lv && x.pos === pos);
    const p = g.world.pop, M = g.world.M, sub = typeof subOf === "function" ? subOf(b) : null;
    const hh = u && u.hh.length ? u.hh.map((i) => ({ id: i, age: Math.floor((M - p.born[i]) / 12), sp: p.spouse[i] })) : null;
    const k = uh(b.idx * 131 + floor, 3330) % 100;
    const m2 = b.type === "tower" ? 80 + k % 25 : sub === "danchi" || sub === "old" || (b.era | 0) === 0 ? 42 + k % 8 : sub === "share" ? 25 : 52 + k % 20;
    const tiles = Math.round(m2 / 4), w = Math.min(6, Math.max(4, Math.ceil(Math.sqrt(tiles * 1.4)))), h = Math.max(3, Math.ceil(tiles / w));
    const vb = { ...b, type: "house", w, h, nf: 1, floors: 1, idx: b.idx * 131 + floor, wa: null, estate: 0, campusOf: null, openYear: b.type === "tower" ? Math.max(2e3, b.openYear || 2e3) : sub === "danchi" ? Math.min(b.openYear || 1965, 1969) : b.openYear };
    const I2 = buildHouse(vb, 0, g, hh || "vacant");
    I2.house.unit = { m2, room: u ? u.room : "" };
    return I2;
  }
  FAC_KEY.apt = FAC_KEY.tower = (g, b) => `${Math.floor(g.year() / 5)}:${g.world && g.world.occ ? g.world.occ[b.idx] : 0}`;
