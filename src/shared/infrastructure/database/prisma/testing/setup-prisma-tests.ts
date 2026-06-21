import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

export function setupPrismaTests() {
  const schemaId = `test_${randomUUID()}`;
  const baseUrl = process.env.DATABASE_URL?.split('?')[0];
  const isolatedDatabaseUrl = `${baseUrl}?schema=${schemaId}`;
  execSync(
    'npx prisma db push --schema ./src/shared/infrastructure/database/prisma/schema.prisma --accept-data-loss && npx prisma db seed --schema ./src/shared/infrastructure/database/prisma/schema.prisma',
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: isolatedDatabaseUrl,
      },
    },
  );

  return { isolatedDatabaseUrl, schemaId };
}
