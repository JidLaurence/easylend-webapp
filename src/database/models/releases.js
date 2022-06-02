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
    company_id: {type : ObjectId, required : true, ref: 'users' },
    staff_id: {type : ObjectId, required : true, ref: 'users' },
    collector_id: {type : ObjectId, required : true, ref: 'users' },
    branch_id: {type : ObjectId, required : true, ref: 'branches' },
    amount: {type : Number, required : true },
    day: {type : Number, required : true },
    month: {type : Number, required : true },
    year: {type : Number, required : true },
  },
  {
    timestamps: true, _id: true,
  });


var Releases = Mongoose.model('releases', UserSchema);

module.exports = Releases;
