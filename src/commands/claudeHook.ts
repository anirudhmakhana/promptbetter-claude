import { loadConfig, validateConfig } from '../config.js';
import { normalizePromptFromHook, readRecentTurnsFromTranscript, transcriptPathFromHook } from '../core/context.js';
import { readAllStdin } from '../utils/io.js';
import { warn, info } from '../log.js';
import { buildPreviewGateContext, isPromptBetterControlReply } from '../core/claudeWorkflow.js';
import type { ClaudeHookOutput } from '../types.js';

export async function runClaudeHook(): Promise<void> {
  const raw = await readAllStdin();
  if (!raw.trim()) {
    info('Empty hook payload, passing through');
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw) as unknown;
  } catch {
    warn('Invalid hook JSON payload, passing through');
    return;
  }

  const prompt = normalizePromptFromHook(payload);
  if (!prompt || !prompt.trim()) {
    warn('Hook payload did not include prompt, passing through');
    return;
  }

  const config = await loadConfig();
  validateConfig(config);

  if (isPromptBetterControlReply(prompt)) {
    info('Detected PromptBetter control reply, skipping additional context injection');
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
