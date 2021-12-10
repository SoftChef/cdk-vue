export interface VueCliBuildProps {

  // VueJS source directory
  readonly source: string;

  // vue-cli environments
  readonly environment?: {
    [ key: string ]: string;
  };

  readonly bundlingArguments?: string;

  // Runs vue-cli locally
  readonly runsLocally?: boolean;

  // Force use docker to bundling
  readonly forceDockerBundling?: boolean;

  // Specify docker node version
  readonly nodeImage?: string | 'public.ecr.aws/bitnami/node';
}