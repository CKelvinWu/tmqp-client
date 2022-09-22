const Tmqp = require('./tmqp');

(async () => {
  const tmqp = new Tmqp({ host: 'localhost', port: 3003 });
  // const connection = await tmqp.connectTurtlekeeper();
  const queue = 'competition';
  let i = 0;
  await tmqp.produce(queue, [i++], { maxLength: 3 });
  await tmqp.produce(queue, [i++]);
  await tmqp.produce(queue, [i++]);
  await tmqp.produce(queue, [i++]);
  await tmqp.produce(queue, [i++]);

  // setInterval(async () => {
  // }, 100);
})();
