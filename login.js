const error = document.querySelector(".error")
async function login(){
    const emailvalue = document.querySelector("#email")
    const passwordvalue = document.querySelector("#password")
    const email = emailvalue.value
    const password = passwordvalue.value
    console.log(email,password)
    const response = await fetch("/login",{
        method:"POST",
        body:JSON.stringify({email,password}),
        headers:{
            "Content-Type": "application/json",
        }
    })
    const data =  await response.json()
    if(data.error){
        return error.innerHTML = data.error
    }
    localStorage.setItem("authorization", data.token);
    localStorage.setItem('allow','allow')
    window.location.href = '/chat.html'
}
window.handleGoogleSignin = async (google) => {
    const { credential } = google;
    const response = await fetch(`/getGoogleCredentials/${credential}`);
    const data = await response.json();
    console.log(data)
    if(response.ok){
      localStorage.setItem('allow','allow')
      localStorage.setItem('authorization',data.token)
      window.location.href = '/chat.html'
    }
    console.log(data);
  };