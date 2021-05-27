const { AwsCdkConstructLibrary } = require('projen');

const project = new AwsCdkConstructLibrary({
  author: 'MinCheTsai',
  authorEmail: 'minche@softchef.com',
  cdkVersion: '1.106.1',
  releaseBranches: ['main'],
  defaultReleaseBranch: 'main',
  dependabot: false,
  jsiiFqn: 'projen.AwsCdkConstructLibrary',
  name: 'sccdk-vue',
  repositoryUrl: 'https://github.com/softchef/sccdk-vue.git',
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
    'cdk',
    'vue',
  ],
});

project.synth();
