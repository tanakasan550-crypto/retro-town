import { startTrial } from './lib.mjs';
// 学校の体育館(敷地の中の棟): 自分の学校の生徒は登校日に入れる・他校/休日は入れない・体育館の中(ステージ・コート・ゴール・器具庫・下足箱)とシュート練習
const pick = (p, txt) => p.evaluate((txt) => { const b = [...document.querySelectorAll('#card button.item')].find(b => b.textContent.includes(txt) && !b.disabled); if (b) b.click(); return b ? b.textContent : null; }, txt);
export default async (p, shot) => {
  await startTrial(p);
  const info = await p.evaluate(() => {
    const G = NLS.G, m = G.world.map, h = G.hero;
    // 平日の10時
    for (let k = 0; k < 7 && !G.isSchoolDay(); k++) G.advance(1440);
    G.S.min = 10 * 60;
    const sb = m.buildings[h.edu.b];
    const mine = m.buildings.filter(q => (q.campusOf ?? q.parentB) === sb.idx);
    const gym = mine.find(q => q.kind === 'gym');
    const other = m.buildings.find(q => q.kind === 'gym' && (q.campusOf ?? q.parentB) !== sb.idx && m.buildings[q.campusOf ?? q.parentB].type !== 'univ');
    const L = G.S.loc; L.k = 'in'; L.b = gym.idx; L.floor = 0;
    const { I } = NLS.nav.interiorOf(G, gym.idx, 0);
    L.x = I.door.x + 0.5; L.y = I.H - 2.5; NLS.U.cwAt = -999;
    const kinds = {}; for (const o of I.objs) kinds[o.t] = (kinds[o.t] || 0) + 1;
    return { school: sb.name, type: sb.type, gym: gym.name, gymType: gym.type, campus: mine.map(q => q.kind + ':' + q.type), objs: kinds, W: I.W, H: I.H,
      openMine: NLS.isOpenFor(G, gym), openOther: other && NLS.isOpenFor(G, other), other: other && other.name };
  });
  console.log('CAMPUS', JSON.stringify(info));
  if (!info.openMine.ok || (info.openOther && info.openOther.ok && !info.openOther.test)) throw new Error('campus entry rule wrong');
  if (!info.objs.fx_hoop || !info.objs.fx_gstage || !info.objs.fx_vnet || !info.objs.fx_tobibako || !info.objs.shoebox) throw new Error('gym interior incomplete');
  await p.waitForTimeout(1500); await shot('gym');
  await p.evaluate(() => { const G = NLS.G, { I } = NLS.nav.interiorOf(G, G.S.loc.b, 0); const o = I.objs.find(o => o.act === 'fx_hoop'); NLS.nav.navTo({ kind: 'obj', o }); globalThis.__NAVSPEED = 3; });
  for (let i = 0; i < 40 && !(await p.evaluate(() => NLS.U.modal)); i++) await p.waitForTimeout(500);
  console.log('shoot', await pick(p, 'シュート練習'), await p.evaluate(() => document.getElementById('toast').textContent.slice(0, 80)));
  await shot('gym_shoot');
};
