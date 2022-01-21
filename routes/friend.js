const express = require('express');
const { usersDB, messagesDB, friendsDB } = require('../utils/db');

const router = express.Router();

/**
 *  Get a list of all the friends of user with ID 'id'.
 */
router.get('/get/all/:id', (request, response) => {
  const userID = request.params.id;
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;
    if (document === null) {
      // console.log("No document found for get-friends-id");
      response.status(403).send({ status: 'incorrect credentials' });
    } else {
      const { username } = document;
      friendsDB.findOne({ username }, (error1, doc) => {
        const friends = [];
        doc.friends.forEach((friend) => {
          friends.push(friend.username);
        });
        usersDB.find({}, (error2, files) => {
          if (error2) throw error2;
          if (files === null) {
            // console.log('friends list is empty');
            response.send({});
          } else {
            const friendList = [];
            files.forEach((element) => {
              if (friends.indexOf(element.username) !== -1) {
                const unit = {
                  username: element.username,
                  name: element.name,
                  date_of_birth: element.date_of_birth,
                  gender: element.gender,
                };
                friendList.push(unit);
              }
            });
            response.send(friendList);
          }
        });
      });
    }
  });
});

/**
 *  Delete user with username 'username' from friends list of user with ID 'id'.
 */
router.delete('/:id/:username', (request, response) => {
  const userID = request.params.id;
  const friendName = request.params.username;
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;
    if (document === null) {
      // console.error(`Document not found! username: ${username}. db: usersDB`);
      response.status(404).send(`User with _id ${userID} not found`);
    } else {
      const { username } = document;
      friendsDB.findOne({ username }, (error2, doc) => {
        if (error2) throw error2;
        if (doc === null) {
          // console.error(`Document not found! username: ${username}. db: friendsDB`);
          response.status(404).send(`User with _id ${userID} not found`);
        } else {
          const update = [];
          doc.friends.forEach((friend) => {
            if (friend.username !== friendName) {
              update.push(friend);
            }
          });
          // console.log(update);
          friendsDB.update({ username }, { $set: { friends: update } });
          friendsDB.persistence.compactDatafile();
        }
      });
      const query = `friend.${friendName}`;
      messagesDB.update({ username }, { $set: { [query]: undefined } });
      messagesDB.persistence.compactDatafile();

      friendsDB.findOne({ username: friendName }, (error2, doc) => {
        if (error2) throw error2;
        if (doc === null) {
          // console.error(`Document not found! username: ${friendName}. db: friendsDB`);
          response.status(404).send(`User with _id ${userID} not found`);
        } else {
          const update = [];
          doc.friends.forEach((friend) => {
            if (friend.username !== username) {
              update.push(friend);
            }
          });
          friendsDB.update({ username: friendName }, { $set: { friends: update } });
          friendsDB.persistence.compactDatafile();
        }
      });
    }
  });
});

module.exports = router;
