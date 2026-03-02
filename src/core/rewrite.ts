import { rewriteWithOpenAI } from '../provider/openai.js';
import { evaluateGuardrails } from './guardrails.js';
import { redactTurns } from './redact.js';
import { heuristicRewritePrompt } from './heuristicRewrite.js';
import type { ImprovePromptInput, ImprovePromptResult } from '../types.js';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';

export async function improvePrompt({
  prompt,
  turns,
  config,
  env = process.env,
  fetchImpl,
}: ImprovePromptInput): Promise<ImprovePromptResult> {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt is required');
  }

  const provider = config.provider;
  if (!['openai', 'claude_workflow'].includes(provider)) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (provider === 'claude_workflow') {
    const rewritten = heuristicRewritePrompt(prompt);
    const guardrails = evaluateGuardrails(prompt, rewritten);
    return {
      rewritten,
      guardrails,
    };
  }

  const redactedTurns = redactTurns(turns || []);

  const openAiArgs: {
    apiKey: string;
    model: string;
    policy: ImprovePromptInput['config']['rewrite']['policy'];
    rawPrompt: string;
    turns: typeof redactedTurns;
    fetchImpl?: typeof fetch;
  } = {
    apiKey: env.OPENAI_API_KEY ?? '',
    model: DEFAULT_OPENAI_MODEL,
    policy: config.rewrite.policy,
    rawPrompt: prompt,
    turns: redactedTurns,
  };
  if (fetchImpl) {
    openAiArgs.fetchImpl = fetchImpl;
  }

  const rewritten = await rewriteWithOpenAI(openAiArgs);

  const guardrails = evaluateGuardrails(prompt, rewritten);
  return {
    rewritten,
    guardrails,
  };
}
