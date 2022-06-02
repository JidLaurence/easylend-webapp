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
    path: "/staff/paid",
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
    method: ["GET"],
    path: "/staff/paid/search",
    handler: Handlers.search_collect,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Search collect',
      tags: ['api']
    }
  },
];

module.exports = internals;
