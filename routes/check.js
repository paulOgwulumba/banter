const express = require('express');
const { usersDB, friendsDB, friendRequestsDB } = require('../utils/db');

const router = express.Router();

/**
 *  Checks if a given user with database ID 'id' already sent a friend request to another
 *  user of username 'username'.
 */
router.get('/add/:id/:username', (request, response) => {
  // database id of user
  const userID = request.params.id;

  // Username of friend whose add status is to be checked
  const friendName = request.params.username;

  // get users details from database
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;

    if (document !== null) {
      const { username } = document;

      // Get a list of all friend requests received by user being checked.
      friendRequestsDB.findOne({ username: friendName }, (err, doc) => {
        if (error) throw err;

        if (doc !== null) {
          let status = false;
          doc.requests.forEach((req) => {
            // If our user is in the Friend Request list of the other user, send true to front end.
            if (req === username) {
              status = true;
            }
          });

          response.send({ status });
        } else {
          response.status(500).send('Server error!');
        }
      });
    } else {
      response.status(404).send('This user does not exist in database.');
    }
  });
});

/**
 *  Checks if a given user with database ID 'id' successfully deleted another user of
 *  username 'username' from their friend list.
 */
router.get('/remove/:id/:username', (request, response) => {
  const userID = request.params.id;
  const friendName = request.params.username;

  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;

    if (document !== null) {
      const { username } = document;

      friendsDB.findOne({ username }, (err, doc) => {
        if (err) throw err;

        if (doc !== null) {
          let status = true;
          doc.friends.forEach((friend) => {
            if (friend.username === friendName) {
              status = false;
            }
          });
          response.send({ status });
        } else {
          response.status(404).send('Server error!');
        }
      });
    } else {
      response.status(404).send('This user does not exist in database.');
    }
  });
});

/**
 *  Checks if a given user with database ID 'id' got a friend request from another
 *  user of username 'username'.
 */
router.get('/request/:id/:username', (request, response) => {
  const userID = request.params.id;
  const friendName = request.params.username;

  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;

    if (document !== null) {
      const { username } = document;
      friendRequestsDB.findOne({ username }, (err, doc) => {
        if (err) throw err;

        if (doc !== null) {
          let status = false;

          doc.requests.forEach((req) => {
            if (req === friendName) {
              status = true;
            }
          });
          response.send({ status });
        } else {
          response.status(404).send('Server error!');
        }
      });
    } else {
      response.status(404).send('This user does not exist in database.');
    }
  });
});

module.exports = router;
