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
  getVueCliVersion,
  exec,
} from './util';
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
    if (props.runsLocally === false || props.forceDockerBundling === true) {
      VueCliBundling.runsLocally = false;
    } else {
      VueCliBundling.runsLocally = getVueCliVersion()?.startsWith('@vue/cli') ?? false;
    }
    const bundlingArguments = props.bundlingArguments ?? '';
    const bundlingCommand: string = [
      'npm install --no-cache;',
      'rm -Rf false;',
      `npm run build -- ${bundlingArguments} --no-clean --dest ${AssetStaging.BUNDLING_OUTPUT_DIR};`,
    ].join(' ');
    this.image = DockerImage.fromRegistry(`${props.nodeImage ?? 'public.ecr.aws/bitnami/node'}`);
    if (VueCliBundling.runsLocally) {
      this.image = DockerImage.fromRegistry('williamyeh/dummy');
    }
    this.command = ['bash', '-c', bundlingCommand];
    this.environment = props.environment;
    if (!props.forceDockerBundling) {
      const osPlatform = os.platform();
      this.local = {
        tryBundle(outputDir: string) {
          if (VueCliBundling.runsLocally === false) {
            process.stderr.write('Vue cli cannot run locally. Switching to Docker bundling.\n');
            return false;
          }
          try {
            const cmd = osPlatform === 'win32' ? 'cmd' : 'bash';
            const argC = osPlatform === 'win32' ? '/c' : '-c';
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
                argC,
                'npm install',
              ],
              spawnSyncOptions,
            );
            exec(
              cmd,
              [
                argC,
                `npm run build -- ${bundlingArguments} --no-clean --dest ${outputDir};`,
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
}