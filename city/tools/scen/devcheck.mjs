import { startTrial } from './lib.mjs';
// 端末の検証(設定 → 端末の検証)が動くこと: 描画の計測・端末内の保存と読み込みの往復(一致)・検証用の枠を消す・手で確かめる項目。
// これは検証の道具が動くかの試験で、ヘッドレス Chromium の結果を Android 実機の合格とはしない
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(async () => {
    const before = (await (async () => { try { return (await NLS.loadSlot('slot1')) ? 1 : 0; } catch (e) { return -1; } })());
    const c = await NLS.devcheck.runDeviceCheck(NLS.R, NLS.G);
    const after = (await (async () => { try { return (await NLS.loadSlot('slot1')) ? 1 : 0; } catch (e) { return -1; } })());
    return { fps: c.diag.fps, verdict: c.verdict, save: c.save, manual: c.manual.length, text: NLS.devcheck.deviceCheckText(c).split('\n').slice(-12).join(' / '), slot1Same: before === after };
  });
  console.log('DEVCHECK', JSON.stringify(r));
  if (!r.save.ok || !r.save.deleted || r.manual < 6 || !r.slot1Same || !(r.fps > 0)) throw new Error('device check not working');
};
