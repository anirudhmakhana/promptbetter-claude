import { redactSecrets, redactTurns } from './redact.js';
const CONTROL_HINT = [
    'PB_APPROVE',
    'PB_ORIGINAL',
    'PB_EDIT: <your edited prompt>',
].join(' | ');
export function buildPreviewGateContext({ prompt, turns = [], policy = 'conservative' }) {
    const safePrompt = redactSecrets(prompt);
    const safeTurns = redactTurns(turns).slice(-6);
    const historyBlock = safeTurns.length === 0
        ? 'No extra transcript context was provided.'
        : safeTurns
            .map((turn, index) => `${index + 1}. ${turn.role}: ${turn.content}`)
            .join('\n');
    return [
        'PromptBetter Preview Gate is active for this turn.',
        '',
        'Use project skill `promptbetter-preview` if available in this workspace.',
        '',
        `Rewrite policy: ${policy}`,
        '',
        'Technical prompt requirements (mandatory):',
        '- Optimize for software engineering tasks only unless user explicitly asks otherwise.',
        '- Preserve user intent and all explicit constraints.',
        '- Expand the prompt into an implementation-grade spec, not a short summary.',
        '- Include concrete repo actions (what to inspect, what to modify, what to verify).',
        '- Require exact file paths in deliverables and code-change guidance.',
        '- Require a test plan tied to each proposed change.',
        '- Require fallback behavior to avoid breaking existing flows.',
        '',
        'Proposed Prompt must include these sections in order:',
        '1. Goal',
        '2. Repo Context to Inspect',
        '3. Constraints',
        '4. Implementation Tasks (with exact file paths)',
        '5. Test Plan',
        '6. Output Format',
        '',
        'Before doing any task execution, do exactly this:',
        '1. Generate a deep technical improved prompt that follows the required sections.',
        '2. Print it under heading: `Proposed Prompt` in a fenced block.',
        `3. Ask user to reply with one of: ${CONTROL_HINT}.`,
        '4. Do not execute the task until user confirmation is received.',
        '5. If PB_APPROVE: execute using proposed prompt.',
        '6. If PB_ORIGINAL: execute using original prompt.',
        '7. If PB_EDIT: use edited prompt text after the colon and execute.',
        '',
        'Original prompt (authoritative source):',
        safePrompt,
        '',
        'Recent transcript excerpt:',
        historyBlock,
    ].join('\n');
}
export function isPromptBetterControlReply(prompt) {
    const text = String(prompt || '').trim();
    if (!text)
        return false;
    if (/^PB_APPROVE$/i.test(text))
        return true;
    if (/^PB_ORIGINAL$/i.test(text))
        return true;
    if (/^PB_EDIT\s*:/i.test(text))
        return true;
    return false;
}
//# sourceMappingURL=claudeWorkflow.js.map