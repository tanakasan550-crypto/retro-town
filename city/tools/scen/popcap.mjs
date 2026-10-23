import { startTrial } from './lib.mjs';
// 人口の上限: 配列(故人を含む)が初めの大きさ6万を超えても、新しい住民が消えず・出生が止まらず・セーブが壊れないこと
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop;
    const cap0 = P.cap, n0 = P.n;
    // 故人の記録として埋める(生まれて亡くなった人を足す)。いまの配列の大きさ(cap0)を必ず超える。IDは連番のまま
    const rng = G.actRng('popcap');
    let lastId = -1;
    while (P.n < Math.max(61500, cap0 + 100)) { const id = w.newPerson(rng, 600, G.S.M); P.gone[id] = 1; P.goneAt[id] = G.S.M; lastId = id; }
    // 6万を超えたところで、生きている夫婦に子が生まれる(birth の経路)
    let mom = -1, dad = -1;
    for (let i = 0; i < n0 && mom < 0; i++) if (!P.gone[i] && P.spouse[i] >= 0 && !P.gone[P.spouse[i]] && w.isFem(i) && Math.floor((G.S.M - P.born[i]) / 12) < 40 && P.home[i] >= 0) { mom = i; dad = P.spouse[i]; }
    const nb = P.n; w.birth(G.actRng('popcap2'), mom, dad, G.S.M);
    const child = P.n > nb ? P.n - 1 : -1;
    const kidOk = child >= 0 && P.mother[child] === mom && P.home[child] === P.home[mom] && !P.gone[child];
    // 1年すすめる(月次の処理で出生・死亡が続く)
    const births0 = w.stats.births || 0, nA = P.n;
    for (let k = 0; k < 12; k++) w.tickMonth();
    const grewBy = P.n - nA, births = (w.stats.births || 0) - births0;
    // セーブの往復(6万を超えた配列)
    const N = NLS.nav, G2 = N.Game.load(N.fromJSON(N.toJSON(G.serialize()))), P2 = G2.world.pop;
    const same = P2.n === P.n && P2.mother[child] === mom && P2.home[child] === P.home[child] && P2.born[P.n - 1] === P.born[P.n - 1] && P2.gone[lastId] === 1;
    return { cap0, capNow: P.cap, n0, n: P.n, child, kidOk, grewBy, births, saveN: P2.n, same };
  });
  console.log('POPCAP', JSON.stringify(r));
  if (!(r.n > 6e4) || !r.kidOk || r.births <= 0 || r.grewBy <= 0 || !r.same) throw new Error('population cap problem');
};
