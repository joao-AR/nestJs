import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.userRoles.upsert({
    where: { id: 1 },
    update: { role: 'user' },
    create: { id: 1, role: 'user' },
  });

  await prisma.userRoles.upsert({
    where: { id: 2 },
    update: { role: 'admin' },
    create: { id: 2, role: 'admin' },
  });
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
