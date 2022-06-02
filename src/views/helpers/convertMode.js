var Moment = require('moment');

var convertMode = function (a) {
  var b;
  switch(parseInt(a)){
    case 1: b = "Daily";
        break;
    case 6: b = "Weekly";
        break;
    case 15: b = "Biweekly";
        break;
    case 30: b = "Monthly";
        break;
    case 360: b = "Yearly";
        break;
    }
  return b;
};

module.exports = convertMode;
