const mysql = require('mysql');
const connection = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
//create handlebars options
const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    parseDen: function(value) {
      let parse = JSON.parse(value);
      // console.log(parse[0]);
      return parse[0];
    },
    parseData: function(value) {
      let data = value.toLocaleDateString('en-GB').split('/');
      return `${data[1]}/${data[0]}/${data[2]}`;
    }
  }
});

//set handlebars engine
app.engine('handlebars', hbs.engine);
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

// serve the manifest file for PWA
app.get('/manifest.json', (req, res) => {
  res.header('Content-Type', 'text/cache-manifest');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// serve the service-worker

app.get('/service-worker.js', (req, res) => {
  res.header('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, 'service-worker.js'));
});

// post login route
app.post('/login', (req, res) => {
  let sql = 'SELECT password FROM users WHERE username=?';
  let { username, password } = req.body;
  let errors = [];
  connection.db.query(sql, username, (err, result) => {
    if (err) console.log(err);
    else {
      //   if user exists and passwords match -> login = true
      if (result.length !== 0 && result[0].password === password) {
        // get the token, set epiration date on token btw
        jwt.sign(
          { username },
          'secretkey',
          { expiresIn: '20m' },
          (err, token) => {
            // send cookie
            res.cookie('authorization', token, {
              maxAge: 1200000,
              httpOnly: true
            });
            res.redirect('index');
          }
        );
      }
      // response in case user and password is wrong
      else {
        errors.push({ text: 'Utilizator sau parola gresite' });
        res.render('login', {
          errors,
          username,
          password
        });
      }
    }
  });
});

app.listen(connection.PORT, () => {
  console.log(`Application listening to port ${connection.PORT}`);
});
