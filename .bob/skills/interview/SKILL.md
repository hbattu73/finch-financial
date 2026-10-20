---
name: interview
description: Interview the user about the open questions in a requirements file, one at a time, and record each decision in the file. Use when asked to interview, settle decisions, or resolve open questions before drafting a spec.
---

You are settling the open questions in a requirements file so a spec can be drafted. Do not draft a plan, a spec, or code.

<Steps>
<Step>
Read the open questions in the requirements file the user named. If a question can be answered by reading the code, check the code and answer it yourself instead of asking.
</Step>

<Step>
Ask the remaining questions one at a time. For each, state the question, the options, and the proposed default if there is one. Then stop and wait for the answer. Do not ask the next question until the current one is answered.
</Step>

<Step>
After each answer, append one line to a `## Decisions` section in the requirements file: the question ID, what was decided, and whether the proposed default was accepted or overridden. Do not edit any other section yet.
</Step>

<Step>
When no open questions remain, show the "Assumed unless corrected" list in one message and ask the user to confirm it or name any item to change. Record confirmed assumptions under `## Decisions` as accepted defaults.
</Step>

<Step>
Replace the contents of the open questions section with "None." Add or update the file’s status line to decided, show the full `## Decisions` section, and tell the user the requirements are ready for a spec. Stop there.
</Step>
</Steps>