import { redactSecrets, redactTurns } from './redact.js';
import type { RewritePolicy, Turn } from '../types.js';

const CONTROL_HINT = [
  'PB_APPROVE',
  'PB_ORIGINAL',
  'PB_EDIT: <your edited prompt>',
].join(' | ');

interface PreviewGateInput {
  prompt: string;
  turns?: Turn[];
  policy?: RewritePolicy;
}

export function buildPreviewGateContext({ prompt, turns = [], policy = 'conservative' }: PreviewGateInput): string {
  const safePrompt = redactSecrets(prompt);
  const safeTurns = redactTurns(turns).slice(-6);

  const historyBlock =
    safeTurns.length === 0
      ? 'No extra transcript context was provided.'
      : safeTurns
          .map((turn: Turn, index: number) => `${index + 1}. ${turn.role}: ${turn.content}`)
          .join('\n');

  return [
    'PromptBetter preview mode is active.',
    'If the request is code/repo related, rewrite the prompt to be sharper and execution-ready.',
    'Keep user intent, scope, and explicit constraints unchanged.',
    `Rewrite policy: ${policy}.`,
    'Prefer concise structure: objective, key constraints, expected deliverable, exact file paths, and tests when relevant.',
    '',
    'Before execution:',
    '1. Output only a `Proposed Prompt` block.',
    `2. Ask for exactly one control reply: ${CONTROL_HINT}.`,
    '3. Do not execute until a control reply is received.',
    '4. PB_APPROVE => run proposed prompt; PB_ORIGINAL => run original prompt; PB_EDIT => run edited text.',
    '',
    'Original prompt:',
    safePrompt,
    '',
    'Recent transcript context:',
    historyBlock,
  ].join('\n');
}

export function isPromptBetterControlReply(prompt: string): boolean {
  const text = String(prompt || '').trim();
  if (!text) return false;

  if (/^PB_APPROVE$/i.test(text)) return true;
  if (/^PB_ORIGINAL$/i.test(text)) return true;
  if (/^PB_EDIT\s*:/i.test(text)) return true;
  return false;
}
