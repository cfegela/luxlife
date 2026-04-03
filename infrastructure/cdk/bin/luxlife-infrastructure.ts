#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { EcsStack } from '../lib/ecs-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { RdsStack } from '../lib/rds-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
import { DataPipelineStack } from '../lib/data-pipeline-stack';
import { RegistryStack } from '../lib/registry-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// VPC Stack - Foundation
const vpcStack = new VpcStack(app, 'LuxlifeVpcStack', { env });

// ECS Stack - Depends on VPC
const ecsStack = new EcsStack(app, 'LuxlifeEcsStack', {
  env,
  vpc: vpcStack.vpc,
});

// Lambda Stack - Independent
const lambdaStack = new LambdaStack(app, 'LuxlifeLambdaStack', { env });

// RDS Stack - Depends on VPC
const rdsStack = new RdsStack(app, 'LuxlifeRdsStack', {
  env,
  vpc: vpcStack.vpc,
});

// CloudFront Stack - Independent
const cloudFrontStack = new CloudFrontStack(app, 'LuxlifeCloudFrontStack', { env });

// Data Pipeline Stack - Independent
const dataPipelineStack = new DataPipelineStack(app, 'LuxlifeDataPipelineStack', { env });

// Registry Stack - Independent
const registryStack = new RegistryStack(app, 'LuxlifeRegistryStack', { env });

// Add dependencies
ecsStack.addDependency(vpcStack);
rdsStack.addDependency(vpcStack);

app.synth();
