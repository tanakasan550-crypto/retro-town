import { startTrial, st } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => { const G = NLS.G, b = G.bld(G.hero.homeB), L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; const m = G.world.map; let best = null;
    for (let r = 3; r < 30 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r; dx++) { const x = b.doorX + dx, y = b.doorY + dy; let ok = true; for (let yy = -2; yy <= 2 && ok; yy++) for (let xx = -2; xx <= 2; xx++) if (m.solid[(x + xx) + (y + yy) * m.W]) { ok = false; break; } if (ok) { best = [x, y]; break; } }
    L.x = best[0] + 0.5; L.y = best[1] + 0.5; NLS.U.cwAt = -999; });
  await p.waitForTimeout(800);
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  const sx = 150, sy = 300;
  for (const [dx, dy, label] of [[12, 0, 'small right'], [40, 0, 'full right'], [28, -28, 'diag up-right'], [-6, 30, 'down (slight left)']]) {
    await touch('touchStart', sx, sy); await p.waitForTimeout(50);
    for (let k = 1; k <= 5; k++) { await touch('touchMove', sx + dx * k / 5, sy + dy * k / 5); await p.waitForTimeout(16); }
    const a = await p.evaluate(() => ({ x: NLS.G.S.loc.x, y: NLS.G.S.loc.y, in: { ...NLS.input, keys: 0 } }));
    await p.waitForTimeout(700);
    const b = await p.evaluate(() => ({ x: NLS.G.S.loc.x, y: NLS.G.S.loc.y }));
    await touch('touchEnd');
    await p.waitForTimeout(200);
    await p.evaluate(() => { const L = NLS.G.S.loc; L.x = Math.floor(L.x) + 0.5; });
    // world dir -> screen dir
    const wx = b.x - a.x, wy = b.y - a.y, scx = (wx - wy) / 2, scy = (wx + wy) / 4;
    console.log(label.padEnd(20), 'input', JSON.stringify(a.in), 'moved', Math.hypot(wx, wy).toFixed(2), 'screen angle', (Math.atan2(scy, scx) * 180 / Math.PI).toFixed(0), 'expected', (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(0));
  }
};
