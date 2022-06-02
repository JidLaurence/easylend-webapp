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
    path: '/getCollector/{_id}',
    handler: Handlers.getCollector
  },
  {
    method: 'GET',
    path: '/getBranch/{_id}',
    handler: Handlers.getBranch
  }
];

module.exports = internals;
