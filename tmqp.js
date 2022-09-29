/* eslint-disable max-classes-per-file */
const net = require('net');

const socket = new net.Socket();
const EventEmitter = require('node:events');
const crypto = require('crypto');

class MyEmitter extends EventEmitter {}
const http = require('http');

// const Buffer = require('buffer');

const randomId = () => crypto.randomBytes(8).toString('hex');
const myEmitter = new MyEmitter();

function stringToHostAndPort(address) {
  if (!address) {
    return null;
  }
  return { host: address.split(':')[0], port: address.split(':')[1] };
}

async function getMasterIp(turtlekeeperConfig) {
  return new Promise((resolve) => {
    http.get(turtlekeeperConfig, (res) => {
      res.on('data', (data) => {
        const ip = data.toString();
        const { master } = JSON.parse(ip);
        const config = stringToHostAndPort(master);
        resolve(config);
      });
    }).end();
  });
}

class Tmqp {
  constructor(config) {
    this.config = { host: config.host, port: config.port };
    this.cluster = config.cluster || false;
    this.connectionTimeout = 5000;
    this.pending = () => socket.pending;
    this.reconnect();
  }

  reconnect() {
    this.client?.removeAllListeners();
    this.client?.end();
    this.connect();
  }

  async connect() {
    try {
      socket.setKeepAlive(true, 5000);
      let client;
      if (this.cluster) {
        const config = await getMasterIp(this.config);
        if (!config) return;
        client = socket.connect(config);
      } else {
        client = socket.connect(this.config);
      }

      client.on('connect', () => {
        console.log('connected to server!');
        let reqBuffer = Buffer.from('');

        client.on('readable', () => {
          const buf = client.read();
          reqBuffer = Buffer.concat([reqBuffer, buf]);

          while (true) {
            if (reqBuffer === null) break;
            // Indicating end of a request
            const marker = reqBuffer.indexOf('\r\n\r\n');
            // Find no seperator
            if (marker === -1) break;
            // Record the data after \r\n\r\n
            const reqHeader = reqBuffer.slice(0, marker).toString();
            // Keep hte extra readed data in the reqBuffer
            reqBuffer = reqBuffer.slice(marker + 4);

            const object = JSON.parse(reqHeader);
            if (object.method === 'consume' || object.method === 'produce' || object.method === 'delete') {
              myEmitter.emit(object.id, object);
            }
          }
        });
      });

      client.once('error', (error) => {
        console.log(error);
        return new Error(error);
      });
      client.on('end', () => {
        console.log('disconnected from server');
      });

      this.client = client;
    } catch (error) {
      console.log(error);
      this.reconnect();
    }
  }

  async produce(queue, messages, option) {
    return new Promise((resolve, reject) => {
      const produceObj = {
        id: randomId(),
        method: 'produce',
        maxLength: option?.maxLength,
        queue: queue.replace(/\s/g, ''),
        messages: typeof messages === 'string' ? [messages] : [...messages],
      };
      // console.log(`${JSON.stringify(produceObj)}`);
      this[`Timeout${produceObj.id}`] = setTimeout(() => {
        this.reconnect();
        // resolve(this.produce(queue, messages, option));
        console.log('Oops! Can not get the response from server');
        console.log(`produce id: ${JSON.stringify(produceObj)}`);
        reject(new Error('Oops! Can not get the response from server'));
      }, this.connectionTimeout);
      const produceHandler = (data) => {
        clearTimeout(this[`Timeout${produceObj.id}`]);
        myEmitter.removeListener(produceObj.id, produceHandler);
        // console.log(`produce: ${JSON.stringify(data)}`);
        if (data.success) {
          resolve(data.message);
        }
        reject(data.message);
      };
      myEmitter.once(produceObj.id, produceHandler);
      this.send(produceObj);
    });
  }

  async consume(queue, nums = 1) {
    return new Promise((resolve, reject) => {
      const consumeObj = {
        id: randomId(),
        method: 'consume',
        queue: queue.replace(/\s/g, ''),
        nums,
      };
      console.log(`${JSON.stringify(consumeObj)}`);

      const consumeHandler = (data) => {
        clearTimeout(this[`Timeout${consumeObj.id}`]);
        console.log(`consume: ${JSON.stringify(data)}`);
        if (!data.success) {
          myEmitter.removeListener(consumeObj.id, consumeHandler);
          reject(data.message);
        }
        if (!data.pending) {
          myEmitter.removeListener(consumeObj.id, consumeHandler);
          resolve(data.messages);
        }
      };

      this[`Timeout${consumeObj.id}`] = setTimeout(() => {
        this.reconnect();
        // resolve(this.consume(queue, nums));
        console.log('Oops! Can not get the response from server');
        reject(new Error('Oops! Can not get the response from server'));
      }, this.connectionTimeout);
      myEmitter.on(consumeObj.id, consumeHandler);
      this.send(consumeObj);
    });
  }

  async delete(queue) {
    return new Promise((resolve, reject) => {
      const deleteObj = {
        id: randomId(),
        method: 'deleteQueue',
        queue: queue.replace(/\s/g, ''),
      };
      const deleteHandler = (data) => {
        clearTimeout(this[`Timeout${deleteObj.id}`]);
        myEmitter.removeListener(deleteObj.id, deleteHandler);
        // console.log(`delete: ${JSON.stringify(data)}`);
        if (data.success) {
          resolve(data.message);
        }
        reject(data.message);
      };

      this[`Timeout${deleteObj.id}`] = setTimeout(() => {
        this.reconnect();
        // resolve(this.delete(queue));
        console.log('Oops! Can not get the response from server');
        console.log(`produce id: ${JSON.stringify(deleteObj)}`);
        reject(new Error('Oops! Can not get the response from server'));
      }, this.connectionTimeout);
      myEmitter.once(deleteObj.id, deleteHandler);
      this.send(deleteObj);
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
