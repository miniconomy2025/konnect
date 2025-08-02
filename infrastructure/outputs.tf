output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "ec2_public_ip" {
  value = module.ec2.public_ip
}

output "ec2_elastic_ip" {
  value = module.ec2.elastic_ip
  description = "Elastic IP address of the first EC2 instance (if any)"
}

output "ec2_public_dns" {
  value       = module.ec2.public_dns
  description = "Public DNS of the first EC2 instance"
}

output "bucket_name" {
  value = module.s3.bucket_name
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "target_group_arn" {
  value = module.alb.target_group_arn
}