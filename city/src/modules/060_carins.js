  // src/carins.js
  var INS_CO = [{ id: "minato", name: "\u30DF\u30CA\u30C8\u6D77\u4E0A\u4FDD\u967A", k: 1 }, { id: "aozora", name: "\u3042\u304A\u305E\u3089\u640D\u5BB3\u4FDD\u967A", k: 0.94 }, { id: "haruka", name: "\u30CF\u30EB\u30AB\u30BC\u5171\u6E08", k: 0.88 }];
  var COVERS = { basic: { name: "\u5BFE\u4EBA\u30FB\u5BFE\u7269\u306E\u307F", k: 0.62, veh: false, tow: false }, std: { name: "\u8ECA\u4E21\u4FDD\u967A(\u4E00\u822C)", k: 1, veh: true, tow: false }, full: { name: "\u30D5\u30EB\u88DC\u511F(\u30EC\u30C3\u30AB\u30FC\u4ED8)", k: 1.28, veh: true, tow: true } };
  var DEDS = [0, 5e4, 1e5];
  var BASE = { kei: 55e3, small: 75e3, mid: 95e3, large: 13e4 };
  var defaultPol = () => ({ co: "minato", cover: "std", ded: 5e4 });
  var histOf = (h) => {
    const v = h.veh || (h.veh = { own: {}, ride: null });
    return v.hist || (v.hist = { acc: [], viol: 0, since: null });
  };
  var claimsRecent = (h, M) => histOf(h).acc.filter((a) => a.claimed && M - a.M <= 36).length;
  function noClaimYears(h, M) {
    const H4 = histOf(h);
    const last = H4.acc.filter((a) => a.claimed).reduce((m, a) => Math.max(m, a.M), H4.since == null ? M : H4.since);
    return Math.max(0, Math.min(8, Math.floor((M - last) / 12)));
  }
  function insPremium(g, c, cls) {
    const pol = c.pol || defaultPol(), h = g.hero, M = g.S.M;
    const co = INS_CO.find((x) => x.id === pol.co) || INS_CO[0], cv2 = COVERS[pol.cover] || COVERS.std;
    const dedK = pol.ded >= 1e5 ? 0.9 : pol.ded >= 5e4 ? 1 : 1.12, age = g.age(), ageK = age < 26 ? 1.5 : age < 30 ? 1.2 : 1;
    const hk = 1 + 0.18 * Math.min(4, claimsRecent(h, M)) + 0.04 * Math.min(5, histOf(h).viol) - 0.02 * noClaimYears(h, M);
    return Math.round(g.yen(BASE[cls] || BASE.small) * cv2.k * dedK * co.k * ageK * hk / 100) * 100;
  }
  var insActive = (g, c) => g.S.M < c.insM && !c.lapsed;

