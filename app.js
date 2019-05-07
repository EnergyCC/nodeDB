const mysql = require('mysql');
const connection = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

//set handlebars engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//set body parser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//set static
app.use(express.static(path.join(__dirname, 'public')));

//Get index route

app.get('/', (req, res) => {
  res.redirect('/index');
});

//index routes
app.use('/index', require('./routes/index'));

// Login route

app.get('/login', (req, res) => {
  res.render('login');
});

// post login route
app.post('/login', (req, res) => {
  let sql = 'SELECT password FROM users WHERE username=?';
  let { username, password } = req.body;
  let errors = [];
  connection.db.query(sql, username, (err, result) => {
    if (err) console.log(err);
    else {
      // check if user exists
      if (result.length < 1) {
        errors.push({ text: 'Utilizator sau parola gresite' });
      }
      //   check if input password matches the database password
      if (result[0].password !== password && errors.length < 1) {
        errors.push({ text: 'Utilizator sau parola gresite' });
      }
      //   checks for errors and pushes them back in the client
      if (errors.length > 0) {
        res.render('login', {
          errors,
          username,
          password
        });
      }
      //   if user exists and passwords match -> login = true
      if (result.length === 1 && result[0].password === password) {
        // console.log('login successful');
        jwt.sign(
          { username },
          'secretkey',
          { expiresIn: '1m' },
          (err, token) => {
            // res.setHeader('authorization', `Bearer ${token}`);
            res.cookie('authorization', token, { maxAge: 60000 });
            // console.log(token);
            // console.log(req.cookie.token);
            // res.redirect('index');
            res.redirect('index');
          }
        );
      }
    }
  });
});

app.listen(connection.PORT, () => {
  console.log(`Application listening to port ${connection.PORT}`);
});
