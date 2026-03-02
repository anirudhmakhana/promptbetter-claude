import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { ConfigDotKey, JsonObject, PromptBetterConfig } from './types.js';

export const DEFAULT_CONFIG: PromptBetterConfig = {
  provider: 'claude_workflow',
  confirm_mode: 'auto_accept',
  context: {
    turns: 3,
  },
  rewrite: {
    policy: 'conservative',
  },
  privacy: {
    persist_history: false,
  },
};

const ALLOWED_KEYS: ReadonlySet<ConfigDotKey> = new Set([
  'provider',
  'confirm_mode',
  'context.turns',
  'rewrite.policy',
  'privacy.persist_history',
]);

export function getConfigPath(): string {
  const home = process.env.HOME || os.homedir();
  return path.join(home, '.promptbetter', 'config.toml');
}

export async function loadConfig(): Promise<PromptBetterConfig> {
  const configPath = getConfigPath();
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    const parsed = parseToml(raw);
    return deepMerge(DEFAULT_CONFIG, parsed);
  } catch (err: unknown) {
    if (isNotFound(err)) {
      return structuredClone(DEFAULT_CONFIG);
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read config: ${message}`);
  }
}

export async function saveConfig(config: PromptBetterConfig): Promise<void> {
  const configPath = getConfigPath();
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  const body = toToml(config);
  await fs.writeFile(configPath, body, 'utf8');
}

export async function setConfigValue(dotKey: ConfigDotKey, value: string): Promise<PromptBetterConfig> {
  if (!ALLOWED_KEYS.has(dotKey)) {
    throw new Error(`Unsupported config key: ${dotKey}`);
  }

  const config = await loadConfig();
  setNested(config, dotKey, parsePrimitive(value));
  validateConfig(config);
  await saveConfig(config);
  return config;
}

export function validateConfig(config: PromptBetterConfig): void {
  if (!['claude_workflow', 'openai'].includes(config.provider)) {
    throw new Error(`Unsupported provider: ${config.provider}`);
  }

  if (!['always', 'auto_accept', 'skip'].includes(config.confirm_mode)) {
    throw new Error(`Unsupported confirm_mode: ${config.confirm_mode}`);
  }

  if (!['conservative', 'balanced', 'aggressive'].includes(config.rewrite.policy)) {
    throw new Error(`Unsupported rewrite.policy: ${config.rewrite.policy}`);
  }

  if (!Number.isInteger(config.context.turns) || config.context.turns < 0 || config.context.turns > 10) {
    throw new Error('context.turns must be an integer between 0 and 10');
  }

  if (typeof config.privacy.persist_history !== 'boolean') {
    throw new Error('privacy.persist_history must be boolean');
  }
}

function parseToml(input: string): Partial<PromptBetterConfig> {
  const out: JsonObject = {};
  let section: string | null = null;

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('[') && line.endsWith(']')) {
      section = line.slice(1, -1).trim();
      if (!section) throw new Error('Invalid section name');
      if (!isRecord(out[section])) out[section] = {};
      continue;
    }

    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const valueRaw = line.slice(idx + 1).trim();
    const value = parseTomlValue(valueRaw);

    if (section) {
      const sec = out[section];
      if (!isRecord(sec)) {
        out[section] = {};
      }
      (out[section] as JsonObject)[key] = value;
    } else {
      out[key] = value;
    }
  }

  return out as Partial<PromptBetterConfig>;
}

function parseTomlValue(v: string): string | number | boolean {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return Number.parseInt(v, 10);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function escapeToml(str: string): string {
  return String(str).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

export function toToml(config: PromptBetterConfig): string {
  const lines: string[] = [];
  lines.push(`provider = "${escapeToml(config.provider)}"`);
  lines.push(`confirm_mode = "${escapeToml(config.confirm_mode)}"`);
  lines.push('');
  lines.push('[context]');
  lines.push(`turns = ${config.context.turns}`);
  lines.push('');
  lines.push('[rewrite]');
  lines.push(`policy = "${escapeToml(config.rewrite.policy)}"`);
  lines.push('');
  lines.push('[privacy]');
  lines.push(`persist_history = ${config.privacy.persist_history ? 'true' : 'false'}`);
  lines.push('');
  return lines.join('\n');
}

function deepMerge(base: PromptBetterConfig, override: Partial<PromptBetterConfig>): PromptBetterConfig {
  return {
    provider: override.provider ?? base.provider,
    confirm_mode: override.confirm_mode ?? base.confirm_mode,
    context: {
      turns: override.context?.turns ?? base.context.turns,
    },
    rewrite: {
      policy: override.rewrite?.policy ?? base.rewrite.policy,
    },
    privacy: {
      persist_history: override.privacy?.persist_history ?? base.privacy.persist_history,
    },
  };
}

function setNested(config: PromptBetterConfig, dotKey: ConfigDotKey, value: string | number | boolean): void {
  switch (dotKey) {
    case 'provider':
      config.provider = String(value) as PromptBetterConfig['provider'];
      return;
    case 'confirm_mode':
      config.confirm_mode = String(value) as PromptBetterConfig['confirm_mode'];
      return;
    case 'context.turns':
      config.context.turns = Number(value);
      return;
    case 'rewrite.policy':
      config.rewrite.policy = String(value) as PromptBetterConfig['rewrite']['policy'];
      return;
    case 'privacy.persist_history':
      config.privacy.persist_history = Boolean(value);
      return;
  }
}

function parsePrimitive(value: string): string | number | boolean {
  const lower = value.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
  return value;
}

function isNotFound(err: unknown): boolean {
  return Boolean(err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ENOENT');
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
