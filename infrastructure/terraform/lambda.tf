data "archive_file" "lambda_hello" {
  type        = "zip"
  source_file = "${path.module}/lambda/hello.py"
  output_path = "${path.module}/lambda/hello.zip"
}

resource "aws_cloudwatch_log_group" "lambda_hello" {
  name              = "/aws/lambda/hello-world"
  retention_in_days = 7
}

resource "aws_iam_role" "lambda_execution" {
  name = "lambda-execution-role"

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

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "hello" {
  filename         = data.archive_file.lambda_hello.output_path
  function_name    = "hello-world"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "hello.handler"
  source_code_hash = data.archive_file.lambda_hello.output_base64sha256
  runtime         = "python3.12"
  memory_size     = 128
  timeout         = 10

  depends_on = [
    aws_cloudwatch_log_group.lambda_hello,
    aws_iam_role_policy_attachment.lambda_basic_execution
  ]
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hello.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.hello.execution_arn}/*/*"
}
