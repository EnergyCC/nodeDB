const express = require('express');
const router = express.Router();
const connection = require('../db');
const checkAuthentication = require('./authentication');
const { processArrayField, processPairedArrays, processTripleArrays } = require('../utils/arrayProcessor');

// Simple route for testing array handling
router.post('/jobs-simple/:id', checkAuthentication, (req, res) => {
  console.log('=== SIMPLE JOB ROUTE ===');
  console.log('Received body:', req.body);
  console.log('Body keys:', Object.keys(req.body));
  
  // Process arrays using the new utility functions
  const lucrari_sol = processArrayField(req.body, 'lucrari_sol');
  const def_suplimentare = processArrayField(req.body, 'def_suplimentare');
  
  // Process paired arrays
  const [den_piesa_cl, buc_piesa_cl] = processPairedArrays(req.body, 'den_piesa_cl', 'buc_piesa_cl');
  const [denum_operatie, timp_operatie] = processPairedArrays(req.body, 'denum_operatie', 'timp_operatie');
  
  // Process triple arrays
  const [denum_piesa, cant_piese, pret_piesa] = processTripleArrays(req.body, 'denum_piesa', 'cant_piese', 'pret_piesa');
  
  // Log processed arrays
  console.log('Processed lucrari_sol:', lucrari_sol);
  console.log('Processed def_suplimentare:', def_suplimentare);
  console.log('Processed den_piesa_cl:', den_piesa_cl);
  console.log('Processed buc_piesa_cl:', buc_piesa_cl);
  console.log('Processed denum_operatie:', denum_operatie);
  console.log('Processed timp_operatie:', timp_operatie);
  console.log('Processed denum_piesa:', denum_piesa);
  console.log('Processed cant_piese:', cant_piese);
  console.log('Processed pret_piesa:', pret_piesa);
  
  // Send a simple response
  res.send(`
    <h1>Job Data Received</h1>
    <p>Check console for detailed logs</p>
    <a href="/index">Back to Index</a>
  `);
});

module.exports = router;