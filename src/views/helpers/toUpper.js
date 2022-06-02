var toUpper = function (val) {
  if(val == null || val == ''){
    return val;
  }
  return val.charAt(0).toUpperCase() + val.slice(1)
};

module.exports = toUpper;
