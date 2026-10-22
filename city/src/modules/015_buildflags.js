  // src/buildflags.js
  var DEV_TOOLS = true;
  var devToolsEnabled = () => DEV_TOOLS && !(typeof location !== "undefined" && /[?&]public=1/.test(location.search || ""));

