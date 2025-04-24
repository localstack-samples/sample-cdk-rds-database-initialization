// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib'
import { CfnOutput, Duration, Stack, Token } from 'aws-cdk-lib'
import { CdkResourceInitializer } from '../lib/resource-initializer'
import { DockerImageCode } from 'aws-cdk-lib/aws-lambda'
import { InstanceClass, InstanceSize, InstanceType, Port, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, DatabaseSecret, MysqlEngineVersion } from 'aws-cdk-lib/aws-rds'
import * as lambda from 'aws-cdk-lib/aws-lambda'


export class RdsInitStackExample extends Stack {
  constructor (scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const instanceIdentifier = 'mysql-01'
    const credsSecretName = `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase()
    const creds = new DatabaseSecret(this, 'MysqlRdsCredentials', {
      secretName: credsSecretName,
      username: 'admin'
    })

    const vpc = new Vpc(this, 'MyVPC', {
      subnetConfiguration: [{
        cidrMask: 24,
        name: 'ingress',
        subnetType: SubnetType.PUBLIC,
      },{
        cidrMask: 24,
        name: 'compute',
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },{
        cidrMask: 28,
        name: 'rds',
        subnetType: SubnetType.PRIVATE_ISOLATED,
      }]
    })

    const dbServer = new DatabaseInstance(this, 'MysqlRdsInstance', {
      vpcSubnets: {
        onePerAz: true,
        subnetType: SubnetType.PRIVATE_ISOLATED
      },
      credentials: Credentials.fromSecret(creds),
      vpc: vpc,
      port: 3306, // note: this port will change for LocalStack, because a freely available local port is chosen
      databaseName: 'main',
      allocatedStorage: 20,
      instanceIdentifier,
      engine: DatabaseInstanceEngine.mysql({
        version: MysqlEngineVersion.VER_8_0
      }),
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.LARGE)
    })
    // potentially allow connections to the RDS instance...
    // dbServer.connections.allowFrom ...

    const initializer = new CdkResourceInitializer(this, 'MyRdsInit', {
      config: {
        credsSecretName
      },
      fnLogRetention: RetentionDays.FIVE_MONTHS,
      fnCode: DockerImageCode.fromImageAsset(`${__dirname}/rds-init-fn-code`, {}),
      fnTimeout: Duration.minutes(2),
      fnSecurityGroups: [],
      vpc,
      subnetsSelection: vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS
      })
    })
    // manage resources dependency
    initializer.customResource.node.addDependency(dbServer)

    // allow the initializer function to connect to the RDS instance
    dbServer.connections.allowFrom(initializer.function, Port.tcp(3306)) // note: not required for LocalStack

    // allow initializer function to read RDS instance creds secret
    creds.grantRead(initializer.function)
    
    // create a new Lambda to run queries against the database for testing purpose after init
    const lambdaQuery = new lambda.Function(this, 'MyLambdaRDSQueryHelper', {
      code: new lambda.AssetCode(`${__dirname}/rds-query-fn-code`),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(300),
      functionName: "my-lambda-rds-query-helper"
    })

      /* eslint no-new: 0 */
      new CfnOutput(this, 'secretName', { 
        value: credsSecretName 
      })
    
    /* eslint no-new: 0 */
    new CfnOutput(this, 'functionName', { 
      value: lambdaQuery.functionName 
    })

    /* eslint no-new: 0 */
    new CfnOutput(this, 'RdsInitFnResponse', {
      value: Token.asString(initializer.response)
    })
  }
}
