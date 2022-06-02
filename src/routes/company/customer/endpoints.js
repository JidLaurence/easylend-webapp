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
    path: "/company/customer",
    handler: Handlers.pending,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Pending customer list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/customer/accepted",
    handler: Handlers.accepted,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Accepted customer list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/customer/declined",
    handler: Handlers.declined,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Declined customer list',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/customer/search-pending",
    handler: Handlers.search_pending,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Search pending customer and branch',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/customer/search-accepted",
    handler: Handlers.search_accepted,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Search Accepted customer and branch',
      tags: ['api']
    }
  },
  {
    method: ["GET"],
    path: "/company/customer/search-declined",
    handler: Handlers.search_declined,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Search Accepted customer and branch',
      tags: ['api']
    }
  },
];

module.exports = internals;
