# Serverless - React - AWS Node.js Template

The aim of this repo is to cut down on the time required to spin up a static react based website, hosted on S3 with API Gateway + Lambda for the REST API.

Part of this repo was generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## Getting started

- **Cloning template repo**

    You can also use mot to create a new repo using this repo as the template
    ```
    create-repo-from-template $repoName $teamName $templateFullName
    ```
    See https://github.com/Bandwidth/mot for details.

    **Note that $templateFullName needs to be the fullname of the repo that includes the owner name. In this case, the templateFullName would be `Bandwidth/serverless-react-nodejs-template`**

    Alternatively, clone the template repo on to your local machine and then set git remote url to your git repo (It is assumed you have already created a new repo for your project)
    ```
    git remote set-url origin new.git.url/here
    ```

- **Modify serverless.ts**

    You will need to set the S3 bucket name and your lambda name in serverless.ts For this, you need to modify the **BUCKET_NAME** and **LAMBDA_SERVICE_NAME** variables in **serverless.ts**

- **Github Actions setup**
    - **Set stage for deployments**

        Replace YOUR_STAGE in deploy.yml with the stage (environment) name you want to use for your deployments. Ideally, rename deploy.yml file to the same for clarity.

    - **Set branch name for Github actions**

        Replace YOUR_BRANCH under 'branches' in deploy.yml to whichever branch you want this workflow to run on when pushing code.

    - **Set AWS secrets** 

        Create Github secrets. You ll need to set at least 'AWS_KEY' and 'AWS_SECRET' for serverless to be able to deploy via workflow. You can use Github secrets for other application secrets that would have to pass to your application via environment variables.

- **Environment variables for lambda**

    Create environment variables (.env) via your workflow action. You will need to modify the 'Create env file for Lambda' step in deploy.yml to add environment variables for your application. This will provide serverless with the ability to access these params. Additionally, you will have to create these variables in serverless.ts as well, so they are actually passed to the lambda. You will have to add these to the 'environment' parameter under 'provider' in serverless.ts

- **API url (Manual Step)**

    Without using DNS, you won't have the url for API before actually deploying the lambda.
    
    To know what API url to use in the UI, you will have to copy the API url from the output of lambda deploy via serverless on your console.
    
    If deploying via github actions, you can open the last run of the github actions and see the output of the deploy to get the endpoint url.

## Installation/deployment instructions (npm)

> **Requirements**:

> **NodeJS `lts/fermium (v.14.15.0)`**. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

> **AWS account:** It is expected that you have an AWS user account and its credentials (Access Secret and Access Key). This is required for serverless to deploy resources on to your AWS account via Github actions.


### Deploying Manually
- Deploy API
    - From project root, run `npm i` to install the project dependencies.
    - Run `npx sls deploy --stage YOUR_STAGE` to deploy the backend stack to AWS
- Deploy UI
    - From ui/ run `npm i`
    - From ui/ run `npm run build`
    - From project root, run `sls client deploy --no-confirm --stage YOUR_STAGE` to deploy the react project on S3.

### Deploying via Github actions
In this case, all you need to do is commit your changes and push the code to your repo. You will need to make sure you have setup the correct branch name for the runner to listen on in the 'deploy.yml' file. See 'Github Actions setup' from the 'Getting started' section in this document.

## Test your service / UI

This template contains a single lambda function triggered by an HTTP request made on the provisioned API Gateway REST API `/hello` route with `POST` method. The request body must be provided as `application/json`. The body structure is tested by API Gateway against `src/functions/hello/schema.ts` JSON-Schema definition: it must contain the `name` property.

- requesting any other path than `/hello` with any other method than `POST` will result in API Gateway returning a `403` HTTP error code
- sending a `POST` request to `/hello` with a payload **not** containing a string property named `name` will result in API Gateway returning a `400` HTTP error code
- sending a `POST` request to `/hello` with a payload containing a string property named `name` will result in API Gateway returning a `200` HTTP status code with a message saluting the provided name and the detailed event processed by the lambda

> :warning: As is, this template, once deployed, opens a **public** endpoint within your AWS account resources. Anybody with the URL can actively execute the API Gateway endpoint and the corresponding lambda. You should protect this endpoint with the authentication method of your choice.

### Locally

- **Test hello function**

    From project root
    - `npx sls invoke local -f hello --path src/functions/hello/mock.json` if you're using NPM
    - `serverless invoke local --function hello --data '{"body":{"name":"Bender"}}'` if you want to pass in some data

    Check the [sls invoke local command documentation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/) for more information.

- **Test UI**

    From ui directory \
    `npm start`

### Remotely

Copy and replace your `url` - found in Serverless `deploy` command output - and `name` parameter in the following `curl` command in your terminal or in Postman to test your newly deployed application.

```
curl --location --request POST 'https://myApiEndpoint/dev/hello' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Bender"
}'
```

## Template features

### Project structure

The project code base is mainly located within the `ui` and `src` folder. The `ui` folder consists of the react frontend. `src` folder has the API and is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── ui                          # react application
│
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   ├── hello
│   │   │   ├── handler.ts      # `Hello` lambda source code
│   │   │   ├── index.ts        # `Hello` lambda Serverless configuration
│   │   │   ├── mock.json       # `Hello` lambda input parameter, if any, for local invocation
│   │   │   └── schema.ts       # `Hello` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts            # Import/export of all lambda configurations
│   │
│   └── libs                    # Lambda shared code
│       └── apiGateway.ts       # API Gateway specific helpers
│       └── handlerResolver.ts  # Sharable library for resolving lambda handlers
│       └── lambda.ts           # Lambda middleware
│
├── package.json
├── serverless.ts               # Serverless service file
├── tsconfig.json               # Typescript compiler configuration
├── tsconfig.paths.json         # Typescript paths
└── webpack.config.js           # Webpack configuration
```

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file

### Advanced usage

Any tsconfig.json can be used, but if you do, set the environment variable `TS_NODE_CONFIG` for building the application, eg `TS_NODE_CONFIG=./tsconfig.app.json npx serverless webpack`

## Tips and Tricks

- **Create a new function**

    There are a few files you would need to modify/create to do this. You can start by copying the hello directory and pasting it with the name of the function you want to create. Then

    - Modify handler.ts and rename all occurrences of "hello". This is not necessary but should be done for accuracy purposes.
    - Modify **index.ts under the new directory you created** and rename all occurrences of "hello". This is also where you set the type of your resource ("get", "post", etc)
    - Modify **src/index.ts** to export your new function
    - Modify serverless.ts (under project root) and
        - import your new function
        - list it under the 'functions' parameter in the serverlessConfiguration

- **Updating CORS policy**

    You need to modify `libs/lambda.ts` to add a new import

    ```
    import cors from "@middy/http-cors";
    ```

    And now, for example, if you wanted to restrict access to the API to 'https://sayengar.ngrok.io', add the following parameter to return value of the 'middyfy' function
    ```
        cors({
        origins: [
            "https://sayengar.ngrok.io"
        ],
        credentials: true
        })
    ```
    Note that origins is an array and you can add multiple domains to the whitelist.

- **Create new branch**

    You can use branch.sh to create new branches for your repo. This abstracts most of the commands you need to create a new branch.