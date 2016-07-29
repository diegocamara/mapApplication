var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var cfg = require('_/config');

var app = express();

//app.set('views', cfg.viewDir);
//app.set('view engine', 'jade');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended:true
}));

app.locals.cfg = cfg;

// middleware
//app.use(express.static(cfg.pubDir));
app.use(require('./routes.js'));

// custom error middleware
//app.use(require('_/middleware/notFound'));
//app.use(require('_/middleware/handleError'));

module.exports = app;
