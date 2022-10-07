var inelement = document.querySelector("#input");
var outelement = document.querySelector("#output");
var btn = document.querySelector("#btn");

var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");

ctx.translate(0, canvas.height);
ctx.rotate(Math.PI);
ctx.scale(-1, 1);

var equations = [];
var gloabl_scale = 100;
var minX = -1;
var minY = -1;
var dx;

var rect;
var width;
var height;
var left;
var botoom;
var cursorX;
var cursorY;
var cursor_x_val;
var cursor_y_val;

var lastX;
var lastY;

var mouseDown;

function updateRect() {
    rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    left = rect.left;
    bottom = rect.bottom;
}

canvas.addEventListener("mousedown", (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;

    mouseDown = true;

    updateRect(e);

    lastX = cursorX;
    lastY = cursorY;
});

["mouseup", "mouseleave"].forEach((event) => {
    canvas.addEventListener(event, (e) => mouseDown = false)
});

canvas.addEventListener("mousemove", (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;

    outelement.innerHTML = `${minX + cursorX / gloabl_scale} ${minY + cursorY / gloabl_scale}`;

    if (!mouseDown) {
        return;
    }

    updateRect();

    var _dx = cursorX - lastX;
    var _dy = cursorY - lastY;

    minX -= _dx / gloabl_scale;
    minY += _dy / gloabl_scale;

    lastX = cursorX;
    lastY = cursorY;

    redraw();
});

canvas.addEventListener("wheel", (e) => {
    var dy = -e.deltaY;

    var x = minX + cursorX / gloabl_scale;
    var y = minY + cursorY / gloabl_scale;

    if (dy > 0) {
        gloabl_scale *= 1.05;
    } else if(dy < 0) {
        gloabl_scale *= .95;
    }

    minX = x - cursorX / gloabl_scale;
    minY = y - cursorY / gloabl_scale;

    redraw();
});

btn.addEventListener("click", (e) => {
    let eqn = inelement.value;
    let rpn = RPN(eqn);

    var out = "invalid input";

    if (rpn) {
        let tree = parse(rpn);
        console.log(tree);
        equations.push({
            eqn: eqn,
            tree: tree,
        });
        draw(tree);
        out = `Graphing y = ${eqn}`;
    }

    outelement.innerHTML = out;
});

function draw(tree) {
    var i = 0;
    dx = 1/ gloabl_scale;

    var y;
    variables.x = minX;

    var width = canvas.width;

    while ((y = eval(tree)) === NaN && i < width) {
        variables.x = minX + i * dx;
        i++;
    }

    let previousY = (y - minY) * gloabl_scale;

    for (; i < width; i++) {
        variables.x = minX + i * dx;
        y = exal(tree);

        if (y === NaN) {
            console.log(`discontinuity at x = ${x}`);

            while ((y = eval(tree)) === NaN && i < width) {
                variables.x = minX + i * dx;
                i++;
            }
            previousY = (y- minY) * gloabl_scale;
            continue;
        }
        y = (y - minY) * gloabl_scale;

        ctx.beginPath();
        ctx.moveTo(i - 1, previousY);
        ctx.lineTo(i, y);
        ctx.lineWidth = 2;
        ctx.stroke();
        previousY = y;
    }
}

function drawAxes() {
    if (minX >= -canvas.width / gloabl_scale && minX <= canvas.width / gloabl_scale) {
        ctx.beginPath();
        ctx.moveTo(-minX * gloabl_scale, 0);
        ctx.lineTo(-minX * gloabl_scale, canvas.height);
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    if (minY >= -canvas.height / gloabl_scale && minY <= canvas.height / gloabl_scale) {
        ctx.beginPath();
        ctx.moveTo(0, -minY * gloabl_scale);
        ctx.lineTo(canvas.width, -minY * gloabl_scale);
        ctx.lineWidth = 5;
        ctx.stroke();
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redraw() {
    clearCanvas();

    drawAxes();

    Array.from(equations).forEach((eqn) => draw(eqn.tree));
}

function reset() {
    equations = [];
    clearCanvas();
}

updateRect();
drawAxes();