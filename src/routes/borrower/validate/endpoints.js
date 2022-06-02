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
    path: "/borrower/validateEmail",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Validate borrower email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/borrower/validateEmail/check",
    handler: Handlers.check,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Validate borrower email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/borrower/validateEmail/resend",
    handler: Handlers.resend,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Validate borrower email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/borrower/validateEmail/update",
    handler: Handlers.update,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Update borrower email',
      tags: ['api']
    }
  },
];

module.exports = internals;
