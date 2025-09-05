const express = require('express');
const router = express.Router();
const connection = require('../db');
const checkAuthentication = require('./authentication');
const { handleDatabaseError, handleValidationErrors } = require('../utils/errorHandler');

//Add edit route with data -> send it to app.handlebars
router.get('/profile/:id', checkAuthentication, (req, res) => {
  let sql = 'SELECT * FROM profile WHERE is_active = TRUE AND profile_id = ?;';
  connection.pool.query(sql, req.params.id, (err, result) => {
    if (err) {
      console.error(err);
      let error = err.sqlMessage || 'Database query error';
      return res.render('errors', {
        error
      });
    } else if (result.length === 0) {
      return res.render('errors', {
        error: 'Profile not found'
      });
    }
    
    let url = `/edit/profile/${req.params.id}`;
    let mth = 'POST';
    let nume_client = result[0].nume_client;
    let tip_auto = result[0].tip_auto;
    let nr_inmatriculare = result[0].nr_inmatriculare;
    let serie_caroserie = result[0].serie_caroserie;
    let serie_motor = result[0].serie_motor;
    let nr_tel = result[0].nr_tel;
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
  });
});

//Update profile data
router.post('/profile/:id', checkAuthentication, (req, res) => {
  let {
    nume_client,
    tip_auto,
    nr_inmatriculare,
    serie_caroserie,
    serie_motor,
    nr_tel
  } = req.body;
  
  // Validate profile ID
  const profileId = parseInt(req.params.id);
  if (isNaN(profileId) || profileId <= 0) {
    return res.render('errors', {
      error: 'ID profil invalid'
    });
  }
  
  // Field validation
  let errors = [];
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
    // Re-fetch the profile data to show in the form
    let sql = 'SELECT * FROM profile WHERE is_active = TRUE AND profile_id = ?;';
    connection.pool.query(sql, profileId, (err, result) => {
      if (err || result.length === 0) {
        console.error('Error fetching profile for edit form:', err);
        let error = 'Eroare la încărcarea datelor profilului';
        return res.render('errors', {
          error
        });
      }
      
      let url = `/edit/profile/${profileId}`;
      let mth = 'POST';
      return res.render('edit', {
        url,
        mth,
        errors,
        nume_client: nume_client || result[0].nume_client,
        tip_auto: tip_auto || result[0].tip_auto,
        nr_inmatriculare: nr_inmatriculare || result[0].nr_inmatriculare,
        serie_caroserie: serie_caroserie || result[0].serie_caroserie,
        serie_motor: serie_motor || result[0].serie_motor,
        nr_tel: nr_tel || result[0].nr_tel
      });
    });
    return;
  }
  
  let sql =
    'UPDATE profile SET nume_client = ?, tip_auto = ?, nr_inmatriculare = ?, serie_caroserie = ?, serie_motor = ?, nr_tel = ? WHERE profile_id = ?';

  connection.pool.query(
    sql,
    [
      nume_client.trim().toUpperCase(),
      tip_auto.trim().toUpperCase(),
      nr_inmatriculare.trim().toUpperCase(),
      serie_caroserie.trim().toUpperCase(),
      serie_motor.trim().toUpperCase(),
      nr_tel ? nr_tel.toString().trim() : '',
      profileId
    ],
    (err, result) => {
      if (err) {
        console.error('Database error during profile update:', err);
        let error = 'Eroare la actualizarea profilului. Vă rugăm încercați din nou.';
        res.render('errors', {
          error
        });
      } else {
        console.log(new Date() + ' -> Successfully updated database entry');
        res.redirect('/index');
      }
    }
  );
});

//Edit jobs route
router.get('/jobs/:id', checkAuthentication, (req, res) => {
  let profile_id = req.query.profile;
  let sql = 'SELECT * FROM jobs WHERE is_active = TRUE AND job_id = ?';
  connection.pool.query(sql, req.params.id, (err, jResult) => {
    if (err) {
      console.error(err);
      let error = err.sqlMessage || 'Database query error';
      return res.render('errors', {
        error
      });
    } else if (jResult.length === 0) {
      return res.render('errors', {
        error: 'Job not found'
      });
    }
    
    // Get profile data
    let pSql = 'SELECT * FROM profile WHERE is_active = TRUE AND profile_id = ?';
    connection.pool.query(pSql, profile_id, (err, pResult) => {
      if (err) {
        console.error(err);
        let error = err.sqlMessage || 'Database query error';
        return res.render('errors', {
          error
        });
      } else if (pResult.length === 0) {
        return res.render('errors', {
          error: 'Profile not found'
        });
      }
      
      // Parse the JSON data to pass to the template
      let lucrari_sol_parse = JSON.parse(jResult[0].lucrari_sol);
      let den_piesa_cl_parse = JSON.parse(jResult[0].den_piesa_cl);
      let buc_piesa_cl_parse = JSON.parse(jResult[0].buc_piesa_cl);
      let def_suplim_parse = JSON.parse(jResult[0].def_suplim);
      let denum_operatie_parse = JSON.parse(jResult[0].denum_operatie);
      let timp_operatie_parse = JSON.parse(jResult[0].timp_operatie);
      let denum_piesa_parse = JSON.parse(jResult[0].denum_piesa);
      let cant_piese_parse = JSON.parse(jResult[0].cant_piese);
      let pret_piesa_parse = JSON.parse(jResult[0].pret_piesa);
      
      // Filter out empty values from arrays
      function filterEmptyValues(arr) {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => item !== null && item !== undefined && item.toString().trim() !== '');
      }
      
      lucrari_sol_parse = filterEmptyValues(lucrari_sol_parse);
      den_piesa_cl_parse = filterEmptyValues(den_piesa_cl_parse);
      buc_piesa_cl_parse = filterEmptyValues(buc_piesa_cl_parse);
      def_suplim_parse = filterEmptyValues(def_suplim_parse);
      denum_operatie_parse = filterEmptyValues(denum_operatie_parse);
      timp_operatie_parse = filterEmptyValues(timp_operatie_parse);
      denum_piesa_parse = filterEmptyValues(denum_piesa_parse);
      cant_piese_parse = filterEmptyValues(cant_piese_parse);
      pret_piesa_parse = filterEmptyValues(pret_piesa_parse);
      
      let url = `/edit/jobs/${req.params.id}?profile=${profile_id}`;
      let mth = 'POST';
      let job_id = req.params.id;
      
      res.render('addjobs', {
        url,
        mth,
        profile_id,
        job_id,
        jResult,
        pResult,
        lucrari_sol_parse,
        den_piesa_cl_parse,
        buc_piesa_cl_parse,
        def_suplim_parse,
        denum_operatie_parse,
        timp_operatie_parse,
        denum_piesa_parse,
        cant_piese_parse,
        pret_piesa_parse,
        existingJobData: {
          termen_executie: jResult[0].termen_executie,
          kilometri: jResult[0].kilometri,
          tarif_ora: jResult[0].tarif_ora,
          tva_percent: jResult[0].tva_percent
        }
      });
    });
  });
});

//Update jobs data
router.post('/jobs/:id', checkAuthentication, (req, res) => {
  let profile_id = req.query.profile;
  
  // Validate profile ID
  const profileId = parseInt(profile_id);
  if (isNaN(profileId) || profileId <= 0) {
    return res.render('errors', {
      error: 'ID profil invalid'
    });
  }
  
  // Validate job ID
  const jobId = parseInt(req.params.id);
  if (isNaN(jobId) || jobId <= 0) {
    return res.render('errors', {
      error: 'ID job invalid'
    });
  }
  
  // Check specifically for the array fields we expect
  console.log('\n=== EXPECTED FIELDS CHECK ===');
  console.log('All body keys:', Object.keys(req.body));
  let {
    termen_executie,
    kilometri,
    tarif_ora,
    tva_percent
  } = req.body;
  
  // Process arrays like in simple.js - the correct way
  function processArrayField(body, fieldName) {
    // NOTE: Express bodyParser automatically removes [] suffix from field names
    const fieldKey = fieldName;  // Look for field WITHOUT [] suffix
    
    if (Array.isArray(body[fieldKey])) {
      // Filter out truly empty values (null, undefined, empty strings after trim)
      const filtered = body[fieldKey].filter(item => {
        if (item === null || item === undefined) return false;
        return item.toString().trim() !== '';
      });
      const result = JSON.stringify(filtered);
      return result;
    } else if (body[fieldKey] !== undefined && body[fieldKey] !== null) {
      // Single value case
      const value = body[fieldKey].toString().trim();
      const result = value !== '' ? JSON.stringify([value]) : JSON.stringify([]);
      return result;
    }
    const result = JSON.stringify([]);
    return result;
  }
  
  // Process paired arrays (like piese client)
  function processPairedArrays(body, field1, field2) {
    // NOTE: Express bodyParser automatically removes [] suffix from field names
    const key1 = field1;  // Look for field WITHOUT [] suffix
    const key2 = field2;  // Look for field WITHOUT [] suffix
    
    let arr1 = [];
    let arr2 = [];
    
    if (Array.isArray(body[key1]) && Array.isArray(body[key2])) {
      // Both are arrays
      const maxLength = Math.max(body[key1].length, body[key2].length);
      for (let i = 0; i < maxLength; i++) {
        const val1 = (body[key1][i] || '').toString().trim();
        const val2 = (body[key2][i] || '').toString().trim();
        arr1.push(val1);
        arr2.push(val2);
      }
    } else if (body[key1] !== undefined && body[key2] !== undefined) {
      // Both are single values
      const val1 = body[key1].toString().trim();
      const val2 = body[key2].toString().trim();
      arr1.push(val1);
      arr2.push(val2);
    }
    // If one exists and the other doesn't, we still need to handle it
    
    const result = [JSON.stringify(arr1), JSON.stringify(arr2)];
    return result;
  }
  
  // Process triple arrays (like piese materiale)
  function processTripleArrays(body, field1, field2, field3) {
    // NOTE: Express bodyParser automatically removes [] suffix from field names
    const key1 = field1;  // Look for field WITHOUT [] suffix
    const key2 = field2;  // Look for field WITHOUT [] suffix
    const key3 = field3;  // Look for field WITHOUT [] suffix
    
    let arr1 = [];
    let arr2 = [];
    let arr3 = [];
    
    if (Array.isArray(body[key1]) && Array.isArray(body[key2]) && Array.isArray(body[key3])) {
      // All are arrays
      const maxLength = Math.max(body[key1].length, body[key2].length, body[key3].length);
      for (let i = 0; i < maxLength; i++) {
        const val1 = (body[key1][i] || '').toString().trim();
        const val2 = (body[key2][i] || '').toString().trim();
        const val3 = (body[key3][i] || '').toString().trim();
        arr1.push(val1);
        arr2.push(val2);
        arr3.push(val3);
      }
    } else if (body[key1] !== undefined && body[key2] !== undefined && body[key3] !== undefined) {
      // All are single values
      const val1 = body[key1].toString().trim();
      const val2 = body[key2].toString().trim();
      const val3 = body[key3].toString().trim();
      arr1.push(val1);
      arr2.push(val2);
      arr3.push(val3);
    }
    
    const result = [JSON.stringify(arr1), JSON.stringify(arr2), JSON.stringify(arr3)];
    return result;
  }
  
  // Process all arrays correctly
  const lucrari_sol = processArrayField(req.body, 'lucrari_sol');
  const def_suplim = processArrayField(req.body, 'def_suplimentare');
  
  // Process paired arrays
  const [den_piesa_cl, buc_piesa_cl] = processPairedArrays(req.body, 'den_piesa_cl', 'buc_piesa_cl');
  const [denum_operatie, timp_operatie] = processPairedArrays(req.body, 'denum_operatie', 'timp_operatie');
  
  // Process triple arrays
  const [denum_piesa, cant_piese, pret_piesa] = processTripleArrays(req.body, 'denum_piesa', 'cant_piese', 'pret_piesa');
  
  // Set default VAT based on provided value or keep existing
  let effectiveVatPercent = tva_percent;
  if (tva_percent === undefined || tva_percent === null || tva_percent === '') {
    // If not provided, keep the existing value from the database
    // This will be handled by not updating the field if it's null
    effectiveVatPercent = null;
  } else {
    // Parse the VAT value if it's provided
    effectiveVatPercent = parseFloat(tva_percent);
  }
  
  let sql = 'UPDATE jobs SET lucrari_sol = ?, den_piesa_cl = ?, buc_piesa_cl = ?, def_suplim = ?, termen_executie = ?, denum_operatie = ?, timp_operatie = ?, tarif_ora = ?, denum_piesa = ?, cant_piese = ?, pret_piesa = ?, kilometri = ?' + 
            (effectiveVatPercent !== null ? ', tva_percent = ?' : '') + 
            ' WHERE job_id = ?';
  
  const queryParams = [
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
    kilometri || 0
  ];
  
  // Add VAT percent to query params only if it's not null
  if (effectiveVatPercent !== null) {
    queryParams.push(effectiveVatPercent);
  }
  
  queryParams.push(jobId);
  
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
        res.redirect(`/index/view/${profile_id}`);
      }
    }
  );
});

module.exports = router;