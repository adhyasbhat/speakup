// const { statSync } = require("fs");
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
     console.log(item._id)
    const username = document.createElement("div");
    username.className = "col-5 d-flex align-items-center justify-content-center";
    username.innerText = item.firstName;
    const status  = document.createElement("div")
    status.className = "col-5 d-flex align-items-center"
    if(item.is_online == '1'){
        status.innerText = "Online"
    }
    else{
        status.innerText = "Offline"
    }
    const col = document.createElement("div")
    col.className = "col-12 d-flex align-items-center receiverID"
    status.id = item._id
    col.append(username , status)
    row.append(col);
    const hr = document.createElement("hr");
    row.append(hr);

        col.addEventListener("click",function(){
            const friendName = document.querySelector(".friendName")
            console.log(item.firstName)
            friendName.innerHTML = item.firstName
        })

  });

  userNames.append(row);
}
function send() {
  const message = document.querySelector(".message");
  const senderMsg = document.createElement("div");
  senderMsg.classList = "senderMsg";
  const senderMsgCss = document.createElement("div");
  senderMsgCss.classList = "senderMsgCss";
  const senderMsg70 = document.createElement("div");
  senderMsg70.classList = "senderMsg70";
  senderMsgCss.innerHTML = message.value;
  senderMsg.append(senderMsgCss);
  senderMsg70.append(senderMsg);
  messgaheBlock.append(senderMsg70);
  message.value = "";
 }
 fetch(`/senderID`, {
    headers: {
      authorization: localStorage.getItem("authorization"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
     
     var socket = io.connect('/userNameSpace',{
            auth:{
                senderToken : data
            }
        })
        // socket.on('getOnlineUsers',function(data){
        //     if(status.id == data.user_id){
        //         status.innerText = "Online"
        //     }
        //    console.log(data,"dataaa")
        // })
        // socket.on('getOfflineUsers',function(socket){
        //     if(status.id == data.user_id){
        //         status.innerText = "Offline"
        //     }
        //     console.log(socket,"dataaa")
        //  })
    })
    .catch((error) => console.error("Error:", error));