import { startTrial } from './lib.mjs';
import fs from 'fs'; import zlib from 'zlib';
// 試験用のセーブを書き出す(新しい街・試験セッション・1年すすめた状態。架空の人物だけ)。OUT/sample_save.json.gz
export default async (p) => {
  await startTrial(p);
  const s = await p.evaluate(() => { const G = NLS.G; G.skipTo(G.S.M + 12, false); return { json: NLS.nav.toJSON(G.serialize()), y: G.year(), age: G.age(), n: G.world.pop.n }; });
  fs.writeFileSync(process.env.OUT + '/sample_save.json.gz', zlib.gzipSync(s.json));
  console.log('SAVE', s.y, s.age, s.n, s.json.length);
};
