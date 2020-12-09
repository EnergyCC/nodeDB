const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const checkAuthentication = require('./authentication');

//temporary route to create profile and jobs tables

router.get('/createtables', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sqlP =
        'CREATE TABLE IF NOT EXISTS profile(profile_id INT PRIMARY KEY AUTO_INCREMENT, nume_client VARCHAR(64), tip_auto VARCHAR(48), nr_inmatriculare VARCHAR(15), serie_caroserie VARCHAR(20), serie_motor VARCHAR(20), nr_tel INT)';
      let sqlJ =
        'CREATE TABLE IF NOT EXISTS jobs(job_id INT PRIMARY KEY AUTO_INCREMENT, data_adaugare DATE, lucrari_sol VARCHAR(512), den_piesa_cl VARCHAR(255), buc_piesa_cl VARCHAR(24), def_suplim VARCHAR(255), termen_executie VARCHAR(12), denum_operatie VARCHAR(512), timp_operatie VARCHAR(24), tarif_ora INT, denum_piesa VARCHAR(512), cant_piese VARCHAR(48), pret_piesa VARCHAR(48), profile_id INT, kilometri INT, FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON UPDATE CASCADE ON DELETE CASCADE)';
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
  let sql = `SELECT * FROM profile ORDER BY profile_id DESC LIMIT 50;`;
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      connection.db.query(sql, (err, results) => {
        if (err) {
          console.log(err.sqlMessage);
          let error = err.sqlMessage;
          res.render('errors', {
            error
          });
        } else {
          console.log(new Date() + ' -> retrieved data for index');
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
  let { searchQuery, searchParam, searchOrder } = req.body;
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql = `SELECT * FROM profile WHERE ${searchParam} LIKE '%${searchQuery}%'`;
      connection.db.query(sql, (err, results) => {
        if (err) {
          let error = err.sqlMessage;
          console.log(err.sqlMessage);
          res.render('errors', {
            error
          });
        } else {
          console.log(new Date() + ' -> Successfully executed search function');
          res.render('results', {
            results
          });
        }
      });
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
        console.log(new Date() + ' -> accessed raw data /getdb');
        res.send(results);
      });
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
          console.log(err.sqlMessage);
          let error = err.sqlMessage;
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
          let nr_tel = result[0].nr_tel;
          let jsql = `SELECT * FROM jobs WHERE profile_id =?`;
          connection.db.query(jsql, profile_id, (err, results) => {
            if (err) {
              console.log(err.sqlMessage);
              let error = err.sqlMessage; //Errors string temp
              res.render('errors', {
                error
              });
            } else {
              console.log(
                new Date() + ' -> Successfully retrieved data for viewjobs'
              );
              res.render('view', {
                results,
                profile_id,
                nume_client,
                tip_auto,
                nr_inmatriculare,
                serie_caroserie,
                serie_motor,
                nr_tel
              });
            }
          });
        }
      });
    }
  });
});

// get data for viewjobs to see all the jobs
router.get('/viewjobs/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql = 'SELECT * FROM jobs WHERE job_id = ?';
      let job_id = req.params.id;
      let profile_id = req.query.profile;
      connection.db.query(sql, job_id, (err, result) => {
        if (err) {
          console.log(err.sqlMessage);
          let error = err.sqlMessage;
          res.render('errors', {
            error
          });
        } else {
          let job_id = result[0].job_id;
          console.log(
            new Date() + ' -> Successfully retrieved data for single job'
          );
          res.render('viewjobs', {
            result,
            profile_id,
            job_id
          });
        }
      });
    }
  });
});

// gen raport
router.get('/raport/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    let job_id = req.params.id;
    let profile_id = req.query.profile;
    let pSql = 'SELECT * FROM profile WHERE profile_id = ?';
    let jSql = 'SELECT * FROM jobs WHERE job_id = ?';
    connection.db.query(pSql, profile_id, (err, pResult) => {
      if (err) {
        console.log(err.sqlMessage);
        let error = err.sqlMessage;
        res.render('errors', { error });
      } else {
        connection.db.query(jSql, job_id, (err, jResult) => {
          if (err) {
            console.log(err.sqlMessage);
            let error = err.sqlMessage;
            res.render('errors', { error });
          } else {
            let valoare_leiEx = [];
            let total_manopera = 0;
            let result_timp = JSON.parse(jResult[0].timp_operatie);
            for (let i = 0; i <= result_timp.length - 1; i++) {
              valoare_leiEx.push(result_timp[i] * jResult[0].tarif_ora);
              total_manopera += result_timp[i] * jResult[0].tarif_ora;
            }
            let total_ore_operatie = 0;
            for (let i = 0; i <= result_timp.length - 1; i++) {
              if (result_timp[i].length === 0) {
                result_timp[i] = 0;
              }
              total_ore_operatie += parseFloat(result_timp[i]);
            }
            let total_cost_val = total_ore_operatie * jResult[0].tarif_ora;
            let cant_piese_unitar = JSON.parse(jResult[0].cant_piese);
            let pret_piesa_unitar = JSON.parse(jResult[0].pret_piesa);
            let total_materiale = 0;
            let val_totala_piese = [];
            for (let i = 0; i <= cant_piese_unitar.length - 1; i++) {
              val_totala_piese.push(
                parseFloat(cant_piese_unitar[i]) *
                  parseFloat(pret_piesa_unitar[i])
              );
              val_totala_piese[i] = val_totala_piese[i] || 0;
            }
            for (let i = 0; i <= cant_piese_unitar.length - 1; i++) {
              val_totala_piese[i] = val_totala_piese[i] || 0;
              total_materiale += val_totala_piese[i];
            }
            let total_plata = total_materiale + total_manopera;
            let total_tva = (total_plata * 19) / 100;
            let total_plata_ftva = total_plata - total_tva;
            console.log(new Date() + ' -> Successfully created report');
            res.render('raport', {
              layout: false,
              valoare_leiEx,
              total_ore_operatie,
              total_cost_val,
              val_totala_piese,
              total_manopera,
              total_materiale,
              total_plata,
              total_plata_ftva,
              total_tva,
              jResult,
              pResult
            });
          }
        });
      }
    });
  });
});
module.exports = router;
