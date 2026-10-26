# Demo Prompts

`[prompt]` = pasted to the agent verbatim. `[why]` = the point of that prompt, underneath it. `[do]` = you.

---

## Module 1 — Requirements + Spec

`[why]` Input is a four-sentence product request; output is a spec a fresh agent can build from. Human ownership is highest here: you make every design decision, the agent explores, drafts and asks. That's what keeps comprehension debt low.

`[do]` Ask mode. Permissions: Read on, everything else off.

`[prompt]`

```
I'm adding the Freeze and Unfreeze feature from @product-requests.md and I'm new to this codebase. Use three explore subagents in parallel and give me only their summaries:
1. The most similar existing feature, traced from the API call down to the database and its tests. Just the files, in order.
2. Rules the code enforces when an account's status or balance changes. One line each, with the file.
3. Existing parts of the app this feature would touch. As a table.
Don't plan or write code yet.
```

`[why]` Context engineering starts here. Each subagent reads twenty files in its own context and sends back a summary; the files are discarded with it. Point at the header counter vs. the three cards' token counts. The three questions are the three kinds of requirement: precedent, constraints, integration surface.

`[prompt]`

```
What does this repo already give me to verify a change against? Then turn the expected outcomes in the product request into validation criteria, one per outcome, each with a pass condition.
```

`[why]` Requirements without testable criteria are wishes. Asking what exists first grounds the criteria in real commands and fixtures. "One per outcome" keeps the list the size of the request.

`[prompt]`

```
What open questions require my input that you can't settle from the code alone?
```

`[why]` Some things the agent can't deduce from code, and shouldn't. The ambiguous decisions are yours; that's the ownership point. The phrasing invokes the `AGENTS.md` rule: ask only when scope, behavior or the data model is at stake, default the rest.

`[do]` Plan mode.

`[prompt]`

```
Write a `requirements.md` from this conversation, using the task and the validation criteria we just defined, the relevant files, and the open questions we had defined. Output a requirements artifact only. No plan or code yet.
```

`[why]` The conversation will end; this file is what survives. The prompt names the checklist. Open questions are still open on purpose: the developer decides, not the agent.

`[prompt]`

```
Interview me about the open questions in @requirements.md.
```

`[do]` Answer one at a time. Override at least one default. Confirm the assumptions when asked. Not done until Bob says the file is marked decided.

`[why]` Interactive session keeps you in the loop without handing the design to the agent. Skills: reusable instruction sets, a recipe Bob follows the same way every time. This loop lives in `.bob/skills/interview/SKILL.md`, not in the prompt.

`[prompt]`

```
Using @requirements.md, draft a `spec.md`. Include the phases in dependency order, each naming the criteria it satisfies and how to check them. Every validation criterion must trace to a phase. No vague steps like "implement X", say what changes and where. Group changes into phases that can each be checked on their own; no phase without changes.
```

`[why]` This is what makes it a spec rather than a to-do list. Dependency order: contract before schema, service before routes, API before UI, because each can't be checked until the one before exists. Read the decisions and risks Bob flags before moving on; each is a gap in requirements, cheap to fix now.

---

## Module 2 — Implementation

`[why]` Autonomy highest, human ownership lowest, and that's earned: every decision that got here went through you. What's left is implementation detail.

`[do]` New task. Agent mode. Auto-approve on (master switch). Dev server stopped.

`[why]` Fresh session on purpose: a cold context is what forces `spec.md` to carry the work. If the build goes wrong, the spec was missing something.

`[prompt]`

```
Implement @spec.md phase by phase. Run each phase's checks and report before moving to the next.
```

`[why]` Twelve words because the spec and `AGENTS.md` hold the rest. What's protecting you isn't the permissions: no-commit rule, clean tree, phase boundaries. The spec is the loop condition; a phase is done when its checks pass, not when the agent says so.

`[prompt]` if it drifts:

```
Phase N was supposed to X. It did Y. Fix it to match the spec — don't change the spec.
```

`[do]` If it derails: `git restore .`, `git clean -n` (never `-f`), new task, run the prompt again.

`[do]` At the end: typecheck and tests yourself, `git status`, click through freeze/unfreeze in the browser. Leave everything uncommitted.

---

## Module 3 — Validation

`[why]` Green checks prove the agent built the spec. Two questions they can't answer: does the code match the spec, and does the spec match the need? Three mechanisms, one per kind of problem. The agents find; you decide.

`[do]` `git diff --stat main`, then read one function yourself.

`[do]` `/review` → compare against `main` → Include Uncommitted Changes → Start. Read the findings. Don't click "Fix with Bob."

`[why]` This reviewer has the diff and nothing else: good at code quality, blind to intent. Fix with Bob collapses "is this right?" and "do we want it?" into one click.

`[do]` New task. Ask mode.

`[prompt]`

```
Review the diff against @spec.md and @requirements.md: does the code match the spec, is it safe for a regulated fintech app, and would the tests fail if a requirement were broken? Skip what matches. Report what matters and mark which findings need a human decision.
```

`[why]` Fresh session so it didn't build the code; Ask mode so it can't fix what it finds. Same model, different context, different findings. The human-decision group is where the spec was silent on something the need required: spec drift, not a code bug. Output length varies; the findings are at the end.

`[do]` Human gate, one line each:
1. Does the code do what we agreed? If not, is the code wrong or the spec?
2. Each human-decision item: fix now, follow-up, or reject? Code correction or spec change?
3. Would the tests catch it breaking?

`[why]` Neither reviewer can decide what the team will ship. That judgment doesn't delegate. Ownership returns here.

`[do]` New task. Agent mode. Auto-approve on. Fill in the gate's answers:

`[prompt]`

```
Update @spec.md with these review decisions: [your one-line answers from the gate]. Amend only the affected phase and add a Review section recording each decision. Then re-implement that phase and run its checks.
```

`[prompt]` filled in from the 10/26 run, for reference:

```
Update @spec.md with these review decisions: make the status change and audit write one transaction (Phase 2); add a test for the conditional status update (Phase 2); seed a reason before the unfreeze HTTP test so clearing is proven (Phase 3). Amend only the affected phases and add a Review section recording each decision. Then re-implement those phases and run their checks.
```

`[why]` The fix goes through the spec, not around it. You decided; the agent is the clerk, as in the interview. Same loop as Module 2, one more time, and the spec is still what says when it's done.