import { startTrial, st } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p); await shot('city');
  console.log(JSON.stringify(await st(p)));
};
