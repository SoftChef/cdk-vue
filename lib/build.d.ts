import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { VueCliBuildProps } from './types';
export declare class VueCliBundling implements cdk.BundlingOptions {
    static bundling(options: VueCliBuildProps): s3Deploy.ISource;
    private static runsLocally?;
    readonly image: cdk.DockerImage;
    readonly command?: string[] | undefined;
    readonly environment?: {
        [key: string]: string;
    } | {};
    readonly bundlingArguments?: string | '';
    readonly local?: cdk.ILocalBundling | undefined;
    constructor(props: VueCliBuildProps);
    private createBundlingCommand;
}
