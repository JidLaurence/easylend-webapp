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
  var credentials = {}, myCompany = {}, companyInfo ={}, selectedCompany = {}, companySettings = {}, myPayment = {}, collectDate = {}, myPayed = {}, companyBranch = {}, myCollector ={}, mySelectedCompany;
  var haveCompany=true;
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
    //GET ACCEPTED/PENDING COMPANY FOR SELECT
    function(callback){
      Customers.find({
        $or: [
          {
            $and: [
              {customer_id: credentials._id},
              {isVoid: false},
              {isPaid: false},
              {isStatus: 'Accepted'}
            ]
          },
          {
            $and: [
              {customer_id: credentials._id},
              {isVoid: false},
              {isPaid: false},
              {isStatus: 'Pending'}
            ]
          }
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
    //GET ONE THIS USER CUSTOMERDB
    function(callback){
      Customers.findOne({
        $or: [
          {
            $and: [
              {customer_id: credentials._id},
              {isVoid: false},
              {isPaid: false},
              {isStatus: 'Accepted'}
            ]
          },
          {
            $and: [
              {customer_id: credentials._id},
              {isVoid: false},
              {isPaid: false},
              {isStatus: 'Pending'}
            ]
          }
        ]
      })
      .lean()
      .exec((err, data) => {
          if(err){
            console.log(err);
          }
          if(data==null){
            haveCompany=false;
          }else{
            mySelectedCompany=data.company_id;
          }
          return callback(null);
      });
    },
     //GET SELECTED COMPANY
     function(callback){
       if(haveCompany==true){
        Users.findOne({
          $and: [
            {_id: mySelectedCompany},
            {scope: 'company'},
            {isVoid: false},
            {validate_email: true}
          ]
        })
          .lean()
          .exec((err, data) => {
              selectedCompany=data;
              console.log(selectedCompany);
              return callback(null);
          });
       }else{
        return callback(null);
       }
      },
      //GET COMPANY SETTINGS
      function(callback){
        if(haveCompany==true){
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
      }else{
        return callback(null);
       }
      },
      //GET SELECTED CUSTOMER
      function(callback){
        if(haveCompany==true){
        Customers.findOne({
          $or: [
            {
              $and: [
                {company_id: mySelectedCompany},
                {customer_id: req.auth.credentials._id},
                {isVoid: false},
                {isPaid: false},
                {isStatus: 'Accepted'},
              ]
            },
            {
              $and: [
                {company_id: mySelectedCompany},
                {customer_id: req.auth.credentials._id},
                {isVoid: false},
                {isPaid: false},
                {isStatus: 'Pending'},
              ]
            }
          ]
        })
          .lean()
          .exec((err, data) => {
              myPayment=data;
              return callback(null);
          });
        }else{
          return callback(null);
         }
        },
        function(callback){
          if(haveCompany==true){
          Collect_dates.findOne({
            $and: [
              {customersDB_id: myPayment._id},
              {isVoid: false},
            ]
        })
          .lean()
          .exec((err, data) => {
              collectDate=data;
              return callback(null);
          });
        }else{
          return callback(null);
         }
        },
        //GET PAYED
        function(callback){
          if(haveCompany==true){
          Collects.find({
            $and: [
              {customersDB_id: myPayment._id},
              {isVoid: false},
            ]
          })
            .lean()
            .exec((err, data) => {
                myPayed=data;
                const sortByDate = myPayed => {
                  const sorter = (a, b) => {
                     return new Date(a.payAt).getTime() - new Date(b.payAt).getTime();
                  }
                  myPayed.sort(sorter);
               };
               sortByDate(myPayed);
               console.log(myPayed);
                return callback(null);
            });
          }else{
            return callback(null);
           }
        },
        //GET COMPANY BRANCH INFO
        function(callback){
          if(haveCompany==true){
          Branches.find({
            $and: [
              {company_id: selectedCompany._id},
            ]
          })
          .lean()
          .exec((err, data) => {
              companyBranch=data;
              return callback(null);
          });
        }else{
          return callback(null);
         }
        },
        //GET MY COLLECTOR INFO
        function(callback){
          if(haveCompany==true){
          Users.findOne({
            $and: [
              {_id: myPayment.collector_id},
              {scope: 'collector'},
              {validate_email: true}
            ]
          })
            .lean()
            .exec((err, data) => {
                myCollector=data;
                console.log(myCollector);
                return callback(null);
            });
          }else{
            return callback(null);
           }
        },
  ],
    function (callback){
      reply.view('borrower/dashboard/index.html', {
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

//select company
internals.select = function (req, reply) {
  var credentials = {}, myCompany = {}, companyInfo ={}, selectedCompany = {}, companySettings = {}, myPayment = {}, collectDate = {}, myPayed = {}, companyBranch = {}, myCollector ={};
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
        $or: [
          {
            $and: [
              {customer_id: credentials._id},
              {isVoid: false},
              {isPaid: false},
              {isStatus: 'Accepted'}
            ]
          },
          {
            $and: [
              {customer_id: credentials._id},
              {isVoid: false},
              {isPaid: false},
              {isStatus: 'Pending'}
            ]
          }
        ]
      })
      .lean()
      .exec((err, data) => {
          myCompany=data;
          return callback(null);
      });
    },
    //GET SELECTED COMPANY
    function(callback){
    Users.findOne({
      $and: [
        {_id: req.query._id},
        {scope: 'company'},
        {isVoid: false},
        {validate_email: true}
      ]
    })
      .lean()
      .exec((err, data) => {
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
    //GET SELECTED CUSTOMER
    function(callback){
      Customers.findOne({
        $or: [
          {
            $and: [
              {company_id: req.query._id},
              {customer_id: req.auth.credentials._id},
              {isVoid: false},
              {isPaid: false},
              {isStatus: 'Accepted'},
            ]
          },
          {
            $and: [
              {company_id: req.query._id},
              {customer_id: req.auth.credentials._id},
              {isVoid: false},
              {isPaid: false},
              {isStatus: 'Pending'},
            ]
          }
        ]
      })
        .lean()
        .exec((err, data) => {
            myPayment=data;
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
              myCollector=data;
              console.log(myCollector);
              return callback(null);
          });
        },
  ],
    function (callback){
      reply.view('borrower/dashboard/index.html', {
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

internals.add_payment = function (req, reply) {
  var code = parseInt(Cryptos.randomBytes(2).toString('hex'), 16);
  var base64Image = req.payload.image;

  var storagelink = "src/assets/uploads/OR/" + req.payload.amount + req.payload.refNum + req.auth.credentials._id + code;
  var linkOR = "/assets/uploads/OR/" + req.payload.amount + req.payload.refNum + req.auth.credentials._id + code;
  var ext = ".jpeg";

  var myCollects = {};
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
      }else if(data==null){
        return reply.redirect("/borrower/validateEmail?message=Error, invalid Account!&alertType=error");
      }
      return callback(null);
    });
  },
  //GET COLLECTDB ID
  function(callback){
    Customers.findOne({
      $and: [
        {_id: req.payload.customer_id},
        {isVoid: false},
        {isPaid: false}
      ]
    })
      .lean()
      .exec((err, data) => {
          if(err){
            console.log(err);
          }
          if(data==null){
            return reply.redirect('/borrower/dashboard?message=Error, please try again!&alertType=error');
          }
          myCollects=data;
          console.log(myCollects);
          return callback(null);
      });
    },
    //GET COMPANY SETTINGS
    function(callback){
      Settings.findOne({
        $and: [
          {company_id: myCollects.company_id},
        ]
      })
      .lean()
      .exec((err, data) => {
          if(err){
            console.log(err);
          }
          if(data.isOnlinePayment == false){
            return reply.redirect('/borrower/dashboard?message=Error, please try again!&alertType=error');
          }
          return callback(null);
      });
    },
  ],
    function (callback){
      Sharp(base64Image)
      .rotate()
      .resize({
          width: 500,
          height: 500,
          fit: Sharp.fit.cover,
      })
      .toFile(storagelink + ext)
      .then((data) => {
           console.log(data);
           console.log(storagelink);
          //PAYMENTS
          const payload = {
              staff_id: myCollects.staff_id,
              company_id: myCollects.company_id,
              branch_id: myCollects.branch_id,
              collector_id: myCollects.collector_id,
              customersDB_id: req.payload.customer_id,
              refNum: req.payload.refNum,
              amount: req.payload.amount,
              recieptIMG: linkOR + ext,
              isOnline: true,
              isStatus: false
          }
          var payment = new Collects(payload);
          payment.save(function (err, saveData) {
              if (err) {
                  console.log(err)
              } else {
                  console.log(saveData);
                  return reply.redirect('/borrower/dashboard?message=Payment successfully added!&alertType=success');
              }
          });
      })
      .catch((error) => {
          // error handeling
          console.log('ERROR: ',error);
      });
    }
  )
};
internals.update_payment = function (req, reply) {

  var credentials ={};
  var isVoid = req.payload.isVoid;
  var payment_id = req.payload.payment_id;
  console.log(payment_id, isVoid);

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
      if (err) {console.log(err);}
      if(data==null){
        return reply.redirect("/borrower/validateEmail?message=Error, invalid Account!&alertType=error");
      }
      credentials=data;
      console.log(credentials);
      return callback(null);
    });
  },
  function(callback) {
    Collects.findOne({
      $and: [
        {_id: payment_id},
        {isVoid: false},
        {isStatus: false},
        {isOnline: true}
      ]
    })
    .lean()
    .exec((err, data) => {
      if (err) {
        console.log(err);
      }
      if(data==null || isVoid != 'true'){
        return reply.redirect("/borrower/dashboard?message=Error, please try again!&alertType=error");
      }
      console.log(data);
      return callback(null);
    });
  },
  ],
    function (callback){
       //REMOVE Online Payment
       Collects.remove(
        {
          $and: [
            {_id: payment_id},
            {isVoid: false},
            {isOnline: true},
            {isStatus: false}
          ]
        },
        function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data)
            reply.redirect("/borrower/dashboard?message=Successfully Remove!&alertType=success");
          }
        },
      );
    }
  )
};
module.exports = internals;
