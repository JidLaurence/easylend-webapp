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
  var data = [];
  let condition={
    $and: [
      {branch_id: req.params._id},
      {isVoid: false},
      {isCancel: false}
    ]
  }

if(parseInt(req.params._id)==0){
    condition={
      $and: [
        {isVoid: false},
        {isCancel: false}
      ]
    }
}

  var result = await Collector.find(condition)
  .populate(['collector_id'])
  .lean();
  console.log(result);
  if(result!=null){
      result.forEach(element=>{
        data.push({
          collector_id: element.collector_id._id,
          fullname: element.collector_id.firstname + ' ' + element.collector_id.lastname,
        });
      });
  }
  console.log(data)
  reply(data);
};
  
internals.getBranch = async function (req, reply) {
  var data = [];
  var condition = {
    $and: [
      {staff_id: req.params._id},
      {isVoid: false},
      {isCancel: false}
    ]
  }
  if(parseInt(req.params._id)==0){
    condition = {
      $and: [
        {isVoid: false},
        {isCancel: false}
      ]
    }
  }

  var result = await Staffs.find(condition)
    .populate(['branch_id'])
    .lean();
  console.log(result);
  if(result!=null){
    result.forEach(element=>{
      data.push({
        _id: element.branch_id._id,
        name: element.branch_id.name
      });
    });
  }

    reply(data);
};
  

module.exports = internals;
