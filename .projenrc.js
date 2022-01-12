const { awscdk } = require('projen');

const AUTOMATION_TOKEN = 'PROJEN_GITHUB_TOKEN';

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'SoftChef',
  authorEmail: 'poke@softchef.com',
  authorUrl: 'https://www.softchef.com',
  authorOrganization: true,
  cdkVersion: '1.138.0',
  cdkVersionPinning: true,
  defaultReleaseBranch: 'main',
  name: '@softchef/cdk-vue',
  description: 'Auto deploy website with VueJs to S3 bucket and CloudFront distribution.',
  repositoryUrl: 'https://github.com/SoftChef/cdk-vue.git',
  cdkDependencies: [
    '@aws-cdk/aws-certificatemanager',
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
  depsUpgradeOptions: {
    ignoreProjen: true,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      secret: AUTOMATION_TOKEN,
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['MinCheTsai'],
  },
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

project.package.addField('resolutions', {
  'jest-environment-jsdom': '27.3.1',
});

project.synth();