const prisma = require('../prisma');
const { computeStreak } = require('../utils/achievements');

exports.index = async (req, res) => {
  const userId = req.session.user.id;

  const schedules = await prisma.schedule.findMany({
    where: { userId },
    include: { tasks: true },
    orderBy: { date: 'desc' }
  });

  const streak = computeStreak(schedules.map(s => s.date));
  const totalDone = schedules.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'done').length, 0);

  const toAward = [];
  if (streak >= 3) toAward.push({ title: `${streak}-Day Streak`, detail: `Studied ${streak} days in a row` });
  if (streak >= 7) toAward.push({ title: `One-Week Warrior`, detail: '7-day study streak' });
  if (totalDone >= 50) toAward.push({ title: `50 Tasks Done`, detail: 'Great consistency!' });

  for (const a of toAward) {
    const exists = await prisma.achievement.findFirst({ where: { userId, title: a.title } });
    if (!exists) await prisma.achievement.create({ data: { userId, ...a } });
  }

  const achievements = await prisma.achievement.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } });
  res.render('achievements/index', { title: 'Achievements', achievements, stats: { streak, totalDone } });
};
