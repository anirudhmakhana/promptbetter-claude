import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig, getConfigPath } from '../config.js';
import { getClaudeSettingsPath, CLAUDE_HOOK_COMMAND } from './installClaude.js';
export async function runDoctor() {
    const checks = [];
    const configPath = getConfigPath();
    try {
        await fs.access(configPath);
        checks.push(ok(`Config file exists: ${configPath}`));
    }
    catch {
        checks.push(warn(`Config file missing, defaults will be used: ${configPath}`));
    }
    const config = await loadConfig();
    checks.push(ok('Mode: Claude workflow only (no external API key required)'));
    const skillPath = path.join(process.cwd(), '.claude', 'skills', 'promptbetter-preview', 'SKILL.md');
    try {
        await fs.access(skillPath);
        checks.push(ok(`Workspace skill found: ${skillPath}`));
    }
    catch {
        checks.push(warn(`Workspace skill missing: ${skillPath}`));
    }
    const settingsPath = getClaudeSettingsPath();
    try {
        const raw = await fs.readFile(settingsPath, 'utf8');
        const parsed = JSON.parse(raw);
        const installed = Boolean(parsed?.hooks?.UserPromptSubmit?.some((group) => Array.isArray(group?.hooks) &&
            group.hooks.some((h) => h?.type === 'command' && h?.command === CLAUDE_HOOK_COMMAND)));
        if (installed) {
            checks.push(ok(`Claude hook installed in ${settingsPath}`));
        }
        else {
            checks.push(fail(`Claude hook missing in ${settingsPath}`));
        }
    }
    catch {
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
function ok(message) {
    return `OK   ${message}`;
}
function warn(message) {
    return `WARN ${message}`;
}
function fail(message) {
    return `FAIL ${message}`;
}
//# sourceMappingURL=doctor.js.map