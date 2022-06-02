'use strict';
/**
 * ## Imports
 *
 */
//Mongoose - the ORM
var Mongoose = require('mongoose'),
  ObjectId = Mongoose.Schema.Types.ObjectId,
  Schema = Mongoose.Schema;

const UserSchema = new Mongoose.Schema({
    value: {type : String, required : true }
  },
  {
    timestamps: true, _id: true,
  });


var Ranges = Mongoose.model('ranges', UserSchema);

module.exports = Ranges;
