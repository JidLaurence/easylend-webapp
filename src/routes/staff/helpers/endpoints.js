"use strict";
/**
 * ## Imports
 *
 */
//Handle the endpoints
var Handlers = require("./handlers"),
  Joi = require('joi'),
  internals = {};

internals.endpoints = [
  {
    method: 'GET',
    path: '/staff/getCollector/{_id}',
    handler: Handlers.getCollector,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Get collector',
      tags: ['api']
    }
  },
];

module.exports = internals;
