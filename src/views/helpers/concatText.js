var concatText;

concatText = function (data, text, empty) {
  if(data==null) return empty

  return data + ' ' + text
  
};

module.exports = concatText;
