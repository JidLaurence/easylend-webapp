var capitalInterest;

capitalInterest = function (capital, interest, months) {
    var a = parseInt(capital)/parseInt(interest);
    var b = a* parseInt(months);
    return b;
};

module.exports = capitalInterest;
