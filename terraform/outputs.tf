output "ecr_repository_url" {
  value = aws_ecr_repository.app_repo.repository_url
}

output "ec2_public_ip" {
  value = aws_instance.web_server.public_ip
}