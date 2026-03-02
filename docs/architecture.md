# Architecture (Claude-Only)

## 1) Components

1. CLI entry and routing
- [promptbetter.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/bin/promptbetter.ts)
- [cli.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/cli.ts)

2. Commands
- Install/uninstall hook:
  - [installClaude.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/installClaude.ts)
  - [uninstallClaude.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/uninstallClaude.ts)
- Hook runtime:
  - [claudeHook.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/claudeHook.ts)
- Debug/ops:
  - [improve.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/improve.ts)
  - [doctor.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/doctor.ts)
  - [configSet.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/commands/configSet.ts)

3. Core
- Config loader/validator: [config.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/config.ts)
- Hook payload/transcript parsing: [context.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/core/context.ts)
- Preview gate: [claudeWorkflow.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/core/claudeWorkflow.ts)
- Local rewrite utilities:
  - [rewrite.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/core/rewrite.ts)
  - [heuristicRewrite.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/core/heuristicRewrite.ts)
  - [guardrails.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/core/guardrails.ts)
  - [redact.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/src/core/redact.ts)

4. Workspace skill
- [SKILL.md](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/.claude/skills/promptbetter-preview/SKILL.md)

## 2) Runtime flow

```mermaid
flowchart TD
  A["Claude UserPromptSubmit"] --> B["promptbetter claude-hook"]
  B --> C["Parse payload + prompt"]
  C --> D["Read recent transcript turns"]
  D --> E["Inject preview-gate additionalContext"]
  E --> F["Claude shows Proposed Prompt first"]
  F --> G["User sends PB_APPROVE/PB_ORIGINAL/PB_EDIT"]
  G --> H["Control reply bypasses re-injection"]
```

## 3) Config contract

Config path: `~/.promptbetter/config.toml`

Supported keys:

- `[context].turns` (0-10)
- `[rewrite].policy` (`conservative|balanced|aggressive`)
- `[privacy].persist_history` (boolean)

## 4) Reliability model

- Hook failures are fail-open: original prompt flow continues.
- No persistent prompt history storage by default.
- No external model provider dependency.

## 5) Test coverage

- [config.test.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/test/config.test.ts)
- [context.test.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/test/context.test.ts)
- [guardrails.test.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/test/guardrails.test.ts)
- [rewrite.test.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/test/rewrite.test.ts)
- [install.test.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/test/install.test.ts)
- [claudeWorkflow.test.ts](/Users/anirudhmakhana/Documents/krsnalabs/promptbetter/test/claudeWorkflow.test.ts)
