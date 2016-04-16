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
    successRedirect: '/auto-tests',
    failureRedirect: '/signup',
    failureFlash : true
  }));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;