const Tmqp = require('../tmqp');

const tmqp = new Tmqp({ host: 'localhost', port: 3006, cluster: true });
const students = ['Kelvin', 'Peter', 'Adam', 'Hazel', 'Howard', 'Claudia', 'Alex',
  'Tim', 'Sam', 'Euli', 'Ellie', 'Domingo', 'Jimmy', 'Morton'];

const getStudents = (nums) => {
  const studentList = [];
  for (let i = 0; i < nums; i++) {
    const rand = Math.floor(Math.random() * students.length);
    studentList.push(students[rand]);
  }
  return studentList;
};

const randomProduce = (queue) => {
  const times = Math.floor(Math.random() * 10) + 1;
  const interval = Math.random() * 2000;
  const studentList = getStudents(times);
  tmqp.produce(queue, studentList);
  setTimeout(() => {
    randomProduce(queue);
  }, interval);
};

const randomConsume = (queue) => {
  const times = Math.floor(Math.random() * 10) + 1;
  const interval = Math.random() * 2000;
  tmqp.consume(queue, times);

  setTimeout(() => {
    randomConsume(queue);
  }, interval);
};

setTimeout(() => {
  randomProduce('PullRequests');
  randomConsume('PullRequests');
}, 1000);
