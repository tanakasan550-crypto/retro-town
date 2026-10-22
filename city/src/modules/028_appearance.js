  // src/appearance.js
  var wearGroup = (age) => stageOf(age) <= 1 ? 0 : stageOf(age) <= 3 ? 1 : 2;
  function stageOf(age) {
    return age < 3 ? 0 : age < 6 ? 1 : age < 12 ? 2 : age < 15 ? 3 : age < 19 ? 4 : age < 30 ? 5 : age < 50 ? 6 : age < 60 ? 7 : age < 80 ? 8 : 9;
  }
  var CLASS_OF_STAGE = [0, 1, 2, 3, 4, 5, 5, 5, 6, 7];
  var FACE_SHAPES = [{ rx: 34, ry: 31 }, { rx: 32, ry: 33 }, { rx: 36, ry: 30 }, { rx: 33, ry: 32 }];
  var EYES = ["round", "round", "almond", "narrow", "sleepy", "cat", "arc"];
  var BROWS = ["arc", "flat", "tilt", "thick", "up"];
  var MOUTHS = ["smile", "smile", "open", "small", "flat", "teeth"];
  var HAIR_KEYS = ["baby", "bowl", "short", "spiky", "swept", "side", "fringe", "curly", "gshort", "thin", "bald", "bobkid", "bob", "twin", "ponytail", "long", "pixie", "bun"];
  var BACK_KEYS = ["bob", "bobkid", "long", "ponytail", "twin", "curly", "bun"];
  var WHEEL_OUTFITS = { tee: [0, 1, 2, 3, 4, 5, 6, 7], suit: [5, 6], cardigan: [5, 6, 7], hoodie: [4, 5, 6], blouse: [5, 6, 7], apron: [5, 6] };
  function mix32(a, b = 0) {
    let h = Math.imul(a >>> 0 ^ 2654435769, 2246822507) ^ Math.imul((b >>> 0) + 2135587861, 3266489909);
    h ^= h >>> 15;
    h = Math.imul(h, 739982445);
    h ^= h >>> 12;
    h = Math.imul(h, 695872825);
    h ^= h >>> 15;
    return h >>> 0;
  }
  var rnd = (h, salt) => (mix32(h, salt) >>> 8) / 16777216;
  var pick2 = (h, salt, arr) => arr[Math.floor(rnd(h, salt) * arr.length)];
  var FEMALE_STYLE = /* @__PURE__ */ new Set([1, 2, 3, 4, 6]);
  function identityOf(id, look, inherit, cache14) {
    if (cache14) {
      const c = cache14.get(id);
      if (c) return c;
    }
    const h = mix32(look, id * 2654435761 >>> 0);
    const fem = FEMALE_STYLE.has(look & 7);
    const I2 = { id, fem, skin: look >>> 6 & 3, hairColor: look >>> 3 & 7, h };
    let m = -1, f2 = -1;
    if (inherit) {
      const pr = inherit(id);
      if (pr) {
        m = pr[0];
        f2 = pr[1];
      }
    }
    const parents = [];
    if (m >= 0 && m !== id) parents.push(m);
    if (f2 >= 0 && f2 !== id && f2 !== m) parents.push(f2);
    const P2 = parents.map((p) => identityOf(p, parents.length ? inherit.lookOf ? inherit.lookOf(p) : 0 : 0, inherit, cache14));
    const inh = (key, salt, own, p = 0.55) => {
      if (!P2.length || rnd(h, salt) > p) return own;
      return P2[Math.floor(rnd(h, salt + 100) * P2.length)][key];
    };
    I2.faceShape = inh("faceShape", 1, Math.floor(rnd(h, 11) * FACE_SHAPES.length));
    I2.eye = inh("eye", 2, pick2(h, 12, EYES));
    if (!fem && I2.eye === "cat" && rnd(h, 13) < 0.5) I2.eye = "almond";
    I2.brow = inh("brow", 3, pick2(h, 14, BROWS));
    I2.mouth = inh("mouth", 4, pick2(h, 15, MOUTHS));
    I2.lash = fem && I2.eye !== "arc" && I2.eye !== "sleepy" && rnd(h, 16) < 0.6 ? 1 : 0;
    I2.hairTex = inh("hairTex", 5, rnd(h, 17) < 0.16 ? "curly" : "straight", 0.6);
    I2.hairLen = fem ? rnd(h, 18) < 0.55 ? "long" : "short" : "short";
    I2.freckles = P2.length && rnd(h, 6) < 0.5 ? P2[0].freckles : rnd(h, 19) < 0.1 ? 1 : 0;
    I2.mole = rnd(h, 20) < 0.12 ? 1 + (rnd(h, 21) < 0.5 ? 1 : 0) : 0;
    I2.iris = rnd(h, 22) < 0.93 ? 0 : rnd(h, 23) < 0.5 ? 1 : 2;
    I2.build = inh("build", 7, rnd(h, 24) < 0.25 ? 0 : rnd(h, 24) < 0.75 ? 1 : 2, 0.45);
    I2.height = Math.floor(rnd(h, 25) * 3) - 1;
    I2.grayOnset = 34 + Math.floor(rnd(h, 26) * 44);
    I2.thinOnset = !fem && rnd(h, 27) < 0.55 ? 44 + Math.floor(rnd(h, 28) * 34) : 999;
    I2.baldTrait = !fem && I2.thinOnset < 999 && rnd(h, 29) < 0.45 ? 1 : 0;
    I2.wrinkleOnset = 36 + Math.floor(rnd(h, 30) * 26);
    I2.glassAge = rnd(h, 31) < 0.34 ? 7 + Math.floor(rnd(h, 32) * 50) : rnd(h, 33) < 0.5 ? 52 + Math.floor(rnd(h, 34) * 20) : 999;
    I2.glassKind = rnd(h, 35) < 0.55 ? "round" : "rect";
    I2.facial = !fem && rnd(h, 36) < 0.27 ? rnd(h, 37) < 0.6 ? "mustache" : "beard" : "";
    I2.facialAge = 22 + Math.floor(rnd(h, 38) * 14);
    I2.stoop = rnd(h, 39) < 0.55 ? 1 : 0;
    I2.styleSeed = rnd(h, 40);
    if (cache14) cache14.set(id, I2);
    return I2;
  }
  var HAIR_PLAN = {
    // [stage] → 候補(個人ごとに固定のseedで選ぶ。髪型は人生の節目で変わるので段階ごとに別seedを使う)
    fl: [["baby"], ["bowl", "twin"], ["twin", "ponytail", "bobkid"], ["ponytail", "long", "bobkid"], ["long", "ponytail", "bob"], ["long", "ponytail", "bob"], ["long", "bob", "ponytail"], ["bob", "bun", "long"], ["bun", "gshort", "bob"], ["bun", "gshort"]],
    fs: [["baby"], ["bowl"], ["bobkid", "twin"], ["bob", "pixie", "bobkid"], ["bob", "pixie"], ["bob", "pixie"], ["bob", "pixie"], ["bob", "gshort"], ["gshort", "bun"], ["gshort", "bun"]],
    m: [["baby"], ["bowl", "short"], ["short", "spiky", "side"], ["short", "spiky", "swept"], ["short", "swept", "side", "spiky"], ["short", "side", "swept", "fringe"], ["short", "side", "swept"], ["short", "side", "gshort"], ["gshort", "short"], ["gshort", "short"]]
  };
  function hairStyleAt(I2, age, stage) {
    const plan = I2.fem ? I2.hairLen === "long" ? HAIR_PLAN.fl : HAIR_PLAN.fs : HAIR_PLAN.m;
    const opts = plan[stage];
    let k = opts[Math.floor(rnd(I2.h, 50 + stage) * opts.length)];
    if (I2.hairTex === "curly" && stage >= 2 && !(I2.fem && stage >= 8)) k = "curly";
    if (!I2.fem && age >= I2.thinOnset) k = age >= I2.thinOnset + 14 && I2.baldTrait ? "bald" : "thin";
    return k;
  }
  function lerp3(a, b, t) {
    return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];
  }
  var GRAY = [214, 214, 224];
  function grayAmount(I2, age) {
    return Math.max(0, Math.min(1, (age - I2.grayOnset) / 26));
  }
  function wrinkleLevel(I2, age) {
    if (age < I2.wrinkleOnset) return 0;
    return Math.min(3, 1 + Math.floor((age - I2.wrinkleOnset) / 14));
  }
  function outfitFor(I2, age, stage, role, wheel) {
    const f2 = I2.fem, r = rnd(I2.h, 60 + stage);
    let o;
    if (stage === 0) o = "romper";
    else if (stage === 1) o = f2 ? r < 0.55 ? "kiddress" : "kidtee" : "kidtee";
    else if (stage === 2) o = f2 ? r < 0.5 ? "kiddress" : r < 0.8 ? "kidtee" : "tee" : r < 0.5 ? "kidtee" : r < 0.75 ? "soccer" : "tee";
    else if (stage === 3) o = role === "jh" ? f2 ? "sailor" : "blazer" : f2 ? r < 0.5 ? "hoodie" : "tee" : r < 0.4 ? "hoodie" : r < 0.7 ? "jersey" : "tee";
    else if (stage === 4) o = role === "hs" ? f2 ? "sailor" : "blazer" : f2 ? r < 0.5 ? "hoodie" : "tee" : r < 0.5 ? "hoodie" : "tee";
    else if (stage <= 7) {
      switch (role) {
        case "office":
          o = f2 ? "blouse" : "suit";
          break;
        case "shop":
        case "service":
          o = "apron";
          break;
        case "medical":
          o = "coat";
          break;
        case "teacher":
          o = f2 ? "tunic" : "suit";
          break;
        case "farm":
        case "labor":
          o = r < 0.5 ? "hoodie" : "tee";
          break;
        case "univ":
          o = f2 ? r < 0.5 ? "hoodie" : "dress" : r < 0.5 ? "hoodie" : "tee";
          break;
        case "home":
          o = f2 ? r < 0.4 ? "dress" : r < 0.7 ? "cardigan" : "blouse" : r < 0.5 ? "tee" : "cardigan";
          break;
        case "retired":
          o = f2 ? r < 0.5 ? "cardigan" : "dress" : r < 0.5 ? "cardigan" : "tee";
          break;
        default:
          o = f2 ? r < 0.35 ? "dress" : r < 0.65 ? "blouse" : "tee" : r < 0.5 ? "tee" : "hoodie";
      }
    } else o = f2 ? r < 0.35 ? "kimono" : r < 0.7 ? "cardigan" : "blouse" : r < 0.6 ? "cardigan" : "tee";
    if (stage >= 8 && !f2 && o === "suit") o = "cardigan";
    if (wheel) {
      const w = WHEEL_OUTFITS;
      if (!w[o]) o = f2 ? "blouse" : "tee";
      if (stage < 4) o = "tee";
    }
    return o;
  }
  function bagFor(I2, stage, role, outfit) {
    if (role === "elem" || stage === 2 && role !== "none") return "rand";
    if (role === "jh" || role === "hs") return rnd(I2.h, 70) < 0.25 ? "racket" : "school";
    if (role === "univ") return "pack";
    if (stage >= 5 && stage <= 6 && role === "office") return rnd(I2.h, 71) < 0.45 ? "school" : "";
    return "";
  }
  function appearanceOf(I2, age, life = {}) {
    const stage = stageOf(age), cls = CLASS_OF_STAGE[stage];
    const wheel = !!life.wheel, cane = !!life.cane;
    const role = life.role || "none";
    const A2 = { stage, cls, fem: I2.fem, faceShape: I2.faceShape, eye: I2.eye, lash: I2.lash, brow: I2.brow, mouth: I2.mouth };
    if (stage <= 1 && (I2.mouth === "flat" || I2.mouth === "small")) A2.mouth = "smile";
    if (I2.mouth === "teeth" && stage >= 6) A2.mouth = "open";
    A2.hair = hairStyleAt(I2, age, stage);
    A2.outfit = life.outfit || outfitFor(I2, age, stage, role, wheel);
    A2.bag = life.bag !== void 0 ? life.bag : bagFor(I2, stage, role, A2.outfit);
    A2.wheel = wheel;
    A2.cane = cane && !wheel && cls >= 2;
    A2.wrinkle = cls >= 5 ? wrinkleLevel(I2, age) : 0;
    A2.glass = age >= I2.glassAge ? I2.glassKind : "";
    A2.facial = I2.facial && age >= I2.facialAge ? I2.facial : "";
    A2.freckles = I2.freckles && stage <= 6 ? 1 : I2.freckles && rnd(I2.h, 80) < 0.6 ? 1 : 0;
    A2.mole = I2.mole;
    A2.stoop = stage >= 9 ? I2.stoop * 2 : stage === 8 && I2.stoop && rnd(I2.h, 81) < 0.3 ? 1 : 0;
    A2.gray = grayAmount(I2, age);
    A2.build = I2.build;
    A2.height = I2.height;
    A2.iris = I2.iris;
    if (A2.hair === "bun" && cls < 6) A2.hair = "long";
    return A2;
  }
  function partKeys(A2) {
    const K3 = { cls: A2.cls };
    K3.base = `base:${A2.faceShape}:${A2.cls}`;
    K3.eyes = `eyes:${A2.eye}${A2.lash ? "L" : ""}:${A2.cls}`;
    K3.brows = `brows:${A2.brow}:${A2.cls}`;
    K3.mouth = `mouth:${A2.mouth}:${A2.cls}`;
    K3.hairF = `hairF:${A2.hair}:${A2.cls}:${A2.faceShape}`;
    K3.hairB = BACK_KEYS.includes(A2.hair) ? `hairB:${A2.hair}:${A2.cls}:${A2.faceShape}` : null;
    K3.beard = A2.facial ? `beard:${A2.facial}:${A2.cls}` : null;
    K3.wrinkle = A2.wrinkle ? `wrinkle:${A2.wrinkle}:${A2.cls}` : null;
    K3.glass = A2.glass ? `glass:${A2.glass}:${A2.cls}` : null;
    K3.feat = [A2.freckles ? "freckles" : null, A2.mole ? "mole" + A2.mole : null, ...A2.featX || []].filter(Boolean).map((f2) => `feat:${f2}:${A2.cls}`);
    K3.hat = A2.hat ? `hat:${A2.hat}:${A2.cls}:${A2.faceShape}` : null;
    K3.body = A2.wheel ? `body:wheel-${A2.outfit}:${A2.cls}` : `body:${A2.outfit}:${A2.cls}`;
    K3.bag = A2.bag ? A2.bag + ":" + A2.cls : null;
    K3.cane = A2.cane ? `cane:${A2.cls}` : A2.stick ? `stick:${A2.cls}` : null;
    return K3;
  }
  var SKIN_TONES = [["#f3d0b0", "#e4b894"], ["#f6d7bd", "#e8bfa0"], ["#d7a577", "#b98558"], ["#b9794e", "#9a603a"]];
  var HAIR_COLORS = ["#2a2230", "#3b2a22", "#5a3a26", "#7a4a2a", "#9a6a3a", "#8a3a2a", "#1e2438", "#c9a45a"];
  var hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  var toHex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  function shadeHex(h, f2) {
    return toHex(hx(h).map((v) => f2 > 1 ? v * f2 + 10 : v * f2));
  }
  var TOPS = ["#e8707a", "#5aa0d8", "#f2c24a", "#7bc47f", "#b48ad8", "#f09a5a", "#4a8a9a", "#d94052", "#8aa0b8", "#c8a878"];
  var BOTTOMS = ["#44506a", "#3a3340", "#6a5a48", "#2f4a6a", "#5a4a6a", "#7a6a58"];
  var ACCS = ["#d94052", "#f2c24a", "#4a90d9", "#5aaa6a", "#e87aa8", "#9a6ad8"];
  var BAGC = ["#3a4a6a", "#6a3a3a", "#3a6a4a", "#5a4a8a", "#8a6a3a", "#d94052"];
  var UNI = { sailor: ["#2a3a6a", "#2a3a6a"], blazer: ["#2f3a58", "#4a4e5a"] };
  var ERA_TOPS = { 2: ["#b86a3a", "#d89a2a", "#8a6a3a", "#c8503a", "#6a8a4a", "#e8c878"], 3: ["#e8507a", "#3aa8e0", "#f2e03a", "#58d890", "#c06ae0", "#ff8a3a"], 4: ["#3a4a6a", "#5a6a5a", "#8a3a3a", "#4a4a52", "#7a6a4a", "#aab4c8"], 5: ["#f2b8c8", "#a8d8f0", "#f0f0f0", "#c8e8a8", "#d8c0f0", "#f8d890"], 6: ["#f4f4f4", "#2a3a5a", "#8a8f98", "#e8d8c0", "#3a6a5a", "#c8c8d0"], 7: ["#d8c8b0", "#98b0a0", "#c8a8a0", "#a8b8d0", "#e8e0d0", "#7a8a78"] };
  var ERA_BOTTOMS = { 2: ["#4a3a2a", "#6a5a3a", "#2a2a3a"], 3: ["#2a4a8a", "#f4f4f4", "#4a2a6a"], 4: ["#3a4a6a", "#2a2a2a", "#5a5a62"], 5: ["#c8d8f0", "#f0e8d8", "#4a5a7a"], 6: ["#2a2a32", "#4a5260", "#8a8f98"], 7: ["#3a4258", "#6a6a60", "#a09888"] };
  function colorsFor(I2, A2, wardrobe = 0) {
    const dec = wardrobe >> 14;
    wardrobe &= 16383;
    const w = mix32(I2.h, 900 + wardrobe), r = (s) => (mix32(w, s) >>> 8) / 16777216, pk = (s, a) => a[Math.floor(r(s) * a.length)];
    const sk2 = SKIN_TONES[I2.skin & 3];
    const hair0 = hx(HAIR_COLORS[I2.hairColor & 7]);
    const g = A2.gray || 0;
    const hair = toHex(g > 0 ? lerp3(hair0, GRAY, g) : hair0);
    const kid = A2.stage <= 3;
    let top = pk(1, ERA_TOPS[dec] || TOPS), bottom = pk(2, ERA_BOTTOMS[dec] || BOTTOMS), acc = pk(3, ACCS);
    const o = A2.outfit;
    if (UNI[o]) {
      top = UNI[o][0];
      bottom = UNI[o][1];
      acc = ["#d94052", "#f2c24a", "#4a90d9"][Math.floor(r(4) * 3)];
    }
    if (o === "coat") {
      top = "#f4f6fa";
      bottom = "#3a4258";
    }
    if (o === "suit") {
      top = pk(5, ["#2f3a58", "#3a3a44", "#4a4e5a", "#5a3a3a"]);
      bottom = top;
      acc = pk(6, ["#d94052", "#2a5a9a", "#5a8a5a"]);
    }
    if (o === "apron") {
      top = pk(7, ["#f4f0e6", "#e8f0f4", "#f4e8e8"]);
    }
    if (o === "kimono") {
      top = pk(8, ["#8a5a9a", "#4a7a6a", "#9a5a5a", "#5a6a9a"]);
      bottom = shadeHex(top, 0.8);
    }
    if (A2.stage >= 8 && !UNI[o] && o !== "coat" && o !== "apron") {
      top = pk(9, ["#8aa0b8", "#c8a878", "#9aa88a", "#b88a8a", "#7a8aa0", "#a89a78"]);
    }
    return { skin: sk2[0], skinS: sk2[1], hair, hairS: shadeHex(hair, 0.72), hairH: shadeHex(hair, 1.35), top, topS: shadeHex(top, 0.8), bottom, bottomS: shadeHex(bottom, 0.8), acc, accS: shadeHex(acc, 0.8), bag: pk(10, BAGC), bagS: shadeHex(pk(10, BAGC), 0.8), shoe: kid ? pk(11, ["#f4f4fa", "#d94052", "#4a90d9"]) : pk(11, ["#3a3340", "#5a4a3a", "#f4f4fa"]), iris: ["#2a2230", "#3a6ab8", "#3a8a5a"][A2.iris | 0] };
  }

