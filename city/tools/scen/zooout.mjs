import { startTrial } from './lib.mjs';
// 屋外の動物園: 獣舎ごとの動物の大きさ(人との比)・柵・地形の画面確認
export default async (p, shot) => {
  await startTrial(p);
  for (const [sp, dy] of [['elephant', 1.5], ['giraffe', 1.5], ['monkey', 1.5], ['flamingo', 1.5]]) {
    await p.evaluate(([sp, dy]) => { const G = NLS.G, s = G.world.map.fsites.find(s => s.type === 'zoo'), r = s.solid.find(r => r.sp === sp); const L = G.S.loc; L.k = 'out'; delete L.b; L.x = r.x + r.w / 2 + 0.5; L.y = r.y + r.h + dy; G.S.min = 11 * 60; NLS.U.cwAt = -999; }, [sp, dy]);
    await p.waitForTimeout(1500); await shot('zoo_' + sp);
  }
};
