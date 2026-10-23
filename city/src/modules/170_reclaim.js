  // src/reclaim.js — 埋立地「青海新都心」: 海を埋め立てて大きな施設の土地をつくる(地図の外枠・配列の大きさは変えない)。
  // 海岸から運河(14マス)をはさんだ島。西の港(漁港・桟橋)と東の砂浜・マリーナ・空港の前の海は残す。
  // 島の道路(大通り・南の通り・南北の通り)と、本土の南北の道から渡る橋(3本)。道の作りは生成と同じ規則(rmeta の ax/th/ln)。
  // 生成のあと・地下鉄とバスの追加や敷地の整備の前に、決まった手順で行う(セーブには座標がないので、旧セーブも同じ島になる)。
  // 建物ID・人物IDは変えない(島には建物を新しく作らない。施設は sites.js の敷地の整備で移る)。
  // 第2期(v2): 地図を南へ広げ(海の行を足す)、島を南へのばして2列の街区にする。
  //   北の列(第1期と同じ): 動物園・大学・水族館 / 南の列: ドリームパーク・総合スタジアム・臨海工場
  //   行を下に足すだけなので、マスの番号(x + y*W)は今までと同じ(旧セーブの位置・道路・建物はそのまま)
  var RECLAIM_V = 2, RECLAIM_EXT = 220;
  function extendSouth(map2, ext) {
    const W2 = map2.W, N0 = W2 * map2.H, N = W2 * (map2.H + ext);
    const grow = (a, fill) => {
      const b = new a.constructor(N);
      if (fill) b.fill(fill);
      b.set(a);
      return b;
    };
    map2.ground = grow(map2.ground, 0);
    map2.ground.fill(T.WATER, N0);
    map2.deco = grow(map2.deco, 0);
    map2.solid = grow(map2.solid, 0);
    map2.solid.fill(1, N0);
    map2.bid = grow(map2.bid, -1);
    map2.net = grow(map2.net, 0);
    for (const k of ["ax", "th", "ln", "ow"]) if (map2.rmeta[k]) map2.rmeta[k] = grow(map2.rmeta[k], 0);
    map2.H0 = map2.H;
    map2.H += ext;
  }
  function reclaimLand(map2) {
    if (!map2 || (map2.ver || 1) < 4 || map2.reclaimV === RECLAIM_V || !map2.rmeta) return;
    map2.reclaimV = RECLAIM_V;
    if (!map2.H0) extendSouth(map2, RECLAIM_EXT);
    const W2 = map2.W, H4 = map2.H, G4 = map2.ground, rm = map2.rmeta;
    const X0 = 290, X1 = 862, CANAL = 14;
    // 海岸線(下から続く海の上端)
    const shore = new Int32Array(W2);
    for (let x = 0; x < W2; x++) {
      let y = H4 - 1;
      while (y > 0 && G4[x + (y - 1) * W2] === T.WATER) y--;
      shore[x] = y;
    }
    let top = 0;
    for (let x = X0 - 6; x <= X1 + 6; x++) top = Math.max(top, shore[x]);
    const yT = top + CANAL, yB = H4 - 14;
    if (yB - yT < 70) return;
    const set = (x, y, g) => {
      const k = x + y * W2;
      G4[k] = g;
      map2.deco[k] = 0;
      map2.solid[k] = 0;
    };
    for (let y = yT; y <= yB; y++) for (let x = X0; x <= X1; x++) {
      if (G4[x + y * W2] !== T.WATER) continue;
      set(x, y, x === X0 || x === X1 || y === yT || y === yB ? T.QUAY : T.GRASS);
    }
    // 道路(生成の carveRoad と同じ規則)
    const carve = (x, y, bit, th, ln) => {
      const k = x + y * W2;
      const g = G4[k];
      if (g === T.WATER) G4[k] = T.BRIDGE;
      else if (g !== T.BRIDGE && g !== T.CROSSING && g !== T.PLAZA) G4[k] = T.ROAD;
      map2.deco[k] = 0;
      map2.solid[k] = 0;
      const had = rm.ax[k];
      if (!had || (had & bit) === 0 || th >= rm.th[k]) {
        if (had && (had & bit) === 0) rm.th[k] = 0;
        else {
          rm.th[k] = th;
          rm.ln[k] = ln;
        }
      }
      rm.ax[k] = had | bit;
    };
    const hLine = (x0, x1, y, w) => {
      for (let x = x0; x <= x1 + w - 1; x++) for (let k = 0; k < w; k++) carve(x, y + k, 1, w, k);
    };
    const vLine = (x, y0, y1, w) => {
      for (let y = y0; y <= y1 + w - 1; y++) for (let k = 0; k < w; k++) carve(x + k, y, 2, w, k);
    };
    // 北の列の南の通り(yM)は第1期の島の南の通りと同じ位置。南の列の南の通りが yS
    const yN = yT + 3, yM = map2.H0 - 14 - 5, yS = yB - 5;
    hLine(X0 + 3, X1 - 5, yN, 2);
    hLine(X0 + 3, X1 - 5, yM, 2);
    hLine(X0 + 3, X1 - 5, yS, 2);
    // 南北の通り(街区の区切り): 西端・東端と、大きな街区2つ+小さな街区1つ
    const xs = [X0 + 3, X0 + 262, X0 + 492, X1 - 5];
    for (const x of xs) vLine(x, yN, yS, 2);
    // 歩道: 島の道路の両側の芝を歩道(PLAZA)にする(歩く人は車道より歩道を通る)
    for (let y = yT + 1; y < yB; y++) for (let x = X0 + 1; x < X1; x++) {
      const k = x + y * W2;
      if (G4[k] !== T.GRASS) continue;
      if (G4[k - 1] === T.ROAD || G4[k + 1] === T.ROAD || G4[k - W2] === T.ROAD || G4[k + W2] === T.ROAD) G4[k] = T.PLAZA;
    }
    // 橋: 本土の南北の道(海岸の少し上で縦の道)から島の大通りへまっすぐ
    const bridges = [];
    for (const want of [306, 622, 722]) {
      let bx = -1;
      for (let d = 0; d < 30 && bx < 0; d++) for (const x of [want - d, want + d]) {
        const k = x + (shore[x] - 3) * W2;
        if (x > X0 + 4 && x < X1 - 6 && rm.ax[k] & 2 && !(rm.ax[k - 1] & 2)) {
          bx = x;
          break;
        }
      }
      if (bx < 0) continue;
      const th = Math.max(2, rm.th[bx + (shore[bx] - 3) * W2] || 2);
      // 本土側の道の終わりから下へ
      let y0 = shore[bx] - 3;
      while (y0 < yN && rm.ax[bx + (y0 + 1) * W2] & 2) y0++;
      vLine(bx, y0, yN, Math.min(th, 2));
      bridges.push(bx);
    }
    map2.island = { x: X0, y: yT, w: X1 - X0 + 1, h: yB - yT + 1, bridges, roads: { yN, yM, yS, xs } };
    // 地区の名前(areaName)
    // (REGIONS2 は生成側の共有の定数なので書き換えず、この地図の写しに足す)
    if (map2.regions) map2.regions = [...map2.regions, { id: "shintoshin", name: "青海新都心(埋立地)", x: (X0 + X1) / 2, y: (yT + yB) / 2, rx: (X1 - X0) / 2, ry: (yB - yT) / 2 }];
    if (typeof cache4 !== "undefined") cache4.delete(map2);
    if (typeof cache5 !== "undefined") cache5.delete(map2);
  }
  // ---- 島の施設(sites.js の planSites の最初に呼ぶ): 動物園と大学の本キャンパスを、島の街区に合わせた広い配置で移す
  // 形式は siteLayout と同じ(main/annex/ground/solid/props/gate)。門は南(南の通りに面する)。
  function islandLayout(type, W2, H4, hsh) {
    if (type === "zoo") {
      const mid = H4 >> 1, L3 = { W: W2, H: H4, main: [(W2 >> 1) - 9, H4 - 9, 18, 5, 1], annex: [], ground: [], solid: [], props: [], gate: [W2 >> 1, H4 - 11], open: true };
      L3.ground.push(["paved", 3, 3, W2 - 6, 3], ["paved", 3, mid - 2, W2 - 6, 5], ["paved", 3, H4 - 12, W2 - 6, 3], ["paved", 3, 3, 3, H4 - 12], ["paved", W2 - 6, 3, 3, H4 - 12], ["paved", (W2 >> 1) - 3, mid, 6, H4 - mid - 6]);
      // 獣舎: 北の列と南の列(種類ごとに必要な広さの比で幅を分ける)
      const rowN = [["elephant", 6], ["giraffe", 5], ["lion", 4], ["monkey", 4]], rowS = [["flamingo", 3], ["kangaroo", 4], ["redpanda", 2.4], ["birds", 3]];
      const band = (row, y0, y1, gapAt) => {
        const tot = row.reduce((a, r) => a + r[1], 0), avail = W2 - 16 - (gapAt ? 34 : 0) - (row.length - 1) * 4;
        let x = 8;
        row.forEach(([sp, wgt], i) => {
          if (gapAt && i === 2) x += 34;
          const w = Math.floor(avail * wgt / tot);
          L3.solid.push(["ex", x, y0, w, y1 - y0, { sp }]);
          x += w + 4;
        });
      };
      band(rowN, 7, mid - 4, false);
      band(rowS, mid + 4, H4 - 14, true);
      // 南の列の真ん中にフードコート、門のそばに売店、北東に飼育員管理棟
      L3.annex.push(["food", (W2 >> 1) - 15, mid + 6, 12, 8, 1, "フードコート「サバンナ」", "s_low"], ["shop", (W2 >> 1) + 12, H4 - 8, 16, 5, 1, "おみやげショップ", "s_low"], ["keeper", W2 - 26, 2, 18, 4, 2, "飼育員管理棟", "s_wing"]);
      for (let x = 12; x < W2 - 12; x += 22) L3.props.push(["tree", x, mid - 3], ["bench", x + 6, mid + 3]);
      return L3;
    }
    if (type === "univ") {
      const FAC = ["工学部", "文学部", "経済学部", "理学部", "法学部", "教育学部", "医学部", "農学部", "情報学部", "国際学部"];
      const f = [0, 1, 2, 3].map((k) => FAC[(hsh + k * 3) % FAC.length]);
      const cx = W2 >> 1, E = W2 - 4;
      const L3 = { W: W2, H: H4, main: [cx - 22, 4, 44, 10, 6], annex: [
        ["lib", cx - 40, 20, 22, 14, 4, "附属図書館", "s_brick"],
        ["hall", cx + 18, 20, 22, 14, 2, "記念講堂", "s_hall"],
        ["cafe", cx - 40, 50, 22, 10, 2, "学生食堂・売店", "s_low"],
        ["fac", E - 60, 4, 28, 12, 6, f[0] + "棟", hsh & 1 ? "s_glass" : "s_brick"],
        ["fac", E - 28, 4, 28, 12, 5, f[1] + "棟", hsh & 2 ? "s_brick" : "s_glass"],
        ["fac", E - 60, 24, 28, 12, 5, f[2] + "・研究棟", "s_glass"],
        ["fac", E - 28, 24, 28, 12, 4, f[3] + "棟", "s_brick"],
        ["fac", E - 60, 46, 28, 12, 4, "共同研究センター", "s_glass"],
        ["gym", 8, 6, 24, 16, 1, "体育館", "s_gym"],
        ["club", 36, 6, 24, 8, 2, "サークル会館", "s_low"]
      ], ground: [["paved", cx - 3, 14, 6, H4 - 14], ["paved", cx - 30, 38, 60, 5], ["paved", cx - 30, 15, 60, 2], ["paved", cx - 30, 64, 60, 2], ["paved", 4, 26, W2 - 8, 3], ["field", 6, 32, 60, H4 - 40], ["court", 36, 16, 26, 9], ["paved", E - 60, 64, 30, 16]], solid: [],
        props: [["track", 6, 32, 60, H4 - 40], ["goal", 62, 32 + (H4 - 40 >> 1)], ["goalL", 8, 32 + (H4 - 40 >> 1)], ["tennis", 36, 16, 26, 9], ["bike", cx + 8, 62], ["bike", cx + 14, 62], ["bike", cx - 14, 64]], gate: [cx, H4 - 10] };
      // 中庭: 芝生と十字の小道・噴水・並木・ベンチ・街灯
      L3.props.push(["fountain", cx, 40]);
      for (let y = 18; y < 64; y += 6) L3.props.push(["tree", cx - 9, y], ["tree", cx + 8, y]);
      for (const dx of [-24, -16, 14, 22]) for (const y of [24, 32, 50, 58]) L3.props.push(["tree", cx + dx, y]);
      for (let x = cx - 26; x <= cx + 24; x += 10) L3.props.push(["bench", x, 44], ["lamp", x + 4, 37]);
      for (let y = 70; y < H4 - 4; y += 6) L3.props.push(["lamp", cx - 4, y], ["lamp", cx + 3, y]);
      return L3;
    }
    if (type === "aquarium") {
      // 水族館: 館内(44×26)に見合う本館・海に面した広場・屋外のプール(アシカ・イルカ)・遊歩道
      const bw = Math.min(40, W2 - 8), x0 = W2 - bw >> 1;
      const L3 = { W: W2, H: H4, main: [x0, 6, bw, 26, 3], annex: [], ground: [["paved", 3, 34, W2 - 6, 10], ["paved", 2, 2, W2 - 4, 3], ["paved", (W2 >> 1) - 3, 44, 6, H4 - 44]], solid: [["pool", 6, 48, W2 - 12, 16]], props: [["fountain", W2 >> 1, 38]], gate: [W2 >> 1, H4 - 8] };
      for (let x = 6; x < W2 - 4; x += 8) L3.props.push(["tree", x, 46], ["bench", x + 3, 42], ["lamp", x + 1, 35]);
      for (let y = 66; y < H4 - 6; y += 6) L3.props.push(["tree", 6, y], ["tree", W2 - 7, y]);
      return L3;
    }
    return null;
  }
  // 島に移す施設と街区: 西の大きな街区=動物園、真ん中=大学(本キャンパス)
  function islandPlan(map2, todo, placed, report, displaced) {
    const I3 = map2.island;
    if (!I3) return;
    // 敷地は道路と歩道の内側(北は大通り+歩道、南は歩道+南の通り、東西は歩道)
    const { yN, yM, yS, xs } = I3.roads, y = yN + 3, H4 = (yM || yS) - y - 1;
    const blocks = [[xs[0] + 3, xs[1] - 2], [xs[1] + 3, xs[2] - 2], [xs[2] + 3, xs[3] - 2]];
    const zoo = todo.find((b) => b.type === "zoo"), univ = todo.filter((b) => b.type === "univ").sort((a, c) => a.idx - c.idx)[0];
    // 東の街区: いちばん大きい水族館(館内の広さに見合う本館をつくる)
    const aq = map2.buildings.filter((b) => b.type === "aquarium" && b.siteI == null).sort((a, c) => a.idx - c.idx)[0];
    [[zoo, blocks[0]], [univ, blocks[1]], [aq, blocks[2]]].forEach(([b, [x0, x1]]) => {
      if (!b || b.siteI != null) return;
      const L3 = islandLayout(b.type, x1 - x0, H4, uh(b.idx, 17));
      if (!L3) return;
      const std = siteLayout(b) || { W: b.w, H: b.h };
      applySite(map2, b, L3, { x: x0, y, gx: L3.gate[0] }, displaced);
      placed.push({ x: x0, y, w: L3.W, h: L3.H });
      report.push({ id: b.id, name: b.name, type: b.type, moved: true, island: true, from: [b.x0, b.y0], to: [x0, y], dist: Math.round(Math.hypot(x0 - (b.x0 ?? x0), y - (b.y0 ?? y))), site: [L3.W, L3.H], scale: +(L3.W * L3.H / (std.W * std.H)).toFixed(2), displaced: 0 });
    });
    // 南の列(第2期): 西=ドリームパーク、真ん中=総合スタジアム、東=臨海工場(bigsites.js の配置)
    if (!yM || typeof bigLayout !== "function") return;
    const y2 = yM + 3, H5 = yS - y2 - 1, B2 = map2.buildings;
    const pick = (t) => B2.filter((b) => b.type === t && b.siteI == null && !b.tenant).sort((a, c) => a.idx - c.idx)[0];
    [[pick("themepark"), blocks[0]], [pick("stadium"), blocks[1]], [pick("factory"), blocks[2]]].forEach(([b, [x0, x1]]) => {
      if (!b) return;
      const L3 = bigLayout(b.type, x1 - x0, H5, uh(b.idx, 19));
      if (!L3) return;
      const std = { W: b.w, H: b.h }, os = oldSiteOf(map2, b);
      const from = os ? os.w * os.h : b.w * b.h;
      applySite(map2, b, L3, { x: x0, y: y2, gx: L3.gate[0] }, displaced);
      if (L3.kit) b.kit = L3.kit;
      // 島へ移った工場は埋立地の名前に(建物IDはそのまま)
      if (b.type === "factory") b.name = "青海ベイサイド工場";
      placed.push({ x: x0, y: y2, w: L3.W, h: L3.H });
      report.push({ id: b.id, name: b.name, type: b.type, moved: true, island: true, from: [b.x0, b.y0], to: [x0, y2], dist: Math.round(Math.hypot(x0 - (b.x0 ?? x0), y2 - (b.y0 ?? y2))), site: [L3.W, L3.H], scale: +(L3.W * L3.H / from).toFixed(2), fromM2: from * 4, displaced: 0 });
      void std;
    });
  }
