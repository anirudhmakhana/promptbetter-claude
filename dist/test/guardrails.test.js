import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGuardrails } from '../src/core/guardrails.js';
test('guardrails detect missing output format keyword', () => {
    const original = 'Please summarize this and output as JSON. You must include exactly 3 bullets.';
    const rewritten = 'Summarize the content clearly with key points.';
    const result = evaluateGuardrails(original, rewritten);
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.toLowerCase().includes('format')));
});
test('guardrails pass on conservative rewrite', () => {
    const original = 'Create a markdown table with 3 rows. Do not include extra commentary.';
    const rewritten = 'Create a markdown table with exactly 3 rows and no extra commentary.';
    const result = evaluateGuardrails(original, rewritten);
    assert.equal(result.ok, true);
});
//# sourceMappingURL=guardrails.test.js.map