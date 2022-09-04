const tmqp = require('./tmqp');

tmqp.connect({ host: 'localhost', port: 3000 }, (error, connection) => {
  if (error) console.log(error);
  // const queue = 'test';

  connection.consume('test', (message) => {
    console.log('test: ', message);
  });
});

module.exports = tmqp;
