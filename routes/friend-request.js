const express = require('express');
const {
  usersDB, messagesDB, friendsDB, friendRequestsDB,
} = require('../utils/db');

const router = express.Router();

/**
 *  Get all the current friend-requests of user with ID 'id'.
 */
router.get('/get/all/:id', (request, response) => {
  const userID = request.params.id;
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;
    if (document !== null) {
      const { username } = document;
      friendRequestsDB.findOne({ username }, (err, doc) => {
        if (err) throw err;
        if (doc !== null) {
          const { requests } = doc;
          usersDB.find({}, (error3, docs) => {
            if (error3) throw error3;
            if (docs !== null) {
              const toBeSent = [];
              requests.forEach((friendRequest) => {
                docs.every((user) => {
                  if (user.username === friendRequest) {
                    toBeSent.push({
                      username: user.username,
                      name: user.name,
                      date_of_birth: user.date_of_birth,
                      gender: user.gender,
                    });

                    return false;
                  }

                  return true;
                });
              });
              response.send(toBeSent);
            } else {
              // console.error('Failed to find user documents.');
              response.status(404).send('This user does not exist in database.');
            }
          });
        } else {
          // console.error(`Failed to find document. username: ${username} db: friendRequestsDB`);
          response.status(404).send('This user does not exist in database.');
        }
      });
    } else {
      // console.error(`Failed to find document. id: ${userID} db: usersDB`);
      response.status(404).send('This user does not exist in database.');
    }
  });
});

/**
 *  Send a friend request to user with username 'username' from user with ID 'id'.
 */
router.get('/send/:id/:username', (request, response) => {
  const userID = request.params.id;
  const friendName = request.params.username;
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;
    if (document !== null) {
      const { username } = document;
      friendRequestsDB.findOne({ username: friendName }, (error2, doc) => {
        if (error2) throw error2;
        if (doc !== null) {
          const update = doc.requests;
          if (update.indexOf(username) === -1) {
            update.push(username);
            friendRequestsDB.update({ username: friendName }, { $set: { requests: update } });
          }
          response.status(202).send({ status: 'success' });
        } else {
          // console.error(`Failed to find document. username: ${friendName} db: friendRequestsDB`);
          response.status(404).send('You cannot send a friend request to this person.');
        }
      });
    } else {
      // console.error(`Failed to find document. id: ${userID} db: usersDB`);
      response.status(404).send('This user does not exist in database.');
    }
  });
});

/**
*   Accept friend request from user with username 'username' to user with ID 'id'.
*/
router.get('/accept/:id/:username', (request, response) => {
  const userID = request.params.id;
  const friendName = request.params.username;
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;
    if (document !== null) {
      const { username } = document;
      // deletes the friend request from user database //working fine
      friendRequestsDB.findOne({ username }, (error2, doc) => {
        if (error2) throw error2;
        if (doc !== null) {
          const update = [];
          doc.requests.forEach((friendRequest) => {
            if (friendRequest !== friendName) {
              update.push(friendRequest);
            }
          });
          friendRequestsDB.update({ username }, { $set: { requests: update } });
        } else {
          // console.error(`Failed to find document. username: ${friendName} db: friendRequestsDB`);
        }
      });

      // adds friend to friend list of user //working fine
      friendsDB.findOne({ username }, (error3, doc) => {
        if (error3) throw error3;
        if (doc !== null) {
          const update = doc.friends;
          let yes = true;
          update.forEach((up) => {
            if (JSON.stringify(up) === JSON.stringify({ username: friendName })) {
              yes = false;
            }
          });
          if (yes) {
            update.push({ username: friendName });
          }
          friendsDB.update({ username }, { $set: { friends: update } });
        } else {
          // console.error(`Failed to find document. username: ${username} db: friendsDB`);
        }
      });

      // creates message profile for user for friend
      messagesDB.findOne({ username }, () => {
        // console.log(documento);
        const query = `friend.${friendName}`;
        const info = { username: friendName, messages: [] };
        messagesDB.update({ username }, { $set: { [query]: info } }, { upsert: true });
      });

      // deletes the friend request from friend database if any //working fine
      friendRequestsDB.findOne({ username: friendName }, (error5, doc) => {
        if (error5) throw error5;
        if (doc !== null) {
          const update = [];
          doc.requests.forEach((friendRequest) => {
            if (friendRequest !== username) {
              update.push(request);
            }
          });
          friendRequestsDB.update({ username: friendName }, { $set: { requests: update } });
        } else {
          // console.error(`Failed to find document. username: ${friendName} db: friendRequestsDB`);
        }
      });

      // adds user to friend list of friend.
      friendsDB.findOne({ username: friendName }, (error6, doc) => {
        if (error6) throw error6;
        if (doc !== null) {
          const update = doc.friends;
          let yes = true;
          update.forEach((up) => {
            if (JSON.stringify(up) !== JSON.stringify({ username })) {
              yes = false;
            }
          });
          if (yes) {
            update.push({ username });
          }

          friendsDB.update({ username: friendName }, { $set: { friends: update } });
        } else {
          // console.error(`Failed to find document. username: ${username} db: friendsDB`);
        }
      });
      // creates message profile for friend for user
      messagesDB.findOne({ username: friendName }, () => {
        // console.log(documento);
        const query = `friend.${username}`;
        const info = { username, messages: [] };
        messagesDB
          .update({ username: friendName }, { $set: { [query]: info } }, { upsert: true });
      });
    } else {
      // console.error(`Failed to find document. id: ${userID} db: usersDB`);
      response.status(404).send('This user does not exist in database.');
    }
  });
});

/**
 * Retract a friend request sent by user with ID 'id' to user with username 'username'.
 */
router.get('/cancel/:id/:username', (request, response) => {
  const userID = request.params.id;
  const friendName = request.params.username;
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) {
      response.status(500).send({ status: 'Failed' });
    }
    if (document !== null) {
      const { username } = document;
      friendRequestsDB.findOne({ username: friendName }, (error1, doc) => {
        if (doc !== null) {
          const update = [];
          doc.requests.forEach((friendRequest) => {
            if (friendRequest !== username) {
              update.push(friendRequest);
            }
          });
          friendRequestsDB.update({ username: friendName }, { $set: { requests: update } });
          response.status(200).send({ status: 'success' });
        } else {
          response.status(500).send({ status: 'failed' });
        }
      });
    } else {
      response.status(400).send({ status: 'invalid credentials' });
    }
  });
});

/**
 * Reject a friend request sent by user with username 'username' to user with ID 'id'.
 */
router.get('/reject/:id/:username', (request, response) => {
  const userID = request.params.id;
  const friendName = request.params.username;
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;
    if (document !== null) {
      const { username } = document;
      friendRequestsDB.findOne({ username }, (error1, doc) => {
        if (error) throw error;
        if (doc !== null) {
          const update = [];
          doc.requests.forEach((friendRequest) => {
            if (friendRequest !== friendName) {
              update.push(request);
            }
          });
          friendRequestsDB.update({ username }, { $set: { requests: update } });
          response.status(202).send('success');
        } else {
          // console.error(`Failed to find document. username: ${friendName} db: friendRequestsDB`);
          response.status(404).send('You cannot send a friend request to this person.');
        }
      });
    } else {
      // console.error(`Failed to find document. id: ${userID} db: usersDB`);
      response.status(404).send('This user does not exist in database.');
    }
  });
});

module.exports = router;
