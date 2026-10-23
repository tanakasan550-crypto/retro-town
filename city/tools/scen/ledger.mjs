import { startTrial } from './lib.mjs';
// 活動の実績: 街の歴史の中で記録がたまり、人生の目標の進み具合と、エンディングの表彰(根拠つき・一人1賞・決定的)になる。セーブの往復で同じ
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop;
    let work = 0, care = 0, promo = 0, grads = 0, club = 0;
    for (let i = 0; i < P.n; i++) { if (P.workM[i]) work++; if (P.careM[i]) care++; if (P.promo[i]) promo++; if (P.grads[i]) grads++; if (P.clubY[i]) club++; }
    // 知人を増やす(同じ学校・近所の人と知り合う)
    for (let i = 0, k = 0; i < P.n && k < 60; i++) if (!P.gone[i] && i !== G.hero.id && Math.floor((G.S.M - P.born[i]) / 12) >= 30) { G.meet(i, 5); k++; }
    const a1 = NLS.ledger.ledgerAwards(G), a2 = NLS.ledger.ledgerAwards(G);
    const stud = [...Array(P.n).keys()].find(i => !P.gone[i] && P.school[i] >= 0 && i !== G.hero.id);
    const worker = [...Array(P.n).keys()].find(i => !P.gone[i] && P.work[i] >= 0 && P.workM[i] > 24);
    const N = NLS.nav, G2 = N.Game.load(N.fromJSON(N.toJSON(G.serialize()))), P2 = G2.world.pop;
    const same = ['workM', 'careM', 'promo', 'grads', 'clubY', 'sch1', 'sch2', 'sch3', 'sch4', 'sch5'].every(k => P2[k].slice(0, P.n).join() === P[k].slice(0, P.n).join());
    const html = NLS.ui && (document.body.innerHTML.length > 0);
    return { counts: { work, care, promo, grads, club }, awards: a1.map(a => a.title + ':' + a.name + ':' + a.evidence), deterministic: JSON.stringify(a1) === JSON.stringify(a2), uniquePeople: new Set(a1.map(a => a.id)).size === a1.length, studMission: NLS.ledger.lifeMission(w, stud), workerMission: NLS.ledger.lifeMission(w, worker), same };
  });
  console.log('LEDGER', JSON.stringify(r, null, 1));
  if (!r.counts.work || !r.counts.promo || !r.counts.grads || !r.counts.club || !r.awards.length || !r.deterministic || !r.uniquePeople || !r.studMission || !r.workerMission || !r.same) throw new Error('ledger problem');
};
