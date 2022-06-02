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
    path: "/staff/collect",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Staff Collect',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/collect/update-collect",
    handler: Handlers.collects,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Add and Update collect',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/collect/search-collect",
    handler: Handlers.search_collect,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Update collect',
      tags: ['api']
    }
  },
];

module.exports = internals;
