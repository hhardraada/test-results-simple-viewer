var mongoose = require('mongoose');
var _ = require('underscore');

function getAutoTestMetaSchema(req, res) {
    mongoose.model('AutoTestMetaSchema').find({}, function (err, autoTestMetaSchemas) {
        if (err) {
            console.log('There was a problem retrieving autoTestMetaSchemas by layer: ' + err);
        } else {
             console.log("autoTestMetaSchemas retrieved successfully: " + autoTestMetaSchemas);
             var autoTestMetaSchemaFields = [];
             if (autoTestMetaSchemas && autoTestMetaSchemas[0]) {
                autoTestMetaSchemaFields = autoTestMetaSchemas[0].fields;
             }
             res.format({
               html: function(){
                   res.render('auto-test-meta-schemas/details', {
                     "autoTestMetaSchemaFields" : autoTestMetaSchemaFields,
                   });
               },
               json: function(){
                   res.json(autoTestMetaSchemaFields);
               }
            });
        }
    });
}

function saveAutoTestMetaSchema(req, res) {
    console.log(req.body);
    if (!req.body || req.body.length > 1) {
        res.send("Failed to save auto test schema field , wrong document");
    } else {
        mongoose.model('AutoTestMetaSchema').find({}, function (err, autoTestMetaSchemas) {
            handleFindAutoTestMetaSchemaAndUpdate(err, autoTestMetaSchemas, req, res);
        });
    }
}

function handleFindAutoTestMetaSchemaAndUpdate(err, autoTestMetaSchemas, req, res) {
    if (err) {
        console.log('There was a problem retrieving while adding autoTest instance / retrieving autotest: ' + err);
    } else {
        if (autoTestMetaSchemas && autoTestMetaSchemas.length > 0) {
            console.log('autoTestMetaSchema found for update');
            updateAutoTestMetaSchema(req, res, autoTestMetaSchemas[0]);
        } else {
            console.log('autoTestMetaSchema not found for update. Creating autotest');
            createAutoTestMetaSchema(req, res);
        }
    }
}

function updateAutoTestMetaSchema(req, res, autoTestMetaSchema) {
    var params = req.body;
    var names = params.name;
    var types = params.type;
    var fields = [];
    var i = 0;
    if (typeof names !== "string") {
        for (i=0; i < names.length; i++) {
            var field = {
                            'name': names[i],
                            'type': types[i]
                        };
            fields.push(field);
        }
    } else {
        fields.push({
            'name': names,
            'type': types
        })
    }

    autoTestMetaSchema.fields = fields;
    autoTestMetaSchema.update(autoTestMetaSchema, function (err, updatedAutoTestMetaSchemaId) {
      if (err) {
          res.send("There was a problem updating the information to the database: " + err);
      } else {
          res.format({
            html: function(){
                 res.render('auto-test-meta-schemas/details', {
                   "autoTestMetaSchemaFields" : autoTestMetaSchema.fields,
                 });
             },
            json: function(){
               res.json(autoTestMetaSchema);
            }
          });
       }
    })
}

function createAutoTestMetaSchema(req, res) {
    var params = req.body;
    var names = params.name;
    var types = params.type;
    var fields = [];
    var i = 0;
    if (typeof names !== "string") {
        for (i=0; i < names.length; i++) {
            var field = {
                            'name': names[i],
                            'type': types[i]
                        };
            fields.push(field);
        }
    } else {
        fields.push({
            'name': names,
            'type': types
        })
    }
    mongoose.model('AutoTestMetaSchema').create({fields}, function (err, autoTestMetaSchema) {
        if (err) {
          res.send("Glups.. There was a problem adding the information to the database: \n\n" + err + "\n\n" );
          console.log(req.body);
        } else {
          console.log('POST creating new autoTestMetaSchema: ' + autoTestMetaSchema);
          res.format({
            html: function(){
                res.location("auto-test-meta-schemas");
                res.redirect("/auto-test-meta-schemas");
            },
            json: function(){
                res.json(autoTest);
            }
        });
        }
    })
}

module.exports.getAutoTestMetaSchema = getAutoTestMetaSchema;
module.exports.saveAutoTestMetaSchema = saveAutoTestMetaSchema;
