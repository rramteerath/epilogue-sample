var express = require('express');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var epilogue = require('epilogue');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9001;
var router = express.Router();

// Add User model
var database = new Sequelize('sampledb', 'postgres', 'password', { dialect: 'postgres' });
var Employee = database.define('Employee', {
  name: Sequelize.STRING,
  hireDate: Sequelize.DATE
});

// Add Account model with foreign key constraint to Employee
var Account = database.define('Account', {
  name: Sequelize.STRING,
  managerId: {
  	type: Sequelize.INTEGER,

		  references: {
		    // This is a reference to model Employee
		    model: Employee,

		    // This is the column name of the referenced model
		    key: 'id',

		    // This declares when to check the foreign key constraint. PostgreSQL only.
		    deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
		  }
  }
});

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('In server.js');

    // make sure we go to the next routes and don't stop here
    next(); 
});

// Initialize epilogue
epilogue.initialize({
  app: app,
  sequelize: database
});

// Create REST resource
var employeeResource = epilogue.resource({
  model: Employee,
  endpoints: ['/employees', '/employees/:id']
});

var acctResource = epilogue.resource({
  model: Account,
  endpoints: ['/accounts', '/accounts/:id']
});

// Create database and listen
database
  .sync({ force: false })
  .then(function() {
    app.listen(port, function() {
      console.log('listening at %s', port);
    });
  });
