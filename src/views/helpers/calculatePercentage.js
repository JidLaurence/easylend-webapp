var calculatePercentage;

calculatePercentage = function (interest, capital) {
    var total = ((parseInt(interest)/100)*parseInt(capital))+parseInt(capital);
    total = parseFloat(total);
    total = total.toFixed(2);
    return total.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

module.exports = calculatePercentage;
