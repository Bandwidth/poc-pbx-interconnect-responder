import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';

const BUCKET_NAME = "POC_PBX_INTERCONNECT";
const LAMBDA_SERVICE_NAME = "poc_sip_responder";

const serverlessConfiguration: AWS = {
  // Name of your lambda service
  service: LAMBDA_SERVICE_NAME,
  frameworkVersion: '2',
  custom: {
    // Default stage for deployments will be dev
    stage: '${opt:stage, "dev"}',
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    client: {
      bucketName: BUCKET_NAME + '-${self:custom.stage}',
      indexDocument: 'index.html',
      // TODO create your own error html!
      // errorDocument: 'error.html',
      distributionFolder: 'ui/build'
    },
  },
  plugins: [
    'serverless-webpack',
    'serverless-dotenv-plugin',
    'serverless-finch'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      // Environment variables to be passed to your lambda
      // should be defined here AND serverless.ts
      // If you are testing deploying from your local machine,
      // .env file needs to be defined at the project root.
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      // Example of how to access environment params created via GHA
      // TEST_PARAM: '${env:TEST_PARAM}',
    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: {
    hello
  },
};

module.exports = serverlessConfiguration;
