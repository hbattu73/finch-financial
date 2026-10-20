# Demo Prompts

`[do]` = you. Everything in a code block is pasted to the agent verbatim.

---

## Module 1 — Requirements + Spec

`[do]` Ask mode.

```
I'm adding the Freeze and Seize feature from @product-requests.md and I'm new to this codebase. Use three explore subagents in parallel and give me only their summaries:
1. The most similar existing feature, traced from the API call down to the database and its tests. Just the files, in order.
2. Rules the code enforces when an account's status or balance changes. One line each, with the file.
3. Existing parts of the app this feature would touch. As a table.
Don't plan or write code yet.
```

```
What does this repo already give me to verify a change against? Then turn the expected outcomes in the product request into validation criteria, one per outcome, each with a pass condition.
```

```
What open questions require my input that you can't settle from the code alone?
```

`[do]` Plan mode.

```
Write a `requirements.md` from this conversation, using the task and the validation criteria we just defined, the relevant files, and the open questions we had defined. Output a requirements artifact only. No plan or code yet.
```

```
Interview me about the open questions in @requirements.md.
```

Answer one question at a time. Accept or override the proposed default. Confirm the assumptions when asked.

```
Using @requirements.md, draft a `spec.md`. Include the phases in dependency order, each naming the criteria it satisfies and how to check them. Every validation criterion must trace to a phase. No vague steps like "implement X", say what changes and where. Group changes into phases that can each be checked on their own; no phase without changes.
```

Optional, if time allows:

```
Have a fresh explore subagent check @spec.md against @requirements.md: every criterion in a phase, no vague steps, nothing the requirements didn't ask for. Apply what it finds.
```

---

## Module 2 — Implementation

`[do]` New session. Agent mode. Auto-approve reads, edits, and commands.

```
Implement @spec.md phase by phase. Run each phase's checks and report before moving to the next.
```

If it drifts:

```
Phase N was supposed to X. It did Y. Fix it to match the spec — don't change the spec.
```

`[do]` If it derails: `git restore .` and run the prompt again.

---

## Module 3 — Validation

`[do]` `git diff --stat main`, then read one file yourself.

`[do]` `/review` → compare against `main` → Include Uncommitted Changes → Start. Read the findings. Don't click "Fix with Bob."

`[do]` New session. Ask mode.

```
Review the diff against @spec.md and @requirements.md: does the code match the spec, is it safe for a regulated fintech app, and would the tests fail if a requirement were broken? Skip what matches. Report what matters and mark which findings need a human decision.
```

`[do]` Human gate:
1. What did `/review` find that the validator didn't, and the reverse?
2. Of the human-decision findings, which blocks shipping at your organization?
3. Would this ship, and who signs?

Optional, to close the loop once:

`[do]` Add the agreed fix to the relevant phase in `spec.md`. Agent mode.

```
Phase N of @spec.md changed. Re-implement that phase and run its checks.
```