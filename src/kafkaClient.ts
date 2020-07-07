import KafkaJs from "kafkajs";

const { Kafka } = KafkaJs;

export default new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKER_LIST
    ? process.env.KAFKA_BROKER_LIST.split(",")
    : [""],
});
