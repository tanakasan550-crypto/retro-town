import { startTrial } from './lib.mjs';
// 市外に住む親族: 人物IDを持ち、住民の親子の結びつきができ、葬儀の「身寄りなし」が減ること。市外で亡くなると街の子が喪主。
// 正月・お盆の帰省。主人公の祖父母との続柄。セーブの往復で同じ。既存の人物IDは変わらない(末尾に追加)
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, h = G.hero.id, M = w.M;
    const out = (w.outKin || []).length;
    let made = 0; for (let i = 0; i < P.n; i++) if (P.gone[i] === 2 && P.goneAt[i] === -1) made++;
    // 65歳以上の住民の喪主(いま亡くなったら)
    let old = 0, none = 0;
    for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.home[i] >= 0 && (M - P.born[i]) / 12 >= 65) { old++; if (NLS.fun.funeralChief(w, i, M).id < 0) none++; }
    const gp = [P.mother[P.mother[h]], P.father[P.mother[h]], P.mother[P.father[h]], P.father[P.father[h]]].filter(x => x >= 0);
    const gpRel = gp.map(x => NLS.tiesOf(w, h, x).map(t => t.rel).join('/'));
    // 3年すすめる
    const outIds = (w.outKin || []).slice(), ev = { died: 0, visit: 0 }, f0 = (w.funerals || []).length;
    for (let k = 0; k < 36; k++) { w.tickMonth(); for (const e of w.events) { if (e.type === 'visit_out') ev.visit++; } }
    for (const x of outIds) if (P.gone[x] === 1) ev.died++;
    const outFun = (w.funerals || []).slice(f0).filter(f => outIds.includes(f.id ?? f.dead)).length, fkeys = Object.keys((w.funerals || [])[0] || {}).join(',');
    const N = NLS.nav, G2 = N.Game.load(N.fromJSON(N.toJSON(G.serialize()))), P2 = G2.world.pop;
    const same = P2.n === P.n && (G2.world.outKin || []).length === (w.outKin || []).length && P2.mother[P.mother[h]] === P.mother[P.mother[h]];
    return { out, made, old, none, nonePct: Math.round(none / old * 100), gp: gp.length, gpRel, ev, outFun, fkeys, same, n: P.n };
  });
  console.log('KINOUT', JSON.stringify(r));
  if (!r.out || r.nonePct > 15 || !r.same || !r.ev.visit || !r.ev.died || !r.outFun) throw new Error('outside relatives not working');
};
