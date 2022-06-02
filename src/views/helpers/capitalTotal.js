var capitalTotal;

capitalTotal = function (capital, interest, months) {
    var a = parseInt(capital)/parseInt(interest);
    var b = a* parseInt(months);
    return b+parseInt(capital);
};

module.exports = capitalTotal;
