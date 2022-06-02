var checkBalance;

checkBalance = function (balance, capital, options) {
  if(balance != capital){
    return options.inverse(this);//FALSE
  }else{
    return options.fn(this);//TRUE
  }
};

module.exports = checkBalance;
