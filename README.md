<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

A NestJS application following a clean architecture pattern with RBAC authentication, Prisma database integration, and a testing setup for unit, integration, and end-to-end tests.

## Project setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```bash
cp .env.exemple .env.development
cp .env.exemple .env.test
```

3. If you use Docker Compose, start the database service:

```bash
docker compose up -d db
```

4. Update your database connection string if needed.

If you use Docker Compose, the database is exposed on port `5432` by default. Set your `DATABASE_URL` in `.env.development` and `.env.test` like this:

```env
DATABASE_URL="postgresql://postgres:docker@localhost:5432/projectdb?schema=public"
```

If you run a local PostgreSQL instance instead, adjust the host, port, user, password, and database values accordingly.

5. Generate the Prisma client:

```bash
npx prisma generate
```

6. Push the Prisma schema to the database:

```bash
npx prisma db push --schema ./src/shared/infrastructure/database/prisma/schema.prisma
```

7. Seed the database:

```bash
npm run seed
```

## Run the application

```bash
# start in development mode
npm run start

# start in watch mode with auto-reload
npm run start:dev

# start production build
npm run build
npm run start:prod
```

By default the application listens on the port configured in the environment file (usually `3000`).

## Run tests

The repository includes environment-aware test scripts. Before running tests, make sure `.env.test` exists and points to a test database.

```bash
# run unit tests and all Jest tests configured for the project
npm run test

# run end-to-end tests
npm run test:e2e

# run integration tests
npm run test:int

# run tests in watch mode
npm run test:watch

# run tests with coverage report
npm run test:cov

# run tests in debug mode
npm run test:debug
```

## Docker Compose (optional)

To run the full application stack with Docker Compose:

```bash
docker compose up --build
```

Then open the app at `http://localhost:3000` if using the default container port mapping.

## Deployment

When you're ready to deploy your NestJS application to production, check out the [deployment documentation](https://docs.nestjs.com/deployment) for best practices.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Jest Documentation](https://jestjs.io/docs)
