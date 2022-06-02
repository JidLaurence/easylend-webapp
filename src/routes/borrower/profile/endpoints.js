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
    path: "/borrower/profile",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Profile',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/borrower/profile/update",
    handler: Handlers.update,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Profile Update',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/borrower/profile/change-img",
    handler: Handlers.update_img,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['borrower']
      },
      description: 'Change profile pic',
      tags: ['api'],
      payload: {
        maxBytes: 20000000,
      },
    }
  },
];

module.exports = internals;
