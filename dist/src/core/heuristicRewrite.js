export function heuristicRewritePrompt(prompt) {
    const cleaned = String(prompt || '').trim().replace(/\s+/g, ' ');
    if (!cleaned)
        return '';
    return [
        'Task:',
        cleaned,
        '',
        'Requirements:',
        '- Preserve the user intent and explicit constraints.',
        '- Keep output practical and action-oriented.',
        '- If assumptions are required, state them briefly.',
        '- Preserve any explicitly requested output format.',
    ].join('\n');
}
//# sourceMappingURL=heuristicRewrite.js.map