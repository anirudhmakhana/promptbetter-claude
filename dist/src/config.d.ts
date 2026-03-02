import type { ConfigDotKey, PromptBetterConfig } from './types.js';
export declare const DEFAULT_CONFIG: PromptBetterConfig;
export declare function getConfigPath(): string;
export declare function loadConfig(): Promise<PromptBetterConfig>;
export declare function saveConfig(config: PromptBetterConfig): Promise<void>;
export declare function setConfigValue(dotKey: ConfigDotKey, value: string): Promise<PromptBetterConfig>;
export declare function validateConfig(config: PromptBetterConfig): void;
export declare function toToml(config: PromptBetterConfig): string;
