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
    company_id: {type : ObjectId, required : true, ref: 'users'},
    name: {type : String, required : true },
    region: {type : String, required : true },
    province: {type : String, required : true },
    city: {type : String, required : true },
    barangay: {type : String, required : true },
    count_staff: {type : Number, required : true, default : 0 },
    count_borrower: {type : Number, required : true, default : 0 }
  },
  {
    timestamps: true, _id: true,
  });


var Branches = Mongoose.model('branches', UserSchema);

module.exports = Branches;
