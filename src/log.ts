type LogLevel = 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown>;

export function log(level: LogLevel, message: string, meta: LogMeta = {}): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...meta,
  };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
}

export function info(message: string, meta: LogMeta = {}): void {
  log('info', message, meta);
}

export function warn(message: string, meta: LogMeta = {}): void {
  log('warn', message, meta);
}

export function error(message: string, meta: LogMeta = {}): void {
  log('error', message, meta);
}
