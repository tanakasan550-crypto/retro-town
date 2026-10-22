import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
export default async (p, shot) => {
  p.on('crash', () => console.log('PAGE CRASH'));
  await startTrial(p);
  await p.evaluate(() => { window.__log = []; setInterval(() => { const L = NLS.G.S.loc, N = NLS.nav.NAV; window.__log.push(`${L.k} b=${L.b} f=${L.floor} ${(+L.x).toFixed(1)},${(+L.y).toFixed(1)} N=${N ? N.after + ':' + (N.path ? N.path.length : '-') + ':' + N.key : 'none'} AW=${NLS.AW.active}`); if (window.__log.length > 40) window.__log.shift(); }, 300); });
  await p.evaluate(() => { globalThis.__NAVSPEED = 3; const G = NLS.G, b = G.bld(G.hero.homeB), L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = b.doorX + 0.5; L.y = b.doorY + 0.6; NLS.U.cwAt = -999; });
  await p.waitForTimeout(1000);
  await p.touchscreen.tap(700, 150); await p.waitForTimeout(400);
  console.log('tap -> AW', await p.evaluate(() => JSON.stringify({ active: NLS.AW.active, goal: NLS.AW.goal && (NLS.AW.goal.label || NLS.AW.goal.kind) })));
  await p.evaluate(() => NLS.AW.cancel && NLS.AW.cancel());
  // move away then home button
  await p.evaluate(() => { const L = NLS.G.S.loc; L.y += 6; NLS.U.cwAt = -999; });
  await p.waitForTimeout(500);
  await p.evaluate(() => NLS.homeBtn());
  await p.waitForTimeout(500);
  console.log('home modal:', (await st(p)).card.replace(/\n/g, ' | ').slice(0, 200));
  await p.evaluate(() => document.querySelector('#card [data-k=walk]')?.click());
  let r = null; for (let i = 0; i < 100; i++) { const q = await Promise.race([p.evaluate(() => { const l = window.__log.splice(0); return l.join('\n') + (NLS.G.S.loc.k === 'in' && NLS.G.S.loc.floor >= 1000 && !NLS.nav.NAV ? '\nDONE' : ''); }), new Promise(rr => setTimeout(() => rr('EVAL TIMEOUT'), 5000))]).catch(e => 'ERR ' + e.message.slice(0, 60)); console.log(q); if (/DONE|TIMEOUT|ERR/.test(q)) { r = /DONE/.test(q); break; } await p.waitForTimeout(600).catch(() => {}); }
  console.log('home unit reached', !!r, JSON.stringify(await st(p)).slice(0, 220), await p.evaluate(() => document.getElementById('toast').textContent + ' / hint ' + document.getElementById('hint').textContent));
  await shot('home11');
};
