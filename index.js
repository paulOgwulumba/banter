const cors = require('cors')

const express = require('express')
const app = express() 
app.use(express.static('/public/'))
app.use(express.json({limit: "5mb"}))

const port = 3000
app.listen(port, ()=>{
  console.log("Listening on port", port)
})

const Datastore = require('nedb')
const database = new Datastore({filename: "database.db", autoload: true, corruptAlertThreshold: 0.9})
const users_db = new Datastore({filename: "database/users.db", autoload: true, corruptAlertThreshold: 0.5})
const messages_db = new Datastore({filename: "database/messages.db", autoload: true, corruptAlertThreshold: 0.9})
const friends_db = new Datastore({filename: "database/friends.db", autoload: true, corruptAlertThreshold: 0.5})
const friend_requests_db = new Datastore({filename: "database/friend_requests.db", autoload: true, corruptAlertThreshold: 0.5})

// Set up a whitelist and check against it:
const whitelist = ['http://localhost:8001' ]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// Then pass them to cors:
app.use(cors(corsOptions));

/**
 * Fetching all friend requests
 */
app.get('/friend-requests/:id', (request, response) => {
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
 * Sending a friend request
 */
app.get('/friend-request/:id/:username', (request, response) => {
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
 Accepting a friend request
*/
app.get('/accept-request/:id/:username', (request, response) => {
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
 * Cancelling a request
 */
app.get('/cancel-request/:id/:username', (request, response) => {
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
 * Rejecting a friend request
 */
app.get('/reject-request/:id/:username', (request, response) => {
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

/*
  Check series
*/
app.get('/check-add/:id/:username', (request, response) => {
  let userID = request.params.id
  let friendName = request.params.username
  users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document !== null){
      let username = document.username
      friend_requests_db.findOne({username: friendName}, (error, doc) => {
        if(error) throw error
        if(doc !== null){
          the: for(let request of doc.requests){
            if(request === username){
              response.send({status: true})
              break the
            }
          }
          try{
            response.send({status: false})
          }
          catch(err){}
        }
        else{
          console.error(`Failed to find document. username: ${username} db: friends_db`)
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

app.get('/check-remove/:id/:username', (request, response) => {
  let userID = request.params.id
  let friendName = request.params.username
  users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document !== null){
      let username = document.username
      friends_db.findOne({username: username}, (error, doc) => {
        if(error) throw error
        if(doc !== null){
          number1: for(let friend of doc.friends) {
            if(friend.username === friendName){
              response.send({status: false})
              break number1
            }
          }
          try{
            response.send({status: true})
          }
          catch(e){}
        }
        else{
          console.error(`Failed to find document. username: ${username} db: friends_db`)
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

app.get('check-request/:id/:username', (request, response) => {
  let userID = request.params.id
  let friendName = request.params.username
  users_db.findOne({_id: userID}, (error, document) => {
    if(error) throw error
    if(document !== null){
      let username = document.username
      friend_requests_db.findOne({username: username}, (error, doc) => {
        if(error) throw error
        if(doc !== null){
          doc.requests.forEach(request => {
            if(request === friendName){
              response.send({status: true})
            }
          })
          response.send({status: false})
        }
        else{
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



/*
  friends series
*/

app.get('/friends/:id', (request, response) => {
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

app.get('/all-friends/:id', (request, response) => {
  let userID = request.params.id
  users_db.find({$not: {_id: userID}}, (error, document) => {
    let list = []
    document.forEach(element => {
      let unit = {
        username: element.username,
        name: element.name,
        date_of_birth: element.date_of_birth,
        gender: element.gender
      }
      list.push(unit)
    })
    response.send(list)
  })
})

app.get('/seen/:id/:username', (request, response) => {
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

app.get('/messages/:id', (request, response) => {
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
 * remove a friend
 */
app.delete('/friend/:id/:username', (request, response) => {
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


app.post('/message/:id', (request, response) => {
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

app.get("/user/:id", (request, response) => {
  users_db.findOne({_id: request.params.id}, (error, document) => {
    if(error) throw error
    if(document == null){
      response.status(404).send({status: "User not found"})
    }
    else{
      let user = {
        name: document.name,
        username: document.username,
        date_of_birth: document.date_of_birth,
        email: document.email
      }
      response.send(user)
    }
  })
})

app.put("/user", (request, response) => {
  if(request.body.password === request.body.confirmPassword){
    users_db.findOne({username: request.body.username}, (error, document) => {
      if(error) throw error
      if(document == null){
        users_db.insert(request.body)
        friends_db.insert({username: request.body.username, friends: []})
        messages_db.insert({username: request.body.username, friend: {}})
        friend_requests_db.insert({username: request.body.username, requests: []})
        response.send({status: "success!"})
      }
      else{
        response.send({status: "failed", message: "Username is taken.*"})
      }
    })
  }
  else{
    response.send({status: "failed", message: "Passwords do not match"})
  }
})

app.post("/user", (request, response) => {
  users_db.findOne({username: request.body.username}, (error, document) => {
    if(error) throw error
    if(document === null){
      response.send({status: "failed", message: "Wrong username and password*"})
    }
    else{
      if(request.body.password !== document.password){
        response.send({status: "failed", message: "Wrong password"})
      }
      else{
        response.send({status: "success", id: document._id})
      }
    }
  })
})

function copyArray(array){
  let newArray = []
  array.forEach(element => {
    newArray.push(element)
  })
  return newArray
}


/*
  This function checks if message profiles have been created for all registered
  users and creates one for any user who does not have one yet.
*/
function refreshMessageProfiles(){
  users_db.find({}, (error, documents) => {
    if(error) throw error
    if(documents.length === 0){
      console.log("Something went wrong while creating message profiles!")
      return
    }
    let usernames = []
    documents.forEach(element => {
      usernames.push(element.username)
    })
    usernames.forEach(element => {
      messages_db.findOne({username: element}, (error, document) => {
        if(error) throw error
        if(document === null){
          console.log("line 180:", document)                   //if no message profile exists for user,
          let initialData = {
            username: element,
            friend: {}
          }
          messages_db.insert(initialData, (error, docs) => {})        //create one
        }
      })
      for(let i = 0; i < usernames.length; i++){                          //add all the other registered users to message profile of current user
        if(usernames[i] !== element){
          let location = "friend."+ usernames[i] + ".username"
          messages_db.findOne({[location]: usernames[i]}, (error, doc) => {
            if(error) throw error
            if(doc === null){
              console.log("line 193:", element)
              let friendData = {
                username : usernames[i],
                messages: []
              }
              let field = "friend." + usernames[i]
              messages_db.update({username: element}, {$set: {[field] : friendData}},{}, (error, num)=>{})
            }
          })
        }
      }
    })
  })
}

function seeAllMessages(array){
  let newArray = []
  array.forEach(element => {
    let newObj = {}
    newObj = Object.assign(newObj, element)
    newObj["status"] = 2
    newArray.push(newObj)
  })
  return newArray
}

function createFriendList(){
  users_db.find({}, (error, documents) => {
    if(error) throw error
    let usernames = []
    documents.forEach(element => {
      usernames.push({username: element.username, _id: element._id})
    })
    usernames.forEach(user => {
      let simpArray = []
      for(let username of usernames){
        if(user.username !== username.username){
          simpArray.push({username: username.username})
        }
      }
      user.friends = simpArray
      friends_db.insert(user, (error, doc) => {})
    })
  })
}

function createRequestList(){
  users_db.find({}, (error, documents) => {
    if(error) throw error
    documents.forEach(user => {
      friend_requests_db.insert({username: user.username, requests: []})
    })
  })
}

