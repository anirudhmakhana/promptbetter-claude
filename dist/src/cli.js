import { printHelp } from './commands/help.js';
import { installClaudeHook } from './commands/installClaude.js';
import { runClaudeHook } from './commands/claudeHook.js';
import { runDoctor } from './commands/doctor.js';
import { runImprove } from './commands/improve.js';
import { runConfigSet } from './commands/configSet.js';
import { uninstallClaudeHook } from './commands/uninstallClaude.js';
export async function runCli(args) {
    const [command, ...rest] = args;
    if (!command || command === '--help' || command === '-h') {
        printHelp();
        return;
    }
    if (command === 'install') {
        const target = rest[0];
        if (target !== 'claude') {
            throw new Error('Usage: promptbetter install claude');
        }
        await installClaudeHook();
        return;
    }
    if (command === 'uninstall') {
        const target = rest[0];
        if (target !== 'claude') {
            throw new Error('Usage: promptbetter uninstall claude');
        }
        await uninstallClaudeHook();
        return;
    }
    if (command === 'claude-hook') {
        await runClaudeHook();
        return;
    }
    if (command === 'improve') {
        await runImprove(rest);
        return;
    }
    if (command === 'doctor') {
        await runDoctor();
        return;
    }
    if (command === 'config') {
        const sub = rest[0];
        if (sub !== 'set') {
            throw new Error('Usage: promptbetter config set <key> <value>');
        }
        await runConfigSet(rest.slice(1));
        return;
    }
    throw new Error(`Unknown command: ${command}`);
}
//# sourceMappingURL=cli.js.map