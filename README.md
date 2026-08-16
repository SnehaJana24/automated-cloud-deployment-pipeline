# DevOps Capstone Project — Cloud Infrastructure & CI/CD Pipeline

A DevOps project demonstrating **Infrastructure as Code, containerization, and automated CI/CD deployment** of a Node.js application to AWS.

The project provisions AWS infrastructure using **Terraform**, packages the application with **Docker**, stores images in **Amazon ECR**, and automatically deploys the latest image to **Amazon EC2** using **GitHub Actions**.

---

## 🚀 Project Overview

The goal of this project is to build an automated deployment pipeline where a code push to GitHub can result in a new Docker image being built, pushed to Amazon ECR, and deployed to an EC2 server.

### Deployment Flow

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ├── Checkout code
    ├── Build Docker image
    ├── Authenticate with AWS
    └── Push image to ECR
            │
            ▼
       Amazon ECR
            │
            ▼
       Amazon EC2
            │
            ├── Pull latest image
            ├── Stop old container
            └── Start new container
                    │
                    ▼
             Node.js Application
```

---

## 🛠️ Problems I Hit and Fixed

This project involved solving several real deployment and infrastructure issues:

- **Free-tier instance mismatch** — `t2.micro` was not eligible for Free Tier in my AWS account/region, so I checked the available eligible instance types and switched to `t3.micro`.

- **IAM permission gap** — the Terraform IAM user initially did not have permission to create IAM roles, causing `terraform apply` to fail on `iam:CreateRole`. The required IAM permission was granted so Terraform could create the EC2 IAM role and instance profile.

- **EC2 authentication with ECR** — EC2 initially had no secure way to authenticate with ECR. This was solved by attaching an IAM role and instance profile to EC2, allowing it to use temporary AWS credentials instead of storing access keys on the server.

- **Non-empty ECR repository during destroy** — Terraform could not delete the ECR repository while Docker images were still stored in it. `force_delete = true` was added so the repository and its images could be removed during teardown.

- **GitHub Actions YAML/shell formatting errors** — missing spaces in Docker commands such as `-t`, `--name`, and other arguments caused command parsing problems. These were corrected in the workflow.

---

## 💻 Technologies Used

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| Node.js        | Sample web application          |
| Docker         | Containerizes the application   |
| Terraform      | Provisions AWS infrastructure   |
| Amazon EC2     | Hosts the application container |
| Amazon ECR     | Stores Docker images            |
| AWS IAM        | Provides secure AWS permissions |
| GitHub Actions | Automates CI/CD                 |
| Git            | Source control                  |

---

## 📁 Project Structure

```text
devops-capstone-project/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
│
├── app/
│   ├── index.js                # Node.js web server
│   └── package.json            # Node.js dependencies
│
├── terraform/
│   ├── main.tf                 # AWS infrastructure
│   ├── variables.tf            # Terraform variables
│   └── outputs.tf              # Terraform outputs
│
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Local container testing
├── .gitignore                  # Excludes secrets and Terraform state
└── README.md
```

---

## ☁️ AWS Infrastructure

Terraform provisions the following AWS resources:

### EC2

The EC2 instance:

- Uses Amazon Linux 2023
- Runs the Docker container
- Uses the `t3.micro` instance type
- Receives a public IP address
- Uses an IAM instance profile to authenticate with ECR

### ECR

A private Amazon ECR repository stores the Docker images:

```text
devops-capstone-repo
```

Images are pushed with both:

```text
<commit-sha>
latest
```

### Security Group

The EC2 security group allows the required traffic:

| Port | Purpose     |
| ---- | ----------- |
| 22   | SSH         |
| 80   | HTTP        |
| 3000 | Application |

---

## 🐳 Docker

The Node.js application is packaged into a Docker image using the `Dockerfile`.

The container runs the application on:

```text
Port 3000
```

EC2 exposes it through:

```text
Port 80 → Port 3000
```

The container can also be tested locally using Docker Compose.

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow is located at:

```text
.github/workflows/deploy.yml
```

The workflow runs automatically when code is pushed to the `main` branch.

### Build & Push

GitHub Actions:

1. Checks out the repository.
2. Configures AWS credentials.
3. Logs into Amazon ECR.
4. Builds the Docker image.
5. Tags the image using the Git commit SHA.
6. Tags the image as `latest`.
7. Pushes both images to ECR.

### Deploy

After the build succeeds:

1. GitHub Actions connects to EC2 through SSH.
2. EC2 authenticates with ECR using its IAM role.
3. The latest Docker image is pulled.
4. The previous `app` container is stopped and removed.
5. A new container is started.

This creates an automated:

```text
Git Push → Build → ECR → EC2 → Docker Container
```

workflow.

---

## 🔐 Security

Security considerations implemented in the project:

- AWS credentials are stored in **GitHub Actions Secrets** rather than inside the source code.
- EC2 does not store long-lived AWS access keys.
- EC2 uses an **IAM instance profile** with ECR read permissions.
- `.gitignore` excludes:
  - Terraform state files
  - `.pem` private keys
  - `.env` files

- The ECR repository is private.

> For production, SSH access should be restricted to trusted IP addresses instead of allowing unrestricted access.

---

## 🔑 GitHub Actions Secrets

The following repository secrets are required:

| Secret                  | Purpose                               |
| ----------------------- | ------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS authentication for GitHub Actions |
| `AWS_SECRET_ACCESS_KEY` | AWS authentication for GitHub Actions |
| `AWS_ACCOUNT_ID`        | AWS account identifier                |
| `EC2_HOST`              | EC2 public IP address                 |
| `EC2_SSH_KEY`           | EC2 private SSH key                   |

These values should **never be committed to Git**.

---

## 🚀 Running the Project

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Format and validate

```bash
terraform fmt
terraform validate
```

### 3. Review the infrastructure plan

```bash
terraform plan
```

### 4. Create the AWS infrastructure

```bash
terraform apply
```

After applying, Terraform outputs the EC2 public IP and ECR repository URL.

### 5. Configure GitHub Secrets

Add the required secrets under:

```text
GitHub Repository
→ Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

### 6. Push code

```bash
git push origin main
```

This triggers the CI/CD pipeline automatically.

### 7. Monitor the pipeline

Open:

```text
GitHub Repository
→ Actions
→ CI/CD Pipeline - Project 1
```

---

## ✅ Verification

The deployment was verified directly on the EC2 instance.

Check the running container:

```bash
docker ps
```

Example:

```text
CONTAINER ID   IMAGE                                      STATUS
a8095c718248   .../devops-capstone-repo:latest           Up 3 minutes
```

Check application logs:

```bash
docker logs app
```

The application successfully reported:

```text
Server is listening on port 3000
```

The Docker port mapping was:

```text
0.0.0.0:80 → 3000/tcp
```

This confirmed that the application was running successfully inside the Docker container on EC2.

---

## 🧹 Cleanup

AWS resources should be destroyed when the project is no longer needed to avoid unnecessary charges.

From the Terraform directory:

```bash
terraform destroy
```

The ECR repository uses:

```hcl
force_delete = true
```

so Docker images stored in the repository can also be removed during Terraform destruction.

---

## 🎯 Key DevOps Concepts Demonstrated

This project demonstrates practical experience with:

- Infrastructure as Code using Terraform
- AWS EC2 provisioning
- Amazon ECR
- IAM roles and instance profiles
- Docker containerization
- GitHub Actions CI/CD
- SSH-based deployment
- AWS authentication
- Git and GitHub
- Infrastructure cleanup and lifecycle management

---

## 🔮 Possible Improvements

Future improvements could include:

- Restrict SSH access to a specific IP address.
- Use an S3 backend with state locking for Terraform state.
- Use GitHub OIDC instead of long-lived AWS credentials for GitHub Actions.
- Add automated application tests before deployment.
- Add health checks and automatic rollback.
- Use a load balancer for production deployment.
- Use a more restrictive IAM policy instead of broad IAM permissions.

---

## 🏗️ Final Architecture

```text
                     ┌──────────────────┐
                     │     Developer    │
                     └────────┬─────────┘
                              │
                           git push
                              │
                              ▼
                     ┌──────────────────┐
                     │     GitHub       │
                     │    Repository    │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ GitHub Actions   │
                     │     CI/CD        │
                     └────────┬─────────┘
                              │
                       Docker Build
                              │
                              ▼
                     ┌──────────────────┐
                     │    Amazon ECR    │
                     │  Docker Images   │
                     └────────┬─────────┘
                              │
                       Docker Pull
                              │
                              ▼
                     ┌──────────────────┐
                     │    Amazon EC2    │
                     │                  │
                     │     Docker       │
                     │       │          │
                     │       ▼          │
                     │   Node.js App    │
                     └──────────────────┘

              Terraform → AWS Infrastructure
              IAM Role   → Secure EC2 → ECR Access
```

---

## 👩‍💻 Author

**Sneha Jana**

Computer Science & Engineering Student

GitHub: [SnehaJana24](https://github.com/SnehaJana24)
