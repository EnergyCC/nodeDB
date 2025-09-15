# Troubleshooting Guide: Add/Edit Jobs Forms

## Common Issues and Solutions

### 1. Form Data Not Saving to Database

**Symptoms**:
- Form submits successfully but no data appears in database
- Redirect works but database remains unchanged
- No error messages displayed

**Causes and Solutions**:

#### A. Empty Values Not Being Filtered
**Problem**: Empty input fields are being processed as empty strings instead of being filtered out.

**Solution**: 
- Check `utils/dataProcessor.js` filtering logic
- Ensure `.filter(value => value && value.toString().trim() !== '')` is properly implemented
- Verify that empty values are not being sent to the database

#### B. Incorrect Field Names
**Problem**: Form field names don't match what the backend expects.

**Solution**:
- Verify all form fields use array notation (`[]`)
- Check that paired and triple fields have matching names
- Ensure JavaScript functions create fields with correct names

#### C. Data Processing Errors
**Problem**: Utility functions not processing data correctly.

**Solution**:
- Add console.log statements to see what data is being processed
- Check that `collectStructuredData`, `collectPairedData`, and `collectTripleData` are receiving correct parameters
- Verify that processed data is not empty arrays when it should contain values

### 2. Database Insert/Update Failures

**Symptoms**:
- Error messages about database queries
- Data not saved despite form submission
- Server errors in logs

**Causes and Solutions**:

#### A. SQL Query Parameter Mismatch
**Problem**: Number of parameters doesn't match number of placeholders in SQL query.

**Solution**:
- Count placeholders (`?`) in SQL query
- Count parameters in `queryParams` array
- Ensure both counts match exactly

#### B. Data Type Mismatches
**Problem**: Trying to insert string data into integer columns.

**Solution**:
- Check database schema with `DESCRIBE jobs`
- Ensure integer fields (`kilometri`, `tarif_ora`) receive numeric values
- Convert string values to numbers when necessary

#### C. JSON Serialization Issues
**Problem**: Arrays not properly converted to JSON strings.

**Solution**:
- Check that `prepareForStorage` function correctly converts arrays
- Verify that `JSON.stringify()` is called on all array data
- Ensure default empty arrays are used when data is missing

### 3. Form Display Issues

**Symptoms**:
- Form not showing default rows
- Existing data not populating in edit form
- JavaScript errors in browser console

**Causes and Solutions**:

#### A. JavaScript Initialization Problems
**Problem**: `addRows` or `populateData` functions not working correctly.

**Solution**:
- Check browser console for JavaScript errors
- Verify that `DOMContentLoaded` event is firing
- Ensure all container elements have correct IDs

#### B. Data Parsing Errors in Edit Form
**Problem**: JSON data not parsing correctly for display.

**Solution**:
- Check that `parseForDisplay` function correctly parses JSON strings
- Verify that database contains valid JSON strings
- Ensure template variables are passed correctly to JavaScript

### 4. Debugging Steps

#### Step 1: Enable Console Logging
Add comprehensive logging to see data flow:

```javascript
// In routes/add.js or edit.js
console.log('Received body:', req.body);
console.log('Body keys:', Object.keys(req.body));
console.log('Specific field:', req.body['lucrari_sol[]']);
```

#### Step 2: Check Data Processing
Add logging in dataProcessor.js:

```javascript
// In collectStructuredData
console.log('Processing prefix:', prefix);
console.log('Raw data:', body[`${prefix}[]`]);
console.log('Filtered result:', result[prefix]);
```

#### Step 3: Verify Database Queries
Add logging before database queries:

```javascript
// In routes
console.log('SQL Query:', sql);
console.log('Query Parameters:', queryParams);
```

#### Step 4: Test Database Connection
Create a simple test script:

```javascript
// test_db.js
const connection = require('./db');
connection.pool.query('SELECT * FROM jobs LIMIT 1', (err, result) => {
  if (err) throw err;
  console.log('Database connection working');
  console.log('Sample data:', result);
});
```

### 5. Testing Checklist

Before deploying changes, verify:

#### Form Functionality:
- [ ] Default rows are created on page load
- [ ] "Add Row" buttons work correctly
- [ ] Form submits without JavaScript errors
- [ ] All required fields are included in submission

#### Data Processing:
- [ ] Empty values are filtered out
- [ ] Paired and triple data is processed correctly
- [ ] Arrays are converted to JSON strings
- [ ] Default values are provided for missing data

#### Database Operations:
- [ ] SQL queries have matching parameters
- [ ] Data types match database schema
- [ ] INSERT operations work for new jobs
- [ ] UPDATE operations work for existing jobs

#### Error Handling:
- [ ] Database errors are caught and displayed
- [ ] Missing data is handled gracefully
- [ ] User is redirected appropriately on success
- [ ] Error messages are user-friendly

### 6. Common Debugging Commands

#### Check Database Schema:
```bash
node -e "const connection = require('./db'); connection.pool.query('DESCRIBE jobs', (err, result) => { if (err) throw err; console.log(result); });"
```

#### Test Form Data Processing:
```bash
# Create a test script to simulate form submission
node test_form_processing.js
```

#### Monitor Server Logs:
```bash
# Check for console.log output
npm start | grep -E "(Received body|Processed data|SQL Query)"
```

### 7. Performance Considerations

#### Large Forms:
- For forms with many rows, consider pagination or lazy loading
- Optimize database queries for large JSON data
- Use database indexing for frequently queried fields

#### Memory Usage:
- Monitor memory usage when processing large arrays
- Consider streaming for very large datasets
- Use efficient data structures for processing

By following this troubleshooting guide, you should be able to identify and resolve most issues with the add/edit jobs forms.