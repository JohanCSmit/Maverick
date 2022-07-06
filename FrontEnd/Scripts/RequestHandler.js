var _sessionID;
var _socket;

var debug = true;

var _host;

function clickCreateGame() {
    var count = document.getElementById("numPlayersCreate").value;
    console.log(count);
    createGame(count);
}

function createGame(pCount){

    //alert("Creating: " + pCount);

    var data = "playerCount="+pCount;

    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        console.log(this.responseText);
        var obj = JSON.parse(this.responseText);
        //alert(obj.sessionID);
        _sessionID = obj.sessionID;
        //joinGame(obj.sessionID);
        localStorage.setItem("sessionID", obj.sessionID);

        if (debug) host = window.location.replace("http://localhost:8080/FrontEnd/HTML/HostWait.html");
        else host = window.location.replace("https://gentle-scrubland-69667.herokuapp.com/FrontEnd/HTML/HostWait.html");

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
    _sessionID = sessionID;

    //alert(sessionID);
    localStorage.setItem("sessionID", sessionID);

    if (debug) host = window.location.replace("http://localhost:8080/FrontEnd/HTML/Game.html");
    else host = window.location.replace("https://gentle-scrubland-69667.herokuapp.com/FrontEnd/HTML/Game.html");
    //joinGame(sessionID);
}

function joinGame(sessionID){

    //alert("Joining");

    var host;

    if (debug) host = location.origin.replace(/^http/, 'ws')
    else host = location.origin.replace(/^http/, 'ws')

    console.log(host);

    _socket = new WebSocket(host);

    _socket.onopen = function() {
                    
        var obj = {
            "type": "join",
            "sessionID": sessionID
        }

        _socket.send(JSON.stringify(obj));
    }

    _socket.onmessage = function(message) {
        const obj = JSON.parse(message.data);
        const type = obj.type;
        console.log(obj);

        if (obj.type == "win") alert("you won!!!");
    }

    //localStorage.setItem("socket", JSON.stringify(_socket));

    
    
    
}

function start() {
    if (debug) host = window.location.replace("http://localhost:8080/FrontEnd/HTML/Game.html");
    else host = window.location.replace("https://gentle-scrubland-69667.herokuapp.com/FrontEnd/HTML/Game.html");
}

function dieSim() {
    //var _socket = JSON.parse(localStorage.getItem("socket"));

    _socket.send(JSON.stringify({
        "type": "lose",
        "sessionID" : localStorage.getItem("sessionID")
    }));
  }