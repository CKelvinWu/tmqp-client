const tmqp = require('./tmqp');
(async () => {
  const connection = await tmqp.connect({ host: 'localhost', port: 3000 });
  const queue = 'test';
  await connection.produce(queue, '1');
  await connection.produce(queue, '2');
  await connection.produce(queue, '3');
  await connection.produce(queue, '4');

  await connection.produce('test1', 'test1');
  await connection.produce('test1', 'test2');
  await connection.produce('test1', 'test3');
  await connection.produce('test1', 'test4');
  await connection.end();
})();

module.exports = tmqp;
