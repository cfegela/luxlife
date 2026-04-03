resource "aws_db_subnet_group" "aurora" {
  name       = "aurora-subnet-group"
  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id,
    aws_subnet.private_3.id
  ]
}

resource "aws_security_group" "aurora" {
  name        = "aurora-sg"
  description = "Security group for Aurora database"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "random_password" "db_master_password" {
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "aurora-db-credentials"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "postgres"
    password = random_password.db_master_password.result
    engine   = "postgres"
    host     = aws_rds_cluster.aurora.endpoint
    port     = 5432
    dbname   = "luxlife"
  })
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "aurora-cluster"
  engine                  = "aurora-postgresql"
  engine_mode             = "provisioned"
  engine_version          = "15.8"
  database_name           = "luxlife"
  master_username         = "postgres"
  master_password         = random_password.db_master_password.result
  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  vpc_security_group_ids  = [aws_security_group.aurora.id]
  skip_final_snapshot     = true
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 2.0
  }
}

resource "aws_rds_cluster_instance" "aurora" {
  identifier         = "aurora-instance-1"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
}
