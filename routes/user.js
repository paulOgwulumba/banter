const express = require('express');
const {
  usersDB, messagesDB, friendsDB, friendRequestsDB,
} = require('../utils/db');

const router = express.Router();

/**
 *  Get a list of all users registered in the network excluding the user with ID 'id'.
 */
router.get('/all/:id', (request, response) => {
  const userID = request.params.id;
  usersDB.find({ $not: { _id: userID } }, (error, document) => {
    const list = [];
    document.forEach((element) => {
      const unit = {
        username: element.username,
        name: element.name,
        date_of_birth: element.date_of_birth,
        gender: element.gender,
      };
      list.push(unit);
    });
    response.send(list);
  });
});

/**
 *  Get details of user with ID 'id'.
 */
router.get('/:id', (request, response) => {
  usersDB.findOne({ _id: request.params.id }, (error, document) => {
    if (error) throw error;
    if (document == null) {
      response.status(404).send({ status: 'User not found' });
    } else {
      const user = {
        name: document.name,
        username: document.username,
        date_of_birth: document.date_of_birth,
        email: document.email,
      };
      response.send(user);
    }
  });
});

/**
 *  Create a new user profile.
 */
router.put('/', (request, response) => {
  if (request.body.password === request.body.confirmPassword) {
    usersDB.findOne({ username: request.body.username }, (error, document) => {
      if (error) throw error;
      if (document == null) {
        usersDB.insert(request.body);
        friendsDB.insert({ username: request.body.username, friends: [] });
        messagesDB.insert({ username: request.body.username, friend: {} });
        friendRequestsDB.insert({ username: request.body.username, requests: [] });
        response.send({ status: 'success!' });
      } else {
        response.send({ status: 'failed', message: 'Username is taken.*' });
      }
    });
  } else {
    response.send({ status: 'failed', message: 'Passwords do not match' });
  }
});

/**
 *  Perform log in validation.
 */
router.post('/login', (request, response) => {
  usersDB.findOne({ username: request.body.username }, (error, document) => {
    if (error) throw error;
    if (document === null) {
      response.send({ status: 'failed', message: 'Wrong username and password*' });
    } else if (request.body.password !== document.password) {
      response.send({ status: 'failed', message: 'Wrong password' });
    } else {
      const { _id } = document;
      response.send({ status: 'success', id: _id });
    }
  });
});

module.exports = router;
