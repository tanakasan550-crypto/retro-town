  // src/npcinfo.js — NPCを選ぶと「いま何をしていて、どこへ向かうか」が分かる
  function npcStatus(id) {
    const w = G3.world, p = w.pop;
    const age = G3.ageOf(id);
    // 市外に住む親族(kinout.js): 帰省の日だけ街にいる
    if (typeof isOutKin === "function" && isOutKin(p, id)) {
      let ties = null;
      try {
        ties = tiesOf(w, G3.hero.id, id).filter((t) => t.k === "kin").map((t) => t.rel);
      } catch (e) {
      }
      const kids = w.childrenOf(id).filter((k) => !p.gone[k] && p.home[k] >= 0).map((k) => G3.nameOf(k));
      return { who: `市外在住${kids.length ? `(${kids.join("・")}さんの親)` : ""}`, age, now: (typeof kinVisitStatus === "function" ? kinVisitStatus(id) : null) || "市外の家で暮らしている", goal: "", mission: null, ties };
    }
    const d = G3.date();
    const a = personActivity(w, id, G3.S.min, d.dow);
    const dp = dayPlan(w, id, d.dow);
    const bn = (bi) => bi != null && bi >= 0 && G3.world.map.buildings[bi] ? G3.world.map.buildings[bi].name : "";
    const isHome = (bi) => bi === p.home[id];
    let who = "";
    try {
      who = p.flags[id] & F_STUDENT ? `${bn(p.school[id]) || "学校"}の生徒` : jobName(p, id) || "";
    } catch (_) {
    }
    let now = "", goal = "";
    if (a.s === 1) {
      now = isHome(a.to) ? "帰宅中" : dp && dp.kind === "school" ? "登校中" : "通勤中";
      if (a.bus) now += a.seg && a.seg.k === "walk" ? "(バス停との間を歩いています)" : "(バス)";
      else if (a.train) now += "(電車)";
      goal = isHome(a.to) ? "自宅" : bn(a.to);
    } else if (a.s === 2) {
      now = dp && dp.kind === "school" ? `授業中(${bn(a.at)})` : `仕事中(${(typeof workplaceLabel === "function" ? workplaceLabel(w, id) : null) || bn(a.at)})`;
      // その職の実際の作業(worktask.js)
      if (!(dp && dp.kind === "school") && typeof npcWorkTask === "function" && p.job[id] < 255) {
        const tk = npcWorkTask(JOB_IDS2[p.job[id]], id, G3.S.min);
        if (tk) now += `・${tk}`;
        const tb = typeof bizOfPerson === "function" ? bizOfPerson(w, id) : null;
        if (tb && isFieldWorker(tb, JOB_IDS2[p.job[id]])) now = now.replace("仕事中(", "現場で仕事中(");
      }
      const end = dp ? dp.b : null;
      if (end != null) goal = `${Math.floor(end)}:${String(Math.round(end % 1 * 60)).padStart(2, "0")}ごろ${dp.kind === "school" ? "下校" : "退勤"}して自宅へ`;
    } else if (a.s === 3) {
      now = "買い物・用事で外出中";
      goal = "用事が済んだら自宅へ";
    } else if (a.s === 4 || a.ride) {
      now = "電車で移動中";
      goal = bn(a.to) || "";
    } else {
      now = "自宅・近所で過ごしている";
      if (dp && G3.S.min / 60 < dp.a) goal = `${Math.floor(dp.a)}:${String(Math.round(dp.a % 1 * 60)).padStart(2, "0")}ごろ${dp.kind === "school" ? "登校" : "出勤"}(${bn(dp.dest)})`;
    }
    {
      const bs = (typeof busNpcStatus === "function" ? busNpcStatus(id) : null) || (typeof visitNpcStatus === "function" ? visitNpcStatus(id) : null) || (typeof campusNpcStatus === "function" ? campusNpcStatus(id) : null);
      if (bs) {
        now = bs;
        if (BUSSIM.drivers && BUSSIM.drivers.has(id)) who = "市営バスの運転士";
      }
    }
    // 人生の目標と進み具合(ledger.js の実績から)・主人公とのつながり(ties.js)
    let mission = null, ties = null;
    try {
      mission = typeof lifeMission === "function" ? lifeMission(G3.world, id) : null;
      ties = typeof tiesOf === "function" ? tiesOf(G3.world, G3.hero.id, id).map((t) => t.k === "kin" ? t.rel : { classmate: `${t.name}で同じクラス`, gradeMate: `${t.name}で同じ学年`, senpai: `${t.name}の先輩`, kohai: `${t.name}の後輩`, boss: `${t.name}の上司`, coworker: `${t.name}の同僚`, excoworker: `${t.name}の元同僚`, samebldg: `同じビル(${t.name})` }[t.k]).filter(Boolean) : null;
    } catch (e) {
    }
    // 将来の夢と段階(dreams.js)・あこがれた人
    let dream = "";
    try {
      const p = G3.world.pop;
      if (typeof dreamLabel === "function" && p.dr1 && age >= 6) dream = dreamLabel(p, id) + (p.drBy[id] >= 0 && p.dr1[id] !== 255 ? `・あこがれた人 ${G3.nameOf(p.drBy[id])}` : "");
    } catch (e) {
    }
    return { who, age, now, goal, mission, ties, dream };
  }
  function npcActivityHtml(id) {
    try {
      const s = npcStatus(id);
      return `<div class="tx small" style="background:#0d1a3399;border-radius:8px;padding:6px 8px;margin:4px 0">${s.age}歳${s.who ? "・" + esc4(s.who) : ""}${s.dream ? `<br>夢: ${esc4(s.dream)}` : ""}${s.ties && s.ties.length ? `<br>あなたとの関係: ${esc4(s.ties.join("・"))}` : ""}<br>いま: ${esc4(s.now)}${s.goal ? `<br>このあと: ${esc4(s.goal)}` : ""}${s.mission ? `<br>目標: ${esc4(s.mission.title)}(${Math.round(s.mission.prog * 100)}%・根拠: ${esc4(s.mission.ev)})` : ""}</div>`;
    } catch (e) {
      return "";
    }
  }
