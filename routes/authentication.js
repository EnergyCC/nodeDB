const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

module.exports = (req, res, next) => {
  const bearerHeader = req.cookies['authorization'];
  //   console.log(bearerHeader);
  if (typeof bearerHeader !== 'undefined') {
    // const bearer = bearerHeader.split(' ');
    // const authToken = bearer[1];
    req.token = bearerHeader;
    next();
  } else {
    res.redirect('http://localhost:3003/login');
  }
};
