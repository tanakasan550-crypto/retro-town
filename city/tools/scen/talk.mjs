import { startTrial } from './lib.mjs';
// 会話の中身が事実にもとづくこと: 同級生(同じ学校・今日の体育・部活)・身内を亡くした人(葬儀の記録)・同じ建物の人。根拠を確かめる
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, h = G.hero, out = {};
    for (let k = 0; k < 7 && !G.isSchoolDay(); k++) G.advance(1440);
    G.S.min = 16 * 60;
    // 同級生
    const mates = w.classmates(h.id, P.school[h.id]);
    if (mates.length) { const id = mates[0]; out.mate = { name: G.nameOf(id), facts: NLS.talkFacts(G, id), sameSchool: P.school[id] === P.school[h.id] }; }
    // 身内を亡くした人: 子のいる高齢の住民を亡くし、その子に話しかける
    let dead = -1, kid = -1;
    for (let i = 0; i < P.n && dead < 0; i++) if (!P.gone[i] && i !== h.id && !h.rel[i] && Math.floor((G.S.M - P.born[i]) / 12) > 60) { const ks = w.childrenOf(i).filter(k => !P.gone[k] && k !== h.id && Math.floor((G.S.M - P.born[k]) / 12) >= 20); if (ks.length) { dead = i; kid = ks[0]; } }
    w.kill(dead, G.S.M, 1);
    const fr = NLS.fun.funeralOf(w, dead);
    out.bereaved = { name: G.nameOf(kid), of: G.nameOf(dead), facts: NLS.talkFacts(G, kid), inRecord: fr.att.includes(kid) || fr.chief === kid, chief: fr.chief === kid };
    // 同じ建物
    const nb = [...Array(P.n).keys()].find(i => i !== h.id && !P.gone[i] && P.home[i] === h.homeB && P.mother[i] !== h.id && i !== P.mother[h.id] && i !== P.father[h.id]);
    if (nb != null) out.neighbor = { name: G.nameOf(nb), facts: NLS.talkFacts(G, nb) };
    // 実際の会話(行動として)
    const t = { kind: 'npc', id: kid }; const res = NLS.bus.runAction(G, 'chat', t);
    out.talkMsg = res && res.msg;
    // 在籍記録とつながり: 小学校が同じで同じ学年の住民どうし・主人公の親族
    let rec = 0, pair = null; for (let i = 0; i < P.n; i++) if (P.sch2[i] >= 0) { rec++; if (!pair) { for (let j = i + 1; j < Math.min(P.n, i + 4000); j++) if (P.sch2[j] === P.sch2[i] && Math.floor((P.born[j] - 3) / 12) === Math.floor((P.born[i] - 3) / 12)) { pair = [i, j]; break; } } }
    out.schRecords = rec;
    out.pairTies = pair ? NLS.tiesOf(w, pair[0], pair[1]).map(t => t.k + ':' + (t.name || t.rel)) : null;
    const kinIds = [P.mother[h.id], P.father[h.id]].filter(x => x >= 0); out.heroKin = kinIds.map(x => NLS.tiesOf(w, h.id, x).map(t => t.rel || t.k).join(','));
    return out;
  });
  console.log('TALK', JSON.stringify(r, null, 1));
  const has = (o, re) => o && o.facts.some(f => re.test(f.why));
  if (r.mate && !(r.mate.sameSchool && has(r.mate, /同じ学校/))) throw new Error('classmate fact missing or wrong');
  if (!r.schRecords || !r.pairTies || !r.pairTies.some(x => /classmate|gradeMate/.test(x)) || !r.heroKin.every(x => /母|父/.test(x))) throw new Error('school records or ties missing');
  if (!r.bereaved.inRecord || !has(r.bereaved, /葬儀の記録/)) throw new Error('bereavement fact missing');
  if (r.mate && r.mate.facts.some(f => /同じ職場/.test(f.why))) throw new Error('false coworker fact for a student');
  if (!r.talkMsg) throw new Error('talk produced no message');
  if (!/亡くして|見送りました/.test(r.talkMsg)) throw new Error('a recently bereaved person should talk about the loss first');
};
