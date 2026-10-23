  // src/funeral.js — 亡くなったあとの流れ: 訃報 → 喪主(続柄と事情から決める・子どもは務めない) → 通夜 → 告別式 → 火葬 → 四十九日。
  // 亡くなったときに1件の記録を作り(world.funerals・セーブに保存)、葬儀場の掲示・式場の参列者・主人公への知らせ・法定相続分に使う。
  // 亡くなった人は日常の場面に出ない(人の一覧はすべて p.gone を除く。funeral.mjs で確かめる)。思い出・記録・墓参りにだけ残る。
  // 参列者は家族・親族・同僚・近所の人(人物IDそのまま)。主人公と関係のない住民どうしの葬儀も、葬儀場で同じように行われる。
  var FUN_KEEP = 600;
  var funAge = (p, id, M) => Math.floor((M - p.born[id]) / 12);
  // 喪主: 配偶者 → (配偶者が高齢で成人の子がいれば)長子 → 長子 → 親 → きょうだい → 葬儀社(身寄りなし)。18歳未満は務めない
  function funeralChief(w, id, M) {
    // 市外に住む親族(kinout.js)も喪主になれる
    const p = w.pop, alive = (x) => x >= 0 && (!p.gone[x] || typeof isOutKin === "function" && isOutKin(p, x)) && x !== id, adult = (x) => alive(x) && funAge(p, x, M) >= 18;
    const kids = w.childrenOf(id).filter(adult).sort((a, b) => p.born[a] - p.born[b]);
    const sp = p.spouse[id];
    if (adult(sp)) {
      if (funAge(p, sp, M) >= 88 && kids.length) return { id: kids[0], why: "配偶者が高齢のため、長子が務める" };
      return { id: sp, why: "配偶者" };
    }
    if (kids.length) return { id: kids[0], why: kids.length > 1 ? "長子(きょうだいの最年長)" : "子" };
    const par = [p.mother[id], p.father[id]].filter((x) => adult(x) && funAge(p, x, M) < 95);
    if (par.length) return { id: par[0], why: "親" };
    // 孫(成人)
    const gk = w.childrenOf(id).flatMap((k) => w.childrenOf(k)).filter(adult).sort((a, b) => p.born[a] - p.born[b]);
    if (gk.length) return { id: gk[0], why: "孫" };
    const sib = funeralSiblings(w, id).filter(adult).sort((a, b) => p.born[a] - p.born[b]);
    if (sib.length) return { id: sib[0], why: "きょうだい" };
    // おい・めい(きょうだいの子)
    const nn = funeralSiblings(w, id).flatMap((x) => w.childrenOf(x)).filter(adult).sort((a, b) => p.born[a] - p.born[b]);
    if (nn.length) return { id: nn[0], why: "おい・めい" };
    return { id: -1, why: "身寄りがないため、葬儀社と町内会が執り行う" };
  }
  // きょうだい(同じ母か同じ父)。親子の索引(childrenOf)から求める(全員を見て回らない)
  function funeralSiblings(w, id) {
    const p = w.pop, m = p.mother[id], f = p.father[id];
    if (m < 0 && f < 0) return [];
    const ok = (i) => i !== id && (!p.gone[i] || typeof isOutKin === "function" && isOutKin(p, i));
    const set = new Set([...m >= 0 ? w.childrenOf(m) : [], ...f >= 0 ? w.childrenOf(f) : []].filter(ok));
    return [...set].sort((a, b) => a - b);
  }
  // 同じ家・同じ職場の住民の索引(その月の初めに1度だけ作る。葬儀の参列者を探すのに使う)
  function funeralIndex(w) {
    if (w._funIdx && w._funIdx.M === w.M) return w._funIdx;
    const p = w.pop, home = new Map(), work = new Map();
    const push = (mp, k, i) => {
      let a = mp.get(k);
      if (!a) mp.set(k, a = []);
      a.push(i);
    };
    for (let i = 0; i < p.n; i++) if (!p.gone[i]) {
      if (p.home[i] >= 0) push(home, p.home[i], i);
      if (p.work[i] >= 0) push(work, p.work[i], i);
    }
    return w._funIdx = { M: w.M, n: p.n, home, work };
  }
  // 法定相続分(民法の割合。金額は扱わない)
  function funeralHeirs(w, id, M) {
    const p = w.pop, alive = (x) => x >= 0 && !p.gone[x] && x !== id;
    const sp = alive(p.spouse[id]) ? p.spouse[id] : -1, kids = w.childrenOf(id).filter(alive);
    const share = (L3, num, den) => L3.map((x) => [x, `${num}/${den * L3.length}`]);
    if (kids.length) return sp >= 0 ? [[sp, "1/2"], ...share(kids, 1, 2)] : share(kids, 1, 1);
    const par = [p.mother[id], p.father[id]].filter(alive);
    if (par.length) return sp >= 0 ? [[sp, "2/3"], ...share(par, 1, 3)] : share(par, 1, 1);
    const sib = funeralSiblings(w, id);
    if (sib.length) return sp >= 0 ? [[sp, "3/4"], ...share(sib, 1, 4)] : share(sib, 1, 1);
    return sp >= 0 ? [[sp, "1/1"]] : [];
  }
  // いちばん近い葬儀場・火葬場(家ごとに年ごとの控え。閉まった施設は年が変わると反映)
  var funNearC = /* @__PURE__ */ new Map();
  function funeralNearest(w, b0, type) {
    const key = type + ":" + (b0 ? b0.idx : -1), y = Math.floor(w.M / 12), c = funNearC.get(key);
    if (c && c.y === y && c.w === w) return c.v;
    const v = funeralNearest0(w, b0, type);
    funNearC.set(key, { y, w, v });
    return v;
  }
  function funeralNearest0(w, b0, type) {
    const B2 = w.map.buildings;
    let best = -1, bd = 1e9;
    for (const b of B2) if (b.type === type && b.status !== "closed") {
      const d = b0 ? Math.abs(b.doorX - b0.doorX) + Math.abs(b.doorY - b0.doorY) : 0;
      if (d < bd) {
        bd = d;
        best = b.idx;
      }
    }
    return best;
  }
  // 亡くなったとき(world.kill の最初。配偶者の結びつきが消える前)に記録を作る
  function funeralOnDeath(w, id, M) {
    if (!(id >= 0 && id < w.pop.n)) return null;
    const p = w.pop, home = p.home[id] >= 0 ? w.map.buildings[p.home[id]] : null;
    const ch = funeralChief(w, id, M);
    const d = 2 + uh(id, M) % 23;
    const att = /* @__PURE__ */ new Set();
    const alive = (x) => x >= 0 && !p.gone[x] && x !== id;
    const fam = [p.spouse[id], p.mother[id], p.father[id], ...w.childrenOf(id)].filter(alive);
    for (const x of fam) {
      att.add(x);
      for (const gk of w.childrenOf(x)) if (alive(gk)) att.add(gk);
    }
    for (const x of funeralSiblings(w, id)) att.add(x);
    // 同僚(同じ職場)・近所(同じ建物の別の世帯)は数人ずつ(ID順に決定的に)
    let cw = 0, nb = 0;
    // 同じ職場・同じ家の人だけを、番号の小さい順に見る(索引: funeralIndex)
    const FI = funeralIndex(w), cand = [.../* @__PURE__ */ new Set([...p.work[id] >= 0 ? FI.work.get(p.work[id]) || [] : [], ...p.home[id] >= 0 ? FI.home.get(p.home[id]) || [] : []])].sort((a, b) => a - b);
    for (const i of cand) {
      if (cw >= 6 && nb >= 4) break;
      if (!alive(i) || att.has(i)) continue;
      if (cw < 6 && p.work[id] >= 0 && p.work[i] === p.work[id] && uh(i, id) % 3 === 0) {
        att.add(i);
        cw++;
      } else if (nb < 4 && p.home[id] >= 0 && p.home[i] === p.home[id] && p.spouse[i] !== id) {
        att.add(i);
        nb++;
      }
    }
    // 式場の予約: 同じ葬儀場で同じ月の日が重ならないように、空いている日へ(通夜と告別式で2日使う)
    const hall = funeralNearest(w, home, "funeral");
    let dd = d;
    const busy = new Set();
    for (const f of w.funerals || []) if (f.M === M && f.hall === hall && !f.outside) busy.add(f.d).add(f.d + 1).add(f.d - 1);
    for (let k = 0; k < 26 && busy.has(dd); k++) dd = 2 + (dd - 2 + 1) % 26;
    // 火葬の予約: 同じ火葬場・同じ日の火葬は4つの炉に順に入り、5件目からは1時間ずつ遅らせる
    const crem = funeralNearest(w, home, "crematorium");
    let nC = 0;
    for (const f of w.funerals || []) if (f.M === M && f.crem === crem && f.d === dd && !f.outside) nC++;
    const rec = { id, M, d: dd, cremK: nC % 4, cremA: 13 * 60 + Math.floor(nC / 4) * 60, age: funAge(p, id, M), chief: ch.id, why: ch.why, hall, crem, att: [...att].slice(0, 30), heirs: funeralHeirs(w, id, M), ...typeof isOutKin === "function" && isOutKin(p, id) ? { outside: 1 } : {} };
    (w.funerals || (w.funerals = [])).push(rec);
    if (w.funerals.length > FUN_KEEP * 1.5) w.funerals = w.funerals.slice(-FUN_KEEP);
    return rec;
  }
  var funeralOf = (w, id) => (w.funerals || []).find((r) => r.id === id) || null;
  // 予定(日付は亡くなった月の d 日。通夜は翌日18時・告別式は翌々日11時・火葬13時)
  function funeralSched(r) {
    return { wake: { M: r.M, d: r.d + 1, a: 18 * 60, b: 20 * 60 }, rite: { M: r.M, d: r.d + 2, a: 10 * 60 + 30, b: 12 * 60 + 30 }, crem: { M: r.M, d: r.d + 2, a: r.cremA || 13 * 60, b: (r.cremA || 13 * 60) + 90 }, d49: { M: r.M + 1, d: Math.min(28, r.d + 18) } };
  }
  // いまこの葬儀場で行われている式(なければ null)
  function funeralNow(g, bIdx) {
    const M = g.S.M, d = g.date().d, m = g.S.min;
    for (const r of g.world.funerals || []) {
      // 市外の親族の葬儀は市外で行う(この街の式場には出ない)
      if (r.hall !== bIdx || r.M !== M || r.outside) continue;
      const s = funeralSched(r);
      if (d === s.wake.d && m >= s.wake.a - 30 && m < s.wake.b) return { r, k: "通夜" };
      if (d === s.rite.d && m >= s.rite.a - 30 && m < s.rite.b) return { r, k: "告別式" };
    }
    return null;
  }
  var funDate = (g, M, d) => `${(M % 12) + 1}月${d}日`;
  var funHM = (m) => `${m / 60 | 0}:${String(m % 60).padStart(2, "0")}`;
  // 知らせの文(主人公の家族・大切な人が亡くなったとき)
  function funeralText(g, id) {
    const r = funeralOf(g.world, id);
    if (!r) return "";
    const s = funeralSched(r), hall = g.world.map.buildings[r.hall];
    const chief = r.chief === g.hero.id ? "あなた" : r.chief >= 0 ? `${g.nameOf(r.chief)}さん` : "葬儀社";
    return `\n喪主: ${chief}(${r.why})\n通夜: ${funDate(g, s.wake.M, s.wake.d)} ${funHM(s.wake.a)}〜 / 告別式: ${funDate(g, s.rite.M, s.rite.d)} ${funHM(s.rite.a)}〜(${hall ? hall.name : "斎場"})\n享年${r.age}`;
  }
  // ---- 葬儀場(式場・受付・親族控室)
  FAC_RANGE.funeral = () => ({ lo: 0, hi: 0, nf: 1 });
  FAC_LABEL.funeral = () => "式場";
  FAC_BUILD.funeral = (b) => {
    const W2 = 28, H4 = 18;
    const P = plan(W2, H4, "floor_carpet", "office");
    P.lv = 0;
    const dx = W2 >> 1;
    P.door(dx);
    // 受付・掲示
    P.wide("counter", dx - 5, H4 - 4, 3, 1, "fx_fcounter", "受付(記帳・香典)");
    P.add("board", dx + 3, H4 - 3, "fx_fboard", "本日の葬儀・告別式のご案内", true);
    // 式場: 祭壇(白い菊・遺影・棺)と焼香台、参列者の椅子
    P.wide("fx_altar", 7, 1, 14, 3, null, "祭壇(白い菊と遺影)");
    P.wide("fx_shoko", dx - 1, 5, 2, 1, "fx_shoko", "焼香台");
    for (let r = 0; r < 4; r++) for (let x = 7; x <= 20; x++) if (x !== dx - 1 && x !== dx) P.add("chair", x, 7 + r * 2, null, "参列者の席", false);
    // 親族控室(畳)
    P.room(1, 1, 5, 9, { door: [5, 6], label: "親族控室", tile: "floor_tatami" });
    P.add("table", 2, 4, null, "控室の座卓", true, { w: 2, h: 1 });
    P.add("toilet", W2 - 2, H4 - 3, "toilet", "トイレ");
    P.add("plant", W2 - 3, 1, null, "供花", true);
    P.add("plant", 22, 1, null, "供花", true);
    P.staffSpots.push({ x: dx - 4, y: H4 - 5, role: "staff" }, { x: 22, y: 5, role: "staff" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 3, label: "式場", funeralHall: true });
  };
  FAC_ACTS.fx_fboard = (g, o, b, push) => push("fboard", "ご案内を読む");
  FAC_RUN.fboard = (g, arg, tg, r) => {
    const b = g.world.map.buildings[g.S.loc.b], M = g.S.M, d = g.date().d;
    const L3 = (g.world.funerals || []).filter((x) => x.hall === b.idx && (x.M === M && x.d + 2 >= d - 1 || x.M === M - 1 && x.d + 2 > 26)).slice(-4);
    r.msg = L3.length ? L3.map((x) => {
      const s = funeralSched(x);
      return `故 ${g.nameOf(x.id)} 儀(享年${x.age}) 喪主 ${x.chief >= 0 ? g.nameOf(x.chief) : "葬儀社"} / 通夜 ${funDate(g, s.wake.M, s.wake.d)} ${funHM(s.wake.a)} / 告別式 ${funDate(g, s.rite.M, s.rite.d)} ${funHM(s.rite.a)}`;
    }).join("\n") : "本日の葬儀・告別式はありません。";
  };
  FAC_ACTS.fx_shoko = (g, o, b, push) => {
    const f = funeralNow(g, b.idx);
    if (!f) return push("none", "いまは式がありません", { disabled: true });
    push("shoko", `焼香する(${f.k}・故 ${g.nameOf(f.r.id)} さん)`);
  };
  FAC_RUN.shoko = (g, arg, tg, r) => {
    const f = funeralNow(g, g.S.loc.b);
    g.advance(10);
    if (f && g.hero.rel[f.r.id] && typeof memorial === "function") memorial(g, f.r.id);
    if (f) g.log("family", `${g.nameOf(f.r.id)}さんの${f.k}で焼香した`);
    r.msg = "静かに手を合わせ、焼香しました。" + g.chg({ mood: -2, social: 1 });
  };
  FAC_ACTS.fx_fcounter = (g, o, b, push) => {
    const f = funeralNow(g, b.idx);
    if (!f) return push("none", "受付は式のときに開きます", { disabled: true });
    for (const v of [5e3, 1e4]) push("koden:" + v, `記帳して香典を渡す(¥${yenf(g, v).toLocaleString()})`, { disabled: g.hero.money < yenf(g, v) });
  };
  FAC_RUN.koden = (g, arg, tg, r) => {
    const v = yenf(g, +arg || 5e3);
    g.pay(v, "香典");
    g.advance(5);
    r.msg = "芳名帳に名前を書き、香典をお渡ししました。";
  };
  // 式のあいだの参列者(Crowd.indoor から): 喪主は最前列の右、親族は前の列、ほかは後ろの列
  function funeralIndoor(C2, bIdx, I2, floor, res) {
    const g = C2.g, b = g.world.map.buildings[bIdx];
    if (!b || b.type !== "funeral" || !I2.funeralHall) return res;
    const f = funeralNow(g, bIdx);
    if (!f) return res;
    const p = g.world.pop, r = f.r, seen = new Set(res.map((q) => q.id));
    const fam = new Set([r.chief, p.spouse[r.id], p.mother[r.id], p.father[r.id], ...g.world.childrenOf(r.id)]);
    const L3 = r.att.filter((x) => !p.gone[x] && x !== g.hero.id && !seen.has(x)).sort((a, c) => (fam.has(c) ? 1 : 0) - (fam.has(a) ? 1 : 0) || (c === r.chief) - (a === r.chief));
    const cells = [];
    for (let rr = 0; rr < 4; rr++) for (let x = 20; x >= 7; x--) if (x !== 13 && x !== 14) cells.push([x, 7 + rr * 2]);
    (C2._mourn || (C2._mourn = /* @__PURE__ */ new Set())).clear();
    L3.forEach((id, i) => {
      if (i >= cells.length) return;
      const c = cells[i];
      res.push({ id, x: c[0] + 0.5, y: c[1] + 0.5, dir: "u", role: "mourner", pose: "sit" });
      C2._mourn.add(id);
    });
    globalThis.__mourners = C2._mourn;
    return res;
  }
  // 喪服(黒い上着と白いえり)を人物の上に重ねる(isoint.js の人物の描画から)
  function mourningDress(c, id, X, Y2, Z) {
    const M = globalThis.__mourners;
    if (!M || !M.has(id)) return;
    c.save();
    c.fillStyle = "#1d1f24";
    c.fillRect(X - 4 * Z, Y2 - 9 * Z, 8 * Z, 6 * Z);
    c.fillStyle = "#f2f2f2";
    c.beginPath();
    c.moveTo(X - 1.2 * Z, Y2 - 9 * Z);
    c.lineTo(X, Y2 - 7.4 * Z);
    c.lineTo(X + 1.2 * Z, Y2 - 9 * Z);
    c.closePath();
    c.fill();
    c.restore();
  }
  // 祭壇と焼香台の描画
  FAC_DRAW.fx_altar = (c, env, o, H5, d0) => {
    const { x, y, w, h, box, pt, Z } = d0;
    for (let k = 0; k < 3; k++) box(c, d0.P, x + k * 0.8, y, x + w - k * 0.8, y + h - k * 0.9, 0, 0.7 + k * 0.6, k % 2 ? "#e6e6df" : "#f7f7f3");
    // 白い菊(段ごとに並ぶ)
    for (let k = 0; k < 3; k++) for (let i = 0; i < w * 2; i++) {
      if (x + 0.3 + i * 0.5 < x + k * 0.8 || x + 0.3 + i * 0.5 > x + w - k * 0.8) continue;
      const q = pt(x + 0.3 + i * 0.5, y + h - k * 0.9 - 0.25, 0.75 + k * 0.6);
      c.fillStyle = (i + k) % 5 === 0 ? "#f3e3a0" : (i + k) % 7 === 0 ? "#d9e8c8" : "#ffffff";
      c.beginPath();
      c.arc(q[0], q[1], 0.9 * Z, 0, 7);
      c.fill();
    }
    // 遺影(額と黒いリボン)
    const f0 = pt(x + w / 2, y + 0.4, 2.6);
    c.save();
    c.translate(f0[0], f0[1]);
    c.scale(1.6, 1.6);
    c.translate(-f0[0], -f0[1]);
    c.fillStyle = "#2a2a2a";
    c.fillRect(f0[0] - 3.2 * Z, f0[1] - 7 * Z, 6.4 * Z, 7.5 * Z);
    c.fillStyle = "#c9ccd2";
    c.fillRect(f0[0] - 2.5 * Z, f0[1] - 6.3 * Z, 5 * Z, 6 * Z);
    c.fillStyle = "#8a8f99";
    c.beginPath();
    c.arc(f0[0], f0[1] - 3.8 * Z, 1.4 * Z, 0, 7);
    c.fill();
    c.fillRect(f0[0] - 2 * Z, f0[1] - 2.2 * Z, 4 * Z, 1.9 * Z);
    c.fillStyle = "#111";
    c.beginPath();
    c.moveTo(f0[0] - 3.2 * Z, f0[1] - 7 * Z);
    c.lineTo(f0[0] - 1.6 * Z, f0[1] - 7 * Z);
    c.lineTo(f0[0] - 3.2 * Z, f0[1] - 5.4 * Z);
    c.fill();
    c.restore();
    // 棺
    box(c, d0.P, x + w / 2 - 1.6, y + h - 0.3, x + w / 2 + 1.6, y + h + 0.5, 0, 0.6, "#efe8d8");
  };
  FAC_DRAW.fx_shoko = (c, env, o, H5, d0) => {
    const { x, y, w, box, pt, t, Z } = d0;
    box(c, d0.P, x + 0.1, y + 0.2, x + w - 0.1, y + 0.8, 0, 0.9, "#4a3a2a");
    box(c, d0.P, x + w / 2 - 0.2, y + 0.35, x + w / 2 + 0.2, y + 0.65, 0.9, 1.05, "#8a8f99");
    const s = pt(x + w / 2, y + 0.5, 1.2 + (((t * 0.4) % 1) + 1) % 1);
    c.fillStyle = "rgba(220,220,220,0.4)";
    c.beginPath();
    c.arc(s[0], s[1], 1.2 * Z, 0, 7);
    c.fill();
  };
  // ---- 火葬場(告別式のあと・告別式の日の13:00〜14:30): 炉前ホール(火葬炉の扉・最後のお別れ)・待合室・収骨室・受付
  FAC_RANGE.crematorium = () => ({ lo: 0, hi: 0, nf: 1 });
  FAC_LABEL.crematorium = () => "炉前ホール・待合室・収骨室";
  FAC_BUILD.crematorium = (b) => {
    const W2 = 34, H4 = 20;
    const P = plan(W2, H4, "floor_marble", "office");
    P.lv = 0;
    const dx = W2 >> 1;
    P.door(dx);
    P.windows(4);
    // 炉前ホール(北): 火葬炉の扉4つと、お別れの台
    P.room(1, 1, 21, 10, { doors: [[11, 10]], label: "炉前ホール", tile: "floor_marble" });
    for (let k = 0; k < 4; k++) P.wide("vault", 3 + k * 5, 2, 2, 1, null, `火葬炉${k + 1}号の扉`);
    P.wide("table", 9, 6, 4, 1, null, "最後のお別れの台(棺)");
    P.add("fx_shoko", 15, 6, "fx_shoko", "焼香台", true);
    P.staffSpots.push({ x: 5, y: 4 }, { x: 16, y: 4 });
    // 収骨室(東)
    P.room(22, 1, W2 - 2, 10, { doors: [[26, 10]], label: "収骨室" });
    P.wide("table", 25, 4, 4, 2, null, "収骨の台");
    P.staffSpots.push({ x: 27, y: 7 });
    // 待合室(南西): 机と椅子・お茶
    P.room(1, 11, 18, H4 - 2, { doors: [[10, 11]], label: "待合室", tile: "floor_tatami" });
    for (let x = 3; x < 17; x += 4) for (const y of [13, 16]) {
      P.wide("table", x, y, 2, 1, null, "待合室の机");
      P.seatSpots.push({ x: x, y: y + 1 }, { x: x + 1, y: y + 1 });
    }
    P.add("watersrv", 2, 12, null, "お茶");
    P.wide("counter", W2 - 9, H4 - 5, 4, 1, "info", "受付(火葬許可証の確認)");
    P.staffSpots.push({ x: W2 - 7, y: H4 - 6 });
    P.add("plant", W2 - 3, H4 - 3, null, "観葉植物");
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 3.6, label: "炉前ホール・待合室・収骨室", crem: true });
  };
  // 火葬の時間に火葬場にいる遺族(喪主・配偶者・子・親・きょうだい)。13:00〜13:30 は炉前ホール、そのあと待合室、14:00〜 収骨室
  function cremNow(g, bIdx) {
    const M = g.S.M, d = g.date().d, m = g.S.min, out = [];
    for (const r of g.world.funerals || []) {
      if (r.crem !== bIdx || r.M !== M || r.outside) continue;
      const s = funeralSched(r);
      if (d === s.crem.d && m >= s.crem.a - 15 && m < s.crem.b) out.push({ r, k: m < s.crem.a + 30 ? "hall" : m < s.crem.a + 60 ? "wait" : "bones" });
    }
    return out.slice(0, 4);
  }
  function cremIndoor(C2, bIdx, I2, floor, res) {
    const g = C2.g, b = g.world.map.buildings[bIdx];
    if (!b || b.type !== "crematorium" || !I2.crem) return res;
    const L4 = cremNow(g, bIdx);
    if (!L4.length) return res;
    const p = g.world.pop, seen = new Set(res.map((q) => q.id));
    // 火葬炉ごとに家族が分かれる(炉1〜4の前・待合室の机・収骨室)
    L4.forEach((f, fi) => {
      const r = f.r;
      const fam = [r.chief, p.spouse[r.id], p.mother[r.id], p.father[r.id], ...g.world.childrenOf(r.id), ...funeralSiblings(g.world, r.id)].filter((x, i, a) => x >= 0 && a.indexOf(x) === i && !p.gone[x] && x !== g.hero.id && !seen.has(x)).slice(0, 8);
      const fk = f.r.cremK != null ? f.r.cremK : fi, x0 = f.k === "hall" ? 2 + fk * 5 : f.k === "bones" ? 23 : 0, y0 = f.k === "hall" ? 4 : 7;
      fam.forEach((id, i) => {
        seen.add(id);
        let x, y, pose;
        if (f.k !== "wait") {
          x = x0 + i % 4;
          y = y0 + (i >> 2) + (f.k === "bones" ? fi % 2 : 0);
        } else {
          const sp = I2.seatSpots[(fi * 4 + i) % I2.seatSpots.length];
          x = sp.x;
          y = sp.y;
          pose = "sit";
        }
        res.push({ id, x: x + 0.5, y: y + 0.5, dir: "u", role: "mourner", pose });
        (C2._mourn || (C2._mourn = /* @__PURE__ */ new Set())).add(id);
      });
    });
    globalThis.__mourners = C2._mourn;
    return res;
  }
