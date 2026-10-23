import { startTrial } from './lib.mjs';
// 施設名の整理: 「〜第N」・括弧つき地区名・用途語つき地区名を自然な名前へ。建物IDはそのまま・セーブの往復と旧い名前のセーブでも同じ名前になる
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const N = NLS.nav, G = NLS.G, B = G.world.map.buildings;
    const mech = (n) => /第\d+$|[((](行政地区|農村)[))]|文教地区(小|中)|住宅地(小|中)/.test(n || '');
    const left = B.filter(b => mech(b.name)).map(b => b.type + ':' + b.name);
    const changed = B.filter(b => b.nameOld != null);
    const idsOk = B.every((b, i) => b.idx === i && b.id === 'B' + String(i).padStart(4, '0'));
    const NOUN = new Set(['house', 'farmhouse', 'villa']); const dupL = (() => { const c = {}; for (const b of B) if (!NOUN.has(b.type)) c[b.name] = (c[b.name] || 0) + 1; return Object.entries(c).filter(([, k]) => k > 1); })(); const dup = dupL.length; const dupEx = dupL.slice(0, 12);
    const dupPublic = (() => { const c = {}; for (const b of B) if (['elem', 'jh', 'kinder', 'police', 'fire', 'library', 'hospital', 'museum', 'court'].includes(b.type)) c[b.name] = (c[b.name] || 0) + 1; return Object.entries(c).filter(([, k]) => k > 1); })();
    const sample = {}; for (const b of changed) { (sample[b.type] = sample[b.type] || []).push(b.nameOld + ' → ' + b.name); }
    for (const k of Object.keys(sample)) sample[k] = sample[k].slice(0, 4);
    // セーブの往復
    const names0 = B.map(b => b.name).join('|');
    const txt = N.toJSON(G.serialize());
    const G2 = N.Game.load(N.fromJSON(txt));
    const n2 = G2.world.map.buildings.map(b => b.name); const same = n2.join('|') === names0; const sameDiff = B.filter((b, i) => b.name !== n2[i]).slice(0, 6).map(b => b.type + ':' + (b.nameOld || '') + ' → ' + b.name + ' / ' + n2[b.idx]);
    // 旧い名前で保存されたセーブ(bdyn に「〜第2」が残っている)を読んでも同じ名前になる
    const d = N.fromJSON(txt); const W = d.world || d.w || null;
    let oldSame = null;
    const bd = (W && W.bdyn) || (d.bdyn);
    if (bd) { for (const b of B) if (b.nameOld != null && b.name === b.nameNat && !b.nameSim && bd[b.idx]) bd[b.idx].name = b.nameOld; for (const x of bd) if (x) delete x.nameSim; const G3 = N.Game.load(d); const nn = G3.world.map.buildings.map(b => b.name); oldSame = nn.join('|') === names0; if (!oldSame) globalThis.__oldDiff = B.filter((b, i) => b.name !== nn[i]).slice(0, 3).map(b => { const c = G3.world.map.buildings[b.idx]; return JSON.stringify({ g: [b.name, b.nameGen, b.nameNat, b.nameSim, (b.history || []).slice(-2)], g3: [c.name, c.nameGen, c.nameNat, c.nameSim, (c.history || []).slice(-2)] }); }); }
    return { dupEx, sameDiff, oldDiff: globalThis.__oldDiff || null, total: B.length, changed: changed.length, left: left.slice(0, 20), leftN: left.length, idsOk, dup, dupPublic, same, oldSame, sample };
  });
  console.log('NAMES', JSON.stringify(r, null, 1));
  // 名前を変えた施設の一覧(docs/facility_renames.csv の元)
  const rows = await p.evaluate(() => NLS.G.world.map.buildings.filter(b => b.nameOld != null && b.nameOld !== b.name).map(b => [b.id, b.type, b.nameOld, b.name].join(',')));
  console.log('RENAMES ' + rows.length); if (process.env.RENAMES_OUT) (await import('fs')).writeFileSync(process.env.RENAMES_OUT, 'id,type,old,new\n' + rows.join('\n') + '\n');
  if (!r.idsOk || !r.same || r.leftN || r.dup || r.dupPublic.length || r.oldSame === false) throw new Error('names check failed');
};
