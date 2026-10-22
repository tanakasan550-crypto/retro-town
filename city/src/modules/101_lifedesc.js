  // src/lifedesc.js
  var ERA_HAIR = [[1945, 1964, ["side", "swept", "short"], ["bob", "bun", "ponytail"]], [1965, 1979, ["bowl", "curly", "swept"], ["long", "bob", "ponytail"]], [1980, 1991, ["curly", "fringe", "swept"], ["curly", "fringe", "long"]], [1992, 2004, ["spiky", "swept", "short"], ["long", "pixie", "bob"]], [2005, 2016, ["swept", "spiky", "bowl"], ["bun", "bob", "long"]], [2017, 9999, ["bowl", "swept", "short"], ["bob", "pixie", "bun", "ponytail"]]];
  var eraHairKey = (year, fem, id, A2) => {
    const e = ERA_HAIR.find((q) => year >= q[0] && year <= q[1]);
    if (!e) return null;
    const list = fem ? e[3] : e[2];
    if ((id * 2654435761 >>> 0) % 100 >= 38) return null;
    const k = list[(id * 40503 + year >>> 0) % list.length];
    return k === "bun" && A2.cls < 6 ? "long" : k;
  };
  function lifeDescribe({ id, look, age, role, wheel, cane, preset: PS, outfit, bag, wardrobe, inh, cache: cache14, fashion, hd }) {
    let I2 = identityOf(id, look, inh, cache14);
    if (PS) {
      I2 = Object.assign({}, I2, PS.I);
      if (PS.I.hairTex && PS.I.hairTex !== "curly") I2.hairTex = "straight";
      if (PS.I.fem !== void 0) I2.fem = !!PS.I.fem;
    }
    if (fashion && !outfit && !PS) {
      const st3 = stageOf(age);
      const base = outfitFor(I2, age, st3, role, !!wheel);
      const hh = (id * 2654435761 >>> 0) % 7;
      if (fashion.season === 3) outfit = base === "tee" ? hh & 1 ? "hoodie" : "cardigan" : base === "kidtee" ? "hoodie" : base;
      else if (fashion.season === 1) outfit = base === "hoodie" || base === "cardigan" ? "tee" : base;
      else outfit = base;
      if (wardrobe !== void 0) wardrobe += Math.max(0, Math.floor((fashion.year - 1950) / 10)) * 16384 + fashion.season * 4096;
    }
    const ref = PS && stageOf(age) === stageOf(PS.age);
    const A2 = appearanceOf(I2, age, { role, wheel: !!wheel || ref && !!PS.A.wheel, cane: !!cane || ref && !!PS.A.cane, outfit: ref ? PS.A.outfit : outfit, bag: ref ? PS.A.bag : bag });
    if (ref) {
      const q = PS.A;
      if (q.hair) A2.hair = q.hair;
      if (q.hat !== void 0) A2.hat = q.hat;
      A2.glass = q.glass || A2.glass;
      if (q.gray) A2.gray = Math.max(A2.gray || 0, q.gray);
      if (q.stoop !== void 0) A2.stoop = q.stoop;
      if (q.wrinkle !== void 0) A2.wrinkle = q.wrinkle;
      if (q.stick) A2.stick = true;
      if (q.feat) A2.featX = q.feat;
    }
    if (!hd && fashion && !PS && age >= 14 && age < 62 && A2.hair !== "bald" && A2.hair !== "thin" && A2.hair !== "baby") {
      const ek = eraHairKey(fashion.year, !!I2.fem, id, A2);
      if (ek) A2.hair = ek;
    }
    if (hd && age >= 3) {
      if (hd.key) A2.hair = hd.key === "bun" && A2.cls < 6 ? "long" : hd.key;
      if (hd.facial !== void 0 && age >= 18) A2.facial = hd.facial;
    }
    const col = colorsFor(I2, A2, wardrobe ?? 0);
    if (hd && hd.col && age >= 3) {
      const nat = [1, 3, 5].map((k) => parseInt(col.hair.slice(k, k + 2), 16)), d = [1, 3, 5].map((k) => parseInt(hd.col.slice(k, k + 2), 16)), r = hd.roots || 0;
      col.hair = "#" + [0, 1, 2].map((k) => Math.round(d[k] + (nat[k] - d[k]) * r).toString(16).padStart(2, "0")).join("");
      col.hairS = shadeHex(col.hair, 0.72);
      col.hairH = shadeHex(col.hair, 1.35);
    }
    if (PS) {
      const c = PS.col;
      col.skin = c.skin;
      col.skinS = skinS(c.skin);
      const h = [1, 3, 5].map((k) => parseInt((c.hairBase || c.hair).slice(k, k + 2), 16));
      const g = A2.gray || 0;
      col.hair = "#" + [0, 1, 2].map((k) => Math.round(h[k] + ([214, 214, 224][k] - h[k]) * g).toString(16).padStart(2, "0")).join("");
      col.hairS = shadeHex(col.hair, 0.72);
      col.hairH = shadeHex(col.hair, 1.35);
      if (ref) {
        for (const k of ["top", "bottom", "acc", "bag", "shoe"]) if (c[k]) col[k] = c[k];
        col.topS = shadeHex(col.top, 0.8);
        col.bottomS = shadeHex(col.bottom, 0.8);
        col.accS = shadeHex(col.acc, 0.8);
        col.bagS = shadeHex(col.bag, 0.8);
      }
    }
    return { I: I2, A: A2, col };
  }

