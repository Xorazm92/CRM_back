import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { user_id: '27a38b12-9f7e-4453-b22a-fe865690e84c' },
    data: { role: 'SUPERADMIN' }
  });
  console.log('User role updated to SUPERADMIN!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
