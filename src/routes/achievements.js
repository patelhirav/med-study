const router = require('express').Router();
const { ensureAuth } = require('../middleware/auth');
const ac = require('../controllers/achievementController');

router.get('/', ensureAuth, ac.index);

module.exports = router;
