const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const authToken = bearer[1];
        req.token = authToken;
        next();
    } else {
        res.redirect('http://localhost:3003/login');
    }
};