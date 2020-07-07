import "../env";
import kafkaClient from "../kafkaClient";
import inputData from "./data.json";

(async () => {
  const producer = kafkaClient.producer();

  await producer.connect();

  const response = await producer.send({
    topic: "pokemons",
    messages: inputData,
  });

  console.log(response);
})();
