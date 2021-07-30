var express = require('express');
require('dotenv').config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');

const cors = require('cors');

var app = express();

const mongoose = require('mongoose');
const mongoDB = process.env.MONGO_URI;
console.log(mongoDB);
mongoose.connect(mongoDB,{useNewUrlParser:true,useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoDB connection error'));

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


module.exports = app;
