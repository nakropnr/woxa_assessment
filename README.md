# Woxa Assessment

## Tech Stack

- Frontend: React 19, TypeScript, Vite
- Backend: Node.js, Express 5, TypeScript
- Database: PostgreSQL
- ORM / Migration Tool: Drizzle ORM, Drizzle Kit
- Validation: Zod
- Testing: Node test runner, Supertest

## Database Setup

This project uses PostgreSQL. The backend reads the database connection from `DB_URL`.

Example:

```env
PORT=8080
DB_URL=postgres://postgres:postgres@localhost:5432/woxa_assessment
```

Steps:

1. Create a PostgreSQL database, for example `woxa_assessment`
2. Configure `DB_URL` in your environment
3. Run migrations
4. Seed sample data

Commands:

```bash
cd server
npm run migrate
npm run seed
```

## Install Dependencies

Use Node.js `22.14.0`:

```bash
source ~/.nvm/nvm.sh
nvm use
```

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Start Project

Start backend:

```bash
cd server
npm run dev
```

The backend runs on `http://localhost:8080`.

Start frontend:

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Recommended Run Order

```bash
source ~/.nvm/nvm.sh
nvm use
cd server
npm install
npm run migrate
npm run seed
npm run dev
```

Open a new terminal:

```bash
source ~/.nvm/nvm.sh
nvm use
cd frontend
npm install
npm run dev
```

## Docker

This project can also run with Docker Compose.

Start all services:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

Seed sample broker data after the containers are up:

```bash
docker compose --profile tools run --rm seed
```

Stop the stack:

```bash
docker compose down
```

Stop the stack and remove database data:

```bash
docker compose down -v
```
