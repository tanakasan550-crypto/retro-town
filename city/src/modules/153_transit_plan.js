  // src/transit_plan.js — 都市の鉄道網(地図v4のみ・決定的・既存の建物番号を変えない)
  // 青海環状線(都心を一周・内回り/外回り)・メトロ東西線・メトロ南北線を地下に追加。
  // 既存駅の近くは同じ駅(乗換駅)にし、それ以外は地下鉄の出入口(小さな建物)を末尾に追加する。
  BTYPES.metro = { label: "地下鉄駅", w: 2, h: 1, cat: "transit", enter: true, interior: "station", slots: { railstaff: 2 } };
  var TPLAN_VER = 1;
  // 路線は「経由点」で設計する(既存駅を経由点にして乗換駅にする)。間は step タイルごとに駅を置く
  var TPLAN_LINES = [
    { id: "RING", name: "青海環状線", color: "#43a047", speed: 13, headway: 4, dwell: 1, ring: true, step: 105, via: [[640, 380], [800, 330], [930, 410], [990, 530], [800, 590], [650, 650], [485, 642], [400, 496], [430, 380], [560, 320]] },
    { id: "M_EW", name: "メトロ東西線", color: "#f57c00", speed: 11, headway: 5, dwell: 1, step: 105, via: [[130, 470], [400, 496], [640, 480], [800, 520], [990, 530], [1110, 500]] },
    { id: "M_NS", name: "メトロ南北線", color: "#1e63c8", speed: 11, headway: 5, dwell: 1, step: 100, via: [[655, 110], [560, 320], [640, 380], [640, 480], [655, 600], [655, 720], [655, 840]] }
  ];
  var TP_NAMES = ["本町", "錦町", "若葉町", "青葉台", "港町", "宮前", "緑ヶ丘", "旭町", "日の出町", "栄町", "清水町", "高砂", "松原", "柳町", "朝日橋", "白鷺", "梅田台", "藤見", "千鳥", "寿町", "八幡前", "桜橋", "新町", "大手町通"];
  function augmentTransit(map2) {
    if (!map2 || (map2.ver || 1) < 4 || map2.tplan === TPLAN_VER) return;
    map2.tplan = TPLAN_VER;
    const W2 = map2.W, Hh = map2.H;
    const nameUsed = new Set(map2.stations.map((s) => s.name));
    const near = (x, y, r) => {
      let best = null, bd = r;
      for (const s of map2.stations) {
        const d = Math.hypot(s.x - x, s.y - y);
        if (d < bd) {
          bd = d;
          best = s;
        }
      }
      return best;
    };
    const free = (x, y) => x > 1 && y > 1 && x < W2 - 2 && y < Hh - 2 && map2.bid[x + y * W2] < 0 && !map2.solid[x + y * W2] && [T.PLAZA, T.PATH, T.GRASS].includes(map2.ground[x + y * W2]) && !map2.deco[x + y * W2];
    const walkable = (x, y) => x > 0 && y > 0 && x < W2 && y < Hh && !map2.solid[x + y * W2] && map2.ground[x + y * W2] !== T.WATER && map2.ground[x + y * W2] !== T.RAIL;
    const landmarkName = (x, y) => {
      const pri = [["cityhall", "市役所前"], ["univ", null], ["hospital", null], ["stadium", "スタジアム前"], ["dept", null], ["mall", null], ["aquarium", null], ["museum", null], ["library", null], ["court", "裁判所前"], ["police", null], ["park", null]];
      for (const [t, fixed] of pri) {
        let bb = null, bd = t === "park" ? 22 : 45;
        for (const b of map2.buildings) {
          if (b.type !== t) continue;
          const d = Math.hypot(b.doorX - x, b.doorY - y);
          if (d < bd) {
            bd = d;
            bb = b;
          }
        }
        if (bb) {
          const nm = fixed || (bb.name || BTYPES[t].label).replace(/第\d+$/, "").replace(/(駅)$/, "") + "前";
          if (!nameUsed.has(nm) && nm.length <= 12) return nm;
        }
      }
      for (const nm of TP_NAMES) if (!nameUsed.has(nm)) return nm;
      return "新駅" + map2.stations.length;
    };
    // 出入口(2×1)を目標点の近くの歩けるタイルに置く。入口は南側の歩けるタイル
    const placeEntrance = (x, y) => {
      for (let r = 0; r < 26; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const bx = Math.round(x) + dx, by = Math.round(y) + dy;
        if (!free(bx, by) || !free(bx + 1, by) || !walkable(bx, by + 1) || !walkable(bx + 1, by + 1) || !walkable(bx, by - 1)) continue;
        return [bx, by];
      }
      return null;
    };
    const addStation = (x, y) => {
      const s0 = near(x, y, 46);
      if (s0) return s0.id;
      const pos = placeEntrance(x, y);
      if (!pos) return null;
      const [bx, by] = pos;
      const nm = landmarkName(bx, by);
      nameUsed.add(nm);
      const idx = map2.buildings.length;
      const id = "m" + idx;
      const zone = typeof zoneAt === "function" ? (zoneAt(bx, by) || {}).id || "downtown" : "downtown";
      const b = { idx, id: "B" + String(idx).padStart(4, "0"), type: "metro", x: bx, y: by, w: 2, h: 1, doorX: bx, doorY: by + 1, zone, floors: 1, stationId: id, name: nm + "駅", metro: true };
      map2.buildings.push(b);
      for (const xx of [bx, bx + 1]) {
        const k = xx + by * W2;
        map2.bid[k] = idx;
        map2.solid[k] = 1;
      }
      map2.stations.push({ id, name: nm, kana: "", x: bx, y: by, zone, door: { x: b.doorX, y: b.doorY }, building: idx, platformY: by, metro: true });
      return id;
    };
    map2.lines = map2.lines ? map2.lines.slice() : LINES.slice();
    for (const L3 of TPLAN_LINES) {
      const ids = [];
      const pts = L3.ring ? [...L3.via, L3.via[0]] : L3.via;
      const push = (id) => {
        if (id && ids[ids.length - 1] !== id && !ids.includes(id)) ids.push(id);
      };
      for (let k = 0; k < pts.length - 1; k++) {
        const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
        const n2 = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / L3.step));
        for (let j = 0; j < n2; j++) push(addStation(x0 + (x1 - x0) * j / n2, y0 + (y1 - y0) * j / n2));
      }
      if (!L3.ring) push(addStation(...pts[pts.length - 1]));
      else if (ids.length > 2) ids.push(ids[0]);
      if (ids.length < 2) continue;
      const line2 = { id: L3.id, name: L3.name, color: L3.color, stations: ids, speed: L3.speed, headway: L3.headway, dwell: L3.dwell, underground: true, ring: !!L3.ring };
      map2.lines.push(line2);
      map2.railPaths[line2.id] = buildRailPath(line2, (sid) => map2.stations.find((q) => q.id === sid));
    }
  }
  // 地下鉄の出入口の外観(階段の上屋+駅名標)
  KIT.metro = { k: "metro", f: [1, 1], roof: "flat", wall: "glass" };
  SPECIAL.add("metro");
  function paintMetro(ctx4, e, P2, poly7) {
    const { b, w, h } = e;
    const L3 = G3 && G3.tr ? G3.tr.lines.find((q) => q.underground && q.stops.some((s) => s.id === b.stationId)) : null;
    const col = L3 ? L3.color : "#1e63c8";
    poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#cfd3d8");
    // 下り階段の開口
    poly7([P2(0.2, 0.15, 0.01), P2(w - 0.2, 0.15, 0.01), P2(w - 0.2, h - 0.1, 0.01), P2(0.2, h - 0.1, 0.01)], "#4a4f57");
    for (let k = 1; k < 5; k++) poly7([P2(0.2, 0.15 + k * 0.15, 0.02), P2(w - 0.2, 0.15 + k * 0.15, 0.02), P2(w - 0.2, 0.2 + k * 0.15, 0.02), P2(0.2, 0.2 + k * 0.15, 0.02)], "#6a707a");
    // ガラスの上屋
    poly7([P2(0, 0, 2.2), P2(w, 0, 2.2), P2(w, h, 2.2), P2(0, h, 2.2)], "rgba(170,210,235,0.55)");
    for (const [u, v] of [[0, 0], [w, 0], [0, h], [w, h]]) poly7([P2(u - 0.04, v, 0), P2(u + 0.04, v, 0), P2(u + 0.04, v, 2.2), P2(u - 0.04, v, 2.2)], "#7a828c");
    // 駅名の柱
    poly7([P2(w + 0.1, h - 0.1, 0), P2(w + 0.3, h - 0.1, 0), P2(w + 0.3, h - 0.1, 3), P2(w + 0.1, h - 0.1, 3)], "#e9ecef");
    poly7([P2(w + 0.05, h - 0.1, 2.4), P2(w + 0.35, h - 0.1, 2.4), P2(w + 0.35, h - 0.1, 3.1), P2(w + 0.05, h - 0.1, 3.1)], col);
  }
