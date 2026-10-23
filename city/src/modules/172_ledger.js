  // src/ledger.js — 活動の実績(人物IDごと・人口の配列に保存・二重加算なし)。人生の目標(ミッション)の進み具合と、エンディングの表彰の根拠。
  // 数えるのは、月ごとの街の動き(world.tickMonth)で実際に起きたことだけ:
  //   workM 働いた月数 / careM 人を支える仕事(医療・介護・教育・保育・消防・警察)の月数 / promo 昇進の回数 /
  //   grads 卒業した学校の段階(ビット) / clubY 部活を続けた年数(4月に部員なら1年)
  // 旧いセーブはこの版からの記録になる(過去の分は分からないので0から)。
  var LEDGER = ["workM", "careM", "promo", "grads", "clubY"];
  var CARE_JOBS = /* @__PURE__ */ new Set(["doctor", "nurse", "caregiver", "carewelfare", "childcare", "teacher", "firefighter", "police", "pharmacist", "professor", "welfare"]);
  // 毎月(生きている住民ごと・主人公も)
  function ledgerMonth(w, i, M) {
    const p = w.pop;
    if (!p.workM) return;
    if (p.work[i] >= 0) {
      if (p.workM[i] < 65535) p.workM[i]++;
      const jid = p.job[i] < 255 ? JOB_IDS2[p.job[i]] : null;
      if (jid && CARE_JOBS.has(jid) && p.careM[i] < 65535) p.careM[i]++;
    }
    ledgerClass(w, i, M);
    // 4月: 中学・高校の部員なら部活1年
    const ag = (M - p.born[i]) / 12;
    if (M % 12 === 3 && p.school[i] >= 0 && ag >= 12 && ag < 19 && typeof campusClubOf === "function") {
      const t = (w.map.buildings[p.school[i]] || {}).type;
      if ((t === "jh" || t === "hs") && campusClubOf(i) !== "none" && p.clubY[i] < 255) p.clubY[i]++;
    }
  }
  // 3月: 小学校・中学校・高校の組を記録(その学年の最後の組。卒業の年は卒業したときの組が残る)
  function ledgerClass(w, i, M) {
    const p = w.pop;
    if (!p.cls2 || M % 12 !== 2 || p.school[i] < 0 || typeof kumiAt !== "function") return;
    const b = w.map.buildings[p.school[i]], lv = { elem: 2, jh: 3, hs: 4 }[b && b.type];
    if (!lv) return;
    const k = kumiAt(w, b, i);
    if (k >= 0) p["cls" + lv][i] = k;
  }
  function ledgerPromo(w, id) {
    const p = w.pop;
    if (p.promo && p.promo[id] < 255) p.promo[id]++;
  }
  function ledgerGrad(w, id, lv) {
    const p = w.pop;
    if (p.grads && lv >= 1 && lv <= 5) p.grads[id] |= 1 << lv;
  }
  var gradCount = (v) => [1, 2, 3, 4, 5].filter((k) => v >> k & 1).length;
  // ---- 人生の目標(NPC): いまの段階に合った目標と、実績からの進み具合
  function lifeMission(w, id) {
    const p = w.pop;
    if (!p.workM || p.gone[id]) return null;
    const age = Math.floor((w.M - p.born[id]) / 12), B2 = w.map.buildings;
    const sb = p.school[id] >= 0 ? B2[p.school[id]] : null;
    if (sb) {
      const span = { kinder: 3, elem: 6, jh: 3, hs: 3, univ: 4 }[sb.type] || 3, start = { kinder: 3, elem: 6, jh: 12, hs: 15, univ: 18 }[sb.type] || age;
      const done = Math.max(0, Math.min(span, age - start));
      if ((sb.type === "jh" || sb.type === "hs") && campusClubOf(id) !== "none") return { title: `${CLUB_NAME[campusClubOf(id)]}を3年続ける`, prog: Math.min(1, p.clubY[id] / 3), ev: `部活 ${p.clubY[id]}年(4月ごとの記録)` };
      return { title: `${sb.name}を卒業する`, prog: done / span, ev: `在学 ${done}/${span}年` };
    }
    if (p.work[id] >= 0) {
      if (p.promo[id] === 0 && age < 45) return { title: "最初の昇進", prog: Math.min(0.95, p.workM[id] / 72), ev: `勤務 ${p.workM[id]}か月・昇進 ${p.promo[id]}回` };
      return { title: "勤続30年", prog: Math.min(1, p.workM[id] / 360), ev: `勤務 ${p.workM[id]}か月(${Math.floor(p.workM[id] / 12)}年)` };
    }
    const kids = w.childrenOf(id).filter((k) => !p.gone[k]);
    if (kids.length && kids.some((k) => Math.floor((w.M - p.born[k]) / 12) < 18)) {
      const y = Math.min(...kids.map((k) => Math.floor((w.M - p.born[k]) / 12)));
      return { title: "子どもを一人立ちまで育てる", prog: Math.min(1, y / 18), ev: `末の子 ${y}歳` };
    }
    if (age >= 65) return { title: "元気に長生きする", prog: Math.min(1, (age - 65) / 25), ev: `${age}歳` };
    return null;
  }
  // ---- エンディングの表彰: 実績だけを根拠に、決定的に選ぶ(同じ人は1つまで・同点は人物IDの小さい人)
  // 対象: 主人公が人生で関わった人(知人・家族)。根拠の数値と、その数え方を添える
  var AWARDS = [
    ["勤続賞", "workM", (v) => `働いた月数 ${v}か月(${Math.floor(v / 12)}年)`, 120],
    ["人を支えた賞", "careM", (v) => `医療・介護・教育などの仕事 ${v}か月`, 60],
    ["リーダー賞", "promo", (v) => `昇進 ${v}回`, 2],
    ["部活一筋賞", "clubY", (v) => `部活を続けた年数 ${v}年`, 4],
    ["学びの道賞", "grads", (v) => `卒業した学校 ${gradCount(v)}校`, 3]
  ];
  function ledgerAwards(g) {
    const w = g.world, p = w.pop, h = g.hero;
    if (!p.workM) return [];
    const cand = [...new Set([...Object.keys(h.rel || {}).map(Number), p.mother[h.id], p.father[h.id], ...(h.kids || [])].filter((x) => x >= 0 && x !== h.id && x < p.n))];
    const used = /* @__PURE__ */ new Set(), out = [];
    for (const [title, key, fmt, min] of AWARDS) {
      let best = -1, bv = -1;
      for (const id of cand) {
        if (used.has(id)) continue;
        const v = key === "grads" ? gradCount(p.grads[id]) : p[key][id];
        if (v > bv || v === bv && id < best) {
          bv = v;
          best = id;
        }
      }
      if (best < 0 || bv < min) continue;
      used.add(best);
      out.push({ title, id: best, name: g.nameOf(best), value: bv, evidence: fmt(key === "grads" ? p.grads[best] : bv), rule: `${title}: 知人・家族${cand.length}人の中で「${key}」がいちばん多い人(同じ数なら人物IDの小さい人・一人1賞)` });
    }
    // 子育て賞: 育てた子の数(親子の記録)
    let kb = -1, kv = 0;
    for (const id of cand) if (!used.has(id)) {
      const n2 = w.childrenOf(id).length;
      if (n2 > kv || n2 === kv && n2 > 0 && id < kb) {
        kv = n2;
        kb = id;
      }
    }
    if (kb >= 0 && kv >= 3) out.push({ title: "子育て賞", id: kb, name: g.nameOf(kb), value: kv, evidence: `子ども ${kv}人(親子の記録)`, rule: "子育て賞: 知人・家族の中で子どもの数がいちばん多い人(3人以上)" });
    // 夢と進路の表彰(dreams.js)
    if (typeof dreamAwards === "function") try {
      for (const a of dreamAwards(g, cand, used)) out.push(a);
    } catch (e) {
    }
    return out;
  }
