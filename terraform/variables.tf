variable "aws_region" {
  description = "AWS region for provisioning resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name prefix for resources"
  type        = string
  default     = "devops-capstone"
}

variable "ec2_instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t3.micro"
}