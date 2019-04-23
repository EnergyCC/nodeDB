const mysql = require('mysql');
const connection = require('./db.js');
const express = require('express');
const path = require('path');

const app = express();

connection.db.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection successfully made');
  }
});

app.get('/getdb', (req, res) => {
  let sql = 'SELECT * FROM profile';
  connection.db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.sendFile('error.html', {
        root: path.join(__dirname, './html/')
      });
    }
    console.log('Success');
    res.send(result);
  });
});

app.listen(connection.PORT, () => {
  console.log(`Application listening to port ${connection.PORT}`);
});
