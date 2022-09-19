const Tmqp = require('./tmqp');

(async () => {
  const tmqp = new Tmqp({ host: 'localhost', port: 3001 });
  // const connection = await tmqp.connectTurtlekeeper();
  const queue = 'competition';
  let i = 0;
  setInterval(async () => {
    await tmqp.produce(queue, [i++]);
  }, 100);
})();
