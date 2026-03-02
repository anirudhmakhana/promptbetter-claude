export type ProviderKind = 'claude_workflow' | 'openai';
export type ConfirmMode = 'always' | 'auto_accept' | 'skip';
export type RewritePolicy = 'conservative' | 'balanced' | 'aggressive';
export type Role = 'user' | 'assistant';

export interface Turn {
  role: Role;
  content: string;
}

export interface PromptBetterConfig {
  provider: ProviderKind;
  confirm_mode: ConfirmMode;
  context: {
    turns: number;
  };
  rewrite: {
    policy: RewritePolicy;
  };
  privacy: {
    persist_history: boolean;
  };
}

export type ConfigDotKey =
  | 'provider'
  | 'confirm_mode'
  | 'context.turns'
  | 'rewrite.policy'
  | 'privacy.persist_history';

export interface GuardrailResult {
  ok: boolean;
  issues: string[];
  overlap?: number;
}

export interface ImprovePromptInput {
  prompt: string;
  turns: Turn[];
  config: PromptBetterConfig;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
}

export interface ImprovePromptResult {
  rewritten: string;
  guardrails: GuardrailResult;
}

export interface HookCommand {
  type: string;
  command?: string;
}

export interface HookGroup {
  hooks?: HookCommand[];
}

export interface ClaudeSettings {
  hooks?: Record<string, unknown> & {
    UserPromptSubmit?: HookGroup[];
  };
  [key: string]: unknown;
}

export interface ClaudeHookOutput {
  hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit';
    additionalContext: string;
  };
}

export type JsonObject = Record<string, unknown>;
