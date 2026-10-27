const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  res.json(await Announcement.find().populate('postedBy', 'name').sort('-createdAt'));
});

router.post('/', authorize('hr'), async (req, res) => {
  try {
    res.status(201).json(await Announcement.create({ ...req.body, postedBy: req.user._id }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authorize('hr'), async (req, res) => {
  const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

router.delete('/:id', authorize('hr'), async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
