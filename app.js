const mysql = require('mysql');
const connection = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();

//set handlebars engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//set body parser

app.use(bodyParser.urlencoded({ extended: false }));

//set static
app.use(express.static(path.join(__dirname, 'public')));

//Get index route

app.get('/', (req, res) => {
    res.redirect('/index');
});

//index routes
app.use('/index', require('./routes/index'));

app.listen(connection.PORT, () => {
    console.log(`Application listening to port ${connection.PORT}`);
});