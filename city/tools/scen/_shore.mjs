import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  console.log(JSON.stringify(await p.evaluate(() => {
    const m = NLS.G.world.map, T = NLS.T, W = m.W, H = m.H, shore = [];
    for (let x = 0; x < W; x++) { let y = H - 1; while (y > 0 && m.ground[x + (y - 1) * W] === T.WATER) y--; shore.push(y); }
    const prof = []; for (let x = 0; x < W; x += 40) prof.push(x + ':' + Math.min(...shore.slice(x, x + 40)) + '-' + Math.max(...shore.slice(x, x + 40)));
    const coastal = m.buildings.filter(b => ['ferry', 'pier', 'marina', 'harboroffice', 'beachhouse', 'airport', 'market'].includes(b.type)).map(b => b.type + '@' + b.x + ',' + b.y);
    const roadsNearShore = []; for (let x = 0; x < W; x++) { const y = shore[x] - 3; const k = x + y * W; if (m.rmeta.ax[k] & 2) roadsNearShore.push(x); }
    return { prof, coastal, vRoadsAtShore: roadsNearShore.filter((x, i, a) => i === 0 || x - a[i - 1] > 3) };
  })));
};
