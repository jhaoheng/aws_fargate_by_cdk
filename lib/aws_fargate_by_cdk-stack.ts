import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import { CfnCluster } from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';

export class AwsFargateByCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // vpc
    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      isDefault: true,
    })

    // ECS, TaskDefinition
    const taskDef = new ecs.TaskDefinition(this, 'TaskDef', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: "256",
      memoryMiB: "512",
      family: 'demoTaskDef',
    })
    taskDef.addContainer('AppContainer', {
      image: ecs.ContainerImage.fromAsset("dockerImages/app"),
    }).addPortMappings({
      containerPort: 80,
    })

    // ECS, Cluster
    const ecsCluster = new ecs.Cluster(this, 'ECSCluster', {
      vpc,
      clusterName: 'demoCluster',
    })
    const cfnEcsCluster = ecsCluster.node.defaultChild as CfnCluster;
    cfnEcsCluster.capacityProviders = ['FARGATE', 'FARGATE_SPOT'];
    cfnEcsCluster.defaultCapacityProviderStrategy = [{ capacityProvider: "FARGATE_SPOT", weight: 1 }]

    // ECS, Service
    const ecsSvc = new ecs.FargateService(this, 'SVC', {
      platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
      serviceName: 'demoSvc',
      cluster: ecsCluster,
      taskDefinition: taskDef,
    })
    ecsSvc.connections.allowFrom(
      ec2.Peer.ipv4("0.0.0.0/0"),
      ec2.Port.tcp(80),
    )
    const scaling = ecsSvc.autoScaleTaskCount({
      maxCapacity: 4,
      minCapacity: 1,
    });
    scaling.scaleOnCpuUtilization('ECSServiceAverageCPUUtilization', {
      targetUtilizationPercent: 60,
    });

    // set ecs service strategy
    const strategy = [{ capacityProvider: "FARGATE_SPOT", weight: 1 }];
    const theFirst: ecs.CfnService = ecsSvc.node.children[0] as ecs.CfnService;
    theFirst.addPropertyDeletionOverride('LaunchType');
    theFirst.addPropertyOverride("capacityProviderStrategy", strategy);

    //
    const demoTargetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc,
      port: 80,
      targets: [
        ecsSvc
      ],
      protocol: elbv2.ApplicationProtocol.HTTP,
    })

    // elbv2
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
        onePerAz: true,
      }
    });

    const httpListener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [demoTargetGroup],
    });

    //
    new cdk.CfnOutput(this, "AlbDns", {
      value: alb.loadBalancerDnsName
    })
  }
}
