  // src/fac_zoo.js — 動物園: 屋外の園内に種類ごとの獣舎(ゾウ・キリン・ライオン・サル山・フラミンゴ・カンガルー・レッサーパンダ・鳥の森)。
  // 動物は種類ごとの姿で動き、鳴く動物は近くで鳴き声が聞こえる(鳴かない動物の声は出さない。soundscape.js)。
  // 入園券・ガイド・もぐもぐタイム(給餌)・売店。飼育員は獣舎のそばで働く。
  FAC_RANGE.zoo = () => ({ lo: 0, hi: 0, nf: 1 });
  FAC_LABEL.zoo = () => "園内";
  var ZOO_SP = {
    elephant: { name: "アジアゾウ", n: 2, w: 12, h: 8, ground: "#c9b48a", pond: true, voice: "trumpet", feed: [11, 14], fact: "ゾウは1日に100kgほどの草や果物を食べ、長い鼻で器用に水を飲みます。" },
    giraffe: { name: "アミメキリン", n: 3, w: 10, h: 8, ground: "#cdbb8c", voice: null, feed: [10, 15], fact: "キリンはほとんど鳴きません。高い所の葉を長い舌(約45cm)で巻き取って食べます。" },
    lion: { name: "ライオン", n: 3, w: 10, h: 7, ground: "#c2a46c", voice: "roar", feed: [15], fact: "ライオンは1日の大半を寝て過ごします。夕方になると声を出して群れの縄張りを知らせます。" },
    monkey: { name: "ニホンザル(サル山)", n: 9, w: 10, h: 8, ground: "#9aa08a", rock: true, voice: "monkey", feed: [10, 13, 16], fact: "サル山では群れの順位があり、エサの時間には順番が見られます。毛づくろいは仲直りのしるしでもあります。" },
    flamingo: { name: "チリーフラミンゴ", n: 10, w: 9, h: 6, ground: "#8fb3a0", pond: true, voice: "honk", feed: [10], fact: "フラミンゴのピンク色はエサに含まれる色素によるもの。片足で立つのは体温を逃がさないためと考えられています。" },
    kangaroo: { name: "アカカンガルー", n: 4, w: 9, h: 6, ground: "#c7b07e", voice: null, feed: [11], fact: "カンガルーは太い尾で体を支えて跳ねます。声はほとんど出しません。" },
    redpanda: { name: "レッサーパンダ", n: 2, w: 7, h: 6, ground: "#7fa36a", tree: true, voice: null, feed: [12], fact: "レッサーパンダは木の上が好きで、竹の葉やリンゴを食べます。驚くと立ち上がって威嚇します。" },
    birds: { name: "鳥の森(フライングケージ)", n: 14, w: 10, h: 8, ground: "#6f9a5c", net: true, voice: "birds", feed: [9], fact: "フライングケージの中では、色とりどりの小鳥が放し飼いで飛び交っています。" }
  };
  var ZOO_LAYOUT = [["elephant", 3, 3], ["giraffe", 17, 3], ["lion", 30, 3], ["monkey", 43, 3], ["flamingo", 3, 22], ["kangaroo", 15, 23], ["redpanda", 37, 23], ["birds", 46, 22]];
  FAC_BUILD.zoo = (b, floor, g) => {
    if (b.siteI != null) return zooGateHall(b);
    const W2 = 58, H4 = 38;
    const P = plan(W2, H4, "floor_grass", "leisure");
    P.lv = 0;
    const dx = 29;
    P.door(dx);
    // 園路(入口から中央広場・東西の周回路)
    P.fill(dx - 2, 13, dx + 2, H4 - 2, "floor_paving");
    P.fill(2, 13, W2 - 3, 20, "floor_paving");
    P.fill(dx - 7, H4 - 7, dx + 7, H4 - 2, "floor_paving");
    P.wide("ticketbooth", dx - 7, H4 - 6, 3, 1, "fx_zooticket", "入園券売り場");
    P.add("gate", dx - 1, H4 - 7, null, "入園ゲート", false);
    P.add("gate", dx + 1, H4 - 7, null, "入園ゲート", false);
    P.sign(dx, H4 - 8, "ZOO どうぶつ園");
    P.add("board", dx + 4, H4 - 6, "fx_zooinfo", "園内マップ・もぐもぐタイムの時間", true);
    P.staffSpots.push({ x: dx - 6, y: H4 - 7, role: "ticket" });
    for (const [sp, x, y] of ZOO_LAYOUT) {
      const S2 = ZOO_SP[sp];
      P.wide("fx_zooex", x, y, S2.w, S2.h, "fx_zoowatch", `${S2.name}の展示`, { sp });
      P.sign(x + (S2.w >> 1), y + S2.h, S2.name);
      // 飼育員はそれぞれの獣舎の横で働く
      P.staffSpots.push({ x: x + S2.w - 1, y: y + S2.h + 1, role: "zookeeper" });
      P.seatSpots.push({ x: x + 2, y: y + S2.h + 1 });
    }
    for (const x of [8, 20, 38, 50]) P.add("bench", x, 17, "rest", "ベンチ", false);
    P.wide("kiosk", 4, H4 - 6, 3, 1, "fx_zooshop", "売店(ぬいぐるみ・アイス)");
    P.add("vending", 9, H4 - 5, null, "自販機");
    P.add("toilet", W2 - 3, H4 - 5, "toilet", "トイレ");
    P.add("aed", W2 - 5, H4 - 5, null, "AED");
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 0.6, roof: false, label: "園内", openAir: true });
  };
  var zooToday = (g) => g.S.zooDay === g.S.M * 40 + g.date().d;
  FAC_ACTS.fx_zooticket = (g, o, b, push) => {
    if (zooToday(g)) return push("none", "本日の入園券をお持ちです", { disabled: true });
    const a = g.age(), pr = yenf(g, a < 6 ? 0 : a < 13 ? 200 : a < 16 ? 400 : BTYPES.zoo.price || 600);
    push("zoobuy:" + pr, `入園券を買う(¥${pr.toLocaleString()})`, { disabled: g.hero.money < pr });
  };
  FAC_RUN.zoobuy = (g, arg, tg, r) => {
    const pr = +arg || 0;
    if (pr) g.pay(pr, "動物園の入園料");
    g.S.zooDay = g.S.M * 40 + g.date().d;
    g.advance(2);
    r.msg = "入園券を買いました。ゲートを抜けると、ゾウの鳴き声が聞こえてきます。";
  };
  FAC_ACTS.fx_zooinfo = (g, o, b, push) => push("zooinfo", "もぐもぐタイム(給餌)の時間を見る");
  FAC_RUN.zooinfo = (g, arg, tg, r) => {
    r.msg = "もぐもぐタイム: " + Object.values(ZOO_SP).map((s) => `${s.name} ${s.feed.map((h) => h + ":00").join("・")}`).join(" / ");
  };
  FAC_ACTS.fx_zoowatch = (g, o, b, push) => {
    const S2 = ZOO_SP[o.sp];
    if (!zooToday(g)) return push("none", "入園券が必要です(入口の売り場)", { disabled: true });
    push("zoolook:" + o.sp, `${S2.name}を観察する(15分)`);
    const h = g.S.min / 60, fd = S2.feed.find((x) => h >= x - 0.25 && h < x + 0.5);
    push("zoofeed:" + o.sp, fd ? `もぐもぐタイムを見る(${fd}:00〜・飼育員の解説)` : `もぐもぐタイムは ${S2.feed.map((x) => x + ":00").join("・")}`, { disabled: !fd });
  };
  var ZOO_DO = {
    elephant: ["鼻で砂をすくって背中にかけています(砂浴び)", "2頭が鼻をからめてあいさつしています", "プールに入って水を浴びています"],
    giraffe: ["高い枝の葉を長い舌で器用に巻き取っています", "首を大きく振りながらゆっくり歩いています", "脚を大きく広げて水を飲んでいます"],
    lion: ["岩の上で大の字になって昼寝しています", "オスが立ち上がり、低い声でうなりました", "メスが2頭、寄り添って毛づくろいをしています"],
    monkey: ["子ザルが岩の間を追いかけっこしています", "2匹が並んで毛づくろいをしています", "ボスザルが高い岩から群れを見下ろしています"],
    flamingo: ["片足で立ったまま首を背中にのせて休んでいます", "群れがそろって首を振り、行進のように歩いています", "くちばしを逆さにして水中のエサをこしとっています"],
    kangaroo: ["太い尾で体を支えて立ち、こちらを見ています", "ピョンピョンと跳ねて柵の端まで行きました", "お腹の袋から子どもが顔を出しています"],
    redpanda: ["木の上で丸くなって眠っています", "前足でリンゴを持って食べています", "立ち上がって両手を広げました(威嚇のポーズ)"],
    birds: ["色とりどりの小鳥が頭の上を飛び交っています", "水場で小鳥が水浴びをしています", "枝の上で2羽が並んでさえずっています"]
  };
  FAC_RUN.zoolook = (g, arg, tg, r) => {
    const S2 = ZOO_SP[arg];
    g.advance(15);
    const L3 = ZOO_DO[arg] || ["動物を観察しました"];
    r.msg = `${S2.name}: ${L3[uh(g.absMin() | 0, 7) % L3.length]}。` + g.chg({ mood: 4 });
    g.S.zooSeen = { ...g.S.zooSeen || {}, [arg]: ((g.S.zooSeen || {})[arg] || 0) + 1 };
  };
  FAC_RUN.zoofeed = (g, arg, tg, r) => {
    const S2 = ZOO_SP[arg];
    g.advance(20);
    r.msg = `もぐもぐタイム(${S2.name}): 飼育員さんがエサを配りながら解説してくれました。${S2.fact}` + g.chg({ mood: 6 });
    g.hero.study = Math.min(100, (g.hero.study || 0) + 1);
  };
  FAC_ACTS.fx_zooshop = (g, o, b, push) => {
    push("zooshop:ice", `ソフトクリーム(¥${yenf(g, 350)})`, { disabled: g.hero.money < yenf(g, 350) });
    push("zooshop:toy", `ゾウのぬいぐるみ(¥${yenf(g, 1800)})`, { disabled: g.hero.money < yenf(g, 1800) });
  };
  FAC_RUN.zooshop = (g, arg, tg, r) => {
    const pr = yenf(g, arg === "ice" ? 350 : 1800);
    g.pay(pr, "動物園の売店");
    g.advance(5);
    r.msg = arg === "ice" ? "ソフトクリームを食べながら園内を歩きました。" + g.chg({ mood: 3, hunger: 5 }) : "ゾウのぬいぐるみを買いました。" + g.chg({ mood: 4 });
  };
  // ---- 描画: 獣舎(地面・水場・岩山・木・網)と動物
  FXH.fx_zooex = 0.05;
  FAC_DRAW.fx_zooex = (c, env, o, H5, d0) => {
    const { x, y, w, h, t, pt, poly } = d0, Z = d0.Z * 2.2;
    const S2 = ZOO_SP[o.sp];
    if (!S2) return;
    poly(c, [pt(x + 0.2, y + 0.2, 0.02), pt(x + w - 0.2, y + 0.2, 0.02), pt(x + w - 0.2, y + h - 0.2, 0.02), pt(x + 0.2, y + h - 0.2, 0.02)], S2.ground);
    if (S2.pond) poly(c, [pt(x + w * 0.55, y + h * 0.15, 0.03), pt(x + w - 0.6, y + h * 0.15, 0.03), pt(x + w - 0.6, y + h * 0.5, 0.03), pt(x + w * 0.55, y + h * 0.5, 0.03)], "#5f9fc6");
    if (S2.rock) {
      poly(c, [pt(x + 2, y + h - 1.2, 0), pt(x + w / 2, y + 1, 2.4), pt(x + w - 2, y + h - 1.2, 0)], "#8a8a80");
      poly(c, [pt(x + w / 2, y + 1, 2.4), pt(x + w - 2, y + h - 1.2, 0), pt(x + w - 1.2, y + 1.4, 0.6)], "#74746c");
    }
    if (S2.tree) for (const [u, v] of [[x + 2, y + 2], [x + w - 2, y + 3]]) {
      const a = pt(u, v, 0), b2 = pt(u, v, 2.6);
      c.fillStyle = "#6b4a2a";
      c.fillRect(a[0] - 0.4 * Z, b2[1], 0.8 * Z, a[1] - b2[1]);
      c.fillStyle = "#4f8a3e";
      c.beginPath();
      c.ellipse(b2[0], b2[1], 3 * Z, 2 * Z, 0, 0, 7);
      c.fill();
    }
    // 動物(種類ごとの姿・ゆっくり動く)
    for (let i = 0; i < S2.n; i++) {
      const ph = i * 1.7 + (o.x || 0);
      let u = x + 1.2 + ((i * 2.9 + Math.sin(t * 0.07 * (1 + i % 3) + ph) * 1.5 + 9) % Math.max(1, w - 2.4));
      let v = y + 1.2 + ((i * 1.9 + Math.cos(t * 0.05 * (1 + i % 2) + ph) * 1.2 + 6) % Math.max(1, h - 2.4));
      const p = pt(u, v, 0), face = Math.cos(t * 0.07 * (1 + i % 3) + ph) > 0 ? 1 : -1;
      // 実際の大きさの比(人の背丈を約1.6mとして): ゾウ・キリンは大きく、サル・鳥は小さく
      zooAnimal(c, o.sp, p[0], p[1], Z * ({ elephant: 1.9, giraffe: 1.45, lion: 1.15, kangaroo: 1.1, flamingo: 1.05 }[o.sp] || 1), t + ph, face, i);
    }
    if (S2.net) {
      c.strokeStyle = "rgba(220,225,230,0.35)";
      c.lineWidth = 1;
      for (let k = 0; k <= 6; k++) {
        const a = pt(x + w * k / 6, y + 0.2, 0), b2 = pt(x + w * k / 6, y + 0.2, 3.2);
        c.beginPath();
        c.moveTo(...a);
        c.lineTo(...b2);
        c.stroke();
      }
      poly(c, [pt(x + 0.2, y + 0.2, 3.2), pt(x + w - 0.2, y + 0.2, 3.2), pt(x + w - 0.2, y + h - 0.2, 3.2), pt(x + 0.2, y + h - 0.2, 3.2)], "rgba(220,225,230,0.12)");
    }
    // 柵(手前)
    c.fillStyle = "#6b6f78";
    for (let k = 0; k <= w * 2; k++) {
      const a = pt(x + k / 2, y + h - 0.1, 0), b2 = pt(x + k / 2, y + h - 0.1, 0.9);
      c.fillRect(a[0] - 0.25 * d0.Z, b2[1], 0.5 * d0.Z, a[1] - b2[1]);
    }
    const r0 = pt(x, y + h - 0.1, 0.9), r1 = pt(x + w, y + h - 0.1, 0.9);
    c.strokeStyle = "#5b606a";
    c.lineWidth = Math.max(1, d0.Z * 0.5);
    c.beginPath();
    c.moveTo(...r0);
    c.lineTo(...r1);
    c.stroke();
  };
  function zooAnimal(c, sp, X, Y2, Z, t, face, i) {
    const E = (x, y, rx, ry, col, rot = 0) => {
      c.fillStyle = col;
      c.beginPath();
      c.ellipse(X + x * Z * face, Y2 - y * Z, rx * Z, ry * Z, rot * face, 0, 7);
      c.fill();
    };
    const R = (x, y, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(X + (face > 0 ? x : -x - w) * Z, Y2 - (y + h) * Z, w * Z, h * Z);
    };
    E(0, 0, 2.2, 0.6, "rgba(0,0,0,0.18)");
    if (sp === "elephant") {
      for (const lx of [-1.4, -0.6, 0.6, 1.3]) R(lx - 0.35, 0, 0.7, 1.8, "#7d7d82");
      E(0, 2.6, 2.4, 1.5, "#8c8c92");
      E(2.2, 3, 1.1, 1.1, "#8c8c92");
      E(1.7, 3, 0.8, 1.1, "#7a7a80");
      const sw = Math.sin(t * 1.3) * 0.5;
      c.strokeStyle = "#86868c";
      c.lineWidth = 0.55 * Z;
      c.beginPath();
      c.moveTo(X + 3 * Z * face, Y2 - 2.6 * Z);
      c.quadraticCurveTo(X + (3.6 + sw) * Z * face, Y2 - 1.6 * Z, X + (3.2 + sw) * Z * face, Y2 - 0.6 * Z);
      c.stroke();
      E(2.6, 3.3, 0.12, 0.12, "#222");
    } else if (sp === "giraffe") {
      for (const lx of [-0.8, -0.3, 0.4, 0.9]) R(lx - 0.15, 0, 0.3, 3.2, "#c9963e");
      E(0, 3.6, 1.6, 0.8, "#d6a24a");
      c.strokeStyle = "#d6a24a";
      c.lineWidth = 0.6 * Z;
      const nod = Math.sin(t * 0.6) * 0.3;
      c.beginPath();
      c.moveTo(X + 1.2 * Z * face, Y2 - 3.9 * Z);
      c.lineTo(X + (2.2 + nod) * Z * face, Y2 - 7 * Z);
      c.stroke();
      E(2.5 + nod, 7.1, 0.7, 0.4, "#d6a24a");
      for (let k = 0; k < 5; k++) E(-1 + k * 0.5, 3.5 + (k % 2) * 0.4, 0.18, 0.15, "#8a5a24");
    } else if (sp === "lion") {
      const sleep = Math.sin(t * 0.05 + i) > 0.2;
      for (const lx of [-1, -0.4, 0.5, 1]) R(lx - 0.2, 0, 0.4, sleep ? 0.3 : 1, "#c79a52");
      E(0, sleep ? 0.8 : 1.6, 1.8, 0.8, "#d8a95c");
      if (i === 0) E(1.7, sleep ? 1 : 2.1, 1.1, 1.1, "#8a5a2a");
      E(1.8, sleep ? 1 : 2.1, 0.65, 0.65, "#d8a95c");
      E(-1.9, sleep ? 0.8 : 1.6, 0.6, 0.15, "#c79a52", 0.4);
    } else if (sp === "monkey") {
      const hop = Math.abs(Math.sin(t * 2 + i)) * 0.8;
      E(0, 0.8 + hop, 0.6, 0.7, "#8a6a4a");
      E(0.4, 1.6 + hop, 0.45, 0.45, "#8a6a4a");
      E(0.6, 1.6 + hop, 0.25, 0.28, "#e48a8a");
    } else if (sp === "flamingo") {
      R(0, 0, 0.1, 2, "#e07a8a");
      E(0, 2.4, 0.9, 0.5, "#f4a0b0");
      c.strokeStyle = "#f4a0b0";
      c.lineWidth = 0.25 * Z;
      const bow = Math.sin(t * 0.4 + i) > 0.6 ? 1.6 : 0;
      c.beginPath();
      c.moveTo(X + 0.6 * Z * face, Y2 - 2.6 * Z);
      c.quadraticCurveTo(X + 1.4 * Z * face, Y2 - (3.6 - bow) * Z, X + 0.9 * Z * face, Y2 - (4.2 - bow * 1.8) * Z);
      c.stroke();
      E(0.9, 4.2 - bow * 1.8, 0.3, 0.25, "#f4a0b0");
    } else if (sp === "kangaroo") {
      const hop = Math.max(0, Math.sin(t * 3 + i)) * 1.2;
      E(-0.9, 0.5 + hop, 1, 0.25, "#a8754a", -0.4);
      E(0, 1.6 + hop, 0.8, 1.3, "#b8845a");
      E(0.5, 3 + hop, 0.45, 0.4, "#b8845a");
      E(0.35, 3.5 + hop, 0.12, 0.3, "#a8754a");
    } else if (sp === "redpanda") {
      const up = i === 0 ? 2.4 : 0;
      E(0, 0.7 + up, 0.9, 0.5, "#b8562a");
      E(0.8, 1.1 + up, 0.45, 0.42, "#c86a3a");
      E(0.9, 1.05 + up, 0.25, 0.18, "#f2e8dc");
      for (let k = 0; k < 4; k++) E(-0.9 - k * 0.35, 0.6 + up, 0.22, 0.25, k % 2 ? "#e8d0b0" : "#8a3a1a");
    } else if (sp === "birds") {
      const fl = t * 1.5 + i * 0.9, col = ["#e84a3a", "#f2c23a", "#3a8ad8", "#4ab06a", "#f2f2f2"][i % 5];
      const yy = 1.5 + Math.abs(Math.sin(fl)) * 3, flap = Math.sin(t * 14 + i) * 0.4;
      E(Math.sin(fl * 0.7) * 3, yy, 0.35, 0.22, col);
      E(Math.sin(fl * 0.7) * 3 - 0.1, yy + 0.25 + flap, 0.3, 0.1, col);
    }
  }
  // 敷地のある動物園(sites.js): 正門の建物は入園券売り場とゲート。動物は屋外の園内で見る
  function zooGateHall(b) {
    const W2 = 24, H4 = 12;
    const P = plan(W2, H4, "floor_tile", "leisure");
    P.lv = 0;
    const dx = 12;
    P.door(dx);
    P.wide("ticketbooth", 3, 2, 4, 1, "fx_zooticket", "入園券売り場");
    P.add("board", 9, 1, "fx_zooinfo", "園内マップ・もぐもぐタイムの時間", true);
    P.wide("kiosk", 16, 2, 4, 1, "fx_zooshop", "売店(ぬいぐるみ・アイス)");
    P.add("gate", 10, 6, null, "入園ゲート", false);
    P.add("gate", 14, 6, null, "入園ゲート", false);
    P.sign(12, 5, "ようこそ 動物園へ(園内は外の通路から)");
    P.add("toilet", W2 - 2, H4 - 3, "toilet", "トイレ");
    P.staffSpots.push({ x: 4, y: 3, role: "ticket" }, { x: 17, y: 3, role: "shop" });
    return P.done({ floors: 1, floor: 0, lv: 0, lo: 0, hi: 0, wallH: 3, label: "正門・チケット" });
  }
  // 屋外の獣舎(sites.js の solid "ex")に近づいたときの操作
  function zooOutdoorTargets(g, L2) {
    const m = g.world.map, out = [];
    if (!m.fsites) return out;
    for (const s of m.fsites) {
      if (s.type !== "zoo" || L2.x < s.x - 2 || L2.x > s.x + s.w + 2 || L2.y < s.y - 2 || L2.y > s.y + s.h + 2) continue;
      for (const r of s.solid) {
        if (r.kind !== "ex") continue;
        const nx = Math.max(r.x, Math.min(L2.x, r.x + r.w)), ny = Math.max(r.y, Math.min(L2.y, r.y + r.h));
        if (Math.hypot(nx - L2.x, ny - L2.y) < 1.8) out.push({ kind: "fx", act: "fx_zoowatch", sp: r.sp, x: Math.floor(nx), y: Math.floor(ny), label: `${ZOO_SP[r.sp].name}の展示` });
      }
    }
    return out;
  }

  // 来園者(visitors.js の来客)を屋外の園路に置く: 獣舎の前を順にゆっくり見て回る(Crowd.outdoor から)
  function zooOutdoorVisitors(C2, out, hx, hy, radius) {
    const g = C2.g, m2 = g.world.map, min = g.S.min;
    if (!m2.fsites || typeof visitsOf !== "function") return;
    const have = new Set(out.map((o) => o.id));
    for (const s of m2.fsites) {
      if (s.type !== "zoo" || s.x > hx + radius || s.x + s.w < hx - radius || s.y > hy + radius || s.y + s.h < hy - radius) continue;
      const b = m2.buildings[s.b], ex = s.solid.filter((r) => r.kind === "ex");
      if (!ex.length) continue;
      let k = 0;
      for (const vz of visitsOf(C2, b, min, have)) {
        if (min < vz.arrive || min >= vz.leave || out.length >= 190) continue;
        // 見ている獣舎は時間とともに次へ(1つにつき約20分)
        const r = ex[(uh(vz.id, 71) + Math.floor((min - vz.arrive) / 20)) % ex.length];
        const along = (uh(vz.id, 72) % 100) / 100;
        const x = r.x + 0.5 + along * (r.w - 1), y = r.y + r.h + 0.8 + (uh(vz.id, 73) % 2);
        if (Math.abs(x - hx) > radius || Math.abs(y - hy) > radius) continue;
        have.add(vz.id);
        out.push({ id: vz.id, static: true, x, y, dx: 0, dy: -1, s: 3, visit: b.idx });
        visitNow.set(vz.id, vz);
        if (++k > 60) break;
      }
    }
  }
