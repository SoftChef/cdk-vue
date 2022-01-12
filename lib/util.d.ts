/// <reference types="node" />
import { SpawnSyncOptions } from 'child_process';
/**
 * Returns the installed Npx version
 */
export declare function getNpxVersion(): string | undefined;
/**
 * Returns the installed Vue-Cli-Serve version
 */
export declare function getVueCliVersion(): string | undefined;
export declare function osPathJoin(platform: NodeJS.Platform): (...paths: string[]) => string;
/**
 * Spawn sync with error handling
 */
export declare function exec(cmd: string, args: string[], options?: SpawnSyncOptions): import("child_process").SpawnSyncReturns<string | Buffer>;
