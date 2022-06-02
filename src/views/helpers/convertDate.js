var Moment = require('moment');

var convertDate = function (varDate, varFormat) {
  if(varDate==null) return ''

  return Moment(varDate).format(varFormat);
};

module.exports = convertDate;
