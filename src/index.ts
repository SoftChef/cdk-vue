import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cloudfrontOrigins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { VueCliBundling } from './build';

export interface VueDeploymentProps {

  // VueJS source directory
  readonly source: string;

  readonly bucket?: s3.Bucket;

  // Specify S3 bucket
  readonly bucketName?: string;

  // S3 bucket prefix
  readonly websiteDirectoryPrefix?: string;

  // CloudFront distribution defaultRootObject
  readonly indexHtml?: string;

  readonly environment?: { [ key: string ]: string };

  readonly bundlingArguments?: string;

  // Runs vue-cli locally
  readonly runsLocally?: boolean;

  // Force use docker to bundling
  readonly forceDockerBundling?: boolean;

  readonly enableIpv6?: boolean;

}

export class VueDeployment extends cdk.Construct {

  public readonly s3Bucket: s3.Bucket

  public readonly cloudfrontDistribution: cloudfront.Distribution
  public readonly bucketDeployment: s3Deploy.BucketDeployment

  constructor(scope: cdk.Construct, id: string, props: VueDeploymentProps) {
    super(scope, id);
    const indexHtml = props.indexHtml ?? 'index.html';
    const websiteDirectoryPrefix = props.websiteDirectoryPrefix?.replace(/^\//, '') ?? '';
    const s3SourceAsset = VueCliBundling.bundling({
      source: props.source,
      runsLocally: props.runsLocally ?? true,
      forceDockerBundling: props.forceDockerBundling ?? false,
      bundlingArguments: props.bundlingArguments,
      environment: props.environment,
    });
    if (props.bucket) {
      this.s3Bucket = props.bucket;
    } else {
      this.s3Bucket = new s3.Bucket(this, cdk.Names.nodeUniqueId(scope.node), {
        bucketName: props.bucketName,
      });
      this.s3Bucket.addCorsRule({
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.POST,
          s3.HttpMethods.PUT,
          s3.HttpMethods.HEAD,
          s3.HttpMethods.DELETE,
        ],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      });
    }
    this.bucketDeployment = new s3Deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3SourceAsset,
      ],
      destinationBucket: this.s3Bucket,
      destinationKeyPrefix: websiteDirectoryPrefix,
    });
    this.cloudfrontDistribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultRootObject: indexHtml,
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(this.s3Bucket, {
          originPath: `/${websiteDirectoryPrefix ?? ''}`,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      enableIpv6: props.enableIpv6,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: `/${indexHtml}`,
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: `/${indexHtml}`,
        },
      ],
    });
  }
}
