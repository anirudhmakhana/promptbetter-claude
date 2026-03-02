# promptbetter

Claude Code plugin that adds a transparent prompt preview-and-approval gate before execution.

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

## Claude Runtime Flow

At runtime, `promptbetter claude-hook`:

1. Reads hook JSON from stdin.
2. Extracts current prompt + recent transcript turns.
3. Injects preview-gate context so Claude must show `Proposed Prompt` first.
4. User explicitly chooses one control:
- `PB_APPROVE`
- `PB_ORIGINAL`
- `PB_EDIT: ...`
5. Claude executes only after explicit control input.

## Plugin Distribution (Marketplace)

This repo includes plugin metadata for marketplace distribution:

- [claude-plugin.json](.claude-plugin/claude-plugin.json)
- [marketplace.json](.claude-plugin/marketplace.json)
- [.claude/settings.json](.claude/settings.json)

Install via marketplace (once published):

```bash
claude plugin marketplace add anirudhmakhana/promptbetter-claude
claude plugin install promptbetter@promptbetter-marketplace
```

Before publishing a release, build artifacts must exist:

```bash
npm run build
```

## Docs

- [Prerequisites](docs/prerequisites.md)
- [Claude Hooks](docs/claude-hooks.md)
- [Architecture](docs/architecture.md)
- [Release Guide](RELEASE.md)
