class Session {
    constructor(sessionId, socketsCount){
        this.sessionId = sessionId
        this.userCount = socketsCount
        this.users = []
    }

    AddUser(socket){
        if(this.userCount >= this.users.length){
            user = new User

            this.users.push(socket)
        }
        else{
            // nReturn lobby full
        }
    }

    KillUser(socket){
        var curUser = this.users.find((user) => user.socket == socket)
    }


}