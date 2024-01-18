
const allow = localStorage.getItem("allow");
if (allow != "allow") {
  window.location.href = "/";
}
const authentication = localStorage.getItem("authorization");
if (!authentication) {
  window.location.href = "/";
}
const userID = document.querySelector(".userID");
const userNames = document.querySelector(".userNames");
const messgaheBlock = document.querySelector(".messgaheBlock");
const chat = document.querySelector(".chat-container")
const quote = document.querySelector(".quote")
const friendPic = document.querySelector(".friendPic")
const friendsName = document.querySelector(".friendsName")
const profileDiv = document.querySelector(".profileDiv")
const callDiv = document.querySelector(".callDiv")
const searchChatDiv = document.querySelector(".searchChatDiv")
const moreDiv = document.querySelector(".moreDiv")
const home = document.querySelector(".home")
var receiverID;
var senderID;
var socket = io.connect()
fetch(`/user`, {
  headers: {
    authorization: localStorage.getItem("authorization"),
  },
})
  .then((response) => response.json())
  .then((data) => {
    userID.innerHTML = data;
  })
  .catch((error) => console.error("Error:", error));

function logout() {
  localStorage.setItem("allow", "notallow");
  window.location.href = "/";
}
getUsers();
async function getUsers() {
  const response = await fetch("/getAllUsers", {
    headers: {
      authorization: localStorage.getItem("authorization"),
    },
  });
  const data = await response.json();
  console.log(data.users);
  const row = document.createElement("div");
  row.className = "row";
  data.users.forEach((item) => {
    const username = document.createElement("div");
    username.className =
      "col-5 d-flex align-items-center justify-content-center";
    username.innerText = item.firstName;
    const status = document.createElement("div");
    status.className = "col-5 d-flex align-items-center";
    if (item.is_online == "1") {
      status.innerText = "Online";
    } else {
      status.innerText = "Offline";
    }
    const col = document.createElement("div");
    col.className = "col-12 d-flex align-items-center receiverID";
    status.id = item._id;
    col.append(username, status);
    row.append(col);
    const hr = document.createElement("hr");
    row.append(hr);
    col.addEventListener("click", function () {
        display()
      friendsName.innerHTML = item.firstName;
      receiverID = item._id;
      console.log(receiverID);
      socket.emit('existChat',{sender_id:senderID,receiver_id:receiverID})
      socket.on('loadChats',function(data){
        console.log("entered load old chats")
        console.log(data)
        messgaheBlock.innerHTML = ""
        var chats = data.chats
    
    
        for(let i = 0;i< chats.length; i++){
            const msg = document.createElement("div")
            const msg70 = document.createElement("div")
            const css = document.createElement("div")
            if(chats[i]['sender_id']==senderID){
                msg.classList = 'senderMsg'
                msg70.classList  = 'senderMsg70'
                css.classList = 'senderMsgCss'
            }
            else{
                msg.classList = 'receiverMsg'
                msg70.classList = 'receiverMsg70'
                css.classList = 'receiverMsgCss'
            }
            css.innerHTML = chats[i]['message']
            msg.append(css)
            msg70.append(msg)
            messgaheBlock.append(msg70)
        }
        
    })
    });
  });
  userNames.append(row);
}

// Update the status of the user to Online
function updateOnlineStatus(userId) {
  const statusElement = document.getElementById(userId);
  if (statusElement) {
    statusElement.innerText = "Online";
  }
}

// Update the status of the user to Offline
function updateOfflineStatus(userId) {
  const statusElement = document.getElementById(userId);
  if (statusElement) {
    statusElement.innerText = "Offline";
  }
}

async function send() {
  const message = document.querySelector(".message");
  const senderMsg = document.createElement("div");
  senderMsg.classList = "senderMsg my-2";
  const senderMsgCss = document.createElement("div");
  senderMsgCss.classList = "senderMsgCss";
  const senderMsg70 = document.createElement("div");
  senderMsg70.classList = "senderMsg70";
  senderMsgCss.innerHTML = message.value;
  messageToSave = message.value;
  const response = await fetch(`/storeChat`, {
    method: "POST",
    body: JSON.stringify({
      sender_id: senderID,
      receiver_id: receiverID,
      message: messageToSave,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (data.success) {
    senderMsg.append(senderMsgCss);
    senderMsg70.append(senderMsg);
    messgaheBlock.append(senderMsg70);
    message.value = "";
    socket.emit("newChat", data);

    
    socket.on("loadNewChat", function (data) {

console.log("sID in bC:",data.data.sender_id,"Sid we have:",receiverID)
console.log("rID in bC:",data.data.receiver_id,"Rid we have:",senderID)
        if(data.data.sender_id == receiverID && data.data.receiver_id == senderID){
            const receiverMsg = document.createElement("div");
            receiverMsg.classList = "receiverMsg my-2";
            const receiverMsgCss = document.createElement("div");
            receiverMsgCss.classList = "receiverMsgCss";  
            const receiverMsg70 = document.createElement("div");
            receiverMsg70.classList = "receiverMsg70";
            receiverMsgCss.innerHTML = data.data.message;  
            receiverMsg.append(receiverMsgCss);
            receiverMsg70.append(receiverMsg);
            messgaheBlock.append(receiverMsg70);
        }
        
      });
  } else {
    console.log("errorr in appending");
  }
  messgaheBlock.scrollTop = messgaheBlock.scrollHeight
}
fetch(`/senderID`, {
  headers: {
    authorization: localStorage.getItem("authorization"),
  },
})
  .then((response) => response.json())
  .then((data) => {
    senderID = data;
     socket = io.connect("/userNameSpace", {
      auth: {
        senderToken: data,
      },
    });
    socket.on("getOnlineUsers", function (data) {

      updateOnlineStatus(data.user_id);
    });
    socket.on("getOfflineUsers", function (data) {

      updateOfflineStatus(data.user_id);
    });
  })
  .catch((error) => console.error("Error:", error));
function display(){
home.remove()
quote.remove()
chat.style.display = "block"
friendPic.style.display = "block"
friendsName.style.display = "block"
profileDiv.style.display = "block"
callDiv.style.display = "block"
searchChatDiv.style.display = "block"
moreDiv.style.display = "block"
}
