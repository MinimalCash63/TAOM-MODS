// Fills in each mod's version and direct download link from releases.js.
// Without scripts the buttons still work: they open the mod's latest release page.
(function () {
  var mods = {
    aio: { repo: "MinimalCash63/TAOM-AIO-Compat", zip: "TAOM-AIO-Compat-" },
    ls: { repo: "MinimalCash63/TAOM-Extra-Loading-Screens", zip: "TAOM-ExtraLoadingScreens-" }
  };
  var rel = window.TAOM_RELEASES || {};
  Object.keys(mods).forEach(function (key) {
    var v = rel[key];
    if (!v) return;
    var m = mods[key];
    var url = "https://github.com/" + m.repo + "/releases/download/" + v + "/" + m.zip + v + ".zip";
    document.querySelectorAll('[data-download="' + key + '"]').forEach(function (a) {
      a.href = url;
      var label = a.querySelector("span");
      if (label) label.textContent = "Download " + v;
    });
    document.querySelectorAll('[data-version="' + key + '"]').forEach(function (el) {
      el.textContent = "Version " + v;
    });
  });
})();
