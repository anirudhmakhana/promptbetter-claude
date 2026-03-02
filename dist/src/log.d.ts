type LogLevel = 'info' | 'warn' | 'error';
type LogMeta = Record<string, unknown>;
export declare function log(level: LogLevel, message: string, meta?: LogMeta): void;
export declare function info(message: string, meta?: LogMeta): void;
export declare function warn(message: string, meta?: LogMeta): void;
export declare function error(message: string, meta?: LogMeta): void;
export {};
