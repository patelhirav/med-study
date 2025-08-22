const dayjs = require('dayjs');

function computeStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const set = new Set(dates.map(d => dayjs(d).format('YYYY-MM-DD')));
  let streak = 0;
  let cursor = dayjs();
  while (set.has(cursor.format('YYYY-MM-DD'))) {
    streak += 1;
    cursor = cursor.subtract(1, 'day');
  }
  return streak;
}

function progressFromTasks(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const done = tasks.filter(t => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

module.exports = { computeStreak, progressFromTasks };
