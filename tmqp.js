/* eslint-disable max-classes-per-file */
const net = require('net');
const EventEmitter = require('node:events');
const crypto = require('crypto');

class MyEmitter extends EventEmitter {}
const http = require('http');

const randomId = () => crypto.randomBytes(8).toString('hex');
const myEmitter = new MyEmitter();

function stringToHostAndPort(address) {
  return { host: address.split(':')[0], port: address.split(':')[1] };
}

async function getMasterIp(turtlekeeperConfig) {
  return new Promise((resolve) => {
    http.get(turtlekeeperConfig, (res) => {
      res.on('data', (data) => {
        const ip = data.toString();
        const config = stringToHostAndPort(ip);
        resolve(config);
      });
    }).end();
  });
}

class Tmqp {
  constructor(config) {
    this.config = { host: config.host, port: config.port };
    this.cluster = config.cluster || false;
    this.connectionTimeout = 3000;
    if (!this.cluster) {
      this.connect();
    } else {
      this.connectTurtlekeeper();
    }
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const client = net.connect(this.config);

      client.on('connect', () => {
        console.log('connected to server!');
        client.on('readable', () => {
          let reqBuffer = Buffer.from('');
          let buf;
          let reqHeader;
          while (true) {
            buf = client.read();
            if (buf === null) break;

            reqBuffer = Buffer.concat([reqBuffer, buf]);

            // Indicating end of a request
            const marker = reqBuffer.indexOf('\r\n\r\n');
            if (marker !== -1) {
              // Record the data after \r\n\r\n
              const remaining = reqBuffer.slice(marker + 4);
              reqHeader = reqBuffer.slice(0, marker).toString();
              // Push the extra readed data back to the socket's readable stream
              client.unshift(remaining);
              break;
            }
          }

          if (!reqHeader) return;
          const object = JSON.parse(reqHeader);

          if (object.message === 'connected') {
            // this.connection = new Connection(client);
            // const setcluster = {
            //   id: randomId(),
            //   method: 'setcluster',
            //   value: true,
            // };
            // this.connection.send(setcluster);
            resolve(client);
          } else if (object.method === 'consume') {
            myEmitter.emit(object.id, object);
          } else if (object.method === 'produce') {
            myEmitter.emit(object.id, object);
          }
        });
      });

      client.on('error', () => {
        console.log('Oops! cannot connect to the server');
        reject(new Error('cannot connect to the server'));
      });
      client.on('end', () => {
        console.log('disconnected from server');
      });

      this.client = client;
    });
  }

  async connectTurtlekeeper() {
    const config = await getMasterIp(this.config);
    return new Promise((resolve) => {
      const client = net.connect(config);

      client.on('connect', () => {
        console.log('connected to server!');
        client.on('readable', () => {
          let reqBuffer = Buffer.from('');
          let buf;
          let reqHeader;
          while (true) {
            buf = client.read();
            if (buf === null) break;

            reqBuffer = Buffer.concat([reqBuffer, buf]);

            // Indicating end of a request
            const marker = reqBuffer.indexOf('\r\n\r\n');
            if (marker !== -1) {
              // Record the data after \r\n\r\n
              const remaining = reqBuffer.slice(marker + 4);
              reqHeader = reqBuffer.slice(0, marker).toString();
              // Push the extra readed data back to the socket's readable stream
              client.unshift(remaining);
              break;
            }
          }

          if (!reqHeader) return;
          const object = JSON.parse(reqHeader);

          if (object.message === 'connected') {
            resolve(client);
          } else if (object.method === 'consume') {
            myEmitter.emit(object.id, object);
          } else if (object.method === 'produce') {
            myEmitter.emit(object.id, object);
          }
        });
      });

      client.on('error', () => {
        console.log('Oops! cannot connect to the server');
      });
      client.on('end', () => {
        console.log('disconnected from server');
      });
      this.client = client;
    });
  }

  async produce(queue, messages, option) {
    return new Promise((resolve, reject) => {
      const produceObj = {
        id: randomId(),
        method: 'produce',
        maxLength: option?.maxLength,
        queue,
        messages: typeof messages === 'string' ? [messages] : [...messages],
      };
      this.send(produceObj);
      // console.log(`${JSON.stringify(produceObj)}`);
      this[`Timeout${produceObj.id}`] = setTimeout(() => {
        console.log('Oops! can not get the response from server');
        if (!this.cluster) {
          this.connect();
        } else {
          this.connectTurtlekeeper();
        }
      }, this.connectionTimeout);
      myEmitter.once(produceObj.id, (data) => {
        clearTimeout(this[`Timeout${produceObj.id}`])
        console.log(`produce: ${JSON.stringify(data)}`);
        if (data.success) {
          resolve(data.message);
        }
        reject(data.message);
      });
    });
  }

  async consume(queue, nums = 1) {
    return new Promise((resolve) => {
      const consumeObj = {
        id: randomId(),
        method: 'consume',
        queue,
        nums,
      };
      this.send(consumeObj);
      // console.log(`${JSON.stringify(consumeObj)}`);
      this[`Timeout${consumeObj.id}`] = setTimeout(() => {
        console.log('Oops! can not get the response from server');
        if (!this.cluster) {
          this.connect();
        } else {
          this.connectTurtlekeeper();
        }
      }, this.connectionTimeout);
      myEmitter.on(consumeObj.id, (data) => {
        clearTimeout(this[`Timeout${consumeObj.id}`])
        resolve(data.messages);
      });
    });
  }

  async delete(queue) {
    return new Promise((resolve) => {
      const deleteObj = {
        id: randomId(),
        method: 'deleteQueue',
        queue,
      };
      this.send(deleteObj);
      // console.log(`${JSON.stringify(consumeObj)}`);
      myEmitter.once(deleteObj.id, (data) => {
        resolve(data.messages);
      });
    });
  }

  send(messages) {
    this.client.write(`${JSON.stringify(messages)}\r\n\r\n`);
  }

  end() {
    this.client.end();
  }
}

module.exports = Tmqp;
