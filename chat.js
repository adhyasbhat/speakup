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
  console.log(data);
  const row = document.createElement("div");
  row.className = "row";
  data.usernames.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-12 d-flex align-items-center";
    col.innerText = item;
    row.append(col);
    const hr = document.createElement("hr");
    row.append(hr);
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
var socket = io.connect('http://localhost:5001/userNameSpace')

// socket.on('connect', function () {
//   console.log("Connected to server");
// });

// socket.on('disconnect', function () {
//   console.log("Disconnected from server");
// });

// var socket = io('/userNameSpace');