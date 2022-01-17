const express = require('express');
const router = express.Router();
const {  users_db, messages_db, friends_db } = require('../utils/db');
const { seeAllMessages } = require('../utils/message-handles')

/**
 * Record in the database that user with ID 'id' viewed message from user with username 'username'
 */
router.get('/seen/:id/:username', (request, response) => {
    let userID = request.params.id
    let username = request.params.username
    users_db.findOne({_id: userID}, (error, document) => {
      if(error) throw error
      if(document === null){
        console.log("No document found for username")
      }
      else{
        let friendName = document.username
        friends_db.findOne({username: username}, (error, documento) => {
          if(error) throw error
          if(documento !== null){
            let isWorthy = false
            hehe: for(let name of documento.friends){
              if(name.username === friendName){
                isWorthy = true
                break hehe
              }
            }
            if(isWorthy){
              messages_db.findOne({username: username}, (error, doc) => {
                if(error) throw error
                let updated = seeAllMessages(doc.friend[friendName].messages)
                let docu = `friend.${friendName}.messages`
                messages_db.update({username: username}, { $set: {[docu]: updated}})
                response.send({status: `Updated ${username}'s messages successfully`})
              })
            }
          }
        })
      }
    })
})

/**
 *  Fetch all messages received and sent by user with ID 'id'.
 */
router.get('/get/all/:id', (request, response) => {
users_db.findOne({_id: request.params["id"]}, (error, document) => {
    if(error) throw error
    if(document !== null){
    messages_db.findOne({username: document.username}, (error, doc) => {
        if(error) throw error
        if(doc === null){
        response.status(404).send({message: "User profile not found!"})
        }
        else{
        response.send(doc)
        }
    })
    }
    else{
    response.status(404).send({status: "Not found"})
    }
    
})
})

/**
 *  Send message from user with ID 'id' to another user specified in the body of the request.
 */
router.post('/:id', (request, response) => {
let parameters = request.params["id"].split(',')
let friendName = parameters[1]
//console.log("Got a post", parameters)
users_db.findOne({_id: parameters[0]}, (error, document) => {
    if(error) throw error
    if(document === null){
    response.status(404).send({message: "Invalid userId! No records of given userID found in database."})
    }
    else{
    let username = document.username
    messages_db.findOne({username: username}, (error, doc) => {
        if(error) throw error
        if(doc === null){
        response.status(404).send({message: "Valid userID entered, but no message profile was found for it in the database."})
        }
        else{
        friends_db.findOne({username: friendName}, (error, documento) => {
            if(error) throw error
            if(documento !== null){
            let isWorthy = false
            hehe: for(let name of documento.friends){
                if(name.username === username){
                isWorthy = true
                break hehe
                }
            }
            let status = isWorthy? 1: 0
            let messages = doc.friend[parameters[1]].messages
            let newMessage = {
                message: request.body.message,
                time: request.body.time,
                outgoing: true,
                status: status
            }
            messages.push(newMessage)
            let location = "friend." + parameters[1] + ".messages"
            messages_db.update({username: document.username}, {$set: {[location] : messages}})
            }
        })
        }
    })
    //
    messages_db.findOne({username: parameters[1]}, (error, doc) => {
        if(error) throw error
        if(doc === null){
        response.status(404).send({message: "No message profile was found for "+ parameters[1]})
        }
        else{
        friends_db.findOne({username: friendName}, (error, documento) => {
            if(error) throw error
            if(documento !== null){
            let isWorthy = false
            hehe: for(let name of documento.friends){
                if(name.username === username){
                isWorthy = true
                break hehe
                }
            }
            if(isWorthy){
                let messages = doc.friend[document.username].messages
                let newMessage = {
                message: request.body.message,
                time: request.body.time,
                outgoing: false
                }
                messages.push(newMessage)
                let location = "friend." + document.username + ".messages"
                messages_db.update({username: parameters[1]}, {$set: {[location] : messages}}, {} , (error, num) => {
                if(error) throw error
                })
            }
            }
        })


        
        }
    })
    response.send({status: "successful"})
    }
})
//messages_db.update({_id: parameters[0]}, { $set: {}})
})


module.exports = router;