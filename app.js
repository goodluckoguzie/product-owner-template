const REPEATS = {
  solutions: ["name", "url", "users", "features", "price", "strength", "weakness"],
  features: ["name", "count", "meaning"],
  cohorts: ["name", "rank", "why"],
  team: ["person", "role", "duty"],
  stories: ["epic", "story", "accept", "tasks", "test"],
  decisions: ["title", "decision", "reason"],
};

const EMPTY = () => ({
  productName: "",
  definition: "",
  owner: "",
  date: "",
  problem: "",
  user: "",
  outcome: "",
  mvp: "",
  outOfScope: "",
  swotS: "",
  swotW: "",
  swotO: "",
  swotT: "",
  buildChoice: "",
  buildWhy: "",
  archConstraints: "",
  topUser: "",
  dayInLife: "",
  jobs: "",
  pains: "",
  gains: "",
  offer: "",
  relievers: "",
  creators: "",
  tools: "",
  culture: "",
  meetings: "",
  vcRules: "",
  sprintGoal: "",
  sprintLength: "",
  sprintIn: "",
  sprintOut: "",
  demo: "",
  retro: "",
  designLook: "",
  designType: "",
  designColors: "",
  rules: "",
  security: "",
  testPlan: "",
  memoryStatus: "",
  memoryDone: "",
  memoryNow: "",
  memoryIssues: "",
  memoryNext: "",
  solutions: [blank("solutions")],
  features: [blank("features")],
  cohorts: [blank("cohorts")],
  team: [blank("team")],
  stories: [blank("stories")],
  decisions: [blank("decisions")],
});

const KEY = "product-owner-template-v1";

function blank(name) {
  return Object.fromEntries(REPEATS[name].map((key) => [key, ""]));
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    return saved ? { ...EMPTY(), ...saved } : EMPTY();
  } catch (error) {
    return EMPTY();
  }
}

let state = load();

function field(name, label, hint, multiline) {
  const el = document.createElement("label");
  el.innerHTML = `${label}${hint ? `<span class="hint">${hint}</span>` : ""}`;
  const input = document.createElement(multiline ? "textarea" : "input");
  input.value = state[name] || "";
  input.addEventListener("input", () => {
    state[name] = input.value;
    persist();
  });
  el.append(input);
  return el;
}

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state));
  paintProgress();
}

function paintProgress() {
  const ids = ["start", "questions", "research", "swot", "approach", "value", "agreement", "backlog", "sprint", "constraints"];
  const started = ids.filter((id) => {
    const node = document.getElementById(id);
    if (!node) return false;
    return [...node.querySelectorAll("input, textarea, select")].some((el) => el.value.trim());
  }).length;
  const progress = document.querySelector(".progress");
  if (progress) progress.textContent = `${started} of ${ids.length} stages started`;
  const gaps = pack.researchGaps(state);
  const warn = document.querySelector(".warn");
  if (warn) {
    warn.hidden = gaps.length === 0;
    warn.textContent = gaps.length ? `Still open: ${gaps.join(" ")}` : "";
  }
}

const LABELS = {
  name: "Name",
  url: "Link",
  users: "Who it is for",
  features: "Features, in plain words",
  price: "Price",
  strength: "What it does well",
  weakness: "Where it fails",
  count: "How many products have it",
  meaning: "What this feature actually means",
  rank: "Rank",
  why: "Why they matter",
  person: "Person",
  role: "Role",
  duty: "What they own",
  epic: "Epic",
  story: "Story",
  accept: "Acceptance",
  tasks: "Tasks",
  test: "Test",
  title: "Title",
  decision: "Decision",
  reason: "Reason",
};

function drawRepeat(name) {
  const host = document.querySelector(`[data-repeat="${name}"]`);
  const rows = host.querySelector("[data-rows]");
  rows.innerHTML = "";
  state[name].forEach((row, index) => {
    const card = document.createElement("div");
    card.className = "card";
    REPEATS[name].forEach((key) => {
      const label = document.createElement("label");
      label.textContent = LABELS[key] || key;
      const box = key === "features" || key === "story" || key === "accept" || key === "tasks" || key === "reason" || key === "duty"
        ? document.createElement("textarea")
        : document.createElement("input");
      box.value = row[key] || "";
      box.addEventListener("input", () => {
        state[name][index][key] = box.value;
        persist();
      });
      label.append(box);
      card.append(label);
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "quiet";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      state[name].splice(index, 1);
      if (!state[name].length) state[name].push(blank(name));
      persist();
      drawRepeat(name);
    });
    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.append(remove);
    card.append(actions);
    rows.append(card);
  });
}

function bindRepeats() {
  document.querySelectorAll("[data-repeat]").forEach((host) => {
    const name = host.dataset.repeat;
    host.querySelector("[data-add]").addEventListener("click", () => {
      state[name].push(blank(name));
      persist();
      drawRepeat(name);
    });
    drawRepeat(name);
  });
}

function mountFields() {
  const mounts = [
    ["start-fields", [
      ["productName", "Product name", ""],
      ["definition", "In one sentence", "A … for … so they can …", true],
      ["owner", "Product owner", ""],
      ["date", "Date", ""],
    ]],
    ["question-fields", [
      ["problem", "What problem are you solving?", "", true],
      ["user", "Who is the user?", "One person, not everyone.", true],
      ["outcome", "What is the main outcome?", "", true],
      ["mvp", "What is the MVP?", "The smallest version that delivers the outcome.", true],
      ["outOfScope", "What is not in the first version?", "Write this. It stops the product growing in every direction.", true],
    ]],
    ["swot-fields", [
      ["swotS", "Strengths of the products you found", "", true],
      ["swotW", "Weaknesses", "", true],
      ["swotO", "Opportunities", "Only gaps you saw in the research.", true],
      ["swotT", "Threats", "Leave this until you have a product.", true],
    ]],
    ["approach-fields", [
      ["buildWhy", "Why this product fits that choice", "", true],
      ["archConstraints", "What must the build keep?", "Phone, browser, an existing stack, a deadline, a budget.", true],
    ]],
    ["value-fields", [
      ["topUser", "The first person you will serve", "", true],
      ["dayInLife", "Walk through their day", "Morning, the hard moment, the end of the task.", true],
      ["jobs", "Jobs they are trying to get done", "", true],
      ["pains", "Pains", "", true],
      ["gains", "Gains they want", "", true],
      ["offer", "What the product offers", "", true],
      ["relievers", "Which pains it relieves", "", true],
      ["creators", "Which gains it creates", "", true],
    ]],
    ["agreement-fields", [
      ["tools", "Tools", "Where you talk, where the code lives, where the backlog lives.", true],
      ["culture", "How you will behave", "Ask for help. Say when you are stuck. Disagree in the open.", true],
      ["meetings", "Meetings", "", true],
      ["vcRules", "Version control", "Small changes. Someone else looks before it lands.", true],
    ]],
    ["sprint-fields", [
      ["sprintGoal", "Sprint goal", "One sentence a person could demo.", true],
      ["sprintLength", "Length", "One or two weeks."],
      ["sprintIn", "In this sprint", "", true],
      ["sprintOut", "Left out on purpose", "", true],
      ["demo", "What will be shown at the review", "", true],
      ["retro", "What you will ask in the retrospective", "", true],
    ]],
    ["constraint-fields", [
      ["designLook", "Look and feel", "Calm, loud, dense, playful. Pick one and stay with it.", true],
      ["designType", "Type", ""],
      ["designColors", "Colours", ""],
      ["rules", "Extra build rules", "", true],
      ["security", "Who can see what", "", true],
      ["testPlan", "What does working mean?", "Write the steps a person takes, including the failure cases.", true],
    ]],
    ["memory-fields", [
      ["memoryStatus", "Status", "", true],
      ["memoryDone", "Done", "", true],
      ["memoryNow", "Now", "", true],
      ["memoryIssues", "Known issues", "", true],
      ["memoryNext", "Next", "", true],
    ]],
  ];
  mounts.forEach(([id, specs]) => {
    const host = document.getElementById(id);
    specs.forEach((spec) => host.append(field(...spec)));
  });
  const select = document.getElementById("buildChoice");
  pack.BUILD_CHOICES.forEach(([id, label]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    select.append(option);
  });
  select.value = state.buildChoice || "";
  select.addEventListener("change", () => {
    state.buildChoice = select.value;
    persist();
  });
}

function downloadPack() {
  const gaps = pack.researchGaps(state);
  if (gaps.length && !window.confirm(`${gaps.join("\n")}\n\nDownload anyway?`)) return;
  const files = pack.filesFromState(state).map(([name, text]) => ({ name: `docs/${name}`, text }));
  const zip = pack.zipStore(files);
  const blob = new Blob([zip], { type: "application/zip" });
  const link = document.createElement("a");
  const slug = (state.productName || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
  link.href = URL.createObjectURL(blob);
  link.download = `${slug}-product-owner-pack.zip`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function resetAll() {
  if (!window.confirm("Clear this brief on this browser?")) return;
  state = EMPTY();
  localStorage.removeItem(KEY);
  window.location.reload();
}

function markNav() {
  const links = [...document.querySelectorAll("nav a")];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-40% 0px -50% 0px" });
  document.querySelectorAll("main section").forEach((section) => observer.observe(section));
}

mountFields();
bindRepeats();
document.getElementById("download").addEventListener("click", downloadPack);
document.getElementById("reset").addEventListener("click", resetAll);
paintProgress();
markNav();
