# Claude Hook Integration (Detailed)

This project integrates with Claude Code through the `UserPromptSubmit` hook.

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

Prompt field precedence:

1. `payload.prompt`
2. `payload.user_prompt`
3. `payload.input.prompt`
4. `payload.input_data.prompt`

Transcript path precedence:

1. `payload.transcript_path`
2. `payload.session_path`

It parses transcript JSONL and trims to latest `context.turns * 2` messages.

## 3) Default provider: `claude_workflow`

In default mode, the hook does not call external APIs.

It emits `additionalContext` that instructs Claude to:

1. Generate a conservative `Proposed Prompt`.
2. Show it to the user first.
3. Wait for explicit control input:
- `PB_APPROVE`
- `PB_ORIGINAL`
- `PB_EDIT: <edited prompt>`
4. Execute only after confirmation.

If a user message is a control reply (`PB_*`), hook skips re-injection to avoid loops.

Implementation:

- [src/core/claudeWorkflow.js](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/core/claudeWorkflow.ts)
- [src/commands/claudeHook.js](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/claudeHook.ts)
- [.claude/skills/promptbetter-preview/SKILL.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/.claude/skills/promptbetter-preview/SKILL.md)

## 4) Optional provider: `openai`

If `provider=openai`, hook uses external rewriting path:

1. Redact probable secrets.
2. Call OpenAI chat completions.
3. Run guardrail checks.
4. Apply `confirm_mode` behavior.

Requires `OPENAI_API_KEY`.

## 5) Hook output contract

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

## 6) Failure behavior

Failure paths are non-blocking (invalid payload, missing fields, provider errors). Claude continues with the original prompt.
