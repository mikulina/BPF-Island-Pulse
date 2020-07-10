var _ = require('lodash');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.js');
var mysql = require('mysql2');

var connection = mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    dateStrings : true
});


  // listen for query event
emitter.on('fetchResults', function(res, stmt, callback){
  connection.query(stmt, [], function(err, result){
    // optionally check for callback
    if (_.isFunction(callback)) result = callback(result);
    // emit event
    result = JSON.stringify(result);
    res.send(result);
    res.end();
  });
});
