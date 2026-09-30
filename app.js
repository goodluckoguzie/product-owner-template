const REPEATS = {
  solutions: ["name", "url", "source", "users", "features", "price", "strength", "weakness"],
  features: ["name", "count", "meaning"],
  cohorts: ["name", "rank", "because"],
  team: ["person", "role", "duty"],
  stories: ["epic", "who", "want", "why", "accept", "test"],
  risks: ["name", "chance", "impact", "response"],
  decisions: ["title", "decision", "reason"],
};

const LONG = new Set(["features", "strength", "weakness", "meaning", "accept", "test", "response", "duty", "decision", "reason"]);

const ORDER = ["start", "questions", "research", "swot", "risks", "approach", "value", "agreement", "backlog", "sprint", "constraints", "memory"];

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
  risks: [blank("risks")],
  decisions: [blank("decisions")],
});

const INDEX = "po-brief-index-v1";
const CURRENT = "po-brief-current-v1";

function blank(name) {
  return Object.fromEntries(REPEATS[name].map((key) => [key, ""]));
}

function newId() {
  return Date.now().toString(36);
}

function readIndex() {
  try {
    return JSON.parse(localStorage.getItem(INDEX) || "[]");
  } catch (error) {
    return [];
  }
}

function normalize(saved) {
  const next = { ...EMPTY(), ...(saved || {}) };
  next.stories = (next.stories || [blank("stories")]).map((row) => ({
    epic: row.epic || "",
    who: row.who || "",
    want: row.want || row.story || "",
    why: row.why || "",
    accept: row.accept || "",
    test: row.test || "",
  }));
  if (!next.risks || !next.risks.length) next.risks = [blank("risks")];
  if (!next._id) next._id = newId();
  return next;
}

function load() {
  try {
    let id = localStorage.getItem(CURRENT);
    if (!id) {
      const old = JSON.parse(localStorage.getItem("product-owner-template-v1") || "null");
      const first = normalize(old || {});
      id = first._id;
      localStorage.setItem(CURRENT, id);
      localStorage.setItem(`po-brief-${id}`, JSON.stringify(first));
      return first;
    }
    return normalize(JSON.parse(localStorage.getItem(`po-brief-${id}`) || "null"));
  } catch (error) {
    return normalize({});
  }
}

let state = load();

function field(name, label, placeholder, tall) {
  const el = document.createElement("label");
  el.append(document.createTextNode(label));
  const input = document.createElement(tall ? "textarea" : "input");
  if (tall) input.className = tall === "tall" ? "tall" : "";
  if (placeholder) input.placeholder = placeholder;
  input.value = state[name] || "";
  input.addEventListener("input", () => {
    state[name] = input.value;
    persist();
  });
  el.append(input);
  return el;
}

function persist() {
  if (!state._id) state._id = newId();
  localStorage.setItem(CURRENT, state._id);
  localStorage.setItem(`po-brief-${state._id}`, JSON.stringify(state));
  const index = readIndex().filter((item) => item.id !== state._id);
  index.unshift({ id: state._id, name: (state.productName || "").trim() || "Untitled brief" });
  localStorage.setItem(INDEX, JSON.stringify(index.slice(0, 20)));
  const saved = document.getElementById("saved");
  if (saved) saved.textContent = "Saved on this browser";
  paintBriefs();
  paintProgress();
}

function paintProgress() {
  ORDER.forEach((id) => {
    const link = document.querySelector(`nav a[href="#${id}"]`);
    const node = document.getElementById(id);
    if (!link || !node) return;
    const started = [...node.querySelectorAll("input, textarea")].some((el) => el.value.trim());
    link.classList.toggle("done", started);
  });
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
  source: "Where you saw it",
  users: "Who it is for",
  features: "Features, in plain words",
  price: "Price",
  strength: "What it does well",
  weakness: "Where it fails",
  count: "How many products have it",
  meaning: "What this feature actually means",
  rank: "Rank",
  because: "Why they matter",
  why: "So that",
  person: "Person",
  role: "Role",
  duty: "What they own",
  epic: "Epic",
  who: "As a",
  want: "I want",
  why: "So that",
  accept: "How we will know it worked",
  test: "Test",
  chance: "How likely",
  impact: "How bad",
  response: "What you will do",
  title: "Title",
  decision: "Decision",
  reason: "Reason",
};

const PLACEHOLDERS = {
  who: "a learner driver",
  want: "to book a lesson near my work",
  why: "I can practise without crossing the city",
  accept: "They can finish it on a phone, without help",
  test: "Open the page, do the step, see the result",
  chance: "low, possible, or likely",
  impact: "annoying, or it stops the release",
  source: "App store, their site, or a review",
  count: "3",
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
      const box = LONG.has(key) ? document.createElement("textarea") : document.createElement("input");
      if (PLACEHOLDERS[key]) box.placeholder = PLACEHOLDERS[key];
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
      ["productName", "Product name", "City lessons"],
      ["definition", "In one sentence", "A booking page for learner drivers so they can find a local instructor", "tall"],
      ["owner", "Product owner", "Your name"],
      ["date", "Date", "30 Sep 2026"],
    ]],
    ["question-fields", [
      ["problem", "What problem are you solving?", "Evening workers cannot find a lesson that fits a shift", "tall"],
      ["user", "Who is the user?", "One person. A learner driver who works evenings."],
      ["outcome", "What is the main outcome?", "They book one lesson without calling three schools."],
      ["mvp", "What is the MVP?", "Search, see who is free, and send a request", "tall"],
      ["outOfScope", "What is not in the first version?", "Payments, a mobile app, and reviews", "tall"],
    ]],
    ["swot-fields", [
      ["swotS", "Strengths of the products you found", "They already take payment and show a map"],
      ["swotW", "Weaknesses", "None of them show evening availability"],
      ["swotO", "Opportunities", "Only gaps you saw in the research"],
      ["swotT", "Threats", "Leave this until you have a product"],
    ]],
    ["approach-fields", [
      ["buildWhy", "Why this product fits that choice", "The need will change once learners try the first page", "tall"],
      ["archConstraints", "What must the build keep?", "A phone browser. Do not rewrite a stack you already have.", "tall"],
    ]],
    ["value-lead", [
      ["topUser", "The first person you will serve", "The learner, not the driving school"],
      ["dayInLife", "Walk through their day", "They finish a shift, open the phone, and need a slot this week", "tall"],
    ]],
    ["customer-fields", [
      ["jobs", "Jobs they are trying to get done", "Pass the test without missing work"],
      ["pains", "Pains", "Calls go unanswered. The nearest instructor is full."],
      ["gains", "Gains they want", "A yes or a no the same day"],
    ]],
    ["offer-fields", [
      ["offer", "What the product offers", "A list of instructors free after 6pm"],
      ["relievers", "Which pains it relieves", "They stop calling schools that are already full"],
      ["creators", "Which gains it creates", "They leave with a booked hour"],
    ]],
    ["agreement-fields", [
      ["tools", "Tools", "Where you talk, where the code lives, where the backlog lives"],
      ["culture", "How you will behave", "Ask for help the same day. Say when you are stuck.", "tall"],
      ["meetings", "Meetings", "A short daily look at blockers. A review where work is shown."],
      ["vcRules", "Version control", "Small changes. Someone else looks before it lands."],
    ]],
    ["sprint-fields", [
      ["sprintGoal", "Sprint goal", "A learner can send one booking request", "tall"],
      ["sprintLength", "Length", "One or two weeks"],
      ["sprintIn", "In this sprint", "The search and the request. Nothing else."],
      ["sprintOut", "Left out on purpose", "Payment and reviews"],
      ["demo", "What will be shown at the review", "A phone, a search, and a request that arrives"],
      ["retro", "What you will ask in the retrospective", "What slowed the story down?"],
    ]],
    ["constraint-fields", [
      ["designLook", "Look and feel", "Calm and plain. One primary button.", "tall"],
      ["designType", "Type", "A readable sans on a light page"],
      ["designColors", "Colours", "One dark green, one paper background"],
      ["rules", "Extra build rules", "One story at a time. Nothing from the out-of-scope list.", "tall"],
      ["security", "Who can see what", "A learner sees their own request. An instructor sees their own diary."],
      ["testPlan", "What does working mean?", "Search, request, refresh, and the request is still there. A wrong time shows an error.", "tall"],
    ]],
    ["memory-fields", [
      ["memoryStatus", "Status", "Research done. First story not started."],
      ["memoryDone", "Done", "Three existing products compared"],
      ["memoryNow", "Now", "Write the first story"],
      ["memoryIssues", "Known issues", "None yet"],
      ["memoryNext", "Next", "Accept or reject the first story"],
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

function paintBriefs() {
  const select = document.getElementById("briefs");
  if (!select) return;
  const index = readIndex();
  const current = index.find((item) => item.id === state._id);
  if (!current) index.unshift({ id: state._id, name: (state.productName || "").trim() || "Untitled brief" });
  select.innerHTML = "";
  index.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.append(option);
  });
  select.value = state._id;
}

function showStage(id) {
  const stage = ORDER.includes(id) ? id : ORDER[0];
  document.querySelectorAll("main > section").forEach((section) => {
    section.classList.toggle("on", section.id === stage);
  });
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${stage}`);
  });
  const index = ORDER.indexOf(stage);
  document.getElementById("back").disabled = index === 0;
  document.getElementById("next").textContent = index === ORDER.length - 1 ? "Download" : "Next";
  document.querySelector(".progress").textContent = `Step ${index + 1} of ${ORDER.length}`;
  if (location.hash !== `#${stage}`) history.replaceState(null, "", `#${stage}`);
}

function resetAll() {
  if (!window.confirm("Clear this brief? Other briefs on this browser stay.")) return;
  const id = state._id;
  state = normalize({ _id: id });
  persist();
  window.location.reload();
}

function startBlank() {
  persist();
  const fresh = normalize({});
  localStorage.setItem(CURRENT, fresh._id);
  localStorage.setItem(`po-brief-${fresh._id}`, JSON.stringify(fresh));
  window.location.hash = "#start";
  window.location.reload();
}

mountFields();
bindRepeats();
document.getElementById("download").addEventListener("click", downloadPack);
document.getElementById("reset").addEventListener("click", resetAll);
document.getElementById("new-brief").addEventListener("click", startBlank);
document.getElementById("briefs").addEventListener("change", (event) => {
  persist();
  localStorage.setItem(CURRENT, event.target.value);
  window.location.reload();
});
document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showStage(link.getAttribute("href").slice(1));
  });
});
document.getElementById("back").addEventListener("click", () => {
  const index = Math.max(0, ORDER.indexOf(location.hash.slice(1)) - 1);
  showStage(ORDER[index]);
});
document.getElementById("next").addEventListener("click", () => {
  const index = ORDER.indexOf(location.hash.slice(1));
  if (index >= ORDER.length - 1) downloadPack();
  else showStage(ORDER[index + 1] || ORDER[0]);
});
paintBriefs();
paintProgress();
showStage(location.hash.slice(1));
