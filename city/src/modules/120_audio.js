  // src/audio.js
  var ctx3 = null;
  var master = null;
  var bus = {};
  var on = true;
  var bgmOn = true;
  var bgmTimer = null;
  var mood = () => ({ inside: false, night: false });
  var KEY = "nagayama_japan_lifestory_sound";
  var KEYV = "nagayama_japan_lifestory_soundvol";
  var vol = { sfx: 0.8, amb: 0.7, mus: 0.6, cap: true };
  try {
    const v = localStorage.getItem(KEY);
    if (v === "0") on = false;
    const j = JSON.parse(localStorage.getItem(KEYV) || "null");
    if (j) {
      for (const k of ["sfx", "amb", "mus"]) if (typeof j[k] === "number") vol[k] = Math.max(0, Math.min(1, j[k]));
    }
    if (j && j.cap === false) vol.cap = false;
  } catch (e) {
  }
  var saveVol = () => {
    try {
      localStorage.setItem(KEYV, JSON.stringify(vol));
    } catch (e) {
    }
  };
  function ensure() {
    if (ctx3) return ctx3;
    const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    try {
      ctx3 = new AC();
      master = ctx3.createGain();
      master.gain.value = 0.55;
      master.connect(ctx3.destination);
      for (const k of ["sfx", "amb", "mus"]) {
        bus[k] = ctx3.createGain();
        bus[k].gain.value = vol[k];
        bus[k].connect(master);
      }
    } catch (e) {
      ctx3 = null;
    }
    return ctx3;
  }
  var B = (n2) => bus[n2] || master;
  function tone(f2, dur, { type = "sine", gain = 0.12, at = 0, to = null, attack = 5e-3, b = "sfx", pan = 0 } = {}) {
    if (!on || !ensure()) return;
    const t = ctx3.currentTime + at;
    const o = ctx3.createOscillator(), g = ctx3.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f2, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(Math.max(2e-4, gain), t + attack);
    g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    let out = g;
    if (pan && ctx3.createStereoPanner) {
      const p = ctx3.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      out = p;
    }
    o.connect(g);
    out.connect(B(b));
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  var nbuf = null;
  var noiseBuf = () => {
    if (nbuf) return nbuf;
    const n2 = ctx3.sampleRate * 2;
    nbuf = ctx3.createBuffer(1, n2, ctx3.sampleRate);
    const d = nbuf.getChannelData(0);
    let s = 12345;
    for (let i = 0; i < n2; i++) {
      s = s * 1664525 + 1013904223 >>> 0;
      d[i] = s / 4294967296 * 2 - 1;
    }
    return nbuf;
  };
  function noise3(dur, { gain = 0.08, at = 0, lp = 2e3, hp = 0, b = "sfx" } = {}) {
    if (!on || !ensure()) return;
    const t = ctx3.currentTime + at;
    const s = ctx3.createBufferSource();
    s.buffer = noiseBuf();
    s.loop = true;
    const f2 = ctx3.createBiquadFilter();
    f2.type = "lowpass";
    f2.frequency.value = lp;
    const g = ctx3.createGain();
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(Math.max(2e-4, gain), t + Math.min(0.03, dur / 3));
    g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    s.connect(f2);
    let last = f2;
    if (hp) {
      const h = ctx3.createBiquadFilter();
      h.type = "highpass";
      h.frequency.value = hp;
      f2.connect(h);
      last = h;
    }
    last.connect(g);
    g.connect(B(b));
    s.start(t, Math.random());
    s.stop(t + dur + 0.02);
  }
  var capHook = null;
  var capSeen = /* @__PURE__ */ new Map();
  function cap(key, text, gapMs = 6e3) {
    if (!vol.cap || !capHook) return;
    const now = Date.now();
    if (now - (capSeen.get(key) || 0) < gapMs) return;
    capSeen.set(key, now);
    try {
      capHook(text);
    } catch (e) {
    }
  }
  var PENT = [0, 2, 4, 7, 9];
  var TUNES = {
    // いずれもこのゲームのためのオリジナル旋律
    shotengai_old: { root: 261.63, bpm: 118, type: "triangle", gain: 0.05, bass: "square", n: [[7, 1], [7, 0.5], [9, 0.5], [7, 1], [4, 1], [5, 1], [5, 0.5], [4, 0.5], [2, 1], [0, 1], [2, 1], [4, 0.5], [5, 0.5], [7, 1], [4, 1], [null, 1], [7, 1], [9, 1], [12, 1.5], [9, 0.5], [7, 1], [5, 1], [4, 1], [2, 1], [0, 2], [null, 1]] },
    shotengai_new: { root: 293.66, bpm: 104, type: "sine", gain: 0.055, bass: "triangle", n: [[0, 1], [4, 1], [7, 1], [12, 1], [11, 1], [7, 1], [4, 2], [5, 1], [9, 1], [12, 1], [9, 1], [7, 2], [4, 1], [2, 1], [0, 2], [null, 1]] },
    shotengai_open: { root: 329.63, bpm: 92, type: "triangle", gain: 0.045, bass: "sine", n: [[4, 1.5], [7, 0.5], [9, 1], [7, 1], [4, 1.5], [2, 0.5], [0, 2], [2, 1.5], [4, 0.5], [7, 1], [9, 1], [11, 2], [null, 1], [12, 1], [11, 1], [9, 1], [7, 1], [4, 2], [null, 2]] },
    festival: { root: 293.66, bpm: 132, type: "square", gain: 0.03, bass: "sine", n: [[0, 0.5], [0, 0.5], [3, 0.5], [5, 0.5], [7, 1], [5, 0.5], [3, 0.5], [0, 1], [null, 1], [3, 0.5], [5, 0.5], [7, 0.5], [10, 0.5], [12, 1], [10, 0.5], [7, 0.5], [5, 1], [null, 1]] },
    wedding: { root: 261.63, bpm: 76, type: "sine", gain: 0.07, bass: "triangle", n: [[0, 1], [4, 1], [7, 1], [12, 3], [11, 1], [9, 1], [7, 1], [9, 3], [5, 1], [7, 1], [9, 1], [12, 2], [11, 1], [12, 1], [14, 4]] },
    birth: { root: 349.23, bpm: 84, type: "sine", gain: 0.06, bass: "sine", n: [[7, 1.5], [4, 0.5], [0, 1], [4, 1], [7, 2], [9, 1], [7, 1], [4, 3], [null, 1], [2, 1], [4, 1], [7, 1], [12, 3]] },
    graduation: { root: 261.63, bpm: 88, type: "triangle", gain: 0.06, bass: "sine", n: [[7, 1], [7, 1], [9, 1], [12, 1], [11, 2], [9, 2], [7, 1], [5, 1], [4, 1], [2, 1], [4, 3], [null, 1], [0, 1], [4, 1], [7, 2], [12, 3]] },
    sad: { root: 220, bpm: 58, type: "sine", gain: 0.06, bass: "sine", n: [[0, 2], [3, 1], [7, 1], [5, 2], [3, 1], [2, 1], [0, 3], [null, 1], [-2, 2], [0, 2], [3, 2], [2, 4]] },
    newyear: { root: 293.66, bpm: 96, type: "triangle", gain: 0.055, bass: "square", n: [[0, 1], [2, 1], [5, 1], [7, 1], [9, 2], [7, 2], [5, 1], [2, 1], [0, 1], [2, 1], [5, 2], [null, 2], [7, 1], [9, 1], [12, 2], [9, 2]] },
    adventure: { root: 261.63, bpm: 112, type: "triangle", gain: 0.055, bass: "sine", n: [[0, 0.5], [4, 0.5], [7, 1], [12, 1], [7, 1], [9, 0.5], [7, 0.5], [4, 1], [5, 1], [7, 1], [9, 1], [12, 2], [null, 1], [11, 1], [9, 1], [7, 1], [4, 1]] },
    firstcar: { root: 329.63, bpm: 120, type: "square", gain: 0.032, bass: "triangle", n: [[0, 0.5], [4, 0.5], [7, 0.5], [12, 0.5], [11, 1], [7, 1], [9, 0.5], [7, 0.5], [4, 1], [5, 1], [2, 1], [4, 2], [null, 1]] }
  };
  var musicCur = null;
  var musicIdx = 0;
  var musicNext = 0;
  var musicEnd = 0;
  var lifeUntil = 0;
  function musicSchedule() {
    if (!on || !ctx3 || ctx3.state !== "running" || !musicCur) return;
    const T4 = TUNES[musicCur];
    if (!T4) return;
    const now = ctx3.currentTime;
    if (musicEnd && now > musicEnd) {
      musicCur = null;
      return;
    }
    while (musicNext < now + 0.6) {
      const [s, beats] = T4.n[musicIdx % T4.n.length];
      const bl = 60 / T4.bpm;
      const t0 = Math.max(musicNext, now);
      const dur = beats * bl;
      if (s !== null) tone(T4.root * Math.pow(2, s / 12), Math.max(0.2, dur * 1.1), { type: T4.type, gain: T4.gain, at: t0 - now, b: "mus", attack: 0.012 });
      if (musicIdx % 4 === 0) {
        const bs = [0, 5, 7, 4][Math.floor(musicIdx / 4) % 4];
        tone(T4.root / 2 * Math.pow(2, bs / 12), bl * 2.4, { type: T4.bass, gain: T4.gain * 0.7, at: t0 - now, b: "mus", attack: 0.02 });
      }
      if (T4.bpm >= 112 && musicIdx % 2 === 1) noise3(0.04, { gain: 0.012, lp: 5e3, hp: 3500, at: t0 - now, b: "mus" });
      musicNext = t0 + dur;
      musicIdx++;
    }
  }
  function playTune(name, seconds) {
    if (!on || !ensure() || !TUNES[name]) return;
    if (musicCur === name && !seconds) return;
    musicCur = name;
    musicIdx = 0;
    musicNext = ctx3.currentTime + 0.05;
    musicEnd = seconds ? ctx3.currentTime + seconds : 0;
  }
  var L = {};
  var ambOK = false;
  function mkLayer(name, type, f2, q, off) {
    const s = ctx3.createBufferSource();
    s.buffer = noiseBuf();
    s.loop = true;
    const fl = ctx3.createBiquadFilter();
    fl.type = type;
    fl.frequency.value = f2;
    fl.Q.value = q || 0.7;
    const g = ctx3.createGain();
    g.gain.value = 0;
    s.connect(fl);
    fl.connect(g);
    g.connect(B("amb"));
    s.start(0, off || 0);
    L[name] = { g, fl };
  }
  function ambInit() {
    if (ambOK || !ensure()) return;
    ambOK = true;
    mkLayer("traffic", "lowpass", 260, 0.7, 0.2);
    mkLayer("wind", "bandpass", 600, 0.5, 0.7);
    mkLayer("water", "lowpass", 900, 0.5, 1.1);
    mkLayer("crowd", "bandpass", 900, 0.9, 1.5);
    mkLayer("rail", "lowpass", 180, 0.8, 0.5);
    mkLayer("rain", "highpass", 2500, 0.5, 1.7);
    mkLayer("room", "lowpass", 140, 0.5, 0.9);
    mkLayer("cicada", "bandpass", 5200, 6, 0.4);
  }
  var setL = (n2, v, f2) => {
    const l = L[n2];
    if (!l) return;
    l.g.gain.setTargetAtTime(Math.max(0, v), ctx3.currentTime, 0.35);
    if (f2) l.fl.frequency.setTargetAtTime(f2, ctx3.currentTime, 0.5);
  };
  var st2 = {};
  var lastEv = {};
  var ambAcc = 0;
  var bellPhase = 0;
  var wasTrainNear = false;
  var lastHour = -1;
  var rnd2 = () => Math.random();
  function every(key, secs, fn) {
    const t = ctx3.currentTime;
    if (t - (lastEv[key] ?? -1e9) >= secs) {
      lastEv[key] = t;
      fn();
    }
  }
  var near = (d, r) => d == null || !isFinite(d) ? 0 : Math.max(0, 1 - d / r);
  function ambUpdate(dt) {
    if (!on || !ctx3 || ctx3.state !== "running") return;
    ambInit();
    const s = st2, ins = !!s.inside, o = ins ? 0.25 : 1;
    const night = !!s.night, month = s.month0 | 0, hr = s.hour | 0;
    const tr = Math.min(1, (s.carN || 0) / 10) * 0.6 + near(s.carD, 22) * 0.4;
    setL("traffic", tr * 0.16 * o * (night ? 0.7 : 1), ins ? 140 : 240 + near(s.carD, 12) * 300);
    setL("wind", (s.weather === "snow" || s.weather === "rain" ? 0.05 : 0.02) * o * (month === 11 || month <= 1 ? 1.6 : 1) * (s.open ? 1.4 : 1), 500 + (month === 11 || month <= 1 ? 250 : 0));
    setL("water", near(s.waterD, 10) * 0.12 * o, 700);
    setL("crowd", Math.min(0.1, (near(s.shopD, 14) * 0.05 + (s.arcade ? 0.06 : 0) + near(s.stationD, 8) * 0.04) * (night ? 0.6 : 1) * (hr < 6 ? 0.2 : 1)) * (ins ? 0.5 : 1), 800);
    setL("rain", s.weather === "rain" ? ins ? 0.03 : 0.09 : 0, 2600);
    setL("room", ins ? 0.05 : 0, 140);
    const tN = near(s.trainD, 26) * (s.trainMoving ? 1 : 0.15);
    setL("rail", tN * 0.22 * (ins ? 0.5 : 1), 160 + tN * 260);
    setL("cicada", month >= 6 && month <= 8 && !night && s.weather !== "rain" && !ins && (s.green || 0) > 0.1 ? 0.012 + 0.012 * Math.sin(ctx3.currentTime * 2.3) ** 2 : 0, 5200);
    const tn = s.trainD != null && s.trainD < 13 && s.trainMoving && !ins;
    if (tn && !wasTrainNear) {
      cap("train", "\u96FB\u8ECA\u304C\u8FD1\u3065\u304F\u97F3");
      every("trainhorn", 25, () => {
        tone(540, 0.45, { type: "sawtooth", gain: 0.025, b: "amb", to: 520 });
        tone(405, 0.45, { type: "sawtooth", gain: 0.02, b: "amb" });
      });
    }
    wasTrainNear = tn;
    if (s.crossing && tn && !ins) {
      cap("crossing", "\u8E0F\u5207\u306E\u8B66\u5831\u97F3\u30AB\u30F3\u30AB\u30F3\u30AB\u30F3", 4e3);
      bellPhase += dt;
      every("cbell" + (Math.floor(bellPhase * 2.6) & 1), 0.38, () => {
        tone(Math.floor(bellPhase * 2.6) & 1 ? 1230 : 1050, 0.2, { type: "sine", gain: 0.07, b: "amb" });
      });
    }
    if (tN > 0.5) every("clack", 0.34 - tN * 0.1, () => {
      noise3(0.05, { gain: 0.05 * tN, lp: 1500, hp: 500, b: "amb" });
    });
    if (s.stationD != null && s.stationD < 6 && s.trainAtStop) every("stbell", 40, () => {
      cap("stbell", "\u99C5\u306E\u767A\u8ECA\u30E1\u30ED\u30C7\u30A3");
      [784, 659, 523, 659, 784, 1047].forEach((f2, i) => tone(f2, 0.22, { type: "triangle", gain: 0.05, at: i * 0.2, b: "amb" }));
    });
    if (ins && s.party > 0) {
      every("murmur", 1.4, () => {
        noise3(1.3, { gain: 0.025 * Math.min(1.5, s.party), lp: 1800, hp: 280, b: "amb" });
      });
      every("laugh", 5 + rnd2() * 4, () => {
        for (let k = 0; k < 4; k++) tone(520 + rnd2() * 260, 0.09, { type: "triangle", gain: 0.012 * s.party, at: k * 0.11, b: "amb" });
        cap("laugh", "\u7B11\u3044\u58F0\u3068\u3056\u308F\u3081\u304D", 5e3);
      });
      every("dish", 3.5 + rnd2() * 3, () => {
        tone(2400 + rnd2() * 600, 0.05, { type: "sine", gain: 0.02, b: "amb" });
      });
      if (s.party > 1.2) every("cheers", 20, () => {
        tone(1500, 0.18, { type: "sine", gain: 0.05 });
        tone(1900, 0.14, { type: "sine", gain: 0.04, at: 0.06 });
        cap("cheers", "\u300C\u4E7E\u676F!\u300D\u30B0\u30E9\u30B9\u306E\u89E6\u308C\u5408\u3046\u97F3", 4e3);
      });
    }
    if (ins && s.salon) {
      every("clip", 2.6 + rnd2() * 2, () => {
        noise3(0.05, { gain: 0.03, lp: 6e3, hp: 3e3, b: "amb" });
        noise3(0.05, { gain: 0.03, lp: 6e3, hp: 3e3, at: 0.1, b: "amb" });
      });
      every("dryer", 17, () => {
        cap("dryer", "\u30C9\u30E9\u30A4\u30E4\u30FC\u306E\u97F3", 3e3);
        noise3(2.4, { gain: 0.03, lp: 2600, hp: 900, b: "amb" });
      });
      every("salonbgm", 30, () => cap("salonbgm", "\u5E97\u5185BGM\u3068\u3001\u30B7\u30E3\u30AD\u30B7\u30E3\u30AD\u3068\u30CF\u30B5\u30DF\u306E\u97F3", 2500));
    }
    if (s.busD != null && s.busD < 9) every("bus", 14, () => {
      cap("bus", "\u30D0\u30B9\u304C\u901A\u308B\u97F3");
      tone(78, 1.4, { type: "sawtooth", gain: 0.03, b: "amb", to: 95 });
      noise3(1.3, { gain: 0.04, lp: 380, b: "amb" });
    });
    if ((s.carD || 99) < 5 && !ins) every("carpass", 7 + rnd2() * 5, () => {
      cap("car", "\u8ECA\u304C\u901A\u308A\u904E\u304E\u308B\u97F3", 9e3);
      tone(100 + rnd2() * 40, 0.8, { type: "sawtooth", gain: 0.025, b: "amb", to: 140 });
      noise3(0.8, { gain: 0.03, lp: 500, b: "amb" });
    });
    const h = s.hour + s.min % 60 / 60;
    if (s.schoolD != null && s.schoolD < 16 && s.weekday) {
      for (const [t, nm] of [[8.5, "\u59CB\u696D"], [12.25, "\u663C\u4F11\u307F"], [15.5, "\u4E0B\u6821"], [17, "\u5B8C\u5168\u4E0B\u6821"]]) if (Math.abs(h - t) < 0.03) every("school" + t, 3600, () => {
        cap("school", `\u5B66\u6821\u306E\u30C1\u30E3\u30A4\u30E0(${nm})`, 1e3);
        [392, 523, 440, 294].forEach((f2, i) => tone(f2, 0.7, { type: "sine", gain: 0.07 * near(s.schoolD, 16) * (ins ? 0.5 : 1) + 0.01, at: i * 0.45, b: "amb" }));
      });
    }
    if (!ins && Math.abs(h - 17) < 0.03 && s.outdoor) every("evening", 3600, () => {
      cap("evening", "\u5915\u65B9\u306E\u30C1\u30E3\u30A4\u30E0", 1e3);
      [523, 587, 659, 523, 587, 659, 784].forEach((f2, i) => tone(f2, 0.6, { type: "sine", gain: 0.03, at: i * 0.55, b: "amb" }));
    });
    if (!ins && s.weather !== "rain") {
      if (!night && month >= 2 && month <= 9 && (s.green || 0) > 0.05) every("bird", 4 + rnd2() * 6, () => {
        cap("bird", "\u5C0F\u9CE5\u306E\u3055\u3048\u305A\u308A", 12e3);
        const b = 1800 + rnd2() * 1400;
        for (let i = 0; i < 2 + (rnd2() * 3 | 0); i++) tone(b * (1 + rnd2() * 0.25), 0.09, { type: "sine", gain: 0.02, at: i * 0.12, to: b * 1.2, b: "amb", pan: rnd2() * 2 - 1 });
      });
      if (night && month >= 8 && month <= 10) every("insect", 1.1, () => {
        cap("insect", "\u866B\u306E\u58F0(\u79CB\u306E\u591C)", 2e4);
        for (let i = 0; i < 3; i++) tone(4200 + rnd2() * 400, 0.06, { type: "sine", gain: 0.012, at: i * 0.1, b: "amb" });
      });
      if (night && month >= 4 && month <= 6 && (s.green || 0) > 0.1) every("frog", 1.6, () => {
        cap("frog", "\u30AB\u30A8\u30EB\u306E\u58F0", 2e4);
        tone(380 + rnd2() * 80, 0.12, { type: "square", gain: 0.012, b: "amb" });
      });
      if ((month === 11 || month <= 1) && s.weather === "snow") every("snowhush", 1e9, () => cap("snow", "\u96EA\u306E\u9759\u3051\u3055", 1e9));
      if (s.waterD != null && s.waterD < 6 && !night) every("gull", 10 + rnd2() * 8, () => {
        cap("gull", "\u30AB\u30E2\u30E1\u306E\u9CF4\u304D\u58F0", 15e3);
        tone(1100, 0.3, { type: "triangle", gain: 0.02, to: 800, b: "amb" });
        tone(900, 0.25, { type: "triangle", gain: 0.02, at: 0.35, to: 700, b: "amb" });
      });
    }
    if (!ins && s.arcade && !lifeUntil) {
      const nm = "shotengai_" + (s.arcadeKind || "old");
      const sea = s.arcadeStyle;
      playTune(sea === "festival" ? "festival" : nm);
      cap("arcade", "\u5546\u5E97\u8857\u306E\u97F3\u697D\u304C\u6D41\u308C\u3066\u3044\u308B", 3e4);
    } else if (musicCur && (musicCur.startsWith("shotengai") || musicCur === "festival") && !lifeUntil) {
      musicCur = null;
    }
    if (hr !== lastHour) {
      if (lastHour >= 0 && !ins && hr >= 7 && hr <= 21 && s.hourChime) every("hour", 30, () => {
        cap("hour", "\u6642\u3092\u544A\u3052\u308B\u9418", 1e3);
        tone(660, 1.3, { type: "sine", gain: 0.03, b: "amb" });
      });
      lastHour = hr;
    }
  }
  function bgmTick() {
    if (!on || !bgmOn || !ctx3 || ctx3.state !== "running" || musicCur) return;
    const m = mood();
    const root = m.inside ? 196 : 261.63;
    const n2 = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n2; i++) {
      const k = PENT[Math.floor(Math.random() * PENT.length)] + (Math.random() < 0.3 ? 12 : 0);
      tone(root * Math.pow(2, k / 12), m.night ? 2.6 : 1.8, { type: "sine", gain: m.night ? 0.018 : 0.026, at: i * (0.45 + Math.random() * 0.5), b: "mus" });
    }
  }
  var LIFE_RULES = [[/結婚|婚約|披露宴|プロポーズ/, "wedding", "\u7D50\u5A5A\u306EBGM"], [/出産|誕生|赤ちゃん|妊娠/, "birth", "\u8A95\u751F\u306EBGM"], [/卒業|卒園/, "graduation", "\u5352\u696D\u306EBGM"], [/入学|入園|就職|初出勤|入社/, "adventure", "\u65B0\u751F\u6D3B\u306EBGM"], [/葬|死去|亡くな|お別れ|看取/, "sad", "\u9759\u304B\u306A\u5F14\u3044\u306EBGM"], [/正月|初詣|お年玉|年末年始/, "newyear", "\u304A\u6B63\u6708\u306EBGM"], [/祭|花火|盆踊/, "festival", "\u304A\u796D\u308A\u306EBGM"], [/免許|初めての車|納車|ドライブ/, "firstcar", "\u30C9\u30E9\u30A4\u30D6\u306EBGM"], [/旅行|旅|冒険|大会|優勝|合格/, "adventure", "\u3046\u308C\u3057\u3044\u51FA\u6765\u4E8B\u306EBGM"]];
  function lifeTune(title) {
    const s = String(title || "");
    for (const [re, tune, label] of LIFE_RULES) if (re.test(s)) return { tune, label };
    return null;
  }
  var sfx = {
    get enabled() {
      return on;
    },
    get bgm() {
      return bgmOn;
    },
    get vol() {
      return { ...vol };
    },
    setMood(fn) {
      mood = fn;
    },
    setCaptionHook(fn) {
      capHook = fn;
    },
    setVol(k, v) {
      if (k === "cap") {
        vol.cap = !!v;
        saveVol();
        return;
      }
      if (!(k in vol)) return;
      vol[k] = Math.max(0, Math.min(1, +v || 0));
      if (bus[k]) bus[k].gain.setTargetAtTime(vol[k], ctx3.currentTime, 0.05);
      saveVol();
    },
    unlock() {
      if (!ensure()) return;
      if (ctx3.state === "suspended") ctx3.resume().catch(() => {
      });
      if (!bgmTimer) {
        bgmTimer = setInterval(() => {
          bgmTick();
        }, 3400);
        setInterval(musicSchedule, 200);
      }
      ambInit();
    },
    set(v) {
      on = !!v;
      try {
        localStorage.setItem(KEY, on ? "1" : "0");
      } catch (e) {
      }
      if (on) this.unlock();
      else {
        musicCur = null;
        for (const k in L) setL(k, 0);
      }
    },
    setBgm(v) {
      bgmOn = !!v;
      if (!bgmOn) musicCur = null;
    },
    // 世界の状態を渡す(毎フレーム可)。dt 秒ごとに環境音を更新
    world(state, dt) {
      st2 = state;
      ambAcc += dt;
      if (ambAcc >= 0.2) {
        ambUpdate(ambAcc);
        ambAcc = 0;
        if (lifeUntil && ctx3 && ctx3.currentTime > lifeUntil) lifeUntil = 0;
      }
    },
    life(title) {
      const r = lifeTune(title);
      if (!r || !on || !ensure()) return null;
      playTune(r.tune, 14);
      lifeUntil = ctx3.currentTime + 14;
      cap("life", r.label, 5e3);
      return r;
    },
    tune(name, sec) {
      playTune(name, sec);
    },
    stopTune() {
      musicCur = null;
      lifeUntil = 0;
    },
    get playing() {
      return musicCur;
    },
    caption(text) {
      cap("x" + text, text, 3e3);
    },
    tap() {
      tone(880, 0.06, { type: "triangle", gain: 0.05 });
    },
    step(run, surf) {
      const lp = surf === "gravel" ? 1800 : surf === "wood" ? 500 : surf === "tile" ? 1500 : 900;
      noise3(0.045, { gain: run ? 0.035 : 0.025, lp, hp: 120 });
    },
    door() {
      tone(330, 0.12, { type: "triangle", gain: 0.07 });
      tone(262, 0.18, { type: "triangle", gain: 0.06, at: 0.1 });
      cap("door", "\u6249\u306E\u958B\u304F\u97F3", 1500);
    },
    konbini() {
      tone(1047, 0.18, { type: "sine", gain: 0.07 });
      tone(784, 0.3, { type: "sine", gain: 0.07, at: 0.2 });
      cap("konbini", "\u30B3\u30F3\u30D3\u30CB\u306E\u5165\u5E97\u97F3\u30D4\u30F3\u30DD\u30FC\u30F3", 1500);
    },
    register() {
      tone(1760, 0.05, { type: "square", gain: 0.03 });
      tone(2093, 0.05, { type: "square", gain: 0.03, at: 0.09 });
      noise3(0.12, { gain: 0.03, lp: 3e3, hp: 1500, at: 0.18 });
      cap("reg", "\u30EC\u30B8\u306E\u97F3", 1500);
    },
    fuel() {
      noise3(1.8, { gain: 0.05, lp: 900, hp: 200 });
      tone(220, 1.6, { type: "sine", gain: 0.01, to: 260 });
      cap("fuel", "\u7D66\u6CB9\u6A5F\u306E\u97F3", 2e3);
    },
    engine() {
      tone(70, 0.9, { type: "sawtooth", gain: 0.04, to: 120 });
      noise3(0.8, { gain: 0.03, lp: 350 });
      cap("engine", "\u30A8\u30F3\u30B8\u30F3\u306E\u59CB\u52D5\u97F3", 2e3);
    },
    carDoor() {
      noise3(0.08, { gain: 0.07, lp: 1200, hp: 200 });
      tone(140, 0.12, { type: "square", gain: 0.03 });
      cap("cardoor", "\u8ECA\u306E\u30C9\u30A2", 1500);
    },
    scissors() {
      noise3(0.05, { gain: 0.06, lp: 6500, hp: 3200 });
      noise3(0.05, { gain: 0.06, lp: 6500, hp: 3200, at: 0.12 });
      noise3(0.05, { gain: 0.06, lp: 6500, hp: 3200, at: 0.24 });
      cap("scissors", "\u30CF\u30B5\u30DF\u306E\u97F3(\u30B7\u30E3\u30AD\u30B7\u30E3\u30AD)", 1800);
    },
    bicycleBell() {
      tone(2093, 0.25, { type: "sine", gain: 0.05 });
      tone(2637, 0.3, { type: "sine", gain: 0.04, at: 0.08 });
      cap("bell", "\u81EA\u8EE2\u8ECA\u306E\u30D9\u30EB(\u30C1\u30EA\u30F3)", 1500);
    },
    fitting() {
      noise3(0.25, { gain: 0.04, lp: 2500, hp: 600 });
      noise3(0.2, { gain: 0.04, lp: 2800, hp: 700, at: 0.3 });
      cap("curtain", "\u8A66\u7740\u5BA4\u306E\u30AB\u30FC\u30C6\u30F3", 1500);
    },
    coin() {
      tone(988, 0.08, { type: "square", gain: 0.045 });
      tone(1319, 0.2, { type: "square", gain: 0.045, at: 0.07 });
    },
    chime() {
      [523, 659, 784].forEach((f2, i) => tone(f2, 0.5, { type: "sine", gain: 0.07, at: i * 0.11 }));
    },
    train() {
      [659, 523].forEach((f2, i) => tone(f2, 0.35, { type: "sine", gain: 0.08, at: i * 0.3 }));
      noise3(1.6, { gain: 0.05, lp: 500, at: 0.6 });
      cap("rideTrain", "\u96FB\u8ECA\u306E\u8D70\u884C\u97F3", 3e3);
    },
    car() {
      tone(120, 0.5, { type: "sawtooth", gain: 0.03, to: 160 });
      noise3(0.6, { gain: 0.03, lp: 400 });
    },
    jingle() {
      [523, 659, 784, 1047].forEach((f2, i) => tone(f2, 0.28, { type: "triangle", gain: 0.07, at: i * 0.12 }));
    },
    bad() {
      tone(220, 0.25, { type: "sawtooth", gain: 0.04, to: 150 });
    },
    _reset() {
      for (const k in lastEv) delete lastEv[k];
      capSeen.clear();
    },
    _ctx: () => ctx3,
    _state: () => ({ musicCur, vol: { ...vol }, buses: Object.keys(bus), layers: Object.keys(L) })
  };

