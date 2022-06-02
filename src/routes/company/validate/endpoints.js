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
    path: "/company/validateEmail",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Validate company email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/validateEmail/check",
    handler: Handlers.check,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Validate company email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/validateEmail/resend",
    handler: Handlers.resend,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Validate company email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/validateEmail/update",
    handler: Handlers.update,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Update company email',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/expire",
    handler: Handlers.expire,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Expire company',
      tags: ['api']
    }
  },
];

module.exports = internals;
