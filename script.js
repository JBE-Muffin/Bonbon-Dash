
/* ============================================
   CUSTOMIZATION AND ADJUSTMENT — JAVASCRIPT
   Modify the values below to customize
   images, positions, sizes, and gameplay.
   ============================================ */

const CONFIG = {

    /* ============================================
       A. IMAGE ASSETS
       Replace these paths with your PNG files.
       ============================================ */

    assets: {
        // Image used for the main character.
        runner: "assets/runner.png",

        // Image used for the first obstacle.
        obstacle1: "assets/obstacle1.png",

        // Image used for the second obstacle.
        obstacle2: "assets/obstacle2.png",

        // Image used for the scrolling background.
        background: "assets/background.png",

        // Image used for the first decorative element.
        doodad1: "assets/doodad1.png",

        // Image used for the second decorative element.
        doodad2: "assets/doodad2.png"
    },


    /* ============================================
       B. RUNNER
       ============================================ */

    runner: {
        // Horizontal position of the runner.
        x: 135,

        // Vertical adjustment relative to the ground.
        yOffset: 0,

        // Maximum image width.
        maxWidth: 140,

        // Maximum image height.
        maxHeight: 160,

        // Horizontal image adjustment.
        imageOffsetX: 0,

        // Vertical image adjustment.
        imageOffsetY: 30,

        // Initial jumping force.
        jumpStrength: 800,

        // Gravity pulling the runner downward.
        gravity: 1800,

        // Horizontal collision padding.
        hitboxPaddingX: 20,

        // Vertical collision padding.
        hitboxPaddingY: 30
    },


    /* ============================================
       C. OBSTACLE 1
       ============================================ */

    obstacle1: {
        // Maximum obstacle width.
        maxWidth: 180,

        // Maximum obstacle height.
        maxHeight: 130,

        // Horizontal image adjustment.
        imageOffsetX: 0,

        // Vertical image adjustment.
        imageOffsetY: 30,

        // Distance above or below the ground.
        groundOffset: 0,

        // Horizontal collision padding.
        hitboxPaddingX: 30,

        // Vertical collision padding.
        hitboxPaddingY: 30
    },


    /* ============================================
       D. OBSTACLE 2
       ============================================ */

    obstacle2: {
        // Maximum obstacle width.
        maxWidth: 140,

        // Maximum obstacle height.
        maxHeight: 200,

        // Horizontal image adjustment.
        imageOffsetX: 0,

        // Vertical image adjustment.
        imageOffsetY: 30,

        // Distance above or below the ground.
        groundOffset: 0,

        // Horizontal collision padding.
        hitboxPaddingX: 35,

        // Vertical collision padding.
        hitboxPaddingY: 25
    },


    /* ============================================
       E. BACKGROUND
       ============================================ */

    background: {
        // Horizontal background adjustment.
        offsetX: 0,

        // Vertical background adjustment.
        offsetY: 0,

        // Background image scale.
        scale: 1,

        // Background scrolling speed multiplier.
        scrollSpeed: 0.18,

        // Fallback background color.
        fallbackColor: "#e8c9a5",

        // Vertical image alignment.
        alignment: "center"
    },


    /* ============================================
       F. DOODAD 1
       ============================================ */

    doodad1: {
        // Starting horizontal position.
        x: 0,

        // Starting vertical position.
        y: 305,

        // Maximum display width.
        maxWidth: 34,

        // Maximum display height.
        maxHeight: 28,

        // Horizontal image adjustment.
        imageOffsetX: 0,

        // Vertical image adjustment.
        imageOffsetY: 0,

        // Repeat this decorative element.
        repeat: true,

        // Space between repeated elements.
        spacing: 205,

        // Scrolling speed multiplier.
        scrollSpeed: 0.45
    },


    /* ============================================
       G. DOODAD 2
       ============================================ */

    doodad2: {
        // Starting horizontal position.
        x: 100,

        // Starting vertical position.
        y: 270,

        // Maximum display width.
        maxWidth: 31,

        // Maximum display height.
        maxHeight: 31,

        // Horizontal image adjustment.
        imageOffsetX: 0,

        // Vertical image adjustment.
        imageOffsetY: 0,

        // Repeat this decorative element.
        repeat: true,

        // Space between repeated elements.
        spacing: 410,

        // Scrolling speed multiplier.
        scrollSpeed: 0.13
    },


    /* ============================================
       H. GAMEPLAY
       ============================================ */

    gameplay: {
        // Initial movement speed.
        startingSpeed: 340,

        // Maximum movement speed.
        maxSpeed: 750,

        // Speed increase over time.
        difficultyIncrease: 5,

        // Minimum obstacle spacing.
        minObstacleSpacing: 390,

        // Maximum obstacle spacing.
        maxObstacleSpacing: 590
    },


    /* ============================================
       I. DEBUG — HITBOX VISUALIZATION
       ============================================ */

    debug: {
        // Show or hide collision outlines.
        showHitboxes: false,

        // Color of the runner's collision outline.
        runnerHitboxColor: "#00FF00",

        // Color of the obstacles' collision outlines.
        obstacleHitboxColor: "#FF0000",

        // Thickness of collision outlines.
        hitboxLineWidth: 2
    }

};


/* ============================================
   END OF CUSTOMIZATION AND ADJUSTMENT
   GAME LOGIC BELOW
   ============================================ */


/* ============================================
   1. HTML ELEMENTS AND CANVAS
   ============================================ */

// Get the existing HTML elements.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("scoreDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");

const gameOverlay = document.getElementById("gameOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");

const startButton = document.getElementById("startButton");
const assetStatus = document.getElementById("assetStatus");


// Logical canvas dimensions.

const WIDTH = 960;
const HEIGHT = 450;


// Ground position.

const GROUND_Y = 365;


// Make sure the canvas uses its logical dimensions.

canvas.width = WIDTH;
canvas.height = HEIGHT;


// Check that the required HTML elements exist.

const requiredElements = [
    canvas,
    scoreDisplay,
    highScoreDisplay,
    gameOverlay,
    overlayTitle,
    overlayMessage,
    startButton,
    assetStatus
];

if (requiredElements.some(element => !element)) {
    throw new Error("A required game HTML element is missing.");
}


/* ============================================
   2. GAME STATE
   ============================================ */

let gameState = "ready";

let score = 0;
let highScore = loadHighScore();

let gameSpeed = CONFIG.gameplay.startingSpeed;

let elapsedTime = 0;
let lastTime = 0;

let obstacleTimer = 0;
let nextObstacleDistance = 0;

let backgroundScroll = 0;

let animationFrameId = null;


// Store the game objects.

const runner = {
    x: CONFIG.runner.x,
    y: 0,
    velocityY: 0,
    onGround: true,
    animationTime: 0,
    displayWidth: 0,
    displayHeight: 0
};

let obstacles = [];


// Store loaded images.

const images = {
    runner: null,
    obstacle1: null,
    obstacle2: null,
    background: null,
    doodad1: null,
    doodad2: null
};


// Store asset loading information.

let loadedAssets = 0;
let failedAssets = 0;

const totalAssets = 6;


/* ============================================
   3. HIGH SCORE STORAGE
   ============================================ */

function loadHighScore() {

    try {
        const savedScore = localStorage.getItem(
            "bonbonsDashHighScore"
        );

        return savedScore ? Math.max(0, Number(savedScore) || 0) : 0;

    } catch (error) {
        return 0;
    }

}


function saveHighScore() {

    try {
        localStorage.setItem(
            "bonbonsDashHighScore",
            String(highScore)
        );

    } catch (error) {
        // The game continues even if storage is unavailable.
    }

}


/* ============================================
   4. IMAGE LOADING
   ============================================ */

function loadImage(key, path) {

    return new Promise(resolve => {

        const image = new Image();

        image.onload = () => {

            images[key] = image;

            loadedAssets++;

            resolve(true);

        };

        image.onerror = () => {

            images[key] = null;

            failedAssets++;

            resolve(false);

        };

        image.src = path;

    });

}


async function loadAllImages() {

    const results = await Promise.all([

        loadImage("runner", CONFIG.assets.runner),

        loadImage("obstacle1", CONFIG.assets.obstacle1),

        loadImage("obstacle2", CONFIG.assets.obstacle2),

        loadImage("background", CONFIG.assets.background),

        loadImage("doodad1", CONFIG.assets.doodad1),

        loadImage("doodad2", CONFIG.assets.doodad2)

    ]);


    if (failedAssets === 0) {

        assetStatus.textContent = "All game images loaded successfully!";

    } else if (loadedAssets === 0) {

        assetStatus.textContent =
            "Using built-in Canvas graphics. No PNG images required.";

    } else {

        assetStatus.textContent =
            `${loadedAssets} images loaded. Missing images use Canvas graphics.`;

    }


    // Initialize the runner after image dimensions are known.

    resetRunner();

    drawGame();

}


// Calculate image dimensions without stretching.

function getImageDimensions(image, maxWidth, maxHeight) {

    if (!image || !image.complete || !image.naturalWidth) {

        return {
            width: maxWidth,
            height: maxHeight
        };

    }

    const ratio = Math.min(
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight
    );

    return {
        width: image.naturalWidth * ratio,
        height: image.naturalHeight * ratio
    };

}


/* ============================================
   5. REUSABLE IMAGE POSITIONING
   ============================================ */

// Calculate a bottom-center anchored object's position.

function getBottomCenterPosition(
    x,
    groundY,
    width,
    height,
    offsetX,
    offsetY
) {

    const centerX = x + offsetX;

    const bottomY = groundY + offsetY;

    return {
        x: centerX - width / 2,
        y: bottomY - height,
        width,
        height
    };

}


// Calculate a top-left anchored object's position.

function getTopLeftPosition(
    x,
    y,
    width,
    height,
    offsetX,
    offsetY
) {

    return {
        x: x + offsetX,
        y: y + offsetY,
        width,
        height
    };

}


// Draw a loaded PNG image.

function drawImageAsset(key, position) {

    const image = images[key];

    if (!image) return false;

    ctx.drawImage(
        image,
        position.x,
        position.y,
        position.width,
        position.height
    );

    return true;

}


/* ============================================
   6. RUNNER INITIALIZATION
   ============================================ */

function resetRunner() {

    const dimensions = getImageDimensions(
        images.runner,
        CONFIG.runner.maxWidth,
        CONFIG.runner.maxHeight
    );

    runner.displayWidth = dimensions.width;
    runner.displayHeight = dimensions.height;

    runner.x = CONFIG.runner.x;

    runner.y = GROUND_Y + CONFIG.runner.yOffset;

    runner.velocityY = 0;

    runner.onGround = true;

    runner.animationTime = 0;

}


function getRunnerPosition() {

    return getBottomCenterPosition(
        runner.x,
        runner.y,
        runner.displayWidth,
        runner.displayHeight,
        CONFIG.runner.imageOffsetX,
        CONFIG.runner.imageOffsetY
    );

}


/* ============================================
   7. COLLISION HITBOXES
   ============================================ */

// Create the actual runner collision rectangle.

function getRunnerHitbox() {

    const position = getRunnerPosition();

    const paddingX = Math.min(
        CONFIG.runner.hitboxPaddingX,
        position.width / 2
    );

    const paddingY = Math.min(
        CONFIG.runner.hitboxPaddingY,
        position.height / 2
    );

    return {
        x: position.x + paddingX,
        y: position.y + paddingY,
        width: position.width - paddingX * 2,
        height: position.height - paddingY * 2
    };

}


// Create an obstacle's actual collision rectangle.

function getObstacleHitbox(obstacle) {

    const position = obstacle.position;

    const paddingX = Math.min(
        obstacle.config.hitboxPaddingX,
        position.width / 2
    );

    const paddingY = Math.min(
        obstacle.config.hitboxPaddingY,
        position.height / 2
    );

    return {
        x: position.x + paddingX,
        y: position.y + paddingY,
        width: position.width - paddingX * 2,
        height: position.height - paddingY * 2
    };

}


// Rectangle collision detection.

function checkCollision(rectA, rectB) {

    return (
        rectA.x < rectB.x + rectB.width &&
        rectA.x + rectA.width > rectB.x &&
        rectA.y < rectB.y + rectB.height &&
        rectA.y + rectA.height > rectB.y
    );

}


/* ============================================
   8. OBSTACLE CREATION
   ============================================ */

function createObstacle(key, config) {

    const dimensions = getImageDimensions(
        images[key],
        config.maxWidth,
        config.maxHeight
    );

    return {
        key,

        config,

        x: WIDTH + dimensions.width,

        displayWidth: dimensions.width,

        displayHeight: dimensions.height,

        position: null
    };

}


function spawnObstacle() {

    const selectedKey = Math.random() < 0.5
        ? "obstacle1"
        : "obstacle2";

    const selectedConfig = selectedKey === "obstacle1"
        ? CONFIG.obstacle1
        : CONFIG.obstacle2;

    const obstacle = createObstacle(
        selectedKey,
        selectedConfig
    );

    obstacles.push(obstacle);

    nextObstacleDistance =
        CONFIG.gameplay.minObstacleSpacing +
        Math.random() * (
            CONFIG.gameplay.maxObstacleSpacing -
            CONFIG.gameplay.minObstacleSpacing
        );

    obstacleTimer = 0;

}


/* ============================================
   9. OBSTACLE POSITIONING
   ============================================ */

function updateObstaclePosition(obstacle) {

    const groundY = GROUND_Y - obstacle.config.groundOffset;

    obstacle.position = getBottomCenterPosition(
        obstacle.x,
        groundY,
        obstacle.displayWidth,
        obstacle.displayHeight,
        obstacle.config.imageOffsetX,
        obstacle.config.imageOffsetY
    );

}


/* ============================================
   10. RUNNER JUMPING
   ============================================ */

function jump() {

    if (gameState !== "playing") return;

    // Prevent double jumping.

    if (!runner.onGround) return;

    runner.velocityY = -CONFIG.runner.jumpStrength;

    runner.onGround = false;

}


function handleJumpInput(event) {

    if (event.type === "keydown") {

        if (
            event.code !== "Space" &&
            event.code !== "ArrowUp"
        ) {
            return;
        }

        event.preventDefault();

    }

    if (gameState === "playing") {

        jump();

    }

}


/* ============================================
   11. RUNNER PHYSICS
   ============================================ */

function updateRunner(deltaTime) {

    if (!runner.onGround) {

        runner.velocityY += CONFIG.runner.gravity * deltaTime;

        runner.y += runner.velocityY * deltaTime;

        const groundPosition = GROUND_Y + CONFIG.runner.yOffset;

        if (runner.y >= groundPosition) {

            runner.y = groundPosition;

            runner.velocityY = 0;

            runner.onGround = true;

        }

    }

    runner.animationTime += deltaTime;

}


/* ============================================
   12. BACKGROUND DRAWING
   ============================================ */

// Draw the living room using simple Canvas shapes.

function drawFallbackBackground() {

    ctx.fillStyle = CONFIG.background.fallbackColor;

    ctx.fillRect(0, 0, WIDTH, HEIGHT);


    // Wall.

    ctx.fillStyle = "#f2dfc9";

    ctx.fillRect(0, 0, WIDTH, 300);


    // Wall paneling.

    ctx.strokeStyle = "#dfc3a5";

    ctx.lineWidth = 3;

    for (let x = 0; x <= WIDTH; x += 160) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, 300);

        ctx.stroke();

    }


    // Window.

    ctx.fillStyle = "#fff2d7";

    ctx.fillRect(55, 45, 180, 125);

    ctx.fillStyle = "#b8d8dd";

    ctx.fillRect(64, 54, 162, 107);

    ctx.fillStyle = "#fff1cf";

    ctx.fillRect(140, 54, 8, 107);

    ctx.fillRect(64, 105, 162, 7);


    // Curtains.

    ctx.fillStyle = "#c68d70";

    ctx.fillRect(43, 38, 23, 143);

    ctx.fillRect(230, 38, 23, 143);


    // Sofa.

    ctx.fillStyle = "#ad7657";

    ctx.fillRect(570, 205, 285, 88);

    ctx.fillRect(550, 225, 25, 68);

    ctx.fillRect(850, 225, 25, 68);

    ctx.fillStyle = "#d9aa89";

    ctx.fillRect(590, 185, 110, 60);

    ctx.fillRect(710, 185, 110, 60);


    // Sofa cushions.

    ctx.fillStyle = "#edc9aa";

    ctx.fillRect(610, 198, 65, 38);

    ctx.fillRect(730, 198, 65, 38);


    // Floor.

    ctx.fillStyle = "#bd8c65";

    ctx.fillRect(0, 300, WIDTH, 150);


    // Floorboards.

    ctx.strokeStyle = "#a87350";

    ctx.lineWidth = 2;

    for (let y = 325; y < HEIGHT; y += 35) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(WIDTH, y);

        ctx.stroke();

    }


    // Rug.

    ctx.fillStyle = "#e8b4a4";

    ctx.fillRect(250, 360, 460, 65);

    ctx.strokeStyle = "#d38e80";

    ctx.strokeRect(260, 368, 440, 49);


    // Rug details.

    ctx.fillStyle = "#f7d5c8";

    ctx.fillRect(280, 380, 400, 4);

}


// Draw a background image using cover-style scaling.

function drawBackgroundImage() {

    const image = images.background;

    if (!image) {

        drawFallbackBackground();

        return;

    }

    const scale = Math.max(
        WIDTH / image.naturalWidth,
        HEIGHT / image.naturalHeight
    ) * CONFIG.background.scale;

    const tileWidth = image.naturalWidth * scale;

    const tileHeight = image.naturalHeight * scale;

    const alignment = CONFIG.background.alignment;

    let verticalPosition = 0;

    if (alignment === "center") {

        verticalPosition = (HEIGHT - tileHeight) / 2;

    } else if (alignment === "bottom") {

        verticalPosition = HEIGHT - tileHeight;

    }

    verticalPosition += CONFIG.background.offsetY;

    const horizontalOffset =
        CONFIG.background.offsetX -
        (backgroundScroll % tileWidth);

    ctx.save();

    ctx.beginPath();

    ctx.rect(0, 0, WIDTH, HEIGHT);

    ctx.clip();

    for (
        let x = horizontalOffset - tileWidth;
        x < WIDTH + tileWidth;
        x += tileWidth
    ) {

        ctx.drawImage(
            image,
            x,
            verticalPosition,
            tileWidth,
            tileHeight
        );

    }

    ctx.restore();

}


function drawBackground() {

    drawBackgroundImage();

}


/* ============================================
   13. DOODAD FALLBACK GRAPHICS
   ============================================ */

// Draw the first decorative asset.

function drawFallbackDoodad1(position) {

    const x = position.x;

    const y = position.y;

    // Treat base.

    ctx.fillStyle = "#b78a59";

    ctx.beginPath();

    ctx.ellipse(
        x + position.width / 2,
        y + position.height * 0.7,
        position.width * 0.45,
        position.height * 0.22,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Treat body.

    ctx.fillStyle = "#e6ad6d";

    ctx.beginPath();

    ctx.roundRect(
        x + position.width * 0.15,
        y + position.height * 0.2,
        position.width * 0.7,
        position.height * 0.5,
        6
    );

    ctx.fill();


    // Treat detail.

    ctx.fillStyle = "#fff0cf";

    ctx.beginPath();

    ctx.arc(
        x + position.width * 0.5,
        y + position.height * 0.45,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// Draw the second decorative asset.

function drawFallbackDoodad2(position) {

    const x = position.x;

    const y = position.y;

    // Tennis ball.

    ctx.fillStyle = "#c6d94b";

    ctx.beginPath();

    ctx.arc(
        x + position.width / 2,
        y + position.height / 2,
        Math.min(position.width, position.height) * 0.46,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Tennis ball seam.

    ctx.strokeStyle = "#fff8c9";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        x + position.width / 2,
        y + position.height / 2,
        position.width * 0.3,
        -1.2,
        1.2
    );

    ctx.stroke();

}


/* ============================================
   14. DOODAD POSITIONING AND MOVEMENT
   ============================================ */

function drawDoodad(key, config, scrollPosition) {

    const dimensions = getImageDimensions(
        images[key],
        config.maxWidth,
        config.maxHeight
    );

    const tileWidth = dimensions.width + config.spacing;

    const movement = scrollPosition * config.scrollSpeed;

    const initialX = config.x - movement;

    const drawOne = x => {

        const position = getTopLeftPosition(
            x,
            config.y,
            dimensions.width,
            dimensions.height,
            config.imageOffsetX,
            config.imageOffsetY
        );

        if (!drawImageAsset(key, position)) {

            if (key === "doodad1") {

                drawFallbackDoodad1(position);

            } else {

                drawFallbackDoodad2(position);

            }

        }

    };


    if (config.repeat) {

        // Keep repeated elements continuously distributed.

        const startingX =
            ((initialX % tileWidth) + tileWidth) % tileWidth - tileWidth;

        for (
            let x = startingX;
            x < WIDTH + tileWidth;
            x += tileWidth
        ) {

            drawOne(x);

        }

    } else {

        // Draw only one instance.

        drawOne(initialX);

    }

}


function drawDoodads() {

    drawDoodad(
        "doodad1",
        CONFIG.doodad1,
        backgroundScroll
    );

    drawDoodad(
        "doodad2",
        CONFIG.doodad2,
        backgroundScroll
    );

}


/* ============================================
   15. RUNNER FALLBACK GRAPHIC
   ============================================ */

// Draw a recognizable toy poodle.

function drawFallbackRunner(position) {

    const x = position.x;

    const y = position.y;

    const w = position.width;

    const h = position.height;

    const running = runner.onGround;

    const step = Math.sin(runner.animationTime * 13) * 3;

    ctx.save();


    // Body.

    ctx.fillStyle = "#b98b65";

    ctx.beginPath();

    ctx.ellipse(
        x + w * 0.48,
        y + h * 0.59,
        w * 0.32,
        h * 0.27,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Back fluffy section.

    ctx.fillStyle = "#d2ae89";

    ctx.beginPath();

    ctx.arc(
        x + w * 0.25,
        y + h * 0.48,
        w * 0.19,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Head.

    ctx.fillStyle = "#c69a73";

    ctx.beginPath();

    ctx.arc(
        x + w * 0.73,
        y + h * 0.3,
        w * 0.2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Fluffy ears.

    ctx.fillStyle = "#a97756";

    ctx.beginPath();

    ctx.arc(
        x + w * 0.62,
        y + h * 0.19,
        w * 0.13,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        x + w * 0.83,
        y + h * 0.18,
        w * 0.12,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Muzzle.

    ctx.fillStyle = "#f1d6bd";

    ctx.beginPath();

    ctx.ellipse(
        x + w * 0.84,
        y + h * 0.39,
        w * 0.12,
        h * 0.09,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Pink nose.

    ctx.fillStyle = "#ed8b9a";

    ctx.beginPath();

    ctx.arc(
        x + w * 0.95,
        y + h * 0.36,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Eye.

    ctx.fillStyle = "#3d2920";

    ctx.beginPath();

    ctx.arc(
        x + w * 0.79,
        y + h * 0.27,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Tail.

    ctx.strokeStyle = "#b98b65";

    ctx.lineWidth = 7;

    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(x + w * 0.2, y + h * 0.48);

    ctx.quadraticCurveTo(
        x + w * 0.06,
        y + h * 0.23,
        x + w * 0.12,
        y + h * 0.19
    );

    ctx.stroke();


    // Legs.

    ctx.strokeStyle = "#a87956";

    ctx.lineWidth = 7;

    ctx.lineCap = "round";

    const legMovement = running ? step : 0;

    const legPositions = [
        0.3,
        0.43,
        0.57,
        0.68
    ];

    legPositions.forEach((legX, index) => {

        const movement = index % 2 === 0
            ? legMovement
            : -legMovement;

        ctx.beginPath();

        ctx.moveTo(
            x + w * legX,
            y + h * 0.72
        );

        ctx.lineTo(
            x + w * legX + movement,
            y + h * 0.92
        );

        ctx.stroke();

    });


    // Paws.

    ctx.fillStyle = "#e5c4a5";

    for (let i = 0; i < 4; i++) {

        const pawX = x + w * legPositions[i] + legMovement * (i % 2 === 0 ? 1 : -1);

        ctx.beginPath();

        ctx.ellipse(
            pawX,
            y + h * 0.94,
            6,
            3,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.restore();

}


/* ============================================
   16. OBSTACLE FALLBACK GRAPHICS
   ============================================ */

// Draw the first obstacle.

function drawFallbackObstacle1(position) {

    const x = position.x;

    const y = position.y;

    const w = position.width;

    const h = position.height;

    // Pillow body.

    ctx.fillStyle = "#d9a3a0";

    ctx.beginPath();

    ctx.roundRect(
        x + 3,
        y + 5,
        w - 6,
        h - 5,
        15
    );

    ctx.fill();


    // Pillow highlight.

    ctx.fillStyle = "#edc2bb";

    ctx.beginPath();

    ctx.ellipse(
        x + w * 0.5,
        y + h * 0.35,
        w * 0.3,
        h * 0.17,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Pillow stitching.

    ctx.strokeStyle = "#b87d7a";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(x + 10, y + h * 0.75);

    ctx.lineTo(x + w - 10, y + h * 0.75);

    ctx.stroke();


    // Decorative center button.

    ctx.fillStyle = "#f8e1d9";

    ctx.beginPath();

    ctx.arc(
        x + w / 2,
        y + h / 2,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// Draw the second obstacle.

function drawFallbackObstacle2(position) {

    const x = position.x;

    const y = position.y;

    const w = position.width;

    const h = position.height;


    // Box body.

    ctx.fillStyle = "#bd8857";

    ctx.fillRect(
        x + 2,
        y + 3,
        w - 4,
        h - 3
    );


    // Front panel.

    ctx.fillStyle = "#d5a575";

    ctx.fillRect(
        x + 7,
        y + 8,
        w - 14,
        h - 12
    );


    // Box tape.

    ctx.fillStyle = "#f0d5a5";

    ctx.fillRect(
        x + w * 0.42,
        y + 3,
        w * 0.16,
        h - 3
    );


    // Top fold lines.

    ctx.strokeStyle = "#97613d";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(x + 3, y + 8);

    ctx.lineTo(x + w / 2, y + 17);

    ctx.lineTo(x + w - 3, y + 8);

    ctx.stroke();


}


/* ============================================
   17. RUNNER RENDERING
   ============================================ */

function drawRunner() {

    const position = getRunnerPosition();

    if (!drawImageAsset("runner", position)) {

        drawFallbackRunner(position);

    }

}


/* ============================================
   18. OBSTACLE RENDERING
   ============================================ */

function drawObstacles() {

    obstacles.forEach(obstacle => {

        updateObstaclePosition(obstacle);

        if (!drawImageAsset(
            obstacle.key,
            obstacle.position
        )) {

            if (obstacle.key === "obstacle1") {

                drawFallbackObstacle1(obstacle.position);

            } else {

                drawFallbackObstacle2(obstacle.position);

            }

        }

    });

}


/* ============================================
   19. GROUND RENDERING
   ============================================ */

function drawGround() {

    ctx.fillStyle = "#a97551";

    ctx.fillRect(
        0,
        GROUND_Y,
        WIDTH,
        HEIGHT - GROUND_Y
    );


    ctx.fillStyle = "#e0b78e";

    ctx.fillRect(
        0,
        GROUND_Y,
        WIDTH,
        7
    );


    ctx.strokeStyle = "#8f6348";

    ctx.lineWidth = 2;

    for (let x = 0; x < WIDTH; x += 65) {

        ctx.beginPath();

        ctx.moveTo(x, GROUND_Y + 20);

        ctx.lineTo(x + 30, GROUND_Y + 20);

        ctx.stroke();

    }

}


/* ============================================
   20. HITBOX VISUALIZATION
   ============================================ */

function drawHitboxes() {

    if (!CONFIG.debug.showHitboxes) return;

    ctx.save();

    ctx.lineWidth = CONFIG.debug.hitboxLineWidth;


    // Runner hitbox.

    const runnerBox = getRunnerHitbox();

    ctx.strokeStyle = CONFIG.debug.runnerHitboxColor;

    ctx.strokeRect(
        runnerBox.x,
        runnerBox.y,
        runnerBox.width,
        runnerBox.height
    );


    // Obstacle hitboxes.

    ctx.strokeStyle = CONFIG.debug.obstacleHitboxColor;

    obstacles.forEach(obstacle => {

        updateObstaclePosition(obstacle);

        const obstacleBox = getObstacleHitbox(obstacle);

        ctx.strokeRect(
            obstacleBox.x,
            obstacleBox.y,
            obstacleBox.width,
            obstacleBox.height
        );

    });


    ctx.restore();

}


/* ============================================
   21. GAME RENDERING
   ============================================ */

function drawGame() {

    ctx.clearRect(0, 0, WIDTH, HEIGHT);


    // Background layer.

    drawBackground();


    // Decorative layers.

    drawDoodads();


    // Ground.

    drawGround();


    // Obstacles.

    drawObstacles();


    // Runner.

    drawRunner();


    // Debug hitboxes.

    drawHitboxes();

}


/* ============================================
   22. SCORE DISPLAY
   ============================================ */

function updateScoreDisplay() {

    scoreDisplay.textContent = Math.floor(score).toString();

    highScoreDisplay.textContent = Math.floor(highScore).toString();

}


function updateScore(deltaTime) {

    score += deltaTime * gameSpeed * 0.1;

    if (score > highScore) {

        highScore = Math.floor(score);

        saveHighScore();

    }

    updateScoreDisplay();

}


/* ============================================
   23. GAME DIFFICULTY
   ============================================ */

function updateDifficulty(deltaTime) {

    gameSpeed += CONFIG.gameplay.difficultyIncrease * deltaTime;

    gameSpeed = Math.min(
        gameSpeed,
        CONFIG.gameplay.maxSpeed
    );

}


/* ============================================
   24. OBSTACLE MOVEMENT
   ============================================ */

function updateObstacles(deltaTime) {

    const movement = gameSpeed * deltaTime;

    obstacleTimer += movement;

    obstacles.forEach(obstacle => {

        obstacle.x -= movement;

        updateObstaclePosition(obstacle);

    });


    // Remove obstacles outside the Canvas.

    obstacles = obstacles.filter(obstacle => {

        return obstacle.x + obstacle.displayWidth > -50;

    });


    // Create new obstacles after sufficient spacing.

    if (
        obstacles.length === 0 ||
        obstacleTimer >= nextObstacleDistance
    ) {

        spawnObstacle();

    }

}


/* ============================================
   25. BACKGROUND AND DOODAD MOVEMENT
   ============================================ */

function updateEnvironment(deltaTime) {

    backgroundScroll +=
        gameSpeed *
        CONFIG.background.scrollSpeed *
        deltaTime;

}


/* ============================================
   26. COLLISION CHECKING
   ============================================ */

function checkGameCollisions() {

    const runnerBox = getRunnerHitbox();

    for (const obstacle of obstacles) {

        updateObstaclePosition(obstacle);

        const obstacleBox = getObstacleHitbox(obstacle);

        if (checkCollision(runnerBox, obstacleBox)) {

            endGame();

            return;

        }

    }

}


/* ============================================
   27. GAME RESET
   ============================================ */

function resetGame() {

    score = 0;

    gameSpeed = CONFIG.gameplay.startingSpeed;

    elapsedTime = 0;

    backgroundScroll = 0;

    obstacleTimer = 0;

    nextObstacleDistance =
        CONFIG.gameplay.minObstacleSpacing +
        Math.random() * (
            CONFIG.gameplay.maxObstacleSpacing -
            CONFIG.gameplay.minObstacleSpacing
        );

    obstacles = [];

    resetRunner();

    updateScoreDisplay();

}


/* ============================================
   28. OVERLAY MANAGEMENT
   ============================================ */

function showOverlay() {

    gameOverlay.style.display = "flex";

    gameOverlay.style.visibility = "visible";

    gameOverlay.style.opacity = "1";

    gameOverlay.style.pointerEvents = "auto";

}


function hideOverlay() {

    // Hide the entire overlay, including its content.

    gameOverlay.style.opacity = "0";

    gameOverlay.style.visibility = "hidden";

    gameOverlay.style.pointerEvents = "none";

    gameOverlay.style.display = "none";

}


/* ============================================
   29. START GAME
   ============================================ */

function startGame() {

    if (gameState === "playing") return;

    resetGame();

    gameState = "playing";

    const startText = startButton.dataset.startText || "Start Game";

    const restartText = startButton.dataset.restartText || "Restart Game";

    startButton.textContent = restartText;

    overlayTitle.textContent = "Get Ready!";

    overlayMessage.textContent =
        "Bonbon is ready for another adventure! Jump over the obstacles!";


    // Hide the complete overlay.

    hideOverlay();


    // Reset frame timing.

    lastTime = performance.now();


    // Prevent multiple animation loops.

    if (animationFrameId !== null) {

        cancelAnimationFrame(animationFrameId);

        animationFrameId = null;

    }

    animationFrameId = requestAnimationFrame(gameLoop);

}


/* ============================================
   30. GAME OVER
   ============================================ */

function endGame() {

    if (gameState !== "playing") return;

    gameState = "gameover";

    highScore = Math.max(highScore, Math.floor(score));

    saveHighScore();

    updateScoreDisplay();


    overlayTitle.textContent = "Game Over!";

    overlayMessage.textContent =
        `Bonbon's adventure is over! Your final score is ${Math.floor(score)}. Try again!`;


    // Change the button label.

    startButton.textContent =
        startButton.dataset.restartText || "Restart Game";


    // Display the complete overlay.

    showOverlay();


    // Stop the active game loop.

    if (animationFrameId !== null) {

        cancelAnimationFrame(animationFrameId);

        animationFrameId = null;

    }

    drawGame();

}


/* ============================================
   31. MAIN GAME LOOP
   ============================================ */

function gameLoop(currentTime) {

    if (gameState !== "playing") {

        animationFrameId = null;

        return;

    }


    // Calculate elapsed time.

    let deltaTime = (currentTime - lastTime) / 1000;

    lastTime = currentTime;


    // Prevent large jumps after browser inactivity.

    deltaTime = Math.min(deltaTime, 0.04);


    elapsedTime += deltaTime;


    // Update game systems.

    updateRunner(deltaTime);

    updateDifficulty(deltaTime);

    updateObstacles(deltaTime);

    updateEnvironment(deltaTime);

    updateScore(deltaTime);


    // Render the current frame.

    drawGame();


    // Check collisions after rendering.

    checkGameCollisions();


    // Continue only while the game is running.

    if (gameState === "playing") {

        animationFrameId = requestAnimationFrame(gameLoop);

    } else {

        animationFrameId = null;

    }

}


/* ============================================
   32. INPUT EVENTS
   ============================================ */

// Keyboard controls.

document.addEventListener(
    "keydown",
    handleJumpInput
);


// Mouse and touch controls.

canvas.addEventListener(
    "pointerdown",
    handleJumpInput
);


// Start and restart button.

startButton.addEventListener(
    "click",
    startGame
);


/* ============================================
   33. INITIAL GAME SETUP
   ============================================ */

function initializeGame() {

    // Display the saved high score.

    updateScoreDisplay();


    // Keep the game overlay visible initially.

    showOverlay();


    // Load PNG assets or use fallback graphics.

    loadAllImages();

}


// Initialize the game once.

initializeGame();
