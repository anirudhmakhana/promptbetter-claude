import fs from 'node:fs/promises';
import type { JsonObject, Turn } from '../types.js';

export function normalizePromptFromHook(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  if (typeof payload.prompt === 'string') return payload.prompt;
  if (typeof payload.user_prompt === 'string') return payload.user_prompt;

  if (isRecord(payload.input) && typeof payload.input.prompt === 'string') {
    return payload.input.prompt;
  }

  if (isRecord(payload.input_data) && typeof payload.input_data.prompt === 'string') {
    return payload.input_data.prompt;
  }

  return null;
}

export function transcriptPathFromHook(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.transcript_path === 'string') return payload.transcript_path;
  if (typeof payload.session_path === 'string') return payload.session_path;
  return null;
}

export async function readRecentTurnsFromTranscript(transcriptPath: string | null, maxTurns = 3): Promise<Turn[]> {
  if (!transcriptPath) return [];

  let content: string;
  try {
    content = await fs.readFile(transcriptPath, 'utf8');
  } catch {
    return [];
  }

  const turns: Turn[] = [];
  const lines = content.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const turn = parseTranscriptLine(line);
    if (turn) turns.push(turn);
  }

  const maxEntries = Math.max(0, maxTurns * 2);
  return turns.slice(-maxEntries);
}

function parseTranscriptLine(line: string): Turn | null {
  try {
    const obj = JSON.parse(line) as unknown;
    if (!isRecord(obj)) return null;

    if (isRecord(obj.message) && obj.message.role && obj.message.content) {
      return {
        role: normalizeRole(obj.message.role),
        content: contentToText(obj.message.content),
      };
    }

    if (obj.role && obj.content) {
      return {
        role: normalizeRole(obj.role),
        content: contentToText(obj.content),
      };
    }

    if (obj.type === 'user' && typeof obj.text === 'string') {
      return { role: 'user', content: obj.text };
    }

    if (obj.type === 'assistant' && typeof obj.text === 'string') {
      return { role: 'assistant', content: obj.text };
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeRole(role: unknown): Turn['role'] {
  const value = String(role).toLowerCase();
  if (value.includes('assistant')) return 'assistant';
  return 'user';
}

function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return String(content ?? '');

  const parts: string[] = [];
  for (const item of content) {
    if (typeof item === 'string') {
      parts.push(item);
      continue;
    }

    if (isRecord(item)) {
      if (typeof item.text === 'string') parts.push(item.text);
      else if (typeof item.content === 'string') parts.push(item.content);
    }
  }

  return parts.join('\n').trim();
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
