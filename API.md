# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### VueDeployment <a name="@softchef/cdk-vue.VueDeployment"></a>

#### Initializers <a name="@softchef/cdk-vue.VueDeployment.Initializer"></a>

```typescript
import { VueDeployment } from '@softchef/cdk-vue'

new VueDeployment(scope: Construct, id: string, props: VueDeploymentProps)
```

##### `scope`<sup>Required</sup> <a name="@softchef/cdk-vue.VueDeployment.parameter.scope"></a>

- *Type:* [`constructs.Construct`](#constructs.Construct)

---

##### `id`<sup>Required</sup> <a name="@softchef/cdk-vue.VueDeployment.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="@softchef/cdk-vue.VueDeployment.parameter.props"></a>

- *Type:* [`@softchef/cdk-vue.VueDeploymentProps`](#@softchef/cdk-vue.VueDeploymentProps)

---



#### Properties <a name="Properties"></a>

##### `bucket`<sup>Required</sup> <a name="@softchef/cdk-vue.VueDeployment.property.bucket"></a>

```typescript
public readonly bucket: Bucket;
```

- *Type:* [`aws-cdk-lib.aws_s3.Bucket`](#aws-cdk-lib.aws_s3.Bucket)

---

##### `bucketDeployment`<sup>Required</sup> <a name="@softchef/cdk-vue.VueDeployment.property.bucketDeployment"></a>

```typescript
public readonly bucketDeployment: BucketDeployment;
```

- *Type:* [`aws-cdk-lib.aws_s3_deployment.BucketDeployment`](#aws-cdk-lib.aws_s3_deployment.BucketDeployment)

---

##### `cloudfrontDistribution`<sup>Required</sup> <a name="@softchef/cdk-vue.VueDeployment.property.cloudfrontDistribution"></a>

```typescript
public readonly cloudfrontDistribution: Distribution;
```

- *Type:* [`aws-cdk-lib.aws_cloudfront.Distribution`](#aws-cdk-lib.aws_cloudfront.Distribution)

---

##### `uploadConfigResource`<sup>Required</sup> <a name="@softchef/cdk-vue.VueDeployment.property.uploadConfigResource"></a>

```typescript
public readonly uploadConfigResource: CustomResource;
```

- *Type:* [`aws-cdk-lib.CustomResource`](#aws-cdk-lib.CustomResource)

---


## Structs <a name="Structs"></a>

### VueDeploymentProps <a name="@softchef/cdk-vue.VueDeploymentProps"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { VueDeploymentProps } from '@softchef/cdk-vue'

const vueDeploymentProps: VueDeploymentProps = { ... }
```

##### `source`<sup>Required</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.source"></a>

```typescript
public readonly source: string;
```

- *Type:* `string`

---

##### `bucket`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.bucket"></a>

```typescript
public readonly bucket: Bucket;
```

- *Type:* [`aws-cdk-lib.aws_s3.Bucket`](#aws-cdk-lib.aws_s3.Bucket)

---

##### `bucketName`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* `string`

---

##### `bundlingArguments`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.bundlingArguments"></a>

```typescript
public readonly bundlingArguments: string;
```

- *Type:* `string`

---

##### `certificate`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* [`aws-cdk-lib.aws_certificatemanager.ICertificate`](#aws-cdk-lib.aws_certificatemanager.ICertificate)

---

##### `config`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.config"></a>

```typescript
public readonly config: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: `any`}

---

##### `configJsKey`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.configJsKey"></a>

```typescript
public readonly configJsKey: string;
```

- *Type:* `string`

---

##### `distribution`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.distribution"></a>

```typescript
public readonly distribution: Distribution;
```

- *Type:* [`aws-cdk-lib.aws_cloudfront.Distribution`](#aws-cdk-lib.aws_cloudfront.Distribution)

---

##### `distributionComment`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.distributionComment"></a>

```typescript
public readonly distributionComment: string;
```

- *Type:* `string`

---

##### `domainNames`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.domainNames"></a>

```typescript
public readonly domainNames: string[];
```

- *Type:* `string`[]

---

##### `enableDistribution`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.enableDistribution"></a>

```typescript
public readonly enableDistribution: boolean;
```

- *Type:* `boolean`

---

##### `enableIpv6`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.enableIpv6"></a>

```typescript
public readonly enableIpv6: boolean;
```

- *Type:* `boolean`

---

##### `environment`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}

---

##### `forceDockerBundling`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.forceDockerBundling"></a>

```typescript
public readonly forceDockerBundling: boolean;
```

- *Type:* `boolean`

---

##### `indexHtml`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.indexHtml"></a>

```typescript
public readonly indexHtml: string;
```

- *Type:* `string`

---

##### `memoryLimit`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.memoryLimit"></a>

```typescript
public readonly memoryLimit: number;
```

- *Type:* `number`

---

##### `nodeImage`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.nodeImage"></a>

```typescript
public readonly nodeImage: string;
```

- *Type:* `string`

---

##### `prune`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.prune"></a>

```typescript
public readonly prune: boolean;
```

- *Type:* `boolean`

---

##### `retainOnDelete`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.retainOnDelete"></a>

```typescript
public readonly retainOnDelete: boolean;
```

- *Type:* `boolean`

---

##### `runsLocally`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.runsLocally"></a>

```typescript
public readonly runsLocally: boolean;
```

- *Type:* `boolean`

---

##### `websiteDirectoryPrefix`<sup>Optional</sup> <a name="@softchef/cdk-vue.VueDeploymentProps.property.websiteDirectoryPrefix"></a>

```typescript
public readonly websiteDirectoryPrefix: string;
```

- *Type:* `string`

---



