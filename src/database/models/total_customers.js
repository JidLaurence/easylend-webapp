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
    month: {type : Number, required : true },
    year: {type : Number, required : true },
    total: {type : Number, required : true, default: 1},
    isPaid: {type : Boolean, required : true, default : false },
    payment: {type : Number, required : true, default: 30},
    amount_received: {type : Number, required : true, default: 0},
  },
  {
    timestamps: true, _id: true,
  });


var Total_releases = Mongoose.model('total_customers', UserSchema);

module.exports = Total_releases;
