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
    path: "/staff/validateEmail",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Validate staff email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/validateEmail/check",
    handler: Handlers.check,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Validate staff email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/validateEmail/resend",
    handler: Handlers.resend,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Validate staff email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/validateEmail/update",
    handler: Handlers.update,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Update staff email',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/validate/company-invite",
    handler: Handlers.company_invite,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Company invitation',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/apply",
    handler: Handlers.apply,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Staff is not hired',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/expire",
    handler: Handlers.expire,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Company expire',
      tags: ['api']
    }
  }
];

module.exports = internals;
