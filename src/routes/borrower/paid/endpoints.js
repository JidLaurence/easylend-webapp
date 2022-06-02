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
    path: "/borrower/paid",
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
    path: "/borrower/paid/select",
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
];

module.exports = internals;
