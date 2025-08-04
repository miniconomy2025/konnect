# Backend variables
variable "backend_bucket" {
  description = "S3 bucket for Terraform state"
  type        = string
}

variable "backend_key" {
  description = "Path within the bucket for the state file"
  type        = string
  default     = "terraform.tfstate"
}

variable "backend_region" {
  description = "AWS region for the backend bucket"
  type        = string
  default     = "af-south-1"
}

variable "backend_dynamodb_table" {
  description = "DynamoDB table for state locking"
  type        = string
}

# General variables
variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "af-south-1"
}

# VPC module variables
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# EC2 module variables
variable "ec2_instance_count" {
  description = "Number of EC2 instances"
  type        = number
  default     = 1
}

variable "key_name" {
  description = "The name of the key pair to associate with the EC2 instance."
  type        = string
  default     = null
}

# Budget module variables
variable "budget_emails" {
  description = "List of email addresses to receive AWS budget alerts"
  type        = list(string)
}

# GitHub variables
variable "github_repository" {
  description = "GitHub repository in format owner/repo"
  type        = string
}