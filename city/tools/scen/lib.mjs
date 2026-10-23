// Shared helpers: start a trial life (free play + MAX money) and wait for the city.
export async function clickText(p, txt) {
  await p.evaluate((t) => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t && b.getClientRects().length); if (!b) throw new Error('no button ' + t); b.click(); }, txt);
}
export async function startTrial(p, opts = {}) {
  if (await p.$('.nls-hot.trial')) { await p.click('.nls-hot.trial', { force: true }); await p.waitForTimeout(400); }
  else for (let i = 0; i < 3; i++) { const has = await p.evaluate(() => [...document.querySelectorAll('#title button')].some(b => b.textContent.trim() === 'はじめる' && b.getClientRects().length)); if (has) break; await clickText(p, 'つぎへ').catch(() => {}); await p.waitForTimeout(300); }
  await p.evaluate((t) => { for (const s of document.querySelectorAll('#title select')) for (const o of s.options) if (o.textContent.startsWith(t)) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); } }, opts.scenario || '喧嘩番長人生');
  await p.waitForTimeout(200);
  await clickText(p, '開発試験').catch(() => {}); await p.waitForTimeout(200);
  await clickText(p, '試験用MAX資金').catch(() => {}); await clickText(p, '自由試遊(開発用)').catch(() => {});
  await clickText(p, 'はじめる');
  await p.waitForFunction(() => window.NLS && window.NLS.G, null, { timeout: 150000 });
  await p.waitForTimeout(1500);
  // dismiss any modal prompts
  for (let i = 0; i < 6; i++) {
    const on = await p.evaluate(() => document.getElementById('modal').classList.contains('on'));
    if (!on) break;
    await p.evaluate(() => { const b = document.querySelector('#card .row .btn, #card .btn'); b && b.click(); });
    await p.waitForTimeout(500);
  }
}
export const st = (p) => p.evaluate(() => { const L = NLS.G.S.loc; return { k: L.k, x: +L.x.toFixed?.(2) ?? L.x, y: L.y, f: L.f, b: L.b, floor: L.floor, modal: NLS.U.modal, card: document.getElementById('card').innerText.slice(0, 300) }; });
