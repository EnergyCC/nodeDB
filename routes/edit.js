const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const checkAuthentication = require('./authentication');

//Add edit route with data -> send it to app.handlebars
router.get('/profile/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
        let url = `/edit/profile/${req.params.id}`;
        let mth = 'POST';
        let nume_client = result[0].nume_client;
        let tip_auto = result[0].tip_auto;
        let nr_inmatriculare = result[0].nr_inmatriculare;
        let serie_caroserie = result[0].serie_caroserie;
        let serie_motor = result[0].serie_motor;
        let nr_tel = result[0].nr_tel;
        if (err) {
          let error = err.sqlMessage;
          console.log(err.sqlMessage);
          res.render('errors', {
            error
          });
        } else {
          res.render('add', {
            url,
            mth,
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
});

//Edit route for editing purpose only

router.post('/profile/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql =
        'UPDATE profile SET nume_client=?, tip_auto=?, nr_inmatriculare=?, serie_caroserie=?, serie_motor=?, nr_tel=? WHERE profile_id=?';
      let {
        nume_client,
        tip_auto,
        nr_inmatriculare,
        serie_caroserie,
        serie_motor,
        nr_tel
      } = req.body;
      connection.db.query(
        sql,
        [
          nume_client.toUpperCase(),
          tip_auto.toUpperCase(),
          nr_inmatriculare.toUpperCase(),
          serie_caroserie.toUpperCase(),
          serie_motor.toUpperCase(),
          nr_tel,
          req.params.id
        ],
        (err, result) => {
          if (err) {
            let error = err.sqlMessage;
            console.log(err.sqlMessage);
            res.render('errors', {
              error
            });
          } else {
            console.log(new Date() + ' -> Edited profile');
            res.redirect('/index');
          }
        }
      );
    }
  });
});

//route to render edit jobs

router.get('/jobs/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let job_id = req.params.id;
      let profile_id = req.query.profile;
      let src = req.query.source;
      let sql = 'SELECT * FROM jobs WHERE job_id = ?';
      connection.db.query(sql, job_id, (err, result) => {
        let url = `${job_id}?profile=${profile_id}&source=${src}`;
        let mth = `POST`;
        let lucrari_sol1 = JSON.parse(result[0].lucrari_sol)[0];
        let lucrari_sol2 = JSON.parse(result[0].lucrari_sol)[1];
        let lucrari_sol3 = JSON.parse(result[0].lucrari_sol)[2];
        let lucrari_sol4 = JSON.parse(result[0].lucrari_sol)[3];
        let lucrari_sol5 = JSON.parse(result[0].lucrari_sol)[4];
        let den_piesa_cl1 = JSON.parse(result[0].den_piesa_cl)[0];
        let den_piesa_cl2 = JSON.parse(result[0].den_piesa_cl)[1];
        let den_piesa_cl3 = JSON.parse(result[0].den_piesa_cl)[2];
        let den_piesa_cl4 = JSON.parse(result[0].den_piesa_cl)[3];
        let den_piesa_cl5 = JSON.parse(result[0].den_piesa_cl)[4];
        let buc_piesa_cl1 = JSON.parse(result[0].buc_piesa_cl)[0];
        let buc_piesa_cl2 = JSON.parse(result[0].buc_piesa_cl)[1];
        let buc_piesa_cl3 = JSON.parse(result[0].buc_piesa_cl)[2];
        let buc_piesa_cl4 = JSON.parse(result[0].buc_piesa_cl)[3];
        let buc_piesa_cl5 = JSON.parse(result[0].buc_piesa_cl)[4];
        let def_suplimentare1 = JSON.parse(result[0].def_suplim)[0];
        let def_suplimentare2 = JSON.parse(result[0].def_suplim)[1];
        let termen_executie = result[0].termen_executie;
        let denum_operatie1 = JSON.parse(result[0].denum_operatie)[0];
        let denum_operatie2 = JSON.parse(result[0].denum_operatie)[1];
        let denum_operatie3 = JSON.parse(result[0].denum_operatie)[2];
        let denum_operatie4 = JSON.parse(result[0].denum_operatie)[3];
        let denum_operatie5 = JSON.parse(result[0].denum_operatie)[4];
        let kilometri = result[0].kilometri;
        let timp_operatie1 = JSON.parse(result[0].timp_operatie)[0];
        let timp_operatie2 = JSON.parse(result[0].timp_operatie)[1];
        let timp_operatie3 = JSON.parse(result[0].timp_operatie)[2];
        let timp_operatie4 = JSON.parse(result[0].timp_operatie)[3];
        let timp_operatie5 = JSON.parse(result[0].timp_operatie)[4];

        let denum_piesa1 = JSON.parse(result[0].denum_piesa)[0];
        let denum_piesa2 = JSON.parse(result[0].denum_piesa)[1];
        let denum_piesa3 = JSON.parse(result[0].denum_piesa)[2];
        let denum_piesa4 = JSON.parse(result[0].denum_piesa)[3];
        let denum_piesa5 = JSON.parse(result[0].denum_piesa)[4];
        let denum_piesa6 = JSON.parse(result[0].denum_piesa)[5];
        let denum_piesa7 = JSON.parse(result[0].denum_piesa)[6];
        let denum_piesa8 = JSON.parse(result[0].denum_piesa)[7];
        let denum_piesa9 = JSON.parse(result[0].denum_piesa)[8];
        let denum_piesa10 = JSON.parse(result[0].denum_piesa)[9];
        let denum_piesa11 = JSON.parse(result[0].denum_piesa)[10];
        let denum_piesa12 = JSON.parse(result[0].denum_piesa)[11];
        let denum_piesa13 = JSON.parse(result[0].denum_piesa)[12];
        let denum_piesa14 = JSON.parse(result[0].denum_piesa)[13];
        let denum_piesa15 = JSON.parse(result[0].denum_piesa)[14];

        let cant_piese1 = JSON.parse(result[0].cant_piese)[0];
        let cant_piese2 = JSON.parse(result[0].cant_piese)[1];
        let cant_piese3 = JSON.parse(result[0].cant_piese)[2];
        let cant_piese4 = JSON.parse(result[0].cant_piese)[3];
        let cant_piese5 = JSON.parse(result[0].cant_piese)[4];
        let cant_piese6 = JSON.parse(result[0].cant_piese)[5];
        let cant_piese7 = JSON.parse(result[0].cant_piese)[6];
        let cant_piese8 = JSON.parse(result[0].cant_piese)[7];
        let cant_piese9 = JSON.parse(result[0].cant_piese)[8];
        let cant_piese10 = JSON.parse(result[0].cant_piese)[9];
        let cant_piese11 = JSON.parse(result[0].cant_piese)[10];
        let cant_piese12 = JSON.parse(result[0].cant_piese)[11];
        let cant_piese13 = JSON.parse(result[0].cant_piese)[12];
        let cant_piese14 = JSON.parse(result[0].cant_piese)[13];
        let cant_piese15 = JSON.parse(result[0].cant_piese)[14];


        let pret_piesa1 = JSON.parse(result[0].pret_piesa)[0];
        let pret_piesa2 = JSON.parse(result[0].pret_piesa)[1];
        let pret_piesa3 = JSON.parse(result[0].pret_piesa)[2];
        let pret_piesa4 = JSON.parse(result[0].pret_piesa)[3];
        let pret_piesa5 = JSON.parse(result[0].pret_piesa)[4];
        let pret_piesa6 = JSON.parse(result[0].pret_piesa)[5];
        let pret_piesa7 = JSON.parse(result[0].pret_piesa)[6];
        let pret_piesa8 = JSON.parse(result[0].pret_piesa)[7];
        let pret_piesa9 = JSON.parse(result[0].pret_piesa)[8];
        let pret_piesa10 = JSON.parse(result[0].pret_piesa)[9];
        let pret_piesa11 = JSON.parse(result[0].pret_piesa)[10];
        let pret_piesa12 = JSON.parse(result[0].pret_piesa)[11];
        let pret_piesa13 = JSON.parse(result[0].pret_piesa)[12];
        let pret_piesa14 = JSON.parse(result[0].pret_piesa)[13];
        let pret_piesa15 = JSON.parse(result[0].pret_piesa)[14];

        res.render('addjobs', {
          url,
          mth,
          profile_id,
          lucrari_sol1,
          lucrari_sol2,
          lucrari_sol3,
          lucrari_sol4,
          lucrari_sol5,
          den_piesa_cl1,
          den_piesa_cl2,
          den_piesa_cl3,
          den_piesa_cl4,
          den_piesa_cl5,
          buc_piesa_cl1,
          buc_piesa_cl2,
          buc_piesa_cl3,
          buc_piesa_cl4,
          buc_piesa_cl5,
          def_suplimentare1,
          def_suplimentare2,
          termen_executie,
          denum_operatie1,
          denum_operatie2,
          denum_operatie3,
          denum_operatie4,
          denum_operatie4,
          denum_operatie5,
          kilometri,
          timp_operatie1,
          timp_operatie2,
          timp_operatie3,
          timp_operatie4,
          timp_operatie5,
          denum_piesa1,
          denum_piesa2,
          denum_piesa3,
          denum_piesa4,
          denum_piesa5,
          denum_piesa6,
          denum_piesa7,
          denum_piesa8,
          denum_piesa9,
          denum_piesa10,
          denum_piesa11,
          denum_piesa12,
          denum_piesa13,
          denum_piesa14,
          denum_piesa15,
          cant_piese1,
          cant_piese2,
          cant_piese3,
          cant_piese4,
          cant_piese5,
          cant_piese6,
          cant_piese7,
          cant_piese8,
          cant_piese9,
          cant_piese10,
          cant_piese11,
          cant_piese12,
          cant_piese13,
          cant_piese14,
          cant_piese15,
          pret_piesa1,
          pret_piesa2,
          pret_piesa3,
          pret_piesa4,
          pret_piesa5,
          pret_piesa6,
          pret_piesa7,
          pret_piesa8,
          pret_piesa9,
          pret_piesa10,
          pret_piesa11,
          pret_piesa12,
          pret_piesa13,
          pret_piesa14,
          pret_piesa15
        });
      });
    }
  });
});

// router for edit jobs

router.post('/jobs/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let profile_id = req.query.profile;
      let src = req.query.source;
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
        req.body.denum_piesa10,
        req.body.denum_piesa11,
        req.body.denum_piesa12,
        req.body.denum_piesa13,
        req.body.denum_piesa14,
        req.body.denum_piesa15
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
        req.body.cant_piese10,
        req.body.cant_piese11,
        req.body.cant_piese12,
        req.body.cant_piese13,
        req.body.cant_piese14,
        req.body.cant_piese15
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
        req.body.pret_piesa10,
        req.body.pret_piesa11,
        req.body.pret_piesa12,
        req.body.pret_piesa13,
        req.body.pret_piesa14,
        req.body.pret_piesa15
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
      let job_id = req.params.id;
      let sql =
        'UPDATE jobs set lucrari_sol = ?, den_piesa_cl = ?, buc_piesa_cl = ?, def_suplim = ?, termen_executie = ?, denum_operatie = ?, timp_operatie = ?, tarif_ora = ?, denum_piesa = ?, cant_piese = ?, pret_piesa = ?, kilometri = ? where job_id = ?';

      connection.db.query(
        sql,
        [
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
          kilometri,
          job_id
        ],
        (err, result) => {
          if (err) {
            console.log(err.sqlMessage);
            let error = err.sqlMessage;
            res.render('errors', {
              error
            });
          } else {
            console.log(new Date() + ' -> Successfuly edited job');
            if (src == 'view') {
              res.redirect(`/index/view/${profile_id}`);
            }
            if (src == 'jobs') {
              res.redirect(`/index/viewjobs/${job_id}?profile=${profile_id}`);
            }
          }
        }
      );
    }
  });
});

module.exports = router;
