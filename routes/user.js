const express = require('express');
const router = express.Router();
const {  users_db, messages_db, friends_db, friend_requests_db } = require('../utils/db');

/**
 *  Get a list of all users registered in the network excluding the user with ID 'id'.
 */
router.get('/all/:id', (request, response) => {
  let userID = request.params.id
  users_db.find({$not: {_id: userID}}, (error, document) => {
    let list = []
    document.forEach(element => {
      let unit = {
        username: element.username,
        name: element.name,
        date_of_birth: element.date_of_birth,
        gender: element.gender
      }
      list.push(unit)
    })
    response.send(list)
  })
});

/**
 *  Get details of user with ID 'id'.
 */
router.get("/:id", (request, response) => {
  users_db.findOne({_id: request.params.id}, (error, document) => {
    if(error) throw error
    if(document == null){
      response.status(404).send({status: "User not found"})
    }
    else{
      let user = {
        name: document.name,
        username: document.username,
        date_of_birth: document.date_of_birth,
        email: document.email
      }
      response.send(user)
    }
  })
});

/**
 *  Create a new user profile.
 */
router.put("/", (request, response) => {
  if(request.body.password === request.body.confirmPassword){
    users_db.findOne({username: request.body.username}, (error, document) => {
      if(error) throw error
      if(document == null){
        users_db.insert(request.body)
        friends_db.insert({username: request.body.username, friends: []})
        messages_db.insert({username: request.body.username, friend: {}})
        friend_requests_db.insert({username: request.body.username, requests: []})
        response.send({status: "success!"})
      }
      else{
        response.send({status: "failed", message: "Username is taken.*"})
      }
    })
  }
  else{
    response.send({status: "failed", message: "Passwords do not match"})
  }
});

/**
 *  Perform log in validation.
 */
router.post("/login", (request, response) => {
  users_db.findOne({username: request.body.username}, (error, document) => {
    if(error) throw error
    if(document === null){
      response.send({status: "failed", message: "Wrong username and password*"})
    }
    else{
      if(request.body.password !== document.password){
        response.send({status: "failed", message: "Wrong password"})
      }
      else{
        response.send({status: "success", id: document._id})
      }
    }
  })
});

module.exports = router;
