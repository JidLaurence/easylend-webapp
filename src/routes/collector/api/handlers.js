"use strict";

var internals = {},
  Crypto = require("../../../lib/Crypto"),
  Cryptos = require("crypto"),
  _ = require("lodash"),
  moment = require("moment"),
  Async = require("async"),
  Nodemailer = require("nodemailer"),
  Sharp = require("sharp"),
  Users = require("../../../database/models/users"),
  Branches = require("../../../database/models/branches"),
  Staffs = require("../../../database/models/staff"),
  Settings = require("../../../database/models/settings"),
  Capitals = require("../../../database/models/capitals"),
  Collectors = require("../../../database/models/collectors"),
  Calendars = require("../../../database/models/calendars"),
  Customers = require("../../../database/models/customers"),
  Collect_dates = require("../../../database/models/collect_dates"),
  Collects = require("../../../database/models/collects"),
  Ranges = require("../../../database/models/ranges"),
  moment = require("moment");

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

internals.signup = async function (req, reply) {
  var invalidToken = {
    status: false,
    message: "Invalid Token"
  };
    //check api token
    var checkToken = await check_tokenApi(req.payload.apiToken);
    if (checkToken) return reply(invalidToken);

    
  var code = parseInt(Cryptos.randomBytes(2).toString('hex'), 16);

  if(req.payload.email == '' || req.payload.password == ''){
    return reply({status: false, message: 'Please fillup the form'})
  }
  var usersFind = await Users.findOne({
    email: req.payload.email
  }).lean();

  if(usersFind!=null){
    return reply({status: false, message: 'Email already exist'})
  }

  var payload = {
    email: req.payload.email,
    password: Crypto.encrypt(req.payload.password),
    scope: ['collector'],
    email_code: code
  }
  // try {
    await Users.create(payload, function (err, data) {
      if (err) {
        console.log(err);
        return reply({
          message: "Error, to create",
          status: false,
          data: err,
        });
      }
      console.log(data);
        //SMTP
        var mailOptions = {
          from: 'easylendcompany@gmail.com',
          to: data.email,
          subject: 'Easylend Email Verification',
          text: 'Your verification code: ' + code,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('=>', info);
            return reply({
              message: "Successfully created",
              status: true
            });
          }
        });
        // return reply({
        //   message: "Successfully created",
        //   status: true
        // });
    });
  // } catch (err) {
  //   return reply({
  //     message: "Error please fillup the form correctly",
  //     status:false,
  //     err,
  //   });
  // }
}
internals.update_profile = async function (req, reply) {
  console.log(req.payload);

  var invalidToken = {
    status: false,
    message: "Invalid Token",
    alertType: "error",
  };
    //check api token
    var checkToken = await check_tokenApi(req.payload.apiToken);
    if (checkToken) return reply(invalidToken);


  var payload = {
    password: Crypto.encrypt(req.payload.password),
    firstname: req.payload.firstname,
    lastname: req.payload.lastname,
    middlename: req.payload.middlename,
    phone_number: req.payload.phone_number,
    isUpdated: true
  }
  if(payload.password==null||payload.firstname==null|| payload.lastname==null||payload.middlename==null||payload.phone_number==null){
    return reply({status: false, message: 'Please fillup the form correctly'})
  }
  var updateProfile = await Users.findOneAndUpdate({
    _id: req.payload._id
  },{
    $set: payload
  }).lean();

  if(!updateProfile){
    return reply({status: false, message: 'Error, failed to update'});
  }

  return reply(
    {
      status: true,
      message: 'Successfuly updated',
      firstname: updateProfile.firstname,
      lastname: updateProfile.lastname,
      middlename: updateProfile.middlename,
      phone_number: updateProfile.phone_number,
      password: Crypto.decrypt(updateProfile.password)
    })
}
internals.update_code = async function (req, reply) {
  console.log(req.payload);

  var invalidToken = {
    status: false,
    message: "Invalid Token"
  };
    //check api token
    var checkToken = await check_tokenApi(req.payload.apiToken);
    if (checkToken) return reply(invalidToken);

  var payload = {
    isVerified: true,
    validate_email: true
  }
  if(req.payload.email_code==null||req.payload._id==null){
    return reply({status: false, message: 'Please fillup the form correctly'})
  }
  var updateProfile = await Users.findOneAndUpdate({
    $and:[
      { _id: req.payload._id},
      { email_code: req.payload.email_code}
    ]
  },{
    $set: payload
  }).lean();

  if(!updateProfile){
    return reply({status: false, message: 'Error, invalid code'});
  }
  var get_company = await Collectors.findOne({
    $and: [
      {collector_id: req.payload._id},
      {isCancel: false},
      {isVoid: false}
    ]
  })
  .populate('company_id')
  .lean();

  return reply(
    {
      status: true,
      message: 'Verified',
      isVerified: updateProfile.isVerified,
      isHired: false,
      company_name: get_company._id,
      company_id: get_company.company_id.company_name + ' Company invited you'
    })
}
internals.accept_company = async function (req, reply) {
  console.log(req.payload);
  
  if(req.payload.status=='true' || req.payload.status==true){
    req.payload.status=true
  }else{
    req.payload.status=false
  }

  let statusCollectors=true;
  if(req.payload.status==true){
    statusCollectors=false
  }
  let userPayload ={
    isHired: req.payload.status
  };

  let collectorsPayload = {
    isCancel: statusCollectors
  };
  var invalidToken = {
    status: false,
    message: "Invalid Token"
  };

    //check api token
    var checkToken = await check_tokenApi(req.payload.apiToken);
    if (checkToken) return reply(invalidToken);

  var updateProfile = await Users.findOneAndUpdate({
    _id: req.payload._id
  },{
    $set: userPayload
  }).lean();

  if(!updateProfile){
    return reply({status: false, message: 'Error, invalid _id'});
  }
  console.log(updateProfile);

  var updateCollectors = await Collectors.findOneAndUpdate({
    _id: req.payload.company_id
  },{
    $set: collectorsPayload
  }).lean();

  //message
  let message = 'Successfully canceled'
  if(req.payload.status){
    message ='Sucessfull accepted'
  }
  console.log(updateCollectors)
  return reply(
    {
      status: true,
      message :message
    })
}


internals.login = async function (req, reply) {
  var getDateToday = new Date();
  let dayToday = String(getDateToday.getDate()).padStart(2, "0");
  var yearToday = getDateToday.getFullYear();
  var monthToday = getDateToday.getMonth() + 1;
  let data = {};

  let collectedToday = [];
  var invalidToken = {
    companyStatus:true,
    status: false,
    message: "Invalid Token"
  };
  var invalidAccount = {
    companyStatus:true,
    status: false,
    message: "Invalid Account"
  };

  console.log(req.payload);

  //check api token
  var checkToken = await check_tokenApi(req.payload.apiToken);
  if (checkToken) return reply(invalidToken);

  //LOGIN AND GET COLLECTOR CUSTOMER
  let collectorInfo = await check_users(req.payload);
  if (collectorInfo == null) return reply(invalidAccount);

  data._id = collectorInfo._id;
  data.email = collectorInfo.email;
  data.password = Crypto.decrypt(collectorInfo.password);
  data.firstname = collectorInfo.firstname;
  data.middlename = collectorInfo.middlename;
  data.lastname = collectorInfo.lastname;
  data.phone_number = collectorInfo.phone_number;
  data.isUpdated = collectorInfo.isUpdated;
  data.company_name='';
  data.company_id='';
  data.message = "";
  //check if email is verified
  if(collectorInfo.isVerified==false){
    data.companyStatus=true,
    data.status = true;
    data.isVerified = false;
    data.message = "Please verify your email";
    console.log(data);
    return reply(data)
  }

    //check if user is hired
        var companyInvite = await Collectors.findOne({
          $and:[
            {collector_id: collectorInfo._id},
            {isCancel: false},
            {isVoid: false}
          ]
        })
        .populate('company_id')
        .lean();
      console.log(companyInvite);

    if(companyInvite!=null && collectorInfo.isHired==false){
        data.company_name=companyInvite.company_id.company_name + ' Company invited you';
        data.company_id=companyInvite._id;
        data.companyStatus = false;
        data.isVerified = true;
        data.status=true;
        data.isUpdated=true;
        data.message = "It's seems you're not hired";
        console.log(data);
        return reply(data)
    }

  //check if user is updated
  if(collectorInfo.isUpdated==false){
    data.companyStatus = true;
    data.isVerified = true;
    data.status=true;
    data.isUpdated=false;
    data.message = "Please update your profile";
    console.log(data);
    return reply(data)
  }


  //GET COMPANY INFO
  var getCompanyInfo = await Collectors.findOne({
    collector_id: collectorInfo._id,
  }).lean();


  var getCustomer = await Customers.find({
    $and: [
      { collector_id: collectorInfo._id },
      { isStatus: "Accepted" },
      { isVoid: false },
      { isPaid: false },
    ],
  })
    .populate("collect_dates_id customer_id")
    .lean();
  var collectedCustomers = await Collects.find({
    $and:[
      {collector_id: collectorInfo._id},
      {isVoid: false},
      {day: parseInt(dayToday) + 1},
      {month: monthToday},
      {year: yearToday}
    ]
  }).lean();
  //Add amount in every date
  getCustomer.forEach((element) => {
    collectedCustomers.forEach((customers)=>{
      element.collect_dates_id.dates.forEach((date) => {
        if(customers.customersDB_id.toString() == element._id.toString() ){
          date.amount=customers.amount;
        }else{
          date.amount=0;
        }
      })
    });
  });

  //check if date is equal today and amount is lessthan collect
  getCustomer.forEach((element) => {
          element.collect_dates_id.dates.forEach((date) => {
            if (
              date.mm == monthToday &&
              date.dd == parseInt(dayToday) && //JED REMOVE ADD FOR DEMO
              date.yy == yearToday
            ) {
              var mname = element.customer_id.middlename;
            
              if(mname==null || mname==''){
                mname='';
              }else {
                mname=mname.charAt(0);
              }
             

              collectedToday.push({
                _id: element._id,
                customer_id: element.customer_id._id,
                company_id: element.company_id,
                branch_id: element.branch_id,
                staff_id: element.staff_id,
                collector_id: collectorInfo._id,
                collect_dates_id: element.collect_dates_id._id,
    
                customer_id: element.customer_id._id,
                email: element.customer_id.email,
                firstname: element.customer_id.firstname+' '+mname+' '+element.customer_id.lastname,
                lastname: element.customer_id.lastname,
                middlename: element.customer_id.middlename,
                phone_number: element.customer_id.phone_number,
                address: element.customer_id.barangay +' '+element.customer_id.address,
                barangay: element.customer_id.barangay,
                city: element.customer_id.city,
                province: element.customer_id.province,
                region: element.customer_id.region,
    
                amount: 0,
                capital: element.capital,
                months: element.months,
                type: element.type,
                interest: element.interest,
                total_payed: element.total_payed,
                balance: element.balance,
                collect: element.collect,
                capital_total: element.capital_total,
                capital_interest: element.capital_interest,

                month: date.mm,
                day: date.dd,
                year: date.yy,
    
                isPaid: element.isPaid,
                lapses: element.lapses,
              });
            }
          });
  });

  data.isVerified = true;
  data.status = true;
  data.isUpdated=true
  data.companyStatus=true,
  data.status = true;
  data.message = "Successfully login";
  data.address = collectorInfo.address;
  data.barangay = collectorInfo.barangay;
  data.birthday = collectorInfo.birthday;
  data.city = collectorInfo.city;
  data.region = collectorInfo.region;
  data.company_id = getCompanyInfo.company_id;
  data.staff_id = getCompanyInfo.staff_id;
  data.branch_id = getCompanyInfo.branch_id;
  data.data = collectedToday;
  console.log(data);
  return reply(data);
};
internals.get_invitation = async function (req, reply) {
  console.log(req.payload);

  var invalidToken = {
    status: false,
    message: "Invalid Token"
  };
    //check api token
    var checkToken = await check_tokenApi(req.payload.apiToken);
    if (checkToken) return reply(invalidToken);
  var get_company = await Collectors.findOne({
    $and: [
      {collector_id: req.payload._id},
      {isCancel: false},
      {isVoid: false}
    ]
  })
  .populate('company_id')
  .lean();

  return reply(
    {
      company_name: get_company._id,
      company_id: get_company.company_id.company_name + ' Company invited you'
    })
};

internals.save_collected_today = async function (req, reply) {
  //check account
  //payAt = date today
  //day = day collected
  //month = month collected
  //year = year collected


  //check api token
  var checkToken = await check_tokenApi(req.payload.apiToken);
  if (checkToken) return reply(invalidToken);

  console.log('==============================================================================');
  console.log(req.payload);
  req.payload.customersDB_id = req.payload.customerDB_id;
  let payload = req.payload;
    Collects.create(payload, function (err, data) {
      if(err) console.log('=> ', err);

      console.log('=> ',data);
      return reply({status: true});
  })
};


/**************************************************
 ************** FUNCTION ***************************
 ***************************************************/
const check_users = async function (payload) {
  var collectorInfo = await Users.findOne({
    $and: [
      { email: payload.email },
      { password: Crypto.encrypt(payload.password) },
      { scope: ["collector"] },
    ],
  }).lean();

  return collectorInfo;
};

const check_tokenApi = async function (apiToken) {
  var partialAPITOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NTA5NjI4MTR9.nR_lR_aesEN_LEM76uDOrLp5oFE83qwoyN3U4QeWM8w";
  if (partialAPITOKEN == apiToken) return false;
  return true;
};
module.exports = internals;
