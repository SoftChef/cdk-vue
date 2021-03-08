import * as fs from 'fs';
import * as path from 'path';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cloudfrontOrigins from '@aws-cdk/aws-cloudfront-origins';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
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

  readonly configJsKey?: string;

  // CloudFront distribution defaultRootObject
  readonly indexHtml?: string;

  readonly environment?: { [ key: string ]: string };

  readonly bundlingArguments?: string;

  // Runs vue-cli locally
  readonly runsLocally?: boolean;

  // Force use docker to bundling
  readonly forceDockerBundling?: boolean;

  readonly config: { [key: string]: string };

  readonly enableIpv6?: boolean;

}

export class VueDeployment extends cdk.Construct {

  public readonly bucket: s3.Bucket;

  public readonly bucketDeployment: s3Deploy.BucketDeployment;

  public readonly cloudfrontDistribution!: cloudfront.Distribution;

  public readonly uploadConfig!: cdk.CustomResource;

  private readonly websiteDirectoryPrefix: string;

  constructor(scope: cdk.Construct, id: string, props: VueDeploymentProps) {
    super(scope, id);
    this.websiteDirectoryPrefix = props.websiteDirectoryPrefix?.replace(/^\//, '') ?? '';
    this.bucket = this._createOrGetBucket(scope, props);
    this.bucketDeployment = this._createBucketDeployment(props);
    this.cloudfrontDistribution = this._createCloudfrontDistribution(props);
    this.uploadConfig = this._uploadConfig(props);
  }

  /** @internal */
  _createOrGetBucket(scope: cdk.Construct, props: VueDeploymentProps) {
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

  /** @internal */
  _createBucketDeployment(props: VueDeploymentProps) {
    const s3SourceAsset = VueCliBundling.bundling({
      source: props.source,
      runsLocally: props.runsLocally ?? true,
      forceDockerBundling: props.forceDockerBundling ?? false,
      bundlingArguments: props.bundlingArguments,
      environment: props.environment,
    });
    return new s3Deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3SourceAsset,
      ],
      destinationBucket: this.bucket,
      destinationKeyPrefix: this.websiteDirectoryPrefix,
    });
  }

  /** @internal */
  _uploadConfig(props: VueDeploymentProps) {
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
    return new cdk.CustomResource(this, 'UploadConfig', {
      serviceToken: uploadConfigFunction.functionArn,
      pascalCaseProperties: false,
      properties: {
        bucketName: this.bucket.bucketName,
        configJsKey: props.configJsKey ?? 'config.js',
        ...props.config,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  /** @internal */
  _createCloudfrontDistribution(props: VueDeploymentProps) {
    const indexHtml = props.indexHtml ?? 'index.html';
    return new cloudfront.Distribution(this, 'WebsiteDistribution', {
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
