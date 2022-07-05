import"./Session.js"

export class SessionList {
    constructor(){
        sessions = []
    }

    AddSocketToSession(ws, sessionId){
        var curSession = this.sessions.find((session) => session.sessionId == sessionId)
        curSession.AddUser(ws)
        console.log(sessions)
    }

    AddSession(playerCount = 100){
        let sessionid = '1'
        //Implement ID System
        session = new Session(sessionid, playerCount)
        this.sessions.push(session)
        return sessionid
    }
}