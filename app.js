var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
require('./models/board');
require('./models/post');
require('./models/admin');
mongoose.connect('mongodb://localhost/huyaba');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: err
	});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
	message: err.message,
	error: {}
	});
});

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var Admin = mongoose.model('Admin');
passport.use(new LocalStrategy({
	usernameField: 'name',
	passwordField: 'password'
	},
	function(name, password, done)
	{
		console.log('LocalStrategy');
		Admin.findOne({name: name}, function(err, adm)
		{
			console.log('Admin.findOne');
			if (err) return done(err);
			if (!adm) return done(null, false, {message: "No admin with that login"});
			if (!adm.verifyPassword(password)) return done(null, false, {message: "Wrong password"});

			return done(null, adm);
		})
	})
)
app.use(passport.initialize());

module.exports = app;
