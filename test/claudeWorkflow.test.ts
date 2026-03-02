import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPreviewGateContext, isPromptBetterControlReply } from '../src/core/claudeWorkflow.js';

test('buildPreviewGateContext includes confirmation controls', () => {
  const context = buildPreviewGateContext({
    prompt: 'help me write a launch plan',
    turns: [{ role: 'user', content: 'we ship friday' }],
    policy: 'conservative',
  });

  assert.ok(context.includes('PB_APPROVE'));
  assert.ok(context.includes('PB_ORIGINAL'));
  assert.ok(context.includes('PB_EDIT:'));
  assert.ok(context.includes('Proposed Prompt'));
  assert.ok(context.includes('Technical prompt requirements'));
  assert.ok(context.includes('Implementation Tasks (with exact file paths)'));
  assert.ok(context.includes('Test Plan'));
});

test('isPromptBetterControlReply detects control commands', () => {
  assert.equal(isPromptBetterControlReply('PB_APPROVE'), true);
  assert.equal(isPromptBetterControlReply('pb_original'), true);
  assert.equal(isPromptBetterControlReply('PB_EDIT: tighten this prompt'), true);
  assert.equal(isPromptBetterControlReply('Please improve this prompt'), false);
});
