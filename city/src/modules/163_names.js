  // src/names.js — 機械的な施設名(「〜第2」「緑町(行政地区)小学校」「桜ヶ丘文教地区中学校」など)を、自然な架空の名前へ
  // 建物ID・番号は変えない。名前だけを、場所(地区)と同じ名前の1つ目からの方角などから決定的に決める。
  // 生成時(World の作成)とセーブの読み込み後(bdyn の名前の上書きのあと)の両方で同じ結果になる。元の名前は b.nameOld に残す。
  var KANJI_N = ["", "", "第二", "第三", "第四", "第五", "第六", "第七", "第八", "第九", "第十"];
  // 地区名から用途の語を除く(「桜ヶ丘文教地区」→「桜ヶ丘」・「緑町(行政地区)」→「緑町」)
  function cleanArea(s) {
    let t = String(s || "").replace(/付近$/, "").replace(/[((][^))]*[))]/g, "");
    t = t.replace(/(文教地区|住宅地|商店街|旧市街|温泉街|集落|地区|エリア|周辺)$/, "");
    return t || "青海";
  }
  // 施設名の中の地区名を整える(括弧・用途語を除く)
  var cleanBase = (nm) => String(nm).replace(/[((][^))]*[))]/g, "").replace(/(文教地区|住宅地|商店街|旧市街|温泉街|集落)/, "");
  // 1つ目の建物から見た方角
  function dirFrom(a, b) {
    const dx = b.doorX - a.doorX, dy = b.doorY - a.doorY;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return "中央";
    return Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "東" : "西" : dy > 0 ? "南" : "北";
  }
  // 支店の呼び名(同じ地区に同じ店が重なったとき)
  var BRANCH_Q = ["", "駅前", "本町", "北口", "南口", "東口", "西口", "中央", "二丁目", "三丁目", "通り", "東", "西", "南", "北"];
  // 店名の業種語の後ろに「〇〇店」を付ける種類
  var CHAIN_T = new Set(["shop", "cafe", "konbini", "ramen", "restaurant", "izakaya", "clothes", "bookstore", "super", "gamecenter", "bowling", "gym", "pharmacy", "seafood", "greengrocer", "fishshop", "liquor", "directsale", "gasstation", "homecenter", "cinema", "mall", "dept", "onsenbath"]);
  var MUSEUMS = ["青海市立博物館", "青海市立美術館", "青海歴史民俗資料館", "青海市科学館", "青海海洋博物館", "青海郷土資料館", "青海文学館", "青海交通博物館"];
  var COURTS = ["青海地方裁判所", "青海家庭裁判所", "青海簡易裁判所"];
  var HOSP = ["総合病院", "記念病院", "市民病院", "協立病院", "中央病院"];
  var TEMPLE_N = ["光明寺", "正覚寺", "西福寺", "長安寺", "宝泉寺", "龍雲寺", "妙法寺", "瑞光寺", "東禅寺", "常楽寺"];
  var SHRINE_K = ["八幡神社", "稲荷神社", "天満宮", "神明社", "日枝神社", "熊野神社"];
  var PARK_K = ["公園", "緑地", "児童公園", "ふれあい広場", "中央公園", "運動公園"];
  var BEACH_N = ["海の家さざなみ", "海の家はまかぜ", "海の家なぎさ亭", "海の家しおさい", "海の家みさき", "海の家あおば", "海の家とびうお"];
  var RYOKAN_Q = ["", "別館", "はなれ", "新館", "山荘", "川床"];
  var TOWER_Q = ["", "イースト", "ウエスト", "サウス", "ノース", "セントラル", "ベイサイド", "ガーデン", "パーク", "ヒルズ"];
  var HOTEL_Q = ["", "駅前", "ベイサイド", "セントラル", "イースト", "ウエスト", "アネックス", "プラザ", "ガーデン"];
  // 「〇〇食堂・レストラン」→ 屋号ごとに「〇〇食堂」か「レストラン〇〇」
  function restStyle(nm) {
    const m = /^(.+?)食堂・レストラン(.*)$/.exec(nm || "");
    if (!m) return nm;
    return (uh(m[1].length * 131 + m[1].charCodeAt(0), 71) % 2 ? `${m[1]}食堂` : `レストラン${m[1]}`) + m[2];
  }
  // 街の店の入れ替わり(world.js)で開店する店の名前: 候補(屋号+業種)を整え、同じ名前の店がほかにあれば「〇〇店」を付ける
  function shopOpenName(map2, b, cand) {
    let nm = restStyle(cand);
    const B2 = map2.buildings, taken = (n2) => B2.some((q) => q !== b && q.name === n2);
    if (!taken(nm)) return nm;
    const ar = cleanArea(typeof areaName === "function" ? areaName(map2, b.doorX, b.doorY) : "");
    const a2 = /・|遊園地|動物園|空港|工業|物流|リゾート|港湾/.test(ar) ? "青海" : ar;
    for (const q of BRANCH_Q) {
      const n2 = `${nm} ${a2}${q}店`;
      if (!taken(n2)) return n2;
    }
    return `${nm} ${a2}${b.idx}号店`;
  }
  function naturalNames(map2) {
    if (!map2 || !map2.buildings) return;
    const B2 = map2.buildings;
    // 生成したときの名前(1回目に記録。セーブの読み込み後の2回目もこの名前から決める)
    for (const b of B2) if (b.nameGen === void 0) b.nameGen = b.nameOld ?? b.name;
    // 名前を変えてよいのは、生成したときの名前か、この規則で付けた名前のままの建物(街の移り変わりで変わった名前は変えない)
    // (街の移り変わりで開店した店の名前: nameSim。印のない旧いセーブは建物の歴史の「〜が開店した」で見分ける)
    const simNamed = (b) => b.nameSim || (b.history || []).some((h) => h && typeof h.text === "string" && h.text.startsWith("跡地に" + b.name + "が開店"));
    const mine = (b) => (b.name === b.nameGen || b.name === b.nameNat) && !simNamed(b);
    // 地区名: 住宅地などの地区名を整えて使う。用途の名前(「遊園地・動物園」「臨港工業・物流」など)の地区は、いちばん近い駅の名前を使う
    const sts = (map2.stations || []).map((s) => ({ x: s.door ? s.door.x : s.x, y: s.door ? s.door.y : s.y, n: String(s.name || "").replace(/駅$/, "") })).filter((s) => s.n);
    const nearSt = (b) => {
      let best = null, bd = 1e9;
      for (const s of sts) {
        const d = Math.abs(s.x - b.doorX) + Math.abs(s.y - b.doorY);
        if (d < bd) {
          bd = d;
          best = s.n;
        }
      }
      return best;
    };
    const area = (b) => {
      const a = cleanArea(typeof areaName === "function" ? areaName(map2, b.doorX, b.doorY) : "");
      return /・|遊園地|動物園|空港|工業|物流|リゾート|森|山間|港湾/.test(a) ? nearSt(b) || "青海" : a;
    };
    // 候補の一覧から、まだ使われていない名前を選ぶ(同じ地区に同じ種類が重なったとき)
    const pickFree = (pre, list, h, self) => {
      for (let k = 0; k < list.length; k++) {
        const nm = pre + list[(h + k) % list.length];
        if (!used.has(nm) || self && nm === self.name) return nm;
      }
      return pre + list[h % list.length];
    };
    const used = new Set(B2.map((b) => b.name));
    const take = (b, nm) => {
      if (!nm || nm === b.name) return;
      let n2 = nm;
      const busy = (q) => used.has(q) && q !== b.nameNat;
      for (let k = 2; busy(n2) && k < 30; k++) n2 = nm + (k < KANJI_N.length ? "(" + KANJI_N[k].replace("第", "") + ")" : k);
      if (busy(n2)) return;
      if (b.nameOld == null) b.nameOld = b.name;
      used.add(n2);
      b.name = n2;
      b.nameNat = n2;
    };
    // 1) 地区名に用途の語や括弧が付いた名前を整える(学校・幼稚園・神社・寺・自動車店)
    for (const b of B2) {
      const nm = b.name || "";
      if (!/[((]|文教地区|住宅地|商店街|旧市街|温泉街|集落/.test(nm)) continue;
      if (!["elem", "jh", "kinder", "shrine", "temple", "usedcar", "cardealer"].includes(b.type) || !mine(b)) continue;
      take(b, cleanBase(nm));
    }
    // 2) 「〜第N」: 同じもとの名前ごとにまとめて、1つ目からの方角・地区・種類ごとの呼び名を付ける
    const groups = /* @__PURE__ */ new Map();
    for (const b of B2) {
      // もとの名前(このあと屋号が変わった店も、順番を数えるために入れる)
      const m = /^(.*?)第(\d+)$/.exec(b.nameGen || "");
      if (!m) continue;
      const base = ["elem", "jh", "kinder", "shrine", "temple"].includes(b.type) ? cleanBase(m[1]) : m[1];
      if (!groups.has(base)) groups.set(base, { first: B2.find((q) => q.nameGen === m[1] || q.nameGen === base) || null, list: [] });
      groups.get(base).list.push({ b, n: +m[2] });
    }
    // 同じ名前(番号なし)の建物が何軒もあるとき: 2軒目からを同じ組に入れる(番号は大きく取り、ID順)
    const seenN = /* @__PURE__ */ new Map();
    for (const b of B2) {
      if (b.type === "house" || b.type === "farmhouse" || b.type === "villa" || (b.campusOf ?? b.parentB) != null) continue;
      const src = b.nameGen || "";
      if (!src || /第\d+$/.test(src)) continue;
      const k = b.type + "|" + src;
      const c = seenN.get(k) || 0;
      seenN.set(k, c + 1);
      if (!c) continue;
      const base = ["elem", "jh", "kinder", "shrine", "temple"].includes(b.type) ? cleanBase(src) : src;
      if (!groups.has(base)) groups.set(base, { first: B2.find((q) => q.nameGen === src) || null, list: [] });
      groups.get(base).list.push({ b, n: 1e3 + c, dupe: true });
    }
    for (const [base, G] of groups) {
      G.list.sort((p, q) => p.n - q.n || p.b.idx - q.b.idx);
      const usedQ = /* @__PURE__ */ new Map();
      for (const { b, n: n2 } of G.list) {
        const t = b.type, ar = area(b), f = G.first;
        let nm = null;
        if (["elem", "jh", "kinder"].includes(t)) {
          // 学校: 1つ目の学校からの方角(東・西・南・北・中央)。重なれば「第二」
          const noun = /^(.*?)(小学校|中学校|幼稚園|保育園|こども園)$/.exec(base);
          if (noun) {
            const d = f ? dirFrom(f, b) : "中央";
            const k = noun[1] + d + noun[2];
            nm = used.has(k) && k !== b.name ? noun[1] + KANJI_N[Math.min(10, n2)] + noun[2] : k;
          }
        } else if (t === "police" || t === "fire") {
          nm = `${ar === "青海" ? "青海中央" : ar}${t === "police" ? "警察署" : "消防署"}`;
        } else if (t === "library") nm = `青海市立${ar}図書館`;
        else if (t === "museum") nm = MUSEUMS[Math.min(MUSEUMS.length - 1, n2 - 1)];
        else if (t === "court") nm = COURTS[Math.min(COURTS.length - 1, n2 - 1)];
        else if (t === "hospital") nm = pickFree(ar, HOSP, uh(b.idx, 61), b);
        else if (t === "media") nm = `${base} ${ar}スタジオ`;
        else if (t === "park") nm = pickFree(ar, PARK_K, uh(b.idx, 62), b);
        else if (t === "temple") nm = pickFree("", TEMPLE_N, uh(b.idx, 63), b);
        else if (t === "shrine") nm = pickFree(ar, SHRINE_K, uh(b.idx, 64), b);
        else if (t === "cemetery") nm = pickFree(ar, ["霊園", "墓地", "メモリアルパーク", "聖地公園"], 0, b);
        else if (t === "beachhouse") nm = BEACH_N[(n2 + uh(b.idx, 65)) % BEACH_N.length];
        else if (t === "ryokan" || t === "minshuku") nm = `${base} ${RYOKAN_Q[Math.min(RYOKAN_Q.length - 1, n2 - 1)]}`;
        else if (t === "tower" || t === "apt") nm = `${base} ${TOWER_Q[Math.min(TOWER_Q.length - 1, n2 - 1)]}`;
        else if (t === "hotel" || t === "bizhotel" || t === "resorthotel") nm = ar === "青海" ? `${base} ${HOTEL_Q[Math.min(HOTEL_Q.length - 1, n2 - 1)] || "アネックス"}` : `${base} ${ar}`;
        else if (t === "univ") nm = `${base} ${ar}キャンパス`;
        else if (t === "bank") nm = `${base} ${ar}支店`;
        else if (t === "warehouse" || t === "logistics" || t === "factory") nm = `${base} ${ar}${t === "factory" ? "工場" : t === "warehouse" ? "倉庫" : "センター"}`;
        else if (t === "clinic") nm = `${base.replace(/診療所$/, "")}クリニック ${ar}`;
        else if (t === "nursing" || t === "welfare" || t === "funeral" || t === "harboroffice" || t === "farmcoop" || t === "pier" || t === "sento" || t === "agency" || t === "lawfirm" || t === "office") nm = `${base} ${ar}`;
        else if (CHAIN_T.has(t)) nm = `${base} ${ar}店`;
        else nm = `${base} ${ar}`;
        if (!nm) continue;
        // 同じもとの名前・同じ地区で重なったら、順番(第N の小さい順)で支店の呼び名を足す(ほかの建物のいまの名前には左右されない)
        const k0 = usedQ.get(nm) || 0;
        usedQ.set(nm, k0 + 1);
        if (k0 > 0) {
          if (/店$/.test(nm)) nm = nm.replace(/店$/, BRANCH_Q[Math.min(BRANCH_Q.length - 1, k0)] + "店");
          else if (/(センター|倉庫|工場)$/.test(nm)) nm = nm.replace(/(センター|倉庫|工場)$/, KANJI_N[Math.min(10, k0 + 1)] + "$1");
          else nm = nm + " " + KANJI_N[Math.min(10, k0 + 1)].replace("第", "") + "号館";
        }
        // いまも機械的な名前のままの建物だけ名前を変える(屋号の変わった店はそのまま)
        if (mine(b)) take(b, restStyle(nm));
      }
    }
    // 3) 敷地の中の棟(体育館・学部棟など)の名前は、本体の新しい名前に合わせる
    for (const b of B2) {
      const pb = B2[b.campusOf ?? b.parentB];
      if (!pb || pb === b || pb.nameOld == null || b.name.startsWith(pb.name + " ")) continue;
      // 敷地を作ったときの本体の名前(「〜第2」を除いた名前のこともある)
      const pre = [pb.nameOld, pb.nameOld.replace(/第\d+$/, "")].find((q) => b.name.startsWith(q + " "));
      if (!pre) continue;
      take(b, pb.name + b.name.slice(pre.length));
    }
    // 4) 「〇〇食堂・レストラン」(種類の名前そのまま)を、屋号ごとに「〇〇食堂」か「レストラン〇〇」へ(同じ屋号の店はそろえる)
    for (const b of B2) if (/食堂・レストラン/.test(b.name || "") && mine(b)) take(b, restStyle(b.name));
  }
