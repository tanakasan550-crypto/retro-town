  // 身内を亡くして3か月以内の人は、まずその話になる(pri 3。明るい話題は選ばない)
  // src/talk.js — 会話の中身を、その人について本当にある事実から選ぶ(根拠つき)。作り話のほめ言葉や出来事は出さない。
  // 事実: 主人公との関係(同級生・同じ部活・同僚・同じ建物の住人)・今日の時間割(体育)・部活・仕事と職場・家族(子の入学)・
  // 身内を亡くして1年以内(葬儀の記録。喪主を務めたか)・近所の店の開店(街の記録)・今日の天気。選んだ文の根拠を一緒に表示する。
  function talkFacts(g, id) {
    const w = g.world, p = w.pop, B2 = w.map.buildings, h = g.hero, out = [];
    const outKin = typeof isOutKin === "function" && isOutKin(p, id);
    if (id == null || id < 0 || p.gone[id] && !outKin) return out;
    const say = (s, why, pri = 1) => out.push({ say: s, why, pri });
    // 市外に住む親族の帰省(kinvisit.js): その日の予定と、迎える子の名前を根拠にする
    if (outKin) {
      const v = typeof kinVisitOf === "function" ? kinVisitOf(g, id) : null;
      if (v) {
        const hn = g.nameOf(v.host);
        say(v.host === h.id ? `${v.label}だから会いに来たよ。元気そうでよかった。` : `${v.label}に${hn}の顔を見に来たんだよ。`, `帰省の予定(${v.label}・${hn}さんの家・${hhmm(v.arrive)}〜${hhmm(v.leave)})`, 3);
        say(`ふだんは市外で暮らしているから、この街に来ると懐かしいねえ。`, "市外在住の親族(人物の記録)", 2);
      } else say("今日は市外の家にいるよ。", "市外在住の親族(人物の記録)", 1);
    }
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
    // 何十年ぶりの再会(reunion.js): 学校の縁がある大人どうし。前に話してからの間が長いほど、昔の話から
    if (typeof reunionFacts === "function") try {
      const gap = g._talkGap && g._talkGap.id === id ? g._talkGap.gapM : h.rel[id] ? M - (h.rel[id].last ?? M) : null;
      for (const f of reunionFacts(g, id, gap)) out.push(f);
    } catch (e) {
    }
    // 人と人のつながり(ties.js: 親族・学校の在籍記録・職歴)。言い回しは日ごとに変える
    const vary = (L3) => L3[uh(id * 31 + M, g.date().d) % L3.length];
    if (typeof tiesOf === "function") for (const t of tiesOf(w, h.id, id)) {
      if (t.k === "kin") {
        const KL = { 祖母: ["ちゃんと食べてるかい。顔を見せてくれてうれしいよ。", "昔はお父さんもこの道を走り回っていたんだよ。"], 祖父: ["大きくなったなあ。今度、釣りにでも行くか。", "体には気をつけるんだぞ。"], おじ: ["大きくなったな。お母さんは元気か?", "正月にはまた家に寄りなさい。"], おば: ["あら、元気そうね。ご両親によろしく。", "お盆にはみんなで集まりましょうね。"], いとこ: ["久しぶり。親戚の集まり以来だね。", "おばあちゃんの家で遊んだの覚えてる?"], おい: [`${w.isFem(h.id) ? "おばさん" : "おじさん"}のところ、また遊びに行っていい?`], めい: [`${w.isFem(h.id) ? "おばさん" : "おじさん"}、また遊びに行ってもいい?`] };
        const L3 = KL[t.rel] || [`${t.rel}として、いつも気にかけているよ。`];
        say(vary(L3), `続柄(${t.rel}・親子の記録から)`, 2);
      } else if (t.k === "classmate" || t.k === "gradeMate") {
        const past = (p.school[h.id] ?? -1) !== t.b;
        say(past ? vary([`${t.name}で${t.k === "classmate" ? "同じクラス" : "同じ学年"}だったよね。覚えてる?`, `${t.name}のころの${t.k === "classmate" ? "クラス" : "学年"}のみんな、元気かな。`]) : vary([`${t.name}で同じ${t.k === "classmate" ? "クラス" : "学年"}だね。`, "次のテスト、自信ある?"]), `在籍記録(${t.name}・同じ学年${t.k === "classmate" ? "・同じ組" : ""})`, 2);
      } else if (t.k === "senpai" || t.k === "kohai") {
        const role = t.k === "senpai" ? "先輩" : "後輩";
        say(t.club ? `${t.name}の${t.club}で一緒だった${role}です。` : `${t.name}の${t.years}学年${t.k === "senpai" ? "上" : "下"}の${role}です。`, `在籍記録(${t.name}・${t.years}学年ちがい${t.club ? "・" + t.club : ""})`, 2);
      } else if (t.k === "boss") say(vary(["例の書類、今日中にまとめておいてくれるかな。", "最近がんばってるね。その調子で頼むよ。"]), `職場の上司(${t.name}・職位が上)`, 2);
      else if (t.k === "coworker") say(vary([`${t.name}の仕事、最近どう?`, "お昼、一緒にどう?"]), `同じ職場(${t.name})`, 2);
      else if (t.k === "excoworker") say(vary([`${t.name}にいたころは、お世話になりました。`, `${t.name}のみんな、どうしてるかな。`]), `職歴の重なり(${t.name}・${1900 + Math.floor(t.from / 12)}年〜)`, 2);
    }
    // 担任の先生(主人公のいまの学校・学年・組・年度)
    if (h.edu && h.edu.cur > 0 && h.edu.b >= 0 && typeof homeroomOf === "function") {
      const lvH = { kinder: 1, elem: 2, jh: 3, hs: 4, univ: 5 }[(B2[h.edu.b] || {}).type] || 0;
      const t = lvH >= 2 && lvH <= 4 ? homeroomOf(w, h.edu.b, cohOf(p, h.id), (typeof kumiAt === "function" && kumiAt(w, B2[h.edu.b], h.id) >= 0 ? kumiAt(w, B2[h.edu.b], h.id) : kumiOf(h.id, lvH, typeof schoolClasses === "function" ? schoolClasses(w, B2[h.edu.b]) : 3)), g.date().y) : -1;
      if (t === id) say(vary(["宿題は終わったかな。分からないところは聞きに来なさい。", "最近、授業中に眠そうだぞ。夜ふかしはほどほどに。"]), `担任(${B2[h.edu.b].name}・${g.date().y}年度)`, 2);
    }
    // その人の職歴(いちばん新しい入社・退職)
    const pr = w.prof && w.prof.get(id);
    if (pr && pr.hist && pr.hist.length) {
      const e = pr.hist[pr.hist.length - 1], bn = B2[e.b];
      const yrs = Math.floor((M - e.M) / 12);
      if (bn && e.k === "start" && yrs <= 3) say(yrs ? `${yrs}年前から${bn.name}で働いているんです。` : `この春から${bn.name}で働き始めました。`, `職歴(${1900 + Math.floor(e.M / 12)}年${(e.M % 12) + 1}月 ${bn.name}に入る)`);
      else if (bn && e.k !== "start" && M - e.M <= 24) say(`${bn.name}を辞めて、いまは少しゆっくりしています。`, `職歴(${1900 + Math.floor(e.M / 12)}年${(e.M % 12) + 1}月 ${bn.name}を離れる)`);
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
