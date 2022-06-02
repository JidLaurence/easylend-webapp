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
    path: "/borrower/company",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Company list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/borrower/company/search",
    handler: Handlers.search,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Company list',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/borrower/company/add-borrow",
    handler: Handlers.add_borrow,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Customer borrow',
      tags: ['api']
    }
  }
];

module.exports = internals;
