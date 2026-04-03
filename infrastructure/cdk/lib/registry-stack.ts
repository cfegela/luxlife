import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as codeartifact from 'aws-cdk-lib/aws-codeartifact';
import { Construct } from 'constructs';

export class RegistryStack extends cdk.Stack {
  public readonly ecrRepository: ecr.Repository;
  public readonly codeArtifactDomain: codeartifact.CfnDomain;
  public readonly codeArtifactRepository: codeartifact.CfnRepository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR Repository
    this.ecrRepository = new ecr.Repository(this, 'LuxlifeAppRepository', {
      repositoryName: 'luxlife-app',
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.IMMUTABLE,
      encryption: ecr.RepositoryEncryption.AES_256,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      lifecycleRules: [
        {
          rulePriority: 1,
          description: 'Keep last 10 images',
          tagPrefixList: ['v'],
          maxImageCount: 10,
        },
        {
          rulePriority: 2,
          description: 'Remove untagged images after 7 days',
          tagStatus: ecr.TagStatus.UNTAGGED,
          maxImageAge: cdk.Duration.days(7),
        },
      ],
    });

    // CodeArtifact Domain
    this.codeArtifactDomain = new codeartifact.CfnDomain(this, 'LuxlifeDomain', {
      domainName: 'luxlife',
    });

    // CodeArtifact Repository
    this.codeArtifactRepository = new codeartifact.CfnRepository(this, 'PackagesRepository', {
      repositoryName: 'packages',
      domainName: this.codeArtifactDomain.domainName,
      externalConnections: ['public:maven-central'],
    });

    this.codeArtifactRepository.addDependency(this.codeArtifactDomain);

    // Outputs
    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.ecrRepository.repositoryUri,
      description: 'ECR Repository URI',
      exportName: 'EcrRepositoryUri',
    });

    new cdk.CfnOutput(this, 'EcrRepositoryArn', {
      value: this.ecrRepository.repositoryArn,
      description: 'ECR Repository ARN',
      exportName: 'EcrRepositoryArn',
    });

    new cdk.CfnOutput(this, 'CodeArtifactDomainArn', {
      value: this.codeArtifactDomain.attrArn,
      description: 'CodeArtifact Domain ARN',
      exportName: 'CodeArtifactDomainArn',
    });

    new cdk.CfnOutput(this, 'CodeArtifactRepositoryArn', {
      value: this.codeArtifactRepository.attrArn,
      description: 'CodeArtifact Repository ARN',
      exportName: 'CodeArtifactRepositoryArn',
    });
  }
}
