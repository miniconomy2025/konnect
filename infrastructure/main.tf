provider "aws" {
  # version = "~> 6.0"
  region  = var.aws_region
}

module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
  aws_region   = var.aws_region
  public_subnet_count = 2
}

module "ec2" {
  source            = "./modules/ec2"
  project_name      = var.project_name
  subnet_ids        = module.vpc.public_subnet_ids
  instance_count    = var.ec2_instance_count
  aws_region        = var.aws_region
  security_group_id = module.vpc.default_security_group_id
  key_name          = var.key_name
}

module "budget" {
  source        = "./modules/budget"
  project_name  = var.project_name
  budget_emails = var.budget_emails
}

module "s3" {
  source       = "./modules/s3"
  project_name = var.project_name
}

module "alb" {
  source     = "./modules/alb"
  project_name = var.project_name
  subnet_ids = module.vpc.public_subnet_ids
  vpc_id     = module.vpc.vpc_id
}