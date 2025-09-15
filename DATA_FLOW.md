# Data Flow: Add Jobs Form Submission

This document explains the complete flow of data from form submission to database storage in the add jobs feature.

## 1. Form Initialization (Client-Side)

### Template Rendering
- File: `views/addjobs.handlebars`
- The template is rendered with client profile data passed from the backend
- Default empty rows are created for all form sections using JavaScript

### JavaScript Initialization
```javascript
// In addjobs.handlebars
document.addEventListener('DOMContentLoaded', function() {
    // Add default rows for each section
    addRows('lucrari_sol', 5);           // 5 rows for requested works
    addRows('piese_client', 5, true);    // 5 rows for client parts (2 columns)
    addRows('defecte', 2, true);         // 2 rows for defects (2 columns)
    addRows('lucrari_convenite', 5);     // 5 rows for agreed works
    addRows('piese_materiale', 5);       // 5 rows for materials
});
```

### Dynamic Row Creation
```javascript
function addRows(section, count, hasMultipleColumns = false) {
    // Creates input fields with array notation names like:
    // - lucrari_sol[]
    // - den_piesa_cl[] and buc_piesa_cl[] (paired)
    // - def_suplimentare[]
    // - denum_operatie[] and timp_operatie[] (paired)
    // - denum_piesa[], cant_piese[], pret_piesa[] (triplet)
}
```

## 2. Form Submission (Client-Side)

### Form Data Structure
When the form is submitted, the browser sends data in this format:
```
lucrari_sol[]: "Oil change"
lucrari_sol[]: "Brake inspection"
lucrari_sol[]: ""  // Empty field (will be filtered out)

den_piesa_cl[]: "Brake pads"
buc_piesa_cl[]: "2"
den_piesa_cl[]: ""
buc_piesa_cl[]: ""

def_suplimentare[]: "Worn tires"
def_suplimentare[]: ""

denum_operatie[]: "Oil change"
timp_operatie[]: "1.5"
denum_operatie[]: ""
timp_operatie[]: ""

denum_piesa[]: "Oil filter"
cant_piese[]: "1"
pret_piesa[]: "25.00"
denum_piesa[]: ""
cant_piese[]: ""
pret_piesa[]: ""

termen_executie: "2 days"
kilometri: "50000"
tarif_ora: "150"
```

## 3. Backend Route Handling (Server-Side)

### Route Definition
- File: `routes/add.js`
- Path: POST `/jobs/:id`

```javascript
router.post('/jobs/:id', checkAuthentication, (req, res) => {
    // req.body contains the form data
    // req.params.id contains the profile_id
});
```

### Data Collection
```javascript
// Collect structured data (single fields)
const lucrari_sol_data = collectStructuredData(req.body, ['lucrari_sol']);
const def_suplim_data = collectStructuredData(req.body, ['def_suplimentare']);

// Collect paired data (two related fields)
const piese_client_data = collectPairedData(req.body, 'den_piesa_cl', 'buc_piesa_cl');
const lucrari_convenite_data = collectPairedData(req.body, 'denum_operatie', 'timp_operatie');

// Collect triple data (three related fields)
const piese_materiale_data = collectTripleData(req.body, 'denum_piesa', 'cant_piese', 'pret_piesa');
```

## 4. Data Processing Utility (Server-Side)

### File: `utils/dataProcessor.js`

#### collectStructuredData Function
```javascript
function collectStructuredData(body, prefixes) {
    // Process fields like lucrari_sol[]
    prefixes.forEach(prefix => {
        if (Array.isArray(body[`${prefix}[]`])) {
            // Filter out empty values and whitespace-only strings
            result[prefix] = body[`${prefix}[]`].filter(value => value && value.toString().trim() !== '').map(value => value.toString().trim());
        } else if (body[`${prefix}[]`] !== undefined) {
            // Handle single value case
            const value = body[`${prefix}[]`];
            if (value && value.toString().trim() !== '') {
                result[prefix] = [value.toString().trim()];
            } else {
                result[prefix] = [];
            }
        }
        // Fallback for indexed fields (compatibility)
    });
    return result;
}
```

#### collectPairedData Function
```javascript
function collectPairedData(body, prefix1, prefix2) {
    // Process paired fields like den_piesa_cl[] and buc_piesa_cl[]
    if (Array.isArray(body[`${prefix1}[]`]) && Array.isArray(body[`${prefix2}[]`])) {
        const items = [];
        const maxLength = Math.max(body[`${prefix1}[]`].length, body[`${prefix2}[]`].length);
        
        for (let i = 0; i < maxLength; i++) {
            const value1 = body[`${prefix1}[]`][i];
            const value2 = body[`${prefix2}[]`][i];
            
            // Only add if at least one value is not empty
            if ((value1 && value1.toString().trim() !== '') || (value2 && value2.toString().trim() !== '')) {
                items.push({
                    [prefix1]: value1 ? value1.toString().trim() : '',
                    [prefix2]: value2 ? value2.toString().trim() : ''
                });
            }
        }
        return items;
    }
    // Handle single pair and fallback cases
}
```

#### collectTripleData Function
```javascript
function collectTripleData(body, prefix1, prefix2, prefix3) {
    // Process triple fields like denum_piesa[], cant_piese[], pret_piesa[]
    if (Array.isArray(body[`${prefix1}[]`]) && 
        Array.isArray(body[`${prefix2}[]`]) && 
        Array.isArray(body[`${prefix3}[]`])) {
        const items = [];
        const maxLength = Math.max(
            body[`${prefix1}[]`].length, 
            body[`${prefix2}[]`].length, 
            body[`${prefix3}[]`].length
        );
        
        for (let i = 0; i < maxLength; i++) {
            const value1 = body[`${prefix1}[]`][i];
            const value2 = body[`${prefix2}[]`][i];
            const value3 = body[`${prefix3}[]`][i];
            
            // Only add if at least one value is not empty
            if ((value1 && value1.toString().trim() !== '') || 
                (value2 && value2.toString().trim() !== '') || 
                (value3 && value3.toString().trim() !== '')) {
                items.push({
                    [prefix1]: value1 ? value1.toString().trim() : '',
                    [prefix2]: value2 ? value2.toString().trim() : '',
                    [prefix3]: value3 ? value3.toString().trim() : ''
                });
            }
        }
        return items;
    }
    // Handle single triple and fallback cases
}
```

## 5. Data Preparation for Storage (Server-Side)

### prepareForStorage Function
```javascript
function prepareForStorage(collectedData) {
    const storageData = {};
    
    // Handle simple arrays - convert to JSON strings
    if (collectedData.lucrari_sol) {
        storageData.lucrari_sol = JSON.stringify(collectedData.lucrari_sol);
    } else {
        storageData.lucrari_sol = JSON.stringify([]);
    }
    
    // Handle paired data - separate into individual arrays
    if (collectedData.piese_client) {
        storageData.den_piesa_cl = JSON.stringify(collectedData.piese_client.map(item => item.den_piesa_cl || ''));
        storageData.buc_piesa_cl = JSON.stringify(collectedData.piese_client.map(item => item.buc_piesa_cl || ''));
    } else {
        storageData.den_piesa_cl = JSON.stringify([]);
        storageData.buc_piesa_cl = JSON.stringify([]);
    }
    
    // Handle triple data - separate into individual arrays
    if (collectedData.piese_materiale) {
        storageData.denum_piesa = JSON.stringify(collectedData.piese_materiale.map(item => item.denum_piesa || ''));
        storageData.cant_piese = JSON.stringify(collectedData.piese_materiale.map(item => item.cant_piese || ''));
        storageData.pret_piesa = JSON.stringify(collectedData.piese_materiale.map(item => item.pret_piesa || ''));
    } else {
        storageData.denum_piesa = JSON.stringify([]);
        storageData.cant_piese = JSON.stringify([]);
        storageData.pret_piesa = JSON.stringify([]);
    }
    
    return storageData;
}
```

## 6. Database Storage (Server-Side)

### SQL Query Construction
```javascript
// In routes/add.js
let sql = 'INSERT INTO jobs(data_adaugare, lucrari_sol, den_piesa_cl, buc_piesa_cl, def_suplim, termen_executie, denum_operatie, timp_operatie, tarif_ora, denum_piesa, cant_piese, pret_piesa, profile_id, kilometri) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

const queryParams = [
    data,                           // Current date
    storageData.lucrari_sol,        // JSON string of requested works
    storageData.den_piesa_cl,       // JSON string of client part names
    storageData.buc_piesa_cl,       // JSON string of client part quantities
    storageData.def_suplim,         // JSON string of additional defects
    termen_executie || '',          // Estimated completion time
    storageData.denum_operatie,     // JSON string of operation names
    storageData.timp_operatie,      // JSON string of operation times
    tarif_ora || 0,                 // Hourly rate
    storageData.denum_piesa,        // JSON string of material part names
    storageData.cant_piese,         // JSON string of material part quantities
    storageData.pret_piesa,         // JSON string of material part prices
    profile_id,                     // Client profile ID
    kilometri || 0                  // Kilometers
];
```

### Database Execution
```javascript
connection.pool.query(sql, queryParams, (err, result) => {
    if (err) {
        // Handle database error
        console.error(err);
        let error = err.sqlMessage || 'Database query error';
        res.render('errors', { error });
    } else {
        // Success - redirect to profile view
        console.log(new Date() + ' -> Added job');
        res.redirect(`/index/view/${profile_id}`);
    }
});
```

## 7. Data Retrieval for Edit Form (Server-Side)

### Route Definition
- File: `routes/edit.js`
- Path: GET `/jobs/:id`

```javascript
router.get('/jobs/:id', checkAuthentication, (req, res) => {
    // Retrieve job data from database
    let sql = 'SELECT * FROM jobs WHERE job_id = ?';
    connection.pool.query(sql, req.params.id, (err, jResult) => {
        // Parse JSON data back to arrays for template
        let lucrari_sol_parse = JSON.parse(jResult[0].lucrari_sol);
        let den_piesa_cl_parse = JSON.parse(jResult[0].den_piesa_cl);
        // ... parse other fields
        
        // Pass parsed data to template
        res.render('editjobs', {
            jResult,
            lucrari_sol_parse,
            den_piesa_cl_parse,
            // ... other parsed data
        });
    });
});
```

### Template Data Population
```javascript
// In editjobs.handlebars
function populateData() {
    // Populate existing data into form fields
    if (typeof lucrari_sol_parse !== 'undefined' && Array.isArray(lucrari_sol_parse)) {
        lucrari_sol_parse.forEach((value, index) => {
            if (value) {
                // Create input field with existing value
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <input type="text" class="form-control" name="lucrari_sol[]" 
                               value="${value}" placeholder="Lucrare solicitata">
                    </td>
                `;
                container.appendChild(row);
            }
        });
    }
    // ... populate other sections
}
```

## 8. Edit Form Submission (Server-Side)

### Route Definition
- File: `routes/edit.js`
- Path: POST `/jobs/:id`

The flow is similar to the add form, but uses an UPDATE query instead of INSERT:

```javascript
let sql = 'UPDATE jobs SET lucrari_sol = ?, den_piesa_cl = ?, buc_piesa_cl = ?, def_suplim = ?, termen_executie = ?, denum_operatie = ?, timp_operatie = ?, tarif_ora = ?, denum_piesa = ?, cant_piese = ?, pret_piesa = ?, kilometri = ? WHERE job_id = ?';
```

## Key Points:

1. **Array Notation**: Form fields use `[]` suffix to allow multiple values with the same name
2. **Data Filtering**: Empty values are filtered out during processing
3. **JSON Storage**: Arrays are stored as JSON strings in the database
4. **Bidirectional Conversion**: Data is converted to JSON for storage and parsed back to arrays for display
5. **Error Handling**: Proper error handling at each step with fallbacks
6. **Default Values**: Default empty arrays and values are provided when data is missing

This flow ensures that form data is properly collected, processed, stored, and retrieved for both adding and editing jobs.