
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

# Basic Usage

## Producer

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


## Consumer

```js
const Tmqp = require('tmqp-client');

(async () => {
  const tmqp = new Tmqp({ host: 'localhost', port: 5566 });
  const queue = 'my-queue'
  const messages = await tmqp.consume(queue, 1);
  console.log(messages);
})();

```

## Delete queue

```js
await tmqp.delete('my-queue');

```

# Cluster

Create connection to Turtle Finder to get the TurtleMQ master server configuration.

```js
// Connect to the Turtle Finder server
const tmqp = new Tmqp({ host: 'localhost', port: 25566, cluster: true });
```

## Connection

If you choose to use cluster mode, you have to start a [Turtle Finder](https://github.com/CKelvinWu/turtlekeeper/tree/main/turtleFinder) server first.

The cluster mode will ask for master IP and port from the Turtle Finder,
 and directly connect to the TurtleMQ master server. 
 
When the TurtleMQ master server 
 crushed or lost connection, the tmqp-client will automatically ask the Turtle Finder again
 for the new master IP and reconnect to the TurtleMQ server.
 
<div align="left">
<img width="50%" alt="tmqp-cluster-connection" src="https://user-images.githubusercontent.com/57265307/199387664-6c2ddac8-c278-4d22-af8b-a8b4ac0ad391.png"/>
</div> 

# Contact

Thank you for using tmqp-client :-)

Email: c.kelvin.wu@gmail.com

Linkedin: https://www.linkedin.com/in/chung-kai-wu/
