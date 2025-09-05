const express = require('express');
const router = express.Router();
const connection = require('../db');
const checkAuthentication = require('./authentication');
const { handleDatabaseError, handleValidationErrors } = require('../utils/errorHandler');
const { processArrayField, processPairedArrays, processTripleArrays } = require('../utils/arrayProcessor');

// route for add form
router.get('/profile', checkAuthentication, (req, res) => {
  let url = '/add/profile';
  let mth = 'POST';
  res.render('add', {
    url,
    mth
  });
});

// router post for the data post, always 5 data entries for profiles
router.post('/profile', checkAuthentication, (req, res) => {
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
  let errors = [];

  // field validation
  if (!nume_client || typeof nume_client !== 'string' || nume_client.trim().length === 0) {
    errors.push({ text: 'Nu ai introdus un nume client' });
  }
  if (!tip_auto || typeof tip_auto !== 'string' || tip_auto.trim().length === 0) {
    errors.push({ text: 'Nu ai introdus un tip auto' });
  }
  if (!nr_inmatriculare || typeof nr_inmatriculare !== 'string' || nr_inmatriculare.trim().length === 0) {
    errors.push({ text: 'Nu ai introdus un numar de inmatriculare' });
  }
  if (!serie_caroserie || typeof serie_caroserie !== 'string' || serie_caroserie.trim().length === 0) {
    errors.push({ text: 'Nu ai introdus o serie de caroserie' });
  }
  if (!serie_motor || typeof serie_motor !== 'string' || serie_motor.trim().length === 0) {
    errors.push({ text: 'Nu ai introdus o serie de motor' });
  }

  // Additional validation for phone number
  if (nr_tel && (typeof nr_tel !== 'string' && typeof nr_tel !== 'number')) {
    errors.push({ text: 'Numarul de telefon este invalid' });
  }

  if (errors.length > 0) {
    let url = '/add/profile';
    let mth = 'POST';
    return res.render('add', {
      url,
      mth,
      errors,
      nume_client: nume_client || '',
      tip_auto: tip_auto || '',
      nr_inmatriculare: nr_inmatriculare || '',
      serie_caroserie: serie_caroserie || '',
      serie_motor: serie_motor || '',
      nr_tel: nr_tel || ''
    });
  }

  connection.pool.query(
    sql,
    [
      nume_client.trim().toUpperCase(),
      tip_auto.trim().toUpperCase(),
      nr_inmatriculare.trim().toUpperCase(),
      serie_caroserie.trim().toUpperCase(),
      serie_motor.trim().toUpperCase(),
      nr_tel ? nr_tel.toString().trim() : ''
    ],
    (err, result) => {
      if (err) {
        console.error('Database error during profile creation:', err);
        let error = 'Eroare la crearea profilului. Vă rugăm încercați din nou.';
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
});

// route to render the form for adding jobs
router.get('/jobs/:id', checkAuthentication, (req, res) => {
  let profile_id = req.params.id;
  let url = `/add/jobs/${profile_id}`;
  let mth = 'POST';
  
  // Get profile data to display in the form
  let sql = 'SELECT * FROM profile WHERE is_active = TRUE AND profile_id = ?';
  
  connection.pool.query(sql, profile_id, (err, profileResult) => {
    if (err) {
      console.error(err);
      let error = err.sqlMessage || 'Database query error';
      return res.render('errors', {
        error
      });
    } else if (profileResult.length === 0) {
      return res.render('errors', {
        error: 'Profile not found'
      });
    }
    
    // Get the last tarif_ora value from the jobs table
    let tarifSql = 'SELECT tarif_ora FROM jobs ORDER BY job_id DESC LIMIT 1';
    
    connection.pool.query(tarifSql, (err, tarifResult) => {
      if (err) {
        console.error('Error fetching last tarif_ora:', err);
        // Default to 150 if there's an error
        res.render('addjobs', {
          url,
          mth,
          profile_id,
          pResult: profileResult,
          lastTarifOra: 150
        });
      } else {
        // Use the last tarif_ora value or default to 150 if no jobs exist
        const lastTarifOra = tarifResult.length > 0 ? tarifResult[0].tarif_ora : 150;
        
        res.render('addjobs', {
          url,
          mth,
          profile_id,
          pResult: profileResult,
          lastTarifOra: lastTarifOra
        });
      }
    });
  });
});

// post route to add the job data
router.post('/jobs/:id', checkAuthentication, (req, res) => {
  
  let {
    termen_executie,
    kilometri,
    tarif_ora,
    tva_percent
  } = req.body;
  
  // Process all arrays correctly using the new utility functions
  const lucrari_sol = processArrayField(req.body, 'lucrari_sol');
  const def_suplim = processArrayField(req.body, 'def_suplimentare');
  
  // Process paired arrays
  const [den_piesa_cl, buc_piesa_cl] = processPairedArrays(req.body, 'den_piesa_cl', 'buc_piesa_cl');
  const [denum_operatie, timp_operatie] = processPairedArrays(req.body, 'denum_operatie', 'timp_operatie');
  
  // Process triple arrays
  const [denum_piesa, cant_piese, pret_piesa] = processTripleArrays(req.body, 'denum_piesa', 'cant_piese', 'pret_piesa');
  
  console.log('=== PROCESSED ARRAYS ===');
  console.log('lucrari_sol:', lucrari_sol);
  console.log('def_suplim:', def_suplim);
  console.log('den_piesa_cl:', den_piesa_cl);
  console.log('buc_piesa_cl:', buc_piesa_cl);
  console.log('denum_operatie:', denum_operatie);
  console.log('timp_operatie:', timp_operatie);
  console.log('denum_piesa:', denum_piesa);
  console.log('cant_piese:', cant_piese);
  console.log('pret_piesa:', pret_piesa);
  
  let profile_id = req.params.id;
  const data = new Date();
  
  // Set default VAT based on job date if not provided
  let effectiveVatPercent = tva_percent;
  if (tva_percent === undefined || tva_percent === null || tva_percent === '') {
    // VAT changed from 19% to 21% on 2025-08-01
    const vatChangeDate = new Date('2025-08-01');
    effectiveVatPercent = data < vatChangeDate ? 19 : 21;
  } else {
    // Parse the VAT value if it's provided
    effectiveVatPercent = parseFloat(tva_percent);
  }
  
  let sql =
    'INSERT INTO jobs(data_adaugare, lucrari_sol, den_piesa_cl, buc_piesa_cl, def_suplim, termen_executie, denum_operatie, timp_operatie, tarif_ora, denum_piesa, cant_piese, pret_piesa, profile_id, kilometri, tva_percent) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
  const queryParams = [
    data,
    lucrari_sol,
    den_piesa_cl,
    buc_piesa_cl,
    def_suplim,
    termen_executie || '',
    denum_operatie,
    timp_operatie,
    tarif_ora || 0,
    denum_piesa,
    cant_piese,
    pret_piesa,
    profile_id,
    kilometri || 0,
    effectiveVatPercent
  ];
  
  
  connection.pool.query(
    sql,
    queryParams,
    (err, result) => {
      if (err) {
        let error = err.sqlMessage || 'Database query error';
        res.render('errors', {
          error
        });
      } else {
        console.log(new Date() + ' -> Added job');
        res.redirect(`/index/view/${profile_id}`);
      }
    }
  );
});

module.exports = router;