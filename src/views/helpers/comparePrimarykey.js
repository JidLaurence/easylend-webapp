var comparePrimarykey;

comparePrimarykey = function (v1, v2, v3, v4, v5, m1, m2 ,m3, m4, m5, options) {
    if(String(v1) == String(m1) && String(v2) == String(m2) && String(v3) == String(m3) && String(v4) == String(m4) && String(v5) == String(m5)) {
        return options.fn(this);
      }
      return options.inverse(this);
};

module.exports = comparePrimarykey;
