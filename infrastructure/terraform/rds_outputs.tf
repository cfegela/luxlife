output "db_cluster_endpoint" {
  description = "Writer endpoint for the Aurora cluster"
  value       = aws_rds_cluster.aurora.endpoint
}

output "db_cluster_reader_endpoint" {
  description = "Reader endpoint for the Aurora cluster"
  value       = aws_rds_cluster.aurora.reader_endpoint
}

output "db_cluster_id" {
  description = "ID of the Aurora cluster"
  value       = aws_rds_cluster.aurora.id
}

output "db_secret_arn" {
  description = "ARN of the Secrets Manager secret containing database credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "db_name" {
  description = "Name of the database"
  value       = aws_rds_cluster.aurora.database_name
}
