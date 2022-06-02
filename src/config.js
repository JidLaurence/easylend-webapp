module.exports = {
  env: {
    dev: false,
  },
  hapi: {
    port: 4444,
  },
  app: {
    name: 'easylend',
    title: 'Easylend',
  },
  smtp: {
    host: 'in-v3.mailjet.com',
    port: 587,
    user: "851a44802051b71d7de6b2df46a46d80",
    pass: "7ea5216f5101165b7d68733e7fb25849",
    email: "easylendcompany@gmail.com"
  },
  mongodb_production: {
    ip: '127.0.0.1',
    port: '2017',
    app: 'easylend',
    username: '',
    password: '',
  },
  mongodb_local: {
    ip: 'localhost',
    port: '27017',
    app: 'easylend',
  },
  url: {
    local: '',
  },
  crypto: {
    privateKey:
      'agX/xoQ4d6erQ5TWeT4Tbjx6Fo8Ng+0lhxBpFTAvoy3UWGnirQuE00IOlaUfBQJ+p6XUsJfquk8q6+807VaRDaP5m1E07JVYgjMHzi24Sl1Q7EA4eY7vNGw91kN1EP3ucnyJh7hOnQbmvBmXEO/0j6RYkzY+WqdWiKSxdYgDNek=',
    tokenExpiry: 1 * 30 * 1000 * 60, //1 hour
  },
  validation: {
    username: /^[a-zA-Z0-9]{5,12}$/,
    password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,12}$/,
  },
};
