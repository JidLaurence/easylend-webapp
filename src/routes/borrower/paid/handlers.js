'use strict';

var internals = {},
  Crypto = require('../../../lib/Crypto'),
  Cryptos = require('crypto'),
  _ = require('lodash'),
  moment = require('moment'),
  Async = require("async"),
  Nodemailer = require('nodemailer'),
  Sharp = require("sharp"),

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
  var credentials = {}, myCompany = {}, companyInfo ={};
  Async.series([
    //GET THIS USER CREDENTIALS
    function(callback) {
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
          return reply.redirect("/borrower/validateEmail?message=Error, invalid Account!&alertType=error");
        }
        credentials=data;
        if(credentials.isUpdated==false){return reply.redirect("/borrower/profile?message=Please updated your profile!&alertType=error");}
        return callback(null);
      });
    },
    //GET COMPANY INFO
    function(callback) {
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
        companyInfo=data;
        return callback(null);
      });
    },
    //GET ACCEPTED COMPANY
    function(callback){
      Customers.find({
        $and: [
          {customer_id: credentials._id},
          {isVoid: false},
          {isPaid: true}
        ]
      })
      .lean()
      .exec((err, data) => {
          if(err){
            console.log(err);
          }
          myCompany=data;
          return callback(null);
      });
    }
  ],
    function (callback){
      reply.view('borrower/paid/index.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: credentials,
        companyInfo: companyInfo,
        myCompany: myCompany
      });
    }
  )
};
//select company
internals.select = function (req, reply) {
  var credentials = {}, myCompany = {}, companyInfo ={}, selectedCompany = {}, companySettings = {}, myPayment = {}, collectDate = {}, myPayed = {}, companyBranch = {}, myCollector={};
  Async.series([
    //GET THIS USER CREDENTIALS
    function(callback) {
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
          return reply.redirect("/borrower/validateEmail?message=Error, invalid Account!&alertType=error");
        }
        credentials=data;
        return callback(null);
      });
    },
    //GET COMPANY INFO
    function(callback) {
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
        companyInfo=data;
        return callback(null);
      });
    },
    //GET ACCEPTED COMPANY
    function(callback){
      Customers.find({
        $and: [
          {customer_id: credentials._id},
          {isVoid: false},
          {isPaid: true}
        ]
      })
      .lean()
      .exec((err, data) => {
          if(err){
            console.log(err);
          }
          myCompany=data;
          return callback(null);
      });
    },
    //GET SELECTED CUSTOMER
    function(callback){
      Customers.findOne({
        $and: [
          {_id: req.query._id},
          {customer_id: req.auth.credentials._id},
          {isVoid: false},
          {isPaid: true}
        ]
      })
        .lean()
        .exec((err, data) => {
            if(err){
              console.log(err);
            }
            myPayment=data;
            if(myPayment==null){
              return reply.view('borrower/paid/index.html', {
                message: req.query.message,
                alertType: req.query.alertType,
                credentials: credentials
              });
            }
            return callback(null);
        });
      },
    //GET SELECTED COMPANY
    function(callback){
    Users.findOne({
      $and: [
        {_id: myPayment.company_id},
        {scope: 'company'},
        {isVoid: false},
        {validate_email: true}
      ]
    })
      .lean()
      .exec((err, data) => {
          if(err){
            console.log(err);
          }
          selectedCompany=data;
          return callback(null);
      });
    },
    //GET COMPANY SETTINGS
    function(callback){
      Settings.findOne({
        $and: [
          {company_id: selectedCompany._id},
        ]
      })
      .lean()
      .exec((err, data) => {
          if(err){
            console.log(err);
          }
          companySettings=data;
          return callback(null);
      });
    },
      function(callback){
        Collect_dates.findOne({
          $and: [
            {customersDB_id: myPayment._id},
            {isVoid: false},
          ]
      })
        .lean()
        .exec((err, data) => {
            if(err){
              console.log(err);
            }
            collectDate=data;
            return callback(null);
        });
      },
      //GET PAYED
      function(callback){
        Collects.find({
          $and: [
            {customersDB_id: myPayment._id},
            {isVoid: false},
          ]
        })
          .lean()
          .exec((err, data) => {
              if(err){
                console.log(err);
              }
              myPayed=data;
              return callback(null);
          });
      },
      //GET COMPANY BRANCH INFO
      function(callback){
        Branches.find({
          $and: [
            {company_id: selectedCompany._id},
          ]
        })
        .lean()
        .exec((err, data) => {
            if(err){
              console.log(err);
            }
            companyBranch=data;
            return callback(null);
        });
      },
      //GET MY COLLECTOR INFO
      function(callback){
        Users.findOne({
          $and: [
            {_id: myPayment.collector_id},
            {scope: 'collector'},
            {validate_email: true}
          ]
        })
          .lean()
          .exec((err, data) => {
              if(err){
                console.log(err);
              }
              myCollector=data;
              return callback(null);
          });
        },
  ],
    function (callback){
      reply.view('borrower/paid/index.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: credentials,
        companyInfo: companyInfo,
        myCompany: myCompany,
        selectedCompany: selectedCompany,
        myPayment: myPayment,
        collectDate: collectDate,
        myPayed: myPayed,
        companyBranch: companyBranch,
        companySettings: companySettings,
        myCollector: myCollector
      });
    }
  )
};

module.exports = internals;
