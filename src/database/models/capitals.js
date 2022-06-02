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
    value: {type : Number, required : true }
  },
  {
    timestamps: true, _id: true,
  });


var Capitals = Mongoose.model('capitals', UserSchema);

module.exports = Capitals;
