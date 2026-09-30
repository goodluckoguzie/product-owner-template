/**
 * Product Owner pack.
 * Turns the filled brief into the markdown files a new project starts from.
 * Research is not optional: it is its own file, written before the backlog.
 */

const BUILD_CHOICES = [
  ["waterfall", "Waterfall or incremental", "Requirements are clear, stable, and the technology is already known."],
  ["prototype", "Prototype, then write the scope", "People need to use a slice before they can say what they want. Stop the prototype before it becomes the product."],
  ["rad", "Rapid first release", "A thin release, with the customer close. Do not let the screen hide a weak core."],
  ["spiral", "Spiral", "The work is large and risky, so each round revisits the risk before more is built."],
  ["scrum", "Agile Scrum", "A small team can ship often, and the needs will change. The product owner orders the backlog and accepts the stories."],
  ["lean", "Lean: build, measure, learn", "You still need to learn whether anyone wants this. Build the smallest slice, measure, then decide."],
];

function lines(value) {
  const text = String(value || "").trim();
  return text ? text : "_Not filled in yet._";
}

function list(items, render) {
  const rows = (items || []).filter((row) => render(row).replace(/[_|\s-]/g, "") !== "");
  if (!rows.length) return "_None added yet._\n";
  return rows.map((row, i) => render(row, i)).join("\n");
}

function choiceLabel(id) {
  const found = BUILD_CHOICES.find((item) => item[0] === id);
  if (!found) return "_Not chosen yet._";
  return `${found[1]}. ${found[2]}`;
}

function storyLine(row) {
  if ((row.who || "").trim() || (row.want || "").trim() || (row.why || "").trim()) {
    return `As a ${row.who || "…"}, I want ${row.want || "…"}, so that ${row.why || "…"}.`;
  }
  return (row.story || "").trim();
}

function prd(state) {
  return `# Product requirements

## Product
${lines(state.productName)}

## In one sentence
${lines(state.definition)}

## Product owner
${lines(state.owner)}

## Date
${lines(state.date)}

## Problem
${lines(state.problem)}

## Who it is for
${lines(state.user)}

## Outcome
${lines(state.outcome)}

## MVP
What the first version must do, and nothing more.

${lines(state.mvp)}

## Out of scope
This is part of the product decision. If it is not listed here, it waits.

${lines(state.outOfScope)}

## Success
A story is accepted only when the person in "Who it is for" can finish the outcome above without help, on the real device or the real page.
`;
}

function research(state) {
  const solutions = list(state.solutions, (row) => {
    return `### ${row.name || "Unnamed solution"}
- Link: ${row.url || "_none_"}
- Where you saw it: ${row.source || "_none_"}
- Who it is for: ${row.users || "_none_"}
- Features: ${row.features || "_none_"}
- Price: ${row.price || "_none_"}
- What it does well: ${row.strength || "_none_"}
- Where it fails: ${row.weakness || "_none_"}
`;
  });
  const features = list(state.features, (row) => {
    return `- **${row.name || "Unnamed feature"}** — seen ${row.count || "?"} time(s). ${row.meaning || ""}`;
  });
  return `# Research existing solutions

Do this before the backlog. Do not invent features from a blank page.

1. Search app stores, news, and websites. Do not stop at your own city.
2. Write each product's features in plain words.
3. Merge them. Count how often each feature appears.
4. If a name is vague, write one sentence so the team means the same thing.
5. Then fill the SWOT file. Threats can wait until you have a product of your own.

## Solutions
${solutions}

## Features across those solutions
${features}
`;
}

function swot(state) {
  return `# SWOT of what already exists

This is about the products you found, not about a product you have not built yet.

## Strengths
What the current products already do well.

${lines(state.swotS)}

## Weaknesses
Where those products fail the person you want to serve.

${lines(state.swotW)}

## Opportunities
The gap you could own. Only gaps you saw in the research belong here.

${lines(state.swotO)}

## Threats
Leave this until you have a product worth defending.

${lines(state.swotT)}
`;
}

function approach(state) {
  return `# How this product will be built

Pick from the evidence, not from habit.

- Waterfall or incremental: the requirements are clear and will stay still, and the technology is known.
- Prototype: people need to use a slice before they can describe what they want. Write the real scope before the prototype keeps growing.
- Rapid application development: a thin first release, with the customer close. Do not let the screen hide a weak core.
- Spiral: the work is large and risky, so each round revisits the risk.
- Agile Scrum: a small team can ship often, and the needs will change. The product owner orders the backlog and accepts stories.
- Lean: you still need to learn if anyone wants this. Build, measure, learn, then decide.

## Choice
${choiceLabel(state.buildChoice)}

## Why this product fits that choice
${lines(state.buildWhy)}

## Stack
Keep the stack you already have unless the research shows it cannot do the job. A guide's example stack is not a reason to rewrite.

${lines(state.archConstraints)}
`;
}

function value(state) {
  const cohorts = list(state.cohorts, (row) => {
    return `- **${row.rank || "?"}.** ${row.name || "Unnamed"} — ${row.because || row.why || "_why they matter_"}`;
  });
  return `# Users and value

Rank the people who use it, or who gain when someone else uses it. Start with the person who will try it first or who gains the most. Walk through their day before you name features.

## People
${cohorts}

## First person
${lines(state.topUser)}

## A day in their life
${lines(state.dayInLife)}

## Jobs they are trying to get done
${lines(state.jobs)}

## Pains
${lines(state.pains)}

## Gains they want
${lines(state.gains)}

## What the product offers
${lines(state.offer)}

## Which pains it relieves
${lines(state.relievers)}

## Which gains it creates
${lines(state.creators)}
`;
}

function agreement(state) {
  const team = list(state.team, (row) => {
    return `- **${row.person || "Name"}** — ${row.role || "role"}. ${row.duty || ""}`;
  });
  return `# Working agreement

Everyone can propose a change. Keep one copy. Update it when the team learns something.

The product owner orders the work and accepts a story when the acceptance criteria are true. The person who facilitates the meetings does not overrule that.

## People
${team}

## Tools
${lines(state.tools)}

## How we behave
${lines(state.culture)}

## Meetings
Planning, a short daily look at blockers, a review where work is shown, and a retrospective.

${lines(state.meetings)}

## Version control
${lines(state.vcRules)}

## Definition of done
A story is done when all of these are true:

- The acceptance criteria are met
- It has been tried on the real device or the real page, not only on the author's machine
- Someone else has looked at it
- The tests that protect it pass
- Memory, tasks, and decisions are updated
- The product owner accepts it
`;
}

function risks(state) {
  const rows = list(state.risks, (row) => {
    return `### ${row.name || "Unnamed risk"}
- How likely: ${row.chance || "_none_"}
- How bad: ${row.impact || "_none_"}
- What you will do: ${row.response || "_none_"}
`;
  });
  return `# Risks

A risk is something that could stop the outcome. Write the response now, not after it happens.

${rows}
`;
}

function backlog(state) {
  const stories = list(state.stories, (row, i) => {
    const line = storyLine(row) || "_As a … I want … so that …_";
    return `### Story ${i + 1}
${line}

Epic: ${row.epic || "_none_"}

Acceptance:
${row.accept || "_none_"}

Test:
${row.test || "_none_"}
`;
  });
  return `# Backlog

Write this only after research, SWOT, and the value proposition. One story is a thin slice a person can finish. Do not put the whole product in one story.

## Stories
${stories}
`;
}

function sprint(state) {
  return `# Sprint

## Goal
${lines(state.sprintGoal)}

## Length
${lines(state.sprintLength)}

## In this sprint
${lines(state.sprintIn)}

## Not in this sprint
${lines(state.sprintOut)}

## Review
What was shown, and what the product owner accepted.

${lines(state.demo)}

## Retrospective
What the team will change next time.

${lines(state.retro)}
`;
}

function design(state) {
  return `# Design

## Look and feel
${lines(state.designLook)}

## Type and colour
${lines(state.designType)}

${lines(state.designColors)}

## Rules for every screen
- Say what the screen is for in the first line
- Show an empty state, a waiting state, and an error state
- Work on a phone
- Use the same buttons, spacing, and words on every page
`;
}

function rules(state) {
  return `# Rules for building

Read the product files before changing the product.

- Build one story at a time
- Do not add anything listed as out of scope
- Do not rewrite the stack unless a decision says so
- Reuse what is already there
- Do not change files that the story does not need
- When something breaks, find the cause before editing
- Update memory and tasks when the story is accepted

## Extra rules for this product
${lines(state.rules)}
`;
}

function security(state) {
  return `# Security

## Secrets
Real keys stay out of the repository. Commit an example file with empty values.

## Who can see what
${lines(state.security)}

## Checks before a release
- Private pages ask who you are
- A person only sees what they own
- Input is checked
- No secrets in the client
`;
}

function testPlan(state) {
  return `# Test plan

Working means the person can finish the outcome in the product file, on the real device or the real page.

${lines(state.testPlan)}

## For every story
- The acceptance lines pass
- The empty, waiting, and error states have been seen
- A cheat, a mistake, or a missing step does not count as success
`;
}

function decisions(state) {
  const rows = list(state.decisions, (row, i) => {
    return `## Decision ${i + 1}: ${row.title || "Untitled"}
${row.decision || "_What we decided._"}

Reason: ${row.reason || "_why_"}
`;
  });
  return `# Decisions

Permanent choices live here so they are not remade by accident.

${rows}
`;
}

function memory(state) {
  return `# Memory

This is the current state. Decisions stay in the decisions file.

## Status
${lines(state.memoryStatus)}

## Done
${lines(state.memoryDone)}

## Now
${lines(state.memoryNow)}

## Known issues
${lines(state.memoryIssues)}

## Next
${lines(state.memoryNext)}
`;
}

function tasks(state) {
  const stories = (state.stories || []).filter((row) => storyLine(row));
  const body = stories.length
    ? stories.map((row, i) => `- [ ] Story ${i + 1}: ${storyLine(row)}`).join("\n")
    : "- [ ] Fill the backlog before creating tasks";
  return `# Tasks

Do these one at a time. Finish, test, review, accept, then start the next.

${body}
`;
}

function readme(state) {
  const name = (state.productName || "This product").trim();
  return `# ${name}

This folder was exported from the Product Owner template.

Read in this order before writing code:

1. PRD.md
2. RESEARCH.md
3. SWOT.md
4. RISK.md
5. APPROACH.md
6. VALUE.md
7. WORKING_AGREEMENT.md
8. BACKLOG.md
9. SPRINT.md

Then build the first story only. Update MEMORY.md and TASKS.md when it is accepted.
`;
}

function filesFromState(state) {
  return [
    ["README.md", readme(state)],
    ["PRD.md", prd(state)],
    ["RESEARCH.md", research(state)],
    ["SWOT.md", swot(state)],
    ["RISK.md", risks(state)],
    ["APPROACH.md", approach(state)],
    ["VALUE.md", value(state)],
    ["WORKING_AGREEMENT.md", agreement(state)],
    ["BACKLOG.md", backlog(state)],
    ["SPRINT.md", sprint(state)],
    ["DESIGN.md", design(state)],
    ["RULES.md", rules(state)],
    ["SECURITY.md", security(state)],
    ["TEST_PLAN.md", testPlan(state)],
    ["DECISIONS.md", decisions(state)],
    ["MEMORY.md", memory(state)],
    ["TASKS.md", tasks(state)],
  ];
}

function researchGaps(state) {
  const gaps = [];
  const solutions = (state.solutions || []).filter((row) => (row.name || "").trim());
  const features = (state.features || []).filter((row) => (row.name || "").trim());
  if (solutions.length < 3) gaps.push("Name at least three existing solutions.");
  if (!features.length) gaps.push("Count which features show up across those solutions.");
  if (!(state.swotW || "").trim() || !(state.swotO || "").trim()) gaps.push("Write the weaknesses and the opportunity.");
  if (!(state.outOfScope || "").trim()) gaps.push("Write what is out of scope.");
  if (!(state.problem || "").trim() || !(state.user || "").trim()) gaps.push("Write the problem and the user.");
  return gaps;
}

function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i += 1) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function u16(n) {
  return [n & 255, (n >>> 8) & 255];
}

function u32(n) {
  return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
}

function zipStore(files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  files.forEach((file) => {
    const name = new TextEncoder().encode(file.name);
    const data = new TextEncoder().encode(file.text);
    const crc = crc32(data);
    const local = [
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...name,
      ...data,
    ];
    chunks.push(local);
    central.push([
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...name,
    ]);
    offset += local.length;
  });
  const centralStart = offset;
  const centralBytes = central.flat();
  const end = [
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralBytes.length),
    ...u32(centralStart),
    ...u16(0),
  ];
  return new Uint8Array([...chunks.flat(), ...centralBytes, ...end]);
}

const pack = {
  BUILD_CHOICES,
  filesFromState,
  researchGaps,
  zipStore,
};

const root = typeof window !== "undefined" ? window : globalThis;
root.pack = pack;
if (typeof module !== "undefined") module.exports = pack;
