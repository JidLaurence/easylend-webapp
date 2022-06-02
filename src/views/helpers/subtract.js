var subtract;

subtract = function (val1, val2) {
    var total;
    total = parseFloat(val1) - parseFloat(val2)
    if(total<0){
        total=0;
    }
    var data = parseFloat(total);
    data = data.toFixed(2);
    return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

module.exports = subtract;
