var countDownAudio, mainAudio, currentTime, startTime;

button = document.getElementById('button');

countDownAudio = new Audio();
countDownAudio.src = 'https://res.cloudinary.com/dtd0lxvsg/video/upload/v1657094095/321Kratos_ncov62.mp3';
document.body.appendChild(countDownAudio);


mainAudio = new Audio();
mainAudio.src = 'https://res.cloudinary.com/dtd0lxvsg/video/upload/v1657093868/DustCropped_lyk92b.mp3';
document.body.appendChild(mainAudio);

var running = false;
var mainAudioPlaying = false;
var startTime;
var currentTime;
var timer = 0;
var today = new Date();

function modifyTimer() {
    var today = new Date();

    this.currentTime = today.getMinutes() * 60 + today.getSeconds();

    if (this.currentTime - this.startTime > 0 & mainAudioPlaying) { //we only want to change the time if it is at least 1 second
        this.timer = this.timer + 1;
    }
    this.startTime = this.currentTime; //resets the time
}

button.onclick = function(e) {

    if (!running) {
        running = true;
        startTime = today.getMinutes() * 60 + today.getSeconds();
        running = true;
        countDownAudio.play();

        function renderFrame() {

            if (running) {
                requestAnimationFrame(renderFrame);
                modifyTimer();
                // elapsedTime = Math.trunc((currentTime - startTime) % mainAudio.duration);
                switch (timer) {
                    case 13:
                        mainAudio.playbackRate = 1.2;
                        break;
                    case 18:
                        mainAudio.playbackRate = 1;
                        break;

                    case 28:
                        mainAudio.playbackRate = 0.8;
                        break;

                    case 34:
                        mainAudio.playbackRate = 1;
                        break;

                    case 40:
                        mainAudio.playbackRate = 1.4;
                        break;

                    case 46:
                        mainAudio.playbackRate = 1;
                        break;

                    case 49:
                        mainAudio.playbackRate = 0.6;
                        break;

                    case 55:
                        mainAudio.playbackRate = 1;
                        break;

                    case 67:
                        mainAudio.playbackRate = 1.3;
                        break;

                    case 73:
                        mainAudio.playbackRatem = 1;
                        break
                }
                console.log(timer);
            }
        }
        renderFrame();

    } else {
        mainAudio.pause();
        mainAudioPlaying = false;
        running = false;

    }
}

mainAudio.onended = function() {
    mainAudio.play();
}

countDownAudio.onended = function() {
    mainAudioPlaying = true;
    mainAudio.play();
}