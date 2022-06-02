'use strict';

var internals = {},
  Crypto = require('../../../lib/Crypto'),
  Cryptos = require('crypto'),
  _ = require('lodash'),
  moment = require('moment'),
  Async = require("async"),
  Nodemailer = require('nodemailer'),

  Users = require('../../../database/models/users'),
  Branches = require('../../../database/models/branches'),
  Staffs = require('../../../database/models/staff'),
  Settings = require('../../../database/models/settings'),
  Capitals = require('../../../database/models/capitals'),
  Collectors = require('../../../database/models/collectors'),
  Calendars = require('../../../database/models/calendars'),
  Customers = require('../../../database/models/customers'),
  Collect_dates = require('../../../database/models/collect_dates'), 
  Collects = require('../../../database/models/collects'), 
  Releases = require('../../../database/models/releases'),
  Total_customers = require('../../../database/models/total_customers'),

  moment = require('moment');

internals.index = function (req, reply) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yy = today.getFullYear();
  
  var start = new Date();
  start.setHours(0, 0, 0, 0);
  var end = new Date();
  end.setHours(23, 59, 59, 999);

  var getMM=parseInt(mm),getYY=parseInt(yy), getDD = parseInt(dd);
  
  var credentials = {}, collectedToday, customerPending,
      cntCollectedToday,  releasedToday, cntReleasedToday, cntCustomerAcceptedToday, cntCustomerPending, collectedTotal, releasedTotal, total_customer={},
      janR=0,febR=0,marR=0,aprR=0,mayR=0,juneR=0,julyR=0,augR=0,sepR=0,octR=0,novR=0,decR=0, janC=0,febC=0,marC=0,aprC=0,mayC=0,juneC=0,julyC=0,augC=0,sepC=0,octC=0,novC=0,decC=0, notPayedCustomer,payedCustomer;
  Async.series(
    [
      function(callback) {
        //GET THIS USER CREDENTIALS
        Users.findOne({
          $and: [
            {_id: req.auth.credentials._id},
            {isVoid: false},
            {validate_email: true}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          credentials=data;
          var todayDate = new Date();
          if(credentials.expiry_end < todayDate){
            return reply.redirect('/company/expire');
          }
          if(credentials.isUpdated==false){return reply.redirect("/company/profile?message=Please updated your profile!&alertType=danger&newMessage=Please fillup the form&newAlertType=danger");}
          credentials.day = getDD;
          credentials.month = getMM;
          credentials.year = getYY;
          console.log('JEEEEDD', credentials)
          return callback(null);
        });
      },
      //TOTAL COLLECTS TODAY
      function(callback) {
        var condition = {
          $and: [
            {company_id: credentials._id},
            {day: credentials.day},
            {month: credentials.month},
            {year: credentials.year},
            {isStatus: true},
            {isVoid: false}
          ]
        };
        Collects.aggregate([
        { $match: condition },
        {
          $group: {
            _id: null,
            customerCount: { $sum: 1 },
            amount: { $sum: "$amount" },
          }
        }
        ]).exec((err, data) => {
        if (err) {
          console.log("err", err);
        }
        if (data[0]) {
          cntCollectedToday = data[0].customerCount;
          collectedToday = data[0].amount.toFixed(2);
        } else {
          cntCollectedToday=0;
          collectedToday = 0;
        }
        console.log('TOTAL1', collectedToday);
        console.log('CNT1', cntCollectedToday);
        return callback(null);
        });
      },
      //TOTAL RELEASED TODAY
      function(callback) {
        var condition = {
          $and: [
            {company_id: credentials._id},
            {day: credentials.day},
            {month: credentials.month},
            {year: credentials.year},
            {isVoid: false}
          ]
        };
        Releases.aggregate([
        { $match: condition },
        {
          $group: {
            _id: null,
            collectorCount: { $sum: 1 },
            amount: { $sum: "$amount" },
          }
        }
        ]).exec((err, data) => {
        if (err) {
          console.log("err", err);
        }
        if (data[0]) {
          cntReleasedToday = data[0].collectorCount;
          releasedToday = data[0].amount.toFixed(2);
        } else {
          cntReleasedToday = 0;
          releasedToday=0;
        }
        console.log('TOTAL', cntReleasedToday);
        console.log('CNT', releasedToday);
        return callback(null);
        });
      },
      //COUNT ACCEPTED CUSTOMER TODAY
      function(callback) {
        var condition = {
          $and: [
            {company_id: credentials._id},
            {date_accepted: { $gte: start, $lt: end }},
            {isVoid: false},
            {isPaid: false},
            {isStatus: 'Accepted'}
          ]
        };
        Customers.aggregate([
        { $match: condition },
        {
          $group: {
            _id: null,
            customerCnt: { $sum: 1 },
          }
        }
        ]).exec((err, data) => {
        if (err) {
          console.log("err", err);
        }
        if (data[0]) {
          cntCustomerAcceptedToday = data[0].customerCnt;
        }else{
          cntCustomerAcceptedToday=0;
        }
        console.log('CNT', cntCustomerAcceptedToday);
        return callback(null);
        });
      },
      //COUNT ALL PENDING CUSTOMER
      function(callback) {
        var condition = {
          $and: [
            {company_id: credentials._id},
            {isVoid: false},
            {isPaid: false},
            {isStatus: 'Pending'}
          ]
        };
        Customers.aggregate([
        { $match: condition },
        {
          $group: {
            _id: null,
            customerCnt: { $sum: 1 },
          }
        }
        ]).exec((err, data) => {
        if (err) {
          console.log("err", err);
        }
        if (data[0]) {
          cntCustomerPending = data[0].customerCnt;
        }else{
          cntCustomerPending=0;
        }
        console.log('CNT', cntCustomerPending);
        return callback(null);
        });
      },
      //TOTAL COLLECTED ALL
      function(callback) {
    
        credentials.isVoided = false;
        credentials.isStatus= true;

        console.log(credentials);
        var condition = {
          $and: [
            {company_id: credentials._id},
            {isStatus:true},
            {isVoid: false},
          ]
        };
        Collects.aggregate([
        { $match: condition },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
          }
        }
        ]).exec((err, data) => {
        if (err) {
          console.log("err", err);
        }
        if (data[0]) {
          collectedTotal = data[0].amount.toFixed(2);
        } else {
          collectedTotal=0;
        }
        console.log('TOTAL ALL===>', data);
        return callback(null);
        });
      },
      //TOTAL RELEASED ALL
      function(callback) {
        var condition = {
          $and: [
            {company_id: credentials._id},
            {isVoid: false}
          ]
        };
        Releases.aggregate([
        { $match: condition },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
          }
        }
        ]).exec((err, data) => {
        if (err) {
          console.log("err", err);
        }
        if (data[0]) {
          releasedTotal = data[0].amount.toFixed(2);
        } else {
          releasedTotal=0;
        }
        console.log('TOTAL ALL', releasedTotal);
        return callback(null);
        });
      },
      //COUNT PENDING CUSTOMER
      function(callback){
        Customers.countDocuments({
          $and: [
            {isStatus: 'Pending'},
            {company_id: credentials._id},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					customerPending=data;
          console.log(customerPending)
					return callback(null);
				});
      },
      //COUNT PAID CUSTOMER
      function(callback){
        Customers.countDocuments({
          $and: [
            {isStatus: 'Accepted'},
            {company_id: credentials._id},
            {isPaid: true},
            {isVoid: false},
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          payedCustomer=data;
          // console.log(payedCustomer)
          return callback(null);
        });
      },
      //COUNT NOT PAID CUSTOMER
      function(callback){
        Customers.countDocuments({
          $and: [
            {isStatus: 'Accepted'},
            {company_id: credentials._id},
            {isPaid: false},
            {isVoid: false},
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          notPayedCustomer=data;
          // console.log(notPayedCustomer)
          return callback(null);
        });
      },
      //TOTAL RELEASED BY MONTH
      (callback)=>{
        Releases.find({
          $and:[
            {isVoid: false},
            {company_id: credentials._id}
          ]
        })
        .lean()
        .exec((err, data)=>{
          data.forEach((data)=>{
            if(data.year==getYY){
              switch(data.month){
                case 1:
                  janR=parseInt(janR)+parseInt(data.amount)
                break;
                case 2:
                  febR=parseInt(febR)+parseInt(data.amount)
                break;
                case 3:
                  marR=parseInt(marR)+parseInt(data.amount)
                break;
                case 4:
                  aprR=parseInt(aprR)+parseInt(data.amount)
                break;
                case 5:
                  mayR=parseInt(mayR)+parseInt(data.amount)
                break;
                case 6:
                  juneR=parseInt(juneR)+parseInt(data.amount)
                break;
                case 7:
                  julyR=parseInt(julyR)+parseInt(data.amount)
                break;
                case 8:
                  augR=parseInt(augR)+parseInt(data.amount)
                break;
                case 9:
                  sepR=parseInt(sepR)+parseInt(data.amount)
                break;
                case 10:
                  octR=parseInt(octR)+parseInt(data.amount)
                break;
                case 11:
                  novR=parseInt(novR)+parseInt(data.amount)
                break;
                case 12:
                  decR=parseInt(decR)+parseInt(data.amount)
                break;
              }
            }
          });
          return callback(null);
        })
      },
      //TOTAL COLLECTED BY MONTH
      (callback)=>{
        Collects.find({
          $and:[
            {company_id: credentials._id},
            {isVoid: false},
            {isStatus: true}
          ]
        })
        .lean()
        .exec((err, data)=>{
          console.log(data)
          data.forEach((data)=>{
            if(data.year == getYY){
              switch(data.month){
                case 1:
                  janC=parseInt(janC)+parseInt(data.amount)
                break;
                case 2:
                  febC=parseInt(febC)+parseInt(data.amount)
                break;
                case 3:
                  marC=parseInt(marC)+parseInt(data.amount)
                break;
                case 4:
                  aprC=parseInt(aprC)+parseInt(data.amount)
                break;
                case 5:
                  mayC=parseInt(mayC)+parseInt(data.amount)
                break;
                case 6:
                  juneC=parseInt(juneC)+parseInt(data.amount)
                break;
                case 7:
                  julyC=parseInt(julyC)+parseInt(data.amount)
                break;
                case 8:
                  augC=parseInt(augC)+parseInt(data.amount)
                break;
                case 9:
                  sepC=parseInt(sepC)+parseInt(data.amount)
                break;
                case 10:
                  octC=parseInt(octC)+parseInt(data.amount)
                break;
                case 11:
                  novC=parseInt(novC)+parseInt(data.amount)
                break;
                case 12:
                  decC=parseInt(decC)+parseInt(data.amount)
                break;
              }
            }
          })
          return callback(null);
        })
      },
      //TOTAL CUSTOMER BY MONTH AND YEAR
      function(callback) {
        Total_customers.find({
          company_id: credentials._id
        })
        .lean()
        .exec((err, data) => {
          total_customer = data;
          console.log('=======', total_customer);
          return callback(null);
        })
      }
    ],
    function (callback) {
      console.log('helloo')
      reply.view('company/dashboard/index.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
        cntCollectedToday,
        collectedToday,
        cntReleasedToday,
        releasedToday,
        cntCustomerAcceptedToday,
        cntCustomerPending,
        releasedTotal,
        collectedTotal,
        customerPending,
        janR,febR,marR,aprR,mayR,juneR,julyR,augR,sepR,octR,novR,decR, janC,febC,marC,aprC,mayC,juneC,julyC,augC,sepC,octC,novC,decC,
        payedCustomer,
        notPayedCustomer,
        total_customer: total_customer
      });
    }
  )
};
module.exports = internals;
