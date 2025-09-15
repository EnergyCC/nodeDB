const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies['authorization'];
    if (!token) return res.redirect('/login');
    
    // Check if JWT_SECRET is properly configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not configured in environment variables');
        return res.status(500).render('errors', {
            error: 'Server configuration error'
        });
    }
    
    jwt.verify(token, jwtSecret, (err, authData) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
            return res.redirect('/login');
        }
        // Optionally attach user data to request
        // req.user = authData;
        next();
    });
};