const prisma = require('../prisma');
const dayjs = require('dayjs');
const { progressFromTasks } = require('../utils/achievements');

exports.list = async (req, res) => {
  const userId = req.session.user.id;
  const schedules = await prisma.schedule.findMany({
    where: { userId },
    include: { tasks: true },
    orderBy: { date: 'desc' }
  });
  res.render('schedules/index', { title: 'My Schedules', schedules });
};

exports.newForm = (req, res) => {
  res.render('schedules/new', { title: 'New Schedule', today: dayjs().format('YYYY-MM-DD') });
};

exports.create = async (req, res) => {
  const userId = req.session.user.id;
  const { date, titles = [], subjects = [], startAts = [], endAts = [], priorities = [] } = req.body;

  const toArr = v => Array.isArray(v) ? v : (v ? [v] : []);
  const tA = toArr(titles), sA = toArr(subjects), stA = toArr(startAts), eA = toArr(endAts), pA = toArr(priorities);

  const schedule = await prisma.schedule.create({
    data: { userId, date: new Date(date), progress: 0 }
  });

  for (let i = 0; i < tA.length; i++) {
    await prisma.task.create({
      data: {
        scheduleId: schedule.id,
        title: tA[i],
        subject: sA[i] || 'General',
        startAt: stA[i] ? new Date(stA[i]) : null,
        endAt: eA[i] ? new Date(eA[i]) : null,
        priority: Number(pA[i] || 2),
        status: 'pending'
      }
    });
  }

  const createdTasks = await prisma.task.findMany({ where: { scheduleId: schedule.id } });
  const progress = progressFromTasks(createdTasks);
  await prisma.schedule.update({ where: { id: schedule.id }, data: { progress } });

  res.redirect('/schedules');
};

exports.editForm = async (req, res) => {
  const schedule = await prisma.schedule.findUnique({ where: { id: req.params.id }, include: { tasks: true } });
  res.render('schedules/edit', { title: 'Edit Schedule', schedule });
};

exports.update = async (req, res) => {
  const { date } = req.body;
  await prisma.schedule.update({ where: { id: req.params.id }, data: { date: new Date(date) } });
  res.redirect('/schedules');
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  await prisma.task.deleteMany({ where: { scheduleId: id } });
  await prisma.schedule.delete({ where: { id } });
  res.redirect('/schedules');
};

exports.addTask = async (req, res) => {
  const scheduleId = req.params.id;
  const { title, subject, startAt, endAt, priority } = req.body;
  await prisma.task.create({
    data: {
      scheduleId,
      title,
      subject: subject || 'General',
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null,
      priority: Number(priority) || 2,
      status: 'pending'
    }
  });
  const tasks = await prisma.task.findMany({ where: { scheduleId } });
  const progress = progressFromTasks(tasks);
  await prisma.schedule.update({ where: { id: scheduleId }, data: { progress } });
  res.redirect(`/schedules/${scheduleId}/edit`);
};

exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const task = await prisma.task.update({ where: { id: taskId }, data: { status } });
  const tasks = await prisma.task.findMany({ where: { scheduleId: task.scheduleId } });
  const progress = progressFromTasks(tasks);
  await prisma.schedule.update({ where: { id: task.scheduleId }, data: { progress } });
  res.redirect('back');
};

exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const task = await prisma.task.delete({ where: { id: taskId } });
  const tasks = await prisma.task.findMany({ where: { scheduleId: task.scheduleId } });
  const progress = progressFromTasks(tasks);
  await prisma.schedule.update({ where: { id: task.scheduleId }, data: { progress } });
  res.redirect('back');
};
