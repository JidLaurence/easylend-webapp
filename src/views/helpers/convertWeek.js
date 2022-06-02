var Moment = require('moment');

var convertWeek = function (varDate) {
  var weeks = String(varDate);
  var output,old='';
  for(i=0; i<weeks.length; i++){
    weeks.charAt(i);
    if(weeks.charAt(i) == ' '){
      break;
    }else{
      output = weeks.charAt(i);
      old= old+''+output;
    }
  }
  return old;
};

module.exports = convertWeek;
