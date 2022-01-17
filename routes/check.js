const express = require('express');
const router = express.Router();
const { users_db, friends_db, friend_requests_db } = require('../utils/db');

/**
 *  Checks if a given user with database ID 'id' already sent a friend request to another user of username 'username'.
 */
router.get('/add/:id/:username', (request, response) => {
    // database id of user
    let userID = request.params.id;

    // Username of friend whose add status is to be checked
    let friendName = request.params.username;

    // get users details from database
    users_db.findOne({_id: userID}, (error, document) => {
        if (error) throw error

        if (document !== null) {
            let username = document.username;

            // Get a list of all friend requests received by user being checked.
            friend_requests_db.findOne({username: friendName}, (error, doc) => {
                if (error) throw error

                if (doc !== null) {
                    the: for (let request of doc.requests){
                        // If our user is in the Friend Request list of the other user, send true to front end.
                        if  (request === username){
                            response.send({status: true})
                            break the
                        }
                    }

                    try {
                     response.send({status: false})
                    }
                    catch(err){}
                }
                else {
                    console.error(`Failed to find document. username: ${username} db: friends_db`)
                    response.status(500).send("Server error!")
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
 *  Checks if a given user with database ID 'id' successfully deleted another user of username 'username' from their friend list.
 */
router.get('/remove/:id/:username', (request, response) => {
    let userID = request.params.id;
    let friendName = request.params.username;

    users_db.findOne({ _id: userID }, (error, document) => {
        if (error) throw error;

        if (document !== null) {
            let username = document.username;

            friends_db.findOne({ username: username }, (error, doc) => {
                if (error) throw error;

                if (doc !== null) {
                    number1: for (let friend of doc.friends) {
                        if (friend.username === friendName) {
                            response.send({status: false})
                            break number1
                        }
                    }
                    try{
                        response.send({status: true})
                    }
                    catch(e){}
                }
                else {
                    console.error(`Failed to find document. username: ${username} db: friends_db`)
                    response.status(404).send("Server error!")
                }
            })
        }
        else {
            console.error(`Failed to find document. id: ${userID} db: users_db`)
            response.status(404).send("This user does not exist in database.")
        }
    })
})

/**
 *  Checks if a given user with database ID 'id' got a friend request from another user of username 'username'.
 */
router.get('/request/:id/:username', (request, response) => {
    let userID = request.params.id;
    let friendName = request.params.username;

    users_db.findOne({_id: userID}, (error, document) => {
        if (error) throw error;

        if (document !== null) {
            let username = document.username;
            friend_requests_db.findOne({username: username}, (error, doc) => {
            if (error) throw error

            if (doc !== null) {
                let status = false;

                for (let request of doc.requests) {
                    if (request === friendName) {
                        status =  true;
                        break;
                    }
                }
            
                response.send({status: status})
            }
            else {
                console.error(`Failed to find document. username: ${username} db: friend_requests_db`)
                response.status(404).send("Server error!")
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
