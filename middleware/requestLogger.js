/**
 * Request logging middleware
 */

// In-memory storage for request logs
const requestLogs = [];

/**
 * Log request information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestLogger(req, res, next) {
  // Record start time
  const startTime = Date.now();
  
  // Store original end method to capture response
  const originalEnd = res.end;
  
  // Override end method to capture response details
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Get response size
    let responseSize = 0;
    if (chunk) {
      responseSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }
    
    // Log the request
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: responseTime,
      responseSize: responseSize,
      userAgent: req.get('User-Agent') || 'Unknown',
      clientIP: req.clientIP || req.ip || req.connection.remoteAddress,
      referer: req.get('Referer') || 'Unknown'
    };
    
    // Store log entry
    requestLogs.push(logEntry);
    
    // Keep only the last 1000 logs to prevent memory issues
    if (requestLogs.length > 1000) {
      requestLogs.shift();
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

/**
 * Get recent request logs
 * @param {number} limit - Number of logs to return (default: 100)
 * @returns {Array} Array of recent request logs
 */
function getRecentLogs(limit = 100) {
  const startIndex = Math.max(0, requestLogs.length - limit);
  return requestLogs.slice(startIndex);
}

/**
 * Clear all request logs
 */
function clearLogs() {
  requestLogs.length = 0;
}

/**
 * Get request statistics
 * @returns {Object} Request statistics
 */
function getRequestStats() {
  if (requestLogs.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      statusCodeDistribution: {},
      mostRequestedEndpoints: []
    };
  }
  
  // Calculate statistics
  const totalRequests = requestLogs.length;
  const totalResponseTime = requestLogs.reduce((sum, log) => sum + log.responseTime, 0);
  const averageResponseTime = totalResponseTime / totalRequests;
  
  // Calculate status code distribution
  const statusCodeDistribution = {};
  requestLogs.forEach(log => {
    const statusCode = Math.floor(log.statusCode / 100) * 100; // Group by 100s (200, 300, 400, 500)
    statusCodeDistribution[statusCode] = (statusCodeDistribution[statusCode] || 0) + 1;
  });
  
  // Calculate most requested endpoints
  const endpointCounts = {};
  requestLogs.forEach(log => {
    const endpoint = log.url.split('?')[0]; // Remove query parameters
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
  });
  
  const mostRequestedEndpoints = Object.entries(endpointCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }));
  
  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    statusCodeDistribution,
    mostRequestedEndpoints
  };
}

module.exports = {
  requestLogger,
  getRecentLogs,
  clearLogs,
  getRequestStats
};