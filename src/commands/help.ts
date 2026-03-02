export function printHelp(): void {
  const text = `promptbetter - Claude Code prompt rewriting CLI

Usage:
  promptbetter install claude
  promptbetter uninstall claude
  promptbetter claude-hook
  promptbetter improve --prompt "..." [--context-file path]
  promptbetter doctor
  promptbetter config set <key> <value>

Supported config keys:
  provider
  confirm_mode
  context.turns
  rewrite.policy
  privacy.persist_history

confirm_mode values:
  auto_accept (default, best for Claude hooks)
  always (interactive a/e/s when tty is available)
  skip (disable rewriting in hook flow)

provider values:
  claude_workflow (default, no external API key)
  openai (external rewrite call using OPENAI_API_KEY)
`;
  process.stdout.write(text);
}
