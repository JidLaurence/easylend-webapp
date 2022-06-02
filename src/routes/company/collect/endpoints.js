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
    path: "/company/collect",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'company Collect',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/collect/update-collect",
    handler: Handlers.collects,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Add and Update collect',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/collect/search-collect",
    handler: Handlers.search_collect,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Update collect',
      tags: ['api']
    }
  },
];

module.exports = internals;
