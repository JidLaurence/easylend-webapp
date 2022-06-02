"use strict";
/**
 * ## Imports
 *
 */
//Handle the endpoints
var Handlers = require("./handlers"),
  Joi = require("joi"),
  internals = {};

internals.endpoints = [
  {
    method: "GET",
    path: "/verify/email/sendCode/{scope}/{email}",
    handler: Handlers.mailer_gmail_send_code,
    config: {
      validate: {
        params: {
          scope: Joi.string().required(),
          email: Joi.string().required(),
        },
      },
      description: "Login in",
      tags: ["api"],
    },
  },
];

module.exports = internals;
