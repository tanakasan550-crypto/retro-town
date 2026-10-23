  // src/reunion.js — 何十年ぶりの再会: 同じ学校にいた人(同級生・同じ組・先輩後輩)と大人になってから話すと、
  // 本当にあったこと(在籍記録・最後の組・その年の担任・主人公の日記の行事・いまの仕事と家族・ほかの同級生の消息)を話題にする。
  // すべて人物IDと年月の記録が根拠(作り話はしない)。再会したことは主人公の日記と、その人とのつながり(rel)に残る。
  var GRAD_AGE = { 1: 6, 2: 12, 3: 15, 4: 18, 5: 22 };
  var LV_NAME = { 1: "幼稚園", 2: "小学校", 3: "中学校", 4: "高校", 5: "大学" };
  // その段階を卒業した年(学年度で数える: 4月2日〜翌4月1日生まれが同じ学年)
  function gradYearOf(p, id, lv) {
    const by = 1900 + Math.floor((p.born[id] - 3) / 12);
    return by + GRAD_AGE[lv] + 1;
  }
  // 職歴(prof.hist)から、その年にその学校で教員だった人
  function teachersAt(w, b, year) {
    const out = [], M0 = (year - 1900) * 12 + 3;
    for (const [id, pr] of w.prof || []) {
      if (!pr.hist) continue;
      let cur = null;
      for (const e of pr.hist) {
        if (e.k === "start") cur = e.b === b && /teacher/.test(e.job || "") ? e.M : null;
        else if (cur != null) {
          if (cur <= M0 && e.M > M0 - 12) out.push(id);
          cur = null;
        }
      }
      if (cur != null && cur <= M0) out.push(id);
    }
    return [...new Set(out)].sort((a, c) => a - c);
  }
  // 最後の年の担任(決定的)。いなければ -1
  function pastHomeroom(w, b, kumi, year) {
    const L3 = teachersAt(w, b, year - 1);
    return L3.length ? L3[uh(b * 977 + kumi, year) % L3.length] : -1;
  }
  // 主人公の日記: その学校に通っていた年の行事
  function schoolDiary(g, y0, y1) {
    const L3 = (g.S.log || []).filter((e) => e.kind === "event" && ["sports_day", "school_trip", "festival_autumn", "club_choice", "graduation"].includes(e.ev));
    return L3.filter((e) => {
      const y = 1900 + Math.floor(e.M / 12);
      return y >= y0 && y <= y1;
    });
  }
  // 再会の話題(talk.js から)。gapM: 前に話してからの月数(はじめてなら null)
  function reunionFacts(g, id, gapM) {
    const w = g.world, p = w.pop, h = g.hero, B2 = w.map.buildings, out = [];
    if (typeof schoolTies !== "function" || g.age() < 18) return out;
    const Y = g.year(), say = (s, why, pri) => out.push({ say: s, why, pri });
    const ties = schoolTies(w, h.id, id).filter((t) => t.lv >= 2);
    if (!ties.length) return out;
    // いちばん新しい段階の縁(高校 → 中学 → 小学校)
    const t = ties.sort((a, c) => c.lv - a.lv)[0];
    const gy = gradYearOf(p, h.id, t.lv), yrs = Y - gy;
    if (yrs < 3) return out;
    const longGap = gapM == null || gapM >= 120;
    const rel = t.k === "classmate" ? "同じクラス" : t.k === "gradeMate" ? "同じ学年" : t.k === "senpai" ? "先輩" : "後輩";
    const lvn = LV_NAME[t.lv], kumi = p["cls" + t.lv] ? p["cls" + t.lv][h.id] : 255;
    const kumiTxt = t.k === "classmate" && kumi !== 255 ? `${kumi + 1}組` : "";
    if (longGap) say(`${t.name}${kumiTxt ? "の" + kumiTxt : ""}で${rel}だった${g.nameOf(id).split(" ")[1] || ""}だよ。${yrs >= 10 ? `${yrs}年ぶりかな。` : "ひさしぶり!"}`, `在籍記録(${t.name}・${gy}年卒業${kumiTxt ? "・最後の組 " + kumiTxt : ""})${gapM == null ? "・卒業後はじめての会話" : `・前に話してから${Math.floor(gapM / 12)}年`}`, 3);
    // 担任の先生(同じ組のときだけ)とその後
    if (t.k === "classmate" && kumi !== 255) {
      const tc = pastHomeroom(w, t.b, kumi, gy);
      if (tc >= 0) {
        const tn = g.nameOf(tc), dead = p.gone[tc] === 1, ty = dead ? 1900 + Math.floor(p.goneAt[tc] / 12) : 0;
        const now = dead ? `${ty}年に亡くなったって聞いたよ。` : p.work[tc] >= 0 ? `今は${B2[p.work[tc]].name}にいるらしいよ。` : `もう退職されたみたい。`;
        say(`担任の${tn}先生、覚えてる?${now}`, `職歴の記録(${tn}・${gy - 1}年度に${t.name}の教員)${dead ? "・葬儀の記録" : ""}`, 2);
      }
    }
    // 同じ学校の年の行事(主人公の日記から)
    const y0 = gy - ({ 2: 6, 3: 3, 4: 3 }[t.lv] || 3), di = schoolDiary(g, y0, gy);
    if (di.length) {
      const e = di[uh(id + Y, 911) % di.length], ey = 1900 + Math.floor(e.M / 12);
      const nm = { sports_day: "運動会", school_trip: "修学旅行", festival_autumn: "秋祭り", club_choice: "部活を決めたころ", graduation: "卒業式" }[e.ev] || "あのころ";
      say(`${ey}年の${nm}、覚えてる?なつかしいね。`, `主人公の日記(${ey}年${(e.M % 12) + 1}月: ${String(e.text || "").slice(0, 30)})`, 2);
    }
    // いまの暮らし(仕事・家族)
    if (p.work[id] >= 0) {
      const wl = (typeof workplaceLabel === "function" ? workplaceLabel(w, id) : null) || B2[p.work[id]].name, jn = JOBS[JOB_IDS2[p.job[id]]];
      say(`今は${wl}で${jn ? jn.name : "働いて"}${jn ? "をしてるんだ" : "るんだ"}。`, `いまの職場の記録(${wl})`, 2);
    } else if (Math.floor((w.M - p.born[id]) / 12) >= 60) say("もう仕事は引退して、のんびりしてるよ。", "職歴の記録(いまは無職・60歳以上)", 2);
    const kids = w.childrenOf(id).filter((k) => !p.gone[k]);
    if (p.spouse[id] >= 0 || kids.length) say(`${p.spouse[id] >= 0 ? "結婚して、" : ""}${kids.length ? `子どもが${kids.length}人いるんだ。` : "ふたりで暮らしてるよ。"}`, `家族の記録(配偶者${p.spouse[id] >= 0 ? "あり" : "なし"}・子${kids.length}人)`, 2);
    // ほかの同級生の消息(同じ学校・同じ学年。亡くなった人・結婚した人)
    const lvk = "sch" + t.lv, sb = t.b, coh = Math.floor((p.born[h.id] - 3) / 12);
    if (p[lvk]) {
      let dead = -1, marr = -1;
      for (let i = 0; i < p.n && (dead < 0 || marr < 0); i++) {
        if (i === h.id || i === id || p[lvk][i] !== sb || Math.floor((p.born[i] - 3) / 12) !== coh) continue;
        if (dead < 0 && p.gone[i] === 1 && p.goneAt[i] > (gy - 1900) * 12) dead = i;
        else if (marr < 0 && !p.gone[i] && p.spouse[i] >= 0 && (g.hero.rel[i] || uh(i, 913) % 4 === 0)) marr = i;
      }
      if (dead >= 0) say(`そういえば${g.nameOf(dead)}、${1900 + Math.floor(p.goneAt[dead] / 12)}年に亡くなったんだって……。`, `同級生の記録(${g.nameOf(dead)}・${t.name}・葬儀の記録)`, 2);
      else if (marr >= 0) say(`${g.nameOf(marr)}は結婚して${B2[p.home[marr]] ? B2[p.home[marr]].addr || "この街" : "この街"}に住んでるよ。`, `同級生の記録(${g.nameOf(marr)}・家族と住まいの記録)`, 1);
    }
    return out;
  }
  // 再会を日記とつながりに残す(talk の後で呼ぶ)
  function noteReunion(g, id, gapM) {
    const w = g.world, h = g.hero;
    if (typeof schoolTies !== "function" || g.age() < 18 || !(gapM == null || gapM >= 120)) return;
    const t = schoolTies(w, h.id, id).filter((x) => x.lv >= 2).sort((a, c) => c.lv - a.lv)[0];
    if (!t) return;
    const yrs = g.year() - gradYearOf(w.pop, h.id, t.lv);
    if (yrs < 3) return;
    const r = h.rel[id];
    if (r) (r.reunions || (r.reunions = [])).push(g.S.M);
    g.log("event", `${t.name}の${t.k === "classmate" ? "同級生(同じクラス)" : t.k === "gradeMate" ? "同級生" : t.k === "senpai" ? "先輩" : "後輩"}・${g.nameOf(id)}さんと${yrs}年ぶりに再会した`, { ev: "reunion", who: id });
  }
