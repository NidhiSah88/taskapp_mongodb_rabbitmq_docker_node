const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
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

app.post('/tasks', async (req, res)=>{
    try{
        const { title, description, userId } = req.body; 
        const task = new Task({ title, description, userId });
        await task.save();
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
});





