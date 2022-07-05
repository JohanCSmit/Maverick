document.body.style.background = 'green';
var accNorm = 0
var gyroNorm = 0
var track

var _socket = localStorage.getItem("socket");

function dead()
{
    document.body.style.background = 'red';
    window.removeEventListener("devicemotion", handleMotion)
    window.removeEventListener("deviceorientation", handleOrientation);
    track.applyConstraints({advanced: [{torch: false}]});
    document.getElementById("header").innerText = "You lost";
    window.navigator.vibrate(750);

    _socket.send(JSON.stringify({
        "type": "lose",
        "sessionID" : SessionID
    }));
}

function requestPermissions()
{
    alert("Put your phone on vibrate if you want vibration feedback")

    if(typeof DeviceOrientationEvent.requestPermission === "function")
        DeviceOrientationEvent.requestPermission();

    //Test browser support
    const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

    if (SUPPORTS_MEDIA_DEVICES) {
    //Get the environment camera (usually the second one)
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

    if(accNorm >= 5)
        dead();
}

function handleOrientation(event)
{
    updateFieldIfNotNull('Orientation_a', event.alpha);
    updateFieldIfNotNull('Orientation_b', event.beta);
    updateFieldIfNotNull('Orientation_g', event.gamma);

    // if(Math.abs(90 - event.beta) >= 20)
    //     dead();
}