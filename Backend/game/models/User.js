class User {
    constructor(socket){
        this.socket = socket
        this.alive = true
    }

    kill(){
        this.alive = false
    }
}