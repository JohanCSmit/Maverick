var _sessionID;
var _socket;

var debug = true; 

var _host;

const maxPlayers = 5;
const minPlayers = 2;

function clickCreateGame() {

    var count = document.getElementById("numPlayersCreate").value;
    //Check if IOS then dont continue
    var name = navigator.appVersion;
    var device = name.substring(name.indexOf("(")+1, name.indexOf(";"));
    
    if (count == ""){
         document.getElementById("CreateGameError").value = "Field cannot be empty";
    }else if (count > maxPlayers) {
        document.getElementById("CreateGameError").value = `Max players ${maxPlayers}`;
    }else if (count < minPlayers){
        document.getElementById("CreateGameError").value = `Min players ${minPlayers}`;
    }else if (device.toLowerCase() == "iphone" || device.toLowerCase() == "ipad"){
        alert("Hosting a game on Apple devices is not yet supported");
    }else{
        console.log(count);
        createGame(count);
    }
}

function createGame(pCount){

    //alert("Creating: " + pCount);

    var data = "playerCount="+pCount;

    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        //console.log(this.responseText);
        var obj = JSON.parse(this.responseText);
        //alert(obj.sessionID);
        _sessionID = obj.sessionID;
        //joinGame(obj.sessionID);
        localStorage.setItem("sessionID", obj.sessionID);
        localStorage.setItem("isHost", "true");

        if (debug) host = window.location.replace("http://localhost:8080/FrontEnd/HTML/Game.html");
        else host = window.location.replace("https://gentle-scrubland-69667.herokuapp.com/FrontEnd/HTML/Game.html");

    }
    });

    if (debug) _host = "http://localhost:8080";
    else _host = "https://gentle-scrubland-69667.herokuapp.com";

    xhr.open("POST", _host +"/game/create", false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(data);
}

function clickJoinGame() {
    var sessionID = document.getElementById("sessionID").value;
    
    if (sessionID.trim() == ""){
        document.getElementById("error").value = "Field cannot be empty";
        return;
   }
    _sessionID = sessionID;

    var data = "sessionID="+sessionID;

    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
            //alert(sessionID);
            var obj = JSON.parse(this.responseText);
            if (obj.status == "success") {
                localStorage.setItem("sessionID", sessionID);

                if (debug) host = window.location.replace("http://localhost:8080/FrontEnd/HTML/Game.html");
                else host = window.location.replace("https://gentle-scrubland-69667.herokuapp.com/FrontEnd/HTML/Game.html");
            }
            else if (obj.status == "session_full"){
                alert("Game is Full");
            }
            else if (obj.status == "locked"){
                alert("Game is already in session!");
            }
            else {
                alert("Session Not Found!");
            }
            
        }
    });

    if (debug) _host = "http://localhost:8080";
    else _host = "https://gentle-scrubland-69667.herokuapp.com";

    xhr.open("POST", _host +"/game/join", false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    console.log(data);
    xhr.send(data);

    
    //joinGame(sessionID);
}

function joinGame(sessionID){

    //alert("Joining");

    var host;

    if (debug) host = location.origin.replace(/^http/, 'ws')
    else host = location.origin.replace(/^http/, 'ws')

    _socket = new WebSocket(host);

    _socket.onopen = function() {
        let isHost = false
        
        if (localStorage.getItem("isHost")){
            isHost = true
            localStorage.removeItem("isHost")
        }
                    
        var obj = {
            "type": "join",
            "sessionID": sessionID,
            "isHost": isHost
        }

        _socket.send(JSON.stringify(obj));
    }

    function setAllReady(allReady){
        if(_isHost){
            if(allReady){
                _AllReady = allReady
                document.getElementById("startGameButton").disabled = false;
            }
        }
    }

    _socket.onmessage = function(message) {
        const obj = JSON.parse(message.data);
        const type = obj.type;

        if (obj.type == "isHost") {
            
            _isHost = obj.status
            document.getElementById("PreGame").hidden = false;
            document.getElementById("PreGameHost").hidden = true;
        }

        if (obj.type == "win") winning();

        if (obj.type == "start") startSensors();

        if (obj.type == "reset") reset();

        if (obj.type == "sensitivity") updateSensitivity(obj.status);

        if (obj.type == "allReady") setAllReady(obj.status)
    }

    _socket.onclose = function() {
        console.log("Socket closed");
        _socket.send(JSON.stringify({
            "type": "close"
        }));
    }
}

function dieSim() {

    _socket.send(JSON.stringify({
        "type": "lose",
        "sessionID" : localStorage.getItem("sessionID")
    }));
  }

function startGame(){
    if (_isHost == true){
        if(_AllReady == true){
            _socket.send(JSON.stringify({
                "type": "start_game",
                "sessionID" : localStorage.getItem("sessionID")
            }));
        }
        else{

        }
    }
    else{
        _socket.send(JSON.stringify({
            "type": "ready_up",
            "sessionID" : localStorage.getItem("sessionID")
        }));
    }

    requestPermissions()
}

function sendSensitivity(sensitivity){
    _socket.send(JSON.stringify({
        "type": "sensitivity",
        "sensitivity" : sensitivity,
        "sessionID" : localStorage.getItem("sessionID")
    }));
}

function sendResetRequest(){
    if(_isHost){
        _socket.send(JSON.stringify({
            "type": "reset",
            "sessionID" : localStorage.getItem("sessionID")
        }));
    }
}