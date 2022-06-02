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

  moment = require('moment');

  internals.index = function (req, reply) {
    var credentials = {}, notification ={}, companyOwner={}, staffs={}, borrower_info={}, myBranches={}, branches={}, collectorsDB = {}, collectors_info = {},
    calendars = {}, displayBranch = 'All', displayCollector = 'All', customers = {}, collector_base = {}, customers_info = {}, collect_dates= {}, collects = {} , get_customer = {}, count_customer=0, customer_totaPayed=0;
  
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yy = today.getFullYear();
    var getMM=parseInt(mm),getYY=parseInt(yy), getDD = parseInt(dd);
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
              return reply.redirect("/staff/profile?message=Error&alertType=error");
            }
            credentials=data;
            console.log(credentials)
            if(credentials.isUpdated==false){return reply.redirect("/staff/profile?message=Please updated your profile!&alertType=error&newMessage=Please fillup the form&newAlertType=error");}
            if(credentials.isHired == false){return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");}
            return callback(null);
          });
        },
        function(callback) {
          //GET BORROWER INFO
          Users.find({
            $and: [
              {scope: 'borrower'},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            customers_info=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET THIS HIRING NOTIFCATION
          Staffs.find({
            $and: [
              {staff_id: credentials._id},
              {isVoid: false},
              {isCancel: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            notification=data;
            return callback(null);
          });
        },
        function(callback) {
          //STAFF BASES
          Staffs.findOne({
            $and: [
              {staff_id: credentials._id},
              {isVoid: false},
              {isCancel: false},
            ]
          })
          .populate(['company_id'])
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            staffs=data;
            if(data==null){
              return reply.view('staff/paid/index.html', {
                credentials: credentials,
                message: req.query.message,
                alertType: req.query.alertType,
                newMessage: req.query.newMessage,
                newAlertType: req.query.newAlertType,
                notification: notification
              });
             }
             var dateToday = new Date();
              if(data.company_id.expiry_end < dateToday){
                return reply.redirect("/staff/expire");
              }
            return callback(null);
          });
        },
        function(callback) {
          //FIND COMPANY OWNER OF THIS STAFF
          Users.findOne({
            $and: [
              {_id: staffs.company_id},
              {isVoid: false},
              {validate_email: true}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            companyOwner=data;
            console.log('=====>',data)
            if(data==null){
              return reply.view('staff/paid/index.html', {
                credentials: credentials,
                message: req.query.message,
                alertType: req.query.alertType,
                newMessage: req.query.newMessage,
                newAlertType: req.query.newAlertType
              });
             }
            return callback(null);
          });
        },
        function(callback) {
          //GET COLLECTOR DB WHERE STAFF_ID& COMPANY_ID IS EQUAL TO THIS STAFF
          Collectors.find({
            $and: [
              {staff_id: credentials._id},
              {company_id: companyOwner._id},
              {isVoid: false},
              {isCancel: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collectorsDB=data;
            if(data==null){
              return reply.view('staff/paid/index.html', {
                credentials: credentials,
                message: req.query.message,
                alertType: req.query.alertType,
                newMessage: req.query.newMessage,
                newAlertType: req.query.newAlertType
              });
             }
            return callback(null);
          });
        },
        function(callback) {
          //GET COLLECTOR INFO COLLECTOR
          Users.find({
            $and: [
              {scope: 'collector'},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collectors_info=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET BORROWER INFO COLLECTOR
          Users.find({
            $and: [
              {scope: 'borrower'}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            borrower_info=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET STAFF BASES IN BRANCH
          Staffs.find({
            $and: [
              {staff_id: credentials._id},
              {company_id: companyOwner._id},
              {isVoid: false},
              {isCancel: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            myBranches=data;
            return callback(null);
          });
        },
        function(callback) {
          Collectors.findOne({
            $and: [
              {staff_id: credentials._id},
              {company_id: companyOwner._id},
              {isVoid: false},
              {isCancel: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {console.log(err); }
            collector_base=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET ALL BRANCH COMPANY
          Branches.find({
            $and: [
              {company_id: staffs.company_id},
              {isVoid: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            branches=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET TODAY CALENDAR
          Calendars.find({
            $and: [
              {month: getMM},
              {year: getYY},
              {isVoid: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            calendars=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET BORROWER
          Customers.find({
            $and: [
              {isStatus: 'Accepted'},
              {company_id: companyOwner._id},
              {staff_id: credentials._id},
              {isVoid: false},
              {isPaid: true}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            customers=data;
            console.log(data)
            if(data==''){
              return reply.view('staff/paid/index.html', {
                credentials: credentials,
                message: req.query.message,
                alertType: req.query.alertType,
                newMessage: req.query.newMessage,
                newAlertType: req.query.newAlertType
              });
             }
            console.log('CUSTOMER', customers);
            return callback(null);
          });
        },
        // COUNT CUSTOMER AND TOTAL PAYED CUSTOMER OF A MONTH
        function(callback) {
          var condition = {
            $and: [
              {isStatus: 'Accepted'},
              {company_id: collector_base.company_id},
              {staff_id: collector_base.staff_id},
              {isVoid: false},
              {isPaid: true}
            ]
          };
          Customers.aggregate([
          { $match: condition },
          {
            $group: {
              _id: null,
              customerCnt: { $sum: 1 },
              total_payed: { $sum: "$total_payed" },
            }
          }
        ]).exec((err, data) => {
          if (err) {
            console.log("err", err);
          }
          if (data[0]) {
            get_customer.cnt = data[0].customerCnt;
            get_customer.payed = data[0].total_payed.toFixed(2);
          } else {
            get_customer.cnt = 0;
            get_customer.payed = 0;
          }
          console.log(get_customer);
          return callback(null);
        });
      },
        function(callback) {
          //GET CUSTOEMR COLLECT DATES
          Collect_dates.find({
            $and: [
              {isVoid: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collect_dates=data;
            return callback(null);
          });
        },
        function(callback) {
          Collects.find({
            $and: [
              {isVoid: false},
              {isStatus: true}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collects=data;
            console.log('COLLECTS=] ', collects)
            return callback(null);
          });
        },
      ],
      function (callback) {
        reply.view('staff/paid/index.html', {
          credentials: credentials,
          message: req.query.message,
          alertType: req.query.alertType,
          newAlertType: req.query.newAlertType,
          notification: notification,
          myBranches: myBranches,
          branches: branches,
          calendars: calendars,
          getMM: getMM,
          getYY: getYY,
          getDD: getDD,
          displayBranch: displayBranch,
          displayCollector: displayCollector,
          borrower_info: borrower_info,
          collectors_info:  collectors_info,
          collectorsDB: collectorsDB,
          customers: customers,
          customers_info: customers_info,
          collect_dates: collect_dates,
          collects: collects,
          get_customer
        });
      }
    )
  };
  
  internals.search_collect = function(req, reply){
    var credentials = {}, notification ={}, companyOwner={}, staffs={}, borrower_info={}, myBranches={}, branches={}, collectorsDB = {}, collectors_info = {},
    calendars = {}, displayBranch = {}, displayCollector = {}, customers = {}, collector_base = {}, customers_info = {}, collect_dates= {}, collects = {};
  
    var today = new Date();
    var dd = today.getDate();
    var mm = req.query.month; //January is 0!
    var yy = req.query.year;
    var getMM=parseInt(mm),getYY=parseInt(yy), getDD = parseInt(dd);

    var start = new Date(req.query.startDate);
    start.setHours(0, 0, 0, 0);
    var end = new Date(req.query.endDate);
    end.setHours(23, 59, 59, 999);

    Async.series(
      [
        function(callback) {
          //GET THIS USER CREDENTIALS
          Users.findOne({
            $and: [
              {_id: req.auth.credentials._id},
              {isVoid: false},
              {isHired: true},
              {validate_email: true}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
              return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
            }
            credentials=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET BORROWER INFO
          Users.find({
            $and: [
              {scope: 'borrower'},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            customers_info=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET THIS HIRING NOTIFCATION
          Staffs.find({
            $and: [
              {staff_id: credentials._id},
              {isVoid: false},
              {isCancel: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            notification=data;
            return callback(null);
          });
        },
        function(callback) {
          //STAFF BASES
          Staffs.findOne({
            $and: [
              {staff_id: credentials._id},
              {isVoid: false},
              {isCancel: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            staffs=data;
            return callback(null);
          });
        },
        function(callback) {
          //FIND COMPANY OWNER OF THIS STAFF
          Users.findOne({
            $and: [
              {_id: staffs.company_id},
              {isVoid: false},
              {validate_email: true}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            companyOwner=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET COLLECTOR DB WHERE STAFF_ID& COMPANY_ID IS EQUAL TO THIS STAFF
          Collectors.find({
            $and: [
              {staff_id: credentials._id},
              {company_id: companyOwner._id},
              {isVoid: false},
              {isCancel: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collectorsDB=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET COLLECTOR INFO COLLECTOR
          Users.find({
            $and: [
              {scope: 'collector'},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collectors_info=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET BORROWER INFO COLLECTOR
          Users.find({
            $and: [
              {scope: 'borrower'}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            borrower_info=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET STAFF BASES IN BRANCH
          Staffs.find({
            $and: [
              {staff_id: credentials._id},
              {company_id: companyOwner._id},
              {isVoid: false},
              {isCancel: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            myBranches=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET ONE BRANCH COMPANY 
          Branches.findOne({
            $and: [
              {company_id: staffs.company_id},
              {_id: req.query.branch_id},
              {isVoid: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            displayBranch=data;
            return callback(null);
          });
        },
        function(callback) {
          Collectors.findOne({
            $and: [
              {staff_id: credentials._id},
              {company_id: companyOwner._id},
              {isVoid: false},
              {isCancel: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {console.log(err); }
            collector_base=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET ONE COLLECTOR OF THIS COMPANY
          Users.findOne({
            $and: [
              {_id: req.query.collector_id},
              {scope: 'collector'}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            displayCollector=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET ALL BRANCH COMPANY
          Branches.find({
            $and: [
              {company_id: staffs.company_id},
              {isVoid: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            branches=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET TODAY CALENDAR
          Calendars.find({
            $and: [
              {month: getMM},
              {year: getYY},
              {isVoid: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            calendars=data;
            return callback(null);
          });
        },
        function(callback) {
          //GET BORROWER
          if(req.query.startDate == ''){
            Customers.find({
              $and: [
                {isStatus: 'Accepted'},
                {collector_id: req.query.collector_id},
                {branch_id: req.query.branch_id},
                {company_id: companyOwner._id},
                {staff_id: credentials._id},
                {isVoid: false},
                {isPaid: true}
              ]
            })
            .lean()
            .exec((err, data) => {
              if (err) {
                console.log(err);
              }
              customers=data;
              console.log('==============>', customers);
              return callback(null);
            });
          }else{
            Customers.find({
              $and: [
                {isStatus: 'Accepted'},
                {collector_id: req.query.collector_id},
                {branch_id: req.query.branch_id},
                {company_id: companyOwner._id},
                {staff_id: credentials._id},
                {date_accepted: { $gte: start, $lt: end}},
                {isVoid: false},
                {isPaid: true}
              ]
            })
            .lean()
            .exec((err, data) => {
              if (err) {
                console.log(err);
              }
              customers=data;
              console.log('==============>', customers);
              return callback(null);
            });
          }
        },
        function(callback) {
          //GET CUSTOEMR COLLECT DATES
          Collect_dates.find({
            $and: [
              {isVoid: false},
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collect_dates=data;
            return callback(null);
          });
        },
        function(callback) {
          Collects.find({
            $and: [
              {isVoid: false},
              {isStatus: true}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collects=data;
            return callback(null);
          });
        },
      ],
      function (callback) {
        reply.view('staff/paid/index.html', {
          credentials: credentials,
          message: req.query.message,
          alertType: req.query.alertType,
          newAlertType: req.query.newAlertType,
          notification: notification,
          myBranches: myBranches,
          branches: branches,
          calendars: calendars,
          getMM: getMM,
          getYY: getYY,
          getDD: getDD,
          displayBranch: displayBranch,
          displayCollector: displayCollector,
          borrower_info: borrower_info,
          collectors_info:  collectors_info,
          collectorsDB: collectorsDB,
          customers: customers,
          customers_info: customers_info,
          collect_dates: collect_dates,
          collects: collects
        });
      }
    )
  }
module.exports = internals;
