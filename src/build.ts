import * as os from 'os';
import * as path from 'path';
import {
  ISource,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment';
import {
  AssetStaging,
  BundlingOptions,
  DockerImage,
  ILocalBundling,
} from 'aws-cdk-lib';
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
    const bundlingCommand = this.createBundlingCommand(AssetStaging.BUNDLING_OUTPUT_DIR, bundlingArguments);
    this.image = DockerImage.fromRegistry(`${props.nodeImage ?? 'public.ecr.aws/bitnami/node'}`);
    this.command = ['bash', '-c', bundlingCommand];
    this.environment = props.environment;
    if (!props.forceDockerBundling) {
      const osPlatform = os.platform();
      const createLocalCommand = (outputDir: string) => {
        return this.createBundlingCommand(outputDir, bundlingArguments, osPlatform);
      };
      this.local = {
        tryBundle(outputDir: string) {
          if (VueCliBundling.runsLocally === false) {
            process.stderr.write('Vue cli cannot run locally. Switching to Docker bundling.\n');
            return false;
          }
          try {
            exec(
              osPlatform === 'win32' ? 'cmd' : 'bash',
              [
                osPlatform === 'win32' ? '/c' : '-c',
                createLocalCommand(outputDir),
              ],
              {
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
              },
            );
          } catch (error) {
            return false;
          }
          return true;
        },
      };
    }
  }

  private createBundlingCommand(outputDir: string, bundlingArguments: string, osPlatform: NodeJS.Platform = 'linux'): string {
    const npx = osPlatform === 'win32' ? 'npx.cmd' : 'npx';
    const vueCliServeBuildCommand: string = [
      npx,
      'yarn',
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
}