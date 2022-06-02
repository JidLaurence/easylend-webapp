'use strict';

var internals = {},
  Async = require('async'),
  moment = require('moment'),

  Users = require('../../../database/models/users'),
  Calendars = require('../../../database/models/calendars');

internals.index = function (req, reply) {
  var calendars={};

  Async.series([
    (callback) => {
      Calendars.find({ })
      .lean()
      .exec((err, data) =>{
        if(err){
          console.log(err)
        }
        calendars=data;
        console.log(data)
        return callback(null);
      });
    }
  ],
  function(callback) {
    reply.view('admin/settings/index.html', {
      credentials: req.auth.credentials,
      message: req.query.message,
      alertType: req.query.alertType,
      calendars:calendars
    });
  })
};


/**
 * 
 * CALENDARS
 * 
 */

//CALENDARS
function convertWeek(varDate) {
  var weeks = String(varDate);
  var output,old='';
  for(var i=0; i<weeks.length; i++){
    weeks.charAt(i);
    if(weeks.charAt(i) == ' '){
      break;
    }else{
      output = weeks.charAt(i);
      old= old+''+output;
    }
  }
  return old;
};
function getDaysInMonth(month, year) {
  var date = new Date(year, month);
  var days = [];
  var calendars = [];
  //STOP UNTIL NEW MONTH
  while (date.getMonth() === month) {
    days.push(new Date(date));
    var newDate = new Date(date);
    //SET DATE
    var ddToday = String(date.getDate());
    var mmToday = String(date.getMonth()+1);
    var yyyyToday = date.getFullYear();
    //ADD DAY
    date.setDate(date.getDate() + 1);

    calendars.push(
      {
        dd: parseInt(ddToday),
        mm: parseInt(mmToday),
        yy: yyyyToday,
        ww: convertWeek(newDate)
      }
    )
  }
  return calendars;
}
internals.add_calendars = function (req, reply) {
  var credentials = {}, calendars =[], mmm;

  var mm = parseInt(req.payload.month)-1; //january 0
  var yy = parseInt(req.payload.year);
  mmm=mm+1;
  var today = new Date();
  var mmToday = String(today.getMonth()+1).padStart(2, '0'); //january 0
  var yyyyToday = today.getFullYear();

  if(mm+1<1 || mm+1>12){
    return reply.redirect("/admin/settings?message=Error, Invalid input month!&alertType=danger");
  }
  Async.series(
    [
      function(callback) {
        //GET THIS USER CREDENTIALS
        Users.findOne({
            _id: req.auth.credentials._id
        })
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
        //IF MONTH AND YEAR EXISTS
        Calendars.findOne({
          $and: [
            {month: mm+1},
            {year: yy},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					if(data!=null){
            return reply.redirect( "/admin/settings?message=Error month and year are existed!&alertType=danger");
          }
					return callback(null);
				});
			},
    ],
    function (callback) {
      calendars = getDaysInMonth(mm, yy);
      var payload = {
        month: mmm,
        year: yy,
        calendars: calendars
      };
      var saveCalendars = new Calendars(payload);
      saveCalendars.save(function(err, calendarsData) {
        if (err) {
        console.log(err);
        }else {
          console.log(calendarsData);
        return reply.redirect(
          "/admin/settings?message=Successfully Created!&alertType=success"
        );
        }
      });
    }
  )
};
internals.update_calendars = function (req, reply) {
  var credentials = {};
  Async.series(
    [
      function(callback) {
        //GET THIS USER CREDENTIALS
        Users.findOne({
          _id: req.auth.credentials._id
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            reply.redirect("/admin/dashboard?message=Error It seems you're not hired!&alertType=danger");
					}
					credentials=data;
					return callback(null);
				});
			}
    ],
    function (callback) {
      Calendars.remove(
        {
          $and:[
            {_id: req.payload._id  },
            {isVoid: false},
            {isUse: false}
          ]
        },
        function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
            reply.redirect("/admin/settings?message=Date Successfully Remove!&alertType=success");
          }
        },
      );
    }
  )
};

module.exports = internals;
