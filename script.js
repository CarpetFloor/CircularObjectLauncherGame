let c;
let r;
let w, h;

let debugMode = true;

let shiftOddRows = false;
const CIRCLES_MAX_COUNT_HORIZONTAL = 18;
const CIRCLES_STARTING_ROWS_COUNT = 9;
const CIRCLES_SPACING = 3;
let circleSize = -1;

window.onload = () => {
    c = document.querySelector("canvas");
    r = c.getContext("2d");
    w = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    h = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    c.width = w;
    c.height = h;

    // circleSize = (CIRCLES_MAX_COUNT_HORIZONTAL + CIRCLES_SPACING);
    circleSize = w / (((CIRCLES_MAX_COUNT_HORIZONTAL + 1) * 2) + CIRCLES_SPACING);

    launcherX = (w / 2) - (circleSize / 1) + CIRCLES_SPACING;
    launcherY = h - (circleSize * 1) + CIRCLES_SPACING;
    aimer.smallerSize = circleSize / 3;
    
    initCircles();
    
    c.addEventListener("mousemove", setMouseAngle);
    c.addEventListener("click", launch);
    window.setInterval(loop, 1000 / 60);
}

function offsetHex(hex, offset) {
    let red = parseInt("0x" + hex[1] + hex[2]) + offset;
    if(red < 0) {red = 0;}
    if(red > 255) {red = 255;}
    
    let green = parseInt("0x" + hex[3] + hex[4]) + offset;
    if(green < 0) {green = 0;}
    if(green > 255) {green = 255;}
    
    let blue = parseInt("0x" + hex[5] + hex[6]) + offset;
    if(blue < 0) {blue = 0;}
    if(blue > 255) {blue = 255;}

    return "#" + red.toString(16) + green.toString(16) + blue.toString(16);
}

/**
 * mouse angle only gets updated when mouse is moved, 
 * so if click to launch without ever moving mouse the 
 * mouse angle would never be set, so use movedMouse so 
 * that when click to launch function is called it will 
 * set mouse angle
 */
let movedMouse = false;
// 90 degrees, start by aiming straight up (for aimer only)
let mouseAngle = 1.5708;
let mouseXpos = false;
const LAUNCH_SPEED = 8;

let launcherX = -1;
let launcherY = -1;
let launched = {
    x: -1, 
    y: -1, 
    moveX: -1, 
    moveY: -1, 
    moving: false, 
    update: function() {
        this.x += this.moveX;
        this.y += this.moveY;

        // bounce off wall
        if((this.x > w - circleSize) || (this.x < circleSize)) {
            this.moveX *= -1;
        }

        drawCircle(this.x, this.y, 
            currentColor, circleSize);
        
        let collisionCheck = getCircleAt(this.x, this.y);
        this.moving = (collisionCheck == -1);

        if(!(this.moving)) {
            /**
             * the idea is check for collision, and if found then simply place 
             * the new circle directly below the collided. However, issues 
             * arise when a single tower is made and one of the middle 
             * circles is collided with: placing the new circle directly 
             * behind will place the new circle in a spot that already has 
             * a circle. So, instead have to check if the sport directly 
             * below is also a circle, and if it is, then place the new 
             * circle in the direction that is closer to where the circle 
             * was launched from
             */

            let insertRow = collisionCheck[0];
            let insertCol = collisionCheck[1];
            
            let x = collisionCheck[1] * (circleSize + CIRCLES_SPACING) * 2;
            let y = (collisionCheck[0] + 1) * (circleSize + CIRCLES_SPACING) * 2;

            
            let belowCheck = getCircleAt(x, y);
            if(belowCheck != -1) {
                if(launcherX > x) {
                    insertCol += 1;
                }
                else {
                    insertCol -= 1;
                }
            }

            
            addCircleAt(insertRow, insertCol, currentColor);
            currentColor = randomColor();
        }
    }
};

let aimer = {
    smallerSize: -1, 
    spacing: 23, 
    count: 3, 
    draw: function() {
        let x = launcherX;
        let y = launcherY;

        let firstMoveX = Math.cos(mouseAngle) * (circleSize / 1.75);
        let firstMoveY = Math.sin(mouseAngle) * (circleSize / 1.75);

        let moveX = Math.cos(mouseAngle) * this.spacing;
        let moveY = Math.sin(mouseAngle) * this.spacing;
        
        if(!(mouseXpos)) {
            firstMoveY *= -1;
            firstMoveX *= -1;
            moveY *= -1;
            moveX *= -1;
        }

        // main circle
        drawCircle(x, y, 
            currentColor, circleSize);

        x += firstMoveX;
        y += firstMoveY;

        let color = currentColor;

        for(let i = 0; i < this.count; i++) {
            x += moveX;
            y += moveY;

            color = offsetHex(color, -30);

            drawCircle(x, y, 
                color, this.smallerSize);
        }
    }   
}

let colors = {
    current: null, 
    bright: [
        "#F06292", "#9575CD", "#4FC3F7", "#81C784", "#FF8A65"
    ], 
    pastel: [
        "#F1948A", "#C39BD3", "#85C1E9", "#82E0AA", "#F5CBA7"
    ]
}
colors.current = colors.bright;
let currentColor = randomColor();

function randomColor() {
    let max = colors.current.length;
    let min = 0;

    return colors.current[Math.floor((Math.random() * (max - min)) + min)];
}

let circles = [];

function initCircles() {
    circles = [];

    for(let row = 0; row < CIRCLES_STARTING_ROWS_COUNT; row++) {
        let currentRow = [];
    
        for(let col = 0; col < CIRCLES_MAX_COUNT_HORIZONTAL; col++) {
            currentRow.push(randomColor());
        }

        circles.push(currentRow);
    }
}

function drawCircles() {
    let x = -1;
    let y = circleSize + CIRCLES_SPACING;

    for(let row = 0; row < circles.length; row++) {
        x = circleSize + CIRCLES_SPACING;
        
        if(row % 2 == 1 && shiftOddRows) {
            x += circleSize + CIRCLES_SPACING;
        }

        for(let col = 0; col < circles[row].length; col++) {
            if(circles[row][col] != -1) {
                drawCircle(
                    x, 
                    y, 
                    circles[row][col], 
                    circleSize
                );

                if(debugMode) {
                    r.fillStyle = "yellow";
                    r.fillRect(x - (10 / 2), y - (10 / 2), 10, 10);
                }
            }

            x += (circleSize * 2) + CIRCLES_SPACING;
        }

        y += (circleSize * 2) + CIRCLES_SPACING;
    }
}

function getDistance(fromX, fromY, toX, toY) {
    let xdiff = Math.abs(toX - fromX);
    let ydiff = Math.abs(toY - fromY);
    
    xdiff *= xdiff;
    ydiff *= ydiff;

    return Math.sqrt(xdiff + ydiff);
}

/**
 * returns [row, col] of circle object at position given, 
 * or -1 if no circle object is there
 */
function getCircleAt(x, y) {
    let space = (circleSize * 2) + CIRCLES_SPACING;
    let row = Math.floor(y / space);

    if((row < 0) || (row > circles.length - 1)) {
        return -1;
    }

    let smallest = -1;
    let closestCol = -1;

    for(let col = 0; col < circles[row].length; col++) {
        let distance = getDistance(
            col * space, 
            row * space, 
            x, 
            y, 
        );

        console.log(col, distance)

        if((distance < (smallest - 5)) || (smallest == -1)) {
            smallest = distance;
            closestCol = col;
        }
    }

    if(circles[row][closestCol] == -1) {
        return -1;
    }

    return [row, closestCol];
}

function addCircleAt(row, col, color) {
    let actualRow = row + 1;

    if(actualRow >= circles.length) {
        let addedRow = [];

        for(let i = 0; i < circles[0].length; i++) {
            addedRow.push(-1);
        }

        circles.push(addedRow);
    }

    
    circles[actualRow][col] = color;
}

function setMouseAngle(e) {
    movedMouse = true;
    let xdiff = e.offsetX - launcherX;
    let ydiff = e.offsetY - launcherY;

    mouseXpos = xdiff > 0;
    
    mouseAngle = Math.atan(ydiff / xdiff);
}

function launch(e) {
    // don't allow launching ball to horizontal to prevent bouncing back and forth horizontally
    if(!(launched.moving) && (e.offsetY < h - 100)) {
        launched.moving = true;
        let debug = getCircleAt(e.offsetX, e.offsetY);

        if(!(movedMouse)) {
            launched.x = launcherX;
            launched.y = launcherY;
            
            launched.moveX = 0;
            launched.moveY = 0 - LAUNCH_SPEED;
        }
        else {
            launched.x = launcherX;
            launched.y = launcherY;
            
            launched.moveX = Math.cos(mouseAngle) * LAUNCH_SPEED;
            launched.moveY = Math.sin(mouseAngle) * LAUNCH_SPEED;
            
            if(!(mouseXpos)) {
                launched.moveX *= -1;
                launched.moveY *= -1;
            }

            // if pointing directly up, moveY will be negative
            if(launched.moveY >= 0) {
                launched.moveY = 0 - LAUNCH_SPEED;
            }
        }
    }
}

let border = false;
const BORDER_COLOR_DIFF = 40;
const BORDER_SIZE = 2.5;
let borderStyle = 1;
function drawCircle(x, y, color, size) {
    r.fillStyle = color;
    r.beginPath();
    r.arc(x, y, 
        size, 
        0, 2 * Math.PI); 
    r.fill();

    if(border) {
        
        if(borderStyle == 0) {
            r.strokeStyle = offsetHex(color, 0 - BORDER_COLOR_DIFF);
            r.lineWidth = BORDER_SIZE;
        }
        else {
            r.strokeStyle = "Black"
            r.lineWidth = 3;
        }

        r.stroke();
        r.closePath();
    }

    r.closePath();
}

function loop() {
    let frameStart = Date.now();

    r.clearRect(0, 0, w, h);

    drawCircles();

    if(launched.moving) {
        launched.update();
    }
    // aiming
    else {
        aimer.draw();
    }

    if(debugMode) {
        r.fillStyle = "black";
        
        let x = launcherX;
        let y = launcherY;

        if(launched.moving) {
            x = launched.x;
            y = launched.y;
        }

        r.fillRect(
            x - (10 / 2), 
            y - (10 / 2), 
            10, 
            10
        );
    }

    let frameEnd = Date.now();
}