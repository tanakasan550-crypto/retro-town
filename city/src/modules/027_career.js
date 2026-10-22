  // src/career.js
  var JOB_IDS = Object.keys(JOBS);
  var QUAL_IDS = Object.keys(QUALS);
  var SKILL_NAMES = { styling: "\u65BD\u8853\u30FB\u30B9\u30BF\u30A4\u30EA\u30F3\u30B0", service: "\u63A5\u5BA2", stamina: "\u4F53\u529B\u4ED5\u4E8B", cooking: "\u6599\u7406", craft: "\u3082\u306E\u3065\u304F\u308A", driving: "\u904B\u8EE2", office: "\u4E8B\u52D9", finance: "\u91D1\u878D", teaching: "\u6559\u3048\u308B\u529B", research: "\u7814\u7A76", caring: "\u30B1\u30A2\u30FB\u4ECB\u8B77", medical: "\u533B\u7642", law: "\u6CD5\u5F8B", writing: "\u6587\u7AE0", speaking: "\u8A71\u8853", charm: "\u9B45\u529B", electric: "\u96FB\u6C17\u5DE5\u4E8B\u30FB\u8A2D\u5099", construction: "\u5EFA\u8A2D\u30FB\u571F\u6728", logistics: "\u7269\u6D41\u30FB\u8377\u5F79", curation: "\u5B66\u82B8\u30FB\u5C55\u793A", manage: "\u751F\u7523\u30FB\u73FE\u5834\u7BA1\u7406" };
  var HOBBY_SKILLS = ["cooking", "craft", "writing", "speaking", "charm", "stamina", "driving"];
  var lifeLv = (xp) => Math.min(60, 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 6)));
  var jobLv = (xp) => Math.min(10, 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 8)));
  var skillLv = (v) => Math.min(10, 1 + Math.floor((v || 0) / 11));
  var DEFAULT_LADDER = ["\u4E00\u822C", "\u4E3B\u4EFB", "\u4FC2\u9577", "\u8AB2\u9577", "\u90E8\u9577", "\u5F79\u54E1"];
  var RANK_LADDER = {
    clerk: ["\u5E97\u54E1", "\u30EA\u30FC\u30C0\u30FC", "\u526F\u5E97\u9577", "\u5E97\u9577"],
    waitstaff: ["\u30DB\u30FC\u30EB", "\u30EA\u30FC\u30C0\u30FC", "\u30D5\u30ED\u30A2\u9577", "\u5E97\u9577"],
    cook: ["\u8ABF\u7406\u88DC\u52A9", "\u8ABF\u7406\u5E2B", "\u526F\u6599\u7406\u9577", "\u6599\u7406\u9577"],
    stocker: ["\u4F5C\u696D\u54E1", "\u30EA\u30FC\u30C0\u30FC", "\u73ED\u9577"],
    cleaner: ["\u4F5C\u696D\u54E1", "\u30EA\u30FC\u30C0\u30FC"],
    fisher: ["\u4E57\u7D44\u54E1", "\u7532\u677F\u9577", "\u8239\u982D"],
    farmer: ["\u8FB2\u4F5C\u696D", "\u4E3B\u529B", "\u4EE3\u8868"],
    factory: ["\u4F5C\u696D\u54E1", "\u73ED\u9577", "\u4FC2\u9577", "\u5DE5\u5834\u9577"],
    logistics: ["\u914D\u9001\u54E1", "\u30EA\u30FC\u30C0\u30FC", "\u6240\u9577"],
    carpenter: ["\u898B\u7FD2\u3044", "\u8077\u4EBA", "\u68DF\u6881"],
    teacher: ["\u6559\u8AED", "\u4E3B\u4EFB\u6559\u8AED", "\u6559\u982D", "\u6821\u9577"],
    special_teacher: ["\u6559\u8AED", "\u4E3B\u4EFB\u6559\u8AED", "\u6559\u982D", "\u6821\u9577"],
    professor: ["\u8B1B\u5E2B", "\u51C6\u6559\u6388", "\u6559\u6388", "\u5B66\u90E8\u9577"],
    childcare: ["\u4FDD\u80B2\u58EB", "\u4E3B\u4EFB\u4FDD\u80B2\u58EB", "\u5712\u9577"],
    doctor: ["\u7814\u4FEE\u533B", "\u533B\u5E2B", "\u533B\u9577", "\u90E8\u9577", "\u9662\u9577"],
    nurse: ["\u770B\u8B77\u5E2B", "\u4E3B\u4EFB", "\u5E2B\u9577", "\u770B\u8B77\u90E8\u9577"],
    pharmacist: ["\u85AC\u5264\u5E2B", "\u4E3B\u4EFB", "\u85AC\u5C40\u9577"],
    caregiver: ["\u4ECB\u8B77\u8077\u54E1", "\u30EA\u30FC\u30C0\u30FC", "\u4E3B\u4EFB", "\u65BD\u8A2D\u9577"],
    police: ["\u5DE1\u67FB", "\u5DE1\u67FB\u90E8\u9577", "\u8B66\u90E8\u88DC", "\u8B66\u90E8"],
    firefighter: ["\u6D88\u9632\u58EB", "\u6D88\u9632\u58EB\u9577", "\u6D88\u9632\u53F8\u4EE4\u88DC", "\u6D88\u9632\u53F8\u4EE4"],
    banker: DEFAULT_LADDER,
    officeworker: DEFAULT_LADDER,
    official: ["\u4E3B\u4E8B", "\u4E3B\u4EFB", "\u4FC2\u9577", "\u8AB2\u9577", "\u90E8\u9577"],
    hotelstaff: ["\u30B9\u30BF\u30C3\u30D5", "\u30EA\u30FC\u30C0\u30FC", "\u652F\u914D\u4EBA"],
    railstaff: ["\u99C5\u54E1", "\u4E3B\u4EFB", "\u52A9\u5F79", "\u99C5\u9577"],
    reporter: ["\u8A18\u8005", "\u30C7\u30B9\u30AF", "\u90E8\u9577"],
    janitor: ["\u7BA1\u7406\u54E1", "\u4E3B\u4EFB"],
    scientist: ["\u7814\u7A76\u54E1", "\u4E3B\u4EFB\u7814\u7A76\u54E1", "\u5BA4\u9577"]
  };
  var ladderOf = (jobId) => RANK_LADDER[jobId] || ["\u4E00\u822C", "\u4E3B\u4EFB", "\u8AB2\u9577"];
  var rankName = (jobId, r) => {
    const L2 = ladderOf(jobId);
    return L2[Math.min(r, L2.length - 1)];
  };
  var rankCap = (jobId) => ladderOf(jobId).length - 1;
  function postsFor(staff, r) {
    if (r <= 0) return 1e9;
    if (r === 1) return staff >= 2 ? Math.max(1, Math.floor(staff / 3)) : 0;
    if (r === 2) return staff >= 8 ? Math.max(1, Math.floor(staff / 9)) : 0;
    if (r === 3) return staff >= 20 ? Math.max(1, Math.floor(staff / 27)) : 0;
    if (r === 4) return staff >= 60 ? 1 : 0;
    return staff >= 150 ? 1 : 0;
  }
  var JOB_QUALS = { officeworker: ["boki", "eiken"], banker: ["boki", "takken"], official: ["boki"], cook: ["cooklic"], caregiver: ["carewelfare"], factory: ["hazmat"], janitor: ["hazmat"], firefighter: ["hazmat"], logistics: ["driver"], clerk: ["eiken"], hotelstaff: ["eiken"], reporter: ["eiken"] };
  function newProf() {
    return { lxp: 0, jxp: {}, sk: {}, rank: 0, rankSince: 0, since: 0, hist: [] };
  }
  function pushHist(pr, e) {
    pr.hist.push(e);
    if (pr.hist.length > 48) pr.hist.splice(1, 1);
  }
  function qualList(pop, id) {
    const out = [];
    QUAL_IDS.forEach((q, i) => {
      if (pop.quals[id] & 1 << i) out.push(q);
    });
    return out;
  }
  function grantQual(world, id, q, M) {
    const i = QUAL_IDS.indexOf(q);
    if (i < 0) return false;
    const p = world.pop;
    if (p.quals[id] & 1 << i) return false;
    p.quals[id] |= 1 << i;
    const pr = world.profOf(id);
    pushHist(pr, { M, k: "qual", q });
    pr.lxp += 15;
    return true;
  }
  function addSkill(pr, skill, d) {
    const s = pr.sk[skill] || 0;
    pr.sk[skill] = Math.min(100, s + d * (1 - s / 115));
  }
  function growNpc(world, i, M, rng, age) {
    const p = world.pop;
    if (age < 3) return;
    const pr = world.profOf(i);
    let gain = 2 + (p.flags[i] & 16 ? 1 : 0) + (p.work[i] >= 0 ? 1 : 0) + (p.spouse[i] >= 0 ? 1 : 0) + (p.kids[i] > 0 ? 1 : 0);
    pr.lxp += gain;
    if (age >= 10 && (M + i) % 3 === 0) addSkill(pr, HOBBY_SKILLS[hash2(i, 55) % HOBBY_SKILLS.length], 0.54);
    if (p.work[i] >= 0 && p.job[i] < 255) {
      const jid = JOB_IDS[p.job[i]];
      const J = JOBS[jid];
      pr.jxp[jid] = (pr.jxp[jid] || 0) + 1;
      addSkill(pr, J.skill, 0.45);
      if (rng.next() < 35e-4) {
        const L2 = JOB_QUALS[jid];
        if (L2) {
          const q = L2[rng.int(L2.length)];
          if (grantQual(world, i, q, M)) world.noteLife(i, M, "qual", `${QUALS[q]}\u3092\u53D6\u5F97\u3057\u305F`);
        }
      }
    }
    if (age >= 18 && age < 70 && !(p.quals[i] & 1 << QUAL_IDS.indexOf("driver")) && rng.next() < 6e-3) {
      grantQual(world, i, "driver", M);
    }
  }
  function staffTables(world) {
    const nb = world.map.buildings.length;
    const staff = new Int32Array(nb);
    const cnt = new Int16Array(nb * 6);
    const S2 = world.slots;
    for (let s = 0; s < S2.b.length; s++) {
      const id = S2.who[s];
      if (id < 0) continue;
      const b = S2.b[s];
      staff[b]++;
      const r = world.profOf(id).rank;
      for (let k = 1; k <= Math.min(5, r); k++) cnt[b * 6 + k]++;
    }
    return { staff, cnt };
  }
  function promoteCheck(world, id, M, tbl) {
    const p = world.pop;
    if (p.work[id] < 0 || p.job[id] === 255) return false;
    const pr = world.profOf(id);
    const jid = JOB_IDS[p.job[id]];
    const r = pr.rank;
    if (r >= rankCap(jid)) return false;
    const age = Math.floor((M - p.born[id]) / 12);
    if (age < 22) return false;
    if (jobLv(pr.jxp[jid] || 0) < 2 + 2 * r) return false;
    if (M - pr.rankSince < 30) return false;
    const b = p.work[id];
    return postsFor(tbl.staff[b], r + 1) > tbl.cnt[b * 6 + r + 1];
  }
  function doPromote(world, id, M, tbl) {
    const p = world.pop, pr = world.profOf(id), jid = JOB_IDS[p.job[id]], b = p.work[id];
    pr.rank++;
    pr.rankSince = M;
    tbl.cnt[b * 6 + pr.rank]++;
    pr.lxp += 25;
    pushHist(pr, { M, k: "promo", job: jid, b, rank: pr.rank });
    return rankName(jid, pr.rank);
  }
  function promoteRound(world, M, rng) {
    const p = world.pop;
    const tbl = staffTables(world);
    const out = [];
    const S2 = world.slots;
    for (let s = 0; s < S2.b.length; s++) {
      const id = S2.who[s];
      if (id < 0 || p.gone[id] || p.flags[id] & 2) continue;
      if (rng.next() > 0.015) continue;
      if (!promoteCheck(world, id, M, tbl)) continue;
      const nm = doPromote(world, id, M, tbl);
      out.push(id);
      world.noteLife(id, M, "promo", `${nm}\u306B\u6607\u9032\u3057\u305F`);
      world.addEvent("promoted", id, { rank: nm });
    }
    trimPosts(world, tbl);
    return out;
  }
  function trimPosts(world, tbl0) {
    const p = world.pop, S2 = world.slots, tbl = staffTables(world);
    const nb = world.map.buildings.length;
    const byBR = /* @__PURE__ */ new Map();
    for (let s = 0; s < S2.b.length; s++) {
      const id = S2.who[s];
      if (id < 0 || p.gone[id] || p.flags[id] & 2) continue;
      const r = world.profOf(id).rank;
      if (r < 1 || r > 3) continue;
      const k = S2.b[s] * 6 + r;
      (byBR.get(k) || byBR.set(k, []).get(k)).push(id);
    }
    for (let b = 0; b < nb; b++) for (let r = 3; r >= 1; r--) {
      let ex = tbl.cnt[b * 6 + r] - postsFor(tbl.staff[b], r);
      if (ex <= 0) continue;
      const L2 = (byBR.get(b * 6 + r) || []).sort((x, y) => world.profOf(x).lxp - world.profOf(y).lxp || x - y);
      while (ex > 0 && L2.length) {
        const id = L2.shift();
        world.profOf(id).rank = r - 1;
        tbl.cnt[b * 6 + r]--;
        ex--;
      }
    }
  }
  function backfill(world, rng) {
    const p = world.pop, M = world.M;
    const order = [];
    const okCache = /* @__PURE__ */ new Map();
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i]) continue;
      const age = Math.floor((M - p.born[i]) / 12);
      const pr = world.profOf(i);
      pr.lxp = Math.round(age * 12 * (age < 3 ? 0 : 3.1) * (0.85 + rng.next() * 0.3));
      for (let k = 0; k < 3; k++) {
        const hs = HOBBY_SKILLS[hash2(i, 55) % HOBBY_SKILLS.length];
        pr.sk[hs] = Math.min(60, Math.max(0, (age - 8) * 0.9 * (0.5 + rng.next())));
        break;
      }
      if (age >= 18 && age <= 75 && hash2(i, 909) % 100 < 72) p.quals[i] |= 1 << QUAL_IDS.indexOf("driver");
      if (p.work[i] >= 0 && p.job[i] < 255) {
        const jid = JOB_IDS[p.job[i]], J = JOBS[jid];
        const startAge2 = Math.max(J.minAge, 18 + (p.edu[i] >= 5 ? 4 : p.edu[i] === 4 ? 0 : -2));
        const maxT = Math.max(2, (age - startAge2) * 12);
        const tenure = Math.max(1, Math.round(rng.next() * rng.next() * 0 + (0.1 + rng.next() * 0.9) * maxT));
        pr.since = M - tenure;
        pr.jxp[jid] = Math.round(tenure * (0.9 + rng.next() * 0.3));
        pr.sk[J.skill] = Math.min(95, tenure * 0.4 * (0.6 + rng.next() * 0.6));
        const hs = [];
        let rest = Math.max(0, maxT - tenure);
        let t = M - tenure;
        let nPrev = rest > 18 && rng.chance(0.65) ? rest > 90 && rng.chance(0.4) ? 2 : 1 : 0;
        const prev = [];
        for (let k = 0; k < nPrev; k++) {
          const dur = Math.max(6, Math.round(rest * (0.3 + rng.next() * 0.4) / (k + 1)));
          const sl = world.slots;
          const mk5 = jid + "|" + startAge2 + "|" + p.edu[i];
          let okS = okCache.get(mk5);
          if (!okS) {
            okS = [];
            for (let s = 0; s < sl.b.length; s++) {
              const j = JOB_IDS[sl.job[s]];
              if (j && j !== jid && !JOBS[j].qual && JOBS[j].minAge <= startAge2 + 2 && !(JOBS[j].edu && p.edu[i] < JOBS[j].edu)) okS.push(s);
            }
            okCache.set(mk5, okS);
          }
          const sIdx = okS.length ? okS[rng.int(okS.length)] : -1;
          const pj2 = sIdx >= 0 ? JOB_IDS[sl.job[sIdx]] : jid;
          const pb = sIdx >= 0 ? sl.b[sIdx] : p.work[i];
          prev.unshift({ job: pj2, dur, b: pb });
          rest -= dur;
        }
        let tt = t;
        for (const q of prev) tt -= q.dur;
        for (const q of prev) {
          hs.push({ M: tt, k: "start", job: q.job, b: q.b, rank: 0 });
          tt += q.dur;
          hs.push({ M: tt, k: "quit", job: q.job, b: q.b });
          pr.jxp[q.job] = (pr.jxp[q.job] || 0) + Math.round(q.dur * 0.9);
          addSkill(pr, JOBS[q.job].skill, q.dur * 0.3);
        }
        hs.push({ M: t, k: "start", job: jid, b: p.work[i], rank: 0 });
        pr.hist = hs;
        pr.lxp += Math.round(tenure * 0.5);
        order.push(i);
      }
    }
    const tbl = { staff: new Int32Array(world.map.buildings.length), cnt: new Int16Array(world.map.buildings.length * 6) };
    const S2 = world.slots;
    for (let s = 0; s < S2.b.length; s++) if (S2.who[s] >= 0) tbl.staff[S2.b[s]]++;
    order.sort((a, b) => world.profOf(a).since - world.profOf(b).since);
    for (const i of order) {
      const pr = world.profOf(i), jid = JOB_IDS[p.job[i]], b = p.work[i];
      const age = Math.floor((M - p.born[i]) / 12);
      if (age < 24) continue;
      let r = 0;
      const lv = jobLv(pr.jxp[jid] || 0);
      while (r < rankCap(jid) && lv >= 2 + 2 * r && postsFor(tbl.staff[b], r + 1) > tbl.cnt[b * 6 + r + 1] && rng.chance(0.75)) {
        r++;
        tbl.cnt[b * 6 + r]++;
      }
      pr.rank = r;
      pr.rankSince = pr.since + 12 * r * 3;
      if (pr.rankSince > M) pr.rankSince = M;
      for (let k = 1; k <= r; k++) pr.hist.push({ M: Math.min(M, pr.since + 30 * k), k: "promo", job: jid, b, rank: k });
    }
  }
  function profileView(world, id, M) {
    const p = world.pop;
    const pr = world.profOf(id);
    const jid = p.job[id] < 255 ? JOB_IDS[p.job[id]] : null;
    const age = Math.floor((M - p.born[id]) / 12);
    return {
      lifeLv: lifeLv(pr.lxp),
      lxp: pr.lxp,
      job: jid,
      jobLv: jid ? jobLv(pr.jxp[jid] || 0) : 0,
      rank: pr.rank,
      rankName: jid ? rankName(jid, pr.rank) : "",
      jobLvs: Object.entries(pr.jxp).map(([j, x]) => ({ job: j, name: JOBS[j].name, lv: jobLv(x) })).sort((a, b) => b.lv - a.lv),
      skills: Object.entries(pr.sk).filter(([, v]) => v >= 1).map(([k, v]) => ({ k, name: SKILL_NAMES[k] || k, v: Math.round(v), lv: skillLv(v) })).sort((a, b) => b.v - a.v),
      quals: qualList(p, id).map((q) => ({ q, name: QUALS[q] })),
      hist: pr.hist,
      age
    };
  }
  function histText(world, e) {
    const J = e.job ? JOBS[e.job]?.name : "";
    const B2 = e.b >= 0 && e.b != null ? world.map.buildings[e.b]?.name : "";
    const y = 1900 + Math.floor(e.M / 12);
    switch (e.k) {
      case "start":
        return `${y}\u5E74 ${B2 ? B2 + "\u3067" : ""}${J}\u3068\u3057\u3066\u50CD\u304D\u59CB\u3081\u305F`;
      case "quit":
        return `${y}\u5E74 ${J}\u306E\u4ED5\u4E8B\u3092\u8F9E\u3081\u305F`;
      case "laid":
        return `${y}\u5E74 ${J}\u306E\u8077\u5834\u304C\u9589\u307E\u308A\u96E2\u8077\u3057\u305F`;
      case "retired":
        return `${y}\u5E74 \u9000\u8077\u3057\u305F`;
      case "promo":
        return `${y}\u5E74 ${rankName(e.job, e.rank)}\u306B\u6607\u9032`;
      case "qual":
        return `${y}\u5E74 ${QUALS[e.q] || e.q}\u3092\u53D6\u5F97`;
      default:
        return `${y}\u5E74 ${e.k}`;
    }
  }

