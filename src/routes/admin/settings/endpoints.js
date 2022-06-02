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
    path: "/admin/settings",
    handler: Handlers.index,
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
    path: "/admin/settings/add-calendars",
    handler: Handlers.add_calendars,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Company Add calendars',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/admin/settings/update-calendars",
    handler: Handlers.update_calendars,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
      description: 'Company Update Capital',
      tags: ['api']
    }
  },
];

module.exports = internals;
