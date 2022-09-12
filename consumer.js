const Tmqp = require('./tmqp');

(async () => {
  // const connection = await tmqp.connect({ host: 'localhost', port: 3000 });
  const tmqp = new Tmqp({ host: 'localhost', port: 3006 });
  const connection = await tmqp.connectTurtlekeeper();
  (async () => {
    const messages = await connection.consume('competition', 3);
    console.log(messages);
  })();
})();
