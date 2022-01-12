export interface VueCliBuildProps {
    readonly source: string;
    readonly environment?: {
        [key: string]: string;
    };
    readonly bundlingArguments?: string;
    readonly runsLocally?: boolean;
    readonly forceDockerBundling?: boolean;
    readonly nodeImage?: string | 'public.ecr.aws/bitnami/node';
}
