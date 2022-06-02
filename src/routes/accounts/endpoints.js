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
    method: ['GET'],
    path: '/',
    handler: Handlers.index,
    config: {
      auth: {
        strategy: 'standard',
      },
    },
  },
  {
    method: ['GET'],
    path: '/login',
    handler: Handlers.login,
  },
  {
    method: ['GET'],
    path: '/logout',
    handler: Handlers.logout,
  },
  {
    method: ['GET'],
    path: '/register',
    handler: Handlers.register,
  },
  {
    method: ['POST'],
    path: '/account/create',
    handler: Handlers.create_account,
    config: {
      validate: {
          payload: {
              email: Joi.string().required(),
              password: Joi.string().required(),
              scope: Joi.string().required(),
              confirm_password: Joi.string().required()
          }
      }
    }
  }
];

module.exports = internals;
