const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');

//create router for index

router.get('/', (req, res) => {
  res.send('TEST');
});

module.exports = router;
