"use strict";

var internals = {},
  Crypto = require('../../lib/Crypto'),
  moment = require('moment'),

  Users = require('../../database/models/users'),
  Staff = require('../../database/models/staff');

internals.noscript = function(req, reply) {
  reply.view("noscript.html");
};
internals.error404 = function(req, reply) {
  reply.view("error404.html");
};
internals.landing = function (req, reply) {
  req.cookieAuth.clear();
  reply.view('landing.html', {
    message: req.query.message,
    alertType: req.query.alertType,
  });
};
internals.contactUs = function (req, reply) {
  reply.view('contactUs.html', {
    message: req.query.message,
    alertType: req.query.alertType,
  });
};

internals.web_authentication = async function (req, reply) {
  let email = req.payload.email;
  let password = req.payload.password;
  let company_id;
  console.log('TEST =============> ', req.payload);

  if(email ==null || password ==null || email =='' || password ==''){
    return reply.redirect('/login?message=Please fill up the form&alertType=error');
  }

  let data = await Users.findOne({
    $and: [
      {email: email},
      {password: Crypto.encrypt(password)}
    ]
  }).lean();

  //ACCOUNT NOT FOUND
  if(data==null){
    return reply.redirect('/login?message=Authentication failed!&alertType=danger');
  }
  
  //ACCOUNT FOUND!
  req.cookieAuth.set(data);
  switch(data.scope[0]){
    case 'admin':
    return reply.redirect('/admin/dashboard');

    case 'company':
    var dateToday = new Date();
    var dateEnd = new Date(data.expiry_end);
    if(dateEnd < dateToday){
      return reply.redirect('/company/expire');
    }else if(data.validate_email == false){
      return reply.redirect('/company/validateEmail');
    }else if(data.isUpdated == false){
      return reply.redirect('/company/profile?newMessage=Please fillup the form&newAlertType=danger');
    }else{
      return reply.redirect('/company/dashboard');
    }

    case 'staff':
    if(data.validate_email == false){
      return reply.redirect('/staff/validateEmail');
    }else if(data.isUpdated == false){
      return reply.redirect('/staff/profile?newMessage=Please fillup the form&newAlertType=danger');
    }else{
      return reply.redirect('/staff/dashboard');
    }
  
    case 'borrower':
    if(data.validate_email == false){
      return reply.redirect('/borrower/validateEmail');
    }else if(data.isUpdated == false){
      return reply.redirect('/borrower/profile?newMessage=Please fillup the form&newAlertType=danger');
    }else{
      return reply.redirect('/borrower/dashboard');
    }
    
    case 'collector':
      // if(data.validate_email == false){
      //   return reply.redirect('/collector/validateEmail');
      // }else if(data.isUpdated == false){
      //   return reply.redirect('/collector/profile?newMessage=Please fillup the form&newAlertType=danger');
      // }else{
      //   return reply.redirect('/collector/dashboard');
      // }
    default:
    req.cookieAuth.clear();
    return reply.redirect('/login?message=Authentication failed!&alertType=danger');
  }
 
};

module.exports = internals;
