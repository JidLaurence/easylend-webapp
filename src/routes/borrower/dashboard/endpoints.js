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
    path: "/borrower/dashboard",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower'],
      },
      description: 'Company list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/borrower/dashboard/select",
    handler: Handlers.select,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower'],
      },
      description: 'Select Company',
      tags: ['api']
    }
  },
  {
    method: 'POST',
    path: '/borrower/dashboard/payOnline',
    handler: Handlers.add_payment,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Pay Online',
      tags: ['api'],
      payload: {
        maxBytes: 20000000,
      },
    }
  },
  {
    method: 'POST',
    path: '/borrower/dashboard/payOnline-update',
    handler: Handlers.update_payment,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Pay Online',
      tags: ['api']
    }
  },
];

module.exports = internals;
