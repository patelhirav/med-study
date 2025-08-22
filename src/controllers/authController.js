const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, year } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.render('auth/register', { title: 'Register', error: 'Email already in use' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hash, year: Number(year) || 1 } });
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.redirect('/');
  } catch (e) {
    console.error(e);
    res.render('auth/register', { title: 'Register', error: 'Registration failed' });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.render('auth/login', { title: 'Login', error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.render('auth/login', { title: 'Login', error: 'Invalid credentials' });
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.redirect('/');
  } catch (e) {
    console.error(e);
    res.render('auth/login', { title: 'Login', error: 'Login failed' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
