let button = document.getElementById("submitButton")

button.addEventListener("click", (event) => {
  refreshHelpTexts()

  let formIsValid = true                                //assume the form is valid

  /*
    Make sure no field is empty
  */
  formIsValid = isFieldEmpty("name")
  formIsValid = isFieldEmpty("username")
  formIsValid = isFieldEmpty("gender")
  formIsValid = isFieldEmpty("email")
  formIsValid = isFieldEmpty("dob")
  formIsValid = isFieldEmpty("password")
  formIsValid = isFieldEmpty("confirmPassword")

  if(!formIsValid){                     //if any field is empty, cancel validation process
    return
  }

  /*
    Extract values of each field
  */
  let name = document.getElementById("name").value
  let username = document.getElementById("username").value
  let gender = document.getElementById("gender").value
  let email = document.getElementById("email").value
  let date_of_birth = document.getElementById("dob").value
  let password = document.getElementById("password").value
  let confirmPassword = document.getElementById("confirmPassword").value

  /*
    Start validation for each field
  */
  //make sure digits are not entered in name field
  if(/\d/.test(name)){                  
    document.getElementById("nameHelp").textContent = "Name cannot contain digits. We are humans, not cyborgs or computers"
    formIsValid = false
  }

  //make sure there is no white-space character in username
  if(/\s/.test(username)){
    document.getElementById("usernameHelp").textContent = "Username cannot contain any spaces."
    formIsValid = false
  }

  //make sure username starts with an alphabet
  if(/^\W/.test(username)){
    document.getElementById("usernameHelp").textContent = "Username must begin with alphabet"
    formIsValid = false
  }

  //validate email entry
  if(!/@/.test(email) || /@$/.test(email) || /\s/.test(email)){
    document.getElementById("emailHelp").textContent = "Email format not recognised."
    document.getElementById("emailHelp").className+= " text-danger"
    formIsValid = false
  }

  //reject underage application
  if(/^\d+/.exec(date_of_birth)[0] > 2010){
    document.getElementById("dobHelp").textContent = "Sorry, you are too young to be on this app."
    alert("You are too young to be on this app. Have a good day")
    window.location.href = "./index.html"
  }

  //reject ridiculously ancient age
  if(/^\d+/.exec(date_of_birth)[0] < 1920){
    document.getElementById("dobHelp").textContent = "You are not that old, please enter your correct date of birth."
    formIsValid = false
  }

  //password validation
  if(/\s/.test(password)){
    document.getElementById("passwordHelp").textContent = "Password cannot contain whitespaces"
    formIsValid = false
    return
  }
  if(password.length < 8){
    document.getElementById("passwordHelp").textContent = "Password is too short. Password should contain at least 8 characters"
    formIsValid = false
    return
  }

  //confirmPassword validation
  if(confirmPassword !== password){
    document.getElementById("confirmPasswordHelp").textContent = "Both passwords do not match."
    formIsValid = false
    return
  }

  if(formIsValid){
    let obj = {name, username, gender, email, date_of_birth, password, confirmPassword}
    console.log(obj)
    const options = {
      method: "PUT",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(obj)
    }

    fetch("http://localhost:3000/user", options)
      .then(response => response.json())
      .then(data => {
        if(data.status === "success!"){
          window.location.href = "./log-in.html"
        }
        else if(data.status === "failed"){
          document.getElementById("usernameHelp").textContent = data.message
        }
        else{
          console.log("Something is wrong with the server!");
        }
      })
  }
  event.preventDefault()
})

function isFieldEmpty(id){
  let field = document.getElementById(id).value
  if(field === ""){
    let helpId = id + "Help"
    document.getElementById(helpId).textContent = "Field cannot be left empty*"
    if(id === "email"){
      document.getElementById(helpId).className = document.getElementById(helpId).className + " text-danger"
    }
    return false
  }
  else{
    return true
  }
}

function refreshHelpTexts(){
  document.getElementById("emailHelp").textContent = "Your email is safe with us."
  if(/\stext-danger$/.test(document.getElementById("emailHelp").className)){
    document.getElementById("emailHelp").className = document.getElementById("emailHelp").className.replace(/\stext-danger$/, "")
  }

  document.getElementById("nameHelp").textContent = ""
  document.getElementById("usernameHelp").textContent = ""
  document.getElementById("dobHelp").textContent = ""
  document.getElementById("passwordHelp").textContent = ""
  document.getElementById("confirmPasswordHelp").textContent = ""
}
