const router = require('express').Router();
const Training = require('../models/Training');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// HR: all. Manager: programs they created. Employee: programs they are enrolled in.
router.get('/', async (req, res) => {
  let filter = {};
  if (req.user.role === 'manager') filter = { createdBy: req.user._id };
  if (req.user.role === 'employee') filter = { participants: req.user._id };
  res.json(await Training.find(filter).populate('participants', 'name').populate('createdBy', 'name').sort('-startDate'));
});

router.post('/', authorize('hr', 'manager'), async (req, res) => {
  try {
    res.status(201).json(await Training.create({ ...req.body, createdBy: req.user._id }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authorize('hr', 'manager'), async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'manager' && String(t.createdBy) !== String(req.user._id))
    return res.status(403).json({ message: 'You can only edit your own programs' });
  Object.assign(t, req.body);
  await t.save();
  res.json(t);
});

router.delete('/:id', authorize('hr', 'manager'), async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'manager' && String(t.createdBy) !== String(req.user._id))
    return res.status(403).json({ message: 'You can only delete your own programs' });
  await t.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
