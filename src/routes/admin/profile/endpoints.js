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
    path: "/admin/profile",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Profile',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/admin/profile/update",
    handler: Handlers.update,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Profile Update',
      tags: ['api']
    }
  },
];

module.exports = internals;
