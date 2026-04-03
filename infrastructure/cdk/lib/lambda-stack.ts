import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {
  public readonly helloFunction: lambda.Function;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'HelloLambdaLogGroup', {
      logGroupName: '/aws/lambda/hello-world',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Execution Role
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'lambda-execution-role',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Lambda Function
    this.helloFunction = new lambda.Function(this, 'HelloFunction', {
      functionName: 'hello-world',
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda', {
        exclude: ['*.zip'],
      }),
      role: lambdaExecutionRole,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      logGroup: logGroup,
    });

    // HTTP API Gateway
    const httpApi = new apigatewayv2.HttpApi(this, 'HelloApi', {
      apiName: 'hello-api',
    });

    // Lambda Integration
    const lambdaIntegration = new apigatewayv2_integrations.HttpLambdaIntegration(
      'HelloIntegration',
      this.helloFunction
    );

    // Add Route
    httpApi.addRoutes({
      path: '/hello',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: lambdaIntegration,
    });

    this.apiUrl = httpApi.url!;

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.apiUrl,
      description: 'API Gateway URL',
      exportName: 'ApiUrl',
    });

    new cdk.CfnOutput(this, 'HelloFunctionArn', {
      value: this.helloFunction.functionArn,
      description: 'Hello Lambda Function ARN',
      exportName: 'HelloFunctionArn',
    });

    new cdk.CfnOutput(this, 'HelloFunctionName', {
      value: this.helloFunction.functionName,
      description: 'Hello Lambda Function Name',
      exportName: 'HelloFunctionName',
    });
  }
}
