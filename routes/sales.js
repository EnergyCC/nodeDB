const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const checkAuthentication = require('./authentication');

router.get('/', (req, res) => {
  res.render('results');
});

module.exports = router;
