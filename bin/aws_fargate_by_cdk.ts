#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsFargateByCdkStack } from '../lib/aws_fargate_by_cdk-stack';

const app = new cdk.App();
new AwsFargateByCdkStack(app, 'AwsFargateByCdkStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});
