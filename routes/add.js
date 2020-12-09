const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const checkAuthentication = require('./authentication');

// route for add form
router.get('/profile', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let url = '/add/profile';
      let mth = 'POST';
      res.render('add', {
        url,
        mth
      });
    }
  });
});

// router post for the data post, always 5 data entries for profiles
router.post('/profile', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let {
        nume_client,
        tip_auto,
        nr_inmatriculare,
        serie_caroserie,
        serie_motor,
        nr_tel
      } = req.body;
      let sql =
        'INSERT INTO profile(nume_client, tip_auto, nr_inmatriculare, serie_caroserie, serie_motor, nr_tel) VALUES (?, ?, ?, ?, ?, ?);';
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
        let url = '/add/profile';
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
            serie_motor.toUpperCase(),
            nr_tel
          ],
          (err, result) => {
            if (err) {
              let error = err.sqlMessage;
              console.log(err.sqlMessage);
              res.render('errors', {
                error
              });
            } else {
              console.log(
                new Date() + ' -> Successfully created database entry'
              );
              res.redirect('/index');
            }
          }
        );
      }
    }
  });
});

// route to render the form for adding jobs

router.get('/jobs/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let profile_id = req.params.id;
      let url = `/add/jobs/${profile_id}`;
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

router.post('/jobs/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let lucrari_sol_parse = [
        req.body.lucrari_sol1,
        req.body.lucrari_sol2,
        req.body.lucrari_sol3,
        req.body.lucrari_sol4,
        req.body.lucrari_sol5
      ];
      let den_piesa_cl_parse = [
        req.body.den_piesa_cl1,
        req.body.den_piesa_cl2,
        req.body.den_piesa_cl3,
        req.body.den_piesa_cl4,
        req.body.den_piesa_cl5
      ];
      let buc_piesa_cl_parse = [
        req.body.buc_piesa_cl1,
        req.body.buc_piesa_cl2,
        req.body.buc_piesa_cl3,
        req.body.buc_piesa_cl4,
        req.body.buc_piesa_cl5
      ];
      let def_suplim_parse = [
        req.body.def_suplimentare1,
        req.body.def_suplimentare2
      ];
      let termen_executie = req.body.termen_executie;
      let denum_operatie_parse = [
        req.body.denum_operatie1,
        req.body.denum_operatie2,
        req.body.denum_operatie3,
        req.body.denum_operatie4,
        req.body.denum_operatie5
      ];
      let kilometri = parseInt(req.body.kilometri);
      let timp_operatie_parse = [
        req.body.timp_operatie1,
        req.body.timp_operatie2,
        req.body.timp_operatie3,
        req.body.timp_operatie4,
        req.body.timp_operatie5
      ];
      let denum_piesa_parse = [
        req.body.denum_piesa1,
        req.body.denum_piesa2,
        req.body.denum_piesa3,
        req.body.denum_piesa4,
        req.body.denum_piesa5,
        req.body.denum_piesa6,
        req.body.denum_piesa7,
        req.body.denum_piesa8,
        req.body.denum_piesa9,
        req.body.denum_piesa10
      ];
      let cant_piese_parse = [
        req.body.cant_piese1,
        req.body.cant_piese2,
        req.body.cant_piese3,
        req.body.cant_piese4,
        req.body.cant_piese5,
        req.body.cant_piese6,
        req.body.cant_piese7,
        req.body.cant_piese8,
        req.body.cant_piese9,
        req.body.cant_piese10
      ];
      let pret_piesa_parse = [
        req.body.pret_piesa1,
        req.body.pret_piesa2,
        req.body.pret_piesa3,
        req.body.pret_piesa4,
        req.body.pret_piesa5,
        req.body.pret_piesa6,
        req.body.pret_piesa7,
        req.body.pret_piesa8,
        req.body.pret_piesa9,
        req.body.pret_piesa10
      ];
      let tarif_ora = req.body.tarif_ora;
      let lucrari_sol = JSON.stringify(lucrari_sol_parse);
      let den_piesa_cl = JSON.stringify(den_piesa_cl_parse);
      let buc_piesa_cl = JSON.stringify(buc_piesa_cl_parse);
      let def_suplim = JSON.stringify(def_suplim_parse);
      let denum_operatie = JSON.stringify(denum_operatie_parse);
      let timp_operatie = JSON.stringify(timp_operatie_parse);
      let denum_piesa = JSON.stringify(denum_piesa_parse);
      let cant_piese = JSON.stringify(cant_piese_parse);
      let pret_piesa = JSON.stringify(pret_piesa_parse);
      let profile_id = req.params.id;
      let d = new Date();
      console.log(lucrari_sol);
      const data =
        d.getFullYear() + '-' + parseInt(d.getMonth() + 1) + '-' + d.getDate();
      let sql =
        'INSERT INTO jobs(data_adaugare, lucrari_sol, den_piesa_cl, buc_piesa_cl, def_suplim, termen_executie, denum_operatie, timp_operatie, tarif_ora, denum_piesa, cant_piese, pret_piesa, profile_id, kilometri) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      connection.db.query(
        sql,
        [
          data,
          lucrari_sol,
          den_piesa_cl,
          buc_piesa_cl,
          def_suplim,
          termen_executie,
          denum_operatie,
          timp_operatie,
          tarif_ora,
          denum_piesa,
          cant_piese,
          pret_piesa,
          profile_id,
          kilometri
        ],
        (err, result) => {
          if (err) {
            console.log(err.sqlMessage);
            let error = err.sqlMessage;
            res.render('errors', {
              error
            });
          } else {
            console.log(new Date() + ' -> Added job');
            res.redirect(`/index/view/${profile_id}`);
          }
        }
      );
    }
  });
});

module.exports = router;
