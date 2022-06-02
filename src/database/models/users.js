'use strict';
/**
 * ## Imports
 *
 */
//Mongoose - the ORM
var Mongoose = require('mongoose'),
  ObjectId = Mongoose.Schema.Types.ObjectId,
  Schema = Mongoose.Schema;

// var mongoosePaginate = require('mongoose-paginate');

const UserSchema = new Mongoose.Schema({
  firstname: {type : String, required : false },
  lastname: {type : String, required : false },
  middlename: {type : String, required : false },
  address: {type : String, required : false },
  birthday: {type : String, required : false },
  region: {type : String, required : false },
  province: {type : String, required : false },
  city: {type : String, required : false },
  barangay: {type : String, required : false },
  postal_code: {type : String, required : false },
  phone_number: {type : String, required : false },
  email: {type : String, required : true },
  password: {type : String, required : true },
  scope: {type: Array, required : true},
  expiry_start: {type: Date, required: false},
  expiry_end: {type: Date, required: false},
  validate_email: {type : Boolean, required : true, default : false },
  // validate_account: {type : Boolean, required : true, default : false },
  isVerified: {type : Boolean, required : true, default : false },
  isVoid: {type : Boolean, required : true, default : false },
  isReport: {type : Boolean, default : false },
  isHired: {type : Boolean, default : false },
  email_code: {type : String, required : true },
  company_name: {type : String},
  profile_img: {type : String, required: true, default: "/assets/img/no-profile.jpg"},
  //BORROWER
  isUpdated: {type : Boolean, required : true, default : false },
  occupational: {type : String, required : false },
  monthly_income: {type : String, required : false },
  electric_bill: {type : String, required : false },
  water_bill: {type : String, required : false },
  gender: {type : String, required : false },
  marital_status: {type : String, required : false }
  
  },
  {
    timestamps: true, _id: true,
  });

// UserSchema.plugin(mongoosePaginate);

var User = Mongoose.model('users', UserSchema);

module.exports = User;
