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
    path: "/company/settings",
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company settings',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/add-branch",
    handler: Handlers.add_branch,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Add Branch',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/update-branch",
    handler: Handlers.update_branch,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Update Branch',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/add-staff",
    handler: Handlers.add_staff,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Add Staff',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/update-staff",
    handler: Handlers.update_staff,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Update Staff',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/add-capital",
    handler: Handlers.add_capital,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Add Capital',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/update-capital",
    handler: Handlers.update_capital,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Update Capital',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/update-payment",
    handler: Handlers.update_onlinePayment,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Update Online payment',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/update-interest",
    handler: Handlers.update_interest,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Update Interest',
      tags: ['api']
    }
  },
  {
    method: ["POST"],
    path: "/company/settings/update-logo",
    handler: Handlers.companyLogo,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['company']
      },
      description: 'Company Update Logo',
      tags: ['api'],
      payload: {
        maxBytes: 20000000,
      },
    }
  },
];

module.exports = internals;
