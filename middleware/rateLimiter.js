const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create rate limiter for login attempts
// Allow 5 attempts per 15 minutes per IP
const rateLimiterLogin = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 15 * 60, // 15 minutes
});

// Create rate limiter for registration attempts
// Allow 3 attempts per hour per IP
const rateLimiterRegister = new RateLimiterMemory({
  points: 3, // 3 attempts
  duration: 60 * 60, // 1 hour
});

/**
 * Middleware to rate limit login attempts
 */
async function rateLimitLogin(req, res, next) {
  try {
    // Use IP address as key
    const clientIP = req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      'unknown';
    
    await rateLimiterLogin.consume(clientIP);
    next();
  } catch (rejRes) {
    // Rate limit exceeded
    const retrySeconds = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.status(429).render('errors', {
      error: `Prea multe încercări de autentificare. Vă rugăm încercați din nou în ${retrySeconds} secunde.`
    });
  }
}

/**
 * Middleware to rate limit registration attempts
 */
async function rateLimitRegister(req, res, next) {
  try {
    // Use IP address as key
    const clientIP = req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      'unknown';
    
    await rateLimiterRegister.consume(clientIP);
    next();
  } catch (rejRes) {
    // Rate limit exceeded
    const retrySeconds = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.status(429).render('errors', {
      error: `Prea multe încercări de înregistrare. Vă rugăm încercați din nou în ${retrySeconds} secunde.`
    });
  }
}

module.exports = {
  rateLimitLogin,
  rateLimitRegister
};