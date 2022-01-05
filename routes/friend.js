const express = require('express');
const router = express.Router();
const {  users_db, messages_db, friends_db } = require('../utils/db');

/**
 *  Get a list of all the friends of user with ID 'id'.
 */
router.get('/get/all/:id', (request, response) => {
    let userID = request.params.id 
    users_db.findOne({_id: userID}, (error, document) => {
      if(error) throw error
      if(document === null){
        console.log("No document found for get-friends-id")
      }
      else{
        let username = document.username
        friends_db.findOne({username: username}, (error, doc) => {
          let friends = []
          doc.friends.forEach(friend => {
            friends.push(friend.username)
          })
          users_db.find({}, (error, files) => {
            if(error) throw error
            if(files === null){
              console.log("friends list is empty")
              response.send({})
            }
            else{
              let friendList = []
              files.forEach(element => {
                if(friends.indexOf(element.username) !== -1){
                  let unit = {
                    username: element.username,
                    name: element.name,
                    date_of_birth: element.date_of_birth,
                    gender: element.gender
                  }
                  friendList.push(unit)
                }
              })
              response.send(friendList)
            }
          })
        })
      }
    })
})

/**
 *  Delete user with username 'username' from friends list of user with ID 'id'.
 */
router.delete('/:id/:username', (request, response) => {
let userID = request.params.id
let friendName =  request.params.username
users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document === null){
    console.error(`Document not found! username: ${username}. db: users_db`)
    response.status(404).send(`User with _id ${userID} not found`)
    }
    else{
    let username = document.username
    friends_db.findOne({username: username}, (error, doc) => {
        if(error) throw error
        if(doc === null){
        console.error(`Document not found! username: ${username}. db: friends_db`)
        response.status(404).send(`User with _id ${userID} not found`)
        }
        else{
        let update = []
        doc.friends.forEach(friend => {
            if(friend.username !== friendName){
            update.push(friend)
            }
        })
        console.log(update)
        friends_db.update({username: username}, {$set: {friends: update}})
        friends_db.persistence.compactDatafile()
        }
    })
    let query = `friend.${friendName}`
    messages_db.update({username: username}, {$set: {[query]: undefined}})
    messages_db.persistence.compactDatafile()

    friends_db.findOne({username: friendName}, (error, doc) => {
        if(error) throw error
        if(doc === null){
        console.error(`Document not found! username: ${friendName}. db: friends_db`)
        response.status(404).send(`User with _id ${userID} not found`)
        }
        else{
        let update = []
        doc.friends.forEach(friend => {
            if(friend.username !== username){
            update.push(friend)
            }
        })
        friends_db.update({username: friendName}, {$set: {friends: update}})
        friends_db.persistence.compactDatafile()
        }
    })
    }
})
})

module.exports = router;
  