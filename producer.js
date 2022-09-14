const Tmqp = require('./tmqp');

(async () => {
  const tmqp = new Tmqp({ host: '54.169.153.198', port: 3006 });
  const connection = await tmqp.connectTurtlekeeper();
  const queue = 'competition';
  let i = 0;
  setInterval(async () => {
    await connection.produce(queue, [i++]);
  }, 2000);
})();
