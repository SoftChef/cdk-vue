const { awscdk } = require('projen');

const AUTOMATION_TOKEN = 'PROJEN_GITHUB_TOKEN';

const PROJECT_NAME = '@softchef/cdk-vue';
const PROJECT_DESCRIPTION = 'Auto deploy website with VueJs to S3 bucket and CloudFront distribution.';

const project = new awscdk.AwsCdkConstructLibrary({
  authorName: 'SoftChef',
  authorEmail: 'poke@softchef.com',
  authorUrl: 'https://www.softchef.com',
  authorOrganization: true,
  cdkVersion: '1.73.0',
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  repositoryUrl: 'https://github.com/SoftChef/cdk-vue.git',
  defaultReleaseBranch: 'main',
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
    ignoreProjen: false,
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

const commonExclude = [
  'cdk.out',
  'cdk.context.json',
  'yarn-error.log',
];

project.npmignore.exclude(...commonExclude);
project.gitignore.exclude(...commonExclude);

project.synth();