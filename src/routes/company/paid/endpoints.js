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
    path: "/company/paid",
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
    method: ["GET"],
    path: "/company/paid/search",
    handler: Handlers.search_collect,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Search collect',
      tags: ['api']
    }
  },
];

module.exports = internals;
