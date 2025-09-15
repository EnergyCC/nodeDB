const app = require('./app-no-server');

const connection = require('./db.js');

app.listen(connection.PORT, () => {
  console.log(
    `${new Date()} -> Application listening to port ${connection.PORT}`
  );
  console.log(`Visit http://localhost:${connection.PORT}/create-tables to create the database tables`);
  console.log(`Visit http://localhost:${connection.PORT}/migrate-database to update existing tables`);
});

module.exports = app;