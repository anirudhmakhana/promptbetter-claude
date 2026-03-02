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
  assert.equal(cfg.provider, 'claude_workflow');
  assert.equal(cfg.confirm_mode, 'auto_accept');

  const configPath = getConfigPath();
  const raw = await fs.readFile(configPath, 'utf8');
  assert.ok(raw.includes('[context]'));
});

test('config set accepts confirm_mode values', async () => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-config-confirm-'));
  process.env.HOME = home;

  await setConfigValue('confirm_mode', 'always');
  let cfg = await loadConfig();
  assert.equal(cfg.confirm_mode, 'always');

  await setConfigValue('confirm_mode', 'skip');
  cfg = await loadConfig();
  assert.equal(cfg.confirm_mode, 'skip');
});

test('config set accepts provider values', async () => {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-config-provider-'));
  process.env.HOME = home;

  await setConfigValue('provider', 'openai');
  let cfg = await loadConfig();
  assert.equal(cfg.provider, 'openai');

  await setConfigValue('provider', 'claude_workflow');
  cfg = await loadConfig();
  assert.equal(cfg.provider, 'claude_workflow');
});
