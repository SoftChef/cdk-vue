import {
  SpawnSyncOptions,
} from 'child_process';
import * as os from 'os';
import * as path from 'path';
import {
  ISource,
  Source,
} from '@aws-cdk/aws-s3-deployment';
import {
  AssetStaging,
  BundlingOptions,
  DockerImage,
  ILocalBundling,
} from '@aws-cdk/core';
import {
  VueCliBuildProps,
} from './types';
import {
  getNpxVersion,
  getVueCliVersion,
  exec,
} from './util';

const NPX_MAJOR_VERSION = '6';

export class VueCliBundling implements BundlingOptions {

  public static bundling(options: VueCliBuildProps): ISource {
    return Source.asset(
      options.source,
      {
        bundling: new VueCliBundling(options),
      },
    );
  }

  private static runsLocally?: boolean | true;

  public readonly image: DockerImage;

  public readonly command?: string[] | undefined;

  public readonly environment?: { [key: string]: string } | {};

  public readonly bundlingArguments?: string | '';

  public readonly local?: ILocalBundling | undefined;

  constructor(props: VueCliBuildProps) {
    VueCliBundling.runsLocally = (getNpxVersion()?.startsWith(NPX_MAJOR_VERSION) && getVueCliVersion()?.startsWith('@vue/cli')) ?? false;
    const bundlingArguments = props.bundlingArguments ?? '';
    const bundlingCommand = this.createDockerBundlingCommand(AssetStaging.BUNDLING_OUTPUT_DIR, bundlingArguments);
    this.image = VueCliBundling.runsLocally ? DockerImage.fromRegistry('williamyeh/dummy') : DockerImage.fromRegistry(`${props.nodeImage ?? 'public.ecr.aws/bitnami/node'}`);
    this.command = ['bash', '-c', bundlingCommand];
    this.environment = props.environment;
    if (!props.forceDockerBundling) {
      const osPlatform = os.platform();
      const createLocalCommand = (outputDir: string) => {
        return this.createLocalBundlingCommand(outputDir, bundlingArguments, osPlatform);
      };
      this.local = {
        tryBundle(outputDir: string) {
          if (VueCliBundling.runsLocally === false) {
            process.stderr.write('Vue cli cannot run locally. Switching to Docker bundling.\n');
            return false;
          }
          try {
            const cmd = osPlatform === 'win32' ? 'cmd' : 'bash';
            const c = osPlatform === 'win32' ? '/c' : '-c';
            const spawnSyncOptions: SpawnSyncOptions = {
              env: {
                ...process.env,
                ...props.environment,
              },
              stdio: [
                'ignore',
                process.stderr,
                'inherit',
              ],
              cwd: path.resolve(props.source),
              windowsVerbatimArguments: osPlatform === 'win32',
            };
            exec(
              cmd,
              [
                c,
                'npm install',
              ],
              spawnSyncOptions,
            );
            exec(
              cmd,
              [
                c,
                createLocalCommand(outputDir),
              ],
              spawnSyncOptions,
            );
          } catch (error) {
            return false;
          }
          return true;
        },
      };
    }
  }

  private createDockerBundlingCommand(outputDir: string, bundlingArguments: string, osPlatform: NodeJS.Platform = 'linux'): string {
    const npx: string = osPlatform === 'win32' ? 'npx.cmd' : 'npx';
    const vueCliServeBuildCommand: string = [
      npx,
      'npm',
      'install',
      ';',
      npx,
      'vue-cli-service',
      'build',
      bundlingArguments,
      '--no-install',
      '--no-clean',
      `--dest ${outputDir}`,
    ].join(' ');
    return vueCliServeBuildCommand;
  }
  private createLocalBundlingCommand(outputDir: string, bundlingArguments: string, osPlatform: NodeJS.Platform = 'linux'): string {
    const npx: string = osPlatform === 'win32' ? 'npx.cmd' : 'npx';
    const vueCliServeBuildCommand: string = [
      npx,
      'vue-cli-service',
      'build',
      bundlingArguments,
      '--no-install',
      '--no-clean',
      `--dest ${outputDir}`,
    ].join(' ');
    return vueCliServeBuildCommand;
  }
}