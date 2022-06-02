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
    path: "/staff/release",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Staff Release',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/release/search-release",
    handler: Handlers.search_release,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Search Collector Release',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/release/add-release",
    handler: Handlers.add_release,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Add Collector Release',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/release/update-release",
    handler: Handlers.update_release,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Update Collector Release',
      tags: ['api']
    }
  },
];

module.exports = internals;
