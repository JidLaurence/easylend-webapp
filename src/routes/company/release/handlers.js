'use strict';

var internals = {},
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
  Releases = require('../../../database/models/releases'),
  Calendars = require('../../../database/models/calendars'),
  Total_releases = require('../../../database/models/total_releases'),

  moment = require('moment');

internals.index = function (req, reply) {
  var credentials = {}, notification ={}, staffs={}, collectorDB= {}, collector_info={}, myBranches={}, branches={},
  calendars = {}, releases = {}, total_releases = {}, displayBranch = {}, collectorCnt;

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yy = today.getFullYear();
  var getMM=parseInt(mm),getYY=parseInt(yy), getDD = parseInt(dd);

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
            reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
					}
					credentials=data;
          var todayDate = new Date();
          if(credentials.expiry_end < todayDate){
            return reply.redirect('/company/expire');
          }
          if(credentials.isUpdated==false){return reply.redirect("/company/profile?message=Please updated your profile!&alertType=danger&newMessage=Please fillup the form&newAlertType=danger");}
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
        //STAFF BASES
        Staffs.findOne({
          $and: [
            {company_id: credentials._id},
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
            return reply.view('company/release/index.html', {
              credentials: credentials,
              message: req.query.message,
              alertType: req.query.alertType,
              newAlertType: req.query.newAlertType,
              notification: notification
            });
          }
					return callback(null);
				});
			},
      function(callback) {
        //GET COLLECTOR DB WHERE STAFF_ID& COMPANY_ID IS EQUAL TO THIS STAFF
        Collectors.find({
          $and: [
            {company_id: credentials._id},
            {isVoid: false},
            {isCancel: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					collectorDB=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT COLLECTOR
        Collectors.count({
          $and: [
            {company_id: credentials._id},
            {isVoid: false},
            {isCancel: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					collectorCnt=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET STAFF BASES IN BRANCH
        Staffs.find({
          $and: [
            {company_id: credentials._id},
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
        //GET ONE BRANCH COMPANY 
        Branches.findOne({
          $and: [
            {company_id: credentials._id},
            {_id: staffs.branch_id},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					displayBranch=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET ALL BRANCH COMPANY
        Branches.find({
          $and: [
            {company_id: credentials._id},
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
        //GET CALENDAR
        Calendars.find({
          $and: [
            {month: getMM},
            {year: getYY},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					calendars=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET RELEASE OF THIS COMPANY WITH SAME DATE, BRANCH AND STAFF
        Releases.find({
          $and: [
            {company_id: credentials._id},
            {branch_id: staffs.branch_id},
            {month: getMM},
            {year: getYY},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					releases=data;
          console.log('Releases==>', releases);
					return callback(null);
				});
      },
      function(callback) {
        //GET TOTAL_RELEASES DB
        Total_releases.find({
          $and: [
            {company_id: credentials._id},
            {branch_id: staffs.branch_id},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					total_releases=data;
          console.log('Total Releases==>', total_releases);
					return callback(null);
				});
			},
    ],
    function (callback) {
      reply.view('company/release/index.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newAlertType: req.query.newAlertType,
        notification: notification,
        collectorDB: collectorDB,
        collector_info: collector_info,
        myBranches: myBranches,
        branches: branches,
        calendars: calendars,
        releases: releases,
        total_releases: total_releases,
        getMM: getMM,
        getYY: getYY,
        displayBranch: displayBranch,
        getDD: getDD,
        collectorCnt: collectorCnt
      });
    }
  )
};

//SEARCH RELEASE DATE
internals.search_release = function (req, reply){
  var credentials = {}, notification ={}, staffs={}, collectorDB= {}, collectorCnt,
   collector_info={}, myBranches={}, branches={}, calendars = {}, releases = {}, total_releases = {}, displayBranch={};

   var today = new Date();
   var dd = today.getDate();
   var getDD = parseInt(dd);
   var getMM = parseInt(req.query.month);
   var getYY = parseInt(req.query.year);
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
            reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET USERS COLLECTOR ONLY
        Users.find({
          $and: [
            {isHired: true},
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
          console.log('COLLECTOR=>',collector_info)
					return callback(null);
				});
			},
      function(callback) {
        //STAFF BASES
        Staffs.findOne({
          $and: [
            {company_id: credentials._id},
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
          
					return callback(null);
				});
			},
        function(callback) {
        //GET ONE BRANCH COMPANY 
        Branches.findOne({
          $and: [
            {_id: req.query.branch_id},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					displayBranch=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET COLLECTOR DB WHERE STAFF_ID& COMPANY_ID IS EQUAL TO THIS STAFF
        Collectors.find({
          $and: [
            {branch_id: req.query.branch_id},
            {company_id: credentials._id},
            {isVoid: false},
            {isCancel: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					collectorDB=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT COLLECTOR 
        Collectors.count({
          $and: [
            {branch_id: req.query.branch_id},
            {company_id: credentials._id},
            {isVoid: false},
            {isCancel: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					collectorCnt=data;
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
        //GET STAFF BASES IN BRANCH
        Staffs.find({
          $and: [
            {company_id: credentials._id},
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
            {company_id: credentials._id},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					branches=data;
          console.log('BRANCHES===>>>>',branches);
					return callback(null);
				});
			},
      function(callback) {
        //GET CALENDAR
        Calendars.find({
          $and: [
            {month: getMM},
            {year: getYY},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					calendars=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET RELEASE OF THIS COMPANY WITH SAME DATE, BRANCH AND STAFF
        Releases.find({
          $and: [
            {company_id: credentials._id},
            {branch_id: req.query.branch_id},
            {month: getMM},
            {year: getYY},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					releases=data;
          console.log('Releases==>', releases);
					return callback(null);
				});
			},
      function(callback) {
        //GET TOTAL_RELEASES DB
        Total_releases.find({
          $and: [
            {company_id: credentials._id},
            {branch_id: req.query.branch_id},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					total_releases=data;
          console.log('Total Releases==>', total_releases);
					return callback(null);
				});
			},
    ],
    function (callback) {
      reply.view('company/release/index.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newAlertType: req.query.newAlertType,
        notification: notification,
        collectorDB: collectorDB,
        collector_info: collector_info,
        myBranches: myBranches,
        branches: branches,
        calendars: calendars,
        releases: releases,
        total_releases: total_releases,
        getMM: getMM,
        getYY: getYY,
        getDD: getDD,
        displayBranch: displayBranch,
        collectorCnt: collectorCnt
      });
    }
  )
}

//ADD RELEASE MONEY OF COLLECTOR
internals.add_release = function (req, reply) {
  var isNewRelease=true;
  var credentials = {}, companyOwner={}, staffs={}, total_releases={};
  // var today = new Date(req.payload.date);
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

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
            reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
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
      function(callback) {
        //CHECK IF TOTAL_RELEASE DB IS ALREADY EXISTS, IF EXISTS SUM NEW AMOUNT AND TOTAL
        Total_releases.findOne({
          $and: [
            {collector_id: req.payload.collector_id},
            {company_id: companyOwner._id},
            {staff_id: credentials._id},
            {branch_id: req.payload.branch_id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					if(data!=null){
            isNewRelease=true;
            total_releases=data;
          }else{
            isNewRelease=false;
          }
					return callback(null);
				});
			},
      function(callback) {
        //CHECK IF RELEASE IS ALREADY EXISTS
        Releases.findOne({
          $and: [
            {collector_id: req.payload.collector_id},
            {company_id: companyOwner._id},
            {staff_id: credentials._id},
            {branch_id: req.payload.branch_id},
            {day: parseInt(dd)},
            {month: parseInt(mm)},
            {year: parseInt(yyyy)},
            {isVoid: false},
          ]
        })
				.lean()
				.exec((err, foundData) => {
					if (err) {
						console.log(err);
					}
					if(foundData!=null){
            return reply.redirect(
              "/company/release?message=Error, Branch, Collector and Date is already exists!&alertType=danger"
            );
          }
					return callback(null);
				});
			},
    ],
    function (callback) {
      var payload = {
        amount: req.payload.amount,
        collector_id: req.payload.collector_id,
        company_id: companyOwner._id,
        staff_id: credentials._id,
        branch_id: req.payload.branch_id,
        day: parseInt(dd),
        month: parseInt(mm),
        year: parseInt(yyyy)
      };
      var getData = new Releases(payload);
      getData.save(function(err, saveData) {
        if (err) {
        console.log(err);
        }else {
          console.log(saveData);
          if(isNewRelease==true){
            //UPDATE TOTAL_RELEASES DB AND SUM ALL NEW AMOUNT AND OLD AMOUNT
            var payload = {
              total: parseInt(total_releases.total)+parseInt(req.payload.amount),
              collector_id: req.payload.collector_id,
              company_id: companyOwner._id,
              staff_id: credentials._id,
              branch_id: req.payload.branch_id
            }
            Total_releases.update(
              {
                $and:[
                  {collector_id: req.payload.collector_id},
                  {company_id: companyOwner._id},
                  {staff_id: credentials._id},
                  {branch_id: req.payload.branch_id},
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
                  console.log('OLD', data);
                  return reply.redirect("/company/release?message=Successfully Created!&alertType=success");
                }
              },
            );
          }else{
            //NEW RELEASE SAVE TO TOTAL_RELEASES DB
            var payload = {
              total: req.payload.amount,
              collector_id: req.payload.collector_id,
              company_id: companyOwner._id,
              staff_id: credentials._id,
              branch_id: req.payload.branch_id
            }
            var saveData = new Total_releases(payload);
            saveData.save(function(err, data) {
              if (err) {
                console.log(err);
              }else {
                console.log('NEWWW', data);
                return reply.redirect("/company/release?message=Successfully Created!&alertType=success");
              }
            });
          }
        }
      });
    }
  )
};

//UPDATE RELEASE MONEY OF COLLECTOR
internals.update_release = function (req, reply) {
  var credentials = {}, companyOwner={}, staffs={}, total_releases={}, releases={};

  var start = new Date();
  start.setHours(0, 0, 0, 0);
  var end = new Date();
  end.setHours(23, 59, 59, 999);

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
            reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
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
      function(callback) {
        //FIND TOTAL_RELEASES DB
        Total_releases.findOne({
          $and: [
            {_id: req.payload.total_releases_id},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					if(data==null){
            return reply.redirect("/company/release?message=Error, Invalid input please try again!&alertType=danger");
          }
          total_releases=data;
          console.log('TOTAL=>', total_releases);
					return callback(null);
				});
			},
      function(callback) {
        //FIND RELEASES DB
        Releases.findOne({
          $and: [
            {_id: req.payload.releases_id},
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					if(data==null){
            return reply.redirect("/company/release?message=Error, Invalid input please try again!&alertType=danger");
          }
          releases=data;
          console.log('RELEASES=>', releases);
					return callback(null);
				});
			},
    ],
    function (callback) {
      if(req.payload.isVoid == 'true' || parseInt(req.payload.amount)==0){
        //IF DELETE RELEASE
        var a = parseInt(total_releases.total)-parseInt(releases.amount);
        var payload = {
          total: a
        }
        //DEDUCT TOTAL RELEASES DB
        Total_releases.update({
            _id: req.payload.total_releases_id
          },
          {
            $set: payload,
          },
          function (err, updateTotal) {
            if (err) {
              console.log(err);
            } else {
              console.log('DEDUCTED', updateTotal);
              //REMOVE RELEASES DB
              Releases.remove(
                {
                  _id: req.payload.releases_id
                },
                function (err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log('REMOVE===>', data);
                    return reply.redirect("/company/release?message=Successfully Remove!&alertType=success");
                  }
                },
              );
            }
          },
        );
      }else{
        //EDIT AMOUNT
        var total;
        if(parseInt(req.payload.amount) > parseInt(releases.amount)){
            total= (parseInt(total_releases.total) - parseInt(releases.amount)) + parseInt(req.payload.amount);
        }else{
          total= parseInt(total_releases.total)-parseInt(req.payload.amount);
        }
        var payloadTotal = {
          total: (parseInt(total_releases.total) - parseInt(releases.amount)) + parseInt(req.payload.amount)
        }
        //UPDATE TOTAL RELEASES DB
        Total_releases.update({
            _id: req.payload.total_releases_id
          },
          {
            $set: payloadTotal,
          },
          function (err, updateTotal) {
            if (err) {
              console.log(err);
            } else {
              console.log('RELEASES=>', updateTotal);
              var payloadReleases = {
                amount: req.payload.amount
              }
              //UPDATE TOTAL RELEASES DB
              Releases.update({
                  $and:[
                    {_id: req.payload.releases_id}
                  ]
                },
                {
                  $set: payloadReleases,
                },
                function (err, updateReleases) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log('RELEASED=>', updateReleases);
                    return reply.redirect("/company/release?message=Successfully Updated!&alertType=success");
                  }
                },
              );
            }
          },
        );
      }
    }
  )
};

module.exports = internals;
