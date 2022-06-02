'use strict';

var internals = {},
  Config = require('../../../config'),
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
    }
  });

internals.index = function (req, reply) {
  var credentials = {}, branches = {}, staffs = {}, staffs_info={},capital={}, settings={};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and: [
            {_id: req.auth.credentials._id},
            {validate_email: true},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {console.log(err);return reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
					}else if(data==null){return reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger")};
					credentials=data;
          var todayDate = new Date();
          if(credentials.expiry_end < todayDate){
            return reply.redirect('/company/expire');
          }
          if(credentials.isUpdated==false){return reply.redirect("/company/profile?message=Please updated your profile!&alertType=danger");}
					return callback(null);
				});
			},
      function(callback) {
        //GET BRANCH OF THIS COMPANY
        Branches.find({
          $and: [
            {company_id: credentials._id},
            {isVoid: false}
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
        //GET USERS STAFF ONLY
        Users.find({
          $and: [
            {isVoid: false},
            {scope: 'staff'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          staffs_info=data;
					return callback(null);
				});
			},
      function(callback) {
        Staffs.find({
          $and: [
            {company_id: credentials._id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					staffs=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET ALL CAPITAL
        Capitals.find({
          $and: [
            {company_id: credentials._id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					capital=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET SETTINGS ONLINE PAYMENT
        Settings.findOne({
          $and: [
            {company_id: credentials._id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					settings=data;
					return callback(null);
				});
			},
    ],
    function (callback) {
      reply.view('company/settings/index.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: credentials,
        branches: branches,
        staffs: staffs,
        staffs_info: staffs_info,
        capital: capital,
        settings: settings
      });
    }
  )
};
//BRANCH
internals.add_branch = function (req, reply) {
  var credentials = {};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and: [
            {_id: req.auth.credentials._id},
            {validate_email: true},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
					}
					credentials=data;
					return callback(null);
				});
			},
    ],
    function (callback) {
      var payload = {
        company_id: credentials._id,
        name: req.payload.name,
        region: req.payload.region_name,
        province: req.payload.province_name,
        city: req.payload.city_name,
        barangay: req.payload.barangay_name

      };
      var branch = new Branches(payload);
      branch.save(function(err, branch) {
        if (err) {
        console.log(err);
        }else {
        return reply.redirect(
          "/company/settings?message=Successfully Created!&alertType=success"
        );
        }
      });
    }
  )
};
internals.update_branch = function (req, reply) {
  var message ='';
  var credentials = {};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and: [
            {_id: req.auth.credentials._id},
            {validate_email: true},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
					}
					credentials=data;
					return callback(null);
				});
			},
    ],
    function (callback) {
      //CHECK IF THIS EMAIL IS VALIDATED
      var payload = {};
      if(req.payload.isVoid=='true'){
        message='Deleted';
        payload = {
          isVoid:true,
        }
      }else{
        message='Updated';
        payload = {
          // name: req.payload.name,
          // region: req.payload.region,
          // province: req.payload.province,
          // city: req.payload.city,
          // barangay: req.payload.barangay
        }
      }
      Branches.update(
        {
          $and:[
            {company_id: credentials._id  },
            {_id: req.payload._id  }
          ]
        },
        {
          $set: payload,
        },
        function (err, data) {
          if (err) {
            console.log(err);
          } else {
            reply.redirect("/company/settings?message=Successfully "+message+"!&alertType=success");
          }
        },
      );
    }
  )
};
//STAFF
internals.add_staff = function (req, reply) {
  var credentials={}, findStaff={}, findBranch={};
  Async.series(
    [
      function(callback) {
        //FIND THIS USER
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
      function(callback){
        //FIND USERS EMAIL TO INVITE
        Users.findOne({
          $and: [
            {email: req.payload.email},
            {scope: 'staff'},
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
            //EMAIL NOT FOUND
            return reply.redirect(
              "/company/settings?message=Email not found!&alertType=danger"
            );
          }
          findStaff=dataHired;
          console.log(findStaff.email)
          return callback(null);
				});
      },
      function(callback){
        //CHECK IF EMAIL IS ALREADY ADDED
        Staffs.findOne({
          $and: [
            {staff_id: findStaff._id},
            {isVoid: false},
            {company_id: credentials._id},
            {branch_id: req.payload.branch_id},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data!=null){
            //EMAIL NOT FOUND
            return reply.redirect(
              "/company/settings?message=Staff already added!&alertType=danger"
            );
          }
          return callback(null);
				});
      },
      function(callback){
        //FIND BRANCH FOR ADDED 1 STAFF
        Branches.findOne({
          $and: [
            {company_id: credentials._id},
            {_id: req.payload.branch_id },
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          findBranch=data;
          console.log(data);
          return callback(null);
				});
      }
    ],
    function (callback) {
      //CHECK IF THIS USER IS EMAIL VALIDATED
      if(credentials.validate_email == true){
        //SEND EMAIL ANG SAVE DATA TO STAFFS
        var mailOptions = {
          from: Config.smtp.email,
          to: findStaff.email,
          subject: 'Company invitation',
          text: 'Congratulation your account is invited by '+ credentials.company_name+' Company',
        };
        var payload = {
          company_id: credentials._id,
          staff_id: findStaff._id,
          branch_id: req.payload.branch_id,
        };
        var staff = new Staffs(payload);
        staff.save(function(err, staffs) {
          if (err) {
            console.log(err);
          }else {
            console.log('SAVE DATA===>', staffs);
            var payloadBranch = {
              count_staff: findBranch.count_staff+1
            }
            Branches.update(
              {
                $and:[
                  {_id: req.payload.branch_id },
                  {company_id: credentials._id},
                  {isVoid: false},
                ]
              },
              {
                $set: payloadBranch,
              },
              function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('UPDATE STATUS BRANCH===>', data);
                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log('EMAIL SENT=>', info);
                        return reply.redirect(
                          "/company/settings?message=Successfully Added!&alertType=success"
                        );
                      }
                    });
                }
              },
            );
          }
        });
      }else{
        //THIS EMAIL IS NOT VALIDATED
        reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
      }
    }
  )
};
//UPDATE STAFF
internals.update_staff = function (req, reply) {
  console.log('STAFF DB ID',req.payload._id);
  console.log('USER DB ID',req.payload.user_id);

  var message ='';
  var credentials = {},findBranch={}, minusBranch={}, staffExist=false;
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and:[
            {_id: req.auth.credentials._id},
            {isVoid: false},
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback){
        //CHECK IF EMAIL IS ALREADY ADDED WITH SAME BRANCH
        Staffs.findOne({
          $and: [
            {staff_id: req.payload.user_id},
            {isVoid: false},
            {company_id: credentials._id},
            {branch_id: req.payload.branch_id},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          console.log('FIND EMAIL ALREADY ADDED');
          if(data!=null && req.payload.isVoid=='false'){
            //EMAIL NOT FOUND
            return reply.redirect(
              "/company/settings?message=Staff already added!&alertType=danger"
            );
          }
          return callback(null);
				});
      },
      function(callback){
        //CHECK IF STAFF IS USE TO OTHER BRANCH
        Staffs.findOne({
          $and: [
            {staff_id: req.payload.user_id},
            {isVoid: false},
            {company_id: credentials._id}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data!=null){staffExist=true}
          else{staffExist=false}
          return callback(null);
				});
      },
      function(callback){
        //FIND BRANCH FOR ADDED 1 STAFF
        Branches.findOne({
          $and: [
            {company_id: credentials._id},
            {_id: req.payload.branch_id },
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          console.log('FIND BRANCH TO ADD 1');
          if(data==null){
            reply.redirect("/company/settings?message=Error please try again!&alertType=danger");
          }
          findBranch=data;
          console.log(data);
          return callback(null);
				});
      },
      function(callback){
        //FIND OLD BRANCH FOR MINUS 1 STAFF
        Branches.findOne({
          $and: [
            {company_id: credentials._id},
            {_id: req.payload.old_branch },
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          console.log('FIND BRANCH TO MINUS 1');
          if(data==null){
            reply.redirect("/company/settings?message=Error please try again!&alertType=danger");
          }
          minusBranch=data;
          console.log(data);
          return callback(null);
				});
      },
      function(callback) {
        Staffs.findOne({
          $and: [
            {_id: req.payload._id},
            {company_id: credentials._id},
            {branch_id: req.payload.branch_id },
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          console.log('FIND ONE STAFF');
          if(data==null){
            //CHANGE NEW BRANCH ADD COUNT
            var addCount = {
              count_staff: findBranch.count_staff+1
            }
            Branches.update(
              {
                $and:[
                  {_id: req.payload.branch_id },//NEW BRANCH
                  {company_id: credentials._id},
                  {isVoid: false},
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
                    count_staff: minusBranch.count_staff-1
                  }
                  Branches.update(
                    {
                      $and:[
                        {_id: req.payload.old_branch },//OLD
                        {company_id: credentials._id},
                        {isVoid: false},
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
      //CHECK IF THIS EMAIL IS VALIDATED
      if(credentials.validate_email == true){
        var payload = {}, payloadUsers = {}, payloadBranch={};
        if(req.payload.isVoid=='true'){
          message='Deleted';
          payload = {
            isVoid:true,
            branch_id: req.payload.branch_id,
          }
          //CHECK FIRST IF THERE ANOTHER BRANCH OF STAFF THAT USED
          if(staffExist==false){
            payloadUsers={
              isHired: false
            }
          }
          payloadBranch = {
            count_staff: findBranch.count_staff-1
          }
        }else{
          message='Updated';
          payload = {
            branch_id: req.payload.branch_id,
          }
        }
        //UPDATE STAFF DB
        Staffs.update(
          {
            $and: [
              { _id: req.payload._id },
              { company_id: credentials._id },
              { isVoid: false}
            ]
          },
          {
            $set: payload,
          },
          function (err, updateStaff) {
            if (err) {
              console.log(err);
            } else {
              console.log('UPDATE STAFF==>', updateStaff);
              //UPDATE USERS STAFF
              Users.update(
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
                    Branches.update(
                      {
                        $and:[
                          {_id: req.payload.branch_id },
                          {company_id: credentials._id},
                          {isVoid: false},
                        ]
                      },
                      {
                        $set: payloadBranch,
                      },
                      function (err, data) {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log('UPDATE STATUS BRANCH===>', data);
                          reply.redirect("/company/settings?message=Successfully "+message+"!&alertType=success");
                        }
                      },
                    );
                  }
                },
              );
            }
          },
        );
      }else{
        //EMAIL IS NOT VALIDATED
        reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
      }
    }
  )
};
//CAPITAL
internals.add_capital = function (req, reply) {
  var credentials = {};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and:[
            {_id: req.auth.credentials._id},
            {isVoid: false},
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        Capitals.findOne({
          $and: [
            {value: req.payload.value},
            {company_id: credentials._id},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
          if(data!=null){
            return reply.redirect(
              "/company/settings?message=Error Capital is exist!&alertType=danger"
            );
          }
          return callback(null);
				});
			},
    ],
    function (callback) {
      var payload = {
        value: req.payload.value,
        company_id: credentials._id
      };
      var capital = new Capitals(payload);
      capital.save(function(err, capitalData) {
        if (err) {
        console.log(err);
        }else {
          console.log(capitalData);
        return reply.redirect(
          "/company/settings?message=Successfully Created!&alertType=success"
        );
        }
      });
    }
  )
};
internals.update_capital = function (req, reply) {
  var credentials = {};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and:[
            {_id: req.auth.credentials._id},
            {isVoid: false},
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
        if (err) {console.log(err);return reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
        }else if(data==null){return reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger")};
					credentials=data;
          console.log(credentials);
					return callback(null);
				});
			},
      function(callback) {
        Capitals.findOne({
          $and: [
            {value: req.payload.value},
            {company_id: credentials._id},
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
                "/company/settings?message=Error Capital is exist!&alertType=danger"
              );
            }
          }
          return callback(null);
				});
			},
    ],
    function (callback) {
      //CHECK IF THIS EMAIL IS VALIDATED
      if(req.payload.isVoid=='true'){
        //REMOVE CAPITAL
          Capitals.remove(
            {
              $and:[
                {company_id: credentials._id  },
                {_id: req.payload._id  },
                {isVoid: false}
              ]
            },
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                reply.redirect("/company/settings?message=Successfully Remove!&alertType=success");
              }
            },
          );
      }else{
          var payload = {
            value: req.payload.value,
          }
          Capitals.update(
            {
              $and:[
                {company_id: credentials._id  },
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
                reply.redirect("/company/settings?message=Successfully Updated!&alertType=success");
              }
            },
          );
        }
    }
  )
};

//ONLINE PAYMENT
internals.update_onlinePayment = function (req, reply) {
  var credentials = {};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and: [
            {_id: req.auth.credentials._id},
            {validate_email: true},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
					}
					credentials=data;
					return callback(null);
				});
			},
    ],
    function (callback) {
      var payload = {
        gcash_number: req.payload.gcash_number,
        isOnlinePayment: req.payload.isOnlinePayment,
      }
      console.log(payload.isOnlinePayment);
      console.log(payload.gcash_number);
      console.log(req.payload._id);
      Settings.update(
        {
          $and:[
            { company_id: credentials._id },
            { _id: req.payload._id }
          ]
        },
        {
          $set: payload,
        },
        function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
            reply.redirect("/company/settings?message=Successfully Updated!&alertType=success");
          }
        },
      );
    }
  )
};
//INTEREST
internals.update_interest = function (req, reply) {
  var credentials = {};
  Async.series(
    [
      function(callback) {
        Users.findOne({
          $and: [
            {_id: req.auth.credentials._id},
            {validate_email: true},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            reply.redirect("/company/validateEmail?message=Please Validate your email!&alertType=danger");
					}
					credentials=data;
					return callback(null);
				});
			},
    ],
    function (callback) {
      var payload = {
        interest: req.payload.interest,
      }
      console.log(payload.interest);
      console.log(req.payload._id);
      Settings.update(
        {
          $and:[
            { company_id: credentials._id },
            { _id: req.payload._id }
          ]
        },
        {
          $set: payload,
        },
        function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
            reply.redirect("/company/settings?message=Successfully Updated!&alertType=success");
          }
        },
      );
    }
  )
};


//CHANGE COMPANY LOGO
internals.companyLogo = function (req, reply) {

  var base64Image = req.payload.image;
  var storagelink = "src/assets/uploads/COMPANY/" + req.auth.credentials._id;
  var linkOR = "/assets/uploads/COMPANY/" +  req.auth.credentials._id;
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
        return reply.redirect("/company/validateEmail?message=Error, invalid Account!&alertType=danger");
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

          //CHANGE LOGO INTO SETTINGS DB
          const payload = {
              company_logo: linkOR + ext,
          }
          Settings.update(
            {
              company_id: req.auth.credentials._id
            },
            {
              $set: payload,
            },
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                console.log(data)
                return reply.redirect('/company/settings?message=Payment successfully uploaded!&alertType=success');
              }
            },
          );
      })
      .catch((error) => {
          // error handeling
          console.log('ERROR: ',error);
      });
    }
  )
};

module.exports = internals;
