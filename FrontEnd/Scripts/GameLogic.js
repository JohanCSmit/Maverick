//Events
//0: Only acc based on sensitivity
//1: Acc on 1.5xSens, and 40 deg tilt
var eventNum = 0

var accNorm = 0
var gyroNorm = 0
var track

var canRead = true;

var noIOS = true;

var gradient = ['#83ff00', '#a9b400', '#fefe33', '#ff0f00', '#d75c00']
var sensitivity = 8
var baseSense = 8

document.body.style.background = 'hsl(120,100%,50%)';
const green = 120;

function changeGradient(acceleration, minValue, maxValue) {

    grad = Math.abs((acceleration / maxValue) * green - green);

    document.body.style.background = `hsl(${grad},100%,50%)`;

}

function dead()
{
    dieSim();

    canRead = false;

    if (_isHost) document.getElementById("PostGameHost").style = "display: show";
    else document.getElementById("PostGame").style = "display: show";

    document.body.style.background = 'hsl(0,100%,50%)';

    //window.removeEventListener("devicemotion", handleMotion)
    //window.removeEventListener("deviceorientation", handleOrientation);

    //IOS compatibility
    if(noIOS)
    {
        track.applyConstraints({advanced: [{torch: false}]});    
        window.navigator.vibrate(750);
    }

    // If player died and is Host make reset button visible 

    //Exit fullscreen mode
    //if (document.exitFullscreen)
        //document.exitFullscreen();
    //else if (document.webkitExitFullscreen)
    //    document.webkitExitFullscreen();

}

function updateSensitivity(inSens)
{
    sensitivity = inSens*baseSense;
    //console.log(inSens)
}

function reset(){
    if (_isHost) resetMusic();
    document.body.style.background = 'hsl(120,100%,50%)';

    eventNum = 0
    accNorm = 0
    gyroNorm = 0

    gradient = ['#83ff00', '#a9b400', '#fefe33', '#ff0f00', '#d75c00']
    sensitivity = 8
    baseSense = 8
    
    //Hide notification div
    if (_isHost) document.getElementById("PostGameHost").style = "display: none";
    else document.getElementById("PostGame").style = "display: none";
   
    // Restart sensors
    //startSensors();
    if (_isHost) musicHandler();
    canRead = true;

}

function winning(){

    if (_isHost) document.getElementById("PostGameHost").style = "display: show";
    else document.getElementById("PostGame").style = "display: show";

    canRead = false;

    //Remove previous event listeners
    //window.removeEventListener("devicemotion", handleMotion)
    //window.removeEventListener("deviceorientation", handleOrientation);

    // If player died and is Host make reset button visible 
    /*if(_isHost){
        document.getElementById("PostGameHost").hidden = "false";
        document.getElementById("PostGameMessageHost").textContent = "You Lost"
     }
     else{
         document.getElementById("PostGame").hidden = "false";
         document.getElementById("PostGameMessage").textContent = "You Lost"
     }*/
}

function requestPermissions()
{
    //IOS Compatibility
    if(noIOS)
    {
        //alert("Put your phone on vibrate if you want vibration feedback")

        //Test browser support for flashlight
        const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;
        if (SUPPORTS_MEDIA_DEVICES) {
        //Get the environment camera
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const cameras = devices.filter((device) => device.kind === 'videoinput');

            if (cameras.length === 0)
                throw 'No camera found on this device.';
                
            const camera = cameras[cameras.length - 1];

            // Create stream and get video track
            navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: camera.deviceId,
                facingMode: ['user', 'environment'],
                height: {ideal: 1080},
                width: {ideal: 1920}
            }
            }).then(stream => {
                track = stream.getVideoTracks()[0];
                track.applyConstraints({advanced: [{torch: true}]});
            });
        });
    }

    //Motion permissions on IOS
    if(typeof DeviceOrientationEvent.requestPermission === "function")
        DeviceOrientationEvent.requestPermission();

    //Make the game fullscreen
    var elem = document.documentElement;
    if (elem.requestFullscreen)
        elem.requestFullscreen();
    //else if (elem.webkitRequestFullscreen)
    //    elem.webkitRequestFullscreen();
    } 

    //Take away request permission button
    document.getElementById("reqPerm").style.display="none";

}

function startSensors(){
    setTimeout(function(){
        console.log("Sensors Started");
        window.addEventListener("devicemotion", handleMotion)
        window.addEventListener("deviceorientation", handleOrientation)

        if (_isHost) musicHandler()
    }, 1000);
}

function updateFieldIfNotNull(fieldName, value, precision=10)
{
    if (value != null)
        document.getElementById(fieldName).innerHTML = value.toFixed(precision);
}

function handleMotion(event)
{
    if (canRead) {
        updateFieldIfNotNull('Accelerometer_x', event.acceleration.x);
        updateFieldIfNotNull('Accelerometer_y', event.acceleration.y);
        updateFieldIfNotNull('Accelerometer_z', event.acceleration.z);
        accNorm = Math.sqrt(Math.pow(event.acceleration.x,2) + Math.pow(event.acceleration.y,2) + Math.pow(event.acceleration.z,2));
        updateFieldIfNotNull('Accelerometer_norm', accNorm);

        updateFieldIfNotNull('Gyroscope_z', event.rotationRate.alpha);
        updateFieldIfNotNull('Gyroscope_x', event.rotationRate.beta);
        updateFieldIfNotNull('Gyroscope_y', event.rotationRate.gamma);
        gyroNorm = Math.sqrt(Math.pow(event.rotationRate.alpha,2) + Math.pow(event.rotationRate.beta,2) + Math.pow(event.rotationRate.gamma,2));
        updateFieldIfNotNull('Gyroscope_norm', gyroNorm);

        changeGradient(accNorm, 0, sensitivity);

        if(eventNum === 0)
            if(accNorm >= sensitivity)
                dead();
        else if(eventNum === 1)
            if(accNorm >= sensitivity*1.5)
                dead();
    }
}

function handleOrientation(event)
{
    updateFieldIfNotNull('Orientation_a', event.alpha);
    updateFieldIfNotNull('Orientation_b', event.beta);
    updateFieldIfNotNull('Orientation_g', event.gamma);

    if(eventNum === 1)
    {
        var diff = Math.abs(90 - event.beta);
        if(diff >= 40)
            dead();
        else if(diff >= 30)
            document.body.style.background = gradient[3];
        else if(diff >= 20)
            document.body.style.background = gradient[2];
        else if(diff >= 10)
            document.body.style.background = gradient[1];
        else
            document.body.style.background = gradient[0];
    }
}

var countDownAudio, mainAudio, currentTime, startTime;

function resetMusic() {
    countDownAudio.pause();
    mainAudio.pause();
}

function musicHandler(){
    
        
        countDownAudio = new Audio();
        countDownAudio.src = 'https://res.cloudinary.com/dtd0lxvsg/video/upload/v1657094095/321Kratos_ncov62.mp3';
        document.body.appendChild(countDownAudio);
        
        mainAudio = new Audio();
        mainAudio.src = 'https://res.cloudinary.com/dtd0lxvsg/video/upload/v1657093868/DustCropped_lyk92b.mp3';
        document.body.appendChild(mainAudio);

        //mainAudio.play();
        mainAudio.autoplay = true;
        countDownAudio.autoplay = true;
        
        var running = false;
        var mainAudioPlaying = false;
        var startTime;
        var currentTime;
        var playBackRate = 1;
        var timer = 0;
        var today = new Date();
        
        function modifyTimer()
        {
            var today = new Date();
            currentTime = today.getMinutes() * 60 + today.getSeconds();
            if (currentTime - startTime > 0 & mainAudioPlaying) //we only want to change the time if it is at least 1 second
                timer = timer + 1;
            startTime = currentTime; //resets the time
        }
            
        if (!running)
        {
            running = true;
            startTime = today.getMinutes() * 60 + today.getSeconds();
            countDownAudio.play();
    
            function renderFrame()
            {
                if (running)
                {
                    //console.log(timer);
                    requestAnimationFrame(renderFrame);
                    modifyTimer();
                    // elapsedTime = Math.trunc((currentTime - startTime) % mainAudio.duration);
                    //console.log(timer);
                    switch (timer)
                    {
                        case 13:
                            playBackRate = 1.2;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 18:
                            playBackRate = 1;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 28:
                            playBackRate = 0.8;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 34:
                            playBackRate = 1;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 40:
                            playBackRate = 1.4;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 46:
                            playBackRate = 1;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 49:
                            playBackRate = 0.6;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 55:
                            playBackRate = 1;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 67:
                            playBackRate = 1.3;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break;
                        case 73:
                            playBackRate = 1;
                            mainAudio.playbackRate = playBackRate;
                            sendSensitivity(playBackRate);
                            break
                    }
                    //console.log("Here2")
                    //console.log(playBackRate);
                }
            }
            renderFrame();
        }
        else
        {
            mainAudio.pause();
            mainAudioPlaying = false;
            running = false;
        }
        
        mainAudio.onended = function() {
            mainAudio.play();
        }
        
        countDownAudio.onended = function() {
            mainAudioPlaying = true;
            mainAudio.play();
        }
}