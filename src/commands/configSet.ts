import { setConfigValue } from '../config.js';
import type { ConfigDotKey } from '../types.js';

export async function runConfigSet(args: string[]): Promise<void> {
  const key = args[0];
  const value = args[1];

  if (!key || value === undefined) {
    throw new Error('Usage: promptbetter config set <key> <value>');
  }

  await setConfigValue(key as ConfigDotKey, value);
  process.stdout.write(`Updated ${key}\n`);
}
