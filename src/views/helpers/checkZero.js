var checkZero;

checkZero = function (value) {
  if(value==0 ||value =='' || value==null){
    return 0;
  }else{
    return value;
  }
};

module.exports = checkZero;
