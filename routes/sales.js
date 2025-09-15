const express = require('express');
const router = express.Router();
const connection = require('../db');
const checkAuthentication = require('./authentication');

router.get('/', checkAuthentication, (req, res) => {
  res.render('results');
});

module.exports = router;