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
  Staffs = require('../../../database/models/staff'),
  Ranges = require('../../../database/models/ranges'),

  moment = require('moment');

internals.index = function (req, reply) {
  console.log(req.auth.credentials._id);
  var credentials = {}, notification ={}, company ={}, ranges = {};
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
            reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
					}
					credentials=data;
          console.log(credentials);
					return callback(null);
				});
			},
      function(callback) {
        //GET THIS HIRING NOTIFCATION
        Staffs.find({
          $or: [
            {
              $and: [
                {staff_id: credentials._id},
                {isVoid: false},
                {isCancel: false}
              ]
            }
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					notification=data;
          console.log(notification);
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
          console.log(company);
					return callback(null);
				});
			},
      function(callback) {
        //GET HIS COMPANY
        Ranges.find({})
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					ranges=data;
          console.log(ranges)
					return callback(null);
				});
			},
    ],
    function (callback) {
      reply.view('staff/profile/index.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
        notification: notification,
        company: company,
        ranges: ranges
      });
    }
  )
};

internals.update = function (req, reply) {
  var credentials = {};
  Async.series(
    [
      function(callback) {
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
    ],
    function (callback) {
      if(credentials.validate_email == true){
      var payload = {
        birthday: req.payload.birthday,
        phone_number: req.payload.phone_number,
        firstname: req.payload.firstname,
        lastname: req.payload.lastname,
        middlename: req.payload.middlename,
        region: req.payload.region_name,
        province: req.payload.province_name,
        city: req.payload.city_name,
        barangay: req.payload.barangay_name,
        address: req.payload.address,
        isUpdated: true
      };
      console.log(payload.address);
      if(payload.company_name !='' || payload.birthday!='' || payload.firstname!='' || payload.lastname!='' || payload.region !='' ||
      payload.middlename !=''|| payload.city !=''|| payload.barangay !=''||payload.province !=''||payload.address !=''){
            Users.update(
              { _id: req.auth.credentials._id  },
              {
                $set: payload,
              },
              function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  reply.redirect("/staff/profile?message=Successfully updated!&alertType=success");
                }
              },
            );
        }else{
          //IF INPUT TEXT IS NULL
          reply.redirect("/staff/profile?message=Error Please fillup the form!&alertType=error");
        }
      }else{
        reply.redirect("/staff/validateEmail?message=Please Validate your email!&alertType=error");
      }
    }
  )
};

//CHANGE PROFILE PICTURE
internals.update_img = function (req, reply) {

  var base64Image = req.payload.image;
  var storagelink = "src/assets/uploads/PROFILE/" + req.auth.credentials._id;
  var linkOR = "/assets/uploads/PROFILE/" +  req.auth.credentials._id;
  var ext = ".jpeg";

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
      }else if(data==null){
        return reply.redirect("/staff/validateEmail?message=Error, invalid Account!&alertType=error");
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

          //CHANGE PROFILE PIC LINK
          const payload = {
            profile_img: linkOR + ext,
          }
          Users.update(
            {
              $and: [
                {_id: req.auth.credentials._id},
                {isVoid: false},
                {validate_email: true}
              ]
            },
            {
              $set: payload,
            },
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                console.log(data)
                return reply.redirect('/staff/profile?message=Successfully uploaded!&alertType=success');
              }
            },
          );
      })
      .catch((error) => {
          // error handeling
          console.log('ERROR: ',error);
          return reply.redirect('/staff/profile?message=Please try again!&alertType=error');
      });
    }
  )
};
module.exports = internals;
