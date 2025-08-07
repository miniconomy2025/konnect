output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "ARN of the IAM role for GitHub Actions"
}

output "ec2_instance_profile_name" {
  value       = aws_iam_instance_profile.ec2_s3_profile.name
  description = "Name of the IAM instance profile for EC2 S3 access"
}