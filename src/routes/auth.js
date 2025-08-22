const router = require('express').Router();
const auth = require('../controllers/authController');

router.get('/login', auth.getLogin);
router.post('/login', auth.postLogin);
router.get('/register', auth.getRegister);
router.post('/register', auth.postRegister);
router.post('/logout', auth.logout);

module.exports = router;
