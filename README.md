````markdown
# MedSafe

<p align="center">
  <img src="./assets/home-page.png" alt="MedSafe" width="900"/>
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql)
![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazonaws)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel)

</p>

---

# Overview

MedSafe is a cloud-based distributed healthcare emergency system designed to securely share critical medical information through QR Codes during emergency situations.

Developed as an integrative project during the Associate Degree in Systems Analysis and Development (ADS), the platform enables healthcare professionals and emergency responders to quickly access essential patient information in critical scenarios.

The project focuses on distributed systems, cloud architecture, secure communication, scalability, and modular software development.

---

# Table of Contents

* Overview
* Motivation
* Features
* Screenshots
* System Architecture
* Database Architecture
* Technologies Used
* Cloud Infrastructure
* Microservices
* Project Structure
* Installation
* Environment Variables
* Running the Project
* Database Setup
* Technical Challenges
* Learning Outcomes
* Security Notice
* Figma Prototype
* Demonstration Video
* License
* Authors

---

# Motivation

Emergency situations often require immediate access to critical medical information.

MedSafe was developed to explore how distributed systems, cloud infrastructure, and QR Code technology can be combined to improve accessibility and response time in healthcare emergencies.

The project also served as an opportunity to apply modern software engineering concepts such as microservices, serverless architecture, asynchronous communication, and scalable cloud-ready systems.

---

# Features

* JWT-based authentication and authorization
* Emergency medical information management
* Secure QR Code generation for emergency access
* Public emergency access validation
* Distributed microservices architecture
* API Gateway centralized routing
* Asynchronous notification system
* Relational and NoSQL database integration
* Cloud-ready architecture
* Modular and scalable services

---

# Screenshots

## Login Page

![Login Page](./assets/login-page.png)

---

## Medical Information Dashboard

![Dashboard](./assets/dashboard.png)

---

## Emergency Access Page

![Emergency Access](./assets/emergency-access.png)

---

# System Architecture

The system follows a distributed microservices architecture, where each service is independently developed, deployed, and maintained.

Main architecture components:

* Web (Front-End Application)
* API Gateway (Only Dev Environment)
* Auth Service
* Database Service
* Notification Service
* PostgreSQL Database
* DynamoDB Event Storage

---

# Database Architecture

## PostgreSQL Relational Database Diagram

![PostgreSQL Diagram](./assets/postgresql-diagram.png)

---

## DynamoDB Event Storage Diagram

![DynamoDB Diagram](./assets/dynamodb-diagram.png)

---

# Technologies Used

## Front-End

### Next.js

The front-end application was developed using Next.js.

### Why Next.js?

* Hybrid rendering support (SSR, SSG, SPA)
* Native routing system
* Component-based architecture
* Optimized performance
* Easy integration with distributed services
* Middleware support
* Scalable and maintainable structure

---

## Back-End

### NestJS

The back-end services were developed using NestJS and a distributed microservices architecture.

### Why NestJS?

* Native microservices support
* TypeScript support
* Dependency injection
* Modular architecture
* Layered design pattern
* JWT authentication support
* Validation pipes and interceptors
* Easier testing and maintenance

---

## Databases

### PostgreSQL

Primary relational database used for structured and transactional clinical information.

#### Why PostgreSQL?

* Open-source
* ACID transaction support
* Strong relational consistency
* Foreign keys and constraints
* Ideal for critical healthcare-related data

---

### DynamoDB

NoSQL database used for asynchronous events, notifications, and logs.

#### Why DynamoDB?

* High scalability
* Low latency
* Event persistence
* Native AWS integration
* Optimized for asynchronous workloads

---

# Cloud Infrastructure

The system architecture was designed using cloud-native and serverless concepts.

## AWS Services

* AWS Lambda
* API Gateway
* Amazon RDS (PostgreSQL)
* Amazon DynamoDB
* Amazon SNS/SQS
* AWS CloudFormation

### Why AWS?

* Scalable infrastructure
* High availability
* Serverless execution
* Infrastructure as Code
* Native service integration
* Distributed architecture support

---

## Vercel

The front-end application is designed for deployment using Vercel.

### Benefits

* Continuous deployment
* Optimized front-end performance
* High availability
* GitHub integration

---

# Microservices

## API Gateway

Responsible for:

* Centralized routing
* Traffic management

---

## Authentication Service

Responsible for:

* User registration
* Login and authentication
* JWT token generation
* Password recovery
* Access control

---

## Database Service

Responsible for:

* Secure database access
* Relational operations
* Audit logging

---

## Notification Service

Responsible for asynchronous notifications:

* Email verification
* Password reset
* Emergency access alerts

---

# Services and Ports

| Service          | Port |
| ---------------- | ---- |
| Frontend         | 3000 |
| API Gateway      | 3001 |
| Auth Service     | 4000 |
| Database Service | 5000 |

---

# Project Structure

```text
medsafe/
│
├── .github/
│   └── workflows/
├── apps/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── database-service/
│   ├── notification-service/
│   └── web/
├── assets/
└── db/
```

---

# Installation

## Clone the repository

```bash
git clone https://github.com/eng-joaosg/MedSafe-Project.git
```

---

## Install dependencies

Install dependencies for each service individually in each root directory.

```bash
npm install
```

---

# Environment Variables

## Auth Service

```env
NODE_ENV=staging
PORT=4000
SERVICE_NAME=auth-service
DATABASE_SERVICE_URL=http://localhost:5000
DATABASE_SERVICE_X_AUTH_SERVICE_API_KEY=your_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION_TIME=3600s
HASH_SALT_ROUNDS=10
AUTH_SERVICE_API_KEY=your_secret
CORS_ORIGIN=http://localhost:3000
```

---

## Front-End

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3001/gateway
NEXT_PUBLIC_APP_NAME=MedSafe
FRONTEND_URL=http://localhost:3000
```

---

## Database Service

```env
NODE_ENV=development
PORT=5000
SERVICE_NAME=database-service
FRONT_URL=http://localhost:3000
DATABASE_SERVICE_X_AUTH_SERVICE_API_KEY=your_secret
JWT_SECRET=your_jwt_secret
DB_CONNECTION_STRING=postgres://postgres:password@localhost:5432/medsafe
CORS_ORIGINS=http://localhost:3000
REQUEST_TIMEOUT_MS=7000
```

---

## API Gateway

```env
API_VERSION=1.0
PORT=3001
NODE_ENV=development
SERVICE_NAME=api-gateway
AUTH_SERVICE_API_KEY=your_secret
JWT_SECRET=your_jwt_secret
AUTH_SERVICE_URL=http://localhost:4000
DATABASE_SERVICE_URL=http://database-service:5000
NOTIFICATION_SERVICE_URL=http://notification-service:3004
CORS_ALLOWED_ORIGINS=http://localhost:3000
HEALTH_CHECK_INTERVAL=30
LOG_LEVEL=info
LOG_FILE_PATH=./logs/gateway.log
HTTP_TIMEOUT=5000
HTTP_KEEP_ALIVE=10000
HTTP_MAX_REDIRECTS=5
```

---

# Running the Project

## Run Auth Service

```bash
ts-node src/bootstrap.ts
```

---

## Run Database Service and API Gateway

```bash
npm run start:dev
```

---

## Run Front-End

```bash
npm run build
npm run start
```

---

# Database Setup

The project includes a `db/` directory containing Python scripts responsible for:

* Creating the PostgreSQL database
* Creating tables and relationships
* Populating the database with initial data

These scripts are intended to simplify the local development setup process.

Example structure:

```text
db/
├── create_database.py
├── create_tables.py
└── seed_data.py
```

Run the scripts manually before starting the services if the database has not yet been initialized.

---

# Technical Challenges

* Designing a distributed microservices architecture
* Secure communication between services
* Managing authentication and authorization flows
* Integrating relational and NoSQL databases
* Handling asynchronous notifications
* Structuring scalable cloud-ready services

---

# Learning Outcomes

This project provided practical experience with:

* Distributed systems
* REST API development
* Authentication and authorization
* Cloud infrastructure concepts
* Database modeling
* Front-end and back-end integration
* Microservices communication
* Serverless architecture concepts

---

# Security Notice

This project was developed for academic purposes and does not comply with production-level healthcare regulations such as HIPAA or LGPD.

Sensitive information and secrets displayed in examples are for demonstration purposes only.

---

# Figma Prototype

[Figma Design Prototype](https://www.figma.com/design/JoVBMu5KWlYlRbpAUFppcf/MedSafe?node-id=0-1&p=f)

---

# Demonstration Video

[System Demonstration Video (Portuguese)](https://www.youtube.com/watch?v=rtgBH3aCZeo)

---

# License

This project is licensed under the MIT License.

---

# Authors

Developed as an integrative academic project for the Associate Degree in Systems Analysis and Development (ADS).
````
