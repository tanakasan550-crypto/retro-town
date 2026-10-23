import { startTrial } from './lib.mjs';
// 屋外の動物園: 獣舎ごとの動物の大きさ(人との比)・柵・地形の画面確認
export default async (p, shot) => {
  await startTrial(p);
  for (const [sp, dy] of [['elephant', 1.5], ['giraffe', 1.5], ['monkey', 1.5], ['flamingo', 1.5]]) {
    await p.evaluate(([sp, dy]) => { const G = NLS.G, s = G.world.map.fsites.find(s => s.type === 'zoo'), r = s.solid.find(r => r.sp === sp); const L = G.S.loc; L.k = 'out'; delete L.b; L.x = r.x + r.w / 2 + 0.5; L.y = r.y + r.h + dy; G.S.min = 11 * 60; NLS.U.cwAt = -999; }, [sp, dy]);
    await p.waitForTimeout(1500); await shot('zoo_' + sp);
  }
  // 日曜の昼: 来園者が屋外の獣舎の前にいる(正門の建物に詰め込まれない)
  const v = await p.evaluate(() => { const G = NLS.G, m = G.world.map, s = m.fsites.find(s => s.type === 'zoo'); const vn = NLS.vis.visitNow; const W = (NLS.R.walkers || []).filter(w => { const vz = vn.get(w.id); return vz && vz.b === s.b && G.S.min >= vz.arrive && G.S.min < vz.leave; }); return { outdoor: W.length, inSite: W.filter(w => w.x >= s.x && w.x < s.x + s.w && w.y >= s.y && w.y < s.y + s.h).length }; });
  console.log('ZOO VISITORS', JSON.stringify(v));
  if (!v.outdoor || v.inSite !== v.outdoor) throw new Error('zoo visitors not on the outdoor paths');
};
