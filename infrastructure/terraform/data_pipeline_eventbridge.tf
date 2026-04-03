resource "aws_iam_role" "eventbridge_step_functions" {
  name = "eventbridge-step-functions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "eventbridge_step_functions" {
  name = "eventbridge-step-functions-policy"
  role = aws_iam_role.eventbridge_step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "states:StartExecution"
        ]
        Resource = aws_sfn_state_machine.data_pipeline.arn
      }
    ]
  })
}

resource "aws_cloudwatch_event_rule" "s3_object_created" {
  name        = "data-pipeline-s3-object-created"
  description = "Trigger Step Function when object is created in raw bucket"

  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["Object Created"]
    detail = {
      bucket = {
        name = [aws_s3_bucket.raw.id]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "step_functions" {
  rule     = aws_cloudwatch_event_rule.s3_object_created.name
  arn      = aws_sfn_state_machine.data_pipeline.arn
  role_arn = aws_iam_role.eventbridge_step_functions.arn
}
