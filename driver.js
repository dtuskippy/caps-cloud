'use strict';

const Chance = require('chance');
const chance = new Chance();
const { Producer } = require('sqs-producer');
const { Consumer } = require('sqs-consumer');

const app = Consumer.create({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/732807703652/vendor-packages-queue',
  handleMessage: async (message) => {
    const order = JSON.parse(JSON.parse(message.Body).Message);
    console.log('Driver picked up Order#: ', order);
    setTimeout(async () => {
      const producer = Producer.create({
        queueUrl: 'https://sqs.us-east-1.amazonaws.com/732807703652/vendor-packages-queue',
        region: 'us-east-1',
      });
      await producer.send({
        id: chance.guid(),
        body: JSON.stringify(order),
        MessageGroupId: 'driver',
      });
      console.log(`Driver delivered order#: ${order.orderId}`);
    }, 5000);
  }, pollingWaitTimeMs: 10000,
});

app.start();
