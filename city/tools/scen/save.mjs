import { startTrial } from './lib.mjs';
// セーブ→JSON→読み込みの往復で、位置・建物数・駅数・宿泊などが保たれるか
export default async (p) => { await startTrial(p);
  console.log(await p.evaluate(() => { const N = NLS.nav, G = NLS.G;
    G.S.hotel = { b: 1, room: 1200, plan: 'meal', until: G.absMin() + 999, since: G.absMin() };
    const before = { loc: JSON.stringify(G.S.loc), nb: G.world.map.buildings.length, ns: G.world.map.stations.length, lines: G.tr.lines.length, home: G.hero.homeB, money: G.hero.money, planNf: G.world.map.buildings.filter(b => b.planNf).length };
    const txt = N.toJSON(G.serialize());
    const G2 = N.Game.load(N.fromJSON(txt));
    const after = { loc: JSON.stringify(G2.S.loc), nb: G2.world.map.buildings.length, ns: G2.world.map.stations.length, lines: G2.tr.lines.length, home: G2.hero.homeB, money: G2.hero.money, planNf: G2.world.map.buildings.filter(b => b.planNf).length };
    return JSON.stringify({ size: txt.length, same: JSON.stringify(before) === JSON.stringify(after), before, after, hotel: G2.S.hotel }); })); };
