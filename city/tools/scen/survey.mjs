import { startTrial } from './lib.mjs';
import fs from 'fs';
// 地図と建築縮尺の調査: 地面の内訳・空き地・種類別の大きさ・大型施設の周囲の空き地
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, map = G.world.map, W = map.W, H = map.H, B = map.buildings, T0 = {};
    const gname = {}; for (const [k, v] of Object.entries(NLS.T || {})) gname[v] = k;
    const cnt = {}; let occ = 0;
    for (let k = 0; k < W * H; k++) { const g = map.ground[k]; cnt[g] = (cnt[g] || 0) + 1; if (map.bid[k] >= 0) occ++; }
    // 空き地: 建物なし・固形なし・道路/水/線路でない
    const free = new Uint8Array(W * H);
    let nfree = 0;
    for (let k = 0; k < W * H; k++) { const g = map.ground[k]; if (map.bid[k] < 0 && !map.solid[k] && !map.deco[k] && g !== 2 && g !== 3 && g !== 4 && g !== 6) { free[k] = 1; nfree++; } }
    const types = {};
    for (const b of B) { const t = types[b.type] = types[b.type] || { n: 0, area: 0, floors: 0, minA: 1e9, maxA: 0 }; t.n++; t.area += b.w * b.h; t.floors += (b.nf || b.floors || 1); t.minA = Math.min(t.minA, b.w * b.h); t.maxA = Math.max(t.maxA, b.w * b.h); }
    for (const t of Object.values(types)) { t.area = +(t.area / t.n).toFixed(1); t.floors = +(t.floors / t.n).toFixed(1); }
    // 大型施設の周囲(半径60)の空き地タイル数
    const big = ['univ', 'hs', 'jh', 'elem', 'kinder', 'zoo', 'aquarium', 'themepark', 'stadium', 'library', 'cityhall', 'court', 'crematorium', 'fire', 'police', 'lab', 'factory', 'museum', 'airport', 'onsenbath', 'sento', 'hospital', 'cinema', 'gym', 'bowling', 'tourtower'];
    const around = {};
    for (const b of B) { if (!big.includes(b.type)) continue; let f = 0; for (let y = Math.max(0, b.y - 30); y < Math.min(H, b.y + b.h + 30); y++) for (let x = Math.max(0, b.x - 30); x < Math.min(W, b.x + b.w + 30); x++) f += free[x + y * W]; (around[b.type] = around[b.type] || []).push({ id: b.id, name: b.name, x: b.x, y: b.y, w: b.w, h: b.h, free60: f, zone: b.zone }); }
    // 1タイル=2m として面積(m2)
    const zones = {}; for (const b of B) zones[b.zone] = (zones[b.zone] || 0) + 1;
    return { W, H, tiles: W * H, groundCounts: cnt, occupied: occ, free: nfree, types, around, zones, mPerTile: 2, groundNames: gname };
  });
  fs.writeFileSync('/tmp/claude-0/survey.json', JSON.stringify(r, null, 1));
  console.log(JSON.stringify({ W: r.W, H: r.H, occupied: r.occupied, free: r.free, ground: r.groundCounts, groundNames: r.groundNames }));
};
