output "raw_bucket_name" {
  description = "Name of the raw data S3 bucket"
  value       = aws_s3_bucket.raw.id
}

output "processed_bucket_name" {
  description = "Name of the processed data S3 bucket"
  value       = aws_s3_bucket.processed.id
}

output "step_function_arn" {
  description = "ARN of the Step Functions state machine"
  value       = aws_sfn_state_machine.data_pipeline.arn
}

output "step_function_name" {
  description = "Name of the Step Functions state machine"
  value       = aws_sfn_state_machine.data_pipeline.name
}

output "data_pipeline_lambda_name" {
  description = "Name of the data pipeline Lambda function"
  value       = aws_lambda_function.data_pipeline_processor.function_name
}
