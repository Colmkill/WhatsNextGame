// Initialize KAPLAY canvas
// 1. Initialize the canvas with correct background brackets
kaplay({
    background: [16, 24, 48],
    width: 800,
    height: 600,
})

// 2. Load the built-in assets so "bean" works natively
loadBean()
// 1. Create a virtual canvas to draw your custom tiles
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Set the canvas size to hold two 64x64 pixel tiles side-by-side (128x64 total)
canvas.width = 128;
canvas.height = 64;

// --- DRAW TILE 1: Circly Tile (A red circle inside a tile) ---
ctx.fillStyle = "#ff5555"; // Circle color
ctx.beginPath();
ctx.arc(32, 32, 24, 0, Math.PI * 2); // Draw circle centered at (32, 32)
ctx.fill();

// --- DRAW TILE 2: Square Tile (A blue square tile) ---
ctx.fillStyle = "#5555ff"; // Square color
ctx.fillRect(64 + 8, 8, 48, 48); // Draw square shifted to the second slot

// 2. Turn your code drawings into actual game sprites
loadSpriteAtlas(canvas.toDataURL(), {
    "circly_tile": { x: 0, y: 0, width: 64, height: 64 },
    "square_tile": { x: 64, y: 0, width: 64, height: 64 },
});

// 3. Add your new tiles directly to your shapes list!
const shapes = ["circly_tile", "square_tile", "bean"];




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
