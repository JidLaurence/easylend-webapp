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
    path: "/company/release",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'company Release',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/release/search-release",
    handler: Handlers.search_release,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Search Collector Release',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/release/add-release",
    handler: Handlers.add_release,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Add Collector Release',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/release/update-release",
    handler: Handlers.update_release,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Update Collector Release',
      tags: ['api']
    }
  },
];

module.exports = internals;
