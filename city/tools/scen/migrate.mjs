import { startTrial } from './lib.mjs';
import path from 'path';
// 旧セーブからの移行: 旧版の単体HTML(OLD_HTML)で遊んだセーブを、新しい版で読み込む。
// 建物ID・人物ID・住まい・人数・主人公の場所・施設の移転(動物園・大学が島へ)・名前・セーブの往復を確かめる。
export default async (p, shot) => {
  const old = process.env.OLD_HTML;
  if (!old) throw new Error('OLD_HTML (旧版の単体HTML) を指定してください');
  // 1) 旧版でセーブを作る(数日進め、動物園の正門の建物の中にいる状態)
  const q = await p.context().newPage();
  await q.goto('file://' + path.resolve(old) + '?city=4'); await q.waitForTimeout(1500);
  await startTrial(q);
  const A = await q.evaluate(() => {
    const G = NLS.G, m = G.world.map, zoo = m.buildings.find(b => b.type === 'zoo');
    G.skipTo(G.S.M + 2, false);
    const L = G.S.loc; L.k = 'in'; L.b = zoo.idx; L.floor = 0; L.x = 5.5; L.y = 5.5;
    const txt = NLS.nav.toJSON(G.serialize());
    return { txt, nb: m.buildings.length, n: G.world.pop.n, ids: m.buildings.map(b => b.id).join('|'), home: G.hero.homeB, homeName: m.buildings[G.hero.homeB].name, homes: Array.from(G.world.pop.home.slice(0, G.world.pop.n)).join(','), M: G.S.M, zoo: [zoo.idx, zoo.x, zoo.y], money: G.hero.money };
  });
  await q.close();
  console.log('OLD', JSON.stringify({ ...A, txt: A.txt.length, ids: A.ids.length, homes: A.homes.length }));
  // 2) 新しい版で読み込む
  await startTrial(p);
  const B = await p.evaluate((A) => {
    const N = NLS.nav, G2 = N.Game.load(N.fromJSON(A.txt)), m = G2.world.map, P = G2.world.pop;
    const zoo = m.buildings[A.zoo[0]];
    const sameIds = m.buildings.slice(0, A.nb).map(b => b.id).join('|') === A.ids;
    const sameHomes = Array.from(P.home.slice(0, A.n)).join(',') === A.homes;
    const L = G2.S.loc;
    let interiorOk = true; try { N.interiorOf(G2, L.b, L.floor); } catch (e) { interiorOk = 'err ' + e.message; }
    // 住まいの建物がすべてあり、住宅のまま
    let badHome = 0; for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.home[i] >= 0 && !m.buildings[P.home[i]]) badHome++;
    // 2回目の往復
    const G3 = N.Game.load(N.fromJSON(N.toJSON(G2.serialize())));
    return { nb: m.buildings.length, n: P.n, sameIds, sameHomes, badHome, home: G2.hero.homeB, homeName: m.buildings[G2.hero.homeB].name, M: G2.S.M, money: G2.hero.money, loc: [L.k, L.b, L.floor], interiorOk, zooNow: [zoo.idx, zoo.type, zoo.x, zoo.y, zoo.siteI != null && m.fsites[zoo.siteI].y >= m.island.y], again: G3.world.map.buildings.length === m.buildings.length && G3.S.M === G2.S.M, schBackfill: (() => { let n = 0; for (let i = 0; i < P.n; i++) if (P.school[i] >= 0 && !P.gone[i]) { const lv = { kinder: 1, elem: 2, jh: 3, hs: 4, univ: 5 }[m.buildings[P.school[i]].type]; if (lv && P['sch' + lv][i] === P.school[i]) n++; } return n; })() };
  }, A);
  console.log('NEW', JSON.stringify(B));
  if (!B.sameIds || !B.sameHomes || B.badHome || B.home !== A.home || B.n !== A.n || B.M !== A.M || B.money !== A.money || B.interiorOk !== true || !B.zooNow[4] || !B.again || !B.schBackfill) throw new Error('old save migration failed');
};
