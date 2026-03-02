# Prerequisites and Required Knowledge

This project is easiest to understand if you know basic terminal usage and how Claude Code hooks work.

## 1) Runtime and tooling

- Node.js 20+
- Basic shell commands
- `npm link` for local CLI testing

Check versions:

```bash
node -v
npm -v
```

## 2) Claude Code hooks

`promptbetter` attaches to Claude Code `UserPromptSubmit`.

Flow:

1. You submit a prompt.
2. Claude executes `promptbetter claude-hook`.
3. The hook can return `hookSpecificOutput.additionalContext`.
4. Claude proceeds with that injected context.

Core files:

- [src/commands/claudeHook.js](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/claudeHook.ts)
- [src/commands/installClaude.js](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/installClaude.ts)

## 3) Claude Skills in workspace

Default mode uses Claude-native workflow and a workspace skill:

- [.claude/skills/promptbetter-preview/SKILL.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/.claude/skills/promptbetter-preview/SKILL.md)

You should understand that skills are instruction modules Claude can use during execution.

## 4) Provider modes

`promptbetter` supports two providers:

- `claude_workflow` (default): no external API key, uses Claude to generate/show proposed prompt first.
- `openai`: external rewrite call with `OPENAI_API_KEY`.

## 5) Transparency controls

In `claude_workflow` mode, users confirm using explicit control replies:

- `PB_APPROVE`
- `PB_ORIGINAL`
- `PB_EDIT: <edited prompt>`

This ensures the user sees the proposed prompt before task execution.

## 6) Failure behavior

Non-blocking design: if hook parsing/config/provider path fails, Claude continues with original prompt.

## 7) Read order

1. [README.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/README.md)
2. [docs/claude-hooks.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/docs/claude-hooks.md)
3. [docs/architecture.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/docs/architecture.md)
