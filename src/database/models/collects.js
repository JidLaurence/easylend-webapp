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
    company_id: {type : ObjectId, required : true, ref: 'users'},
    branch_id: {type : ObjectId, required : true, ref: 'branches'},
    staff_id: {type : ObjectId, required : true, ref: 'users'},
    collector_id: {type : ObjectId, required : true, ref: 'users'},
    amount: {type : Number, required : true },
    isOnline: {type : Boolean, required : true, default : false},
    isStatus: {type : Boolean, required : true, default : true},
    recieptIMG: {type : String},
    refNum: {type : String},
    day: {type : Number, required : true, default : 0},
    month: {type : Number, required : true, default : 0},
    year: {type : Number, required : true, default : 0},
    payAt: {type: Date},
    isDeclined: {type: Boolean, default: false}
  },
  {
    timestamps: true, _id: true,
  });


var Collects = Mongoose.model('collects', UserSchema);

module.exports = Collects;
