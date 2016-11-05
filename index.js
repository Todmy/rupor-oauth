const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');


const config = require('./config');
const appRouter = require('./router');

mongoose.Promise = require('bluebird');
mongoose.connect(config.mongo.url);

app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.use('/', appRouter);

app.listen(config.port);