# dumi-textile-api (Outdated)

> **Status:** ⚠️ This repository is **outdated** and is no longer the primary backend codebase.

## Migration Notice

This project has been superseded by:

👉 **https://github.com/devEddu17x/telar-backend-api**

Please use the new repository for active development, maintenance, and deployment.

---

## What this repository was

`dumi-textile-api` is a NestJS (TypeScript) backend API that originally powered core textile platform backend capabilities, including:

- REST API services built with **NestJS**
- Data persistence with **PostgreSQL + TypeORM**
- Authentication/authorization flows (legacy implementation)
- Role/permission seeding (RBAC)
- File handling with **AWS S3**
- Email sending with **Nodemailer + Handlebars templates**
- Structured logging with **Pino / NestJS Pino**
- Unit and E2E testing with **Jest** and Dockerized test DB

---

## Why it is outdated

The new backend repository introduces new capabilities, including:
- Modern architecture
- **Multi-tenant support**
- Authentication migrated to **AWS Cognito**
- Improved **CI/CD flows** and delivery pipeline
- Built for AWS deployment

For these reasons, this repository is kept only for historical reference.

---

## For contributors

- Do **not** try to open new feature PRs in this repo.
- Do **not** use this repo as integration target for new services.
- Redirect all new work to:  
  **https://github.com/devEddu17x/telar-backend-api**
  
