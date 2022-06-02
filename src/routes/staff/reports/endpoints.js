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
    path: "/staff/reports",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Staff Reports',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/reports/search",
    handler: Handlers.search,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Staff Reports search',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/reports/search/only_year",
    handler: Handlers.search,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Staff Reports search only year',
      tags: ['api']
    }
  },
];

module.exports = internals;
