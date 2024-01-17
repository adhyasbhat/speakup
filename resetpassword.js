const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
const urlParams = new URLSearchParams(window.location.search)
const token = urlParams.get("token");
const error = document.querySelector(".error")
async function reset(){
    const newpassword = document.querySelector("#password")
    const repassword = document.querySelector("#repassword")
    const password = newpassword.value
    if(!passwordRegex.test(password.value)){
        return error.innerHTML = "Password criteria doesnt match"
    }
    if(password.value != repassword.value){
        return error.innerHTML = "Password doesnt match"
    }
    const request = {
        method: "PUT",
        body: JSON.stringify({ token, password }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("/updatePassword", request);
      const data = await response.json();
      if(data.error){
        return error.innerHTML = data.error
      }
      localStorage.setItem('allow','allow')
        localStorage.setItem("authorization", data.token);
        window.location.href = '/chat.html'
        error.innerHTML = ""
}