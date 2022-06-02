var disBranch = function (val) {
  if(val == null){
    return val=''
  }
  return val.charAt(0).toUpperCase() + val.slice(1) +' '+ 'branch'
};

module.exports = disBranch;
