const Tmqp = require('./tmqp');

(async () => {
  // const connection = await tmqp.connect({ host: 'localhost', port: 3000 });
  const tmqp = new Tmqp({ host: 'localhost', port: 3006, cluster: true });
  (async () => {
    setInterval(async () => {
      const messages = await tmqp.consume('competition', 10);
      console.log(messages);
    }, 100);
  })();
})();
