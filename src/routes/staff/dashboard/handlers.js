'use strict';

const { isEmpty } = require('lodash');
const { type } = require('os');

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

  var credentials = {}, notification ={}, company ={}, staffsInfo={}, collectedToday, customerPending,
      cntCollectedToday,  releasedToday, cntReleasedToday, cntCustomerAcceptedToday, cntCustomerPending, collectedTotal, releasedTotal, payedOnline = {}, customersDB = {}, borrowerInfo = {},
      janR=0,febR=0,marR=0,aprR=0,mayR=0,juneR=0,julyR=0,augR=0,sepR=0,octR=0,novR=0,decR=0, janC=0,febC=0,marC=0,aprC=0,mayC=0,juneC=0,julyC=0,augC=0,sepC=0,octC=0,novC=0,decC=0, notPayedCustomer,payedCustomer;
  var Collects_list = {}, Collects_dates = {};

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
          console.log(credentials)
          if(credentials.isUpdated==false){return reply.redirect("/staff/profile?message=Please updated your profile!&alertType=error&newMessage=Please fillup the form&newAlertType=error");}
          else if(credentials.isHired==false){return reply.redirect("/staff/apply");}
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
          //console.log(notification)
					return callback(null);
				});
			},
      function(callback) {
        //GET COMPANY
        Users.find({
          $and: [
            {scope: 'company'},
            {isVoid: false},
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company=data;
          //console.log(company)
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
            return reply.redirect("/staff/dashboard?message=Error, please try again!&alertType=error");
          }
          staffsInfo=data;
          staffsInfo.day = getDD;
          staffsInfo.month = getMM;
          staffsInfo.year = getYY;
          //console.log('staffsInfo ===>', staffsInfo);
          return callback(null);
        });
      },
      //CHECK IF COMPANY IS EXPIRE
      (callback)=>{
        Users.findOne({
          _id: staffsInfo.company_id
        })
        .lean()
        .exec((err, data)=>{
          var dateToday = new Date();
          if(data.expiry_end < dateToday){
            return reply.redirect("/staff/expire");
          }
          return callback(null);
        })
      },
      //TOTAL COLLECTS TODAY
      function(callback) {
        var condition = {
          $and: [
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
            {day: staffsInfo.day},
            {month: staffsInfo.month},
            {year: staffsInfo.year},
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
        //console.log('TOTAL', collectedToday);
        //console.log('CNT', cntCollectedToday);
        return callback(null);
        });
      },
      //TOTAL RELEASED TODAY
      function(callback) {
        var condition = {
          $and: [
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
            {day: staffsInfo.day},
            {month: staffsInfo.month},
            {year: staffsInfo.year},
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
        //console.log('TOTAL', cntReleasedToday);
        // console.log('CNT', releasedToday);
        return callback(null);
        });
      },
      //COUNT ACCEPTED CUSTOMER TODAY
      function(callback) {
        var condition = {
          $and: [
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
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
        //console.log('CNT', cntCustomerAcceptedToday);
        return callback(null);
        });
      },
      //COUNT ALL PENDING CUSTOMER
      function(callback) {
        var condition = {
          $and: [
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
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
        //console.log('CNT', cntCustomerPending);
        return callback(null);
        });
      },
      //TOTAL COLLECTED ALL
      function(callback) {
        var condition = {
          $and: [
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
            {isStatus: true},
            {isVoid: false}
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
        //console.log('TOTAL ALL', collectedTotal);
        return callback(null);
        });
      },
      //TOTAL RELEASED ALL
      function(callback) {
        var condition = {
          $and: [
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
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
        //console.log('TOTAL ALL', releasedTotal);
        return callback(null);
        });
      },
      //COUNT PENDING CUSTOMER
      function(callback){
        Customers.count({
          $and: [
            {isStatus: 'Pending'},
            {staff_id: credentials._id},
            {company_id: staffsInfo.company_id},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					customerPending=data;
          //console.log(customerPending)
					return callback(null);
				});
      },
      //COUNT PAID CUSTOMER
      function(callback){
        Customers.count({
          $and: [
            {isStatus: 'Accepted'},
            {staff_id: credentials._id},
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
          //console.log(payedCustomer)
          return callback(null);
        });
      },
      //COUNT NOT PAID CUSTOMER
      function(callback){
        Customers.count({
          $and: [
            {isStatus: 'Accepted'},
            {staff_id: credentials._id},
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
          //console.log(notPayedCustomer)
          return callback(null);
        });
      },
      //GET PAY ONLINE CUSTOMER
      function(callback){
        Collects.find({
          $and: [
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
            {isOnline: true},
            {isStatus: false},
            {isVoid: false},
            {isDeclined: false}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          payedOnline=data;
          //console.log(payedOnline)
          return callback(null);
        });
      },
      //FOR PAY ONLINE BASES FOR CUSTOMERSDB
      function(callback){
        Customers.find({
          $and: [
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
            {isPaid: false},
            {isVoid: false}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          customersDB=data;
          //console.log(customersDB)
          return callback(null);
        });
      },
      //FOR PAY ONLINE BASES FOR CUSTOMER INFO
      function(callback){
        Users.find({
          $and: [
            {scope: 'borrower'},
            {validate_email: true},
            {isUpdated: true},
            {isVoid: false},
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          borrowerInfo=data;
          //console.log(borrowerInfo)
          return callback(null);
        });
      },
      //TOTAL RELEASED BY MONTH
      (callback)=>{
        Releases.find({
          $and:[
            {isVoid: false},
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
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
            {company_id: staffsInfo.company_id},
            {staff_id: staffsInfo.staff_id},
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
      //GET ALL LIST OF COLLECTED PAYED
      function(callback){
        Collects.find({
          $and: [
            {isStatus: true},
            {isVoid: false},
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          Collects_list=data;
          //console.log(Collects_list)
          return callback(null);
        });
      },
      //GET COLLECT DATES
      function(callback){
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
          Collects_dates=data;
          //console.log(Collects_dates)
          return callback(null);
        });
      }
    ],
    function (callback) {
      reply.view('staff/dashboard/index.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
        notification: notification,
        company: company,
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
        payedOnline: payedOnline,
        customersDB: customersDB,
        borrowerInfo: borrowerInfo,
        Collects_list: Collects_list,
        Collects_dates: Collects_dates
      });
    }
  )
};

internals.verify_payment = function (req, reply) {

  var _id = req.payload._id;
  var customerDB_id = req.payload.customersDB_id;
  var isStatus = req.payload.isStatus;
  var payed = req.payload.payed;
  var credentials = {}, selectedCollects={}, collects = {}, dates={}, customer={};
  const ref_collect=[];
  let setDate={};
  Async.series(
    [
      (callback) => {
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
          console.log(credentials)
          if(credentials.isUpdated==false){return reply.redirect("/staff/profile?message=Please updated your profile!&alertType=error&newMessage=Please fillup the form&newAlertType=error");}
          else if(credentials.isHired==false){return reply.redirect("/staff/apply");}
          return callback(null);
        });
      },
      (callback) => {
        Collect_dates.findOne({
          customersDB_id: customerDB_id
        })
        .lean()
        .exec((err, data)=>{
          dates=data.dates;
          return callback(null);
        });
      },
      (callback) => {
        Collects.find({
          $and: [
            {
              customersDB_id: customerDB_id
            },
            {
              isStatus: true
            },
            {
              isVoid: false
            }
          ]
        })
        .lean()
        .exec((err, data) => {
          if(err){
            console.log(err)
          }
          collects=data;
          return callback(null);
        });
      },
      (callback)=>{
        const sortedActivities = collects;
        
        const sortByDate = collects => {
           const sorter = (a, b) => {
              return new Date(a.payAt).getTime() - new Date(b.payAt).getTime();
           }
           collects.sort(sorter);
        };
        sortByDate(collects);
        console.log(collects);

        console.log('SORTED==>', collects);

          //COMPARE COLLECTSDB AND DATESDB GET AVAILABLE DATESDB
          console.log(dates.length);
          for (var x=0; x<dates.length; x++) {
            if(sortedActivities[x] == '' || sortedActivities[x] == null){
              console.log('false1');
              setDate.dd=dates[x].dd;
              setDate.mm=dates[x].mm;
              setDate.yy=dates[x].yy;
              break;
            }else if(dates[x].mm == sortedActivities[x].month && dates[x].dd == sortedActivities[x].day && dates[x].yy == sortedActivities[x].year){
              // console.log('TRUE');
              console.log('dates=>', dates[x].dd);
              console.log('collect=>', sortedActivities[x].day);
            }else{
              console.log('false');
              setDate.dd=dates[x].dd;
              setDate.mm=dates[x].mm;
              setDate.yy=dates[x].yy;
              break;
            }
          }
          console.log('set date ====================>', setDate);
          return callback(null);
      },
      (callback) =>{
        Customers.findOne({
          _id: req.payload.customersDB_id
        })
        .lean()
        .exec((err, data) => {
          if(err){
            console.log(err);
          }
          customer=data;
          console.log('CUSTOMER=============',customer);
          return callback(null);
        });
      },
      (callback) => {
        Collects.findOne({
          _id: req.payload._id
        })
        .lean()
        .exec((err, data) => {
          if(err){
            console.log(err);
          }
          selectedCollects=data;
          console.log('collected==========', selectedCollects);
          return callback(null);
        });
      }
    ],
    function(callback) {
      var selectedDate = new Date();
      selectedDate.setFullYear(setDate.yy, parseInt(setDate.mm)-1, setDate.dd);
      var collect_payload = {};
      console.log('================status=========>',isStatus);
      if(isStatus == 'true'){
        collect_payload = {
          isStatus: true,
          day: setDate.dd,
          month: setDate.mm,
          year: setDate.yy,
          payAt: selectedDate
        }
      }else{
        collect_payload = {
          isDeclined: true
        }
      }
      console.log('collect PAYLOAD==========', collect_payload);
      Collects.update({
        _id: req.payload._id
      },
      {
        $set: collect_payload,
      },
      function (err, collect_update) {
        if (err) {
          console.log(err);
        } 
        console.log(collect_update);

          var total_payed = customer.total_payed + selectedCollects.amount;
          var balance = customer.balance - selectedCollects.amount;
          var customer_payload={};
          //NO UPDATE IF NOT DECLINE PAYMENT
          if(isStatus == 'true'){
            if(total_payed >= customer.capital_total){
              customer_payload = {
                total_payed: total_payed,
                balance: 0
              }
            }else{
              customer_payload = {
                total_payed: total_payed,
                balance: balance
              }
            }
          }
          console.log('CUSTOMER ==============', customer_payload);
          Customers.updateOne({
            _id: req.payload.customersDB_id
          },
          {
            $set: customer_payload,
          },
          function (err, customer_update) {
            if (err) {
              console.log(err);
            } 
              console.log(customer_update);
              var get_status;
              if(isStatus == 'true'){
                get_status = 'Accepted'
              }else{
                get_status = 'Remove'
              }
              return reply.redirect("/staff/dashboard?message=Successfully "+ get_status +"!&alertType=success");
            },
          );
        },
      );

    }
  )
}

module.exports = internals;
