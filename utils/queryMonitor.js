/**
 * Database query monitoring and optimization utilities
 */

// In-memory storage for query statistics
const queryStats = new Map();

/**
 * Wrap database queries with monitoring
 * @param {Object} pool - MySQL connection pool
 * @returns {Object} Wrapped pool with monitoring
 */
function wrapPoolWithMonitoring(pool) {
  // Wrap the query method
  const originalQuery = pool.query;
  
  pool.query = function(sql, values, callback) {
    // Start timing
    const startTime = Date.now();
    
    // Generate a normalized query key for statistics
    const queryKey = normalizeQuery(sql);
    
    // Call the original query method
    const query = originalQuery.call(this, sql, values, (err, results, fields) => {
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Update statistics
      updateQueryStats(queryKey, executionTime, err);
      
      // Call the original callback
      if (callback) {
        callback(err, results, fields);
      }
    });
    
    return query;
  };
  
  return pool;
}

/**
 * Normalize SQL query for statistics tracking
 * @param {string} sql - SQL query string
 * @returns {string} Normalized query
 */
function normalizeQuery(sql) {
  // Remove extra whitespace and normalize
  return sql.replace(/\s+/g, ' ').trim();
}

/**
 * Update query statistics
 * @param {string} queryKey - Normalized query key
 * @param {number} executionTime - Query execution time in ms
 * @param {Error} error - Error object if query failed
 */
function updateQueryStats(queryKey, executionTime, error) {
  // Get or create stats for this query
  let stats = queryStats.get(queryKey) || {
    count: 0,
    totalTime: 0,
    avgTime: 0,
    maxTime: 0,
    minTime: Infinity,
    errors: 0
  };
  
  // Update stats
  stats.count++;
  stats.totalTime += executionTime;
  stats.avgTime = stats.totalTime / stats.count;
  stats.maxTime = Math.max(stats.maxTime, executionTime);
  stats.minTime = Math.min(stats.minTime, executionTime);
  
  if (error) {
    stats.errors++;
  }
  
  // Store updated stats
  queryStats.set(queryKey, stats);
}

/**
 * Get query statistics
 * @returns {Array} Array of query statistics sorted by total time
 */
function getQueryStats() {
  const statsArray = Array.from(queryStats.entries()).map(([query, stats]) => ({
    query,
    ...stats
  }));
  
  // Sort by total time descending
  statsArray.sort((a, b) => b.totalTime - a.totalTime);
  
  return statsArray;
}

/**
 * Log slow queries
 * @param {number} threshold - Threshold in ms for slow queries
 */
function logSlowQueries(threshold = 1000) {
  const slowQueries = Array.from(queryStats.entries())
    .filter(([query, stats]) => stats.avgTime > threshold)
    .map(([query, stats]) => ({
      query,
      avgTime: stats.avgTime,
      maxTime: stats.maxTime,
      count: stats.count
    }));
  
  if (slowQueries.length > 0) {
    console.warn('Slow queries detected:');
    slowQueries.forEach(sq => {
      console.warn(`  ${sq.query} - Avg: ${sq.avgTime.toFixed(2)}ms, Max: ${sq.maxTime}ms, Count: ${sq.count}`);
    });
  }
}

/**
 * Reset query statistics
 */
function resetQueryStats() {
  queryStats.clear();
}

module.exports = {
  wrapPoolWithMonitoring,
  getQueryStats,
  logSlowQueries,
  resetQueryStats
};