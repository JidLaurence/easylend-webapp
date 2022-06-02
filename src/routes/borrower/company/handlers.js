'use strict';

const { isEmpty } = require('lodash');

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
Releases = require('../../../database/models/releases'),
Calendars = require('../../../database/models/calendars'),
Total_releases = require('../../../database/models/total_releases'),
Customers = require('../../../database/models/customers'),

moment = require('moment');

function removeDuplicates(data){
  return [...new Set(data)]
}

internals.index = function (req, reply) {
  var credentials = {}, company_info={}, company_branch={}, company_settings ={}, company_capital={}, staffs={};
  var newArray=[];
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  

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
					}else if(isEmpty(data)){
            return reply.redirect("/borrower/dashboard?message=Error please validate your email!&alertType=error");
          }
					credentials=data;
          if(credentials.isUpdated==false){return reply.redirect("/borrower/profile?message=Please updated your profile!&alertType=error&newMessage=Please fillup the form&newAlertType=error");}
					return callback(null);
				});
			},
      function(callback){
        Branches.find({
          province: credentials.province
        }).lean()
        .exec((err, data)=>{
          if(data!=null){
            var ary=[];
            data.forEach(el=>{
              ary.push(String(el.company_id))
            })
            ary = removeDuplicates(ary)
            ary.forEach(el=>{
              newArray.push({
                company_id: el
              })
            });
          }
          return callback(null)
        })
      },
      function(callback) {
        //CHECK IF COMPANY EXPIRE
        //COMPANY INFO
        Users.find({
          $and: [
            {isVoid: false},
            {validate_email: true},
            {isUpdated: true},
            {scope: 'company'},
            {expiry_end: { $gte: today}},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data!=null){
            var array=[];
            data.forEach(el=>{
              newArray.forEach(ar=>{
                  if(String(el._id)==ar.company_id){
                    array.push(el);
                  }
              });
            });
            company_info=array;
            console.log(company_info)
          }
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY BRANCH
        Branches.find({
          $and: [
            {isVoid: false},
            {region: credentials.region},
            {province: credentials.province}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_branch=data;
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY INTEREST/ONLINE PAYMENT
        Settings.find({
          $and: [
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_settings=data;
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY CAPITAL
        Capitals.find({
          $and: [
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_capital=data;
					return callback(null);
				});
			},
    ],
    function (callback) {
      console.log(newArray)
      reply.view('borrower/company/index.html', {
        companyList: newArray,
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newAlertType: req.query.newAlertType,
        company_info: company_info,
        company_branch: company_branch,
        company_settings: company_settings,
        company_capital: company_capital
      });
    }
  )
};

//SEARCH COMPANY
internals.search = function (req, reply) {
  var credentials = {}, company_info={}, company_branch={}, company_settings ={}, company_capital={}, staffs={};

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  
  var search_company = new RegExp(req.query.company_name, 'i');

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
            return reply.redirect("/borrower/dashboard?message=Error It seems you're not hired!&alertType=error");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        //CHECK IF COMPANY EXPIRE
        //COMPANY INFO
        Users.find({
          $and: [
            {company_name:{ $regex: search_company }},
            {isVoid: false},
            {validate_email: true},
            {isUpdated: true},
            {scope: 'company'},
            {expiry_end: { $gte: today}},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_info=data;
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY BRANCH
        Branches.find({
          $and: [
            {isVoid: false},
            {region: credentials.region},
            {province: credentials.province}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_branch=data;
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY INTEREST/ONLINE PAYMENT
        Settings.find({
          $and: [
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_settings=data;
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY CAPITAL
        Capitals.find({
          $and: [
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_capital=data;
					return callback(null);
				});
			},
    ],
    function (callback) {
      reply.view('borrower/company/index.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newAlertType: req.query.newAlertType,
        company_info: company_info,
        company_branch: company_branch,
        company_settings: company_settings,
        company_capital: company_capital
      });
    }
  )
};

//ADD BORROW
internals.add_borrow = function (req, reply) {
  var credentials = {}, staffs={}, getInterest= {};

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  
  var capital=parseInt(req.payload.capital);
  var months=parseInt(req.payload.months);
  var type=parseInt(req.payload.type);
  var getbranch_id= req.payload.branch_id;
  var getcompany_id= req.payload.company_id;

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
            return reply.redirect("/borrower/dashboard?message=Error It seems you're not hired!&alertType=error");
					}
					credentials=data;
          if(credentials.isUpdated==false){return reply.redirect("/borrower/profile?message=Please updated your profile!&alertType=error");}
					return callback(null);
				});
			},
      function(callback) {
        //CHECK MOOD OF PAYMENT
        switch(!type){
          case 1: case 6: case 15: case 30: case 360:
            return reply.redirect("/borrower/dashboard?message=Error, Invalid mood of payment!&alertType=error");
          break;
        }
        if(capital<5000 && type==360){
          return reply.redirect("/borrower/dashboard?message=Error, Invalid mood of payment!&alertType=error");
        }
        return callback(null);
			},
      function(callback) {
        //COMPANY INFO
        Users.findOne({
          $and: [
            {isVoid: false},
            {_id: getcompany_id}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data==null){
            return reply.redirect("/borrower/dashboard?message=Error, please try again!&alertType=error");
          }
          console.log(data)
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY BRANCH
        Branches.findOne({
          $and: [
            {isVoid: false},
            {_id: getbranch_id}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data==null){
            return reply.redirect("/borrower/dashboard?message=Error, please try again!&alertType=error");
          }
          console.log(data)
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY INTEREST
        Settings.findOne({
          $and: [
            {isVoid: false},
            {company_id: getcompany_id},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data==null){
            return reply.redirect("/borrower/dashboard?message=Error, please try again!&alertType=error");
          }
          getInterest=data;
          console.log(data)
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY INFO
        Staffs.findOne({
          $and: [
            {isVoid: false},
            {company_id: getcompany_id},
            {branch_id: getbranch_id}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data==null){
            return reply.redirect("/borrower/dashboard?message=Error, please try again!&alertType=error");
          }
					staffs=data;
          console.log(staffs)
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY CAPITAL
        Capitals.find({
          $and: [
            {isVoid: false},
            {company_id: getcompany_id},
            {value: capital}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
          }
          if(data==null){
            return reply.redirect('/borrower/company?message=Error, Invalid capital&alertType=error');
          }
          console.log(data)
          return callback(null);
				});
			},
      function(callback) {
        //CHECK IF CUSTOMER EXISTS
        Customers.findOne({
          $or:[
            {
              $and: [
                {isVoid: false},
                {isPaid: false},
                {company_id: getcompany_id},
                {customer_id: credentials._id},
                {isStatus: 'Accepted'}
              ]
            },
            {
              $and: [
                {isVoid: false},
                {isPaid: false},
                {company_id: getcompany_id},
                {customer_id: credentials._id},
                {isStatus: 'Pending'}
              ]
            }
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
          }
          if(data!=null){
            return reply.redirect('/borrower/company?message=Error, you are still borrowing this company&alertType=error');
          }
          console.log(data);
          return callback(null);
				});
			},
    ],
    function (callback) {
      var payload = {
        customer_id: credentials._id,
        company_id: getcompany_id,
        branch_id: getbranch_id,
        staff_id: staffs.staff_id,
        capital: capital,
        months: months,
        type: type,
        interest: getInterest.interest
      }
      var saveCustomer = new Customers(payload);
      saveCustomer.save(function(err, data) {
        if (err) {
        console.log(err);
        }else {
          return reply.redirect(
            "/borrower/company?message=Successfully Submit!&alertType=success"
          );
        }
      });
    }
  )
};
module.exports = internals;
