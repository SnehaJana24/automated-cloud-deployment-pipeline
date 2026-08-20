# 🚀 Automated Cloud Deployment Pipeline

An automated cloud deployment pipeline for a Node.js application using **Terraform, AWS, Docker, Amazon ECR, Amazon EC2, and GitHub Actions**.

The project demonstrates how Infrastructure as Code and CI/CD can be combined to provision cloud infrastructure, build and store container images, and automatically deploy application updates to an EC2 server.

---

## 📌 Project Overview

The goal of this project is to create an automated deployment workflow where a code push to GitHub triggers the complete application delivery process.

The pipeline:

1. Provisions AWS infrastructure using Terraform.
2. Builds the Node.js application into a Docker image.
3. Pushes the image to Amazon ECR.
4. Connects to an EC2 instance through SSH.
5. Pulls the latest Docker image from ECR.
6. Stops the previous application container.
7. Starts a new container with the updated image.

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
    ├── Configure AWS credentials
    ├── Build Docker image
    └── Push image to ECR
            │
            ▼
       Amazon ECR
            │
            │ Docker pull
            ▼
       Amazon EC2
            │
            ▼
      Docker Container
            │
            ▼
      Node.js Application
```

---

## 🛠️ Technologies Used

| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| **Node.js**        | Sample web application       |
| **Docker**         | Application containerization |
| **Terraform**      | Infrastructure as Code       |
| **Amazon EC2**     | Application hosting          |
| **Amazon ECR**     | Docker image registry        |
| **AWS IAM**        | Secure AWS permissions       |
| **GitHub Actions** | CI/CD automation             |
| **Git & GitHub**   | Source control               |

---

## 📁 Project Structure

```text
automated-cloud-deployment-pipeline/
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
├── .gitignore                  # Excludes sensitive files
└── README.md
```

---

## ☁️ AWS Infrastructure

Terraform is used to provision the required AWS infrastructure.

### Amazon EC2

The EC2 instance:

- Uses Amazon Linux 2023
- Runs the Dockerized Node.js application
- Uses the `t3.micro` instance type
- Receives a public IP address
- Uses an IAM instance profile for secure access to ECR

### Amazon ECR

A private Amazon ECR repository stores the Docker images:

```text
devops-capstone-repo
```

Images are tagged using:

```text
<commit-sha>
latest
```

This allows the pipeline to maintain both an immutable commit-based image and a latest image tag.

### Security Group

The EC2 security group allows the required application traffic:

|   Port | Purpose     |
| -----: | ----------- |
|   `22` | SSH         |
|   `80` | HTTP        |
| `3000` | Application |

---

## 🐳 Docker

The Node.js application is packaged into a Docker image using `node:20-alpine`.

The container exposes port `3000`.

The application can also be tested locally using Docker Compose.

The EC2 deployment uses the following mapping:

```text
Port 80 → Port 3000
```

This allows the application to be accessed through the EC2 public IP over HTTP.

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow is located at:

```text
.github/workflows/deploy.yml
```

The workflow runs automatically when code is pushed to the `main` branch.

### Build & Push

GitHub Actions performs the following steps:

1. Checks out the repository.
2. Configures AWS credentials.
3. Authenticates with Amazon ECR.
4. Builds the Docker image.
5. Tags the image using the Git commit SHA.
6. Tags the image as `latest`.
7. Pushes both tags to Amazon ECR.

### Deploy

After the image is successfully pushed:

1. GitHub Actions connects to the EC2 instance through SSH.
2. EC2 authenticates with ECR using its IAM role.
3. The latest image is pulled from ECR.
4. The existing application container is stopped and removed.
5. A new container is started with the updated image.

The resulting workflow is:

```text
Git Push
   ↓
GitHub Actions
   ↓
Docker Build
   ↓
Amazon ECR
   ↓
EC2
   ↓
Docker Container
   ↓
Node.js Application
```

---

## 🔐 Security

Several security practices were implemented:

- AWS credentials are stored in **GitHub Actions Secrets** rather than committed to the repository.
- EC2 does not require long-lived AWS access keys.
- EC2 uses an **IAM instance profile** to access ECR.
- `.gitignore` excludes Terraform state files, `.pem` keys, and `.env` files.
- The ECR repository is private.

> For production environments, SSH access should be restricted to trusted IP addresses rather than being broadly exposed.

---

## 🔑 GitHub Actions Secrets

The pipeline requires the following repository secrets:

| Secret                  | Purpose                |
| ----------------------- | ---------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS authentication     |
| `AWS_SECRET_ACCESS_KEY` | AWS authentication     |
| `AWS_ACCOUNT_ID`        | AWS account identifier |
| `EC2_HOST`              | EC2 public IP address  |
| `EC2_SSH_KEY`           | EC2 SSH private key    |

These values should **never be committed to Git**.

---

## 🏗️ Infrastructure as Code with Terraform

Terraform manages the AWS infrastructure instead of creating resources manually through the AWS Console.

### Initialize Terraform

```bash
cd terraform
terraform init
```

### Format and Validate

```bash
terraform fmt
terraform validate
```

### Review the Infrastructure

```bash
terraform plan
```

### Create the Infrastructure

```bash
terraform apply
```

Terraform outputs information such as the EC2 public IP and ECR repository URL.

---

## 🚀 Running the Project

### 1. Provision Infrastructure

From the Terraform directory:

```bash
terraform init
terraform validate
terraform plan
terraform apply
```

### 2. Configure GitHub Secrets

Add the required secrets under:

```text
GitHub Repository
→ Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

### 3. Push Code

```bash
git push origin main
```

The push triggers the GitHub Actions workflow automatically.

### 4. Monitor the Pipeline

Open:

```text
GitHub Repository
→ Actions
```

The workflow will build the Docker image, push it to ECR, and deploy it to EC2.

---

## 🧪 Verification

The deployment was verified directly on the EC2 instance.

### Check the running container

```bash
docker ps
```

Example:

```text
CONTAINER ID   IMAGE                                    STATUS
a8095c718248   .../devops-capstone-repo:latest         Up 3 minutes
```

### Check application logs

```bash
docker logs app
```

The application successfully reported:

```text
Server is listening on port 3000
```

### Verify Port Mapping

```text
0.0.0.0:80 → 3000/tcp
```

This confirmed that the Node.js application was running successfully inside the Docker container on EC2.

---

## 🐞 Problems Encountered and Resolved

This project involved solving several real infrastructure and deployment issues.

### 1. Free-Tier Instance Compatibility

The initial `t2.micro` configuration was not eligible for the available Free Tier in the selected AWS environment.

The instance configuration was changed to `t3.micro` after checking the available eligible options.

### 2. IAM Permission Issue

Terraform initially failed because the IAM user did not have permission to create IAM roles.

The missing `iam:CreateRole` permission was addressed so Terraform could create the EC2 IAM role and instance profile.

### 3. EC2 Authentication with ECR

EC2 initially had no secure mechanism to authenticate with Amazon ECR.

An IAM role and instance profile were attached to EC2, allowing it to obtain temporary AWS credentials instead of storing long-lived AWS access keys on the server.

### 4. ECR Repository During Terraform Destroy

Terraform could not delete the ECR repository while Docker images were still stored in it.

The repository configuration was updated with:

```text
force_delete = true
```

This allows the repository and its stored images to be removed during Terraform destruction.

### 5. GitHub Actions Command Formatting

The GitHub Actions workflow initially had shell command formatting issues involving Docker arguments such as `-t` and `--name`.

The commands were corrected so the workflow could successfully build, push, and deploy the application.

---

## 🧹 Cleanup

AWS resources should be destroyed when the project is no longer being used to avoid unnecessary charges.

From the Terraform directory:

```bash
terraform destroy
```

The ECR repository is configured with:

```text
force_delete = true
```

so its stored images can also be removed during destruction.

---

## 🎯 Key Concepts Demonstrated

This project demonstrates practical experience with:

- Infrastructure as Code using Terraform
- AWS EC2 provisioning
- Amazon ECR
- AWS IAM roles and instance profiles
- Docker containerization
- GitHub Actions CI/CD
- Automated Docker image builds
- Container image versioning
- SSH-based deployment
- AWS authentication
- Git and GitHub
- Infrastructure lifecycle management
- Cloud deployment troubleshooting

The project demonstrates an end-to-end deployment pipeline rather than simply using the individual tools independently.

---

## 🔮 Future Improvements

Possible improvements include:

- Replace long-lived AWS credentials with **GitHub Actions OIDC**
- Restrict SSH access to trusted IP addresses
- Use an S3 backend with state locking for Terraform
- Add automated application tests before deployment
- Add Docker image vulnerability scanning
- Add health checks and automatic rollback
- Use an AWS Load Balancer for production deployment
- Implement blue-green or rolling deployments
- Use more restrictive IAM policies

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
              IAM Role  → Secure EC2 → ECR Access
```

---

## 👩‍💻 Author

**Sneha Jana**

Computer Science & Engineering Student

Interested in **Cloud Computing, DevOps, Kubernetes, and Cloud-Native Technologies**.

GitHub: [SnehaJana24](https://github.com/SnehaJana24)

---

## ⭐ Project Goal

The goal of this project is to demonstrate a practical **automated cloud deployment workflow** where infrastructure is provisioned using Terraform and application delivery is automated through Docker, Amazon ECR, Amazon EC2, and GitHub Actions.
