const net = require('net');
const EventEmitter = require('node:events');
const crypto = require('crypto');
class MyEmitter extends EventEmitter {}

const randomId = () => crypto.randomBytes(8).toString('hex');
const myEmitter = new MyEmitter();

class Connection {
  constructor(client) {
    this.client = client;
    this.consumers = [];
  }

  produce(queue, message) {
    const produce = {
      id: randomId(),
      method: 'produce',
      queue,
      maxLength: 5,
      message,
    };
    this.client.write(`${JSON.stringify(produce)}\r\n\r\n`);
    console.log(`produce: ${JSON.stringify(produce)}`);
  }

  async consume(queue) {
    return new Promise((resolve, reject) => {
      const consume = {
        id: randomId(),
        method: 'consume',
        queue,
      };
      this.client.write(`${JSON.stringify(consume)}\r\n\r\n`);
      console.log(`${JSON.stringify(consume)}`);
      myEmitter.on(consume.id, (data) => {
        resolve(data.message);
      });
    });
  }

  end() {
    this.client.end();
  }
}

const tmqp = {
  connect: async (config) => {
    return new Promise((resolve, reject) => {
      const client = net.connect(config);

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
          resolve(new Connection(client));
        }
        if (object.method === 'consume') {
          myEmitter.emit(object.id, object);
        }
      });

      client.on('error', () => {
        reject(new Error('cannot connect to the server'));
      });
      client.on('end', () => {
        console.log('disconnected from server');
      });
    });
  },
};

module.exports = tmqp;
