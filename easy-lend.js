'use strict';

var HapiServer = require('./src/config/hapi');

var Mongoose = require('mongoose');

require('./src/database/mongodb');

HapiServer.start(function () {
  console.log('');
  console.log('Server is running at: ' + HapiServer.info.uri);
});
