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
  Branches = require('../../../database/models/branches'),
  Staffs = require('../../../database/models/staff'),
  Settings = require('../../../database/models/settings'),
  Capitals = require('../../../database/models/capitals'),
  Collectors = require('../../../database/models/collectors'),
  Calendars = require('../../../database/models/calendars'),

  moment = require('moment');
  //NODEMAILER
  var transporter = Nodemailer.createTransport({
    host: Config.smtp.host,
    port: Config.smtp.port,
    secure: false,
    requireTLS: true,
    auth: {
      user: '851a44802051b71d7de6b2df46a46d80',
      pass: '7ea5216f5101165b7d68733e7fb25849',
    },
  });

internals.index = function (req, reply) {
  var credentials = {}, notification ={}, staffs = {}, branches={}, myBranches={}, capitals={}, collectorsDB= {}, collector_info={}, calendars = {};
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
            reply.redirect("/staff/profile?message=Error&alertType=error");
					}
					credentials=data;
          if(credentials.isUpdated==false){return reply.redirect("/staff/profile?message=Please updated your profile!&alertType=error&newMessage=Please fillup the form&newAlertType=error");}
          if(credentials.isHired == false){return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");}
					return callback(null);
				});
			},
      function(callback) {
        //GET USERS COLLECTOR ONLY
        Users.find({
          $and: [
            {isVoid: false},
            {scope: 'collector'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          collector_info=data;
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
          console.log(notification)
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
          if(staffs==null){
            return reply.view('staff/settings/index.html', {
              credentials: credentials,
              message: req.query.message,
              alertType: req.query.alertType,
              newMessage: req.query.newMessage,
              newAlertType: req.query.newAlertType,
              notification: notification
            });
           }
					return callback(null);
				});
			},
      //CHECK IF COMPANY IS EXPIRE
      (callback)=>{
        Users.findOne({
          _id: staffs.company_id
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
      function(callback) {
        //GET ALL CAPITAL
        Capitals.find({
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
					capitals=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET STAFF BASES IN BRANCH
        Staffs.find({
          $and: [
            {staff_id: credentials._id},
            {company_id: staffs.company_id},
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
        //GET ALL COMPANY BRANCH
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
        //GET ALL COLLECTORS OF THIS COMPANY WITH THE SAME STAFF
        Collectors.find({
          $and: [
            {company_id: staffs.company_id},
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
					collectorsDB=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET CALLENDARS WITH SAME STAFF AND COMPANY
        Calendars.find({
          $and: [
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					calendars=data;
          console.log(calendars);
					return callback(null);
				});
			},
    ],
    function (callback) {
      reply.view('staff/settings/index.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: credentials,
        capitals: capitals,
        notification: notification,
        branches: branches,
        myBranches: myBranches,
        collectorsDB: collectorsDB,
        collector_info: collector_info,
        calendars: calendars
      });
    }
  )
};
//COLLECOTR
internals.add_collector = function (req, reply) {
  var credentials={}, findStaff={}, staffs = {}, companyOwner = {}, getUser = {};
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
            reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
					}
					credentials=data;
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
          console.log('COMPANY ID======', staffs.company_id);
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
          console.log('COMPANY OWNER======', companyOwner.company_name , companyOwner._id);
					return callback(null);
				});
			},
      function(callback){
        //FIND USERS EMAIL TO INVITE
        Users.findOne({
          $and: [
            {email: req.payload.email},
            {scope: 'collector'},
            {validate_email: true},
            {isVoid: false},
            {isHired: false}
          ]
        })
				.lean()
				.exec((err, dataHired) => {
					if (err) {
						console.log(err);
					}
          console.log(dataHired);
          if(dataHired==null){
            //EMAIL NOT FOUND OR UNREGISTERED
            return reply.redirect(
              "/staff/settings?message=Error, This customer is not found!&alertType=error"
            );
          }
          getUser=dataHired;
          return callback(null);
				});
      },
      function(callback){
        //CHECK IF COLLECTOR EMAIL IS ALREADY ADDED
        Collectors.findOne({
          $and: [
            {collector_id: getUser._id},
            {staff_id: credentials._id},
            {company_id: companyOwner._id},
            {branch_id: req.payload.branch_id},
            {isVoid: false},
            {isCancel: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          console.log('FOUND ==',data)
          if(data!=null){
            //EMAIL NOT FOUND
            return reply.redirect(
              "/staff/settings?message=Collector already added!&alertType=error"
            );
          }
          return callback(null);
				});
      },
      function(callback){
        //FIND BRANCH FOR ADDED 1 STAFF
        Staffs.findOne({
          $and: [
            {company_id: staffs.company_id},
            {branch_id: req.payload.branch_id },
            {staff_id: credentials._id },
            {isVoid: false},
            {isCancel: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          findStaff=data;
          console.log('Staff =====', findStaff);
          return callback(null);
				});
      }
    ],
    function (callback) {
        //SEND EMAIL AND SAVE DATA TO STAFFS
        var mailOptions = {
          from: Config.smtp.email,
          to: req.payload.email,
          subject: 'Company invitation',
          text: 'Congratulation your account is invited by '+ companyOwner.company_name+' Company',
        };
        var mname =  getUser.middlename;
        var payload = {
          company_id: companyOwner._id,
          staff_id: credentials._id,
          branch_id: req.payload.branch_id,
          collector_id: getUser._id
        };
        var collector = new Collectors(payload);
        collector.save(function(err, collectorSave) {
          if (err) {
            console.log(err);
          }else {
            console.log('SAVE DATA===>', collectorSave);
            var payloadStaffAdd = {
              count_collector: findStaff.count_collector//ADD IF ACCEPTED
            }
            Staffs.updateOne(
              {
                $and:[
                  {company_id: staffs.company_id},
                  {branch_id: req.payload.branch_id },
                  {staff_id: credentials._id },
                  {isVoid: false},
                  {isCancel: false}
                ]
              },
              {
                $set: payloadStaffAdd,
              },
              function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('UPDATE STATUS Staff===>', data);
                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log('EMAIL SENT=>', info);
                        return reply.redirect(
                          "/staff/settings?message=Successfully Added!&alertType=success"
                        );
                      }
                    });
                }
              },
            );
          }
        });
    }
  )
};
internals.update_collector = function (req, reply) {
  console.log('COLLECTOR DB ID',req.payload._id);
  console.log('USER DB ID',req.payload.user_id);

  var message ='';
  var credentials = {},findBranch={}, minusBranch={}, staffExist=false, companyOwner={}, staffs={}, findStaff={};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and:[
            {_id: req.auth.credentials._id},
            {isVoid: false},
            {validate_email: true},
            {isHired: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            reply.redirect("/staff/validateEmail?message=Please Validate your email!&alertType=error");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        //STAFF BASES
        Staffs.findOne({
          $and: [
            {staff_id: credentials._id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					staffs=data;
          console.log('COMPANY ID======', staffs.company_id);
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
      function(callback){
        //FIND USERS EMAIL TO INVITE
        Users.findOne({
          $and: [
            {_id: req.payload.user_id},
            {scope: 'collector'},
            {validate_email: true},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, dataHired) => {
					if (err) {
						console.log(err);
					}
          if(dataHired==null){
            //EMAIL NOT FOUND OR UNREGISTERED
            return reply.redirect(
              "/staff/settings?message=Email not found!&alertType=error"
            );
          }
          return callback(null);
				});
      },
      function(callback){
        //CHECK IF EMAIL IS ALREADY ADDED WITH SAME BRANCH
        Collectors.findOne({
          $and: [
            {collector_id: req.payload.user_id},
            {staff_id: credentials._id},
            {company_id: companyOwner._id},
            {branch_id: req.payload.branch_id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          console.log('FIND EMAIL ALREADY ADDED');
          if(data!=null && req.payload.isVoid=='false'){
            return reply.redirect(
              "/staff/settings?message=Error Collector already added, Please select another branch!&alertType=error"
            );
          }

          //CHECK IF COLLECTOR IS USE TO OTHER BRANCH WITH THE SAME COMPANY AND STAFF
          if(data==null){staffExist=true}
          else{staffExist=false}

          return callback(null);
				});
      },
      function(callback){
        //FIND STAFF FOR ADDED 1 COLLECTOR
        Staffs.findOne({
          $and: [
            {company_id: companyOwner._id},
            {branch_id: req.payload.branch_id },
            {staff_id: credentials._id },
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data==null){
            reply.redirect("/staff/settings?message=Error please try again!&alertType=error");
          }
          findStaff=data;
          console.log('Staff =====', findStaff);
          return callback(null);
				});
      },
      function(callback){
        //FIND OLD STAFF FOR MINUS 1 COLLECTOR
        Staffs.findOne({
          $and: [
            {company_id: companyOwner._id},
            {branch_id: req.payload.old_branch },
            {staff_id: credentials._id },
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          console.log('FIND BRANCH TO MINUS 1');
          if(data==null){
            reply.redirect("/staff/settings?message=Error please try again!&alertType=error");
          }
          minusBranch=data;
          console.log(data);
          return callback(null);
				});
      },
      function(callback) {
        //check if this collector is exists
        Collectors.findOne({
          $and: [
            {_id: req.payload._id},
            {company_id: companyOwner._id},
            {branch_id: req.payload.branch_id },
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          //COLLECTOR IS NOT EXISTS
          if(data==null){
            //CHANGE NEW BRANCH ADD COUNT
            var addCount = {
              count_collector: findStaff.count_collector+1
            }
            Staffs.updateOne(
              {
                $and:[
                  {branch_id: req.payload.branch_id },//NEW BRANCH
                  {staff_id: credentials._id},
                  {company_id: companyOwner._id},
                  {isVoid: false}
                ]
              },
              {
                $set: addCount,
              },
              function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('UPDATE STATUS BRANCH ADD===>', data);
                  //OLD BRANCH MINUS COUNT
                  var minusCount = {
                    count_collector: minusBranch.count_collector-1
                  }
                  Staffs.updateOne(
                    {
                      $and:[
                        {company_id: companyOwner._id},
                        {branch_id: req.payload.old_branch },
                        {staff_id: credentials._id },
                        {isVoid: false}
                      ]
                    },
                    {
                      $set: minusCount,
                    },
                    function (err, data) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log('UPDATE STATUS BRANCH MINUS===>', data);
                      }
                    },
                  );
                }
              },
            );
          }
					return callback(null);
				});
			},
    ],
    function (callback) {
      var payload = {}, payloadUsers = {}, payloadStaff={};
      if(req.payload.isVoid=='true'){
        message='Deleted';
        payload = {
          isVoid:true,
          isHired:false,
          branch_id: req.payload.branch_id,
        }
        //CHECK FIRST IF THERE ANOTHER BRANCH OF COLLECTOR THAT USED
        if(staffExist==false){
          payloadUsers={
            isHired: false
          }
        }
        console.log('=====>',  minusBranch.count_collector);
        payloadStaff = {
          count_collector: minusBranch.count_collector-1
        }
      }else{
        message='Updated';
        payload = {
          branch_id: req.payload.branch_id,
        }
      }
      //UPDATE STAFF DB
      Collectors.updateOne(
        {
          $and: [
            { _id: req.payload._id },
            { company_id: companyOwner._id },
            { isVoid: false}
          ]
        },
        {
          $set: payload,
        },
        function (err, updateCollector) {
          if (err) {
            console.log(err);
          } else {
            console.log('UPDATE COLLECTOR==>', updateCollector);
            //UPDATE USERS COLLECTORS isHired into TRUE OR FALSE, TRUE IF COLLECTORS NOT EXISTS
            Users.updateOne(
              {
                $and: [
                  { _id: req.payload.user_id },
                  { isVoid: false},
                  { validate_email: true}
                ]
              },
              {
                $set: payloadUsers,
              },
              function (err, updateUser) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('UPDATE USER==>', updateUser);
                  //MINUS COUNT STAFF IF DELETED
                  Staffs.updateOne(
                    {
                      $and:[
                        {company_id: companyOwner._id},
                        {branch_id: req.payload.old_branch },
                        {staff_id: credentials._id },
                        {isVoid: false}
                      ]
                    },
                    {
                      $set: payloadStaff,
                    },
                    function (err, data) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log('UPDATE STATUS STAFF===>', data);
                        reply.redirect("/staff/settings?message=Successfully "+message+"!&alertType=success");
                      }
                    },
                  );
                }
              },
            );
          }
        },
      );
    }
  )
};

//CAPITAL
internals.add_capital = function (req, reply) {
  var credentials = {}, staffs = {};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and: [
            {_id: req.auth.credentials._id},
            {isVoid: false},
            {isHired: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        Staffs.findOne({
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
					staffs=data;
          console.log('MY COMPANY ID===>', staffs.company_id);
					return callback(null);
				});
			},
      function(callback) {
        Capitals.findOne({
          $and: [
            {value: req.payload.value},
            {company_id: staffs.company_id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data!=null){
            return reply.redirect(
              "/staff/settings?message=Error Capital is exist!&alertType=error"
            );
          }
          return callback(null);
				});
			},
    ],
    function (callback) {
      if(credentials.validate_email == true){
        var payload = {
          value: req.payload.value,
          company_id: staffs.company_id
        };
        var capital = new Capitals(payload);
        capital.save(function(err, capitalData) {
          if (err) {
          console.log(err);
          }else {
            console.log(capitalData);
          return reply.redirect(
            "/staff/settings?message=Successfully Created!&alertType=success"
          );
          }
        });
      }else{
        reply.redirect("/staff/validateEmail?message=Please Validate your email!&alertType=error");
      }
    }
  )
};
internals.update_capital = function (req, reply) {
  var credentials = {}, staffs={};
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
            reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        Staffs.findOne({
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
					staffs=data;
          console.log('MY COMPANY ID===>', staffs.company_id);
					return callback(null);
				});
			},
      function(callback) {
        Capitals.findOne({
          $and: [
            {value: req.payload.value},
            {company_id: staffs.company_id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data!=null){
            if(req.payload.isVoid!='true'){
              return reply.redirect(
                "/staff/settings?message=Error Capital is exist!&alertType=error"
              );
            }
          }
          return callback(null);
				});
			},
    ],
    function (callback) {
      if(req.payload.isVoid=='true'){
        //REMOVE CAPITAL
          Capitals.remove(
            {
              $and:[
                {company_id: staffs.company_id },
                {_id: req.payload._id  },
                {isVoid: false}
              ]
            },
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                reply.redirect("/staff/settings?message=Successfully Remove!&alertType=success");
              }
            },
          );
        }else{
          var payload = {
            value: req.payload.value,
          }
          Capitals.updateOne(
            {
              $and:[
                {company_id: staffs.company_id },
                {_id: req.payload._id  },
                {isVoid: false}
              ]
            },
            {
              $set: payload,
            },
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                reply.redirect("/staff/settings?message=Successfully Updated!&alertType=success");
              }
            },
          );
        }
    }
  )
};

module.exports = internals;
