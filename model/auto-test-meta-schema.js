var mongoose = require('mongoose');
var autoTestMetaSchema = new mongoose.Schema({
  fields:    [{
                    name:       {type: String, required: true},
                    type:       {type: String, required: true, enum: ['String', 'Number', 'Date']}
//                    isLevel1:   {type: Boolean, required: true},
//                    isLevel2:   {type: Boolean, required: true}
                }]
});

mongoose.model('AutoTestMetaSchema', autoTestMetaSchema);