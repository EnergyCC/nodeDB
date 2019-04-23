const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');

//database connection

connection.db.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection successfully made');
  }
});

//create router for index

router.get('/', (req, res) => {
  let sql = `SELECT * FROM profile;`;
  connection.db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    }
    // console.log(results);
    res.render('results', {
      results
    });
  });
});

router.get('/getdb', (req, res) => {
  let sql = 'SELECT * FROM profile;';
  connection.db.query(sql, (err, results) => {
    res.send(results);
  });
});

module.exports = router;
