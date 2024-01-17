const error = document.querySelector(".error")
async function submit(){
    const emailid = document.querySelector("#email")
    const email = emailid.value
    const response =  await fetch('/findAccount',{
        method: "POST",
        body: JSON.stringify({email}),
        headers: {
            "Content-Type": "application/json"
        }
    })
    const data = await response.json()
    if(data.error){
        return error.innerHTML = data.error
    }
    return error.innerHTML = data.message
}