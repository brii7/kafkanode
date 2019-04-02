const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();
const CONFIG = require('./config');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

var kafka = require('kafka-node'),
  Consumer = kafka.Consumer,
  client = new kafka.KafkaClient({kafkaHost: '192.168.1.50:9092'}),
  consumer = new Consumer(
    client,
    [
      { topic: 'bomberman-topic', partition: 0, offset: 0 }
    ],
    {
      autoCommit: false
    }
  );

consumer.on('message', function (message) {
  console.log(message);
});

consumer.on('error', function (err) {
  console.log('error', err);
});

/*
* If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
*/
consumer.on('offsetOutOfRange', function (topic) {
  topic.maxNum = 2;
  offset.fetch([topic], function (err, offsets) {
    if (err) {
      return console.error(err);
    }
    var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});










// const elastic = require('elasticsearch');
//
// const client = new elastic.Client({
//   host: CONFIG.connectionURL,
//   log: 'error'
// });
//
// const result = getQuery()
//   .then(console.log)
//   .catch(console.log);
//
//
// async function getQuery() {
//   return client.search({
//     index: 'bomberman',
//     body: {}
//   })
// }


module.exports = app;
