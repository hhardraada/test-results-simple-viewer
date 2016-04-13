var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    autoTestHandler = require('../service/auto-tests');

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
      }
}))


//function requireLogin(req, res, next) {
//  if (req.isAuthenticated()) {
//    console.log("User is logged in. Accessing AutoTests")
//    next();
//  } else {
//    console.log("User is not logged in. Redirecting...")
//    res.redirect("/");
//  }
//}
//
//router.all("/*", requireLogin, function(req, res, next) {
//  next();
//});


router.route('/')
    .get(function(req, res, next) {
        autoTestHandler.getAutoTests(req, res);
    })

router.route('/instances')
    .post(function(req, res) {
        autoTestHandler.addAutoTestInstance(req, res);
    });

router.route('/:id')
    .get(function(req, res) {
        autoTestHandler.getAutoTestById(req, res);
    });


router.param('id', function(req, res, next, id) {
    autoTestHandler.validateParamId(req, res, next, id);
});

module.exports = router;