function handleOrientation(event) {
    updateFieldIfNotNull('Orientation_a', event.alpha);
    updateFieldIfNotNull('Orientation_b', event.beta);
    updateFieldIfNotNull('Orientation_g', event.gamma);
    incrementEventCount();
}

function incrementEventCount() {
    let counterElement = document.getElementById("num-observed-events")
    let eventCount = parseInt(counterElement.innerHTML)
    counterElement.innerHTML = eventCount + 1;
}

function updateFieldIfNotNull(fieldName, value, precision = 10) {
    if (value != null)
        document.getElementById(fieldName).innerHTML = value.toFixed(precision);
}

function handleMotion(event) {
    alert(event.acceleration.x);
    // updateFieldIfNotNull('Accelerometer_gx', event.accelerationIncludingGravity.x);
    // updateFieldIfNotNull('Accelerometer_gx', event.accelerationIncludingGravity.y);
    // updateFieldIfNotNull('Accelerometer_gx', event.accelerationIncludingGravity.z);

    // updateFieldIfNotNull('Accelerometer_gx', event.acceleration.x);
    // updateFieldIfNotNull('Accelerometer_gx', event.acceleration.y);
    // updateFieldIfNotNull('Accelerometer_gx', event.acceleration.z);

    // updateFieldIfNotNull('Accelerometer_gx', event.interval, 2);

    // updateFieldIfNotNull('Accelerometer_gx', event.rotationRate.alpha);
    // updateFieldIfNotNull('Accelerometer_gx', event.rotationRate.beta);
    // updateFieldIfNotNull('Accelerometer_gx', event.rotationRate.gamma);
    // incrementEventCount();
}

// let is_running = false;
let demo_button = document.getElementById("button");
alert("Hello");

demo_button.onclick = function(e) {
    e.preventDefault();
    alert("Clicked");

    // Request permission for iOS 13+ devices
    if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission();
    }
    window.addEventListener("devicemotion", handleMotion, true);


    // window.addEventListener("devicemotion", function() {
    //     handleMotion();
    // });
    // window.addEventListener("devicemotion", handleMotion);
    // window.addEventListener("deviceorientation", handleOrientation);


};
// window.addEventListener("click", alert("HERE"));
// window.addEventListener("click", function() {
//     this.alert("HERE");
// });