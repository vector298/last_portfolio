/*
 * THE LAST PORTFOLIO — ARCHIVE DATA
 * ---------------------------------------------------------------
 * Every piece of personal content on the site lives in this file.
 * Edit it and the whole archive updates; no other file needs touching.
 *
 * Any field set to `null` is rendered as a REDACTED / DATA PENDING
 * block, so the site never shows a broken or empty section. Replace
 * the nulls with your own details before submitting.
 */
window.ARCHIVE = {
  survivor: {
    name: "Ishaan Roy",
    callsign: "vector298",
    // Cycled by the typewriter in the hero.
    roles: ["Developer", "Builder of web things", "Student of the craft"],
    intro:
      "I build things for the web and learn by shipping them. This archive is my record: " +
      "who I am, the tools I carry, and the work I made before the lights went out.",
    location: null, // e.g. "Kolkata, India"
    interests: ["Web development", "Interface design", "Open source", "Creative coding"],
    status: "Open to collaborations & internships",
  },

  // The Survivor's Log. Each entry becomes a tab in the log terminal.
  // `lines` may be null (renders as redacted) or an array of strings.
  log: [
    {
      id: "ORIGIN",
      title: "Origin story",
      lines: [
        "Started writing code because I wanted to know how the things on my screen actually worked.",
        "Opened my GitHub account in December 2024 and have been pushing commits into the void ever since.",
        "Learned that the fastest way to understand something is to build a small, broken version of it — then fix it.",
      ],
    },
    { id: "EDUCATION", title: "Education", lines: null }, // e.g. ["B.Tech CSE — XYZ University (2024–2028)"]
    {
      id: "INTERESTS",
      title: "Technical interests",
      lines: [
        "Frontend engineering and interfaces that feel alive.",
        "Developer tooling and automating the boring parts.",
        "How the web works under the hood: browsers, networks, deployment.",
      ],
    },
    { id: "ACHIEVEMENTS", title: "Achievements", lines: null }, // hackathons, ranks, certificates
    { id: "COMMUNITIES", title: "Clubs & communities", lines: null }, // tech clubs, societies
    { id: "OFF-GRID", title: "Hobbies", lines: null }, // what you do when the terminal is closed
    {
      id: "OBJECTIVES",
      title: "Goals",
      lines: [
        "Ship projects people actually use.",
        "Contribute to open source and learn from bigger codebases.",
        "Get good enough at the fundamentals that new tools feel easy.",
      ],
    },
  ],

  // The Arsenal. level: 0–100 (signal strength), status: "operational" | "calibrating" (learning)
  // Only list what you genuinely know.
  skills: [
    {
      category: "Languages",
      code: "LNG",
      items: [
        { name: "JavaScript", level: 70, status: "operational" },
        { name: "HTML", level: 80, status: "operational" },
        { name: "CSS", level: 75, status: "operational" },
      ],
    },
    {
      category: "Frontend",
      code: "FRT",
      items: [
        { name: "Responsive layout", level: 70, status: "operational" },
        { name: "DOM & Web APIs", level: 65, status: "operational" },
        { name: "CSS animation", level: 60, status: "calibrating" },
      ],
    },
    {
      category: "Tools",
      code: "TLS",
      items: [
        { name: "Git", level: 70, status: "operational" },
        { name: "GitHub", level: 75, status: "operational" },
        { name: "GitHub Actions", level: 45, status: "calibrating" },
        { name: "VS Code", level: 80, status: "operational" },
      ],
    },
    {
      category: "Deployment",
      code: "DPL",
      items: [{ name: "GitHub Pages", level: 65, status: "operational" }],
    },
  ],

  // The Archives. Curated project records, shown first.
  // Your public GitHub repositories are also recovered live and appended
  // after these (set github.autoRecover = false to disable).
  projects: [
    {
      name: "The Last Portfolio",
      codename: "PRJ-000",
      summary:
        "This archive. A Doomsday-themed personal portfolio built as a survivor's terminal: boot sequence, " +
        "HUD navigation, a skill arsenal, live-recovered GitHub projects and a working command line.",
      details: [
        "Zero-dependency HTML, CSS and vanilla JavaScript — no framework, no build step.",
        "All content is data-driven from a single file, so the archive can be updated in seconds.",
        "Pulls public repositories from the GitHub API at runtime and renders each as a project record with a generated visual.",
        "Fully responsive, keyboard navigable and respects reduced-motion preferences.",
        "Deployed automatically to GitHub Pages through a GitHub Actions workflow.",
      ],
      tech: ["HTML", "CSS", "JavaScript", "GitHub API", "GitHub Actions"],
      image: "assets/project-last-portfolio.svg",
      repo: "https://github.com/vector298/last_portfolio",
      live: "https://vector298.github.io/last_portfolio/",
      status: "ONLINE",
    },
    /* Template for another curated project:
    {
      name: "Project name",
      codename: "PRJ-001",
      summary: "One or two sentences on what it does and who it's for.",
      details: ["What problem it solves", "Interesting technical decision", "What you learned"],
      tech: ["React", "Node.js"],
      image: "assets/your-screenshot.png",
      repo: "https://github.com/vector298/your-repo",
      live: null,
      status: "ONLINE",
    },
    */
  ],

  github: {
    user: "vector298",
    autoRecover: true,
    exclude: ["last_portfolio", "vector298"], // repo names to skip in the live feed
    max: 6,
  },

  contact: {
    email: "ishaandasroy4000@gmail.com",
    github: "https://github.com/vector298",
    linkedin: null, // e.g. "https://www.linkedin.com/in/your-handle"
    other: [], // e.g. [{ label: "X / Twitter", url: "https://x.com/you" }]
  },
};
