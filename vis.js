document.body.style.background = 'hsl(241,100%,50%)';

const green = 120;
var frame = 0;
var threshold = 5;

function changeGradient(acceleration, minValue, maxValue) {

    grad = Math.abs((acceleration / maxValue) * green - green);
    console.log(grad);

    document.body.style.background = `hsl(${grad},100%,50%)`;

}
renderFrame();

function renderFrame() {
    requestAnimationFrame(renderFrame);
    frame = frame + 1;
    changeGradient((frame / 50) % 6, 0, threshold);

}