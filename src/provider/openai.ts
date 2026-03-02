import { redactSecrets } from '../core/redact.js';
import type { RewritePolicy, Turn } from '../types.js';

const DEFAULT_TIMEOUT_MS = 12000;

interface OpenAIRewriteParams {
  apiKey?: string;
  model: string;
  policy: RewritePolicy;
  rawPrompt: string;
  turns: Turn[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function rewriteWithOpenAI({
  apiKey,
  model,
  policy,
  rawPrompt,
  turns,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: OpenAIRewriteParams): Promise<string> {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const systemPrompt = buildSystemPrompt(policy);
  const payload = {
    prompt: redactSecrets(rawPrompt),
    context: turns,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await safeText(response);
    throw new Error(`OpenAI request failed (${response.status}): ${body.slice(0, 240)}`);
  }

  const json = (await response.json()) as OpenAIChatResponse;
  const content = json.choices?.[0]?.message?.content;
  const rewritten = typeof content === 'string' ? content.trim() : '';

  if (!rewritten) {
    throw new Error('OpenAI response did not include rewritten prompt content');
  }

  return rewritten;
}

function buildSystemPrompt(policy: RewritePolicy): string {
  const base = [
    'You rewrite user prompts for another LLM.',
    'Keep user intent unchanged and do not add unrelated goals.',
    'Improve clarity by structuring objective, constraints, context, inputs, and output format.',
    'Preserve all explicit constraints and requested format exactly.',
    'If context is ambiguous, include minimal assumptions explicitly.',
    'Return only the rewritten prompt text. No explanation.',
  ];

  if (policy === 'conservative') {
    base.push('Policy is conservative: preserve original phrasing where possible and only tighten clarity.');
  } else if (policy === 'balanced') {
    base.push('Policy is balanced: permit moderate reframing if it improves execution quality.');
  } else {
    base.push('Policy is aggressive: optimize strongly for model performance while keeping core intent.');
  }

  return base.join('\n');
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
