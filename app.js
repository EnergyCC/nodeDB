const mysql = require('mysql');
const connection = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

//database connection

connection.db.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log(new Date() + ' -> Connection successfully made');
  }
});

const app = express();
//create handlebars options
const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    parseDen: function(value) {
      let parse = JSON.parse(value);
      return parse[0].charAt(0).toUpperCase() + parse[0].slice(1).toLowerCase();
    },
    parseData: function(value) {
      let data = value.toLocaleDateString('en-GB').split('/');
      return `${data[1]}/${data[0]}/${data[2]}`;
    },
    firstUpper: function(string) {
      if(string === undefined){
        return ' ';
      }else {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
      }
    },
    tableRes: function(str, val) {
      let result = JSON.parse(str)[val];
      if(result === undefined){
        return ' ';
      }else {
        return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
      }
    },
    ifEx: function(str, val) {
      if (typeof str === 'null') {
        return ' ';
      } else {
        let result = JSON.parse(str)[val];
        return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
      }
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

// sales route

app.use('/sales', require('./routes/sales'));

// add route
app.use('/add', require('./routes/add'));
app.use('/remove', require('./routes/remove'));
app.use('/edit', require('./routes/edit'));

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
  // retrieves password from input users
  connection.db.query(sql, username, (err, result) => {
    if (err) console.log(err);
    else {
      //   if user exists and passwords match -> login = true
      if (result.length !== 0 && result[0].password === password) {
        // get the token, set epiration date on token btw
        jwt.sign(
          { username },
          'secretkey',
          { expiresIn: '2h' },
          (err, token) => {
            // send cookie
            res.cookie('authorization', token, {
              maxAge: 7200000,
              httpOnly: true
            });
            res.redirect('index');
            console.log(
              'Successful login from: ' + req.connection.remoteAddress
            );
          }
        );
      }
      // response in case user and password is wrong
      else {
        console.log('Unsuccessful login from: ' + req.ip);
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
  console.log(
    `${new Date()} -> Application listening to port ${connection.PORT}`
  );
});
