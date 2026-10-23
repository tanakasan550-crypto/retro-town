import { startTrial } from './lib.mjs';
import fs from 'fs';
// 将来の夢と人生の連続性(dreams.js)の長期回帰: 夢を持つ → 学ぶ → 挑戦する → 就く → 働く → 記録に残る。
// ①始まり: 子どもの多くが夢を持つ(持たない子もいる)・資格の要る職で資格のない人が0 ②主人公が夢を選び、日記に段階と次にすることが出る
// ③セーブの往復・古いセーブ(夢と免許の記録なし)の読み込みで記録が足される ④30年: 夢の変化・進学・受験(合格と不合格)・資格・夢の職・諦め・
// 再挑戦・転職・独立・憧れた人との再会・亡くなった人、が実際の記録として起き、資格の職が続く ⑤会話・表彰・エンディングが記録だけを根拠にする
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, J = NLS.JOBS, IDS = Object.keys(J), D = NLS.dr, N = NLS.nav;
    const unlic = () => { let n = 0; for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.job[i] < 255) { const JJ = J[IDS[P.job[i]]]; if ((JJ.qual || JJ.lic) && !D.holdsFor(w, i, JJ)) n++; } return n; };
    const staffed = (L) => { const e = {}, s = {}; for (let k = 0; k < w.slots.b.length; k++) { const j = IDS[w.slots.job[k]]; if (!L.includes(j)) continue; s[j] = (s[j] || 0) + 1; if (w.slots.who[k] >= 0) e[j] = (e[j] || 0) + 1; } return Object.fromEntries(L.map(j => [j, +((e[j] || 0) / Math.max(1, s[j] || 0)).toFixed(2)])); };
    // 資格の道で人を育てる職(運転免許だけの物流の職は、街の高齢化による人手不足で以前の版から少ないので別に記録する)
    const KEY = ['doctor', 'nurse', 'teacher', 'police', 'firefighter', 'pharmacist', 'childcare', 'forklift', 'mechanic', 'electrician'];
    // ① 始まり
    let kids = 0, kd = 0; const M0 = w.M;
    for (let i = 0; i < P.n; i++) { if (P.gone[i] || P.home[i] < 0) continue; const a = Math.floor((M0 - P.born[i]) / 12); if (a >= 6 && a < 15) { kids++; if (P.dr1[i] !== 255) kd++; } }
    const start = { kids, kidsWithDream: kd, unlicensed: unlic(), staffed: staffed(KEY) };
    // ② 主人公が夢を選ぶ
    G.S.queue = []; G.queueEvent('dream_choose', { age: G.age() });
    const pv = G.promptView(); G.choose(0);
    const heroDream = { title: pv.title, choices: pv.choices, panel: D.heroDreamPanel(G), log: G.S.log.filter(e => e.kind === 'dream').map(e => e.text) };
    // ③ セーブの往復と古いセーブ
    const dump = N.toJSON(G.serialize()), G2 = N.Game.load(N.fromJSON(dump)), P2 = G2.world.pop;
    let same = true; for (const k of ['dr1', 'dr2', 'drS', 'drBy', 'drM', 'trk', 'trkY', 'lic2']) for (let i = 0; i < P.n; i += 97) if (P2[k][i] !== P[k][i]) same = false;
    const od = N.fromJSON(dump); for (const k of ['dr1', 'dr2', 'drS', 'drBy', 'drM', 'trk', 'trkY', 'lic2']) delete od.world.arrays[k]; delete od.world.dreamV;
    const G3 = N.Game.load(od), P3 = G3.world.pop; let oldKids = 0, oldKd = 0; for (let i = 0; i < P3.n; i++) { if (P3.gone[i] || P3.home[i] < 0) continue; const a = Math.floor((G3.world.M - P3.born[i]) / 12); if (a >= 6 && a < 15) { oldKids++; if (P3.dr1[i] !== 255) oldKd++; } }
    let oldUnlic = 0; for (let i = 0; i < P3.n; i++) if (!P3.gone[i] && P3.job[i] < 255) { const JJ = J[IDS[P3.job[i]]]; if ((JJ.qual || JJ.lic) && !D.holdsFor(G3.world, i, JJ)) oldUnlic++; }
    const old = { dreamV: G3.world.dreamV, kids: oldKids, kidsWithDream: oldKd, unlicensed: oldUnlic };
    // ④ 30年
    const t0 = performance.now();
    G.skipTo(G.S.M + 12 * 30, false);
    const sec = Math.round((performance.now() - t0) / 1000);
    const ev = {}, deadRec = { n: 0 };
    for (const [id, pr] of w.prof) for (const e of pr.hist || []) { if (e.M < M0) continue; const k = e.k === 'exam' ? (e.ok ? 'examPass' : 'examFail') : e.k === 'qual' && e.pre ? 'qualPre' : e.k; ev[k] = (ev[k] || 0) + 1; }
    for (const [id, pr] of w.prof) if (P.gone[id] === 1 && (pr.hist || []).some(e => e.k === 'dream')) deadRec.n++;
    const after = { unlicensed: unlic(), staffed: staffed(KEY) };
    // ⑤ 会話: 憧れた人と同じ職場の人・試験に落ちた人・夢をかなえた人
    const find = (f) => { for (const [id, pr] of w.prof) if (!P.gone[id] && P.home[id] >= 0 && f(id, pr.hist || [])) return id; return -1; };
    const iSame = find((id, H) => H.some(e => e.k === 'inspire' && e.same && !P.gone[e.by]) && P.drS[id] === 4);
    const iOk = find((id, H) => H.some(e => e.k === 'dreamok') && P.drS[id] === 4);
    const iFail = find((id, H) => P.drS[id] === 3 && H.length && H[H.length - 1].k === 'exam' && !H[H.length - 1].ok);
    const talk = (id) => id >= 0 ? D.dreamFacts(G, id).map(f => `${f.pri}| ${f.say} [${f.why}]`) : [];
    // 表彰: 夢をかなえた人・独立した人を知り合いに
    for (const id of [iSame, iOk, find((id, H) => H.some(e => e.k === 'found')), find((id, H) => H.filter(e => e.k === 'exam').length >= 3 && H.some(e => e.k === 'exam' && e.ok))]) if (id >= 0) G.meet(id, 30);
    const aw = NLS.ledger.ledgerAwards(G).filter(a => /夢|努力|成長|地域/.test(a.title)).map(a => `${a.title} ${a.name}: ${a.evidence}`);
    const end = D.buildEnding(G).sections.find(s => s.title === '夢と進路');
    const news = (w.newsLog || []).filter(e => e.kind === 'dream').slice(-3).map(e => e.text);
    // 先生にあこがれて先生になった人(担任・在籍校の先生の職歴から決めた憧れ)
    let tchInsp = 0, tchSame = 0; const TJ = ['teacher', 'special_teacher'];
    for (const [id, pr] of w.prof) for (const e of pr.hist || []) if (e.k === 'inspire' && P.dr1[id] === 2) { tchInsp++; if (e.same) tchSame++; }
    // セーブの大きさ(30年後)
    const saveMB = +(N.toJSON(G.serialize()).length / 1048576).toFixed(1);
    return { tchInsp, tchSame, saveMB, start, heroDream, same, old, sec, ev, deadRec: deadRec.n, after, talk: { same: talk(iSame), ok: talk(iOk), fail: talk(iFail) }, aw, ending: end ? end.lines.map(l => l.text) : null, news };
  });
  console.log('DREAMS', JSON.stringify(r, null, 1));
  if (process.env.OUT) fs.writeFileSync(process.env.OUT + '/dreams.json', JSON.stringify(r, null, 1));
  const E = r.ev, bad = [];
  if (r.start.unlicensed || r.after.unlicensed || r.old.unlicensed) bad.push('unlicensed worker');
  if (r.start.kidsWithDream < r.start.kids * 0.6 || r.start.kidsWithDream === r.start.kids) bad.push('kids dreams');
  if (!r.heroDream.log.length || !/将来の夢/.test(r.heroDream.panel)) bad.push('hero dream');
  if (!r.same || r.old.dreamV !== 1 || r.old.kidsWithDream < r.old.kids * 0.6) bad.push('save/old save');
  for (const k of ['dream', 'change', 'school', 'examPass', 'examFail', 'qual', 'dreamok', 'giveup', 'switch', 'retry', 'found', 'inspire']) if (!E[k]) bad.push('no ' + k);
  if (!r.deadRec) bad.push('no deaths with dream records');
  for (const [j, v] of Object.entries(r.after.staffed)) if (v < 0.5) bad.push(`${j} staffed ${v}`);
  if (!r.talk.same.some(s => /同じ職場/.test(s)) || !r.talk.ok.some(s => /夢だった/.test(s)) || !r.talk.fail.some(s => /落ち/.test(s))) bad.push('talk');
  if (!r.aw.some(s => /夢をかなえた賞/.test(s))) bad.push('awards');
  if (!r.ending || !r.ending.length) bad.push('ending');
  if (!r.tchInsp) bad.push('no teacher inspired by a teacher');
  if (bad.length) throw new Error('dreams: ' + bad.join(', '));
};
