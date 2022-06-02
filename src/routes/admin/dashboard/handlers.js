'use strict';

var internals = {},
  Async = require('async'),
  moment = require('moment'),
  
  Users = require('../../../database/models/users'),
  Total_customers = require('../../../database/models/total_customers'),
  Staffs = require('../../../database/models/staff'),
  Customers = require('../../../database/models/customers')
  ;

internals.index = function (req, reply) {
  var company=[], companyCnt, credentials={}, total_customers={}, company_expire = {};
  const now = new Date();
  let cntTotalCustomer;
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  console.log(firstDay); // 👉️ Sat Oct 01 2022 ...

  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  console.log(lastDay); // 👉️ Mon Oct 31 2022 ...


  Async.series([
    //CREDENTIALS
    (callback) => {
      Users.find({
        _id: req.auth.credentials
      })
      .lean()
      .exec((err, data) => {
        if(err){
          console.log(err)
        }
        credentials=data;
        //console.log(credentials)
        return callback(null);
      })
    },
    //FIND COMPANY
    (callback) => {
      Users.find({
        $and: [
          {scope: ['company']},
          {isVoid: false}
        ]
      })
      .lean()
      .exec((err, data) => {
        if(err){
          console.log(err)
        }
        console.log(data);
        data.forEach((data)=>{
          company.push({
            _id: data._id,
            company_name: data.company_name,
            email: data.email,
            expiry_start: data.expiry_start,
            expiry_end: data.expiry_end,
            firstname: data.firstname,
            middlename: data.middlename,
            lastname: data.lastname,
            phone_number: data.phone_number,
            profile_img: data.profile_img
          })
        })
        //console.log(company);
        return callback(null);
      })
    },
    //COUNT COMPANY
    (callback) => {
      Users.count({
        $and: [
          {scope: ['company']},
          {isVoid: false}
        ]
      })
      .lean()
      .exec((err, data) => {
        if(err){
          console.log(err)
        }
        companyCnt=data;
        //console.log(data);
        return callback(null);
      })
    },
    //FIND ALL COMPANY CUSTOMER
    (callback) => {
      Total_customers.find({ })
      .lean()
      .exec((err, data) =>{
        if(err){
          console.log(err)
        }
        total_customers=data;
        //console.log(data)
        return callback(null);
      });
    },
    (callback)=>{
      Users.find({
       $and:[
         {expiry_end: {$gte: firstDay, $lte: lastDay}},
         {scope: 'company'}
       ]
      })
      .lean()
      .exec((err, data)=>{
        company_expire=data;
        return callback(null);
      })
    }
  ],
  function(callback) {
    reply.view('admin/dashboard/index.html', {
      credentials: req.auth.credentials,
      message: req.query.message,
      alertType: req.query.alertType,
      company: company,
      companyCnt: companyCnt,
      total_customers: total_customers,
      company_expire
    });
  })
};

/*
 * 
 * SELECTED COMPANY
 *  
*/

internals.selected = function (req, reply) {
  let cntTotalCustomer;
  var credentials={}, company={},total_customers={}, staffsCnt, customerCnt;
  Async.series([
    //CREDENTIALS
    (callback) => {
      Users.find({
        _id: req.auth.credentials
      })
      .lean()
      .exec((err, data) => {
        if(err){
          console.log(err)
        }
        credentials=data;
        console.log(credentials)
        return callback(null);
      })
    },
    //FIND SELECT COMPANY
    (callback)=>{
      Users.findOne({
        _id: req.query._id
      })
      .lean()
      .exec((err, data) =>{
        company=data;
        console.log(data)
        return callback(null);
      });
    },
    //FIND ALL COMPANY CUSTOMER
    (callback) => {
      Total_customers.find({ 
        $and:[
          {isVoid: false},
          {company_id: req.query._id}
        ]
      })
      .lean()
      .exec((err, data) =>{
        if(err){
          console.log(err)
        }
        total_customers=data;
        console.log(data)
        return callback(null);
      });
    },
    (callback)=>{
      Customers.count({
        $and:[
          {company_id: req.query._id},
          {isVoid: false}
        ]
      })
      .lean()
      .exec((err, data)=>{
        cntTotalCustomer=data;
        return callback(null)
      })
    },
    //CNT AND TOTAL ALL CUSTOMER
    (callback)=>{
      var condition = {
        $and:[
          {isVoid: false},
          {company_id: req.query._id}
        ]
      }
      Total_customers.aggregate([
        { $match: condition },
        { $group: { 
          _id: null,
          total: { $sum: "$total" }
        }}
        ]).exec((err, data) => {
          if (data[0]) {
            customerCnt = data[0].total.toFixed(0);
          }else{
            customerCnt = 0;
          }
          console.log(customerCnt);
          return callback(null);
        });
    },
    //FIND SELECTED STAFFS CNT
    (callback) => {
      Staffs.count({
        $and: [
          {isVoid: false},
          {company_id: req.query._id}
        ]
      })
      .lean()
      .exec((err,data)=>{
        staffsCnt=data;
        console.log(data)
        return callback(null);
      });
    }
  ],
  (callback)=>{
    reply.view('admin/dashboard/selected-company.html', {
      credentials: req.auth.credentials,
      message: req.query.message,
      alertType: req.query.alertType,
      company:company,
      total_customers:total_customers,
      staffsCnt: staffsCnt,
      customerCnt: customerCnt,
      cntTotalCustomer
    });
  });

};

internals.checkout = (req, reply) => {
  var total = parseInt(req.payload.total) * parseInt(req.payload.payment);
  console.log(total, req.payload.payment_received);
  if(total!=parseInt(req.payload.payment_received)){
    reply.redirect("/admin/dashboard/selected?_id="+req.payload.company_id+"&message=Error receive payment is invalid updated!&alertType=danger");
  }else{
    var payload = {
      payment: req.payload.payment,
      isPaid: true,
      amount_received: req.payload.payment_received
    }
    Total_customers.updateOne(
      { _id: req.payload._id  },
      {
        $set: payload,
      },
      function (err, data) {
        if (err) {
          console.log(err);
        } else {
          reply.redirect("/admin/dashboard/selected?_id="+req.payload.company_id+"&message=Successfully updated!&alertType=success");
        }
      },
    );
  }
};

internals.expiration = (req, reply) => {
  var payload = {
    expiry_end: req.payload.date_expire
  }
  Users.updateOne(
    { _id: req.payload.company_id  },
    {
      $set: payload,
    },
    function (err, data) {
      if (err) {
        console.log(err);
      }else{
        reply.redirect("/admin/dashboard/selected?_id="+req.payload.company_id+"&message=Successfully updated!&alertType=success");
      }
    },
  );
}
module.exports = internals;
