import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [];

  const roles: UserRole[] = [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.TEACHER,
    UserRole.STUDENT,
  ];

  for (const role of roles) {
    for (let i = 1; i <= 2; i++) {
      const user = await prisma.user.create({
        data: {
          full_name: `${role} User ${i}`,
          username: `${role.toLowerCase()}_user${i}`,
          password: 'hashed_password',
          role: role,
        },
      });
      users.push(user);
    }
  }

  // Create default course
  const course = await prisma.course.create({
    data: {
      name: 'Web Development',
      description: 'Learn web development from scratch',
      duration: 3,
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

  const groups = await Promise.all(
    groupData.map((group) =>
      prisma.groups.create({
        data: group,
      }),
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

  console.log('yakunlandi!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('xatolik:', e);
    prisma.$disconnect();
    process.exit(1);
  });
