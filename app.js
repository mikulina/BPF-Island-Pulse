
/**
 * Module dependencies.
 */

// helpers are your friend
require('./app/helpers');


var express = require('express')
  , _ = require('lodash')
  , routes = require('./routes')
  , user = require('./routes/user')
  , api = require('./routes/api')
  , http = require('http')
  , path = require('path');

var cacheManifest = require('connect-cache-manifest');

var app = express();

// evented!
var events = require('events');
global.emitter = new events.EventEmitter();
// load database stuff
require('./app/database.js');


app.use(cacheManifest({
  manifestPath: '/application.manifest',
  files: [{
    file: __dirname + '/public/css/style.css',
    path: '/css/style.css'
  }, {
    dir: __dirname + '/public/js',
    prefix: '/js/',
    ignore: function(x) { return (/\/\./).test(x); } // ignore hidden files
  }, {
    dir: __dirname + '/public/img',
    prefix: '/img/',
    ignore: function(x) { return (/\/\./).test(x); }
  }, {
    dir: __dirname + '/public/fonts',
    prefix: '/fonts/',
    ignore: function(x) { return (/\/\./).test(x); }
  }, {
    dir: __dirname + '/views',
    ignore: function(x) { return (/\/\./).test(x); },
    replace: function(x) { return x.replace(/\.jade$/, '.html'); }
  }],
  networks: ['*'],
  fallbacks: []
}));

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/api/:chart', api.response);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
