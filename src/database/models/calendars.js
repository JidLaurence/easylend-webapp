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
    isVoid: {type : Boolean, required : true, default : false },
    isUse: {type : Boolean, required : true, default : false },
    month: {type : Number, required : true },
    year: {type : Number, required : true },
    calendars: {type : Array, required : true },
  },
  {
    timestamps: true, _id: true,
  });


var Calendars = Mongoose.model('calendars', UserSchema);

module.exports = Calendars;
