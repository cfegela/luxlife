resource "aws_iam_role" "data_pipeline_lambda" {
  name = "data-pipeline-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "data_pipeline_lambda_s3" {
  name = "data-pipeline-lambda-s3-policy"
  role = aws_iam_role.data_pipeline_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = "${aws_s3_bucket.raw.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.processed.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "data_pipeline_lambda_basic" {
  role       = aws_iam_role.data_pipeline_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "data_pipeline_lambda" {
  name              = "/aws/lambda/data-pipeline-processor"
  retention_in_days = 7
}

data "archive_file" "data_pipeline_lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/data_pipeline.py"
  output_path = "${path.module}/lambda/data_pipeline.zip"
}

resource "aws_lambda_function" "data_pipeline_processor" {
  filename         = data.archive_file.data_pipeline_lambda.output_path
  function_name    = "data-pipeline-processor"
  role            = aws_iam_role.data_pipeline_lambda.arn
  handler         = "data_pipeline.handler"
  source_code_hash = data.archive_file.data_pipeline_lambda.output_base64sha256
  runtime         = "python3.12"
  memory_size     = 256
  timeout         = 60

  environment {
    variables = {
      PROCESSED_BUCKET = aws_s3_bucket.processed.id
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.data_pipeline_lambda,
    aws_iam_role_policy_attachment.data_pipeline_lambda_basic,
    aws_iam_role_policy.data_pipeline_lambda_s3
  ]
}
