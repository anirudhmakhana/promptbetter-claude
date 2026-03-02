import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
export const DEFAULT_CONFIG = {
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
const ALLOWED_KEYS = new Set([
    'context.turns',
    'rewrite.policy',
    'privacy.persist_history',
]);
export function getConfigPath() {
    const home = process.env.HOME || os.homedir();
    return path.join(home, '.promptbetter', 'config.toml');
}
export async function loadConfig() {
    const configPath = getConfigPath();
    try {
        const raw = await fs.readFile(configPath, 'utf8');
        const parsed = parseToml(raw);
        return deepMerge(DEFAULT_CONFIG, parsed);
    }
    catch (err) {
        if (isNotFound(err)) {
            return structuredClone(DEFAULT_CONFIG);
        }
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to read config: ${message}`);
    }
}
export async function saveConfig(config) {
    const configPath = getConfigPath();
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    const body = toToml(config);
    await fs.writeFile(configPath, body, 'utf8');
}
export async function setConfigValue(dotKey, value) {
    if (!ALLOWED_KEYS.has(dotKey)) {
        throw new Error(`Unsupported config key: ${dotKey}`);
    }
    const config = await loadConfig();
    setNested(config, dotKey, parsePrimitive(value));
    validateConfig(config);
    await saveConfig(config);
    return config;
}
export function validateConfig(config) {
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
function parseToml(input) {
    const out = {};
    let section = null;
    for (const rawLine of input.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#'))
            continue;
        if (line.startsWith('[') && line.endsWith(']')) {
            section = line.slice(1, -1).trim();
            if (!section)
                throw new Error('Invalid section name');
            if (!isRecord(out[section]))
                out[section] = {};
            continue;
        }
        const idx = line.indexOf('=');
        if (idx === -1)
            continue;
        const key = line.slice(0, idx).trim();
        const valueRaw = line.slice(idx + 1).trim();
        const value = parseTomlValue(valueRaw);
        if (section) {
            const sec = out[section];
            if (!isRecord(sec)) {
                out[section] = {};
            }
            out[section][key] = value;
        }
        else {
            out[key] = value;
        }
    }
    return out;
}
function parseTomlValue(v) {
    if (v === 'true')
        return true;
    if (v === 'false')
        return false;
    if (/^-?\d+$/.test(v))
        return Number.parseInt(v, 10);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        return v.slice(1, -1);
    }
    return v;
}
function escapeToml(str) {
    return String(str).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
export function toToml(config) {
    const lines = [];
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
function deepMerge(base, override) {
    return {
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
function setNested(config, dotKey, value) {
    switch (dotKey) {
        case 'context.turns':
            config.context.turns = Number(value);
            return;
        case 'rewrite.policy':
            config.rewrite.policy = String(value);
            return;
        case 'privacy.persist_history':
            config.privacy.persist_history = Boolean(value);
            return;
    }
}
function parsePrimitive(value) {
    const lower = value.toLowerCase();
    if (lower === 'true')
        return true;
    if (lower === 'false')
        return false;
    if (/^-?\d+$/.test(value))
        return Number.parseInt(value, 10);
    return value;
}
function isNotFound(err) {
    return Boolean(err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT');
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=config.js.map