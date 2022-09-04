const tmqp = require('./tmqp');

(async () => {
  const connection = await tmqp.connect({ host: 'localhost', port: 3000 });
  const queue = 'test';
  (async () => {
    const message = await connection.consume('test');
    console.log(message);
  })();
  (async () => {
    const message = await connection.consume('test1');
    console.log(message);
  })();
})();

module.exports = tmqp;
