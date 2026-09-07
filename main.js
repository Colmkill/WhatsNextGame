// Initialize KAPLAY canvas
// 1. Initialize the canvas with correct background brackets
kaplay({
    background: [16, 24, 48],
    width: 800,
    height: 600,
})

// 1. Create a larger virtual grid canvas (4 columns wide x 2 rows high)
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Each tile is 64x64. 4 tiles wide = 256px. 2 tiles high = 128px.
canvas.width = 256;
canvas.height = 128;

// ==================== ROW 1 (Y = 0) ====================

// Tile 1: Red Circle (X: 0, Y: 0)
ctx.fillStyle = "#ff5555";
ctx.beginPath(); ctx.arc(32, 32, 24, 0, Math.PI * 2); ctx.fill();

// Tile 2: Blue Square (X: 64, Y: 0)
ctx.fillStyle = "#5555ff";
ctx.fillRect(64 + 8, 8, 48, 48);

// Tile 3: Yellow Triangle (X: 128, Y: 0)
ctx.fillStyle = "#ffcc00";
ctx.beginPath();
ctx.moveTo(128 + 32, 8); ctx.lineTo(128 + 56, 56); ctx.lineTo(128 + 8, 56);
ctx.closePath(); ctx.fill();

// Tile 4: Magenta Diamond (X: 192, Y: 0)
ctx.fillStyle = "#ff00ff";
ctx.beginPath();
ctx.moveTo(192 + 32, 8); ctx.lineTo(192 + 56, 32); ctx.lineTo(192 + 32, 56); ctx.lineTo(192 + 8, 32);
ctx.closePath(); ctx.fill();


// ==================== ROW 2 (Y = 64) ====================

// Tile 5: Green Star / Cross (X: 0, Y: 64)
ctx.fillStyle = "#22cc66";
ctx.fillRect(24, 64 + 8, 16, 48);
ctx.fillRect(8, 64 + 24, 48, 16);

// Tile 6: Orange Hexagon (X: 64, Y: 64)
ctx.fillStyle = "#ff8800";
ctx.beginPath();
ctx.moveTo(64 + 32, 64 + 8);  ctx.lineTo(64 + 56, 64 + 20); ctx.lineTo(64 + 56, 64 + 44);
ctx.lineTo(64 + 32, 64 + 56); ctx.lineTo(64 + 8, 64 + 44);  ctx.lineTo(64 + 8, 64 + 20);
ctx.closePath(); ctx.fill();

// Tile 7: Cyan Capsule / Oval (X: 128, Y: 64)
ctx.fillStyle = "#00cccc";
ctx.beginPath(); ctx.roundRect(128 + 12, 64 + 8, 40, 48, 20); ctx.fill();

// Tile 8: Purple Border Box (X: 192, Y: 64)
ctx.strokeStyle = "#aa55ff";
ctx.lineWidth = 6;
ctx.strokeRect(192 + 12, 64 + 12, 40, 40);


// 2. Register all 8 slice locations from the 2x4 grid sheet
loadSpriteAtlas(canvas.toDataURL(), {
    "circly_tile":   { x: 0,   y: 0,  width: 64, height: 64 },
    "square_tile":   { x: 64,  y: 0,  width: 64, height: 64 },
    "triangle_tile": { x: 128, y: 0,  width: 64, height: 64 },
    "diamond_tile":  { x: 192, y: 0,  width: 64, height: 64 },
    "star_tile":     { x: 0,   y: 64, width: 64, height: 64 },
    "hex_tile":      { x: 64,  y: 64, width: 64, height: 64 },
    "oval_tile":     { x: 128, y: 64, width: 64, height: 64 },
    "frame_tile":    { x: 192, y: 64, width: 64, height: 64 },
});

// 3. Set up your shapes array using your custom coded tiles!
const shapes = [
    "circly_tile", 
    "square_tile", 
    "triangle_tile", 
    "diamond_tile",
    "star_tile", 
    "hex_tile", 
    "oval_tile", 
    "frame_tile"
];


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
