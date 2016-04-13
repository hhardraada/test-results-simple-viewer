var mongoose = require('mongoose');
var autoTestSchema = new mongoose.Schema({
  name:         {type: String, required: true},
  description:  String,
  status:       {type: String, enum: ['Success', 'Failure']},
  duration:     {type: Number},
  createdTime:  {type: Date, default: Date.now},
  log:          {type: String},
  instances:    [{
                    status:       {type: String, required: true, enum: ['Success', 'Failure']},
                    duration:     {type: String, required: true},
                    createdTime:  {type: Date, default: Date.now},
                    log:          String
                }]
}, {strict: false});
autoTestSchema.index({ name: 1}, { unique: true }); //Adds index and grants uniqueness

mongoose.model('AutoTest', autoTestSchema);