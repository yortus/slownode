import connect = require('./store/connect');
export = ready;


// We are ready when the database is up and running.
var ready = connect();
