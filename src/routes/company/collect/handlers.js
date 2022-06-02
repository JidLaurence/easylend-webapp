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
    var credentials = {}, notification ={}, staffs={}, myBranches={}, branches={}, collectorsDB = {}, collectors_info = {},
    calendars = {}, displayBranch = {}, displayCollector = {}, customers = {}, collector_base = {}, customers_info = {}, collect_dates= {}, collects = {} , get_customer = {}, count_customer=0, customer_totaPayed=0;
  
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
            }
            credentials=data;
            var todayDate = new Date();
            if(credentials.expiry_end < todayDate){
              return reply.redirect('/company/expire');
            }
            if(credentials.isUpdated==false){return reply.redirect("/company/profile?message=Please updated your profile!&alertType=danger&newMessage=Please fillup the form&newAlertType=danger");}
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
          //STAFF BASES
          Staffs.findOne({
            $and: [
              {company_id: credentials._id},
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
            if(data==null){
              return reply.view('company/collect/index.html', {
                credentials: credentials,
                message: req.query.message,
                alertType: req.query.alertType,
                newAlertType: req.query.newAlertType,
                notification: notification
              });
            }
            console.log('HELLLOOO', data)
            return callback(null);
          });
        },
        function(callback) {
          //GET COLLECTOR DB WHERE STAFF_ID& COMPANY_ID IS EQUAL TO THIS STAFF
          Collectors.find({
            $and: [
              {company_id: credentials._id},
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
          //GET STAFF BASES IN BRANCH
          Staffs.find({
            $and: [
              {company_id: credentials._id},
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
              {_id: staffs.branch_id},
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
              {company_id: credentials._id},
              {isVoid: false},
              {isCancel: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {console.log(err); }
            collector_base=data;
            if(data==null){
              return reply.view('company/collect/index.html', {
                credentials: credentials,
                message: req.query.message,
                alertType: req.query.alertType,
                newAlertType: req.query.newAlertType,
                notification: notification
              });
            }
            return callback(null);
          });
        },
        function(callback) {
          //GET ONE COLLECTOR OF THIS COMPANY
          Users.findOne({
            $and: [
              {_id: collector_base.collector_id},
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
              {company_id: credentials._id},
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
              {collector_id: collector_base.collector_id},
              {branch_id: collector_base.branch_id},
              {company_id: credentials._id},
              {isVoid: false},
              {isPaid: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            customers=data;
            console.log('CUSTOMER', customers);
            return callback(null);
          });
        },
        // COUNT CUSTOMER AND TOTAL PAYED CUSTOMER OF A MONTH
        function(callback) {
          var condition = {
            $and: [
              {isStatus: 'Accepted'},
              {collector_id: collector_base.collector_id},
              {branch_id: collector_base.branch_id},
              {company_id: collector_base.company_id},
              {isVoid: false},
              {isPaid: false}
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
          console.log('===========================>',get_customer);
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
            return callback(null);
          });
        },
      ],
      function (callback) {
        reply.view('company/collect/index.html', {
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

  //REMOVE JED
  //ADD AND UPDATE COLLECTS
  internals.collects = function (req,reply){
    var today = new Date();

    var d = parseInt(req.payload.day);
    var m = parseInt(req.payload.month)-1;
    var y = parseInt(req.payload.year);
    var selectedDate = new Date();
    selectedDate.setFullYear(y, m, d);
    if(req.payload.amount == null || d==null || m==null || y==null || req.payload.collect_id==null || req.payload.customersDB_id == null){
      console.log('ERRORRRRRRRRRRRRRRRRRR')
      return reply.redirect("/company/collect?message=Error!&alertType=danger");
    }
    var credentials={}, findCollect={}, findCustomer={}, staffsInfo={};
    if(String(req.payload.collect_id) == ""){
      //ADD
      Async.series([
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
              return reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
            }
            credentials=data;
            console.log(credentials)
            if(credentials.isUpdated==false){return reply.redirect("/company/profile?message=Please updated your profile!&alertType=danger");}
            return callback(null);
          });
        },
        //FIND STAFF INFO
        function(callback) {
          Staffs.findOne({
            $and: [
              { staff_id: credentials._id },
              { isCancel: false},
              { isVoid: false }
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
              return reply.redirect("/company/collect?message=Error, please try again!&alertType=danger");
            }
            staffsInfo=data;
            console.log('staffsInfo ===>', staffsInfo);
            return callback(null);
          });
        },
        //FIND CUSTOMER TO ADD
        function(callback) {
          Customers.findOne({
            _id: req.payload.customersDB_id
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
              return reply.redirect("/company/collect?message=Error, please try again!&alertType=danger");
            }
            findCustomer=data;
            console.log('CUSTOMER ===>', findCustomer);
            return callback(null);
          });
        },
      ],
        //NEW COLLECTED DATES
        function (callback){
          var collect_payload ={
            company_id: staffsInfo.company_id,
            staff_id: staffsInfo.staff_id,
            branch_id: findCustomer.branch_id,
            collector_id: findCustomer.collector_id,
            customersDB_id: req.payload.customersDB_id,
            amount: req.payload.amount,
            day: req.payload.day,
            month: req.payload.month,
            year: req.payload.year,
            payAt: selectedDate
          }
          var saveCollect = new Collects(collect_payload);
          saveCollect.save(function(err, collectSave) {
            if (err) {
            console.log(err);
            }else {
              console.log('collectSave: ',collectSave);
              var balance,total_payed, isPaid=false;
              balance= parseInt(findCustomer.balance) - parseInt(req.payload.amount);
              total_payed = parseInt(findCustomer.total_payed) + parseInt(req.payload.amount);

               //if customer is paid
               var customer_payload={};
               if(parseInt(balance)<=0 ){
                 customer_payload = {
                   balance: balance,
                   total_payed: total_payed,
                   isPaid: true,
                   date_payed: today
                 }
               }else{
                 customer_payload = {
                   balance: balance,
                   total_payed: total_payed,
                   isPaid: isPaid
                 }
               }
              Customers.update({
                _id: req.payload.customersDB_id
              },
              {
                $set: customer_payload,
              },
              function (err, customer_update) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('Customer update: ', customer_update);
                  return reply.redirect("/company/collect/search-collect?branch_id="+findCustomer.branch_id+"&collector_id="+findCustomer.collector_id+"&month="+req.payload.month+"&year="+req.payload.year+"");
                  }
                },
              );
              //END OF UPDATE CUSTOMER
            }
          });
           //END OF ADD COLECT
        }
      )
      //END OF ADD
    }else{
      //UPDATE COLLECTED
      Async.series([
        function(callback) {
          Collects.findOne({
            _id: req.payload.collect_id
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
              return reply.redirect("/company/collect?message=Collect Error, please try again!&alertType=danger");
            }
            findCollect=data;
            console.log('COLLECTSSS ===>', findCollect);
            return callback(null);
          });
        },
        function(callback) {
          Customers.findOne({
            _id: req.payload.customersDB_id
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
              return reply.redirect("/company/collect?message=Customer Error, please try again!&alertType=danger");
            }
            findCustomer=data;
            console.log('CUSTOMER ===>', findCustomer);
            return callback(null);
          });
        },
      ],
      function(callback){
          var collect_payload = {
            amount: req.payload.amount
          }
          //UPDATE COLLECTED
          Collects.update({
              _id: req.payload.collect_id
            },
            {
              $set: collect_payload,
            },
            function (err, collect_update) {
              if (err) {
                console.log(err);
              } else {
                console.log('collect_update: ', collect_update);
                  //UPDATE CUSTOMER
                  var total_payed, balance, isPaid=false;
                  if(parseInt(findCollect.amount) > parseInt(req.payload.amount)){
                    var x = parseInt(findCollect.amount) - parseInt(req.payload.amount) ;
                    total_payed = parseInt(findCustomer.total_payed) - parseInt(x);
                    balance = parseInt(findCustomer.balance) + parseInt(x);
                  }else{
                    var x = parseInt(req.payload.amount) - parseInt(findCollect.amount);
                    total_payed = parseInt(findCustomer.total_payed) + parseInt(x);
                    balance = parseInt(findCustomer.balance) - parseInt(x);
                  }
                  //if customer is paid
                  var customer_payload={};
                  if(parseInt(balance)<=0 ){
                    customer_payload = {
                      balance: balance,
                      total_payed: total_payed,
                      isPaid: true,
                      date_payed: today
                    }
                  }else{
                    customer_payload = {
                      balance: balance,
                      total_payed: total_payed,
                      isPaid: isPaid,
                    }
                  }
                 
                  Customers.update({
                    _id: req.payload.customersDB_id
                  },
                  {
                    $set: customer_payload,
                  },
                  function (err, customer_update) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log('Customer update: ', customer_update);
                      return reply.redirect("/company/collect/search-collect?branch_id="+findCustomer.branch_id+"&collector_id="+
                      findCustomer.collector_id+"&month="+req.payload.month+"&year="+req.payload.year);
                      }
                    },
                  );
                //END OF CUSTOMER
              }
            },
          );
          //END OF COLLECTS
        }
      )
      //END IF
    }
  }
  
  internals.search_collect = function(req, reply){
    var credentials = {}, notification ={}, staffs={}, myBranches={}, branches={}, collectorsDB = {}, collectors_info = {},
    calendars = {}, displayBranch = {}, displayCollector = {}, customers = {}, collector_base = {}, customers_info = {}, collect_dates= {}, collects = {}, get_customer={};
  
    var today = new Date();
    var dd = today.getDate();
    var mm = req.query.month; //January is 0!
    var yy = req.query.year;
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
              return reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
            }
            credentials=data;
            console.log(credentials);
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
          //STAFF BASES
          Staffs.findOne({
            $and: [
              {company_id: credentials._id},
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
          //GET COLLECTOR DB WHERE STAFF_ID& COMPANY_ID IS EQUAL TO THIS STAFF
          Collectors.find({
            $and: [
              {company_id: credentials._id},
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
          //GET STAFF BASES IN BRANCH
          Staffs.find({
            $and: [
              {company_id: credentials._id},
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
              {company_id: credentials._id},
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
              {company_id: credentials._id},
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
              {company_id: credentials._id},
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
              {collector_id: req.query.collector_id},
              {branch_id: req.query.branch_id},
              {company_id: credentials._id},
              {isVoid: false},
              {isPaid: false}
            ]
          })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            customers=data;
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
            console.log('COLLECTSSS ===>', collects);
            return callback(null);
          });
        },
        // COUNT CUSTOMER AND TOTAL PAYED CUSTOMER
          function(callback) {
            var condition = {
              $and: [
                {isStatus: 'Accepted'},
                {collector_id: collector_base.collector_id},
                {branch_id: collector_base.branch_id},
                {company_id: collector_base.company_id},
                {isVoid: false},
                {isPaid: false}
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
            console.log('===========================>',get_customer);
            return callback(null);
          });
        },
      ],
      function (callback) {
        reply.view('company/collect/index.html', {
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
  }
module.exports = internals;
