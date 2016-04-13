var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var bCrypt = require('bcrypt-nodejs');


var db = require('./model/db');
var autoTest = require('./model/auto-test');
var autoTestMetaSchema = require('./model/auto-test-meta-schema');
var users = require('./model/user');

var routes = require('./routes/login');
var autoTests = require('./routes/auto-tests');
var autoTestMetaSchema = require('./routes/auto-test-meta-schemas');
var users = require('./routes/users');

var passport = require('passport');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');


var User = mongoose.model('User');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Helpers
app.locals.moment = require('moment');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(expressSession({
    secret: 'mySecretKey',
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser('keyboard cat'));
app.use(flash());

app.use('/', routes);
app.use('/users', users);
app.use('/auto-tests', autoTests);
app.use('/auto-test-meta-schemas', autoTestMetaSchema);
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




passport.serializeUser(function(user, done) {
    console.log("Going to serialise: \n");
    console.log(user);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  mongoose.model('User').findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    mongoose.model('User').findOne({ 'username' :  username },
      function(err, user) {
        if (err)
          return done(err);
        if (!user){
          console.log('User Not Found with username '+ username);
          return done(null, false,
                req.flash('message', 'User Not found.'));
        }
        var isValidPassword =  bCrypt.compareSync(password, user.password);
        if (!isValidPassword){
          console.log('Invalid Password');
          return done(null, false,
              req.flash('message', 'Invalid Password'));
        }
        return done(null, user);
      }
    );
}));

passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      mongoose.model('User').findOne({'username':username},function(err, user) {
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        if (user) {
          console.log('User already exists');
          return done(null, false, req.flash('message','User Already Exists'));
        } else {
          var newUser = new User();
          username= username;
          password= bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
          email= req.param('email');

          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);
              throw err;
            }
            console.log('User Registration succesful');
            return done(null, newUser);
          });
        }
      });
    };
    process.nextTick(findOrCreateUser);
  }));


module.exports = app;

