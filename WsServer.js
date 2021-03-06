const sessions = []
var _spectator;

function spectate(sessionID) {
  const session = findSession(_spectator, sessionID);

  var p = [];

  for (let i=0; i<session.players.length; i++) {
    p.push({
      "alive" : session.players[i].alive,
      "username" : session.players[i].username,
      "score" : session.players[i].score
    })
  }

  _spectator.send(JSON.stringify({
    "type": "update",
    "data": {
      "players": p
    }
  }));
}

function generateSession(playerCount = 5){
  let session = {
    locked: false,
    players: [],
    maxPlayerCount: playerCount,
    alivePlayerCount: function () {
      var aliveCount = 0
      for (let index = 0; index < this.players.length; index++) {
        const element = this.players[index];
        if(element.alive){
          aliveCount ++
        }
      }
      return aliveCount
    }, 
    sessionId: function () {
      let sesId = 'AAA'

      //Check SessionID is unique
      while(sessions.find((session) => session.sessionId == sesId)){
        sesId = ""
        for (let index = 0; index < 4; index++) {
          sesId += String.fromCharCode(Math.floor(Math.random() * (26)) + 65);
        }
      }

      return sesId
    }()
  }
  sessions.push(session)
  
  return session.sessionId
}

function findSession(ws,sessionId){
  const session = sessions.find((session) => session.sessionId == sessionId.toUpperCase())
  if(!session){
    ws.send(JSON.stringify({
      "type" : "join",
      "status" : "Failed: Session Does Not Exist!"
    }));

    return
  }
  else{
    return session
  }
}

function findPlayer(ws,session){
  const player = session.players.find((player) => player.ws == ws)
  if(!player){
    return
  }
  else{
    return player
  }
}

function findSessionHttp(sessionId){
  const session = sessions.find((session) => session.sessionId == sessionId)
  if(!session){
    return null;
  }
  else{
    return session;
  }
}

function findPlayer(ws,session){
  const player = session.players.find((player) => player.ws == ws)
  if(!player){
    return
  }
  else{
    return player
  }
}

var usernameCount = 0;

function addPlayerToSession(ws, sessionId, isHost){
  const session = findSession(ws, sessionId)
  if(session){
    //console.log(session.players.length);
    //console.log(session.maxPlayerCount);
    if(session.players.length < session.maxPlayerCount){
      if(findPlayer(ws,session)){
        ws.send(JSON.stringify({
          "type" : "join",
          "status" : "Failed: Player aready Exist!"
        }));
  
        return
      }
      else{
        // Check player already joined
        const newPlayer = {
          username: ("usr" + usernameCount++),
          ws: ws,
          alive: true,
          isHost: isHost,
          isReady: false,
          score: 0
        }

        //if a host already exists dont set another one 
        if (newPlayer.isHost){
          if (session.players.find((player) => player.isHost === true)){
            console.log("Host Already Assigned");
            newPlayer.isHost = false
          }
        }

        session.players.push(newPlayer)
        //console.log("Sending data");
        //console.log(newPlayer.isHost);
        
        ws.send(JSON.stringify({
          "type" : "isHost",
          "status" : newPlayer.isHost
        }));

        return newPlayer;
      }
    }
    else{
      ws.send(JSON.stringify({
        "type" : "join",
        "status" : "Failed: Lobby is Full!"
      }));
    }
  }
}

function killPlayer(ws, sessionId){
  const session = findSession(ws,sessionId)
  if(session){
    const player = findPlayer(ws,session)
    if(player){
      //player.score = player.score + 1;
      //Kills player
      player.alive = false
      // Send conformation to player 
      ws.send(JSON.stringify({
        "type" : "kill",
        "status" : "You are killed."
      }));
      // Check if only one player is left thus the winner
      checkGameOver(session)

      return
    }
  }
}

function checkGameOver(session){
  if(session.alivePlayerCount() <= 1){
    const winner = session.players.find((player) => player.alive == true)
    winner.score = winner.score + 1;
    winner.ws.send(JSON.stringify({
      "type" : "win",
      "status" : "Wel done you are slightly above averagre compared to the rest"
    }));
      // Message sent to losers
      /*for (let index = 0; index < session.players.length; index++) {
        var element = session.players[index];
        if (element.ws == winner.ws){
          element.score = element.score + 1;
          element.ws.send(JSON.stringify({
            "type" : "win",
            "status" : "Wel done you are slightly above averagre compared to the rest"
          }));
        }
        else{
          element.ws.send(JSON.stringify({
            "type" : "lose",
            "status" : "Mission failed.. We'll get them next time troops"
          }));
        }
      }*/
  }
}

function startGame(ws, sessionId){
  const session = findSession(ws,sessionId)
  if(session){
    session.locked = true;
    for (let index = 0; index < session.players.length; index++) {
      var element = session.players[index];
      element.ws.send(JSON.stringify({
        "type" : "start"
      }));
    }
  }
}

function readyUp(ws, sessionId){
  //var hostplayer;
  const session = findSession(ws,sessionId)
  if(session){
    var p = findPlayer(ws, session);
    p.isReady = true;
    if(checkAllReady(session)){
      const hostplayer = session.players.find((player) => player.isHost == true)
      if (hostplayer){
        hostplayer.ws.send(JSON.stringify({
          "type" : "allReady", 
          "status": true
        }));
      }
    }
    else{
      const hostplayer = session.players.find((player) => player.isHost == true)
      hostplayer.ws.send(JSON.stringify({
        "type" : "allReady",
        "status": false
      }));
    }
  }
}

function checkAllReady(session){
  let allReady = true
  for (let index = 0; index < session.players.length; index++) {
    var element = session.players[index];
    if (element.isHost == true) continue;
    if (element.isReady == false){
      return false
    }
  }
  return true;
}

function resetGame(ws, sessionId){
  const session = findSession(ws,sessionId)
  if(session){
    for (let index = 0; index < session.players.length; index++) {
      var element = session.players[index];
      //Set player alive prop to true
      element.alive = true
      element.ws.send(JSON.stringify({
        "type" : "reset"
      }));
    }
  }
}

function updateSensitivity(ws, sessionId, sensitivity){
  const session = findSession(ws,sessionId)
  if(session){
    for (let index = 0; index < session.players.length; index++) {
      var element = session.players[index];
      element.ws.send(JSON.stringify({
        "type" : "sensitivity",
        "status": sensitivity
      }));
    }
  }
}

function removePlayer(ws){
  
  for (let i=0; i<sessions.length; i++) {
    var ss = sessions[i];

    var p = findPlayer(ws, ss);

    if (p) {
      //killPlayer(ws, ss)
      ss.players.splice(ss.players.indexOf(p),1);
      checkGameOver(ss)
      return ss.sessionId;
    }
  }
}
/* ==========================================================
* Servers
============================================================= */
/* Express Server */

var currentJoin;

var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 8080

app.use(express.static('FrontEnd/'));
app.use(express.static(__dirname));

var server = http.createServer(app)
server.listen(port)

console.log("HTTP Server Listening On: %d", port)

var wss = new WebSocketServer({server: server})
console.log("Websocket Werver Created")

wss.on("connection", function(ws) {

  ws.on('message', function incoming(message) {
  

    const obj = JSON.parse(message);
    const type = obj.type;

    if (obj.type != "sensitivity") console.log('Websocket Received: %s', message);

    if (type == "join") {
      //console.log("Attempt join");

      var pppp = addPlayerToSession(ws, obj.sessionID.toUpperCase(), obj.isHost);
      if (!obj.isHost) pppp.username = obj.displayName;
      else pppp.username = "Host";

      if (_spectator) spectate(obj.sessionID.toUpperCase());
    }
    if (type == "start_game"){

      if (sessions.find((s) => s.sessionId === obj.sessionID.toUpperCase()).players.length > 1){

        startGame(ws, obj.sessionID.toUpperCase());
        
        ws.send(JSON.stringify({
          "type": "start_response",
          "status": "success"
        }));
      }
      else {
        ws.send(JSON.stringify({
          "type": "start_response",
          "status": "failed"
        }));

      }
    }
    if (type == "ready_up"){
      readyUp(ws, obj.sessionID.toUpperCase())
    }
    if (type == "lose") {
      killPlayer(ws, obj.sessionID.toUpperCase());
      if (_spectator) spectate(obj.sessionID.toUpperCase());
    }
    if (type == "reset") {
      resetGame(ws, obj.sessionID.toUpperCase())
      if (_spectator) spectate(obj.sessionID.toUpperCase());
    }
    if (type == "sensitivity"){
      updateSensitivity(ws, obj.sessionID.toUpperCase(), obj.sensitivity)
    }
    else if (type == "spectate") {
      _spectator = ws;
      spectate(obj.sessionID.toUpperCase());
    }
    
  });

  ws.on("close", function() {
    const sID = removePlayer(ws);
    if (_spectator && sID) spectate(sID.toUpperCase());
  });

})

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(express.static('FrontEnd/'));
app.use(express.static(__dirname));


app.post("/game/create",  function(request, response) {

  const count = request.body.playerCount;
  var sesID = generateSession(count);

  console.log("New Game with " + count + " Players Created: " + sesID);

  response.end(JSON.stringify({
    "sessionID" : sesID
  }));
  
});

app.post("/game/join",  function(request, response) {

  console.log(request.body);

  var sesID = request.body.sessionID;
  //var displayName = request.body.displayName;
  sesID = sesID.toUpperCase();
  //console.log("searching " + sesID);
  const session = findSessionHttp(sesID);

  if (session) {
    if (session.maxPlayerCount > session.players.length){
      response.end(JSON.stringify({
        "status" : "success"
      }));
    }
    else if (session.locked == true) {
      response.end(JSON.stringify({
        "status" : "locked"
      }));
    }
    else{
      response.end(JSON.stringify({
        "status" : "session_full"
      }));
    }
  }
  else {
    response.end(JSON.stringify({
      "status" : "failed"
    }));
  }
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});