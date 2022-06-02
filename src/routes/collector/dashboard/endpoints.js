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
    path: "/collector/dashboard",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['collector'],
      },
      description: 'Collector',
      tags: ['api']
    }
  },
];

module.exports = internals;
