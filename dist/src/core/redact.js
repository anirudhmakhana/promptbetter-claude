const REDACTION_PATTERNS = [
    /\bsk-[A-Za-z0-9]{20,}\b/g,
    /\bghp_[A-Za-z0-9]{20,}\b/g,
    /\bAKIA[0-9A-Z]{16}\b/g,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    /\b(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi,
];
export function redactSecrets(text) {
    let output = text;
    for (const pattern of REDACTION_PATTERNS) {
        output = output.replace(pattern, (_match, label) => {
            if (label)
                return `${label}=[REDACTED]`;
            return '[REDACTED_SECRET]';
        });
    }
    return output;
}
export function redactTurns(turns) {
    return turns.map((turn) => ({
        ...turn,
        content: redactSecrets(turn.content),
    }));
}
//# sourceMappingURL=redact.js.map