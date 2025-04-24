import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { 
  LambdaClient, 
  InvokeCommand,
  GetFunctionCommand 
} from '@aws-sdk/client-lambda';
import { 
  RDSClient, 
  DescribeDBInstancesCommand,
  DBInstance 
} from '@aws-sdk/client-rds';
import { 
  SecretsManagerClient, 
  GetSecretValueCommand 
} from '@aws-sdk/client-secrets-manager';
import { 
  S3Client, 
  ListBucketsCommand 
} from '@aws-sdk/client-s3';

const config = {
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
};

const lambdaClient = new LambdaClient(config);
const rdsClient = new RDSClient(config);
const secretsClient = new SecretsManagerClient(config);
const s3Client = new S3Client(config);

describe('CDK RDS Stack', () => {
  test('Stack synthesizes successfully', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    const template = Template.fromStack(stack);
    expect(template).toBeDefined();
  });

  test('Lambda function exists', async () => {
    try {
      const command = new GetFunctionCommand({
        FunctionName: 'my-lambda-rds-query-helper'
      });
      const response = await lambdaClient.send(command);
      expect(response.Configuration?.FunctionName).toBe('my-lambda-rds-query-helper');
    } catch (error) {
      expect(error).toBeFalsy(); 
    }
  });

  test('RDS instance exists', async () => {
    try {
      const command = new DescribeDBInstancesCommand({});
      const response = await rdsClient.send(command);
      expect(response.DBInstances?.length).toBeGreaterThan(0);
      const instance = response.DBInstances?.find((db: DBInstance) => db.Engine === 'mysql');
      expect(instance).toBeDefined();
    } catch (error) {
      expect(error).toBeFalsy(); 
    }
  });

  test('Secrets Manager secret exists', async () => {
    try {
      const command = new GetSecretValueCommand({
        SecretId: '/rdsinitexample/rds/creds/mysql-01'
      });
      const response = await secretsClient.send(command);
      expect(response.SecretString).toBeDefined();
    } catch (error) {
      expect(error).toBeFalsy(); 
    }
  });

  test('Lambda function returns correct response for show tables', async () => {
    const payload = {
      sqlQuery: 'show tables',
      secretName: '/rdsinitexample/rds/creds/mysql-01'
    };

    try {
      const command = new InvokeCommand({
        FunctionName: 'my-lambda-rds-query-helper',
        Payload: Buffer.from(JSON.stringify(payload))
      });
      
      const response = await lambdaClient.send(command);
      const result = JSON.parse(Buffer.from(response.Payload!).toString());
      expect(result.status).toBe('SUCCESS');
      expect(Array.isArray(result.results)).toBeTruthy();
      // Verify the expected tables are present
      const tables = result.results.map((r: any) => r.Tables_in_main);
      expect(tables).toContain('Books');
      expect(tables).toContain('OrderDetails');
    } catch (error) {
      expect(error).toBeFalsy(); 
    }
  });

  test('Lambda function returns correct response for select query', async () => {
    const payload = {
      sqlQuery: 'select Author from Books',
      secretName: '/rdsinitexample/rds/creds/mysql-01'
    };

    try {
      const command = new InvokeCommand({
        FunctionName: 'my-lambda-rds-query-helper',
        Payload: Buffer.from(JSON.stringify(payload))
      });
      
      const response = await lambdaClient.send(command);
      const result = JSON.parse(Buffer.from(response.Payload!).toString());
      expect(result.status).toBe('SUCCESS');
      expect(Array.isArray(result.results)).toBeTruthy();
      // Verify we have author data
      const authors = result.results.map((r: any) => r.Author);
      expect(authors).toContain('Jane Doe');
      expect(authors).toContain('LocalStack');
    } catch (error) {
      expect(error).toBeFalsy(); 
    }
  });
}); 
