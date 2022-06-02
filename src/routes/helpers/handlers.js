'use strict';

var internals = {},
  Crypto = require('crypto'),
  Users = require('../../database/models/users'),
  EmailCode = require('../../database/models/users'),
  Nodemailer = require('nodemailer');

internals.verifyEmail = function (req, reply) {
  EmailCode.findOne(
    { email: req.payload.email },
    '',
    { lean: true, sort: { createdAt: -1 } },
    function (err, res) {
      var Code = res;
      console.log('Code', Code);
      if (_.isNull(res)) {
        return reply.redirect(
          '/' +
            Code.scope +
            '/profile?message=Invalid Verification Code!&alertType=warning'
        );
      } else {
        if (Code.code === req.payload.code) {
          Users.findOneAndUpdate(
            { email: req.payload.email },
            { $set: { isVerified: true } },
            function (err, user) {
              if (err) {
                console.log(err);
              } else {
                return reply.redirect(
                  '/' +
                    Code.scope +
                    '/profile?message=Account Verified!&alertType=success'
                );
              }
            }
          );
        } else {
          return reply.redirect(
            '/' +
              Code.scope +
              '/profile?message=Invalid Verification Code!&alertType=warning'
          );
        }
      }
    }
  );
};

module.exports = internals;
