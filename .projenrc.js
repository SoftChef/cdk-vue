const { AwsCdkConstructLibrary, NpmAccess } = require('projen');

const project = new AwsCdkConstructLibrary({
  author: 'softchef-iot-lab',
  authorEmail: 'poke@softchef.com',
  npmAccess: NpmAccess.PUBLIC,
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  name: '@softchef/cdk-vue',
  description: 'Auto deploy website with VueJs to S3 bucket and CloudFront distribution.',
  repositoryUrl: 'https://github.com/SoftChef/cdk-vue.git',
  cdkDependencies: [
    '@aws-cdk/aws-cloudfront',
    '@aws-cdk/aws-cloudfront-origins',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/core',
  ],
  devDeps: [
    '@vue/cli',
    'esbuild',
  ],
  keywords: [
    'aws',
    'cdk',
    'vue',
    'vuejs',
    'cloudfront',
    'cdn',
    'web',
  ],
});

project.synth();
