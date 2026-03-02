export function log(level, message, meta = {}) {
    const payload = {
        ts: new Date().toISOString(),
        level,
        msg: message,
        ...meta,
    };
    process.stderr.write(`${JSON.stringify(payload)}\n`);
}
export function info(message, meta = {}) {
    log('info', message, meta);
}
export function warn(message, meta = {}) {
    log('warn', message, meta);
}
export function error(message, meta = {}) {
    log('error', message, meta);
}
//# sourceMappingURL=log.js.map