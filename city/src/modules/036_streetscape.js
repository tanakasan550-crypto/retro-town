  // src/streetscape.js
  var cache6 = /* @__PURE__ */ new WeakMap();
  var zoneAt2 = (zones, x, y) => {
    let best = null, bd = 1e9;
    for (const z of zones) {
      const d = ((x - z.x) / z.rx) ** 2 + ((y - z.y) / z.ry) ** 2;
      if (d < bd) {
        bd = d;
        best = z;
      }
    }
    return best ? best.id : "suburb_n";
  };
  var RES = /* @__PURE__ */ new Set(["suburb_n", "suburb_w", "school", "civic", "campus"]);
  var pickW = (h, list) => {
    let t = 0;
    for (const [, w] of list) t += w;
    let r = h % t;
    for (const [k, w] of list) {
      if (r < w) return k;
      r -= w;
    }
    return list[0][0];
  };
  function buildProps(map2) {
    const c = cache6.get(map2);
    if (c) return c;
    const { W: W2, H: H4, ground, deco, bid, buildings, zones } = map2;
    const out = /* @__PURE__ */ new Map();
    const near2 = new Uint8Array(W2 * H4);
    for (const b of buildings) for (let dy = -1; dy <= 3; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = b.doorX + dx, y = b.doorY + dy;
      if (x >= 0 && y >= 0 && x < W2 && y < H4) near2[x + y * W2] = 1;
    }
    const at = (x, y) => x < 0 || y < 0 || x >= W2 || y >= H4 ? -1 : ground[x + y * W2];
    const free = (x, y) => {
      const k = x + y * W2;
      return !deco[k] && bid[k] < 0 && !near2[k];
    };
    const nb4 = (x, y, t) => at(x + 1, y) === t || at(x - 1, y) === t || at(x, y + 1) === t || at(x, y - 1) === t;
    const nbBld = (x, y) => {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < W2 && yy < H4 && bid[xx + yy * W2] >= 0) return buildings[bid[xx + yy * W2]];
      }
      return null;
    };
    const put2 = (x, y, k) => {
      out.set(x + y * W2, { x, y, k });
    };
    const stationDoors = buildings.filter((b) => b.type === "station");
    const distStation = (x, y) => {
      let d = 99;
      for (const b of stationDoors) d = Math.min(d, Math.abs(b.doorX - x) + Math.abs(b.doorY - y));
      return d;
    };
    for (let y = 1; y < H4 - 1; y++) for (let x = 1; x < W2 - 1; x++) {
      const k = x + y * W2, g = ground[k];
      if (!free(x, y)) continue;
      const h = hash2(x * 73856093 ^ y * 19349663, map2.seed ^ 49719761) >>> 0;
      if (h % 41 > 7) continue;
      const z = zoneAt2(zones, x, y), r = (h >>> 8) % 1e3, ds = distStation(x, y), road = nb4(x, y, T.ROAD), bld = nbBld(x, y);
      if (ds <= 8 && (g === T.PLAZA || g === T.GRASS)) {
        const q = (h >>> 12) % 10;
        if (q === 0) put2(x, y, "busstop");
        else if (q === 1) put2(x, y, "taxisign");
        else if (q === 2) put2(x, y, "infoboard");
        else if (q <= 4) put2(x, y, "planter");
        else if (q === 5) put2(x, y, "bikerack");
        else if (q === 6) put2(x, y, "bollard");
        continue;
      }
      if (g === T.GRASS) {
        if (RES.has(z) || z === "oldtown") {
          if (road && r < 330) put2(x, y, "pole");
          else if (bld && r < 800) put2(x, y, pickW(h >>> 5, [["garbage", 3], ["mailbox", 3], ["bikes", 3], ["hedge", 4], ["planter", 1]]));
          else if (r < 120) put2(x, y, "hedge");
          continue;
        }
        if (z === "shotengai") {
          if (bld && bld.type !== "house" && bld.type !== "apt") put2(x, y, pickW(h >>> 5, [["nobori", 4], ["signboard", 3], ["crates", 3], ["bikes", 2], ["noren_lantern", bld.type === "izakaya" ? 5 : 0]]));
          else if (road && r < 200) put2(x, y, "pole");
          continue;
        }
        if (z === "downtown" || z === "tower") {
          if (bld && r < 600) put2(x, y, pickW(h >>> 5, [["planter", 3], ["signboard", 2], ["bikerack", 2], ["bollard", 2], ["flagpole", bld.type === "cityhall" || bld.type === "court" ? 4 : 0]]));
          else if (road && r < 120) put2(x, y, "lamp2");
          continue;
        }
        if (z === "suburb_e") {
          if (road && r < 260) put2(x, y, pickW(h >>> 5, [["guardrail", 5], ["pole", 3], ["billboard", 1]]));
          else if (bld && ["super", "homecenter", "konbini", "gasstation"].includes(bld.type)) put2(x, y, pickW(h >>> 5, [["cart", 4], ["bollard", 2]]));
          continue;
        }
        if (z === "farm") {
          if (bld && r < 700) put2(x, y, pickW(h >>> 5, [["crates", 2], ["haybale", 4]]));
          else if (r < 150) put2(x, y, pickW(h >>> 5, [["haybale", 3], ["scarecrow", 3], ["pole", 2]]));
          continue;
        }
        if (z === "port" || z === "industrial") {
          if (bld && ["warehouse", "logistics", "factory", "market", "construction", "harboroffice"].includes(bld.type)) put2(x, y, pickW(h >>> 5, [["container", 4], ["container2", 3], ["barrel", 3], ["pallet", 3], ["crates", 2]]));
          else if (r < 100) put2(x, y, pickW(h >>> 5, [["barrel", 2], ["pole", 2], ["fishnet", 3]]));
          continue;
        }
        if (z === "onsen" || z === "temple_town") {
          if (bld && ["temple", "shrine", "onsenbath", "sento", "ryokan"].includes(bld.type)) put2(x, y, pickW(h >>> 5, [["stonelantern", 5], ["onsensign", bld.type === "ryokan" || bld.type === "onsenbath" ? 4 : 0], ["bamboo", 3]]));
          else if (r < 120) put2(x, y, pickW(h >>> 5, [["bamboo", 4], ["stonelantern", 2]]));
          continue;
        }
        if (z === "resort" || z === "marina") {
          if (r < 110) put2(x, y, pickW(h >>> 5, [["palm", 5], ["planter", 2], ["lamp2", 2]]));
          continue;
        }
      } else if (g === T.SAND && (z === "resort" || z === "marina") && r < 160) put2(x, y, "deckchair");
      else if (g === T.QUAY && (z === "port" || z === "marina" || z === "industrial") && r < 230) put2(x, y, pickW(h >>> 5, [["bollard", 4], ["barrel", 2], ["fishnet", 3], ["container", 2]]));
      else if (g === T.PLAZA && r < 80 && (z === "campus" || z === "civic" || z === "downtown")) put2(x, y, pickW(h >>> 5, [["planter", 3], ["bikerack", 3], ["signboard", 2]]));
    }
    for (let y = 1; y < H4 - 2; y++) for (let x = 1; x < W2 - 3; x++) {
      if (ground[x + y * W2] !== T.WATER || ground[x + 1 + y * W2] !== T.WATER || ground[x + 2 + y * W2] !== T.WATER || ground[x + (y + 1) * W2] !== T.WATER) continue;
      if (!(at(x - 1, y) === T.QUAY || at(x - 1, y) === T.SAND || at(x, y - 1) === T.QUAY || at(x, y - 1) === T.SAND)) continue;
      const z = zoneAt2(zones, x, y);
      if (!["port", "marina", "resort"].includes(z)) continue;
      const h = hash2(x * 83492791 ^ y * 2654435761, map2.seed ^ 5369127) >>> 0;
      if (h % 11 !== 0 || near2[x + y * W2]) continue;
      put2(x, y, z === "port" ? "fishboat" : (h >>> 8) % 2 ? "sailboat" : "fishboat");
    }
    cache6.set(map2, out);
    return out;
  }

