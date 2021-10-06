import * as os from 'os';
import '@aws-cdk/assert/jest';
// import * as s3 from '@aws-cdk/aws-s3';
// import * as cdk from '@aws-cdk/core';
// import { VueDeployment } from '../src/index';
import * as util from '../src/util';

describe('VueDeployment construct', () => {
  // test('Docker bundling', () => {
  //   const app = new cdk.App();
  //   const stack = new cdk.Stack(app, 'WebsiteStack');
  //   const bucket = new s3.Bucket(stack, 'WebsiteBucket', {
  //     bucketName: 'test-bucket-name',
  //   });
  //   new VueDeployment(stack, 'Website', {
  //     source: './mock/website',
  //     forceDockerBundling: true,
  //     bucket: bucket,
  //     websiteDirectoryPrefix: 'website',
  //     indexHtml: 'index.test.html',
  //     configJsKey: './config.test.js',
  //     config: {
  //       x: 'y',
  //     },
  //   });
  //   // THEN
  //   expect(stack).toHaveResource('AWS::S3::Bucket', {
  //     BucketName: 'test-bucket-name',
  //   });
  //   expect(stack).toHaveResource('Custom::CDKBucketDeployment');
  //   expect(stack).toHaveResource('AWS::CloudFront::Distribution');
  //   expect(stack).toHaveResource('AWS::CloudFront::CloudFrontOriginAccessIdentity');
  //   expect(stack).toHaveResource('AWS::CloudFormation::CustomResource');
  //   expect(stack).toHaveResource('AWS::Lambda::Function');
  //   expect(stack).toHaveResource('AWS::IAM::Role');
  // });
  test('util', () => {
    const npxVersion = util.getNpxVersion();
    const vueCliVersion = util.getVueCliVersion();
    const osPathJoin = util.osPathJoin(
      os.platform(),
    );
    const { stdout: execNpxVersion } = util.exec('npx', ['-v']);
    expect(npxVersion).not.toBeNull();
    expect(vueCliVersion).not.toBeNull();
    expect(execNpxVersion.toString().trim()).toEqual(npxVersion);
    expect(osPathJoin('/')).toEqual('/');
    expect(util.exec('cd', ['x'])).toBeInstanceOf(Error);
  });
});
