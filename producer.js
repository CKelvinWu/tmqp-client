const Tmqp = require('./tmqp');

(async () => {
  const tmqp = new Tmqp({ host: 'localhost', port: 3006, cluster: true });
  // const connection = await tmqp.connectTurtlekeeper();
  const queue = 'competition';
  setTimeout(() => {
    tmqp.delete(queue);
    let j = 0;
    for (let i = 0; i < 900; i++) {
      tmqp.produce(queue, `${j++}`);
    }
  }, 1000);
  // setInterval(() => {
  //   tmqp.produce(queue, `${j++}`);
  // }, 0);

  // setInterval(async () => {
  // }, 100);
})();
