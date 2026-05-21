# Chronic Pain Tracker

A full‑stack web application for tracking chronic pain over time.  
Frontend is deployed on Vercel, and the backend is an ASP.NET Core Web API backed by PostgreSQL.

**Live site:** https://chronic-pain-tracker.vercel.app

---

## Tech Stack

### Frontend
- Angular (generated with Angular CLI)
- TypeScript
- Tailwind CSS (config present in `Frontend/tailwind.config.js`)
- Deployed on **Vercel**

### Backend
- ASP.NET Core Web API (.NET)
- Entity Framework Core (migrations run automatically on startup)
- JWT Authentication (Bearer tokens)

### Database
- PostgreSQL (Docker Compose provided for local development)

---

## Repository Structure

- `Frontend/` — Angular UI (Vercel deploy target)
- `Backend/ChronicPainTracker.Api/` — ASP.NET Core API
- `docker-compose.yml` — local PostgreSQL container
- `ChronicPainTracker.sln` — solution file

---

## Getting Started (Local Development)

### Prerequisites
- Node.js + npm (for the frontend)
- .NET SDK (for the backend)
- Docker (recommended for running PostgreSQL locally)

---

## Run the Database (PostgreSQL via Docker)

From the repository root:

```bash
docker compose up -d
```

This starts a PostgreSQL 15 container and exposes it on:

- `localhost:5432`

> Note: The current `docker-compose.yml` includes local credentials. Treat these as **development-only** values and rotate/change them for any real environment.

---

## Backend (ASP.NET Core API)

### Configure environment variables

The API reads the database connection string from:

- `DATABASE_URL` (preferred for deployments), **or**
- a local config connection string named `DefaultConnection`

The backend is also configured for JWT authentication and expects:

- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:Key`

(These are typically provided via environment variables or a secrets mechanism in production.)

### Run the API

From `Backend/ChronicPainTracker.Api/`:

```bash
dotnet restore
dotnet run
```

#### Health check
The API exposes a simple health endpoint:

- `GET /api/health`

It attempts to connect to the database and returns a status response.

#### Swagger
Swagger UI is enabled in **Development** environments.

---

## Frontend (Angular)

From `Frontend/`:

```bash
npm install
npm start
```

Or, if your scripts are standard Angular CLI:

```bash
ng serve
```

Then open:

- http://localhost:4200

---

## CORS / Deployment Notes

The backend is configured to allow requests from:
- `http://localhost:4200`
- `https://chronic-pain-tracker.vercel.app`
- (and at least one additional Vercel preview domain)

If you deploy the frontend under a new domain, you’ll likely need to add it to the allowed origins in the backend configuration.

---

## Security Notes

- Do **not** commit real JWT keys, production database URLs, or email provider secrets to source control.
- For production, use environment variables or a secret manager.

---

## Contributing

Contributions are welcome.

Suggested workflow:
1. Fork the repo
2. Create a feature branch
3. Make changes with clear commits
4. Open a pull request

---

## License

No license file is currently included in this repository.  
If you want, add a `LICENSE` file (MIT, Apache-2.0, GPL-3.0, etc.) and update this section accordingly.
