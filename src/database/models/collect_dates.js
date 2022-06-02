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
    customersDB_id: {type : ObjectId, required : true, ref: 'customers'},
    dates: {type : Array, required : true },
  },
  {
    timestamps: true, _id: true,
  });


var Collect_dates = Mongoose.model('collect_dates', UserSchema);

module.exports = Collect_dates;
