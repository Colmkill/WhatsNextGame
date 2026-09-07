// Initialize KAPLAY canvas
// 1. Initialize the canvas with correct background brackets
kaplay({
    background: [16, 24, 48],
    width: 800,
    height: 600,
})

// 1. Set up a virtual drawing canvas in memory
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Make it wide enough to hold two 64x64 tiles side-by-side (128x64 total)
canvas.width = 128;
canvas.height = 64;

// --- DRAW TILE 1: Triangle Tile ---
ctx.fillStyle = "#ffcc00"; // Yellow color
ctx.beginPath();
ctx.moveTo(32, 8);   // Top point
ctx.lineTo(56, 56);  // Bottom right
ctx.lineTo(8, 56);   // Bottom left
ctx.closePath();
ctx.fill();

// --- DRAW TILE 2: Diamond Tile ---
ctx.fillStyle = "#ff00ff"; // Magenta color
ctx.beginPath();
ctx.moveTo(64 + 32, 8);  // Top point (shifted right by 64px)
ctx.lineTo(64 + 56, 32); // Right point
ctx.lineTo(64 + 32, 56); // Bottom point
ctx.lineTo(64 + 8, 32);  // Left point
ctx.closePath();
ctx.fill();

// 2. Register your digital drawings as game assets in KAPLAY
loadSpriteAtlas(canvas.toDataURL(), {
    "triangle_tile": { x: 0, y: 0, width: 64, height: 64 },
    "diamond_tile": { x: 64, y: 0, width: 64, height: 64 },
});

// 3. Drop them straight into your active game list!
const shapes = ["triangle_tile", "diamond_tile",];


let pattern = []
let targetShape = ""
let score = 0

// Add score text to the screen
const scoreLabel = add([
    text(`Score: ${score}`),
    pos(24, 24),
])

function startNewRound() {
    // 1. Generate a basic alternating sequence: A, B, A, B...
    const shapeA = choose(shapes)
    const shapeB = choose(shapes)
    
    // Pick the mystery 4th shape that should come next
    pattern = [shapeA, shapeB, shapeA]
    targetShape = shapeB 

    // Wipe any old puzzle sprites off the board
    destroyAll("puzzle-piece")

    // 2. Render the pattern on screen (3 items side by side)
    pattern.forEach((shapeName, index) => {
        add([
            sprite(shapeName),
            pos(200 + index * 150, 200),
            anchor("center"),
            scale(2),
            "puzzle-piece"
        ])
    })

    // Draw an empty placeholder question mark for the 4th item
    add([
        text("?"),
        pos(200 + 3 * 150, 200),
        anchor("center"),
        "puzzle-piece"
    ])
}

// 3. Make the interactive interface buttons at the bottom
shapes.forEach((shapeName, index) => {
    // Create button background
    const btn = add([
        rect(100, 60, { radius: 8 }),
        pos(200 + index * 180, 450),
        color(100, 100, 250),
        area(),
        anchor("center")
    ])

    // Label the button with a sprite icon
    add([
        sprite(shapeName),
        pos(btn.pos),
        anchor("center"),
        scale(1.2)
    ])

    // Handle clicks/touches on the choice buttons
    btn.onClick(() => {
        if (shapeName === targetShape) {
            score += 10
            scoreLabel.text = `Score: ${score}`
            burp() // Fun built-in audio confirmation
            startNewRound()
        } else {
            shake(10) // Shake screen if wrong
        }
    })
})

// Boot up the very first round
startNewRound()
