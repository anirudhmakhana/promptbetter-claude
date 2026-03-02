# Release Guide

This guide explains how to release `promptbetter` as a Claude Code plugin + marketplace entry.

## How Distribution Works

This repo contains:

- Plugin manifest: `.claude-plugin/claude-plugin.json`
- Marketplace manifest: `.claude-plugin/marketplace.json`
- Plugin hook config: `.claude/settings.json`

Users install from a marketplace inside Claude Code, not from npm.

## One-Time Setup

1. Ensure the marketplace source points to your real repo:
- `.claude-plugin/marketplace.json` -> `plugins[0].source` (for this repo, use `"./"` so the plugin is loaded from this repo root)

2. Ensure plugin name consistency across files:
- `.claude-plugin/claude-plugin.json` -> `name`
- `.claude-plugin/marketplace.json` -> `plugins[0].name`

## Release Checklist

1. Update versions
- `package.json` -> `version`
- `.claude-plugin/claude-plugin.json` -> `version`
- `.claude-plugin/marketplace.json` -> `plugins[0].version`

2. Build and verify

```bash
npm run typecheck
npm test
npm run build
```

3. Validate plugin/marketplace schema

```bash
claude plugin validate .
```

4. Local install test (inside Claude session)

```text
/plugin marketplace add ./
/plugin install promptbetter@promptbetter-marketplace
```

Then run a real prompt and verify:
- Claude shows `Proposed Prompt`
- You can reply with `PB_APPROVE`, `PB_ORIGINAL`, or `PB_EDIT: ...`

5. Commit and tag

```bash
git add .
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

## User Install Instructions (Published)

Inside Claude Code:

```text
/plugin marketplace add anirudhmakhana/promptbetter-claude
/plugin install promptbetter@promptbetter-marketplace
```

## Rollback

If release is bad:

1. Revert/patch on `main`.
2. Bump patch version.
3. Rebuild and re-release.
4. Users can reinstall/upgrade plugin from the same marketplace.

## Troubleshooting

1. Marketplace add fails
- Verify `.claude-plugin/marketplace.json` exists at repo root.
- Run `claude plugin validate .`.

2. Plugin installs but does nothing
- Ensure `dist/bin/promptbetter.js` exists after build.
- Check `.claude/settings.json` in plugin package includes `UserPromptSubmit` hook.

3. Hook command not found
- Verify hook command path uses `${CLAUDE_PLUGIN_ROOT}` exactly.

## References

- Claude plugin system docs: https://docs.claude.com/en/docs/claude-code/plugins
- Claude marketplace docs: https://docs.claude.com/en/docs/claude-code/plugin-marketplaces
- Claude plugin announcement: https://www.claude.com/blog/claude-code-plugins
