const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/chat-app')
  .then(() => console.log('Connected!'));
const loginSchema = new mongoose.Schema({
    firstName:{
        type: String,
        require: true
    },
    lastName:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    phone:{
        type: Number,
        require: true
    },
    dob:{
        type: String,
        require: true
    },
    gender:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    is_online:{
        type:String,
        default:'0'
    }
})
const chatSchema = new mongoose.Schema({
    sender_id:{
       type: mongoose.Schema.Types.ObjectId,
       ref:'user'
    },
    receiver_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
     },
     message:{
        type:String,
        require:true
     }
})
const Userdetails = new mongoose.model("login",loginSchema)
const chatDetails = new mongoose.model("chat",chatSchema)
module.exports = {Userdetails,chatDetails}