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
    path: "/company/reports",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'company Reports',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/reports/search",
    handler: Handlers.search,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'company Reports search',
      tags: ['api']
    }
  },
];

module.exports = internals;
