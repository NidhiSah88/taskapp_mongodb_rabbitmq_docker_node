const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());

// mongoose
//   .connect("mongodb://localhost:27017/users", 
//     // {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
//     // }
// )
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.error("Error connecting to MongoDB", err);
//   });


  // now we are containerizing our application, so we need to connect to the MongoDB container using the service name defined in docker-compose.yml

mongoose.connect("mongodb://mongo:27017/users")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });


const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  
});

const User = mongoose.model("User", UserSchema);

app.post('/users', async (req, res)=>{
    try{
        const { name, email } = req.body; 
        const user = new User({name, email});
        await user.save();
        res.status(201).json(user);
    } catch(error){
        console.error("Error creating user", error);
        res.status(500).json({error: "Internal server error"});
    }
})

app.get('/users', async (req, res)=>{
    try{
        const users = await User.find();
        res.json(users);
    } catch(error){
        console.error("Error fetching users", error);
        res.status(500).json({error: "Internal server error"});
    }
})

app.get("/", (req, res) => {
  res.send("Hello dear");
});

app.listen(port, () => {
  console.log(`User service is running on port ${port}`);
});















