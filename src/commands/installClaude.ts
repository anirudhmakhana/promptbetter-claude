import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { ClaudeSettings, HookGroup } from '../types.js';

const HOOK_COMMAND = 'promptbetter claude-hook';

export async function installClaudeHook(): Promise<void> {
  const settingsPath = getClaudeSettingsPath();
  await fs.mkdir(path.dirname(settingsPath), { recursive: true });

  let settings: ClaudeSettings = {};
  try {
    const raw = await fs.readFile(settingsPath, 'utf8');
    settings = JSON.parse(raw) as ClaudeSettings;
  } catch (err: unknown) {
    if (!(err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ENOENT')) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to read Claude settings at ${settingsPath}: ${message}`);
    }
  }

  if (!settings.hooks || typeof settings.hooks !== 'object') {
    settings.hooks = {};
  }

  if (!Array.isArray(settings.hooks.UserPromptSubmit)) {
    settings.hooks.UserPromptSubmit = [];
  }

  const groups = settings.hooks.UserPromptSubmit as HookGroup[];
  const alreadyInstalled = groups.some((matcherGroup) => {
    if (!matcherGroup || !Array.isArray(matcherGroup.hooks)) return false;
    return matcherGroup.hooks.some((h) => h?.type === 'command' && h?.command === HOOK_COMMAND);
  });

  if (!alreadyInstalled) {
    groups.push({
      hooks: [
        {
          type: 'command',
          command: HOOK_COMMAND,
        },
      ],
    });
    settings.hooks.UserPromptSubmit = groups;
    await fs.writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
    process.stdout.write(`Installed Claude hook in ${settingsPath}\n`);
    return;
  }

  process.stdout.write(`Claude hook already installed in ${settingsPath}\n`);
}

export function getClaudeSettingsPath(): string {
  if (process.env.PROMPTBETTER_CLAUDE_SETTINGS_PATH) {
    return process.env.PROMPTBETTER_CLAUDE_SETTINGS_PATH;
  }
  return path.join(process.env.HOME || os.homedir(), '.claude', 'settings.json');
}

export const CLAUDE_HOOK_COMMAND = HOOK_COMMAND;
