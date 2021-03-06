var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    autoTestMetaSchemaService = require('../services/auto-test-meta-schemas');

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
      }
}))


function requireLogin(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("User is logged in. Accessing autotests")
    next();
  } else {
    console.log("User is not logged in. Redirecting...")
    res.redirect("/");
  }
}

router.all("/*", requireLogin, function(req, res, next) {
  next();
});


router.route('/')
    .get(function(req, res, next) {
        autoTestMetaSchemaService.getAutoTestMetaSchema(req, res);
    })
    .post(function(req, res) {
        autoTestMetaSchemaService.saveAutoTestMetaSchema(req, res);
    });

module.exports = router;