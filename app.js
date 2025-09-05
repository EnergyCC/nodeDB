const mysql = require('mysql');
const connection = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Test database connection
connection.pool.getConnection((err, conn) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log(new Date() + ' -> Connection successfully made');
    conn.release();
  }
});

const app = express();

// Middleware to capture client IP
app.use((req, res, next) => {
  // Get the client's IP address
  const clientIP = req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // Store the IP in the request object for later use
  req.clientIP = clientIP;

  // Log the IP address
  console.log(`Client IP: ${clientIP} - ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);

  next();
});

// Create handlebars options
const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    parseDen: function (value) {
      try {
        if (!value) return '';
        let parse = JSON.parse(value);
        if (!Array.isArray(parse) || parse.length === 0) return '';
        return parse[0].charAt(0).toUpperCase() + parse[0].slice(1).toLowerCase();
      } catch (e) {
        console.error('Error parsing value in parseDen helper:', e);
        return '';
      }
    },
    parseData: function (value) {
      if (!value) return '';
      return value.toLocaleDateString('en-GB');
    },
    firstUpper: function (string) {
      if (string === undefined || string === null) {
        return ' ';
      } else {
        return string.toString().toUpperCase();
      }
    },
    tableRes: function (str, val) {
      try {
        if (!str) return ' ';
        let result = JSON.parse(str)[val];
        if (result === undefined || result === null) {
          return ' ';
        } else {
          return result.toString().toUpperCase();
        }
      } catch (e) {
        console.error('Error parsing value in tableRes helper:', e);
        return ' ';
      }
    },
    ifEx: function (str, val) {
      if (str === null || str === undefined) {
        return ' ';
      } else {
        try {
          if (!str) return ' ';
          let result = JSON.parse(str)[val];
          if (!result) return ' ';
          return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
        } catch (e) {
          console.error('Error parsing value in ifEx helper:', e);
          return ' ';
        }
      }
    },
    currentYear: function () {
      return new Date().getFullYear();
    },
    currentDate: function () {
      return new Date().toLocaleDateString('ro-RO');
    },
    or: function (a, b) {
      return a || b;
    },
    json: function (context) {
      return JSON.stringify(context);
    },
    // Helper functions for raport template
    range: function(start, end) {
      var result = [];
      for (var i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    },
    max: function(a, b) {
      return Math.max(a, b);
    },
    subtract: function(a, b) {
      return a - b;
    }
  }
});

// Set handlebars engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Set body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// IP logging middleware
app.use((req, res, next) => {
  // Skip logging for static files and favicon
  if (req.url.startsWith('/css/') || req.url.startsWith('/js/') || req.url.startsWith('/favicon')) {
    return next();
  }

  // Log the IP address for all requests
  const userAgent = req.get('User-Agent') || 'Unknown';
  const action = `${req.method} ${req.originalUrl}`;

  // Insert into database (non-blocking)
  const sql = 'INSERT INTO ip_logs (ip_address, user_agent, action) VALUES (?, ?, ?)';
  connection.pool.query(sql, [req.clientIP, userAgent, action], (err, result) => {
    if (err) {
      // Don't block the request if logging fails
      console.error('Error logging IP:', err);
    }
  });

  next();
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/index');
});

// Index routes
app.use('/index', require('./routes/index'));

// Sales route
app.use('/sales', require('./routes/sales'));

// Simple route
app.use('/simple', require('./routes/simple'));
app.use('/simple-pdf', require('./routes/simple-pdf'));
app.use('/pdf', require('./routes/pdf-simple'));
app.use('/working-pdf', require('./routes/working-pdf'));

// Add route
app.use('/add', require('./routes/add'));
app.use('/remove', require('./routes/remove'));
app.use('/edit', require('./routes/edit'));

// IP logs route
app.use('/logs', require('./routes/ip-logs'));

// Debug route
// app.use('/debug', require('./debug_endpoint'));

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

// Serve the manifest file for PWA
app.get('/manifest.json', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Serve the service-worker
app.get('/service-worker.js', (req, res) => {
  res.header('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, 'service-worker.js'));
});

// Post login route
app.post('/login', (req, res) => {
  let sql = 'SELECT password FROM users WHERE username=?';
  let { username, password } = req.body;
  let errors = [];

  // Basic input validation
  if (!username || !password) {
    errors.push({ text: 'Vă rugăm introduceți utilizatorul și parola.' });
    return res.render('login', {
      errors,
      username
    });
  }

  // Retrieves password from input users
  connection.pool.query(sql, [username], (err, result) => {
    if (err) {
      console.error('Database error during login:', err);
      errors.push({ text: 'A apărut o eroare. Vă rugăm încercați din nou.' });
      return res.render('login', {
        errors
      });
    } else {
      // If user exists and passwords match -> login = true
      if (result.length !== 0 && result[0].password === password) {
        // Validate JWT secret is configured
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.error('JWT_SECRET is not configured');
          errors.push({ text: 'Eroare de configurare server. Contactați administratorul.' });
          return res.render('login', {
            errors
          });
        }

        // Get the token, set expiration date on token btw
        jwt.sign(
          { username },
          jwtSecret,
          { expiresIn: '2h' },
          (err, token) => {
            if (err) {
              console.error('JWT signing error:', err);
              errors.push({ text: 'A apărut o eroare. Vă rugăm încercați din nou.' });
              res.render('login', {
                errors
              });
            } else {
              // Send cookie
              const isProduction = process.env.NODE_ENV === 'production';
              res.cookie('authorization', token, {
                maxAge: 7200000, // 2 hours
                httpOnly: true,
                secure: isProduction, // Only in production
                sameSite: 'strict'
              });
              res.redirect('/index');
              console.log(
                'Successful login from: ' + req.clientIP
              );
            }
          }
        );
      }
      // Response in case user and password is wrong
      else {
        console.log('Unsuccessful login from: ' + req.clientIP);
        errors.push({ text: 'Utilizator sau parola greșite' });
        res.render('login', {
          errors,
          username
        });
      }
    }
  });
});

// Create IP logs table route
app.get('/create-ip-logs-table', (req, res) => {
  let sql = `CREATE TABLE IF NOT EXISTS ip_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(255)
  )`;

  connection.pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error creating IP log table:', err);
      res.status(500).send('Failed to create IP log table');
    } else {
      console.log('IP log table created successfully');
      res.send('IP log table created successfully');
    }
  });
});

// Create database tables route
app.get('/create-tables', (req, res) => {
  // SQL statements to create tables with proper schema
  const createProfileTable = `
    CREATE TABLE IF NOT EXISTS profile (
      profile_id INT PRIMARY KEY AUTO_INCREMENT,
      nume_client VARCHAR(64) NOT NULL,
      tip_auto VARCHAR(48) NOT NULL,
      nr_inmatriculare VARCHAR(15) NOT NULL,
      serie_caroserie VARCHAR(20) NOT NULL,
      serie_motor VARCHAR(20) NOT NULL,
      nr_tel VARCHAR(12) NULL,
      is_active TINYINT(1) NULL DEFAULT 1,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_is_active (is_active)
    )
  `;
  
  const createJobsTable = `
    CREATE TABLE IF NOT EXISTS jobs (
      job_id INT PRIMARY KEY AUTO_INCREMENT,
      data_adaugare DATE NULL,
      lucrari_sol VARCHAR(512) NULL,
      den_piesa_cl TEXT NULL,
      buc_piesa_cl TEXT NULL,
      def_suplim VARCHAR(255) NULL,
      termen_executie VARCHAR(12) NULL,
      denum_operatie TEXT NULL,
      timp_operatie TEXT NULL,
      tarif_ora INT NULL,
      denum_piesa TEXT NULL,
      cant_piese TEXT NULL,
      pret_piesa TEXT NULL,
      profile_id INT NULL,
      kilometri INT NULL,
      is_active TINYINT(1) NULL DEFAULT 1,
      tva_percent DECIMAL(5,2) NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_data_adaugare (data_adaugare),
      INDEX idx_is_active (is_active),
      INDEX idx_profile_id (profile_id),
      FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON UPDATE CASCADE ON DELETE CASCADE
    )
  `;
  
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createIpLogsTable = `
    CREATE TABLE IF NOT EXISTS ip_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      ip_address VARCHAR(45) NULL,
      user_agent TEXT NULL,
      timestamp DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
      action VARCHAR(255) NULL
    )
  `;
  
  // Execute the queries in order
  connection.pool.query(createProfileTable, (err, result) => {
    if (err) {
      console.error('Error creating profile table:', err);
      return res.status(500).send('Failed to create profile table: ' + err.message);
    }
    
    console.log('Profile table created successfully');
    
    connection.pool.query(createJobsTable, (err, result) => {
      if (err) {
        console.error('Error creating jobs table:', err);
        return res.status(500).send('Failed to create jobs table: ' + err.message);
      }
      
      console.log('Jobs table created successfully');
      
      connection.pool.query(createUsersTable, (err, result) => {
        if (err) {
          console.error('Error creating users table:', err);
          return res.status(500).send('Failed to create users table: ' + err.message);
        }
        
        console.log('Users table created successfully');
        
        connection.pool.query(createIpLogsTable, (err, result) => {
          if (err) {
            console.error('Error creating ip_logs table:', err);
            return res.status(500).send('Failed to create ip_logs table: ' + err.message);
          }
          
          console.log('IP logs table created successfully');
          res.send(`
            <h2>Database Tables Created Successfully</h2>
            <p>All database tables have been created successfully:</p>
            <ul>
              <li>profile</li>
              <li>jobs</li>
              <li>users</li>
              <li>ip_logs</li>
            </ul>
            <a href="/">Go to Home</a>
          `);
        });
      });
    });
  });
});

// Migration route to add missing columns to existing tables
app.get('/migrate-database', (req, res) => {
  // Check and add missing columns to profile table
  const profileMigrations = [
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS nr_tel VARCHAR(12) NULL",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NULL DEFAULT 1",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    "CREATE INDEX IF NOT EXISTS idx_is_active ON profile(is_active)"
  ];
  
  // Check and add missing columns to jobs table
  const jobsMigrations = [
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS den_piesa_cl TEXT NULL",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS buc_piesa_cl TEXT NULL",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS timp_operatie TEXT NULL",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cant_piese TEXT NULL",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pret_piesa TEXT NULL",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NULL DEFAULT 1",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tva_percent DECIMAL(5,2) NULL",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    "CREATE INDEX IF NOT EXISTS idx_data_adaugare ON jobs(data_adaugare)",
    "CREATE INDEX IF NOT EXISTS idx_is_active ON jobs(is_active)"
  ];
  
  // Check and add missing columns to ip_logs table
  const ipLogsMigrations = [
    "ALTER TABLE ip_logs MODIFY COLUMN IF EXISTS timestamp DATETIME NULL DEFAULT CURRENT_TIMESTAMP"
  ];
  
  // Execute all migrations
  let migrations = [...profileMigrations, ...jobsMigrations, ...ipLogsMigrations];
  let completed = 0;
  let errors = [];
  
  if (migrations.length === 0) {
    return res.send('<h2>No migrations needed</h2><p>All tables are up to date.</p><a href="/">Go to Home</a>');
  }
  
  migrations.forEach(migration => {
    connection.pool.query(migration, (err, result) => {
      completed++;
      
      if (err) {
        console.error('Migration error:', err);
        errors.push({
          query: migration,
          error: err.message
        });
      } else {
        console.log('Migration completed:', migration);
      }
      
      // Check if all migrations are done
      if (completed === migrations.length) {
        if (errors.length > 0) {
          console.log('Some migrations failed:');
          errors.forEach(error => {
            console.error('Query:', error.query);
            console.error('Error:', error.error);
          });
          
          res.status(500).send(`
            <h2>Database Migration Completed with Errors</h2>
            <p>Some migrations failed. Please check the console for details.</p>
            <a href="/">Go to Home</a>
          `);
        } else {
          res.send(`
            <h2>Database Migration Completed Successfully</h2>
            <p>All database tables have been updated with the latest schema.</p>
            <a href="/">Go to Home</a>
          `);
        }
      }
    });
  });
});

app.listen(connection.PORT, () => {
  console.log(
    `${new Date()} -> Application listening to port ${connection.PORT}`
  );
  console.log(`Visit http://localhost:${connection.PORT}/create-tables to create the database tables`);
  console.log(`Visit http://localhost:${connection.PORT}/migrate-database to update existing tables`);
});