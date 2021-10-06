import { spawnSync, SpawnSyncOptions } from 'child_process';
import * as os from 'os';
import * as path from 'path';

/**
 * Returns the installed Npx version
 */
export function getNpxVersion(): string | undefined {
  try {
    // --no-install ensures that we are checking for an installed version
    // (either locally or globally)
    const npx = os.platform() === 'win32' ? 'npx.cmd' : 'npx';
    const npxVersion = spawnSync(npx, ['--version']);
    if (npxVersion.status !== 0 || npxVersion.error) {
      return undefined;
    }
    return npxVersion.stdout.toString().trim();
  } catch (err) {
    return undefined;
  }
}

/**
 * Returns the installed Vue-Cli-Serve version
 */
export function getVueCliVersion(): string | undefined {
  try {
    // --no-install ensures that we are checking for an installed version
    // (either locally or globally)
    const npx = os.platform() === 'win32' ? 'npx.cmd' : 'npx';
    const vueCli = spawnSync(npx, ['--no-install', 'vue', '--version']);
    if (vueCli.status !== 0 || vueCli.error) {
      return undefined;
    }
    return vueCli.stdout.toString().trim();
  } catch (err) {
    return undefined;
  }
}

export function osPathJoin(platform: NodeJS.Platform) {
  return function(...paths: string[]): string {
    const joined = path.join(...paths);
    // If we are on win32 but need posix style paths
    if (os.platform() === 'win32' && platform !== 'win32') {
      return joined.replace(/\\/g, '/');
    }
    return joined;
  };
}

/**
 * Spawn sync with error handling
 */
export function exec(cmd: string, args: string[], options?: SpawnSyncOptions) {
  try {
    console.log('sp', cmd, args, options);
    const proc = spawnSync(cmd, args, options);
    console.log('proc', proc);
    if (proc.error) {
      return proc.error;
    }
    if (proc.status !== 0) {
      if (proc.stdout || proc.stderr) {
        return new Error(`[Status ${proc.status}] stdout: ${proc.stdout?.toString().trim()}\n\n\nstderr: ${proc.stderr?.toString().trim()}`);
      }
      return new Error(`${cmd} exited with status ${proc.status}`);
    }
    return proc;
  } catch (error) {
    console.log('eee', error);
    return error;
  }
  // console.log('proc', proc);
  // return proc;
}