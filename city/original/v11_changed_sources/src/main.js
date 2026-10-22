import { pedPos } from './pedsignal.js'; import { bathPrep } from './actions.js';
import { FAMILY_ENVS, PATHS, runLifeStart } from './lifestart.js';
const recommendedPathFor = env => (env === 'rich' || env === 'comfortable') ? 'univ' : env === 'modest' ? 'work' : 'univ';
import { staffInfo, chauffeurAvail } from './estatelife.js'; import { activityOf } from './lifestart.js';
import { hash2 } from './rng.js';
// ブラウザ起点: タイトル/新規作成・メインループ・操作・各種ダイアログ。
import { Game, LIFE_MONTHS } from './game.js';
import { floorChoices, chooseFloor, LIFT_CAP } from './lift.js';
import { bigKind, levelLabel } from './interior_big.js';
import { isUnitFloor, decodeUnit, roomNo } from './units.js';
import { Crowd, animIndoor } from './crowd.js'; import { realtyModal } from './realtyui.js'; import { firmModal } from './firmui.js';
import { Renderer, loadAssets } from './render.js';
import { screenToWorldDir, worldDirToFacing } from './iso.js'; import { AutoWalk, resolveTap } from './autowalk.js'; import { initStreet, setYawFromFacing, facingOfYaw } from './streetview.js';
import { moveHero, targetsFor, tryEnter, exitBuilding, interiorOf, clearInteriorCache } from './motion.js';
import { targetActions, runAction, housingList, moveTo, planTrip, rideTo, hoursOf, isOpenFor } from './actions.js';
import { findPath, describeRoute, buildingMatches, nearestOfType, MODE } from './nav.js';
import { JOBS, BTYPES, WORLD_EVENTS, QUALS, CAREERS } from './data.js';
import { nextDeparture } from './transit.js';
import { NEED, ageYears } from './world.js';
import { buildEnding } from './ending.js'; import { PLAN } from './plan_targets.js';
import { isSchoolBig, floorLabel } from './interior_school.js'; import { saveSlot, loadSlot, listSlots, toJSON, fromJSON, verifySlot } from './save.js'; import { makeAutosaver } from './autosave.js';
import { Rng } from './rng.js';
import { startRide } from './ride.js';
import { MODE as JM, offers as jOffers, buyTicket, refund, boardInfo, board as jBoard, arrive as jArrive, awayInfo, stayAway, goHome, finishReturn, departures, hm as jhm, REASON as JREASON, shuttleTarget } from './journey.js';
import { profileView, histText, rankName } from './career.js';
import { placeLine } from './where.js'; import { drinkGoods, drinkList, drunkLeft } from './shop.js'; import { SEX_TYPES, sexLabel, sexOf, UNSUPPORTED } from './identity.js'; import { guidesOn, setGuides } from './guides.js'; import { sceneInto } from './scenes.js'; import { SEAT_T, beginSit, stepAct, placeSitters, seatStudents } from './activity.js'; import { freePlayOn, setFreePlay } from './minor.js'; import { HAIR_OPTS, hairFits, LOOK_TYPES, CALL_TYPES, lookOf, HD, previewInto } from './setupui.js'; import { relName } from './lives.js'; import { devToolsEnabled } from './buildflags.js'; import { isTestMode, testMoneyOn, testMoneyOff, TEST_MAX } from './devmode.js'; import { parentsOf, householdAtBirth } from './parents.js';
import { floorList } from './devsession.js'; import { devPanel } from './devui.js'; import { isTestSession, isTestState, testBypass } from './devmode.js';
import { taxiQuote, taxiRide, taxiTripBegin, taxiTripTick, taxiTripActive } from './taxi.js'; import { biz, monthlyReport, adjust } from './business.js'; import { SCENARIOS, applyScenario, scenarioInfo } from './scenario.js'; import { carsPanelHtml, bindCarsPanel, fuelModal, dealerModal, usedModal } from './carui.js'; import { VEHICLES, getVeh, setRide } from './vehicle.js'; import { buyQuote, buyHome, sellValue, getInvest, setMonthly, withdrawInvest, INVEST_STEPS, investValue } from './finance.js'; import { busQuote, busRide, nearestStop, BUS_REACH } from './bus.js';
import { vocModal } from './vocui.js'; import { sfx } from './audio.js'; import { soundState } from './soundstate.js'; import { shopModal } from './shopui.js'; import { fittingModal, closetModal } from './clothing.js'; import { hairModal } from './hairui.js'; import { runDiag, diagText } from './diag.js'; import { leavePump } from './cars.js'; import { COMPANIES, priceOf, changeOf, getStocks, holdingsValue, buyStock, sellStock } from './stocks.js'; import { spiritLines, spiritSvg } from './spirit.js'; import { initLang, setLang, getLang, nextLang, LANGS } from './i18n.js';

const $ = id => document.getElementById(id); const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const WD = ['日', '月', '火', '水', '木', '金', '土'];
let G = null, R = null, C = null, A = null; const cv = $('cv');
const AW = new AutoWalk(); const U = { modal: false, dest: null, route: null, routeMode: 0, scale: 1, clockFrac: 0, last: 0, walkers: [], people: [], cwAt: -1, cwMin: 0, toastT: 0, autosaveM: -1, big: false, hintTxt: '', walkRefresh: 0, started: false, fast: null };
const input = { x: 0, y: 0, run: false, keys: new Set() };

// ---------------- 汎用UI
function showModal(html, wire) { const m = $('modal'), c = $('card'); c.innerHTML = html; m.classList.add('on'); U.modal = true; if (wire) wire(c); c.scrollTop = 0; }
function closeModal() { $('modal').classList.remove('on'); U.modal = false; $('card').innerHTML = ''; }
function toast(t, ms = 2600) { const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(U.toastT); U.toastT = setTimeout(() => el.classList.remove('on'), ms); }
function btn(label, cls = '') { return `<button class="btn ${cls}">${label}</button>`; }
function fade(on) { $('fade').classList.toggle('on', on); }
const yen = n => '¥' + Math.round(n).toLocaleString('ja-JP');
const dstr = (y, m0, d) => `${y}年${m0 + 1}月${d}日`;
function fmtM(M) { return `${1900 + Math.floor(M / 12)}年${M % 12 + 1}月`; }

// ---------------- タイトル
async function boot() {
  initLang();
  $('title').innerHTML = '<div class="brand">NAGAYAMA ☆LAB</div><h1>人生物語｜日本モデル都市</h1><div class="small">読み込み中…</div>';
  window.addEventListener('error', ev => { if (!A) { const sm = $('title').querySelector('.small'); if (sm) sm.textContent = 'エラー: ' + (ev.message || ev.type); } });
  window.addEventListener('unhandledrejection', ev => { if (!A) { const sm = $('title').querySelector('.small'); if (sm) sm.textContent = 'エラー: ' + (ev.reason && ev.reason.message || ev.reason); } });
  try { A = await loadAssets('assets/'); } catch (e) { $('title').innerHTML = `<h1>読み込みエラー</h1><div class="tx">${esc(e.message)}</div>`; return; }
  registerSW(); showTitle();
}
function registerSW() { if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { }); }
const HAIRC = ['#282228', '#704a2e', '#96643e', '#e2be62', '#b24834', '#2c3864', '#e88eac', '#b0b0b8'], SKINC = ['#ffe0c4', '#f4cda8', '#d6a87c', '#a87856'], CLC = ['#dc4646', '#4682dc', '#5ab464', '#f0be3c', '#aa64c8', '#f08232', '#46bec8', '#e66ea0', '#78787f', '#fafafa', '#3c3c5a', '#a06e46', '#64a03c', '#c83c78', '#285a46', '#bebe78'];
async function showTitle() {
  const slots = await (listSlots().catch(() => []));   // 保存先の確認は save.js 側で2.5秒の打ち切りあり
  const cityQ = new URLSearchParams(location.search).get('city'); const cityDef = cityQ === '3' || cityQ === '4' ? +cityQ : (navigator.webdriver ? 3 : 4);   // 新規の人生の街: 4=新都市v2(約30倍) 3=従来の小さな街(自動テストは既定で従来)
  const form = { city: cityDef, scn: 'normal', sur: '', given: '', year: 1990, lt: 'f', call: 'u', sex: 'u', hair: '', hc: 0, sk: 1, c1: 1, c2: 10, needs: 0, seed: 20261020, sprite: '', funds: 'normal', fp: 0, step: 0, age: 25, dir: 'd', lifeAge: 0, env: 'auto', path: '', mode: 'normal' };
  const t = $('title'); t.style.display = 'flex';
  const dev = devToolsEnabled();
  const fld = () => { const g = id => $(id); if (g('fSur')) form.sur = g('fSur').value.trim(); if (g('fGiven')) form.given = g('fGiven').value.trim(); if (g('fYear')) form.year = +g('fYear').value; if (g('fNeeds')) form.needs = +g('fNeeds').value; if (g('fSeed')) form.seed = g('fSeed').value; if (g('fCity')) form.city = +g('fCity').value; if (g('fScn')) form.scn = g('fScn').value; };
  const heroName = () => form.given ? (form.sur ? form.sur + ' ' + form.given : form.given) : '';
  const STEPS = ['なまえ・生まれ', '見た目', 'はじまり・確認'];
  const draw = () => {
    const sw = (k, arr) => arr.map((c, i) => `<span class="sw ${form[k] === i ? 'sel' : ''}" data-k="${k}" data-v="${i}" style="background:${c}"></span>`).join('');
    const st = form.step; let body = '';
    if (st === 0) body = `
      <div class="formrow">名字 <input id="fSur" maxlength="6" style="width:90px" placeholder="例:田中" value="${esc(form.sur)}"> 名前 <input id="fGiven" maxlength="8" style="width:110px" placeholder="例:太郎" value="${esc(form.given)}"></div>
      <div class="small">空欄なら名前は自動。名字は入力どおりに家族(父・母・きょうだい)へそろえます。${form.sur && !form.given ? '<b style="color:#fc6">名前も入力してください</b>' : ''}</div>
      <div class="small" style="margin-top:4px">性別(見た目・髪型・服装・呼ばれ方とは別に選べます)</div>
      <div class="chips" id="sexChips">${SEX_TYPES.map(o => `<button class="chip ${form.sex === o.k ? 'sel' : ''}" data-k="sex" data-s="${o.k}" title="${esc(o.d)}">${o.n}</button>`).join('')}</div>
      <div class="small">${esc(SEX_TYPES.find(o => o.k === form.sex).d)}。${form.sex === 'o' || form.sex === 'u' ? '「その他」「未設定」は男・女のどちらかに固定せず扱います。' : ''}</div>
      <details class="small"><summary>性別設定で未対応の部分</summary>${UNSUPPORTED.map(u => '・' + esc(u)).join('<br>')}</details>
      <div class="formrow">生まれる年 <select id="fYear">${[1946, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2026].map(y => `<option ${y === form.year ? 'selected' : ''}>${y}</option>`).join('')}</select> <span class="small">街・家・乗り物もその年代から始まります(2026年より先は創作)</span></div>
      <div class="formrow">街 <select id="fCity"><option value="4" ${form.city === 4 ? 'selected' : ''}>新都市v2(約30倍・大都会から田舎まで)</option><option value="3" ${form.city === 3 ? 'selected' : ''}>従来の小さな街(軽量)</option></select></div>
      <div class="small">新都市は広い分、最初の準備に数秒かかります。端末が重いときは従来の街を選べます。</div>
      <div class="formrow">街のシード <input id="fSeed" style="width:120px" value="${form.seed}"> <span class="small">同じ数字なら同じ街・同じ家庭で生まれます</span></div>
      <div class="formrow">配慮(任意) <select id="fNeeds"><option value="0">なし</option><option value="1" ${form.needs === 1 ? 'selected' : ''}>車いすで暮らす</option><option value="2" ${form.needs === 2 ? 'selected' : ''}>白杖で歩く</option><option value="4" ${form.needs === 4 ? 'selected' : ''}>聴こえにくい(補聴)</option><option value="8" ${form.needs === 8 ? 'selected' : ''}>特別支援学校で学ぶ</option></select></div>
      <div class="small">配慮は、生活で使う道具や通う学校・街の使いやすさが変わる設定です。物語上の優劣はありません。</div>`;
    if (st === 1) body = `
      <div class="small">見た目のタイプ(基本の顔つき・体つき・制服の寄せ方)</div>
      <div class="chips">${LOOK_TYPES.map(o => `<button class="chip ${form.lt === o.k ? 'sel' : ''}" data-k="lt" data-s="${o.k}" title="${esc(o.d)}">${o.n}</button>`).join('')}</div>
      <div class="small">${esc(LOOK_TYPES.find(o => o.k === form.lt).d)}</div>
      <div class="small" style="margin-top:4px">呼ばれ方(性自認・呼称の方針。見た目とは別に選べます)</div>
      <div class="chips">${CALL_TYPES.map(o => `<button class="chip ${form.call === o.k ? 'sel' : ''}" data-k="call" data-s="${o.k}">${o.n}</button>`).join('')}</div>
      <div class="small">${esc(CALL_TYPES.find(o => o.k === form.call).d)}。数値や能力には影響しません。</div>
      <div class="small" style="margin-top:4px">髪型(タップで見本を確認。選ばなければおまかせ)</div>
      <div class="hairgrid">${HAIR_OPTS.filter(o => hairFits(o, form.lt === 'a' ? 'f' : form.lt) || form.lt === 'a').map(o => `<button class="hair ${form.hair === o.key ? 'sel' : ''}" data-hair="${o.key}"><canvas width="96" height="84" data-hv="${o.key}"></canvas><span>${o.n}</span></button>`).join('')}</div>
      <div class="small">${esc((HAIR_OPTS.find(o => o.key === form.hair) || HAIR_OPTS[0]).d)}</div>
      <div class="formrow">かみ色 ${sw('hc', HAIRC)}</div>
      <div class="formrow">はだ色 ${sw('sk', SKINC)}</div>
      <div class="small">ふだん着の色は、年齢・季節・時代に合わせて自動で変わります。顔立ちは生まれたあとの家族(両親)から決まります。</div>`;
    if (st === 2) body = `
      <div class="small"><b>人生のはじまり</b>(開始年齢 → 家庭環境 → 進路 → モード)</div>
      <div class="formrow">開始年齢 ${[[0, '0歳(赤ちゃんから)'], [18, '18歳(進路を選んで始める)']].map(([a, n]) => `<button class="chip ${form.lifeAge === a ? 'sel' : ''}" data-k="lifeAge" data-s="${a}">${n}</button>`).join('')}</div>
      <div class="small" style="margin-top:2px">家庭環境(どんな家に生まれるか。自分の人生は自分の行動で決まります)</div>
      <div class="chips">${Object.entries(FAMILY_ENVS).map(([k, v]) => `<button class="chip ${form.env === k ? 'sel' : ''}" data-k="env" data-s="${k}">${k === 'rich' ? '超大富豪' : v.name}</button>`).join('')}</div>
      <div class="small">${esc(FAMILY_ENVS[form.env].desc)}</div>
      ${form.lifeAge === 18 ? `<div class="small" style="margin-top:4px">18歳の進路(誕生日・学校年度に合わせて始まり方が決まります。あとから変えることもできます)</div>
      <div class="chips">${Object.entries(PATHS).map(([k, v]) => `<button class="chip ${(form.path || recommendedPathFor(form.env)) === k ? 'sel' : ''}" data-k="path" data-s="${k}">${v.name}${k === recommendedPathFor(form.env) ? ' ★おすすめ' : ''}</button>`).join('')}</div>
      <div class="small">${esc(PATHS[form.path || recommendedPathFor(form.env)].desc)}</div>` : ''}
      ${dev ? `<div class="formrow">モード <button class="chip ${form.mode === 'normal' ? 'sel' : ''}" data-k="mode" data-s="normal">通常プレイ</button><button class="chip ${form.mode === 'dev' ? 'sel' : ''}" data-k="mode" data-s="dev">開発試験</button></div>
      <div class="small">${form.mode === 'dev' ? '開発試験: 下の試験用の設定(資金・年齢制限)を画面操作だけで変えられます。通常プレイのセーブには混ざりません。' : '通常プレイ: 年齢・営業時間・交通・お金・進学就職のルールがすべて通常どおり働きます。'}</div>` : ''}
      ${form.lifeAge === 0 ? `<div class="formrow">挑戦シナリオ <select id="fScn">${Object.entries(SCENARIOS).map(([k, v]) => `<option value="${k}" ${form.scn === k ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></div>
      <div class="small">${form.scn === 'normal' ? '0歳(赤ちゃん)から、家族のもとで人生を始めます。' : '途中の年齢から始まる挑戦シナリオ。それまでの人生は自動で進み、家族・友だち・思い出は引き継がれます。'}</div>` : ''}
      ${dev && form.mode === 'dev' ? `<div class="formrow">資金 <button class="chip ${form.funds === 'normal' ? 'sel' : ''}" data-k="funds" data-s="normal">通常資金</button><button class="chip ${form.funds === 'max' ? 'sel' : ''}" data-k="funds" data-s="max">試験用MAX資金</button></div>
      <div class="formrow">年齢制限 <button class="chip ${!form.fp ? 'sel' : ''}" data-k="fp" data-s="0">通常(年齢相応)</button><button class="chip ${form.fp ? 'sel' : ''}" data-k="fp" data-s="1">自由試遊(開発用)</button></div>
      <div class="small">自由試遊: 幼児でも街を歩き、全施設に入れます(試験専用。通常プレイとは別)。</div>
      <div class="small">${form.funds === 'max' ? '試験用: 買い物・車・住宅・施設を資金を気にせず試せます。通常の所持金・借入は退避され、設定からOFFにすると元に戻ります。画面に【MAX資金】と表示されます。' : '通常: 家庭の事情に応じた所持金で始まります(0歳は保護者が管理)。設定からあとでMAX資金に切り替えられます。'}</div>` : ''}
      <div class="card" style="background:#10224a;margin-top:6px"><b>この設定で始めます</b><br>名前: ${esc(heroName() || '(自動)')}<br>生まれる年: ${form.year}年(シード ${esc(String(form.seed))})<br>見た目: ${esc(LOOK_TYPES.find(o => o.k === form.lt).n)} / 髪型: ${esc((HAIR_OPTS.find(o => o.key === form.hair) || HAIR_OPTS[0]).n)}<br>性別: ${esc(sexLabel(form.sex))}<br>呼ばれ方: ${esc(CALL_TYPES.find(o => o.k === form.call).n)}<br>はじまり: ${form.lifeAge === 18 ? '18歳から(' + esc(PATHS[form.path || recommendedPathFor(form.env)].name) + ')' : esc(SCENARIOS[form.scn].name)}<br>家庭環境: ${form.env === 'rich' ? '超大富豪' : esc(FAMILY_ENVS[form.env].name)}<br>モード: ${dev && form.mode === 'dev' ? '開発試験' : '通常プレイ'}${form.needs ? '<br>配慮あり' : ''}${dev && form.mode === 'dev' ? '<br>資金: ' + (form.funds === 'max' ? '試験用MAX' : '通常') + ' / 年齢制限: ' + (form.fp ? '自由試遊' : '通常') : ''}</div>`;
    t.innerHTML = `<div class="brand">NAGAYAMA ☆LAB</div><h1 style="margin:2px 0">人生物語｜日本モデル都市</h1>
    <div class="card setup" style="max-width:560px;width:100%;background:#0d1b3ccc;padding:8px 10px">
      <div class="steps">${STEPS.map((n, i) => `<span class="${i === st ? 'on' : ''}" data-step="${i}">${i + 1}. ${n}</span>`).join('')}</div>
      <div class="setuprow"><div class="pvbox"><canvas id="pvBig" width="192" height="240"></canvas>
        <div class="chips tiny">${[0, 6, 15, 30, 70].map(a => `<button class="chip ${form.age === a ? 'sel' : ''}" data-age="${a}">${a}歳</button>`).join('')}</div>
        <div class="chips tiny">${[['d', '前'], ['r', '右'], ['u', '後'], ['l', '左']].map(([d, n]) => `<button class="chip ${form.dir === d ? 'sel' : ''}" data-dir="${d}">${n}</button>`).join('')}</div></div>
        <div class="setupbody">${body}</div></div>
      <div class="row" style="justify-content:center;margin-top:6px">${st > 0 ? btn('もどる', 'sec') : ''}${st < 2 ? btn('つぎへ', 'acc') : btn('はじめる', 'acc')}${st === 0 ? btn('はじめから(かんたん開始)', 'sec') : ''}</div>
      <div class="row" style="justify-content:center">${slots.length ? btn('つづきから', 'sec') : ''}${btn('ファイルから読み込む', 'sec')}</div>
      <div class="small">※価格・賃金・人口統計などは、すべてゲーム用の仮パラメータです。</div>
    </div>`;
    const paint = () => { const pv = $('pvBig'); if (pv) previewInto(pv, form, form.age, form.dir, 3); t.querySelectorAll('canvas[data-hv]').forEach(c => { const f2 = { ...form, hair: c.dataset.hv }; previewInto(c, f2, 20, 'd', 1, true); }); };
    paint();
    const rd = () => { fld(); };
    t.querySelectorAll('.sw').forEach(s => s.onclick = () => { rd(); form[s.dataset.k] = +s.dataset.v; draw(); });
    t.querySelectorAll('[data-s]').forEach(s => s.onclick = () => { rd(); form[s.dataset.k] = s.dataset.k === 'fp' || s.dataset.k === 'lifeAge' ? +s.dataset.s : s.dataset.s; if (s.dataset.k === 'env') form.path = ''; if (s.dataset.k === 'lt' && form.hair && !hairFits(HAIR_OPTS.find(o => o.key === form.hair), s.dataset.s === 'a' ? 'f' : s.dataset.s) && s.dataset.s !== 'a') form.hair = ''; draw(); });
    t.querySelectorAll('[data-hair]').forEach(s => s.onclick = () => { rd(); form.hair = s.dataset.hair; draw(); });
    t.querySelectorAll('[data-age]').forEach(s => s.onclick = () => { rd(); form.age = +s.dataset.age; paint(); t.querySelectorAll('[data-age]').forEach(x => x.classList.toggle('sel', x === s)); });
    t.querySelectorAll('[data-dir]').forEach(s => s.onclick = () => { rd(); form.dir = s.dataset.dir; paint(); t.querySelectorAll('[data-dir]').forEach(x => x.classList.toggle('sel', x === s)); });
    t.querySelectorAll('[data-step]').forEach(s => s.onclick = () => { rd(); form.step = +s.dataset.step; draw(); });
    const bs = [...t.querySelectorAll('button.btn')]; const by = n => bs.find(b => b.textContent.trim() === n);
    if (by('もどる')) by('もどる').onclick = () => { rd(); form.step--; draw(); };
    if (by('つぎへ')) by('つぎへ').onclick = () => { rd(); form.step++; draw(); };
    const go = () => {
      rd(); const seed = parseInt(form.seed, 10) || 20261020; const name = heroName(); t.style.display = 'none'; const look = lookOf({ ...form, seed });
      const mk0 = () => Game.create({ seed, ver: form.city, startYear: form.year, name: name || undefined, look, needs: form.needs, sprite: form.sprite || undefined, family: form.env !== 'auto' ? form.env : undefined });
      const mk = (g0) => { const g = g0 || mk0(); g.hero.ident = { look: form.lt, call: form.call, sex: form.sex }; const hd = HD(form); if (hd) g.hero.hairdo = hd; g.log('family', `呼ばれ方の設定: ${CALL_TYPES.find(o => o.k === form.call).n}・性別: ${sexLabel(form.sex)}`); applyScenario(g, form.scn); if (dev && form.mode === 'dev' && form.funds === 'max') testMoneyOn(g); if (dev && form.mode === 'dev' && form.fp) setFreePlay(g, true); return g; };
      if (form.lifeAge === 18) form.scn = 'normal';
      const isDev = dev && form.mode === 'dev';
      if (form.lifeAge === 18) {   // 共通の人生開始: 都市生成 → 家庭生成 → 18歳までの人生 → 進路 → 自宅の準備(実際の処理に合わせた進捗)
        t.style.display = 'flex'; const path = form.path || recommendedPathFor(form.env); const envName = form.env === 'rich' ? '超大富豪' : FAMILY_ENVS[form.env].name;
        t.innerHTML = `<div class="brand">NAGAYAMA ☆LAB</div><h1 style="margin:2px 0">新しい人生</h1><div class="card" style="max-width:520px;width:100%;background:#0d1b3ccc;padding:12px;display:block"><div class="small">18歳・${esc(envName)}・${esc(PATHS[path].name)}・${isDev ? '開発試験' : '通常プレイ'}</div><div id="lsLabel" style="margin:8px 0;font-size:16px">街を作っています…</div><div style="height:14px;background:#1b2b55;border-radius:7px;overflow:hidden"><div id="lsBar" style="height:100%;width:2%;background:linear-gradient(90deg,#4aa3ff,#7fe0a8);transition:width .25s"></div></div><div id="lsPct" class="small" style="margin-top:4px">0%</div></div>`;
        const upd = (label, pct) => { const a = $('lsLabel'), b = $('lsBar'), c = $('lsPct'); if (a) a.textContent = label; if (b) b.style.width = Math.max(2, pct) + '%'; if (c) c.textContent = Math.round(pct) + '%'; };
        setTimeout(async () => { try { upd('街と家庭を生成しています(数秒かかります)…', 3); await new Promise(r => setTimeout(r, 40)); const g = mk0(); upd('街と家庭を生成しました', 12); await new Promise(r => setTimeout(r, 20)); await runLifeStart(g, { age: 18, env: form.env, path }, p => upd(p.label, 12 + p.pct * 0.86)); upd('人生を始めます', 100); const g2 = mk(g); t.style.display = 'none'; start(g2); } catch (e) { t.style.display = 'flex'; toast('開始に失敗しました: ' + (e && e.message || e), 6000); draw(); } }, 30);
        return;
      }
      if (form.scn === 'normal') start(mk()); else { toast('人生の下ごしらえ中…(数秒かかります)', 6000); setTimeout(() => start(mk()), 60); }
    };
    if (by('はじめる')) by('はじめる').onclick = go; if (by('はじめから(かんたん開始)')) by('はじめから(かんたん開始)').onclick = go;
    if (by('つづきから')) by('つづきから').onclick = () => slotMenu(slots);
    const fb = by('ファイルから読み込む'); if (fb) fb.onclick = () => { const f = document.createElement('input'); f.type = 'file'; f.accept = '.json,.nlsave'; f.onchange = async () => { try { const txt = await f.files[0].text(); const d = fromJSON(txt); t.style.display = 'none'; start(Game.load(d), true); } catch (e) { t.style.display = 'flex'; toast('読み込めませんでした: ' + e.message); } }; f.click(); };
  };
  draw();
}
function slotMenu(slots) {
  showModal(`<h2>セーブデータ</h2><div class="list">${slots.map(s => `<button class="btn item" data-id="${esc(s.id)}">${esc(s.id === 'auto' ? 'オートセーブ' : 'スロット ' + s.id)} — ${esc(s.meta.name || '')} ${esc(s.meta.label || '')} <span class="small">${new Date(s.meta.ts).toLocaleString('ja-JP')}</span></button>`).join('')}</div><div class="row">${btn('もどる', 'sec')}</div>`, c => {
    c.querySelectorAll('button.item').forEach(b => b.onclick = async () => { const r = await loadSlot(b.dataset.id); if (r) { closeModal(); $('title').style.display = 'none'; start(Game.load(r.data), true); } });
    c.querySelector('.row .btn').onclick = closeModal;
  });
}
function start(g, loaded) {
  G = g; C = new Crowd(G); R = new Renderer(cv, A, G, C); try { R.zl = +localStorage.getItem('nls_zoom') || 0; const iz = localStorage.getItem('nls_izoom'); R.izl = iz == null ? 1 : +iz || 0; } catch (_) { } R.resize(); if (G.hero.sprite === 'w01') R.special = { look: G.world.pop.look[G.hero.id] >>> 0 }; U.started = true; U.dest = null; U.route = null; U.walkers = []; U.people = []; clearInteriorCache(); window.NLS = { G, R, C, U, AW, CTL, handleTap, homeBtn, ctlModal, tryEnter, runAction, moveHero, input, step, setStreet, ui: { jTicketModal, jBoardModal, jInfoModal, jShuttle, jAwayPanel, rideScreen, startRide, RD, rideAction, pressA, mapModal, railModal, jobsModal, housingModal, financeModal, stockModal, bizModal, skipModal, planModal, peopleModal, itemsModal, diaryModal, cfgModal, timetableModal, devOpen: () => devPanel(devCtx()) } };
  if (!loaded && !(G.S.life && G.S.life.env)) { toast('生まれました。2歳までは、家族のもとで過ごします。'); }
  U.last = performance.now(); requestAnimationFrame(frame); updateHud(true); if (G.blocked()) openPrompt(); else if (!G.canWalk()) babyPanel(); else if (awayInfo(G)) jAwayPanel();
  if (!loaded) setTimeout(() => { try { openingTour(); } catch (e) { console.error('openingTour', e && e.message); } }, 400);
}
// 超大富豪の開始演出: 正門 → 庭園・車寄せ → 車庫 → 執事の出迎え → 玄関ホール → 自分の部屋 → 自由行動(演出のあとすぐ操作できる)
function openingTour() {
  const g = G; if (!g.S.life || g.S.life.env !== 'rich' || g.S.tourDone) return; const b = g.bld(g.hero.homeB); if (!b || b.estate !== 2) return; const E = g.world.map.estates.find(e => b.x >= e.x0 && b.x <= e.x0 + e.w && b.y >= e.y0 && b.y <= e.y0 + e.h); if (!E) return;
  g.S.tourDone = 1; const end = { k: 'in', b: b.idx, floor: 1, x: 6.5, y: 4.5, f: 'd' };
  const steps = [['豪華な正門', { k: 'out', x: E.gate.x + 0.5, y: E.gate.y - 1.5, f: 'u' }], ['広大な庭園と噴水の車寄せ', { k: 'out', x: E.ring.cx + 0.5, y: E.ring.cy + 8, f: 'u' }], ['ずらりと並ぶ高級車', { k: 'out', x: E.garage.x + 4.5, y: E.garage.y + E.garage.h + 2, f: 'u' }], ['執事の出迎え', { k: 'in', b: b.idx, floor: 0, x: 24.5, y: 25.5, f: 'u' }], ['巨大な玄関ホールとシャンデリア', { k: 'in', b: b.idx, floor: 0, x: 24.5, y: 12.5, f: 'u' }], ['あなたの部屋', end]];
  const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:12vh;background:linear-gradient(transparent 55%,rgba(5,10,30,.75));color:#fff;font-weight:700;text-shadow:0 2px 6px #000'; ov.innerHTML = '<div id="tourCap" style="font-size:22px;letter-spacing:.08em"></div><div style="margin-top:6px;font-size:13px;opacity:.85">タップでスキップ</div>'; document.body.appendChild(ov);
  let i = 0, done = false; const fin = () => { if (done) return; done = true; ov.remove(); g.S.loc = { ...end }; U.cwAt = -999; updateHud(true); toast('あなたは18歳。広大な邸宅での、新しい人生が始まります。', 5200); };
  ov.onclick = fin; const next = () => { if (done) return; if (i >= steps.length) return fin(); const [cap, loc] = steps[i++]; console.log('tour', cap); ov.querySelector('#tourCap').textContent = cap; g.S.loc = { ...loc }; U.cwAt = -999; updateHud(true); setTimeout(next, 1900); }; next();
}
window.addEventListener('resize', () => { if (R) R.resize(); });

// ---------------- メインループ
// 画質の自動調整(実機向け): 実測のフレーム間隔が長い状態が続いたら描画解像度を段階的に下げ、余裕が続けば戻す。自動テスト(webdriver)では無効。
const AQ = { ema: 16, slow: 0, fast: 0, on: !(navigator.webdriver || globalThis.NOAUTOQ) };
function autoQuality(dtMs) {
  if (!AQ.on || !R || document.hidden || U.modal) return; if (dtMs > 500) return;
  AQ.ema += (dtMs - AQ.ema) * 0.05; const q = R.qs || 1;
  if (AQ.ema > 34) { AQ.slow++; AQ.fast = 0; } else if (AQ.ema < 20) { AQ.fast++; AQ.slow = 0; } else { AQ.slow = AQ.fast = 0; }
  if (AQ.slow > 45 && q > 0.71) { R.qs = Math.max(0.7, +(q - 0.15).toFixed(2)); R.resize(); AQ.slow = 0; AQ.ema = 20; }
  else if (AQ.fast > 600 && q < 1) { R.qs = Math.min(1, +(q + 0.15).toFixed(2)); R.resize(); AQ.fast = 0; }
}
window.__autoQ = AQ;
function frame(ts) {
  const dt = Math.min(0.1, (ts - U.last) / 1000); autoQuality((ts - U.last)); U.last = ts; step(dt); draw(dt); requestAnimationFrame(frame);
}
function step(dt) {
  if (!G || U.modal) return;
  if (taxiTripActive(G)) { const r = taxiTripTick(G, dt, U.taxiSkip); U.taxiSkip = false; if (r && r.ended) { updateHud(true); if (r.msg) toast(r.msg, 4000); sfx.car(); } else updateHint(); return; }
  if (G.S.pump && !U.modal) leavePump(G);
  if (G.blocked()) { openPrompt(); return; }
  if (!G.canWalk()) { babyPanel(); return; }
  if (U.act) { stepActFrame(dt); return; }
  let ix = input.x, iy = input.y; const ks = input.keys; if (ks.has('ArrowLeft') || ks.has('a')) ix -= 1; if (ks.has('ArrowRight') || ks.has('d')) ix += 1; if (ks.has('ArrowUp') || ks.has('w')) iy -= 1; if (ks.has('ArrowDown') || ks.has('s')) iy += 1;
  const L = G.S.loc; const sxIn = ix, syIn = iy;
  // タップ自動移動: 手動入力があれば中止して手動へ。なければ経路どおりに歩く(moveHero を通すので衝突・遮断機は通常歩行と同じ)
  let autoV = null;
  if (AW.active) { if (ix || iy) AW.cancel('手動操作'); else { autoV = AW.dir(G, dt, U.lastRes); if (AW.arrived) { AW.arrived = false; awArrive(); autoV = null; } else if (!autoV && !AW.active) { if (AW.status) toast(AW.status, 2200); } } }
  let streetRes = null;
  if (R.street && L.k === 'out') {   // 通り視点: 左右=向きを変える / 上下=視線方向に前後へ進む(位置・当たり判定は通常表示と同じ moveHero)
    if (!R.sv) initStreet(R); R.sv.yaw += ix * 1.9 * dt; const fw = -iy; ix = Math.cos(R.sv.yaw) * fw; iy = Math.sin(R.sv.yaw) * fw; streetRes = moveHero(G, ix, iy, dt, input.run || ks.has('Shift')); L.f = facingOfYaw(R.sv.yaw);
  }
  if (!streetRes && R.iso && (L.k === 'out' || L.k === 'in') && (ix || iy)) { const w = screenToWorldDir(ix, iy); ix = w[0]; iy = w[1]; }   // アイソメ: 画面の上下左右どおりに動く
  let res;
  if (autoV && AW.active) { res = moveHero(G, autoV[0], autoV[1], dt, input.run || ks.has('Shift')); if (autoV[0] || autoV[1]) L.f = worldDirToFacing(autoV[0], autoV[1], L.f); }
  else res = streetRes || moveHero(G, ix, iy, dt, input.run || ks.has('Shift'));
  if (U.pendingDest != null && res.exited) { const pb = G.bld(U.pendingDest); U.pendingDest = null; if (pb) setTimeout(() => awStart({ kind: 'door', b: pb.idx, x: pb.doorX, y: pb.doorY, label: pb.name, enter: false }, pb.name + 'へ歩きます'), 80); }
  if (U.pendingHome && res.exited) { U.pendingHome = false; const hb = G.bld(G.hero.homeB); if (hb && G.S.loc.k === 'out') setTimeout(() => homeBtn(), 50); }
  U.lastRes = res; if (AW.active && (res.entered != null || res.exited || res.floor != null)) { const ch = AW.chain && res.floor != null && !res.exited; AW.cancel(); if (ch) setTimeout(() => { if (G && G.S.loc.k === 'in') awStart({ kind: 'exit' }); }, 60); }
  if (!streetRes && !autoV && R.iso && (L.k === 'out' || L.k === 'in') && (sxIn || syIn)) L.f = Math.abs(sxIn) > Math.abs(syIn) ? (sxIn > 0 ? 'r' : 'l') : (syIn > 0 ? 'd' : 'u');
  L.moving = res.moved; if (res.ui === 'liftsel' && !U.modal) liftModal(); if (res.directory != null) { U.dirAt = res.directory; showDirectory(res.directory); } if (res.msg) toast(res.msg); if (res.entered != null || res.exited || res.floor != null) { U.cwAt = -999; const eb = res.entered != null ? G.bld(res.entered) : null; if (eb && (eb.type === 'konbini' || eb.type === 'super')) sfx.konbini(); else sfx.door(); }
  if (res.moved) { U.stepT = (U.stepT || 0) + dt; const run = input.run || ks.has('Shift'); if (U.stepT > (run ? 0.2 : 0.3)) { U.stepT = 0; sfx.step(run); } }
  // 時計(歩行中・屋外/屋内とも 1ゲーム分 = 実1秒)
  U.clockFrac += dt * U.scale; while (U.clockFrac >= 1 && !G.blocked()) { U.clockFrac -= 1; G.advance(1); }
  // 住民
  const now = G.absMin() + U.clockFrac; if (L.k === 'out') {
    if (U.cwAt < 0 || performance.now() - U.cwAt > 700) { U.cwAt = performance.now(); U.cwMin = now; U.walkers = C.outdoor(L.x, L.y); }
    const dMin = now - U.cwMin; const PS = (U.ped = U.ped || { wdelay: new Map(), wprev: new Map(), whold: new Map() }); const fr = Math.max(0, Math.min(0.5, now - (U.lastNow ?? now))); U.lastNow = now; const mp = G.world.map, clk = R.time || 0;
    for (const w of U.walkers) { const pr = pedPos(C, mp, w, dMin, fr, clk, PS); const q = pr.q; w.idle = pr.idle;
      if (q) { w.cx = q.x; w.cy = q.y; w.cdx = q.dx; w.cdy = q.dy; w.cph = q.ph; w.ccar = q.car; w.cjump = q.jump; w.vis = true; } else w.vis = false; }
    if (PS.wdelay.size > 400) { PS.wdelay.clear(); PS.wprev.clear(); PS.whold.clear(); }
    R.walkers = U.walkers.filter(w => w.vis).map(w => ({ id: w.id, x: w.cx, y: w.cy, dx: w.cdx, dy: w.cdy, ph: w.cph, car: w.ccar, jump: w.cjump, idle: !!w.idle }));
    R.parked = U.walkers.parked || [];
  } else { if (U.cwAt < 0 || performance.now() - U.cwAt > 3000) { U.cwAt = performance.now(); const { I } = interiorOf(G, L.b, L.floor); U.people = seatStudents(placeSitters(I, C.indoor(L.b, I, L.floor), Math.floor(G.S.min / 90), U.act && U.act.seat.key)); } R.walkers = []; }
  updateHint(); updateHud();
  if (G.S.ended) endingScreen();
}
const levelFn = (b, fl) => isSchoolBig(b) ? floorLabel(b, fl) : isUnitFloor(fl) ? (() => { const u = decodeUnit(fl); return `${roomNo(u.lv, u.pos)}号室`; })() : bigKind(b) ? levelLabel(b, fl) : (b.type === 'onsenbath' || b.type === 'sento') ? ['受付・休憩所', '男湯', '女湯', '家族風呂(貸切)'][fl] || '' : (b.floors > 1 ? `${fl + 1}階` : '');
function floorTag(g) {
  const L = g.S.loc, b = g.bld(L.b); if (isUnitFloor(L.floor)) { const u = decodeUnit(L.floor); return ` ${roomNo(u.lv, u.pos)}号室`; }
  if (bigKind(b)) return ' ' + levelLabel(b, L.floor).split(' ')[0]; return b.floors > 1 ? ` ${L.floor + 1}階` : '';
}
function liftModal() {
  const L = G.S.loc; if (!L.tr || L.tr.stage !== 'select') return; const ch = floorChoices(G);
  showModal(`<h2>エレベーター</h2><div class="tx small">行き先の階を選んでください(定員${LIFT_CAP}人)</div><div class="list" style="max-height:52vh;overflow:auto">${ch.map(c => `<button class="btn item" data-lv="${c.lv}" ${c.here ? 'disabled' : ''}>${esc(c.label)}${c.here ? '(いまの階)' : ''}</button>`).join('')}</div><div class="row">${btn('降りる', 'sec')}</div>`, c => {
    c.querySelectorAll('button.item').forEach(b => b.onclick = () => { closeModal(); const r = chooseFloor(G, Number(b.dataset.lv)); if (r.msg) toast(r.msg, 2400); sfx.door && sfx.door(); });
    c.querySelector('.row .btn').onclick = () => { closeModal(); chooseFloor(G, L.floor); };
  });
}
function curList() { return G.S.loc.k === 'out' ? R.walkers : U.people; }
function updateHint() {
  const t = targetsFor(G, curList()); const tx = t[0] ? (t[0].kind === 'npc' ? `${t[0].label}に話しかける` : t[0].label) : ''; if (tx !== U.hintTxt) { $('hint').textContent = tx ? 'A: ' + tx : ''; $('hint').style.display = tx ? '' : 'none'; U.hintTxt = tx; } U.target = t[0] || null;
}
function draw(dt) {
  if (!G || !R) return; const L = G.S.loc; const hero = { x: L.x, y: L.y, f: L.f, moving: !!L.moving && (input.x || input.y || input.keys.size) };
  try { U.sndAt = (U.sndAt || 0) + dt; if (U.sndAt > 0.2) { sfx.world(soundState(G, R, hero), U.sndAt); U.sndAt = 0; } } catch (e) { /* 音は止めても進行は止めない */ }
  if (L.k === 'out') { R.drawOutdoor(dt, hero, { route: AW.active && AW.path ? AW.path.slice(AW.i) : U.route, dest: U.dest, focus: U.target && U.target.kind === 'door' ? { x: G.world.map.buildings[U.target.b].doorX, y: G.world.map.buildings[U.target.b].doorY } : null }); }
  else { const { I } = interiorOf(G, L.b, L.floor); animIndoor(U.people, performance.now() / 1000); const f = AW.active && AW.goal && AW.goal.o ? { x: AW.goal.o.x, y: AW.goal.o.y } : U.target && (U.target.kind === 'obj') ? { x: U.target.o.x, y: U.target.o.y } : null; R.drawInterior(dt, hero, I, U.people, { focus: f, shop: (() => { const sb = G.bld(L.b); return sb && I.kind === 'shop' ? { b: sb, bt: BTYPES[sb.type] } : null; })() }); }
}
let hudStamp = '';
function updateHud(force) {
  { const st = AW.active ? '' : 'none'; const e = $('awStop'); if (e.style.display !== st) e.style.display = st; if (U._tsA !== U.scale) { U._tsA = U.scale; document.querySelectorAll('#tctl button').forEach(b => b.classList.toggle('on', +b.dataset.s === U.scale)); } { const fb = $('floorBtn'); const fs = (G && G.S.loc.k === 'in') ? '' : 'none'; if (fb.style.display !== fs) fb.style.display = fs; } const gh = $('goHome'); const gs = (G && !G.S.ended && G.hero.homeB != null && G.canWalk() && !U.act && !taxiTripActive(G)) ? '' : 'none'; if (gh.style.display !== gs) gh.style.display = gs; }
  const d = G.date(); const age = G.age(); const place = placeLine(G, levelFn); const loc = G.where() + '|' + place; const w = R.weather();
  const st = `${G.S.M}|${G.S.day}|${G.S.min}|${loc}|${Math.round(G.hero.money)}|${Object.values(G.hero.stats).map(Math.round).join(',')}|${w}`; if (!force && st === hudStamp) return; hudStamp = st;
  $('hDate').textContent = `${dstr(d.y, d.m0, d.d)}(${WD[d.dow]}) ${String(d.h).padStart(2, '0')}:${String(d.mi).padStart(2, '0')}`;
  const L = G.S.loc, fl = L.k === 'in' ? floorTag(G) : '';
  $('hSub').textContent = `${esc(G.hero.name)} ${age}歳(${G.ageMonths()}か月目/${G.endMonth() - G.S.bornM})`; $('hPlace').textContent = place; void fl;
  $('hMoney').classList.toggle('testmax', isTestMode(G)); $('hMoney').textContent = (isTestMode(G) ? '【MAX資金】' : '') + yen(G.hero.money) + (G.hero.debt > 0 ? ` (借${yen(G.hero.debt)})` : ''); $('hWeather').textContent = { sun: '☀晴れ', cloud: '☁くもり', rain: '☔雨', snow: '❄雪' }[w] || '';
  const S = G.hero.stats; const b = (k, ic, col) => `<div class="barwrap">${ic}<div class="bar"><i style="width:${Math.round(S[k])}%;background:${col}"></i></div></div>`;
  $('bars').innerHTML = b('health', '♥', '#ef5350') + b('energy', '⚡', '#ffd54f') + b('hunger', '🍙', '#ffa726') + b('mood', '☺', '#66bb6a');
  if (U.dest) { const p = G.S.loc; const bx = U.dest; const dist = Math.abs(bx.doorX - p.x) + Math.abs(bx.doorY - p.y); const g = $('guide'); g.style.display = ''; g.textContent = `目的地: ${bx.name}(約${Math.round(dist)}タイル)`; if (dist < 2.5) { toast('目的地に着きました'); clearDest(); } } else $('guide').style.display = 'none';
}
function clearDest() { U.dest = null; U.route = null; $('guide').style.display = 'none'; }
function setDest(b, mode = 0) {
  const L = G.S.loc; U.dest = b; U.routeMode = mode; if (L.k === 'out') { U.route = findPath(G.world.map, Math.floor(L.x), Math.floor(L.y), b.doorX, b.doorY, mode); } else { const cb = G.bld(L.b); U.route = findPath(G.world.map, cb.doorX, cb.doorY, b.doorX, b.doorY, mode); }
}

// ---------------- プロンプト(イベント・月次報告)
function openPrompt() {
  if (U.modal) return; const pv = G.promptView(); if (!pv) return;
  if (pv.type === 'report') { sfx.chime(); return reportModal(pv.rep); }
  sfx.life(pv.title + ' ' + pv.text);
  showModal(`<h2>${esc(pv.title)}</h2><div class="tx">${esc(pv.text)}</div><div class="list">${pv.choices.map((c, i) => `<button class="btn item ${i === 0 ? 'acc' : ''}" data-i="${i}">${esc(c)}</button>`).join('')}</div>`, c => {
    c.querySelectorAll('button.item').forEach(b => b.onclick = () => { const r = G.choose(+b.dataset.i); closeModal(); if (r) toast(r, 3200); U.cwAt = -999; });
  });
}
function reportModal(rep) {
  const inc = rep.income.reduce((a, x) => a + x[1], 0), exp = rep.expense.reduce((a, x) => a + x[1], 0);
  const lines = (arr) => arr.map(x => `<tr><td>${esc(x[0])}</td><td class="r">${yen(x[1])}</td></tr>`).join('') || '<tr><td colspan=2 class="small">なし</td></tr>';
  showModal(`<h2>${fmtM(rep.M)} の まとめ</h2>
   <div class="tx">${esc(G.hero.name)}(${G.ageAt(rep.M)}歳)のひと月です。${rep.hours ? `働いた時間 ${rep.hours.toFixed(0)}時間。` : ''}${rep.attend ? `登校 ${rep.attend.toFixed(1)}日。` : ''}</div>
   <h3>お金</h3><table class="t"><tr><th>収入</th><th class="r">${yen(inc)}</th></tr>${lines(rep.income)}<tr><th>支出</th><th class="r">${yen(exp)}</th></tr>${lines(rep.expense)}</table>
   ${rep.year ? `<h3>${rep.year.y}年のふりかえり</h3><div class="tx">【全国】\n${rep.year.national.map(esc).join('\n')}\n【街】\n${rep.year.town.map(esc).join('\n')}${rep.year.friends.length ? '\n【知人】\n' + rep.year.friends.map(esc).join('\n') : ''}\n【あなた】\n${rep.year.hero.map(esc).join('\n')}</div>` : ''}
   ${rep.world.length ? `<h3>世の中</h3><div class="tx">${rep.world.map(esc).join('\n')}</div>` : ''}
   ${rep.news.length ? `<h3>知り合いの近況</h3><div class="tx">${rep.news.slice(0, 8).map(esc).join('\n')}</div>` : ''}
   <h3>いま(${fmtM(rep.after.M)})</h3><div class="tx">所持金 ${yen(rep.after.money)} ・ 健康${Math.round(rep.after.stats.health)} 気分${Math.round(rep.after.stats.mood)} 学力${Math.round(rep.after.stats.intel)}</div>
   <div class="row">${btn(`${fmtM(rep.after.M)}へ進む`, 'acc')}</div>`, c => { c.querySelector('.btn').onclick = () => { G.choose(0); closeModal(); autosave(); }; });
}
function babyPanel() {
  if (U.modal) return; const m = G.ageMonths();
  showModal(`<h2>${esc(G.hero.name)} ${m === 0 ? 'の誕生' : m + 'か月'}</h2><canvas id="scn" style="width:100%;border-radius:10px;background:#f6e9cf"></canvas><div class="tx">${esc(m === 0 ? (G.world.map.buildings.find(b => b.type === 'hospital')?.name || '産院') : G.homeName())}で、家族に見守られながら過ごしています。\n${spiritLines(G).map(esc).join('\n')}\n2歳(24か月)になると、自分で歩きまわれるようになります。</div><div class="row">${btn('1か月すごす', 'acc')}${btn('歩けるようになるまで進む', 'sec')}</div>`, c => {
    const bs = c.querySelectorAll('.btn'); bs[0].onclick = () => { closeModal(); skipTo(G.S.M + 1); }; bs[1].onclick = () => { closeModal(); skipTo(G.S.bornM + 24); };
    try { sceneInto(c.querySelector('#scn'), G); if (m === 0) { try { sfx.chime && sfx.chime(); } catch (_) { } } } catch (e) { c.querySelector('#scn').outerHTML = spiritSvg(G); }
  });
}
function skipTo(targetM, label) {
  const log0 = G.S.log.length; const r = G.skipTo(targetM, true); G.placeInHome(); U.cwAt = -999; clearInteriorCache();
  const news = G.S.log.slice(log0).filter(e => !['auto', 'news', 'event', 'meet', 'history'].includes(e.kind)).slice(0, 14);
  if (r.stopped === 'ask' || news.length) { setTimeout(() => { if (U.modal) return; if (G.blocked()) { openPrompt(); return; } showModal(`<h2>${label || 'すごした時間'}</h2><div class="tx">${news.length ? news.map(e => `${fmtM(e.M)} ${esc(e.text)}`).join('\n') : '(ふだん通りの日々でした)'}</div><div class="row">${btn('OK', 'acc')}</div>`, c => c.querySelector('.btn').onclick = closeModal); }, 30); }
  autosave();
}
const AS = makeAutosaver({ save: (ts) => saveSlot('auto', G, { name: G.hero.name, label: fmtM(G.S.M) + ' ' + G.age() + '歳', ts }), verify: (ts) => verifySlot('auto', ts), notify: n => { try { toast(n.msg, n.level === 'ok' ? 2400 : 6000); } catch (_) { } } });
window.__nlsAutosave = () => AS.state();
async function autosave() { if (isTestState(G)) return;   // 試験セッション/試験資金の状態は通常のセーブ枠へ保存しない
  try { await AS.run(); } catch (e) { /* 監視自体の失敗でゲームは止めない */ } }


// ビルの館内案内(入口を共有する複数の施設。階・名前・種別・営業状況を見て入る施設を選ぶ)
function showDirectory(pIdx) {
  const map = G.world.map, par = map.buildings[pIdx]; const list = (par.tenants || []).map(i => map.buildings[i]).sort((a, b) => (a.tfloor || 1) - (b.tfloor || 1) || a.idx - b.idx);
  const row = (b, label, floor) => { const o = isOpenFor(G, b); const mine = (G.hero.job && G.hero.job.b === b.idx) || G.hero.edu.b === b.idx; return { b, html: `${floor ? floor + 'F ' : ''}${esc(label)}${mine ? ' ★勤務先・通学先' : ''}${o.ok ? '' : ' <span class="small">(' + esc(o.msg || '今は入れません') + ')</span>'}`, ok: o.ok }; };
  const rows = [...list.map(t => row(t, `${t.name}(${(PLAN[t.spec] && PLAN[t.spec].name) || BTYPES[t.type].label})`, t.tfloor || 1)), row(par, `${par.name}(館内・ロビー)`, 0)];
  showModal(`<h2>${esc(par.name)} 館内案内</h2><div class="small">入る施設を選んでください(${list.length}施設)</div><div class="list">${rows.map((r, i) => `<button class="btn item" data-i="${i}" ${r.ok ? '' : 'disabled'}>${r.html}</button>`).join('')}</div><div class="row">${btn('やめる', 'sec')}</div>`, c => {
    c.querySelectorAll('button.item').forEach(b => b.onclick = () => { const r = tryEnter(G, rows[+b.dataset.i].b.idx, true); closeModal(); if (!r.ok) { toast(r.msg, 3200); sfx.bad(); } else { U.cwAt = -999; sfx.door(); } }); c.querySelector('.row .btn').onclick = closeModal;
  });
}

// ---------------- A(決定)・行動メニュー


// 「自宅へ帰る」: 常設ボタン。近ければそのまま自動で歩く。遠ければ(自動で歩く/タクシー/駅から)を出す
function homeBtn() {
  if (!G || U.modal || U.act || !G.canWalk() || G.blocked() || taxiTripActive(G)) return; const hb = G.bld(G.hero.homeB); if (!hb) { toast('自宅が登録されていません'); return; } const L = G.S.loc;
  if (L.k === 'in') { if (L.b === hb.idx) { toast('ここが自宅です'); return; } U.pendingHome = true; awStart({ kind: 'exit' }, '出口から外へ出て、自宅へ向かいます'); return; }
  const dist = Math.abs(hb.doorX - L.x) + Math.abs(hb.doorY - L.y); const mins = Math.max(1, Math.round(dist / 4.4 / 60 * 60 / 60 * 1)); void mins;
  if (dist < 3) { awStart({ kind: 'door', b: hb.idx, x: hb.doorX, y: hb.doorY, label: hb.name, enter: true }, '自宅へ'); return; }
  const walkMin = Math.max(1, Math.round(dist * 1.3 * 2 / 80)); const q = taxiQuote(G, dist); const adult = !(G.age() < 12 && !testBypass(G, 'age'));
  showModal(`<h2>🏠 自宅へ帰る</h2><div class="tx small">${esc(hb.name)}まで約${Math.round(dist)}タイル${dist > 400 ? '(遠いです)' : ''}</div><div class="list"><button class="btn acc item" data-k="walk">🚶 自動で歩く(約${walkMin}分)</button>${adult ? `<button class="btn item" data-k="taxi">🚕 タクシーを呼ぶ(約${q.mins}分・約¥${q.fare.toLocaleString('ja-JP')})</button>` : ''}<button class="btn item" data-k="map">🚉 駅から行く(地図で経路を見る)</button></div><div class="row">${btn('やめる', 'sec')}</div>`, c => {
    c.querySelector('[data-k=walk]').onclick = () => { closeModal(); awStart({ kind: 'door', b: hb.idx, x: hb.doorX, y: hb.doorY, label: hb.name, enter: true }, '自宅へ歩きます(画面をタップ/操作で止められます)'); };
    const tb = c.querySelector('[data-k=taxi]'); if (tb) tb.onclick = () => { const r = taxiTripBegin(G, hb, dist); if (r.ok && r.real) { sfx.car(); clearDest(); closeModal(); updateHud(true); toast(r.msg, 5000); return; } if (!r.ok) { toast(r.msg); return; } closeModal(); toast(r.msg || '自宅へ向かいました'); updateHud(true); };
    c.querySelector('[data-k=map]').onclick = () => { setDest(hb, 0); closeModal(); mapModal && mapModal(); };
    c.querySelector('.row .btn').onclick = closeModal;
  });
}

// 建物の階別案内: 各階に何があるか(実際の内装データから拾う)。現在階を強調
function floorGuideModal() {
  if (!G || G.S.loc.k !== 'in' || U.modal) return; const L = G.S.loc, b = G.bld(L.b); if (!b) return; let fl = []; try { fl = floorList(b); } catch (_) { }
  if (fl.length > 60) fl = fl.filter((f, i) => i % Math.ceil(fl.length / 60) === 0 || f.floor === L.floor);
  const rows = fl.map(f => { let items = []; try { const I = interiorOf(G, b.idx, f.floor).I; const seen = new Set(); for (const o of I.objs || []) { const lb = (o.label || '').replace(/\(.*$/, '').trim(); if (!o.act || !lb || seen.has(lb)) continue; seen.add(lb); items.push(lb); } if (I.door && !I.noDoor) items.unshift('出口'); } catch (_) { items = ['(行って確認)']; }
    const cur = f.floor === L.floor; return `<div class="item small" style="${cur ? 'background:#1b5e2066;border-radius:6px;padding:4px' : 'padding:4px'}"><b>${esc(f.label)}</b>${cur ? ' ◀いまここ' : ''}<div class="tx small">${esc(items.slice(0, 12).join('・') || '—')}${items.length > 12 ? '…' : ''}</div></div>`; }).join('');
  showModal(`<h2>🏢 ${esc(b.name)} 階の案内</h2><div style="max-height:260px;overflow:auto">${rows || '<div class="tx small">この建物はワンフロアです</div>'}</div><div class="tx small">階の移動は階段・エレベーター・エスカレーターをタップ(自動で歩いて乗れます)。</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => { c.querySelector('.row .btn').onclick = closeModal; });
}
function ctlModal() {
  const row = (k, lab, opts) => `<div class="small" style="margin-top:8px">${lab}</div><div class="row">${opts.map(([v, t]) => `<button class="btn ${String(CTL[k]) === String(v) ? 'acc' : 'sec'}" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div>`;
  showModal(`<h2>操作設定</h2>${row('mode', 'ジョイスティックの出かた', [['float', '浮動(触れた所に出る)'], ['fixed', '固定(左下)']])}${row('size', '大きさ', [[0.8, '小'], [1, '標準'], [1.3, '大'], [1.6, '特大']])}${row('sens', '感度(小さく動かすだけで全速)', [[1.2, '低'], [1.8, '標準'], [2.6, '高'], [3.6, '最高']])}${row('dpad', '十字キー(ジョイスティックが苦手な人向け)', [[false, 'OFF'], [true, 'ON']])}${row('tap', '画面タップで自動移動', [[true, 'ON'], [false, 'OFF']])}<div class="tx small">画面の行きたい場所/建物/出口/設備/人をタップすると、自動で歩いて近くまで行きます。手を動かす(ジョイスティック・十字キー)か「■止まる」で中止できます。</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelectorAll('button[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k, v = b.dataset.v; CTL[k] = (k === 'dpad' || k === 'tap') ? v === 'true' : k === 'mode' ? v : +v; ctlSave(); ctlApply(); resetAllInput(); ctlModal(); });
    c.querySelector('.row:last-child .btn').onclick = closeModal;
  });
}
// ---- タップ自動移動の到着処理/タップ入力
function awFace(tx, ty) { const L = G.S.loc; L.f = worldDirToFacing(tx - L.x, ty - L.y, L.f); }
function awArrive() {
  const goal = AW.goal; AW.cancel(); if (!goal || !G) return; const L = G.S.loc;
  if (goal.kind === 'door') { L.f = 'u'; if (goal.enter === false) { toast(`${goal.label}の入口に着きました`); return; } pressA({ kind: 'door', b: goal.b, label: `${goal.label}に入る` }); return; }
  if (goal.kind === 'obj') { const o = goal.o; awFace(Math.max(o.x + 0.5, Math.min(L.x, o.x + (o.w || 1) - 0.5)), Math.max(o.y + 0.5, Math.min(L.y, o.y + (o.h || 1) - 0.5))); const t = targetsFor(G, curList()).find(q => q.o === o); pressA(t || { kind: 'obj', o, label: o.label || o.t }); return; }
  if (goal.kind === 'npc') { awFace(goal.x, goal.y); const t = targetsFor(G, curList()).find(q => q.id === goal.id); if (t) pressA(t); else toast(`${goal.label}のそばに着きました`); return; }
  if (goal.kind === 'deco') { awFace(goal.x + 0.5, goal.y + 0.5); const t = targetsFor(G, curList()).find(q => q.kind === 'deco' && q.x === goal.x && q.y === goal.y); pressA(t || { kind: 'deco', d: goal.d, x: goal.x, y: goal.y, label: goal.label }); return; }
}
function awStart(goal, say) { if (!G || U.modal || !G.canWalk() || G.blocked() || U.act || taxiTripActive(G)) return; const r = AW.goTo(G, goal); if (!r.ok) { toast(r.msg, 2600); sfx.bad && sfx.bad(); return; } if (say) toast(say, 1600); }
function handleTap(cx, cy) {
  if (!G || !R || !CTL.tap || U.modal || U.act || R.street || taxiTripActive(G)) return; const r = cv.getBoundingClientRect(); const sx = (cx - r.left) * cv.width / r.width, sy = (cy - r.top) * cv.height / r.height;
  const L = G.S.loc; const crowd = (curList() || []).map(w => ({ id: w.id, x: w.x ?? w.cx, y: w.y ?? w.cy })); const t = resolveTap(G, R, crowd, sx, sy); if (!t) return;
  U.tapMark = { x: t.x ?? 0, y: t.y ?? 0, k: t.kind, t: performance.now(), in: L.k === 'in' };
  if (t.kind === 'tile') return awStart({ kind: 'tile', x: t.x, y: t.y });
  if (t.kind === 'door') return awStart({ kind: 'door', b: t.b, x: t.x, y: t.y, label: t.label, enter: t.enter }, `${t.label}へ向かいます`);
  if (t.kind === 'npc') { const live = () => (curList() || []).find(w => w.id === t.id); return awStart({ kind: 'npc', id: t.id, x: t.x, y: t.y, label: t.label, live: () => { const w = live(); return w ? { x: w.x ?? w.cx, y: w.y ?? w.cy } : null; } }, `${t.label}のところへ向かいます`); }
  if (t.kind === 'exit') return awStart({ kind: 'exit' }, '出口へ向かいます');
  if (t.kind === 'stairs') return awStart({ kind: 'stairs', o: t.o }, `${t.label}へ向かいます`);
  if (t.kind === 'obj') return awStart({ kind: 'obj', o: t.o, label: t.label }, `${t.label}へ向かいます`);
  if (t.kind === 'deco') return awStart({ kind: 'deco', x: t.x, y: t.y, d: t.d, label: t.label }, `${t.label}へ向かいます`);
}
function pressA(forced) {
  if (G && taxiTripActive(G)) { U.taxiSkip = true; return; }
  if (!G || U.modal || U.act || G.blocked() || !G.canWalk()) return; const t = forced ? [forced] : targetsFor(G, curList()); if (!t.length) { toast('目の前には何もありません'); return; }
  const tg = t[0]; const acts = targetActions(G, tg);
  if (tg.kind === 'door') { const r = tryEnter(G, tg.b); if (r.directory != null) { showDirectory(r.directory); return; } if (r.gas != null) { fuelModal(G, r.gas, carD()); return; } if (r.dealer != null) { dealerModal(G, r.dealer, carD()); return; } if (r.used != null) { usedModal(G, r.used, carD()); return; } if (!r.ok) { toast(r.msg, 3200); sfx.bad(); } else { U.cwAt = -999; sfx.door(); } return; }
  showModal(`<h2>${esc(tg.label)}</h2>${npcStatusHtml(tg)}<div class="list">${acts.map((a, i) => `<button class="btn item" data-i="${i}" ${a.disabled ? 'disabled' : ''}>${esc(a.label)}</button>`).join('')}</div><div class="row">${btn('やめる', 'sec')}</div>`, c => {
    c.querySelectorAll('button.item').forEach(b => b.onclick = () => doAction(acts[+b.dataset.i], tg)); c.querySelector('.row .btn').onclick = closeModal;
  });
}
// 共通の行動システム: 座る(接近→着席→待機→起立→復帰)。効果は座って待機し終えた時に一度だけ適用し、表示文もそのとき作る
function stepActFrame(dt) {
  const L = G.S.loc, act = U.act; if (L.k !== 'in') { U.act = null; R.heroPose = null; return; }
  const res = stepAct(act, dt, L, { onRest: (mins, eff) => { G.advance(mins); act.msg = act.A.msg + G.chg(eff); if (act.after) act.after(); } });
  R.heroPose = res.pose; L.moving = !!L.moving && act.phase === 'walk'; updateHint(); updateHud();
  if (res.done) { U.act = null; R.heroPose = null; L.moving = false; if (act.msg) toast(act.msg, 4200); if (G.blocked()) setTimeout(openPrompt, 100); }
}
function doAction(a, tg) {
  if (a.id.startsWith('bath:') && tg && tg.o && SEAT_T.has(tg.o.t) && G.S.loc.k === 'in') {   // 入浴: 湯船まで歩く→肩までつかる→あがる(時間は湯につかっている間に進む)
    const pre = bathPrep(G, tg, a.id.split(':')[1]); if (!pre.ok) { toast(pre.msg); sfx.bad(); return; } closeModal(); const L = G.S.loc; const { I } = interiorOf(G, L.b, L.floor);
    const r = beginSit(G, I, tg.o, U.people, { x: L.x, y: L.y, f: L.f }, pre.rot ? 'rbath' : 'bath'); if (!r.ok) { toast(r.msg); sfx.bad(); return; }
    G.pay(pre.pr, '入浴'); sfx.coin(); r.act.after = () => { G.S.washedAt = null; }; r.act.A.msg = pre.rot ? (pre.night ? '行灯の明かりの下、星空の露天風呂に身をひたしました。' : '湯けむりの向こうに木々を眺めながら、露天風呂にゆったりつかりました。') : 'お湯にゆったりつかりました。'; U.act = r.act; return; }
  if (a.id === 'relax' && tg && tg.o && SEAT_T.has(tg.o.t) && G.S.loc.k === 'in') { closeModal(); const L = G.S.loc; const { I } = interiorOf(G, L.b, L.floor); const r = beginSit(G, I, tg.o, U.people, { x: L.x, y: L.y, f: L.f }); if (!r.ok) { toast(r.msg); sfx.bad(); return; } U.act = r.act; return; }
  closeModal(); const before = G.S.min; const money0 = G.hero.money; const r = runAction(G, a.id, tg); U.cwAt = -999; if (G.hero.money < money0) sfx.coin();
  if (r.ui) return specialUI(r, tg); if (r.msg) toast(r.msg, 4200); if (G.blocked()) setTimeout(openPrompt, 100);
}
function specialUI(r, tg) {
  if (r.ui === 'guide') { const gb = G.bld(G.S.loc.b); return showModal(`<h2>${esc(gb.name)} フロアガイド</h2><div class="tx small" style="white-space:pre-line;text-align:left">${esc(r.msg)}</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => { c.querySelector('.row .btn').onclick = closeModal; }); }
  if (r.ui === 'jticket') return jTicketModal(r.mode); if (r.ui === 'jboard') return jBoardModal(r.mode); if (r.ui === 'jinfo') return jInfoModal(); if (r.ui === 'shuttle') return jShuttle();
  if (r.ui === 'firm') return firmModal(G, carD());
  if (r.ui === 'shop') return shopModal(G, G.S.loc.b, carD(), tg && tg.o ? tg.o.label : ''); if (r.ui === 'fitting') return fittingModal(G, R, G.S.loc.b, carD()); if (r.ui === 'voc') return vocModal(G, G.S.loc.b, carD()); if (r.ui === 'hair') return hairModal(G, R, G.S.loc.b, carD()); if (r.ui === 'dealer') { const db = G.bld(G.S.loc.b); return (db.type === 'usedcar' ? usedModal : dealerModal)(G, db.idx, carD()); } if (r.ui === 'jobs') return jobsModal(r.filterB ?? -1); if (r.ui === 'housing') return housingModal(); if (r.ui === 'finance') return financeModal(); if (r.ui === 'biz') return bizModal(); if (r.ui === 'rail') return railModal(); if (r.ui === 'timetable') return timetableModal(); if (r.ui === 'profile') return profileModal(r.id);
}
function jobsModal(filterB) {
  const v = G.vacanciesNear(18, filterB); const h = G.hero;
  showModal(`<h2>求人${filterB >= 0 ? '(この職場)' : '(自宅に近い順)'}</h2><div class="tx small">年齢・学歴・資格を満たす求人だけ表示します。${G.isStudentNow() ? '(在学中はアルバイトのみ)' : ''}\n給与は月収の目安(仮パラメータ)。</div>${h.job ? `<div class="tx">現在: ${esc(JOBS[h.job.jobId].name)}(${esc(G.bld(h.job.b).name)}) ${btn('この仕事をやめる', 'sec')}</div>` : ''}<div class="list">${v.length ? v.map((o, i) => `<button class="btn item" data-s="${o.s}">${esc(G.bld(o.b).name)} — ${esc(JOBS[o.jobId].name)} <span class="small">月 約${yen(JOBS[o.jobId].wage * G.pi() * (G.isStudentNow() ? 0.5 : 1))} ・ ${o.d}タイル</span></button>`).join('') : '<div class="tx">いま応募できる求人はありません。(学歴や年齢が条件に届かないか、募集が埋まっています。時期をおいて確認してください)</div>'}</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelectorAll('button.item').forEach(b => b.onclick = () => { G.hero.flags.partTime = G.isStudentNow() || G.age() < 18; const m = G.applyJob(+b.dataset.s); closeModal(); toast(m, 3600); });
    const q = c.querySelector('.tx .btn'); if (q) q.onclick = () => { G.dismiss('自分で退職を決めた'); closeModal(); G.S.queue.pop(); toast('退職しました。'); }; c.querySelector('.row .btn').onclick = closeModal;
  });
}
function housingModal() {
  const L = housingList(G, 15); const h = G.hero;
  showModal(`<h2>住まいを探す</h2><div class="tx small">引っ越しには家賃2か月分(敷金・費用)が必要です。購入は頭金2割+諸費用5%、残りは35年ローン(銀行の窓口で資産の相談もできます)。</div><div class="list">${L.map(o => { const q = buyQuote(G, o.b); return `<div class="item"><div>${esc(o.name)}(${esc(o.type === 'apt' ? 'アパート' : o.type === 'house' ? '一軒家' : 'タワー')}) <span class="small">${esc(o.addr)} ・ ${o.d}タイル</span></div><div class="row"><button class="btn" data-b="${o.b}">借りる 家賃${yen(o.rent)}/月</button><button class="btn acc" data-buy="${o.b}">買う ${yen(q.price)}(月${yen(q.pay)})</button></div></div>`; }).join('')}</div><div class="row"><button class="btn acc" id="realty">不動産の資産管理(売却・賃貸・土地)</button>${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelector('#realty').onclick = () => realtyModal(G, carD());
    c.querySelectorAll('button[data-b]').forEach(b => b.onclick = () => { const r = moveTo(G, +b.dataset.b); closeModal(); toast(r.msg, 3600); });
    c.querySelectorAll('button[data-buy]').forEach(b => b.onclick = () => { const r = buyHome(G, +b.dataset.buy); if (!r.ok) { toast(r.msg, 3600); return; } sfx.coin(); closeModal(); toast(r.msg, 3600); updateHud(true); });
    c.querySelector('.row .btn:last-child').onclick = closeModal;
  });
}
function bizModal() {
  const b = biz(G); if (!b) return; const rp = b.last || monthlyReport(G, b); const heirTxt = b.heir >= 12 ? '十分に身についた' : `${b.heir}/12`;
  showModal(`<h2>${esc(b.name)}(${b.gen}代目)</h2><div class="tx">評判 ${b.rep.toFixed(1)} / 100 ・ 従業員 ${b.staff}人 ・ 後継者の習熟 ${heirTxt}\n【${b.last ? '先月' : '今月の見込み'}】来客 ${rp.sold}人(需要 ${rp.demand}・対応力 ${rp.cap})\n売上 ${yen(rp.rev)} − 経費 ${yen(rp.cost)} = 損益 ${rp.profit >= 0 ? '+' : ''}${yen(rp.profit)}\n今月あなたが店に立った時間 ${G.S.m.biz || 0}時間</div><div class="small">評判は店に立つ時間で育ちます。従業員だけに任せると評判は少しずつ下がります。</div><div class="row" style="flex-wrap:wrap"><button class="btn" data-w="hire">従業員を雇う(月給 ${yen(G.yen(170000))})</button><button class="btn" data-w="fire">従業員を減らす</button><button class="btn" data-w="ad">広告(${yen(G.yen(50000))})</button><button class="btn" data-w="reno">改装(${yen(G.yen(800000))})</button><button class="btn" data-w="teach">子に仕事を教える(2時間)</button></div><div class="row"><button class="btn sec" data-w="close">店を畳む</button>${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelectorAll('button[data-w]').forEach(bt => bt.onclick = () => { if (bt.dataset.w === 'close' && !confirm('本当に店を畳みますか?')) return; const r = adjust(G, bt.dataset.w); if (r.msg) toast(r.msg, 3000); closeModal(); if (r.ok && bt.dataset.w !== 'close') bizModal(); updateHud(true); });
    const bs = c.querySelectorAll('.row .btn'); bs[bs.length - 1].onclick = closeModal;
  });
}
function financeModal() {
  const h = G.hero, iv = getInvest(h), m = h.mort; const gain = Math.round(iv.bal - iv.paid);
  showModal(`<h2>銀行の窓口</h2><div class="tx">${m ? `住宅ローン 残り ${yen(m.bal)}(月${yen(m.pay)}・残り${Math.ceil(m.left / 12)}年・年利${(m.rate * 100).toFixed(1)}%)` : '住宅ローン: なし'}\n持ち家: ${h.owned.includes(h.homeB) ? esc(G.homeName()) + '(売却見込 ' + yen(sellValue(G, h.homeB)) + ')' : 'なし'}\n\n【積立投資】(元本保証なし・値動きあり)\n運用中 ${yen(investValue(h))}(元本 ${yen(iv.paid)} / 損益 ${gain >= 0 ? '+' : ''}${yen(gain)})\n毎月の積立: ${iv.monthly ? yen(G.yen(iv.monthly)) : 'なし'}</div><div class="small">毎月の積立額</div><div class="row" style="flex-wrap:wrap">${INVEST_STEPS.map(k => `<button class="btn ${iv.monthly === k ? 'acc' : ''}" data-k="${k}">${k ? yen(G.yen(k)) : 'やめる'}</button>`).join('')}</div><div class="row"><button class="btn" id="wd">全額を引き出す</button><button class="btn" id="stk">株式を見る(架空企業)</button>${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelectorAll('button[data-k]').forEach(b => b.onclick = () => { setMonthly(G, +b.dataset.k); closeModal(); financeModal(); });
    c.querySelector('#stk').onclick = () => { closeModal(); stockModal(); };
    c.querySelector('#wd').onclick = () => { const r = withdrawInvest(G); toast(r.msg, 3000); closeModal(); updateHud(true); };
    const bs = c.querySelectorAll('.row .btn'); bs[bs.length - 1].onclick = closeModal;
  });
}
function stockModal(msg = '') {
  const H = getStocks(G.hero);
  const rows = COMPANIES.map(c => { const px = priceOf(G, c.id), ch = changeOf(G, c.id), h = H[c.id]; return `<tr><td>${esc(c.name)}</td><td class="r">${yen(px)}</td><td class="r" style="color:${ch >= 0 ? '#ff8a80' : '#80d8ff'}">${ch >= 0 ? '+' : ''}${(ch * 100).toFixed(1)}%</td><td class="r">${h ? h.n + '株' : '-'}</td><td><button class="btn" data-b="${c.id}">買</button><button class="btn" data-s="${c.id}" ${h ? '' : 'disabled'}>売</button></td></tr>`; }).join('');
  showModal(`<h2>株式(架空の企業)</h2><div class="tx small">10株単位。手数料0.55%、利益には20%の税。株価は上がることも下がることもあり、元本は保証されません。企業・株価はすべてゲーム用の架空・仮設定です。\n${msg ? esc(msg) + '\n' : ''}保有の時価 ${yen(holdingsValue(G))} / 所持金 ${yen(G.hero.money)}</div><table class="t"><tr><th>会社</th><th class="r">株価</th><th class="r">前月比</th><th class="r">保有</th><th></th></tr>${rows}</table><div class="row">${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelectorAll('button[data-b]').forEach(b => b.onclick = () => { const r = buyStock(G, b.dataset.b, 1); closeModal(); stockModal(r.msg); updateHud(true); });
    c.querySelectorAll('button[data-s]').forEach(b => b.onclick = () => { const r = sellStock(G, b.dataset.s, 1); closeModal(); stockModal(r.msg); updateHud(true); });
    c.querySelector('.row .btn').onclick = closeModal;
  });
}
function railModal() {
  const b = G.bld(G.S.loc.b); const from = b.stationId; if (!from) { toast('ここは駅ではありません'); return; }
  const rows = G.world.map.stations.filter(s => s.id !== from).map(s => { const T = planTrip(G, from, s.id); return { s, T }; }).filter(x => x.T);
  const t0 = G.absMin(); const hm = t => { const m = ((t % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`; };
  showModal(`<h2>${esc(b.name)} — 電車に乗る</h2><div class="tx small">現在 ${hm(t0)} ・ 青海線/東西環状線(青海中央で乗換)。運賃・時刻はゲーム内の仮設定です。</div><table class="t"><tr><th>行き先</th><th>発</th><th>着</th><th>運賃</th><th></th></tr>${rows.map(({ s, T }) => `<tr><td>${esc(s.name)}${T.plan.legs.length > 1 ? ' <span class="pill">乗換</span>' : ''}</td><td>${T.sim.ok ? hm(T.sim.legs[0].board) : '-'}</td><td>${T.sim.ok ? hm(T.sim.arrive) : '-'}</td><td class="r">${yen(T.fare)}</td><td>${T.sim.ok ? `<button class="btn" data-to="${s.id}" ${G.hero.money < T.fare ? 'disabled' : ''}>のる</button>` : '終電後'}</td></tr>`).join('')}</table><div class="row">${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelectorAll('button[data-to]').forEach(bt => bt.onclick = () => { closeModal(); const r = startRide(G, from, bt.dataset.to); if (!r.ok) { toast(r.msg, 3600); return; } sfx.train(); rideScreen(r.ride); });
    c.querySelector('.row .btn').onclick = closeModal;
  });
}
// ---------------- 乗車画面
const RD = { on: false, ride: null, acc: 0, rate: 2, last: 0, raf: 0, msg: '' };
// バス・タクシーの短い車内シーン(見た目だけ。時間・運賃・移動はすでに確定している)。実在の住民が乗客・運転手として座る。タップで飛ばせる。
function sceneIds(kind, key) {
  const pop = G.world.pop, out = []; for (let k = 0; k < 400 && out.length < (kind === 'bus' ? 11 : 1); k++) { const id = hash2(G.absMin() * 31 + key, k + (kind === 'bus' ? 11 : 5)) % pop.n; if (pop.gone[id] || pop.home[id] < 0 || id === G.hero.id || G.ageOf(id) < (kind === 'bus' ? 6 : 24) || G.ageOf(id) > 75) continue; out.push(id); } return out;
}
function playScene(sc, done) {
  const el = $('ride'), cv = $('ridecv'); el.classList.add('on'); U.modal = true; RD.on = false; $('ridebar').innerHTML = '<button data-a="skip">とばす</button>'; $('rideinfo').textContent = sc.text || '';
  cv.width = Math.round(cv.clientWidth * (devicePixelRatio || 1)); cv.height = Math.round(cv.clientHeight * (devicePixelRatio || 1)); let ended = false, raf = 0; const t0 = performance.now();
  const end = () => { if (ended) return; ended = true; cancelAnimationFrame(raf); el.classList.remove('on'); U.modal = false; U.cwAt = -999; try { done && done(); } catch (e) { /* 表示は止めない */ } };
  $('ridebar').querySelector('button').onclick = end; window.__scene = { end, sc };
  const loop = ts => { if (ended) return; const t = (ts - t0) / 1000; R.drawScene(cv, sc, t); if (t >= sc.dur) end(); else raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop);
}
function rideScreen(ride) {
  const el = $('ride'), cv = $('ridecv'); el.classList.add('on'); RD.on = true; RD.ride = ride; RD.acc = 0; RD.rate = 2; RD.msg = ''; U.modal = true; RD.last = performance.now();
  const bar = $('ridebar');
  bar.innerHTML = `<button data-a="sit">座る/立つ</button><button data-a="talk">話しかける</button><button data-a="give">席をゆずる</button><button data-a="fast">はやおくり</button><button data-a="skip">降りるまで進める</button>`;
  bar.querySelectorAll('button').forEach(b => b.onclick = () => rideAction(b.dataset.a));
  cv.width = cv.clientWidth * (devicePixelRatio || 1); cv.height = cv.clientHeight * (devicePixelRatio || 1);
  cancelAnimationFrame(RD.raf); RD.raf = requestAnimationFrame(rideLoop);
}
function rideAction(a) {
  const ride = RD.ride; if (!ride) return; const t = G.absMin(); const inf = ride.info(t);
  if (a === 'sit') RD.msg = ride.toggleSit(t);
  else if (a === 'give') RD.msg = ride.giveSeat(t);
  else if (a === 'fast') { RD.rate = RD.rate >= 8 ? 2 : RD.rate * 2; RD.msg = `速度 x${RD.rate / 2}`; }
  else if (a === 'skip') { RD.rate = 60; RD.msg = '降りるまで進めています…'; }
  else if (a === 'talk') {
    if (inf.phase !== 'ride' && !(inf.waiting && inf.waiting.length)) { RD.msg = '話せる相手がいません。'; return; }
    const pool = inf.phase === 'ride' ? inf.riders.map(r => r.id) : inf.waiting.map(r => r.id); const known = pool.find(id => G.hero.rel[id]); const id = known ?? pool[(G.S.rngCtr++) % pool.length];
    const r = runAction(G, 'chat', { id }); RD.msg = r.msg || '';
  }
}
function rideLoop(ts) {
  if (!RD.on) return; const dt = Math.min(0.1, (ts - RD.last) / 1000); RD.last = ts; const ride = RD.ride; const cv = $('ridecv');
  if (cv.width !== Math.round(cv.clientWidth * (devicePixelRatio || 1))) { cv.width = Math.round(cv.clientWidth * (devicePixelRatio || 1)); cv.height = Math.round(cv.clientHeight * (devicePixelRatio || 1)); }
  if (G.blocked()) { // 月替わり等のお知らせ → 一旦ふつうの画面に戻して処理
    $('ride').classList.remove('on'); U.modal = false; openPrompt(); const iv = setInterval(() => { if (!G.blocked() && !U.modal) { clearInterval(iv); if (RD.on) { $('ride').classList.add('on'); U.modal = true; RD.last = performance.now(); RD.raf = requestAnimationFrame(rideLoop); } } }, 200); return;
  }
  RD.acc += dt * RD.rate; let whole = Math.floor(RD.acc); RD.acc -= whole; if (whole > 0) { const t = G.absMin(); const left = Math.max(0, Math.ceil(ride.arrive - t)); G.advance(Math.min(whole, Math.max(1, left))); }
  const t = G.absMin(); const tf = t + RD.acc; const inf = ride.info(tf);
  if (inf.phase === 'done' || t >= Math.ceil(ride.arrive)) { rideEnd(); return; }
  if (!ride.metKnown && inf.phase === 'ride') { const k = ride.knownAboard(t); if (k) { ride.metKnown = true; G.meet(k.id, 4); RD.msg = `${G.nameOf(k.id)}が同じ電車に乗っていました。軽く会釈をした。`; G.log('trip', `電車で${G.nameOf(k.id)}と乗り合わせた`, { who: k.id }); } }
  R.drawRide(cv, ride, inf, tf);
  const hm = x => { const m = ((Math.floor(x) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  let txt;
  if (inf.phase === 'wait' || inf.phase === 'xfer') txt = `${inf.station}駅のホーム(${hm(t)})\n${inf.phase === 'xfer' ? '乗換: ' : ''}${inf.leg.lineName} ${inf.leg.terminus}方面 ${hm(inf.board)}発まであと${Math.max(0, Math.ceil(inf.minsToBoard))}分  待っている人 ${inf.waiting.length}人`;
  else if (inf.phase === 'ride') txt = `${inf.line} ${inf.toward}方面 ${hm(t)}\n${inf.atStop ? `${inf.next.name}に停車中` : `次は ${inf.next.name}`}${inf.final ? '(終点まで乗ります)' : ''} ・ 目的地 ${inf.dest} ・ あと${Math.ceil(inf.minsLeft)}分\n乗客 ${inf.load}人 ・ 空席 ${inf.freeSeats} ${inf.sitting ? '・ 座っています' : ''}`;
  else txt = '';
  if (RD.msg) txt += '\n' + RD.msg; $('rideinfo').textContent = txt; $('ride').style.setProperty('--rc', inf.color || (inf.leg && inf.leg.color) || '#1e88e5');
  RD.raf = requestAnimationFrame(rideLoop);
}
function rideEnd() {
  const ride = RD.ride; RD.on = false; $('ride').classList.remove('on'); U.modal = false; const msg = ride.finish(); RD.ride = null; U.cwAt = -999; fade(false); toast(msg, 4200); if (G.blocked()) setTimeout(openPrompt, 100);
}
// ---------------- 空港・フェリー・新幹線(券→保安検査→搭乗→乗車場面→到着/帰り)。ロジックは journey.js
function jTicketModal(mode) {
  const M = JM[mode], list = jOffers(G, mode); const have = G.S.trip;
  showModal(`<h2>${M.icon} ${esc(M.label)}の切符売り場</h2><div class="tx small">運賃・時刻はゲーム内の仮設定です。${have ? '\n<b>お持ちの券: ' + esc(have.name) + '</b>' : ''}</div>${list.length ? `<table class="t"><tr><th>行き先・内容</th><th>所要</th><th>料金</th><th></th></tr>${list.map(o => `<tr><td>${esc(o.name)}${o.stub ? ' <span class="pill">到着ロビーまで</span>' : ''}</td><td>${o.mins}分</td><td>¥${o.fare.toLocaleString('ja-JP')}</td><td>${o.ok ? `<button class="btn acc" data-o="${o.id}">買う</button>` : `<span class="small">${esc(o.reasons.map(x => JREASON[x] || x).join(' / '))}</span>`}</td></tr>`).join('')}</table>` : '<div class="tx">いまご利用いただける便はありません。</div>'}<div class="row">${have && have.step < 3 ? btn('券を払い戻す', 'sec') : ''}${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelectorAll('button[data-o]').forEach(b => b.onclick = () => { const r = buyTicket(G, mode, b.dataset.o); toast(r.msg, 4200); if (r.ok) { sfx.coin(); updateHud(true); closeModal(); } else jTicketModal(mode); });
    const bs = c.querySelectorAll('.row .btn'); bs[bs.length - 1].onclick = closeModal; if (bs.length > 1) bs[0].onclick = () => { const r = refund(G); toast(r.msg, 3000); updateHud(true); jTicketModal(mode); };
  });
}
function jInfoModal() {
  const b = G.bld(G.S.loc.b); const mode = b.type === 'airport' ? 'air' : b.type === 'ferry' ? 'ferry' : 'bullet'; const M = JM[mode]; const now = G.S.min;
  showModal(`<h2>${M.icon} ${esc(b.name)} 発着案内</h2><div class="tx">現在 ${jhm(now)}\n次の${mode === 'air' ? '出発' : mode === 'ferry' ? '出航' : '発車'}: ${departures(mode, now, 5).map(jhm).join(' / ') || '本日は終了'}</div>${G.S.trip ? `<div class="tx small">お持ちの券: ${esc(G.S.trip.name)}</div>` : ''}<div class="row">${btn('閉じる', 'sec')}</div>`, c => c.querySelector('.btn').onclick = closeModal);
}
function jBoardModal(mode) {
  const M = JM[mode], bi = boardInfo(G, mode); if (!bi.ok) { toast(bi.msg, 4200); return; }
  showModal(`<h2>${M.icon} ${esc(G.S.trip.name)}</h2><div class="tx">次の便は ${jhm(bi.dep)} 発です(あと${bi.wait}分)。\n${mode === 'air' ? '搭乗口でお待ちください。' : '乗り場でお待ちください。'}</div><div class="row">${btn('乗る', 'acc')}${btn('やめる', 'sec')}</div>`, c => {
    c.querySelector('.acc').onclick = () => { closeModal(); const r = jBoard(G, mode); if (!r.ok) { toast(r.msg, 4200); return; } updateHud(true); sfx.train && sfx.train(); jPlay(r.scene, () => { const a = jArrive(G); if (a.back) { toast(a.msg, 4600); updateHud(true); } else jAwayPanel(); }); };
    c.querySelector('.sec').onclick = closeModal;
  });
}
function jPlay(scene, done) { const ids = sceneIds('bus', scene.mins || 7).slice(0, 8); playScene({ ...scene, ids: ids.slice(0, 6), stand: ids.slice(6), mode: G.S.trip ? G.S.trip.mode : 'air' }, done); }
function jAwayPanel() {
  const a = awayInfo(G); if (!a) return; const M = JM[a.mode];
  showModal(`<h2>${M.icon} ${esc(a.name)} に到着</h2><div class="tx">${esc(a.name)}の${a.mode === 'air' ? '到着ロビー' : a.mode === 'ferry' ? '桟橋' : '駅'}に降り立ちました。${a.stub ? '\n(この街の詳細マップは今後の開発です。いまは到着地で過ごして帰ることができます。)' : ''}</div><div class="row">${btn('到着地で名物を食べて過ごす(90分)', 'acc')}${btn('帰りの便に乗る', 'acc')}</div>`, c => {
    const bs = c.querySelectorAll('.btn'); bs[0].onclick = () => { const r = stayAway(G); toast(r.msg, 4200); updateHud(true); jAwayPanel(); };
    bs[1].onclick = () => { closeModal(); const r = goHome(G); if (!r.ok) return; jPlay(r.scene, () => { const f = finishReturn(G); toast(f.msg, 4200); updateHud(true); }); };
  });
}
function jShuttle() {
  const L = G.S.loc, b = G.bld(L.b), t = shuttleTarget(G.world.map, b); if (!t) { toast('連絡バスはありません'); return; }
  const ids = sceneIds('bus', 3); G.advance(8); L.k = 'out'; delete L.b; delete L.floor; L.x = t.x; L.y = t.y; L.f = 'd'; updateHud(true); clearInteriorCache && clearInteriorCache();
  playScene({ kind: 'bus', ids: ids.slice(0, 8), stand: ids.slice(8), label: `空港連絡バス → ${t.label}`, text: `空港連絡バス(約8分)`, dur: 3.4 }, () => toast(`${t.label}に着きました`, 3000));
}
function timetableModal() {
  const b = G.bld(G.S.loc.b); const sid = b.stationId; const t0 = G.absMin(); const hm = t => { const m = ((t % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`; };
  const rows = []; for (const L of G.tr.lines) { const i = L.stops.findIndex(s => s.id === sid); if (i < 0) continue; for (const dir of [1, -1]) { const nx = (dir === 1 ? i < L.stops.length - 1 : i > 0) ? nextDeparture(G.tr, L.id, dir, i, t0) : null; if (!nx) continue; const dest = L.stops[dir === 1 ? L.stops.length - 1 : 0].name; const list = []; let t = t0; for (let k = 0; k < 3; k++) { const n2 = nextDeparture(G.tr, L.id, dir, i, t); if (!n2) break; list.push(hm(n2.at)); t = n2.at + 1; } rows.push(`<tr><td><span class="pill" style="background:${L.color}">${esc(L.name)}</span> ${esc(dest)}方面</td><td>${list.join(' / ')}</td></tr>`); } }
  showModal(`<h2>${esc(b.name)} 時刻表</h2><table class="t">${rows.join('') || '<tr><td>本日の運転は終了しました</td></tr>'}</table><div class="row">${btn('閉じる', 'sec')}</div>`, c => c.querySelector('.btn').onclick = closeModal);
}
function careerHtml(id, full) {
  const pv = profileView(G.world, id, G.S.M); const L = G.world.lives.get(id); const W = G.world;
  const out = [];
  out.push(`<h3>成長</h3><div class="tx small">人生Lv ${pv.lifeLv} ・ ${pv.job ? esc(JOBS[pv.job].name) + ' 職業Lv ' + pv.jobLv + (pv.rankName ? ' ・ 役職: ' + esc(pv.rankName) : '') : '無職/学生/引退'}</div>`);
  if (pv.skills.length) out.push(`<div class="tx small">技能: ${pv.skills.slice(0, 8).map(k => `${esc(k.name)} Lv${k.lv}`).join(' / ')}</div>`);
  if (pv.quals.length) out.push(`<div class="tx small">資格: ${pv.quals.map(q => esc(q.name)).join('、')}</div>`);
  const hs = pv.hist.slice(-8).map(e => esc(histText(W, e))); if (hs.length) out.push(`<h3>職歴・転職履歴</h3><div class="tx small">${hs.join('\n')}</div>`);
  if (L) {
    out.push(`<h3>人となり</h3><div class="tx small">${esc(L.traits.join('・'))} ／ 趣味: ${esc(L.hobby)} ／ 気分 ${Math.round(L.mood)}</div>`);
    out.push(`<h3>人生の歩み</h3><div class="tx small">${L.life.slice(-(full ? 12 : 6)).map(e => `${1900 + Math.floor(e.M / 12)}年 ${esc(e.text)}`).join('\n')}</div>`);
    out.push(`<h3>つながり</h3><div class="tx small">${L.rel.filter(r => r.k !== 'late' || full).slice(0, 8).map(r => `${esc(relName(r.k))}: ${esc(G.nameOf(r.id))}`).join(' / ') || 'なし'}</div>`);
    out.push(`<h3>おぼえていること</h3><div class="tx small">${L.mem.slice(-5).map(m => '・' + esc(m.text)).join('\n') || 'なし'}</div>`);
  }
  return out.join('');
}
// NPCをタップしたときの「いまの活動・次の予定」(使用人は役職つき。家族は父・母)。主人公が知っている範囲だけ
function npcStatusHtml(tg) {
  if (!tg || tg.kind !== 'npc' || tg.id == null) return ''; try {
    const si = staffInfo(G, tg.id); if (si) return `<div class="tx"><b>${esc(si.jp)}</b>｜${esc(si.now)}${si.next ? '\n次の予定: ' + esc(si.next) : ''}${si.dest ? '\n担当場所: ' + esc(si.dest) : ''}</div>`;
    const h = G.hero; if (tg.id === h.father || tg.id === h.mother) { const a = activityOf(G, tg.id); if (a) return `<div class="tx"><b>${tg.id === h.father ? '父' : '母'}</b>：${esc(a.now)}${a.next ? '\n次の予定: ' + esc(a.next) : ''}</div>`; }
  } catch (e) { /* 表示できなければ何も出さない */ } return '';
}
function profileModal(id) {
  const d = G.world.describe(id); const r = G.hero.rel[id]; const p = G.world.pop; const nm = G.nameOf(id); const stx = npcStatusHtml({ kind: 'npc', id });
  const needs = d.needs ? ['', '車いすを使う', '白杖を使う', '', '聴こえにくい', '', '', '', '支援を受けて学ぶ'][d.needs & 15] || '配慮あり' : '';
  showModal(`<h2>${esc(nm)}</h2>${stx}<div class="tx">${d.age}歳 ・ ${esc(d.job)}${d.work ? '(' + esc(d.work) + ')' : ''}\n住まい: ${esc(d.home)}${d.school ? '\n学校: ' + esc(d.school) : ''}\n${p.spouse[id] >= 0 ? 'パートナー: ' + esc(G.nameOf(p.spouse[id])) + '\n' : ''}${r ? `親しさ: ${Math.round(r.aff)}/100 ${r.family ? '(家族)' : r.romance ? '(交際中)' : ''}` : 'まだ知り合っていません'}${needs ? '\n暮らしの配慮: ' + needs : ''}\n人物ID: P${String(id).padStart(5, '0')}</div>${careerHtml(id, false)}<div class="row">${btn('閉じる', 'sec')}</div>`, c => c.querySelector('.btn').onclick = closeModal);
}

// ---------------- メニュー(地図/予定/人物/持物/日記/時間/設定)
function mapModal() {
  const L = G.S.loc; const pos = L.k === 'out' ? { x: L.x, y: L.y, f: L.f } : { x: G.bld(L.b).doorX, y: G.bld(L.b).doorY, f: 'd' };
  showModal(`<h2>地図・検索・道案内</h2><div class="formrow" style="justify-content:flex-start"><input id="mq" placeholder="名前・種類で検索(例: 病院 / 学校 / 駅 / ラーメン)" style="flex:1;min-width:200px"> ${btn('検索', 'acc')} <select id="mmode"><option value="0">徒歩</option><option value="1" ${U.routeMode === 1 ? 'selected' : ''}>車いす</option><option value="2" ${U.routeMode === 2 ? 'selected' : ''}>白杖</option></select></div>
  <div class="small">近くの施設: ${[['病院', b => ['hospital', 'clinic'].includes(b.type)], ['学校', b => BTYPES[b.type].cat === 'school'], ['駅', b => b.type === 'station'], ['コンビニ', b => b.type === 'konbini'], ['市役所', b => b.type === 'cityhall']].map(([n]) => `<span class="pill" data-q="${n}" style="cursor:pointer">${n}</span>`).join('')}</div>
  <div style="display:flex;gap:6px;align-items:center;margin:4px 0"><button class="btn sec" id="mzin" style="min-width:48px;min-height:44px">＋</button><button class="btn sec" id="mzout" style="min-width:48px;min-height:44px">－</button><span class="small" id="mzl">地図の拡大縮小</span></div><div class="small">黄色の丸と▲=あなたの位置と向き ・ 白い点=いま入れる入口 ・ 赤=目的地と道順 ・ 白い丸=駅(色の線=鉄道) ・ 灰色の線=道路 ・ くすんだ緑の敷地=立入不可(墓地・公園など)</div><div id="mapwrap"><canvas id="mapcv"></canvas></div><div id="mres" class="list"></div><div class="row">${U.dest ? btn('案内をやめる', 'sec') : ''}${btn('閉じる', 'sec')}</div>`, c => {
    const mc = c.querySelector('#mapcv'); const redraw = () => { R.drawMinimapTo(mc, { hero: pos, route: U.route, dest: U.dest }); }; redraw();
    let mz = 1; const wrap = c.querySelector('#mapwrap'); const setMz = z => { const ow = mc.clientWidth; const oc = [(wrap.scrollLeft + wrap.clientWidth / 2) / ow, (wrap.scrollTop + wrap.clientHeight / 2) / (mc.clientHeight || 1)]; mz = Math.max(1, Math.min(4, z)); mc.style.width = (mz * 100) + '%'; wrap.scrollLeft = oc[0] * mc.clientWidth - wrap.clientWidth / 2; wrap.scrollTop = oc[1] * mc.clientHeight - wrap.clientHeight / 2; c.querySelector('#mzl').textContent = '地図 ×' + mz.toFixed(1); };
    c.querySelector('#mzin').onclick = () => setMz(mz + 0.5); c.querySelector('#mzout').onclick = () => setMz(mz - 0.5);
    const mp = new Map(); let md0 = 0, mz0 = 1; wrap.addEventListener('pointerdown', e => { mp.set(e.pointerId, [e.clientX, e.clientY]); if (mp.size === 2) { const [a, b] = [...mp.values()]; md0 = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; mz0 = mz; } });
    wrap.addEventListener('pointermove', e => { if (!mp.has(e.pointerId)) return; const pv = mp.get(e.pointerId); mp.set(e.pointerId, [e.clientX, e.clientY]); if (mp.size === 1 && e.pointerType !== 'mouse') { wrap.scrollLeft -= e.clientX - pv[0]; wrap.scrollTop -= e.clientY - pv[1]; } if (mp.size === 2) { const [a, b] = [...mp.values()]; setMz(Math.round(mz0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / md0 * 2) / 2); } });
    const mpEnd = e => mp.delete(e.pointerId); wrap.addEventListener('pointerup', mpEnd); wrap.addEventListener('pointercancel', mpEnd);
    mc.onclick = e => { const r = mc.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * G.world.map.W, y = (e.clientY - r.top) / r.height * G.world.map.H; let best = null, bd = 1e9; for (const b of G.world.map.buildings) { const d = Math.abs(b.x + b.w / 2 - x) + Math.abs(b.y + b.h / 2 - y); if (d < bd) { bd = d; best = b; } } if (best && bd < 8) show([best]); };
    const show = list => { c.querySelector('#mres').innerHTML = list.length ? list.slice(0, 14).map(b => `<button class="btn item" data-b="${b.idx}">${esc(b.name)} <span class="small">(${esc(BTYPES[b.type].label)}・${esc(b.addr)}・${!BTYPES[b.type].enter ? '入れません(外から眺める)' : isOpenFor(G, b).ok ? '入れる' : '今は入れない'}・約${Math.abs(b.doorX - pos.x) + Math.abs(b.doorY - pos.y) | 0}タイル)</span></button>`).join('') : '<div class="tx small">見つかりません</div>'; c.querySelectorAll('#mres button').forEach(bb => bb.onclick = () => { setDest(G.bld(+bb.dataset.b), +c.querySelector('#mmode').value); const rep = U.route ? describeRoute(G.world.map, U.route, G.bld(+bb.dataset.b).name) : ['経路が見つかりません']; redraw(); c.querySelector('#mres').innerHTML = `${routeSummary(c, G.bld(+bb.dataset.b), rep)}${U.routeMode === 1 ? '<div class="small">車いす向け: 砂地・畑・段差のある所を避けた経路です。</div>' : ''}`; wireTaxi(c, +bb.dataset.b); wireAuto(c, G.bld(+bb.dataset.b)); }); };
    c.querySelector('.acc').onclick = () => show(buildingMatches(G.world, c.querySelector('#mq').value));
    c.querySelectorAll('.pill[data-q]').forEach(p => p.onclick = () => { const q = p.dataset.q; const pred = { 病院: b => ['hospital', 'clinic'].includes(b.type), 学校: b => BTYPES[b.type].cat === 'school', 駅: b => b.type === 'station', コンビニ: b => b.type === 'konbini', 市役所: b => b.type === 'cityhall' }[q]; show(nearestOfType(G.world, pos.x, pos.y, pred, 6).map(x => x.b)); });
    const bs = c.querySelectorAll('.row .btn'); bs[bs.length - 1].onclick = closeModal; if (bs.length > 1) bs[0].onclick = () => { clearDest(); closeModal(); };
  });
}

// 道案内の要約(100行超の経路は出さない): 距離・徒歩の目安・次の曲がり角+「自動で歩く/タクシー/駅から」
function routeSummary(c, b, rep) {
  const tiles = U.route ? U.route.length : 0; const m = tiles * 2, walkMin = Math.max(1, Math.round(m / 80)); const turns = Math.max(0, rep.length - 2);
  const dist = m >= 1000 ? (m / 1000).toFixed(1) + 'km' : Math.round(m) + 'm'; const far = tiles > 120;
  const steps = rep.slice(0, 3).map((t, i) => `${i + 1}. ${esc(t)}`).join('\n'); const more = rep.length > 3 ? `\n…あと${turns}回曲がって、${esc(b.name)}に到着` : '';
  return `<h3>${esc(b.name)}</h3><div class="small">入口まで ${dist}(徒歩 約${walkMin}分)${far ? ' ・ 遠いので「自動で歩く」かタクシーがおすすめ' : ''}</div><div class="row"><button class="btn acc" id="autoBtn">🚶 自動で歩く</button>${far ? '<button class="btn" id="stBtn">🚉 駅から行く</button>' : ''}</div><div class="tx small">次: ${steps}${more}</div>`;
}
function wireAuto(c, b) {
  const ab = c.querySelector('#autoBtn'); if (ab) ab.onclick = () => { closeModal(); if (G.S.loc.k === 'in') { U.pendingDest = b.idx; awStart({ kind: 'exit' }, '出口から外へ出て、' + b.name + 'へ向かいます'); } else awStart({ kind: 'door', b: b.idx, x: b.doorX, y: b.doorY, label: b.name, enter: false }, b.name + 'へ歩きます(■止まるで中止)'); };
  const sb = c.querySelector('#stBtn'); if (sb) sb.onclick = () => { const st = nearestOfType(G.world, G.S.loc.k === 'out' ? G.S.loc.x : G.bld(G.S.loc.b).doorX, G.S.loc.k === 'out' ? G.S.loc.y : G.bld(G.S.loc.b).doorY, x => x.type === 'station', 1)[0]; if (!st) { toast('近くに駅がありません'); return; } setDest(st.b, 0); closeModal(); toast('まず最寄りの駅へ向かいます。券売機・改札・ホームから電車に乗れます'); };
}
// 道案内の下に「タクシーで行く」を出す(屋外・12歳以上。運賃と所要時間の目安つき)
function wireTaxi(c, bi) {
  const dest = G.bld(bi), L = G.S.loc; if (!U.route || (G.age() < 12 && !testBypass(G, 'age'))) return;
  const tiles = U.route.length, q = taxiQuote(G, tiles); const box = c.querySelector('#mres');
  box.insertAdjacentHTML('beforeend', `<div class="row"><button class="btn acc" id="taxiBtn">🚕 タクシーで行く(約${q.mins}分・約¥${q.fare.toLocaleString('ja-JP')}${q.night ? '・夜間割増' : ''})</button></div>`);
  { const ds = nearestStop(G.world.map, dest.doorX, dest.doorY), os = nearestStop(G.world.map, L.k === 'out' ? L.x : G.bld(L.b).doorX, L.k === 'out' ? L.y : G.bld(L.b).doorY);   // 屋内にいるときは建物の入口の座標(屋内座標を地図座標に使わない)
    if (ds && os && os.tiles <= BUS_REACH && ds.stop.id !== os.stop.id && ds.tiles < tiles - 12) { const bq = busQuote(G, os.stop, ds.stop);
      box.insertAdjacentHTML('beforeend', `<div class="row"><button class="btn" id="busBtn">🚌 バスで${esc(ds.stop.name)}前へ(${bq.running ? `待ち約${bq.wait}分+乗車${bq.ride}分・¥${bq.fare.toLocaleString('ja-JP')}` : '運行時間外 6:00〜22:30'})</button></div>`);
      c.querySelector('#busBtn').onclick = () => { const r = busRide(G, ds.stop); if (!r.ok) { toast(r.msg); return; } sfx.car(); closeModal(); updateHud(true); const sids = sceneIds('bus', r.q.mins); playScene({ kind: 'bus', ids: sids.slice(0, 8), stand: sids.slice(8),  label: `${r.from.name}前 → ${ds.stop.name}前`, text: `バスに乗っています(約${r.q.mins}分)`, dur: 3.4 }, () => toast(r.msg + ' 目的地へは歩いて向かいましょう', 3600)); }; } }
  { const ca = chauffeurAvail(G); if (G.hero.family && G.hero.family.staffIds && G.hero.family.staffIds.driver) { box.insertAdjacentHTML('beforeend', `<div class="row"><button class="btn acc" id="chBtn" ${ca.ok ? '' : 'disabled'}>🚘 専属運転手に送迎を頼む(親の車・無料)${ca.ok ? '' : ' ― ' + esc(ca.msg)}</button></div>`);
      const cb = c.querySelector('#chBtn'); if (cb) cb.onclick = () => { const r = taxiTripBegin(G, dest, tiles, { chauffeur: true }); if (r.ok && r.real) { sfx.car(); clearDest(); closeModal(); updateHud(true); toast(r.msg, 5000); return; } if (!r.ok) { toast(r.msg); return; } sfx.car(); clearDest(); closeModal(); updateHud(true); playScene({ kind: 'taxi', ids: sceneIds('taxi', r.q.mins), fare: 0, text: `専属運転手の送迎で${dest.name}へ(約${r.q.mins}分)`, dur: 3.2 }, () => toast(r.msg)); }; } }
  c.querySelector('#taxiBtn').onclick = () => { const r = taxiTripBegin(G, dest, tiles); if (r.ok && r.real) { sfx.car(); clearDest(); closeModal(); updateHud(true); toast(r.msg, 5000); return; } if (!r.ok) { toast(r.msg); return; } sfx.car(); clearDest(); closeModal(); updateHud(true); playScene({ kind: 'taxi', ids: sceneIds('taxi', r.q.mins), fare: r.q.fare, text: `タクシーで${dest.name}へ(約${r.q.mins}分)`, dur: 3.2 }, () => toast(r.msg)); };
}

// 「移動」: タクシー・バス・電車を、地図を開かなくても直接呼ぶ入口(2026-10-22 実機試遊: 「タクシーが呼べない」への対応)。
//  行き先は「近くの施設/名前で検索」から選ぶ。選ぶと道案内(入口の位置)・タクシー・バスの選択肢が出る。電車は駅の中(券売機・ホーム)で乗る。
function moveModal() {
  const L = G.S.loc; const inB = L.k === 'in'; const cb = inB ? G.bld(L.b) : null; const pos = inB ? { x: cb.doorX, y: cb.doorY } : { x: L.x, y: L.y };
  const picks = [['最寄りの駅', b => b.type === 'station'], ['スタジアム', b => b.type === 'stadium'], ['空港', b => b.type === 'airport'], ['フェリー', b => b.type === 'ferry'], ['病院', b => ['hospital', 'clinic'].includes(b.type)], ['市役所', b => b.type === 'cityhall'], ['コンビニ', b => b.type === 'konbini'], ['温泉', b => b.type === 'onsenbath' || b.type === 'ryokan'], ['学校', b => BTYPES[b.type].cat === 'school']];
  showModal(`<h2>移動(タクシー・バス・電車)</h2><div class="tx small">${inB ? esc(cb.name) + 'の中' : '外'}にいます。行き先を選ぶと、タクシー(玄関の前まで)・バス(駅前の停留所まで)・徒歩の道案内が出ます。電車は駅の中の券売機・ホームから乗ります。${G.age() < 12 && !testBypass(G, 'age') ? '\n12歳未満はひとりでタクシーに乗れません。' : ''}</div>
    <div class="formrow" style="justify-content:flex-start"><input id="mq" placeholder="行き先(名前・種類。例: 駅 / スタジアム / 病院)" style="flex:1;min-width:200px"> ${btn('探す', 'acc')}</div>
    <div class="small">${picks.map(([n]) => `<span class="pill" data-q="${n}" style="cursor:pointer">${n}</span>`).join('')}<span class="pill" data-home="1" style="cursor:pointer">自宅</span></div>
    <div id="mres" class="list" style="margin-top:6px"></div><div class="row">${btn('閉じる', 'sec')}</div>`, c => {
    const show = list => { c.querySelector('#mres').innerHTML = list.length ? list.slice(0, 12).map(b => `<button class="btn item" data-b="${b.idx}">${esc(b.name)} <span class="small">(${esc(BTYPES[b.type].label)}・${esc(b.addr || '')}${b.status === 'closed' ? '・閉店中' : ''}・約${Math.abs(b.doorX - pos.x) + Math.abs(b.doorY - pos.y) | 0}タイル)</span></button>`).join('') : '<div class="tx small">見つかりません</div>';
      c.querySelectorAll('#mres button').forEach(bb => bb.onclick = () => { const b = G.bld(+bb.dataset.b); setDest(b, 0); const rep = U.route ? describeRoute(G.world.map, U.route, b.name) : ['経路が見つかりません']; c.querySelector('#mres').innerHTML = `<h3>${esc(b.name)}</h3><div class="small">${!BTYPES[b.type].enter ? '・外から眺める施設(中には入れません)' : isOpenFor(G, b).ok ? '・いま入れます' : '・' + esc(isOpenFor(G, b).msg || '今は入れません')}</div></div>` + routeSummary(c, b, rep) + `<div class="row"><button class="btn sec" id="mapBtn">地図で道案内を見る</button></div>`; c.querySelector('#mapBtn').onclick = () => { closeModal(); mapModal(); }; wireTaxi(c, b.idx); wireAuto(c, b); }); };
    c.querySelector('.acc').onclick = () => show(buildingMatches(G.world, c.querySelector('#mq').value));
    c.querySelectorAll('.pill[data-q]').forEach(p => p.onclick = () => { const pr = picks.find(x => x[0] === p.dataset.q); show(nearestOfType(G.world, pos.x, pos.y, pr[1], 6).map(x => x.b)); });
    c.querySelector('.pill[data-home]').onclick = () => show([G.bld(G.hero.homeB)]);
    c.querySelector('.row .btn').onclick = closeModal;
  });
}
function planModal() {
  const h = G.hero, d = G.date(); const lines = [];
  if (G.isStudentNow()) lines.push(`学校: ${esc(G.bld(h.edu.b).name)}(${G.isSchoolDay() ? '今日は登校日・8:20〜15:30' : '今日は休み'})`);
  if (h.job) { const [a, e] = G.shiftOf(h.job); lines.push(`仕事: ${esc(JOBS[h.job.jobId].name)} @${esc(G.bld(h.job.b).name)} ${G.workDayFor(h.job) ? `今日の勤務 ${a}:00〜${e}:00` : '今日は休み'} / 今月の勤務 ${G.S.m.hours}時間`); }
  { const si = scenarioInfo(G); if (si) lines.push(`目標: ${esc(si.goal)}(${si.state === 'won' ? '達成!' : si.state === 'lapsed' ? '期限切れ・人生は続く' : `あと${Math.max(0, Math.ceil((si.deadlineM - G.S.M) / 12 * 10) / 10)}年`})`); }
  const hist = WORLD_EVENTS.filter(e => e.y >= G.year() && e.y <= G.year() + 1).slice(0, 4);
  showModal(`<h2>予定・メモ</h2><div class="tx">${lines.join('\n') || '特別な予定はありません。'}\n\n住まい: ${esc(G.homeName())}${h.homeIsParents ? '(実家)' : ''}\n${h.spouse != null ? 'パートナー: ' + esc(G.nameOf(h.spouse)) : ''}</div><h3>街のカレンダー</h3><div class="tx small">${hist.map(e => `${e.y}年${e.m}月 ${esc(e.text)}`).join('\n') || '(近い予定なし)'}</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => c.querySelector('.btn').onclick = closeModal);
}
function peopleModal() {
  const h = G.hero; const ids = Object.keys(h.rel).map(Number).filter(i => !G.world.pop.gone[i]).sort((a, b) => h.rel[b].aff - h.rel[a].aff);
  const par = parentsOf(G); const parHtml = par.length ? `<div class="tx small" style="margin-bottom:6px"><b>ご両親</b>\n${par.map(c => `${c.role}: ${esc(c.name)}(${c.sex}・${c.gone ? '故人' : c.age + '歳'}・${esc(c.job)})`).join('\n')}</div><div class="row" style="margin-bottom:6px"><button class="btn sec" id="parbtn">両親の詳しい情報</button></div>` : '';
  showModal(`<h2>人物(${ids.length}人)</h2>${parHtml}<div class="list">${ids.slice(0, 60).map(i => { const r = h.rel[i]; const d = G.world.describe(i); return `<button class="btn item" data-i="${i}">${esc(G.nameOf(i))} <span class="small">${d.age}歳 ・ ${esc(d.job)} ・ 親しさ${Math.round(r.aff)} ${r.family ? '・家族' : ''}${r.romance ? '・交際中' : ''}</span></button>`; }).join('') || '<div class="tx">まだ知り合いがいません。街で人に話しかけてみましょう。</div>'}</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => { c.querySelectorAll('button.item').forEach(b => b.onclick = () => profileModal(+b.dataset.i)); const cb = c.querySelectorAll('.row .btn'); cb[cb.length - 1].onclick = closeModal; const pb = c.querySelector('#parbtn'); if (pb) pb.onclick = parentsModal; });
}
function parentsModal() {
  const par = parentsOf(G); showModal(`<h2>ご両親</h2>${par.map(c => `<div class="tx"><b>${c.role}</b>: ${esc(c.name)}\n性別: ${c.sex}　年齢: ${c.gone ? '故人(享年' + c.age + '歳)' : c.age + '歳'}\n職業: ${esc(c.job)}${c.work ? '(' + esc(c.work) + ')' : ''}\n外見: ${esc(c.look)}\n主人公との関係: ${esc(G.hero.name)}の${c.role}(実の${c.role === '父' ? '父親' : '母親'})\n人物ID: P${String(c.id).padStart(5, '0')}</div><div class="row"><button class="btn sec" data-p="${c.id}">この人を見る</button></div>`).join('')}<div class="tx small"><b>誕生時の家庭</b>\n${householdAtBirth(G).map(esc).join('\n')}</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => { c.querySelectorAll('[data-p]').forEach(b => b.onclick = () => profileModal(+b.dataset.p)); const cb = c.querySelectorAll('.row .btn'); cb[cb.length - 1].onclick = closeModal; });
}
function itemsModal() {
  const h = G.hero; const sk = Object.entries(h.skills).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const S = h.stats; showModal(`<h2>持ち物・ステータス</h2><div class="tx">所持金 ${yen(h.money)} ${h.debt ? ' / 借入 ' + yen(h.debt) : ''}\n食材ストック ${h.inv.food.toFixed(1)}\n学歴: ${['未就学', '', '小学校卒', '中学校卒', '高校卒', '大学卒'][h.edu.level] || '-'}${h.edu.cur ? ' / 在学中' : ''}\n性別: ${sexLabel(sexOf(G))}\n資格: ${Object.keys(h.quals).map(k => QUALS[k]).join('、') || 'なし'}\n仕事: ${h.job ? JOBS[h.job.jobId].name + '@' + G.bld(h.job.b).name : 'なし'}\n</div><h3>ステータス</h3><div class="tx">健康 ${Math.round(S.health)} ・ 体力 ${Math.round(S.energy)} ・ 満腹 ${Math.round(S.hunger)} ・ 気分 ${Math.round(S.mood)}\n学力 ${Math.round(S.intel)} ・ 運動 ${Math.round(S.fitness)} ・ 社交 ${Math.round(S.social)} ・ 魅力 ${Math.round(S.charm)}</div>${careerHtml(h.id, true)}${drinkHtml()}${vehicleHtml()}<div class="row"><button class="btn" id="closetBtn">👕 クローゼット(服を着替える)</button></div><h3>得意なこと</h3><div class="tx small">${sk.map(([k, v]) => `${esc(k)} ${v.toFixed(1)}`).join(' / ') || 'まだありません'}</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => { bindCarsPanel(c, G, carD()); c.querySelectorAll('button[data-drink]').forEach(b => b.onclick = () => { const r = drinkGoods(G, b.dataset.drink); toast(r.msg, 3600); if (r.ok) { updateHud(true); } itemsModal(); }); c.querySelector('#closetBtn').onclick = () => closetModal(G, R, carD()); c.querySelectorAll('button[data-veh]').forEach(b => b.onclick = () => { const id = b.dataset.veh; const r = setRide(G, id === 'none' ? null : id); if (id === 'car') { sfx.carDoor(); setTimeout(() => sfx.engine(), 300); } else if (id === 'none') sfx.carDoor(); toast(r.msg, 2400); if (r.ok) { closeModal(); } }); c.querySelector('.row:last-child .btn').onclick = closeModal; });
}
const carD = () => ({ showModal, closeModal, toast, updateHud, sfx });
function drinkHtml() { const L = drinkList(G); if (!L.length) return ''; const left = drunkLeft(G); return `<h3>お酒(買ったもの)</h3><div class="tx small">${left > 0 ? `酔いが残っています(あと約${Math.ceil(left / 60)}時間は乗り物に乗れません)` : '飲むと気分が上がり、しばらく乗り物(車・バイク・自転車)に乗れません。20歳から。'}</div><div class="row" style="flex-wrap:wrap">${L.map(o => `<button class="btn" data-drink="${o.it.id}">${o.it.e} ${esc(o.it.n)}を飲む(×${o.n})</button>`).join('')}</div>`; }
function vehicleHtml() {
  const v = getVeh(G.hero), own = Object.keys(v.own).filter(k => k !== 'car'); const outside = G.S.loc.k === 'out'; const cars = carsPanelHtml(G);
  if (!own.length && !cars) return '';
  const bike = own.length ? `<h3>乗り物</h3><div class="tx small">${own.map(k => VEHICLES[k].name).join('・')}を持っています。乗れるのは屋外だけで、建物に入ると降ります。</div><div class="row" style="flex-wrap:wrap">${own.map(k => `<button class="btn ${v.ride === k ? 'acc' : ''}" data-veh="${k}" ${outside ? '' : 'disabled'}>${v.ride === k ? '乗車中: ' : ''}${VEHICLES[k].name}に乗る</button>`).join('')}${v.ride === 'bicycle' || v.ride === 'moto' ? '<button class="btn" data-veh="none">降りる</button>' : ''}</div>` : '';
  return bike + cars;
}
function diaryModal() {
  const L = G.S.log.filter(e => !['auto', 'news', 'event', 'history'].includes(e.kind) || e.kind === 'news' && G.hero.rel[e.who]?.aff >= 60).slice(-80).reverse();
  showModal(`<h2>日記(これまでの出来事)</h2><div class="tx small">ログ ${G.S.log.length}件(エンディングの回想は、この記録だけから作られます)</div><div class="tx">${L.map(e => `${fmtM(e.M)} ${esc(e.text)}`).join('\n') || '(まだ何もありません)'}</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => c.querySelector('.btn').onclick = closeModal);
}
function skipModal() {
  showModal(`<h2>時間をすすめる</h2><div class="tx">寝る・スキップ中は、毎日の暮らし(登校・勤務・食事など)が自動で進みます。重要な選択(進路・結婚・退職など)の所で止まります。</div><div class="list"><button class="btn item" data-k="day">次の朝まで(1日)</button><button class="btn item" data-k="week">1週間</button><button class="btn item" data-k="month">1か月(月のまとめへ)</button><button class="btn item" data-k="year">1年</button></div><div class="row">${btn('やめる', 'sec')}</div>`, c => {
    c.querySelectorAll('button.item').forEach(b => b.onclick = () => { closeModal(); const k = b.dataset.k; if (k === 'month') skipTo(G.S.M + 1, '1か月'); else if (k === 'year') skipTo(G.S.M + 12, '1年'); else { const n = k === 'week' ? 7 : 1; const M0 = G.S.M; let i = 0; while (i++ < n && !G.S.ended && !G.blocked() && G.S.M === M0) G.autoDay(); G.placeInHome(); U.cwAt = -999; toast(k === 'week' ? '1週間が過ぎました' : '朝になりました'); if (G.blocked()) setTimeout(openPrompt, 100); } });
    c.querySelector('.row .btn').onclick = closeModal;
  });
}
function soundModal() {
  const v = sfx.vol; const row = (k, nm) => `<div class="tx small">${nm}: <span id="v_${k}">${Math.round(v[k] * 100)}</span>%</div><input type="range" min="0" max="100" value="${Math.round(v[k] * 100)}" data-v="${k}" style="width:100%">`;
  showModal(`<h2>音量・字幕</h2>${row('sfx', '効果音')}${row('amb', '環境音(電車・車・自然・町)')}${row('mus', '音楽(BGM)')}<div class="list"><button class="btn item" id="cap">字幕(音を文字でも表示): ${v.cap ? 'ON' : 'OFF'}</button><button class="btn item" id="test">試しに鳴らす</button></div><div class="row"><button class="btn sec" id="x">戻る</button></div>`, c => {
    c.querySelectorAll('input[data-v]').forEach(i => i.oninput = () => { sfx.setVol(i.dataset.v, i.value / 100); c.querySelector('#v_' + i.dataset.v).textContent = i.value; });
    c.querySelector('#cap').onclick = () => { sfx.setVol('cap', !sfx.vol.cap); soundModal(); }; c.querySelector('#test').onclick = () => { sfx.unlock(); sfx.konbini(); sfx.tune('shotengai_new', 8); sfx.caption('音のテスト'); }; c.querySelector('#x').onclick = () => cfgModal();
  });
}

// 開発専用: 試験セッションの出入り(元の人生 U.normalG は一切変更せず保持。終了時にそのまま戻す)
function devBanner() { let el = document.getElementById('devBanner'); if (!el) { el = document.createElement('div'); el.id = 'devBanner'; el.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:60;background:#b3261e;color:#fff;font:bold 12px sans-serif;padding:2px 10px;border-radius:0 0 8px 8px;pointer-events:none;display:none'; el.textContent = '【試験セッション】通常セーブには保存されません'; document.body.appendChild(el); } el.style.display = isTestSession(G) ? 'block' : 'none'; }
function devCtx() { return { G: () => G, U, showModal, closeModal, toast, updateHud, clear: () => { clearDest(); clearInteriorCache(); },
  enterTest: t => { U.normalG = G; U.scale = 1; start(t, true); devBanner(); }, leaveTest: () => { const n = U.normalG; U.normalG = null; U.scale = 1; if (n) { start(n, true); devBanner(); } },
  showRoute: b => { setDest(b); mapModal(); } }; }
function cfgModal() {
  showModal(`<h2>設定・セーブ</h2><div class="list"><button class="btn item" data-k="ctl">🎮 操作設定(ジョイスティック・十字キー・タップ移動)</button><button class="btn item" data-k="s1">スロット1に保存</button><button class="btn item" data-k="s2">スロット2に保存</button><button class="btn item" data-k="exp">ファイルに書き出す(.json)</button><button class="btn item" data-k="load">保存データを開く</button><button class="btn item" data-k="lang">Language / 言語: ${LANGS[getLang()]}</button><button class="btn item" data-k="life">人生の長さ: ${G.S.lifeMode === 'natural' ? '個人差あり(早世もある)' : '80年固定'}</button><button class="btn item" data-k="namefix">家族の名字の確認・修復</button><button class="btn item" data-k="guides">入口・階段などの案内表示: ${guidesOn() ? 'ON' : 'OFF'}</button><button class="btn item" data-k="snd">サウンド: ${sfx.enabled ? 'ON' : 'OFF'}</button><button class="btn item" data-k="vol">音量・字幕の設定</button><button class="btn item" data-k="big">文字を大きくする: ${U.big ? 'ON' : 'OFF'}</button><button class="btn item" data-k="speed">時間の流れ: ${U.scale === 0 ? '止める' : U.scale + '倍'}</button><button class="btn item" data-k="diag">端末診断(Android実機検証・5秒)</button><button class="btn item" data-k="title">タイトルへ</button></div>${devToolsEnabled() ? `<div class="tx small" style="margin-top:8px;border:1px dashed #f90;padding:6px"><b>🛠 開発・試験用(公開版では表示されません)</b>\n試験用の所持金MAXは通常の収支・実績・セーブから分離されます。ONにすると通常の所持金を退避し、OFFで厳密に戻します。\n状態: ${isTestMode(G) ? '<b>ON(テスト中)</b>' : 'OFF'}</div><div class="list"><button class="btn item" data-k="tmoney">${isTestSession(G) ? '【試験セッション中】開発者パネル(終了・年齢/日付/時刻・施設一覧)' : '開発者: 試験セッション(別の複製で試験。通常セーブは変わりません)'}</button><button class="btn item" data-k="freeplay">${freePlayOn(G) ? '自由試遊をOFF(年齢による行動制限を戻す)' : '自由試遊をON(年齢制限を解除・開発用)'}</button></div>` : ''}<div class="small">NAGAYAMA ☆LAB / 保存は「人生物語・日本モデル都市」専用の領域で、他の作品のデータには触れません。</div><div class="row">${btn('閉じる', 'sec')}</div>`, c => {
    c.querySelectorAll('button.item').forEach(b => b.onclick = async () => { const k = b.dataset.k;
      if (k === 's1' || k === 's2') { try { await saveSlot(k.slice(1), G, { name: G.hero.name, label: fmtM(G.S.M) + ' ' + G.age() + '歳' }); toast('保存しました'); } catch (e) { toast('保存できません: ' + e.message); } closeModal(); }
      else if (k === 'exp') { const blob = new Blob([toJSON(G.serialize())], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nagayama_lifestory_${G.hero.name}_${fmtM(G.S.M)}.json`; a.click(); closeModal(); }
      else if (k === 'load') { closeModal(); const sl = await listSlots(); sl.length ? slotMenu(sl) : toast('保存データがありません'); }
      else if (k === 'namefix') { const is = G.nameCheck(); if (!is.length) { toast('名字と家族関係に問題は見つかりません'); return; } showModal(`<h2>家族の名字の確認</h2><div class="tx">${is.map(esc).join('<br>')}\n\nどちらに合わせますか?(人物ID・親子関係は変わりません)</div><div class="row"><button class="btn acc" id="nf1">家族を主人公の名字に合わせる</button><button class="btn sec" id="nf2">主人公を家族の名字に合わせる</button><button class="btn sec" id="nf3">そのままにする</button></div>`, c2 => { c2.querySelector('#nf1').onclick = () => { G.repairNames('family'); closeModal(); toast('家族の名字を整えました'); updateHud(true); }; c2.querySelector('#nf2').onclick = () => { G.repairNames('hero'); closeModal(); toast('主人公の名字を家族に合わせました'); updateHud(true); }; c2.querySelector('#nf3').onclick = closeModal; }); }
      else if (k === 'guides') { setGuides(!guidesOn()); toast(guidesOn() ? '案内表示をONにしました' : '案内表示をOFFにしました'); cfgModal(); }
      else if (k === 'life') { const nat = G.S.lifeMode !== 'natural'; G.setLifeMode(nat ? 'natural' : 'fixed'); toast(nat ? '寿命に個人差が出ます(80年より前に人生を終えることがあります)' : '80年(960か月)の人生に戻しました', 3600); cfgModal(); }
      else if (k === 'freeplay') { setFreePlay(G, !freePlayOn(G)); toast(freePlayOn(G) ? '自由試遊: 年齢制限を解除しました' : '年齢による行動制限を戻しました'); closeModal(); }
      else if (k === 'tmoney') { closeModal(); devPanel(devCtx()); }
      else if (k === 'diag') { toast('5秒間、描画性能を計測します…', 2500); const d = await runDiag(R, G, 5); const tx = diagText(d); showModal(`<h2>端末診断</h2><pre class="tx small" style="white-space:pre-wrap;user-select:all">${esc(tx)}</pre><div class="row"><button class="btn acc" id="cp">コピー</button><button class="btn sec" id="x">閉じる</button></div>`, c2 => { c2.querySelector('#cp').onclick = async () => { try { await navigator.clipboard.writeText(tx + '\n' + JSON.stringify(d)); toast('コピーしました'); } catch (e) { toast('コピーできません(長押しで選択してください)'); } }; c2.querySelector('#x').onclick = closeModal; }); window.__diag = d; }
      else if (k === 'ctl') { ctlModal(); }
      else if (k === 'lang') { setLang(nextLang()); cfgModal(); }
      else if (k === 'snd') { sfx.set(!sfx.enabled); cfgModal(); }
      else if (k === 'vol') { soundModal(); }
      else if (k === 'big') { U.big = !U.big; document.body.classList.toggle('big', U.big); cfgModal(); }
      else if (k === 'speed') { U.scale = U.scale === 1 ? 2 : U.scale === 2 ? 0 : 1; cfgModal(); }
      else if (k === 'title') { await autosave(); location.reload(); } });
    c.querySelector('.row .btn').onclick = closeModal;
  });
}
function endingScreen() {
  if (U.modal || U.endShown) return; U.endShown = true; const e = buildEnding(G);
  showModal(`<h2>${esc(G.hero.name)}の人生</h2><div class="tx">${esc(e.summary)}</div>${e.sections.map(s => `<h3>${esc(s.title)}</h3><div class="tx">${s.lines.map(l => esc(l.text)).join('\n')}</div>`).join('')}<h3>数字で見る</h3><div class="tx small">${Object.entries(e.facts).map(([k, v]) => `${k}: ${v}`).join(' / ')}</div><div class="row">${btn('タイトルへ', 'acc')}</div>`, c => c.querySelector('.btn').onclick = () => location.reload());
}

// ---------------- 入力
document.querySelectorAll('#menubar button').forEach(b => b.onclick = () => { if (!G || U.modal || G.blocked()) return; ({ map: mapModal, move: moveModal, plan: planModal, people: peopleModal, items: itemsModal, diary: diaryModal, skip: skipModal, cfg: cfgModal })[b.dataset.m](); });
$('btnA').addEventListener('pointerdown', e => { e.preventDefault(); pressA(); });
$('btnB').addEventListener('pointerdown', e => { e.preventDefault(); input.run = !input.run; $('btnB').textContent = input.run ? '走る中' : '走る'; $('btnB').style.background = input.run ? '#fb8c00cc' : '#1e88e5cc'; });
const joy = $('joy'); let joyId = null; const knob = joy.querySelector('i'); let joyC = null; // joyC: ジョイスティック中心(固定/浮動)
const joyCenter = () => { const r = joy.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, max: r.width / 2 }; };
// 操作設定(代表者P0 2026-10-23): 指をほんの少し動かすだけで向きが変わる/感度・大きさ・固定か浮動か・十字キー
const CTL = (() => { let o = {}; try { o = JSON.parse(localStorage.getItem('nls_ctl') || '{}'); } catch (_) { } return { mode: o.mode === 'fixed' ? 'fixed' : 'float', size: +o.size || 1, sens: +o.sens || 1.8, dpad: !!o.dpad, tap: o.tap !== false }; })();
const ctlSave = () => { try { localStorage.setItem('nls_ctl', JSON.stringify(CTL)); } catch (_) { } };
const ctlApply = () => { const w = Math.round(128 * CTL.size); joy.style.width = joy.style.height = w + 'px'; knob.style.left = knob.style.top = Math.round((w - 40) / 2) + 'px'; document.body.classList.toggle('dpadmode', CTL.dpad); };
const joyMove = e => { const c = joyC || joyCenter(); let dx = e.clientX - c.x, dy = e.clientY - c.y; const max = c.max; const eff = Math.max(14, max / CTL.sens); const d = Math.hypot(dx, dy); const kd = Math.min(d, max); const kx = d ? dx / d * kd : 0, ky = d ? dy / d * kd : 0; knob.style.transform = `translate(${kx}px,${ky}px)`;
  // 小さな動きでも向きが変わる(不感帯は小さく)・滑らかに立ち上がる(0→1 を 2乗でなく 1.3乗)。指を離せば確実に0(resetJoy)
  const m = Math.min(1, d / eff), dead = 0.12; if (m < dead) { input.x = 0; input.y = 0; return; } const k = Math.pow((m - dead) / (1 - dead), 1.3); input.x = dx / d * k; input.y = dy / d * k; };
const resetJoy = () => { joyId = null; joyC = null; input.x = 0; input.y = 0; if (input.run) { input.run = false; const bb = document.getElementById('btnB'); if (bb) { bb.textContent = '走る'; bb.style.background = '#1e88e5cc'; } } knob.style.transform = ''; joy.classList.remove('fl'); joy.style.left = joy.style.top = ''; };
joy.addEventListener('pointerdown', e => { e.preventDefault(); if (joyId != null) return; joyId = e.pointerId; joyC = null; try { joy.setPointerCapture(joyId); } catch (_) { } joyMove(e); }); joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) joyMove(e); });
const joyEnd = e => { if (e.pointerId === joyId) resetJoy(); }; joy.addEventListener('pointerup', joyEnd); joy.addEventListener('pointercancel', joyEnd); joy.addEventListener('lostpointercapture', joyEnd);
// 画面左側のどこでも浮動ジョイスティック、2本指でピンチ拡大縮小
const cvPtrs = new Map(); let pinch0 = 0, pinchZ = 0;
const zoomStep = dz => { if (!R) return;
  if (G && G.S.loc && G.S.loc.k === 'in') { const z0 = R.izl ?? 1; R.izl = Math.max(-2, Math.min(8, z0 + dz)); try { localStorage.setItem('nls_izoom', String(R.izl)); } catch (_) { } return; }   // 屋内の拡大(部屋に収まる倍率からの段階)
  R.zoomBy(dz); try { localStorage.setItem('nls_zoom', String(R.zl)); } catch (_) { } };
cv.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return; if (U.modal) return;
  cvPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); U.tap = cvPtrs.size === 1 ? { id: e.pointerId, t: performance.now(), x: e.clientX, y: e.clientY, moved: false } : null;
  if (cvPtrs.size >= 2) { U.tap = null; resetJoy(); const [a, b] = [...cvPtrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y) || 1; pinchZ = 0; return; }
  const r = cv.getBoundingClientRect(); if (e.pointerType === 'mouse' || CTL.mode === 'fixed' || CTL.dpad || e.clientX - r.left > r.width * 0.55 || joyId != null) return;
  e.preventDefault(); const jr = joyCenter(); joyId = e.pointerId; joyC = { x: e.clientX, y: e.clientY, max: jr.max };
  const ar = $('app').getBoundingClientRect(); joy.classList.add('fl'); joy.style.left = (e.clientX - ar.left - jr.max) + 'px'; joy.style.top = (e.clientY - ar.top - jr.max) + 'px';
  try { cv.setPointerCapture(e.pointerId); } catch (_) { } knob.style.transform = '';
});
cv.addEventListener('pointermove', e => {
  const p = cvPtrs.get(e.pointerId); if (!p) return; p.x = e.clientX; p.y = e.clientY; if (U.tap && U.tap.id === e.pointerId && Math.hypot(e.clientX - U.tap.x, e.clientY - U.tap.y) > 14) U.tap.moved = true;
  if (cvPtrs.size >= 2) { const [a, b] = [...cvPtrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y) || 1; const st = Math.round(Math.log2(d / pinch0) * 2); if (st !== pinchZ) { zoomStep(st - pinchZ); pinchZ = st; } return; }
  if (e.pointerId === joyId && joyC) joyMove(e);
});
const cvUp = e => { if (e.type === 'pointerup' && U.tap && U.tap.id === e.pointerId && !U.tap.moved && performance.now() - U.tap.t < 380) { const tp = U.tap; U.tap = null; try { handleTap(tp.x, tp.y); } catch (er) { console.error(er); } } else if (U.tap && U.tap.id === e.pointerId) U.tap = null; cvPtrs.delete(e.pointerId); if (e.pointerId === joyId) resetJoy(); if (cvPtrs.size < 2) pinch0 = 0; };
cv.addEventListener('pointerup', cvUp); cv.addEventListener('pointercancel', cvUp); cv.addEventListener('lostpointercapture', cvUp);
cv.addEventListener('touchstart', e => { e.preventDefault(); }, { passive: false });
$('zin').addEventListener('click', () => zoomStep(1)); $('zout').addEventListener('click', () => zoomStep(-1));
cv.addEventListener('wheel', e => { if (U.modal) return; e.preventDefault(); zoomStep(e.deltaY < 0 ? 1 : -1); }, { passive: false });
const resetAllInput = () => { input.keys.clear(); resetJoy(); cvPtrs.clear(); U.tap = null; };
window.addEventListener('blur', resetAllInput); document.addEventListener('visibilitychange', () => { if (document.hidden) resetAllInput(); });
ctlApply();
// 十字キー(押している間だけ歩く)
document.querySelectorAll('#dpad button').forEach(b => { const key = { u: 'ArrowUp', d: 'ArrowDown', l: 'ArrowLeft', r: 'ArrowRight' }[b.dataset.d]; const on = e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) { } input.keys.add(key); }; const off = () => input.keys.delete(key); b.addEventListener('pointerdown', on); for (const ev of ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture']) b.addEventListener(ev, off); });
// 時間: 停止/低速/通常/高速(街を歩く・見学している間に何時間も過ぎないように)
const TS = [0, 0.25, 1, 3]; const tsApply = () => { document.querySelectorAll('#tctl button').forEach(b => b.classList.toggle('on', +b.dataset.s === U.scale)); };
try { const v = +localStorage.getItem('nls_tscale'); if (TS.includes(v) && localStorage.getItem('nls_tscale') != null) U.scale = v; } catch (_) { } tsApply();
document.querySelectorAll('#tctl button').forEach(b => b.onclick = () => { U.scale = +b.dataset.s; try { localStorage.setItem('nls_tscale', String(U.scale)); } catch (_) { } tsApply(); toast(U.scale === 0 ? '時間を止めました(歩いても時刻は進みません)' : U.scale < 1 ? '低速(ゆっくり)' : U.scale === 1 ? '通常の速さ' : '高速', 1600); });
$('awStop').onclick = () => { AW.cancel('中止しました'); toast('自動移動を止めました', 1400); };
$('goHome').onclick = () => homeBtn(); $('floorBtn').onclick = () => floorGuideModal();
window.addEventListener('pagehide', resetAllInput);
// サウンド: 最初のタッチ/キーで音声を有効化。ボタンを押すと小さな音。環境音は屋内外・夜で変わる
sfx.setMood(() => ({ inside: !!G && G.S.loc.k === 'in', night: !!G && (G.S.min >= 20 * 60 || G.S.min < 6 * 60) }));
sfx.setCaptionHook(t => { const el = $('cap'); if (!el) return; el.textContent = '♪ ' + t; el.classList.add('on'); clearTimeout(U.capT); U.capT = setTimeout(() => el.classList.remove('on'), 3200); });
function setStreet(on) { if (on && G && G.S.loc.k !== 'out') { toast('通り視点は屋外で使えます'); return; } R.street = !!on; if (on) { if (!R.sv) initStreet(R); setYawFromFacing(R, G.S.loc.f); } try { localStorage.setItem('nls_street', on ? '1' : '0'); } catch (_) { } toast(on ? '通り視点: 左右で向きを変え、上下で前後に進みます' : '通常(アイソメ)視点に戻しました', 3200); }
$('zview').addEventListener('click', () => setStreet(!R.street)); window.addEventListener('keydown', e => { if ((e.key === 'v' || e.key === 'V') && G && R && !U.modal && !e.metaKey && !e.ctrlKey) setStreet(!R.street); });
window.NLSAudio = sfx; const unlockSnd = () => sfx.unlock(); window.addEventListener('pointerdown', unlockSnd, { passive: true }); window.addEventListener('keydown', unlockSnd);
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('button')) sfx.tap(); });
window.addEventListener('keydown', e => { if (U.modal) { if (e.key === 'Escape') closeModal(); return; } const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; input.keys.add(k); if (k === 'z' || k === 'Enter' || k === ' ') { pressA(); e.preventDefault(); } if (k === 'm') document.querySelector('[data-m=map]').click(); if (k.startsWith('Arrow')) e.preventDefault(); });
window.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; input.keys.delete(k); });
window.addEventListener('blur', () => resetAllInput());
document.addEventListener('visibilitychange', () => { if (document.hidden) resetAllInput(); if (document.hidden && G && U.started) autosave(); });
boot();
