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
    isCancel: {type : Boolean, required : true, default : false },
    company_id: {type : ObjectId, required : true, ref: 'users' },
    staff_id: {type : ObjectId, required : true, ref: 'users' },
    branch_id: {type : ObjectId, required : true, ref: 'branches' },
    count_collector: {type : Number, required : true, default : 0 }
  },
  {
    timestamps: true, _id: true,
  });


var Staffs = Mongoose.model('staffs', UserSchema);

module.exports = Staffs;
