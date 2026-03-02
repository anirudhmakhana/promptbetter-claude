# promptbetter

Claude Code-first prompt rewriting CLI.

## Documentation

- Prerequisites and foundational concepts: [docs/prerequisites.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/docs/prerequisites.md)
- Claude hook internals and payload/output details: [docs/claude-hooks.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/docs/claude-hooks.md)
- System architecture and component map: [docs/architecture.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/docs/architecture.md)

## Install locally

```bash
npm link
promptbetter install claude
# remove hook later if needed
promptbetter uninstall claude
```

## Configure

```bash
promptbetter config set rewrite.policy conservative
promptbetter config set context.turns 3
```

## Commands

```bash
promptbetter improve --prompt "Draft a PR summary"
promptbetter claude-hook
promptbetter doctor
promptbetter uninstall claude
```

## How Claude integration works

`promptbetter install claude` adds a `UserPromptSubmit` hook in `~/.claude/settings.json`.

At runtime, `promptbetter claude-hook`:

1. Reads the hook JSON payload from stdin.
2. Extracts the current prompt + up to 3 recent turns from transcript.
3. Injects a transparent preview gate in Claude:
   - Claude shows a `Proposed Prompt` first
   - User must choose one of `PB_APPROVE`, `PB_ORIGINAL`, or `PB_EDIT: ...`
   - Claude executes only after explicit confirmation
4. Emits `hookSpecificOutput.additionalContext`.

If any step fails, the original prompt is passed through.
