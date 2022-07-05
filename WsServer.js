/*
* User Class that stores the socket and the status of the user in the current game.
*/
class User {
  constructor(socket){
      this.socket = socket
      this.alive = true
  }

  kill(){
      this.alive = false
  }

  reset() {
    this.alive = true;
  }
}

/*
* Session Class to encapsulate the Users playing and associate them with a session for the
* current game they are playing.
*/
class Session {
  constructor(sessionId, userCount){
      this.sessionId = sessionId
      this.userCount = userCount
      this.users = []
      this.activeUsers = 0;
  }

  AddUser(socket){
    if(this.userCount >= this.users.length){
        let user = new User(socket);
        this.users.push(user)
        this.activeUsers++;
    }
    else{
      socket.send(JSON.stringify({
        "type" : "join",
        "status" : "Failed: Lobby is Full!"
      }));
    }
  }

  KillUser(socket){
      var curUser = this.users.find((user) => user.socket == socket)
      curUser.kill();

      if (--this.activeUsers == 1) {
        var curUser = this.users.find((user) => user.alive == true)
        curUser.socket.send(JSON.stringify({
          "type" : "win"
        }));
      }
  }

  removeUser(socket) {
    this.KillUser(socket);
    let curUser = this.users.find((user) => user.socket == socket);
    this.users.splice(0,1);
    
  }

  reset() {
    for (let i=0; i<this.users.length; i++) {
      this.users[i].reset();
    }
  }
}

/*
* In memory storage of all currently active Sessions. Also acts as a controller to 
* the Sessions.
*/
class SessionList {
  constructor(){
      this.sessions = []
  }

  print(sessionID) {
    var curSession = this.sessions.find((session) => session.sessionId == sessionID)
    for (let i=0; i< curSession.users.length; i++) {
      console.log(curSession.users[i].alive);
    }
  }

  KillUser(ws, sessionID) {
    var curSession = this.sessions.find((session) => session.sessionId == sessionID)
      if(!curSession){
        // Implement Error Response
        console.log("Session does not exist");
        return 
      }
      else{
        curSession.KillUser(ws);
      }
  }

  AddSocketToSession(ws, sessionId){
      var curSession = this.sessions.find((session) => session.sessionId == sessionId)
      if(!curSession){
        // Implement Error Response
        ws.send(JSON.stringify({
          "type" : "join",
          "status" : "Failed: Session Does Not Exist!"
        }));

        return
      }
      else{
        curSession.AddUser(ws)
      }
  }

  AddSession(playerCount = 5){
    let sessionid = 'AAA'
    //Check SessionID is unique
    while(this.sessions.find((session) => session.sessionId == sessionid)){
      sessionid = (Math.random() + 1).toString(36).substring(9)
    }

    let session = new Session(sessionid, playerCount)
    this.sessions.push(session)
    return sessionid
  }
}




/* ==========================================================
* Servers
============================================================= */

/* Express Server */

const express = require('express');
const WebSocket = require('ws');

const app = express();
const Port = process.env.PORT || 8080;

const wss = new WebSocket.Server({ noServer: true });

var Sessions = new SessionList();

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
  console.log('received: %s', message);

    const obj = JSON.parse(message);
    const type = obj.type;

    if (type == "join") {
      Sessions.AddSocketToSession(ws, obj.sessionID);
    }
    else if (type == "lose") {
      Sessions.KillUser(ws, obj.sessionID);
      Sessions.print(obj.sessionID);
    }
    
  });

  ws.on("close", function close() {

  })

});

var server = app.listen(Port, function() {
  console.log("Express WS Server Listening on Port " + Port);
});
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request);
  });
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());


app.post("/game/create",  function(request, response) {

  const count = request.body.playerCount;
  var sesID = Sessions.AddSession(count);

  console.log(count);
  console.log(sesID);

  response.end(JSON.stringify({
    "sessionID" : sesID
  }));
  
});

/* WebSocket Server */

/*const { create } = require('domain');
const fs = require('fs');
const http = require('http');
const { join } = require('path');


const server = app.createServer();


var clients = new Map();




//server.listen(process.env.PORT);
console.log("Listening on 8080");*/


