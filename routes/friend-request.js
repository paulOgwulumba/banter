const express = require('express');
const router = express.Router();
const {  users_db, messages_db, friends_db, friend_requests_db } = require('../utils/db');

/**
 *  Get all the current friend-requests of user with ID 'id'.
 */
router.get('/get/all/:id', (request, response) => {
let userID = request.params.id
users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document !== null){
    let username = document.username
    friend_requests_db.findOne({username: username}, (error, doc) => {
        if(error) throw error
        if(doc !== null){
        let requests = doc.requests
        users_db.find({}, (error, docs) => {
            if(error) throw error
            if(docs !== null){
            let toBeSent = []
            requests.forEach(request => {
                second: for(let user of docs){
                if(user.username === request){
                    toBeSent.push({
                    username: user.username,
                    name: user.name,
                    date_of_birth: user.date_of_birth,
                    gender: user.gender
                    })
                    break second
                }
                }
            })
            response.send(toBeSent)
            }
            else{
            console.error(`Failed to find user documents.`)
            response.status(404).send("This user does not exist in database.")
            }
        })
        }
        else{
        console.error(`Failed to find document. username: ${username} db: friend_requests_db`)
        response.status(404).send("This user does not exist in database.")
        }
    })
    }
    else{
    console.error(`Failed to find document. id: ${userID} db: users_db`)
    response.status(404).send("This user does not exist in database.")
    }
})
})

/**
 *  Send a friend request to user with username 'username' from user with ID 'id'.
 */
router.get('/send/:id/:username', (request, response) => {
let userID = request.params.id
let friendName = request.params.username
users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document !== null){
    let username = document.username
    friend_requests_db.findOne({username: friendName}, (error, doc) =>{
        if(error) throw error
        if(doc !== null){
        let update = doc.requests
        if(update.indexOf(username) === -1){
            update.push(username)
            friend_requests_db.update({username: friendName}, {$set: {requests: update}})
        } 
        response.status(202).send({status: "success"})
        }
        else{
        console.error(`Failed to find document. username: ${friendName} db: friend_requests_db`)
        response.status(404).send("You cannot send a friend request to this person.")
        }
    })
    }
    else{
    console.error(`Failed to find document. id: ${userID} db: users_db`)
    response.status(404).send("This user does not exist in database.")
    }
})

})

/**
*   Accept friend request from user with username 'username' to user with ID 'id'.
*/
router.get('/accept/:id/:username', (request, response) => {
let userID = request.params.id
let friendName = request.params.username
users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document !== null){
    let username = document.username
    //deletes the friend request from user database //working fine
    friend_requests_db.findOne({username: username}, (error, doc) =>{
        if(error) throw error
        if(doc !== null){
        let update = []
        doc.requests.forEach(request => {
            if(request !== friendName){
            update.push(request)
            }
        })
        friend_requests_db.update({username: username}, {$set: {requests: update}})
        }
        else{
        console.error(`Failed to find document. username: ${friendName} db: friend_requests_db`)
        }
    }) 
    //adds friend to friend list of user //working fine
    friends_db.findOne({username: username}, (error, doc) => {
        if(error) throw error
        if(doc !== null){
        let update = doc.friends
        let yes = true
        for(up of update){
            if(JSON.stringify(up) === JSON.stringify({username: friendName})){
            yes = false
            }
        }
        if(yes){
            update.push({username: friendName})
        }
        friends_db.update({username: username}, {$set: {friends: update}})
        }
        else{
        console.error(`Failed to find document. username: ${username} db: friends_db`)
        }
    })
    //creates message profile for user for friend
    messages_db.findOne({username: username}, (error, documento) => {
        console.log(documento)
        if(true){
        let query = `friend.${friendName}`
        let info = {username: friendName, messages: []}
        messages_db.update({username: username}, {$set: {[query]: info}}, {upsert: true})
        }
    })

    //deletes the friend request from friend database if any //working fine
    friend_requests_db.findOne({username: friendName}, (error, doc) =>{
        if(error) throw error
        if(doc !== null){
        let update = []
        doc.requests.forEach(request => {
            if(request !== username){
            update.push(request)
            }
        })
        friend_requests_db.update({username: friendName}, {$set: {requests: update}})
        }
        else{
        console.error(`Failed to find document. username: ${friendName} db: friend_requests_db`)
        }
    })  
    //adds user to friend list of friend //working fine
    friends_db.findOne({username: friendName}, (error, doc) => {
        if(error) throw error
        if(doc !== null){
        let update = doc.friends
        let yes = true
        for(up of update){
            if(JSON.stringify(up) !== JSON.stringify({username: username})){
            yes = false
            }
        }
        if(yes){
            update.push({username: username})
        }
        friends_db.update({username: friendName}, {$set: {friends: update}})
        }
        else{
        console.error(`Failed to find document. username: ${username} db: friends_db`)
        }
    })   
    //creates message profile for friend for user
    messages_db.findOne({username: friendName}, (error, documento) => {
        console.log(documento)
        if(true){
        let query = `friend.${username}`
        let info = {username: username, messages: []}
        messages_db.update({username: friendName}, {$set: {[query]: info}}, {upsert: true})
        }
    }) 
    }
    else{
    console.error(`Failed to find document. id: ${userID} db: users_db`)
    response.status(404).send("This user does not exist in database.")
    }
})

})

/**
 * Retract a friend request sent by user with ID 'id' to user with username 'username'.
 */
router.get('/cancel/:id/:username', (request, response) => {
let userID = request.params.id
let friendName = request.params.username
users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document !== null){
    let username = document.username
    friend_requests_db.findOne({username: friendName}, (error, doc) => {
        if(doc !== null){
        let update = []
        for(let request of doc.requests){
            if(request !== username){
            update.push(request)
            }
        }
        friend_requests_db.update({username: friendName}, {$set: {requests: update}})
        }
    })
    }
})
})

/**
 * Reject a friend request sent by user with username 'username' to user with ID 'id'.
 */
router.get('/reject/:id/:username', (request, response) => {
let userID = request.params.id
let friendName = request.params.username
users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document !== null){
    username = document.username
    friend_requests_db.findOne({username: username}, (error, doc) =>{
        if(error) throw error
        if(doc !== null){
        let update = []
        doc.requests.forEach(request => {
            if(request !== friendName){
            update.push(request)
            }
        })
        friend_requests_db.update({username: username}, {$set: {requests: update}})
        response.status(202).send("success")
        }
        else{
        console.error(`Failed to find document. username: ${friendName} db: friend_requests_db`)
        response.status(404).send("You cannot send a friend request to this person.")
        }
    })
    }
    else{
    console.error(`Failed to find document. id: ${userID} db: users_db`)
    response.status(404).send("This user does not exist in database.")
    }
})
})

module.exports = router;
