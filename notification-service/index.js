

const amqp = require('amqplib');

// only method exist in notification service is to connect to rabbitmq and listen for messages from task service
async function start() {
    try{
      // create connection and channel
      connection = await amqp.connect('amqp://rabbitmq');
      channel = await connection.createChannel();

      await channel.assertQueue('task_notifications_created');
      console.log("Notification Service Connected to RabbitMQ messages");
      
        // start a consumer to listen for messages from task service
        channel.consume('task_notifications_created', (msg) => {
         const taskData = JSON.parse(msg.content.toString());
         console.log("Received task notification:", taskData); 
         console.log("Received task notification:", taskData.title); 

        // Acknowledge the message , yiu have received the notification message
        channel.ack(msg);

        });
    } catch(error){
      console.error("Error connecting to RabbitMQ", error.message);
      
    }
  }



start();
