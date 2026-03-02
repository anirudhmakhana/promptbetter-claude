import type { RewritePolicy, Turn } from '../types.js';
interface OpenAIRewriteParams {
    apiKey?: string;
    model: string;
    policy: RewritePolicy;
    rawPrompt: string;
    turns: Turn[];
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
}
export declare function rewriteWithOpenAI({ apiKey, model, policy, rawPrompt, turns, fetchImpl, timeoutMs, }: OpenAIRewriteParams): Promise<string>;
export {};
