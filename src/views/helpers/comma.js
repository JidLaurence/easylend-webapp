var comma;

comma = function (data) {
  if(data==null) return 0

  data = parseFloat(data);
  data = data.toFixed(2);
  return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

module.exports = comma;
