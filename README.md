# SoftChef CDK with VueJs

SoftChef CDK Vue package is auto deploy website with VueJs to S3 bucket and CloudFront distribution.

VueJs will build on local environment or docker container, it's based with Vue-CLI project. Then use S3-Deployment to upload to specify S3 bucket.

If you have many resource arguments will pass to frontend, the config property will generate config.js to specify S3 bucket. It's a VueJs extendsion and archive config in Vue.$config operation.
## Installation

```
  npm install sccdk-vue
  // or
  yarn add sccdk-vue
```

## Example
```
import { VueDeployment } from 'sccdk-vue'
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

## Properties

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