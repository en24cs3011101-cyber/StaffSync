const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Apply for leave
router.post('/', async (req, res) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;
    const from = new Date(fromDate), to = new Date(toDate);
    if (to < from) return res.status(400).json({ message: 'End date cannot be before start date' });
    const days = Math.round((to - from) / 86400000) + 1;
    if (type !== 'Unpaid' && days > req.user.leaveBalance)
      return res.status(400).json({ message: `Only ${req.user.leaveBalance} leave days left` });
    res.status(201).json(await Leave.create({ employee: req.user._id, type, fromDate: from, toDate: to, days, reason }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/my', async (req, res) => {
  res.json(await Leave.find({ employee: req.user._id }).sort('-createdAt'));
});

// HR: all leaves. Manager: team leaves.
router.get('/', authorize('hr', 'manager'), async (req, res) => {
  let filter = {};
  if (req.user.role === 'manager') {
    const team = await User.find({ manager: req.user._id }).select('_id');
    filter = { employee: { $in: team.map((u) => u._id) } };
  }
  res.json(await Leave.find(filter).populate('employee', 'name department').sort('-createdAt'));
});

// Approve / reject
router.put('/:id/status', authorize('hr', 'manager'), async (req, res) => {
  const { status, remarks } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const leave = await Leave.findById(req.params.id).populate('employee');
  if (!leave) return res.status(404).json({ message: 'Leave not found' });
  if (req.user.role === 'manager' && String(leave.employee.manager) !== String(req.user._id))
    return res.status(403).json({ message: "You can only review your team's leave requests" });
  if (leave.status !== 'Pending') return res.status(400).json({ message: 'Leave already reviewed' });

  leave.status = status;
  leave.remarks = remarks || '';
  leave.reviewedBy = req.user._id;
  await leave.save();

  if (status === 'Approved' && leave.type !== 'Unpaid') {
    await User.findByIdAndUpdate(leave.employee._id, { $inc: { leaveBalance: -leave.days } });
  }
  res.json(leave);
});

// Cancel own pending leave
router.delete('/:id', async (req, res) => {
  const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id });
  if (!leave) return res.status(404).json({ message: 'Leave not found' });
  if (leave.status !== 'Pending') return res.status(400).json({ message: 'Only pending leaves can be cancelled' });
  await leave.deleteOne();
  res.json({ message: 'Leave cancelled' });
});

module.exports = router;
