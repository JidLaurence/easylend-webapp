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
    isOnlinePayment: {type : Boolean, required : false, default : false },
    interest: {type : Number, required : false, default: 0 },
    gcash_number: {type : String, required : false, default: 0 },
    company_logo: {type : String, required: true, default: "/assets/img/no-image.png"},
  },
  {
    timestamps: true, _id: true,
  });


var Settings = Mongoose.model('settings', UserSchema);

module.exports = Settings;
