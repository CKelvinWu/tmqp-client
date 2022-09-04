const tmqp = require('./tmqp');

tmqp.connect({ host: 'localhost', port: 3000 }, (error, connection) => {
  if (error) console.log(error);
  const queue = 'test';

  connection.produce(queue, '1');
  connection.produce(queue, '2');
  connection.produce(queue, '3');
  connection.produce(queue, '4');

  connection.produce('test1', 'test1');
  connection.produce('test1', 'test2');
  connection.produce('test1', 'test3');
  connection.produce('test1', 'test4');
});

module.exports = tmqp;
