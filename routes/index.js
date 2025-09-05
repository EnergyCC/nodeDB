const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = require('../db');
const jwt = require('jsonwebtoken');
const checkAuthentication = require('./authentication');
const { handleDatabaseError, handleJsonError } = require('../utils/errorHandler');
const puppeteer = require('puppeteer');
const PDFDocument = require('pdfkit');
const fs = require('fs');

//temporary route to create profile and jobs tables

router.get('/createtables', checkAuthentication, (req, res) => {
  let sqlP =
    'CREATE TABLE IF NOT EXISTS profile(profile_id INT PRIMARY KEY AUTO_INCREMENT, nume_client VARCHAR(64), tip_auto VARCHAR(48), nr_inmatriculare VARCHAR(15), serie_caroserie VARCHAR(20), serie_motor VARCHAR(20), nr_tel INT)';
  let sqlJ =
    'CREATE TABLE IF NOT EXISTS jobs(job_id INT PRIMARY KEY AUTO_INCREMENT, data_adaugare DATE, lucrari_sol VARCHAR(512), den_piesa_cl VARCHAR(255), buc_piesa_cl VARCHAR(24), def_suplim VARCHAR(255), termen_executie VARCHAR(12), denum_operatie VARCHAR(512), timp_operatie VARCHAR(24), tarif_ora INT, denum_piesa VARCHAR(512), cant_piese VARCHAR(48), pret_piesa VARCHAR(48), profile_id INT, kilometri INT, FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON UPDATE CASCADE ON DELETE CASCADE)';
  connection.pool.query(sqlP, (err, results) => {
    if (err) console.log(err);
    else {
      connection.pool.query(sqlJ, (err, result) => {
        if (err) console.log(err);
        else {
          console.log('successful');
        }
      });
    }
  });
});

//create router for index

router.get('/', checkAuthentication, (req, res) => {
  let sql = `SELECT * FROM profile WHERE is_active = TRUE ORDER BY profile_id DESC LIMIT 50;`;
  connection.pool.query(sql, (err, results) => {
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
});

// Search function ↓
router.post('/', checkAuthentication, (req, res) => {
  let { searchQuery, searchParam, searchOrder } = req.body;

  // Validate inputs
  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.render('errors', {
      error: 'Invalid search query'
    });
  }

  // Validate searchParam to prevent SQL injection
  const allowedParams = ['nume_client', 'tip_auto', 'nr_inmatriculare', 'serie_caroserie', 'serie_motor'];
  if (!allowedParams.includes(searchParam)) {
    return res.render('errors', {
      error: 'Invalid search parameter'
    });
  }

  // Sanitize search query (remove potentially dangerous characters)
  const sanitizedQuery = searchQuery.trim().replace(/[%_\\\\]/g, '');
  if (sanitizedQuery.length === 0) {
    return res.render('errors', {
      error: 'Search query is empty after sanitization'
    });
  }

  let sql = `SELECT * FROM profile WHERE is_active = TRUE AND ${searchParam} LIKE ?`;
  connection.pool.query(sql, [`%${sanitizedQuery}%`], (err, results) => {
    if (err) {
      console.error('Database error during search:', err);
      let error = 'Search failed due to database error';
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
});

//Just raw(dog) data
router.get('/getdb', checkAuthentication, (req, res) => {
  let sql = 'SELECT * FROM profile WHERE is_active = TRUE LIMIT 50';
  connection.pool.query(sql, (err, results) => {
    if (err) {
      console.log(err.sqlMessage);
      res.status(500).send('Database query error');
    } else {
      res.json(results);
    }
  });
});

// create view route for jobs table

router.get('/view/:id', checkAuthentication, (req, res) => {
  let sql = 'SELECT * FROM profile WHERE is_active = TRUE AND profile_id = ?';
  let profile_id = req.params.id;
  connection.pool.query(sql, profile_id, (err, result) => {
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
      let serie_motor = result[0].serie_motor;
      let nr_tel = result[0].nr_tel;
      let jsql = `SELECT * FROM jobs WHERE is_active = TRUE AND profile_id =?`;
      connection.pool.query(jsql, profile_id, (err, results) => {
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
});

// get data for viewjobs to see all the jobs
router.get('/viewjobs/:id', checkAuthentication, (req, res) => {
  let sql = 'SELECT * FROM jobs WHERE is_active = TRUE AND job_id = ?';
  let job_id = req.params.id;
  let profile_id = req.query.profile;
  connection.pool.query(sql, job_id, (err, result) => {
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

      // Get profile data
      let pSql = 'SELECT * FROM profile WHERE profile_id = ?';
      connection.pool.query(pSql, profile_id, (err, pResult) => {
        if (err) {
          console.log(err.sqlMessage);
          let error = err.sqlMessage;
          res.render('errors', {
            error
          });
        } else {
          // Process data for display
          let lucrari_sol_data = JSON.parse(result[0].lucrari_sol);
          let den_piesa_cl_data = JSON.parse(result[0].den_piesa_cl);
          let buc_piesa_cl_data = JSON.parse(result[0].buc_piesa_cl);
          let defecte_data = JSON.parse(result[0].def_suplim);
          let lucrari_convenite_operatii = JSON.parse(result[0].denum_operatie);
          let lucrari_convenite_timp = JSON.parse(result[0].timp_operatie);
          let denum_piesa_data = JSON.parse(result[0].denum_piesa);
          let cant_piese_data = JSON.parse(result[0].cant_piese);
          let pret_piesa_data = JSON.parse(result[0].pret_piesa);

          // Create piese client data array
          let piese_client_data = [];
          for (let i = 0; i < Math.max(den_piesa_cl_data.length, buc_piesa_cl_data.length); i++) {
            piese_client_data.push({
              denumire: den_piesa_cl_data[i] || '',
              bucati: buc_piesa_cl_data[i] || ''
            });
          }

          // Create lucrari convenite data array
          let lucrari_convenite_data = [];
          let total_ore_operatie = 0;
          let total_cost_val = 0;
          for (let i = 0; i < Math.max(lucrari_convenite_operatii.length, lucrari_convenite_timp.length); i++) {
            let operatie = lucrari_convenite_operatii[i] || '';
            let timp = parseFloat(lucrari_convenite_timp[i]) || 0;
            let valoare = timp * result[0].tarif_ora;
            total_ore_operatie += timp;
            total_cost_val += valoare;
            lucrari_convenite_data.push({
              index: i + 1,
              operatie: operatie,
              timp: timp,
              valoare: valoare.toFixed(2)
            });
          }

          // Create piese materiale data array
          let piese_materiale_data = [];
          let total_materiale = 0;
          for (let i = 0; i < Math.max(denum_piesa_data.length, cant_piese_data.length, pret_piesa_data.length); i++) {
            let denumire = denum_piesa_data[i] || '';
            let cantitate = parseFloat(cant_piese_data[i]) || 0;
            let pret = parseFloat(pret_piesa_data[i]) || 0;
            let valoare = cantitate * pret;
            total_materiale += valoare;
            piese_materiale_data.push({
              index: i + 1,
              denumire: denumire,
              cantitate: cantitate,
              pret: pret,
              valoare: valoare.toFixed(2)
            });
          }

          // Calculate totals
          let total_manopera = total_cost_val;
          let total_plata = total_manopera + total_materiale;

          res.render('viewjobs', {
            result,
            pResult,
            profile_id,
            job_id,
            lucrari_sol_data,
            piese_client_data,
            defecte_data,
            lucrari_convenite_data,
            piese_materiale_data,
            total_ore_operatie: total_ore_operatie.toFixed(2),
            total_cost_val: total_cost_val.toFixed(2),
            total_materiale: total_materiale.toFixed(2),
            total_manopera: total_manopera.toFixed(2),
            total_plata: total_plata.toFixed(2)
          });
        }
      });
    }
  });
});

// gen raport
router.get('/raport/:id', checkAuthentication, (req, res) => {
  let job_id = req.params.id;
  let profile_id = req.query.profile;
  let pSql = 'SELECT * FROM profile WHERE profile_id = ?';
  let jSql = 'SELECT * FROM jobs WHERE job_id = ?';
  connection.pool.query(pSql, profile_id, (err, pResult) => {
    if (err) {
      console.log(err.sqlMessage);
      let error = err.sqlMessage;
      res.render('errors', { error });
    } else {
      connection.pool.query(jSql, job_id, (err, jResult) => {
        if (err) {
          console.log(err.sqlMessage);
          let error = err.sqlMessage;
          res.render('errors', { error });
        } else {
          // Process data dynamically based on actual content
          let lucrari_sol_data_raw = JSON.parse(jResult[0].lucrari_sol);
          let den_piesa_cl_data = JSON.parse(jResult[0].den_piesa_cl);
          let buc_piesa_cl_data = JSON.parse(jResult[0].buc_piesa_cl);
          let defecte_data = JSON.parse(jResult[0].def_suplim);
          let lucrari_convenite_operatii = JSON.parse(jResult[0].denum_operatie);
          let lucrari_convenite_timp = JSON.parse(jResult[0].timp_operatie);
          let denum_piesa_data = JSON.parse(jResult[0].denum_piesa);
          let cant_piese_data = JSON.parse(jResult[0].cant_piese);
          let pret_piesa_data = JSON.parse(jResult[0].pret_piesa);

          // Filter out empty values and add numbering for lucrari_sol_data
          let lucrari_sol_data = [];
          for (let i = 0; i < lucrari_sol_data_raw.length; i++) {
            if (lucrari_sol_data_raw[i] && lucrari_sol_data_raw[i].trim() !== '') {
              lucrari_sol_data.push((i + 1) + '. ' + lucrari_sol_data_raw[i]);
            }
          }
          den_piesa_cl_data = den_piesa_cl_data.filter(item => item && item.trim() !== '');
          buc_piesa_cl_data = buc_piesa_cl_data.filter(item => item && item.trim() !== '');
          defecte_data = defecte_data.filter(item => item && item.trim() !== '');
          
          // Ensure defecte_data has at least one empty item for default row
          if (defecte_data.length === 0) {
            defecte_data = [''];
          }
          
          lucrari_convenite_operatii = lucrari_convenite_operatii.filter(item => item && item.trim() !== '');
          lucrari_convenite_timp = lucrari_convenite_timp.filter(item => item && item.trim() !== '');
          denum_piesa_data = denum_piesa_data.filter(item => item && item.trim() !== '');
          cant_piese_data = cant_piese_data.filter(item => item && item.trim() !== '');
          pret_piesa_data = pret_piesa_data.filter(item => item && item.trim() !== '');

          // Create piese client data array
          let piese_client_data = [];
          const maxPieseClient = Math.max(den_piesa_cl_data.length, buc_piesa_cl_data.length);
          for (let i = 0; i < maxPieseClient; i++) {
            piese_client_data.push({
              denumire: den_piesa_cl_data[i] || '',
              bucati: buc_piesa_cl_data[i] || ''
            });
          }

          // Create lucrari convenite data array
          let lucrari_convenite_data = [];
          let total_ore_operatie = 0;
          let total_cost_val = 0;
          const maxLucrari = Math.max(lucrari_convenite_operatii.length, lucrari_convenite_timp.length);
          for (let i = 0; i < maxLucrari; i++) {
            let operatie = lucrari_convenite_operatii[i] || '';
            let timp = parseFloat(lucrari_convenite_timp[i]) || 0;
            let valoare = timp * jResult[0].tarif_ora;
            total_ore_operatie += timp;
            total_cost_val += valoare;
            lucrari_convenite_data.push({
              index: i + 1,
              operatie: operatie,
              timp: timp,
              valoare: valoare.toFixed(2)
            });
          }

          // Create piese materiale data array
          let piese_materiale_data = [];
          let total_materiale = 0;
          const maxPiese = Math.max(denum_piesa_data.length, cant_piese_data.length, pret_piesa_data.length);
          for (let i = 0; i < maxPiese; i++) {
            let denumire = denum_piesa_data[i] || '';
            let cantitate = parseFloat(cant_piese_data[i]) || 0;
            let pret = parseFloat(pret_piesa_data[i]) || 0;
            let valoare = cantitate * pret;
            total_materiale += valoare;
            piese_materiale_data.push({
              index: i + 1,
              denumire: denumire,
              cantitate: cantitate,
              pret: pret,
              valoare: valoare.toFixed(2)
            });
          }

          // Calculate totals
          let total_manopera = total_cost_val;
          
          let vatPercent = jResult[0].tva_percent;
          // If VAT percent is not set, determine the correct default based on job date
          if (vatPercent === null || vatPercent === undefined) {
            // VAT changed from 19% to 21% on 2025-08-01
            const vatChangeDate = new Date('2025-08-01');
            vatPercent = jResult[0].data_adaugare < vatChangeDate ? 19 : 21;
          }
          let vatMultiplier = 1 + (vatPercent / 100);
          
          let total_tva = (total_manopera + total_materiale) - ((total_manopera + total_materiale) / vatMultiplier);
          let total_plata_ftva = (total_manopera + total_materiale) - total_tva;
          let total_plata = total_manopera + total_materiale;

          res.render('raport', {
            layout: false,
            jResult,
            pResult,
            lucrari_sol_data,
            piese_client_data,
            defecte_data,
            lucrari_convenite_data,
            piese_materiale_data,
            total_ore_operatie: total_ore_operatie.toFixed(2),
            total_cost_val: total_cost_val.toFixed(2),
            total_materiale: total_materiale.toFixed(2),
            total_manopera: total_manopera.toFixed(2),
            total_tva: total_tva.toFixed(2),
            total_plata_ftva: total_plata_ftva.toFixed(2),
            total_plata: total_plata.toFixed(2)
          });
        }
      });
    }
  });
});

// Test PDF route with PDFKit
router.get('/test-pdfkit', checkAuthentication, async (req, res) => {
  try {
    // Create a document
    const doc = new PDFDocument();
    
    // Store PDF in memory
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.contentType('application/pdf');
      res.send(pdfBuffer);
    });
    
    // Add content to the PDF
    doc.fontSize(25).text('Test PDF', 100, 100);
    doc.fontSize(16).text('This is a test PDF generated with PDFKit.', 100, 150);
    
    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error in /test-pdfkit route:', error);
    res.status(500).send('Error generating PDF: ' + error.message);
  }
});

// Test PDF route
router.get('/test-pdf', checkAuthentication, async (req, res) => {
  let browser;
  try {
    console.log('Launching Puppeteer for test PDF...');
    
    // Launch Puppeteer with additional options for Windows
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    console.log('Puppeteer launched successfully');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    // Set simple HTML content
    await page.setContent('<h1>Test PDF</h1><p>This is a test PDF generated by Puppeteer.</p>', { waitUntil: 'domcontentloaded' });
    console.log('HTML content set successfully');
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    console.log('PDF generated successfully, buffer length:', pdfBuffer.length);
    
    // Close browser
    await browser.close();
    console.log('Browser closed');
    
    // Check if we have a valid PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF buffer is empty');
    }
    
    // Send PDF to client
    res.contentType('application/pdf');
    res.send(pdfBuffer);
    console.log('PDF sent to client');
  } catch (error) {
    console.error('Error in /test-pdf route:', error);
    // Close browser if it's still open
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed after error');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    // Send error response
    res.status(500).send('Error generating PDF: ' + error.message);
  }
});

router.get('/raport-pdf/:id', checkAuthentication, async (req, res) => {
  let job_id = req.params.id;
  
  console.log(`Received request for PDF: job_id=${job_id}`);
  
  // Validate parameter
  if (!job_id) {
    return res.status(400).send('Missing required parameter: job_id');
  }
  
  // First, get the job data to get the profile_id
  let jSql = 'SELECT * FROM jobs WHERE job_id = ?';
  
  try {
    console.log(`Fetching job data for job_id: ${job_id}`);
    
    const jResult = await new Promise((resolve, reject) => {
      connection.pool.query(jSql, [job_id], (err, result) => {
        if (err) {
          console.error('Error fetching job data:', err);
          reject(err);
        } else {
          console.log('Job data fetched successfully, rows:', result.length);
          resolve(result);
        }
      });
    });
    
    // Check if we have job data
    if (!jResult || jResult.length === 0) {
      throw new Error('No job data found for job_id: ' + job_id);
    }
    
    // Get profile_id from job data
    let profile_id = jResult[0].profile_id;
    console.log(`Found profile_id: ${profile_id} from job data`);
    
    // Now get the profile data
    let pSql = 'SELECT * FROM profile WHERE profile_id = ?';
    
    const pResult = await new Promise((resolve, reject) => {
      connection.pool.query(pSql, [profile_id], (err, result) => {
        if (err) {
          console.error('Error fetching profile data:', err);
          reject(err);
        } else {
          console.log('Profile data fetched successfully, rows:', result.length);
          resolve(result);
        }
      });
    });
    
    // Check if we have profile data
    if (!pResult || pResult.length === 0) {
      throw new Error('No profile data found for profile_id: ' + profile_id);
    }
    
    // Process data dynamically based on actual content
    let lucrari_sol_data = [];
    let den_piesa_cl_data = [];
    let buc_piesa_cl_data = [];
    let defecte_data = [];
    let lucrari_convenite_operatii = [];
    let lucrari_convenite_timp = [];
    let denum_piesa_data = [];
    let cant_piese_data = [];
    let pret_piesa_data = [];
    
    // Safely parse JSON data
    try {
      lucrari_sol_data = JSON.parse(jResult[0].lucrari_sol || '[]');
      den_piesa_cl_data = JSON.parse(jResult[0].den_piesa_cl || '[]');
      buc_piesa_cl_data = JSON.parse(jResult[0].buc_piesa_cl || '[]');
      defecte_data = JSON.parse(jResult[0].def_suplim || '[]');
      lucrari_convenite_operatii = JSON.parse(jResult[0].denum_operatie || '[]');
      lucrari_convenite_timp = JSON.parse(jResult[0].timp_operatie || '[]');
      denum_piesa_data = JSON.parse(jResult[0].denum_piesa || '[]');
      cant_piese_data = JSON.parse(jResult[0].cant_piese || '[]');
      pret_piesa_data = JSON.parse(jResult[0].pret_piesa || '[]');
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      // Use empty arrays as fallback
      lucrari_sol_data = [];
      den_piesa_cl_data = [];
      buc_piesa_cl_data = [];
      defecte_data = [];
      lucrari_convenite_operatii = [];
      lucrari_convenite_timp = [];
      denum_piesa_data = [];
      cant_piese_data = [];
      pret_piesa_data = [];
    }

    // Filter out empty values
    lucrari_sol_data = lucrari_sol_data.filter(item => item && item.trim() !== '');
    den_piesa_cl_data = den_piesa_cl_data.filter(item => item && item.trim() !== '');
    buc_piesa_cl_data = buc_piesa_cl_data.filter(item => item && item.trim() !== '');
    defecte_data = defecte_data.filter(item => item && item.trim() !== '');
    
    // Ensure defecte_data has at least one empty item for default row
    if (defecte_data.length === 0) {
      defecte_data = [''];
    }
    
    lucrari_convenite_operatii = lucrari_convenite_operatii.filter(item => item && item.trim() !== '');
    lucrari_convenite_timp = lucrari_convenite_timp.filter(item => item && item.trim() !== '');
    denum_piesa_data = denum_piesa_data.filter(item => item && item.trim() !== '');
    cant_piese_data = cant_piese_data.filter(item => item && item.trim() !== '');
    pret_piesa_data = pret_piesa_data.filter(item => item && item.trim() !== '');

    // Create piese client data array
    let piese_client_data = [];
    const maxPieseClient = Math.max(den_piesa_cl_data.length, buc_piesa_cl_data.length);
    for (let i = 0; i < maxPieseClient; i++) {
      piese_client_data.push({
        denumire: den_piesa_cl_data[i] || '',
        bucati: buc_piesa_cl_data[i] || ''
      });
    }

    // Create lucrari convenite data array
    let lucrari_convenite_data = [];
    let total_ore_operatie = 0;
    let total_cost_val = 0;
    const maxLucrari = Math.max(lucrari_convenite_operatii.length, lucrari_convenite_timp.length);
    for (let i = 0; i < maxLucrari; i++) {
      let operatie = lucrari_convenite_operatii[i] || '';
      let timp = parseFloat(lucrari_convenite_timp[i]) || 0;
      let valoare = timp * (jResult[0].tarif_ora || 0);
      total_ore_operatie += timp;
      total_cost_val += valoare;
      lucrari_convenite_data.push({
        index: i + 1,
        operatie: operatie,
        timp: timp,
        valoare: valoare.toFixed(2)
      });
    }

    // Create piese materiale data array
    let piese_materiale_data = [];
    let total_materiale = 0;
    const maxPiese = Math.max(denum_piesa_data.length, cant_piese_data.length, pret_piesa_data.length);
    for (let i = 0; i < maxPiese; i++) {
      let denumire = denum_piesa_data[i] || '';
      let cantitate = parseFloat(cant_piese_data[i]) || 0;
      let pret = parseFloat(pret_piesa_data[i]) || 0;
      let valoare = cantitate * pret;
      total_materiale += valoare;
      piese_materiale_data.push({
        index: i + 1,
        denumire: denumire,
        cantitate: cantitate,
        pret: pret,
        valoare: valoare.toFixed(2)
      });
    }

    // Calculate totals with toFixed(2)
    let total_manopera = total_cost_val;
    let total_tva = (total_manopera + total_materiale) / 1.21;
    let total_plata_ftva = (total_manopera + total_materiale) - total_tva;
    let total_plata = total_manopera + total_materiale;
    
    console.log('Data processing completed successfully');
    
    // Render the HTML report first
    const htmlContent = await new Promise((resolve, reject) => {
      res.render('raport-simple', {
        layout: false,
        jResult,
        pResult,
        lucrari_sol_data,
        piese_client_data,
        defecte_data,
        lucrari_convenite_data,
        piese_materiale_data,
        total_ore_operatie: total_ore_operatie.toFixed(2),
        total_cost_val: total_cost_val.toFixed(2),
        total_materiale: total_materiale.toFixed(2),
        total_manopera: total_manopera.toFixed(2),
        total_tva: total_tva.toFixed(2),
        total_plata_ftva: total_plata_ftva.toFixed(2),
        total_plata: total_plata.toFixed(2)
      }, (err, html) => {
        if (err) {
          console.error('Error rendering HTML report:', err);
          reject(err);
        } else {
          resolve(html);
        }
      });
    });
    
    // Generate PDF from HTML using Puppeteer - WORKING APPROACH
    console.log('Starting PDF generation with working approach...');
    
    try {
      // Launch Puppeteer with minimal configuration
      const browser = await puppeteer.launch({
        headless: true
      });
      
      const page = await browser.newPage();
      
      // Set content with longer timeout
      console.log('Setting HTML content...');
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0', 
        timeout: 60000 
      });
      console.log('HTML content set successfully');
      
      // Generate PDF
      console.log('Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true
      });
      console.log('PDF generated, size:', pdfBuffer.length);
      
      // Cleanup
      await browser.close();
      
      // Verify PDF
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF generation returned empty buffer');
      }
      
      if (pdfBuffer.length < 4 || !pdfBuffer.slice(0, 4).toString('ascii').startsWith('%PDF')) {
        // Save debug files
        const fs = require('fs');
        fs.writeFileSync('debug-failed.html', htmlContent);
        fs.writeFileSync('debug-failed.bin', pdfBuffer);
        throw new Error('Generated content is not a valid PDF');
      }
      
      // Send PDF with proper headers
      console.log('Sending PDF response...');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="raport-${job_id}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
      console.log('PDF sent successfully');
      
    } catch (pdfError) {
      console.error('PDF Generation Error:', pdfError);
      // Send error response
      res.status(500).json({ 
        error: 'PDF Generation Failed', 
        message: pdfError.message 
      });
    }
  } catch (error) {
    console.error('Error in /raport-pdf route:', error);
    res.status(500).send('Error generating PDF: ' + error.message);
  }
});

// Test route to debug HTML rendering
router.get('/test-html-simple/:id', checkAuthentication, async (req, res) => {
  let job_id = req.params.id;
  
  console.log(`Received request for HTML test: job_id=${job_id}`);
  
  // Validate parameter
  if (!job_id) {
    return res.status(400).send('Missing required parameter: job_id');
  }
  
  // First, get the job data to get the profile_id
  let jSql = 'SELECT * FROM jobs WHERE job_id = ?';
  
  try {
    console.log(`Fetching job data for job_id: ${job_id}`);
    
    const jResult = await new Promise((resolve, reject) => {
      connection.pool.query(jSql, [job_id], (err, result) => {
        if (err) {
          console.error('Error fetching job data:', err);
          reject(err);
        } else {
          console.log('Job data fetched successfully, rows:', result.length);
          resolve(result);
        }
      });
    });
    
    // Check if we have job data
    if (!jResult || jResult.length === 0) {
      throw new Error('No job data found for job_id: ' + job_id);
    }
    
    // Get profile_id from job data
    let profile_id = jResult[0].profile_id;
    console.log(`Found profile_id: ${profile_id} from job data`);
    
    // Now get the profile data
    let pSql = 'SELECT * FROM profile WHERE profile_id = ?';
    
    const pResult = await new Promise((resolve, reject) => {
      connection.pool.query(pSql, [profile_id], (err, result) => {
        if (err) {
          console.error('Error fetching profile data:', err);
          reject(err);
        } else {
          console.log('Profile data fetched successfully, rows:', result.length);
          resolve(result);
        }
      });
    });
    
    // Check if we have profile data
    if (!pResult || pResult.length === 0) {
      throw new Error('No profile data found for profile_id: ' + profile_id);
    }
    
    // Process data dynamically based on actual content
    let lucrari_sol_data = [];
    let den_piesa_cl_data = [];
    let buc_piesa_cl_data = [];
    let defecte_data = [];
    let lucrari_convenite_operatii = [];
    let lucrari_convenite_timp = [];
    let denum_piesa_data = [];
    let cant_piese_data = [];
    let pret_piesa_data = [];
    
    // Safely parse JSON data
    try {
      lucrari_sol_data = JSON.parse(jResult[0].lucrari_sol || '[]');
      den_piesa_cl_data = JSON.parse(jResult[0].den_piesa_cl || '[]');
      buc_piesa_cl_data = JSON.parse(jResult[0].buc_piesa_cl || '[]');
      defecte_data = JSON.parse(jResult[0].def_suplim || '[]');
      lucrari_convenite_operatii = JSON.parse(jResult[0].denum_operatie || '[]');
      lucrari_convenite_timp = JSON.parse(jResult[0].timp_operatie || '[]');
      denum_piesa_data = JSON.parse(jResult[0].denum_piesa || '[]');
      cant_piese_data = JSON.parse(jResult[0].cant_piese || '[]');
      pret_piesa_data = JSON.parse(jResult[0].pret_piesa || '[]');
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      // Use empty arrays as fallback
      lucrari_sol_data = [];
      den_piesa_cl_data = [];
      buc_piesa_cl_data = [];
      defecte_data = [];
      lucrari_convenite_operatii = [];
      lucrari_convenite_timp = [];
      denum_piesa_data = [];
      cant_piese_data = [];
      pret_piesa_data = [];
    }

    // Filter out empty values
    lucrari_sol_data = lucrari_sol_data.filter(item => item && item.trim() !== '');
    den_piesa_cl_data = den_piesa_cl_data.filter(item => item && item.trim() !== '');
    buc_piesa_cl_data = buc_piesa_cl_data.filter(item => item && item.trim() !== '');
    defecte_data = defecte_data.filter(item => item && item.trim() !== '');
    
    // Ensure defecte_data has at least one empty item for default row
    if (defecte_data.length === 0) {
      defecte_data = [''];
    }
    
    lucrari_convenite_operatii = lucrari_convenite_operatii.filter(item => item && item.trim() !== '');
    lucrari_convenite_timp = lucrari_convenite_timp.filter(item => item && item.trim() !== '');
    denum_piesa_data = denum_piesa_data.filter(item => item && item.trim() !== '');
    cant_piese_data = cant_piese_data.filter(item => item && item.trim() !== '');
    pret_piesa_data = pret_piesa_data.filter(item => item && item.trim() !== '');

    // Create piese client data array
    let piese_client_data = [];
    const maxPieseClient = Math.max(den_piesa_cl_data.length, buc_piesa_cl_data.length);
    for (let i = 0; i < maxPieseClient; i++) {
      piese_client_data.push({
        denumire: den_piesa_cl_data[i] || '',
        bucati: buc_piesa_cl_data[i] || ''
      });
    }

    // Create lucrari convenite data array
    let lucrari_convenite_data = [];
    let total_ore_operatie = 0;
    let total_cost_val = 0;
    const maxLucrari = Math.max(lucrari_convenite_operatii.length, lucrari_convenite_timp.length);
    for (let i = 0; i < maxLucrari; i++) {
      let operatie = lucrari_convenite_operatii[i] || '';
      let timp = parseFloat(lucrari_convenite_timp[i]) || 0;
      let valoare = timp * (jResult[0].tarif_ora || 0);
      total_ore_operatie += timp;
      total_cost_val += valoare;
      lucrari_convenite_data.push({
        index: i + 1,
        operatie: operatie,
        timp: timp,
        valoare: valoare.toFixed(2)
      });
    }

    // Create piese materiale data array
    let piese_materiale_data = [];
    let total_materiale = 0;
    const maxPiese = Math.max(denum_piesa_data.length, cant_piese_data.length, pret_piesa_data.length);
    for (let i = 0; i < maxPiese; i++) {
      let denumire = denum_piesa_data[i] || '';
      let cantitate = parseFloat(cant_piese_data[i]) || 0;
      let pret = parseFloat(pret_piesa_data[i]) || 0;
      let valoare = cantitate * pret;
      total_materiale += valoare;
      piese_materiale_data.push({
        index: i + 1,
        denumire: denumire,
        cantitate: cantitate,
        pret: pret,
        valoare: valoare.toFixed(2)
      });
    }

    // Calculate totals with toFixed(2)
    let total_manopera = total_cost_val;
    let total_tva = (total_manopera + total_materiale) / 1.21;
    let total_plata_ftva = (total_manopera + total_materiale) - total_tva;
    let total_plata = total_manopera + total_materiale;
    
    console.log('Data processing completed successfully');
    
    // Render the HTML report first
    res.render('raport-simple', {
      layout: false,
      jResult,
      pResult,
      lucrari_sol_data,
      piese_client_data,
      defecte_data,
      lucrari_convenite_data,
      piese_materiale_data,
      total_ore_operatie: total_ore_operatie.toFixed(2),
      total_cost_val: total_cost_val.toFixed(2),
      total_materiale: total_materiale.toFixed(2),
      total_manopera: total_manopera.toFixed(2),
      total_tva: total_tva.toFixed(2),
      total_plata_ftva: total_plata_ftva.toFixed(2),
      total_plata: total_plata.toFixed(2)
    });
  } catch (error) {
    console.error('Error in /test-html-simple route:', error);
    res.status(500).send('Error generating HTML: ' + error.message);
  }
});

module.exports = router;
