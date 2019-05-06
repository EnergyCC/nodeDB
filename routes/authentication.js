const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    next();
  } else {
    res.redirect('http://localhost:3003/login');
  }
};
