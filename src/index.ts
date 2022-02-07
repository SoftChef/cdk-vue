import * as fs from 'fs';
import * as path from 'path';
import {
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import {
  Distribution,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import {
  S3Origin,
} from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  CompositePrincipal,
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import {
  NodejsFunction,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  Bucket,
  HttpMethods,
} from 'aws-cdk-lib/aws-s3';
import {
  BucketDeployment,
} from 'aws-cdk-lib/aws-s3-deployment';
import {
  CustomResource,
  Names,
  RemovalPolicy,
} from 'aws-cdk-lib/core';
import {
  Construct,
} from 'constructs';
import {
  VueCliBundling,
} from './build';

export interface VueDeploymentProps {

  // VueJS source directory
  readonly source: string;

  // Use target bucket or create new bucket
  readonly bucket?: Bucket;

  // Specify S3 bucket
  readonly bucketName?: string;

  // S3 bucket prefix
  readonly websiteDirectoryPrefix?: string;

  // Bucket Deployment memoryLimit
  readonly memoryLimit?: number;

  // Prune S3 bucket files, default false
  readonly prune?: boolean;

  // Retain S3 bucket files on delete stack, default false
  readonly retainOnDelete?: boolean;

  // Enable CloudFront distribution, default: true
  readonly enableDistribution?: boolean;

  // CloudFront distribution
  readonly distribution?: Distribution;

  // CloudFront certificate
  readonly certificate?: ICertificate;

  // CloudFront domain names
  readonly domainNames?: string[];

  // CloudFront distribution defaultRootObject
  readonly indexHtml?: string;

  readonly distributionComment?: string;

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

export class VueDeployment extends Construct {

  public readonly bucket: Bucket;

  public readonly bucketDeployment: BucketDeployment;

  public readonly cloudfrontDistribution!: Distribution;

  public readonly uploadConfigResource!: CustomResource;

  private readonly websiteDirectoryPrefix: string;

  constructor(scope: Construct, id: string, props: VueDeploymentProps) {
    super(scope, id);
    this.websiteDirectoryPrefix = props.websiteDirectoryPrefix?.replace(/^\//, '') ?? '';
    this.bucket = this.createOrGetBucket(scope, props);
    if (props.enableDistribution !== false) {
      if (props.distribution) {
        this.cloudfrontDistribution = props.distribution!;
      } else {
        this.cloudfrontDistribution = this.createCloudfrontDistribution(props);
      }
    }
    this.bucketDeployment = this.createBucketDeployment(props);
    this.uploadConfigResource = this.createUploadConfigResource(props);
  }

  private createOrGetBucket(scope: Construct, props: VueDeploymentProps): Bucket {
    let bucket: Bucket;
    if (props.bucket) {
      bucket = props.bucket;
    } else {
      bucket = new Bucket(this, Names.nodeUniqueId(scope.node), {
        bucketName: props.bucketName,
      });
      bucket.addCorsRule({
        allowedMethods: [
          HttpMethods.GET,
          HttpMethods.POST,
          HttpMethods.PUT,
          HttpMethods.HEAD,
          HttpMethods.DELETE,
        ],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      });
    }
    return bucket;
  }

  private createBucketDeployment(props: VueDeploymentProps): BucketDeployment {
    const s3SourceAsset = VueCliBundling.bundling({
      source: props.source,
      runsLocally: props.runsLocally ?? true,
      forceDockerBundling: props.forceDockerBundling ?? false,
      nodeImage: props.nodeImage,
      bundlingArguments: props.bundlingArguments,
      environment: props.environment,
    });
    return new BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3SourceAsset,
      ],
      destinationBucket: this.bucket,
      destinationKeyPrefix: this.websiteDirectoryPrefix,
      memoryLimit: props.memoryLimit,
      prune: props.prune ?? false,
      retainOnDelete: props.retainOnDelete ?? false,
      distribution: this.cloudfrontDistribution,
    });
  }

  private createUploadConfigResource(props: VueDeploymentProps): CustomResource {
    const updateConfigFunctionRole = new Role(this, 'UpdateConfigFunctionRole', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('lambda.amazonaws.com'),
      ),
    });
    updateConfigFunctionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
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
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'Logs:CreateLogGroup',
          'Logs:CreateLogStream',
          'Logs:PutLogEvents',
        ],
        resources: ['*'],
      }),
    );
    const uploadConfigFunction = new NodejsFunction(this, 'UploadConfigFunction', {
      entry: path.resolve(__dirname, '../functions/upload-config/app.js'),
      environment: {
        CONFIG_JS_STUB: fs.readFileSync(
          path.resolve(__dirname, '../functions/upload-config/config.stub.js'),
        ).toString(),
      },
      role: updateConfigFunctionRole,
    });
    const uploadConfig = new CustomResource(this, 'UploadConfig', {
      serviceToken: uploadConfigFunction.functionArn,
      pascalCaseProperties: false,
      properties: {
        bucketName: this.bucket.bucketName,
        configJsKey: props.configJsKey ?? 'config.js',
        ...(props.config ?? {}),
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });
    uploadConfig.node.addDependency(this.bucketDeployment);
    return uploadConfig;
  }

  private createCloudfrontDistribution(props: VueDeploymentProps): Distribution {
    const indexHtml = props.indexHtml ?? 'index.html';
    return new Distribution(this, 'WebsiteDistribution', {
      certificate: props.certificate,
      domainNames: props.domainNames,
      defaultRootObject: indexHtml,
      defaultBehavior: {
        origin: new S3Origin(this.bucket, {
          originPath: `/${this.websiteDirectoryPrefix}`,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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
      comment: props.distributionComment ?? '',
    });
  }
}