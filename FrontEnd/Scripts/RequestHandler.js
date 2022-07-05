var _sessionID;
var _socket;

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

    xhr.open("POST", "http://localhost:8080/game/create", false);
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
    _socket = new WebSocket("ws://localhost:8080");

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