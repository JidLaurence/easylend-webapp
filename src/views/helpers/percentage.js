var percentage;

percentage = function (val1, val2) {
    var total = 0;
    if(val1=='' || val2 ==''){
        return total;
    }else{
        //adding paid and not paid to get the total of accepted customer applied;
        total = parseInt(val1) + parseInt(val2);
        var gettotal = parseFloat(val1 / total).toFixed(2);
        total= (gettotal*100).toFixed(0);
        return total
    }
};

module.exports = percentage;
