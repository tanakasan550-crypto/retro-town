import { startTrial } from './lib.mjs';
// 教室の広さと人数: 在籍する生徒の数から1学年の学級数を決め、1学級35席の教室に座る(立ったままの生徒がいない)。
// いちばん生徒の多い高校・小学校の授業中の階を撮る
export default async (p, shot) => {
  await startTrial(p);
  for (const type of ['hs', 'elem']) {
    const r = await p.evaluate((type) => {
      const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings;
      // 平日の10時(授業中)
      for (let k = 0; k < 7 && [0, 6].includes(G.date().dow); k++) G.S.day = G.S.day % 27 + 1;
      G.S.min = 10 * 60 + 5;
      let best = null, bn = -1;
      for (const b of B) if (b.type === type) { let n = 0; for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.school[i] === b.idx) n++; if (n > bn) { bn = n; best = b; } }
      const L = G.S.loc; L.k = 'in'; L.b = best.idx; L.floor = 1;
      const I = NLS.nav.interiorOf(G, best.idx, 1).I;
      L.x = 6.5; L.y = 2.5;
      const ppl = NLS.C.indoor(best.idx, I, 1).filter(q => q.role === 'student');
      const perCls = {}; for (const q of ppl) perCls[q.cls] = (perCls[q.cls] || 0) + 1;
      const seated = ppl.filter(q => q.seat0).length;
      return { school: best.name, enrolled: bn, W: I.W, H: I.H, rooms: (I.classSeats || []).filter(a => a.length).length, seatsPerRoom: (I.classSeats || [])[0]?.length, students: ppl.length, seated, perCls };
    }, type);
    console.log('CLASS', type, JSON.stringify(r));
    await p.waitForTimeout(2500); await shot(type + '_class');
    if (r.seatsPerRoom !== 35 || r.students && r.seated < r.students || Object.values(r.perCls).some(n => n > 35)) throw new Error('classroom too small for the students');
  }
};
