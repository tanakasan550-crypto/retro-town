  // src/spirit.js
  var MILESTONES = [[1, "\u9996\u304C\u3057\u3063\u304B\u308A\u3057\u3066\u304D\u305F\u6C17\u914D\u304C\u3042\u308B", 2, 4], [2, "\u3042\u3084\u3059\u3068\u7B11\u3046\u3088\u3046\u306B\u306A\u3063\u305F", 2, 3], [3, "\u9996\u304C\u3059\u308F\u3063\u305F", 3, 5], [4, "\u624B\u3092\u4F38\u3070\u3057\u3066\u3001\u3082\u306E\u3092\u3064\u304B\u3082\u3046\u3068\u3057\u305F", 4, 6], [5, "\u5BDD\u8FD4\u308A\u3092\u3046\u3063\u305F", 5, 7], [6, "\u304A\u3059\u308F\u308A\u306E\u7DF4\u7FD2\u3092\u306F\u3058\u3081\u305F", 6, 8], [7, "\u96E2\u4E73\u98DF\u3092\u98DF\u3079\u306F\u3058\u3081\u305F", 6, 8], [8, "\u3072\u3068\u308A\u3067\u304A\u3059\u308F\u308A\u304C\u3067\u304D\u305F", 7, 9], [9, "\u30CF\u30A4\u30CF\u30A4\u3067\u9032\u3093\u3060", 8, 11], [10, "\u3064\u304B\u307E\u308A\u7ACB\u3061\u3092\u3057\u305F", 9, 12], [11, "\u300C\u307E\u3093\u307E\u300D\u3068\u58F0\u306B\u51FA\u3057\u305F", 10, 13], [12, "\u624B\u3092\u3075\u3063\u3066\u30D0\u30A4\u30D0\u30A4\u3057\u305F", 11, 14], [13, "\u3072\u3068\u308A\u7ACB\u3061\u304C\u3067\u304D\u305F", 12, 15], [14, "\u6700\u521D\u306E\u4E00\u6B69\u3092\u8E0F\u307F\u51FA\u3057\u305F", 13, 17], [15, "\u3053\u3068\u3070\u304C\u5C11\u3057\u305A\u3064\u5897\u3048\u3066\u304D\u305F", 15, 19], [16, "\u30B9\u30D7\u30FC\u30F3\u3092\u6301\u3061\u305F\u304C\u3063\u305F", 16, 20], [17, "\u30DC\u30FC\u30EB\u3092\u3053\u308D\u304C\u3057\u3066\u904A\u3093\u3060", 17, 21], [18, "\u3068\u306A\u308A\u306E\u90E8\u5C4B\u307E\u3067\u6B69\u3044\u3066\u3044\u3063\u305F", 18, 23]];
  var milestoneMonth = (hid, i) => {
    const [, , lo, hi2] = MILESTONES[i];
    return lo + hash2(hid, 3e3 + i) % (hi2 - lo + 1);
  };
  function spiritLines(g) {
    const h = g.hero, m = g.ageMonths(), P2 = g.world.pop;
    const mo = g.nameOf(h.mother), fa = g.nameOf(h.father);
    const out = [];
    if (m === 0) {
      out.push(`\u7CBE\u970A\u306F\u7523\u9662\u306E\u75C5\u5BA4\u3092\u3001\u305D\u3063\u3068\u306E\u305E\u304D\u307E\u3059\u3002
\u52A9\u7523\u5E2B\u3068\u770B\u8B77\u5E2B\u304C\u898B\u5B88\u308B\u4E2D\u3001${mo}\u304C${g.hero.name}\u3092\u7523\u307F\u307E\u3057\u305F\u3002\u5F85\u5408\u5BA4\u3067\u306F${fa}\u304C\u7948\u308B\u3088\u3046\u306B\u5F85\u3063\u3066\u3044\u307E\u3059\u3002`);
      const gm = [P2.mother[h.mother], P2.father[h.mother], P2.mother[h.father], P2.father[h.father]].filter((i) => i >= 0 && !P2.gone[i]);
      if (gm.length) out.push(`${g.nameOf(gm[0])}\u3082\u3001\u559C\u3093\u3067\u99C6\u3051\u3064\u3051\u307E\u3057\u305F\u3002`);
    }
    const done = MILESTONES.map((x, i) => [x, i]).filter(([x, i]) => milestoneMonth(h.id, i) <= m).map(([x]) => x[1]);
    if (done.length) out.push("\u3053\u308C\u307E\u3067\u306B\u3067\u304D\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3053\u3068: " + done.slice(-4).join(" / "));
    const next = MILESTONES.map((x, i) => [x, i]).find(([x, i]) => milestoneMonth(h.id, i) > m);
    if (next && m >= 1) out.push("\u3082\u3046\u3059\u3050: " + next[0][1].replace(/た$/, "\u305D\u3046").replace(/した$/, "\u3057\u305D\u3046"));
    const hr = g.S.min / 60;
    out.push(hr < 6 || hr >= 20 ? `${mo}\u304C\u591C\u6CE3\u304D\u306B\u3001\u305D\u3063\u3068\u5BC4\u308A\u305D\u3063\u3066\u3044\u307E\u3059\u3002` : hr < 12 ? `${mo}\u3068${fa}\u304C\u3001\u671D\u306E\u3057\u305F\u304F\u3092\u3057\u306A\u304C\u3089\u58F0\u3092\u304B\u3051\u3066\u3044\u307E\u3059\u3002` : `\u663C\u306E\u3042\u3044\u3060\u3001\u5BB6\u65CF\u304C\u4EA4\u4EE3\u3067\u898B\u5B88\u3063\u3066\u3044\u307E\u3059\u3002`);
    if (h.father != null && g.S.M - g.S.bornM >= 3 && g.S.M % 3 === 0) out.push("\u89AA\u621A\u304C\u9854\u3092\u898B\u306B\u6765\u3066\u3001\u306B\u304E\u3084\u304B\u306B\u306A\u308A\u307E\u3057\u305F\u3002");
    return out;
  }
  function spiritSvg(g, w = 320, hgt = 150) {
    const m = g.ageMonths(), hr = g.S.min / 60, night = hr < 6 || hr >= 19;
    const bg = night ? "#1c2447" : "#fdf1d6", fl = night ? "#2a335f" : "#e9d3a8";
    const hospital = m === 0;
    const win = night ? '<circle cx="268" cy="34" r="12" fill="#f4f0c8"/><circle cx="262" cy="30" r="12" fill="#1c2447"/>' : '<circle cx="268" cy="34" r="13" fill="#ffd54a"/>';
    const bed = hospital ? `<rect x="70" y="86" width="150" height="26" rx="5" fill="#e8eef6" stroke="#8aa0c0"/><rect x="62" y="80" width="18" height="40" rx="4" fill="#cfd9e8"/><rect x="100" y="76" width="60" height="14" rx="7" fill="#fff" stroke="#b9c7dc"/><text x="210" y="70" font-size="10" fill="#6a7a95">\u7523\u9662</text>` : `<path d="M96 108 q54 -34 108 0 v6 h-108z" fill="#d9a066" stroke="#8a5a2b"/><ellipse cx="150" cy="104" rx="38" ry="14" fill="#fff6e8"/><circle cx="150" cy="98" r="10" fill="#ffd9b3"/><rect x="92" y="112" width="116" height="6" rx="3" fill="#8a5a2b"/>`;
    const people = hospital ? '<circle cx="40" cy="92" r="9" fill="#ffd9b3"/><rect x="30" y="100" width="20" height="30" rx="6" fill="#9ad0c8"/><circle cx="250" cy="96" r="9" fill="#ffd9b3"/><rect x="240" y="104" width="20" height="26" rx="6" fill="#f2b8c6"/>' : '<circle cx="48" cy="96" r="9" fill="#ffd9b3"/><rect x="38" y="104" width="20" height="28" rx="6" fill="#f2b8c6"/><circle cx="256" cy="98" r="9" fill="#ffd9b3"/><rect x="246" y="106" width="20" height="26" rx="6" fill="#8fb4e8"/>';
    const sp = `<g class="spirit"><circle cx="150" cy="40" r="26" fill="#fff6a8" opacity=".25"/><circle cx="150" cy="40" r="17" fill="#fffbd0" opacity=".6"/><ellipse cx="150" cy="40" rx="9" ry="11" fill="#fff"/><circle cx="146" cy="38" r="1.6" fill="#445"/><circle cx="155" cy="38" r="1.6" fill="#445"/><path d="M146 44 q4 3 8 0" stroke="#445" fill="none" stroke-width="1.2" stroke-linecap="round"/><path d="M142 50 q8 14 16 0" fill="#fffbd0" opacity=".7"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hgt}" width="100%" role="img" aria-label="\u898B\u5B88\u308A\u7CBE\u970A\u306E\u8996\u70B9"><rect width="${w}" height="${hgt}" fill="${bg}"/><rect y="124" width="${w}" height="${hgt - 124}" fill="${fl}"/>${win}${bed}${people}${sp}</svg>`;
  }

