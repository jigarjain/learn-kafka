import "../env";
import kafkaClient from "../kafkaClient";
import WebSocket from "ws";
import topStocks from "./data/top-stocks.json";
import { Message } from "kafkajs";

(async () => {
  // Connecting to Kafka producer
  const producer = kafkaClient.producer();

  await producer.connect();

  const ws = new WebSocket(
    `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`
  );

  // Open WS connection to Finnhub
  ws.on("open", () => {
    console.log("Connected to Finnhub");

    topStocks.forEach((stock) => {
      console.log(
        `Subscribing to stock prices of ${stock.name} [${stock.symbol}]`
      );
      ws.send(
        JSON.stringify({
          type: "subscribe",
          symbol: stock.symbol,
        })
      );
    });
  });

  ws.on("message", async (incomingMessage) => {
    try {
      const { data } = JSON.parse(String(incomingMessage));

      if (!data || !data.length) {
        return;
      }

      const messages: Message[] = [];
      type IncomingStockPrice = {
        s: string;
        p: number;
      };

      data.forEach((d: IncomingStockPrice) => {
        const message = {
          key: d.s,
          value: JSON.stringify({
            symbol: d.s,
            price: d.p,
          }),
        };

        messages.push(message);
      });

      const topic = process.env.KAFKA_TOPIC_NAME_TOPSTOCKS;

      if (topic) {
        const response = await producer.send({
          topic: topic,
          messages: messages,
        });
      } else {
        console.error("Env value for `KAFKA_TOPIC_NAME_STOCKS` not set");
      }
    } catch (e) {
      console.error("Error while processing message", e);
    }
  });
})();
