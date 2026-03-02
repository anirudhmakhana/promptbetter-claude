import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { readRecentTurnsFromTranscript } from '../src/core/context.js';
test('readRecentTurnsFromTranscript trims to last N turns x2 entries', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-ctx-'));
    const transcript = path.join(dir, 'transcript.jsonl');
    const lines = [
        { role: 'user', content: 'u1' },
        { role: 'assistant', content: 'a1' },
        { role: 'user', content: 'u2' },
        { role: 'assistant', content: 'a2' },
        { role: 'user', content: 'u3' },
        { role: 'assistant', content: 'a3' },
        { role: 'user', content: 'u4' },
        { role: 'assistant', content: 'a4' },
    ].map((obj) => JSON.stringify(obj));
    await fs.writeFile(transcript, `${lines.join('\n')}\n`, 'utf8');
    const turns = await readRecentTurnsFromTranscript(transcript, 3);
    assert.equal(turns.length, 6);
    const first = turns[0];
    const last = turns.at(-1);
    assert.ok(first);
    assert.ok(last);
    assert.equal(first.content, 'u2');
    assert.equal(last.content, 'a4');
});
//# sourceMappingURL=context.test.js.map