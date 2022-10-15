
# tmqp-client

An open source npm package of a client to make connections to TurtleMQ server for Node.js.
## Features

Turtle Message Queue Protocol (TMQP) is based on TCP (Transimssion Control Protocol) which is a 
communication protocol of the transport level in OSI tower.

- Supports produce messages

- Supprots consume messages

- Supports delete queue

- Supports cluster mode
# Quick Start

    
## Install

```bash
  npm install tmqp-client
```

## Basic Usage

### Producer

```js
const Tmqp = require('tmqp-client');

(async () => {
  const tmqp = new Tmqp({ host: 'localhost', port: 5566 });
  const queue = 'my-queue';
  await tmqp.produce(queue, 'message')
})();

```
The default queue size is 1000. You can pass the configuration to the command.

```js
await tmqp.produce(queue, 'message', { maxLength: 2000 })
```


### Consumer

```js
const Tmqp = require('tmqp-client');

(async () => {
  const tmqp = new Tmqp({ host: 'localhost', port: 5566 });
  const queue = 'my-queue'
  const messages = await tmqp.consume(queue, 1);
  console.log(messages);
})();

```

### Delete queue

```js
await tmqp.delete('my-queue');

```

## Cluster

Create connection to Turtle Finder to get the TurtleMQ master server configuration.

```js
// Connect to the Turtle Finder server
const tmqp = new Tmqp({ host: 'localhost', port: 25566, cluster: true });
```
# Contact

Thank you for using tmqp-client :-)

c.kelvin.wu@gmail.com
