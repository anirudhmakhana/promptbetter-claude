import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { installClaudeHook, CLAUDE_HOOK_COMMAND } from '../src/commands/installClaude.js';
import { uninstallClaudeHook } from '../src/commands/uninstallClaude.js';
test('installClaudeHook writes hook once and is idempotent', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-install-'));
    const settingsPath = path.join(dir, 'settings.json');
    process.env.PROMPTBETTER_CLAUDE_SETTINGS_PATH = settingsPath;
    await installClaudeHook();
    await installClaudeHook();
    const raw = await fs.readFile(settingsPath, 'utf8');
    const parsed = JSON.parse(raw);
    const hooks = parsed.hooks?.UserPromptSubmit ?? [];
    const count = hooks
        .flatMap((group) => group.hooks || [])
        .filter((h) => h.type === 'command' && h.command === CLAUDE_HOOK_COMMAND).length;
    assert.equal(count, 1);
    delete process.env.PROMPTBETTER_CLAUDE_SETTINGS_PATH;
});
test('uninstallClaudeHook removes only promptbetter hook command', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-uninstall-'));
    const settingsPath = path.join(dir, 'settings.json');
    process.env.PROMPTBETTER_CLAUDE_SETTINGS_PATH = settingsPath;
    const seed = {
        hooks: {
            UserPromptSubmit: [
                {
                    hooks: [
                        { type: 'command', command: CLAUDE_HOOK_COMMAND },
                        { type: 'command', command: 'echo custom-hook' },
                    ],
                },
            ],
        },
    };
    await fs.writeFile(settingsPath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');
    await uninstallClaudeHook();
    const raw = await fs.readFile(settingsPath, 'utf8');
    const parsed = JSON.parse(raw);
    const hooks = (parsed.hooks?.UserPromptSubmit ?? []).flatMap((group) => group.hooks || []);
    const promptbetterCount = hooks.filter((h) => h.type === 'command' && h.command === CLAUDE_HOOK_COMMAND).length;
    const customCount = hooks.filter((h) => h.type === 'command' && h.command === 'echo custom-hook').length;
    assert.equal(promptbetterCount, 0);
    assert.equal(customCount, 1);
    delete process.env.PROMPTBETTER_CLAUDE_SETTINGS_PATH;
});
//# sourceMappingURL=install.test.js.map