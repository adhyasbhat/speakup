const express = require("express");
const path = require("path");
const http = require('http');
const { Userdetails, chatDetails } = require("./config.js");
const app = express();
const server = http.createServer(app);
const jwt = require("jsonwebtoken");
const jwtPassword = "secret";
const bcrypt = require("bcryptjs");
const salt = 10;
const cors = require('cors');
const nodemailer = require("nodemailer");
const socketIO = require('socket.io');
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(cors());
app.post("/signup",async(req,res)=>{
    const {firstName,lastName,phone,email,dob,gender,password} = req.body
    const existingUser = await Userdetails.findOne({email:email})
    if(existingUser){
        return res.status(200).json({error:'User already exist'})
    }
    const hashpassword = await bcrypt.hash(password, salt);
    const userData = {
        firstName:firstName,
        lastName:lastName,
        email:email,
        phone:phone,
        dob:dob,
        gender:gender,
        password:hashpassword
    }
    const mongooseUserData = new Userdetails(userData);
    await mongooseUserData.save();
    const token = jwt.sign({email:email}, jwtPassword, { expiresIn: "1h" });
    return res.status(200).json({ success: "Successfull", token });
})
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
  });
  
  app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"));
  });
  
  app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "chat.html"));
  });
app.post('/login',async(req,res)=>{
    const {email,password} = req.body
    const checkUser = await Userdetails.findOne({email:email})
    if(!checkUser){
        return res.status(400).json({error:'User not found, Create new account'})
    }
    const isPasswordMatch = await bcrypt.compare(
        password,
        checkUser.password
      );
      if(!isPasswordMatch){
        return res.status(400).json({error: "Password doesnt match"})
      }
      const token = jwt.sign({ email:email}, jwtPassword, {
        expiresIn: "1h",
      });
      return res.status(200).json({success: "Successfull",token})
})
app.get("/user", async (req, res) => {
    try {
      const { email } = jwt.verify(req.headers.authorization, jwtPassword);
      const findUsername = await Userdetails.findOne({email:email})
      if(findUsername){
        res.status(200).json(findUsername.firstName);
      }
      
    } catch (error) {
      res.status(500).json({ error: "Invalid token" });
    }
    
  });
  app.get('/getAllUsers',async(req,res)=>{
    const { email } = jwt.verify(req.headers.authorization, jwtPassword);
    const users = await Userdetails.find({email: { $ne: email }});
  
    if (users.length > 0) {
      const usernames = users.map((user) => user.firstName);
      res.json({ usernames });
    } else {
        res.json({ message: 'No usernames found' });
    }
   })
   const nameSpace = io.of('/userNameSpace');
//    console.log(nameSpace)
   nameSpace.on('connection', function (socket) {
     console.log("user connected");
   
     socket.on('disconnect', function () {
       console.log("user disconnected");
     });
   });
const port = 5001;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});