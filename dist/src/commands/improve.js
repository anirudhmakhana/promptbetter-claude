import fs from 'node:fs/promises';
import { loadConfig, validateConfig } from '../config.js';
import { improvePrompt } from '../core/rewrite.js';
import { readAllStdin } from '../utils/io.js';
import { warn } from '../log.js';
export async function runImprove(args) {
    const parsed = parseArgs(args);
    const stdin = await readAllStdin();
    const prompt = parsed.prompt || stdin.trim();
    if (!prompt) {
        throw new Error('Usage: promptbetter improve --prompt "..." [--context-file path]');
    }
    const contextTurns = await readContextFile(parsed.contextFile);
    const config = await loadConfig();
    validateConfig(config);
    try {
        const result = await improvePrompt({
            prompt,
            turns: contextTurns,
            config,
        });
        if (!result.guardrails.ok) {
            warn('Guardrails flagged rewritten prompt', {
                issueCount: result.guardrails.issues.length,
            });
        }
        process.stdout.write(`${result.rewritten}\n`);
    }
    catch (err) {
        warn('Rewrite failed; returning original prompt', {
            error: err instanceof Error ? err.message : String(err),
        });
        process.stdout.write(`${prompt}\n`);
    }
}
function parseArgs(args) {
    const out = {
        prompt: '',
        contextFile: '',
    };
    for (let i = 0; i < args.length; i += 1) {
        if (args[i] === '--prompt') {
            out.prompt = args[i + 1] ?? '';
            i += 1;
        }
        else if (args[i] === '--context-file') {
            out.contextFile = args[i + 1] ?? '';
            i += 1;
        }
    }
    return out;
}
async function readContextFile(filePath) {
    if (!filePath)
        return [];
    const raw = await fs.readFile(filePath, 'utf8');
    try {
        const json = JSON.parse(raw);
        if (Array.isArray(json)) {
            return json
                .filter((item) => {
                return typeof item === 'object' && item !== null && typeof item.content === 'string';
            })
                .map((item) => ({
                role: item.role === 'assistant' ? 'assistant' : 'user',
                content: item.content,
            }));
        }
    }
    catch {
        // Fall through to plaintext behavior.
    }
    return [{ role: 'user', content: raw }];
}
//# sourceMappingURL=improve.js.map