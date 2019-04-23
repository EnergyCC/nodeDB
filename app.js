const mysql = require('mysql');
const connection = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//set static
app.use(express.static(path.join(__dirname, 'public')));
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
  res.send('Index file(temp)');
});

//index routes
app.use('/index', require('./routes/index'));

app.listen(connection.PORT, () => {
  console.log(`Application listening to port ${connection.PORT}`);
});
