import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
/**
 * @stability stable
 */
export interface VueDeploymentProps {
    /**
     * @stability stable
     */
    readonly source: string;
    /**
     * @stability stable
     */
    readonly bucket?: s3.Bucket;
    /**
     * @stability stable
     */
    readonly bucketName?: string;
    /**
     * @stability stable
     */
    readonly websiteDirectoryPrefix?: string;
    /**
     * @stability stable
     */
    readonly memoryLimit?: number;
    /**
     * @stability stable
     */
    readonly prune?: boolean;
    /**
     * @stability stable
     */
    readonly retainOnDelete?: boolean;
    /**
     * @stability stable
     */
    readonly enableDistribution?: boolean;
    /**
     * @stability stable
     */
    readonly distribution?: cloudfront.Distribution;
    /**
     * @stability stable
     */
    readonly certificate?: acm.ICertificate;
    /**
     * @stability stable
     */
    readonly domainNames?: string[];
    /**
     * @stability stable
     */
    readonly indexHtml?: string;
    /**
     * @stability stable
     */
    readonly distributionComment?: string;
    /**
     * @stability stable
     */
    readonly enableIpv6?: boolean;
    /**
     * @stability stable
     */
    readonly environment?: {
        [key: string]: string;
    };
    /**
     * @stability stable
     */
    readonly bundlingArguments?: string;
    /**
     * @stability stable
     */
    readonly runsLocally?: boolean;
    /**
     * @stability stable
     */
    readonly forceDockerBundling?: boolean;
    /**
     * @stability stable
     */
    readonly nodeImage?: string | 'public.ecr.aws/bitnami/node';
    /**
     * @stability stable
     */
    readonly configJsKey?: string;
    /**
     * @stability stable
     */
    readonly config?: {
        [key: string]: any;
    };
}
/**
 * @stability stable
 */
export declare class VueDeployment extends cdk.Construct {
    /**
     * @stability stable
     */
    readonly bucket: s3.Bucket;
    /**
     * @stability stable
     */
    readonly bucketDeployment: s3Deploy.BucketDeployment;
    /**
     * @stability stable
     */
    readonly cloudfrontDistribution: cloudfront.Distribution;
    /**
     * @stability stable
     */
    readonly uploadConfigResource: cdk.CustomResource;
    private readonly websiteDirectoryPrefix;
    /**
     * @stability stable
     */
    constructor(scope: cdk.Construct, id: string, props: VueDeploymentProps);
    private createOrGetBucket;
    private createBucketDeployment;
    private createUploadConfigResource;
    private createCloudfrontDistribution;
}
