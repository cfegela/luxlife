resource "aws_s3_bucket" "raw" {
  bucket = "luxlife-raw-data-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket" "processed" {
  bucket = "luxlife-processed-data-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_notification" "raw_bucket_notification" {
  bucket      = aws_s3_bucket.raw.id
  eventbridge = true
}
