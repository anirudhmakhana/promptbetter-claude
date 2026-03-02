import test from 'node:test';
import assert from 'node:assert/strict';
import { improvePrompt } from '../src/core/rewrite.js';
const baseConfig = {
    context: { turns: 3 },
    rewrite: { policy: 'conservative' },
    privacy: { persist_history: false },
};
test('improvePrompt generates a structured rewritten prompt', async () => {
    const result = await improvePrompt({
        prompt: 'help me review this repo and list top issues first',
        turns: [],
        config: baseConfig,
    });
    assert.ok(result.rewritten.includes('Task:'));
    assert.ok(result.rewritten.toLowerCase().includes('requirements'));
    assert.equal(typeof result.guardrails.ok, 'boolean');
});
test('improvePrompt throws when prompt is empty', async () => {
    await assert.rejects(() => improvePrompt({
        prompt: '   ',
        turns: [],
        config: baseConfig,
    }));
});
//# sourceMappingURL=rewrite.test.js.map