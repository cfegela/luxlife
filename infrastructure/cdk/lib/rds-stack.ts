import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface RdsStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  ecsTasksSecurityGroup?: ec2.ISecurityGroup;
}

export class RdsStack extends cdk.Stack {
  public readonly cluster: rds.DatabaseCluster;
  public readonly secret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    // Security Group for Aurora
    const auroraSecurityGroup = new ec2.SecurityGroup(this, 'AuroraSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Aurora database',
      allowAllOutbound: true,
    });

    // Allow PostgreSQL access from ECS tasks if security group is provided
    if (props.ecsTasksSecurityGroup) {
      auroraSecurityGroup.addIngressRule(
        props.ecsTasksSecurityGroup,
        ec2.Port.tcp(5432),
        'PostgreSQL from ECS tasks'
      );
    }

    // Create credentials secret
    const credentials = new secretsmanager.Secret(this, 'DbCredentials', {
      secretName: 'aurora-db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
          engine: 'postgres',
          port: 5432,
          dbname: 'luxlife',
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 32,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.secret = credentials;

    // Aurora Serverless v2 Cluster
    this.cluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_8,
      }),
      credentials: rds.Credentials.fromSecret(credentials),
      defaultDatabaseName: 'luxlife',
      clusterIdentifier: 'aurora-cluster',
      writer: rds.ClusterInstance.serverlessV2('writer', {
        instanceIdentifier: 'aurora-instance-1',
      }),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [auroraSecurityGroup],
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
      backup: {
        retention: cdk.Duration.days(7),
        preferredWindow: '03:00-04:00',
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Update secret with cluster endpoint
    new secretsmanager.SecretTargetAttachment(this, 'SecretTargetAttachment', {
      secret: credentials,
      target: this.cluster,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ClusterEndpoint', {
      value: this.cluster.clusterEndpoint.hostname,
      description: 'Aurora Cluster Endpoint',
      exportName: 'AuroraClusterEndpoint',
    });

    new cdk.CfnOutput(this, 'ClusterIdentifier', {
      value: this.cluster.clusterIdentifier,
      description: 'Aurora Cluster Identifier',
      exportName: 'AuroraClusterIdentifier',
    });

    new cdk.CfnOutput(this, 'SecretArn', {
      value: credentials.secretArn,
      description: 'Database Credentials Secret ARN',
      exportName: 'DbCredentialsSecretArn',
    });
  }
}
