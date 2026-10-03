/* THE LAST PORTFOLIO — interface controller */
(function () {
  "use strict";

  var A = window.ARCHIVE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GITHUB_SINCE = new Date("2024-12-19T00:00:00Z");
  var recovered = []; // projects recovered from GitHub

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () { seed = (seed + 0x6d2b79f5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function store(key, val) {
    try { if (val === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, val); } catch (e) { return null; }
  }
  function redacted(label) {
    return '<span class="redacted">' + esc(label || "DATA PENDING — FILE NOT YET RECOVERED") +
      '<span class="redacted__bar" style="width:92%"></span><span class="redacted__bar" style="width:64%"></span></span>';
  }

  /* ---------------- BOOT ---------------- */
  function boot(done) {
    var overlay = $("#boot");
    var finish = function () {
      if (overlay.classList.contains("done")) return;
      overlay.classList.add("done");
      document.body.classList.remove("locked");
      store("booted", "1");
      done();
    };
    if (reduceMotion || store("booted")) { overlay.classList.add("done"); done(); return; }
    document.body.classList.add("locked");
    $("#bootSkip").addEventListener("click", finish);
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape" || e.key === "Enter") { document.removeEventListener("keydown", k); finish(); } });

    var lines = [
      ["LAST_ARCHIVE BIOS v9.1 // EMERGENCY POWER", ""],
      ["> checking global network ............", "err:FAILING"],
      ["> scanning for surviving nodes ........", "ok:1 FOUND"],
      ["> mounting /archive/" + A.survivor.callsign + " ...........", "ok:OK"],
      ["> decrypting survivor profile ........", "ok:OK"],
      ["> loading arsenal [" + countSkills() + " tools] ...........", "ok:OK"],
      ["> recovering project records .........", "ok:OK"],
      ["> opening transmission channels ......", "ok:OK"],
      ["", ""],
      ["ARCHIVE READY. PRESERVE YOUR STORY.", ""],
    ];
    var log = $("#bootLog"), bar = $("#bootBar"), i = 0;
    (function next() {
      if (overlay.classList.contains("done")) return;
      if (i >= lines.length) { setTimeout(finish, 450); return; }
      var l = lines[i], suffix = "";
      if (l[1]) { var p = l[1].split(":"); suffix = ' <span class="' + p[0] + '">' + p[1] + "</span>"; }
      log.innerHTML += esc(l[0]) + suffix + "\n";
      i++; bar.style.width = (i / lines.length) * 100 + "%";
      setTimeout(next, 110 + Math.random() * 140);
    })();
  }

  /* ---------------- IDENTITY ---------------- */
  function renderIdentity() {
    var s = A.survivor;
    var h1 = $("#hero-name");
    h1.textContent = s.name; h1.setAttribute("data-text", s.name);
    document.title = s.name + " — The Last Portfolio";
    $("#intro").textContent = s.intro;
    $("#interests").innerHTML = s.interests.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    $("#idNo").textContent = "#" + String(hash(s.callsign) % 10000).padStart(4, "0");

    var meta = [
      ["NAME", s.name], ["CALLSIGN", "@" + s.callsign], ["ROLE", s.roles[0]],
      ["LOCATION", s.location], ["STATUS", s.status],
    ];
    $("#idMeta").innerHTML = meta.map(function (m) {
      return "<div><dt>" + m[0] + "</dt><dd>" + (m[1] ? esc(m[1]) : '<span style="color:var(--dim)">[CLASSIFIED]</span>') + "</dd></div>";
    }).join("");

    // typewriter
    var roleEl = $("#role");
    if (reduceMotion) { roleEl.textContent = s.roles.join(" / "); }
    else {
      var ri = 0, ci = 0, del = false;
      (function type() {
        var word = s.roles[ri];
        ci += del ? -1 : 1;
        roleEl.textContent = word.slice(0, ci);
        var wait = del ? 35 : 70;
        if (!del && ci === word.length) { del = true; wait = 1800; }
        else if (del && ci === 0) { del = false; ri = (ri + 1) % s.roles.length; wait = 300; }
        setTimeout(type, wait);
      })();
      // periodic glitch on the name
      setInterval(function () { h1.classList.add("on"); setTimeout(function () { h1.classList.remove("on"); }, 360); }, 4200);
    }
  }

  function renderStats() {
    var days = Math.max(0, Math.floor((Date.now() - GITHUB_SINCE) / 864e5));
    var stats = [
      ["projects", A.projects.length, "Project records"],
      ["skills", countSkills(), "Tools in arsenal"],
      ["days", days, "Days on the network"],
      ["status", "ONLINE", "Uplink status"],
    ];
    $("#stats").innerHTML = stats.map(function (s) {
      return '<div class="stat"><div class="stat__v" data-stat="' + s[0] + '">' + s[1] + '</div><div class="stat__k">' + s[2] + "</div></div>";
    }).join("");
  }
  function setStat(key, v) { var n = document.querySelector('[data-stat="' + key + '"]'); if (n) n.textContent = v; }

  /* ---------------- LOG ---------------- */
  function renderLog() {
    var tabs = $("#logTabs"), panel = $("#logPanel");
    A.log.forEach(function (entry, i) {
      var b = el("button", {
        class: "logtab", type: "button", role: "tab", id: "logtab-" + i,
        "aria-controls": "logPanel", "aria-selected": i === 0 ? "true" : "false", tabindex: i === 0 ? "0" : "-1",
      });
      b.innerHTML = "<span>" + esc(entry.id) + "</span>" + (entry.lines ? "<small>" + entry.lines.length + " REC</small>" : '<small class="miss">DAMAGED</small>');
      b.addEventListener("click", function () { select(i); });
      tabs.appendChild(b);
    });
    tabs.addEventListener("keydown", function (e) {
      var cur = A.log.findIndex(function (_, i) { return $("#logtab-" + i).getAttribute("aria-selected") === "true"; });
      var n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (n) { e.preventDefault(); var t = (cur + n + A.log.length) % A.log.length; select(t); $("#logtab-" + t).focus(); }
    });
    function select(i) {
      A.log.forEach(function (_, j) {
        var t = $("#logtab-" + j);
        t.setAttribute("aria-selected", i === j ? "true" : "false");
        t.setAttribute("tabindex", i === j ? "0" : "-1");
      });
      panel.setAttribute("aria-labelledby", "logtab-" + i);
      var e = A.log[i];
      var body = e.lines
        ? "<ol>" + e.lines.map(function (l, k) { return "<li><span>[" + String(k + 1).padStart(2, "0") + "]</span><div>" + esc(l) + "</div></li>"; }).join("") + "</ol>"
        : '<div class="corrupt">!! SECTOR CORRUPTED — this record has not been restored yet.</div>' + redacted();
      panel.innerHTML = "<h3>" + esc(e.title) + '</h3><p class="meta">LOG/' + esc(e.id) + " &bull; ENTRY " + String(i + 1).padStart(2, "0") + " OF " + String(A.log.length).padStart(2, "0") + "</p>" + body;
      if (!reduceMotion) { panel.animate([{ opacity: 0, transform: "translateX(6px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "ease-out" }); }
    }
    select(0);
  }

  /* ---------------- ARSENAL ---------------- */
  function countSkills() { return A.skills.reduce(function (n, c) { return n + c.items.length; }, 0); }

  function renderArsenal() {
    var grid = $("#arsenalGrid"), filters = $("#skillFilters");
    var cats = ["All"].concat(A.skills.map(function (c) { return c.category; }));
    cats.forEach(function (c, i) {
      var b = el("button", { class: "filter", type: "button", "aria-pressed": i === 0 ? "true" : "false", text: c });
      b.addEventListener("click", function () {
        filters.querySelectorAll(".filter").forEach(function (f) { f.setAttribute("aria-pressed", f === b ? "true" : "false"); });
        grid.querySelectorAll(".crate").forEach(function (cr) { cr.classList.toggle("hide", c !== "All" && cr.dataset.cat !== c); });
      });
      filters.appendChild(b);
    });

    A.skills.forEach(function (cat) {
      var crate = el("article", { class: "crate reveal", "data-cat": cat.category });
      crate.innerHTML = '<div class="crate__head"><h3>' + esc(cat.category) + "</h3><span>" + esc(cat.code || "") + " / " + String(cat.items.length).padStart(2, "0") + "</span></div>" +
        cat.items.map(function (t) {
          var ok = t.status !== "calibrating", bars = Math.round(t.level / 10);
          var cells = ""; for (var k = 0; k < 10; k++) cells += '<i data-on="' + (k < bars ? 1 : 0) + '"></i>';
          return '<div class="tool"><div class="tool__row"><span>' + esc(t.name) + '</span><em class="' + (ok ? "ok" : "cal") + '">' + (ok ? "OPERATIONAL" : "CALIBRATING") + "</em></div>" +
            '<div class="signal' + (ok ? "" : " cal") + '" role="img" aria-label="' + esc(t.name) + " signal strength " + bars + ' of 10">' + cells + "</div></div>";
        }).join("");
      grid.appendChild(crate);
    });
  }
  function chargeSignals(root) {
    var cells = root.querySelectorAll('.signal i[data-on="1"]');
    cells.forEach(function (c, i) { setTimeout(function () { c.classList.add("on"); }, reduceMotion ? 0 : (i % 10) * 70); });
  }

  /* ---------------- ARCHIVES ---------------- */
  var LANG_COLORS = { JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", HTML: "#e34c26", CSS: "#663399", Java: "#b07219",
    "C++": "#f34b7d", C: "#8a96a3", Go: "#00ADD8", Rust: "#dea584", Shell: "#89e051", Jupyter: "#DA5B0B", "Jupyter Notebook": "#DA5B0B", Kotlin: "#A97BFF", Dart: "#00B4AB", PHP: "#4F5D95", Ruby: "#701516" };

  // Procedural "signal fingerprint" visual for records without a screenshot.
  function fingerprint(name, lang) {
    var r = rng(hash(name)), accent = LANG_COLORS[lang] || "#c6ff3d";
    var W = 640, H = 360, s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Generated archive visual for ' + esc(name) + '">';
    s += '<rect width="' + W + '" height="' + H + '" fill="#0b0f10"/>';
    for (var x = 0; x <= W; x += 32) s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + H + '" stroke="#1a2425"/>';
    for (var y = 0; y <= H; y += 32) s += '<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '" stroke="#1a2425"/>';
    // waveform
    for (var w = 0; w < 3; w++) {
      var d = "M0 " + H / 2, amp = 20 + r() * 60, f = 0.01 + r() * 0.03, ph = r() * 6;
      for (var px = 0; px <= W; px += 8) d += " L" + px + " " + (H / 2 + Math.sin(px * f + ph) * amp * Math.sin(px / W * Math.PI) + (r() - 0.5) * 10).toFixed(1);
      s += '<path d="' + d + '" fill="none" stroke="' + (w === 0 ? accent : "#5ee6ff") + '" stroke-opacity="' + (w === 0 ? 0.9 : 0.25) + '" stroke-width="' + (w === 0 ? 2 : 1) + '"/>';
    }
    // data blocks
    for (var b = 0; b < 14; b++) {
      var bx = Math.floor(r() * 20) * 32, by = Math.floor(r() * 11) * 32;
      s += '<rect x="' + bx + '" y="' + by + '" width="32" height="32" fill="' + accent + '" fill-opacity="' + (0.05 + r() * 0.18).toFixed(2) + '"/>';
    }
    s += '<circle cx="' + (480 + r() * 80) + '" cy="' + (80 + r() * 60) + '" r="46" fill="none" stroke="' + accent + '" stroke-dasharray="4 6"/>';
    s += '<text x="24" y="' + (H - 52) + '" fill="#dbe6e2" font-family="JetBrains Mono, monospace" font-size="26" font-weight="700">' + esc(name.length > 28 ? name.slice(0, 27) + "…" : name) + "</text>";
    s += '<text x="24" y="' + (H - 24) + '" fill="#8a9e98" font-family="JetBrains Mono, monospace" font-size="13" letter-spacing="2">SIG ' + hash(name).toString(16).toUpperCase().slice(0, 6) + " // " + esc((lang || "UNKNOWN").toUpperCase()) + "</text>";
    return s + "</svg>";
  }

  function visual(p) {
    if (p.image) return '<img src="' + esc(p.image) + '" alt="Visual for ' + esc(p.name) + '" loading="lazy" width="640" height="360" />';
    return fingerprint(p.name, p.tech && p.tech[0]);
  }

  function recordCard(p, idx) {
    var card = el("article", { class: "record reveal" });
    card.innerHTML =
      '<div class="record__visual">' + visual(p) + '<span class="record__tag">' + esc(p.codename) + "</span>" + (p.recovered ? '<span class="record__tag live">LIVE RECOVERED</span>' : "") + "</div>" +
      '<div class="record__body"><span class="record__code">STATUS: ' + esc(p.status || "ARCHIVED") + "</span><h3>" + esc(p.name) + "</h3><p>" + esc(p.summary) + "</p>" +
      '<ul class="tags" aria-label="Technologies">' + (p.tech || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<div class="record__actions"><button class="btn btn--primary" type="button" data-open="' + idx + '">Open dossier</button>' +
      (p.repo ? '<a class="btn" href="' + esc(p.repo) + '" target="_blank" rel="noopener">Source &nearr;</a>' : "") +
      (p.live ? '<a class="btn" href="' + esc(p.live) + '" target="_blank" rel="noopener">Live &nearr;</a>' : "") + "</div></div>";
    return card;
  }

  function allProjects() { return A.projects.concat(recovered); }

  function renderProjects() {
    var grid = $("#projectGrid");
    grid.innerHTML = "";
    allProjects().forEach(function (p, i) { grid.appendChild(recordCard(p, i)); });
    observe(grid.querySelectorAll(".reveal"));
    setStat("projects", allProjects().length);
  }

  function openDossier(i) {
    var p = allProjects()[i]; if (!p) return;
    var dlg = $("#dossier");
    $("#dossierBody").innerHTML =
      '<div class="dossier__top"><span>DOSSIER ' + esc(p.codename) + " // " + esc(p.status || "ARCHIVED") + '</span><button class="dossier__close" type="button" data-close>CLOSE [ESC]</button></div>' +
      '<div class="dossier__visual">' + visual(p) + "</div>" +
      '<div class="dossier__content"><h2 id="dossierTitle">' + esc(p.name) + "</h2><p style=\"margin:0;color:#c4d2cd\">" + esc(p.summary) + "</p>" +
      (p.details && p.details.length ? '<div><h4>MISSION BRIEF</h4><ul class="brief">' + p.details.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<div><h4>TECHNOLOGIES</h4><ul class="tags">' + (p.tech || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="record__actions">' + (p.repo ? '<a class="btn btn--primary" href="' + esc(p.repo) + '" target="_blank" rel="noopener">View source &nearr;</a>' : "") +
      (p.live ? '<a class="btn" href="' + esc(p.live) + '" target="_blank" rel="noopener">Open live &nearr;</a>' : "") + "</div></div>";
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    $(".dossier__close", dlg).focus();
  }

  function initDossier() {
    var dlg = $("#dossier");
    document.addEventListener("click", function (e) {
      var o = e.target.closest("[data-open]"); if (o) openDossier(+o.dataset.open);
      if (e.target.closest("[data-close]")) close();
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); }); // backdrop
    function close() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  }

  function recoverFromGitHub() {
    var g = A.github, status = $("#recoverStatus");
    if (!g || !g.autoRecover || !window.fetch) return;
    status.textContent = "> scanning network for repositories owned by @" + g.user + " …";
    fetch("https://api.github.com/users/" + encodeURIComponent(g.user) + "/repos?sort=updated&per_page=100", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (repos) {
        var curated = A.projects.map(function (p) { return (p.repo || "").toLowerCase(); });
        var exclude = (g.exclude || []).map(function (x) { return x.toLowerCase(); });
        var langs = {};
        repos.forEach(function (r) { if (!r.fork && r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
        renderLangScan(langs);

        recovered = repos.filter(function (r) {
          return !r.fork && !r.archived && exclude.indexOf(r.name.toLowerCase()) < 0 && curated.indexOf(r.html_url.toLowerCase()) < 0;
        }).slice(0, g.max || 6).map(function (r, i) {
          var tech = [r.language].concat(r.topics || []).filter(Boolean).slice(0, 6);
          return {
            name: r.name.replace(/[-_]/g, " "),
            codename: "REC-" + String(i + 1).padStart(3, "0"),
            summary: r.description || "Repository recovered from the network. No description was transmitted with this record — open the source to inspect it.",
            details: [
              "Primary language: " + (r.language || "not detected"),
              "Last signal: " + new Date(r.pushed_at || r.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
              "Stars: " + r.stargazers_count + " • Forks: " + r.forks_count,
            ],
            tech: tech.length ? tech : ["Unclassified"],
            image: null,
            repo: r.html_url,
            live: r.homepage || (r.has_pages ? "https://" + g.user + ".github.io/" + r.name + "/" : null),
            status: "RECOVERED",
            recovered: true,
          };
        });
        renderProjects();
        status.innerHTML = recovered.length
          ? "> " + recovered.length + " record(s) recovered live from <a href=\"https://github.com/" + esc(g.user) + "\" target=\"_blank\" rel=\"noopener\">github.com/" + esc(g.user) + "</a>."
          : "> no additional public repositories found on the network.";
      })
      .catch(function () {
        status.innerHTML = '> <span style="color:var(--alert)">uplink lost</span> — live recovery failed. Full archive at <a href="https://github.com/' + esc(g.user) + '" target="_blank" rel="noopener">github.com/' + esc(g.user) + "</a>.";
      });
  }

  function renderLangScan(langs) {
    var keys = Object.keys(langs).sort(function (a, b) { return langs[b] - langs[a]; });
    if (!keys.length) return;
    var total = keys.reduce(function (n, k) { return n + langs[k]; }, 0);
    $("#langBar").innerHTML = keys.map(function (k) {
      return '<span style="width:' + (langs[k] / total * 100) + "%;background:" + (LANG_COLORS[k] || "#8a9e98") + '" title="' + esc(k) + '"></span>';
    }).join("");
    $("#langLegend").innerHTML = keys.map(function (k) {
      return '<li><i style="background:' + (LANG_COLORS[k] || "#8a9e98") + '"></i>' + esc(k) + " — " + langs[k] + " repo" + (langs[k] > 1 ? "s" : "") + "</li>";
    }).join("");
    var box = $("#langScan"); box.hidden = false; observe([box]);
  }

  /* ---------------- TRANSMISSION ---------------- */
  var ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm7 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4V9.5Z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
  };

  function channelList() {
    var c = A.contact, list = [
      { key: "EMAIL", icon: "mail", label: c.email, url: c.email ? "mailto:" + c.email : null },
      { key: "GITHUB", icon: "github", label: c.github && c.github.replace(/^https?:\/\//, ""), url: c.github },
      { key: "LINKEDIN", icon: "linkedin", label: c.linkedin && c.linkedin.replace(/^https?:\/\/(www\.)?/, ""), url: c.linkedin },
    ];
    (c.other || []).forEach(function (o) { list.push({ key: o.label.toUpperCase(), icon: "link", label: o.url.replace(/^https?:\/\//, ""), url: o.url }); });
    return list;
  }

  function renderChannels() {
    $("#channels").innerHTML = channelList().map(function (ch) {
      var inner = '<span class="channel__icon">' + ICONS[ch.icon] + '</span><span class="channel__txt"><b>' + esc(ch.key) + "</b><span>" + (ch.url ? esc(ch.label) : "frequency not yet configured") + "</span></span>";
      return ch.url
        ? '<li><a class="channel" href="' + esc(ch.url) + '"' + (ch.url.indexOf("mailto:") === 0 ? "" : ' target="_blank" rel="noopener"') + ">" + inner + '<span class="channel__go" aria-hidden="true">&rarr;</span></a></li>'
        : '<li><div class="channel offline">' + inner + '<span class="channel__go">OFFLINE</span></div></li>';
    }).join("");
  }

  function initTerminal() {
    var out = $("#termOut"), input = $("#termInput"), history = [], hi = 0;
    function print(html, cls) { out.appendChild(el("p", { class: cls || "", html: html })); out.scrollTop = out.scrollHeight; }
    var sections = { identity: "identity", log: "log", about: "log", arsenal: "arsenal", skills: "arsenal", archives: "archives", projects: "archives", transmit: "transmission", contact: "transmission" };
    var cmds = {
      help: function () {
        print('<span class="hl">available commands</span>\n  whoami        survivor identity\n  log           personal records\n  skills        list the arsenal\n  projects      list project records\n  open &lt;n&gt;      open project dossier n\n  contact       transmission channels\n  email         copy email address\n  goto &lt;where&gt;   jump: identity | log | arsenal | archives | transmit\n  date          current timestamp\n  clear         wipe the screen');
      },
      whoami: function () { var s = A.survivor; print('<span class="hl">' + esc(s.name) + "</span> (@" + esc(s.callsign) + ")\n" + esc(s.roles.join(" / ")) + "\n" + esc(s.intro)); },
      log: function () { print(A.log.map(function (e) { return (e.lines ? "  [ok]  " : '  <span class="err">[!!]</span>  ') + esc(e.title); }).join("\n")); },
      skills: function () { print(A.skills.map(function (c) { return '<span class="hl">' + esc(c.category) + "</span>  " + c.items.map(function (t) { return esc(t.name); }).join(" · "); }).join("\n")); },
      projects: function () { print(allProjects().map(function (p, i) { return "  [" + (i + 1) + "] " + esc(p.name) + "  <span style=\"color:var(--dim)\">" + esc((p.tech || []).slice(0, 3).join(", ")) + "</span>"; }).join("\n") + "\nuse <span class=\"hl\">open &lt;n&gt;</span> for the dossier."); },
      open: function (a) { var n = parseInt(a, 10); if (!n || !allProjects()[n - 1]) return print("usage: open &lt;1-" + allProjects().length + "&gt;", "err"); print("decrypting dossier " + n + " …"); openDossier(n - 1); },
      contact: function () { print(channelList().map(function (c) { return "  " + c.key.padEnd(9) + (c.url ? '<a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.label) + "</a>" : '<span class="err">offline</span>'); }).join("\n")); },
      email: function () {
        var e = A.contact.email; if (!e) return print("no email channel configured", "err");
        if (navigator.clipboard) navigator.clipboard.writeText(e).then(function () { print("copied <span class=\"hl\">" + esc(e) + "</span> to clipboard."); }, function () { print(esc(e)); });
        else print(esc(e));
      },
      goto: function (a) { var id = sections[(a || "").toLowerCase()]; if (!id) return print("unknown sector. try: identity, log, arsenal, archives, transmit", "err"); print("routing to /" + id + " …"); document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); },
      date: function () { print(new Date().toString()); },
      clear: function () { out.innerHTML = ""; },
      sudo: function () { print("permission denied: there is no root left. only survivors.", "err"); },
      doomsday: function () { print("it already happened. you're reading what was saved.", "hl"); },
      ls: function () { print("identity/  log/  arsenal/  archives/  transmission/"); },
    };
    cmds.about = cmds.log; cmds.cd = cmds.goto;

    print('<span class="hl">LAST ARCHIVE SHELL</span> — uplink secured. type <span class="hl">help</span> to begin.');
    $("#termForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var raw = input.value.trim(); input.value = "";
      if (!raw) return;
      history.push(raw); hi = history.length;
      print(esc(raw), "cmd");
      var parts = raw.split(/\s+/), fn = cmds[parts[0].toLowerCase()];
      if (fn) fn(parts.slice(1).join(" ")); else print("command not found: " + esc(parts[0]) + " — type help", "err");
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp" && hi > 0) { hi--; input.value = history[hi]; e.preventDefault(); }
      else if (e.key === "ArrowDown") { hi = Math.min(history.length, hi + 1); input.value = history[hi] || ""; e.preventDefault(); }
    });
  }

  /* ---------------- NAV / HUD ---------------- */
  function initNav() {
    var nav = $("#nav"), btn = $("#menuBtn");
    function setOpen(o) { nav.classList.toggle("open", o); btn.setAttribute("aria-expanded", o ? "true" : "false"); }
    btn.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

    var links = nav.querySelectorAll("a");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section").forEach(function (s) { io.observe(s); });
  }

  function initCountdown() {
    var c = $("#countdown");
    function tick() {
      var now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
      var s = Math.floor((end - now) / 1000);
      c.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (n) { return String(n).padStart(2, "0"); }).join(":");
    }
    tick(); setInterval(tick, 1000);
  }

  var revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      if (en.target.classList.contains("crate")) chargeSignals(en.target);
      revealObserver.unobserve(en.target);
    });
  }, { threshold: 0.12 }) : null;
  function observe(nodes) {
    Array.prototype.forEach.call(nodes, function (n) {
      if (revealObserver) revealObserver.observe(n);
      else { n.classList.add("in"); chargeSignals(n); }
    });
  }

  /* ---------------- INIT ---------------- */
  $("#year").textContent = new Date().getFullYear();
  renderIdentity();
  renderStats();
  renderLog();
  renderArsenal();
  renderProjects();
  renderChannels();
  initDossier();
  initTerminal();
  initNav();
  initCountdown();
  boot(function () {
    observe(document.querySelectorAll(".reveal:not(.in)"));
    recoverFromGitHub();
  });
})();
