const kafka = require('kafka-node'),
  Consumer = kafka.Consumer,
  client = new kafka.KafkaClient({
    kafkaHost: '192.168.1.240:9092'
  }),
  consumer = new Consumer(
    client,
    [
      { topic: 'bomberman-topic'}
    ],
    {
      autoCommit: false,
      groupId: 'group_id'
    }
  );

module.exports = consumer;