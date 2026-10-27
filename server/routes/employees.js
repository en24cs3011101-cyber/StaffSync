const router = require('express').Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// HR: all users. Manager: own team. Employee: forbidden.
router.get('/', authorize('hr', 'manager'), async (req, res) => {
  const filter = req.user.role === 'manager' ? { manager: req.user._id } : {};
  res.json(await User.find(filter).populate('manager', 'name').sort('name'));
});

router.get('/profile/me', async (req, res) => {
  res.json(await User.findById(req.user._id).populate('manager', 'name'));
});

// Logged-in user updates own profile (limited fields)
router.put('/profile/me', async (req, res) => {
  const { name, phone, address, password } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (password) user.password = password;
  await user.save();
  res.json(await User.findById(user._id).populate('manager', 'name'));
});

router.post('/', authorize('hr'), async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.manager) delete body.manager;
    if (!body.password) body.password = 'Welcome@123';
    res.status(201).json(await User.create(body));
  } catch (err) {
    res.status(400).json({ message: err.code === 11000 ? 'Email already exists' : err.message });
  }
});

router.put('/:id', authorize('hr'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    const body = { ...req.body };
    if (!body.password) delete body.password;
    if (!body.manager) body.manager = null;
    Object.assign(user, body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authorize('hr'), async (req, res) => {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete yourself' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Employee deleted' });
});

module.exports = router;
