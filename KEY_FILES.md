# Key Files and Their Roles in Data Flow

## 1. Views (Client-Side Templates)

### `views/addjobs.handlebars`
**Role**: Main form for adding new jobs
**Key Features**:
- Dynamic row creation with JavaScript
- Array notation field names (`lucrari_sol[]`, `den_piesa_cl[]`, etc.)
- Default row initialization
- Form submission to backend route

### `views/editjobs.handlebars`
**Role**: Form for editing existing jobs
**Key Features**:
- Pre-population of existing data
- Dynamic row creation for additional fields
- Array notation field names
- Data parsing from backend to JavaScript

## 2. Routes (Server-Side Controllers)

### `routes/add.js`
**Role**: Handle adding new jobs
**Key Functions**:
- GET `/jobs/:id` - Render add jobs form with client data
- POST `/jobs/:id` - Process form submission and save to database
**Data Flow**:
```
Form Submit → collectStructuredData → collectPairedData → collectTripleData 
→ prepareForStorage → Database INSERT
```

### `routes/edit.js`
**Role**: Handle editing existing jobs
**Key Functions**:
- GET `/jobs/:id` - Retrieve job data and render edit form
- POST `/jobs/:id` - Process form submission and update database
**Data Flow**:
```
Form Submit → collectStructuredData → collectPairedData → collectTripleData 
→ prepareForStorage → Database UPDATE
```

## 3. Utilities (Data Processing)

### `utils/dataProcessor.js`
**Role**: Process and transform form data
**Key Functions**:

#### `collectStructuredData(body, prefixes)`
- Processes single array fields like `lucrari_sol[]`
- Filters out empty values
- Returns clean array of non-empty values

#### `collectPairedData(body, prefix1, prefix2)`
- Processes paired fields like `den_piesa_cl[]` and `buc_piesa_cl[]`
- Ensures both fields in pair are processed together
- Returns array of objects with paired data

#### `collectTripleData(body, prefix1, prefix2, prefix3)`
- Processes triple fields like `denum_piesa[]`, `cant_piese[]`, `pret_piesa[]`
- Ensures all three fields are processed together
- Returns array of objects with triple data

#### `prepareForStorage(collectedData)`
- Converts processed arrays to JSON strings for database storage
- Separates paired and triple data into individual arrays
- Provides default empty arrays when data is missing

#### `parseForDisplay(dbData)`
- Converts JSON strings from database back to arrays for display
- Combines related arrays back into paired/triple structures
- Used when retrieving data for edit forms or reports

## 4. Database Connection

### `db.js`
**Role**: Database connection pool configuration
**Key Features**:
- MySQL connection pool for performance
- Environment variable configuration
- Shared connection across application

## 5. Data Flow Summary

### Add Jobs Flow:
1. User accesses `/add/jobs/:id` → `routes/add.js` GET route
2. Template rendered with client data → `views/addjobs.handlebars`
3. User fills form and submits → Form data sent to backend
4. Form data processed by utility functions → `utils/dataProcessor.js`
5. Processed data prepared for storage → JSON strings created
6. Data inserted into database → MySQL INSERT query
7. User redirected to profile view

### Edit Jobs Flow:
1. User accesses `/edit/jobs/:id` → `routes/edit.js` GET route
2. Job data retrieved from database and parsed → `utils/dataProcessor.js`
3. Template rendered with existing data → `views/editjobs.handlebars`
4. User modifies form and submits → Form data sent to backend
5. Form data processed by utility functions → `utils/dataProcessor.js`
6. Processed data prepared for storage → JSON strings created
7. Data updated in database → MySQL UPDATE query
8. User redirected to profile view

## 6. Field Mapping

### Form Fields to Database Columns:

| Form Field Arrays | Database Columns | Data Type |
|-------------------|------------------|-----------|
| `lucrari_sol[]` | `lucrari_sol` | JSON string array |
| `def_suplimentare[]` | `def_suplim` | JSON string array |
| `den_piesa_cl[]` + `buc_piesa_cl[]` | `den_piesa_cl` + `buc_piesa_cl` | JSON string arrays |
| `denum_operatie[]` + `timp_operatie[]` | `denum_operatie` + `timp_operatie` | JSON string arrays |
| `denum_piesa[]` + `cant_piese[]` + `pret_piesa[]` | `denum_piesa` + `cant_piese` + `pret_piesa` | JSON string arrays |
| `termen_executie` | `termen_executie` | String |
| `kilometri` | `kilometri` | Integer |
| `tarif_ora` | `tarif_ora` | Integer |

## 7. Error Handling

All routes include proper error handling:
- Database query errors are caught and displayed
- Missing data is handled with default values
- Invalid data is filtered out during processing
- User-friendly error messages are shown

## 8. Security Considerations

- Authentication checks on all routes
- Data sanitization through trimming and filtering
- Parameterized SQL queries to prevent injection
- Environment variables for database credentials