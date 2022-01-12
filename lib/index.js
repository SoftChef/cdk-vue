"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VueDeployment = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const fs = require("fs");
const path = require("path");
const cloudfront = require("@aws-cdk/aws-cloudfront");
const cloudfrontOrigins = require("@aws-cdk/aws-cloudfront-origins");
const iam = require("@aws-cdk/aws-iam");
const lambda = require("@aws-cdk/aws-lambda-nodejs");
const s3 = require("@aws-cdk/aws-s3");
const s3Deploy = require("@aws-cdk/aws-s3-deployment");
const cdk = require("@aws-cdk/core");
const build_1 = require("./build");
/**
 * @stability stable
 */
class VueDeployment extends cdk.Construct {
    /**
     * @stability stable
     */
    constructor(scope, id, props) {
        var _b, _c;
        super(scope, id);
        this.websiteDirectoryPrefix = (_c = (_b = props.websiteDirectoryPrefix) === null || _b === void 0 ? void 0 : _b.replace(/^\//, '')) !== null && _c !== void 0 ? _c : '';
        this.bucket = this.createOrGetBucket(scope, props);
        if (props.enableDistribution !== false) {
            if (props.distribution) {
                this.cloudfrontDistribution = props.distribution;
            }
            else {
                this.cloudfrontDistribution = this.createCloudfrontDistribution(props);
            }
        }
        this.bucketDeployment = this.createBucketDeployment(props);
        this.uploadConfigResource = this.createUploadConfigResource(props);
    }
    createOrGetBucket(scope, props) {
        let bucket;
        if (props.bucket) {
            bucket = props.bucket;
        }
        else {
            bucket = new s3.Bucket(this, cdk.Names.nodeUniqueId(scope.node), {
                bucketName: props.bucketName,
            });
            bucket.addCorsRule({
                allowedMethods: [
                    s3.HttpMethods.GET,
                    s3.HttpMethods.POST,
                    s3.HttpMethods.PUT,
                    s3.HttpMethods.HEAD,
                    s3.HttpMethods.DELETE,
                ],
                allowedOrigins: ['*'],
                allowedHeaders: ['*'],
            });
        }
        return bucket;
    }
    createBucketDeployment(props) {
        var _b, _c, _d, _e;
        const s3SourceAsset = build_1.VueCliBundling.bundling({
            source: props.source,
            runsLocally: (_b = props.runsLocally) !== null && _b !== void 0 ? _b : true,
            forceDockerBundling: (_c = props.forceDockerBundling) !== null && _c !== void 0 ? _c : false,
            nodeImage: props.nodeImage,
            bundlingArguments: props.bundlingArguments,
            environment: props.environment,
        });
        return new s3Deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [
                s3SourceAsset,
            ],
            destinationBucket: this.bucket,
            destinationKeyPrefix: this.websiteDirectoryPrefix,
            memoryLimit: props.memoryLimit,
            prune: (_d = props.prune) !== null && _d !== void 0 ? _d : false,
            retainOnDelete: (_e = props.retainOnDelete) !== null && _e !== void 0 ? _e : false,
            distribution: this.cloudfrontDistribution,
        });
    }
    createUploadConfigResource(props) {
        var _b, _c;
        const updateConfigFunctionRole = new iam.Role(this, 'UpdateConfigFunctionRole', {
            assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('lambda.amazonaws.com')),
        });
        updateConfigFunctionRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                's3:PutObject',
                's3:DeleteObject',
            ],
            resources: [
                `${this.bucket.bucketArn}/*`,
            ],
        }));
        updateConfigFunctionRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'Logs:CreateLogGroup',
                'Logs:CreateLogStream',
                'Logs:PutLogEvents',
            ],
            resources: ['*'],
        }));
        const uploadConfigFunction = new lambda.NodejsFunction(this, 'UploadConfigFunction', {
            entry: path.resolve(__dirname, '../functions/upload-config/app.js'),
            environment: {
                CONFIG_JS_STUB: fs.readFileSync(path.resolve(__dirname, '../functions/upload-config/config.stub.js')).toString(),
            },
            role: updateConfigFunctionRole,
        });
        const uploadConfig = new cdk.CustomResource(this, 'UploadConfig', {
            serviceToken: uploadConfigFunction.functionArn,
            pascalCaseProperties: false,
            properties: {
                bucketName: this.bucket.bucketName,
                configJsKey: (_b = props.configJsKey) !== null && _b !== void 0 ? _b : 'config.js',
                ...((_c = props.config) !== null && _c !== void 0 ? _c : {}),
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        uploadConfig.node.addDependency(this.bucketDeployment);
        return uploadConfig;
    }
    createCloudfrontDistribution(props) {
        var _b, _c;
        const indexHtml = (_b = props.indexHtml) !== null && _b !== void 0 ? _b : 'index.html';
        return new cloudfront.Distribution(this, 'WebsiteDistribution', {
            certificate: props.certificate,
            domainNames: props.domainNames,
            defaultRootObject: indexHtml,
            defaultBehavior: {
                origin: new cloudfrontOrigins.S3Origin(this.bucket, {
                    originPath: `/${this.websiteDirectoryPrefix}`,
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            enableIpv6: props.enableIpv6,
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: `/${indexHtml}`,
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: `/${indexHtml}`,
                },
            ],
            comment: (_c = props.distributionComment) !== null && _c !== void 0 ? _c : '',
        });
    }
}
exports.VueDeployment = VueDeployment;
_a = JSII_RTTI_SYMBOL_1;
VueDeployment[_a] = { fqn: "@softchef/cdk-vue.VueDeployment", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLHNEQUFzRDtBQUN0RCxxRUFBcUU7QUFDckUsd0NBQXdDO0FBQ3hDLHFEQUFxRDtBQUNyRCxzQ0FBc0M7QUFDdEMsdURBQXVEO0FBQ3ZELHFDQUFxQztBQUNyQyxtQ0FFaUI7Ozs7QUFzRWpCLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxTQUFTOzs7O0lBWTlDLFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBeUI7O1FBQ3JFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLHNCQUFzQixlQUFHLEtBQUssQ0FBQyxzQkFBc0IsMENBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLG9DQUFLLEVBQUUsQ0FBQztRQUNyRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkQsSUFBSSxLQUFLLENBQUMsa0JBQWtCLEtBQUssS0FBSyxFQUFFO1lBQ3RDLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRTtnQkFDdEIsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxZQUFhLENBQUM7YUFDbkQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN4RTtTQUNGO1FBQ0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxLQUFvQixFQUFF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S0FBSyxDQUFDLFdBQVc7WUFDOUIsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO1lBQzlCLGlCQUFpQixFQUFFLFNBQVM7WUFDNUIsZUFBZSxFQUFFO2dCQUNmLE1BQU0sRUFBRSxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNsRCxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUU7aUJBQzlDLENBQUM7Z0JBQ0Ysb0JBQW9CLEVBQUUsVUFBVSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQjthQUN4RTtZQUNELFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixjQUFjLEVBQUU7Z0JBQ2Q7b0JBQ0UsVUFBVSxFQUFFLEdBQUc7b0JBQ2Ysa0JBQWtCLEVBQUUsR0FBRztvQkFDdkIsZ0JBQWdCLEVBQUUsSUFBSSxTQUFTLEVBQUU7aUJBQ2xDO2dCQUNEO29CQUNFLFVBQVUsRUFBRSxHQUFHO29CQUNmLGtCQUFrQixFQUFFLEdBQUc7b0JBQ3ZCLGdCQUFnQixFQUFFLElBQUksU0FBUyxFQUFFO2lCQUNsQzthQUNGO1lBQ0QsT0FBTyxRQUFFLEtBQUssQ0FBQyxtQkFBbUIsbUNBQUksRUFBRTtTQUN6QyxDQUFDLENBQUM7SUFDTCxDQUFDOztBQXZKSCxzQ0F3SkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgYWNtIGZyb20gJ0Bhd3MtY2RrL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tICdAYXdzLWNkay9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250T3JpZ2lucyBmcm9tICdAYXdzLWNkay9hd3MtY2xvdWRmcm9udC1vcmlnaW5zJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdAYXdzLWNkay9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdAYXdzLWNkay9hd3MtczMnO1xuaW1wb3J0ICogYXMgczNEZXBsb3kgZnJvbSAnQGF3cy1jZGsvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHtcbiAgVnVlQ2xpQnVuZGxpbmcsXG59IGZyb20gJy4vYnVpbGQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFZ1ZURlcGxveW1lbnRQcm9wcyB7XG5cbiAgLy8gVnVlSlMgc291cmNlIGRpcmVjdG9yeVxuICByZWFkb25seSBzb3VyY2U6IHN0cmluZztcblxuICAvLyBVc2UgdGFyZ2V0IGJ1Y2tldCBvciBjcmVhdGUgbmV3IGJ1Y2tldFxuICByZWFkb25seSBidWNrZXQ/OiBzMy5CdWNrZXQ7XG5cbiAgLy8gU3BlY2lmeSBTMyBidWNrZXRcbiAgcmVhZG9ubHkgYnVja2V0TmFtZT86IHN0cmluZztcblxuICAvLyBTMyBidWNrZXQgcHJlZml4XG4gIHJlYWRvbmx5IHdlYnNpdGVEaXJlY3RvcnlQcmVmaXg/OiBzdHJpbmc7XG5cbiAgLy8gQnVja2V0IERlcGxveW1lbnQgbWVtb3J5TGltaXRcbiAgcmVhZG9ubHkgbWVtb3J5TGltaXQ/OiBudW1iZXI7XG5cbiAgLy8gUHJ1bmUgUzMgYnVja2V0IGZpbGVzLCBkZWZhdWx0IGZhbHNlXG4gIHJlYWRvbmx5IHBydW5lPzogYm9vbGVhbjtcblxuICAvLyBSZXRhaW4gUzMgYnVja2V0IGZpbGVzIG9uIGRlbGV0ZSBzdGFjaywgZGVmYXVsdCBmYWxzZVxuICByZWFkb25seSByZXRhaW5PbkRlbGV0ZT86IGJvb2xlYW47XG5cbiAgLy8gRW5hYmxlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uLCBkZWZhdWx0OiB0cnVlXG4gIHJlYWRvbmx5IGVuYWJsZURpc3RyaWJ1dGlvbj86IGJvb2xlYW47XG5cbiAgLy8gQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cbiAgcmVhZG9ubHkgZGlzdHJpYnV0aW9uPzogY2xvdWRmcm9udC5EaXN0cmlidXRpb247XG5cbiAgLy8gQ2xvdWRGcm9udCBjZXJ0aWZpY2F0ZVxuICByZWFkb25seSBjZXJ0aWZpY2F0ZT86IGFjbS5JQ2VydGlmaWNhdGU7XG5cbiAgLy8gQ2xvdWRGcm9udCBkb21haW4gbmFtZXNcbiAgcmVhZG9ubHkgZG9tYWluTmFtZXM/OiBzdHJpbmdbXTtcblxuICAvLyBDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBkZWZhdWx0Um9vdE9iamVjdFxuICByZWFkb25seSBpbmRleEh0bWw/OiBzdHJpbmc7XG5cbiAgcmVhZG9ubHkgZGlzdHJpYnV0aW9uQ29tbWVudD86IHN0cmluZztcblxuICAvLyBFbmFibGUgSVB2NiwgZGVmYXVsdDogdHJ1ZVxuICByZWFkb25seSBlbmFibGVJcHY2PzogYm9vbGVhbjtcblxuICByZWFkb25seSBlbnZpcm9ubWVudD86IHtcbiAgICBbIGtleTogc3RyaW5nIF06IHN0cmluZztcbiAgfTtcblxuICByZWFkb25seSBidW5kbGluZ0FyZ3VtZW50cz86IHN0cmluZztcblxuICAvLyBSdW5zIHZ1ZS1jbGkgbG9jYWxseVxuICByZWFkb25seSBydW5zTG9jYWxseT86IGJvb2xlYW47XG5cbiAgLy8gRm9yY2UgdXNlIGRvY2tlciB0byBidW5kbGluZ1xuICByZWFkb25seSBmb3JjZURvY2tlckJ1bmRsaW5nPzogYm9vbGVhbjtcblxuICAvLyBTcGVjaWZ5IGRvY2tlciBub2RlIHZlcnNpb25cbiAgcmVhZG9ubHkgbm9kZUltYWdlPzogc3RyaW5nIHwgJ3B1YmxpYy5lY3IuYXdzL2JpdG5hbWkvbm9kZSc7XG5cbiAgLy8gQ29uZmlnLmpzIGluIHRoZSB3ZWIgYnVja2V0IGtleVxuICByZWFkb25seSBjb25maWdKc0tleT86IHN0cmluZztcblxuICAvLyBDb25maWcgd2lsbCB1cGxvYWQgdG8gd2ViIGJ1Y2tldFxuICByZWFkb25seSBjb25maWc/OiB7XG4gICAgW2tleTogc3RyaW5nXTogYW55O1xuICB9O1xuXG59XG5cbmV4cG9ydCBjbGFzcyBWdWVEZXBsb3ltZW50IGV4dGVuZHMgY2RrLkNvbnN0cnVjdCB7XG5cbiAgcHVibGljIHJlYWRvbmx5IGJ1Y2tldDogczMuQnVja2V0O1xuXG4gIHB1YmxpYyByZWFkb25seSBidWNrZXREZXBsb3ltZW50OiBzM0RlcGxveS5CdWNrZXREZXBsb3ltZW50O1xuXG4gIHB1YmxpYyByZWFkb25seSBjbG91ZGZyb250RGlzdHJpYnV0aW9uITogY2xvdWRmcm9udC5EaXN0cmlidXRpb247XG5cbiAgcHVibGljIHJlYWRvbmx5IHVwbG9hZENvbmZpZ1Jlc291cmNlITogY2RrLkN1c3RvbVJlc291cmNlO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgd2Vic2l0ZURpcmVjdG9yeVByZWZpeDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogVnVlRGVwbG95bWVudFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcbiAgICB0aGlzLndlYnNpdGVEaXJlY3RvcnlQcmVmaXggPSBwcm9wcy53ZWJzaXRlRGlyZWN0b3J5UHJlZml4Py5yZXBsYWNlKC9eXFwvLywgJycpID8/ICcnO1xuICAgIHRoaXMuYnVja2V0ID0gdGhpcy5jcmVhdGVPckdldEJ1Y2tldChzY29wZSwgcHJvcHMpO1xuICAgIGlmIChwcm9wcy5lbmFibGVEaXN0cmlidXRpb24gIT09IGZhbHNlKSB7XG4gICAgICBpZiAocHJvcHMuZGlzdHJpYnV0aW9uKSB7XG4gICAgICAgIHRoaXMuY2xvdWRmcm9udERpc3RyaWJ1dGlvbiA9IHByb3BzLmRpc3RyaWJ1dGlvbiE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsb3VkZnJvbnREaXN0cmlidXRpb24gPSB0aGlzLmNyZWF0ZUNsb3VkZnJvbnREaXN0cmlidXRpb24ocHJvcHMpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmJ1Y2tldERlcGxveW1lbnQgPSB0aGlzLmNyZWF0ZUJ1Y2tldERlcGxveW1lbnQocHJvcHMpO1xuICAgIHRoaXMudXBsb2FkQ29uZmlnUmVzb3VyY2UgPSB0aGlzLmNyZWF0ZVVwbG9hZENvbmZpZ1Jlc291cmNlKHByb3BzKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlT3JHZXRCdWNrZXQoc2NvcGU6IGNkay5Db25zdHJ1Y3QsIHByb3BzOiBWdWVEZXBsb3ltZW50UHJvcHMpOiBzMy5CdWNrZXQge1xuICAgIGxldCBidWNrZXQ6IHMzLkJ1Y2tldDtcbiAgICBpZiAocHJvcHMuYnVja2V0KSB7XG4gICAgICBidWNrZXQgPSBwcm9wcy5idWNrZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgY2RrLk5hbWVzLm5vZGVVbmlxdWVJZChzY29wZS5ub2RlKSwge1xuICAgICAgICBidWNrZXROYW1lOiBwcm9wcy5idWNrZXROYW1lLFxuICAgICAgfSk7XG4gICAgICBidWNrZXQuYWRkQ29yc1J1bGUoe1xuICAgICAgICBhbGxvd2VkTWV0aG9kczogW1xuICAgICAgICAgIHMzLkh0dHBNZXRob2RzLkdFVCxcbiAgICAgICAgICBzMy5IdHRwTWV0aG9kcy5QT1NULFxuICAgICAgICAgIHMzLkh0dHBNZXRob2RzLlBVVCxcbiAgICAgICAgICBzMy5IdHRwTWV0aG9kcy5IRUFELFxuICAgICAgICAgIHMzLkh0dHBNZXRob2RzLkRFTEVURSxcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLFxuICAgICAgICBhbGxvd2VkSGVhZGVyczogWycqJ10sXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1Y2tldDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQnVja2V0RGVwbG95bWVudChwcm9wczogVnVlRGVwbG95bWVudFByb3BzKTogczNEZXBsb3kuQnVja2V0RGVwbG95bWVudCB7XG4gICAgY29uc3QgczNTb3VyY2VBc3NldCA9IFZ1ZUNsaUJ1bmRsaW5nLmJ1bmRsaW5nKHtcbiAgICAgIHNvdXJjZTogcHJvcHMuc291cmNlLFxuICAgICAgcnVuc0xvY2FsbHk6IHByb3BzLnJ1bnNMb2NhbGx5ID8/IHRydWUsXG4gICAgICBmb3JjZURvY2tlckJ1bmRsaW5nOiBwcm9wcy5mb3JjZURvY2tlckJ1bmRsaW5nID8/IGZhbHNlLFxuICAgICAgbm9kZUltYWdlOiBwcm9wcy5ub2RlSW1hZ2UsXG4gICAgICBidW5kbGluZ0FyZ3VtZW50czogcHJvcHMuYnVuZGxpbmdBcmd1bWVudHMsXG4gICAgICBlbnZpcm9ubWVudDogcHJvcHMuZW52aXJvbm1lbnQsXG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBzM0RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsICdEZXBsb3lXZWJzaXRlJywge1xuICAgICAgc291cmNlczogW1xuICAgICAgICBzM1NvdXJjZUFzc2V0LFxuICAgICAgXSxcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLmJ1Y2tldCxcbiAgICAgIGRlc3RpbmF0aW9uS2V5UHJlZml4OiB0aGlzLndlYnNpdGVEaXJlY3RvcnlQcmVmaXgsXG4gICAgICBtZW1vcnlMaW1pdDogcHJvcHMubWVtb3J5TGltaXQsXG4gICAgICBwcnVuZTogcHJvcHMucHJ1bmUgPz8gZmFsc2UsXG4gICAgICByZXRhaW5PbkRlbGV0ZTogcHJvcHMucmV0YWluT25EZWxldGUgPz8gZmFsc2UsXG4gICAgICBkaXN0cmlidXRpb246IHRoaXMuY2xvdWRmcm9udERpc3RyaWJ1dGlvbixcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVXBsb2FkQ29uZmlnUmVzb3VyY2UocHJvcHM6IFZ1ZURlcGxveW1lbnRQcm9wcyk6IGNkay5DdXN0b21SZXNvdXJjZSB7XG4gICAgY29uc3QgdXBkYXRlQ29uZmlnRnVuY3Rpb25Sb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdVcGRhdGVDb25maWdGdW5jdGlvblJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uQ29tcG9zaXRlUHJpbmNpcGFsKFxuICAgICAgICBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICApLFxuICAgIH0pO1xuICAgIHVwZGF0ZUNvbmZpZ0Z1bmN0aW9uUm9sZS5hZGRUb1BvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgJ3MzOlB1dE9iamVjdCcsXG4gICAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXG4gICAgICAgIF0sXG4gICAgICAgIHJlc291cmNlczogW1xuICAgICAgICAgIGAke3RoaXMuYnVja2V0LmJ1Y2tldEFybn0vKmAsXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICApO1xuICAgIHVwZGF0ZUNvbmZpZ0Z1bmN0aW9uUm9sZS5hZGRUb1BvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgJ0xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICdMb2dzOkNyZWF0ZUxvZ1N0cmVhbScsXG4gICAgICAgICAgJ0xvZ3M6UHV0TG9nRXZlbnRzJyxcbiAgICAgICAgXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgIH0pLFxuICAgICk7XG4gICAgY29uc3QgdXBsb2FkQ29uZmlnRnVuY3Rpb24gPSBuZXcgbGFtYmRhLk5vZGVqc0Z1bmN0aW9uKHRoaXMsICdVcGxvYWRDb25maWdGdW5jdGlvbicsIHtcbiAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZnVuY3Rpb25zL3VwbG9hZC1jb25maWcvYXBwLmpzJyksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBDT05GSUdfSlNfU1RVQjogZnMucmVhZEZpbGVTeW5jKFxuICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9mdW5jdGlvbnMvdXBsb2FkLWNvbmZpZy9jb25maWcuc3R1Yi5qcycpLFxuICAgICAgICApLnRvU3RyaW5nKCksXG4gICAgICB9LFxuICAgICAgcm9sZTogdXBkYXRlQ29uZmlnRnVuY3Rpb25Sb2xlLFxuICAgIH0pO1xuICAgIGNvbnN0IHVwbG9hZENvbmZpZyA9IG5ldyBjZGsuQ3VzdG9tUmVzb3VyY2UodGhpcywgJ1VwbG9hZENvbmZpZycsIHtcbiAgICAgIHNlcnZpY2VUb2tlbjogdXBsb2FkQ29uZmlnRnVuY3Rpb24uZnVuY3Rpb25Bcm4sXG4gICAgICBwYXNjYWxDYXNlUHJvcGVydGllczogZmFsc2UsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGJ1Y2tldE5hbWU6IHRoaXMuYnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgIGNvbmZpZ0pzS2V5OiBwcm9wcy5jb25maWdKc0tleSA/PyAnY29uZmlnLmpzJyxcbiAgICAgICAgLi4uKHByb3BzLmNvbmZpZyA/PyB7fSksXG4gICAgICB9LFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcbiAgICB1cGxvYWRDb25maWcubm9kZS5hZGREZXBlbmRlbmN5KHRoaXMuYnVja2V0RGVwbG95bWVudCk7XG4gICAgcmV0dXJuIHVwbG9hZENvbmZpZztcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ2xvdWRmcm9udERpc3RyaWJ1dGlvbihwcm9wczogVnVlRGVwbG95bWVudFByb3BzKTogY2xvdWRmcm9udC5EaXN0cmlidXRpb24ge1xuICAgIGNvbnN0IGluZGV4SHRtbCA9IHByb3BzLmluZGV4SHRtbCA/PyAnaW5kZXguaHRtbCc7XG4gICAgcmV0dXJuIG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnV2Vic2l0ZURpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGNlcnRpZmljYXRlOiBwcm9wcy5jZXJ0aWZpY2F0ZSxcbiAgICAgIGRvbWFpbk5hbWVzOiBwcm9wcy5kb21haW5OYW1lcyxcbiAgICAgIGRlZmF1bHRSb290T2JqZWN0OiBpbmRleEh0bWwsXG4gICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgb3JpZ2luOiBuZXcgY2xvdWRmcm9udE9yaWdpbnMuUzNPcmlnaW4odGhpcy5idWNrZXQsIHtcbiAgICAgICAgICBvcmlnaW5QYXRoOiBgLyR7dGhpcy53ZWJzaXRlRGlyZWN0b3J5UHJlZml4fWAsXG4gICAgICAgIH0pLFxuICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgIH0sXG4gICAgICBlbmFibGVJcHY2OiBwcm9wcy5lbmFibGVJcHY2LFxuICAgICAgZXJyb3JSZXNwb25zZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGh0dHBTdGF0dXM6IDQwMyxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiBgLyR7aW5kZXhIdG1sfWAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBodHRwU3RhdHVzOiA0MDQsXG4gICAgICAgICAgcmVzcG9uc2VIdHRwU3RhdHVzOiAyMDAsXG4gICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogYC8ke2luZGV4SHRtbH1gLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGNvbW1lbnQ6IHByb3BzLmRpc3RyaWJ1dGlvbkNvbW1lbnQgPz8gJycsXG4gICAgfSk7XG4gIH1cbn0iXX0=