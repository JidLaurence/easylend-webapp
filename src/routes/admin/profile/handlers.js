'use strict';

var internals = {},
  Async = require('async'),

  Users = require('../../../database/models/users'),
  
  moment = require('moment');

internals.index = function (req, reply) {
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
      reply.view('admin/profile/index.html', {
        credentials: credentials,
        message: req.query.message,
        alertType: req.query.alertType
      });
    }
  )
}
internals.update = function (req, reply) {
	var payload = {
    email: req.payload.email,
    birthday: req.payload.birthday,
    firstname: req.payload.firstname,
    lastname: req.payload.lastname,
    middlename: req.payload.middlename,
    region: req.payload.region_name,
    province: req.payload.province_name,
    city: req.payload.city_name,
    barangay: req.payload.barangay_name,
    address: req.payload.address
	};
  Users.update(
    { _id: req.auth.credentials._id  },
    {
      $set: payload,
    },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        reply.redirect("/admin/profile?message=Successfully updated!&alertType=success");
      }
    },
  );
};
module.exports = internals;
