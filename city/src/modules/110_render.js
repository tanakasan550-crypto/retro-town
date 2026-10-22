  // src/render.js
  var SKIN = [[255, 224, 196], [244, 205, 168], [214, 168, 124], [168, 120, 86]];
  var HAIR = [[40, 34, 42], [112, 74, 46], [150, 100, 62], [226, 190, 98], [178, 72, 52], [44, 56, 100], [232, 142, 172], [176, 176, 184]];
  var CLOTH = [[220, 70, 70], [70, 130, 220], [90, 180, 100], [240, 190, 60], [170, 100, 200], [240, 130, 60], [70, 190, 200], [230, 110, 160], [120, 120, 130], [250, 250, 250], [60, 60, 90], [160, 110, 70], [100, 160, 60], [200, 60, 120], [40, 90, 70], [190, 190, 120]];
  var MARK = { skin: [255, 0, 0], skinS: [200, 0, 0], hair: [0, 255, 0], hairS: [0, 190, 0], c1: [0, 0, 255], c1S: [0, 0, 190], c2: [255, 255, 0], c2S: [190, 190, 0], shoe: [255, 0, 255] };
  var sh2 = (c, f2) => c.map((v) => Math.max(0, Math.min(255, Math.round(v * f2))));
  var W01_K = 45 / 48 / (82 / 96);
  var CHAR_K = 0.7;
  var FEMALE_STYLE2 = /* @__PURE__ */ new Set([1, 2, 3, 4, 6]);
  var EYE_CLR = [[120, 72, 40], [60, 90, 170], [50, 50, 60], [70, 130, 90]];
  var ACC_TAB = [0, 0, 0, 2, 3, 4, 6, 5];
  function lookParts(look, age) {
    const hs = look & 7, hc = look >>> 3 & 7, sk2 = look >>> 6 & 3, c1 = look >>> 8 & 15, c2 = look >>> 12 & 15, hat = look >>> 16 & 7;
    const fem = FEMALE_STYLE2.has(hs);
    const kid = age < 13 ? 1 : 0;
    const r = look >>> 24 & 7;
    let outfit;
    if (kid) outfit = fem ? [0, 1, 1, 3][r & 3] : [0, 3, 0, 3][r & 3];
    else if (age <= 18) outfit = fem ? 2 : 4;
    else outfit = fem ? [0, 1, 1, 3, 1, 0, 3, 1][r] : [0, 3, 4, 4, 0, 3, 4, 4][r];
    let eye = look >>> 27 & 3;
    if (!fem && eye === 1) eye = 3;
    if (fem && eye === 3) eye = 0;
    const glass = (look >>> 29 & 7) === 0 && age >= 10 ? 1 : 0;
    let acc = ACC_TAB[look >>> 19 & 7];
    if (kid && acc === 5) acc = 2;
    if (age >= 60 && acc === 3) acc = 0;
    return { hs, hc: age >= 68 ? 7 : hc, sk: sk2, c1, c2, hat, outfit, eye, glass, acc, ec: look >>> 22 & 3, kid, fem };
  }
  async function loadAssets(base = "assets/") {
    const load = (src) => new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error("asset load failed: " + src));
      im.src = src;
    });
    const J = async (f2) => (await fetch(base + f2)).json();
    const A2 = { base };
    [A2.tiles, A2.deco, A2.chars, A2.hats, A2.aids, A2.vehicles, A2.interior, A2.chars2] = await Promise.all(["tiles.png", "deco.png", "chars.png", "hats.png", "aids.png", "vehicles.png", "interior.png", "chars2.png"].map((f2) => load(base + f2)));
    [A2.tileIdx, A2.decoIdx, A2.interiorIdx, A2.vehIdx, A2.manifest, A2.c2meta] = await Promise.all([J("tiles.json"), J("deco.json"), J("interior.json"), J("vehicles.json"), J("manifest.json"), J("chars2.json")]);
    try {
      const cj = await (await fetch(base + "cast.json")).json();
      A2.cast = { img: await load(base + "cast/atlas.png"), rows: cj.rows };
    } catch (e) {
      A2.cast = null;
    }
    try {
      const pj2 = await (await fetch(base + "props.json")).json();
      A2.props = { img: await load(base + "props.png"), p: pj2.p, k: pj2.scale };
    } catch (e) {
      A2.props = null;
    }
    try {
      const vj = await (await fetch(base + "veh.json")).json();
      A2.veh = { img: await load(base + "veh.png"), p: vj.p, k: vj.scale, dims: vj.dims };
    } catch (e) {
      A2.veh = null;
    }
    try {
      A2.parts = await loadParts(base.replace(/assets\/$/, ""));
    } catch (e) {
      A2.parts = null;
    }
    try {
      A2.w01 = { B: await load(base + "w01.png"), A: await load(base + "w01_32.png"), C: await load(base + "w01_hi.png") };
    } catch (e) {
      A2.w01 = null;
    }
    A2.c2row = {};
    A2.c2meta.rows.forEach((r, i) => {
      A2.c2row[r.kind + "|" + (r.outfit ?? r.eye ?? r.style ?? r.acc) + "|" + r.kid + "|" + (r.kind === "head" ? r.acc : 0)] = i;
    });
    A2.buildings = {};
    await Promise.all(Object.keys(A2.manifest.building_sizes).map(async (t) => {
      A2.buildings[t] = await load(base + "buildings/" + t + ".png");
    }));
    return A2;
  }
  var Renderer = class {
    constructor(canvas, A2, game, crowd) {
      this.cv = canvas;
      this.ctx = canvas.getContext("2d");
      this.A = A2;
      this.g = game;
      this.crowd = crowd;
      this.S = 3;
      this.charCache = /* @__PURE__ */ new Map();
      this.time = 0;
      this.cam = { x: 0, y: 0 };
      this.walkers = [];
      this.walkT = 0;
      this.trainsCache = { t: -1, v: [] };
      this.carsCache = { t: -1, v: [] };
      this.vehCache = /* @__PURE__ */ new Map();
      this.tmp = document.createElement("canvas");
      this.tmpx = this.tmp.getContext("2d", { willReadFrequently: true });
      initIso(this);
      this.hit = null;
      this.special = null;
      this.w01mode = "B";
      this.castOn = false;
      this.lifeOn = !/[?&](old=1|life=0)/.test(location.search);
      this.idCache = /* @__PURE__ */ new Map();
      this.lifeOv = /* @__PURE__ */ new Map();
    }
    // ズーム段階を変える(dz=+1で拡大)。戻り値: 実際に変わったか
    zoomBy(dz) {
      const z0 = this.S;
      this.zl = (this.zl || 0) + dz;
      this.resize();
      if (this.S === z0) this.zl = this.zlEff;
      return this.S !== z0;
    }
    zoomReset() {
      this.zl = 0;
      this.resize();
    }
    resize() {
      const dpr0 = Math.min(3, window.devicePixelRatio || 1), qs = this.qs || 1, dpr = dpr0 * qs;
      const cw = this.cv.clientWidth, ch = this.cv.clientHeight;
      this.cv.width = Math.round(cw * dpr);
      this.cv.height = Math.round(ch * dpr);
      this.dpr = dpr;
      let base = this.iso ? Math.max(3, Math.round(2.5 * dpr0)) : Math.max(2, Math.round(dpr * 1.35));
      this.zl = Math.max(-4, Math.min(14, this.zl || 0));
      this.baseS = base;
      const maxS = this.iso ? Math.min(12, Math.max(8, Math.floor(cw * dpr0 / 48))) : Math.max(1, Math.floor(cw * dpr0 / (16 * 8))), minS = 1;
      const S2i = Math.max(minS, Math.min(maxS, base + this.zl));
      const S2 = this.iso && qs < 1 ? S2i * qs : S2i;
      if (S2 !== this.S && this.charCache) this.charCache.clear();
      this.S = S2;
      this.zlEff = (this.iso && qs < 1 ? this.S / qs : this.S) - base;
      this.ctx.imageSmoothingEnabled = false;
    }
    // 人物スプライト: レイヤー合成(髪後・胴・顔・髪前・小物)→マーカー色を個人色へ再着色→描画倍率へスケール。
    // 倍率が整数でない時は「最近傍で整数倍→双線形で縮小(シャープバイリニア)」で、ドットを崩さずに拡縮する。
    charSheet(look, age) {
      const lp = lookParts(look, age);
      const key = `${lp.hs}|${lp.hc}|${lp.sk}|${lp.c1}|${lp.c2}|${lp.kid}|${lp.outfit}|${lp.eye}|${lp.glass}|${lp.acc}|${lp.ec}|${this.S}|${CHAR_K}`;
      let c = this.charCache.get(key);
      if (c) return c;
      const A2 = this.A, R5 = A2.c2row, k = lp.kid;
      const CW = 32, CH3 = 48, N2 = 12;
      const cv2 = document.createElement("canvas");
      cv2.width = CW * N2;
      cv2.height = CH3;
      const x = cv2.getContext("2d", { willReadFrequently: true });
      const rows2 = [R5[`hairB|${lp.hs}|${k}|0`], R5[`body|${lp.outfit}|${k}|0`], R5[`head|${lp.eye}|${k}|${lp.glass}`], R5[`hairF|${lp.hs}|${k}|0`]];
      if (lp.acc) rows2.push(R5[`acc|${lp.acc}|${k}|0`]);
      for (const r of rows2) if (r != null) x.drawImage(A2.chars2, 0, r * CH3, CW * N2, CH3, 0, 0, CW * N2, CH3);
      const id = x.getImageData(0, 0, CW * N2, CH3);
      const d = id.data;
      const skin = SKIN[lp.sk], hair = HAIR[lp.hc], c1 = CLOTH[lp.c1], c2 = CLOTH[lp.c2 === lp.c1 ? lp.c2 + 5 & 15 : lp.c2], ey = EYE_CLR[lp.ec];
      const hl = (v) => v.map((q) => Math.min(255, Math.round(q * 1.3 + 25)));
      const map2 = /* @__PURE__ */ new Map([[255 << 16, skin], [200 << 16, sh2(skin, 0.84)], [255 << 8, hair], [190 << 8, sh2(hair, 0.7)], [255 << 8 | 255, hl(hair)], [255, c1], [190, sh2(c1, 0.76)], [255 << 16 | 255 << 8, c2], [190 << 16 | 190 << 8, sh2(c2, 0.76)], [255 << 16 | 255, [86, 58, 56]], [255 << 16 | 128 << 8, ey], [255 << 16 | 190 << 8 | 100, hl(ey)]]);
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        const m = map2.get(d[i] << 16 | d[i + 1] << 8 | d[i + 2]);
        if (m) {
          d[i] = m[0];
          d[i + 1] = m[1];
          d[i + 2] = m[2];
        }
      }
      x.putImageData(id, 0, 0);
      const f2 = this.S / 2 * CHAR_K;
      let out = cv2;
      if (f2 !== 1) {
        const Wc = Math.round(CW * f2), Hc = Math.round(CH3 * f2);
        out = document.createElement("canvas");
        out.width = Wc * N2;
        out.height = Hc;
        const ox = out.getContext("2d");
        if (Number.isInteger(f2)) {
          ox.imageSmoothingEnabled = false;
          ox.drawImage(cv2, 0, 0, CW * N2, CH3, 0, 0, Wc * N2, Hc);
        } else {
          const m = Math.ceil(f2);
          const t = document.createElement("canvas");
          t.width = CW * N2 * m;
          t.height = CH3 * m;
          const tx = t.getContext("2d");
          tx.imageSmoothingEnabled = false;
          tx.drawImage(cv2, 0, 0, CW * N2, CH3, 0, 0, t.width, t.height);
          ox.imageSmoothingEnabled = true;
          ox.imageSmoothingQuality = "high";
          for (let i = 0; i < N2; i++) ox.drawImage(t, i * CW * m, 0, CW * m, CH3 * m, i * Wc, 0, Wc, Hc);
        }
      }
      out.cellW = Math.round(CW * f2);
      out.cellH = Math.round(CH3 * f2);
      this.charCache.set(key, out);
      if (this.charCache.size > 1500) this.charCache.delete(this.charCache.keys().next().value);
      return out;
    }
    // 旧スプライト(16x24, 1.5頭身)。比較スクリーンショット用にのみ残す(通常は使わない: window.NLS.R.legacyChars=true)。
    charSheetLegacy(look, age) {
      const child = age < 13 ? 1 : 0;
      const lp = lookParts(look, age);
      const key = `L|${lp.hs}|${lp.hc}|${lp.sk}|${lp.c1}|${lp.c2}|${child}`;
      let c = this.charCache.get(key);
      if (c) return c;
      const row = (child ? 8 : 0) + lp.hs;
      const cv2 = document.createElement("canvas");
      cv2.width = 192;
      cv2.height = 24;
      const x = cv2.getContext("2d", { willReadFrequently: true });
      x.drawImage(this.A.chars, 0, row * 24, 192, 24, 0, 0, 192, 24);
      const id = x.getImageData(0, 0, 192, 24);
      const d = id.data;
      const skin = SKIN[lp.sk], hair = HAIR[lp.hc], c1 = CLOTH[lp.c1], c2 = CLOTH[lp.c2 === lp.c1 ? lp.c2 + 5 & 15 : lp.c2];
      const map2 = [[MARK.skin, skin], [MARK.skinS, sh2(skin, 0.82)], [MARK.hair, hair], [MARK.hairS, sh2(hair, 0.72)], [MARK.c1, c1], [MARK.c1S, sh2(c1, 0.78)], [MARK.c2, c2], [MARK.c2S, sh2(c2, 0.78)], [MARK.shoe, [70, 50, 50]]];
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        for (const [m, r] of map2) if (d[i] === m[0] && d[i + 1] === m[1] && d[i + 2] === m[2]) {
          d[i] = r[0];
          d[i + 1] = r[1];
          d[i + 2] = r[2];
          break;
        }
      }
      x.putImageData(id, 0, 0);
      this.charCache.set(key, cv2);
      return cv2;
    }
    // W01さくら(図鑑SVG原案から新規制作した専用スプライト)。mode: B=64x96ドット(採用候補) / A=32x48ドット / C=高解像度を滑らかに描画。
    w01Sheet() {
      const mode2 = this.w01mode, key = `W01|${mode2}|${this.S}|${CHAR_K}`;
      let c = this.charCache.get(key);
      if (c) return c;
      const im = this.A.w01[mode2], N2 = 12, cw0 = { B: 64, A: 32, C: 248 }[mode2], ch0 = { B: 96, A: 48, C: 372 }[mode2];
      const f2 = this.S / 2 * CHAR_K * 48 / ch0 * W01_K;
      const Wc = Math.round(cw0 * f2), Hc = Math.round(ch0 * f2);
      const out = document.createElement("canvas");
      out.width = Wc * N2;
      out.height = Hc;
      const ox = out.getContext("2d");
      if (mode2 === "C") {
        ox.imageSmoothingEnabled = true;
        ox.imageSmoothingQuality = "high";
        ox.drawImage(im, 0, 0, cw0 * N2, ch0, 0, 0, Wc * N2, Hc);
      } else if (Number.isInteger(f2)) {
        ox.imageSmoothingEnabled = false;
        ox.drawImage(im, 0, 0, cw0 * N2, ch0, 0, 0, Wc * N2, Hc);
      } else {
        const m = Math.ceil(f2);
        const t = document.createElement("canvas");
        t.width = cw0 * N2 * m;
        t.height = ch0 * m;
        const tx = t.getContext("2d");
        tx.imageSmoothingEnabled = false;
        tx.drawImage(im, 0, 0, cw0 * N2, ch0, 0, 0, t.width, t.height);
        ox.imageSmoothingEnabled = true;
        ox.imageSmoothingQuality = "high";
        for (let i = 0; i < N2; i++) ox.drawImage(t, i * cw0 * m, 0, cw0 * m, ch0 * m, i * Wc, 0, Wc, Hc);
      }
      const id = ox.getImageData(0, 0, Wc, Hc).data;
      let last = Hc - 1;
      outer: for (; last > 0; last--) for (let x = 0; x < Wc; x++) if (id[(last * Wc + x) * 4 + 3] > 40) break outer;
      out.cellW = Wc;
      out.cellH = Hc;
      out.pad = Hc - 1 - last;
      this.charCache.set(key, out);
      return out;
    }
    drawW01(ctx4, px2, py, dir, moving) {
      const di = { d: 0, u: 1, l: 2, r: 3 }[dir] ?? 0;
      const fr = moving ? 1 + (Math.floor(this.time * 7) & 1) : 0;
      const S2 = this.S;
      const sheet = this.w01Sheet();
      const cw = sheet.cellW, ch = sheet.cellH;
      const dx = Math.round(px2 - cw / 2), dy = Math.round(py - ch + 2 * S2 + sheet.pad);
      ctx4.fillStyle = "rgba(0,0,0,0.18)";
      ctx4.fillRect(Math.round(px2 - cw * 0.3), dy + ch - sheet.pad - 3 * S2, Math.round(cw * 0.6), 2 * S2);
      ctx4.drawImage(sheet, (di * 3 + fr) * cw, 0, cw, ch, dx, dy, cw, ch);
    }
    // 新方式キャラ(図鑑SVG原案から制作した64x96ドット)。castOn=true の比較モードでのみ、年齢・性別に応じて住民へ割り当てる(正式採用ではない)。
    castId(look, age, opts) {
      if (!this.castOn || !this.A.cast || age < 13 || opts && opts.wheel) return null;
      const male = !FEMALE_STYLE2.has(look & 7);
      const v = this.castVariant(look);
      let base;
      if (age <= 18) {
        if (male) base = "w02";
        else return "w01v" + (1 + v % 3);
      } else if (age >= 65) base = male ? "w11" : "w10";
      else if (male) base = "w06";
      else base = (look >>> 8 & 7) === 0 ? "w14" : "w07";
      return v ? base + "v" + v : base;
    }
    castVariant(look) {
      let h = Math.imul(look >>> 0 ^ 2654435769, 2246822507) >>> 0;
      h ^= h >>> 13;
      h = Math.imul(h, 3266489909) >>> 0;
      return h >>> 7 & 3;
    }
    castSheet(id) {
      const key = `CAST|${id}|${this.S}|${CHAR_K}`;
      let c = this.charCache.get(key);
      if (c) return c;
      const im = this.A.cast.img, row = this.A.cast.rows[id], N2 = 12, cw0 = 64, ch0 = 96, sy = row * ch0;
      const f2 = this.S / 2 * CHAR_K * 48 / ch0 * W01_K;
      const Wc = Math.round(cw0 * f2), Hc = Math.round(ch0 * f2);
      const out = document.createElement("canvas");
      out.width = Wc * N2;
      out.height = Hc;
      const ox = out.getContext("2d");
      if (Number.isInteger(f2)) {
        ox.imageSmoothingEnabled = false;
        ox.drawImage(im, 0, sy, cw0 * N2, ch0, 0, 0, Wc * N2, Hc);
      } else {
        const m = Math.ceil(f2);
        const t = document.createElement("canvas");
        t.width = cw0 * N2 * m;
        t.height = ch0 * m;
        const tx = t.getContext("2d");
        tx.imageSmoothingEnabled = false;
        tx.drawImage(im, 0, sy, cw0 * N2, ch0, 0, 0, t.width, t.height);
        ox.imageSmoothingEnabled = true;
        ox.imageSmoothingQuality = "high";
        for (let i = 0; i < N2; i++) ox.drawImage(t, i * cw0 * m, 0, cw0 * m, ch0 * m, i * Wc, 0, Wc, Hc);
      }
      const id2 = ox.getImageData(0, 0, Wc, Hc).data;
      let last = Hc - 1;
      outer: for (; last > 0; last--) for (let x = 0; x < Wc; x++) if (id2[(last * Wc + x) * 4 + 3] > 40) break outer;
      out.cellW = Wc;
      out.cellH = Hc;
      out.pad = Hc - 1 - last;
      this.charCache.set(key, out);
      return out;
    }
    drawCast(ctx4, px2, py, id, dir, moving) {
      const di = { d: 0, u: 1, l: 2, r: 3 }[dir] ?? 0;
      const fr = moving ? 1 + (Math.floor(this.time * 7) & 1) : 0;
      const S2 = this.S;
      const sheet = this.castSheet(id);
      const cw = sheet.cellW, ch = sheet.cellH;
      const dx = Math.round(px2 - cw / 2), dy = Math.round(py - ch + 2 * S2 + sheet.pad);
      ctx4.fillStyle = "rgba(0,0,0,0.18)";
      ctx4.fillRect(Math.round(px2 - cw * 0.3), dy + ch - sheet.pad - 3 * S2, Math.round(cw * 0.6), 2 * S2);
      ctx4.drawImage(sheet, (di * 3 + fr) * cw, 0, cw, ch, dx, dy, cw, ch);
    }
    // ---- 一生を通じた外見エンジン(標準で有効。開発用の旧方式比較は ?old=1): 人物ID+年齢+暮らしから共通パーツを合成。同じ人は同じ顔の特徴のまま年齢で外見が変わる ----
    lifeRole(id, age, pop) {
      if (age < 6) return "kinder";
      if (age < 12) return "elem";
      if (age < 15) return "jh";
      if (age < 19) return "hs";
      const j = pop.job[id];
      if (j === 255) return age >= 65 ? "retired" : age < 23 ? "univ" : "home";
      const n2 = JOB_IDS[j];
      if (["officeworker", "banker", "official", "lawyer", "judge", "reporter", "announcer", "scientist", "professor"].includes(n2)) return "office";
      if (["clerk", "cook", "waitstaff", "hotelstaff", "childcare", "caregiver", "entertainer"].includes(n2)) return "shop";
      if (["doctor", "nurse", "pharmacist"].includes(n2)) return "medical";
      if (["teacher", "special_teacher"].includes(n2)) return "teacher";
      if (["farmer", "fisher"].includes(n2)) return "farm";
      if (["factory", "carpenter", "logistics", "stocker", "cleaner", "sailor", "firefighter", "police", "railstaff"].includes(n2)) return "labor";
      return "office";
    }
    fashionNow() {
      const t = this.g.S.M;
      if (this._fz !== t) {
        this._fz = t;
        this._fv = { season: this.season(), year: this.g.year() };
      }
      return this._fv;
    }
    lifeDesc(id, look, age, opts) {
      const pop = this.g.world.pop;
      if (!this.inh) {
        this.inh = (i) => [pop.mother[i], pop.father[i]];
        this.inh.lookOf = (i) => pop.look[i];
      }
      let ov = this.lifeOv.get(id);
      if (!ov && id === this.g.hero.id) {
        const w = this.g.hero.wear;
        if (w && w.grp === wearGroup(age)) ov = { outfit: w.outfit, wardrobe: w.wardrobe };
      }
      ov = ov || {};
      return lifeDescribe({ id, look, age, fashion: this.fashionNow(), role: ov.role || this.lifeRole(id, age, pop), wheel: !!opts.wheel, cane: !!opts.cane, preset: ov.preset, outfit: ov.outfit, bag: ov.bag, hd: ov.hd !== void 0 ? ov.hd : hairFor(this.g, id, age), wardrobe: ov.wardrobe ?? stageOf(age) * 64 + (pop.job[id] === 255 ? 63 : pop.job[id]), inh: this.inh, cache: this.idCache });
    }
    lifeScaled(cell2, build, height) {
      const key = `LS|${cell2.k}|${this.S}|${build}|${height}`;
      let c = this.charCache.get(key);
      if (c) return c;
      if (overBudget()) return null;
      const f2 = this.S / 2 * CHAR_K * 48 / 96 * W01_K;
      const bw = [0.94, 1, 1.07][build] ?? 1, bh = [0.97, 1, 1.03][height + 1] ?? 1;
      const Wc = Math.round(64 * f2 * bw), Hc = Math.round(96 * f2 * bh);
      const out = document.createElement("canvas");
      out.width = Wc;
      out.height = Hc;
      const ox = out.getContext("2d");
      const m = Math.max(1, Math.ceil(f2 * Math.max(bw, bh)));
      const t = this.scaleTmp || (this.scaleTmp = document.createElement("canvas"));
      t.width = 64 * m;
      t.height = 96 * m;
      const tx = t.getContext("2d");
      tx.imageSmoothingEnabled = false;
      tx.drawImage(cell2, 0, 0, 64 * m, 96 * m);
      ox.imageSmoothingEnabled = true;
      ox.imageSmoothingQuality = "high";
      ox.drawImage(t, 0, 0, Wc, Hc);
      out.cellW = Wc;
      out.cellH = Hc;
      out.pad = Math.round(cell2.pad96 * f2 * bh);
      this.charCache.set(key, out);
      return out;
    }
    drawLife(ctx4, px2, py, id, look, age, dir, moving, opts) {
      const { A: A2, col, I: I2 } = this.lifeDesc(id, look, age, opts);
      const fr = moving ? 1 + (Math.floor((this.time + id % 7 * 0.07) * 7) & 1) : 0;
      const S2 = this.S;
      const cell2 = composeCell(A2, col, dir, fr, true);
      if (!cell2) {
        this.lifePending = true;
        ctx4.fillStyle = "rgba(0,0,0,0.18)";
        ctx4.fillRect(Math.round(px2 - 5 * S2), Math.round(py - S2), Math.round(10 * S2), 2 * S2);
        return;
      }
      const sh3 = this.lifeScaled(cell2, I2.build, I2.height);
      if (!sh3) {
        this.lifePending = true;
        ctx4.fillStyle = "rgba(0,0,0,0.18)";
        ctx4.fillRect(Math.round(px2 - 5 * S2), Math.round(py - S2), Math.round(10 * S2), 2 * S2);
        return;
      }
      const cw = sh3.cellW, ch = sh3.cellH;
      const dx = Math.round(px2 - cw / 2), dy = Math.round(py - ch + 2 * S2 + sh3.pad);
      if (opts.pose === "sit" && (opts.poseK ?? 1) >= 0.35) {
        const k = opts.poseK ?? 1, hipF = opts.hip ?? 0.575, seat = (opts.seatPx || 0) * Math.min(1, (k - 0.35) / 0.65 + 1e-3);
        const standHip = dy + hipF * ch, hipY = standHip + (py - seat - standHip) * Math.min(1, (k - 0.35) / 0.65), top = hipY - hipF * ch, keep = Math.round((hipF + 0.07) * ch);
        ctx4.fillStyle = "rgba(0,0,0,0.18)";
        ctx4.fillRect(Math.round(px2 - cw * 0.3), Math.round(py + S2), Math.round(cw * 0.6), 2 * S2);
        const lw = Math.max(2, Math.round(cw * 0.2)), gap = Math.max(1, Math.round(cw * 0.04)), th = Math.round(0.1 * ch), shin = Math.max(Math.round(py - hipY - th * 0.2), Math.round(0.14 * ch));
        const legs = (x) => {
          ctx4.fillStyle = col.bottom;
          ctx4.fillRect(x, Math.round(hipY - 0.03 * ch), lw, th);
          ctx4.fillRect(x + (x < px2 ? 0 : 0), Math.round(hipY + th * 0.7), lw, Math.max(2, shin - Math.round(0.03 * ch)));
          ctx4.fillStyle = col.shoe || "#8a5a3a";
          ctx4.fillRect(x - 1, Math.round(hipY + th * 0.7 + shin - 0.05 * ch), lw + 2, Math.max(2, Math.round(0.04 * ch)));
        };
        legs(Math.round(px2 - gap - lw));
        legs(Math.round(px2 + gap));
        ctx4.drawImage(sh3, 0, 0, cw, keep, dx, Math.round(top), cw, keep);
        return;
      }
      ctx4.fillStyle = "rgba(0,0,0,0.18)";
      ctx4.fillRect(Math.round(px2 - cw * 0.3), dy + ch - sh3.pad - 3 * S2, Math.round(cw * 0.6), 2 * S2);
      ctx4.drawImage(sh3, dx, dy);
    }
    drawChar(ctx4, px2, py, look, age, dir, moving, opts = {}) {
      if (this.lifeOn && this.A.parts && opts.id !== void 0) return this.drawLife(ctx4, px2, py, opts.id, look, age, dir, moving, opts);
      if (this.special && this.A.w01 && look === this.special.look && age >= 13 && age <= 18) return this.drawW01(ctx4, px2, py, dir, moving);
      {
        const cid = this.castId(look, age, opts);
        if (cid) return this.drawCast(ctx4, px2, py, cid, dir, moving);
      }
      if (this.legacyChars) return this.drawCharLegacy(ctx4, px2, py, look, age, dir, moving, opts);
      const di = { d: 0, u: 1, l: 2, r: 3 }[dir] ?? 0;
      const fr = moving ? 1 + (Math.floor(this.time * 7) & 1) : 0;
      const S2 = this.S;
      const sheet = this.charSheet(look, age);
      const cw = sheet.cellW, ch = sheet.cellH;
      const w = cw, h = ch;
      const dx = Math.round(px2 - cw / 2), dy = Math.round(py - ch + 2 * S2);
      ctx4.fillStyle = "rgba(0,0,0,0.18)";
      ctx4.fillRect(Math.round(px2 - cw * 0.3), dy + h - 3 * S2, Math.round(cw * 0.6), 2 * S2);
      const oy = dy - (opts.wheel ? 3 * S2 : 0);
      if (opts.wheel) {
        ctx4.drawImage(this.A.aids, di * 16, 0, 16, 24, dx, dy + 2 * S2, w, h);
      }
      ctx4.drawImage(sheet, (di * 3 + fr) * cw, 0, cw, ch, dx, oy, cw, ch);
      if (opts.hat != null && opts.hat >= 0) ctx4.drawImage(this.A.hats, di * 16, opts.hat * 24, 16, 24, dx, oy, w, h);
      if (opts.cane) ctx4.drawImage(this.A.aids, di * 16, 24, 16, 24, dx, dy, w, h);
    }
    drawCharLegacy(ctx4, px2, py, look, age, dir, moving, opts = {}) {
      const di = { d: 0, u: 1, l: 2, r: 3 }[dir] ?? 0;
      const fr = moving ? 1 + (Math.floor(this.time * 7) & 1) : 0;
      const S2 = this.S;
      const sheet = this.charSheetLegacy(look, age);
      const w = 16 * S2, h = 24 * S2;
      const dx = Math.round(px2 - w / 2), dy = Math.round(py - h + 2 * S2);
      ctx4.fillStyle = "rgba(0,0,0,0.18)";
      ctx4.fillRect(dx + 3 * S2, dy + h - 3 * S2, 10 * S2, 2 * S2);
      ctx4.drawImage(sheet, (di * 3 + fr) * 16, 0, 16, 24, dx, dy, w, h);
    }
    trainLoad(t) {
      const g = this.g;
      const m = g.S.min;
      const key = t.id + ":" + g.S.min;
      if (this._tl && this._tl.k === key) return this._tl.v;
      const n2 = g.world.getCommute().riders(g.date().dow, t.line, t.dir, t.dep, m).length;
      this._tl = { k: key, v: n2 };
      return n2;
    }
    lineRgb(id) {
      const L2 = this.g.tr.byId[id];
      const h = L2 && L2.color || "#1e88e5";
      const n2 = parseInt(h.slice(1), 16);
      return [n2 >> 16, n2 >> 8 & 255, n2 & 255];
    }
    // 乗り物の描画。(cx, by)=接地面の中央下端(画面座標)。車体色は純青を実行時に塗り替える(陰影は明るさで保つ)。縮尺はズームSのみ。
    drawVeh(ctx4, key, col, cx, by, S2, flip) {
      const V2 = this.A.veh, e = V2 && V2.p[key];
      if (!e) return;
      const ck = key + "|" + col.join(",");
      let t = this.vehCache.get(ck);
      if (!t) {
        t = document.createElement("canvas");
        t.width = e[2];
        t.height = e[3];
        const x = t.getContext("2d", { willReadFrequently: true });
        x.drawImage(V2.img, e[0], e[1], e[2], e[3], 0, 0, e[2], e[3]);
        const id = x.getImageData(0, 0, e[2], e[3]), d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] && d[i] < 40 && d[i + 1] < 40 && d[i + 2] > 170) {
            const f2 = d[i + 2] / 255;
            d[i] = col[0] * f2;
            d[i + 1] = col[1] * f2;
            d[i + 2] = col[2] * f2;
          }
        }
        x.putImageData(id, 0, 0);
        this.vehCache.set(ck, t);
        if (this.vehCache.size > 400) this.vehCache.delete(this.vehCache.keys().next().value);
      }
      const w = e[2] / V2.k * S2, h = e[3] / V2.k * S2;
      ctx4.imageSmoothingEnabled = true;
      ctx4.imageSmoothingQuality = "high";
      if (flip) {
        ctx4.save();
        ctx4.translate(Math.round(cx), 0);
        ctx4.scale(-1, 1);
        ctx4.drawImage(t, -w / 2, Math.round(by - h), w, h);
        ctx4.restore();
      } else ctx4.drawImage(t, Math.round(cx - w / 2), Math.round(by - h), w, h);
      ctx4.imageSmoothingEnabled = false;
    }
    // 電車内の乗客(窓越しの影)。車両ごとの乗車人数に応じて表示
    trainPax(ctx4, it, horiz, cx, by, S2) {
      const n2 = this.trainLoad(it.t);
      if (!n2) return;
      const per = Math.min(10, Math.round(n2 / 4));
      if (per <= 0) return;
      const cols2 = ["#3b2a20", "#222", "#8a5a2b", "#c9a15a", "#9aa0a6", "#5a3b2e"];
      for (let k = 0; k < per; k++) {
        const h = hash(it.t.id * 13 + it.car * 7 + k * 31);
        const slot = h % 10;
        ctx4.fillStyle = cols2[(h >>> 4) % cols2.length];
        if (horiz) ctx4.fillRect(Math.round(cx - 70 * S2 + (8 + slot * 13) * S2), Math.round(by - 21 * S2), 3 * S2, 4 * S2);
        else ctx4.fillRect(Math.round(cx - 3 * S2), Math.round(by - (150 - slot * 14) * S2), 3 * S2, 3 * S2);
      }
    }
    trainHeads(ctx4, it, m, horiz, ox, oy, S2, TS2) {
      const n2 = this.trainLoad(it.t);
      if (!n2) return;
      const per = Math.min(8, Math.round(n2 / 4));
      if (per <= 0) return;
      const cols2 = ["#3b2a20", "#222", "#8a5a2b", "#c9a15a", "#9aa0a6", "#5a3b2e"];
      const bx = Math.round(ox + it.pos.x * TS2 + 0.5 * TS2 - m[2] * S2 / 2), by = Math.round(oy + it.pos.y * TS2 + 0.5 * TS2 - m[3] * S2 / 2);
      for (let k = 0; k < per; k++) {
        const h = hash(it.t.id * 13 + it.car * 7 + k * 31);
        const slot = h % 8;
        const col = cols2[(h >>> 4) % cols2.length];
        ctx4.fillStyle = col;
        if (horiz) {
          const wx = 2 + (slot >> 1) * 7 + (slot & 1) * 2;
          ctx4.fillRect(bx + wx * S2, by + 4 * S2, 2 * S2, 2 * S2);
        } else {
          const wy = 3 + slot * 3;
          ctx4.fillRect(bx + 6 * S2, by + wy * S2, 2 * S2, 2 * S2);
        }
      }
    }
    tileAt(map2, x, y) {
      return map2.ground[x + y * map2.W];
    }
    season() {
      const m = this.g.month0();
      return m >= 2 && m <= 3 ? 0 : m >= 4 && m <= 7 ? 1 : m >= 8 && m <= 10 ? 2 : 3;
    }
    nightAlpha() {
      const t = this.g.S.min / 60;
      if (t >= 7 && t < 17) return 0;
      if (t >= 17 && t < 19.5) return (t - 17) / 2.5 * 0.45;
      if (t >= 19.5 || t < 4) return 0.5;
      if (t < 6) return 0.5 - (t - 4) / 2 * 0.1;
      return 0.4 * (7 - t);
    }
    weather() {
      const g = this.g;
      const dt = g.date();
      const h = ((g.S.M * 31 + dt.d) * 2654435761 >>> 0) % 100;
      const m0 = dt.m0;
      if (m0 === 0 || m0 === 1 || m0 === 11) return h < 14 ? "snow" : h < 30 ? "cloud" : "sun";
      if (m0 === 5 || m0 === 6) return h < 40 ? "rain" : h < 60 ? "cloud" : "sun";
      return h < 14 ? "rain" : h < 34 ? "cloud" : "sun";
    }
    trainsNow() {
      const t = this.g.absMin();
      if (this.trainsCache.t !== t) this.trainsCache = { t, v: trainsAt(this.g.tr, t) };
      return this.trainsCache.v;
    }
    // 住民の自家用車: 走行中は信号(赤で停止線手前)に従う。位置は住民の予定(通勤時刻)に追従する。
    npcCar(w, dt) {
      const car = w.car, ci = car.ci, len = (LEN_M[ci.ty] || 4.5) / 2;
      const c = { x: car.x, y: car.y, d: car.d, ci, len, open: car.open, ph: w.ph, px: w.x, py: w.y };
      if (w.ph === "drive" && car.route) {
        if (!this.ncs) this.ncs = /* @__PURE__ */ new Map();
        let st3 = this.ncs.get(w.id);
        if (!st3 || Math.abs(st3.s - car.s) > 6 && car.s < st3.s) st3 = { s: car.s };
        this.ncs.set(w.id, st3);
        let tgt = car.s;
        const cl = junctions(this.g.world.map);
        for (const sp of car.route.stops) {
          const line2 = sp.s + 0.5 - len / 2 - 0.1;
          if (st3.s > line2 + 0.3 || car.s < line2 - 0) continue;
          const sg = signalAt(cl.list[sp.cl], this.time, sp.d % 2 === 0 ? AX.H : AX.V);
          if (sg === "R" || sg === "Y" && line2 - st3.s > 1.2) {
            tgt = Math.min(tgt, line2);
          }
        }
        const dv = Math.min(Math.max(0, tgt - st3.s), 8 * Math.min(dt, 0.1));
        st3.s += dv;
        const q = routePos(this.g.world.map, car.route, st3.s);
        c.x = q.x;
        c.y = q.y;
        c.d = q.d;
        c.lv = q.lv;
        c.stopped = dv < 1e-3;
        if (!q.lv) this.npcObs.push({ x: c.x, y: c.y, d: c.d, len });
      }
      return c;
    }
    drawNpcCar(ctx4, c, ox, oy, S2, TS2) {
      const ci = c.ci, d = c.d, col = CAR_COLORS[ci.color];
      if (d % 2 === 0) this.drawVeh(ctx4, ci.ty + "|" + ci.era + "|h", col, ox + c.x * TS2, oy + (c.y + 0.5) * TS2 - 2 * S2, S2, d === 2);
      else this.drawVeh(ctx4, ci.ty + "|" + ci.era + "|" + (d === 1 ? "d" : "u"), col, ox + c.x * TS2, oy + (c.y + c.len / 2) * TS2, S2, false);
      if (c.open && c.px !== void 0) {
        let sx = c.px - c.x, sy = c.py - c.y;
        if (d % 2 === 0) {
          sx = 0;
          sy = sy >= 0 ? 1 : -1;
        } else {
          sy = 0;
          sx = sx >= 0 ? 1 : -1;
        }
        const cx = ox + c.x * TS2 + sx * 0.42 * TS2, cy = oy + (c.y + (d % 2 === 0 ? 0.5 : 0)) * TS2 + sy * 0.42 * TS2 - (d % 2 === 0 ? 2 * S2 : 0);
        ctx4.fillStyle = "#e9edf2";
        if (d % 2 === 0) ctx4.fillRect(Math.round(cx - 3 * S2), Math.round(cy - (sy > 0 ? 0 : 3 * S2)), 6 * S2, 3 * S2);
        else ctx4.fillRect(Math.round(cx - (sx > 0 ? 0 : 3 * S2)), Math.round(cy - 3 * S2), 3 * S2, 6 * S2);
        ctx4.fillStyle = "#7ec8ff";
        if (d % 2 === 0) ctx4.fillRect(Math.round(cx - 2 * S2), Math.round(cy - (sy > 0 ? 0 : 2 * S2)) + (sy > 0 ? S2 : 0), 4 * S2, S2);
      }
    }
    carsNow(dt, hero, trs) {
      const map2 = this.g.world.map;
      if (!this.traffic || this.traffic.map !== map2) this.traffic = new Traffic(map2, this.g.world);
      const peds = this.walkers.map((w) => ({ x: w.x, y: w.y }));
      peds.push({ x: hero.x, y: hero.y });
      const tp = [];
      if (trs) for (const t of trs) {
        const L2 = this.g.tr.byId[t.line];
        if (!L2) continue;
        const p = posOnPath(L2.path, t.dd);
        tp.push({ x: p.x, y: p.y });
      }
      this.traffic.extra = this.npcObs || [];
      this.traffic.busy = new Set(this.walkers.map((w) => w.id));
      this.traffic.step(dt, hero, this.time, peds, tp, this.g.year());
      return this.traffic.cars;
    }
    // 屋外描画
    // 直近の移動方向(世界の軸 0東1南2西3北)。乗り物の向きに使う
    heroMoveDir(hero) {
      const h = this.lastHero;
      const dx = hero.x - h.x, dy = hero.y - h.y;
      if (Math.abs(dx) + Math.abs(dy) > 2e-3) {
        h.d = Math.abs(dx) >= Math.abs(dy) ? dx > 0 ? 0 : 2 : dy > 0 ? 1 : 3;
      }
      h.x = hero.x;
      h.y = hero.y;
      return h.d;
    }
    drawOutdoor(dtSec, hero, extras = {}) {
      if (this.street) return drawStreet(this, dtSec, hero, extras);
      if (this.iso) return drawOutdoorIso(this, dtSec, hero, extras);
      beginFrame(8);
      this.time += dtSec;
      const ctx4 = this.ctx, g = this.g, map2 = g.world.map, S2 = this.S, TS2 = 16 * S2;
      const W2 = this.cv.width, H4 = this.cv.height;
      ctx4.imageSmoothingEnabled = false;
      ctx4.fillStyle = "#6aa84f";
      ctx4.fillRect(0, 0, W2, H4);
      let cx = hero.x * 16 - W2 / S2 / 2, cy = hero.y * 16 - H4 / S2 / 2 - 6;
      cx = Math.max(-40, Math.min(map2.W * 16 - W2 / S2 + 40, cx));
      cy = Math.max(-40, Math.min(map2.H * 16 - H4 / S2 + 40, cy));
      this.cam.x = cx;
      this.cam.y = cy;
      const ox = -cx * S2, oy = -cy * S2;
      const tx0 = Math.max(0, Math.floor(cx / 16) - 1), ty0 = Math.max(0, Math.floor(cy / 16) - 1), tx1 = Math.min(map2.W - 1, Math.ceil((cx + W2 / S2) / 16) + 1), ty1 = Math.min(map2.H - 1, Math.ceil((cy + H4 / S2) / 16) + 1);
      const TI = this.A.tileIdx, DI = this.A.decoIdx;
      const waterFrame = Math.floor(this.time * 1.6) & 1;
      const seas = this.season();
      const tile = (name, x, y) => {
        const i = TI[name];
        ctx4.drawImage(this.A.tiles, i % 16 * 16, (i / 16 | 0) * 16, 16, 16, Math.round(ox + x * TS2), Math.round(oy + y * TS2), TS2, TS2);
      };
      for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
        const gd = map2.ground[x + y * map2.W];
        let n2;
        switch (gd) {
          case T.GRASS:
            n2 = "grass" + ((x * 7 + y * 13) % 5 === 0 ? 2 : (x + y) % 3 === 0 ? 1 : 0);
            break;
          case T.ROAD:
            n2 = "road";
            break;
          case T.PLAZA:
            n2 = "plaza";
            break;
          case T.WATER:
            n2 = "water" + waterFrame;
            break;
          case T.SAND:
            n2 = "sand";
            break;
          case T.RAIL: {
            const L3 = map2.ground[x - 1 + y * map2.W], R5 = map2.ground[x + 1 + y * map2.W];
            n2 = L3 === T.RAIL || R5 === T.RAIL || L3 === T.PLATFORM || R5 === T.PLATFORM || L3 === T.CROSSING || R5 === T.CROSSING ? "rail_h" : "rail_v";
            break;
          }
          case T.PLATFORM:
            n2 = "platform";
            break;
          case T.FARM:
            n2 = "farm";
            break;
          case T.FOREST:
            n2 = "forest";
            break;
          case T.ROCK:
            n2 = "rock";
            break;
          case T.BRIDGE:
            n2 = "bridge";
            break;
          case T.CROSSING:
            n2 = "crossing";
            break;
          case T.PATH:
            n2 = "path";
            break;
          case T.QUAY:
            n2 = "quay";
            break;
          case T.PADDY:
            n2 = "paddy";
            break;
          default:
            n2 = "grass0";
        }
        tile(n2, x, y);
      }
      if (this.A.veh) drawRoads(ctx4, map2, tx0, ty0, tx1, ty1, ox, oy, S2, this.time);
      const items = [];
      const seen = /* @__PURE__ */ new Set();
      for (let y = ty0 - 6; y <= ty1 + 6; y++) for (let x = tx0 - 10; x <= tx1 + 10; x++) {
        if (x < 0 || y < 0 || x >= map2.W || y >= map2.H) continue;
        const bi = map2.bid[x + y * map2.W];
        if (bi < 0 || seen.has(bi)) continue;
        seen.add(bi);
        const b = map2.buildings[bi];
        items.push({ k: (b.y + b.h) * 16, kind: "b", b });
      }
      for (let y = ty0; y <= ty1 + 1; y++) for (let x = tx0; x <= tx1; x++) {
        const d = map2.deco[x + y * map2.W];
        if (!d || d === D.BUILDING) continue;
        items.push({ k: (y + 1) * 16 - 0.1, kind: "d", d, x, y });
      }
      if (this.A.props) {
        const PR = buildProps(map2);
        for (let y = ty0; y <= ty1 + 1; y++) for (let x = tx0; x <= tx1; x++) {
          const q = PR.get(x + y * map2.W);
          if (q) items.push({ k: (y + 1) * 16 - 0.2, kind: "p", q });
        }
      }
      if (this.A.props) for (const bi of seen) {
        const b = map2.buildings[bi];
        if (!b.tenants || !b.tenants.length) continue;
        const dx = b.doorX + 1, dy = b.doorY;
        if (dx >= map2.W || map2.bid[dx + dy * map2.W] >= 0 || map2.ground[dx + dy * map2.W] === T.WATER) continue;
        items.push({ k: (dy + 1) * 16 - 0.15, kind: "p", q: { x: dx, y: dy, k: "dirboard" + Math.max(2, Math.min(4, b.tenants.length)) } });
      }
      this.npcObs = [];
      for (const w of this.walkers) {
        if (w.car && this.A.veh) {
          const c = this.npcCar(w, dtSec);
          items.push({ k: (c.y + (c.d % 2 === 0 ? 0.5 : c.len / 2)) * 16, kind: "nc", c });
          if (w.ph === "drive" || w.ph === "in" || w.ph === "park") continue;
        }
        items.push({ k: w.y * 16, kind: "n", w });
      }
      for (const pk of this.parked || []) {
        if (!this.A.veh) break;
        const c = { x: pk.pad.px + 0.5, y: pk.pad.py + 0.5, d: pk.pad.ld, ci: pk.ci, len: (LEN_M[pk.ci.ty] || 4.5) / 2, open: false };
        items.push({ k: (c.y + (c.d % 2 === 0 ? 0.5 : c.len / 2)) * 16, kind: "nc", c });
      }
      items.push({ k: hero.y * 16 + 0.05, kind: "h" });
      const trs = this.trainsNow();
      const L2 = this.g.tr.byId;
      for (const c of this.carsNow(dtSec, hero, trs)) if (Math.abs(c.x - hero.x) < 40 && Math.abs(c.y - hero.y) < 24) items.push({ k: (c.y + (c.horiz ? 0.5 : c.len / 2)) * 16, kind: "c", c });
      for (const t of trs) {
        for (let car = 0; car < 4; car++) {
          const SP = this.A.veh ? 9.9 : 2.1;
          const dd = t.dir === 1 ? t.dd - car * SP : t.dd + car * SP;
          const path = L2[t.line].path;
          const pos = posOnPath(path, dd);
          if (Math.abs(pos.x - hero.x) > 40 + 8 || Math.abs(pos.y - hero.y) > 24 + 8) continue;
          items.push({ k: pos.y * 16 + 8 + car * 0.01, kind: "t", pos, t, car });
        }
      }
      items.sort((a, b) => a.k - b.k);
      for (const it of items) {
        if (it.kind === "b") {
          const b = it.b;
          const sheet = this.A.buildings[b.type];
          if (!sheet) continue;
          const bw = b.w * 16, bh = b.h * 16;
          const subs = this.A.manifest.building_subs && this.A.manifest.building_subs[b.type];
          const nc = subs ? subs.length * 3 : 3;
          const si = subs ? Math.max(0, subs.indexOf(subKey(b))) : 0;
          const col = si * 3 + b.idx * 7 % 3, row = b.era ?? 1;
          const kk = sheet.width / (nc * bw);
          const sm = kk > 1.5;
          if (sm) {
            ctx4.imageSmoothingEnabled = true;
            ctx4.imageSmoothingQuality = "high";
          }
          ctx4.drawImage(sheet, col * bw * kk, row * bh * kk, bw * kk, bh * kk, Math.round(ox + b.x * TS2), Math.round(oy + b.y * TS2), bw * S2, bh * S2);
          if (sm) ctx4.imageSmoothingEnabled = false;
          if (b.status === "closed") {
            ctx4.fillStyle = "rgba(40,30,30,0.45)";
            ctx4.fillRect(Math.round(ox + b.x * TS2), Math.round(oy + b.y * TS2), bw * S2, bh * S2);
          }
          if (VISION_TYPES[b.type] && S2 >= 2) drawVision(ctx4, this.g, b, Math.round(ox + b.x * TS2), Math.round(oy + b.y * TS2), bw * S2, bh * S2, S2, this.time, this.nightAlpha() > 0.2);
        } else if (it.kind === "d") {
          const nm = it.d === D.TREE ? "tree" + seas : it.d === D.VENDING ? "vending" : it.d === D.BENCH ? "bench" : it.d === D.FLOWER ? "flower" : it.d === D.POST ? "post" : it.d === D.LAMP ? "lamp" : it.d === D.FENCE ? "fence" : it.d === D.CROP ? "crop" : null;
          if (!nm) continue;
          const i = DI[nm];
          if (i === void 0) continue;
          ctx4.drawImage(this.A.deco, i * 16, 0, 16, 24, Math.round(ox + it.x * TS2), Math.round(oy + (it.y + 1) * TS2 - 24 * S2), 16 * S2, 24 * S2);
        } else if (it.kind === "p") {
          const q = it.q, e = this.A.props.p[q.k];
          if (!e) continue;
          const kk = this.A.props.k, pw = e[2] / kk, ph = e[3] / kk;
          ctx4.imageSmoothingEnabled = true;
          ctx4.imageSmoothingQuality = "high";
          ctx4.drawImage(this.A.props.img, e[0], e[1], e[2], e[3], Math.round(ox + q.x * TS2 + (16 - pw) * S2 / 2), Math.round(oy + (q.y + 1) * TS2 - ph * S2), pw * S2, ph * S2);
          ctx4.imageSmoothingEnabled = false;
        } else if (it.kind === "n") {
          const w = it.w;
          const age = this.g.ageOf(w.id);
          const look = g.world.pop.look[w.id];
          const dir = w.dy > 0 ? "d" : w.dy < 0 ? "u" : w.dx < 0 ? "l" : w.dx > 0 ? "r" : "d";
          const nd = g.world.pop.needs[w.id];
          this.drawChar(ctx4, ox + w.x * TS2, oy + w.y * TS2, look, age, dir, true, { wheel: !!(nd & 1), cane: !!(nd & 2), id: w.id });
        } else if (it.kind === "h") {
          const hp = this.g.world.pop;
          const nd = hp.needs[g.hero.id];
          const rv = g.hero.veh && g.hero.veh.ride;
          if (rv === "car") {
            const hz = hero.f === "l" || hero.f === "r";
            const m = this.A.vehIdx[hz ? "car_h" : "car_v"];
            this.drawVehicle(ctx4, m, Math.round(ox + hero.x * TS2 - m[2] * S2 / 2), Math.round(oy + hero.y * TS2 - m[3] * S2 * 0.7), S2, 1);
            continue;
          }
          this.drawChar(ctx4, ox + hero.x * TS2, oy + hero.y * TS2, hp.look[g.hero.id], g.age(), hero.f, hero.moving, { wheel: !!(nd & 1), cane: !!(nd & 2), id: g.hero.id });
          if (rv === "bicycle") {
            const bx = ox + hero.x * TS2, by = oy + hero.y * TS2;
            ctx4.fillStyle = "#23232b";
            const hz = hero.f === "l" || hero.f === "r";
            if (hz) {
              ctx4.fillRect(Math.round(bx - 7 * S2), Math.round(by - 3 * S2), 5 * S2, 5 * S2);
              ctx4.fillRect(Math.round(bx + 2 * S2), Math.round(by - 3 * S2), 5 * S2, 5 * S2);
            } else {
              ctx4.fillRect(Math.round(bx - 1.5 * S2), Math.round(by - 3 * S2), 3 * S2, 7 * S2);
            }
            ctx4.fillStyle = "#d4402f";
            ctx4.fillRect(Math.round(bx - 5 * S2), Math.round(by - 4 * S2), 10 * S2, S2);
          }
        } else if (it.kind === "nc") {
          this.drawNpcCar(ctx4, it.c, ox, oy, S2, TS2);
        } else if (it.kind === "c" && this.A.veh) {
          const c = it.c;
          const era = c.era;
          const col = CAR_COLORS[c.color];
          if (c.horiz) this.drawVeh(ctx4, c.ty + "|" + era + "|h", col, ox + c.x * TS2, oy + (c.y + 0.5) * TS2 - 2 * S2, S2, c.dir < 0);
          else this.drawVeh(ctx4, c.ty + "|" + era + "|" + (c.dir > 0 ? "d" : "u"), col, ox + c.x * TS2, oy + (c.y + c.len / 2) * TS2, S2, false);
        } else if (it.kind === "c") {
          const c = it.c;
          const key = c.horiz ? "car_h" : "car_v";
          const m = this.A.vehIdx[key];
          const px2 = Math.round(ox + c.x * TS2), py = Math.round(oy + c.y * TS2);
          this.drawVehicle(ctx4, m, px2, py, S2, c.color);
        } else if (it.kind === "t" && this.A.veh) {
          const pos = it.pos;
          const horiz = pos.dy === 0;
          const era = eraOfYear(this.g.year());
          const lc = this.lineRgb(it.t.line);
          const key = "train|" + era + "|" + (horiz ? "h" : pos.dy > 0 ? "d" : "u");
          const e = this.A.veh.p[key], kk = this.A.veh.k;
          const cx2 = ox + (pos.x + 0.5) * TS2, by = oy + (pos.y + 0.5) * TS2 + (horiz ? 1 * S2 : e[3] / kk * S2 * 0.5 - 4 * S2);
          this.drawVeh(ctx4, key, lc, cx2, horiz ? by + 0 : oy + (pos.y + 0.5) * TS2 + e[3] / kk * 0.5 * S2, S2, horiz && pos.dx < 0);
          this.trainPax(ctx4, it, horiz, cx2, horiz ? by : oy + (pos.y + 0.5) * TS2 + e[3] / kk * 0.5 * S2, S2);
        } else if (it.kind === "t") {
          const pos = it.pos;
          const horiz = pos.dy === 0;
          const m = this.A.vehIdx[horiz ? "train_h" : "train_v"];
          ctx4.drawImage(this.A.vehicles, m[0], m[1], m[2], m[3], Math.round(ox + pos.x * TS2 + 0.5 * TS2 - m[2] * S2 / 2), Math.round(oy + pos.y * TS2 + 0.5 * TS2 - m[3] * S2 / 2), m[2] * S2, m[3] * S2);
          this.trainHeads(ctx4, it, m, horiz, ox, oy, S2, TS2);
        }
      }
      ctx4.font = `${Math.round(5 * S2)}px sans-serif`;
      ctx4.textAlign = "center";
      for (const s of map2.stations) {
        const px2 = ox + s.x * TS2 + 0.5 * TS2, py = oy + (s.y + 2) * TS2 - 2 * S2;
        if (px2 < -100 || px2 > W2 + 100 || py < -20 || py > H4 + 20) continue;
        ctx4.fillStyle = "rgba(20,40,80,0.8)";
        const tw = ctx4.measureText(s.name).width + 6 * S2;
        ctx4.fillRect(px2 - tw / 2, py - 6 * S2, tw, 8 * S2);
        ctx4.fillStyle = "#fff";
        ctx4.fillText(s.name, px2, py);
      }
      if (extras.route) {
        ctx4.strokeStyle = "rgba(255,80,80,0.9)";
        ctx4.lineWidth = Math.max(2, S2);
        ctx4.beginPath();
        extras.route.forEach((p, i) => {
          const x = ox + (p[0] + 0.5) * TS2, y = oy + (p[1] + 0.5) * TS2;
          if (i) ctx4.lineTo(x, y);
          else ctx4.moveTo(x, y);
        });
        ctx4.stroke();
      }
      if (extras.dest) {
        const b = extras.dest;
        const x = ox + (b.doorX + 0.5) * TS2, y = oy + b.doorY * TS2 - Math.abs(Math.sin(this.time * 4)) * 6 * S2;
        ctx4.fillStyle = "#ff3b3b";
        ctx4.beginPath();
        ctx4.moveTo(x, y);
        ctx4.lineTo(x - 5 * S2, y - 9 * S2);
        ctx4.lineTo(x + 5 * S2, y - 9 * S2);
        ctx4.fill();
      }
      if (extras.focus) {
        const f2 = extras.focus;
        ctx4.strokeStyle = "#fff04a";
        ctx4.lineWidth = Math.max(2, S2 * 0.7);
        ctx4.strokeRect(Math.round(ox + f2.x * TS2), Math.round(oy + f2.y * TS2), (f2.w || 1) * TS2, (f2.h || 1) * TS2);
      }
      const na = this.nightAlpha();
      if (na > 0) {
        ctx4.fillStyle = `rgba(12,18,60,${na.toFixed(3)})`;
        ctx4.fillRect(0, 0, W2, H4);
      }
      const wt = this.weather();
      if (wt === "rain" || wt === "snow") {
        ctx4.fillStyle = wt === "rain" ? "rgba(180,200,255,0.55)" : "rgba(255,255,255,0.8)";
        for (let i = 0; i < 70; i++) {
          const rx = (i * 97 + this.time * (wt === "rain" ? 300 : 40)) % (W2 / S2) * S2, ry = (i * 53 + this.time * (wt === "rain" ? 400 : 60) + (wt === "snow" ? Math.sin(this.time + i) * 10 : 0)) % (H4 / S2) * S2;
          if (wt === "rain") ctx4.fillRect(rx, ry, S2, 4 * S2);
          else ctx4.fillRect(rx, ry, S2 * 1.5, S2 * 1.5);
        }
      }
    }
    drawVehicle(ctx4, m, px2, py, S2, colorIdx) {
      const A2 = this.A;
      const tc = this.tmp;
      tc.width = m[2];
      tc.height = m[3];
      const x = this.tmpx;
      x.clearRect(0, 0, m[2], m[3]);
      x.drawImage(A2.vehicles, m[0], m[1], m[2], m[3], 0, 0, m[2], m[3]);
      const id = x.getImageData(0, 0, m[2], m[3]);
      const d = id.data;
      const pal = [[220, 60, 60], [60, 120, 220], [240, 200, 60], [240, 240, 240], [70, 70, 80], [90, 180, 100]][colorIdx % 6];
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] && d[i] === 0 && d[i + 1] === 0 && d[i + 2] === 255) {
          d[i] = pal[0];
          d[i + 1] = pal[1];
          d[i + 2] = pal[2];
        } else if (d[i + 3] && d[i] === 0 && d[i + 1] === 0 && d[i + 2] === 190) {
          d[i] = pal[0] * 0.75;
          d[i + 1] = pal[1] * 0.75;
          d[i + 2] = pal[2] * 0.75;
        }
      }
      x.putImageData(id, 0, 0);
      ctx4.drawImage(tc, 0, 0, m[2], m[3], px2, py, m[2] * S2, m[3] * S2);
    }
    // 屋内描画
    drawInterior(dtSec, hero, I2, people, extras = {}) {
      beginFrame(8);
      if (this.iso && !globalThis.NOISOINT) return drawInteriorIso(this, dtSec, hero, I2, people, extras);
      this.time += dtSec;
      const W2 = this.cv.width, H4 = this.cv.height;
      const S0 = this.S;
      const S2 = Math.max(S0, Math.min(Math.floor(W2 / (I2.W * 16) * 0.96), Math.floor(H4 * 0.8 / (I2.H * 16 + 10))));
      this.S = S2;
      const ctx4 = this.ctx, TS2 = 16 * S2;
      ctx4.imageSmoothingEnabled = false;
      ctx4.fillStyle = "#1b1b24";
      ctx4.fillRect(0, 0, W2, H4);
      const IW = I2.W * TS2, IH = I2.H * TS2;
      const ox = Math.round((W2 - IW) / 2), oy = Math.round((H4 * 0.9 - IH) / 2) + 6 * S2;
      const II = this.A.interiorIdx;
      const cell2 = (name, x, y, up) => {
        const i = II[name];
        if (i === void 0) return;
        ctx4.drawImage(this.A.interior, i * 16, 0, 16, 32, ox + x * TS2, oy + y * TS2 - (up ? 16 * S2 : 0), TS2, 32 * S2);
      };
      for (let y = 0; y < I2.H; y++) for (let x = 0; x < I2.W; x++) {
        const t = I2.tiles[x + y * I2.W];
        if (t === "wall") {
          const i = II.wall;
          ctx4.drawImage(this.A.interior, i * 16, 0, 16, 16, ox + x * TS2, oy + y * TS2, TS2, TS2);
        } else cell2(t, x, y, true);
      }
      const items = [];
      for (const o of I2.objs) items.push({ k: o.y + (o.solid ? 0.5 : -0.2), o });
      for (const p of people) items.push({ k: p.y, p });
      items.push({ k: hero.y, h: 1 });
      items.sort((a, b) => a.k - b.k);
      for (const it of items) {
        if (it.o) {
          const o = it.o;
          if (o.t === "window") {
            const i = II.window;
            ctx4.drawImage(this.A.interior, i * 16, 0, 16, 16, ox + o.x * TS2, oy + o.y * TS2, TS2, TS2);
            continue;
          }
          if (o.deco) continue;
          if (o.t === "fitting" || o.t === "rack" || o.t === "mirror") {
            this.drawFitProp(ctx4, o, ox + o.x * TS2, oy + o.y * TS2, TS2, S2);
            continue;
          }
          cell2(o.t, o.x, o.y, true);
          if (o.act === "shelf" && (o.t === "shelf" || o.t === "fridge") && extras.shop) {
            try {
              drawShelf(ctx4, extras.shop.b, extras.shop.bt, o, S2, ox + o.x * TS2, oy + o.y * TS2 - 16 * S2, TS2, this.g, o.t === "fridge");
            } catch (e) {
            }
          }
        } else if (it.p) {
          const p = it.p;
          const pop = this.g.world.pop;
          this.drawChar(ctx4, ox + p.x * TS2, oy + p.y * TS2, pop.look[p.id], this.g.ageOf(p.id), p.dir || "d", false, { wheel: !!(pop.needs[p.id] & 1), id: p.id });
        } else {
          const hp = this.g.world.pop;
          const nd = hp.needs[this.g.hero.id];
          this.drawChar(ctx4, ox + hero.x * TS2, oy + hero.y * TS2, hp.look[this.g.hero.id], this.g.age(), hero.f, hero.moving, { wheel: !!(nd & 1), cane: !!(nd & 2), id: this.g.hero.id });
        }
      }
      this.ioff = { x: ox, y: oy, TS: TS2 };
      if (extras.focus) {
        const f2 = extras.focus;
        ctx4.strokeStyle = "#fff04a";
        ctx4.lineWidth = Math.max(2, S2 * 0.7);
        ctx4.strokeRect(ox + f2.x * TS2, oy + (f2.y - 0.1) * TS2, TS2, TS2);
      }
      this.S = S0;
    }
    drawFitProp(ctx4, o, x, y, TS2, S2) {
      const u = TS2 / 16, h = (o.x * 7 + o.y * 13) % 5;
      const cols2 = ["#d9534f", "#4a7fc8", "#e8c44a", "#58a868", "#9a6ac0", "#e88aa8"];
      if (o.t === "fitting") {
        ctx4.fillStyle = "#6a5440";
        ctx4.fillRect(x, y - 15 * u, 16 * u, 2 * u);
        ctx4.fillStyle = "#b99a74";
        ctx4.fillRect(x + 0.5 * u, y - 13 * u, 15 * u, 14 * u);
        ctx4.fillStyle = cols2[h];
        ctx4.fillRect(x + 1 * u, y - 13 * u, 14 * u, 13 * u);
        ctx4.fillStyle = "rgba(0,0,0,.18)";
        for (let i = 3; i < 15; i += 3) ctx4.fillRect(x + i * u, y - 13 * u, 1 * u, 13 * u);
        ctx4.fillStyle = "rgba(255,255,255,.35)";
        ctx4.fillRect(x + 1 * u, y - 13 * u, 14 * u, 2 * u);
        ctx4.fillStyle = "rgba(0,0,0,.25)";
        ctx4.fillRect(x, y + 0 * u, 16 * u, 1.5 * u);
      } else if (o.t === "rack") {
        ctx4.fillStyle = "#8a8f98";
        ctx4.fillRect(x + 0.5 * u, y - 6 * u, 1 * u, 7 * u);
        ctx4.fillRect(x + 14.5 * u, y - 6 * u, 1 * u, 7 * u);
        ctx4.fillRect(x + 0.5 * u, y - 7 * u, 15 * u, 1.2 * u);
        for (let i = 0; i < 6; i++) {
          ctx4.fillStyle = cols2[(h + i) % cols2.length];
          ctx4.fillRect(x + (1.5 + i * 2.3) * u, y - 6 * u, 1.9 * u, 6.5 * u);
          ctx4.fillStyle = "rgba(255,255,255,.3)";
          ctx4.fillRect(x + (1.5 + i * 2.3) * u, y - 6 * u, 0.5 * u, 6.5 * u);
        }
        ctx4.fillStyle = "rgba(0,0,0,.22)";
        ctx4.fillRect(x, y + 1 * u, 16 * u, 1 * u);
      } else {
        ctx4.fillStyle = "#7a6046";
        ctx4.fillRect(x + 3 * u, y - 14 * u, 10 * u, 16 * u);
        ctx4.fillStyle = "#cfe2ea";
        ctx4.fillRect(x + 4 * u, y - 13 * u, 8 * u, 14 * u);
        ctx4.fillStyle = "rgba(255,255,255,.55)";
        ctx4.fillRect(x + 5 * u, y - 12 * u, 2 * u, 6 * u);
      }
    }
    drawMinimapTo(canvas, opts = {}) {
      const g = this.g, map2 = g.world.map, W2 = map2.W, H4 = map2.H;
      const sc = W2 * H4 > 1e5 ? 1 : 4, f2 = sc / 4;
      canvas.width = W2 * sc;
      canvas.height = H4 * sc;
      const x = canvas.getContext("2d");
      x.imageSmoothingEnabled = false;
      const col = { [T.GRASS]: "#7bbf63", [T.ROAD]: "#7a7d88", [T.PLAZA]: "#d2c6aa", [T.WATER]: "#4b8fd8", [T.SAND]: "#ecd89a", [T.RAIL]: "#444", [T.PLATFORM]: "#e8e0a0", [T.FARM]: "#a47a50", [T.FOREST]: "#3d7d48", [T.ROCK]: "#8f8882", [T.BRIDGE]: "#a07c56", [T.CROSSING]: "#7a7d88", [T.PATH]: "#d2b484", [T.QUAY]: "#aaa59d", [T.PADDY]: "#7cb0a0" };
      const bcol = { res: "#d9a37a", shop: "#e8714f", food: "#e8a14f", med: "#e85d8c", school: "#4f86e8", public: "#7a6ad8", work: "#8a8f98", hotel: "#b36ad8", leisure: "#e84fc4", sight: "#4fd8c4", religion: "#c8553d", transit: "#2b6cb0" };
      let base = this._mmBase && this._mmBase.map === map2 && this._mmBase.sc === sc ? this._mmBase.cv : null;
      if (!base) {
        base = document.createElement("canvas");
        base.width = W2 * sc;
        base.height = H4 * sc;
        const bx = base.getContext("2d");
        bx.imageSmoothingEnabled = false;
        if (sc === 1) {
          const im = bx.createImageData(W2, H4), d = im.data, rgb2 = {};
          for (const k in col) {
            const c = col[k];
            rgb2[k] = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
          }
          for (let k = 0; k < W2 * H4; k++) {
            const c = rgb2[map2.ground[k]] || rgb2[T.GRASS];
            d[k * 4] = c[0];
            d[k * 4 + 1] = c[1];
            d[k * 4 + 2] = c[2];
            d[k * 4 + 3] = 255;
          }
          bx.putImageData(im, 0, 0);
        } else for (let yy = 0; yy < H4; yy++) for (let xx = 0; xx < W2; xx++) {
          bx.fillStyle = col[map2.ground[xx + yy * W2]] || "#7bbf63";
          bx.fillRect(xx * 4, yy * 4, 4, 4);
        }
        for (const b of map2.buildings) {
          if (b.tenant) continue;
          bx.fillStyle = BTYPES[b.type].enter === false ? "#a9b79a" : bcol[BTYPES[b.type].cat] || "#aaa";
          bx.fillRect(b.x * sc, b.y * sc, Math.max(1, b.w * sc), Math.max(1, b.h * sc));
        }
        this._mmBase = { map: map2, sc, cv: base };
      }
      x.drawImage(base, 0, 0);
      const lw = Math.max(1.5, 3 * f2);
      for (const L2 of g.tr.lines) {
        x.strokeStyle = L2.color;
        x.lineWidth = lw;
        x.setLineDash(L2.underground ? [lw * 2.5, lw * 1.5] : []);
        x.beginPath();
        L2.path.pts.forEach((p, i) => {
          const px2 = p[0] * sc + sc / 2, py = p[1] * sc + sc / 2;
          if (i) x.lineTo(px2, py);
          else x.moveTo(px2, py);
        });
        x.stroke();
      }
      x.setLineDash([]);
      x.font = `bold ${Math.round(Math.max(9, 11 * (sc === 1 ? 1.1 : 1)))}px sans-serif`;
      x.textAlign = "center";
      const sr = Math.max(3, 5 * (sc === 1 ? 0.9 : 1));
      for (const s of map2.stations) {
        x.fillStyle = "#fff";
        x.strokeStyle = "#123";
        x.lineWidth = 2;
        x.beginPath();
        x.arc(s.x * sc + sc / 2, s.y * sc + sc / 2, sr, 0, 7);
        x.fill();
        x.stroke();
        x.fillStyle = "#123";
        x.fillText(s.name, s.x * sc + sc / 2, s.y * sc - sr - 1);
      }
      if (opts.route) {
        x.strokeStyle = "#ff2d2d";
        x.lineWidth = Math.max(2, 3 * f2);
        x.beginPath();
        opts.route.forEach((p, i) => {
          const px2 = p[0] * sc + sc / 2, py = p[1] * sc + sc / 2;
          if (i) x.lineTo(px2, py);
          else x.moveTo(px2, py);
        });
        x.stroke();
      }
      if (opts.dest) {
        x.fillStyle = "#ff2d2d";
        x.beginPath();
        x.arc(opts.dest.doorX * sc + sc / 2, opts.dest.doorY * sc + sc / 2, Math.max(4, 7 * f2), 0, 7);
        x.fill();
      }
      if (opts.hero) {
        const hx2 = opts.hero.x, hy = opts.hero.y, ER = 38;
        x.fillStyle = "#ffffff";
        x.strokeStyle = "#123";
        x.lineWidth = 1;
        const rr3 = Math.max(2, 3 * f2);
        for (const b of map2.buildings) {
          if (b.tenant || BTYPES[b.type].enter === false || Math.abs(b.doorX - hx2) > ER || Math.abs(b.doorY - hy) > ER) continue;
          x.beginPath();
          x.arc(b.doorX * sc + sc / 2, b.doorY * sc + sc / 2, rr3, 0, 7);
          x.fill();
          x.stroke();
        }
      }
      if (opts.hero) {
        x.fillStyle = "#ffee00";
        x.strokeStyle = "#000";
        x.lineWidth = 2;
        x.beginPath();
        x.arc(opts.hero.x * sc, opts.hero.y * sc, Math.max(4, 6 * (sc === 1 ? 1.2 : 1)), 0, 7);
        x.fill();
        x.stroke();
        const dv = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] }[opts.hero.f] || [0, 1], rr22 = Math.max(4, 6 * (sc === 1 ? 1.2 : 1)) * 2.1, cx = opts.hero.x * sc, cy = opts.hero.y * sc;
        x.fillStyle = "#d02020";
        x.beginPath();
        x.moveTo(cx + dv[0] * rr22, cy + dv[1] * rr22);
        x.lineTo(cx - dv[1] * rr22 * 0.45 + dv[0] * rr22 * 0.35, cy + dv[0] * rr22 * 0.45 + dv[1] * rr22 * 0.35);
        x.lineTo(cx + dv[1] * rr22 * 0.45 + dv[0] * rr22 * 0.35, cy - dv[0] * rr22 * 0.45 + dv[1] * rr22 * 0.35);
        x.closePath();
        x.fill();
        x.stroke();
      }
    }
  };
  var RW = 240;
  var RH = 120;
  Renderer.prototype.rideScale = function(W2, H4) {
    return Math.max(2, Math.floor(Math.min(W2 / RW, H4 / RH)));
  };
  Renderer.prototype.drawRide = function(cv2, ride, inf, tf, hero) {
    beginFrame(8);
    const ctx4 = cv2.getContext("2d");
    const W2 = cv2.width, H4 = cv2.height;
    const RS = this.rideScale(W2, H4);
    const keep = this.S;
    this.S = RS;
    ctx4.imageSmoothingEnabled = false;
    const ox = Math.floor((W2 - RW * RS) / 2), oy = Math.floor((H4 - RH * RS) / 2);
    const R5 = (x, y, w, h, c) => {
      ctx4.fillStyle = c;
      ctx4.fillRect(ox + Math.round(x * RS), oy + Math.round(y * RS), Math.round(w * RS), Math.round(h * RS));
    };
    const g = this.g, pop = g.world.pop;
    const nightA = this.nightAlpha();
    ctx4.fillStyle = "#10141c";
    ctx4.fillRect(0, 0, W2, H4);
    const sky = nightA > 0.3 ? "#27345a" : "#8ccbf2";
    const person = (id, x, y, dir, extra) => {
      this.drawChar(ctx4, ox + x * RS, oy + y * RS, pop.look[id], g.ageOf(id), dir, false, Object.assign({ id }, extra || {}));
    };
    const heroDraw = (x, y, dir) => {
      const nd = pop.needs[g.hero.id];
      this.drawChar(ctx4, ox + x * RS, oy + y * RS, pop.look[g.hero.id], g.age(), dir, false, { wheel: !!(nd & 1), cane: !!(nd & 2), id: g.hero.id });
    };
    if (inf.phase === "wait" || inf.phase === "xfer") {
      R5(0, 0, RW, 50, sky);
      for (let i = 0; i < 6; i++) R5(10 + i * 42, 22 + i % 2 * 6, 30, 28, nightA > 0.3 ? "#3a4466" : "#aeb9c9");
      R5(0, 50, RW, 12, "#555a66");
      R5(0, 58, RW, 2, "#8a8f99");
      R5(0, 62, RW, 58, "#d9d2b4");
      R5(0, 62, RW, 3, "#f2e27a");
      const ti = inf.trainIn || 0;
      const tx = -230 + ti * 232;
      const col = inf.leg.color || "#1e88e5";
      R5(tx, 26, 228, 34, "#e8ecf2");
      R5(tx, 44, 228, 4, col);
      R5(tx, 54, 228, 3, "#555");
      for (let k = 0; k < 6; k++) {
        R5(tx + 8 + k * 36, 31, 24, 12, "#6fb4e6");
        if (ti >= 0.98) R5(tx + 14 + k * 36, 31, 12, 24, "#cfe6f6");
      }
      R5(8, 66, 6, 40, "#8a6d3b");
      R5(RW - 14, 66, 6, 40, "#8a6d3b");
      R5(100, 64, 40, 9, "#2c4a7a");
      ctx4.fillStyle = "#fff";
      ctx4.font = `${Math.round(6 * RS)}px sans-serif`;
      ctx4.textAlign = "center";
      ctx4.fillText(inf.station || "", ox + 120 * RS, oy + 71 * RS);
      const ws = inf.waiting || [];
      ws.forEach((w, i) => person(w.id, 20 + (i * 53 + hash(w.id)) % 190, 92 + i % 3 * 9, "u"));
      heroDraw(128, 108, "u");
      R5(0, 114, RW, 6, "#c5bd9f");
    } else if (inf.phase === "ride") {
      const moving = !inf.atStop;
      const scroll = tf * 6 % 240;
      R5(0, 0, RW, 72, "#dfe6ee");
      R5(0, 0, RW, 4, "#9aa6b5");
      R5(0, 62, RW, 10, "#3d6bb0");
      R5(0, 70, RW, 3, "#b0b8c4");
      for (let i = 0; i < 4; i++) {
        const wx = 8 + i * 58;
        R5(wx, 10, 50, 34, "#42506a");
        R5(wx + 2, 12, 46, 30, sky);
        if (moving) {
          for (let k = 0; k < 4; k++) {
            const bx = ((wx + 2 + k * 18 - scroll * (0.6 + k % 2 * 0.5)) % 60 + 60) % 60 - 12;
            const bw = 10 + k * 5 % 9, bh = 10 + k * 7 % 14;
            const cx0 = Math.max(wx + 2, wx + 2 + bx), cx1 = Math.min(wx + 48, wx + 2 + bx + bw);
            if (cx1 > cx0) R5(cx0, 42 - bh, cx1 - cx0, bh, nightA > 0.3 ? "#2b3350" : k % 2 ? "#a9b8a0" : "#9fb1c8");
          }
          R5(wx + 2, 36, 46, 6, nightA > 0.3 ? "#2a4a2a" : "#6ab04c");
        } else {
          R5(wx + 2, 34, 46, 8, "#c9c2a8");
          R5(wx + 14, 18, 22, 8, "#2c4a7a");
          ctx4.fillStyle = "#fff";
          ctx4.font = `${Math.round(5 * RS)}px sans-serif`;
          ctx4.textAlign = "center";
          ctx4.fillText(inf.next && inf.next.name || "", ox + (wx + 25) * RS, oy + 24 * RS);
        }
      }
      for (let x = 12; x < RW; x += 16) {
        R5(x, 4, 1, 6, "#777");
        R5(x - 1, 10, 3, 3, "#e8e8e8");
      }
      R5(0, 72, RW, 48, "#7c8794");
      R5(0, 72, RW, 2, "#5b6573");
      for (let s = 0; s < 14; s++) R5(8 + s * 16, 58, 15, 12, "#2a6f4f");
      const seated = inf.seated || [];
      const riders2 = inf.riders || [];
      const stand = riders2.filter((r) => !seated.includes(r.id));
      const bustAt = (id, x, isHero) => {
        if (!rideReady(this)) {
          isHero ? heroDraw(x, 69, "d") : person(id, x, 69, "d");
          return;
        }
        const hid = isHero ? g.hero.id : id;
        const c = riderColors(this, hid, pop.look[hid], isHero ? g.age() : g.ageOf(id));
        drawBust(this, ctx4, c, "F", ox + x * RS, oy + 54.5 * RS, 0.62 * RS, { scale: isHero ? 1 : 0.97 });
      };
      seated.forEach((id, i) => {
        const sx = seatX(id, i, ride);
        bustAt(id, sx, false);
      });
      const seatBack = (x) => {
        R5(x - 7.5, 60, 15, 10, "#2a6f4f");
        R5(x - 7.5, 60, 15, 2, "#3b8c66");
        R5(x - 7.5, 68, 15, 2, "#1f5a3f");
      };
      seated.forEach((id, i) => seatBack(seatX(id, i, ride)));
      const heroSeat = 8 + 16 * 13 + 8;
      stand.slice(0, 26).forEach((r, i) => {
        const row = i % 3;
        const x = 16 + (i * 41 + hash(r.id)) % 208;
        person(r.id, x, 92 + row * 10, "d");
      });
      if (inf.sitting) {
        bustAt(0, heroSeat, true);
        seatBack(heroSeat);
      } else heroDraw(120 + (tf * 0 | 0), 108, "d");
      R5(0, 62, 5, 58, "#9aa6b5");
      R5(RW - 5, 62, 5, 58, "#9aa6b5");
      if (stand.length > 26) {
        ctx4.fillStyle = "#fff";
        ctx4.font = `${Math.round(6 * RS)}px sans-serif`;
        ctx4.textAlign = "right";
        ctx4.fillText(`\u307B\u304B${stand.length - 26}\u4EBA`, ox + 236 * RS, oy + 118 * RS);
      }
    } else {
      R5(0, 0, RW, RH, "#2c4a7a");
      ctx4.fillStyle = "#fff";
      ctx4.font = `${Math.round(10 * RS)}px sans-serif`;
      ctx4.textAlign = "center";
      ctx4.fillText(`${inf.station || ""}\u99C5`, ox + 120 * RS, oy + 60 * RS);
    }
    this.S = keep;
  };
  function hash(n2) {
    let h = (n2 ^ 2654435769) >>> 0;
    h = Math.imul(h ^ h >>> 15, 2246822507);
    h ^= h >>> 13;
    return h >>> 0;
  }
  function seatX(id, i, ride) {
    return 8 + 16 * i + 8;
  }
  Renderer.prototype.drawScene = function(cv2, sc, t) {
    beginFrame(8);
    const ctx4 = cv2.getContext("2d");
    const W2 = cv2.width, H4 = cv2.height;
    const RS = this.rideScale(W2, H4);
    const keepS = this.S;
    this.S = RS;
    ctx4.imageSmoothingEnabled = false;
    const ox = Math.floor((W2 - RW * RS) / 2), oy = Math.floor((H4 - RH * RS) / 2);
    const R5 = (x, y, w, h, c) => {
      ctx4.fillStyle = c;
      ctx4.fillRect(ox + Math.round(x * RS), oy + Math.round(y * RS), Math.round(w * RS), Math.round(h * RS));
    };
    const g = this.g, pop = g.world.pop;
    const night = this.nightAlpha() > 0.3;
    const sky = night ? "#27345a" : "#8ccbf2";
    ctx4.fillStyle = "#10141c";
    ctx4.fillRect(0, 0, W2, H4);
    const colors = (id) => {
      const hid = id < 0 ? g.hero.id : id;
      return riderColors(this, hid, pop.look[hid], id < 0 ? g.age() : g.ageOf(id));
    };
    const bust = (id, x, y, view, unit, flip) => {
      if (rideReady(this)) drawBust(this, ctx4, colors(id), view, ox + x * RS, oy + y * RS, unit * RS, { flip });
    };
    const scroll = t * 38 % 240;
    const scenery = (x0, y0, w, h, speed) => {
      R5(x0, y0, w, h, sky);
      for (let k = 0; k < 5; k++) {
        const bw = 14 + k * 7 % 11, bh = 10 + k * 11 % 20;
        const bx = ((x0 + k * 29 - scroll * speed * (0.6 + k % 2 * 0.5)) % (w + 30) + (w + 30)) % (w + 30) - 15;
        const a = Math.max(0, bx), b = Math.min(w, bx + bw);
        if (b > a) R5(x0 + a, y0 + h - 8 - bh, b - a, bh, night ? "#2b3350" : k % 2 ? "#a9b8a0" : "#9fb1c8");
      }
      R5(x0, y0 + h - 8, w, 8, night ? "#2a4a2a" : "#6ab04c");
    };
    if (sc.kind === "plane" || sc.kind === "ship" || sc.kind === "bullet") {
      drawJourney(sc, t, { R: R5, bust, RS, ox, oy, night, sky, ctx: ctx4, ids: sc.ids || [] });
      ctx4.fillStyle = "#fff";
      this.S = keepS;
      return;
    }
    if (sc.kind === "bus") {
      R5(0, 0, RW, 72, "#e6e9ee");
      R5(0, 0, RW, 5, "#9aa6b5");
      for (let i = 0; i < 3; i++) {
        const wx = 8 + i * 62;
        R5(wx, 12, 56, 32, "#42506a");
        scenery(wx + 2, 14, 52, 28, 0.9);
        R5(wx + 2, 14, 52, 2, "rgba(255,255,255,0.18)");
      }
      R5(196, 8, 40, 40, "#2c3a50");
      scenery(198, 10, 36, 34, 1.3);
      R5(204, 40, 24, 3, "#555");
      R5(114, 3, 78, 8, "#101418");
      ctx4.fillStyle = "#ff9a2a";
      ctx4.font = `${Math.round(5 * RS)}px sans-serif`;
      ctx4.textAlign = "left";
      ctx4.fillText(sc.label || "", ox + 116 * RS, oy + 9.4 * RS);
      R5(0, 62, RW, 10, "#3d6b50");
      R5(0, 70, RW, 3, "#b0b8c4");
      R5(0, 72, RW, 48, "#6e7783");
      R5(0, 72, RW, 2, "#505a66");
      const seats = [14, 31, 48, 65, 98, 115, 132, 149];
      const ids = sc.ids || [];
      seats.forEach((x, i) => {
        R5(x - 8, 56, 16, 14, "#2f7d4f");
      });
      ids.slice(0, 7).forEach((id, i) => {
        const sx = seats[(i * 3 + 1) % seats.length];
        bust(id, sx, 53, "F", 0.6);
      });
      seats.forEach((x, i) => {
        R5(x - 8, 60, 16, 10, "#2f7d4f");
        R5(x - 8, 60, 16, 2, "#42996a");
      });
      R5(178, 52, 18, 22, "#3a3f4a");
      bust(ids[ids.length - 1] ?? 0, 187, 50, "B", 0.62);
      R5(170, 56, 14, 3, "#222");
      R5(176, 58, 3, 10, "#333");
      R5(0, 0, 0, 0, "#000");
      bust(-1, seats[seats.length - 2] + 0, 53, "F", 0.62);
      R5(seats[seats.length - 2] - 8, 60, 16, 10, "#2f7d4f");
      R5(seats[seats.length - 2] - 8, 60, 16, 2, "#42996a");
      for (let x = 22; x < 170; x += 24) {
        R5(x, 4, 1, 8, "#777");
        R5(x - 1, 12, 3, 3, "#eee");
      }
      {
        const hx2 = seats[seats.length - 2];
        ctx4.fillStyle = "#ffd23a";
        ctx4.beginPath();
        ctx4.moveTo(ox + hx2 * RS, oy + 44 * RS);
        ctx4.lineTo(ox + (hx2 - 3) * RS, oy + 39 * RS);
        ctx4.lineTo(ox + (hx2 + 3) * RS, oy + 39 * RS);
        ctx4.fill();
      }
      (sc.stand || []).slice(0, 4).forEach((id, i) => {
        const nd = pop.needs[id];
        this.drawChar(ctx4, ox + (30 + i * 41) * RS, oy + (92 + i % 2 * 6) * RS, pop.look[id], g.ageOf(id), "d", false, { wheel: !!(nd & 1), id });
      });
      R5(110, 8, 2, 62, "#c9a43a");
      R5(188, 36, 6, 4, "#d94052");
      ctx4.fillStyle = "#fff";
      ctx4.font = `${Math.round(6 * RS)}px sans-serif`;
      ctx4.textAlign = "center";
      ctx4.fillText(sc.text || "", ox + 120 * RS, oy + 108 * RS);
    } else {
      R5(0, 0, RW, 120, "#2a2f38");
      R5(16, 14, 208, 56, "#1b222d");
      scenery(20, 16, 200, 52, 1.1);
      R5(16, 14, 208, 56, "rgba(0,0,0,0)");
      R5(112, 14, 6, 56, "#2a2f38");
      R5(16, 66, 208, 6, "#2a2f38");
      R5(12, 70, 216, 38, "#c9b25a");
      R5(12, 70, 216, 4, "#e0c96a");
      R5(12, 104, 216, 4, "#8a7a30");
      R5(20, 62, 80, 24, "#3a3f4a");
      R5(132, 62, 82, 24, "#3a3f4a");
      R5(20, 80, 80, 8, "#2a2f38");
      R5(132, 80, 82, 8, "#2a2f38");
      bust(sc.ids && sc.ids[0] !== void 0 ? sc.ids[0] : 0, 52, 52, "B", 1.05);
      R5(40, 60, 24, 10, "#3a3f4a");
      R5(20, 62, 80, 24, "#3a3f4a");
      R5(20, 80, 80, 8, "#2a2f38");
      bust(-1, 172, 52, "F", 1.1);
      R5(132, 66, 82, 20, "#3a3f4a");
      R5(132, 82, 82, 6, "#2a2f38");
      R5(150, 2, 44, 14, "#e8c040");
      R5(152, 4, 40, 10, "#101418");
      ctx4.fillStyle = "#7dff9a";
      ctx4.font = `${Math.round(7 * RS)}px monospace`;
      ctx4.textAlign = "center";
      const fareNow = Math.round((sc.fare || 0) * Math.min(1, t / (sc.dur || 3)) / 10) * 10;
      ctx4.fillText("\xA5" + fareNow.toLocaleString("ja-JP"), ox + 172 * RS, oy + 11.4 * RS);
      ctx4.fillStyle = "#fff";
      ctx4.font = `${Math.round(6 * RS)}px sans-serif`;
      ctx4.fillText(sc.text || "", ox + 120 * RS, oy + 116 * RS);
    }
    this.S = keepS;
  };

