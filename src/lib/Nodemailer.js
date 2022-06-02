"use strict";

const Nodemailer = require('nodemailer');
let Config = require('../config');

//NODEMAILER CONFIG
exports.sendEmail = async function (email, subject, content) {
  
  let transporters = Nodemailer.createTransport({
    host:  Config.smtp.host,
    port: Config.smtp.port,
    secure: false,
    requireTLS: true,
    auth: {
      user: Config.smtp.user,
      pass: Config.smtp.pass
    }
  });
  let mailOptions = {
    from: Config.smtp.email,
    to: email,
    subject: subject,
    text: content,
  }
  return transporters.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};