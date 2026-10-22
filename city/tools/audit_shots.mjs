// 施設の一括撮影と完成度一覧: node tools/audit_shots.mjs
//   OUT=出力先(既定 /tmp/claude-0/audit) ALL=1 で全施設(既定は「12件以下の種類と駅・地下鉄は全件、それ以外は種類ごとに3件」)
//   LIMIT=n で先頭n施設だけ(試験用)
// 出力: OUT/img/<カテゴリ>/<施設ID>_<名称>_<時刻>_<表示>_<階>.jpg, OUT/audit.csv, OUT/audit.json, OUT/index.html
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
import { startTrial } from './scen/lib.mjs';
const OUT = process.env.OUT || '/tmp/claude-0/audit';
fs.mkdirSync(OUT + '/img', { recursive: true });
const file = 'file://' + path.resolve(process.env.HTML || 'dist/index.html') + '?city=4';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1.4, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(file); await p.waitForTimeout(1500);
await startTrial(p);
await p.evaluate(() => { NLS.audit.begin(); });
await p.waitForTimeout(1500);
await p.addStyleTag({ content: '#auditBar,#toast,#busHud,#guideHud,#navpill{display:none!important}' });
const rows = await p.evaluate(() => NLS.audit.rows());
const byType = {};
for (const r of rows) (byType[r.type] = byType[r.type] || []).push(r);
const pick = new Set();
for (const [t, list] of Object.entries(byType)) {
  if (process.env.ALL || list.length <= 12 || t === 'station' || t === 'metro') list.forEach((r) => pick.add(r.idx));
  else [0, list.length >> 1, list.length - 1].forEach((i) => pick.add(list[i].idx));
}
let todo = rows.filter((r) => pick.has(r.idx));
if (process.env.LIMIT) todo = todo.slice(0, +process.env.LIMIT);
const shots = {}, people = {}, fails = {};
const safe = (s) => s.replace(/[\\/:*?"<>|\s]+/g, '_');
const t0 = Date.now();
let n = 0;
for (const r of todo) {
  shots[r.idx] = [];
  const dir = `${OUT}/img/${r.cat}`; fs.mkdirSync(dir, { recursive: true });
  const rare = byType[r.type].length <= 4;
  const plan = [{ mode: 'ext', hour: 13 }];
  if (rare) plan.push({ mode: 'ext', hour: 20 }, { mode: 'street', hour: 13 });
  if (r.enter) {
    const fl = r.floors;
    const many = r.grade.startsWith('B') || r.grade.startsWith('C+') ? fl.slice(0, 6) : fl.slice(0, 1);
    for (const f of many) plan.push({ mode: 'in', floor: f.floor, hour: 13 });
    if (rare) plan.push({ mode: 'in', floor: fl[0].floor, hour: 8 });
  }
  for (const v of plan) {
    try {
      const res = await p.evaluate(([i, v]) => { const r = NLS.audit.view(i, v); NLS.U.cwAt = -999; return r; }, [r.idx, v]);
      if (res && res.ok === false) { (fails[r.idx] = fails[r.idx] || []).push(res.msg); continue; }
      await p.waitForTimeout(v.mode === 'in' ? 1300 : 900);
      const info = await p.evaluate((i) => ({ name: NLS.audit.shotName(i), ppl: NLS.G.S.loc.k === 'in' ? NLS.U.people.length : (NLS.R.walkers || []).length }), r.idx);
      const f = `${dir}/${safe(info.name)}.jpg`;
      await p.screenshot({ path: f, type: 'jpeg', quality: 70 });
      shots[r.idx].push(path.relative(OUT, f));
      (people[r.idx] = people[r.idx] || []).push(`${v.mode}${v.floor ?? ''}@${v.hour}:${info.ppl}`);
      n++;
    } catch (e) { (fails[r.idx] = fails[r.idx] || []).push(String(e.message).slice(0, 120)); }
  }
  if (n % 50 === 0) console.log(`progress ${n} shots, ${Object.keys(shots).length}/${todo.length} facilities, ${Math.round((Date.now() - t0) / 1000)}s`);
}
await p.evaluate(() => NLS.audit.end());
// 一覧(全施設。撮影していない施設は理由を書く)
const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const axes = Object.keys(rows[0].axes);
const lines = [['施設ID', 'idx', '施設名', '種類', '種類名', 'カテゴリ', '住所', '地区', '階数', '判定', ...axes, '撮影ファイル', '人数(表示:時刻:人数)', '未撮影・失敗の理由', '実行テスト', 'v11検査軸'].map(esc).join(',')];
for (const r of rows) {
  const s = shots[r.idx];
  const reason = s ? (fails[r.idx] || []).join(' / ') : pick.has(r.idx) ? 'LIMIT指定で未撮影' : `同じ種類(${r.label} ${byType[r.type].length}件)の代表3件を撮影。ALL=1で全件撮影可能`;
  lines.push([r.id, r.idx, r.name, r.type, r.label, r.catName, r.addr, r.district, r.floors.length, r.grade, ...axes.map((k) => (r.axes[k].ok === true ? '○ ' : r.axes[k].ok === false ? '× ' : '－ ') + r.axes[k].v), (s || []).join(' '), (people[r.idx] || []).join(' '), reason, r.axes['自動テスト'].ok ? r.axes['自動テスト'].v : '', r.v11].map(esc).join(','));
}
fs.writeFileSync(`${OUT}/audit.csv`, '﻿' + lines.join('\n'));
const summary = { total: rows.length, shotFacilities: Object.values(shots).filter((s) => s.length).length, shots: n, unshot: rows.length - Object.values(shots).filter((s) => s.length).length, failures: Object.keys(fails).length, byGrade: {}, byCat: {}, seconds: Math.round((Date.now() - t0) / 1000), errors: errs.slice(0, 20) };
for (const r of rows) {
  summary.byGrade[r.grade] = (summary.byGrade[r.grade] || 0) + 1;
  const c = summary.byCat[r.catName] = summary.byCat[r.catName] || { total: 0, shot: 0, B: 0, C: 0, D: 0 };
  c.total++; if (shots[r.idx] && shots[r.idx].length) c.shot++; c[r.grade[0]] = (c[r.grade[0]] || 0) + 1;
}
fs.writeFileSync(`${OUT}/audit.json`, JSON.stringify({ summary, rows: rows.map((r) => ({ ...r, shots: shots[r.idx] || [], people: people[r.idx] || [], fails: fails[r.idx] || [] })) }, null, 1));
// 見やすい索引(カテゴリ別・撮影した施設の画像つき)
const cats = [...new Set(rows.map((r) => r.catName))];
let html = `<!doctype html><meta charset="utf-8"><title>施設監査</title><style>body{font-family:sans-serif;margin:12px;background:#f6f4ee}h2{border-bottom:2px solid #c80}table{border-collapse:collapse;font-size:12px}td,th{border:1px solid #ccc;padding:3px;vertical-align:top}img{width:240px}</style><h1>施設監査 ${new Date().toISOString().slice(0, 16)}</h1><p>全${summary.total}施設・撮影${summary.shotFacilities}施設(${summary.shots}枚)・未撮影${summary.unshot}施設(理由は audit.csv)。完成(A)判定はありません: 画面検査とAndroid実機検証が未実施のため。</p><pre>${JSON.stringify(summary.byCat, null, 1)}</pre>`;
for (const c of cats) {
  html += `<h2>${c}</h2><table><tr><th>ID</th><th>名称</th><th>種類</th><th>判定</th><th>画像</th></tr>`;
  for (const r of rows.filter((x) => x.catName === c && shots[x.idx] && shots[x.idx].length)) html += `<tr><td>${r.id}</td><td>${r.name}<br><small>${r.addr}</small></td><td>${r.label}</td><td>${r.grade}<br><small>${Object.entries(r.axes).map(([k, v]) => (v.ok === true ? '○' : v.ok === false ? '×' : '－') + k).join(' ')}</small></td><td>${shots[r.idx].map((f) => `<a href="${f}"><img loading="lazy" src="${f}"></a>`).join('')}</td></tr>`;
  html += '</table>';
}
fs.writeFileSync(`${OUT}/index.html`, html);
console.log('SUMMARY', JSON.stringify(summary));
await browser.close();
