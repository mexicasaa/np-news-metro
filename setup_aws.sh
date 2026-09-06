#!/bin/bash
# AWS Infrastructure Setup Script for NP News Metro Telemetry

set -e

echo "Creating SQS Queue for Telemetry..."
QUEUE_URL=$(aws sqs create-queue \
    --queue-name np-news-telemetry \
    --query 'QueueUrl' \
    --output text)

echo "SQS Queue created: $QUEUE_URL"

echo "Creating IAM Role for Lambda..."
ROLE_ARN=$(aws iam create-role \
    --role-name NPNewsTelemetryLambdaRole \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Principal": {
            "Service": "lambda.amazonaws.com"
          },
          "Effect": "Allow"
        }
      ]
    }' \
    --query 'Role.Arn' \
    --output text)

echo "IAM Role created: $ROLE_ARN"

echo "Attaching policies to role..."
aws iam attach-role-policy \
    --role-name NPNewsTelemetryLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole

# Note: In a real environment, you need to create the deployment package (zip) first.
# This is a placeholder for the actual lambda function creation.
echo ""
echo "========================================"
echo "Infrastructure setup partially complete."
echo "Please set the following environment variable in Vercel:"
echo "AWS_SQS_TELEMETRY_QUEUE_URL=$QUEUE_URL"
echo ""
echo "To deploy the Lambda consumer, zip your lambda code and run:"
echo "aws lambda create-function \\"
echo "  --function-name np-news-telemetry-processor \\"
echo "  --runtime nodejs20.x \\"
echo "  --role $ROLE_ARN \\"
echo "  --handler index.handler \\"
echo "  --zip-file fileb://lambda.zip"
echo "========================================"
