require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./prisma');
const dayjs = require('dayjs');

async function main() {
  const email = 'demo@med.edu';
  const hashed = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: 'Demo User', email, password: hashed, year: 2 }
  });

  // Create today's schedule with a few tasks
  const schedule = await prisma.schedule.create({
    data: { userId: user.id, date: new Date(), progress: 0 }
  });

  await prisma.task.createMany({
    data: [
      { scheduleId: schedule.id, title: 'Anatomy: Nervous System', subject: 'Anatomy', priority: 1, status: 'pending' },
      { scheduleId: schedule.id, title: 'Pharmacology: Antibiotics', subject: 'Pharmacology', priority: 2, status: 'pending' },
      { scheduleId: schedule.id, title: 'Pathology: Inflammation', subject: 'Pathology', priority: 2, status: 'pending' }
    ]
  });

  // Create a couple of previous-day schedules to showcase streak
  for (let d = 1; d <= 2; d++) {
    const sch = await prisma.schedule.create({
      data: { userId: user.id, date: dayjs().subtract(d, 'day').toDate(), progress: 0 }
    });
    await prisma.task.createMany({
      data: [
        { scheduleId: sch.id, title: `Review Session ${d}`, subject: 'General', priority: 2, status: d === 2 ? 'done' : 'pending' }
      ]
    });
  }

  console.log('Seed complete.');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
