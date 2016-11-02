const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var mongoose   = require('mongoose');

const config = require('./config');
const appRouter = require('./router');

mongoose.Promise = require('bluebird');
mongoose.connect(config.mongo.url);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.use('/', appRouter);

app.listen(config.port);