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
    path: "/admin/account/active",
    handler: Handlers.active,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Accounts list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/admin/account/delete",
    handler: Handlers.delete,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Accounts list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/admin/account/report",
    handler: Handlers.report,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Accounts list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/admin/account/staff",
    handler: Handlers.staff,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Accounts list',
      tags: ['api']
    }
  }
];

module.exports = internals;
