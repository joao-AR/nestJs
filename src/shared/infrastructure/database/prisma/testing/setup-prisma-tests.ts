import { execSync } from 'node:child_process';

export function setupPrismaTests() {
  execSync(
    'npx prisma migrate dev --schema ./src/shared/infrastructure/database/prisma/schema.prisma',
    {
      stdio: 'inherit',
      env: process.env,
    },
  );
}
