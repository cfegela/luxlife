output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = [
    aws_subnet.public_1.id,
    aws_subnet.public_2.id,
    aws_subnet.public_3.id
  ]
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id,
    aws_subnet.private_3.id
  ]
}

output "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks"
  value       = [
    aws_subnet.public_1.cidr_block,
    aws_subnet.public_2.cidr_block,
    aws_subnet.public_3.cidr_block
  ]
}

output "private_subnet_cidrs" {
  description = "List of private subnet CIDR blocks"
  value       = [
    aws_subnet.private_1.cidr_block,
    aws_subnet.private_2.cidr_block,
    aws_subnet.private_3.cidr_block
  ]
}

output "nat_gateway_id" {
  description = "The ID of the NAT Gateway"
  value       = aws_nat_gateway.main.id
}

output "internet_gateway_id" {
  description = "The ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}
