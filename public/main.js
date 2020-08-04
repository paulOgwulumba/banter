import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import AddFriends from './Components/AddFriends'
import RemoveFriends from './Components/RemoveFriends'
import FriendRequest from './Components/FriendRequest'



const id = window.location.search.split("=")[1]
const app = document.getElementById("app")
fetch(`http://localhost:3000/user/${id}`)
  .then(response => response.json())
  .then(data => {
    let name = /^\w+/.exec(data.name)[0]
    let surnameArray = data.name.split(" ")
    let surname = surnameArray[surnameArray.length - 1]
    // console.log(name)
    // console.log(surname)
    // console.log(data)
    document.getElementById("name").textContent = name + " " + surname
  })
ReactDOM.render(<App userId={id}/>, app)

let addFriendsBtn = document.getElementById("add-friends")
let openMessagesBtn = document.getElementById("open-messages")
let removeFriendsBtn = document.getElementById("remove-friends")
let friendRequestsBtn = document.getElementById("friend-requests")

addFriendsBtn.addEventListener("click", () =>{
  addFriendsBtn.disabled = true
  openMessagesBtn.disabled = false
  removeFriendsBtn.disabled = false
  friendRequestsBtn.disabled = false
  ReactDOM.render(<AddFriends userId={id}></AddFriends>, app)
})

openMessagesBtn.addEventListener("click", () => {
  openMessagesBtn.disabled = true
  addFriendsBtn.disabled = false
  removeFriendsBtn.disabled = false
  friendRequestsBtn.disabled = false
  ReactDOM.render(<App userId={id}/>, app)
})

removeFriendsBtn.addEventListener("click", () => {
  removeFriendsBtn.disabled = true
  openMessagesBtn.disabled = false
  addFriendsBtn.disabled = false
  friendRequestsBtn.disabled = false
  ReactDOM.render(<RemoveFriends userId={id}></RemoveFriends>, app)
})

friendRequestsBtn.addEventListener("click", () => {
  friendRequestsBtn.disabled = true
  removeFriendsBtn.disabled = false
  openMessagesBtn.disabled = false
  addFriendsBtn.disabled = false
  ReactDOM.render(<FriendRequest userId={id}></FriendRequest>, app)
})



