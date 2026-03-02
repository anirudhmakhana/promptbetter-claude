import fs from 'node:fs';
import readline from 'node:readline/promises';
import type { Interface } from 'node:readline/promises';

type DecisionMode = 'accept' | 'edit' | 'skip';

interface PromptChoiceInput {
  original: string;
  improved: string;
  guardrailIssues?: string[];
  timeoutMs?: number;
  defaultMode?: 'accept' | 'skip';
}

interface PromptChoiceOutput {
  mode: DecisionMode;
  finalPrompt: string;
}

interface TtyInterface {
  rl: Interface;
  out: fs.WriteStream;
  close: () => void;
}

export async function readAllStdin(): Promise<string> {
  if (process.stdin.isTTY) return '';
  let data = '';
  for await (const chunk of process.stdin) {
    data += String(chunk);
  }
  return data;
}

export async function choosePromptVersion({
  original,
  improved,
  guardrailIssues = [],
  timeoutMs = 30000,
  defaultMode = 'skip',
}: PromptChoiceInput): Promise<PromptChoiceOutput> {
  const tty = openTtyInterface();
  if (!tty) {
    return fallbackDecision(defaultMode, original, improved);
  }

  const { rl, out, close } = tty;
  try {
    out.write('\n[promptbetter] Proposed rewrite:\n');
    out.write('----------------------------------------\n');
    out.write(`${improved}\n`);
    out.write('----------------------------------------\n');

    if (guardrailIssues.length > 0) {
      out.write('[promptbetter] Guardrail warnings:\n');
      for (const issue of guardrailIssues) {
        out.write(`- ${issue}\n`);
      }
    }

    out.write('[promptbetter] Choose: (a)ccept, (e)dit, (s)kip [default: s]\n');
    const choice = (await questionWithTimeout(rl, '> ', timeoutMs)).trim().toLowerCase();

    if (choice === 'a' || choice === 'accept') {
      return { mode: 'accept', finalPrompt: improved };
    }

    if (choice === 'e' || choice === 'edit') {
      out.write('[promptbetter] Enter edited prompt. Finish with an empty line.\n');
      const lines: string[] = [];
      while (true) {
        const line = await rl.question('');
        if (!line && lines.length > 0) break;
        if (!line && lines.length === 0) {
          out.write('[promptbetter] Empty edit, using improved prompt.\n');
          return { mode: 'accept', finalPrompt: improved };
        }
        lines.push(line);
      }
      return { mode: 'edit', finalPrompt: lines.join('\n') };
    }

    return fallbackDecision(defaultMode, original, improved);
  } finally {
    close();
  }
}

function fallbackDecision(mode: 'accept' | 'skip', original: string, improved: string): PromptChoiceOutput {
  if (mode === 'accept') {
    return { mode: 'accept', finalPrompt: improved };
  }
  return { mode: 'skip', finalPrompt: original };
}

async function questionWithTimeout(rl: Interface, prompt: string, timeoutMs: number): Promise<string> {
  if (!timeoutMs || timeoutMs <= 0) {
    return rl.question(prompt);
  }

  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      rl.question(prompt),
      new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve(''), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function openTtyInterface(): TtyInterface | null {
  try {
    const input = fs.createReadStream('/dev/tty');
    const output = fs.createWriteStream('/dev/tty');
    const rl = readline.createInterface({ input, output });
    return {
      rl,
      out: output,
      close() {
        rl.close();
        input.destroy();
        output.end();
      },
    };
  } catch {
    return null;
  }
}
