const net = require('net');
const EventEmitter = require('node:events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

const tmqp = {
  connect: (config, cb) => {
    try {
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
        if (object.method === 'consume') {
          myEmitter.emit(object.queue, object);
        }
      });

      client.on('end', () => {
        console.log('disconnected from server');
      });
      const connection = {
        produce: (queue, message) => {
          const produce = {
            method: 'produce',
            queue,
            maxLength: 3,
            message,
          };
          client.write(`${JSON.stringify(produce)}\r\n\r\n`);
          console.log(`produce: ${JSON.stringify(produce)}`);
        },
        consume: (queue, consumeMessages) => {
          const consume = {
            method: 'consume',
            queue,
          };
          client.write(`${JSON.stringify(consume)}\r\n\r\n`);
          myEmitter.on(queue, (message) => {
            consumeMessages(message);
          });
        },
        end: () => {
          client.end();
        },
      };
      cb(null, connection);
    } catch (error) {
      cb(error);
    }
  },
};

module.exports = tmqp;
