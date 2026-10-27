const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const today = () => new Date().toISOString().slice(0, 10);

router.post('/check-in', async (req, res) => {
  try {
    const now = new Date();
    const late = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const record = await Attendance.create({ employee: req.user._id, date: today(), checkIn: now, status: late ? 'Late' : 'Present' });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.code === 11000 ? 'Already checked in today' : err.message });
  }
});

router.post('/check-out', async (req, res) => {
  const record = await Attendance.findOne({ employee: req.user._id, date: today() });
  if (!record) return res.status(400).json({ message: 'Check in first' });
  if (record.checkOut) return res.status(400).json({ message: 'Already checked out today' });
  record.checkOut = new Date();
  await record.save();
  res.json(record);
});

router.get('/my', async (req, res) => {
  res.json(await Attendance.find({ employee: req.user._id }).sort('-date').limit(60));
});

// HR: everyone, Manager: team. Optional ?date=YYYY-MM-DD
router.get('/', authorize('hr', 'manager'), async (req, res) => {
  const filter = {};
  if (req.query.date) filter.date = req.query.date;
  if (req.user.role === 'manager') {
    const team = await User.find({ manager: req.user._id }).select('_id');
    filter.employee = { $in: team.map((u) => u._id) };
  }
  res.json(await Attendance.find(filter).populate('employee', 'name department').sort('-date').limit(200));
});

module.exports = router;
