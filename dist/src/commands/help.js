export function printHelp() {
    const text = `promptbetter - Claude Code prompt rewriting CLI

Usage:
  promptbetter install claude
  promptbetter uninstall claude
  promptbetter claude-hook
  promptbetter improve --prompt "..." [--context-file path]
  promptbetter doctor
  promptbetter config set <key> <value>

Supported config keys:
  context.turns
  rewrite.policy
  privacy.persist_history
`;
    process.stdout.write(text);
}
//# sourceMappingURL=help.js.map