  // 身内を亡くして3か月以内の人は、まずその話になる(pri 3。明るい話題は選ばない)
  // src/talk.js — 会話の中身を、その人について本当にある事実から選ぶ(根拠つき)。作り話のほめ言葉や出来事は出さない。
  // 事実: 主人公との関係(同級生・同じ部活・同僚・同じ建物の住人)・今日の時間割(体育)・部活・仕事と職場・家族(子の入学)・
  // 身内を亡くして1年以内(葬儀の記録。喪主を務めたか)・近所の店の開店(街の記録)・今日の天気。選んだ文の根拠を一緒に表示する。
  function talkFacts(g, id) {
    const w = g.world, p = w.pop, B2 = w.map.buildings, h = g.hero, out = [];
    if (id == null || id < 0 || p.gone[id]) return out;
    const say = (s, why, pri = 1) => out.push({ say: s, why, pri });
    const age = ageYears(p, id, w.M), M = g.S.M;
    // 主人公との関係
    const myS = p.school[h.id] ?? -1, sb = p.school[id] >= 0 ? B2[p.school[id]] : null;
    if (sb && myS === sb.idx) {
      const coh = (x) => Math.floor((p.born[x] - 3) / 12);
      const same = coh(id) === coh(h.id);
      say(same ? `${sb.name}で同じ学年だね。` : `${sb.name}の${coh(id) < coh(h.id) ? "先輩" : "後輩"}です。`, `同じ学校(${sb.name})に在籍`);
      // 今日の体育(時間割から)
      if (typeof campusWhere === "function" && g.isSchoolDay()) for (const m of [550, 600, 670, 730, 850, 910]) {
        const wh = campusWhere(g, sb, id, m);
        if (wh && wh.spot === "pe") {
          say(`今日の${(campusSlot(sb.type, m) || {}).per || ""}時間目は体育だったよ。${wh.where === "gym" ? "体育館" : "校庭"}でへとへと。`, `時間割(${g.date().m0 + 1}月${g.date().d}日)`);
          break;
        }
      }
    }
    if (sb && (sb.type === "jh" || sb.type === "hs") && typeof campusClubOf === "function") {
      const c = campusClubOf(id);
      if (c !== "none") say(`${CLUB_NAME[c]}の練習、毎日18時まであるんだ。`, `部活の所属(${CLUB_NAME[c]})`);
    }
    if (h.job && p.work[id] >= 0 && p.work[id] === h.job.b) say(`${B2[p.work[id]].name}の仕事、最近どう?`, `同じ職場(${B2[p.work[id]].name})`);
    else if (p.work[id] >= 0 && age >= 18) {
      const d = w.describe(id);
      say(`${d.work}で${d.job}をしています。`, `仕事(${d.job}・${d.work})`);
    }
    if (p.home[id] >= 0 && p.home[id] === h.homeB) say("同じ建物に住んでいますね。ゴミ出しの日、気をつけましょう。", `同じ建物(${B2[p.home[id]].name})`);
    // 家族: 子どもが今年小学校に入った
    for (const k of w.childrenOf(id)) if (!p.gone[k] && ageYears(p, k, w.M) === 6 && g.date().m0 >= 3) {
      say(`下の子が今年小学校に入ったんです。ランドセルが大きくて。`, `家族(子 ${g.nameOf(k)}・6歳)`);
      break;
    }
    // 身内を亡くして1年以内(葬儀の記録から)
    for (const r of (w.funerals || []).slice(-400)) {
      if (M - r.M > 12 || M < r.M || r.id === id) continue;
      if (!r.att.includes(id) && r.chief !== id) continue;
      const rel = p.mother[id] === r.id ? "母" : p.father[id] === r.id ? "父" : p.mother[r.id] === id || p.father[r.id] === id ? "子" : r.chief === id && r.why === "配偶者" ? "連れ合い" : null;
      if (!rel) continue;
      const when = `${(r.M % 12) + 1}月`;
      say(r.chief === id ? `${when}に${rel}を見送りました。喪主を務めて、ようやく少し落ち着いたところです。` : `${when}に${rel}を亡くして…まだ実感がないんです。`, `葬儀の記録(${1900 + Math.floor(r.M / 12)}年${when}・故 ${g.nameOf(r.id)}・喪主 ${r.chief >= 0 ? g.nameOf(r.chief) : "葬儀社"})`, M - r.M <= 3 ? 3 : 1);
      break;
    }
    // 近所の店の開店(2か月以内・家の近く)
    if (p.home[id] >= 0) {
      const hb = B2[p.home[id]];
      for (let i = (w.newsLog || []).length - 1; i >= 0 && i >= w.newsLog.length - 80; i--) {
        const n2 = w.newsLog[i], b = n2.b != null ? B2[n2.b] : null;
        if (!b || !/開店/.test(n2.text || "") || Math.abs(b.doorX - hb.doorX) + Math.abs(b.doorY - hb.doorY) > 60) continue;
        say(`近所に${b.name}ができたでしょう。もう行きました?`, `街の記録(${n2.y}年・${b.name}の開店)`);
        break;
      }
    }
    // 今日の天気
    const wx = Renderer.prototype.weather.call({ g });
    say({ sun: "今日はいい天気ですね。", cloud: "今日はくもりですね。", rain: "雨が続きますね。傘、持ってますか。", snow: "雪ですね。足元に気をつけて。" }[wx] || "今日はいい天気ですね。", `今日の天気(${{ sun: "晴れ", cloud: "くもり", rain: "雨", snow: "雪" }[wx] || "-"})`);
    return out;
  }
