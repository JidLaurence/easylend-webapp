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
    total: {type : Number, required : true },
  },
  {
    timestamps: true, _id: true,
  });


var Total_releases = Mongoose.model('total_releases', UserSchema);

module.exports = Total_releases;
