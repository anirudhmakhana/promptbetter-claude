import type { Turn } from '../types.js';
export declare function normalizePromptFromHook(payload: unknown): string | null;
export declare function transcriptPathFromHook(payload: unknown): string | null;
export declare function readRecentTurnsFromTranscript(transcriptPath: string | null, maxTurns?: number): Promise<Turn[]>;
