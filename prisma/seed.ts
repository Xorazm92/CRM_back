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

  // --- MOCK ASSIGNMENTS ---
  const assignments = [];
  for (const group of groups) {
    const lesson = await prisma.lessons.findFirst({ where: { group_id: group.group_id } });
    for (let i = 1; i <= 2; i++) {
      assignments.push(await prisma.assignments.create({
        data: {
          title: `Assignment ${i} for ${group.name}`,
          description: `Tavsif ${i}`,
          due_date: new Date(Date.now() + i * 86400000),
          lesson_id: lesson?.lesson_id ?? '',
          group_id: group.group_id,
          teacher_id: group.teacher_id ?? users[0].user_id,
        },
      }));
    }
  }

  // --- MOCK ATTENDANCE ---
  for (const group of groups) {
    const lesson = await prisma.lessons.findFirst({ where: { group_id: group.group_id } });
    const groupMembers = await prisma.groupMembers.findMany({ where: { group_id: group.group_id } });
    for (const member of groupMembers) {
      await prisma.attendance.create({
        data: {
          lesson_id: lesson?.lesson_id ?? '',
          student_id: member.user_id,
          status: 'PRESENT',
        },
      });
    }
  }

  // --- MOCK SCHEDULE ---
  for (const group of groups) {
    await prisma.schedule.create({
      data: {
        group_id: group.group_id,
        day_of_week: 1,
        start_time: new Date(),
        end_time: new Date(Date.now() + 3600000),
        room: `Room ${group.name}`,
      },
    });
  }

  // --- MOCK SUBMISSIONS ---
  for (const assignment of assignments) {
    const group = groups.find(g => g.group_id === assignment.group_id);
    const groupMembers = await prisma.groupMembers.findMany({ where: { group_id: group?.group_id } });
    for (const member of groupMembers) {
      await prisma.submissions.create({
        data: {
          assignment_id: assignment.assignment_id,
          student_id: member.user_id,
          answer_text: `Answer from ${member.user_id}`,
          grade: 'A',
        },
      });
    }
  }

  // --- MOCK STUDENT PAYMENT ---
  for (const member of await prisma.groupMembers.findMany()) {
    await prisma.studentPayment.create({
      data: {
        student_id: member.user_id,
        amount: 100000 + Math.floor(Math.random() * 100000),
        type: 'MONTHLY',
        status: 'COMPLETED',
      },
    });
  }

  // --- MOCK TEACHER SALARY ---
  for (const user of users.filter(u => u.role === 'TEACHER')) {
    await prisma.teacherSalary.create({
      data: {
        teacher_id: user.user_id,
        amount: 2000000,
        status: 'COMPLETED',
      },
    });
  }

  // --- MOCK DISCOUNT ---
  for (const member of await prisma.groupMembers.findMany()) {
    await prisma.discount.create({
      data: {
        student_id: member.user_id,
        percent: 10,
        description: 'Early bird discount',
        valid_from: new Date(),
        valid_to: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  // --- MOCK NOTIFICATION ---
  for (const user of users) {
    await prisma.notification.create({
      data: {
        user_id: user.user_id,
        message: `Salom, ${user.name}! Bu test xabari.`,
        type: 'SYSTEM',
      },
    });
  }

  // --- MOCK TRANSACTION ---
  for (let i = 0; i < 5; i++) {
    await prisma.transaction.create({
      data: {
        amount: 100000 ,
        type: 'INCOME',
        status: 'SUCCESS',
        source_id: users[i % users.length].user_id,
        target_id: users[(i + 1) % users.length].user_id,
        reason: 'Test transaction',
        
      },
    });
  }

  // --- MOCK SETTING ---
  await prisma.setting.upsert({
    where: { key: 'site_name' },
    update: { value: 'CRM Test Platform' },
    create: { key: 'site_name', value: 'CRM Test Platform' },
  });

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

  // --- TEACHER USER YARATISH ---
  const teacherUsername = 'teacher1';
  const teacherPassword = await bcrypt.BcryptEncryption.hashPassword('teacher1');
  const teacher = await prisma.user.upsert({
    where: { username: teacherUsername },
    update: {},
    create: {
      name: 'Ali',
      lastname: 'Valiyev',
      username: teacherUsername,
      password: teacherPassword,
      role: UserRole.TEACHER,
    },
  });
  users.push(teacher);
  console.log('TEACHER user created:', teacher.username);
  // --- END TEACHER ---

  console.log('yakunlandi!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('xatolik:', e);
    prisma.$disconnect();
    process.exit(1);
  });
