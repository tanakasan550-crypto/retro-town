  // src/ties.js — 人と人のつながり(人物IDで求め、卒業・転職・結婚・死別のあとも続く)。
  // 学校の在籍記録 sch1〜sch5(幼稚園・小学校・中学校・高校・大学の建物ID)を人口の配列に持つ(セーブに保存・故人も消さない)。
  // そこから: 親族(父母・祖父母・きょうだい・おじおば・いとこ・おいめい・義理の親)・同級生/同じ組・先輩後輩・部活の先輩・担任・
  // 同僚/元同僚(職歴 prof.hist)・上司。会話(talk.js)はここから事実を選び、根拠を示す。
  var SCH_LV = ["sch1", "sch2", "sch3", "sch4", "sch5"];
  var SCH_NAME = ["幼稚園", "小学校", "中学校", "高校", "大学"];
  // 在籍の記録(学校に入ったとき)。lv: 1幼稚園 2小学校 3中学校 4高校 5大学
  function schRecord(w, id, lv, b) {
    const p = w.pop;
    if (!(lv >= 1 && lv <= 5) || b < 0 || !p.sch1) return;
    p[SCH_LV[lv - 1]][id] = b;
  }
  var cohOf = (p, id) => Math.floor((p.born[id] - 3) / 12);
  // 組: 人ごとに決まる。nC はその学校のその年の学級数(在籍者から。interior_school.js)
  var kumiOf = (id, lv, nC = 3) => uh(id, 770 + lv) % Math.max(1, nC);
  var sexW = (w, id, f, m) => w.isFem(id) ? f : m;
  // 親族の続柄(a から見た b)。なければ null
  function kinOf(w, a, b) {
    const p = w.pop;
    if (a === b || a < 0 || b < 0) return null;
    const par = (x) => [p.mother[x], p.father[x]].filter((y) => y >= 0);
    const older = p.born[b] < p.born[a];
    if (p.spouse[a] === b) return sexW(w, b, "妻", "夫");
    if (par(a).includes(b)) return sexW(w, b, "母", "父");
    if (par(b).includes(a)) return sexW(w, b, "娘", "息子");
    const pa = par(a), pb = par(b);
    if (pa.some((x) => pb.includes(x))) return older ? sexW(w, b, "姉", "兄") : sexW(w, b, "妹", "弟");
    if (pa.some((x) => par(x).includes(b))) return sexW(w, b, "祖母", "祖父");
    if (pb.some((x) => par(x).includes(a))) return sexW(w, b, "孫娘", "孫");
    // 親のきょうだい=おじ・おば / その子=いとこ
    const sib = (x) => {
      const q = par(x);
      return q.length ? w.childrenOf(q[0]).filter((y) => y !== x) : [];
    };
    if (pa.some((x) => sib(x).includes(b))) return sexW(w, b, "おば", "おじ");
    if (pa.some((x) => sib(x).some((s) => par(b).includes(s)))) return "いとこ";
    if (sib(a).some((s) => par(b).includes(s))) return sexW(w, b, "めい", "おい");
    const sp = p.spouse[a];
    if (sp >= 0 && par(sp).includes(b)) return sexW(w, b, "義母", "義父");
    return null;
  }
  // 学校のつながり(在籍記録から)。同じ学校・同じ学年=同級生(同じ組なら「同じクラス」)、1〜2学年ちがい=先輩/後輩
  function schoolTies(w, a, b) {
    const p = w.pop, out = [];
    if (!p.sch1) return out;
    for (let lv = 1; lv <= 5; lv++) {
      const k = SCH_LV[lv - 1], sa = p[k][a];
      if (sa < 0 || p[k][b] !== sa) continue;
      const d = cohOf(p, a) - cohOf(p, b), bn = w.map.buildings[sa];
      if (!bn) continue;
      const nC = typeof schoolClasses === "function" ? schoolClasses(w, bn) : 3;
      // 今その学校にいる2人は学級編成(kumiAt)で、卒業した学校は人ごとの値で同じ組か決める
      const ka = typeof kumiAt === "function" && p.school[a] === sa ? kumiAt(w, bn, a) : -1, kb = typeof kumiAt === "function" && p.school[b] === sa ? kumiAt(w, bn, b) : -1;
      const same = ka >= 0 && kb >= 0 ? ka === kb : kumiOf(a, lv, nC) === kumiOf(b, lv, nC);
      if (d === 0) out.push({ lv, b: sa, k: same && lv >= 2 && lv <= 4 ? "classmate" : "gradeMate", name: bn.name });
      else if (Math.abs(d) <= 2) out.push({ lv, b: sa, k: d > 0 ? "senpai" : "kohai", years: Math.abs(d), name: bn.name, club: lv >= 3 && lv <= 4 && typeof campusClubOf === "function" && campusClubOf(a) === campusClubOf(b) && campusClubOf(a) !== "none" ? CLUB_NAME[campusClubOf(a)] : null });
    }
    return out;
  }
  // 職場のつながり: 今の同僚・上司(同じ職場で職位が上)、元同僚(職歴が重なる)
  function workTies(w, a, b) {
    const p = w.pop, out = [];
    if (p.work[a] >= 0 && p.work[a] === p.work[b]) {
      const ra = w.prof && w.prof.get(a), rb = w.prof && w.prof.get(b);
      const boss = rb && ra && (rb.rank || 0) > (ra.rank || 0);
      out.push({ k: boss ? "boss" : "coworker", b: p.work[a], name: w.map.buildings[p.work[a]].name });
    }
    const ha = w.prof && w.prof.get(a), hb = w.prof && w.prof.get(b);
    if (ha && hb && ha.hist && hb.hist) {
      const spans = (h) => {
        const L3 = [];
        let cur = null;
        for (const e of h.hist) {
          if (e.k === "start") cur = { b: e.b, a: e.M, z: 1e9 };
          else if (cur) {
            cur.z = e.M;
            L3.push(cur);
            cur = null;
          }
        }
        if (cur) L3.push(cur);
        return L3;
      };
      for (const x of spans(ha)) for (const y of spans(hb)) if (x.b === y.b && x.a < y.z && y.a < x.z && !(x.z === 1e9 && y.z === 1e9)) out.push({ k: "excoworker", b: x.b, name: (w.map.buildings[x.b] || {}).name, from: Math.max(x.a, y.a), to: Math.min(x.z, y.z) });
    }
    return out;
  }
  // 担任(その学校・学年・組・年度の先生)。先生は、その年度にその学校で働いていた教員から決定的に選ぶ
  function homeroomOf(w, b, coh, kumi, year) {
    const p = w.pop, L3 = [];
    for (const [id, pr] of w.prof || []) {
      if (p.gone[id] && !(w.lives && w.lives.has(id))) continue;
      const job = p.job[id] < 255 ? JOB_IDS2[p.job[id]] : null;
      if (p.work[id] === b && job && /teacher|kyoin/.test(job)) L3.push(id);
    }
    if (!L3.length) return -1;
    L3.sort((x, y) => x - y);
    return L3[uh(b * 977 + coh * 31 + kumi, year) % L3.length];
  }
  // つながりの一覧(a から見た b)。会話・人物情報で使う
  function tiesOf(w, a, b) {
    const out = [];
    const kin = kinOf(w, a, b);
    if (kin) out.push({ k: "kin", rel: kin });
    for (const s of schoolTies(w, a, b)) out.push(s);
    for (const t of workTies(w, a, b)) out.push(t);
    return out;
  }
