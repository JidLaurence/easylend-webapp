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
    path: "/staff/customer",
    handler: Handlers.pending,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Pending customer list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/customer/accepted",
    handler: Handlers.accepted,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Accepted customer list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/customer/declined",
    handler: Handlers.declined,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Declined customer list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/customer/search-pending",
    handler: Handlers.search_pending,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Search pending customer and branch',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/customer/update-pending",
    handler: Handlers.update_status_pending,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Update customer status',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/customer/search-accepted",
    handler: Handlers.search_accepted,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Search Accepted customer and branch',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/staff/customer/update-accepted",
    handler: Handlers.update_status_accepted,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Update customer status',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/staff/customer/search-declined",
    handler: Handlers.search_declined,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['staff']
      },
      description: 'Search Accepted customer and branch',
      tags: ['api']
    }
  },
];

module.exports = internals;
