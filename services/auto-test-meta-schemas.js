var mongoose    = require('mongoose');
var _           = require('underscore');

var AutoTestMetaSchema = mongoose.model('AutoTestMetaSchema');

function parseAutoTestMetaSchema(params) {
    var names = params.name;
    var types = params.type;
    var fields = [];
    if (typeof names !== "string") {
        for (var i = 0; i < names.length; i++) {
            fields.push({
                'name': names[i],
                'type': types[i]
            });
        }
    } else {
        fields.push({
            'name': names,
            'type': types
        })
    }

    return fields;
}

function getAutoTestMetaSchema(req, res) {
    var handleFindAutoTestMetaSchema = function (err, autoTestMetaSchemas) {
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
    }

    AutoTestMetaSchema.find({}, handleFindAutoTestMetaSchema);
}

function saveAutoTestMetaSchema(req, res) {
    var handleFindAutoTestMetaSchema = function (err, autoTestMetaSchemas) {
        if (err) {
            console.log('There was a problem retrieving while adding autoTest instance / retrieving autotest: ' + err);
        } else if (autoTestMetaSchemas && autoTestMetaSchemas.length > 0) {
            console.log('autoTestMetaSchema found for update');
            updateAutoTestMetaSchema(req, res, autoTestMetaSchemas[0]);
        } else {
            console.log('autoTestMetaSchema not found for update. Creating autotest');
            createAutoTestMetaSchema(req, res);
        }
    }

    if (!req.body || req.body.length > 1) {
        res.send("Failed to save auto test schema field , wrong document");
    } else {
        console.log(req.body);
        AutoTestMetaSchema.find({}, handleFindAutoTestMetaSchema);
    }
}

function updateAutoTestMetaSchema(req, res, autoTestMetaSchema) {
    var handleUpdateAutoTestMetaSchema = function (err, updatedAutoTestMetaSchemaId) {
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
    }

    autoTestMetaSchema.fields = parseAutoTestMetaSchema(req.body);
    autoTestMetaSchema.update(autoTestMetaSchema, handleUpdateAutoTestMetaSchema);
}

function createAutoTestMetaSchema(req, res) {
    var handleCreateAutoTestMetaSchema = function (err, autoTestMetaSchema) {
        if (err) {
            res.send("Glups.. There was a problem adding the information to the database: \n\n" + err + "\n\n" );
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
    }

    var fields = parseAutoTestMetaSchema(req.body);
    AutoTestMetaSchema.create({fields}, handleCreateAutoTestMetaSchema)
}

module.exports.getAutoTestMetaSchema = getAutoTestMetaSchema;
module.exports.saveAutoTestMetaSchema = saveAutoTestMetaSchema;
