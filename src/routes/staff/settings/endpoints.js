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
    path: "/staff/settings",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Company settings',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/settings/add-collector",
    handler: Handlers.add_collector,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Company Add Collector',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/settings/update-collector",
    handler: Handlers.update_collector,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Company Update Collector',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/settings/add-capital",
    handler: Handlers.add_capital,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Company Add Capital',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/settings/update-capital",
    handler: Handlers.update_capital,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Company Update Capital',
      tags: ['api']
    }
  }
];

module.exports = internals;
