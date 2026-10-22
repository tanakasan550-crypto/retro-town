  // src/autosave.js
  function makeAutosaver({ save, verify, notify = () => {
  }, timeoutMs = 8e3, now = () => Date.now() }) {
    const st3 = { ok: 0, fail: 0, streak: 0, lastOkAt: 0, lastFailAt: 0, lastErr: "", busy: false, skipped: 0, warned: 0 };
    const withTimeout2 = (p) => new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("\u4FDD\u5B58\u304C\u7D42\u308F\u308A\u307E\u305B\u3093(\u6642\u9593\u5207\u308C)")), timeoutMs);
      Promise.resolve(p).then((v) => {
        clearTimeout(t);
        res(v);
      }, (e) => {
        clearTimeout(t);
        rej(e);
      });
    });
    async function run(label) {
      if (st3.busy) {
        st3.skipped++;
        return false;
      }
      st3.busy = true;
      const stamp = now();
      try {
        await withTimeout2(save(stamp, label));
        const back = await withTimeout2(verify(stamp, label));
        if (!back) throw new Error("\u4FDD\u5B58\u3057\u305F\u5185\u5BB9\u3092\u8AAD\u307F\u623B\u305B\u307E\u305B\u3093\u3067\u3057\u305F");
        st3.ok++;
        st3.streak = 0;
        st3.lastOkAt = stamp;
        if (st3.warned) {
          st3.warned = 0;
          notify({ level: "ok", msg: "\u81EA\u52D5\u4FDD\u5B58\u304C\u56DE\u5FA9\u3057\u307E\u3057\u305F" });
        }
        return true;
      } catch (e) {
        st3.fail++;
        st3.streak++;
        st3.lastFailAt = stamp;
        st3.lastErr = String(e && e.message || e);
        if (st3.streak === 1 || st3.streak % 5 === 0) {
          st3.warned++;
          notify({ level: "warn", msg: `\u81EA\u52D5\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F(${st3.lastErr})\u3002\u8A2D\u5B9A\u306E\u300C\u30BB\u30FC\u30D6\u3092\u66F8\u304D\u51FA\u3059\u300D\u3067\u30D5\u30A1\u30A4\u30EB\u306B\u6B8B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`, streak: st3.streak });
        }
        return false;
      } finally {
        st3.busy = false;
      }
    }
    return { run, state: () => ({ ...st3 }), health: () => st3.streak === 0 ? "ok" : st3.streak < 3 ? "warn" : "bad" };
  }

