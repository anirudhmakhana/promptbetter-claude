import { evaluateGuardrails } from './guardrails.js';
import { heuristicRewritePrompt } from './heuristicRewrite.js';
import type { ImprovePromptInput, ImprovePromptResult } from '../types.js';

export async function improvePrompt({
  prompt,
}: ImprovePromptInput): Promise<ImprovePromptResult> {
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
