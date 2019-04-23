const mysql = require('mysql');
const connection = require('./db.js');
const express = require('express');
const path = require('path');

const app = express();
// app.use(express.static('html'));
// connection.db.connect(err => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('Connection successfully made');
//   }
// });

//Get index route

app.get('/', (req, res) => {
  res.send('Index file(temp');
});

app.use('/index', require('./routes/index'));

app.listen(connection.PORT, () => {
  console.log(`Application listening to port ${connection.PORT}`);
});
