resource "aws_apigatewayv2_api" "hello" {
  name          = "hello-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "hello" {
  api_id      = aws_apigatewayv2_api.hello.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "hello" {
  api_id             = aws_apigatewayv2_api.hello.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.hello.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "hello" {
  api_id    = aws_apigatewayv2_api.hello.id
  route_key = "GET /hello"
  target    = "integrations/${aws_apigatewayv2_integration.hello.id}"
}
