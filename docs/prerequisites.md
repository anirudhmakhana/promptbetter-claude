# Prerequisites and Required Knowledge

This project is easiest to understand if you know basic terminal usage and Claude Code hooks.

## 1) Runtime and tooling

- Node.js 20+
- Basic shell commands
- `npm link` for local CLI testing

## 2) Claude Code hooks

`promptbetter` attaches to Claude Code `UserPromptSubmit`.

Flow:

1. You submit a prompt.
2. Claude executes `promptbetter claude-hook`.
3. Hook returns `hookSpecificOutput.additionalContext`.
4. Claude proceeds with injected context.

Core files:

- [claudeHook.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/claudeHook.ts)
- [installClaude.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/installClaude.ts)

## 3) Workspace skill

Prompt behavior guidance is in:

- [SKILL.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/.claude/skills/promptbetter-preview/SKILL.md)

## 4) Transparency controls

Users explicitly control execution with:

- `PB_APPROVE`
- `PB_ORIGINAL`
- `PB_EDIT: <edited prompt>`

## 5) Failure behavior

Non-blocking design: if hook parsing or config handling fails, Claude continues with original prompt.
