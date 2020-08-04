function addPasswordToggler(pt = document.getElementById("password-toggler"), inputId = "password"){
  pt.addEventListener("mouseover", ()=>{
    let passwordInput = document.getElementById(inputId)
    if(/fa-eye$/.test(pt.className)){                      //eye is open and password is visible
      pt.className = pt.className.replace(/fa-eye$/,"fa-eye-slash")  //change eye icon to a closed eye
      passwordInput.type = "password"                         //make password invisible
    }
    else if(/fa-eye-slash$/.test(pt.className)){          //eye is closed and password is invisible
      pt.className = pt.className.replace(/fa-eye-slash$/, "fa-eye")       //change eye icon to an open eye
      passwordInput.type = "text"                           //make password visible
    }
    else{
      throw new Error("No password-toggler detected")
    }
  })
  
  pt.addEventListener("mouseleave", ()=>{
    let passwordInput = document.getElementById(inputId)
    if(/fa-eye$/.test(pt.className)){                      //eye is open and password is visible
      pt.className = pt.className.replace(/fa-eye$/,"fa-eye-slash")  //change eye icon to a closed eye
      passwordInput.type = "password"                         //make password invisible
    }
    else if(/fa-eye-slash$/.test(pt.className)){          //eye is closed and password is invisible
      pt.className = pt.className.replace(/fa-eye-slash$/, "fa-eye")       //change eye icon to an open eye
      passwordInput.type = "text"                           //make password visible
    }
    else{
      throw new Error("No password-toggler detected")
    }
  })
}
let pt = document.getElementById("password-toggler2")
addPasswordToggler()
addPasswordToggler(pt, "confirmPassword")