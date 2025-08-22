const router = require('express').Router();
const { ensureAuth } = require('../middleware/auth');
const sc = require('../controllers/scheduleController');
const methodOverride = require('method-override');

router.use(ensureAuth);
router.use(methodOverride('_method'));

router.get('/', sc.list);
router.get('/new', sc.newForm);
router.post('/', sc.create);
router.get('/:id/edit', sc.editForm);
router.post('/:id/tasks', sc.addTask);
router.post('/tasks/:taskId/status', sc.updateTaskStatus);
router.post('/tasks/:taskId/delete', sc.deleteTask);
router.put('/:id', sc.update);
router.delete('/:id', sc.delete);

module.exports = router;
