output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.luxlife_app.repository_url
}

output "ecr_repository_name" {
  description = "Name of the ECR repository"
  value       = aws_ecr_repository.luxlife_app.name
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.luxlife_app.arn
}

output "codeartifact_domain_name" {
  description = "Name of the CodeArtifact domain"
  value       = aws_codeartifact_domain.luxlife.domain
}

output "codeartifact_domain_arn" {
  description = "ARN of the CodeArtifact domain"
  value       = aws_codeartifact_domain.luxlife.arn
}

output "codeartifact_repository_name" {
  description = "Name of the CodeArtifact repository"
  value       = aws_codeartifact_repository.packages.repository
}

output "codeartifact_repository_arn" {
  description = "ARN of the CodeArtifact repository"
  value       = aws_codeartifact_repository.packages.arn
}
