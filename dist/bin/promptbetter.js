#!/usr/bin/env node
import { runCli } from '../src/cli.js';
runCli(process.argv.slice(2)).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[promptbetter] fatal: ${message}\n`);
    process.exit(1);
});
//# sourceMappingURL=promptbetter.js.map