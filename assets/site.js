// Fills in each mod's version and direct download link from releases.js,
// shows GitHub download totals, and (once a GoatCounter code is set) the visit counter.
// Without scripts the buttons still work: they open the mod's latest release page.
(function () {
  // GoatCounter site code. Empty = no visit counting, no "Visits" line, no privacy note.
  // After sign-up at goatcounter.com put the code here, e.g. "taom-mods".
  var GOATCOUNTER = "minimalcash63";

  var mods = {
    aio: { repo: "MinimalCash63/TAOM-AIO-Compat", zip: "TAOM-AIO-Compat-", count: /^TAOM-AIO-Compat-.*\.zip$/ },
    ls: { repo: "MinimalCash63/TAOM-Extra-Loading-Screens", zip: "TAOM-ExtraLoadingScreens-", count: /^TAOM-ExtraLoadingScreens-.*\.zip$/ },
    tools: { repo: "Coodsz/Coodsz-TAOM", count: /^Coodsz-TAOM-Tools-.*\.zip$/ }
  };
  var rel = window.TAOM_RELEASES || {};
  Object.keys(mods).forEach(function (key) {
    var v = rel[key];
    var m = mods[key];
    if (!v || !m.zip) return;
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

  // ---- helpers: everything below fails quietly ----
  function fmt(n) {
    try { return Number(n).toLocaleString("en"); } catch (e) { return String(n); }
  }
  function cacheGet(k, maxAgeMs) {
    try {
      var o = JSON.parse(sessionStorage.getItem(k));
      if (o && Date.now() - o.t < maxAgeMs) return o.v;
    } catch (e) {}
    return null;
  }
  function cacheSet(k, v) {
    try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v: v })); } catch (e) {}
  }

  // ---- download totals from GitHub's public API ----
  function show(key, total) {
    document.querySelectorAll('[data-downloads="' + key + '"]').forEach(function (el) {
      el.textContent = fmt(total);
      if (el.parentNode) el.parentNode.hidden = false;
    });
  }
  Object.keys(mods).forEach(function (key) {
    var m = mods[key];
    if (!document.querySelector('[data-downloads="' + key + '"]')) return;
    var ck = "taom-dl-" + key;
    var cached = cacheGet(ck, 10 * 60 * 1000);
    if (cached !== null) { show(key, cached); return; }
    if (!window.fetch) return;
    fetch("https://api.github.com/repos/" + m.repo + "/releases?per_page=100", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error("api"); return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list)) throw new Error("shape");
        var total = 0;
        list.forEach(function (rl) {
          (rl.assets || []).forEach(function (a) {
            if (m.count.test(a.name) && typeof a.download_count === "number") total += a.download_count;
          });
        });
        cacheSet(ck, total);
        show(key, total);
      })
      .catch(function () { /* limit reached or offline: show nothing */ });
  });

  // ---- visits (GoatCounter: no cookies, no personal data) ----
  if (GOATCOUNTER && /^[a-z0-9-]+$/.test(GOATCOUNTER)) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + GOATCOUNTER + ".goatcounter.com/count");
    document.head.appendChild(s);

    document.querySelectorAll("[data-privacy]").forEach(function (el) { el.hidden = false; });

    var vk = "taom-visits";
    var vc = cacheGet(vk, 10 * 60 * 1000);
    var showVisits = function (n) {
      document.querySelectorAll("[data-visits]").forEach(function (el) {
        el.textContent = n;
        if (el.parentNode) el.parentNode.hidden = false;
      });
    };
    if (vc !== null) showVisits(vc);
    else if (window.fetch) {
      fetch("https://" + GOATCOUNTER + ".goatcounter.com/counter/TOTAL.json")
        .then(function (r) { if (!r.ok) throw new Error("gc"); return r.json(); })
        .then(function (j) {
          if (!j || typeof j.count !== "string") throw new Error("shape");
          cacheSet(vk, j.count);
          showVisits(j.count);
        })
        .catch(function () {});
    }
  }
})();
