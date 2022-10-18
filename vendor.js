'use strict';

const Chance = require('chance');
const chance = new Chance();
const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const sns = new AWS.SNS();
const date = new Date();
const time = date.toTimeString();
const topic = 'arn:aws:sns:us-east-1:732807703652:pickup';

setInterval(() => {
  const order = {
    orderId: chance.guid(),
    customer: chance.name(),
    address: chance.address(),
    vendorId: 'CAPS',
    timestamp: time,
  };
  const payload = {
    Message: JSON.stringify(order),
    TopicArn: topic,
  };
  sns.publish(payload).promise().then(result => {
    console.log('Order received', payload.Message);
    console.log('Order ready for pickup', order);
  })
    .catch(err => console.error(err.message));
}, 20000);

const app = Consumer.create({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/732807703652/vendor-packages-queue',
  handleMessage: async(message) => console.log('`Driver delivered order ', message.Body.slice(1,49)),
  pollingWaitTimeMs: 10000,
});

app.start();
