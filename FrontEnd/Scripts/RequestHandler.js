var _sessionID;
var _socket;

var debug = false;

var _host;

var _isHost = false;

function clickCreateGame() {
    var count = document.getElementById("numPlayersCreate").value;
    createGame(count);
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

function startGame(){
    if (_isHost){
        //console.log("Host Started Game");
        _socket.send(JSON.stringify({
            "type": "start_game",
            "sessionID" : localStorage.getItem("sessionID")
        }));
    }

    requestPermissions()
}

function clickJoinGame() {
    var sessionID = document.getElementById("sessionID").value;
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

    _socket.onmessage = function(message) {
        const obj = JSON.parse(message.data);
        const type = obj.type;
        //console.log(obj);

        if (obj.type == "isHost") _isHost = true;

        if (obj.type == "win") alert("you won!!!");

        if (obj.type == "start") startSensors();

        if (obj.type == "sensitivity") updateSensitivity(obj.type);
    }

    _socket.onclose = function() {
        _socket.send(JSON.stringify({
            "type": "close"
        }));
    }

    //localStorage.setItem("socket", JSON.stringify(_socket));

    
    
    
}

// function start() {
//     localStorage.setItem("isHost", true)

//     if (debug) host = window.location.replace("http://localhost:8080/FrontEnd/HTML/Game.html");
//     else host = window.location.replace("https://gentle-scrubland-69667.herokuapp.com/FrontEnd/HTML/Game.html");
// }

function dieSim() {
    //var _socket = JSON.parse(localStorage.getItem("socket"));

    _socket.send(JSON.stringify({
        "type": "lose",
        "sessionID" : localStorage.getItem("sessionID")
    }));
  }

function sendSensitivity(sensitivity){
    _socket.send(JSON.stringify({
        "type": "sensitivity",
        "sensitivity" : sensitivity,
        "sessionID" : localStorage.getItem("sessionID")
    }));
}