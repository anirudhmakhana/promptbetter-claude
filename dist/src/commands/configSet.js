import { setConfigValue } from '../config.js';
export async function runConfigSet(args) {
    const key = args[0];
    const value = args[1];
    if (!key || value === undefined) {
        throw new Error('Usage: promptbetter config set <key> <value>');
    }
    await setConfigValue(key, value);
    process.stdout.write(`Updated ${key}\n`);
}
//# sourceMappingURL=configSet.js.map