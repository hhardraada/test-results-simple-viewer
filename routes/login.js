var express = require('express');
var passport = require('passport');
var router = express.Router();

  router.get('/', function(req, res) {
    res.render('../views/index', { message: req.flash('message') });
  });

  router.post('/login', passport.authenticate('login', {
    successRedirect: '/auto-tests',
    failureRedirect: '/',
    failureFlash : true
  }));

  router.get('/signup', function(req, res){
    res.render('../views/register',{message: req.flash('message')});
  });

  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash : true
  }));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});



//router.get('/auto-tests', function (req, res, next) {
//                      if (req.isAuthenticated()) return next();
//                      res.redirect('/');
//                    }, function(req, res){
//  res.render('/', { user: req.user });
//});

module.exports = router;