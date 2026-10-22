  // src/soundscape.js — 場所ごとの生活音(audio.js / soundstate.js の拡張)
  // 音はすべてこのゲームの中で合成する(録音素材・有料素材なし)。字幕は既存の字幕設定に従う。
  // 実際の状態に連動: 近くの人の数・営業中の店の数・駅の利用者とホームの列車・動物園で展示中の動物の種類。
  var SX = { t: 0, shops: null };
  function soundExtra(g, R5, s) {
    const L2 = g.S.loc, now = performance.now();
    if (s.inside) {
      const b = g.bld(L2.b);
      s.btype = b ? b.type : "";
      s.peopleN = (U.people || []).length;
      s.commuterN = (U.people || []).filter((q) => q.role === "commuter").length;
      try {
        const { I: I2 } = interiorOf(g, L2.b, L2.floor);
        s.platform = I2.platform || null;
        s.gateFloor = !!I2.gate;
        if (s.btype === "zoo") {
          s.zooSp = [];
          for (const o of I2.objs) if (o.t === "fx_zooex") s.zooSp.push({ sp: o.sp, d: Math.hypot(o.x + (o.w || 1) / 2 - L2.x, o.y + (o.h || 1) / 2 - L2.y) });
        }
        if (s.platform) {
          s.tracks = I2.objs.filter((o) => o.t === "fx_track" && o.to).map((o) => ({ ph: o.ph || 0, name: o.label }));
        }
      } catch (e) {
      }
      return s;
    }
    const map2 = g.world.map, x = L2.x, y = L2.y;
    s.walkN = (R5.walkers || []).filter((w) => Math.abs(w.x - x) < 11 && Math.abs(w.y - y) < 11).length;
    // 営業中の店(2秒ごとに数え直す)
    if (!SX.shops || now - SX.at > 2e3 || Math.abs(SX.x - x) + Math.abs(SX.y - y) > 6) {
      SX.at = now;
      SX.x = x;
      SX.y = y;
      let open = 0, izk = 0, park = 1e9, res = 0, zoo = 1e9, kon = 1e9;
      for (const b of map2.buildings) {
        const d = Math.abs(b.doorX - x) + Math.abs(b.doorY - y);
        if (d > 16) continue;
        const bt = BTYPES[b.type];
        if (bt.cat === "res") res++;
        if (b.type === "park") park = Math.min(park, d);
        if (b.type === "zoo") zoo = Math.min(zoo, d);
        if (VISIT[b.type] && b.status !== "closed") {
          let ok = true;
          try {
            ok = isOpenFor(g, b).ok;
          } catch (e) {
          }
          if (ok) {
            open++;
            if (b.type === "izakaya") izk++;
            if (b.type === "konbini") kon = Math.min(kon, d);
          }
        }
      }
      SX.shops = { open, izk, park, res, zoo, kon };
    }
    Object.assign(s, { openShopN: SX.shops.open, izakayaN: SX.shops.izk, parkD: SX.shops.park, resN: SX.shops.res, zooD: SX.shops.zoo, konD: SX.shops.kon });
    return s;
  }
  // 声のような音(言葉にはしない。意味は字幕で伝える)
  function voiceish(f0, syl, gain, at = 0, pan = 0) {
    for (let k = 0; k < syl; k++) {
      const f2 = f0 * (0.9 + rnd2() * 0.3);
      tone(f2, 0.11, { type: "triangle", gain, at: at + k * 0.13, to: f2 * (0.92 + rnd2() * 0.16), b: "amb", pan });
    }
  }
  var ZOO_VOICE = {
    trumpet: { every: [22, 40], cap: "ゾウの鳴き声(パオーン)", play: (k) => {
      tone(420, 0.9, { type: "sawtooth", gain: 0.05 * k, to: 760, b: "amb" });
      tone(630, 0.9, { type: "square", gain: 0.02 * k, to: 1100, b: "amb" });
    } },
    roar: { every: [30, 55], cap: "ライオンのうなり声", play: (k) => {
      tone(95, 1.6, { type: "sawtooth", gain: 0.06 * k, to: 70, b: "amb" });
      noise3(1.4, { gain: 0.05 * k, lp: 420, b: "amb" });
    } },
    monkey: { every: [5, 10], cap: "サルの鳴き声(キーキー)", play: (k) => {
      for (let i = 0; i < 3; i++) tone(1300 + rnd2() * 500, 0.07, { type: "square", gain: 0.02 * k, at: i * 0.1, to: 1900, b: "amb" });
    } },
    honk: { every: [8, 14], cap: "フラミンゴの鳴き声(ガーガー)", play: (k) => {
      for (let i = 0; i < 2; i++) tone(380 + rnd2() * 60, 0.16, { type: "square", gain: 0.025 * k, at: i * 0.22, b: "amb" });
    } },
    birds: { every: [1.5, 3], cap: "小鳥たちのさえずり", play: (k) => {
      const b = 2200 + rnd2() * 1500;
      for (let i = 0; i < 3; i++) tone(b * (1 + rnd2() * 0.3), 0.07, { type: "sine", gain: 0.025 * k, at: i * 0.09, to: b * 1.3, b: "amb", pan: rnd2() * 2 - 1 });
    } }
  };
  function ambExtra(s, dt) {
    const ins = !!s.inside, h = s.hour + s.min % 60 / 60, night = !!s.night;
    if (!ins) {
      // 人のざわめき: 実際に近くを歩く人と営業中の店の数で決める
      const crowd = Math.min(0.16, (s.walkN || 0) * 0.007 + (s.openShopN || 0) * 3e-3 + (s.arcade ? 0.03 : 0));
      setL("crowd", crowd * (h < 6 ? 0.3 : 1), 700 + Math.min(600, (s.walkN || 0) * 30));
      if ((s.openShopN || 0) >= 3 && (s.walkN || 0) >= 2 && h >= 9 && h < 20) every("yobikomi", 9 + rnd2() * 9, () => {
        const L3 = ["「いらっしゃいませー!」", "「本日の特売でーす」", "「安いよ安いよ!」", "「焼きたてですよー」", "「どうぞご覧くださーい」"];
        cap("yobikomi", "店員の呼び込み " + L3[rnd2() * L3.length | 0], 8e3);
        voiceish(260 + rnd2() * 120, 4 + (rnd2() * 3 | 0), 0.018, 0, rnd2() * 1.6 - 0.8);
      });
      if (s.konD != null && s.konD < 4) every("autodoor", 18 + rnd2() * 10, () => {
        cap("autodoor", "自動ドアの開く音と入店チャイム", 1e4);
        noise3(0.5, { gain: 0.02, lp: 900, hp: 200, b: "amb" });
        [988, 784].forEach((f2, i) => tone(f2, 0.25, { type: "sine", gain: 0.03, at: 0.3 + i * 0.22, b: "amb" }));
      });
      if ((s.walkN || 0) >= 3 && !night) every("bikebell", 25 + rnd2() * 30, () => {
        cap("bikebell", "自転車のベル(チリンチリン)", 2e4);
        [2600, 2600].forEach((f2, i) => tone(f2, 0.18, { type: "sine", gain: 0.03, at: i * 0.2, b: "amb", pan: rnd2() * 2 - 1 }));
      });
      if (night && h >= 18 && (s.izakayaN || 0) >= 2) {
        setL("crowd", Math.min(0.16, crowd + 0.04 + (s.izakayaN || 0) * 0.01), 900);
        every("drunk", 7 + rnd2() * 6, () => {
          cap("drunk", "夜の飲み屋街のにぎわい(笑い声・「もう一軒!」)", 1e4);
          for (let k = 0; k < 4; k++) tone(480 + rnd2() * 220, 0.09, { type: "triangle", gain: 0.014, at: k * 0.12, b: "amb" });
        });
      }
      if (s.parkD != null && s.parkD < 12) {
        if (h >= 9 && h < 17.5) every("kids", 6 + rnd2() * 6, () => {
          cap("kids", "公園で遊ぶ子どもたちの声", 15e3);
          voiceish(520 + rnd2() * 200, 3, 0.014, 0, rnd2() * 2 - 1);
        });
      }
      if ((s.resN || 0) >= 6) {
        if (h >= 6.5 && h < 8) every("morning", 40, () => cap("morning", "朝の住宅地(戸の開け閉め・「いってきます」)", 6e4));
        if (h >= 17 && h < 19) every("supper", 45, () => cap("supper", "夕飯の支度の音とテレビの音(住宅地)", 6e4));
      }
      if (s.zooD != null && s.zooD < 14) every("zoofar", 30 + rnd2() * 20, () => {
        const v = [ZOO_VOICE.trumpet, ZOO_VOICE.roar, ZOO_VOICE.honk][rnd2() * 3 | 0];
        cap("zoofar", "動物園の方から " + v.cap, 3e4);
        v.play(0.35);
      });
      return;
    }
    // 屋内
    const bt = s.btype || "";
    setL("crowd", Math.min(0.12, (s.peopleN || 0) * 0.005), 800);
    if (bt === "zoo") {
      for (const z of s.zooSp || []) {
        const S2 = ZOO_SP[z.sp], v = S2 && S2.voice && ZOO_VOICE[S2.voice];
        if (!v || z.d > 12) continue;
        const k = Math.max(0.15, 1 - z.d / 12);
        every("zoo_" + z.sp, v.every[0] + rnd2() * (v.every[1] - v.every[0]), () => {
          cap("zoo_" + z.sp, v.cap, 5e3);
          v.play(k);
        });
      }
    }
    if ((bt === "station" || bt === "metro") && !s.platform) {
      const n2 = s.commuterN || 0;
      if (n2 > 0) every("gate", Math.max(0.35, 3 / (1 + n2 / 3)), () => {
        cap("gate", "自動改札の「ピッ」という音と足音", 2e4);
        tone(2000, 0.06, { type: "sine", gain: 0.03, b: "amb" });
        noise3(0.06, { gain: 0.015 * Math.min(3, 1 + n2 / 8), lp: 900, hp: 150, b: "amb" });
      });
      every("annc", 45, () => {
        cap("annc", "駅構内アナウンス「本日もご利用いただき、ありがとうございます」", 4e4);
        [659, 523].forEach((f2, i) => tone(f2, 0.35, { type: "sine", gain: 0.03, at: i * 0.3, b: "amb" }));
      });
    }
    if (s.platform && s.tracks) {
      // ホームの列車(fx_track と同じ60秒周期: 入線0〜8秒・停車8〜23秒・発車23〜31秒)
      const tm = R4 && R4.time || 0;
      let rail = 0;
      for (const tk of s.tracks) {
        const tt = (tm + tk.ph * 60) % 60;
        if (tt < 8) rail = Math.max(rail, 0.5 + (8 - tt) / 16);
        else if (tt >= 23 && tt < 31) rail = Math.max(rail, 0.3 + (tt - 23) / 16);
        const key = tk.name;
        if (tt >= 56) every("appr" + key, 50, () => {
          cap("appr" + key, `ホームのアナウンス「まもなく ${tk.name.split(" ")[0]} に電車がまいります。黄色い線の内側までお下がりください」`, 2e4);
          [784, 988, 784].forEach((f2, i) => tone(f2, 0.3, { type: "sine", gain: 0.035, at: i * 0.32, b: "amb" }));
        });
        if (tt >= 8 && tt < 9) every("door" + key, 50, () => {
          cap("door" + key, "ドアが開く音(プシュー)", 2e4);
          noise3(0.6, { gain: 0.04, lp: 3e3, hp: 800, b: "amb" });
        });
        if (tt >= 20 && tt < 21) every("mel" + key, 50, () => {
          cap("mel" + key, "発車メロディー「ドアが閉まります。ご注意ください」", 2e4);
          [523, 659, 784, 659, 880, 784].forEach((f2, i) => tone(f2, 0.2, { type: "triangle", gain: 0.04, at: i * 0.2, b: "amb" }));
        });
      }
      setL("rail", rail * 0.22, 160 + rail * 260);
    }
    if (bt === "hospital" || bt === "clinic") {
      setL("crowd", Math.min(0.04, (s.peopleN || 0) * 0.002), 600);
      every("hcall", 22 + rnd2() * 12, () => {
        cap("hcall", `呼び出し「受付番号${10 + (rnd2() * 80 | 0)}番の方、診察室へお入りください」`, 15e3);
        tone(1046, 0.25, { type: "sine", gain: 0.03, b: "amb" });
        tone(784, 0.35, { type: "sine", gain: 0.03, at: 0.25, b: "amb" });
      });
    }
    if (["elem", "jh", "hs", "univ", "kinder", "special", "cram"].includes(bt) && s.weekday) {
      const cls = h >= 8.6 && h < 12.2 || h >= 13.1 && h < 15.4;
      if (cls) every("lesson", 18 + rnd2() * 10, () => {
        cap("lesson", "授業中(先生の声とチョークの音)", 3e4);
        voiceish(170, 5, 0.014);
        noise3(0.15, { gain: 0.012, lp: 5e3, hp: 2e3, b: "amb", at: 0.9 });
      });
      else if (h >= 8 && h < 16.5) {
        setL("crowd", 0.09, 1100);
        every("recess", 7 + rnd2() * 5, () => {
          cap("recess", "休み時間のにぎやかな声", 3e4);
          voiceish(480 + rnd2() * 160, 4, 0.016, 0, rnd2() * 2 - 1);
        });
      }
    }
  }
