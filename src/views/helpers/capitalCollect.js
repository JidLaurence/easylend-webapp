var capitalCollect;

capitalCollect = function (capital, interest, months, type) {
    var a = parseInt(capital)/parseInt(interest);
    var b = a* parseInt(months);
    var d =  b+parseInt(capital);
    var e =parseInt(months) * 30;
    var f = e/parseInt(type);
    var g =  Math.round(d / f);
    return g;
};

module.exports = capitalCollect;
