'use strict'

const { CustomResourceRequest, CustomResourceResponse } = require('../lib')
const { S3 } = require('aws-sdk')

exports.handler = async(event) => {
  const request = new CustomResourceRequest(event)
  const response = new CustomResourceResponse(event)
  try {
    const s3 = new S3()
    const bucketName = request.property('bucketName')
    const configJsKey = request.property('configJsKey') || 'config.js'
    if (request.onCreateOrUpdate()) {
      const configJs = process.env.CONFIG_JS_STUB
        .replace(/\$_stubConfig/g, Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10))
        .replace(/\$_stubContext/,
          Buffer.from(
            JSON.stringify(
              request.properties()
            )
          ).toString('base64')
        )
        .replace(/\n/g, '')
        .replace(/\s\s/g, '')
      await s3.putObject({
        Bucket: bucketName,
        Key: configJsKey,
        Body: configJs
      }).promise()
    } else if (request.onDelete()) {
      await s3.deleteObject({
        Bucket: bucketName,
        Key: configJsKey
      }).promise()
    }
    return response.success({
      requestType: request.requestType(),
      key: configJsKey,
      uploadedAt: Date.now()
    })
  } catch(error) {
    return response.failed(error)
  }
}
