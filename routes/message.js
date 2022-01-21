const express = require('express');
const { usersDB, messagesDB, friendsDB } = require('../utils/db');
const { seeAllMessages } = require('../utils/message-handles');

const router = express.Router();

/**
 * Record in the database that user with ID 'id' viewed message from user with username 'username'
 */
router.get('/seen/:id/:username', (request, response) => {
  const userID = request.params.id;
  const { username } = request.params;
  usersDB.findOne({ _id: userID }, (error, document) => {
    if (error) throw error;
    if (document === null) {
      // console.log("No document found for username");
      response.status(403).send({ status: 'incorrect credentials' });
    } else {
      const friendName = document.username;
      friendsDB.findOne({ username }, (error1, documento) => {
        if (error1) throw error1;
        if (documento !== null) {
          let isWorthy = false;
          documento.friends.every((name) => {
            if (name.username === friendName) {
              isWorthy = true;
              return false;
            }
            return true;
          });
          if (isWorthy) {
            messagesDB.findOne({ username }, (error2, doc) => {
              if (error2) throw error2;
              const updated = seeAllMessages(doc.friend[friendName].messages);
              const docu = `friend.${friendName}.messages`;
              messagesDB.update({ username }, { $set: { [docu]: updated } });
              response.send({ status: `Updated ${username}'s messages successfully` });
            });
          }
        }
      });
    }
  });
});

/**
 *  Fetch all messages received and sent by user with ID 'id'.
 */
router.get('/get/all/:id', (request, response) => {
  usersDB.findOne({ _id: request.params.id }, (error, document) => {
    if (error) throw error;
    if (document !== null) {
      messagesDB.findOne({ username: document.username }, (error1, doc) => {
        if (error1) throw error1;
        if (doc === null) {
          response.status(404).send({ message: 'User profile not found!' });
        } else {
          response.send(doc);
        }
      });
    } else {
      response.status(404).send({ status: 'Not found' });
    }
  });
});

/**
 *  Send message from user with ID 'id' to another user specified in the body of the request.
 */
router.post('/:id', (request, response) => {
  const parameters = request.params.id.split(',');
  const friendName = parameters[1];
  // console.log("Got a post", parameters)
  usersDB.findOne({ _id: parameters[0] }, (error, document) => {
    if (error) throw error;
    if (document === null) {
      response.status(404).send({ message: 'Invalid userId! No records of given userID found in database.' });
    } else {
      const { username } = document;
      messagesDB.findOne({ username }, (error2, doc) => {
        if (error2) throw error2;
        if (doc === null) {
          response.status(404).send({ message: 'Valid userID entered, but no message profile was found for it in the database.' });
        } else {
          friendsDB.findOne({ username: friendName }, (error3, documento) => {
            if (error3) throw error3;
            if (documento !== null) {
              let isWorthy = false;
              documento.friends.every((name) => {
                if (name.username === username) {
                  isWorthy = true;
                  return false;
                }
                return true;
              });
              const status = isWorthy ? 1 : 0;
              const { messages } = doc.friend[parameters[1]];
              const newMessage = {
                message: request.body.message,
                time: request.body.time,
                outgoing: true,
                status,
              };
              messages.push(newMessage);
              const location = `friend.${parameters[1]}.messages`;
              messagesDB
                .update({ username: document.username }, { $set: { [location]: messages } });
            }
          });
        }
      });
      //
      messagesDB.findOne({ username: parameters[1] }, (error3, doc) => {
        if (error3) throw error3;
        if (doc === null) {
          response.status(404).send({ message: `No message profile was found for ${parameters[1]}` });
        } else {
          friendsDB.findOne({ username: friendName }, (error4, documento) => {
            if (error4) throw error4;
            if (documento !== null) {
              let isWorthy = false;
              documento.friends.every((name) => {
                if (name.username === username) {
                  isWorthy = true;
                  return false;
                }
                return true;
              });

              if (isWorthy) {
                const { messages } = doc.friend[document.username];
                const newMessage = {
                  message: request.body.message,
                  time: request.body.time,
                  outgoing: false,
                };
                messages.push(newMessage);
                const location = `friend.${document.username}.messages`;
                messagesDB
                  .update(
                    { username: parameters[1] },
                    { $set: { [location]: messages } },
                    {},
                    (error6) => {
                      if (error6) throw error;
                    },
                  );
              }
            }
          });
        }
      });
      response.send({ status: 'successful' });
    }
  });
});

module.exports = router;
