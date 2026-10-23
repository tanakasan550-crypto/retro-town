  // src/tenants.js — オフィスビルの複数テナント化: 建物 → 階 → 区画 → 入居企業(事業所) → 社員(職の枠と人物ID) → 実際の仕事。
  // 階ごとの床面積(外形 w×h マス・1マス=2m)から1区画の定員を決め(1人あたり約10㎡)、床面積を超える入居はしない。
  // 入居企業の業種は、建物を建てた年代・地区から決定的に選ぶ(1950年代は商事や事務所、1990年代は旅行会社や派遣、2000年代以降はソフトウェア開発・クリニックなど)。
  // 開業・退去・空室は world.bizOv に記録してセーブに残す(towndev.js の毎年の判定)。電力・水道の営業所(b.util)と美容室は専用のまま。
  var OFFICE_KINDS = [
    { k: "trade", n: "商事", sfx: ["商事", "物産", "通商"], jobs: { officeworker: 1 }, y0: 1945, y1: 2200, w: (y) => 3, zone: { downtown: 1.5, tower: 1.5 } },
    { k: "ins", n: "保険代理店", sfx: ["保険サービス", "保険代理店"], jobs: { insurance: 0.65, officeworker: 0.35 }, y0: 1950, y1: 2200, w: (y) => 1.5, ground: 1 },
    { k: "realty", n: "不動産", sfx: ["不動産", "ハウジング", "地所"], jobs: { realtor: 0.7, officeworker: 0.3 }, y0: 1955, y1: 2200, w: (y) => y > 1985 && y < 1992 ? 2 : 1, ground: 1, zone: { suburb_n: 1.5, suburb_e: 1.5, suburb_w: 1.5, newtown: 1.5 } },
    { k: "tax", n: "税理士事務所", sfx: ["税理士事務所", "会計事務所"], jobs: { accountant: 0.7, officeworker: 0.3 }, y0: 1945, y1: 2200, w: (y) => 1.2, ground: 0.8 },
    { k: "arch", n: "設計事務所", sfx: ["設計事務所", "建築設計"], jobs: { architect: 0.75, officeworker: 0.25 }, y0: 1955, y1: 2200, w: (y) => 1 },
    { k: "design", n: "デザイン事務所", sfx: ["デザイン", "クリエイティブ"], jobs: { designer: 0.8, officeworker: 0.2 }, y0: 1965, y1: 2200, w: (y) => y >= 1985 ? 1.2 : 0.6, ground: 0.5 },
    { k: "soft", n: "ソフトウェア開発", sfx: ["ソフト", "システムズ", "テクノロジー"], jobs: { itengineer: 0.8, officeworker: 0.2 }, y0: 1975, y1: 2200, w: (y) => y < 1990 ? 0.6 : y < 2000 ? 1.5 : 3, zone: { downtown: 1.3, tower: 1.5, campus: 1.5 } },
    { k: "travel", n: "旅行会社", sfx: ["トラベル", "観光", "ツーリスト"], jobs: { travelagent: 0.8, officeworker: 0.2 }, y0: 1960, y1: 2200, w: (y) => y >= 1970 && y < 2010 ? 1.1 : 0.4, ground: 1 },
    { k: "temp", n: "人材派遣", sfx: ["スタッフサービス", "キャリア"], jobs: { officeworker: 1 }, y0: 1986, y1: 2200, w: (y) => 1 },
    { k: "clinic", n: "クリニック", sfx: ["クリニック", "内科", "歯科医院"], jobs: { doctor: 0.3, nurse: 0.5, receptionist: 0.2 }, y0: 1975, y1: 2200, w: (y) => y >= 1995 ? 1.3 : 0.7, ground: 1, low: 1 },
    { k: "cram", n: "学習塾", sfx: ["ゼミナール", "学習塾", "個別指導"], jobs: { tutor: 0.85, officeworker: 0.15 }, y0: 1965, y1: 2200, w: (y) => y >= 1975 ? 1.2 : 0.5, low: 1, zone: { school: 2, campus: 1.5, newtown: 1.5 } },
    { k: "law", n: "法律事務所", sfx: ["法律事務所"], jobs: { lawyer: 0.6, officeworker: 0.4 }, y0: 1945, y1: 2200, w: (y) => 0.8, ground: 0.6, zone: { civic: 2, downtown: 1.3 } },
    // 現場へ出る業種(field): 事務所には事務と当番だけが机を持ち、ほかの社員は現場・巡回先へ出る
    { k: "koumu", n: "工務店", sfx: ["工務店", "建設", "住建"], jobs: { foreman: 0.15, carpenter: 0.35, builder: 0.3, officeworker: 0.2 }, y0: 1945, y1: 2200, w: (y) => y < 1995 ? 1.3 : 0.9, ground: 1, field: 1, zone: { suburb_n: 1.6, suburb_e: 1.6, suburb_w: 1.6, newtown: 1.4, farm: 1.3 } },
    { k: "doboku", n: "土木工事", sfx: ["土木", "興業", "組"], jobs: { civil: 0.2, heavy: 0.25, roadworker: 0.25, trafficguide: 0.15, officeworker: 0.15 }, y0: 1950, y1: 2200, w: (y) => y >= 1960 && y < 2000 ? 0.9 : 0.5, ground: 0.8, field: 1, zone: { harbor: 1.5, suburb_n: 1.3, farm: 1.3 } },
    { k: "denki", n: "電気工事", sfx: ["電気工事", "電設"], jobs: { electrician: 0.7, elecmaint: 0.1, officeworker: 0.2 }, y0: 1950, y1: 2200, w: (y) => 0.8, ground: 0.8, field: 1 },
    { k: "setsubi", n: "設備・水道工事", sfx: ["設備", "水道工業所"], jobs: { plumber: 0.6, waterworker: 0.2, officeworker: 0.2 }, y0: 1950, y1: 2200, w: (y) => 0.8, ground: 1, field: 1 },
    { k: "zouen", n: "造園", sfx: ["造園", "グリーン"], jobs: { gardener: 0.8, officeworker: 0.2 }, y0: 1945, y1: 2200, w: (y) => 0.6, ground: 1, field: 1, zone: { suburb_n: 1.5, suburb_e: 1.5, suburb_w: 1.5, farm: 1.5 } },
    { k: "bmgmt", n: "ビル管理・清掃", sfx: ["ビルサービス", "メンテナンス", "管財"], jobs: { cleaner: 0.5, security: 0.3, janitor: 0.1, officeworker: 0.1 }, y0: 1960, y1: 2200, w: (y) => y >= 1975 ? 1 : 0.5, field: 1, zone: { downtown: 1.4, tower: 1.4 } },
    { k: "press", n: "出版・編集", sfx: ["出版", "編集プロダクション"], jobs: { reporter: 0.4, designer: 0.3, officeworker: 0.3 }, y0: 1945, y1: 2200, w: (y) => y < 2005 ? 0.8 : 0.4 }
  ];
  var OK_BY = Object.fromEntries(OFFICE_KINDS.map((k) => [k.k, k]));
  var OFF_NAME = ["あおば", "ひかり", "つばさ", "みなと", "すばる", "かがやき", "はやて", "みらい", "ことぶき", "やまと", "あさひ", "わかば", "ひので", "なぎさ", "ふたば", "こだま", "いずみ", "せいらん"];
  // 現場へ出る業種の、事務所に机を持たない職(工務店の大工・電気工事士など)
  var isFieldWorker = (t, j) => !!(t && OK_BY[t.kind] && OK_BY[t.kind].field && j !== "officeworker" && j !== "foreman");
  var M2_PER_STAFF = 10;
  var isTenantOffice = (b) => b && b.type === "office" && !b.util && !b.salon && b.tenant == null;
  var officeFloors = (b) => Math.max(1, b.nf || b.floors || 1);
  var floorCap = (b) => Math.max(6, Math.floor(b.w * b.h * 4 / M2_PER_STAFF));
  // 年代・地区に合う業種を、建物と階から決定的に選ぶ
  function pickOfficeKind(b, lv, y, ground) {
    const L3 = OFFICE_KINDS.filter((k) => y >= k.y0 && y < k.y1 && (!ground || k.ground) && (lv <= 1 || !k.low));
    let tot = 0;
    const ws = L3.map((k) => {
      const v = k.w(y) * ((k.zone || {})[b.zone] || 1) * (ground ? k.ground || 1 : 1);
      tot += v;
      return v;
    });
    let r = uh(b.idx * 31 + lv, 4401 + Math.floor(y / 10)) % 1e4 / 1e4 * tot;
    for (let i = 0; i < L3.length; i++) {
      r -= ws[i];
      if (r <= 0) return L3[i];
    }
    return L3[L3.length - 1] || OFFICE_KINDS[0];
  }
  function officeName(b, lv, kind) {
    const a = OFF_NAME[uh(b.idx * 7 + lv, 4402) % OFF_NAME.length], s = kind.sfx[uh(b.idx + lv, 4403) % kind.sfx.length];
    return a + s;
  }
  // この建物の入居企業(区画ごと)。基本は建物を建てた年代(なければ街の始まりの年)で決め、world.bizOv の記録(開業・退去)を上書きする
  var offCache = /* @__PURE__ */ new Map();
  function officeTenants(w, b) {
    if (!isTenantOffice(b)) return [];
    // 最初の階数を記録(増築で増えた階は空室から始まり、入れ替わりで企業が入る)
    if (w && w.slots) {
      w.bizOv || (w.bizOv = {});
      w.bizFz || (w.bizFz = {});
      const o0 = w.bizOv[b.idx] || (w.bizOv[b.idx] = {});
      if (o0._f0 == null) o0._f0 = officeFloors(b);
    }
    const ov = w && w.bizOv && w.bizOv[b.idx] || null, key = (w ? w.startYear : 0) + ":" + officeFloors(b) + ":" + (ov ? JSON.stringify(ov) : "");
    const c = offCache.get(b.idx);
    if (c && c.key === key && c.w === w) return c.L;
    // 最初の入居企業は街の始まりの年で決める(建て替えで openYear が変わっても企業は入れ替わらない。年代の変化は入れ替わりの記録 bizOv で表す)
    const F = officeFloors(b), cap = floorCap(b), y = w ? w.startYear : 1990;
    const L3 = [];
    for (let lv = 0; lv < F; lv++) {
      const two = lv > 0 && b.w * b.h * 4 >= 240;
      const parts = lv === 0 ? [0] : two ? [0, 1] : [0];
      for (const part of parts) {
        const slotKey = lv + ":" + part;
        let kind = pickOfficeKind(b, lv * 2 + part, y, lv === 0), name = officeName(b, lv * 2 + part, kind), from = y, vacant = false;
        const o = ov && ov[slotKey];
        // 街の始まりから空いている区画(2階より上の約8%。決定的)
        if (!o && lv > 0 && uh(b.idx * 7 + lv * 2 + part, 4410) % 100 < 8) vacant = true;
        if (!o && ov && ov._f0 != null && lv >= ov._f0) vacant = true;
        if (o) {
          if (o.vacant) vacant = true;
          else {
            kind = OK_BY[o.kind] || kind;
            name = o.name || name;
            from = o.from || from;
          }
        }
        const staff = vacant ? 0 : Math.max(2, Math.round((lv === 0 ? cap * 0.45 : cap / parts.length) * (0.8 + uh(b.idx + lv, 4404 + part) % 21 / 100)));
        // 入れ替わった企業は別の事業ID(元の企業の記録と混ざらないように開業年を付ける)
        L3.push({ id: `E${b.idx}-${lv}${part ? "b" : "a"}${o && o.kind ? "-" + o.from : ""}`, key: slotKey, sl: !!(o && o.sl), hk: o && o.hero ? o.firm : null, b: b.idx, lv, part, parts: parts.length, kind: kind.k, kindName: kind.n, name, staff, from, vacant, hero: !!(o && o.hero) });
      }
    }
    offCache.set(b.idx, { key, w, L: L3 });
    return L3;
  }
  // 建物の管理(受付・警備)の人数
  var bldgStaff = (b) => {
    const F = officeFloors(b);
    return { receptionist: F >= 4 ? 1 : 0, security: F >= 5 ? 2 : F >= 3 ? 1 : 0 };
  };
  // 新しい街の職の枠(buildSlots): 入居企業の業種ごとの人数の合計+建物の管理
  function officeSlotTable(w, b) {
    const t = {};
    for (const c of officeTenants(w, b)) {
      if (c.vacant || c.hero) continue;
      const K = OK_BY[c.kind];
      let left = c.staff;
      const ents = Object.entries(K.jobs);
      ents.forEach(([j, f2], i) => {
        const n2 = i === ents.length - 1 ? left : Math.max(1, Math.round(c.staff * f2));
        t[j] = (t[j] || 0) + Math.max(0, Math.min(left, n2));
        left -= Math.min(left, n2);
      });
    }
    for (const [j, n2] of Object.entries(bldgStaff(b))) if (n2) t[j] = (t[j] || 0) + n2;
    return t;
  }
  // 古いセーブ(会社員の枠だけのビル)に足す枠: 入居企業の専門の職(会社員以外)と建物の管理
  function officeExtTable(w, b) {
    const t = officeSlotTable(w, b);
    delete t.officeworker;
    return t;
  }
  // 職の枠 → 入居企業(区画)。建物の枠を番号の小さい順に、企業ごとの職の人数へ割り当てる(枠の追加は末尾なので、前の割り当ては変わらない)
  var slotBizC = /* @__PURE__ */ new Map();
  function bizOfSlot(w, s) {
    const bi = w.slots.b[s], b = w.map.buildings[bi];
    if (!isTenantOffice(b)) return null;
    const L3 = officeTenants(w, b);
    let c = slotBizC.get(bi);
    if (!c || c.n !== w.slots.b.length || c.L !== L3 || c.w !== w) {
      const quota = L3.map((t) => {
        const q = {};
        if (t.vacant || t.hero) return q;
        const K = OK_BY[t.kind];
        let left = t.staff;
        const ents = Object.entries(K.jobs);
        ents.forEach(([j, f2], i) => {
          const n2 = i === ents.length - 1 ? left : Math.max(1, Math.round(t.staff * f2));
          q[j] = Math.max(0, Math.min(left, n2));
          left -= q[j];
        });
        return q;
      });
      // 入れ替わりで開いた企業の枠(明示)と、退去した企業の凍結した枠(誰も雇わない)
      const ov = w.bizOv && w.bizOv[bi] || {}, ex = /* @__PURE__ */ new Map(), fz = new Set(w.bizFz && w.bizFz[bi] || []);
      L3.forEach((t, i) => {
        const o = ov[t.key];
        if (o && o.sl) for (const k of o.sl) ex.set(k, i);
      });
      quota.forEach((q, i) => {
        if (L3[i].sl) for (const j of Object.keys(q)) q[j] = 0;
      });
      const map = /* @__PURE__ */ new Map(), live = L3.map((t, i) => i).filter((i) => !L3[i].vacant && !L3[i].hero && !L3[i].sl);
      let rr = 0;
      for (let k = 0; k < w.slots.b.length; k++) {
        if (w.slots.b[k] !== bi) continue;
        if (fz.has(k)) {
          map.set(k, -2);
          continue;
        }
        if (ex.has(k)) {
          map.set(k, ex.get(k));
          continue;
        }
        const j = JOB_IDS2[w.slots.job[k]];
        if (j === "receptionist" || j === "security") {
          map.set(k, -1);
          continue;
        }
        let ti = quota.findIndex((q) => q[j] > 0);
        if (ti >= 0) quota[ti][j]--;
        else {
          // 定員を超える古い枠・専門外の職: その職を使う企業へ順に(なければどこかの企業へ)
          const cand = live.filter((i) => OK_BY[L3[i].kind].jobs[j] != null);
          const pool = cand.length ? cand : live;
          ti = pool.length ? pool[rr++ % pool.length] : -1;
        }
        map.set(k, ti);
      }
      slotBizC.set(bi, c = { n: w.slots.b.length, L: L3, w, map });
    }
    const ti = c.map.get(s);
    return ti == null || ti === -2 ? null : ti < 0 ? { id: `E${bi}-mgmt`, b: bi, lv: 0, name: `${b.name} 管理室`, kindName: "ビル管理", mgmt: true } : L3[ti];
  }
  function bizOfPerson(w, i) {
    const s = w.pop.slot ? w.pop.slot[i] : -1;
    return s >= 0 ? bizOfSlot(w, s) : null;
  }
  var floorName = (lv) => lv < 0 ? "B" + -lv + "F" : lv + 1 + "F";
  // ---- 中の作り(複数の階・区画・入居企業の表示)
  FAC_RANGE.office = (b) => {
    if (!isTenantOffice(b)) return null;
    const F = officeFloors(b);
    return { lo: F >= 5 ? -1 : 0, hi: F - 1, nf: F };
  };
  FAC_LABEL.office = (b, lv) => {
    if (!isTenantOffice(b)) return null;
    if (lv < 0) return "B1F 駐車場・設備室";
    if (lv === 0) return "1F エントランス・受付";
    const L3 = officeTenants(typeof G3 !== "undefined" && G3 ? G3.world : null, b).filter((t) => t.lv === lv);
    return `${floorName(lv)} ${L3.map((t) => t.vacant ? "空室(テナント募集中)" : t.name).join("・")}`;
  };
  FAC_KEY.office = (g, b) => isTenantOffice(b) ? officeTenants(g.world, b).map((t) => t.vacant ? "-" : t.name).join("|") : "";
  FAC_BUILD.office = (b, floor, g) => {
    if (!isTenantOffice(b)) return null;
    const w = g && g.world, F = officeFloors(b), lv = Math.max(F >= 5 ? -1 : 0, Math.min(F - 1, floor | 0));
    const W2 = Math.max(24, Math.min(40, b.w * 4)), H4 = Math.max(18, Math.min(26, b.h * 3 + 5));
    const P = plan(W2, H4, lv < 0 ? "floor_tile" : "floor_carpet", "office");
    P.lv = lv;
    P.windows(3);
    const dx = W2 >> 1, lo = F >= 5 ? -1 : 0, lab = (k) => (FAC_LABEL.office(b, k) || floorName(k));
    if (lv === 0) P.door(dx);
    // 階段とエレベーター(3階以上のビル)
    if (lv > lo) P.stair(W2 - 3, 1, lv - 1, `${lab(lv - 1)}へ(階段)`);
    if (lv < F - 1) P.stair(W2 - 2, 1, lv + 1, `${lab(lv + 1)}へ(階段)`);
    if (F >= 3) P.lifts(W2 - 7, 1, F >= 6 ? 2 : 1, lo, F - 1);
    P.add("toilet", 1, 1, "toilet", "トイレ");
    const tens = w ? officeTenants(w, b).filter((t) => t.lv === lv) : [];
    // 企業の部屋(区画): 社員の机(人数ぶん)・上司の机・打合せ・業種ごとの設備
    const room = (t, x0, x1, y0, y1) => {
      if (t.vacant) {
        P.room(x0, y0, x1, y1, { doors: [[x0 + 2, y1]], label: "空室(テナント募集中)" });
        P.add("board", x0 + 2, y0 + 2, "info", `空室のご案内(${floorName(lv)}・約${Math.round((x1 - x0) * (y1 - y0) * 0.8)}㎡)`, true);
        return;
      }
      P.room(x0, y0, x1, y1, { doors: [[x0 + 2, y1]], label: t.name });
      P.add("board", x0 + 1, y0 + 1, "info", `${t.name}(${t.kindName})`, true);
      const K = t.kind;
      if (K === "clinic") {
        P.wide("counter", x0 + 2, y1 - 3, 3, 1, "info", "受付");
        P.add("hospital_bed", x1 - 3, y0 + 2, "ward", "診察台");
        P.add("desk", x1 - 5, y0 + 2, "work", "診察の机");
        for (let x = x0 + 2; x < x0 + 7 && x < x1 - 6; x++) {
          P.add("bench", x, y0 + 4, "rest", "待合のいす", false);
          P.seatSpots.push({ x, y: y0 + 4 });
        }
      } else if (K === "cram") {
        P.add("kokuban", x0 + 2, y0 + 1, null, "ホワイトボード", true, { w: 4 });
        for (let y = y0 + 3; y < y1 - 2; y += 2) for (let x = x0 + 2; x < x1 - 2; x += 2) if (P.add("desk", x, y, "class", "生徒の机")) P.seatSpots.push({ x, y: y + 1 });
      } else if (K === "realty" || K === "travel" || K === "ins") {
        // 店頭の窓口(お客さんの席)
        for (let x = x0 + 2; x < x1 - 2; x += 3) {
          P.add("counter", x, y1 - 3, "info", K === "realty" ? "物件の相談窓口" : K === "travel" ? "旅行の相談窓口" : "保険の相談窓口");
          P.add("chair", x, y1 - 2, "rest", "相談の椅子", false);
          P.seatSpots.push({ x, y: y1 - 2 });
        }
        P.add("board", x1 - 2, y0 + 1, "info", K === "realty" ? "物件情報(間取り・家賃)" : K === "travel" ? "旅行パンフレット" : "保険のご案内", true);
      } else if (K === "soft") P.wide("rack", x1 - 3, y0 + 1, 2, 1, null, "サーバーラック");
      else if (K === "arch" || K === "design") P.wide("table", x1 - 5, y0 + 2, 3, 2, "work", K === "arch" ? "図面の大机・模型" : "作業台(デザインの確認)");
      else if (OK_BY[K] && OK_BY[K].field) {
        P.add("board", x1 - 2, y0 + 1, "info", K === "bmgmt" ? "巡回・清掃の担当表" : "現場の工程表(今週の現場)", true);
        P.wide("shelf", x1 - 4, y1 - 3, 3, 1, null, K === "koumu" ? "大工道具・資材の見本" : K === "doboku" ? "測量機器・安全帯・ヘルメット" : K === "denki" ? "電線・計測器・脚立" : K === "setsubi" ? "配管部材・工具" : K === "zouen" ? "剪定ばさみ・脚立・苗" : "清掃用具・制服");
      }       else if (K === "tax" || K === "law" || K === "press") P.add("bookcase", x1 - 2, y0 + 1, null, K === "tax" ? "税法書・帳簿" : K === "law" ? "法律書" : "資料・見本誌");
      // 社員の机(業種の窓口・教室・診察の場所を除いた広さに)
      let need = Math.max(2, Math.round(t.staff * (K === "cram" || K === "clinic" ? 0.4 : OK_BY[K] && OK_BY[K].field ? 0.35 : 1))), c = 0;
      const yA = y0 + 2, yB = K === "realty" || K === "travel" || K === "ins" ? y1 - 5 : y1 - 2;
      // 島型: 2列の机を向かい合わせ(座る場所は島の外側)・島と島のあいだに通路。部屋いっぱいに並べる
      for (let yb = yA; yb + 3 < yB && c < need; yb += 4) for (const [dy, sy] of [[1, 0], [2, 3]]) for (let x = x0 + 2; x < x1 - (K === "soft" ? 4 : 2) && c < need; x++) {
        if ((x - x0) % 6 === 1) continue;
        if (P.add("pcdesk", x, yb + dy, "work", `${t.name}の机`)) {
          P.staffSpots.push({ x, y: yb + sy, biz: t.id });
          c++;
        }
      }
      // 打合せのテーブルと書類棚(窓口・教室・診察のない会社)
      if (!["clinic", "cram", "realty", "travel", "ins"].includes(K) && y1 - y0 > 9) {
        P.wide("table", x0 + 3, y1 - 4, 3, 2, "work", `${t.name} 打合せ`);
        for (const x of [x0 + 2, x0 + 7]) P.add("chair", x, y1 - 3, "rest", "打合せの椅子", false);
        P.wide("cabinet", x1 - 4, y1 - 2, 2, 1, null, "書類棚");
      }
      // 上司の机(窓ぎわ)
      if (P.add("desk", x0 + 1, y0 + 1 >= y1 ? y0 : y0 + 2, "work", `${t.name} 上司の机`)) P.staffSpots.push({ x: x0 + 2, y: y0 + 2, biz: t.id, boss: 1 });
    };
    if (lv < 0) {
      // 地下: 駐車場と設備室
      P.fill(1, 2, W2 - 2, H4 - 2, "floor_tile");
      for (let x = 3; x < W2 - 9; x += 4) P.wide("showcar", x, 4, 2, 3, null, "駐車中の車");
      P.room(W2 - 9, 10, W2 - 2, H4 - 2, { doors: [[W2 - 6, 10]], label: "設備室(受変電・空調)" });
      P.wide("rack", W2 - 7, 12, 3, 1, null, "受変電設備");
      P.staffSpots.push({ x: W2 - 6, y: 14, biz: "mgmt" });
    } else if (lv === 0) {
      // 1階: エントランス(受付・警備・案内板・郵便受け)と、店頭の入居企業
      P.wide("counter", dx - 2, H4 - 6, 4, 1, "info", "受付");
      P.staffSpots.push({ x: dx - 1, y: H4 - 7, biz: "mgmt", role: "receptionist" }, { x: dx + 3, y: H4 - 3, biz: "mgmt", role: "security" });
      P.add("board", dx + 4, H4 - 4, "info", "フロア案内: " + (w ? officeTenants(w, b).map((t) => `${floorName(t.lv)} ${t.vacant ? "空室" : t.name}`).join(" / ") : ""), true);
      P.wide("mailbank", 2, H4 - 3, 3, 1, null, "郵便受け");
      P.add("plant", dx - 4, H4 - 3, null, "観葉植物");
      if (tens[0]) room(tens[0], 1, dx - 2, 2, H4 - 8);
    } else {
      if (tens.length === 1) room(tens[0], 1, W2 - 9, 2, H4 - 2);
      else tens.forEach((t, i) => room(t, i ? (W2 - 9 >> 1) + 1 : 1, i ? W2 - 9 : W2 - 9 >> 1, 2, H4 - 2));
      // 給湯室・コピー
      P.add("sink", W2 - 4, H4 - 3, null, "給湯室");
      P.add("shelf", W2 - 4, H4 - 5, null, "複合機(コピー)");
    }
    return P.done({ floors: F, floor: lv, lv, lo, hi: F - 1, wallH: 3.2, label: lab(lv), office: true });
  };
  // 社員がいる階(人物情報・中の人の配置)
  function officeFloorOfSlot(w, s) {
    const t = bizOfSlot(w, s);
    if (!t) return null;
    if (t.mgmt) return JOB_IDS2[w.slots.job[s]] === "security" && uh(s, 7) % 2 ? -1 : 0;
    return t.lv;
  }
  // 勤務先の名前(人物情報・求人): 「ビル名 3F 企業名」
  function workplaceLabel(w, i) {
    const t = bizOfPerson(w, i);
    if (!t) return null;
    return `${w.map.buildings[t.b].name} ${floorName(t.lv)} ${t.name}`;
  }
  // 1階のエントランス: 出勤(着く10分前〜)と退勤(出た直後)の社員が、入口と階段・エレベーターのあいだを歩く。昼休みは外へ出る人も
  function officeLobbyFlow(C2, bIdx, I2, floor, res) {
    const g = C2.g, w = g.world, b = w.map.buildings[bIdx];
    if (!isTenantOffice(b) || floor !== 0 || !I2.office) return res;
    const m = g.S.min, dow = g.date().dow, seen = new Set(res.map((q) => q.id)), p = w.pop;
    const ex = I2.door, up = (I2.objs.find((o) => o.t === "elev") || I2.stairs[0] || { x: I2.W - 3, y: 1 });
    let n2 = 0;
    for (let s = 0; s < w.slots.b.length && n2 < 10; s++) {
      if (w.slots.b[s] !== bIdx) continue;
      const i = w.slots.who[s];
      if (i < 0 || i === g.hero.id || p.gone[i] || seen.has(i)) continue;
      const fl = officeFloorOfSlot(w, s);
      if (!fl || fl < 1) continue;
      const now = personActivity(w, i, m, dow), soon = personActivity(w, i, m + 10, dow), was = personActivity(w, i, m - 10, dow);
      const arriving = now.s !== 2 && soon.s === 2 && soon.at === bIdx, leaving = was.s === 2 && was.at === bIdx && now.s !== 2;
      const lunch = now.s === 2 && now.at === bIdx && m >= 720 && m < 780 && uh(i, Math.floor(m / 15)) % 6 === 0;
      if (!arriving && !leaving && !lunch) continue;
      const ph = (m % 10 + uh(i, 9) % 10) / 20, t = arriving ? ph : 1 - ph;
      const x = ex.x + 0.5 + (up.x + 0.5 - ex.x - 0.5) * t + (uh(i, 3) % 3 - 1) * 0.6, y = ex.y - 1 + (up.y + 2 - ex.y + 1) * t;
      res.push({ id: i, x, y, dir: arriving ? "u" : "d", role: "commuter" });
      n2++;
    }
    return res;
  }
  // ---- 入れ替わり(毎年1月・towndev.js から): 退去 → 空室 → 新しい企業の入居。根拠は景気(econIndex)と、その年代の業種の需要(重み)。
  // 退去した企業の社員は「解雇(laid)」として職歴に残り、職探しに戻る。その区画の職の枠は凍結し(bizFz)、新しい企業は自分の枠を足す。
  // 主人公が働いている企業・主人公の会社の区画は動かさない
  // 開業の中心メンバー: 枠の半分まで、近くに住む職のない人(その職に就ける人)→ 同じ職で別の職場に勤める人(転職)の順に。
  // 人手不足の時代でも新しい会社が空のまま、にならないように(転職は職歴に「quit」として残る)
  function foundTeam(w, b, sl, name) {
    const p = w.pop, B2 = w.map.buildings, M = w.M, need = Math.ceil(sl.length * 0.5);
    let n2 = 0, moved = 0;
    for (const s of sl.slice(0, need)) {
      const j = JOB_IDS2[w.slots.job[s]], ji = w.slots.job[s];
      let best = -1, bd = 1e9, bestEmp = -1, bde = 1e9;
      for (let i = 0; i < p.n; i++) {
        if (p.gone[i] || p.home[i] < 0 || i === w.heroId || p.flags[i] & (F_STUDENT | F_HERO)) continue;
        const hb = B2[p.home[i]];
        if (!hb) continue;
        const d = Math.abs(hb.doorX - b.doorX) + Math.abs(hb.doorY - b.doorY);
        if (p.work[i] < 0) {
          if (d < bd && ageYears(p, i, M) < 65 && w.eligibleFor(i, j, M)) bd = d, best = i;
        } else if (p.job[i] === ji && p.work[i] !== b.idx && d < bde && !w.known.has(i)) bde = d, bestEmp = i;
      }
      let who = best >= 0 && bd < 200 ? best : bestEmp;
      if (who < 0) continue;
      if (p.work[who] >= 0) {
        w.freeSlot(who, "quit");
        moved++;
        try {
          w.noteLife(who, M, "work", `新しく開業した${name}(${b.name})に転職した`);
        } catch (_) {
        }
      }
      const vi = w.vacant.indexOf(s);
      if (vi >= 0) w.vacant.splice(vi, 1);
      w.takeSlot(who, s);
      n2++;
    }
    return { n: n2, moved };
  }
  function tenantTurnover(w, y, log) {
    const B2 = w.map.buildings, p = w.pop, eco = typeof econIndex === "function" ? econIndex(y) : 1;
    w.bizOv || (w.bizOv = {});
    w.bizFz || (w.bizFz = {});
    const heroBiz = w.heroId != null && w.heroId >= 0 ? bizOfPerson(w, w.heroId) : null;
    let n2 = 0;
    for (const b of B2) {
      if (!isTenantOffice(b) || b.status === "closed") continue;
      const L3 = officeTenants(w, b);
      for (const t of L3) {
        if (t.hero) continue;
        const ov = w.bizOv[b.idx] || (w.bizOv[b.idx] = {}), r = uh(b.idx * 131 + t.lv * 7 + t.part, 4420 + y) % 1e4 / 1e4;
        if (!t.vacant) {
          if (heroBiz && heroBiz.id === t.id) continue;
          // その年代の需要(業種の重み)が低いほど・景気が悪いほど退去しやすい。開業から3年は動かない
          const K = OK_BY[t.kind], dem = K ? K.w(y) / Math.max(0.3, K.w(t.from || y)) : 1;
          const pr = 0.014 * (eco < 0.86 ? 1.5 : eco > 1.05 ? 0.7 : 1) * (dem < 0.7 ? 2 : 1);
          if (y - (t.from || 0) < 3 || r >= pr) continue;
          const sl = [];
          for (let k = 0; k < w.slots.b.length; k++) if (w.slots.b[k] === b.idx) {
            const bz = bizOfSlot(w, k);
            if (bz && bz.id === t.id) sl.push(k);
          }
          let laid = 0;
          for (const k of sl) {
            const who = w.slots.who[k];
            if (who >= 0) {
              w.freeSlot(who, "laid");
              try {
                w.noteLife(who, w.M, "work", `勤め先の${t.name}(${b.name} ${floorName(t.lv)})が退去・閉業し、職を失った`);
              } catch (_) {
              }
              laid++;
            }
          }
          const fzs = new Set(sl);
          w.vacant = w.vacant.filter((k) => !fzs.has(k));
          w.bizFz[b.idx] = [...w.bizFz[b.idx] || [], ...sl];
          ov[t.key] = { vacant: 1, M: w.M, prev: t.name, prevKind: t.kind };
          log && log(b, "tenant_close", `${floorName(t.lv)}の${t.name}(${t.kindName})が退去した。社員${laid}人は職探しへ`, `景気 ${eco.toFixed(2)}・${y}年の${t.kindName}の需要`);
          n2++;
        } else {
          // 空室: 景気が良いほど・駅前や中心部ほど早く埋まる(空いてから1年はそのまま)
          const o = ov[t.key];
          if (o && o.M != null && w.M - o.M < 12) continue;
          const pr = 0.3 * eco * (b.zone === "downtown" || b.zone === "tower" ? 1.3 : 1);
          if (r >= pr) continue;
          const kind = pickOfficeKind(b, t.lv * 2 + t.part + y, y, t.lv === 0), name = officeName(b, t.lv * 2 + t.part + y, kind);
          const staff = Math.max(2, Math.round((t.lv === 0 ? floorCap(b) * 0.45 : floorCap(b) / t.parts) * 0.7));
          const sl = [];
          let left = staff;
          const ents = Object.entries(kind.jobs);
          ents.forEach(([j, f2], i) => {
            const n3 = i === ents.length - 1 ? left : Math.max(1, Math.min(left, Math.round(staff * f2)));
            for (let q = 0; q < n3; q++) {
              const s = w.slots.b.length;
              w.slots.b.push(b.idx);
              w.slots.job.push(JOB_INDEX[j]);
              w.slots.who.push(-1);
              w.vacant.push(s);
              sl.push(s);
            }
            left -= n3;
          });
          ov[t.key] = { kind: kind.k, name, from: y, sl };
          const core = foundTeam(w, b, sl, name);
          log && log(b, "tenant_open", `${floorName(t.lv)}の空室に${name}(${kind.n})が入居した。${staff}人の枠のうち${core.n}人で開業(転職${core.moved}人)`, `景気 ${eco.toFixed(2)}・${y}年の${kind.n}の需要・空室${o && o.M != null ? Math.floor((w.M - o.M) / 12) + "年" : ""}`);
          n2++;
        }
      }
    }
    return n2;
  }
