const Tmqp = require('./tmqp');

(async () => {
  const tmqp = new Tmqp({ host: 'localhost', port: 3006 });
  const connection = await tmqp.connectTurtlekeeper();
  const queue = 'competition';
  let i = 0;
  setInterval(async () => {
    await connection.produce(queue, [i++]);
  }, 1000);
  // await connection.produce(queue, ['Turtle', 'run', 'faster', 'than', 'rabbit']);

  // await connection.end();
})();
