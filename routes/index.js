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

//temporary route to create profile and jobs tables

router.get('/createtables', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sqlP =
        'CREATE TABLE IF NOT EXISTS profile(profile_id INT PRIMARY KEY AUTO_INCREMENT, nume_client VARCHAR(64), tip_auto VARCHAR(48), nr_inmatriculare VARCHAR(15), serie_caroserie VARCHAR(20), serie_motor VARCHAR(20))';
      let sqlJ =
        'CREATE TABLE IF NOT EXISTS jobs(job_id INT PRIMARY KEY AUTO_INCREMENT, data_adaugare DATE, lucrari_sol VARCHAR(512), den_piesa_cl VARCHAR(255), buc_piesa_cl INT, def_suplim VARCHAR(255), termen_executie VARCHAR(12), denum_operatie VARCHAR(512), timp_operatie INT, tarif_ora INT, valoare_lei INT, denum_piesa VARCHAR(255), cant_piese INT, pret_piesa INT, profile_id INT, FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON UPDATE CASCADE ON DELETE CASCADE)';
      connection.db.query(sqlP, (err, results) => {
        if (err) console.log(err);
        else {
          connection.db.query(sqlJ, (err, result) => {
            if (err) console.log(err);
            else {
              console.log('successful');
            }
          });
        }
      });
    }
  });
});

//create router for index

router.get('/', checkAuthentication, (req, res) => {
  let sql = `SELECT * FROM profile LIMIT 50;`;
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      connection.db.query(sql, (err, results) => {
        if (err) {
          console.log(err);
          let error = 'Eroare';
          res.render('errors', {
            error
          });
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
      res.redirect('/login');
    } else {
      let sql = `SELECT * FROM profile WHERE ${searchParam} LIKE '%${searchQuery}%'`;
      connection.db.query(sql, (err, results) => {
        if (err) {
          res.render('errors', {
            error
          });
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
router.get('/add', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let url = '/index/add';
      let mth = 'POST';
      res.render('add', {
        url,
        mth
      });
    }
  });
});

// router post for the data post, always 5 data entries for profiles
router.post('/add', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let {
        nume_client,
        tip_auto,
        nr_inmatriculare,
        serie_caroserie,
        serie_motor
      } = req.body;
      let sql =
        'INSERT INTO profile(nume_client, tip_auto, nr_inmatriculare, serie_caroserie, serie_motor) VALUES (?, ?, ?, ?, ?);';
      //   let d = new Date();
      //   const data =
      //     d.getFullYear() + '-' + parseInt(d.getMonth() + 1) + '-' + d.getDate();
      let errors = [];

      // field validation
      if (!nume_client) {
        errors.push({ text: 'Nu ai introdus un nume client' });
      }
      if (!tip_auto) {
        errors.push({ text: 'Nu ai introdus un tip auto' });
      }
      if (!nr_inmatriculare) {
        errors.push({ text: 'Nu ai introdus un numar de inmatriculare' });
      }
      if (!serie_caroserie) {
        errors.push({ text: 'Nu ai introdus o serie de caroserie' });
      }
      if (!serie_motor) {
        errors.push({ text: 'Nu ai introdus o serie de motor' });
      }

      if (errors.length > 0) {
        let url = '/index/add';
        let mth = 'POST';
        res.render('add', {
          url,
          mth,
          errors,
          nume_client,
          tip_auto,
          nr_inmatriculare,
          serie_caroserie,
          serie_motor
        });
      } else {
        connection.db.query(
          sql,
          [
            nume_client.toUpperCase(),
            tip_auto.toUpperCase(),
            nr_inmatriculare.toUpperCase(),
            serie_caroserie.toUpperCase(),
            serie_motor.toUpperCase()
          ],
          (err, result) => {
            if (err) {
              let error = 'Eroare';
              console.log(err);
              res.render('errors', {
                error
              });
            } else {
              res.redirect('/index');
            }
          }
        );
      }
    }
  });
});

//Just raw(dog) data
router.get('/getdb', checkAuthentication, (req, res) => {
  let sql = 'SELECT * FROM profile LIMIT 50';
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
      res.redirect('/login');
    } else {
      let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
        if (err) throw err;
        else {
          let nume_client = result[0].nume_client;
          let profile_id = result[0].profile_id;
          res.render('remove', {
            nume_client,
            profile_id
          });
        }
      });
    }
  });
});

//confirm deletion route
router.get('/delete/:id/true', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql = 'DELETE FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
        if (err) throw err;
        else {
          res.redirect('/index');
        }
      });
    }
  });
});

//Add edit route with data -> send it to app.handlebars
router.get('/edit/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
        let url = `/index/edit/${req.params.id}`;
        let mth = 'POST';
        let nume_client = result[0].nume_client;
        let tip_auto = result[0].tip_auto;
        let nr_inmatriculare = result[0].nr_inmatriculare;
        let serie_caroserie = result[0].serie_caroserie;
        let serie_motor = result[0].serie_motor;
        if (err) console.log(err);
        else {
          res.render('add', {
            url,
            mth,
            nume_client,
            tip_auto,
            nr_inmatriculare,
            serie_caroserie,
            serie_motor
          });
        }
      });
    }
  });
});

//Edit route for editing purpose onyl

router.post('/edit/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql =
        'UPDATE profile SET nume_client=?, tip_auto=?, nr_inmatriculare=?, serie_caroserie=?, serie_motor=? WHERE profile_id=?';
      let {
        nume_client,
        tip_auto,
        nr_inmatriculare,
        serie_caroserie,
        serie_motor
      } = req.body;
      connection.db.query(
        sql,
        [
          nume_client.toUpperCase(),
          tip_auto.toUpperCase(),
          nr_inmatriculare.toUpperCase(),
          serie_caroserie.toUpperCase(),
          serie_motor.toUpperCase(),
          req.params.id
        ],
        (err, result) => {
          if (err) console.log(err);
          else {
            res.redirect('/index');
          }
        }
      );
    }
  });
});

// create view route for jobs table

router.get('/view/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql = 'SELECT * FROM profile WHERE profile_id = ?';
      let profile_id = req.params.id;
      connection.db.query(sql, profile_id, (err, result) => {
        if (err) {
          console.log(err.message);
          let error = 'Eroare';
          res.render('errors', {
            error
          });
        } else {
          let nume_client = result[0].nume_client;
          let tip_auto = result[0].tip_auto;
          let nr_inmatriculare = result[0].nr_inmatriculare;
          let serie_caroserie = result[0].serie_caroserie;
          //   let data_N = result[0].data_adaug.toLocaleDateString('en-GB').split('/');
          //   let data_adaug = `${data_N[1]}/${data_N[0]}/${data_N[2]}`;
          let serie_motor = result[0].serie_motor;
          let jsql = `SELECT * FROM jobs WHERE profile_id =?`;
          connection.db.query(jsql, profile_id, (err, results) => {
            if (err) {
              console.log(err);
              let error = 'Eroare'; //Errors string temp
              res.render('errors', {
                error
              });
            } else {
              // console.log(results);
              //   console.log(`From view ${nume} || ${result[0].nume}`);
              res.render('view', {
                results,
                profile_id,
                nume_client,
                tip_auto,
                nr_inmatriculare,
                serie_caroserie,
                serie_motor
              });
            }
          });
        }
      });
    }
  });
});

// route to render the form for adding jobs

router.get('/view/:id/addjobs', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let profile_id = req.params.id;
      let url = `/index/view/${profile_id}/addjobs`;
      let mth = 'POST';
      res.render('addjobs', {
        url,
        mth,
        profile_id
      });
    }
  });
});

// post route to add the job data

router.post('/view/:id/addjobs', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let nume = req.query.nume;
      let profile_id = req.params.id;
      let { rep_cost, descript, partRepl } = req.body;
      console.log(nume);
      let sql =
        'INSERT INTO jobs(rep_cost, descript, partRepl, nume, profile_id) VALUES(?, ?, ?, ?, ?)';

      connection.db.query(
        sql,
        [rep_cost, descript, partRepl, nume, profile_id],
        (err, result) => {
          if (err) {
            console.log(err);
            res.sendStatus(403);
          } else {
            res.redirect(`/index/view/${profile_id}`);
          }
        }
      );
    }
  });
});

// route to confirm job remove
router.get('/deletejobs/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let profile_id = req.query.profile;
      let jobID = req.params.id;
      res.render('removejobs', {
        jobID,
        profile_id
      });
    }
  });
});

// route to remove jobs

router.get('/deletejobs/:id/true', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let profile_id = req.query.profile;
      let jobID = req.params.id;
      let sql = 'DELETE FROM jobs WHERE jobID = ?';
      console.log(`${profile_id} | ${jobID} | ${sql}`);
      connection.db.query(sql, jobID, (err, result) => {
        if (err) {
          console.log(err);
          res.send(403);
        } else {
          res.redirect(`/index/view/${profile_id}`);
          console.log(`Successfully removed job with the id ${jobID}`);
        }
      });
    }
  });
});

module.exports = router;
