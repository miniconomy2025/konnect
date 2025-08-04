variable "github_repository" {
  description = "GitHub repository in format owner/repo"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket to grant access to"
  type        = string
}