const express = require('express');
const router = express.Router();
const connection = require('../db');
const checkAuthentication = require('./authentication');

// View IP logs
router.get('/ip-logs', checkAuthentication, (req, res) => {
  let sql = 'SELECT * FROM ip_logs ORDER BY timestamp DESC LIMIT 100';
  connection.pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving IP logs:', err);
      res.render('errors', {
        error: 'Failed to retrieve IP logs'
      });
    } else {
      res.render('ip-logs', {
        logs: results
      });
    }
  });
});

module.exports = router;