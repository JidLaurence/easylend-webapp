var age;

age = function (bday) {
    if(bday == null || bday == ''){
        return age;
    }
    var today = new Date();
    var birthDate = new Date(bday);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
   
    return age;
};

module.exports = age;
