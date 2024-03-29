let c;
let r;
let w, h;

let debugMode = false;
let drawRowCols = false;
let startWithBridge = false;
let smallerBridge = false;
let twoBridges = true;
let islandEdge = false;

let shiftOddRows = true;
const CIRCLES_MAX_COUNT_HORIZONTAL = 18;
const CIRCLES_STARTING_ROWS_COUNT = 9;
const CIRCLES_SPACING = 3;
let circleSize = -1;
let space;

let gameInterval;

let removeEffectImg = new Image();

window.onload = () => {
    removeEffectImg.src = "Images/RemoveEffect.png";

    c = document.querySelector("canvas");
    r = c.getContext("2d");
    w = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    h = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    c.width = w;
    c.height = h;

    // circleSize = (CIRCLES_MAX_COUNT_HORIZONTAL + CIRCLES_SPACING);
    circleSize = w / (((CIRCLES_MAX_COUNT_HORIZONTAL + 1) * 2) + CIRCLES_SPACING);
    space = (circleSize * 2) + CIRCLES_SPACING;

    launcherX = (w / 2) - (circleSize / 1) + CIRCLES_SPACING;
    launcherY = h - (circleSize * 1) - CIRCLES_SPACING;
    aimer.smallerSize = circleSize / 3;
    
    initCircles();
    
    // for debugging
    if(startWithBridge) {
        if(smallerBridge) {
            circles[8][7] = currentColor;
            circles[7][6] = currentColor;
            circles[7][5] = currentColor;
            circles[7][4] = currentColor;
            circles[8][5] = currentColor;

            if(twoBridges) {
                circles[8][7 + 10] = currentColor;
                circles[7][6 + 10] = currentColor;
                circles[7][5 + 10] = currentColor;
                circles[7][4 + 10] = currentColor;
                circles[8][5 + 10] = currentColor;
            }
        }
        else {
            circles[8][7] = currentColor;
            circles[7][6] = currentColor;
            circles[6][6] = currentColor;
            circles[6][5] = currentColor;
            circles[7][4] = currentColor;
            circles[8][5] = currentColor;

            if(twoBridges) {
                circles[8][7 + 10] = currentColor;
                circles[7][6 + 10] = currentColor;
                circles[6][6 + 10] = currentColor;
                circles[6][5 + 10] = currentColor;
                circles[7][4 + 10] = currentColor;
                circles[8][5 + 10] = currentColor;
            }
        }
    }
    if(islandEdge) {
        circles[8][17] = currentColor;
        circles[7][16] = currentColor;
        circles[6][16] = currentColor;
        circles[5][16] = currentColor;
        circles[4][17] = currentColor;
        circles[6][17] = currentColor;
    }

    c.addEventListener("mousemove", setMouseAngle);
    c.addEventListener("click", launch);
    gameInterval = window.setInterval(loop, 1000 / 60);
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
let mouseY = -1;
const LAUNCH_SPEED = 23;

function findNextAvailInsert(row, col) {
    let insertRow = row;
    let insertCol = col;

    ++insertRow;

    // make sure that when buliding single-width tower, it curves into center
    if((insertRow == circles.length - 1) && (circles[insertRow][insertCol] != -1)) {
        ++insertRow;

        if(launched.x > launcherX) {
            if(insertRow % 2 == 1) {
                --insertCol;
            }
        }
        else {
            if(insertRow % 2 == 0) {
                ++insertCol;
            }
        }
    }

    // incase aiming at same spot to make single-width tower, but hit not end
    if(insertRow < circles.length) {
        if(circles[insertRow][insertCol] != -1) {
            --insertRow;
        while(circles[insertRow][insertCol] != -1) {
            if(launched.x > launcherX) {
                --insertCol;
            }
            else {
                ++insertCol;
            }

            if(circles[insertRow][insertCol] != -1) {
                ++insertRow;
            }
        }
        }
    }

    return [insertRow, insertCol];
}

let launcherX = -1;
let launcherY = -1;
let showLauncherCircle = true;

let launched = {
    x: -1, 
    y: -1, 
    moveX: -1, 
    moveY: -1, 
    moving: false, 
    previousRow: -1, 
    previousCol: -1, 
    canLaunch: true, 
    update: function() {
        drawCircle(this.x, this.y, 
            currentColor, circleSize);
        
        this.x += this.moveX;
        this.y += this.moveY;

        // bounce off wall
        if((this.x > w - circleSize) || (this.x < circleSize)) {
            this.moveX *= -1;
        }
        
        let collisionCheck = getCircleAt(this.x, this.y);

        if(debugMode) {
            console.log(collisionCheck)
        }
        
        this.moving = (collisionCheck == -1);

        if(!(this.moving)) {
            console.log("collided with ", collisionCheck[0], collisionCheck[1]);
            console.log("previous", this.previousRow, this.previousCol);
            if(drawRowCols) {
                console.log("collided with ", collisionCheck[0], collisionCheck[1]);
            }

            // let insertAt = findNextAvailInsert(collisionCheck[0], collisionCheck[1]);
            // addCircleAt(insertAt[0], insertAt[1], currentColor);

            let insertRow = this.previousRow;
            if(insertRow < circles.length + 1) {
                if(circles[insertRow - 1][this.previousCol] == -1) {
                    --insertRow;
                }
            }

            nonEmptyBefore = getNonEmptyCount();
            
            addCircleAt(insertRow, this.previousCol, currentColor);
        }

        this.previousRow = getRow(this.y);
        this.previousCol = getCol(this.previousRow, this.x);
    }, 
    finishedLaunch: function() {
        checkForIslands();
    }, 
    finishedIslandCheck: function() {
        effectsFinished = true;
        nonEmptyAfter = getNonEmptyCount();
        updateScore();

        currentColor = nextColor;
        nextColor = nextNextColor;
        nextNextColor = randomColor();

        showLauncherCircle = true;
        launched.canLaunch = true;
    }
};

let mouseLimitY = 125;
let previousMoveX;
let previousMoveY;
let previousFirstMoveX;
let previousFirstMoveY;
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

        if(mouseY < mouseLimitY) {
            firstMoveX = previousFirstMoveX;
            firstMoveY = previousFirstMoveY;
            moveX = previousMoveX;
            moveY = previousMoveY;
        }
        else if(!(mouseXpos)) {
            firstMoveY *= -1;
            firstMoveX *= -1;
            moveY *= -1;
            moveX *= -1;
        }

        // main circle
        if(showLauncherCircle) {
            drawCircle(x, y, 
                currentColor, circleSize);
        }
            
        x += firstMoveX;
        y += firstMoveY;

        let color = currentColor;

        for(let i = 0; i < this.count; i++) {
            x += moveX;
            y += moveY;

            color = offsetHex(color, -25);

            drawSimpleCircle(x, y, 
                color, this.smallerSize);
        }

        if(mouseY >= mouseLimitY) {
            previousAimAngle = mouseAngle;
            previousFirstMoveX = firstMoveX;
            previousFirstMoveY = firstMoveY;
            previousMoveX = moveX;
            previousMoveY = moveY;
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
let nextColor = randomColor();
let nextNextColor = randomColor();

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
            if(col == 0) {
                currentRow.push(randomColor());
            }
            else {
                let random = Math.random();

                if(random > 0.5) {
                    currentRow.push(randomColor());
                }
                else {
                    let previous = currentRow[col - 1];

                    // to prevent the very low chance of infinitely choosing same color over and over again
                    for(let i = 0; i < 500; i++) {
                        let check = randomColor();

                        if(check != previous) {
                            currentRow.push(check);
                            break;
                        }
                    }
                }
            }
        }

        circles.push(currentRow);
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
    let row = Math.floor(y / space);
    if(row < 0) {
        row = 0;
    }
    if(row > circles.length - 1) {
        return -1;
    }

    let xOffset = 0;
    if((row % 2 == 0) && (shiftOddRows)) {
        xOffset = space / 2;
    }

    let col = Math.floor((x - xOffset) / space);
    if(col < 0) {
        col = 0;
    }
    if(col > CIRCLES_MAX_COUNT_HORIZONTAL - 1) {
        col = CIRCLES_MAX_COUNT_HORIZONTAL - 1;
    }
    if(circles[row][col] == -1) {
        return -1;
    }

    return [row, col];
}

function getRow(y) {
    let row = Math.floor(y / space);
    if(row < 0) {
        row = 0;
    }

    return row;
}

function getCol(row, x) {
    let xOffset = 0;
    if((row % 2 == 0) && (shiftOddRows)) {
        xOffset = space / 2;
    }

    let col = Math.floor((x - xOffset) / space);
    if(col < 0) {
        col = 0;
    }
    if(col > CIRCLES_MAX_COUNT_HORIZONTAL - 1) {
        col = CIRCLES_MAX_COUNT_HORIZONTAL - 1;
    }

    return col;
}

function addCircleAt(row, col, color) {
    if(row > circles.length - 1) {
        let addedRow = [];

        for(let i = 0; i < circles[0].length; i++) {
            addedRow.push(-1);
        }

        circles.push(addedRow);
    }
    
    circles[row][col] = color;

    checkForDeletes(row, col, color);
}

// getAdjacents and getIslandAdjacents have extremely redundant code, so at some point fix

function getAdjacents(row, col, color) {
    let already = alreadyFound.split(".");
    let adjacents = "";

    let notFarthestLeft = false;
    let notFarthestRight = false;
    let notFarthestUp = false;
    let notFarthestDown = false;

    // left
    if(col > 0){
        notFarthestLeft = true;
        let sameColor = (circles[row + 0][col - 1] == color);    
        if(sameColor && !(already.includes((row + 0) + ", " + (col - 1)))) {
            alreadyFound += (row + 0) + ", " + (col - 1) + ".";
            notFarthestLeft = true;
            adjacents += (row + 0) + ", " + (col - 1) + "."
            
            if(circles[row + 0][col - 1] == color) {            
                adjacents += getAdjacents(row + 0, col - 1, color);
            }
        }
    }
    // right
    if(col < circles[0].length - 1){
        notFarthestRight = true;
        let sameColor = (circles[row + 0][col + 1] == color);    
        if(sameColor && !(already.includes((row + 0) + ", " + (col + 1)))) {
            alreadyFound += (row + 0) + ", " + (col + 1) + ".";
            notFarthestRight = true;
            adjacents += (row + 0) + ", " + (col + 1) + "."
            
            if(circles[row + 0][col + 1] == color) {            
                adjacents += getAdjacents(row + 0, col + 1, color);
            }
        }
    }
    // up
    if(row > 0){
        notFarthestUp = true;
        let sameColor = (circles[row - 1][col + 0] == color);    
        if(sameColor && !(already.includes((row - 1) + ", " + (col + 0)))) {
            alreadyFound += (row - 1) + ", " + (col + 0) + ".";
            notFarthestUp = true;
            adjacents += (row - 1) + ", " + (col + 0) + "."
            
            if(circles[row - 1][col + 0] == color) {            
                adjacents += getAdjacents(row - 1, col + 0, color);
            }
        }
    }
    // down
    if(row < circles.length - 1){
        notFarthestDown = true;
        let sameColor = (circles[row + 1][col + 0] == color);    
        if(sameColor && !(already.includes((row + 1) + ", " + (col + 0)))) {
            alreadyFound += (row + 1) + ", " + (col + 0) + ".";
            notFarthestDown = true;
            adjacents += (row + 1) + ", " + (col + 0) + "."
            
            if(circles[row + 1][col + 0] == color) {            
                adjacents += getAdjacents(row + 1, col + 0, color);
            }
        }
    }

    // ----------------------------------------

    // top-left
    if(notFarthestUp && notFarthestLeft && (row % 2 == 0)) {
        let sameColor = (circles[row - 1][col - 1] == color);    
        if(sameColor && !(already.includes((row - 1) + ", " + (col - 1)))) {
            alreadyFound += (row - 1) + ", " + (col - 1) + ".";
            adjacents += (row - 1) + ", " + (col - 1) + "."
            
            if(circles[row - 1][col - 1] == color) {            
                adjacents += getAdjacents(row - 1, col - 1, color);
            }
        }
    }

    // top-right
    if(notFarthestUp && notFarthestRight && (row % 2 == 1)) {
        let sameColor = (circles[row - 1][col + 1] == color);    
        if(sameColor && !(already.includes((row - 1) + ", " + (col + 1)))) {
            alreadyFound += (row - 1) + ", " + (col + 1) + ".";
            adjacents += (row - 1) + ", " + (col + 1) + "."
            
            if(circles[row - 1][col + 1] == color) {            
                adjacents += getAdjacents(row - 1, col + 1, color);
            }
        }
    }

    // bottom-left
    if(notFarthestDown && notFarthestLeft && (row % 2 == 0)) {
        let sameColor = (circles[row + 1][col - 1] == color);    
        if(sameColor && !(already.includes((row + 1) + ", " + (col - 1)))) {
            alreadyFound += (row + 1) + ", " + (col - 1) + ".";
            adjacents += (row + 1) + ", " + (col - 1) + "."
            
            if(circles[row + 1][col - 1] == color) {            
                adjacents += getAdjacents(row + 1, col - 1, color);
            }
        }
    }

    // bottom-right
    if(notFarthestDown && notFarthestRight && (row % 2 == 1)) {
        let sameColor = (circles[row + 1][col + 1] == color);    
        if(sameColor && !(already.includes((row + 1) + ", " + (col + 1)))) {
            alreadyFound += (row + 1) + ", " + (col + 1) + ".";
            adjacents += (row + 1) + ", " + (col + 1) + "."
            
            if(circles[row + 1][col + 1] == color) {            
                adjacents += getAdjacents(row + 1, col + 1, color);
            }
        }
    }

    
    return adjacents;
}

function getIslandAdjacents(row, col) {
    let already = alreadyFound.split(".");
    let adjacents = "";
    if(((row > -1) && (col > -1)) && (islandCheckCirclesCopy[row][col] != -1)) {

    let notFarthestLeft = false;
    let notFarthestRight = false;
    let notFarthestUp = false;
    let notFarthestDown = false;

    // left
    if(col > 0){
        notFarthestLeft = true;
        let notEmpty = (islandCheckCirclesCopy[row + 0][col - 1] != -1);    
        if(notEmpty && !(already.includes((row + 0) + ", " + (col - 1)))) {
            alreadyFound += (row + 0) + ", " + (col - 1) + ".";
            notFarthestLeft = true;
            adjacents += (row + 0) + ", " + (col - 1) + ".";
            // console.log("FOUND",  ((row + 0) + ", " + (col - 1)), "FROM", row, col);
            
            if(islandCheckCirclesCopy[row + 0][col - 1] != -1) {            
                adjacents += getIslandAdjacents(row + 0, col - 1);
            }
        }
    }
    // right
    if(col < islandCheckCirclesCopy[0].length - 1){
        let notEmpty = (islandCheckCirclesCopy[row + 0][col + 1] != -1);    
        if(notEmpty && !(already.includes((row + 0) + ", " + (col + 1)))) {
            alreadyFound += (row + 0) + ", " + (col + 1) + ".";
            notFarthestRight = true;
            adjacents += (row + 0) + ", " + (col + 1) + ".";
            // console.log("FOUND",  ((row + 0) + ", " + (col + 1)), "FROM", row, col);
            
            if(islandCheckCirclesCopy[row + 0][col + 1] != -1) {            
                adjacents += getIslandAdjacents(row + 0, col + 1);
            }
        }
    }
    // up
    if(row > 0){
        notFarthestUp = true;
        let notEmpty = (islandCheckCirclesCopy[row - 1][col + 0] != -1);    
        if(notEmpty && !(already.includes((row - 1) + ", " + (col + 0)))) {
            alreadyFound += (row - 1) + ", " + (col + 0) + ".";
            notFarthestUp = true;
            adjacents += (row - 1) + ", " + (col + 0) + ".";
            // console.log("FOUND",  ((row - 1) + ", " + (col + 0)), "FROM", row, col);
            
            if(islandCheckCirclesCopy[row - 1][col + 0] != -1) {            
                adjacents += getIslandAdjacents(row - 1, col + 0);
            }
        }
    }
    // down
    if(row < islandCheckCirclesCopy.length - 1){
        notFarthestDown = true;
        let notEmpty = (islandCheckCirclesCopy[row + 1][col + 0] != -1);
        if(notEmpty && !(already.includes((row + 1) + ", " + (col + 0)))) {
            alreadyFound += (row + 1) + ", " + (col + 0) + ".";
            notFarthestDown = true;
            adjacents += (row + 1) + ", " + (col + 0) + ".";
            // console.log("FOUND",  ((row + 1) + ", " + (col + 0)), "FROM", row, col);
            
            if(islandCheckCirclesCopy[row + 1][col + 0] != -1) {            
                adjacents += getIslandAdjacents(row + 1, col + 0);
            }
        }
    }

    // ----------------------------------------

    // top-left
    if(notFarthestUp && notFarthestLeft && (row % 2 == 0)) {
        let notEmpty = (islandCheckCirclesCopy[row - 1][col - 1] != -1);    
        if(notEmpty && !(already.includes((row - 1) + ", " + (col - 1)))) {
            alreadyFound += (row - 1) + ", " + (col - 1) + ".";
            adjacents += (row - 1) + ", " + (col - 1) + ".";
            // console.log("FOUND",  ((row - 1) + ", " + (col - 1)), "FROM", row, col);
            
            if(islandCheckCirclesCopy[row - 1][col - 1] != -1) {            
                adjacents += getIslandAdjacents(row - 1, col - 1);
            }
        }
    }

    // top-right
    if(notFarthestUp && notFarthestRight && (row % 2 == 1)) {
        let notEmpty = (islandCheckCirclesCopy[row - 1][col + 1] != -1);    
        if(notEmpty && !(already.includes((row - 1) + ", " + (col + 1)))) {
            alreadyFound += (row - 1) + ", " + (col + 1) + ".";
            adjacents += (row - 1) + ", " + (col + 1) + ".";
            // console.log("FOUND",  ((row - 1) + ", " + (col + 1)), "FROM", row, col);
            
            if(islandCheckCirclesCopy[row - 1][col + 1] != -1) {            
                adjacents += getIslandAdjacents(row - 1, col + 1);
            }
        }
    }

    // bottom-left
    if(notFarthestDown && notFarthestLeft && (row % 2 == 0)) {
        let notEmpty = (islandCheckCirclesCopy[row + 1][col - 1] != -1);    
        if(notEmpty && !(already.includes((row + 1) + ", " + (col - 1)))) {
            alreadyFound += (row + 1) + ", " + (col - 1) + ".";
            adjacents += (row + 1) + ", " + (col - 1) + ".";
            // console.log("FOUND",  ((row + 1) + ", " + (col - 1)), "FROM", row, col);
            
            if(islandCheckCirclesCopy[row + 1][col - 1] != -1) {            
                adjacents += getIslandAdjacents(row + 1, col - 1);
            }
        }
    }

    // bottom-right
    if(notFarthestDown && notFarthestRight && (row % 2 == 1)) {
        let notEmpty = (islandCheckCirclesCopy[row + 1][col + 1] != -1);    
        if(notEmpty && !(already.includes((row + 1) + ", " + (col + 1)))) {
            alreadyFound += (row + 1) + ", " + (col + 1) + ".";
            adjacents += (row + 1) + ", " + (col + 1) + ".";
            // console.log("FOUND",  ((row + 1) + ", " + (col + 1)), "FROM", row, col);
            
            if(islandCheckCirclesCopy[row + 1][col + 1] != -1) {            
                adjacents += getIslandAdjacents(row + 1, col + 1);
            }
        }
    }

    }

    // console.log(row, col);
    // console.log(already);
    // console.log(alreadyFound.length);
    
    return adjacents;
}

let empties = [];
function getNonEmptyCount() {
    let count = 0;
    empties = [];

    for(let row = 0; row < circles.length; row++) {
        for(let col = 0; col < circles[row].length; col++) {
            if(circles[row][col] != -1) {
                ++count;
            }
            else {
                empties.push([row, col])
            }
        }
    }

    return count;
}

function getNonEmptyIslandCount() {
    let count = 0;

    for(let row = 0; row < islandCheckCirclesCopy.length; row++) {
        for(let col = 0; col < islandCheckCirclesCopy[row].length; col++) {
            if(islandCheckCirclesCopy[row][col] != -1) {
                ++count;
            }
        }
    }

    return count;
}

let inMoveRowAnimation = false;
let moveRowAnimationOffset = 0;
function resetLives() {
    lives = 5;

    moveRowAnimationOffset = 0;
    inMoveRowAnimation = true;
}

function updateScore() {
    let removed = nonEmptyBefore - nonEmptyAfter;

    let multiply = 0;
    for(let i = 0; i < removed; i++) {
        multiply += 2;
    }

    score += removed * multiply;
}

class RemoveEffect {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.changeFrame = 0;
        this.maxChangeFrame = 2;
        this.frame = 0;
        this.maxFrame = 3;
    }
    animate() {
        let clipX = 64 * this.frame;
        let clipY = 64 * 5;
        let size = 64 * 1;

        let x = (this.col * space) - (size * 0.5) + (space / 2) + 2;
        if ((this.row % 2 == 1) && shiftOddRows) {
            x += circleSize + CIRCLES_SPACING;
        }
        let y = (this.row * space) - (size * 0.5) + (space / 2) + 2;


        r.drawImage(
            removeEffectImg,
            clipX, clipY,
            64, 64,
            x, y,
            size, size
        );

        ++this.changeFrame;
        if(this.changeFrame > this.maxChangeFrame) {
            this.changeFrame = 0;
            
            ++this.frame;
            if(this.frame > this.maxFrame) {
                effectsQueue.splice(0, 1);
            }
        }
    }
}

let effectsQueue = [];
let animateRemoveCircles = {
    toRemove: [], 
    speed: 80, 
    animate: function() {
        if(this.toRemove.length > 0) {
            circles[this.toRemove[0][0]][this.toRemove[0][1]] = -1;
            effectsQueue.push(new RemoveEffect(this.toRemove[0][0], this.toRemove[0][1]));
            
            this.toRemove.splice(0, 1);

            
            window.setTimeout(function() {
                animateRemoveCircles.animate();
            }, this.speed);
        }
    }
}

let nonEmptyBefore = -1;
let nonEmptyAfter = -1;
let alreadyFound = "";
let removedFromLaunch = false;
function checkForDeletes(row, col, color) {
    console.log("|-|.|-|.|-|.|-|.|-|.|-|.|-|.|-|.|-|.|-|");
    alreadyFound = row + ", " + col + ".";
    removedFromLaunch = false;
    
    let adjacents = getAdjacents(row, col, color);
    let adjacentArray = adjacents.split(".");
    
    // last elem is the empty string
    let remove = adjacentArray.includes("");
    while(remove) {
        --adjacentArray.length;
        remove = adjacentArray.includes("");
    }
    
    // for some reason duplicates sometimes show up, so remove duplicates
    let removeDuplicates = [];
    for(let check of adjacentArray) {
        if(!(removeDuplicates.includes(check))) {
            removeDuplicates.push(check);
        }
    }

    if(drawRowCols) {
        console.log(removeDuplicates);
    }

    if(removeDuplicates.length > 1) {
        removedFromLaunch = true;
        animateRemoveCircles.toRemove = [];

        animateRemoveCircles.toRemove.push([row, col]);

        for(let circle of removeDuplicates) {
            let split = circle.split(", ");
            let row = parseInt(split[0]);
            let col = parseInt(split[1]);

            animateRemoveCircles.toRemove.push([row, col]);
        }

        animateRemoveCircles.animate();
    }
    else {
        --lives;

        launched.finishedLaunch();

        if(lives == 0) {
            resetLives();
        }
    }
}

let islandCheckCirclesCopy;
let startedCheckForIslands = false;
function checkForIslands() {
    console.clear();
    startedCheckForIslands = true;
    // check for islands, only need to check if launched circle caused group to be removed
    if(removedFromLaunch) {
        islandCheckCirclesCopy = circles.slice();
        console.log("checking for islands");
        let checkForIslands = true;
        alreadyFound = "";

        let iterations = 0;

        let nonEmptyCount = getNonEmptyIslandCount();
        while(checkForIslands) {
            let alreadyCheck = alreadyFound.split(".");
            /**
             * First start anywhere that is not empty. In this case 
             * scan from left to right, and bottom to up. Also don't 
             * have to worry about color not being equal to currentColor, 
             * because checking for islands after currentColor group 
             * has already been removed.
             */
            let startRow = -1;
            let startCol = -1;
            for(let r = islandCheckCirclesCopy.length - 1; r > 0; r--) {
                for(let c = 0; c < islandCheckCirclesCopy[r].length; c++) {
                    if((islandCheckCirclesCopy[r][c] != -1) && 
                    !(alreadyCheck.includes(r + ", " + c))) {
                        startRow = r;
                        startCol = c;
                        break;
                    }
                }

                // first break doesn't break out of row loop
                if(startRow != -1) {
                    break;
                }
            }

            // console.log("starting island search at ", startRow, startCol);
            
            // alreadyFound += startRow + ", " + startCol + ".";

            let islandAdjacents = startRow + ", " + startCol + "." + 
                getIslandAdjacents(startRow, startCol);
            let islandAdjacentSet = new Set(islandAdjacents.split("."));

            if(startRow != -1) {
                let remove = islandAdjacentSet.has("");
                while(remove) {
                    islandAdjacentSet.delete("");
                    remove = islandAdjacentSet.has("");
                }
            }

            console.log("ADJACENT");
            console.log(islandAdjacentSet);
            
            // console.log("EMPTIES");
            // console.log(empties);

            // console.log("StartRow, islandAdjacentSet, nonEmptyCount", 
                // startRow, islandAdjacentSet.size, nonEmptyCount)
            
            if(((islandAdjacentSet.size) < nonEmptyCount) && (startRow != -1)) {
                // console.log("there is an island, checking if found island in bounds.");
                let inBounds = true;

                islandAdjacentSet.forEach(function(check) {
                    if(check.length > 0) {
                        let checkSplit = check.split(", ");

                        if(checkSplit[0] == 0) {
                            inBounds = false;
                        }
                    }
                });

                if(inBounds) {
                    // console.log("found island IN bounds");

                    // console.log("THE ALREADY:");
                    // let test = new Set(alreadyFound.split("."));
                    // console.log(test);

                    // window.setTimeout(function(){
                    islandAdjacentSet.forEach(function(circle) {
                        if(circle.length > 0) {
                            let circleSplit = circle.split(", ");

                            let circleRow = circleSplit[0];
                            let circleCol = circleSplit[1];

                            // console.log("removing island", circleRow, circleCol);
                            islandCheckCirclesCopy[circleRow][circleCol] = -1;
                            animateRemoveCircles.toRemove.push([circleRow, circleCol]);
                        }
                    });
                    // }, 500);

                    nonEmptyCount = getNonEmptyIslandCount();
                    checkForIslands = ((islandAdjacentSet.size - 1) < nonEmptyCount);
                    
                    console.log(nonEmptyCount);
                    console.log("-----");
                }
                else {
                    checkForIslands = true;
                    // console.log("found island NOT in bounds");
                }
            }
            else {
                checkForIslands = false;
                // console.log("there are no islands");
            }

            // console.log("check again?", checkForIslands);
            // console.log("--------------------");

            ++iterations;
            if(iterations > 10) {
                console.log("!!!!!INFINITE LOOP DETECTED!!!!!");
                checkForIslands = false;
            }
        }

        console.log("iterations", iterations);

        if(iterations == 1) {
            launched.finishedIslandCheck();
        }
        else {
            animateRemoveCircles.animate();
        }

        // console.log("%%%%%%%%%%%%%%%%%%%%");
        // console.log("we are done here")
        // console.log("%%%%%%%%%%%%%%%%%%%%");
    }
    else {
        // console.log("don't need to check for islands");
        launched.finishedIslandCheck();
    }

    // for some reasons islands with a length of 1 don't get removed
    // for(let row = 0; row < circles.length; row++) {
    //     for(let col = 0; col < circles[row].length; col++) {
    //         let leftEmpty = false;
    //         if((col > 0) && (circles[row][col - 1] == -1)) {
    //             leftEmpty = true;
    //         }

    //         let rightEmpty = false;
    //         if((col < circles[row].length - 1) && (circles[row][col + 1] == -1)) {
    //             rightEmpty = true;
    //         }

    //         let upEmpty = false;
    //         if((row > 0) && (circles[row - 1][col] == -1)) {
    //             upEmpty = true;
    //         }

    //         let downEmpty = false;
    //         if((row < circles.length - 1) && (circles[row + 1][col] == -1)) {
    //             downEmpty = true;
    //         }

    //         if(leftEmpty && rightEmpty && upEmpty && downEmpty) {
    //             if(row % 2 == 1) {
    //                 let topRightEmpty = false;
    //                 if((row > 0) && (col < circles[row].length - 1) &&
    //                 upEmpty && rightEmpty) {
    //                     topRightEmpty = true;
    //                 }

    //                 let bottomRightEmpty = false;
    //                 if((row < circles.length - 1) && (col < circles[row].length - 1) && 
    //                 downEmpty && rightEmpty) {
    //                     bottomRightEmpty = true;
    //                 }

    //                 if(topRightEmpty && bottomRightEmpty) {
    //                     console.log("FOUND A SINGLE ISLAND AT", row, col);
    //                     circles[row][col] = -1;
    //                 }
    //             }
    //             else {
    //                 let topLeftEmpty = false;
    //                 if((row > 0) && (col > 0) &&
    //                 upEmpty && leftEmpty) {
    //                     topLeftEmpty = true;
    //                 }

    //                 let bottomLeftEmpty = false;
    //                 if((row < circles.length - 1) && (col > 0) && 
    //                 downEmpty && leftEmpty) {
    //                     bottomLeftEmpty = true;
    //                 }

    //                 if(topLeftEmpty && bottomLeftEmpty) {
    //                     console.log("FOUND A SINGLE ISLAND AT", row, col);
    //                     circles[row][col] = -1;
    //                 }
    //             }
    //         }
    //     }
    // }
}

function setMouseAngle(e) {
    movedMouse = true;
    let xdiff = e.offsetX - launcherX;
    let ydiff = e.offsetY - launcherY;

    mouseY = launcherY - e.offsetY;

    mouseXpos = xdiff > 0;
    
    mouseAngle = Math.atan(ydiff / xdiff);
}

function launch(e) {
    // don't allow launching ball to horizontal to prevent bouncing back and forth horizontally
    if(!(launched.moving) && (mouseY >= mouseLimitY) && launched.canLaunch) {
        launched.canLaunch = false;
        showLauncherCircle = false;
        launched.moving = true;

        /**
         * no way to get the position of the mouse without moving the mouse first. 
         * So if click before first moving mouse, just launch directly upwards.
         */
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
// const BORDER_SIZE = 2.5;
const BORDER_SIZE = 2;
let borderStyle = 2;

let stylized = true;
let stylizedShadow = false;

function drawCircle(x, y, color, size) {
    if(stylized) {
        // shadow shadow
        if(stylizedShadow) {
            r.fillStyle = "#1C2833";
            r.beginPath();
            r.arc(x + 1, y + 1, 
                size, 
                0, 2 * Math.PI); 
            r.fill();
        }

        // shadow
        r.fillStyle = offsetHex(color, 0 - 50);
        r.beginPath();
        r.arc(x, y, 
            size, 
            0, 2 * Math.PI); 
        r.fill();
        
        // main color
        r.fillStyle = color;
        r.beginPath();
        r.arc(x - 4, y - 4, 
            size * 0.7, 
            0, 2 * Math.PI); 
        r.fill();

        // highlight
        r.fillStyle = offsetHex(color, 0 + 50);
        r.beginPath();
        r.arc(x - 8, y - 8, 
            size * 0.2, 
            0, 2 * Math.PI); 
        r.fill();
    }
    else {
        // shadow
        let shadowOffset = 2;
        r.fillStyle = offsetHex(color, 0 - 50);
        r.beginPath();
        r.arc(x, y, 
            size, 
            0, 2 * Math.PI); 
        r.fill();

        // highlight
        r.fillStyle = offsetHex(color, 0 + 50);
        r.beginPath();
        r.arc(x, y, 
            size * 0.94, 
            0, 2 * Math.PI); 
        r.fill();
        
        // main color
        r.fillStyle = color;
        r.beginPath();
        r.arc(x, y, 
            size * 0.88, 
            0, 2 * Math.PI); 
        r.fill();
    }

    if(border) {
        
        if(borderStyle == 0) {
            r.strokeStyle = offsetHex(color, 0 - BORDER_COLOR_DIFF);
            r.lineWidth = BORDER_SIZE;
        }
        else if(borderStyle == 1) {
            r.strokeStyle = "Black"
            r.lineWidth = 2;
        }
        else if(borderStyle == 2) {
            r.strokeStyle = "White";
        }

        r.stroke();
        r.closePath();
    }

    r.closePath();
}

function drawSimpleCircle(x, y, color, size) {
    r.fillStyle = color;
    r.beginPath();
    r.arc(x, y, 
        size, 
        0, 2 * Math.PI); 
    r.fill();
}

function drawCircles() {
    let x = -1;
    let y = circleSize + CIRCLES_SPACING;
    let noOffsetY = y;

    for(let row = 0; row < circles.length; row++) {
        if(inMoveRowAnimation) {
            y += moveRowAnimationOffset;
        }

        x = circleSize + CIRCLES_SPACING;
        
        if((row % 2 == 1) && shiftOddRows) {
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

                if(drawRowCols) {
                    r.font = "bold 12px Arial";
                    r.fillStyle = "White";
                    r.fillText(row + "," + col, x - (10 / 2) - 3, y - (10 / 2) - 2)

                    r.font = "bold 12px Arial";
                    r.fillStyle = "Black";
                    r.fillText(row + "," + col, x - (10 / 2) - 3, y - (10 / 2) - 2);
                }
            }

            x += (circleSize * 2) + CIRCLES_SPACING;
        }

        y = noOffsetY + (circleSize * 2) + CIRCLES_SPACING;
        noOffsetY = y;
    }
}

function drawNextColors() {
    let x = launcherX - (space * 1.5);
    drawCircle(
        x, launcherY, 
        nextColor, circleSize);
    
    x -= space * 1.15;
    drawCircle(
        x, launcherY, 
        nextNextColor, circleSize);
}

let lives = 5;
function drawLives() {
    let x = launcherX - (space * 4.25);

    for(let i = 0; i < 5; i++) {
        let color = "#212F3D";
        if(5 - i <= lives) {
            color = "#ABB2B9";
        }

        drawSimpleCircle(
            x, launcherY, 
            color, circleSize);
        
        x -= space;
    }
}

let score = 0;
function drawScore() {
    let scoreString = score.toString();
    let text = "";
    for(let i = scoreString.length - 1; i >= 0; i--) {
        text += scoreString[scoreString.length - 1 - i];
        if((i % 3 == 0) && (i != 0)) {
            text += ",";
        }
    }
    let x = launcherX + (space * 1.8);

    let yOffset = 9;

    r.beginPath();
    r.fillStyle = "#566573";
    let width = 350;
    let height = 100;
    r.roundRect(x - 18, launcherY - yOffset - (height * 0.38), width, height, 20);
    r.fill();
    r.closePath();

    r.beginPath();
    r.fillStyle = "#1C2833";
    width = 350;
    height = 100;
    r.roundRect(x - 15, launcherY - yOffset - (height * 0.35), width, height, 20);
    r.fill();
    r.closePath();

    r.font = "45px Tauri";
    r.fillStyle = "#F7DC6F";

    r.fillText(text, x, launcherY + yOffset);
}

function drawBottomBorder() {
    let y = CIRCLES_SPACING;
    y += space * 15;
    r.fillStyle = "#85929E";
    r.fillRect(0, y, w, 1);
}

let effectsFinished = false;
function drawEffects() {
    effectsFinished = false;

    if(effectsQueue.length > 0) {
        for(let i = 0; i < effectsQueue.length; i++) {
            effectsQueue[i].animate();
        }

        effectsFinished = (effectsQueue.length == 0);
    }

    if(effectsFinished) {
        console.log("made it here")
        if(startedCheckForIslands) {
            launched.finishedIslandCheck();
        }
        else {
            launched.finishedLaunch();
        }
    }
}

function checkforMoveRowAnimation() {
    if(inMoveRowAnimation) {
        launched.canLaunch = false;
        moveRowAnimationOffset += 3;

        let max = (circleSize * 2) + CIRCLES_SPACING;
        if(moveRowAnimationOffset > max) {
            // add new row
            let row = [];
            for(let col = 0; col < circles[0].length; col++) {
                row.push(-1);
            }

            circles.push(row);

            // move everything down
            for(let row = circles.length - 1; row > 0; row--) {
                for(let col = 0; col < circles[row].length; col++) {
                    circles[row][col] = circles[row - 1][col];
                }
            }

            // "add" new row by replacing top row with random stuf
            for(let col = 0; col < circles[0].length; col++) {
                circles[0][col] = randomColor();
            }

            inMoveRowAnimation = false;
            launched.canLaunch = true;
        }
    }
}

function loop() {
    let frameStart = Date.now();

    r.clearRect(0, 0, w, h);

    drawBottomBorder();

    drawCircles();

    drawEffects();

    drawNextColors();

    drawLives();

    drawScore();

    if(launched.moving) {
        launched.update();
    }
    aimer.draw();

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

    checkforMoveRowAnimation();

    checkForGameOver();

    let frameEnd = Date.now();
}

function checkForGameOver() {
    let over = false;
    let message = "you ";

    if(circles.length > 15) {
        over = true;
        message += "lost"
    }
    
    let count = getNonEmptyCount();
    if(count == 0) {
        over = true;
        message += "won";
    }

    if(over) {
        window.clearInterval(gameInterval);
        document.getElementById("message").innerText = message;
        document.getElementById("score").innerText = score + " pts";
        document.getElementById("menu").style.display = "flex";
    }
}