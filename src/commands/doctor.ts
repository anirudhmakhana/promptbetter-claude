import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig, getConfigPath } from '../config.js';
import { getClaudeSettingsPath, CLAUDE_HOOK_COMMAND } from './installClaude.js';
import type { ClaudeSettings } from '../types.js';

export async function runDoctor(): Promise<void> {
  const checks: string[] = [];
  const configPath = getConfigPath();

  try {
    await fs.access(configPath);
    checks.push(ok(`Config file exists: ${configPath}`));
  } catch {
    checks.push(warn(`Config file missing, defaults will be used: ${configPath}`));
  }

  const config = await loadConfig();
  checks.push(ok(`Provider: ${config.provider}`));

  if (config.provider === 'openai') {
    checks.push(ok('OpenAI model: gpt-4.1-mini (internal default)'));
    if (process.env.OPENAI_API_KEY) {
      checks.push(ok('OPENAI_API_KEY present'));
    } else {
      checks.push(fail('OPENAI_API_KEY missing'));
    }
  } else {
    checks.push(ok('Using Claude workflow provider (no external API key required)'));
    const skillPath = path.join(process.cwd(), '.claude', 'skills', 'promptbetter-preview', 'SKILL.md');
    try {
      await fs.access(skillPath);
      checks.push(ok(`Workspace skill found: ${skillPath}`));
    } catch {
      checks.push(warn(`Workspace skill missing: ${skillPath}`));
    }
  }

  const settingsPath = getClaudeSettingsPath();
  try {
    const raw = await fs.readFile(settingsPath, 'utf8');
    const parsed = JSON.parse(raw) as ClaudeSettings;
    const installed = Boolean(
      parsed?.hooks?.UserPromptSubmit?.some((group) =>
        Array.isArray(group?.hooks) &&
        group.hooks.some((h) => h?.type === 'command' && h?.command === CLAUDE_HOOK_COMMAND),
      ),
    );
    if (installed) {
      checks.push(ok(`Claude hook installed in ${settingsPath}`));
    } else {
      checks.push(fail(`Claude hook missing in ${settingsPath}`));
    }
  } catch {
    checks.push(fail(`Could not read Claude settings at ${settingsPath}`));
  }

  for (const line of checks) {
    process.stdout.write(`${line}\n`);
  }

  const hasFailures = checks.some((line) => line.startsWith('FAIL'));
  if (hasFailures) {
    process.exitCode = 1;
  }
}

function ok(message: string): string {
  return `OK   ${message}`;
}

function warn(message: string): string {
  return `WARN ${message}`;
}

function fail(message: string): string {
  return `FAIL ${message}`;
}
