const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const checkAuthentication = require('./authentication');

// get and render delete route
router.get('/profile/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql = 'SELECT * FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
        if (err) {
          let error = err.sqlMessage;
          console.log(err.sqlMessage);
          res.render('errors', {
            error
          });
        } else {
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
router.get('/profile/:id/true', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let sql = 'DELETE FROM profile WHERE profile_id = ?;';
      connection.db.query(sql, req.params.id, (err, result) => {
        if (err) {
          let error = err.sqlMessage;
          console.log(err.sqlMessage);
          res.render('errors', {
            error
          });
        } else {
          console.log(new Date() + ' -> removed profile');
          res.redirect('/index');
        }
      });
    }
  });
});

// route to confirm job remove
router.get('/jobs/:id', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let profile_id = req.query.profile;
      let operatie = req.query.nume;
      let job_id = req.params.id;
      res.render('removejobs', {
        job_id,
        profile_id,
        operatie
      });
    }
  });
});

// route to remove jobs

router.get('/jobs/:id/true', checkAuthentication, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.redirect('/login');
    } else {
      let profile_id = req.query.profile;
      let job_id = req.params.id;
      let sql = 'DELETE FROM jobs WHERE job_id = ?';
      // console.log(`${profile_id} | ${jobID} | ${sql}`);
      connection.db.query(sql, job_id, (err, result) => {
        if (err) {
          console.log(err.sqlMessage);
          let error = err.sqlMessage;
          res.render('errors', {
            error
          });
        } else {
          res.redirect(`/index/view/${profile_id}`);
          console.log(`Successfully removed job with the id ${job_id}`);
        }
      });
    }
  });
});
module.exports = router;
