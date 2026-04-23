import { Kafka, Producer, Consumer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

export const producer: Producer = kafka.producer();
export const consumer: Consumer = kafka.consumer({ groupId: 'order-service-group' });

export const connectKafka = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer connected');

    await consumer.connect();
    console.log('Kafka Consumer connected');
    
    // In a real app we'd subscribe and run the consumer here
    // await consumer.subscribe({ topic: 'some-topic', fromBeginning: true });
    // await consumer.run({ ... });

  } catch (error) {
    console.error('Kafka connection error:', error);
  }
};

export const emitEvent = async (topic: string, eventName: string, data: any) => {
  try {
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify({ eventName, timestamp: new Date().toISOString(), data }) }
      ]
    });
  } catch (error) {
    console.error(`Failed to emit event ${eventName} to topic ${topic}`, error);
  }
};
