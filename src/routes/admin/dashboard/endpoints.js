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
    path: "/admin/dashboard",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Admin Dashboard',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/admin/dashboard/selected",
    handler: Handlers.selected,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Admin Company list',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/admin/dashboard/checkout",
    handler: Handlers.checkout,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Checkout company payment',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/admin/dashboard/expiration",
    handler: Handlers.expiration,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Update company expiration date',
      tags: ['api']
    }
  },
];

module.exports = internals;
