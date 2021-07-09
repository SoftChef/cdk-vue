const { AwsCdkConstructLibrary, NpmAccess } = require('projen');

const project = new AwsCdkConstructLibrary({
  author: 'softchef-iot-lab',
  authorEmail: 'poke@softchef.com',
  npmAccess: NpmAccess.PUBLIC,
  cdkVersion: '1.111.0',
  projenVersion: '0.26.3',
  initialVersion: '1.0.0',
  defaultReleaseBranch: 'main',
  dependabot: true,
  jsiiFqn: 'projen.AwsCdkConstructLibrary',
  name: '@softchef/cdk-vue',
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
    'cdk',
    'vue',
  ],
});

project.synth();
