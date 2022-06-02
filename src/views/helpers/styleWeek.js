var Moment = require('moment');

var styleWeek = function (week) {
  var style='';
  if(week == 'Sun'){  
    style= 'text-danger';
  }
  return style;
};

module.exports = styleWeek;
