# Demo Prompts

`[do]` = you. Everything in a code block is pasted to the agent verbatim.

---

## Module 1 — Requirements

`[do]` Ask mode.

```
I am building the Freeze and Seize product request from @product-requests.md to this app. Which files and endpoints would it touch? What existing features are most similar, and what is already here vs. missing? List the decisions that the code can't settle for me. Do not write a plan or code yet.
```

```
What does this repo already give me to verify a change against? Any type systems or test setups? Help me turn the expected outcomes into validation criteria that are measurable and testable.
```

`[do]` Agent mode.

```
Write a `requirements.md` from this conversation, using the task and the validation criteria we just defined, the relevant files, and the open questions we had defined. Output a requirements artifact only. No plan or code yet.

Guidance:
```

Type the guidance live — one or two lines, pointing at an existing pattern to copy
and naming a concrete expected outcome. This is the part the agent can't derive.

---

## Module 2 — Spec

```
Using @requirements.md, draft an implementation plan. First, interview me about the decisions @requirements.md leaves open, waiting for my answer each time. When they are settled, confirm with me before you draft. Then, draft a plan covering: task summary, agreed/rejected decisions, and phases in dependency order. Every validation criterion must trace to a phase. No vague steps like "implement X" — say what changes and where. Don't write code or to a file yet.
```

```
Review that draft against @requirements.md. Check that every validation criterion can be traced to a phase and that there are no vague steps. Is there anything in there that I never asked for? Give each phase its own validation step. Apply any refinements and save it to `spec.md`. Keep it minimal, don't pad.
```

---

## Module 3 — Implementation

`[do]` New session. Agent mode. Auto-accept edits.

```
Implement @spec.md. Work through the phases in order. After each phase, run the checks for it and tell me what passed before starting the next one. If the spec doesn't settle something, stop and ask instead of guessing.
```

```
Show me the test names that you added and which validation criterion in @requirements.md each one covers. Don't paste the test bodies.
```

If it drifts:

```
Phase 3 was supposed to X. It did Y. Fix it to match the spec — don't change the spec.
```

`[do]` If it derails: `git restore .`

---

## Module 4 — Verification

`[do]` `git diff --stat`, then read one file yourself.

```
Review the diff against @spec.md and @requirements.md. Flag anything incomplete, inconsistent, or risky. Give me a couple that matter the most. Justify your reasoning. Don't fix anything.
```

```
For each one, say whether it's structural (e.g. approach was wrong), content (e.g. over-engineered or inconsistent), or just plainly inelegant. Mark the ones you can't settle without a human.
```

```
Which validation criteria in @requirements.md §4 have no automated test covering them? Just the list.
```
