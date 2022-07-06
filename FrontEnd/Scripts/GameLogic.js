//Events
//0: Only acc based on sensitivity
//1: Acc on 1.5xSens, and 40 deg tilt
var eventNum = 0

var accNorm = 0
var gyroNorm = 0
var track
var noIOS = true
var gradient = ['#83ff00', '#a9b400', '#fefe33', '#ff0f00', '#d75c00']
var sensitivity = 5

document.body.style.background = gradient[0];

function dead()
{
    document.body.style.background = gradient[4];
    window.removeEventListener("devicemotion", handleMotion)
    window.removeEventListener("deviceorientation", handleOrientation);

    //IOS compatibility
    if(noIOS)
    {
        track.applyConstraints({advanced: [{torch: false}]});    
        window.navigator.vibrate(750);
    }

    document.getElementById("header").innerText = "You lost";

    //Exit fullscreen mode
    if (document.exitFullscreen)
        document.exitFullscreen();
    else if (document.webkitExitFullscreen)
        document.webkitExitFullscreen();

	dieSim();
}

function requestPermissions()
{
    //IOS Compatibility
    if(noIOS)
    {
        alert("Put your phone on vibrate if you want vibration feedback")

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

        // Create the root video element
        var video = document.createElement('video');
        video.setAttribute('loop', '');
        video.setAttribute('style', 'position: fixed;');

        // A helper to add sources to video
        function addSourceToVideo(element, type, dataURI) {
            var source = document.createElement('source');
            source.src = dataURI;
            source.type = 'video/' + type;
            element.appendChild(source);
        }
        var base64 = function(mimeType, base64) {
            return 'data:' + mimeType + ';base64,' + base64;
        };

        // Add fake source and video
        addSourceToVideo(video,'webm', base64('video/webm', 'GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA='));
        addSourceToVideo(video, 'mp4', base64('video/mp4', 'AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw=='));
        document.body.appendChild(video);
        video.play();
    }

    //Motion permissions on IOS
    if(typeof DeviceOrientationEvent.requestPermission === "function")
        DeviceOrientationEvent.requestPermission();

    //Make the game fullscreen
    var elem = document.documentElement;
    if (elem.requestFullscreen)
        elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen)
        elem.webkitRequestFullscreen();
    } 

    //Take away request permission button
    document.getElementById("reqPerm").style.display="none";

    //Wait for flashlight to turn on
    setTimeout(function(){
        window.addEventListener("devicemotion", handleMotion)
        window.addEventListener("deviceorientation", handleOrientation)
    }, 1000);
}

function updateFieldIfNotNull(fieldName, value, precision=10)
{
    if (value != null)
        document.getElementById(fieldName).innerHTML = value.toFixed(precision);
}

function handleMotion(event)
{
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

    if(eventNum === 0)
        if(accNorm >= sensitivity)
            dead();
    else if(eventNum === 1)
        if(accNorm >= sensitivity*1.5)
            dead();
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