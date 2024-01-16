

const error = document.querySelector(".error")
const phoneNumberRegex = /^\d{10}$/
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;

function signup(){
const firstName = document.querySelector("#firstName")
const lastName = document.querySelector("#lastName")
const phone = document.querySelector("#phone")
const email = document.querySelector("#email")
const password = document.querySelector("#password")
const repassword = document.querySelector("#repassword")
const gender = document.querySelector('input[name="gender"]:checked')
const dob = document.querySelector('#dob')
const selectedDate = new Date(dob.value);
const currentDate = new Date()
if(firstName.value == "" || lastName.value == "" || phone.value == "" || email.value == "" || password.value == "" || repassword.value == "" || gender.value == "" || dob.value == ""){
    return error.innerHTML = "All fields are mandatory"
}
if(!phoneNumberRegex.test(phone.value)){
    return error.innerHTML = "Invalid phone number"
}
if(selectedDate > currentDate){
    return error.innerHTML = "Invalid DOB"
}
if(!emailRegex.test(email.value)){
    return error.innerHTML = "Invalid email"
}
if(!passwordRegex.test(password.value)){
    return error.innerHTML = "Password criteria doesnt match"
}
if(password.value != repassword.value){
    return error.innerHTML = "Password doesnt match"
}
error.innerHTML = ""
register (firstName.value,lastName.value,phone.value,email.value,dob.value,gender.value,password.value)
}
async function register(firstName,lastName,phone,email,dob,gender,password){
    console.log(firstName,lastName,phone,email,dob,gender,password)
    const response = await fetch('/signup',{
        method:"POST",
        body: JSON.stringify({firstName,lastName,phone,email,dob,gender,password}),
        headers:{
            "Content-Type": "application/json",
        }
    })
    const data = await response.json()
    console.log(data)
    if(data.error){
        return error.innerHTML = data.error
    }
    localStorage.setItem('allow','allow')
    localStorage.setItem("authorization", data.token);
    window.location.href = '/chat.html'

}