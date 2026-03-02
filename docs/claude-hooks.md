# Claude Hook Integration (Detailed)

## 1) Install and uninstall

Install:

```bash
promptbetter install claude
```

Uninstall:

```bash
promptbetter uninstall claude
```

Install writes `promptbetter claude-hook` into `~/.claude/settings.json` under `hooks.UserPromptSubmit`.
Uninstall removes only that command and preserves other hooks.

## 2) Hook payload parsing

`promptbetter claude-hook` reads JSON from stdin.

Prompt precedence:

1. `payload.prompt`
2. `payload.user_prompt`
3. `payload.input.prompt`
4. `payload.input_data.prompt`

Transcript path precedence:

1. `payload.transcript_path`
2. `payload.session_path`

It parses transcript JSONL and trims to latest `context.turns * 2` messages.

## 3) Runtime behavior

Hook injects `additionalContext` that instructs Claude to:

1. Generate a `Proposed Prompt`.
2. Show it to the user first.
3. Wait for explicit control input:
- `PB_APPROVE`
- `PB_ORIGINAL`
- `PB_EDIT: <edited prompt>`
4. Execute only after confirmation.

If user input is already a control reply (`PB_*`), hook skips re-injection to avoid loops.

Implementation:

- [claudeWorkflow.ts](../src/core/claudeWorkflow.ts)
- [claudeHook.ts](../src/commands/claudeHook.ts)
- [SKILL.md](../.claude/skills/promptbetter-preview/SKILL.md)

## 4) Hook output contract

When hook injects context, stdout JSON shape is:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "..."
  }
}
```

If hook chooses pass-through, it emits nothing.

## 5) Failure behavior

Failure paths are non-blocking (invalid payload, missing fields). Claude continues with original prompt.
