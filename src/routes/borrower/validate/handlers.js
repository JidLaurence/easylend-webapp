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
  
  moment = require('moment');

  var transporter = Nodemailer.createTransport({
    host: Config.smtp.host,
    port: Config.smtp.port,
    secure: false,
    requireTLS: true,
    auth: {
      user: Config.smtp.user,
      pass: Config.smtp.pass,
    },
  });
  
  internals.index = function (req, reply) {
    if(req.auth.credentials.validate_email == false){
      reply.view('borrower/validate/email.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: req.auth.credentials,
      });
    }else{
      reply.redirect("/borrower/dashboard");
    }
  };
  
  //VALIDATE EMAIL
  internals.check = function (req, reply) {
    Users.findOne({_id: req.auth.credentials._id})
    .lean()
    .exec((err, data) => {
      if (err) {
        console.log(err);
      }else{
          //VALIDATE ONLY NOT VALIDATED
          if(data.validate_email == false){
            if(data.email_code == req.payload.email_code){
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
                  reply.redirect('/borrower/profile?message=Successfully Activated,&alertType=success&newMessage=Please fillup the form&newAlertType=error');
                },
              );
            }else{
              reply.redirect('/borrower/validateEmail?message=Error Invalid verification code&alertType=error');
            }
          }else{
            //ACCOUNT IS EMAIL VALIDATED
            reply.redirect("/borrower/dashboard");
          }
      }
    });
  }
  
  //RESEND CODE
  internals.resend = function (req, reply) {
  
    Users.findOne({_id: req.auth.credentials._id})
    .lean()
    .exec((err, data) => {
      if (err) {
        console.log(err);
      }else{
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
        if(req.auth.credentials.validate_email == false){
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
                    reply.redirect('/borrower/validateEmail?message=We already send your verifcation code&alertType=success');
                  }
                });
              }
            },
          );
        }else{
          //ACCOUNT IS EMAIL VALIDATED
          reply.redirect("/borrower/dashboard");
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
              '/borrower/validateEmail?message=Use your Gmail.&alertType=warning'
            );
          }
        },
        //CHECK EMAIL IF EXISTED
        (callback) => {
          Users.findOne({email: payload.email})
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
        if(check_email==null){
          console.log('=================> NEW EMAIL');
           //UPDATE EMAIL ONLY NOT VALIDATED
          if(req.auth.credentials.validate_email == false){
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
                      reply.redirect('/borrower/validateEmail?message=Update successfuly '+ req.payload.email +'&alertType=success');
                    }
                  });
                }
              },
            );
          }else{
            //ACCOUNT IS EMAIL VALIDATED
            reply.redirect("/borrower/dashboard");
          }
        }else{
          console.log('=================> OLD EMAIL');
        //EMAIL ALREADY EXIST
          reply.redirect('/borrower/validateEmail?message=Error email already exist&alertType=error');
        }
      });
  }
module.exports = internals;
