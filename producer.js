const tmqp = require('./tmqp');
(async () => {
  const connection = await tmqp.connect({ host: 'localhost', port: 3000 });
  const queue = 'test';
  connection.produce(queue, '1');
  connection.produce(queue, '2');
  connection.produce(queue, '3');
  connection.produce(queue, '4');

  connection.produce('test1', 'test1');
  connection.produce('test1', 'test2');
  connection.produce('test1', 'test3');
  connection.produce('test1', 'test4');
  connection.end();
})();

module.exports = tmqp;
