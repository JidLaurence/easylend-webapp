'use strict';

var internals = {},
  Async = require('async'),

  User = require('../../../database/models/users'),

  moment = require('moment');

//ACTIVE USERS
internals.active = function (req, reply) {
  var active = {}, activeCount = {}, deleteCount = {}, reportCount = {}, staffCount = {}, collectorCount = {};;
  Async.series(
    [
      (callback) => {
        User.find({
          $and: [
            { isVoid: false },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            active = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            activeCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            console.log(data);
            deleteCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { isReport: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            reportCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'staff' },
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            staffCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'collector' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collectorCount = data;
            return callback(null);
          });
      },
    ],
    function (callback) {
      reply.view('admin/accounts/active.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: req.auth.credentials,
        active: active,
        activeCount: activeCount,
        deleteCount: deleteCount,
        reportCount: reportCount,
        staffCount:staffCount,
        collectorCount: collectorCount
      });
    }
  );
};
//DELETE USERS
internals.delete = function (req, reply) {
  var deleted = {}, activeCount = {}, deleteCount = {}, reportCount = {}, staffCount = {}, collectorCount = {};;
  Async.series(
    [
      (callback) => {
        User.find({
          $and: [
            { isVoid: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            console.log(data);
            deleted = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            activeCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            console.log(data);
            deleteCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { isReport: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            reportCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'staff' },
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            staffCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'collector' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collectorCount = data;
            return callback(null);
          });
      },
    ],
    function (callback) {
      reply.view('admin/accounts/delete.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: req.auth.credentials,
        deleted: deleted,
        activeCount: activeCount,
        deleteCount: deleteCount,
        reportCount: reportCount,
        staffCount:staffCount,
        collectorCount: collectorCount
      });
    }
  );
};
//REPORTED USERS
internals.report = function (req, reply) {
  var reported = {}, activeCount = {}, deleteCount = {}, reportCount = {}, staffCount = {}, collectorCount = {};;
  Async.series(
    [
      (callback) => {
        User.find({
          $and: [
            { isVoid: false },
            { isReport: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            reported = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            activeCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            console.log(data);
            deleteCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { isReport: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            reportCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'staff' },
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            staffCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'collector' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collectorCount = data;
            return callback(null);
          });
      },
    ],
    function (callback) {
      reply.view('admin/accounts/report.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: req.auth.credentials,
        reported: reported,
        activeCount: activeCount,
        deleteCount: deleteCount,
        reportCount: reportCount,
        staffCount:staffCount,
        collectorCount: collectorCount
      });
    }
  );

};
//STAFF USERS
internals.staff = function (req, reply) {
  var staff = {}, activeCount = {}, deleteCount = {}, reportCount = {}, staffCount = {}, collectorCount = {};;
  Async.series(
    [
      (callback) => {
        User.find({
          $or: [
            {
              $and: [
                { isVoid: false },
                { scope: 'staff' },
              ]
            },
            {
              $and: [
                { isVoid: false },
                { scope: 'collector' }
              ]
            }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            staff = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            activeCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            console.log(data);
            deleteCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { isReport: true },
            { scope: 'borrower' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            reportCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'staff' },
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            staffCount = data;
            return callback(null);
          });
      },
      (callback) => {
        User.count({
          $and: [
            { isVoid: false },
            { scope: 'collector' }
          ]
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            collectorCount = data;
            return callback(null);
          });
      },
    ],
    function (callback) {
      reply.view('admin/accounts/staff.html', {
        message: req.query.message,
        alertType: req.query.alertType,
        credentials: req.auth.credentials,
        staff: staff,
        activeCount: activeCount,
        deleteCount: deleteCount,
        reportCount: reportCount,
        staffCount:staffCount,
        collectorCount: collectorCount
      });
    }
  );

};
module.exports = internals;
