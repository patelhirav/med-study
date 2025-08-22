const prisma = require('../prisma');
const dayjs = require('dayjs');
const { computeStreak, progressFromTasks } = require('../utils/achievements');

exports.getDashboard = async (req, res) => {
  const userId = req.session.user.id;
  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();

  let schedule = await prisma.schedule.findFirst({
    where: { userId, date: { gte: todayStart, lte: todayEnd } },
    include: { tasks: true }
  });

  if (!schedule) {
    schedule = await prisma.schedule.create({ data: { userId, date: new Date(), progress: 0 } });
    schedule.tasks = [];
  }

  const progress = progressFromTasks(schedule.tasks);
  if (progress !== schedule.progress) {
    await prisma.schedule.update({ where: { id: schedule.id }, data: { progress } });
    schedule.progress = progress;
  }

  const last30 = await prisma.schedule.findMany({
    where: { userId, date: { gte: dayjs().subtract(30, 'day').toDate() } },
    include: { tasks: true },
    orderBy: { date: 'desc' }
  });

  const dates = last30.map(s => s.date);
  const streak = computeStreak(dates);
  const totalTasks = last30.reduce((acc, s) => acc + s.tasks.length, 0);
  const doneTasks = last30.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'done').length, 0);

  res.render('dashboard', {
    title: 'Dashboard',
    schedule,
    stats: { streak, totalTasks, doneTasks }
  });
};
