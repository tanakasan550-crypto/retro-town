  // src/scale.js
  var eraOfYear = (y) => y < 2e3 ? 0 : y < 2015 ? 1 : y < 2035 ? 2 : 3;
  var MIX = [["kei", 14], ["compact", 18], ["sedan", 15], ["minivan", 11], ["suv", 8], ["sports", 2], ["keitruck", 8], ["delivery", 8], ["bigtruck", 3], ["taxi", 8], ["bus", 3], ["police", 1], ["wagon", 6], ["luxury", 2], ["microbus", 2], ["garbage", 2], ["tow", 1], ["vacuum", 1], ["sweeper", 1], ["hearse", 0.4], ["tourbus", 1]];
  function pickVehType(h, year) {
    const w = MIX.map(([k, n2]) => [k, k === "suv" && year < 1995 ? n2 * 0.3 : k === "minivan" && year < 1992 ? n2 * 0.4 : n2]);
    let t = 0;
    for (const [, n2] of w) t += n2;
    let r = h % Math.round(t * 10) / 10;
    for (const [k, n2] of w) {
      if (r < n2) return k;
      r -= n2;
    }
    return "compact";
  }
  var CAR_COLORS = [[205, 45, 50], [45, 100, 205], [235, 200, 60], [238, 238, 238], [60, 64, 76], [70, 150, 90], [160, 160, 170], [120, 60, 40], [230, 120, 40], [40, 40, 44], [180, 190, 205], [130, 60, 140]];

