const FORMAT_KEYWORDS = ['json', 'yaml', 'xml', 'markdown', 'table', 'bullet', 'csv', 'code block'];
const STOPWORDS = new Set(['the', 'a', 'an', 'to', 'for', 'in', 'on', 'at', 'with', 'and', 'or', 'is', 'are', 'be', 'it', 'that', 'this', 'as']);
export function evaluateGuardrails(original, rewritten) {
    const issues = [];
    if (!rewritten || !rewritten.trim()) {
        issues.push('Rewrite is empty');
        return { ok: false, issues };
    }
    issues.push(...checkFormats(original, rewritten));
    issues.push(...checkExplicitConstraints(original, rewritten));
    const overlap = lexicalOverlap(original, rewritten);
    if (overlap < 0.18) {
        issues.push('Low intent overlap between original and rewritten prompt');
    }
    return {
        ok: issues.length === 0,
        issues,
        overlap,
    };
}
function checkFormats(original, rewritten) {
    const issues = [];
    const o = original.toLowerCase();
    const r = rewritten.toLowerCase();
    for (const keyword of FORMAT_KEYWORDS) {
        if (o.includes(keyword) && !r.includes(keyword)) {
            issues.push(`Requested output format appears missing: ${keyword}`);
        }
    }
    return issues;
}
function checkExplicitConstraints(original, rewritten) {
    const clauses = extractConstraintClauses(original);
    const issues = [];
    for (const clause of clauses) {
        const significant = words(clause).filter((w) => w.length > 3 && !STOPWORDS.has(w));
        if (significant.length === 0)
            continue;
        const rewrittenWords = new Set(words(rewritten));
        const found = significant.some((w) => rewrittenWords.has(w));
        if (!found) {
            issues.push(`Possible missing constraint: "${trimClause(clause)}"`);
        }
    }
    return issues;
}
function extractConstraintClauses(text) {
    const clauses = [];
    const regex = /(must|should|do not|don't|only|exactly|required|without)\b[^.!?\n]{0,140}/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
        clauses.push(match[0].trim());
    }
    for (const line of text.split(/\r?\n/)) {
        if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
            clauses.push(line.trim());
        }
    }
    return clauses;
}
function lexicalOverlap(a, b) {
    const aSet = new Set(words(a).filter((w) => w.length > 3 && !STOPWORDS.has(w)));
    const bSet = new Set(words(b).filter((w) => w.length > 3 && !STOPWORDS.has(w)));
    if (aSet.size === 0)
        return 1;
    let intersection = 0;
    for (const word of aSet) {
        if (bSet.has(word))
            intersection += 1;
    }
    return intersection / aSet.size;
}
function words(input) {
    return input.toLowerCase().match(/[a-z0-9_]+/g) ?? [];
}
function trimClause(clause) {
    if (clause.length <= 80)
        return clause;
    return `${clause.slice(0, 77)}...`;
}
//# sourceMappingURL=guardrails.js.map