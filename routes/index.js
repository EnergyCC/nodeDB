const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const checkAuthentication = require('./authentication');

//database connection

connection.db.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection successfully made');
  }
});

//create router for index

<<<<<<< HEAD
router.get('/', (req, res) => {
    let sql = `SELECT * FROM profile LIMIT 10;`;
    connection.db.query(sql, (err, results) => {
=======
router.get('/', checkAuthentication, (req, res) => {
  let sql = `SELECT * FROM profile LIMIT 10;`;
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('http://localhost:3003/login');
    } else {
      connection.db.query(sql, (err, results) => {
>>>>>>> fb964548b61da4fe5802562e43e74441a66b2614
        if (err) {
          console.log(err);
          res.sendStatus(403);
        } else {
          res.render('results', {
            results
          });
        }
      });
    }
  });
});

// Search function ↓
router.post('/', checkAuthentication, (req, res) => {
  let { searchQuery, searchParam } = req.body;
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('http://localhost:3003/login');
    } else {
      console.log(`Param: ${searchParam} || Query: ${searchQuery}`);
      let sql = `SELECT * FROM profile WHERE ${searchParam} LIKE '%${searchQuery}%'`;
      connection.db.query(sql, (err, results) => {
        if (err) {
          console.log(err);
          res.sendStatus(403);
        } else {
          res.render('results', {
            results
          });
        }
      });
    }
  });
});

//router get for the add form
<<<<<<< HEAD
router.get('/add', (req, res) => {
    let url = '/index/add';
    let mth = 'POST';
    res.render('add', {
=======
router.get('/add', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('http://localhost:3003/login');
    } else {
      let url = '/index/add';
      let mth = 'POST';
      res.render('add', {
>>>>>>> fb964548b61da4fe5802562e43e74441a66b2614
        url,
        mth
      });
    }
  });
});

// router post for the data post
<<<<<<< HEAD
router.post('/add', (req, res) => {
    let { nume, model_masina, nr_inmatriculare, cost } = req.body;
    let sql =
=======
router.post('/add', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('http://localhost:3003/login');
    } else {
      let { nume, model_masina, nr_inmatriculare, cost } = req.body;
      let sql =
>>>>>>> fb964548b61da4fe5802562e43e74441a66b2614
        'INSERT INTO profile(nume, model_masina, nr_inmatriculare, data_adaug, cost) VALUES (?, ?, ?, ?, ?);';
      let d = new Date();
      const data =
        d.getFullYear() + '-' + parseInt(d.getMonth() + 1) + '-' + d.getDate();
      let errors = [];

      // field validation
      if (!nume) {
        errors.push({ text: 'Please add a name' });
      }
      if (!model_masina) {
        errors.push({ text: 'Please add a car model' });
      }
      if (!nr_inmatriculare) {
        errors.push({ text: 'Please add a plate number' });
      }
      if (!cost) {
        errors.push({ text: 'Please add a cost' });
      }

      if (errors.length > 0) {
        let url = '/index/add';
        let mth = 'POST';
        res.render('add', {
          url,
          mth,
          errors,
          nume,
          model_masina,
          nr_inmatriculare,
          cost
        });
      } else {
        connection.db.query(
          sql,
          [
            nume.toUpperCase(),
            model_masina.toUpperCase(),
            nr_inmatriculare.toUpperCase(),
            data,
            cost
          ],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log(data);
              res.redirect('/index');
            }
          }
        );
      }
    }
  });
});

//Just raw(dog) data
<<<<<<< HEAD
router.get('/getdb', (req, res) => {
    let sql = 'SELECT * FROM profile;';
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            connection.db.query(sql, (err, results) => {
                res.send(results);
            });
        }
    })

});

// get and render delete route
router.get('/delete/:id', (req, res) => {
    let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
    connection.db.query(sql, req.params.id, (err, result) => {
=======
router.get('/getdb', checkAuthentication, (req, res) => {
  let sql = 'SELECT * FROM profile;';
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      connection.db.query(sql, (err, results) => {
        res.send(results);
      });
    }
  });
});

// get and render delete route
router.get('/delete/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('http://localhost:3003/login');
    } else {
      let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
>>>>>>> fb964548b61da4fe5802562e43e74441a66b2614
        if (err) throw err;
        else {
          // console.log(result);
          let nume = result[0].nume;
          let profile_id = result[0].profile_id;
          res.render('remove', {
            nume,
            profile_id
          });
        }
      });
    }
  });
});

//confirm deletion route
<<<<<<< HEAD
router.get('/delete/:id/true', (req, res) => {
    let sql = 'DELETE FROM profile WHERE profile_id = ?;';
    connection.db.query(sql, req.params.id, (err, result) => {
=======
router.get('/delete/:id/true', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('http://localhost:3003/login');
    } else {
      let sql = 'DELETE FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
>>>>>>> fb964548b61da4fe5802562e43e74441a66b2614
        if (err) throw err;
        else {
          res.redirect('/index');
        }
      });
    }
  });
});

//Add edit route with data -> send it to app.handlebars
<<<<<<< HEAD
router.get('/edit/:id', (req, res) => {
    let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
    connection.db.query(sql, req.params.id, (err, result) => {
=======
router.get('/edit/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('http://localhost:3003/login');
    } else {
      let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
>>>>>>> fb964548b61da4fe5802562e43e74441a66b2614
        let url = `/index/edit/${req.params.id}`;
        let mth = 'POST';
        let nume = result[0].nume;
        let model_masina = result[0].model_masina;
        let nr_inmatriculare = result[0].nr_inmatriculare;
        let cost = result[0].cost;
        // console.log(req.params.id);
        if (err) console.log(err);
        else {
          // console.log(result);
          res.render('add', {
            url,
            mth,
            nume,
            model_masina,
            nr_inmatriculare,
            cost
          });
        }
      });
    }
  });
});

//Edit route for editing purpose onyl

<<<<<<< HEAD
router.post('/edit/:id', (req, res) => {
    let sql =
=======
router.post('/edit/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('http://localhost:3003/login');
    } else {
      let sql =
>>>>>>> fb964548b61da4fe5802562e43e74441a66b2614
        'UPDATE profile SET nume=?, model_masina=?, nr_inmatriculare=?, cost=? WHERE profile_id=?';
      let { nume, model_masina, nr_inmatriculare, cost } = req.body;
      connection.db.query(
        sql,
        [nume, model_masina, nr_inmatriculare, cost, req.params.id],
        (err, result) => {
          if (err) console.log(err);
          else {
            // console.log(req.body);
            res.redirect('/index');
          }
        }
      );
    }
  });
});

// create view route for jobs table

router.get('/view/:id', (req, res) => {
  let sql = 'SELECT * FROM profile WHERE profile_id = ?';
  let profile_id = req.params.id;
  connection.db.query(sql, profile_id, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      let nume = result[0].nume;
      let model_masina = result[0].model_masina;
      let nr_inmatriculare = result[0].nr_inmatriculare;
      console.log(
        `nume ${nume} || model ${model_masina} || nr ${nr_inmatriculare}`
      );
      res.render('view', {
        nume,
        model_masina,
        nr_inmatriculare
      });
    }
  });
});

module.exports = router;
