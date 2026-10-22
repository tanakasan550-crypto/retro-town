  // src/wa.js
  var RATE = { oldtown: 0.55, farm: 0.6, port: 0.3, shotengai: 0.3, suburb_n: 0.14, suburb_e: 0.14, civic: 0.1, school: 0.1, downtown: 0.04, campus: 0.04 };
  function assignWa(map2) {
    for (const b of map2.buildings) {
      if (b.type !== "house" && b.type !== "farmhouse" || b.wa) continue;
      const r = RATE[b.zone] ?? 0.1;
      const h = hash2(b.idx, 5101);
      if (h % 1e3 / 1e3 >= r) continue;
      const g = hash2(b.idx, 5102) % 100;
      const z = b.zone;
      let k = "kawara";
      if (b.type === "farmhouse" || z === "farm") k = g < 38 ? "kaya" : g < 78 ? "kawara" : "showa";
      else if (z === "oldtown" || z === "shotengai") k = g < 40 ? "machiya" : g < 65 ? "kawara" : g < 85 ? "showa" : "garden";
      else if (z === "port") k = g < 60 ? "showa" : "kawara";
      else k = g < 35 ? "kawara" : g < 60 ? "showa" : g < 80 ? "garden" : "modern";
      b.wa = k;
    }
  }

