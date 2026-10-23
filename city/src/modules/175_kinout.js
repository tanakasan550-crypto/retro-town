  // src/kinout.js — 市外に住む親族(人物IDを持つ)。初期住民の多くは親との結びつきがなく、葬儀の多くが「身寄りなし」になっていた。
  // 決定的に(街の乱数とは別の乱数で)つくり、人口の配列の末尾に足す(既存の人物IDは変えない)。旧セーブにも読み込み時に1度だけ足す。
  //   ・親のいない18〜64歳の住民 → 市外に住む両親(年齢が寿命を超えていれば、すでに亡くなった人として記録)
  //   ・子のいない65歳以上の住民 → 市外に住む子(1〜2人)
  // 市外の人は gone=2(街に住まない)・goneAt=-1(街から出て行ったのではない)・家なし。寿命(76〜97歳)で亡くなり、街の子が喪主になる。
  // 正月とお盆には街の子の家を訪ねる(知り合いならニュースと日記に出る)。
  var KINOUT_V = 1;
  var isOutKin = (p, x) => x >= 0 && p.gone[x] === 2 && p.goneAt[x] === -1;
  var outDeathAge = (id) => 76 + uh(id, 881) % 22;
  // yearly: 毎年1月に、あとから来た住民(転入者)や65歳になった人にも同じ規則で足す
  function kinOutside(w, yearly = false) {
    if (!yearly && (w.kinOutV === KINOUT_V || (w.ver ?? 3) < 4)) return 0;
    w.kinOutV = KINOUT_V;
    const p = w.pop, M = w.M, n0 = p.n, rng = new Rng(w.seed, yearly ? "kinout:" + M : "kinout"), made = [];
    const kinAlive = (x) => x >= 0 && (!p.gone[x] || isOutKin(p, x));
    // 喪主になれる身内(配偶者・子・親)がいない
    const noKin = (i) => !kinAlive(p.spouse[i]) && !w.childrenOf(i).some(kinAlive) && !kinAlive(p.mother[i]) && !kinAlive(p.father[i]);
    const hero = w.heroId != null ? w.heroId : -1;
    const fam = new Set([hero, hero >= 0 ? p.mother[hero] : -1, hero >= 0 ? p.father[hero] : -1].filter((x) => x >= 0));
    const add = (ageM, opts, linkKid) => {
      // 市外の人には職歴の記録(prof)を作らない(作って消すと記録の表が重くなる)
      const pr0 = w.prof;
      w.prof = null;
      let id;
      try {
        id = w.newPerson(rng, ageM, M, opts);
      } finally {
        w.prof = pr0;
      }
      p.home[id] = -1;
      p.gone[id] = 2;
      p.goneAt[id] = -1;
      p.work[id] = -1;
      p.school[id] = -1;
      const age = Math.floor(ageM / 12);
      if (age >= outDeathAge(id)) {
        // すでに亡くなっている(亡くなった年は寿命から)
        p.gone[id] = 1;
        p.goneAt[id] = p.born[id] + outDeathAge(id) * 12;
      }
      made.push(id);
      return id;
    };
    for (let i = 0; i < n0; i++) {
      if (p.gone[i] || p.home[i] < 0) continue;
      const age = Math.floor((M - p.born[i]) / 12);
      if (age >= 18 && age < 65 && p.mother[i] < 0 && p.father[i] < 0) {
        const gap = 24 + uh(i, 882) % 12, ma = (age + gap) * 12 + uh(i, 883) % 12;
        const f = add(ma + (1 + uh(i, 884) % 4) * 12, {}, false), m = add(ma, {}, false);
        // 名字は子(この住民)と同じ家の名(父方)
        p.sur[f] = p.sur[m] = p.sur[i];
        // 母は女性・父は男性の見た目(look の下位3ビット)
        const FS = [...FEMALE_STYLE], MS = [0, 1, 2, 3, 4, 5, 6, 7].filter((k) => !FEMALE_STYLE.has(k));
        p.look[m] = (p.look[m] & ~7 | FS[uh(m, 887) % FS.length]) >>> 0;
        p.look[f] = (p.look[f] & ~7 | MS[uh(f, 888) % MS.length]) >>> 0;
        if (p.gone[f] !== 1 && p.gone[m] !== 1) {
          p.spouse[f] = m;
          p.spouse[m] = f;
        }
        p.mother[i] = m;
        p.father[i] = f;
        if (w._kids) w._linkKid(w._kids, i);
        if (fam.has(i)) for (const x of [f, m]) w.known.add(x);
      } else if (age >= 65 && noKin(i)) {
        // 喪主になれる身内がいない高齢の住民 → 市外に住む子
        const nk = 1 + uh(i, 885) % 2;
        for (let k = 0; k < nk; k++) {
          const ca = Math.max(18, age - 26 - uh(i, 886 + k) % 8 - k * 3);
          add(ca * 12 + uh(i, 890 + k) % 12, w.isFem(i) ? { mother: i, father: p.spouse[i] >= 0 ? p.spouse[i] : -1 } : { father: i, mother: p.spouse[i] >= 0 ? p.spouse[i] : -1 }, true);
        }
      }
    }
    w.outKin = [...(w.outKin || []), ...made.filter((x) => p.gone[x] === 2)];
    return made.length;
  }
  // 毎年1月: 市外の親族の寿命と、正月の帰省 / 8月: お盆の帰省(どちらも決定的)
  function kinOutMonth(w, M) {
    if (w.kinOutV !== KINOUT_V) return;
    if (!w.outKin) w.outKin = [];
    const p = w.pop, m = M % 12;
    if (m === 0) {
      for (const id of w.outKin) {
        if (!isOutKin(p, id)) continue;
        if (Math.floor((M - p.born[id]) / 12) < outDeathAge(id)) continue;
        // 市外で亡くなる: 喪主は街の子(funeral.js の決まり)・知り合いならニュースに
        if (typeof funeralOnDeath === "function") try {
          funeralOnDeath(w, id, M);
        } catch (e) {
        }
        p.gone[id] = 1;
        p.goneAt[id] = M;
        const s = p.spouse[id];
        if (s >= 0) p.spouse[s] = -1;
        w.addEvent("died", id);
      }
      w.outKin = w.outKin.filter((x) => isOutKin(p, x));
      kinOutside(w, true);
    }
    if (m === 0 || m === 7) {
      for (const id of w.outKin) {
        const host = w.childrenOf(id).find((k) => !p.gone[k] && p.home[k] >= 0);
        if (host == null) continue;
        if (w.known.has(id) || w.known.has(host)) w.addEvent("visit_out", id, { host, obon: m === 7 ? 1 : 0 });
      }
    }
  }
