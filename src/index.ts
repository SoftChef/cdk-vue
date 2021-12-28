import * as fs from 'fs';
import * as path from 'path';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cloudfrontOrigins from '@aws-cdk/aws-cloudfront-origins';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import {
  VueCliBundling,
} from './build';

export interface VueDeploymentProps {

  // VueJS source directory
  readonly source: string;

  // Use target bucket or create new bucket
  readonly bucket?: s3.Bucket;

  // Specify S3 bucket
  readonly bucketName?: string;

  // S3 bucket prefix
  readonly websiteDirectoryPrefix?: string;

  // Prune S3 bucket files, default false
  readonly prune?: boolean;

  // Retain S3 bucket files on delete stack, default false
  readonly retainOnDelete?: boolean;

  // Enable CloudFront distribution, default: true
  readonly enableDistribution?: boolean;

  // CloudFront distribution
  readonly distribution?: cloudfront.Distribution;

  // CloudFront certificate
  readonly certificate?: acm.ICertificate;

  // CloudFront domain names
  readonly domainNames?: string[];

  // CloudFront distribution defaultRootObject
  readonly indexHtml?: string;

  // Enable IPv6, default: true
  readonly enableIpv6?: boolean;

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

  // Config.js in the web bucket key
  readonly configJsKey?: string;

  // Config will upload to web bucket
  readonly config?: {
    [key: string]: any;
  };

}

export class VueDeployment extends cdk.Construct {

  public readonly bucket: s3.Bucket;

  public readonly bucketDeployment: s3Deploy.BucketDeployment;

  public readonly cloudfrontDistribution!: cloudfront.Distribution;

  public readonly uploadConfigResource!: cdk.CustomResource;

  private readonly websiteDirectoryPrefix: string;

  constructor(scope: cdk.Construct, id: string, props: VueDeploymentProps) {
    super(scope, id);
    this.websiteDirectoryPrefix = props.websiteDirectoryPrefix?.replace(/^\//, '') ?? '';
    this.bucket = this.createOrGetBucket(scope, props);
    if (!!props.enableDistribution) {
      if (props.distribution) {
        this.cloudfrontDistribution = this.createCloudfrontDistribution(props);
      } else {
        this.cloudfrontDistribution = props.distribution!;
      }
    }
    this.bucketDeployment = this.createBucketDeployment(props);
    this.uploadConfigResource = this.createUploadConfigResource(props);
  }

  private createOrGetBucket(scope: cdk.Construct, props: VueDeploymentProps): s3.Bucket {
    let bucket: s3.Bucket;
    if (props.bucket) {
      bucket = props.bucket;
    } else {
      bucket = new s3.Bucket(this, cdk.Names.nodeUniqueId(scope.node), {
        bucketName: props.bucketName,
      });
      bucket.addCorsRule({
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
    return bucket;
  }

  private createBucketDeployment(props: VueDeploymentProps): s3Deploy.BucketDeployment {
    const s3SourceAsset = VueCliBundling.bundling({
      source: props.source,
      runsLocally: props.runsLocally ?? true,
      forceDockerBundling: props.forceDockerBundling ?? false,
      nodeImage: props.nodeImage,
      bundlingArguments: props.bundlingArguments,
      environment: props.environment,
    });
    return new s3Deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3SourceAsset,
      ],
      destinationBucket: this.bucket,
      destinationKeyPrefix: this.websiteDirectoryPrefix,
      prune: props.prune ?? false,
      retainOnDelete: props.retainOnDelete ?? false,
      distribution: this.cloudfrontDistribution,
    });
  }

  private createUploadConfigResource(props: VueDeploymentProps): cdk.CustomResource {
    const updateConfigFunctionRole = new iam.Role(this, 'UpdateConfigFunctionRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
      ),
    });
    updateConfigFunctionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:PutObject',
          's3:DeleteObject',
        ],
        resources: [
          `${this.bucket.bucketArn}/*`,
        ],
      }),
    );
    updateConfigFunctionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'Logs:CreateLogGroup',
          'Logs:CreateLogStream',
          'Logs:PutLogEvents',
        ],
        resources: ['*'],
      }),
    );
    const uploadConfigFunction = new lambda.NodejsFunction(this, 'UploadConfigFunction', {
      entry: path.resolve(__dirname, '../functions/upload-config/app.js'),
      environment: {
        CONFIG_JS_STUB: fs.readFileSync(
          path.resolve(__dirname, '../functions/upload-config/config.stub.js'),
        ).toString(),
      },
      role: updateConfigFunctionRole,
    });
    const uploadConfig = new cdk.CustomResource(this, 'UploadConfig', {
      serviceToken: uploadConfigFunction.functionArn,
      pascalCaseProperties: false,
      properties: {
        bucketName: this.bucket.bucketName,
        configJsKey: props.configJsKey ?? 'config.js',
        ...(props.config ?? {}),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    uploadConfig.node.addDependency(this.bucketDeployment);
    return uploadConfig;
  }

  private createCloudfrontDistribution(props: VueDeploymentProps): cloudfront.Distribution {
    const indexHtml = props.indexHtml ?? 'index.html';
    return new cloudfront.Distribution(this, 'WebsiteDistribution', {
      certificate: props.certificate,
      domainNames: props.domainNames,
      defaultRootObject: indexHtml,
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(this.bucket, {
          originPath: `/${this.websiteDirectoryPrefix}`,
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
