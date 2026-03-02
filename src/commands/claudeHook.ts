import { loadConfig, validateConfig } from '../config.js';
import { improvePrompt } from '../core/rewrite.js';
import { normalizePromptFromHook, readRecentTurnsFromTranscript, transcriptPathFromHook } from '../core/context.js';
import { choosePromptVersion, readAllStdin } from '../utils/io.js';
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

  const transcriptPath = transcriptPathFromHook(payload);
  const turns = await readRecentTurnsFromTranscript(transcriptPath, config.context.turns);

  if (config.provider === 'claude_workflow') {
    if (isPromptBetterControlReply(prompt)) {
      info('Detected PromptBetter control reply, skipping additional context injection');
      return;
    }

    const additionalContext = buildPreviewGateContext({
      prompt,
      turns,
      policy: config.rewrite.policy,
    });
    emitClaudeAdditionalContext(additionalContext);
    return;
  }

  let rewritten = prompt;
  let guardrailIssues: string[] = [];

  try {
    const result = await improvePrompt({
      prompt,
      turns,
      config,
    });
    rewritten = result.rewritten;
    guardrailIssues = result.guardrails.issues;
  } catch (err: unknown) {
    warn('Rewrite failed, passing through original prompt', {
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  if (config.confirm_mode === 'skip') {
    info('confirm_mode=skip, passing through original prompt');
    return;
  }

  if (config.confirm_mode === 'auto_accept') {
    emitClaudeAdditionalContext(rewritten);
    return;
  }

  const decision = await choosePromptVersion({
    original: prompt,
    improved: rewritten,
    guardrailIssues,
    timeoutMs: 30000,
    defaultMode: 'accept',
  });

  if (decision.mode === 'skip') {
    info('User skipped rewrite');
    return;
  }

  emitClaudeAdditionalContext(decision.finalPrompt);
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
