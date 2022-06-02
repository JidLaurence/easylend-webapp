var compareDatesReverse;

compareDatesReverse = function (v1, v2, v3, m1, m2 ,m3, options) {
   if(String(v1) != String(m1) && String(v2) != String(m2) && String(v3) != String(m3)) {
      return options.fn(this);
    }
    return options.inverse(this);
   
};

module.exports = compareDatesReverse;
