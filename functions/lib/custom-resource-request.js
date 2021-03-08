'use strict'

const REQUEST_TYPE_CREATE = 'Create'

const REQUEST_TYPE_UPDATE = 'Update'

const REQUEST_TYPE_DELETE = 'Delete'

class CustomResourceRequest {
  constructor(event) {
    this.event = event || {}
    if (this.event['ResourceType'] !== `AWS::CloudFormation::CustomResource`) {
      throw new Error(`ResourceType isn't CustomResource.[${this.event['ResourceType']}]`)
    }
  }
  on(types) {
    if (typeof types === 'string') {
      types = [types]
    }
    return types.map(type => {
      return type.toLowerCase()
    }).indexOf(
      this.event['RequestType'].toLowerCase()
    ) > -1
  }
  onCreate() {
    return this.event['RequestType'] === REQUEST_TYPE_CREATE
  }
  onUpdate() {
    return this.event['RequestType'] === REQUEST_TYPE_UPDATE
  }
  onDelete() {
    return this.event['RequestType'] === REQUEST_TYPE_DELETE
  }
  onCreateOrUpdate() {
    return this.onCreate() || this.onUpdate()
  }
  requestType() {
    return this.event['RequestType']
  }
  properties() {
    return this.event['ResourceProperties']
  }
  property(key) {
    return this.event['ResourceProperties'][key] || null
  }
}

module.exports = CustomResourceRequest

// {
//   RequestType: 'Create', 'Update', 'Delete',
//   ServiceToken: 'arn:aws:lambda:ap-southeast-1:559336121711:function:CdkGenericClientsStack-FrontendConfigurationFronte-PEGHJK1ZH3Y0',
//   ResponseURL: 'https://cloudformation-custom-resource-response-apsoutheast1.s3-ap-southeast-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aap-southeast-1%3A559336121711%3Astack/CdkGenericClientsStack/0547cbc0-7673-11eb-9da8-0627116e656a%7CFrontendConfigurationFrontendConfigurationResource585CD8B1%7C6d3bd4fe-2b63-46f6-b568-43410bbd6bb5?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20210306T003231Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIAXKFFXMS3TPUTHLFY%2F20210306%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Signature=204f1cac552c08f65c6001c4d85be810e20c32cd8999675832c1680823855f2e',
//   StackId: 'arn:aws:cloudformation:ap-southeast-1:559336121711:stack/CdkGenericClientsStack/0547cbc0-7673-11eb-9da8-0627116e656a',
//   RequestId: '6d3bd4fe-2b63-46f6-b568-43410bbd6bb5',
//   LogicalResourceId: 'FrontendConfigurationFrontendConfigurationResource585CD8B1',
//   PhysicalResourceId: 'cd9fb6d9-5c85-4cae-896e-7eb36556696b',
//   ResourceType: 'AWS::CloudFormation::CustomResource',
//   ResourceProperties: {
//     ServiceToken: 'arn:aws:lambda:ap-southeast-1:559336121711:function:CdkGenericClientsStack-FrontendConfigurationFronte-PEGHJK1ZH3Y0'
//   }
// }