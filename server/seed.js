// Run: npm run seed  -> creates demo HR, manager and employees
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Announcement.deleteMany({});

  const hr = await User.create({ name: 'Hannah HR', email: 'hr@staffsync.com', password: 'password123', role: 'hr', department: 'Human Resources', designation: 'HR Lead' });
  const mgr = await User.create({ name: 'Manish Manager', email: 'manager@staffsync.com', password: 'password123', role: 'manager', department: 'Engineering', designation: 'Engineering Manager' });
  await User.create({ name: 'Esha Employee', email: 'employee@staffsync.com', password: 'password123', role: 'employee', department: 'Engineering', designation: 'Software Engineer', manager: mgr._id, salary: 600000 });
  await User.create({ name: 'Rahul Verma', email: 'rahul@staffsync.com', password: 'password123', role: 'employee', department: 'Engineering', designation: 'QA Engineer', manager: mgr._id, salary: 500000 });

  await Announcement.create({ title: 'Welcome to StaffSync', message: 'Use this portal to apply for leave, mark attendance and read company news.', category: 'Announcement', postedBy: hr._id });

  console.log('Seeded. Logins (password: password123): hr@staffsync.com, manager@staffsync.com, employee@staffsync.com');
  process.exit(0);
})();
