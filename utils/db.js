// Set up nedb database
const Datastore = require('nedb')

/**
 * @description Datastore object that holds the personal details of all registered users.
 */
const users_db = new Datastore({filename: "database/users.db", autoload: true, corruptAlertThreshold: 0.5});

/**
 * @description Datastore object that holds records of all messages sent in the app.
 */
const messages_db = new Datastore({filename: "database/messages.db", autoload: true, corruptAlertThreshold: 0.9});

/**
 * @description Datastore object that holds a list of the friends of every registered user.
 */
const friends_db = new Datastore({filename: "database/friends.db", autoload: true, corruptAlertThreshold: 0.5});

/**
 * @description Datastore object that holds a list of the friend requests of all registered users.
 */
const friend_requests_db = new Datastore({filename: "database/friend_requests.db", autoload: true, corruptAlertThreshold: 0.5})

module.exports = { users_db, messages_db, friends_db, friend_requests_db }