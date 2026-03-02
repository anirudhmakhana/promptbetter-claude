import { loadConfig, validateConfig } from '../config.js';
import { normalizePromptFromHook, readRecentTurnsFromTranscript, transcriptPathFromHook } from '../core/context.js';
import { readAllStdin } from '../utils/io.js';
import { buildPreviewGateContext, isPromptBetterControlReply } from '../core/claudeWorkflow.js';
import type { ClaudeHookOutput } from '../types.js';

export async function runClaudeHook(): Promise<void> {
  const raw = await readAllStdin();
  if (!raw.trim()) {
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw) as unknown;
  } catch {
    return;
  }

  const prompt = normalizePromptFromHook(payload);
  if (!prompt || !prompt.trim()) {
    return;
  }

  const config = await loadConfig();
  validateConfig(config);

  if (isPromptBetterControlReply(prompt)) {
    return;
  }

  const transcriptPath = transcriptPathFromHook(payload);
  const turns = await readRecentTurnsFromTranscript(transcriptPath, config.context.turns);

  const additionalContext = buildPreviewGateContext({
    prompt,
    turns,
    policy: config.rewrite.policy,
  });
  emitClaudeAdditionalContext(additionalContext);
}

function emitClaudeAdditionalContext(finalPrompt: string): void {
  const output: ClaudeHookOutput = {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: [
        'PromptBetter rewrite (approved by user).',
        'Treat this rewritten prompt as the authoritative expression of user intent:',
        finalPrompt,
      ].join('\n\n'),
    },
  };

  process.stdout.write(`${JSON.stringify(output)}\n`);
}
