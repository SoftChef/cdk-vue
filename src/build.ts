import * as os from 'os';
import * as path from 'path';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { VueCliBuildProps } from './types';
import { getNpxVersion, getVueCliVersion, exec } from './util';

const NPX_MAJOR_VERSION = '6';

export class VueCliBundling implements cdk.BundlingOptions {

  public static bundling(options: VueCliBuildProps): s3Deploy.ISource {
    return s3Deploy.Source.asset(
      options.source,
      {
        bundling: new VueCliBundling(options),
      },
    );
  }

  private static runsLocally?: boolean | true

  public readonly image: cdk.BundlingDockerImage

  public readonly command?: string[] | undefined

  public readonly environment?: { [key: string]: string } | {}

  public readonly bundlingArguments?: string | ''

  public readonly local?: cdk.ILocalBundling | undefined

  constructor(props: VueCliBuildProps) {
    VueCliBundling.runsLocally = (getNpxVersion()?.startsWith(NPX_MAJOR_VERSION) && getVueCliVersion()?.startsWith('@vue/cli')) ?? false;
    const bundlingArguments = props.bundlingArguments ?? '';
    const bundlingCommand = this.createBundlingCommand(cdk.AssetStaging.BUNDLING_OUTPUT_DIR, bundlingArguments);
    this.image = cdk.DockerImage.fromRegistry('node:lts');
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
}