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
    method: ["POST"],
    path: "/collector/signup",
    handler: Handlers.signup
  },
  {
    method: ["POST"],
    path: "/collector/update_profile",
    handler: Handlers.update_profile
  },
  {
    method: ["POST"],
    path: "/collector/update_code",
    handler: Handlers.update_code
  },
  {
    method: ["POST"],
    path: "/collector/accept_company",
    handler: Handlers.accept_company
  },
  {
    method: ["POST"],
    path: "/collector/login",
    handler: Handlers.login
  },
  {
    method: ["POST"],
    path: "/collector/save_collected",
    handler: Handlers.save_collected_today
  },
  {
    method: ["POST"],
    path: "/collector/get_invitation",
    handler: Handlers.get_invitation
  },
];

module.exports = internals;
