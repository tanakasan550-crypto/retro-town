import { startTrial } from './lib.mjs';
import fs from 'fs';
// 職場・小さな施設の中の作り(fac_work.js): 診療所・倉庫・物流センター・学習塾・法律事務所・芸能事務所・港湾事務所・農協・ゲームセンターのすべてで、
// ①その施設の操作(診療所は受付と診察・倉庫は机とロッカー・塾は勉強の机・ゲームセンターは遊ぶと両替)②働く人の立ち位置が2か所以上 ③入口・階段から全部の設備・立ち位置へ歩ける
// ④建物ごとに作りが違う ⑤2階建て以上は階段でつながる
export default async (p, shot) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings;
    const T = ['clinic', 'warehouse', 'logistics', 'cram', 'lawfirm', 'agency', 'harboroffice', 'farmcoop', 'gamecenter'];
    const NEED = { clinic: ['clinic', 'checkup'], warehouse: ['work', 'locker'], logistics: ['work', 'locker'], cram: ['study'], lawfirm: ['work'], agency: ['work'], harboroffice: ['work'], farmcoop: ['work'], gamecenter: ['play', 'pay'] };
    const fs2 = B.filter(b => T.includes(b.type) && b.campusOf == null && !b.tenants && !b.voc && b.status !== 'closed');
    const work = new Map(); for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.work[i] >= 0) work.set(P.work[i], (work.get(P.work[i]) || 0) + 1);
    const sigs = new Map(), bad = { order: [], seats: [], kitchen: [], reach: [], stairs: [], err: [] }, kinds = {};
    let n = 0, seatSum = 0, peakMax = 0;
    for (const b of fs2) {
      let I0; try { I0 = NLS.nav.interiorOf(G, b.idx, 0).I; } catch (e) { bad.err.push(b.id + ':' + e.message); continue; }
      if (!I0.work) { bad.err.push(b.id + ':notfac'); continue; }
      n++;
      const k = b.type; kinds[k] = (kinds[k] || 0) + 1;
      const fl = [I0]; for (let lv = 1; lv < I0.floors; lv++) fl.push(NLS.nav.interiorOf(G, b.idx, lv).I);
      const objs = fl.flatMap(I => I.objs), seats = fl.reduce((a, I) => a + (I.seatSpots || []).length, 0);
      seatSum += seats;
      const acts = new Set(objs.map(o => o.act)); for (const a of NEED[b.type]) if (!acts.has(a)) { bad.order.push(b.id + ':' + a); break; }
      const wk = work.get(b.idx) || 0;
      const staffN = fl.reduce((a, I) => a + I.staffSpots.length, 0); if (staffN < 2) bad.seats.push(b.id + ':staff' + staffN);
      
      for (const I of fl) {
        const W = I.W, H = I.H, sol = new Uint8Array(W * H);
        for (const o of I.objs) if (o.solid) for (let yy = o.y; yy < o.y + (o.h || 1); yy++) for (let xx = o.x; xx < o.x + (o.w || 1); xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H) sol[xx + yy * W] = 1;
        for (let x = 0; x < W; x++) sol[x] = 1;
        const seen = new Uint8Array(W * H), q = [];
        const st = I.door && I.door.x >= 0 ? [I.door.x, I.door.y - 1] : I.stairs && I.stairs[0] ? [I.stairs[0].x, I.stairs[0].y] : null;
        if (!st) { bad.reach.push(b.id + ':nostart'); continue; }
        q.push(st[0] + st[1] * W); seen[q[0]] = 1;
        while (q.length) { const k2 = q.pop(), x = k2 % W, y = (k2 / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 1 || nx >= W || ny >= H) continue; const nk = nx + ny * W; if (seen[nk] || sol[nk]) continue; seen[nk] = 1; q.push(nk); } }
        const near = (o) => { for (let yy = o.y - 1; yy <= o.y + (o.h || 1); yy++) for (let xx = o.x - 1; xx <= o.x + (o.w || 1); xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H && seen[xx + yy * W]) return true; return false; };
        const un = I.objs.filter(o => o.act && !near(o));
        const unSeat = (I.seatSpots || []).filter(s => !seen[s.x + s.y * W]);
        const unStaff = (I.staffSpots || []).filter(s => !seen[s.x + s.y * W]);
        if (un.length || unSeat.length || unStaff.length) bad.reach.push(`${b.id}:${I.floor}:${[...un.map(o => o.label || o.t), ...unSeat.map(s => 'seat' + s.x + ',' + s.y), ...unStaff.map(s => (s.role || 'staff') + s.x + ',' + s.y)].slice(0, 3).join('/')}`);
        if (I0.floors > 1 && !(I.stairs || []).length) bad.stairs.push(b.id + ':' + I.floor);
      }
      const sig = fl.map(I => I.objs.filter(o => !o.deco).map(o => o.t + o.x + ',' + o.y).sort().join(';')).join('|');
      sigs.set(sig, (sigs.get(sig) || 0) + 1);
    }
    const pick = (f) => { const b = fs2.find(b => { try { return f(b, NLS.nav.interiorOf(G, b.idx, 0).I); } catch (e) { return false; } }); return b ? b.idx : -1; };
    const shots = T.map(t => [t, pick(b => b.type === t)]).filter(x => x[1] >= 0);
    return { shops: fs2.length, built: n, distinct: sigs.size, maxSame: Math.max(...sigs.values()), kinds, seatsAvg: +(seatSum / Math.max(1, n)).toFixed(1), shots, bad: Object.fromEntries(Object.entries(bad).map(([k, v]) => [k, { n: v.length, ex: v.slice(0, 6) }])) };
  });
  console.log('WORKS', JSON.stringify(r));
  for (const [nm, b] of r.shots) {
    await p.evaluate(([b]) => { const G = NLS.G, L = G.S.loc; L.k = 'in'; L.b = b; L.floor = 0; const I = NLS.nav.interiorOf(G, b, 0).I; L.x = (I.W >> 1) + 0.5; L.y = I.H - 2.5; G.S.min = 10 * 60 + 30; }, [b]);
    await p.waitForTimeout(1500); await shot(`work_${nm}`);
  }
  if (process.env.OUT) fs.writeFileSync(process.env.OUT + '/works.json', JSON.stringify(r, null, 1));
  const B = r.bad;
  if (r.built < r.shops * 0.98 || B.order.n || B.seats.n || B.reach.n || B.stairs.n || B.err.n || r.distinct < r.built * 0.3) throw new Error('workplace interiors not complete');
};
