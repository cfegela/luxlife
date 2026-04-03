resource "aws_iam_role" "step_functions" {
  name = "data-pipeline-step-functions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "states.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "step_functions_lambda" {
  name = "step-functions-lambda-policy"
  role = aws_iam_role.step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.data_pipeline_processor.arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "step_functions_logs" {
  name = "step-functions-logs-policy"
  role = aws_iam_role.step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogDelivery",
          "logs:GetLogDelivery",
          "logs:UpdateLogDelivery",
          "logs:DeleteLogDelivery",
          "logs:ListLogDeliveries",
          "logs:PutResourcePolicy",
          "logs:DescribeResourcePolicies",
          "logs:DescribeLogGroups"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "step_functions" {
  name              = "/aws/stepfunctions/data-pipeline"
  retention_in_days = 7
}

resource "aws_sfn_state_machine" "data_pipeline" {
  name     = "data-pipeline"
  role_arn = aws_iam_role.step_functions.arn

  definition = jsonencode({
    Comment = "Data pipeline to process files from raw to processed bucket"
    StartAt = "ProcessFile"
    States = {
      ProcessFile = {
        Type     = "Task"
        Resource = "arn:aws:states:::lambda:invoke"
        Parameters = {
          FunctionName = aws_lambda_function.data_pipeline_processor.arn
          Payload = {
            "detail.$" = "$.detail"
          }
        }
        Retry = [
          {
            ErrorEquals = [
              "Lambda.ServiceException",
              "Lambda.AWSLambdaException",
              "Lambda.SdkClientException"
            ]
            IntervalSeconds = 2
            MaxAttempts     = 3
            BackoffRate     = 2
          }
        ]
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            Next        = "HandleError"
          }
        ]
        Next = "Success"
      }
      Success = {
        Type = "Succeed"
      }
      HandleError = {
        Type = "Fail"
        Error = "ProcessingFailed"
        Cause = "Failed to process file"
      }
    }
  })

  logging_configuration {
    log_destination        = "${aws_cloudwatch_log_group.step_functions.arn}:*"
    include_execution_data = true
    level                  = "ALL"
  }
}
