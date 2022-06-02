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
  Settings = require('../../../database/models/settings'),

  moment = require('moment');

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
  if (req.auth.credentials.validate_email == false) {
    reply.view('staff/validate/email.html', {
      message: req.query.message,
      alertType: req.query.alertType,
      credentials: req.auth.credentials,
    });
  } else {
    reply.redirect("/staff/dashboard");
  }
};

//VALIDATE EMAIL
internals.check = function (req, reply) {
  Users.findOne({ _id: req.auth.credentials._id })
    .lean()
    .exec((err, data) => {
      if (err) {
        console.log(err);
      } else {
        //VALIDATE ONLY NOT VALIDATED
        if (data.validate_email == false) {
          if (data.email_code == req.payload.email_code) {
            var payload = {
              validate_email: true
            }
            Users.update(
              { _id: req.auth.credentials._id },
              {
                $set: payload,
              },
              function (err, dataSave) {
                if (err) {
                  console.log(err);
                }
                console.log(dataSave.email);
                reply.redirect('/staff/profile?message=Successfully Activated,&alertType=success&newMessage=Please fillup the form&newAlertType=error');
              },
            );
          } else {
            reply.redirect('/staff/validateEmail?message=Error Invalid verification code&alertType=error');
          }
        } else {
          //ACCOUNT IS EMAIL VALIDATED
          reply.redirect("/staff/dashboard");
        }
      }
    });
}

//RESEND CODE
internals.resend = function (req, reply) {

  Users.findOne({ _id: req.auth.credentials._id })
    .lean()
    .exec((err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log('=====>', data.email)
        var code = parseInt(Cryptos.randomBytes(2).toString('hex'), 16);
        var payload = {
          email_code: code
        }
        //SMTP
        var mailOptions = {
          from: Config.smtp.email,
          to: data.email,
          subject: 'Easylend Email Verification',
          text: 'Your verification code: ' + payload.email_code,
        };
        //RESEND ONLY NOT VALIDATED
        if (req.auth.credentials.validate_email == false) {
          Users.update(
            { _id: req.auth.credentials._id },
            {
              $set: payload,
            },
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('=>', info);
                    reply.redirect('/staff/validateEmail?message=We already send your verifcation code&alertType=success');
                  }
                });
              }
            },
          );
        } else {
          //ACCOUNT IS EMAIL VALIDATED
          reply.redirect("/staff/dashboard");
        }
      }
    });
}

//UPDATE EMAIL
internals.update = function (req, reply) {
  var check_email = {};
  var code = parseInt(Cryptos.randomBytes(2).toString('hex'), 16);
  var payload = {
    email: req.payload.email,
    email_code: code
  }
  //SMTP
  var mailOptions = {
    from: Config.smtp.email,
    to: payload.email,
    subject: 'Easylend Email Verification',
    text: 'Your verification code: ' + payload.email_code,
  };
  Async.series(
    [
      (callback) => {
        var idx = payload.email.indexOf('@gmail.com');
        if (idx > -1) {
          return callback(null);
        } else {
          return reply.redirect(
            '/staff/validateEmail?message=Use your Gmail.&alertType=warning'
          );
        }
      },
      //CHECK EMAIL IF EXISTED
      (callback) => {
        Users.findOne({ email: payload.email })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            check_email = data;
            console.log('=================> CHECKING EMAIL', check_email);
            return callback(null);
          });
      }
    ],
    function (callback) {
      //NEW EMAIL
      if (check_email == null) {
        console.log('=================> NEW EMAIL');
        //UPDATE EMAIL ONLY NOT VALIDATED
        if (req.auth.credentials.validate_email == false) {
          console.log('=================> NOT VALIDATED');
          Users.update(
            { _id: req.auth.credentials._id },
            {
              $set: payload,
            },
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('=>', info);
                    reply.redirect('/staff/validateEmail?message=Update successfuly ' + req.payload.email + '&alertType=success');
                  }
                });
              }
            },
          );
        } else {
          //ACCOUNT IS EMAIL VALIDATED
          reply.redirect("/staff/dashboard");
        }
      } else {
        console.log('=================> OLD EMAIL');
        //EMAIL ALREADY EXIST
        reply.redirect('/staff/validateEmail?message=Error email already exist&alertType=error');
      }
    });
}

//COMPANY INVITATION
internals.company_invite = function (req, reply) {
  var credentials = {}, payload_staff= {}, payload_company={}, getStaff={}, getCompany={};
  if(req.payload.choice=='true'){
    payload_staff = {
      isCancel: false
    }
    payload_company = {
      isHired: true
    }
  }else if(req.payload.choice=='false'){
    payload_staff = {
      isCancel: true
    }
    payload_company = {
      isHired: false
    }
  }else{
    reply.redirect("/staff/profile?message=Error Invalid notification!&alertType=error");
  }
 
  Async.series(
    [
      function(callback) {
        //GET THIS USER INFO
        Users.findOne({_id: req.auth.credentials._id})
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
        //GET THIS STAFF
        Staffs.findOne({
          $and:[
            {_id: req.payload._id},
            {staff_id: credentials._id},
            {isCancel: false},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					getStaff=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET COMPANY FROM NOTIFICATION
        Users.findOne({
          $and:[
            {_id: getStaff.company_id},
            {scope: 'company'},
            {validate_email: true},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					getCompany=data;
					return callback(null);
				});
			},
    ],
    function (callback) {
      if(credentials.validate_email == true){
        //SMTP
        var mailOptions = {
        from: Config.smtp.email,
        to: getCompany.email,
        subject: 'Invitation from staff',
        text: 'Your invitation is accepted by '+ credentials.email,
      };
        Staffs.update(
          { 
            $and: [
              {_id: req.payload._id},
              {staff_id: credentials._id},
              {isCancel: false},
              {isVoid: false}
            ]  
          },
          {
            $set: payload_staff,
          },
          function (err, dataStaff) {
            if (err) {
              console.log(err);
            } else {
              Users.update(
                { 
                  $and: [
                    {_id: credentials._id},
                    {scope: 'staff'},
                    {isHired: false},
                    {validate_email: true},
                    {isVoid: false}
                  ]  
                },
                {
                  $set: payload_company,
                },
                function (err, dataCompany) {
                  if (err) {
                    console.log(err);
                  } else {
                    if(req.payload.choice=='true'){
                   
                      transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('=>', info);
                          reply.redirect("/staff/dashboard?message=Successfuly invitation accepted!&alertType=success");
                        }
                      });
                    }else{
                      reply.redirect("/staff/dashboard?message=Successfuly invitation deleted!&alertType=success");
                    }
                  }
                },
              );
            }
          },
        );
      }else{
        reply.redirect("/staff/validateEmail?message=Please Validate your email!&alertType=error");
      }
    }
  )
}

//NOT HIRED
internals.apply = function (req, reply) {
  var credentials = {}, notification = {}, company = {}, settings = {};
  Async.series([
    function(callback) {
      Users.findOne({
        $and: [
          {_id: req.auth.credentials._id},
          {isVoid: false},
          {validate_email: true},
          {isHired: false}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {console.log(err);}
        if(data==null){
          return reply.redirect("/staff/validateEmail?message=Error please validated your email!&alertType=error");
        }
        credentials=data;
        console.log(credentials);
        if(credentials.isUpdated==false){return reply.redirect("/staff/profile?message=Please updated your profile!&alertType=error&newMessage=Please fillup the form&newAlertType=error");}
      });
      return callback(null);
    },
    function(callback) {
      //GET THIS HIRING NOTIFCATION
      Staffs.find({
        $and: [
          {staff_id: req.auth.credentials._id},
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
      //GET HIS COMPANY
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
        console.log(company)
        return callback(null);
      });
    },
    function(callback) {
      //GET SETTINGS ONLINE PAYMENT
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
        settings=data;
        console.log(settings);
        return callback(null);
      });
    },
  ],
    function (callback){
      reply.view('staff/validate/apply.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: credentials,
        notification: notification,
        company: company,
        settings: settings
      });
    }
  )

};

//COMPANY EXPIRE
internals.expire = function (req, reply) {
  var credentials ={}, staffsInfo;
  Async.series([
    //CREDENTIALS
    (callback)=>{
      Users.findOne({
        $and: [
          { _id: req.auth.credentials._id },
          { isVoid: false }
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        credentials=data;
        console.log(credentials._id)
        return callback(null);
      });
    },
    //FIND STAFF INFO
    (callback)=>{
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
        staffsInfo=data.company_id;
        return callback(null);
      });
    },
    //CHECK COMPANY EXPIRATION
    (callback)=>{
      Users.findOne({
        $and: [
          {_id: staffsInfo},
          {isVoid: false},
          {validate_email: true}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        var todayDate = new Date();
        if(data.expiry_end > todayDate){
          return reply.redirect('/staff/dashboard');
        }
        return callback(null);
      });
    }
  ],
  function(callback){
    reply.view('staff/validate/expire.html', {
      message: req.query.message,
      alertType: req.query.alertType,
      credentials: req.auth.credentials
    });
  })
};
module.exports = internals;
