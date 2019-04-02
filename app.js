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
const elastic = require('elasticsearch');

const elasticSearchClient = new elastic.Client({
  host: CONFIG.connectionURL,
   log: 'error'
 });

var kafka = require('kafka-node'),
  Consumer = kafka.Consumer,
  Offset = kafka.Offset,
  client = new kafka.KafkaClient({kafkaHost: 'localhost:9092'}),
  offset = new Offset(client),
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

  console.log("");
  console.log("*************** MESSAGE ***************");
  console.log(message);

  elasticSearchClient.index({
    index: 'bomberman',
    type: 'event',
    body: {
      value: message.value,
      date: new Date().toISOString()
    }
  }).then((result) => {
    console.log("_____________________ ELASTIC SEARCH Successfully indexed _____________________");
    console.log(result);
  }).catch((error) => {
    console.log(" ··············· ERROR IN ELASTIC SEARCH ···············");
    console.error("Cannot index into ElasticSearch due to:");
    console.error(error);
  });
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

module.exports = app;
