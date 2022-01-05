let button = document.getElementById("submitButton")

button.addEventListener("click", (event) => {
  let clientValidated = true
  let username = document.getElementById("username")
  let password = document.getElementById("password")
  document.getElementById("usernameHelp").textContent = ""
  document.getElementById("passwordHelp").textContent = ""

  if(username.value==""){
    document.getElementById("usernameHelp").textContent = "Field cannot be left empty*"
    clientValidated = false
  }

  if(/\s/.test(username.value)){
    document.getElementById("usernameHelp").textContent = "Incorrect username*"
    clientValidated = false
  }

  if(/\s/.test(password.value)){
    document.getElementById("passwordHelp").textContent = "Incorrect password*"
    clientValidated = false
  }

  if(password.value==""){
    document.getElementById("passwordHelp").textContent = "Field cannot be left empty*"
    clientValidated = false
  }

  if(clientValidated){
    let obj = {username: username.value, password: password.value}
    const options = {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(obj)
    }
    fetch("http://localhost:3000/user/login", options)
      .then(response => response.json())
      .then(data => {
        if(data.status === "success"){
          window.location.href = "./app.html?id=" + data.id  
        }
        else{
          if(data.message.length > 15){
            document.getElementById("usernameHelp").textContent = data.message
          }
          else{
            document.getElementById("passwordHelp").textContent = data.message
          }
        }
      })
  }
})