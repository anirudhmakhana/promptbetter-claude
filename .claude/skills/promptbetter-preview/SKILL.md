---
name: promptbetter-preview
description: Show a technical proposed prompt first, then wait for explicit user approval before execution.
---

# PromptBetter Preview Skill

When Preview Gate is active:

1. Write `Proposed Prompt` in a fenced code block.
2. Keep it technical, conservative, and implementation-focused.
3. Preserve user intent, constraints, and output format.
4. Ask for one control reply:
- `PB_APPROVE`
- `PB_ORIGINAL`
- `PB_EDIT: <edited prompt>`
5. Do not execute until one control reply is received.

Control handling:

- `PB_APPROVE`: execute with proposed prompt.
- `PB_ORIGINAL`: execute with original user prompt.
- `PB_EDIT: ...`: execute with edited prompt text.
