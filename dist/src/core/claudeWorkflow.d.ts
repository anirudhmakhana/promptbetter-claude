import type { RewritePolicy, Turn } from '../types.js';
interface PreviewGateInput {
    prompt: string;
    turns?: Turn[];
    policy?: RewritePolicy;
}
export declare function buildPreviewGateContext({ prompt, turns, policy }: PreviewGateInput): string;
export declare function isPromptBetterControlReply(prompt: string): boolean;
export {};
