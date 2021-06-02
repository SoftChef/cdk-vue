# API Reference

**Classes**

Name|Description
----|-----------
[VueDeployment](#softchef-cdk-vue-vuedeployment)|*No description*


**Structs**

Name|Description
----|-----------
[VueDeploymentProps](#softchef-cdk-vue-vuedeploymentprops)|*No description*



## class VueDeployment  <a id="softchef-cdk-vue-vuedeployment"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new VueDeployment(scope: Construct, id: string, props: VueDeploymentProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[VueDeploymentProps](#softchef-cdk-vue-vuedeploymentprops)</code>)  *No description*
  * **source** (<code>string</code>)  *No description* 
  * **bucket** (<code>[Bucket](#aws-cdk-aws-s3-bucket)</code>)  *No description* __*Optional*__
  * **bucketName** (<code>string</code>)  *No description* __*Optional*__
  * **bundlingArguments** (<code>string</code>)  *No description* __*Optional*__
  * **config** (<code>Map<string, any></code>)  *No description* __*Optional*__
  * **configJsKey** (<code>string</code>)  *No description* __*Optional*__
  * **enableIpv6** (<code>boolean</code>)  *No description* __*Optional*__
  * **environment** (<code>Map<string, string></code>)  *No description* __*Optional*__
  * **forceDockerBundling** (<code>boolean</code>)  *No description* __*Optional*__
  * **indexHtml** (<code>string</code>)  *No description* __*Optional*__
  * **runsLocally** (<code>boolean</code>)  *No description* __*Optional*__
  * **websiteDirectoryPrefix** (<code>string</code>)  *No description* __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**bucket** | <code>[Bucket](#aws-cdk-aws-s3-bucket)</code> | <span></span>
**bucketDeployment** | <code>[BucketDeployment](#aws-cdk-aws-s3-deployment-bucketdeployment)</code> | <span></span>
**cloudfrontDistribution** | <code>[Distribution](#aws-cdk-aws-cloudfront-distribution)</code> | <span></span>
**uploadConfig** | <code>[CustomResource](#aws-cdk-core-customresource)</code> | <span></span>



## struct VueDeploymentProps  <a id="softchef-cdk-vue-vuedeploymentprops"></a>






Name | Type | Description 
-----|------|-------------
**source** | <code>string</code> | <span></span>
**bucket**? | <code>[Bucket](#aws-cdk-aws-s3-bucket)</code> | __*Optional*__
**bucketName**? | <code>string</code> | __*Optional*__
**bundlingArguments**? | <code>string</code> | __*Optional*__
**config**? | <code>Map<string, any></code> | __*Optional*__
**configJsKey**? | <code>string</code> | __*Optional*__
**enableIpv6**? | <code>boolean</code> | __*Optional*__
**environment**? | <code>Map<string, string></code> | __*Optional*__
**forceDockerBundling**? | <code>boolean</code> | __*Optional*__
**indexHtml**? | <code>string</code> | __*Optional*__
**runsLocally**? | <code>boolean</code> | __*Optional*__
**websiteDirectoryPrefix**? | <code>string</code> | __*Optional*__



