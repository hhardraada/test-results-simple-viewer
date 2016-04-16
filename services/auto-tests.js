var mongoose        = require('mongoose');
var _               = require('underscore');
var autoTestHelper  = require('../helpers/auto-tests');

var AutoTest            = mongoose.model('AutoTest');
var AutoTestMetaSchema  = mongoose.model('AutoTestMetaSchema');


function addAutoTestInstance(req, res) {
    var handleFindAutoTestSchema = function (err, autoTestMetaSchemas) {
       if (err) {
           res.send("Error while retrieving test meta schemas: " + err);
       } else if (autoTestHelper.isValidAutoTestSchema(req.body)) {
           console.log("Retrieved test meta schemas: " + autoTestMetaSchemas);
           addAutoTestInstanceBySchema(err, req, res);
       } else {
           res.send("Provided autoTest has wrong schema");
       }
   }

    AutoTestMetaSchema.find({}, handleFindAutoTestSchema);
}

function addAutoTestInstanceBySchema(err, req, res) {
    var handleFindAutoTestByName = function (err, autoTests) {
       if (err) {
           res.send("Error while retrieving test me: " + err)
       } else if (autoTests[0]) {
           console.log('Autotest found for instance addition');
           updateAutoTestAddInstance(req, res, autoTests[0]);
       } else {
           console.log('Autotest not found for instance addition. Creating autotest');
           createAutoTest(req, res);
       }
   }

    AutoTest.find({name: req.body.name}, handleFindAutoTestByName);
}

function updateAutoTestAddInstance(req, res, autoTest) {
    var handleUpdateAutoTest = function (err, autoTestId) {
        if (err) {
           res.send("There was a problem updating the information to the database: " + err);
        } else {
            res.format({
                json: function(){
                    res.json(updatedAutoTest);
                }
            });
        }
    }

    var updatedAutoTest = autoTestHelper.populateAutoTest(autoTest, req.body.instances[0]);
    updatedAutoTest.instances.push(req.body.instances[0]);
    autoTest.update(updatedAutoTest, handleUpdateAutoTest)
}

function createAutoTest(req, res) {
    var handleCreateAutoTest = function (err, autoTest) {
        if (err) {
            console.log(req.body);
            res.send("Glups.. There was a problem adding the information to the database: \n\n" + err + "\n\n" );
        } else {
            console.log('POST creating new autoTest: ' + autoTest);
            res.format({
                html: function(){
                    res.location("autoTests");
                    res.redirect("/autoTests");
                },
                json: function(){
                    res.json(autoTest);
                }
            });
        }
    }

    var autoTestToCreate = autoTestHelper.populateAutoTest(req.body, req.body.instances[0]);
    AutoTest.create(autoTestToCreate, handleCreateAutoTest);
}

function getAutoTestById(req, res) {
    mongoose.model('AutoTestMetaSchema').find({}, function (err, autoTestMetaSchemas) {
        if (err) {
            console.log(err);
        } else {
            console.log("Meta Schema: " + autoTestMetaSchemas);
            getAutoTestByIDBySchema(req, res, autoTestMetaSchemas[0])
        }
    });
}

function getAutoTestByIDBySchema(req, res, autoTestMetaSchema) {
    var handleFindAutoTestById = function (err, autoTest) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            console.log('GET Retrieving ID: ' + autoTest._id);

            var htmlResponse = function(){
                res.render('auto-tests/details', {
                    "autoTest" : autoTest,
                    "autoTestSchemaFields": autoTestMetaSchema.fields
                });
            }

            var jsonResponse = function(){
                res.json(autoTest);
            }

            res.format({
                html: htmlResponse,
                json: jsonResponse
            });
        }
    }

    mongoose.model('AutoTest').findById(req.id, handleFindAutoTestById);
}

function getAutoTests(req, res) {
    var handleFindAutoTestSchema = function (err, autoTestMetaSchemas) {
        console.log("Meta Schema: " + autoTestMetaSchemas);
        if (err) {
            console.log(err);
        } else {
            getAutoTestsBySchema(req, res, autoTestMetaSchemas[0]);
        }
    }

    AutoTestMetaSchema.find({}, handleFindAutoTestSchema);
}

function getAutoTestsBySchema(req, res, autoTestMetaSchema) {
    var handleFindAutoTestsBySchema = function (err, autoTests) {
        if (err) {
            console.log('There was a problem retrieving autotests by layer: ' + err);
        } else {
            console.log("AutoTests retrieved successfully:" + autoTests);
            res.format({
                html: function(){
                      var durations = _.pluck(autoTests, 'duration');
                      var totalDuration = _.reduce(durations, function(memo, num){ return memo + num; }, 0);
                      var hoursMinutesSeconds = autoTestHelper.convertSecondsToHoursMinutesSeconds(totalDuration);
                      var successfulCount = _.filter(autoTests, function(autoTest){ return autoTest.status == "Success"; }).length;
                      res.render('auto-tests/summary', {
                          "title": 'Test Status',
                          "autoTests" : autoTests,
                          "autoTestSchemaFields": autoTestMetaSchema ? autoTestMetaSchema.fields : [],
                          "totalCount": autoTests.length,
                          "totalDuration": autoTestHelper.formatHoursMinutesSeconds(hoursMinutesSeconds),
                          "successfulCount": successfulCount,
                          "failureCount": autoTests.length - successfulCount
                      });
                  },
                json: function(){
                      res.json(autoTests);
                  }
            });
        }
    }

    AutoTest.find({}, handleFindAutoTestsBySchema);
}

function validateParamId(req, res, next, id){
    var handleFindAutoTestById = function (err, autoTest) {
        if (err) {
            console.log("AutoTest not found: " + id);
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                },
                json: function(){
                    res.json({message : err.status  + ' ' + err});
                }
            });
        } else {
            req.id = id;
            next();
        }
    }

    AutoTest.findById(id, handleFindAutoTestById);
}

module.exports.getAutoTestById = getAutoTestById;
module.exports.addAutoTestInstance = addAutoTestInstance;
module.exports.getAutoTests = getAutoTests;
module.exports.validateParamId = validateParamId;