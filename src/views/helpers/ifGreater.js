var ifGreater;

ifGreater = function (v1,options) {
    if(parseInt(v1) == 0) {
        return options.fn(this);
      }
      return options.inverse(this);
};

module.exports = ifGreater;
