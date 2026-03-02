import { evaluateGuardrails } from './guardrails.js';
import { heuristicRewritePrompt } from './heuristicRewrite.js';
export async function improvePrompt({ prompt, }) {
    if (!prompt || !prompt.trim()) {
        throw new Error('Prompt is required');
    }
    const rewritten = heuristicRewritePrompt(prompt);
    const guardrails = evaluateGuardrails(prompt, rewritten);
    return {
        rewritten,
        guardrails,
    };
}
//# sourceMappingURL=rewrite.js.map