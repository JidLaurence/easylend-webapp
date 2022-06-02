'use strict';

var internals = {},
  Config = require('../../../config'),
  Crypto = require('../../../lib/Crypto'),
  Cryptos = require('crypto'),
  _ = require('lodash'),
  moment = require('moment'),
  Async = require("async"),
  Nodemailer = require('nodemailer'),

  Users = require('../../../database/models/users'),
  Staffs = require('../../../database/models/staff'),
  Collector = require('../../../database/models/collectors'),

  moment = require('moment');

internals.getCollector = async function (req, reply) {
  console.log(req.auth.credentials._id);
  let condition= {
    $and: [
      {staff_id: req.auth.credentials._id},
      {isVoid: false},
      {isCancel: false}
    ]
  }

  if(parseInt(req.params._id)!=0){
      condition = {
        $and: [
          {branch_id: req.params._id},
          {staff_id: req.auth.credentials._id},
          {isVoid: false},
          {isCancel: false}
        ]
      }
  }
  console.log('===>>>>>', condition);
  var resultData = await Collector.find(condition)
  .populate('collector_id')
  .lean();
  console.log('===>>>>>', resultData);
  return reply(resultData);

};
  


module.exports = internals;