const express = require("express");
const path = require("path");
const http = require("http");
const { Userdetails, chatDetails } = require("./config.js");
const app = express();
const server = http.createServer(app);
const jwt = require("jsonwebtoken");
const jwtPassword = "secret";
const bcrypt = require("bcryptjs");
const salt = 10;
const cors = require("cors");
const nodemailer = require("nodemailer");
const socketIO = require("socket.io");
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(cors());
app.post("/signup", async (req, res) => {
  const { firstName, lastName, phone, email, dob, gender, password } = req.body;
  const existingUser = await Userdetails.findOne({ email: email });
  if (existingUser) {
    return res.status(200).json({ error: "User already exist" });
  }
  const hashpassword = await bcrypt.hash(password, salt);
  const userData = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    dob: dob,
    gender: gender,
    password: hashpassword,
  };
  const mongooseUserData = new Userdetails(userData);
  await mongooseUserData.save();
  const token = jwt.sign({ email: email }, jwtPassword, { expiresIn: "2h" });
  return res.status(200).json({ success: "Successfull", token });
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const checkUser = await Userdetails.findOne({ email: email });
  if (!checkUser) {
    return res
      .status(400)
      .json({ error: "User not found, Create new account" });
  }
  const isPasswordMatch = await bcrypt.compare(password, checkUser.password);
  if (!isPasswordMatch) {
    return res.status(400).json({ error: "Password doesnt match" });
  }
  const token = jwt.sign({ email: email }, jwtPassword, {
    expiresIn: "2h",
  });
  return res.status(200).json({ success: "Successfull", token });
});
app.get("/user", async (req, res) => {
  try {
    const { email } = jwt.verify(req.headers.authorization, jwtPassword);
    const findUsername = await Userdetails.findOne({ email: email });
    if (findUsername) {
      res.status(200).json(findUsername.firstName);
    }
  } catch (error) {
    res.status(500).json({ error: "Invalid token" });
  }
});
app.get("/senderID", async (req, res) => {
  try {
    const { email } = jwt.verify(req.headers.authorization, jwtPassword);
    console.log(email, "email");
    const findUserid = await Userdetails.findOne({ email: email });
    if (findUserid) {
      res.status(200).json(findUserid.id);
    }
  } catch (error) {
    res.status(500).json({ error: "Invalid token" });
  }
});
app.get("/getAllUsers", async (req, res) => {
  const { email } = jwt.verify(req.headers.authorization, jwtPassword);
  const users = await Userdetails.find({ email: { $ne: email } });

  if (users.length > 0) {
    //   const usernames = users.map((user) => user.firstName);
    res.json({ users });
  } else {
    res.json({ message: "No usernames found" });
  }
});
app.put("/updatePassword", async (req, res) => {
  const { token, password } = req.body;
  console.log("called in update");
  console.log("token", token);
  console.log("newPassword", password);

  try {
    const { email } = jwt.verify(token, jwtPassword);
    console.log("username extracted from token:", email);

    const user = await Userdetails.findOne({ email: email });
    console.log("user in try of update ", user);

    if (!user) {
      res.status(400).json({ error: "User not found" });
    } else {
      console.log("User found");
      const hashpassword = await bcrypt.hash(password, salt);
      console.log("Hashed password:", hashpassword);

      const updateResult = await Userdetails.updateOne(
        { email: email },
        { $set: { password: hashpassword } }
      );

      console.log("Update Result:", updateResult);

      if (updateResult.modifiedCount > 0) {
        const newToken = jwt.sign({ email: email }, jwtPassword);
        res
          .status(200)
          .json({ message: "Updated successfully", token: newToken });
      } else {
        res.status(400).json({ error: "Password not updated" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/findAccount", async (req, res) => {
  const { email } = req.body;
  console.log("username of forgot password", email);
  try {
    const user = await Userdetails.findOne({ email: email });
    console.log(user);
    if (!user) {
      res.status(400).json({ error: "user not found" });
    } else {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "pokemonpodedex@gmail.com",
          pass: "uvpesguptqmwcspb",
        },
      });
      const token = jwt.sign({ email }, jwtPassword, { expiresIn: "30m" });
      const resetpass = `${req.protocol}://${req.get('host')}/resetpassword.html?token=${token}`;
      const mailOptions = {
        from: {
          name: "Speakup",
          address: "pokemonpodedex@gmail.com",
        },
        to: email,
        subject: "Reset Your Password - Account Recovery",
        text: "Dear user,\n\nWe've received a request to reset your password.",
        html: `<p>Please click the following link to reset your password:</p><p><a href="${resetpass}">Reset Password</a></p><p>Thank you,<br>SpeakUp Team</p>`,
      };
      const sendMail = async (transporter, mailOptions) => {
        try {
          const token = jwt.sign({ email: email }, jwtPassword);
          await transporter.sendMail(mailOptions);
          console.log("mail has been sent!!");
          res.status(200).json({ message: "mail has been sent", token });
        } catch (error) {
          console.log(error);
        }
      };
      sendMail(transporter, mailOptions);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/getGoogleCredentials/:credentials", async (req, res) => {
  const { credentials } = req.params;
  const { email } = jwt.decode(credentials);
  const token = jwt.sign({ username: email }, jwtPassword);
  const user = await Userdetails.findOne({ name: email });
  if (!user) {
    const db = new Userdetails({ name: email });
    await db.save();
  }
  res.status(200).json({ message: "login successful", token });
});
const nameSpace = io.of("/userNameSpace");
nameSpace.on("connection", async function (socket) {

  var userID = socket.handshake.auth.senderToken;
  await Userdetails.findByIdAndUpdate(
    { _id: userID },
    { $set: { is_online: "1" } }
  );
  socket.broadcast.emit("getOnlineUsers", { user_id: userID });

  socket.on("disconnect", async function () {
    var userID = socket.handshake.auth.senderToken;
    await Userdetails.findByIdAndUpdate(
      { _id: userID },
      { $set: { is_online: "0" } }
    );
    socket.broadcast.emit("getOfflineUsers", { user_id: userID });

    // console.log("user disconnected");
  });

  socket.on('newChat',function(data){
    console.log("entered new chat")
    console.log(data)
    socket.broadcast.emit('loadNewChat',data)
  })
  socket.on('existChat',async function(data){
    console.log("old chats SID and RiD",data.sender_id,data.receiver_id)
    var chats = await chatDetails.find({$or:[
        {sender_id: data.sender_id, receiver_id:data.receiver_id},
        {sender_id: data.receiver_id, receiver_id:data.sender_id}
    ]})
    console.log("chats in old chats",chats)
    socket.emit('loadChats',{chats:chats})
  })
});
app.post("/storeChat", async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  console.log(sender_id, receiver_id, message);
  try {
    var chat = new chatDetails({
      sender_id: sender_id,
      receiver_id: receiver_id,
      message: message,
    });
    await chat.save();
    res.status(200).json({ success: true, data: chat});
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message });
  }
});
const port = process.env.PORT || 5001;
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
