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
  Calendars = require('../../../database/models/calendars'),
  Customers = require('../../../database/models/customers'),
  Collect_dates = require('../../../database/models/collect_dates'), 
  Total_customers = require('../../../database/models/total_customers'), 
  moment = require('moment');

//Pending Customer
internals.pending = function (req, reply) {
  var credentials = {}, notification ={}, company_info ={}, staffs = {}, myBranches={}, branches={},
  cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, paid_customer={}, company_capital = {}, collectors = {}, collectors_info = {};
  console.log('PENDDDIINGG')
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
           return reply.redirect("/staff/profile?message=Error, please try again!&alertType=error");
         }
         credentials=data;
         if(credentials.isUpdated==false){return reply.redirect("/staff/profile?message=Please updated your profile!&alertType=error&newMessage=Please fillup the form&newAlertType=error");}
         if(credentials.isHired == false){
          return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
         }
         return callback(null);
       });
     },
      //FIND STAFF INFO
      function(callback) {
        Staffs.findOne({
          $and: [
            { staff_id: credentials._id },
            { isCancel: false},
            { isVoid: false }
          ]
        })
        .populate(['company_id'])
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
            return reply.redirect("/staff/dashboard?message=Error, please try again!&alertType=error");
          }
          var dateToday = new Date();
          if(data.company_id.expiry_end < dateToday){
            return reply.redirect("/staff/expire");
          }
          return callback(null);
        });
      },
     function(callback) {
       //GET THIS HIRING NOTIFCATION
       Staffs.find({
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
         notification=data;
         console.log(notification)
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
         company_info=data;
         console.log(company_info)
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
         if(data==null){
          return reply.view('staff/customer/index.html', {
            credentials: credentials,
            message: req.query.message,
            alertType: req.query.alertType,
            newMessage: req.query.newMessage,
            newAlertType: req.query.newAlertType,
            notification: notification
          });
         }
         return callback(null);
       });
     },
     function(callback) {
       //GET ALL COMPANY BRANCH
       Branches.find({
         $and: [
           {company_id: staffs.company_id},
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
       //GET STAFF BASES IN BRANCH
       Staffs.find({
         $and: [
           {staff_id: credentials._id},
           {company_id: staffs.company_id},
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
       //COUNT PENDING ALL BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Pending'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_pending=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT ACCEPTED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Accepted'},
           {isPaid: false}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_accepted=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT DECLINED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Declined'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_cancelled=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT REPORTED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Reported'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_reported=data;
         return callback(null);
       });
     },
     function(callback) {
       //GET CUSTOMER INFO
       Users.find({
         $and: [
           {scope: 'borrower'},
           {isVoid: false},
           {validate_email: true}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         customers_info=data;
         console.log(customers_info);
         return callback(null);
       });
     },
     function(callback) {
       //GET CUSTOMER INFO
       Customers.find({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Pending'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         customers=data;
         console.log(customers);
         return callback(null);
       });
     },
     function(callback) {
      //GET PAID CUSTOMER INFO
      Customers.find({
        $and: [
          {company_id: staffs.company_id},
          {staff_id: credentials._id},
          {isVoid: false},
          {isPaid: true}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        paid_customer=data;
        console.log('============', paid_customer);
        return callback(null);
      });
    },
     function(callback) {
       //COMPANY CAPITAL
       Capitals.find({
         $and: [
           {company_id: staffs.company_id},
           {isVoid: false}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         company_capital=data;
         console.log(company_capital);
         return callback(null);
       });
     },
     function(callback) {
      //COMPANY COLLECTORS
      Collectors.find({
        $and: [
          {company_id: staffs.company_id},
          {staff_id: credentials._id},
          {branch_id: staffs.branch_id},
          {isVoid: false}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        collectors=data;
        return callback(null);
      });
    },
    function(callback) {
      //COLLECTORS INFOR
      Users.find({
        $and: [
          {scope: 'collector'},
          {isVoid: false},
          {validate_email: true}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        collectors_info=data;
        console.log(collectors_info)
        return callback(null);
      });
    },
   ],
   function (callback) {
     reply.view('staff/customer/index.html', {
       credentials: credentials,
       message: req.query.message,
       alertType: req.query.alertType,
       newMessage: req.query.newMessage,
       newAlertType: req.query.newAlertType,
       notification: notification,
       company_info: company_info,
       branches: branches,
       myBranches: myBranches,
       cnt_pending: cnt_pending,
       cnt_accepted: cnt_accepted,
       cnt_cancelled: cnt_cancelled,
       cnt_reported: cnt_reported,
       customers_info: customers_info,
       customers: customers,
       company_capital: company_capital,
       collectors: collectors,
       collectors_info: collectors_info,
       paid_customer: paid_customer
     });
   }
 )
};

//CALENDARS
function convertWeek(varDate) {
  var weeks = String(varDate);
  var output,old='';
  var i;
  for(i=0; i<weeks.length; i++){
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
function getDaysOfCustomer(inputDays, selectedType) {
  var date = new Date();
  date.setDate(date.getDate());//STARTING DATE FOR COLLECTING DATE BORROWER

  //IF SUNDAY ADD 1 DAY
  if(convertWeek(date) != 'Sun'){
    date.setDate(date.getDate() + 1);
  }

  var days = [];
  var calendars = [];
  let dd=0;
  console.log(date);
  var lastDate;

  var type=parseInt(selectedType);
  //STOP UNTIL CUSTOMER DAYS IS EQUAL
  while (dd<=parseInt(inputDays)) {
    days.push(new Date(date));
    var newDate = new Date(date);
    //SET DATE
    var ddToday = String(date.getDate());
    var mmToday = String(date.getMonth()+1);
    var yyyyToday = date.getFullYear();
    //ADD DAY
    date.setDate(date.getDate() + 1);

    if(convertWeek(newDate) != 'Sun'){
      if(type==1){
        calendars.push(
          {
            dd: parseInt(ddToday),
            mm: parseInt(mmToday),
            yy: yyyyToday,
            ww: convertWeek(newDate)
          }
        )
        type=parseInt(selectedType);
      }else{
        type-=1;
      }
      
      dd=dd+1;
      lastDate = new Date(date);
    }
  }
  return calendars;
}
//GET END DATE TO PAY
function getLastDatesOfCustomer(inputDays, selectedType) {
  var date = new Date();
  date.setDate(date.getDate() + 1);

  //IF SUNDAY ADD 1 DAY
  if(convertWeek(date) != 'Sun'){
    date.setDate(date.getDate() + 1);
  }

  var days = [];
  let dd=0;
  var lastDate;

  var type=parseInt(selectedType);
  //STOP UNTIL CUSTOMER DAYS IS EQUAL
  while (dd<=parseInt(inputDays)) {
    days.push(new Date(date));
    var newDate = new Date(date);
    //SET DATE
    var ddToday = String(date.getDate());
    var mmToday = String(date.getMonth()+1);
    var yyyyToday = date.getFullYear();
    //ADD DAY
    date.setDate(date.getDate() + 1);

    if(convertWeek(newDate) != 'Sun'){
      if(type==1){
        type=parseInt(selectedType);
      }else{
        type-=1;
      }
      dd=dd+1;
      lastDate = new Date(date);
    }
  }
  console.log('LAST DATE', lastDate);
  return lastDate;
}

//UPDATE STATUS PENNDING
internals.update_status_pending = function (req, reply){
  var getDateToday = new Date();
  var yearToday = getDateToday.getFullYear();
  var monthToday = getDateToday.getMonth()+1;

  var get_customerDB_id = req.payload._id;
  var get_capital = req.payload.capital;
  var get_months = req.payload.months;
  var get_branch_id = req.payload.branch_id;
  var get_collector_id = req.payload.collector_id;
  var get_type = req.payload.type;
  var get_status = req.payload.isStatus;
  let date_id;
  //ONLY COMPANY OWNER CAN CHANGE INTEREST
  var get_interest=0;
  
  var credentials={}, customers = {}, staffs={}, company_settings = {}, total_customer = {};
  console.log(get_status);
  //CHECK SELECTED STATUS
  if(get_status == 'Accepted' || get_status == 'Declined'){}else{return reply.redirect("/staff/customer?message=Error, Invalid input!&alertType=error")};

  Async.series([
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
        if (err) {return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error")}else if(data==null){return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error")};
        credentials=data;
        return callback(null);
      });
    },
    function(callback){
      Customers.findOne({
        $and: [
          {_id: get_customerDB_id},
          {isVoid: false},
        ]
      })
      .lean()
      .exec((err, data) => {
        customers =data;
        return callback(null);
      });
    },
    function(callback){
      Staffs.findOne({
        $and: [
          {staff_id: credentials._id},
          {isVoid: false},
          {isCancel: false}
        ]
      })
      .lean()
      .exec((err, data) => {
        staffs= data;
        console.log(staffs);
        return callback(null);
      });
    },
    function(callback){
      Settings.findOne({
        $and: [
          {company_id: staffs.company_id},
          {isVoid: false},
        ]
      })
      .lean()
      .exec((err, data) => {
        company_settings =data;
        get_interest = company_settings.interest;
        console.log(company_settings);
        return callback(null);
      });
    },
    function(callback){
      Total_customers.findOne({
        $and: [
          {company_id: staffs.company_id},
          {month: monthToday},
          {year: yearToday},
          {isVoid: false},
        ]
      })
      .lean()
      .exec((err, data) => {
        total_customer = data
        console.log(total_customer);
        return callback(null);
      });
    }
  ],
  async function(callback){
    //CALCULATION
    var a = 0, a = parseInt(get_capital)/parseInt(get_interest);
    var b = 0, b = a * parseInt(get_months);
    var c = 0, c = b + parseInt(get_capital); 
    var d = 0, d = parseInt(get_months) * 30; //CONVERT TO DAYS
    var e = 0, e = d / parseInt(get_type);
    var g = 0, g = c / e; 
  
    if(get_status == 'Accepted'){
        //SAVE CUSTOMERS DATE
      var payloadDates = {
        customersDB_id: customers._id,
        dates: getDaysOfCustomer(d, get_type)
      };

      var saveDates = await Collect_dates.create(payloadDates);
      date_id = saveDates._id;

      //ADD TOTAL CUSTOMER
      if(total_customer == null || total_customer == ''){
        //ADD IF NEW TOTAL CUSTOMER
        var addNewTotalCustomer = {
          company_id: staffs.company_id,
          month: monthToday,
          year: yearToday
        };
        var getTotal = new Total_customers(addNewTotalCustomer);
        getTotal.save(function(err, data) {
          if (err) {
          console.log(err);
          }else {
            console.log(data);
          }
        });
      }else{
        //UPDATE AND ADD TOTAL CUSTOMER
        var updateTotalCustomer = {
          total: parseInt(total_customer.total)+1
        };
        Total_customers.update(
          {
            $and:[
              {company_id: staffs.company_id},
              {month: monthToday},
              {year: yearToday},
            ]
          },
          {
            $set: updateTotalCustomer,
          },
          function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log(data);
            }
          },
        );
      }
    }

    //UPDATE CUSTOMERS DB
    var payloadCustomer = {};
    if(get_status == 'Accepted'){
      //add accepted date if status is accepted
      payloadCustomer = {
        isStatus: get_status,
        capital_interest: b,
        capital_total: Math.round(parseInt(c)),
        collect: Math.round(parseInt(g)),
  
        branch_id: get_branch_id,
        collector_id: get_collector_id,
        capital: get_capital,
        months: get_months,
        type: get_type,
        interest: get_interest,
        balance: c,
        date_accepted: getDateToday,
        date_end: getLastDatesOfCustomer(d, get_type),
        collect_dates_id: date_id
      }
    }else{
      payloadCustomer = {
        isStatus: get_status,
        capital_interest: b,
        capital_total: Math.round(parseInt(c)),
        collect: Math.round(parseInt(g)),
        
        branch_id: get_branch_id,
        collector_id: get_collector_id,
        capital: get_capital,
        months: get_months,
        type: get_type,
        interest: get_interest,
        balance: c
      }
    }
    Customers.update(
      {
        $and:[
          {_id: customers._id },
          {company_id: customers.company_id},
          {isVoid: false}
        ]
      },
      {
        $set: payloadCustomer,
      },
      function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
          return reply.redirect("/staff/customer?message=Successfully "+ get_status +"!&alertType=success");
        }
      },
    );
  });
}
//SEARCH PENDING
internals.search_pending = function (req, reply) {
  var credentials = {}, notification ={}, company_info ={}, staffs = {}, myBranches={}, branches={}, displayBranch={},
   cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, company_capital = {}, collectors = {}, collectors_info = {};


  var getbranch_id = req.query.branch_id;
  console.log(getbranch_id);
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
            return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET THIS HIRING NOTIFCATION
        Staffs.find({
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
					notification=data;
          console.log(notification)
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
					company_info=data;
          console.log(company_info)
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
      //CHECK IF COMPANY IS EXPIRE
      (callback)=>{
        Users.findOne({
          _id: staffs.company_id
        })
        .lean()
        .exec((err, data)=>{
          var dateToday = new Date();
          if(data.expiry_end < dateToday){
            return reply.redirect("/staff/expire");
          }
          return callback(null);
        })
      },
      function(callback) {
        //GET ALL COMPANY BRANCH
        Branches.find({
          $and: [
            {company_id: staffs.company_id},
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
        //GET STAFF BASES IN BRANCH
        Staffs.find({
          $and: [
            {staff_id: credentials._id},
            {company_id: staffs.company_id},
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
            {_id: getbranch_id},
            {company_id: staffs.company_id},
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
        //COUNT PENDING WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Pending'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_pending=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT ACCEPTED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Accepted'},
            {isPaid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_accepted=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT DECLINED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Declined'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_cancelled=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT REPORTED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Reported'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_reported=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET CUSTOMER INFO
        Users.find({
          $and: [
            {scope: 'borrower'},
            {isVoid: false},
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					customers_info=data;
          console.log(customers_info);
					return callback(null);
				});
			},
      function(callback) {
        //GET CUSTOMER INFO
        Customers.find({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Pending'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					customers=data;
          console.log(customers);
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY CAPITAL
        Capitals.find({
          $and: [
            {company_id: staffs.company_id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_capital=data;
          console.log(company_capital);
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY COLLECTORS
        Collectors.find({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          collectors=data;
          return callback(null);
        });
      },
      function(callback) {
        //COLLECTORS INFOR
        Users.find({
          $and: [
            {scope: 'collector'},
            {isVoid: false},
            {validate_email: true}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          collectors_info=data;
          console.log(collectors_info)
          return callback(null);
        });
      },
    ],
    function (callback) {
      reply.view('staff/customer/index.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
        notification: notification,
        company_info: company_info,
        branches: branches,
        myBranches: myBranches,
        displayBranch: displayBranch,
        cnt_pending: cnt_pending,
        cnt_accepted: cnt_accepted,
        cnt_cancelled: cnt_cancelled,
        cnt_reported: cnt_reported,
        customers_info: customers_info,
        customers: customers,
        company_capital: company_capital,
        collectors: collectors,
        collectors_info: collectors_info
      });
    }
  )
};

//Accepted Customer
internals.accepted = function (req, reply) {
  var credentials = {}, notification ={}, company_info ={}, staffs = {}, myBranches={}, branches={},
  cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, paid_customer={}, company_capital = {}, collectors = {}, collectors_info = {};

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
           return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
         }
         credentials=data;
         return callback(null);
       });
     },
     function(callback) {
       //GET THIS HIRING NOTIFCATION
       Staffs.find({
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
         notification=data;
         //console.log(notification)
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
         company_info=data;
         //console.log(company_info)
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
       //GET ALL COMPANY BRANCH
       Branches.find({
         $and: [
           {company_id: staffs.company_id},
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
       //GET STAFF BASES IN BRANCH
       Staffs.find({
         $and: [
           {staff_id: credentials._id},
           {company_id: staffs.company_id},
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
       //COUNT PENDING WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Pending'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_pending=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT ACCEPTED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Accepted'},
           {isPaid: false}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_accepted=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT DECLINED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Declined'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_cancelled=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT REPORTED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Reported'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_reported=data;
         return callback(null);
       });
     },
     function(callback) {
       //GET CUSTOMER INFO
       Users.find({
         $and: [
           {scope: 'borrower'},
           {isVoid: false},
           {validate_email: true}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         customers_info=data;
         //console.log(customers_info);
         return callback(null);
       });
     },
     function(callback) {
       //GET CUSTOMER INFO
       Customers.find({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Accepted'},
           {isPaid: false}
         ]
       })
       .populate('customer_id branch_id company_id staff_id collector_id')
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         customers=data;
         console.log(customers);
         return callback(null);
       });
     },
     function(callback) {
      //GET CUSTOMER PAID INFO
      Customers.find({
        $and: [
          {company_id: staffs.company_id},
          {staff_id: credentials._id},
          {isVoid: false},
          {isPaid: true}
        ]
      })
      .populate('company_id')
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        paid_customer=data;
        //console.log('============', paid_customer);
        return callback(null);
      });
    },
     function(callback) {
       //COMPANY CAPITAL
       Capitals.find({
         $and: [
           {company_id: staffs.company_id},
           {isVoid: false}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         company_capital=data;
         //console.log(company_capital);
         return callback(null);
       });
     },
     function(callback) {
      //COMPANY COLLECTORS
      Collectors.find({
        $and: [
          {company_id: staffs.company_id},
          {staff_id: credentials._id},
          {branch_id: staffs.branch_id},
          {isVoid: false}
        ]
      })
      .populate('collector_id')
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        collectors=data;
        return callback(null);
      });
    },
    function(callback) {
      //COLLECTORS INFOR
      Users.find({
        $and: [
          {scope: 'collector'},
          {isVoid: false},
          {validate_email: true}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        collectors_info=data;
        console.log(collectors_info)
        return callback(null);
      });
    },
   ],
   function (callback) {
     reply.view('staff/customer/accepted.html', {
       credentials: credentials,
       message: req.query.message,
       alertType: req.query.alertType,
       newMessage: req.query.newMessage,
       newAlertType: req.query.newAlertType,
       notification: notification,
       company_info: company_info,
       branches: branches,
       myBranches: myBranches,
       cnt_pending: cnt_pending,
       cnt_accepted: cnt_accepted,
       cnt_cancelled: cnt_cancelled,
       cnt_reported: cnt_reported,
       customers_info: customers_info,
       customers: customers,
       paid_customer: paid_customer,
       company_capital: company_capital,
       collectors: collectors,
       collectors_info: collectors_info
     });
   }
 )
};
//UPDATE STATUS PENNDING
internals.update_status_accepted = function (req, reply){
  var getDateToday = new Date();
  var yearToday = getDateToday.getFullYear();
  var monthToday = getDateToday.getMonth()+1;

  var get_customerDB_id = req.payload._id;
  var get_capital = req.payload.capital;
  var get_months = req.payload.months;
  var get_branch_id = req.payload.branch_id;
  var get_collector_id = req.payload.collector_id;
  var get_type = req.payload.type;
  var get_status = req.payload.isStatus;

  //ONLY COMPANY OWNER CAN CHANGE INTEREST
  var get_interest=0;
  
  var credentials={}, customers = {}, staffs={}, company_settings = {}, total_customer = {};
  console.log(get_status);
  //CHECK SELECTED STATUS
  if(get_status == 'Accepted' || get_status == 'Declined'){}else{return reply.redirect("/staff/customer?message=Error, Invalid input!&alertType=error")};

  Async.series([
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
        if (err) {return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error")}else if(data==null){return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error")};
        credentials=data;
        return callback(null);
      });
    },
    function(callback){
      Customers.findOne({
        $and: [
          {_id: get_customerDB_id},
          {isVoid: false},
        ]
      })
      .lean()
      .exec((err, data) => {
        customers =data;
        return callback(null);
      });
    },
    function(callback){
      Staffs.findOne({
        $and: [
          {staff_id: credentials._id},
          {isVoid: false},
          {isCancel: false}
        ]
      })
      .lean()
      .exec((err, data) => {
        staffs= data;
        console.log(staffs);
        return callback(null);
      });
    },
    function(callback){
      Settings.findOne({
        $and: [
          {company_id: staffs.company_id},
          {isVoid: false},
        ]
      })
      .lean()
      .exec((err, data) => {
        company_settings =data;
        get_interest = company_settings.interest;
        console.log(company_settings);
        return callback(null);
      });
    },
    function(callback){
      Total_customers.findOne({
        $and: [
          {company_id: staffs.company_id},
          {month: monthToday},
          {year: yearToday},
          {isVoid: false},
        ]
      })
      .lean()
      .exec((err, data) => {
        total_customer = data
        console.log(total_customer);
        return callback(null);
      });
    }
  ],
  function(callback){
    //REMOVE COLLECT DATE FIRST
    Collect_dates.remove(
      {
        customersDB_id: get_customerDB_id
      },
      function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      },
    );

    //CALCULATION
    var a = 0, a = parseInt(get_capital)/parseInt(get_interest);
    var b = 0, b = a * parseInt(get_months);
    var c = 0, c = b + parseInt(get_capital); 
    var d = 0, d = parseInt(get_months) * 30; //CONVERT TO DAYS
    var e = 0, e = d / parseInt(get_type);
    var g = 0, g = c / e; 
  
    if(get_status == 'Accepted'){
        //SAVE CUSTOMERS DATE
      var payloadDates = {
        customersDB_id: customers._id,
        dates: getDaysOfCustomer(d, get_type)
      };
      var getDates = new Collect_dates(payloadDates);
      getDates.save(function(err, SaveDates) {
        if (err) {
        console.log(err);
        }else {
          console.log(SaveDates);
        }
      });
    }else{
        //UPDATE AND DEDUCT 1 CUSTOMER IF STATUS DECLINED OR REPORT
        var updateTotalCustomer = {
          total: parseInt(total_customer.total)-1
        };
        Total_customers.update(
          {
            $and:[
              {company_id: staffs.company_id},
              {month: monthToday},
              {year: yearToday},
            ]
          },
          {
            $set: updateTotalCustomer,
          },
          function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log(data);
            }
          },
        );
    }

    //UPDATE CUSTOMERS DB
    var payloadCustomer = {};
    if(get_status == 'Accepted'){
      //add accepted date if status is accepted
      payloadCustomer = {
        isStatus: get_status,
        capital_interest: b,
        capital_total: Math.round(parseInt(c)),
        collect: Math.round(parseInt(g)),
  
        branch_id: get_branch_id,
        collector_id: get_collector_id,
        capital: get_capital,
        months: get_months,
        type: get_type,
        interest: get_interest,
        balance: c,
        date_accepted: getDateToday,
        date_end: getLastDatesOfCustomer(d, get_type)
      }
    }else {
      payloadCustomer = {
        isStatus: get_status,
        capital_interest: b,
        capital_total: 0,
        collect: Math.round(parseInt(g)),
        
        branch_id: get_branch_id,
        collector_id: get_collector_id,
        capital: get_capital,
        months: get_months,
        type: get_type,
        interest: get_interest,
        balance: c,
        date_accepted: null,
        date_end: null
      }
    }
    Customers.update(
      {
        $and:[
          {_id: customers._id },
          {company_id: customers.company_id},
          {isVoid: false}
        ]
      },
      {
        $set: payloadCustomer,
      },
      function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
          return reply.redirect("/staff/customer/accepted?message=Successfully "+ get_status +"!&alertType=success");
        }
      },
    );
  });
}
//SEARCH ACCEPTED
internals.search_accepted = function (req, reply) {
  var credentials = {}, notification ={}, company_info ={}, staffs = {}, myBranches={}, branches={}, displayBranch={},
   cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, company_capital = {}, collectors = {}, collectors_info = {};


  var getbranch_id = req.query.branch_id;
  console.log(getbranch_id);
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
            return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET THIS HIRING NOTIFCATION
        Staffs.find({
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
					notification=data;
          console.log(notification)
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
					company_info=data;
          console.log(company_info)
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
        //GET ALL COMPANY BRANCH
        Branches.find({
          $and: [
            {company_id: staffs.company_id},
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
        //GET STAFF BASES IN BRANCH
        Staffs.find({
          $and: [
            {staff_id: credentials._id},
            {company_id: staffs.company_id},
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
            {_id: getbranch_id},
            {company_id: staffs.company_id},
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
        //COUNT PENDING WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Pending'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_pending=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT ACCEPTED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Accepted'},
            {isPaid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_accepted=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT DECLINED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Declined'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_cancelled=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT REPORTED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Reported'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_reported=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET CUSTOMER INFO
        Users.find({
          $and: [
            {scope: 'borrower'},
            {isVoid: false},
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					customers_info=data;
          console.log(customers_info);
					return callback(null);
				});
			},
      function(callback) {
        //GET CUSTOMER INFO
        Customers.find({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Accepted'},
            {isPaid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					customers=data;
          console.log(customers);
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY CAPITAL
        Capitals.find({
          $and: [
            {company_id: staffs.company_id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_capital=data;
          console.log(company_capital);
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY COLLECTORS
        Collectors.find({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          collectors=data;
          return callback(null);
        });
      },
      function(callback) {
        //COLLECTORS INFOR
        Users.find({
          $and: [
            {scope: 'collector'},
            {isVoid: false},
            {validate_email: true}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          collectors_info=data;
          console.log(collectors_info)
          return callback(null);
        });
      },
    ],
    function (callback) {
      reply.view('staff/customer/accepted.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
        notification: notification,
        company_info: company_info,
        branches: branches,
        myBranches: myBranches,
        displayBranch: displayBranch,
        cnt_pending: cnt_pending,
        cnt_accepted: cnt_accepted,
        cnt_cancelled: cnt_cancelled,
        cnt_reported: cnt_reported,
        customers_info: customers_info,
        customers: customers,
        company_capital: company_capital,
        collectors: collectors,
        collectors_info: collectors_info
      });
    }
  )
};
//Declined Customer
internals.declined = function (req, reply) {
  var credentials = {}, notification ={}, company_info ={}, staffs = {}, myBranches={}, branches={}, displayBranch={},
  cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, paid_customer={}, company_capital = {}, collectors = {}, collectors_info = {};

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
           return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
         }
         credentials=data;
         return callback(null);
       });
     },
     function(callback) {
       //GET THIS HIRING NOTIFCATION
       Staffs.find({
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
         notification=data;
         console.log(notification)
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
         company_info=data;
         console.log(company_info)
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
       //GET ALL COMPANY BRANCH
       Branches.find({
         $and: [
           {company_id: staffs.company_id},
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
       //GET STAFF BASES IN BRANCH
       Staffs.find({
         $and: [
           {staff_id: credentials._id},
           {company_id: staffs.company_id},
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
           {_id: staffs.branch_id},
           {company_id: staffs.company_id},
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
       //COUNT PENDING WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Pending'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_pending=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT ACCEPTED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Accepted'},
           {isPaid: false}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_accepted=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT DECLINED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Declined'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_cancelled=data;
         return callback(null);
       });
     },
     function(callback) {
       //COUNT REPORTED WITH SAME BRANCH, STAFF AND COMPANY
       Customers.count({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Reported'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         cnt_reported=data;
         return callback(null);
       });
     },
     function(callback) {
       //GET CUSTOMER INFO
       Users.find({
         $and: [
           {scope: 'borrower'},
           {isVoid: false},
           {validate_email: true}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         customers_info=data;
         console.log(customers_info);
         return callback(null);
       });
     },
     function(callback) {
       //GET CUSTOMER INFO
       Customers.find({
         $and: [
           {company_id: staffs.company_id},
           {staff_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Declined'}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         customers=data;
         console.log(customers);
         return callback(null);
       });
     },
     function(callback) {
      //GET PAID CUSTOMER INFO
      Customers.find({
        $and: [
          {company_id: staffs.company_id},
          {staff_id: credentials._id},
          {isVoid: false},
          {isPaid: true}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        paid_customer=data;
        console.log('============', paid_customer);
        return callback(null);
      });
    },
     function(callback) {
       //COMPANY CAPITAL
       Capitals.find({
         $and: [
           {company_id: staffs.company_id},
           {isVoid: false}
         ]
       })
       .lean()
       .exec((err, data) => {
         if (err) {
           console.log(err);
         }
         company_capital=data;
         console.log(company_capital);
         return callback(null);
       });
     },
     function(callback) {
      //COMPANY COLLECTORS
      Collectors.find({
        $and: [
          {company_id: staffs.company_id},
          {staff_id: credentials._id},
          {branch_id: staffs.branch_id},
          {isVoid: false}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        collectors=data;
        return callback(null);
      });
    },
    function(callback) {
      //COLLECTORS INFOR
      Users.find({
        $and: [
          {scope: 'collector'},
          {isVoid: false},
          {validate_email: true}
        ]
      })
      .lean()
      .exec((err, data) => {
        if (err) {
          console.log(err);
        }
        collectors_info=data;
        console.log(collectors_info)
        return callback(null);
      });
    },
   ],
   function (callback) {
     reply.view('staff/customer/declined.html', {
       credentials: credentials,
       message: req.query.message,
       alertType: req.query.alertType,
       newMessage: req.query.newMessage,
       newAlertType: req.query.newAlertType,
       notification: notification,
       company_info: company_info,
       branches: branches,
       myBranches: myBranches,
       displayBranch: displayBranch,
       cnt_pending: cnt_pending,
       cnt_accepted: cnt_accepted,
       cnt_cancelled: cnt_cancelled,
       cnt_reported: cnt_reported,
       customers_info: customers_info,
       customers: customers,
       paid_customer: paid_customer,
       company_capital: company_capital,
       collectors: collectors,
       collectors_info: collectors_info,
     });
   }
 )
};

//SEARCH DECLINED
internals.search_declined = function (req, reply) {
  var credentials = {}, notification ={}, company_info ={}, staffs = {}, myBranches={}, branches={}, displayBranch={},
   cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, company_capital = {}, collectors = {}, collectors_info = {};


  var getbranch_id = req.query.branch_id;
  console.log(getbranch_id);
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
            return reply.redirect("/staff/dashboard?message=Error It seems you're not hired!&alertType=error");
					}
					credentials=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET THIS HIRING NOTIFCATION
        Staffs.find({
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
					notification=data;
          console.log(notification)
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
					company_info=data;
          console.log(company_info)
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
        //GET ALL COMPANY BRANCH
        Branches.find({
          $and: [
            {company_id: staffs.company_id},
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
        //GET STAFF BASES IN BRANCH
        Staffs.find({
          $and: [
            {staff_id: credentials._id},
            {company_id: staffs.company_id},
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
            {_id: getbranch_id},
            {company_id: staffs.company_id},
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
        //COUNT PENDING WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Pending'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_pending=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT ACCEPTED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Accepted'},
            {isPaid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_accepted=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT DECLINED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Declined'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_cancelled=data;
					return callback(null);
				});
			},
      function(callback) {
        //COUNT REPORTED WITH SAME BRANCH, STAFF AND COMPANY
        Customers.count({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Reported'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					cnt_reported=data;
					return callback(null);
				});
			},
      function(callback) {
        //GET CUSTOMER INFO
        Users.find({
          $and: [
            {scope: 'borrower'},
            {isVoid: false},
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					customers_info=data;
          console.log(customers_info);
					return callback(null);
				});
			},
      function(callback) {
        //GET CUSTOMER INFO
        Customers.find({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Declined'}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					customers=data;
          console.log(customers);
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY CAPITAL
        Capitals.find({
          $and: [
            {company_id: staffs.company_id},
            {isVoid: false}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
					}
					company_capital=data;
          console.log(company_capital);
					return callback(null);
				});
			},
      function(callback) {
        //COMPANY COLLECTORS
        Collectors.find({
          $and: [
            {company_id: staffs.company_id},
            {staff_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          collectors=data;
          return callback(null);
        });
      },
      function(callback) {
        //COLLECTORS INFOR
        Users.find({
          $and: [
            {scope: 'collector'},
            {isVoid: false},
            {validate_email: true}
          ]
        })
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log(err);
          }
          collectors_info=data;
          console.log(collectors_info)
          return callback(null);
        });
      },
    ],
    function (callback) {
      reply.view('staff/customer/declined.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
        notification: notification,
        company_info: company_info,
        branches: branches,
        myBranches: myBranches,
        displayBranch: displayBranch,
        cnt_pending: cnt_pending,
        cnt_accepted: cnt_accepted,
        cnt_cancelled: cnt_cancelled,
        cnt_reported: cnt_reported,
        customers_info: customers_info,
        customers: customers,
        company_capital: company_capital,
        collectors: collectors,
        collectors_info: collectors_info
      });
    }
  )
};
module.exports = internals;
