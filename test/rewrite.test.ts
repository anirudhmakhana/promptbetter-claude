import test from 'node:test';
import assert from 'node:assert/strict';
import { improvePrompt } from '../src/core/rewrite.js';
import type { PromptBetterConfig } from '../src/types.js';

const baseConfig: PromptBetterConfig = {
  provider: 'openai',
  confirm_mode: 'always',
  context: { turns: 3 },
  rewrite: { policy: 'conservative' },
  privacy: { persist_history: false },
};

test('improvePrompt returns rewritten content when provider succeeds', async () => {
  const fetchImpl: typeof fetch = async () =>
    makeResponse({
      choices: [{ message: { content: 'Rewritten prompt text' } }],
    });

  const result = await improvePrompt({
    prompt: 'Write a markdown summary',
    turns: [],
    config: baseConfig,
    env: { OPENAI_API_KEY: 'sk-test-test-test-test-test' },
    fetchImpl,
  });

  assert.equal(result.rewritten, 'Rewritten prompt text');
  assert.equal(typeof result.guardrails.ok, 'boolean');
});

test('improvePrompt throws when api key missing', async () => {
  await assert.rejects(() =>
    improvePrompt({
      prompt: 'Write a markdown summary',
      turns: [],
      config: baseConfig,
      env: {},
      fetchImpl: (async () => makeResponse({ ok: true })) as typeof fetch,
    }),
  );
});

test('improvePrompt supports claude_workflow provider without api key', async () => {
  const result = await improvePrompt({
    prompt: 'help me review this repo and list top issues first',
    turns: [],
    config: {
      ...baseConfig,
      provider: 'claude_workflow',
    },
    env: {},
  });

  assert.ok(result.rewritten.includes('Task:'));
  assert.ok(result.rewritten.toLowerCase().includes('requirements'));
});

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}
