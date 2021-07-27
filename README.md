# AWS CDK with VueJs

[![npm version](https://badge.fury.io/js/%40softchef%2Fcdk-vue.svg)](https://badge.fury.io/js/%40softchef%2Fcdk-vue)
![Release](https://github.com/SoftChef/cdk-vue/workflows/Release/badge.svg)
![npm](https://img.shields.io/npm/dt/@softchef/cdk-vue?label=NPM%20Downloads&color=orange)

AWS CDK with VueJs package will auto deploy website with VueJs to S3 bucket and CloudFront distribution.

VueJs will build on local environment or docker container, it's based with Vue-CLI project. Then use S3-Deployment to upload to specify S3 bucket.

If you have many resource arguments will pass to frontend, the config property will generate config.js to specify S3 bucket. It's a VueJs extendsion and archive config in Vue.$config operation.

![Architecture](https://github.com/SoftChef/cdk-vue/blob/2ff51f4f370ded84ef588624d4e0804b98e7e7e2/docs/cdk-vue.png)

## Installation

```
  npm install @softchef/cdk-vue
  // or
  yarn add @softchef/cdk-vue
```

## Example
```
import { VueDeployment } from '@softchef/cdk-vue'
// In your stack
// Basic deployment
const website = new VueDeployment(this, 'Website', {
  source: `${CLIENTS_PATH}`,
  config: {
    apiId: articleApi.restApiId, // RestApi
    userPoolId: userPool.userPoolId, // UserPool
    foo: {
      bar: {
        value: 123 // Customize config
      }
    }
  }
})
```

## VueDeployment Properties

```
{
  source: string;

  // Use target bucket or create new bucket(if not specify)
  bucket?: s3.Bucket;

  // Specify S3 bucket name, if not specify will random generate
  bucketName?: string;

  // S3 bucket prefix, ex: "/website"
  websiteDirectoryPrefix?: string;

  // CloudFront distribution defaultRootObject, default is "index.html"
  indexHtml?: string;

  // CloudFront will enable/disable Ipv6 options
  enableIpv6?: boolean;

  // Pass env variables to Vue-CLI bundling, you can get its in process.env(frontend)
  environment?: { [ key: string ]: string };

  // Pass bundling arguments to Vue-CLI
  bundlingArguments?: string;

  // Force run Vue-CLI build in local
  runsLocally?: boolean;

  // Force use docker to bundling
  forceDockerBundling?: boolean;

  // Specify the "config.js" in your web bucket key, default is "/config.js"
  configJsKey?: string;

  // Config object will upload to web bucket(config.js)
  config?: { [key: string]: any };
}
```

## VueJs Example

```
// In public/index.html
<script type="text/javascript" src="/config.js">

// In main.js or app.js
Vue.use(window.CloudDeploymentConfig)

// In *.vue
export default {
  mounted () {
    this.$config.get('apiId')
    this.$config.get('foo.bar.value') // use "." to get value recursively
  }
}
```
