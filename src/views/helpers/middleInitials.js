var middleInitials = function (val) {
  var dot = '.'
  if(val == null){
    val='';
    dot=''
  }
  return val.charAt(0).toUpperCase()+dot;
};

module.exports = middleInitials;
