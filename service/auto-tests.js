var mongoose = require('mongoose');
var _ = require('underscore');

function addAutoTestInstance(req, res) {
    mongoose.model('AutoTestMetaSchema').find({}, function (err, autoTestMetaSchemas) {
        console.log("Meta Schema: " + autoTestMetaSchemas);
        if (!req.body.instances || req.body.instances.length > 1) {
            res.send("Failed to add auto test instance, wrong document");
        } else {
            var queryFilter = {
                name: req.body.name
            };
            mongoose.model('AutoTest').find(queryFilter, function (err, autoTests) {
                handleFindAutoTestAndUpdate(err, autoTests[0], req, res);
            });
        }

    });
}

function handleFindAutoTestAndUpdate(err, autoTest, req, res) {
    if (err) {
        console.log('There was a problem retrieving while adding autoTest instance / retrieving autotest: ' + err);
    } else {
        if (autoTest) {
            console.log('Autotest found for instance addition');
            updateAutoTestAddInstance(req, res, autoTest);
        } else {
            console.log('Autotest not found for instance addition. Creating autotest');
            createAutoTest(req, res);
        }
    }
}

function updateAutoTestAddInstance(req, res, autoTest) {
    //TODO: must validate schema

    var instanceToAdd = req.body.instances[0];
    var updatedAutoTest = autoTest;
    updatedAutoTest.instances.push(instanceToAdd);
    updatedAutoTest.status = instanceToAdd.status;
    updatedAutoTest.duration = instanceToAdd.duration;
    updatedAutoTest.log = instanceToAdd.log;
    updatedAutoTest.createdTime = new Date();
    autoTest.update(updatedAutoTest, function (err, autoTestId) {
      if (err) {
          res.send("There was a problem updating the information to the database: " + err);
      } else {
          res.format({
            json: function(){
               res.json(updatedAutoTest);
            }
          });
       }
    })
}

function createAutoTest(req, res) {
    //TODO: must validate schema

    var autoTestToCreate = req.body;
    var instanceToAdd = autoTestToCreate.instances[0];
    autoTestToCreate.status = instanceToAdd.status;
    autoTestToCreate.duration = instanceToAdd.duration;
    autoTestToCreate.log = instanceToAdd.log;
    mongoose.model('AutoTest').create(autoTestToCreate, function (err, autoTest) {
        if (err) {
          res.send("Glups.. There was a problem adding the information to the database: \n\n" + err + "\n\n" );
          console.log(req.body);
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
    })
}

function getAutoTestById(req, res) {
    mongoose.model('AutoTestMetaSchema').find({}, function (err, autoTestMetaSchemas) {
        console.log("Meta Schema: " + autoTestMetaSchemas);
        if (err) {
            console.log(err);
        } else {
            mongoose.model('AutoTest').findById(req.id, function (err, autoTest) {
              if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
              } else {
                console.log('GET Retrieving ID: ' + autoTest._id);
                res.format({
                  html: function(){
                      res.render('autoTests/show', {
                        "autoTest" : autoTest,
                        "autoTestSchemaFields": autoTestMetaSchemas[0].fields
                      });
                  },
                  json: function(){
                      res.json(autoTest);
                  }
                });
              }
            });
        }
    });
}

function convertSecondsToHoursMinutesSeconds(totalSeconds) {
    var numHours = Math.floor(((totalSeconds % 31536000) % 86400) / 3600);
    var numMinutes = Math.floor((((totalSeconds % 31536000) % 86400) % 3600) / 60);
    var numSeconds = (((totalSeconds % 31536000) % 86400) % 3600) % 60;
    return [numHours, numMinutes, numSeconds];
}

function getAutoTests(req, res) {
    mongoose.model('AutoTestMetaSchema').find({}, function (err, autoTestMetaSchemas) {
        console.log("Meta Schema: " + autoTestMetaSchemas);
        if (err) {
            console.log(err);
        } else {
            mongoose.model('AutoTest').find({}, function (err, autoTests) {
                if (err) {
                    console.log('There was a problem retrieving autotests by layer: ' + err);
                } else {
                    console.log("autoTests retrieved successfully:" );
                     res.format({
                       html: function(){
                           var durations = _.pluck(autoTests, 'duration');
                           var totalDuration = _.reduce(durations, function(memo, num){ return memo + num; }, 0);
                           var hoursMinutesSeconds = convertSecondsToHoursMinutesSeconds(totalDuration);
                           var totalCount = autoTests.length;
                           var successfulCount = _.filter(autoTests, function(autoTest){ return autoTest.status == "Success"; }).length;
                           var autoTestSchemaFields = autoTestMetaSchemas[0] ? autoTestMetaSchemas[0] : [];
                           res.render('auto-tests/summary', {
                             "title": 'Test Status',
                             "autoTestSchemaFields": autoTestSchemaFields,
                             "autoTests" : autoTests,
                             "totalCount": totalCount,
                             "totalDuration": hoursMinutesSeconds[0] + "h " + hoursMinutesSeconds[1] + "m " + hoursMinutesSeconds[2] + "s",
                             "successfulCount": successfulCount,
                             "failureCount": totalCount - successfulCount
                           });
                       },
                       json: function(){
                           res.json(autoTests);
                       }
                    });
                }
            });
        }
    });
}

function validateParamId(req, res, next, id){
    mongoose.model('AutoTest').findById(id, function (err, autoTest) {
        if (err) {
            console.log(id + ' was not found');
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
    });
}

module.exports.getAutoTestById = getAutoTestById;
module.exports.addAutoTestInstance = addAutoTestInstance;
module.exports.getAutoTests = getAutoTests;
module.exports.validateParamId = validateParamId;