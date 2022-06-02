'use strict';

var internals = {},
  Crypto = require('../../lib/Crypto'),
  Cryptos = require('crypto'),
  _ = require('lodash'),
  moment = require('moment'),
  Async = require("async"),
  Nodemailer = require('nodemailer'),
  Users = require('../../database/models/users'),
  Settings = require('../../database/models/settings'),
  NodemailerLib = require('../../lib/Nodemailer');

  // var NodemailerLib = require('@lib/Nodemailer');

//NODEMAILER
var transporter = Nodemailer.createTransport({
  host: 'in-v3.mailjet.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: '851a44802051b71d7de6b2df46a46d80',
    pass: '7ea5216f5101165b7d68733e7fb25849',
  },
});

internals.index = function (req, reply) {
  if (req.auth.isAuthenticated) {
    if (req.auth.credentials.scope[0] === 'borrower') {
      return reply.redirect('/borrower/dashboard');
    }else if(req.auth.credentials.scope[0] === 'staff'){
      return reply.redirect('/staff/dashboard');
    }else if(req.auth.credentials.scope[0] === 'company'){
      return reply.redirect('/company/dashboard');
    }else if(req.auth.credentials.scope[0] === 'admin'){
      return reply.redirect('/admin/dashboard');
    }
  }
    req.cookieAuth.clear();
    reply.view('accounts/login.html', {
      message:req.query.message,
      alertType: req.query.alertType,
      success: req.query.success
    });
};

internals.login = function (req, reply) {
  req.cookieAuth.clear();
  reply.view('accounts/login.html', {
    message:req.query.message,
    alertType: req.query.alertType,
    success: req.query.success
  });
};

internals.logout = function (req, reply) {
  req.cookieAuth.clear();
  return reply.redirect('/login');
};

internals.register = function (req, reply) {
  reply.view('accounts/register.html', {
    message:req.query.message,
    alertType: req.query.alertType,     
    success: req.query.success
  });
};

internals.create_account = function (req, reply) {
  //Get server Date today to next month
  var date = new Date();
  var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()+31);
  var code = parseInt(Cryptos.randomBytes(2).toString('hex'), 16);
  var payload = {};

  //TODO ADD CUSTOMER INFORMATION
  if(req.payload.scope == 'company'){
    payload = {
      email_code: code,
      email: req.payload.email,
      scope: req.payload.scope,
      password: Crypto.encrypt(req.payload.password),
      validate_email: false,
      validate_account: false,
      expiry_start: startDate,
      expiry_end: endDate
    }
  }else{
    payload = {
      email_code: code,
      email: req.payload.email,
      scope: req.payload.scope,
      password: Crypto.encrypt(req.payload.password),
      validate_email: false,
      validate_account: false
    }
  }
  
  var check_email = {};
  Async.series(
		[
      (callback) => {
        var idx = payload.email.indexOf('@gmail.com');
        if (idx > -1) {
          return callback(null);
        } else {
          return reply.redirect(
            '/register?message=Use your personal gmail account.&alertType=warning'
          );
        }
      },
      (callback) => {
        Users.findOne({email: payload.email})
					.lean()
					.exec((err, data) => {
						if (err) {
							console.log(err);
						}
						check_email = data;
						return callback(null);
					});
      }
    ],
    function (callback) {
      if(check_email == null){
          //SMTP
          var mailOptions = {
            from: 'easylendcompany@gmail.com',
            to: payload.email,
            subject: 'Easylend Email Verification',
            text: 'Your verification code: ' + payload.email_code,
          };
          //NEW EMAIL
          //Check input scope
          if(payload.scope == 'borrower' || payload.scope == 'staff' || payload.scope == 'company'){
            var users = new Users(payload);
            users.save(function (err, data) {
              if (err) {
                reply(console.log(err));
              } else {
                //Check input scope
                if(data.scope[0] == 'borrower' && data.isVoid == false){
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('=>', info);
                      let user = data;
                      req.cookieAuth.set(user);
                      reply.redirect(
                        '/borrower/validateEmail?message=Hello ' + payload.email + ' you have successfully registered, Please validate your email&alertType=success'
                      );
                    }
                  });
                }else if(data.scope[0] == 'staff' && data.isVoid == false){
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('=>', info);
                      let user = data;
                      req.cookieAuth.set(user);
                      reply.redirect(
                        '/staff/validateEmail?message=Hello ' + payload.email + ' you have successfully registered, Please validate your email&alertType=success'
                      );
                    }
                  });
                }else if(data.scope[0] == 'company' && data.isVoid == false){
                  let user = data;
                  req.cookieAuth.set(user);
                  //ADD SETTINGS ONLINE PAYMENT SETTINGS FOR COMPANY
                  var settingsPayload = {
                    company_id: user._id
                  };
                  var saveSettings = new Settings(settingsPayload);
                  saveSettings.save(function (err, settingsData) {
                  console.log(settingsData);
                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log('=>', info);
                        reply.redirect(
                          '/company/validateEmail?message=Hello ' + payload.email + ' you have successfully registered, Please validate your email&alertType=success'
                        );
                      }
                    });
                  });
                }else{
                  //Invalid scope
                  reply.redirect(
                    '/register?message=Error invalid user&alertType=error'
                  );
                }
              }
            });
          }else{
            //Invalid scope
            reply.redirect(
              '/register?message=Error, Invalid type of user&alertType=error'
            );
          }
        }else{
        //Email exist
        console.log("EMAIL EXIST =>", payload.email);
          reply.redirect(
          '/register?message=Error email already exist&alertType=error'
        );
        }
    }
  );
};


module.exports = internals;
