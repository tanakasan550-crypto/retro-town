  // src/devmode.js
  var TEST_MAX = 9e12;
  var isTestMode = (g) => !!g.hero.testMode?.on;
  function testMoneyOn(g) {
    if (!devToolsEnabled()) return false;
    const h = g.hero;
    if (h.testMode?.on) return true;
    h.testMode = { on: true, used: true, since: g.S.M, backup: { money: h.money, debt: h.debt || 0 } };
    h.money = TEST_MAX;
    h.debt = 0;
    g.log("dev", "\u3010\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u3011\u6240\u6301\u91D1\u3092\u8A66\u9A13\u7528\u306E\u6700\u5927\u984D\u306B\u3057\u307E\u3057\u305F(\u901A\u5E38\u306E\u6240\u6301\u91D1\u306F\u9000\u907F\u4E2D)\u3002");
    return true;
  }
  function testMoneyOff(g) {
    const h = g.hero;
    const t = h.testMode;
    if (!t?.on) return false;
    h.money = t.backup.money;
    h.debt = t.backup.debt;
    t.on = false;
    t.backup = null;
    g.log("dev", "\u3010\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u7D42\u4E86\u3011\u901A\u5E38\u306E\u6240\u6301\u91D1\u306B\u623B\u3057\u307E\u3057\u305F\u3002");
    return true;
  }
  var isTestSession = (g) => !!(g && g.S && g.S.testSession);
  var testBypass = (g, k) => !!(devToolsEnabled() && g && g.S && g.S.testSession && g.S.testSession.bypass && g.S.testSession.bypass[k]);
  var TEST_DEFAULT_BYPASS = { hours: true, age: true, money: true };
  var isTestState = (g) => !!(g && g.S && (g.S.testSession || g.S.hero && g.S.hero.testMode && g.S.hero.testMode.on));
  function devSetAge(g, years, months = 0) {
    if (!isTestSession(g)) return false;
    g.S.bornM = g.S.M - (years * 12 + months);
    g.log("dev", `\u3010\u8A66\u9A13\u3011\u5E74\u9F62\u3092${years}\u6B73${months ? months + "\u304B\u6708" : ""}\u306B\u8A2D\u5B9A`);
    return true;
  }
  function devSetDate(g, y, m0, d = 1, keepAge = true) {
    if (!isTestSession(g)) return false;
    const am = g.ageMonths();
    g.S.M = (y - 1900) * 12 + m0;
    g.S.day = Math.max(1, Math.min(28, d));
    if (keepAge) g.S.bornM = g.S.M - am;
    g.log("dev", `\u3010\u8A66\u9A13\u3011\u65E5\u4ED8\u3092${y}\u5E74${m0 + 1}\u6708${g.S.day}\u65E5\u306B\u8A2D\u5B9A`);
    return true;
  }
  function devSetTime(g, h, mi = 0) {
    if (!isTestSession(g)) return false;
    g.S.min = Math.max(0, Math.min(1439, h * 60 + mi));
    return true;
  }
  function devSetBypass(g, k, on2) {
    if (!isTestSession(g)) return false;
    g.S.testSession.bypass[k] = !!on2;
    return true;
  }
  function devSetMoney(g, on2) {
    if (!isTestSession(g)) return false;
    if (on2) {
      if (!g.hero.testMode?.on) testMoneyOn(g);
    } else testMoneyOff(g);
    return true;
  }

