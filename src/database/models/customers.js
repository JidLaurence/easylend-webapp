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
    lapses: {type : Boolean, required : true, default: false},
    isVoid: {type : Boolean, required : true, default : false },
    isPaid: {type : Boolean, required : true, default : false },
    isStatus: {type : String, required : true, default : 'Pending' },

    company_id: {type : ObjectId, required : true, ref: 'users'},
    branch_id: {type : ObjectId, required : true, ref: 'branches' },
    customer_id: {type : ObjectId, required : true, ref: 'users' },
    staff_id: {type : ObjectId, required : true, ref: 'users' },
    //THIS WILL BE UPDATED
    capital: {type : Number, required : true },
    months: {type : Number, required : true },
    type: {type : Number, required : true },
    interest: {type : Number, required : true },

    capital_interest: {type : Number, required : true, default: 0},
    capital_total: {type : Number, required : true,  default: 0},
    collect: {type : Number, required : true,  default: 0},
    balance: {type : Number, required : true,  default: 0},
    total_payed: {type : Number, required : true,  default: 0},
    
    collector_id: {type : ObjectId, ref: 'users'},
    date_accepted: {type: Date},
    date_payed: {type: Date},
    date_end: {type: Date},
    collect_dates_id: {type : ObjectId, ref: 'collect_dates' },
  },
  {
    timestamps: true, _id: true,
  });


var Customers = Mongoose.model('customers', UserSchema);

module.exports = Customers;
