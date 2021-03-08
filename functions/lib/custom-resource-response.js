'use strict'

const https = require('https')
const { URL } = require('url')

class CustomResourceResponse {
  constructor(event) {
    this.event = event || {}
  }
  success(data) {
    return this.send(data)
  }
  failed(error) {
    return this.send(null, error)
  }
  send(data, error) {
    return new Promise((resolve, reject) => {
      const responseBody = JSON.stringify({
        Status: error ? 'FAILED' : 'SUCCESS',
        Reason: error ? error.toString() : 'Success',
        PhysicalResourceId: this.event.PhysicalResourceId || this.event.RequestId,
        StackId: this.event.StackId,
        RequestId: this.event.RequestId,
        LogicalResourceId: this.event.LogicalResourceId,
        Data: data
      })
      const responseUrl = new URL(this.event.ResponseURL)
      const options = {
        hostname: responseUrl.hostname,
        port: 443,
        path: `${responseUrl.pathname}${responseUrl.search}`,
        method: 'PUT',
        headers: {
          'content-type': '',
          'content-length': responseBody.length
        }
      }
      try {
        const request = https.request(options, response => {
          resolve(true)
        })
        request.on('error', error => {
          console.error(error)
          reject(error)
        })
        request.write(responseBody)
        request.end()
      } catch (error) {
        console.error(error)
        reject(error)
      }
    })
  }
}

module.exports = CustomResourceResponse
