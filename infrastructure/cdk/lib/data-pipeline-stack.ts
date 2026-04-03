import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

export class DataPipelineStack extends cdk.Stack {
  public readonly rawBucket: s3.Bucket;
  public readonly processedBucket: s3.Bucket;
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Buckets
    this.rawBucket = new s3.Bucket(this, 'RawDataBucket', {
      bucketName: `luxlife-raw-data-${cdk.Aws.ACCOUNT_ID}`,
      eventBridgeEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.processedBucket = new s3.Bucket(this, 'ProcessedDataBucket', {
      bucketName: `luxlife-processed-data-${cdk.Aws.ACCOUNT_ID}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambda Execution Role
    const lambdaRole = new iam.Role(this, 'DataPipelineLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'data-pipeline-lambda-role',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant S3 permissions to Lambda
    this.rawBucket.grantRead(lambdaRole);
    this.processedBucket.grantWrite(lambdaRole);

    // CloudWatch Log Group for Lambda
    const lambdaLogGroup = new logs.LogGroup(this, 'DataPipelineLambdaLogGroup', {
      logGroupName: '/aws/lambda/data-pipeline-processor',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Function
    const processorFunction = new lambda.Function(this, 'DataPipelineProcessor', {
      functionName: 'data-pipeline-processor',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'data_pipeline.handler',
      code: lambda.Code.fromAsset('lambda', {
        exclude: ['*.zip'],
      }),
      role: lambdaRole,
      memorySize: 256,
      timeout: cdk.Duration.seconds(60),
      environment: {
        PROCESSED_BUCKET: this.processedBucket.bucketName,
      },
      logGroup: lambdaLogGroup,
    });

    // Step Functions Task
    const processFileTask = new tasks.LambdaInvoke(this, 'ProcessFile', {
      lambdaFunction: processorFunction,
      payload: sfn.TaskInput.fromObject({
        'detail.$': '$.detail',
      }),
      retryOnServiceExceptions: true,
    });

    // Success and Error states
    const successState = new sfn.Succeed(this, 'Success');
    const errorState = new sfn.Fail(this, 'HandleError', {
      error: 'ProcessingFailed',
      cause: 'Failed to process file',
    });

    // Define state machine
    const definition = processFileTask
      .addRetry({
        errors: [
          'Lambda.ServiceException',
          'Lambda.AWSLambdaException',
          'Lambda.SdkClientException',
        ],
        interval: cdk.Duration.seconds(2),
        maxAttempts: 3,
        backoffRate: 2,
      })
      .addCatch(errorState, {
        errors: ['States.ALL'],
      })
      .next(successState);

    // CloudWatch Log Group for Step Functions
    const sfnLogGroup = new logs.LogGroup(this, 'StepFunctionsLogGroup', {
      logGroupName: '/aws/stepfunctions/data-pipeline',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Step Functions State Machine
    this.stateMachine = new sfn.StateMachine(this, 'DataPipelineStateMachine', {
      stateMachineName: 'data-pipeline',
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
      logs: {
        destination: sfnLogGroup,
        level: sfn.LogLevel.ALL,
        includeExecutionData: true,
      },
    });

    // EventBridge Rule for S3 Object Created
    const s3ObjectCreatedRule = new events.Rule(this, 'S3ObjectCreatedRule', {
      ruleName: 'data-pipeline-s3-object-created',
      description: 'Trigger Step Function when object is created in raw bucket',
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['Object Created'],
        detail: {
          bucket: {
            name: [this.rawBucket.bucketName],
          },
        },
      },
    });

    // Add Step Functions as target
    s3ObjectCreatedRule.addTarget(new targets.SfnStateMachine(this.stateMachine));

    // Outputs
    new cdk.CfnOutput(this, 'RawBucketName', {
      value: this.rawBucket.bucketName,
      description: 'Raw Data Bucket Name',
      exportName: 'RawDataBucketName',
    });

    new cdk.CfnOutput(this, 'ProcessedBucketName', {
      value: this.processedBucket.bucketName,
      description: 'Processed Data Bucket Name',
      exportName: 'ProcessedDataBucketName',
    });

    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: this.stateMachine.stateMachineArn,
      description: 'Step Functions State Machine ARN',
      exportName: 'DataPipelineStateMachineArn',
    });

    new cdk.CfnOutput(this, 'ProcessorFunctionArn', {
      value: processorFunction.functionArn,
      description: 'Data Pipeline Processor Lambda ARN',
      exportName: 'DataPipelineProcessorArn',
    });
  }
}
