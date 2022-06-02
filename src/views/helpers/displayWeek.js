var Moment = require('moment');

var displayWeek = function (day, week) {
  var display;
  if(week == 'Sun'){  
    display = week
  }else{
    display=day
  }
  return display;
};

module.exports = displayWeek;
