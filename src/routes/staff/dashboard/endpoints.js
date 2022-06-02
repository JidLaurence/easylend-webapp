"use strict";
/**
 * ## Imports
 *
 */
//Handle the endpoints
var Handlers = require("./handlers"),
  internals = {};

internals.endpoints = [
  {
    method: ["GET"],
    path: "/staff/dashboard",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Staff Dashboard',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/dashboard/verifyPayment",
    handler: Handlers.verify_payment,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Verify customer online payment',
      tags: ['api']
    }
  },
];

module.exports = internals;
