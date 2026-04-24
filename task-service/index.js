const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const amqp = require('amqplib');

const app = express();
const port = 3001;

app.use(bodyParser.json());

mongoose.connect("mongodb://mongo:27017/tasks")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  createdAt:{
    type: Date, 
    default: Date.now
  }
  
});

const Task = mongoose.model("Task", TaskSchema);

let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
  while(retries )  {
    try{
      // create connection and channel
      connection = await amqp.connect('amqp://rabbitmq');
      channel = await connection.createChannel();
      await channel.assertQueue('task_notifications_created');
      console.log("Connected to RabbitMQ");
      return;

    } catch(error){
      console.error("Error connecting to RabbitMQ", error);
      retries--; // reduce retries by 1
      if(retries > 0){
        console.log(`Retrying in ${delay} ms...`);
        // retry after delay
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("Failed to connect to RabbitMQ after multiple attempts");
        process.exit(1);
      }
    }
  }

}

app.post('/tasks', async (req, res)=>{
    try{
        const { title, description, userId } = req.body; 
        const task = new Task({ title, description, userId });
        await task.save();

        // Send notification to RabbitMQ
        const message = {
          taskId: task._id,
          userId,
          title,

        }

        if(!channel){
          return res.status(503).json({error: "RabbitMQ not connected. Notification service is unavailable"});
        }
        channel.sendToQueue("task_notifications_created", Buffer.from(
          JSON.stringify(message)
        ))

        res.status(201).json(task);
    } catch(error){
        console.error("Error creating task", error);
        res.status(500).json({error: "Internal server error"});
    }
})


app.get('/tasks', async (req, res)=>{
    try{
        const tasks = await Task.find();
        res.json(tasks);
    } catch(error){
        console.error("Error fetching tasks", error);
        res.status(500).json({error: "Internal server error"});
    }
})

app.listen(port, () => {
  console.log(`Task service is running on port ${port}`);
  connectRabbitMQWithRetry();

});





