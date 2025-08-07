variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ALB"
  type        = list(string)
}

variable "vpc_id" {
  description = "VPC ID for the ALB"
  type        = string
}

variable "instance_ids" {
  description = "List of EC2 instance IDs to register with the target group"
  type        = list(string)
  default     = []
}