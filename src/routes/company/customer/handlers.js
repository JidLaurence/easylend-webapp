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
  var credentials = {}, staffs = {}, branches={}, company_info={},
  cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, company_capital = {}, collectors = {}, collectors_info = {}, myBranches={}, paid_customer= {};
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
           return reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
         }
         var todayDate = new Date();
         if(credentials.expiry_end < todayDate){
           return reply.redirect('/company/expire');
         }
      
         credentials=data;
        return callback(null);
       });
     },
     function(callback) {
       //GET ALL COMPANY BRANCH
       Branches.find({
         $or:[
           {
            $and: [
              {company_id: credentials._id},
              {isVoid: false},
            ]
           }
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
       //COUNT PENDING ALL BRANCH, STAFF AND COMPANY
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
           {company_id: credentials._id},
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
           {company_id: credentials._id},
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
      //GET COMPANY COLLECTORS
      Collectors.find({
        $and: [
          {company_id: credentials._id},
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
      //GET COLLECTORS INFO
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
        return callback(null);
      });
    },
    function(callback) {
      //GET BASES IN BRANCH
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
      //GET PAID CUSTOMER INFO
      Customers.find({
        $and: [
          {company_id: credentials._id},
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
   ],
   function (callback) {
     reply.view('company/customer/pending.html', {
       credentials: credentials,
       message: req.query.message,
       alertType: req.query.alertType,
       newMessage: req.query.newMessage,
       newAlertType: req.query.newAlertType,
       branches: branches,
       cnt_pending: cnt_pending,
       cnt_accepted: cnt_accepted,
       cnt_cancelled: cnt_cancelled,
       cnt_reported: cnt_reported,
       customers_info: customers_info,
       customers: customers,
       company_capital: company_capital,
       collectors: collectors,
       collectors_info: collectors_info,
       myBranches: myBranches,
       paid_customer: paid_customer,
       company_info: company_info
     });
   }
 )
};
//SEARCH PENDING
internals.search_pending = function (req, reply) {
  var credentials = {}, myBranches={}, branches={}, displayBranch={},
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
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            return reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
					}
					credentials=data;
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
            {_id: getbranch_id},
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Pending'},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
      reply.view('company/customer/pending.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
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
  var credentials = {}, staffs = {}, branches={},paid_customer={}, company_info={},
  cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, company_capital = {}, collectors = {}, collectors_info = {}, myBranches={};

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
           return reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
         }
         credentials=data;
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
         return callback(null);
       });
     },
     function(callback) {
       //COUNT PENDING ALL BRANCH, STAFF AND COMPANY
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
           {company_id: credentials._id},
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
           {company_id: credentials._id},
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
      //GET COMPANY COLLECTORS
      Collectors.find({
        $and: [
          {company_id: credentials._id},
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
      //GET COLLECTORS INFO
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
        return callback(null);
      });
    },
    function(callback) {
      //GET BASES IN BRANCH
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
      //GET PAID CUSTOMER INFO
      Customers.find({
        $and: [
          {company_id: credentials._id},
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
   ],
   function (callback) {
     reply.view('company/customer/accepted.html', {
       credentials: credentials,
       message: req.query.message,
       alertType: req.query.alertType,
       newMessage: req.query.newMessage,
       newAlertType: req.query.newAlertType,
       branches: branches,
       cnt_pending: cnt_pending,
       cnt_accepted: cnt_accepted,
       cnt_cancelled: cnt_cancelled,
       cnt_reported: cnt_reported,
       customers_info: customers_info,
       customers: customers,
       company_capital: company_capital,
       collectors: collectors,
       collectors_info: collectors_info,
       myBranches: myBranches,
       paid_customer: paid_customer,
       company_info: company_info
     });
   }
 )
};
//SEARCH ACCEPTED
internals.search_accepted = function (req, reply) {
  var credentials = {}, myBranches={}, branches={}, displayBranch={},
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
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            return reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
					}
					credentials=data;
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
            {_id: getbranch_id},
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
      reply.view('company/customer/accepted.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
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
  var credentials = {}, staffs = {}, branches={}, company_info={}, paid_customer={},
  cnt_pending, cnt_accepted, cnt_cancelled, cnt_reported, customers_info = {}, customers = {}, company_capital = {}, collectors = {}, collectors_info = {}, myBranches={};

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
           return reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
         }
         credentials=data;
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
         return callback(null);
       });
     },
     function(callback) {
       //COUNT PENDING ALL BRANCH, STAFF AND COMPANY
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
       Customers.countDocuments({
         $and: [
           {company_id: credentials._id},
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
           {company_id: credentials._id},
           {isVoid: false},
           {isStatus: 'Declined'},
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
           {company_id: credentials._id},
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
      //GET COMPANY COLLECTORS
      Collectors.find({
        $and: [
          {company_id: credentials._id},
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
      //GET COLLECTORS INFO
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
        return callback(null);
      });
    },
    function(callback) {
      //GET BASES IN BRANCH
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
      //GET PAID CUSTOMER INFO
      Customers.find({
        $and: [
          {company_id: credentials._id},
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
   ],
   function (callback) {
     reply.view('company/customer/declined.html', {
       credentials: credentials,
       message: req.query.message,
       alertType: req.query.alertType,
       newMessage: req.query.newMessage,
       newAlertType: req.query.newAlertType,
       branches: branches,
       cnt_pending: cnt_pending,
       cnt_accepted: cnt_accepted,
       cnt_cancelled: cnt_cancelled,
       cnt_reported: cnt_reported,
       customers_info: customers_info,
       customers: customers,
       company_capital: company_capital,
       collectors: collectors,
       collectors_info: collectors_info,
       myBranches: myBranches,
       company_info: company_info,
       paid_customer: paid_customer
     });
   }
 )
};
//SEARCH DECLINED
internals.search_declined = function (req, reply) {
  var credentials = {}, myBranches={}, branches={}, displayBranch={},
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
            {validate_email: true}
          ]
        })
				.lean()
				.exec((err, data) => {
					if (err) {
						console.log(err);
            return reply.redirect("/company/dashboard?message=Error It seems you're not hired!&alertType=danger");
					}
					credentials=data;
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
            {_id: getbranch_id},
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
            {branch_id: getbranch_id},
            {isVoid: false},
            {isStatus: 'Declined'},
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
            {company_id: credentials._id},
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
            {company_id: credentials._id},
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
      reply.view('company/customer/declined.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType,
        newMessage: req.query.newMessage,
        newAlertType: req.query.newAlertType,
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
