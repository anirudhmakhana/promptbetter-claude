import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
function runHook(input) {
    const binPath = path.resolve('dist/bin/promptbetter.js');
    return spawnSync('node', [binPath, 'claude-hook'], {
        input,
        encoding: 'utf8',
    });
}
test('claude-hook outputs additionalContext JSON for normal prompt without stderr noise', () => {
    const result = runHook(JSON.stringify({ prompt: 'Review this repository' }));
    assert.equal(result.status, 0);
    assert.equal(result.stderr, '');
    assert.notEqual(result.stdout.trim(), '');
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
    assert.equal(typeof parsed.hookSpecificOutput.additionalContext, 'string');
});
test('claude-hook control reply is silent and successful', () => {
    const result = runHook(JSON.stringify({ prompt: 'PB_APPROVE' }));
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
});
test('claude-hook invalid JSON payload is silent and successful', () => {
    const result = runHook('{not-json');
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
});
//# sourceMappingURL=claudeHook.test.js.map