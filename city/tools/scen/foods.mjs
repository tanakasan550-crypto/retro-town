import { startTrial } from './lib.mjs';
import fs from 'fs';
// 飲食店の中の作り(fac_food.js): ラーメン店・喫茶店/カフェ・居酒屋・食堂/ファミレス・海鮮食堂のすべてで、
// ①注文できる場所(order)②席(来店客が座る場所)が8席以上で、いちばん混む時間の同時の客の数以上 ③厨房(流し・冷蔵庫)と料理人の立ち位置 ④入口から全部の設備へ歩ける
// ⑤店ごとに作りが違う(同じ形の量産でない)⑥2階建ては階段でつながる
export default async (p, shot) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings;
    const T = ['ramen', 'cafe', 'izakaya', 'restaurant', 'seafood'];
    const fs2 = B.filter(b => T.includes(b.type) && b.campusOf == null && !b.tenants && b.status !== 'closed');
    const work = new Map(); for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.work[i] >= 0) work.set(P.work[i], (work.get(P.work[i]) || 0) + 1);
    const sigs = new Map(), bad = { order: [], seats: [], kitchen: [], reach: [], stairs: [], err: [] }, kinds = {};
    let n = 0, seatSum = 0, peakMax = 0;
    for (const b of fs2) {
      let I0; try { I0 = NLS.nav.interiorOf(G, b.idx, 0).I; } catch (e) { bad.err.push(b.id + ':' + e.message); continue; }
      if (!I0.food) { bad.err.push(b.id + ':notfac'); continue; }
      n++;
      const k = `${b.type}${I0.food.chain ? ':chain' : ''}${I0.food.old ? ':old' : ''}`; kinds[k] = (kinds[k] || 0) + 1;
      const fl = [I0]; for (let lv = 1; lv < I0.floors; lv++) fl.push(NLS.nav.interiorOf(G, b.idx, lv).I);
      const objs = fl.flatMap(I => I.objs), seats = fl.reduce((a, I) => a + (I.seatSpots || []).length, 0);
      seatSum += seats;
      if (!objs.some(o => o.act === 'order')) bad.order.push(b.id);
      const wk = work.get(b.idx) || 0;
      // いちばん混む時間に同時にいる客(capacity.mjs と同じ見積もり: 来店数 × 滞在時間)
      let vis = 0; if (NLS.vis && NLS.vis.visitCount) for (let h = 6; h < 23; h++) vis = Math.max(vis, NLS.vis.visitCount(b, h, true));
      const peak = Math.round(vis * ((window.VISIT_STAY && window.VISIT_STAY[b.type]) || 60) / 60);
      peakMax = Math.max(peakMax, peak);
      if (seats < Math.max(8, peak)) bad.seats.push(`${b.id}:${b.type}${I0.food.chain ? 'C' : ''}${I0.food.old ? 'O' : ''}:W${I0.W}:F${I0.floors}:${seats}<${Math.max(8, peak)}`);
      if (!I0.objs.some(o => o.t === 'sink') || !I0.objs.some(o => o.t === 'fridge') || !I0.staffSpots.some(s => s.role === 'cook')) bad.kitchen.push(b.id);
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
    const shots = [['ramen', pick(b => b.type === 'ramen')], ['kissa', pick((b, I) => b.type === 'cafe' && !I.food.chain)], ['cafe_chain', pick((b, I) => b.type === 'cafe' && I.food.chain)], ['izakaya', pick(b => b.type === 'izakaya')], ['famires', pick((b, I) => b.type === 'restaurant' && I.food.chain)], ['shokudo', pick((b, I) => b.type === 'restaurant' && !I.food.chain)], ['seafood', pick(b => b.type === 'seafood')]].filter(x => x[1] >= 0);
    return { shops: fs2.length, built: n, distinct: sigs.size, maxSame: Math.max(...sigs.values()), kinds, peakMax, seatsAvg: +(seatSum / Math.max(1, n)).toFixed(1), shots, bad: Object.fromEntries(Object.entries(bad).map(([k, v]) => [k, { n: v.length, ex: v.slice(0, 6) }])) };
  });
  console.log('FOODS', JSON.stringify(r));
  for (const [nm, b] of r.shots) {
    await p.evaluate(([b]) => { const G = NLS.G, L = G.S.loc; L.k = 'in'; L.b = b; L.floor = 0; const I = NLS.nav.interiorOf(G, b, 0).I; L.x = (I.W >> 1) + 0.5; L.y = I.H - 2.5; G.S.min = 12 * 60 + 15; }, [b]);
    await p.waitForTimeout(1500); await shot(`food_${nm}`);
  }
  if (process.env.OUT) fs.writeFileSync(process.env.OUT + '/foods.json', JSON.stringify(r, null, 1));
  const B = r.bad;
  if (r.built < r.shops * 0.98 || B.order.n || B.seats.n || B.kitchen.n || B.reach.n || B.stairs.n || B.err.n || r.distinct < r.built * 0.3) throw new Error('food interiors not complete');
};
