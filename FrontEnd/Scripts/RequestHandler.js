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
        joinGame(obj.sessionID);
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
    joinGame(sessionID);
}

function joinGame(sessionID){

    //alert("Joining");

    var host;

    if (debug) host = location.origin.replace(/^file/, 'ws') + "localhost:8080"
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
    }

    localStorage.setItem("socket", _socket);
}