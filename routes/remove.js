const express = require('express');
const router = express.Router();
const connection = require('../db');
const checkAuthentication = require('./authentication');

// get and render delete route for profile
router.get('/profile/:id', checkAuthentication, (req, res) => {
  let sql = 'SELECT * FROM profile WHERE is_active = TRUE AND profile_id = ?;';
  connection.pool.query(sql, req.params.id, (err, result) => {
    if (err) {
      console.error(err);
      let error = err.sqlMessage || 'Database query error';
      res.render('errors', {
        error
      });
    } else if (result.length === 0) {
      return res.render('errors', {
        error: 'Profile not found'
      });
    } else {
      let url = `/remove/profile/${req.params.id}`;
      let mth = 'POST';
      let nume_client = result[0].nume_client;
      let tip_auto = result[0].tip_auto;
      let nr_inmatriculare = result[0].nr_inmatriculare;
      let serie_caroserie = result[0].serie_caroserie;
      let serie_motor = result[0].serie_motor;
      let nr_tel = result[0].nr_tel;
      res.render('remove', {
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
});

// delete profile
router.post('/profile/:id', checkAuthentication, (req, res) => {
  let sql = 'UPDATE profile SET is_active = FALSE WHERE profile_id = ?';
  connection.pool.query(sql, req.params.id, (err, result) => {
    if (err) {
      console.error(err);
      let error = err.sqlMessage || 'Database query error';
      res.render('errors', {
        error
      });
    } else {
      console.log(new Date() + ' -> Successfully marked profile as inactive');
      res.redirect('/index');
    }
  });
});

// get and render delete route for job
router.get('/job/:id', checkAuthentication, (req, res) => {
  let profile_id = req.query.profile;
  let sql = 'SELECT * FROM jobs WHERE is_active = TRUE AND job_id = ?';
  connection.pool.query(sql, req.params.id, (err, result) => {
    if (err) {
      console.error(err);
      let error = err.sqlMessage || 'Database query error';
      res.render('errors', {
        error
      });
    } else if (result.length === 0) {
      return res.render('errors', {
        error: 'Job not found'
      });
    } else {
      let url = `/remove/job/${req.params.id}?profile=${profile_id}`;
      let operatie = 'Lucrare'; // You might want to extract a specific operation name here
      res.render('removejobs', {
        url,
        profile_id,
        operatie
      });
    }
  });
});

// delete job
router.post('/job/:id', checkAuthentication, (req, res) => {
  let profile_id = req.query.profile;
  let sql = 'UPDATE jobs SET is_active = FALSE WHERE job_id = ?';
  connection.pool.query(sql, req.params.id, (err, result) => {
    if (err) {
      console.error(err);
      let error = err.sqlMessage || 'Database query error';
      res.render('errors', {
        error
      });
    } else {
      console.log(new Date() + ' -> Successfully marked job as inactive');
      res.redirect(`/index/view/${profile_id}`);
    }
  });
});

module.exports = router;