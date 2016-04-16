var _ = require('underscore');

var AUTO_TEST_DEFAULT_SCHEMA_FIELDS = ['name', 'description', 'status', 'duration', 'created', 'log', 'instances'];


function convertSecondsToHoursMinutesSeconds(totalSeconds) {
    var numHours = Math.floor(((totalSeconds % 31536000) % 86400) / 3600);
    var numMinutes = Math.floor((((totalSeconds % 31536000) % 86400) % 3600) / 60);
    var numSeconds = (((totalSeconds % 31536000) % 86400) % 3600) % 60;

    return [numHours, numMinutes, numSeconds];
}

function formatHoursMinutesSeconds(hoursMinutesSeconds) {
    return hoursMinutesSeconds[0] + "h " + hoursMinutesSeconds[1] + "m " + hoursMinutesSeconds[2] + "s"
}

function isValidAutoTestSchema(autoTest) {
    if (!autoTest.instances || autoTest.instances.length > 1) return false;
    for (var fieldName in autoTest) {
        if (!_.contains(AUTO_TEST_DEFAULT_SCHEMA_FIELDS, fieldName)) {
            console.log(fieldName + "KO");
            return false;
        }
        console.log(fieldName + "OK");
    }

    return true;
}

function populateAutoTest(autoTest, instanceToAdd) {
    var updatedAutoTest = autoTest;

    updatedAutoTest.status = instanceToAdd.status;
    updatedAutoTest.duration = instanceToAdd.duration;
    updatedAutoTest.log = instanceToAdd.log;
    updatedAutoTest.createdTime = new Date();

    return updatedAutoTest;
}


module.exports.convertSecondsToHoursMinutesSeconds = convertSecondsToHoursMinutesSeconds;
module.exports.formatHoursMinutesSeconds = formatHoursMinutesSeconds;
module.exports.isValidAutoTestSchema = isValidAutoTestSchema;
module.exports.populateAutoTest = populateAutoTest;