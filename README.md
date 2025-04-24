# Amazon RDS initialization using CDK

| Key          | Value                                                                                 |
| ------------ | ------------------------------------------------------------------------------------- |
| Environment  | <img src="https://img.shields.io/badge/LocalStack-deploys-4D29B4.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAKgAAACoABZrFArwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAALbSURBVHic7ZpNaxNRFIafczNTGIq0G2M7pXWRlRv3Lusf8AMFEQT3guDWhX9BcC/uFAr1B4igLgSF4EYDtsuQ3M5GYrTaj3Tmui2SpMnM3PlK3m1uzjnPw8xw50MoaNrttl+r1e4CNRv1jTG/+v3+c8dG8TSilHoAPLZVX0RYWlraUbYaJI2IuLZ7KKUWCisgq8wF5D1A3rF+EQyCYPHo6Ghh3BrP8wb1en3f9izDYlVAp9O5EkXRB8dxxl7QBoNBpLW+7fv+a5vzDIvVU0BELhpjJrmaK2NMw+YsIxunUaTZbLrdbveZ1vpmGvWyTOJToNlsuqurq1vAdWPMeSDzwzhJEh0Bp+FTmifzxBZQBXiIKaAq8BBDQJXgYUoBVYOHKQRUER4mFFBVeJhAQJXh4QwBVYeHMQJmAR5GCJgVeBgiYJbg4T8BswYPp+4GW63WwvLy8hZwLcd5TudvBj3+OFBIeA4PD596nvc1iiIrD21qtdr+ysrKR8cY42itCwUP0Gg0+sC27T5qb2/vMunB/0ipTmZxfN//orW+BCwmrGV6vd63BP9P2j9WxGbxbrd7B3g14fLfwFsROUlzBmNM33XdR6Meuxfp5eg54IYxJvXCx8fHL4F3w36blTdDI4/0WREwMnMBeQ+Qd+YC8h4g78wF5D1A3rEqwBiT6q4ubpRSI+ewuhP0PO/NwcHBExHJZZ8PICI/e73ep7z6zzNPwWP1djhuOp3OfRG5kLROFEXv19fXP49bU6TbYQDa7XZDRF6kUUtEtoFb49YUbh/gOM7YbwqnyG4URQ/PWlQ4ASllNwzDzY2NDX3WwioKmBgeqidgKnioloCp4aE6AmLBQzUExIaH8gtIBA/lFrCTFB7KK2AnDMOrSeGhnAJSg4fyCUgVHsolIHV4KI8AK/BQDgHW4KH4AqzCQwEfiIRheKKUAvjuuu7m2tpakPdMmcYYI1rre0EQ1LPo9w82qyNziMdZ3AAAAABJRU5ErkJggg=="> <img src="https://img.shields.io/badge/AWS-deploys-F29100.svg?logo=amazon">                                                                           |
| Services     | RDS, Lambda, SecretsManager, ECR                                       |
| Integrations | AWS CDK, AWS SDK for JavaScript                                        |
| Categories   | Databases                                                              |
| Level        | Intermediate                                                           |
| GitHub       | [Repository link](https://github.com/localstack/amazon-rds-init-cdk)   |

## Introduction

The Amazon RDS initialization using CDK sample application demonstrates how LocalStack supports RDS instances initialization using CDK and CloudFormation Custom Resources. The sample application implements a Node.js Lambda function for compute layer, which is able to run custom SQL scripts. It also executes custom commands supported by the [Node.js client for MySQL2](https://www.npmjs.com/package/mysql2). To test this application sample, we will demonstrate how you use LocalStack to deploy the infrastructure on your developer machine and your CI environment and use a Lambda function to run queries against the RDS database after successful deployment.

## Architecture Diagram

The following diagram shows the architecture that this sample application builds and deploys:

![Architecture Diagram demonstrating Amazon RDS initialization using CDK](images/architecture-diagram.png)

* [RDS](https://docs.localstack.cloud/user-guide/aws/rds/) as the central part of the sample application which is initialized and pre-filled with data.
* [Lambda](https://docs.localstack.cloud/user-guide/aws/lambda/) to initialize the database, and query data
* [SecretsManager](https://docs.localstack.cloud/references/coverage/coverage_secretsmanager/) to store the credentials and configuration of the RDS database.

## Prerequisites

- LocalStack Pro with the [`localstack` CLI](https://docs.localstack.cloud/getting-started/installation/#localstack-cli).
- [AWS CLI](https://docs.localstack.cloud/user-guide/integrations/aws-cli/) with the [`awslocal` wrapper](https://docs.localstack.cloud/user-guide/integrations/aws-cli/#localstack-aws-cli-awslocal).
- [CDK](https://docs.localstack.cloud/user-guide/integrations/aws-cdk/) with the [`cdklocal`](https://www.npmjs.com/package/aws-cdk-local) wrapper.
- [Node.js](https://nodejs.org/en/download/)

## Instructions

You can build and deploy the sample application on LocalStack by running our `Makefile` commands:
`build`, `bootstrap`, and `deploy`. Alternatively, here are instructions to deploy it manually step-by-step.

### Run LocalStack

Start LocalStack Pro with the `LOCALSTACK_AUTH_TOKEN` pre-configured:

```shell
export LOCALSTACK_AUTH_TOKEN=<your-auth-token>
localstack start
```

The sample application uses RDS with a MySQL Engine. Currently, by default LocalStack will use a MariaDB engine instead (check details in our [RDS documentation](https://docs.localstack.cloud/user-guide/aws/rds/#mysql-engine)). You can enable the use of real MySQL engine, which will start a MySQL instance in a separate docker container, by setting the env `RDS_MYSQL_DOCKER=1`. Run the following command to start LocalStack with MySQL engine:

```shell
export LOCALSTACK_AUTH_TOKEN=<your-api-key>
RDS_MYSQL_DOCKER=1 localstack start
```

### Installation

Install the project dependencies by running the following command:

```shell
npm install
```

Additionally, there is a Node.js Lambda located in `demos/rds-query-fn-code` that also requires external dependencies. Install these dependencies by navigating to the `demos/rds-query-fn-code` directory and running:

```shell
npm install && cd demos/rds-query-fn-code && npm install && cd ../../
```

## Deploying the application

Once the dependencies are installed, run the following commands in the project's root directory:

```shell
cdklocal bootstrap
cdklocal deploy --require-approval never
```

This command deploys the application to LocalStack without requiring manual approval for each deployment step. Wait for the deployment to complete. Once finished, you will see some `Outputs` similar to the following:

```shell
RdsInitExample.RdsInitFnResponse = {"status":"OK","results":[{"fieldCount":0,"affectedRows":0,"insertId":0,"info":"","serverStatus":10,"warningStatus":0},{"fieldCount":0,"affectedRows":0,"insertId":0,"info":"","serverStatus":10,"warningStatus":0},{"fieldCount":0,"affectedRows":0,"insertId":0,"info":"","serverStatus":10,"warningStatus":0},{"fieldCount":0,"affectedRows":0,"insertId":0,"info":"","serverStatus":10,"warningStatus":0},{"fieldCount":0,"affectedRows":1,"insertId":1,"info":"","serverStatus":10,"warningStatus":0},{"fieldCount":0,"affectedRows":1,"insertId":2,"info":"","serverStatus":10,"warningStatus":0},{"fieldCount":0,"affectedRows":1,"insertId":3,"info":"","serverStatus":10,"warningStatus":0},{"fieldCount":0,"affectedRows":1,"insertId":1,"info":"","serverStatus":10,"warningStatus":0},{"fieldCount":0,"affectedRows":1,"insertId":2,"info":"","serverStatus":2,"warningStatus":0}]}
RdsInitExample.functionName = my-lambda-rds-query-helper
RdsInitExample.secretName = /rdsinitexample/rds/creds/mysql-01
```

* `RdsInitExample.RdsInitFnResponse` shows the execution result of the SQL script (`demos/rds-init-fn-code/script.sql`).
* `RdsInitExample.functionName` is the name of the function that can be used to run test queries against RDS.
* `RdsInitExample.secretName` is the name of the secret that contains information about the database. This name is required as input for the Lambda to run queries.

## Test the Sample

The sample application initializes the database with tables and dummy data. Additionally, we have included a Lambda function called `my-lambda-rds-query-helper`, which allows you to run queries against the RDS database.

The Lambda function expects two parameters: `sqlQuery` for the query itself, and `secretName` for the secret containing the database connection details.

For example, you query the authors of books like this for AWS CLI v1:

```shell
awslocal lambda invoke --function-name my-lambda-rds-query-helper --payload '{"sqlQuery": "select Author from books", "secretName":"/rdsinitexample/rds/creds/mysql-01"}' output
```

If you are using AWS CLI v2, please use the following:

```shell
awslocal lambda invoke --cli-binary-format raw-in-base64-out --function-name my-lambda-rds-query-helper --payload '{"sqlQuery": "select Author from books", "secretName":"/rdsinitexample/rds/creds/mysql-01"}' output
```

This command invokes the `my-lambda-rds-query-helper` function with the specified query and secret.

To view the result, use the following command:

```shell
cat output
````

The result will be displayed in the output, similar to the following:

```shell
{"status":"SUCCESS","results":[{"Author":"Jane Doe"},{"Author":"Jane Doe"},{"Author":"LocalStack"}]}
```

### Use Cases

In the sample, we set up the database by creating tables and adding dummy data using the `demos/rds-init-fn-code/scripts.sql` script.

The setup process can be enhanced to cover various use cases, including:

- Initializing databases.
- Initializing and maintaining users and their permissions.
- Initializing and maintaining stored procedures, views, or other database resources.
- Executing custom logic as part of a resource initialization process.
Improving segregation of duties and least privilege by providing a flexible hook in the Infrastructure-as-Code (IaC) to manage RDS instance initialization.
- Initializing database tables (see note below).
- Seeding database tables with initial datasets (see note below).

> **NOTE**: Please note that application-specific initialization logic, such as defining the structure of database tables and seeding them with initial data, is typically managed on the application side. It is generally recommended to keep infrastructure initialization/management separate from application-specific initialization.

## Technical Implementation Details

In order to achieve custom logic execution during the deployment flow of a CDK stack, we make use of CloudFormation Custom Resources. In the context of CDK, we use the `AwsCustomResource` construct to invoke a deployed Lambda containing the RDS initialization logic (execute SQL scripts).

> Optionally you can read more about making custom AWS API calls using the [AwsCustomResource construct](https://docs.aws.amazon.com/cdk/api/v1/docs/custom-resources-readme.html#custom-resources-for-aws-apis).

### Client implementation based on Node.js

To execute SQL scripts on the provisioned Amazon RDS instance we make use of the `mysql` NPM module, it allow us to easily execute custom SQL scripts or any other support `client` **->** `server` command:

```js
const mysql = require('mysql2')
const connection = mysql.createConnection({
  host,
  user,
  password,
  multipleStatements: true
})
connection.connect()

connection.query("SELECT 'Hello World!';", (err, res) => {
  // ...
})
```
> Full Node.js implementation example for MySQL is available at `./demos/rds-init-fn-code/index.js`

### Docker container images for Lambda functions

To avoid unnecessary overhead dealing with software dependencies, we promote the usage of Docker container images to package the RDS initialization Lambda function code. 

Docker container images are automatically managed by CDK and there is no need to interact with ECR repositories, simply use:

```js
const fnCode = DockerImageCode.fromImageAsset(`${__dirname}/your-fn-code-directory`, {})
```
> You can see a Lambda function code example inside the `./demos/rds-init-fn-code` directory.  

### Lambda function for querying RDS

An additional Lambda function to show case querying of RDS database, uses code from assets. 
This requires to run `npm install` in the directory first, so that the node-modules are available.

```js
// create a new Lambda to run queries against the database for testing purpose after init
const lambdaQuery = new lambda.Function(this, 'MyLambdaRDSQueryHelper', {
  code: new lambda.AssetCode(`${__dirname}/rds-query-fn-code`),
  handler: 'index.handler',
  runtime: lambda.Runtime.NODEJS_16_X,
  memorySize: 1024,
  timeout: cdk.Duration.seconds(300),
  functionName: "my-lambda-rds-query-helper"
})
```

### The CdkResourceInitializer construct

The `CDKResourceInitializer` CDK construct generalizes the proposed solution, it encapsulates the integration requirements behind `CloudFormation Custom Resources` and `CDK`, to support the execution of AWS Lambda functions with custom initialization logic. 
The implementation can be found in `lib/resource-initializer.ts`.

## Learn More

More details about the original sample can be found in the AWS blog post — [Use AWS CDK to initialize Amazon RDS instances](https://aws.amazon.com/blogs/infrastructure-and-automation/use-aws-cdk-to-initialize-amazon-rds-instances/).


## Cloud Pods

[Cloud Pods](https://docs.localstack.cloud/user-guide/tools/cloud-pods/) are a mechanism that allows you to take a snapshot of the state in your current LocalStack instance, persist it to a storage backend, and easily share it with your team members.

You can convert your current AWS infrastructure state to a Cloud Pod using the `localstack` CLI. 
Check out our [Getting Started guide](https://docs.localstack.cloud/user-guide/tools/cloud-pods/getting-started/) and [LocalStack Cloud Pods CLI reference](https://docs.localstack.cloud/user-guide/tools/cloud-pods/pods-cli/) to learn more about Cloud Pods and how to use them.

To inject a Cloud Pod you can use [Cloud Pods Launchpad](https://docs.localstack.cloud/user-guide/tools/cloud-pods/launchpad/) wich quickly injects Cloud Pods into your running LocalStack container. 

> **NOTE**: The Cloud Pod linked here, was created with the `latest` LocalStack version, make sure you also run `latest` when injecting. 
Further, LocalStack needs to be started with the flag `RDS_MYSQL_DOCKER=1`. For different flavors check the available [releases](https://github.com/localstack/amazon-rds-init-cdk/releases).

Click here [![LocalStack Pods Launchpad](https://localstack.cloud/gh/launch-pod-badge.svg)](https://app.localstack.cloud/launchpad?url=https://github.com/localstack/amazon-rds-init-cdk/releases/download/latest/release-pod-mysql.zip) to launch the Cloud Pods Launchpad and inject the Cloud Pod for this application by clicking the `Inject` button.

![Cloud Pod injection with the Cloud Pod Launchpad](images/screenshot_launchpad.png)

Alternatively, you can inject the pod by using the `localstack` CLI. 
First, you need to download the pod you want to inject from the [releases](https://github.com/localstack/amazon-rds-init-cdk/releases).
Then run:

```sh
localstack pod load file://$(pwd)/release-pod-mysql.zip
```


### Troubleshooting Cloud Pod Injection

If you are on MacOS using the Docker Desktop App, and you want to inject the mysql pod, you might need to change some settings.

The error message in LocalStack is visible when you enable debugging (`DEBUG=1`):

```
Different lower_case_table_names settings for server ('2') and data dictionary ('0').
Data Dictionary initialization failed.
```

To fix this, go to the settings of the Docker Desktop App -> General, and then select `osxfs (Legacy)` for file sharing:

![Change the Docker Desktop Setting](images/screenshot_docker_desktop_setting.png)

Apply the changes, and restart LocalStack before attempting to inject the pod again.


## Contributing

We appreciate your interest in contributing to our project and are always looking for new ways to improve the developer experience. We welcome feedback, bug reports, and even feature ideas from the community.
Please refer to the [contributing file](CONTRIBUTING.md) for more details on how to get started. 
