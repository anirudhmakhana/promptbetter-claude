import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getConfigPath, loadConfig, setConfigValue } from '../src/config.js';
test('config set writes toml and loadConfig merges defaults', async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-config-'));
    process.env.HOME = home;
    await setConfigValue('context.turns', '5');
    await setConfigValue('privacy.persist_history', 'false');
    const cfg = await loadConfig();
    assert.equal(cfg.context.turns, 5);
    assert.equal(cfg.privacy.persist_history, false);
    const configPath = getConfigPath();
    const raw = await fs.readFile(configPath, 'utf8');
    assert.ok(raw.includes('[context]'));
    assert.ok(!raw.includes('provider ='));
});
test('config set rejects removed keys like provider', async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-config-invalid-'));
    process.env.HOME = home;
    await assert.rejects(() => setConfigValue('provider', 'openai'));
});
//# sourceMappingURL=config.test.js.map