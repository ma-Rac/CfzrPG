const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const service = require('feathers-knex');
const knex = require('knex');

const db = require('knex')({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING || 'postgres://localhost:5432/CFZR',
  searchPath: 'knex,public'
});

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Enable Socket.io services
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

// Create Knex Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/games', service({
  Model: db,
  name: 'games',
  paginate: {
    default: 10,
    max: 100
  }
}));

// Clean up our data. This is optional and is here
// because of our integration tests
db.schema.dropTableIfExists('game').then(function() {
  console.log('Dropped games table');

  // Initialize your table
  return db.schema.createTable('games', function(table) {
    console.log('Creating games table');
    table.increments('id');
    table.string('playerOne');
    table.string('playerTwo');
    table.string('winner');
    table.integer('playerOneScore');
    table.integer('playerTwoScore');
    table.timestamps();

  });
});

// Start the server.
var port = process.env.PORT || 3030;
var server = app.listen(port, function() {
              console.log(`Feathers server listening on port ${port}`);
            });
server.on('listening', function(){
  console.log('Feathers PG Games service running on port ' + port)
});
