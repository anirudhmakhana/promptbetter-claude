import fs from 'node:fs/promises';
import { CLAUDE_HOOK_COMMAND, getClaudeSettingsPath } from './installClaude.js';
export async function uninstallClaudeHook() {
    const settingsPath = getClaudeSettingsPath();
    let settings;
    try {
        const raw = await fs.readFile(settingsPath, 'utf8');
        settings = JSON.parse(raw);
    }
    catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
            process.stdout.write(`Claude settings not found at ${settingsPath}. Nothing to uninstall.\n`);
            return;
        }
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to read Claude settings at ${settingsPath}: ${message}`);
    }
    const groups = settings?.hooks?.UserPromptSubmit;
    if (!Array.isArray(groups)) {
        process.stdout.write(`No UserPromptSubmit hooks found in ${settingsPath}. Nothing to uninstall.\n`);
        return;
    }
    const cleanedGroups = groups
        .map((group) => {
        const hooks = Array.isArray(group?.hooks) ? group.hooks : [];
        const filteredHooks = hooks.filter((h) => !(h?.type === 'command' && h?.command === CLAUDE_HOOK_COMMAND));
        return {
            ...group,
            hooks: filteredHooks,
        };
    })
        .filter((group) => Array.isArray(group.hooks) && group.hooks.length > 0);
    const removed = countRemovedHooks(groups, cleanedGroups);
    if (removed === 0) {
        process.stdout.write(`No promptbetter Claude hook found in ${settingsPath}. Nothing to uninstall.\n`);
        return;
    }
    if (!settings.hooks || typeof settings.hooks !== 'object') {
        settings.hooks = {};
    }
    settings.hooks.UserPromptSubmit = cleanedGroups;
    await fs.writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
    process.stdout.write(`Uninstalled Claude hook from ${settingsPath}\n`);
}
function countRemovedHooks(oldGroups, newGroups) {
    const oldCount = oldGroups
        .flatMap((group) => (Array.isArray(group?.hooks) ? group.hooks : []))
        .filter((h) => h?.type === 'command' && h?.command === CLAUDE_HOOK_COMMAND).length;
    const newCount = newGroups
        .flatMap((group) => (Array.isArray(group?.hooks) ? group.hooks : []))
        .filter((h) => h?.type === 'command' && h?.command === CLAUDE_HOOK_COMMAND).length;
    return oldCount - newCount;
}
//# sourceMappingURL=uninstallClaude.js.map