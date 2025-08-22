module.exports.ensureAuth = (req, res, next) => {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
};

module.exports.injectUser = (req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
};
