resource "aws_s3_bucket" "cloudfront_origin" {
  bucket = "luxlife-cloudfront-origin-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.cloudfront_origin.id
  key          = "index.html"
  source       = "${path.module}/s3_content/index.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/s3_content/index.html")
}

resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "s3-oac"
  description                       = "Origin Access Control for S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_All"

  origin {
    domain_name              = aws_s3_bucket.cloudfront_origin.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.cloudfront_origin.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.cloudfront_origin.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_s3_bucket_policy" "cloudfront_origin" {
  bucket = aws_s3_bucket.cloudfront_origin.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.cloudfront_origin.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}

data "aws_caller_identity" "current" {}
