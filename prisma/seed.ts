import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [];

  // bcrypt ni faqat bir marta import qilamiz
  const bcrypt = await import('../src/infrastructure/lib/bcrypt/bcrypt');

  // Barcha rollarni enumdan olib, SUPERADMIN ni chiqarib tashlaymiz
  const roles: UserRole[] = Object.values(UserRole).filter(role => role !== UserRole.SUPERADMIN);

  for (const role of roles) {
    for (let i = 1; i <= 2; i++) {
      // Har bir user uchun parolni xashlash
      const hashedPassword = await bcrypt.BcryptEncryption.hashPassword(`${role.toLowerCase()}_user${i}`);
      const user = await prisma.user.upsert({
        where: { username: `${role.toLowerCase()}_user${i}` },
        update: {}, // mavjud bo‘lsa, o‘zgartirmaydi
        create: {
          name: `${role} User ${i}`,
          lastname: `Lastname${i}`,
          username: `${role.toLowerCase()}_user${i}`,
          password: hashedPassword,
          role: role,
        },
      });
      users.push(user);
    }
  }

  // Create default course (idempotent, upsert)
  const course = await prisma.course.upsert({
    where: { name: 'Web Development' },
    update: {}, // mavjud bo‘lsa, o‘zgartirmaydi
    create: {
      name: 'Web Development',
      description: 'Learn web development from scratch',
      duration: 3,
      price: 1000000, // Qo'shildi: yangi price field uchun default qiymat
      status: 'ACTIVE',
    },
  });

  const groupData = [
    { 
      name: 'Group Alpha', 
      description: 'Frontend Developers Group', 
      course_id: course.course_id 
    },
    { 
      name: 'Group Beta', 
      description: 'Backend Developers Group', 
      course_id: course.course_id 
    },
    { 
      name: 'Group Gamma', 
      description: 'FullStack Developers Group', 
      course_id: course.course_id 
    },
  ];

  // Groups uchun upsert (idempotent)
  const groups = await Promise.all(
    groupData.map((group) =>
      prisma.groups.upsert({
        where: { name: group.name },
        update: {},
        create: group,
      })
    ),
  );

  await prisma.groupMembers.createMany({
    data: [
      { group_id: groups[0].group_id, user_id: users[0].user_id },
      { group_id: groups[0].group_id, user_id: users[4].user_id },

      { group_id: groups[1].group_id, user_id: users[1].user_id },
      { group_id: groups[1].group_id, user_id: users[5].user_id },

      { group_id: groups[2].group_id, user_id: users[2].user_id },
      { group_id: groups[2].group_id, user_id: users[6].user_id },
    ],
  });

  for (const group of groups) {
    await prisma.lessons.create({
      data: {
        group_id: group.group_id,
        topic: `Intro to ${group.name}`,
        lesson_date: new Date(),
        recording_path: `/recordings/${group.name.toLowerCase().replace(/\s/g, '_')}.mp4`,
      },
    });
  }

  // --- SUPERADMIN USER YARATISH ---
  const superadminUsername = 'superadmin';
  const superadminPassword = await bcrypt.BcryptEncryption.hashPassword('superadmin');
  const superadmin = await prisma.user.upsert({
    where: { username: superadminUsername },
    update: {},
    create: {
      name: 'Super',
      lastname: 'Admin',
      username: superadminUsername,
      password: superadminPassword,
      role: UserRole.SUPERADMIN,
    },
  });
  users.push(superadmin);
  // --- END SUPERADMIN ---

  console.log('yakunlandi!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('xatolik:', e);
    prisma.$disconnect();
    process.exit(1);
  });
