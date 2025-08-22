const router = require('express').Router();
const { ensureAuth } = require('../middleware/auth');
const dash = require('../controllers/dashboardController');

router.get('/', ensureAuth, dash.getDashboard);
router.get('/history', ensureAuth, async (req, res) => {
  const prisma = require('../prisma');
  const userId = req.session.user.id;
  const schedules = await prisma.schedule.findMany({ where: { userId }, include: { tasks: true }, orderBy: { date: 'desc' } });
  res.render('history', { title: 'History', schedules });
});

module.exports = router;
