'use strict';
/**
 * ## Imports
 *
 */
//Handle the endpoints
var Handlers = require('./handlers'),
  Joi = require('joi'),
    internals = {};

internals.endpoints = [
  {
    method: [ 'GET', 'POST' ],
    path: '/noscript',
    handler: Handlers.noscript,
    config: {
      description: 'noscript',
      tags: ['api'],
    }
  },
  {
    method: [ 'GET', 'POST' ],
    path: '/{any*}',
    handler: Handlers.error404,
    config: {
      description: '404',
      tags: ['api'],
    }
  },
  {
      method: [ 'GET', 'POST' ],
      path: '/landing',
      handler: Handlers.landing,
      config: {
        description: 'landing page',
        tags: ['api'],
      }
  },
  {
      method: [ 'GET', 'POST' ],
      path: '/contactus',
      handler: Handlers.contactUs,
      config: {
        description: 'contact us page',
        tags: ['api'],
      }
  },
  {
    method: ['POST'],
    path: '/web/authentication',
    handler: Handlers.web_authentication,
    // config: {
    //   validate: {
    //       payload: {
    //           email: Joi.string().required(),
    //           password: Joi.string().required()
    //       }
    //   }
    // }
  },
]

module.exports = internals;
