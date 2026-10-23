import { startTrial } from './lib.mjs';
import fs from 'fs';
// 地図全体の俯瞰(地面の種類・建物・敷地)を PNG で保存し、地区ごとの土地の使われ方を数える
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const m = NLS.G.world.map, T = NLS.T, W = m.W, H = m.H, S = 1;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    const img = c.createImageData(W, H), d = img.data;
    const col = {}; col[T.GRASS] = [120, 190, 100]; col[T.ROAD] = [90, 90, 95]; col[T.CROSSING] = [90, 90, 95]; col[T.WATER] = [70, 130, 200]; col[T.SAND] = [220, 200, 150]; col[T.PLAZA] = [200, 195, 185]; col[T.FOREST] = [60, 120, 60]; col[T.FARM] = [170, 160, 90]; col[T.PADDY] = [150, 190, 120]; col[T.RAIL] = [120, 80, 60]; col[T.PLATFORM] = [150, 120, 90]; col[T.BRIDGE] = [110, 110, 120]; col[T.PATH] = [190, 180, 160];
    const cnt = {};
    for (let k = 0; k < W * H; k++) {
      const g = m.ground[k]; let cc = col[g] || [255, 0, 255];
      if (m.bid[k] >= 0) cc = [235, 120, 90];
      cnt[g] = (cnt[g] || 0) + 1;
      d[k * 4] = cc[0]; d[k * 4 + 1] = cc[1]; d[k * 4 + 2] = cc[2]; d[k * 4 + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    c.strokeStyle = '#ff0'; c.lineWidth = 2;
    for (const s of m.fsites || []) c.strokeRect(s.x, s.y, s.w, s.h);
    c.strokeStyle = '#0ff';
    for (const s of m.sites || []) if (!(m.fsites || []).some(f => f.b === s.main)) c.strokeRect(s.x, s.y, s.w, s.h);
    c.font = '14px sans-serif'; c.fillStyle = '#000';
    for (const z of m.regions || m.zones || []) c.fillText(z.name || '', z.x, z.y);
    const names = Object.fromEntries(Object.entries(T).map(([k, v]) => [v, k]));
    return { W, H, png: cv.toDataURL('image/png'), cnt: Object.fromEntries(Object.entries(cnt).map(([g, n]) => [names[g] || g, n])), regions: (m.regions || m.zones || []).map(z => z.name + '@' + Math.round(z.x) + ',' + Math.round(z.y)) };
  });
  fs.writeFileSync(process.env.OUT + '/map.png', Buffer.from(r.png.split(',')[1], 'base64'));
  delete r.png; console.log('MAP', JSON.stringify(r));
};
