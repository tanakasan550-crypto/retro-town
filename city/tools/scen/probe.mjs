import { startTrial } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p);
  console.log(await p.evaluate(() => { const G=NLS.G, m=G.world.map, L=G.S.loc; const I=NLS.ui && 0;
    return JSON.stringify({W:m.W,H:m.H,nb:m.buildings.length, home:G.hero.homeB, loc:L, keys:Object.keys(m).slice(0,40), cv:[document.getElementById('cv').width, innerWidth, devicePixelRatio], scale:NLS.U.scale, R:{iso:NLS.R.iso, S:NLS.R.S, ip:NLS.R.ip&&{Z:NLS.R.ip.Z,ox:NLS.R.ip.ox,oy:NLS.R.ip.oy}}}); }));
};
