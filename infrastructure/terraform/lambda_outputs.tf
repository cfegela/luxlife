output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.hello.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.hello.arn
}

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = aws_apigatewayv2_stage.hello.invoke_url
}

output "api_gateway_endpoint" {
  description = "Full endpoint URL for the hello function"
  value       = "${aws_apigatewayv2_stage.hello.invoke_url}/hello"
}
